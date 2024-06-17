/**
 * @overview Controllers that manage Zigbee devices.
 * @author Serguei Poltorak
 */
/**
 * The controller that renders and handles data in the Zigbee/Manage section.
 * @class ZigbeeManageController
 */
myAppController.controller('ZigbeeManageController', function ($scope, $cookies, $filter, $location, $q, dataFactory, dataService, cfg,myCache) {
    $scope.devices = {
        zw: {},
        find: {},
        show: true
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZigbeeApiData(false),
            dataFactory.getApi('devices')
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var elements = response[1];
            $scope.loading = false;
            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                $scope.devices.show = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Success - zigbee devices
            if (devices.state === 'fulfilled') {
                if(!devices.value){
                    return;
                }
                $scope.devices.zw = Object.values(setZigbeeApiData(devices.value));
                // $scope.devices.zw =setZigbeeApiData(devices.value);
            }
            // Success - elements
            if (elements.state === 'fulfilled') {
                setElements(dataService.getDevicesData(elements.value.data.data.devices, false,true));
            }
        });
    };
    $scope.allSettled();

    /**
     * Run zigbee CMD
     */
    $scope.runZigbeeCmd = function (cmd) {
        dataFactory.runZigbeeCmd(cmd).then(function () {});
    };


    /// --- Private functions --- ///
    /**
     * Set zigbee devices
     * @param {array} elements
     * @returns {undefined}
     */
    function setZigbeeApiData(ZigbeeAPIData) {
        var obj = {};
        var controllerNodeId,
                interviewDone,
                isFailed,
                hasBattery,
                lastReceive,
                lastSend,
                lastCommunication,
                isSleepy,
                isAwake,
                hasWakeup,
                sleepingSince,
                lastWakeup,
                interval;
        controllerNodeId = ZigbeeAPIData.controller.data.nodeId.value;
        angular.forEach(ZigbeeAPIData.devices, function (node, nodeId) {
            if (nodeId == controllerNodeId) {
                return;
            }
            isFailed = node.data.isFailed.value;
            hasBattery = false; // TBD 0x80 in node.endpoints[0].clusters;
            lastReceive = parseInt(node.data.lastReceived.updateTime, 10) || 0;
            lastSend = parseInt(node.data.lastSend.updateTime, 10) || 0;
            lastCommunication = (lastSend > lastReceive) ? lastSend : lastReceive;
            isSleepy = node.data.isSleepy.value;
            hasWakeup = false; // TBD 0x84 in node.endpoints[0].clusters;
            sleepingSince = 0;
            lastWakeup = 0;
            interval = 0;
            if (isSleepy && hasWakeup) {
                // TBD
                sleepingSince = parseInt(node.endpoints[0].clusters[0x84].data.lastSleep.value, 10);
                lastWakeup = parseInt(node.endpoints[0].clusters[0x84].data.lastWakeup.value, 10);
                interval = parseInt(node.endpoints[0].clusters[0x84].data.interval.value, 10);
            }
            //0x80 = 128
            batteryCharge = $filter('hasNode')(node, 'endpoints.0.clusters.128.data.last.value');//parseInt(node.endpoints[0].clusters[0x80].data.last.value);
            obj[nodeId] = {
                id: parseInt(nodeId),
                title: node.data.givenName.value || 'Device ' + '_' + nodeId,
                hasBattery: hasBattery,
                batteryCharge: (batteryCharge === null ? null : parseInt(batteryCharge)),
                isFailed: isFailed,
                sleeping: sleepingCont(isSleepy, hasWakeup, sleepingSince, lastWakeup, interval),
                awake: awakeCont(isAwake, isSleepy),
                date: $filter('isTodayFromUnix')(lastCommunication),
                cfg: [],
                elements: {},
                messages: []
            };
            // Low battery level
            if (hasBattery && interviewDone) {
                // TBD
                var batteryCharge = parseInt(node.endpoints[0].clusters[0x80].data.last.value);
                if (batteryCharge <= 20) {
                    obj[nodeId]['messages'].push({
                        type: 'battery',
                        error: $scope._t('lb_low_battery') + ' (' + batteryCharge + '%)'
                    });
                }
            }
            // Is failed
            if (isFailed) {
                obj[nodeId]['messages'].push({
                    type: 'failed',
                    error: $scope._t('lb_is_failed')

                });
                return;
            }

            // Interview is not done
            if (!interviewDone) {
                obj[nodeId]['messages'].push({
                    type: 'config',
                    error: $scope._t('lb_not_configured')

                });
            }
        });
        return obj;
    }
    /**
     * Set elements created by zigbee device
     * @param {array} elements
     * @returns {undefined}
     */
    function setElements(elements) {
        var findZigbeeStr, cmd, nodeId;
        angular.forEach(elements.value(), function (v) {
            findZigbeeStr = v.id.split('_');
            if (findZigbeeStr[0] === 'ZBeeVDev') {
                cmd = findZigbeeStr[findZigbeeStr.length - 1].split('-');
                nodeId = cmd[0];
                const device = $scope.devices.zw.find(({id}) => id === +nodeId)
                if (device) {
                    device.elements[v.id] = v
                }
            }
        });
    }
    // Get Awake Cont
    function awakeCont(isAwake, isSleepy) {
        var awake_cont = (isSleepy && isAwake) ? 'awake' : 'sleep';
        return awake_cont;
    }
    // Get Sleeping Cont
    function sleepingCont(isSleepy, hasWakeup, sleepingSince, lastWakeup, interval) {
        var sleeping_cont;
        if (isSleepy && hasWakeup) {
            var approx = '';
            if (isNaN(sleepingSince) || sleepingSince < lastWakeup) {
                sleepingSince = lastWakeup;
                if (!isNaN(lastWakeup))
                    approx = '~';
            }
            ;
            if (interval == 0) {
                interval = NaN; // to indicate that interval and hence next wakeup are unknown
            }
            var lastSleep = $filter('isTodayFromUnix')(sleepingSince);
            var nextWakeup = $filter('isTodayFromUnix')(sleepingSince + interval);
            sleeping_cont = approx + lastSleep + ' &#8594; ' + approx + nextWakeup;
        }
        return sleeping_cont;
    }
});

