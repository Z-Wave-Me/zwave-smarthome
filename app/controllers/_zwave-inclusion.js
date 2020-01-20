/**
 * @overview Handles Z-Wave device inclusion actions.
 * @author Martin Vach
 */

/**
 * The controller that handles Z-Wave device inclusion process.
 * @class ZwaveInclusionController
 */
myAppController.controller('ZwaveInclusionController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, cfg,_) {
    $scope.zwaveInclusion = {
        cancelModal: false,
        cfg: {
            checkInterviewTimeout: 3000, // miliseconds
            checkInterviewRepeat: 16, // times
            inexTimeout: 120000 // Inclusion/Exclusion timeout - miliseconds
        },
        device: {
            hasBattery: false,
            secureInclusion: true,
            find: {}
        },
        controller: {
            controllerState: 0,
            lastExcludedDevice: null,
            secureInclusion: false,
            lastIncludedDeviceId: 0
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
        s2:{
            input: {
                dskPin: 0,
                publicKey: null,
                publicKeyAuthenticationRequired: false,
                keysGranted: {
                    S0: 'false',
                    S2Unauthenticated: 'false',
                    S2Authenticated: 'false',
                    S2Access: 'false'
                },
                keysRequested: {
                    S0: 'false',
                    S2Unauthenticated: 'false',
                    S2Authenticated: 'false',
                    S2Access: 'false'
                }
            },
            grantKeys: {
                interval: false,
                show: false,
                done: false,
                countDown: 20,
                anyChecked: false
            },
            verifyDSK: {
                interval: false,
                show: false,
                done: false,
                countDown: 20
            },
            process: false,
            interviewDone: false,
            done: false,
            alert: {}
        },
        automatedConfiguration: {
            process: false,
            includedDevice: {
                initDone: false,
                nodeId: 0,
                nodeName: '',
                hasBattery: false,
                commandClassesCnt: 0,
                interviewDoneCnt: 0,
                checkInterviewCnt: 0,
                retryCCInterviews: false,
                security: false,
                securityInterview: false,
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
        api: null,
        s2: null
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval.api);
    });

    /**
     * Load all promises
     * initial load complete controller
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            false,
            dataFactory.loadZwaveApiData(true)
        ];

        // Loading device by ID
        if ($routeParams.id) {
            promises[0] = dataFactory.getApi('zwave_devices', '?lang=' + $scope.lang + '&id=' + $routeParams.id);
        }

        $q.allSettled(promises).then(function (response) {
            var deviceId = response[0];
            var ZWaveAPIData = response[1];
            // Error message
            if (ZWaveAPIData.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }

            // Success - device by id
            if (deviceId.state === 'fulfilled') {
                var device = dataService.getZwaveDevices([deviceId.value.data.data]).value();
                setDeviceId(device[0]);
            }
            // Success - ZWaveAPIData
            if (ZWaveAPIData.state === 'fulfilled') {
                //console.log(ZWaveAPIData.value);
                if(ZWaveAPIData.value){
                    setZWaveAPIData(ZWaveAPIData.value);
                }
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
                if(response){
                    updateController(response.data);
                }
            });
        };
        $scope.interval.api = $interval(refresh, $scope.cfg.interval);
    };
    $scope.refreshZwaveApiData();

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
            case 'exclusion':
                cmd = process ? 'controller.RemoveNodeFromNetwork(1)' : 'controller.RemoveNodeFromNetwork(0)';
                scope = 'exclusionProcess';
                msg = $scope._t('error_exclusion_time');
                break;
        }

        if(process) {
            resetProcess(type, process, false, cmd);
            // If Process takes a long time and nothing happens display an alert and reset process
            $timeout(function () {
                if ($scope.zwaveInclusion[scope].process && !$scope.zwaveInclusion[scope].done) {
                    resetProcess(type, false, false, cmd);
                    alertify.alertWarning(msg);
                    $scope.reloadData();
                }
            }, $scope.zwaveInclusion.cfg.inexTimeout);
        } else {
            resetProcess(type, false, false, cmd);
            $scope.reloadData();
        }
    };

    /**
     * Start configuration
     */
    $scope.startConfiguration = function (includedDevice) {
        resetConfiguration(true, false, includedDevice, false);
        handleInterview(includedDevice.nodeId);
        var refresh = function () {
            var checkInterviewCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.checkInterviewCnt + 1;
            angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {checkInterviewCnt: checkInterviewCnt});

            // Try to complete configuration
            if (checkInterviewCnt > $scope.zwaveInclusion.cfg.checkInterviewRepeat && !$scope.zwaveInclusion.automatedConfiguration.done) {
                //$interval.cancel($scope.interval.api);
                var batteryInfo = $scope.zwaveInclusion.automatedConfiguration.includedDevice.hasBattery
                    ? '<div class="alert alert-warning"> <i class="fa fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                    : '';

                // Error switch
                switch ($scope.zwaveInclusion.automatedConfiguration.includedDevice.errorType) {
                    // Secure interview failed
                    case 'error_interview_secure_failed':
                        alertify.alertError($scope._t('error_interview_secure_failed')).set('onok', function (closeEvent) {
                            resetConfiguration(false, false, null, false);
                            $scope.startStopProcess('exclusion', true);
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
                                    checkInterviewCnt: 0,
                                    errorType: ''
                                });
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
                                    checkInterviewCnt: 0,
                                    errorType: ''
                                });
                            })
                            .set('oncancel', function (closeEvent) {//after clicking Cancel
                                $scope.zwaveInclusion.cancelModal = true;
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
        };
        $scope.interval.api = $interval(refresh, $scope.zwaveInclusion.cfg.checkInterviewTimeout);
    };

    /**
     * Start manual configuration
     */
    $scope.startManualConfiguration = function (nodeId) {
        //console.log('Running manual configuration')
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
        resetConfiguration(false, false, null, false);
        if (reset) {
            $scope.startStopProcess('exclusion', true);
        } else {
            $scope.startManualConfiguration($scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId);
            //$scope.verifyS2cc($scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId);
        }
    };

    /**
     * Run zwave command
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {});
    };

    /**
     * Force interview
     */
    $scope.forceInterview = function (interviews) {
        angular.forEach(interviews, function (v, k) {
            $scope.runZwaveCmd(v);
        });
    };

    /**
     * Set inclusion as Secure/Unsecure.
     * state=true Set as secure.
     * state=false Set as unsecure.
     * @param {string} cmd
     */
    $scope.setSecureInclusion = function (cmd) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.runZwaveCmd(cmd);
    };

    /**
     * Get block of DSK
     * @param {array} publicKey
     * @param {num} block
     * @returns {string}
     */
    $scope.dskBlock = function(publicKey, block) {
        if(!publicKey){
            return '';
        }
        return (publicKey[(block - 1) * 2] * 256 + publicKey[(block - 1) * 2 + 1]);
    };

    /**
     * Handle inclusionS2GrantKeys
     */
    $scope.handleInclusionS2GrantKeys = function (keysGranted, timedOut) {
        console.log("keysGranted", keysGranted);
        var alertMessage = '';
        // Is any checkbox checked?
        angular.forEach(keysGranted, function (v) {
            if (v == true) {
                $scope.zwaveInclusion.s2.grantKeys.anyChecked = true
                return;
            }
        });

        // Is timed out
        if (timedOut) {
            alertMessage += $scope._t('timedout') + '. ';
        }

        // Nothing is checked
        if (!$scope.zwaveInclusion.s2.grantKeys.anyChecked) {
            alertMessage += $scope._t('no_s2_channel');
        }

        // Show an alert
        if (alertMessage) {
            $scope.zwaveInclusion.s2.alert = {
                message: alertMessage,
                status: 'alert-danger',
                icon: false
            };
        }

        $scope.zwaveInclusion.s2.grantKeys.show = false;
        $scope.zwaveInclusion.s2.grantKeys.done = true;

        $interval.cancel($scope.zwaveInclusion.s2.grantKeys.interval);

        console.log("$interval.cancel($scope.zwaveInclusion.s2.grantKeys.interval)", $scope.zwaveInclusion.s2.grantKeys.interval);

        var nodeId = $scope.zwaveInclusion.controller.lastIncludedDeviceId.toString(10),
            cmd ='devices[' + nodeId + '].SecurityS2.data.grantedKeys.S0=' + keysGranted.S0 + '; ' +
                 'devices[' + nodeId + '].SecurityS2.data.grantedKeys.S2Unauthenticated=' + keysGranted.S2Unauthenticated + '; ' +
                 'devices[' + nodeId + '].SecurityS2.data.grantedKeys.S2Authenticated=' + keysGranted.S2Authenticated + '; ' +
                 'devices[' + nodeId + '].SecurityS2.data.grantedKeys.S2Access=' + keysGranted.S2Access + '; ' +
                 'devices[' + nodeId + '].SecurityS2.data.grantedKeys=true';

        console.log("cmd", cmd);
        $scope.runZwaveCmd(cmd);
    };


    /**
     * Handle inclusionS2VerifyDSK
     * @param {int} nodeId
     */
    $scope.handleInclusionVerifyDSK = function (nodeId) {
        console.log("handleInclusionVerifyDSK");
        var dskPin = parseInt($scope.zwaveInclusion.s2.input.dskPin, 10),
            nodeId = nodeId,
            publicKey = [];

            publicKey = $scope.zwaveInclusion.s2.input.publicKey;
            publicKey[0] = (dskPin >> 8) & 0xff;
            publicKey[1] = dskPin & 0xff;

        $interval.cancel($scope.zwaveInclusion.s2.verifyDSK.interval);

        var cmd = 'devices[' + nodeId + '].SecurityS2.data.publicKeyVerified=[' + publicKey.join(',') + '];';
        $scope.zwaveInclusion.s2.verifyDSK.show = false;
        $scope.zwaveInclusion.s2.verifyDSK.done = true;
        $scope.runZwaveCmd(cmd);
        $timeout(function() {
            checkS2Interview(nodeId);
        }, 10000);

    };

    /**
     * S2 test
     */
    $scope.verifyS2cc = function (nodeId, ZWaveAPIData) {
            // get only the device data
            var device = $filter('hasNode')(ZWaveAPIData, 'devices.' + nodeId + '.data.nodeInfoFrame.value');
            console.log("verifyS2cc device", device);
            if(device && device.indexOf(159) > -1) {
                var securityS2 = $filter('hasNode')(ZWaveAPIData, 'devices.' + nodeId + '.instances.0.commandClasses.159');

                console.log('S2 CC : ',securityS2);
                if(securityS2){
                    console.log('SecurityS2 CC Found');
                    checkS2cc(nodeId,securityS2);
                }
                /*else{
                    console.log('SecurityS2 CC NOT Found');
                    $scope.startConfiguration({nodeId: nodeId});
                }*/
            } else{
                //console.log('159 NOT in nodeInfoFrame.value');
                $scope.startConfiguration({nodeId: nodeId});
            }
    };
    //$scope.verifyS2cc(3)



    /// --- Private functions --- ///

    /**
     * Check S2 command class
     * @param {int} nodeId
     */
    function checkS2cc(nodeId, securityS2) {
        console.log("checkS2cc");

        // wait for SecurityS2.data.requestedKeys = True
        //console.log('wait for SecurityS2.data.requestedKeys = True')

        //dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
        //var securityS2 = $filter('hasNode')(ZWaveAPIData, 'devices.' + nodeId + '.instances.0.commandClasses.159');
        console.log('securityS2: ',securityS2);
        console.log('securityS2.data.requestedKeys.value: ',securityS2.data.requestedKeys.value);

        // normal inclusion
        if(!securityS2.data.requestedKeys.value){
            $scope.startConfiguration({nodeId: nodeId});
            return;
        }

        if(securityS2 && securityS2.data.requestedKeys.value && !$scope.zwaveInclusion.s2.grantKeys.done && !$scope.zwaveInclusion.s2.grantKeys.show) {
            console.log('Check requestedKeys: securityS2.data.requestedKeys.value ',securityS2.data.requestedKeys.value);
            $scope.zwaveInclusion.s2.input.keysRequested.S0 = securityS2.data.requestedKeys.S0.value;
            $scope.zwaveInclusion.s2.input.keysRequested.S2Unauthenticated = securityS2.data.requestedKeys.S2Unauthenticated.value;
            $scope.zwaveInclusion.s2.input.keysRequested.S2Authenticated = securityS2.data.requestedKeys.S2Authenticated.value;
            $scope.zwaveInclusion.s2.input.keysRequested.S2Access = securityS2.data.requestedKeys.S2Access.value;
            $scope.zwaveInclusion.s2.grantKeys.show = true;

            var countDownGrantKeys = function () {
                $scope.zwaveInclusion.s2.grantKeys.countDown--;
                if ($scope.zwaveInclusion.s2.grantKeys.countDown === 0) {
                    // cancel
                    $interval.cancel($scope.zwaveInclusion.s2.grantKeys.interval);
                    $scope.zwaveInclusion.s2.input.keysRequested.S0 = $scope.zwaveInclusion.s2.input.keysRequested.S2Unauthenticated = $scope.zwaveInclusion.s2.input.keysRequested.S2Authenticated = $scope.zwaveInclusion.s2.input.keysRequested.S2Access = false;
                    $scope.handleInclusionS2GrantKeys($scope.zwaveInclusion.s2.input.keysRequested, true);
                }
            };

            $scope.zwaveInclusion.s2.grantKeys.interval = $interval(countDownGrantKeys, 1000);

            // cancel s2 interval
            // $interval.cancel($scope.interval.s2);
            //$scope.verifyS2cc(nodeId);
            return;
        }

        if (securityS2 && securityS2.data.publicKey.value.length && !$scope.zwaveInclusion.s2.verifyDSK.done && !$scope.zwaveInclusion.s2.verifyDSK.show) {
            console.log('Check publicKey: securityS2.data.publicKey.value.length ',securityS2.data.requestedKeys.value);
            $scope.zwaveInclusion.s2.input.publicKey = securityS2.data.publicKey.value;
            $scope.zwaveInclusion.s2.input.publicKeyAuthenticationRequired = securityS2.data.publicKeyAuthenticationRequired.value;
            $scope.zwaveInclusion.s2.input.dskPin = $scope.dskBlock($scope.zwaveInclusion.s2.input.publicKey, 1);
            $scope.zwaveInclusion.s2.verifyDSK.show = true;
            var countDownVerifyDSK = function () {
                $scope.zwaveInclusion.s2.verifyDSK.countDown--;
                if ($scope.zwaveInclusion.s2.verifyDSK.countDown === 0) {
                    $interval.cancel($scope.zwaveInclusion.s2.verifyDSK.interval);
                    $scope.handleInclusionVerifyDSK(nodeId);
                }
            };
            $scope.zwaveInclusion.s2.verifyDSK.interval = $interval(countDownVerifyDSK, 1000);
            return;
        }
    }

    /**
     * Handle nclusionS2PublicKey
     */
    // function handleInclusionS2PublicKey(nodeId) {
    //     dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
    //         var securityS2 = $filter('hasNode')(ZWaveAPIData, 'devices.' + nodeId + '.instances.0.commandClasses.159');
    //         // wait for SecurityS2.data.publicKey to be set (not null nor [])
    //         //console.log('securityS2.data.publicKey.value.length: ',securityS2.data.publicKey.value.length);
    //         if(!securityS2.data.publicKey.value.length){
    //             checkS2Interview(nodeId);
    //             return;
    //         }
    //         //if SecurityS2.data.publicKeyAuthenticationRequired - open dialog
    //         //console.log('securityS2 dialog: ',securityS2.data.publicKeyAuthenticationRequired.value);
    //         if(securityS2.data.publicKeyAuthenticationRequired.value){
    //             $scope.zwaveInclusion.s2.verifyWindow = true;
    //             $scope.zwaveInclusion.s2.input.publicKey = securityS2.data.publicKey.value;
    //             $scope.zwaveInclusion.s2.input.publicKeyAuthenticationRequired = securityS2.data.publicKeyAuthenticationRequired.value;
    //             return;

    //         }else{// aprove it

    //             var cmd = 'devices[' + nodeId + '].SecurityS2.data.publicKeyVerified=[' + securityS2.data.publicKey.value.join(',') + '];';
    //             //console.log('Aprove it: ',cmd)
    //             $scope.runZwaveCmd(cmd)
    //             checkS2Interview(nodeId);
    //         }


    //     }, function (error) {
    //     });
    // }

    /**
     * Check S2 CC interview
     */
    function  checkS2Interview(nodeId) {
        var maxcnt = 10,
            cnt = 0;

        console.log('interviewDone S2: ', $scope.zwaveInclusion.s2.interviewDone)
            var refresh = function () {
                dataFactory.loadZwaveApiData(true).then(function (response) {

                    var interviewDone = $filter('hasNode')(response, 'devices.' + nodeId + '.instances.0.commandClasses.159.data.interviewDone.value');

                    if(interviewDone) {
                        $interval.cancel($scope.interval.s2);
                        $scope.zwaveInclusion.s2.alert = {
                            message: $scope._t('auth_successful'),
                            status: 'alert-success',
                            icon: 'fa-smile-o'
                        }
                        $timeout(function() {
                            $scope.startConfiguration({nodeId: nodeId});
                        }, 5000);

                    }
                    $scope.zwaveInclusion.s2.interviewDone = interviewDone;

                }, function (error) {});


                if (cnt == maxcnt) {
                    console.log('interview cnt == maxcnt: ', $scope.zwaveInclusion.s2.interviewDone)
                    $scope.zwaveInclusion.s2.process = false;
                    $scope.zwaveInclusion.s2.done = true;
                    $interval.cancel($scope.interval.s2);


                    if(!$scope.zwaveInclusion.s2.interviewDone){
                        alertify.confirm($scope._t('s2_failed'))
                            .setting('labels', {'ok': $scope._t('try_again_complete')})
                            .set('onok', function (closeEvent) {//after clicking OK
                                resetConfiguration(false, false, null, false);
                                $scope.startStopExclusion(true);
                            })
                            .set('oncancel', function (closeEvent) {//after clicking Cancel
                                console.log('interviewNotDone',$scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone)
                                $scope.startConfiguration({nodeId: nodeId});
                            });

                    }else{
                        $scope.zwaveInclusion.s2.alert = {
                            message: $scope._t('auth_successful'),
                            status: 'alert-success',
                            icon: 'fa-smile-o'
                        };
                        $timeout(function() {
                            $scope.startConfiguration({nodeId: nodeId});
                        }, 5000);
                    }
                }
                cnt++;
            };

        $scope.interval.s2 = $interval(refresh, 1000);
    };

    /**
     * Set device by ID
     */
    var setDeviceId = function (data) {
        $scope.zwaveInclusion.device.find = data;
        $scope.zwaveInclusion.device.secureInclusion = data.secure;
        if (data.inclusion_type === 'unsecure') {
            $scope.zwaveInclusion.device.secureInclusion = false;
        }
    };

    /**
     * Set secure inclusion
     */
    function setSecureInclusion(status) {
        $scope.runZwaveCmd('controller.data.secureInclusion=' + status);
    };

    /**
     * Set ZWave API Data
     */
    function setZWaveAPIData(ZWaveAPIData) {
        $scope.zwaveInclusion.controller.controllerState = ZWaveAPIData.controller.data.controllerState.value;
        $scope.zwaveInclusion.controller.secureInclusion = ZWaveAPIData.controller.data.secureInclusion.value;

        // check initial include mode
        if ([1,2,3,4].indexOf($scope.zwaveInclusion.controller.controllerState) > -1) {
            angular.extend($scope.zwaveInclusion.inclusionProcess,
                {process: true, done: false}
            );
        }
        // check initial exclude mode
        if ([5,6,7,20].indexOf($scope.zwaveInclusion.controller.controllerState) > -1) {
            angular.extend($scope.zwaveInclusion.exclusionProcess,
                {process: true, done: false}
            );
        }
    };

    /**
     * Update controller data
     */
    function updateController(data) {
        console.log("updateController data", data);
        // Set controller state
        if ('controller.data.controllerState' in data) {
            $scope.zwaveInclusion.controller.controllerState = data['controller.data.controllerState'].value;
            //console.log('controllerState: ', $scope.zwaveInclusion.controller.controllerState);
        }
        // Set last excluded device
        if ('controller.data.lastExcludedDevice' in data) {
            $scope.zwaveInclusion.controller.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            if ($scope.zwaveInclusion.controller.lastExcludedDevice !== null) {
                resetProcess("exclusion", false, true, false);
                dataService.showNotifier({message: $scope._t('lb_device_excluded')});
                $scope.reloadData();
            }
            //console.log('lastExcludedDevice: ', $scope.zwaveInclusion.controller.lastExcludedDevice);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            console.log("updateController deviceIncId", deviceIncId);
            //console.log('lastIncludedDevice: ', deviceIncId);
            if (deviceIncId != null) {
                $scope.zwaveInclusion.controller.lastIncludedDeviceId = deviceIncId;
                var givenName = 'Device_' + deviceIncId;
                var cmd = false;

                if(data.devices && (data.devices[deviceIncId].data.givenName.value === '' || data.devices[deviceIncId].data.givenName.value === null)) {
                    cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                }

                // normal inclusion finished
                resetProcess("inclusion", false, true, false);
                //dataService.showNotifier({message: $scope._t('lb_new_device_found')});
                resetConfiguration(true, false, {nodeId: deviceIncId}, cmd);

                // check for S2 CC
                $scope.verifyS2cc(deviceIncId, data);
                //$scope.startConfiguration({nodeId: deviceIncId});

            }
        }
        // Set secure inclusion
        if ('controller.data.secureInclusion' in data) {
            $scope.zwaveInclusion.controller.secureInclusion = data['controller.data.secureInclusion'].value;
            //console.log('secureInclusion: ', $scope.zwaveInclusion.controller.secureInclusion);
        }
    };

    /**
     * Reset exclusion or inclusion
     */
    function resetProcess(type, process, done, cmd) {
        // Set scope
        var scope = type == "inclusion" ? "inclusionProcess" : "exclusionProcess"
        angular.extend($scope.zwaveInclusion[scope],
            {process: process, done: done}
        );
        // Run CMD
        if (cmd) {
            $scope.runZwaveCmd(cmd);
        }
    };

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
    };

    /**
     * Check interview
     */
    function handleInterview(nodeId) {
        //$scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt = 0;
        //$scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt = 0;
        dataFactory.runZwaveCmd('devices['+ nodeId + ']').then(function (response) {
            var node = response.data;
            if(!_.isObject(node)){
                return;
            }
            $scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeName = node.data.givenName.value || 'Device ' + '_' + nodeId;
            if (!node.data.nodeInfoFrame.value) {
                return;
            }

            // Is battery operated?
            if (angular.isDefined(node.instances)) {
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {hasBattery: 0x80 in node.instances[0].commandClasses});
            }

            // do interview preset
            if (!$scope.zwaveInclusion.automatedConfiguration.initDone) {
                $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt = 0;
                $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt = 0;

                for (var iId in node.instances) {
                    Object.keys(node.instances[iId].commandClasses).forEach(function (cc){
                        if (node.instances[iId].commandClasses[cc].data.supported.value) {
                            $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt ++;
                        }
                    });
                }
            }

            for (var iId in node.instances) {
                if (Object.keys(node.instances[iId].commandClasses).length < 1) {
                    return;
                }
                //angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {commandClassesCnt: Object.keys(node.instances[iId].commandClasses).length});
                for (var ccId in node.instances[iId].commandClasses) {
                    // Skip if CC is not supported
                    if(!node.instances[iId].commandClasses[ccId].data.supported.value){
                        //console.log('Not supported', ccId)
                        continue;
                    }
                    var cmdClass = node.instances[iId].commandClasses[ccId];
                    var id = iId + '_' +node.instances[iId].commandClasses[ccId].name;
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
                        /*angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice,
                            {interviewDoneCnt: $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt + 1}
                        );*/
                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt ++;
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone[id] = iData;
                    }
                }
            }
            var commandClassesCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt;
            var interviewDoneCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt;
            var progress = ((interviewDoneCnt / commandClassesCnt) * 100).toFixed();
            //console.log('commandClassesCnt: ', commandClassesCnt);
            //console.log('interviewDoneCnt: ', interviewDoneCnt);
            //console.log('Percent %: ', progress);
            //console.log('checkInterviewCnt: ', $scope.zwaveInclusion.automatedConfiguration.includedDevice.checkInterviewCnt);
            $scope.zwaveInclusion.automatedConfiguration.progress = (progress < 101 ? progress : 99);

            // Test if Security available and Security interview failed
            if ($scope.zwaveInclusion.automatedConfiguration.includedDevice.security && !$scope.zwaveInclusion.automatedConfiguration.includedDevice.securityInterview) {
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_secure_failed'});
                return;
            }

            // If no Security or Security ok but Interviews are not complete
            if (!_.isEmpty($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone)) {
                switch ($scope.zwaveInclusion.automatedConfiguration.includedDevice.checkInterviewCnt) {
                    case 10:
                    case 13:
                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.retryCCInterviews = true;

                        if ($scope.zwaveInclusion.automatedConfiguration.includedDevice.checkInterviewCnt === 13) {
                            angular.forEach($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone, function(value, ccKey){

                                var commandClass = ccKey.split('_')[1];

                                if (_.contains(['MultiChannelAssociation','AssociationGroupInformation','AssociationCommandConfiguration'],commandClass)){
                                    // If an interview is done deleting from interviewNotDone
                                    delete $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone[ccKey];
                                    angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {interviewDoneCnt: interviewDoneCnt++});
                                }
                            });

                            progress = ((interviewDoneCnt / commandClassesCnt) * 100).toFixed();

                            // If Version ok but other CC are missing, force only these command classes
                            $scope.forceInterview($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                        } else {
                            // If Version ok but other CC are missing, force only these command classes
                            $scope.forceInterview($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                        }
                        break;
                    case 16:
                        angular.forEach($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone, function(value, ccKey){

                            var commandClass = ccKey.split('_')[1];

                            // If command class Version is not complete, „Force Interview Version“
                            if (commandClass === 'Version') {
                                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_again'});
                                return;

                            // If one of these classes is not interviewed ignore it > progress 100 %
                            } else {
                                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_retry'});
                                return;
                            }
                        });

                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.retryCCInterviews = false;

                        break;
                }
            }

            // All interviews are done
            if (progress >= 100) {
                $scope.zwaveInclusion.automatedConfiguration.progress = 100;
                $scope.zwaveInclusion.automatedConfiguration.initDone = false;
                resetConfiguration(false, true, null, false);
                setSecureInclusion(true);
                $scope.startManualConfiguration(nodeId);
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
        angular.extend($scope.zwaveInclusion.manualConfiguration,
            {process: process, done: done}
        );
    };
});

