/**
 * Application Zwave inclusion controller
 * @author Martin Vach
 */
/**
 * Zwave include controller
 */
myAppController.controller('ZwaveInclusionController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    $scope.zwaveInclusion = {
        cfg: {
            checkInterviewTimeout: 3000,// mil Sec
            checkInterviewRepeat: 5// mil Sec
        },
        device: {
            hasBattery: false,
            secureInclusion: true,
            find: {}
        },
        controller: {
            controllerState: 0,
            lastExcludedDevice: null,
            secureInclusion: false
        },
        zwaveApiData: {},
        exclusionProcess: {
            process: false,
            done: false
        },
        inclusionProcess: {
            process: false,
            lastIncluded: 0,
            done: false
        },
        automatedConfiguration: {
            process: false,
            includedDevice: {
                nodeId: 0,
                hasBattery: false,
                commandClassesCnt: 0,
                interviewDoneCnt: 0,
                interviewRepeatCnt: 0,
                security: false,
                securityInterview: false
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

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApiLocal('device.' + $scope.lang + '.json'),
            dataFactory.loadZwaveApiData(true)
        ];

        $q.allSettled(promises).then(function (response) {
            // console.log(response)
            var deviceId = response[0];
            var ZWaveAPIData = response[1];
            // Error message
            if (ZWaveAPIData.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - device by id
            if ($routeParams.id) {
                if (deviceId.state === 'fulfilled') {
                    setDeviceId(_.findWhere(deviceId.value.data, {id: $routeParams.id}));
                }
            }
            // Success - ZWaveAPIData
            if (ZWaveAPIData.state === 'fulfilled') {
                setZWaveAPIData(ZWaveAPIData.value);
            }

            $scope.loading = false;

        });

    };
    $scope.allSettled();

    /**
     * Refresh ZwaveApiData
     */
    $scope.refreshZwaveApiData = function () {
        var refresh = function () {
            dataFactory.refreshZwaveApiData().then(function (response) {
                updateController(response.data);
            }, function (error) {
                return;
            });
        };
        $scope.interval.api = $interval(refresh, $scope.cfg.interval);
    };


    /**
     * Start/Stop Exclusion
     */
    $scope.startStopExclusion = function (cmd, process) {
        resetExclusion(process, false, cmd);
        if (process) {
            $scope.refreshZwaveApiData();
            return;
            $timeout(function () {
                if ($scope.zwaveInclusion.exclusionProcess.process && !$scope.zwaveInclusion.exclusionProcess.done) {
                    resetExclusion(false, false, 'controller.RemoveNodeFromNetwork(0)', true);
                    alertify.alertWarning($scope._t('Text if EXCLUSION takes a long time (20 - 30 seconds?) and nothing happens'));
                }

            }, 3000);
        } else {
            resetExclusion(false, false, 'controller.RemoveNodeFromNetwork(0)', true);
        }

    };


    /**
     * Start/Stop Inclusion
     */
    $scope.startStopInclusion = function (cmd, process) {
        resetInclusion(process, false, cmd);
        if (process) {
            $scope.refreshZwaveApiData();
            return;
            $timeout(function () {
                if ($scope.zwaveInclusion.inclusionProcess.process && !$scope.zwaveInclusion.inclusionProcess.done) {
                    resetInclusion(false, false, 'controller.AddNodeToNetwork(0)', true);
                    alertify.dismissAll();
                    alertify.alertWarning($scope._t('Text if INCLUSION PROCESS takes a long time (20 - 30 seconds?) and nothing happens'));
                }

            }, 3000);
        } else {
            resetInclusion(false, false, 'controller.AddNodeToNetwork(0)', true);
        }

    };

    /**
     * Start configuration
     */
    $scope.startConfiguration = function () {
        resetConfiguration(true, false, {nodeId:13}, false, true);
        checkInterview(13);
        //return;
        var refresh = function () {
            var interviewRepeatCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewRepeatCnt + 1;
             angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {interviewRepeatCnt:  interviewRepeatCnt});
             if(interviewRepeatCnt >  $scope.zwaveInclusion.cfg.checkInterviewRepeat && !$scope.zwaveInclusion.exclusionProcess.done){
                  $interval.cancel($scope.interval.api);
                  alertify.alertWarning($scope._t('Interview is not DONE'));
                  return;
             }
             checkInterview(13);
//            var progress = $scope.zwaveInclusion.automatedConfiguration.progress;
//            console.log('Running progress: ', progress)
//            if (progress >= 100) {
//                $scope.zwaveInclusion.automatedConfiguration.progress = 100;
//                resetConfiguration(false, true, null, false, true);
//                dataService.showNotifier({message: $scope._t('lb_new_device_configured')});
//                $scope.startManualConfiguration();
//
//                //$interval.cancel($scope.interval.api);
//                return;
//            } else {
//                $scope.zwaveInclusion.automatedConfiguration.progress = ((progress + 20) <= 100 ? progress + 20 : 100);
//            }

        };
        $scope.interval.api = $interval(refresh, $scope.zwaveInclusion.cfg.checkInterviewTimeout);


    };
    $scope.startConfiguration();

    /**
     * Check interview
     */
    function checkInterview(nodeId) {
        //console.log(((8/10)*100).toFixed());
        //return;
        
         $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt = 0;
        $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt = 0;
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            // Is battery operated?
            if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {hasBattery: 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses});
            }
            if (!ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value) {
                console.log('ERROR: ', ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length);
                return;


            }
            //console.log('OK: ', ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length);
            //console.log(node);
            for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length < 1) {
                    return;
                }
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {commandClassesCnt: Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length});
                for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                    var cmdClass = ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId];
                    if (cmdClass.data.interviewDone.value) {
                        angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice,
                                {interviewDoneCnt: $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt + 1}
                        );
                    }
                 }
                
            }
            var commandClassesCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt;
            var intervewDoneCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt;
             var progress = ((intervewDoneCnt/commandClassesCnt)*100).toFixed();
             console.log('commandClassesCnt: ', commandClassesCnt)
             console.log('intervewDoneCnt: ', intervewDoneCnt)
            console.log('Percent %: ',progress);
            $scope.zwaveInclusion.automatedConfiguration.progress = progress;
             if (progress >= 100) {
                 console.log('Bigger as 100')
                 $scope.zwaveInclusion.automatedConfiguration.progress = 100;
                resetConfiguration(false, true, null, false, true);
                dataService.showNotifier({message: $scope._t('lb_new_device_configured')});
                alertify.dismissAll();
                //$scope.startManualConfiguration();

                //$interval.cancel($scope.interval.api);
                //return;
            }
           // console.log('ZWaveAPIData.devices[nodeId].instances.length: ', ZWaveAPIData.devices[nodeId].instances);
        }, function (error) {
            return;
        });
    }
    ;



    /**
     * Start manual configuration
     */
    $scope.startManualConfiguration = function () {
        var nodeId = 9;
        resetManualConfiguration(true, false);
        $timeout(function () {
            resetManualConfiguration(false, true);
            //$location.path('/zwave/devices/' + nodeId + '/nohistory');

        }, 3000);

    };

    /**
     * Set secure inclusion
     */
    $scope.setSecureInclusion = function (status) {
        var cmd = 'controller.data.secureInclusion=' + status;
        $scope.runZwaveCmd(cmd);
    };

    /**
     * Run zwave CMD
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
        }, function () {
        });
    };

    /// --- Private functions --- ///

    /**
     * Set device by ID
     */
    var setDeviceId = function (data) {
        $scope.zwaveInclusion.device.find = data;
        if (data.inclusion_type === 'unsecure') {
            $scope.zwaveInclusion.device.secureInclusion = false;
        }
    };

    /**
     * Set ZWave API Data
     */
    var setZWaveAPIData = function (ZWaveAPIData) {
        $scope.zwaveInclusion.controller.controllerState = ZWaveAPIData.controller.data.controllerState.value;
        $scope.zwaveInclusion.controller.secureInclusion = ZWaveAPIData.controller.data.secureInclusion.value;
    };

    /**
     * Update controller data
     */
    var updateController = function (data) {
        // Set controller state
        if ('controller.data.controllerState' in data) {
            $scope.zwaveInclusion.controller.controllerState = data['controller.data.controllerState'].value;
            console.log('controllerState: ', $scope.zwaveInclusion.controller.controllerState);
        }
        // Set last excluded device
        if ('controller.data.lastExcludedDevice' in data) {
            $scope.zwaveInclusion.controller.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            if ($scope.zwaveInclusion.controller.lastExcludedDevice !== null) {
                resetExclusion(false, true, false, true);
                dataService.showNotifier({message: $scope._t('lb_device_excluded')});
            }
            console.log('lastExcludedDevice: ', $scope.zwaveInclusion.controller.lastExcludedDevice);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            console.log('lastIncludedDevice: ', deviceIncId);
            if (deviceIncId != null) {
                var givenName = 'Device_' + deviceIncId;
                resetInclusion(false, true, false, true);
                dataService.showNotifier({message: $scope._t('lb_new_device_found')});
                resetConfiguration(true, false, {nodeId: deviceIncId}, 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'', true);
                //$scope.zwaveInclusion.automatedConfiguration.includedDevice.id
                /*var givenName = 'Device_' + deviceIncId;
                 var cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                 dataFactory.runZwaveCmd(cmd).then(function() {
                 $scope.includedDeviceId = deviceIncId;
                 $scope.deviceFound = true;
                 //getLastIncluded(deviceIncId,ZWaveAPIData);
                 }, function(error) {
                 dataService.showConnectionError(error);
                 });*/

            }
        }
        if ('controller.data.secureInclusion' in data) {
            $scope.zwaveInclusion.controller.secureInclusion = data['controller.data.secureInclusion'].value;
            console.log('secureInclusion: ', $scope.zwaveInclusion.controller.secureInclusion);
        }
    }
    ;
    /**
     * Reset exclusion
     */
    function resetExclusion(process, done, cmd, cancelInterval) {
        //alertify.dismissAll();
        // Set scope
        angular.extend($scope.zwaveInclusion.exclusionProcess,
                {process: process, done: done}
        );
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
     * Reset inclusion
     */
    function resetInclusion(process, done, cmd, cancelInterval) {
        //alertify.dismissAll();
        // Set scope
        angular.extend($scope.zwaveInclusion.inclusionProcess,
                {process: process, done: done}
        );
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
     * Reset automated configuration
     */
    function resetConfiguration(process, done, includedDevice, cmd, cancelInterval) {
        //alertify.dismissAll();
        // Set scope
        angular.extend($scope.zwaveInclusion.automatedConfiguration,
                {process: process, done: done}
        );
        // Set included device
        if (_.isObject(includedDevice)) {
            console.log('Extending automatedConfiguration.includedDevice: ', includedDevice);
            angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, includedDevice);
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
     * Reset manual configuration
     */
    function resetManualConfiguration(process, done) {
        //alertify.dismissAll();
        // Set scope
        angular.extend($scope.zwaveInclusion.manualConfiguration,
                {process: process, done: done}
        );
    }
    ;

});