/**
 * The controller that handles interview process in the Zigbee/Network section.
 * @class ZigbeeInterviewController
 */
myAppController.controller('ZigbeeInterviewController', function ($scope, $location, $interval, dataFactory, dataService, _) {
    $scope.zigbeeInterview = {
        cfg: {
            checkInterviewTimeout: 3000, // miliseconds
            checkInterviewRepeat: 3, // times
            inexTimeout: 30000 // Inclusion/Exclusion timeout - miliseconds
        },
        process: false,
        done: false,
        nodeId: 0,
        nodeName: '',
        hasBattery: false,
        progress: 0,
        clustersCnt: 0,
        interviewDoneCnt: 0,
        interviewRepeatCnt: 0,
        errorType: '',
        interviewNotDone: {}
    };
    $scope.interval = {
        api: null
    };

    /**
     * Start configuration
     */
    $scope.startConfiguration = function (includedDevice) {
        resetConfiguration(true, false, includedDevice, false, true);
        handleInterview($scope.devices.find.id);
        var refresh = function () {
            $scope.forceInterview($scope.zigbeeInterview.interviewNotDone);
            var interviewRepeatCnt = $scope.zigbeeInterview.interviewRepeatCnt + 1;
            angular.extend($scope.zigbeeInterview, {interviewRepeatCnt: interviewRepeatCnt});
            // Try to comlete configuration
            if (interviewRepeatCnt > $scope.zigbeeInterview.cfg.checkInterviewRepeat && !$scope.zigbeeInterview.done) {
                $interval.cancel($scope.interval.api);
                var resetInfo = '<div class="alert alert-warning"> <i class="fas fa-exclamation-circle"></i> ' + $scope._t('configuration_cancel') + '</div>';
                var batteryInfo = $scope.zigbeeInterview.hasBattery
                        ? '<div class="alert alert-warning"> <i class="fas fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                        : '';

                // Error switch
                switch ($scope.zigbeeInterview.errorType) {
                        // Cc Version interview is not complete
                    case 'error_interview_again':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zigbeeInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion'), 'ok': $scope._t('ok')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zigbeeInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zigbee/inclusion');
                                });
                        break;
                        // Cc Version interview is complete but other interviews are not complete
                    case 'error_interview_retry':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zigbeeInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion'), 'ok': $scope._t('ok')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zigbeeInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zigbee/inclusion');
                                });

                        break;
                        // Unexpected error
                    default:
                        alertify.alertError($scope._t('error_interview_unexpected')).set('onok', function (closeEvent) {
                            $scope.reloadData();
                        });
                        break;

                }

                return;
            }
            handleInterview($scope.devices.find.id);
        };
        $scope.interval.api = $interval(refresh, $scope.zigbeeInterview.cfg.checkInterviewTimeout);
    };
    if (!_.isEmpty($scope.devices.find)) {
        $scope.startConfiguration();
    }

    /**
     * Cancel configuration
     */
    $scope.cancelConfiguration = function (event) {
        resetConfiguration(false, false, null, false, true);
        $scope.devices.find = {};
        if (event) {
            $scope.handleModal('zigbeeNetworkModal', event);
        }
    };

    /**
     * Force interview
     */
    $scope.forceInterview = function (interviews) {
        angular.forEach(interviews, function (v, k) {
            $scope.runZigbeeCmd(v);
        });
    };

    /// --- Private functions --- ///

    /**
     * Reset configuration
     */
    function resetConfiguration(process, done, includedDevice, cmd, cancelInterval) {
        /// Set scope
        angular.extend($scope.zigbeeInterview,
                {process: process, done: done, forceInterview: false, progress: 0}
        );
        // Set included device
        if (_.isObject(includedDevice)) {
            angular.extend($scope.zigbeeInterview, includedDevice);
        }
        // Run CMD
        if (cmd) {
            $scope.runZigbeeCmd(cmd);
        }
        // Cancel interval
        if (cancelInterval) {
            $interval.cancel($scope.interval.api);
        }
    }
    ;

    /**
     * Handle interview
     */
    function handleInterview(nodeId) {
        $scope.zigbeeInterview.clustersCnt = 0;
        $scope.zigbeeInterview.interviewDoneCnt = 0;
        dataFactory.runZigbeeCmd('devices['+ nodeId + ']').then(function (response) {
            var node = response.data;
            if(!_.isObject(node)){
                return;
            }

            if (!node.data.nodeInfoFrame.value) {
                return;
            }

            // Is battery operated?
            if (angular.isDefined(node.endpoints)) {
                angular.extend($scope.zigbeeInterview, {hasBattery: 0x80 in node.endpoints[0].clusters});
            }
            for (var iId in node.endpoints) {
                if (Object.keys(node.endpoints[iId].clusters).length < 1) {
                    return;
                }
                angular.extend($scope.zigbeeInterview, {clustersCnt: Object.keys(node.endpoints[iId].clusters).length});
                for (var ccId in node.endpoints[iId].clusters) {
                    // Skip if CC is not supported
                    if(!node.endpoints[iId].clusters[ccId].data.supported.value){
                        continue;
                    }

                    var cmdClass = node.endpoints[iId].clusters[ccId];
                    var id = node.endpoints[iId].clusters[ccId].name;
                    var iData = 'devices[' + nodeId + '].endpoints[' + iId + '].clusters[' + ccId + '].Interview()';
                    // Is interview done?
                    if (cmdClass.data.interviewDone.value) {
                        // If an interview is done deleting from interviewNotDone
                        delete $scope.zigbeeInterview.interviewNotDone[id];
                        // Extending an interview counter
                        angular.extend($scope.zigbeeInterview,
                            {interviewDoneCnt: $scope.zigbeeInterview.interviewDoneCnt + 1}
                        );
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.zigbeeInterview.interviewNotDone[id] = iData;
                    }
                }
            }

            var clustersCnt = $scope.zigbeeInterview.clustersCnt;
            var intervewDoneCnt = $scope.zigbeeInterview.interviewDoneCnt;
            var progress = ((intervewDoneCnt / clustersCnt) * 100).toFixed();
            console.log('clustersCnt: ', clustersCnt);
            console.log('intervewDoneCnt: ', intervewDoneCnt);
            console.log('Percent %: ', progress);
            $scope.zigbeeInterview.progress = (progress < 101 ? progress : 99);

            // If interviews are not complete
            if (!_.isEmpty($scope.zigbeeInterview.interviewNotDone)) {
                // If command class Version is not complet, „Force Interview Version“
                if ($scope.zigbeeInterview.interviewNotDone['Version']) {
                    angular.extend($scope.zigbeeInterview, {errorType: 'error_interview_again'});
                    return;
                    // If Version ok but other CC are missing, force only these command classes
                } else {
                    angular.extend($scope.zigbeeInterview, {errorType: 'error_interview_retry'});
                    return;
                }
            }
            // If interview is complete
            if (progress >= 100) {
                $scope.zigbeeInterview.progress = 100;
                resetConfiguration(false, true, null, false, true);
                //$scope.startManualConfiguration(nodeId);
                return;
                ;
            }
        }, function (error) {
            return;
        });
    }
});

