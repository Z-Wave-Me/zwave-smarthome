/**
 * @overview Handles Matter device inclusion actions.
 * @author Serguei Poltorak
 */

/**
 * The controller that handles Matter device inclusion process.
 * @class MatterInclusionController
 */
myAppController.controller('MatterInclusionController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, $http, dataFactory, dataService, cfg,_) {
    $scope.matterInclusion = {
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
        matterApiData: {},
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
            dataFactory.loadZMatterApiData(true)
        ];
        // Loading device by ID
        if ($routeParams.id) {
            promises[0] = dataFactory.getApi('matter_devices', '?lang=' + $scope.lang + '&id=' + $routeParams.id);
        }

        $q.allSettled(promises).then(function (response) {
            var deviceId = response[0];
            var MatterAPIData = response[1];
            // Error message
            if (MatterAPIData.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Success - device by id
            if (deviceId.state === 'fulfilled') {
                var device = dataService.getMatterDevices([deviceId.value.data.data]).value();
                setDeviceId(device[0]);

            }
            // Success - MatterAPIData
            if (MatterAPIData.state === 'fulfilled') {
                //console.log(MatterAPIData.value);
                if(MatterAPIData.value){
                    setMatterAPIData(MatterAPIData.value);
                }

            }

            $scope.loading = false;

        });

    };
    $scope.allSettled();

    /**
     * Refresh ZMatterApiData
     */
    $scope.refreshZMatterApiData = function (maxcnt) {
        var cnt = 0;
        // if (typeof maxcnt !== 'undefined') {
        var refresh = function () {
            cnt++;
            dataFactory.refreshZMatterApiData().then(function (response) {
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
        //         dataFactory.refreshZMatterApiData().then(function (response) {
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
                cmd = process ? 'controller.AddNodeToNetwork("' + $routeParams.code + '")' : 'controller.AddNodeToNetwork("")';
                scope = 'inclusionProcess';
                msg = $scope._t('error_inclusion_time');
                break;
        }
        if(process) {
            resetProcess(type, process, false, cmd);
            $scope.refreshZMatterApiData();
            $timeout(function () {
                if ($scope.matterInclusion[scope].process && !$scope.matterInclusion[scope].done) {
                    resetProcess(type, false, false, cmd, true);
                    alertify.alertWarning(msg);
                    $scope.reloadData();
                }
            }, $scope.matterInclusion.cfg.inexTimeout);
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
        angular.extend($scope.matterInclusion[scope],
            {process: process, done: done}
        );
        // Run CMD
        if (cmd) {
            $scope.runMatterCmd(cmd);
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
            var checkInterviewCnt = $scope.matterInclusion.automatedConfiguration.includedDevice.checkInterviewCnt;

            // Try to complete configuration
            if (checkInterviewCnt > $scope.matterInclusion.cfg.checkInterviewRepeat && !$scope.matterInclusion.automatedConfiguration.done) {
                $interval.cancel($scope.interval.api);
                var batteryInfo = $scope.matterInclusion.automatedConfiguration.includedDevice.hasBattery
                    ? '<div class="alert alert-warning"> <i class="fas fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                    : '';

                // Error switch
                switch ($scope.matterInclusion.automatedConfiguration.includedDevice.errorType) {
                    // Cc Version interview is not complete
                    case 'error_interview_again':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.matterInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                            .setting('labels', {'ok': $scope._t('try_again_complete')})
                            .set('onok', function (closeEvent) {//after clicking OK
                                $scope.forceInterview($scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                $scope.startConfiguration({
                                    nodeId: $scope.matterInclusion.automatedConfiguration.includedDevice.nodeId,
                                    interviewDoneCnt: 0,
                                    checkInterviewCnt: 0,
                                    errorType: ''
                                });
                            })
                            .set('oncancel', function (closeEvent) {//after clicking Cancel
                                $scope.matterInclusion.cancelModal = true;
                            });
                        break;
                    // Cc Version interview is complete but other interviews are not complete
                    case 'error_interview_retry':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.matterInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                            .setting('labels', {'ok': $scope._t('retry_complete_inclusion')})
                            .set('onok', function (closeEvent) {//after clicking OK
                                $scope.forceInterview($scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                $scope.startConfiguration({
                                    nodeId: $scope.matterInclusion.automatedConfiguration.includedDevice.nodeId,
                                    interviewDoneCnt: 0,
                                    checkInterviewCnt: 0,
                                    errorType: ''
                                });
                            })
                            .set('oncancel', function (closeEvent) {//after clicking Cancel
                                $scope.matterInclusion.cancelModal = true;
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
            $scope.matterInclusion.automatedConfiguration.includedDevice.checkInterviewCnt++;
        };
        $scope.interval.api = $interval(refresh, $scope.matterInclusion.cfg.checkInterviewTimeout);
    };

    /**
     * Start manual configuration
     */
    $scope.startManualConfiguration = function (nodeId) {
        //console.log('Running manual configuration')
        resetManualConfiguration(true, false);
        $timeout(function () {
            resetManualConfiguration(false, true);
            $location.path('/matter/devices/' + nodeId + '/nohistory');
        }, 5000);
    };

    /**
     * Cancel manual configuration
     */
    $scope.cancelManualConfiguration = function (reset) {
        $scope.matterInclusion.cancelModal = false;
        resetConfiguration(false, false, null, false, true);
        if (reset) {
            $scope.startStopProcess('exclusion', true);
        } else {
            $scope.startManualConfiguration($scope.matterInclusion.automatedConfiguration.includedDevice.nodeId);
        }
    };

    /**
     * Run matter command
     */
    $scope.runMatterCmd = function (cmd) {
        dataFactory.runZMatterCmd(cmd).then(function () {});
    };

    /**
     * Force interview
     */
    $scope.forceInterview = function (interviews) {
        angular.forEach(interviews, function (v, k) {
            $scope.runMatterCmd(v);
        });
    };

    /// --- Private functions --- ///

    /**
     * Set device by ID
     */
    var setDeviceId = function (data) {
        $scope.matterInclusion.device.find = data;
    };

    /**
     * Set Matter API Data
     */
    function setMatterAPIData(MatterAPIData) {
        $scope.matterInclusion.controller.controllerState = MatterAPIData.controller.data.controllerState.value;

        // check initial include mode
        if ([1,2,3,4].indexOf($scope.matterInclusion.controller.controllerState) > -1) {
            angular.extend($scope.matterInclusion.inclusionProcess,
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
            $scope.matterInclusion.controller.controllerState = data['controller.data.controllerState'].value;
            //console.log('controllerState: ', $scope.matterInclusion.controller.controllerState);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            //console.log('lastIncludedDevice: ', deviceIncId);
            if (deviceIncId != null) {
                $scope.matterInclusion.controller.lastIncludedDeviceId = deviceIncId;
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
        angular.extend($scope.matterInclusion.automatedConfiguration,
            {process: process, done: done, forceInterview: false, progress: 0}
        );

        // Set included device
        if (_.isObject(includedDevice)) {
            angular.extend($scope.matterInclusion.automatedConfiguration.includedDevice, includedDevice);
        }
        // Run CMD
        if (cmd) {
            $scope.runMatterCmd(cmd);
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
        dataFactory.runZMatterCmd('devices['+ nodeId + ']').then(function (response) {
            var node = response.data;
            if(!_.isObject(node)){
                return;
            }
            $scope.matterInclusion.automatedConfiguration.includedDevice.nodeName = node.data.givenName.value || 'Device ' + '_' + nodeId;

            // Is battery operated?
            if (angular.isDefined(node.endpoints)) {
                angular.extend($scope.matterInclusion.automatedConfiguration.includedDevice, {hasBattery: 0x80 in node.endpoints[0].clusters});
            }

            // do interview preset
            if (!$scope.matterInclusion.automatedConfiguration.initDone) {
                $scope.matterInclusion.automatedConfiguration.includedDevice.clustersCnt = 0;
                $scope.matterInclusion.automatedConfiguration.includedDevice.interviewDoneCnt = 0;

                for (var iId in node.endpoints) {
                    Object.keys(node.endpoints[iId].clusters).forEach(function (cc){
                        if (node.endpoints[iId].clusters[cc].data.inDirection.value) {
                            $scope.matterInclusion.automatedConfiguration.includedDevice.clustersCnt++;
                        }
                    });
                }
            }

            for (var iId in node.endpoints) {
                if (Object.keys(node.endpoints[iId].clusters).length < 1) {
                    return;
                }
                //angular.extend($scope.matterInclusion.automatedConfiguration.includedDevice, {clustersCnt: Object.keys(node.endpoints[iId].clusters).length});
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
                        delete $scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone[id];
                        // Extending an interview counter
                        /*angular.extend($scope.matterInclusion.automatedConfiguration.includedDevice,
                            {interviewDoneCnt: $scope.matterInclusion.automatedConfiguration.includedDevice.interviewDoneCnt + 1}
                        );*/
                        $scope.matterInclusion.automatedConfiguration.includedDevice.interviewDoneCnt++;
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone[id] = iData;
                    }
                }
            }
            var clustersCnt = $scope.matterInclusion.automatedConfiguration.includedDevice.clustersCnt;
            var interviewDoneCnt = $scope.matterInclusion.automatedConfiguration.includedDevice.interviewDoneCnt;
            var progress = ((interviewDoneCnt / clustersCnt) * 100).toFixed();
            //console.log('clustersCnt: ', clustersCnt);
            //console.log('interviewDoneCnt: ', interviewDoneCnt);
            //console.log('Percent %: ', progress);
            //console.log('checkInterviewCnt: ', $scope.matterInclusion.automatedConfiguration.includedDevice.checkInterviewCnt);
            $scope.matterInclusion.automatedConfiguration.progress = (progress < 101 ? progress : 99);

            /* TBD
            // If interviews are not complete
            if (!_.isEmpty($scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone)) {
                switch ($scope.matterInclusion.automatedConfiguration.includedDevice.checkInterviewCnt) {
                    case 10:
                    case 13:
                        $scope.matterInclusion.automatedConfiguration.includedDevice.retryCCInterviews = true;

                        if ($scope.matterInclusion.automatedConfiguration.includedDevice.checkInterviewCnt === 13) {
                            angular.forEach($scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone, function(value, ccKey){

                                var commandClass = ccKey.split('_')[1];

                                if (_.contains(['MultiChannelAssociation','AssociationGroupInformation','AssociationCommandConfiguration'],commandClass)){
                                    // If an interview is done deleting from interviewNotDone
                                    delete $scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone[ccKey];
                                    angular.extend($scope.matterInclusion.automatedConfiguration.includedDevice, {interviewDoneCnt: interviewDoneCnt++});
                                }
                            });

                            progress = ((interviewDoneCnt / clustersCnt) * 100).toFixed();

                            // If Version ok but other CC are missing, force only these command classes
                            $scope.forceInterview($scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                        } else {
                            // If Version ok but other CC are missing, force only these command classes
                            $scope.forceInterview($scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                        }
                        break;
                    case 42:
                        angular.forEach($scope.matterInclusion.automatedConfiguration.includedDevice.interviewNotDone, function(value, ccKey){

                            var commandClass = ccKey.split('_')[1];

                            // If command class Version is not complete, „Force Interview Version“
                            if (commandClass === 'Version') {
                                angular.extend($scope.matterInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_again'});
                                return;

                            // If one of these classes is not interviewed ignore it > progress 100 %
                            } else {
                                angular.extend($scope.matterInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_retry'});
                                return;
                            }
                        });

                        $scope.matterInclusion.automatedConfiguration.includedDevice.retryCCInterviews = false;

                        break;
                }
            }
            */

            // All interviews are done
            if (progress >= 100) {
                awaitTimer.stop();
                $scope.matterInclusion.automatedConfiguration.progress = 100;
                $scope.matterInclusion.automatedConfiguration.initDone = false;
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
        angular.extend($scope.matterInclusion.manualConfiguration,
            {process: process, done: done}
        );
    };
});


