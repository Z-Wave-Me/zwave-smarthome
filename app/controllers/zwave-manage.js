/**
 * @overview Controllers that manage Z-Wave devices.
 * @author Martin Vach
 */
/**
 * The controller that renders and handles data in the Z-Wave/Manage section.
 * @class ZwaveManageController
 */
myAppController.controller('ZwaveManageController', function ($scope, $cookies, $filter, $location, $q, dataFactory, dataService, cfg,myCache) {
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
            dataFactory.loadZwaveApiData(false),
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
            // Success - zwave devices
            if (devices.state === 'fulfilled') {
                if(!devices.value){
                    return;
                }
                $scope.devices.zw = setZwaveApiData(devices.value);
            }
            // Success - elements
            if (elements.state === 'fulfilled') {
                setElements(dataService.getDevicesData(elements.value.data.data.devices, false,true));
            }
        });
    };
    $scope.allSettled();

    /**
     * Run zwave CMD
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {});
    };


    /// --- Private functions --- ///
    /**
     * Set zwave devices
     * @param {array} elements
     * @returns {undefined}
     */
    function setZwaveApiData(ZWaveAPIData) {
        var obj = {};
        var controllerNodeId,
                interviewDone,
                isFailed,
                hasBattery,
                lastReceive,
                lastSend,
                lastCommunication,
                isListening,
                isFLiRS,
                isAwake,
                hasWakeup,
                sleepingSince,
                lastWakeup,
                interval;
        controllerNodeId = ZWaveAPIData.controller.data.nodeId.value;
        angular.forEach(ZWaveAPIData.devices, function (node, nodeId) {
            if (nodeId == 255 || nodeId == controllerNodeId || node.data.isVirtual.value) {
                return;
            }
            var securityInterview = false;
            var securityType = 'security-0'
            var hasSecurityCc = dataService.hasCommandClass(node,152);
            //console.log(nodeId + ' hasSecurityCc: ', hasSecurityCc)
            if(hasSecurityCc){
                //security = $filter('hasNode')(hasSecurityCc,'data.interviewDone.value');
                securityType = 'security-1';
                securityInterview = $filter('hasNode')(hasSecurityCc,'data.interviewDone.value');
            }
            // Security S2
            var hasSecurityS2Cc = dataService.hasCommandClass(node,159);
            if(hasSecurityS2Cc){
               // security = true;
                securityType = 'security-2';
                securityInterview = $filter('hasNode')(hasSecurityS2Cc,'data.interviewDone.value');
            }
            //console.log(nodeId + ' securityType: ', securityType)
            //instance = getInstances(node);
            //interviewDone = instance.interviewDone;
            //security = instance.security;
            isFailed = node.data.isFailed.value;
            hasBattery = 0x80 in node.instances[0].commandClasses;
            lastReceive = parseInt(node.data.lastReceived.updateTime, 10) || 0;
            lastSend = parseInt(node.data.lastSend.updateTime, 10) || 0;
            lastCommunication = (lastSend > lastReceive) ? lastSend : lastReceive;
            isListening = node.data.isListening.value;
            isFLiRS = !isListening && (node.data.sensor250.value || node.data.sensor1000.value);
            isAwake = node.data.isAwake.value;
            hasWakeup = 0x84 in node.instances[0].commandClasses;
            sleepingSince = 0;
            lastWakeup = 0;
            interval = 0;
            if (!isListening && hasWakeup) {
                sleepingSince = parseInt(node.instances[0].commandClasses[0x84].data.lastSleep.value, 10);
                lastWakeup = parseInt(node.instances[0].commandClasses[0x84].data.lastWakeup.value, 10);
                interval = parseInt(node.instances[0].commandClasses[0x84].data.interval.value, 10);
            }
            //0x80 = 128
            batteryCharge = $filter('hasNode')(node, 'instances.0.commandClasses.128.data.last.value');//parseInt(node.instances[0].commandClasses[0x80].data.last.value);
            obj[nodeId] = {
                id: parseInt(nodeId),
                title: node.data.givenName.value || 'Device ' + '_' + nodeId,
                hasBattery: hasBattery,
                batteryCharge: (batteryCharge === null ? null : parseInt(batteryCharge)),
                securityType:  securityType,
                securityInterview:  securityInterview,
                //interviewDone: interviewDone,
                //security: security,
                isFailed: isFailed,
                sleeping: sleepingCont(isListening, hasWakeup, sleepingSince, lastWakeup, interval),
                awake: awakeCont(isAwake, isListening, isFLiRS),
                date: $filter('isTodayFromUnix')(lastCommunication),
                cfg: [],
                elements: {},
                messages: []
            };
            // Low battery level
            if (hasBattery && interviewDone) {
                var batteryCharge = parseInt(node.instances[0].commandClasses[0x80].data.last.value);
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
     * Set elements created by zWave device
     * @param {array} elements
     * @returns {undefined}
     */
    function setElements(elements) {
        var findZwaveStr, cmd, nodeId;
        angular.forEach(elements.value(), function (v) {
            findZwaveStr = v.id.split('_');
            if (findZwaveStr[0] === 'ZWayVDev' && findZwaveStr[1] === 'zway') {
                cmd = findZwaveStr[findZwaveStr.length - 1].split('-');
                nodeId = cmd[0];
                if ($scope.devices.zw[nodeId]) {
                    $scope.devices.zw[nodeId]['elements'][v.id] = v;
                }
            }
        });
    }
    // Get Awake Cont
    function awakeCont(isAwake, isListening, isFLiRS) {
        var awake_cont = false;
        if (!isListening && !isFLiRS) {
            awake_cont = isAwake ? 'awake' : 'sleep';
        }
        return awake_cont;
    }
    // Get Sleeping Cont
    function sleepingCont(isListening, hasWakeup, sleepingSince, lastWakeup, interval) {
        var sleeping_cont;
        if (!isListening && hasWakeup) {
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
 * The controller that handles interview process in the Z-Wave/Network section.
 * @class ZwaveInterviewController
 */
myAppController.controller('ZwaveInterviewController', function ($scope, $location, $interval, dataFactory, dataService, _) {
    $scope.zwaveInterview = {
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
        commandClassesCnt: 0,
        interviewDoneCnt: 0,
        interviewRepeatCnt: 0,
        security: false,
        securityInterview: false,
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
            $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
            var interviewRepeatCnt = $scope.zwaveInterview.interviewRepeatCnt + 1;
            angular.extend($scope.zwaveInterview, {interviewRepeatCnt: interviewRepeatCnt});
            // Try to comlete configuration
            if (interviewRepeatCnt > $scope.zwaveInterview.cfg.checkInterviewRepeat && !$scope.zwaveInterview.done) {
                $interval.cancel($scope.interval.api);
                var resetInfo = '<div class="alert alert-warning"> <i class="fas fa-exclamation-circle"></i> ' + $scope._t('configuration_cancel') + '</div>';
                var batteryInfo = $scope.zwaveInterview.hasBattery
                        ? '<div class="alert alert-warning"> <i class="fas fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                        : '';

                // Error switch
                switch ($scope.zwaveInterview.errorType) {
                    // Secure interview failed
                    case 'error_interview_secure_failed':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zwave/inclusion');
                                });
                        break;
                        // Cc Version interview is not complete
                    case 'error_interview_again':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion'), 'ok': $scope._t('ok')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zwave/inclusion');
                                });
                        break;
                        // Cc Version interview is complete but other interviews are not complete
                    case 'error_interview_retry':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion'), 'ok': $scope._t('ok')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zwave/inclusion');
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
        $scope.interval.api = $interval(refresh, $scope.zwaveInterview.cfg.checkInterviewTimeout);
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
            $scope.handleModal('zwaveNetworkModal', event);
        }
    };

    /**
     * Force interview
     */
    $scope.forceInterview = function (interviews) {
        angular.forEach(interviews, function (v, k) {
            $scope.runZwaveCmd(v);
        });
    };

    /// --- Private functions --- ///

    /**
     * Reset configuration
     */
    function resetConfiguration(process, done, includedDevice, cmd, cancelInterval) {
        /// Set scope
        angular.extend($scope.zwaveInterview,
                {process: process, done: done, forceInterview: false, progress: 0}
        );
        // Set included device
        if (_.isObject(includedDevice)) {
            angular.extend($scope.zwaveInterview, includedDevice);
        }
        // Run CMD
        if (cmd) {
            $scope.runZwaveCmd(cmd);
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
        $scope.zwaveInterview.commandClassesCnt = 0;
        $scope.zwaveInterview.interviewDoneCnt = 0;
        dataFactory.runZwaveCmd('devices['+ nodeId + ']').then(function (response) {
            var node = response.data;
            if(!_.isObject(node)){
                return;
            }

            if (!node.data.nodeInfoFrame.value) {
                return;
            }

            // Is battery operated?
            if (angular.isDefined(node.instances)) {
                angular.extend($scope.zwaveInterview, {hasBattery: 0x80 in node.instances[0].commandClasses});
            }
            for (var iId in node.instances) {
                if (Object.keys(node.instances[iId].commandClasses).length < 1) {
                    return;
                }
                angular.extend($scope.zwaveInterview, {commandClassesCnt: Object.keys(node.instances[iId].commandClasses).length});
                for (var ccId in node.instances[iId].commandClasses) {
                    // Skip if CC is not supported
                    if(!node.instances[iId].commandClasses[ccId].data.supported.value){
                        continue;
                    }

                    var cmdClass = node.instances[iId].commandClasses[ccId];
                    var id = node.instances[iId].commandClasses[ccId].name;
                    var iData = 'devices[' + nodeId + '].instances[' + iId + '].commandClasses[' + ccId + '].Interview()';
                    //Is Security available?
                    if (ccId === '152') {
                        $scope.zwaveInterview.security = true;
                    }
                    // Is interview done?
                    if (cmdClass.data.interviewDone.value) {
                        // Is security interview done?
                        if (ccId === '152') {
                            $scope.zwaveInterview.securityInterview = true;
                        }
                        // If an interview is done deleting from interviewNotDone
                        delete $scope.zwaveInterview.interviewNotDone[id];
                        // Extending an interview counter
                        angular.extend($scope.zwaveInterview,
                            {interviewDoneCnt: $scope.zwaveInterview.interviewDoneCnt + 1}
                        );
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.zwaveInterview.interviewNotDone[id] = iData;
                    }
                }
            }

            var commandClassesCnt = $scope.zwaveInterview.commandClassesCnt;
            var intervewDoneCnt = $scope.zwaveInterview.interviewDoneCnt;
            var progress = ((intervewDoneCnt / commandClassesCnt) * 100).toFixed();
            console.log('commandClassesCnt: ', commandClassesCnt);
            console.log('intervewDoneCnt: ', intervewDoneCnt);
            console.log('Percent %: ', progress);
            $scope.zwaveInterview.progress = (progress < 101 ? progress : 99);

            // Test if Security available and Security interview failed
            if ($scope.zwaveInterview.security && !$scope.zwaveInterview.securityInterview) {
                angular.extend($scope.zwaveInterview, {errorType: 'error_interview_secure_failed'});
                return;
            }

            // If no Security or Security ok but Interviews are not complete
            if (!_.isEmpty($scope.zwaveInterview.interviewNotDone)) {
                // If command class Version is not complet, „Force Interview Version“
                if ($scope.zwaveInterview.interviewNotDone['Version']) {
                    angular.extend($scope.zwaveInterview, {errorType: 'error_interview_again'});
                    return;
                    // If Version ok but other CC are missing, force only these command classes
                } else {
                    angular.extend($scope.zwaveInterview, {errorType: 'error_interview_retry'});
                    return;
                }
            }
            // If interview is complete
            if (progress >= 100) {
                $scope.zwaveInterview.progress = 100;
                resetConfiguration(false, true, null, false, true);
                //setSecureInclusion(true);
                //$scope.startManualConfiguration(nodeId);
                return;
                ;
            }
        }, function (error) {
            return;
        });
    }
    ;

    /**
     * Set secure inclusion
     */
    function setSecureInclusion(status) {
        $scope.runZwaveCmd('controller.data.secureInclusion=' + status);
    }
    ;
});

/**
 * The controller that renders and handles configuration data for a single Z-Wave device.
 * @class ZwaveManageIdController
 */
myAppController.controller('ZwaveManageIdController', function ($scope, $window, $routeParams, $q, $filter, $location, dataFactory, dataService, cfg,myCache) {
    $scope.zwaveConfig = {
        nodeId: $routeParams.nodeId,
        nohistory: $routeParams.nohistory
    };

    $scope.zWaveDevice = [];
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
                zwaveConfigApiData($scope.zwaveConfig.nodeId, elements.value());
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms = dataService.getRooms(locations.value.data.data).indexBy('id').value();

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
        var cmd = 'devices[' + $scope.zWaveDevice.id + '].data.givenName.value=\'' + input.deviceName + '\'';
        dataFactory.runZwaveCmd(cmd).then(function () {});
        myCache.removeAll();
        $scope.loading = false;
        dataService.showNotifier({message: $scope._t('success_updated')});
        if (angular.isDefined($routeParams.nohistory)) {
            $location.path('/zwave/devices');
        } else {
            dataService.goBack();
        }
    };

    /// --- Private functions --- ///
    /**
     * Get zwaveApiData
     */
    function zwaveConfigApiData(nodeId, devices) {
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            if(!ZWaveAPIData){
                return;
            }
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }

            $scope.zWaveDevice = {
                id: nodeId,
                cfg: []
            };
            $scope.formInput.deviceName = node.data.givenName.value || 'Device ' + '_' + nodeId;
            // Has config file
            if (angular.isDefined(node.data.ZDDXMLFile) && node.data.ZDDXMLFile.value != '') {
                if ($scope.zWaveDevice['cfg'].indexOf('config') === -1) {
                    $scope.zWaveDevice['cfg'].push('config');
                }
            }
            // Has wakeup
            if (0x84 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('wakeup') === -1) {
                    $scope.zWaveDevice['cfg'].push('wakeup');
                }
            }
            // Has SwitchAll
            if (0x27 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('switchall') === -1) {
                    $scope.zWaveDevice['cfg'].push('switchall');
                }
            }
            // Has protection
            if (0x75 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('protection') === -1) {
                    $scope.zWaveDevice['cfg'].push('protection');
                }
            }
            if ($scope.devices.length > 0) {
                $scope.devices = angular.copy([]);
            }

            angular.forEach(devices, function (v, k) {
                var findZwaveStr = v.id.split('_');
                if ((findZwaveStr[0] !== 'ZWayVDev' && findZwaveStr[1] !== 'zway') || v.deviceType === 'battery') {
                    return;
                }
                var cmd = findZwaveStr[findZwaveStr.length - 1].split('-');
                var zwaveId = cmd[0];
                var iId = cmd[1];
                var ccId = cmd[2];
                if (zwaveId == nodeId) {
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

