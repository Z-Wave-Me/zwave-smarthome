/**
 * @overview Handles Z-Wave device inclusion actions.
 * @author Martin Vach
 */

/**
 * The controller that handles Z-Wave device inclusion process.
 * @class ZwaveInclusionController
 */
myAppController.controller('ZwaveInclusionController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    $scope.zwaveInclusion = {
        cancelModal: false,
        cfg: {
            checkInterviewTimeout: 3000, // miliseconds
            checkInterviewRepeat: 7, // times
            inexTimeout: 30000 // Inclusion/Exclusion timeout - miliseconds
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
                nodeName: '',
                hasBattery: false,
                commandClassesCnt: 0,
                interviewDoneCnt: 0,
                interviewRepeatCnt: 0,
                security: false,
                securityInterview: false,
                errorType: '',
                interviewNotDone: {}
            },
            fprogress: 0,
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
    $scope.startStopExclusion = function (process) {
        if (process) {
            resetExclusion(process, false, 'controller.RemoveNodeFromNetwork(1)');
            $scope.refreshZwaveApiData();
            // If EXCLUSION takes a long time and nothing happens display an alert and reset exlusion process
            $timeout(function () {
                if ($scope.zwaveInclusion.exclusionProcess.process && !$scope.zwaveInclusion.exclusionProcess.done) {
                    resetExclusion(false, false, 'controller.RemoveNodeFromNetwork(0)', true);
                    alertify.alertWarning($scope._t('error_exclusion_time'));
                     $scope.reloadData();
                }

            }, $scope.zwaveInclusion.cfg.inexTimeout);
        } else {
            resetExclusion(false, false, 'controller.RemoveNodeFromNetwork(0)', true);
            $scope.reloadData();
        }

    };


    /**
     * Start/Stop Inclusion
     */
    $scope.startStopInclusion = function (process) {
       if (process) {
            setSecureInclusion($scope.zwaveInclusion.device.secureInclusion);
            resetInclusion(process, false, 'controller.AddNodeToNetwork(1)');
            $scope.refreshZwaveApiData();
            // If INCLUSION takes a long time and nothing happens display an alert and reset inclusion process
            $timeout(function () {
                if ($scope.zwaveInclusion.inclusionProcess.process && !$scope.zwaveInclusion.inclusionProcess.done) {
                    resetInclusion(false, false, 'controller.AddNodeToNetwork(0)', true);
                    alertify.alertWarning($scope._t('error_inclusion_time'));
                     $scope.reloadData();
                }

            }, $scope.zwaveInclusion.cfg.inexTimeout);
        } else {
            setSecureInclusion(true);
            resetInclusion(false, false, 'controller.AddNodeToNetwork(0)', true);
            $scope.reloadData();
        }

    };

    /**
     * Start configuration
     */
    $scope.startConfiguration = function (includedDevice) {
        resetConfiguration(true, false, includedDevice, false, true);
        checkInterview(includedDevice.nodeId);
        var refresh = function () {
            var interviewRepeatCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewRepeatCnt + 1;
            angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {interviewRepeatCnt: interviewRepeatCnt});

            // Try to comlete configuration
            if (interviewRepeatCnt > $scope.zwaveInclusion.cfg.checkInterviewRepeat && !$scope.zwaveInclusion.automatedConfiguration.done) {
                $interval.cancel($scope.interval.api);
                var batteryInfo = $scope.zwaveInclusion.automatedConfiguration.includedDevice.hasBattery
                        ? '<div class="alert alert-warning"> <i class="fa fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                        : '';

                // Error switch
                switch ($scope.zwaveInclusion.automatedConfiguration.includedDevice.errorType) {
                    // Secure interview failed
                    case 'error_interview_secure_failed':
                        alertify.alertError($scope._t('error_interview_secure_failed')).set('onok', function (closeEvent) {
                            resetConfiguration(false, false, null, false, true);
                            $scope.startStopExclusion(true);
                        });
                        break;
                    // Cc Version interview is not complete
                    case 'error_interview_again':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                                .setting('labels', {'ok': $scope._t('try_again_complete')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    $scope.zwaveInclusion.cancelModal = true;
                                });
                        break;
                        // Cc Version interview is complete but other interviews are not complete
                    case 'error_interview_retry':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                                .setting('labels', {'ok': $scope._t('retry_complete_inclusion')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    $scope.zwaveInclusion.cancelModal = true;
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
            checkInterview(includedDevice.nodeId);

        };
        $scope.interval.api = $interval(refresh, $scope.zwaveInclusion.cfg.checkInterviewTimeout);


    };

    /**
     * Start manual configuration
     */
    $scope.startManualConfiguration = function (nodeId) {
        resetManualConfiguration(true, false);
        $timeout(function () {
            resetManualConfiguration(false, true);
            $location.path('/zwave/devices/' + nodeId + '/nohistory');

        }, 5000);

    };

    /**
     * Cancel manual configuration
     */
    $scope.cancelManualConfiguration = function (reset) {
        $scope.zwaveInclusion.cancelModal = false;
        resetConfiguration(false, false, null, false, true);
        if(reset){
             $scope.startStopExclusion(true);
        }else{
            $scope.startManualConfiguration($scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId);
             
        }

    };

    /**
     * Run zwave command
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
        }, function () {
        });
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
     * Set device by ID
     */
    var setDeviceId = function (data) {
        $scope.zwaveInclusion.device.find = data;
        if (data.inclusion_type === 'unsecure') {
            $scope.zwaveInclusion.device.secureInclusion = false;
        }
    };

    /**
     * Set secure inclusion
     */
    function setSecureInclusion(status) {
        $scope.runZwaveCmd('controller.data.secureInclusion=' + status);
    }
    ;

    /**
     * Set ZWave API Data
     */
    function setZWaveAPIData(ZWaveAPIData) {
        $scope.zwaveInclusion.controller.controllerState = ZWaveAPIData.controller.data.controllerState.value;
        $scope.zwaveInclusion.controller.secureInclusion = ZWaveAPIData.controller.data.secureInclusion.value;
    }
    ;

    /**
     * Update controller data
     */
    function updateController(data) {
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
                $scope.reloadData();
            }
            console.log('lastExcludedDevice: ', $scope.zwaveInclusion.controller.lastExcludedDevice);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            console.log('lastIncludedDevice: ', deviceIncId);
            if (deviceIncId != null) {
                var givenName = 'Device_' + deviceIncId;
                var cmd = false;
                 if (data.devices[deviceIncId].data.givenName.value === '' || data.devices[deviceIncId].data.givenName.value === null) {
                     cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                 }
                resetInclusion(false, true, false, true);
                //dataService.showNotifier({message: $scope._t('lb_new_device_found')});
                resetConfiguration(true, false, {nodeId: deviceIncId}, cmd, true);
                $scope.startConfiguration({nodeId: deviceIncId});

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
        /// Set scope
        angular.extend($scope.zwaveInclusion.automatedConfiguration,
                {process: process, done: done, forceInterview: false, progress: 0}
        );
        // Set included device
        if (_.isObject(includedDevice)) {
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
     * Check interview
     */
    function checkInterview(nodeId) {
        $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt = 0;
        $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt = 0;
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            $scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeName = node.data.givenName.value || 'Device ' + '_' + nodeId;
            if (!ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value) {
                return;
            }

            // Is battery operated?
            if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {hasBattery: 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses});
            }
            for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length < 1) {
                    return;
                }
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {commandClassesCnt: Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length});
                for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                    var cmdClass = ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId];
                    var id = node.instances[iId].commandClasses[ccId].name;
                    var iData = 'devices[' + nodeId + '].instances[' + iId + '].commandClasses[' + ccId + '].Interview()';
                    //Is Security available?
                    if (ccId === '152') {
                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.security = true;
                    }
                    // Is interview done?
                    if (cmdClass.data.interviewDone.value) {
                        // Is security interview done?
                        if (ccId === '152') {
                            $scope.zwaveInclusion.automatedConfiguration.includedDevice.securityInterview = true;
                        }
                        // If an interview is done deleting from interviewNotDone
                        delete $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone[id];
                        // Extending an interview counter
                        angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice,
                                {interviewDoneCnt: $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt + 1}
                        );
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone[id] = iData;
                    }
                }
            }

            var commandClassesCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt;
            var intervewDoneCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt;
            var progress = ((intervewDoneCnt / commandClassesCnt) * 100).toFixed();
            console.log('commandClassesCnt: ', commandClassesCnt);
            console.log('intervewDoneCnt: ', intervewDoneCnt);
            console.log('Percent %: ', progress);
            $scope.zwaveInclusion.automatedConfiguration.progress = (progress < 101 ? progress : 99);

            // Test if Security available and Security interview failed
            if ($scope.zwaveInclusion.automatedConfiguration.includedDevice.security && !$scope.zwaveInclusion.automatedConfiguration.includedDevice.securityInterview) {
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_secure_failed'});
                return;
            }

            // If no Security or Security ok but Interviews are not complete
            if (!_.isEmpty($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone)) {
                // If command class Version is not complet, „Force Interview Version“
                if ($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone['Version']) {
                    angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_again'});
                    return;
                    // If Version ok but other CC are missing, force only these command classes
                } else {
                    angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_retry'});
                    return;
                }
            }
            // All interviews are done
            if (progress >= 100) {
                $scope.zwaveInclusion.automatedConfiguration.progress = 100;
                resetConfiguration(false, true, null, false, true);
                setSecureInclusion(true);
                $scope.startManualConfiguration(nodeId);
                return;;
            }
        }, function (error) {
            return;
        });
    }
    ;

    /**
     * Reset manual configuration
     */
    function resetManualConfiguration(process, done) {
        // Set scope
        angular.extend($scope.zwaveInclusion.manualConfiguration,
                {process: process, done: done}
        );
    }
    ;

});

