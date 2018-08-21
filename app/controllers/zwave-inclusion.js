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
                publicKeyAuthenticationRequired: false
            },
            verifyWindow: false,
            process: false,
            interviewDone: false,
            done: false

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
    $scope.refreshZwaveApiData = function (maxcnt) {
        var cnt = 0;
        if (typeof maxcnt !== 'undefined') {
            var refresh = function () {
                cnt++;
                dataFactory.refreshZwaveApiData().then(function (response) {
                    //console.log(response.data);
                    if(response){
                        updateController(response.data);
                    }
                });

                if (cnt == maxcnt) {
                    $interval.cancel($scope.interval.api);
                    $scope.loading = false;
                }
            };
        } else {
            var refresh = function () {
                dataFactory.refreshZwaveApiData().then(function (response) {
                    //console.log(response.data);
                    if(response){
                        updateController(response.data);
                    }

                });
            };
        }

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
            // setSecureInclusion($scope.zwaveInclusion.device.secureInclusion);
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
            // setSecureInclusion(true);
            resetInclusion(false, false, 'controller.AddNodeToNetwork(0)', true);
            $scope.reloadData();
        }

    };

    /**
     * Start configuration
     */
    $scope.startConfiguration = function (includedDevice) {
        resetConfiguration(true, false, includedDevice, false, true);
        handleInterview(includedDevice.nodeId);
        var refresh = function () {
            var checkInterviewCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.checkInterviewCnt + 1;
            angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {checkInterviewCnt: checkInterviewCnt});

            // Try to complete configuration
            if (checkInterviewCnt > $scope.zwaveInclusion.cfg.checkInterviewRepeat && !$scope.zwaveInclusion.automatedConfiguration.done) {
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
        resetConfiguration(false, false, null, false, true);
        if (reset) {
            $scope.startStopExclusion(true);
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
        $scope.refreshZwaveApiData(1);
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
     * Handle inclusionS2VerifyDSK
     * @param {int} nodeId
     */
    $scope.handleInclusionVerifyDSK = function (nodeId) {
        var confirmed = true;
        var dskPin = parseInt($scope.zwaveInclusion.s2.input.dskPin, 10),
            nodeId = nodeId,
            publicKey = [];

        if (confirmed) {
            publicKey = $scope.zwaveInclusion.s2.input.publicKey;
            publicKey[0] = (dskPin >> 8) & 0xff;
            publicKey[1] = dskPin & 0xff;
        }
        var cmd = 'devices[' + nodeId + '].SecurityS2.data.publicKeyVerified=[' + publicKey.join(',') + '];';
        $scope.zwaveInclusion.s2.verifyWindow = false;
        $scope.runZwaveCmd(cmd);
        checkS2Interview(nodeId);
    };

    /**
     * S2 test
     */
    $scope.verifyS2cc = function (nodeId) {
            dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
                var device = $filter('hasNode')(ZWaveAPIData, 'devices.' + nodeId + '.data.nodeInfoFrame.value');
                
                if(device && device.indexOf(159) > -1){
                    //console.log('159 found nodeInfoFrame.value');
                    var maxcnt = 3;
                    var cnt = 0;
                    var refresh = function () {
                        cnt++;
                        dataFactory.loadZwaveApiData(true).then(function (response) {
                            var securityS2 = $filter('hasNode')(response, 'devices.' + nodeId + '.instances.0.commandClasses.159');
                            //console.log('Count: ' + cnt)
                            //console.log('S2 CC : ' +securityS2)
                            if(securityS2){
                                //console.log('SecurityS2 CC Found');
                                $interval.cancel($scope.interval.s2);
                                checkS2cc(nodeId,securityS2);
                            }
                            if (cnt == maxcnt) {
                                $interval.cancel($scope.interval.s2);
                                if(securityS2){
                                    //console.log('SecurityS2 CC Found');
                                    checkS2cc(nodeId,securityS2);
                                }else{
                                    //console.log('SecurityS2 CC NOT Found');
                                    $scope.startConfiguration({nodeId: nodeId});
                                }

                            }

                        }, function (error) {});
                    };
                    $scope.interval.s2 = $interval(refresh, 1000);

                }else{
                    //console.log('159 NOT in nodeInfoFrame.value');
                    $scope.startConfiguration({nodeId: nodeId});
                }


            }, function (error) {
            });
    };
    //$scope.verifyS2cc(3)



    /// --- Private functions --- ///

    /**
     * Check S2 command class
     * @param {int} nodeId
     */
    function checkS2cc(nodeId) {

        // wait for SecurityS2.data.requestedKeys = True
        //console.log('wait for SecurityS2.data.requestedKeys = True')
        $timeout(function() {
            dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
                var securityS2 = $filter('hasNode')(ZWaveAPIData, 'devices.' + nodeId + '.instances.0.commandClasses.159');
                //console.log('securityS2: ',securityS2);
                //console.log('securityS2.data.requestedKeys.value: ',securityS2.data.requestedKeys.value);
                if(!securityS2.data.requestedKeys.value){
                    $scope.startConfiguration({nodeId: nodeId});
                    return;
                }else{
                    //Always grant same keys as request
                   var cmd = 'devices[' + nodeId + '].SecurityS2.data.grantedKeys.S0=' + ($filter('hasNode')(securityS2, 'data.requestedKeys.S0.value') ||false) +';';
                   cmd += 'devices[' + nodeId + '].SecurityS2.data.grantedKeys.S2Unauthenticated=' + ($filter('hasNode')(securityS2, 'data.requestedKeys.S2Unauthenticated.value') ||false) +';';
                    cmd += 'devices[' + nodeId + '].SecurityS2.data.grantedKeys.S2Authenticated=' + ($filter('hasNode')(securityS2, 'data.requestedKeys.S2Authenticated.value') ||false) +';'
                    cmd += 'devices[' + nodeId + '].SecurityS2.data.grantedKeys.S2Access=' + ($filter('hasNode')(securityS2, 'data.requestedKeys.S2Access.value') ||false) +';';
                    cmd += 'devices[' + nodeId + '].SecurityS2.data.grantedKeys=true';
                    //console.log('Always grant same keys as request: ',cmd);
                    $scope.runZwaveCmd(cmd);
                    //handleInclusionS2GrantKeys(keysRequested,nodeId);
                    // wait for SecurityS2.data.publicKey
                    $timeout(function() {
                        //console.log('wait for SecurityS2.data.publicKey 10s')
                        handleInclusionS2PublicKey(nodeId);
                    }, 10000);

                }

            }, function (error) {});


        }, 2000);
    }
    /**
     * Handle nclusionS2PublicKey
     */
    function handleInclusionS2PublicKey(nodeId){
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var securityS2 = $filter('hasNode')(ZWaveAPIData, 'devices.' + nodeId + '.instances.0.commandClasses.159');
            // wait for SecurityS2.data.publicKey to be set (not null nor [])
            //console.log('securityS2.data.publicKey.value.length: ',securityS2.data.publicKey.value.length);
            if(!securityS2.data.publicKey.value.length){
                checkS2Interview(nodeId);
                return;
            }
            //if SecurityS2.data.publicKeyAuthenticationRequired - open dialog
            //console.log('securityS2 dialog: ',securityS2.data.publicKeyAuthenticationRequired.value);
            if(securityS2.data.publicKeyAuthenticationRequired.value){
                $scope.zwaveInclusion.s2.verifyWindow = true;
                $scope.zwaveInclusion.s2.input.publicKey = securityS2.data.publicKey.value;
                $scope.zwaveInclusion.s2.input.publicKeyAuthenticationRequired = securityS2.data.publicKeyAuthenticationRequired.value;
                return;

            }else{// aprove it

                var cmd = 'devices[' + nodeId + '].SecurityS2.data.publicKeyVerified=[' + securityS2.data.publicKey.value.join(',') + '];';
                //console.log('Aprove it: ',cmd)
                $scope.runZwaveCmd(cmd)
                checkS2Interview(nodeId);
            }


        }, function (error) {
        });
    }

    /**
     * Check S2 CC interview
     */
    function  checkS2Interview(nodeId) {
        var maxcnt = 10;
        var cnt = 0;
        //console.log('interviewDone S2: ', $scope.zwaveInclusion.s2.interviewDone)
            var refresh = function () {
                cnt++;
                dataFactory.loadZwaveApiData(true).then(function (response) {

                    var interviewDone = $filter('hasNode')(response, 'devices.' + nodeId + '.instances.0.commandClasses.159.data.interviewDone.value');
                    //console.log('Check S2 interview: ' + cnt)
                    //console.log('S2 interview DONE: ' + interviewDone)
                    if(interviewDone){
                        $interval.cancel($scope.interval.s2);
                        $scope.startConfiguration({nodeId: nodeId});
                    }
                    $scope.zwaveInclusion.s2.interviewDone = interviewDone;

                }, function (error) {});


                if (cnt == maxcnt) {
                    //console.log('interview cnt == maxcnt: ', $scope.zwaveInclusion.s2.interviewDone)
                    $scope.zwaveInclusion.s2.process = false;
                    $scope.zwaveInclusion.s2.done = true;
                    $interval.cancel($scope.interval.s2);


                    if(!$scope.zwaveInclusion.s2.interviewDone){
                        alertify.confirm($scope._t('s2_failed'))
                            .setting('labels', {'ok': $scope._t('try_again_complete')})
                            .set('onok', function (closeEvent) {//after clicking OK
                                resetConfiguration(false, false, null, false, true);
                                $scope.startStopExclusion(true);
                            })
                            .set('oncancel', function (closeEvent) {//after clicking Cancel
                                //console.log('interviewNotDone',$scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone)
                                $scope.startConfiguration({nodeId: nodeId});
                            });

                    }else{
                            $scope.startConfiguration({nodeId: nodeId});
                    }
                }
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
        // Set controller state
        if ('controller.data.controllerState' in data) {
            $scope.zwaveInclusion.controller.controllerState = data['controller.data.controllerState'].value;
            //console.log('controllerState: ', $scope.zwaveInclusion.controller.controllerState);
        }
        // Set last excluded device
        if ('controller.data.lastExcludedDevice' in data) {
            $scope.zwaveInclusion.controller.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            if ($scope.zwaveInclusion.controller.lastExcludedDevice !== null) {
                resetExclusion(false, true, false, true);
                dataService.showNotifier({message: $scope._t('lb_device_excluded')});
                $scope.reloadData();
            }
            //console.log('lastExcludedDevice: ', $scope.zwaveInclusion.controller.lastExcludedDevice);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            //console.log('lastIncludedDevice: ', deviceIncId);
            if (deviceIncId != null) {
                $scope.zwaveInclusion.controller.lastIncludedDeviceId = deviceIncId;
                var givenName = 'Device_' + deviceIncId;
                var cmd = false;
                if (data.devices[deviceIncId].data.givenName.value === '' || data.devices[deviceIncId].data.givenName.value === null) {
                    cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                }
                resetInclusion(false, true, false, true);
                //dataService.showNotifier({message: $scope._t('lb_new_device_found')});
                resetConfiguration(true, false, {nodeId: deviceIncId}, cmd, true);
                $scope.verifyS2cc(deviceIncId);
                //$scope.startConfiguration({nodeId: deviceIncId});

            }
        }
        if ('controller.data.secureInclusion' in data) {
            $scope.zwaveInclusion.controller.secureInclusion = data['controller.data.secureInclusion'].value;
            //console.log('secureInclusion: ', $scope.zwaveInclusion.controller.secureInclusion);
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

    /*var refreshTest = function () {
        handleInterview(5);
        //checkInterview(29)
    };
    $interval(refreshTest, $scope.zwaveInclusion.cfg.checkInterviewTimeout);*/

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
                resetConfiguration(false, true, null, false, true);
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

