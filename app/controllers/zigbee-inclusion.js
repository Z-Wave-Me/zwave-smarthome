/**
 * @overview Handles Zigbee device inclusion actions.
 * @author Martin Vach
 */

/**
 * The controller that handles Zigbee device inclusion process.
 * @class ZigbeeInclusionController
 */
myAppController.controller('ZigbeeInclusionController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, $http, dataFactory, dataService, cfg,_) {
    $scope.zigbeeInclusion = {
        cancelModal: false,
        cfg: {
            checkInterviewTimeout: 3000, // miliseconds
            checkInterviewRepeat: 16, // times
            inexTimeout: 180000 // Inclusion/Exclusion timeout - miliseconds
        },
        device: {
            hasBattery: false,
            find: {}
        },
        controller: {
            controllerState: 0,
            lastExcludedDevice: null,
            lastIncludedDeviceId: 0
        },
        zigbeeApiData: {},
        inclusionProcess: {
            process: false,
            lastIncluded: 0,
            done: false
        },
        automatedConfiguration: {
            process: false,
            includedDevice: {
                initDone: false,
                nodeId: 0,
                nodeName: '',
                hasBattery: false,
                clustersCnt: 0,
                interviewDoneCnt: 0,
                checkInterviewCnt: 0,
                retryCCInterviews: false,
                errorType: '',
                interviewNotDone: {}
            },
            progress: 0,
            done: false
        },
        manualConfiguration: {
            process: false,
            done: false
        }
    };
    $scope.interval = {
        api: null
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval.api);
    });

    var timeOutTimer = 180;


    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            false,
            dataFactory.loadZigbeeApiData(true)
        ];
        // Loading device by ID
        if ($routeParams.id) {
            promises[0] = dataFactory.getApi('zigbee_devices', '?lang=' + $scope.lang + '&id=' + $routeParams.id);
        }

        $q.allSettled(promises).then(function (response) {
            var deviceId = response[0];
            var ZigbeeAPIData = response[1];
            // Error message
            if (ZigbeeAPIData.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Success - device by id
            if (deviceId.state === 'fulfilled') {
                var device = dataService.getZigbeeDevices([deviceId.value.data.data]).value();
                setDeviceId(device[0]);

            }
            // Success - ZigbeeAPIData
            if (ZigbeeAPIData.state === 'fulfilled') {
                //console.log(ZigbeeAPIData.value);
                if(ZigbeeAPIData.value){
                    setZigbeeAPIData(ZigbeeAPIData.value);
                }

            }

            $scope.loading = false;

        });

    };
    $scope.allSettled();

    /**
     * Refresh ZigbeeApiData
     */
    $scope.refreshZigbeeApiData = function (maxcnt) {
        var cnt = 0;
        // if (typeof maxcnt !== 'undefined') {
        var refresh = function () {
            cnt++;
            dataFactory.refreshZigbeeApiData().then(function (response) {
                //console.log(response.data);
                if(response){
                    updateController(response.data);
                }
            });
            if (cnt === maxcnt) {
                $interval.cancel($scope.interval.api);
                $scope.loading = false;
            }
        };
        // TODO deprecated dead code 08/04/22
        // } else {
        //     var refresh = function () {
        //         //console.log('Pending requests: '+ $http.pendingRequests.length);
        //         if($http.pendingRequests.length > 0) {
        //             return;
        //         }
        //         dataFactory.refreshZigbeeApiData().then(function (response) {
        //             //console.log(response.data);
        //             if(response){
        //                 updateController(response.data);
        //             }
        //
        //         });
        //     };
        // }
        refresh();
        $scope.interval.api = $interval(refresh, $scope.cfg.interval);
    };

    /**
     * Start/Stop Process
     */
    $scope.startStopProcess = function (type, process) {
        var cmd = '',
            scope = '',
            msg = '';

        switch(type) {
            case 'inclusion':
                cmd = process ? 'controller.AddNodeToNetwork(1)' : 'controller.AddNodeToNetwork(0)';
                scope = 'inclusionProcess';
                msg = $scope._t('error_inclusion_time');
                break;
        }
        if(process) {
            resetProcess(type, process, false, cmd);
            $scope.refreshZigbeeApiData();
            $timeout(function () {
                if ($scope.zigbeeInclusion[scope].process && !$scope.zigbeeInclusion[scope].done) {
                    resetProcess(type, false, false, cmd, true);
                    alertify.alertWarning(msg);
                    $scope.reloadData();
                }
            }, $scope.zigbeeInclusion.cfg.inexTimeout);
        } else {
            resetProcess(type, false, false, cmd, true);
            $scope.reloadData();
        }
    };

    /**
     * Reset exclusion or inclusion
     */
    function resetProcess(type, process, done, cmd, cancelInterval) {
        // Set scope
        var scope = "inclusionProcess"
        angular.extend($scope.zigbeeInclusion[scope],
            {process: process, done: done}
        );
        // Run CMD
        if (cmd) {
            $scope.runZigbeeCmd(cmd);
        }

        // Cancel interval
        if (cancelInterval) {
            $interval.cancel($scope.interval.api);
        }
    }


    /**
     * Start configuration
     */
    $scope.startConfiguration = function (includedDevice) {
        resetConfiguration(true, false, includedDevice, false, true);
        handleInterview(includedDevice.nodeId);

        var refresh = function () {
            var checkInterviewCnt = $scope.zigbeeInclusion.automatedConfiguration.includedDevice.checkInterviewCnt;

            // Try to complete configuration
            if (checkInterviewCnt > $scope.zigbeeInclusion.cfg.checkInterviewRepeat && !$scope.zigbeeInclusion.automatedConfiguration.done) {
                $interval.cancel($scope.interval.api);
                var batteryInfo = $scope.zigbeeInclusion.automatedConfiguration.includedDevice.hasBattery
                    ? '<div class="alert alert-warning"> <i class="fas fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                    : '';

                // Error switch
                switch ($scope.zigbeeInclusion.automatedConfiguration.includedDevice.errorType) {
                    // Cc Version interview is not complete
                    case 'error_interview_again':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zigbeeInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                            .setting('labels', {'ok': $scope._t('try_again_complete')})
                            .set('onok', function (closeEvent) {//after clicking OK
                                $scope.forceInterview($scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                $scope.startConfiguration({
                                    nodeId: $scope.zigbeeInclusion.automatedConfiguration.includedDevice.nodeId,
                                    interviewDoneCnt: 0,
                                    checkInterviewCnt: 0,
                                    errorType: ''
                                });
                            })
                            .set('oncancel', function (closeEvent) {//after clicking Cancel
                                $scope.zigbeeInclusion.cancelModal = true;
                            });
                        break;
                    // Cc Version interview is complete but other interviews are not complete
                    case 'error_interview_retry':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zigbeeInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                            .setting('labels', {'ok': $scope._t('retry_complete_inclusion')})
                            .set('onok', function (closeEvent) {//after clicking OK
                                $scope.forceInterview($scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                $scope.startConfiguration({
                                    nodeId: $scope.zigbeeInclusion.automatedConfiguration.includedDevice.nodeId,
                                    interviewDoneCnt: 0,
                                    checkInterviewCnt: 0,
                                    errorType: ''
                                });
                            })
                            .set('oncancel', function (closeEvent) {//after clicking Cancel
                                $scope.zigbeeInclusion.cancelModal = true;
                            });
                        break;
                    // Unexpected error
                    default:
                       /* alertify.alertError($scope._t('error_interview_unexpected')).set('onok', function (closeEvent) {
                            $scope.reloadData();
                        });*/
                        break;
                }
                return;
            }
            handleInterview(includedDevice.nodeId);
            $scope.zigbeeInclusion.automatedConfiguration.includedDevice.checkInterviewCnt++;
        };
        $scope.interval.api = $interval(refresh, $scope.zigbeeInclusion.cfg.checkInterviewTimeout);
    };

    /**
     * Start manual configuration
     */
    $scope.startManualConfiguration = function (nodeId) {
        //console.log('Running manual configuration')
        resetManualConfiguration(true, false);
        $timeout(function () {
            resetManualConfiguration(false, true);
            $location.path('/zigbee/devices/' + nodeId + '/nohistory');
        }, 5000);
    };

    /**
     * Cancel manual configuration
     */
    $scope.cancelManualConfiguration = function (reset) {
        $scope.zigbeeInclusion.cancelModal = false;
        resetConfiguration(false, false, null, false, true);
        if (reset) {
            $scope.startStopProcess('exclusion', true);
        } else {
            $scope.startManualConfiguration($scope.zigbeeInclusion.automatedConfiguration.includedDevice.nodeId);
        }
    };

    /**
     * Run zigbee command
     */
    $scope.runZigbeeCmd = function (cmd) {
        dataFactory.runZigbeeCmd(cmd).then(function () {});
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
     * Set device by ID
     */
    var setDeviceId = function (data) {
        $scope.zigbeeInclusion.device.find = data;
    };

    /**
     * Set Zigbee API Data
     */
    function setZigbeeAPIData(ZigbeeAPIData) {
        $scope.zigbeeInclusion.controller.controllerState = ZigbeeAPIData.controller.data.controllerState.value;

        // check initial include mode
        if ([1,2,3,4].indexOf($scope.zigbeeInclusion.controller.controllerState) > -1) {
            angular.extend($scope.zigbeeInclusion.inclusionProcess,
                {process: true, done: false}
            );
        }
    }

    /**
     * Update controller data
     */
    function updateController(data) {
        //console.log("data", data);
        // Set controller state
        if ('controller.data.controllerState' in data) {
            $scope.zigbeeInclusion.controller.controllerState = data['controller.data.controllerState'].value;
            //console.log('controllerState: ', $scope.zigbeeInclusion.controller.controllerState);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            //console.log('lastIncludedDevice: ', deviceIncId);
            if (deviceIncId != null) {
                $scope.zigbeeInclusion.controller.lastIncludedDeviceId = deviceIncId;
                //var givenName = 'Device_' + deviceIncId;
                var cmd = false;

                /*if (data.devices[deviceIncId].data.givenName.value === '' || data.devices[deviceIncId].data.givenName.value === null) {
                    cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                }*/
                resetProcess('inclusion', false, true, false, true);
                //dataService.showNotifier({message: $scope._t('lb_new_device_found')});
                resetConfiguration(true, false, {nodeId: deviceIncId}, cmd, true);
                
                $scope.startConfiguration({nodeId: deviceIncId});
            }
        }
    }
    ;

    /**
     * Reset automated configuration
     */
    function resetConfiguration(process, done, includedDevice, cmd, cancelInterval) {
        /// Set scope
        awaitTimer.reset();
        angular.extend($scope.zigbeeInclusion.automatedConfiguration,
            {process: process, done: done, forceInterview: false, progress: 0}
        );

        // Set included device
        if (_.isObject(includedDevice)) {
            angular.extend($scope.zigbeeInclusion.automatedConfiguration.includedDevice, includedDevice);
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
    $scope.breakTime = null;
    function awaitTimerFactory(breakTime) {
        $scope.breakTime = breakTime * 1000;
        const timer = $interval(function () {
            --breakTime;
            $scope.breakTime = breakTime * 1000;
            if (breakTime < 1) {
                $interval.cancel(timer);
            }
        }, 1000)
        return function () {
            $interval.cancel(timer);
            $scope.breakTime = null;
        }
    }
    var awaitTimer = (function () {
        let timer = null;
        return {
            start: function () {
                if (!timer)
                    timer = awaitTimerFactory(timeOutTimer);
            },
            stop: function () {
                if (timer) {
                    timer()
                    timer = null;
                }
            },
            reset: function (){
                if (timer)
                    timer();
                timer = awaitTimerFactory(timeOutTimer);
            }
        }
    })()
    awaitTimer.reset();

    /**
     * Check interview
     */
    function handleInterview(nodeId) {
        dataFactory.runZigbeeCmd('devices['+ nodeId + ']').then(function (response) {
            var node = response.data;
            if(!_.isObject(node)){
                return;
            }
            $scope.zigbeeInclusion.automatedConfiguration.includedDevice.nodeName = node.data.givenName.value || 'Device ' + '_' + nodeId;

            // Is battery operated?
            if (angular.isDefined(node.endpoints)) {
                angular.extend($scope.zigbeeInclusion.automatedConfiguration.includedDevice, {hasBattery: 0x80 in node.endpoints[0].clusters});
            }

            // do interview preset
            if (!$scope.zigbeeInclusion.automatedConfiguration.initDone) {
                $scope.zigbeeInclusion.automatedConfiguration.includedDevice.clustersCnt = 0;
                $scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewDoneCnt = 0;

                for (var iId in node.endpoints) {
                    Object.keys(node.endpoints[iId].clusters).forEach(function (cc){
                        if (node.endpoints[iId].clusters[cc].data.inDirection.value) {
                            $scope.zigbeeInclusion.automatedConfiguration.includedDevice.clustersCnt++;
                        }
                    });
                }
            }

            for (var iId in node.endpoints) {
                if (Object.keys(node.endpoints[iId].clusters).length < 1) {
                    return;
                }
                //angular.extend($scope.zigbeeInclusion.automatedConfiguration.includedDevice, {clustersCnt: Object.keys(node.endpoints[iId].clusters).length});
                for (var ccId in node.endpoints[iId].clusters) {
                    // Skip if CC is not inDirection
                    if(!node.endpoints[iId].clusters[ccId].data.inDirection.value){
                        //console.log('Not inDirection', ccId)
                        continue;
                    }
                    var cmdClass = node.endpoints[iId].clusters[ccId];
                    var id = iId + '_' +node.endpoints[iId].clusters[ccId].name;
                    var iData = 'devices[' + nodeId + '].endpoints[' + iId + '].clusters[' + ccId + '].Interview()';
                    // Is interview done?
                    if (cmdClass.data.interviewDone.value) {
                        // If an interview is done deleting from interviewNotDone
                        delete $scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone[id];
                        // Extending an interview counter
                        /*angular.extend($scope.zigbeeInclusion.automatedConfiguration.includedDevice,
                            {interviewDoneCnt: $scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewDoneCnt + 1}
                        );*/
                        $scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewDoneCnt++;
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone[id] = iData;
                    }
                }
            }
            var clustersCnt = $scope.zigbeeInclusion.automatedConfiguration.includedDevice.clustersCnt;
            var interviewDoneCnt = $scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewDoneCnt;
            var progress = ((interviewDoneCnt / clustersCnt) * 100).toFixed();
            //console.log('clustersCnt: ', clustersCnt);
            //console.log('interviewDoneCnt: ', interviewDoneCnt);
            //console.log('Percent %: ', progress);
            //console.log('checkInterviewCnt: ', $scope.zigbeeInclusion.automatedConfiguration.includedDevice.checkInterviewCnt);
            $scope.zigbeeInclusion.automatedConfiguration.progress = (progress < 101 ? progress : 99);

            /* TBD
            // If interviews are not complete
            if (!_.isEmpty($scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone)) {
                switch ($scope.zigbeeInclusion.automatedConfiguration.includedDevice.checkInterviewCnt) {
                    case 10:
                    case 13:
                        $scope.zigbeeInclusion.automatedConfiguration.includedDevice.retryCCInterviews = true;

                        if ($scope.zigbeeInclusion.automatedConfiguration.includedDevice.checkInterviewCnt === 13) {
                            angular.forEach($scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone, function(value, ccKey){

                                var commandClass = ccKey.split('_')[1];

                                if (_.contains(['MultiChannelAssociation','AssociationGroupInformation','AssociationCommandConfiguration'],commandClass)){
                                    // If an interview is done deleting from interviewNotDone
                                    delete $scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone[ccKey];
                                    angular.extend($scope.zigbeeInclusion.automatedConfiguration.includedDevice, {interviewDoneCnt: interviewDoneCnt++});
                                }
                            });

                            progress = ((interviewDoneCnt / clustersCnt) * 100).toFixed();

                            // If Version ok but other CC are missing, force only these command classes
                            $scope.forceInterview($scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                        } else {
                            // If Version ok but other CC are missing, force only these command classes
                            $scope.forceInterview($scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                        }
                        break;
                    case 42:
                        angular.forEach($scope.zigbeeInclusion.automatedConfiguration.includedDevice.interviewNotDone, function(value, ccKey){

                            var commandClass = ccKey.split('_')[1];

                            // If command class Version is not complete, „Force Interview Version“
                            if (commandClass === 'Version') {
                                angular.extend($scope.zigbeeInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_again'});
                                return;

                            // If one of these classes is not interviewed ignore it > progress 100 %
                            } else {
                                angular.extend($scope.zigbeeInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_retry'});
                                return;
                            }
                        });

                        $scope.zigbeeInclusion.automatedConfiguration.includedDevice.retryCCInterviews = false;

                        break;
                }
            }
            */

            // All interviews are done
            if (progress >= 100) {
                awaitTimer.stop();
                $scope.zigbeeInclusion.automatedConfiguration.progress = 100;
                $scope.zigbeeInclusion.automatedConfiguration.initDone = false;
                resetConfiguration(false, true, null, false, true);
                $timeout(function() {
                    $scope.startManualConfiguration(nodeId);
                }, 1000);

                return;
            }
        }, function (error) {
            return;
        });
    }

    /**
     * Reset manual configuration
     */
    function resetManualConfiguration(process, done) {
        // Set scope
        angular.extend($scope.zigbeeInclusion.manualConfiguration,
            {process: process, done: done}
        );
    };
});