/**
 * The controller that renders and handles configuration data for a single Zigbee device.
 * @class ZigbeeManageIdController
 */
myAppController.controller('ZigbeeManageIdController', function ($scope, $window, $routeParams, $q, $filter, $location, dataFactory, dataService, cfg,myCache) {
    $scope.zigbeeConfig = {
        nodeId: $routeParams.nodeId,
        nohistory: $routeParams.nohistory
    };

    $scope.zigbeeDevice = [];
    $scope.devices = [];
    $scope.formInput = {
        show: true,
        newRoom: '',
        elements: {},
        room: 0,
        deviceName: false
    };
    $scope.rooms = [];

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('devices', null, true),
            dataFactory.getApi('locations', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var locations = response[1];

            $scope.loading = false;
            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                $scope.formInput.show = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                var elements = dataService.getDevicesData(devices.value.data.data.devices, false,true);
                zigbeeConfigApiData($scope.zigbeeConfig.nodeId, elements.value());
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms = Object.values(dataService.getRooms(locations.value.data.data).indexBy('id').value());

            }

        });
    };
    $scope.allSettled();

    /**
     * Add room
     */
    $scope.addRoom = function (room) {
        if (!room) {
            return;
        }
        var input = {
            id: 0,
            title: room
        };
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.storeApi('locations', input.id, input).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
            $scope.formInput.newRoom = '';
            $scope.allSettled();
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;

        });

    };

    /**
     * Update all devices
     */
    $scope.updateAllDevices = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};

        // Update element
        angular.forEach(input.elements, function (v, k) {
            if (input.room) {
                angular.extend(v, {location: parseInt(input.room)})
            }
            dataFactory.putApi('devices', v.id, v).then(function (response) {
            }, function (error) {
            });
        });
        //Update device name
        var cmd = 'devices[' + $scope.zigbeeDevice.id + '].data.givenName.value=\'' + input.deviceName + '\'';
        dataFactory.runZigbeeCmd(cmd).then(function () {});
        myCache.removeAll();
        $scope.loading = false;
        dataService.showNotifier({message: $scope._t('success_updated')});
        if (angular.isDefined($routeParams.nohistory)) {
            $location.path('/zigbee/devices');
        } else {
            dataService.goBack();
        }
    };

    /// --- Private functions --- ///
    /**
     * Get zigbeeApiData
     */
    function zigbeeConfigApiData(nodeId, devices) {
        dataFactory.loadZigbeeApiData(true).then(function (ZigbeeAPIData) {
            if(!ZigbeeAPIData){
                return;
            }
            var node = ZigbeeAPIData.devices[nodeId];
            if (!node) {
                return;
            }

            $scope.zigbeeDevice = {
                id: nodeId,
                cfg: []
            };
            $scope.formInput.deviceName = node.data.givenName.value || 'Device ' + '_' + nodeId;
            // Has config file
            if (angular.isDefined(node.data.ZDDXMLFile) && node.data.ZDDXMLFile.value != '') {
                if ($scope.zigbeeDevice['cfg'].indexOf('config') === -1) {
                    $scope.zigbeeDevice['cfg'].push('config');
                }
            }
            // Has wakeup
            if (0x84 in node.endpoints[0].clusters) {
                if ($scope.zigbeeDevice['cfg'].indexOf('wakeup') === -1) {
                    $scope.zigbeeDevice['cfg'].push('wakeup');
                }
            }
            if ($scope.devices.length > 0) {
                $scope.devices = angular.copy([]);
            }

            angular.forEach(devices, function (v, k) {
                var findZigbeeStr = v.id.split('_');
                if (findZigbeeStr[0] !== 'ZBeeVDev' || v.deviceType === 'battery') {
                    return;
                }
                var cmd = findZigbeeStr[findZigbeeStr.length - 1].split('-');
                var zigbeeId = cmd[0];
                var iId = cmd[1];
                var ccId = cmd[2];
                if (zigbeeId == nodeId) {
                    var obj = v;
                    /*var obj = {};
                     obj['id'] = v.id;
                     obj['permanently_hidden'] = v.permanently_hidden;
                     obj['visibility'] = v.visibility;
                     obj['level'] = $filter('toInt')(v.metrics.level);
                     obj['metrics'] = v.metrics;
                     obj['location'] = v.location;*/
                    $scope.formInput.elements[v.id] = obj;
                    $scope.devices.push(obj);
                }

            });
        }, function (error) {
          angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        });
    }
    ;

});

