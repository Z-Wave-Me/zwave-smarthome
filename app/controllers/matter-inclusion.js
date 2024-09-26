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
            commissioningStep: "",
            lastExcludedDevice: null,
            lastIncludedDeviceId: 0,
            bleExtDHSupported: !!navigator.bluetooth && !!navigator.bluetooth.requestDevice,
            bleExtEnabled: false,
            bleExtWS: false,
            bleExtPort: 0,
            bleExtRxLen: 0
        },
        bleExtChanging: true,
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
    $scope.sendBLEExtDHQueue = [];
    $scope.qrcode = '';
    $scope.blews_addr = '';
    $scope.matterDev;
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
            dataFactory.loadZMatterApiData(true),
            dataFactory.runZMatterCmd('controller.SetSetupCode("' + $routeParams.code + '")')
        ];
        // Loading device by ID
        if ($routeParams.id) {
            promises[0] = dataFactory.getApi('matter_devices', '?lang=' + $scope.lang + '&id=' + $routeParams.id);
        }

        $q.allSettled(promises).then(function (response) {
            var deviceId = response[0];
            var MatterAPIData = response[1];
            var SetSetupCode = response[2];
            // Error message
            if (MatterAPIData.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            if (SetSetupCode.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('matter_invalid_commissioning_content')});
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
        refresh();
        $scope.interval.api = $interval(refresh, $scope.cfg.interval);
    };

    /**
     * Run matter command
     */
    $scope.runMatterCmd = function (cmd) {
        dataFactory.runZMatterCmd(cmd).then(function () {});
    };
    
    /**
     * Set inclusion with external BLE
     * state=true Set as external, false Set as connected adapter.
     * ws=true Use Websocket, false Use DataHolders
     * @param {bool} state
     * @param {bool} ws
     */
    $scope.setBLEWSExt = function (state, ws) {
        var cmd;
        if (!state) {
            cmd = "controller.data.bleExt.enabled=false";
        } else if (ws) {
            cmd = "controller.data.bleExt.enabled=true;controller.data.bleExt.ws=true";
        } else {
            cmd = "controller.data.bleExt.enabled=true;controller.data.bleExt.ws=false";
        }
        $scope.matterInclusion.bleExtChanging = true;
        $scope.runMatterCmd(cmd);
        $scope.refreshZMatterApiData();
    };
    // set initial value
    if ($scope.matterInclusion.controller.bleExtDHSupported)
    {
        $scope.setBLEWSExt(true, false);
    } else {
        $scope.setBLEWSExt(false);
    }
    
    /**
     * Start/Stop Process
     */
    $scope.startStopProcess = function (type, process) {
        var cmd = '',
            scope = '',
            msg = '';

        switch(type) {
            case 'inclusion':
                cmd = process ? 'controller.AddNodeToNetwork(true)' : 'controller.AddNodeToNetwork(false)';
                scope = 'inclusionProcess';
                msg = $scope._t('error_inclusion_time');
                
                if ($scope.matterInclusion.controller.bleExtEnabled && !$scope.matterInclusion.controller.bleExtWS && process) $scope.bleExtDHInit();
                
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
     * Run matter command for the queue
     */
    $scope.sendQueuedMatterCmd = function () {
        if ($scope.sendBLEExtDHQueue.length && $scope.sendBLEExtDHQueue[0] != null) {
            let cmd = $scope.sendBLEExtDHQueue.shift();
            $scope.sendBLEExtDHQueue.unshift(null); // block the queue
            dataFactory.runZMatterCmd(cmd).then(function () {
                $scope.sendBLEExtDHQueue.shift(); // unblock the queue
                $scope.sendQueuedMatterCmd();
            });
        }
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
        $scope.matterInclusion.controller.bleExtEnabled = MatterAPIData.controller.data.bleExt.enabled.value;
        $scope.matterInclusion.controller.bleExtWS = MatterAPIData.controller.data.bleExt.ws.value;
        $scope.matterInclusion.controller.bleExtPort = MatterAPIData.controller.data.bleExt.port.value;
        $scope.matterInclusion.controller.commissioningStep = MatterAPIData.controller.data.commissioningStep.value || "";
        $scope.matterInclusion.bleExtChanging = false;

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
            if ($scope.matterInclusion.controller.controllerState == 1) {
                // Inclusion started, show the QR code if needed
                if ($scope.matterInclusion.controller.bleExtEnabled) {
                    $scope.blews_addr = $scope.cfg.matter_blews_url + location.hostname + ":" + $scope.matterInclusion.controller.bleExtPort;
                    QRCode.toDataURL($scope.blews_addr, function(err, url) { $scope.qrcode = url; });
                }
            } else if ($scope.matterInclusion.controller.controllerState == 0) {
                $scope.matterInclusion.inclusionProcess.process = false;
            }
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
        if ('controller.data.commissioningStep' in data) {
            $scope.matterInclusion.controller.commissioningStep = data['controller.data.commissioningStep'].value || "";
        }
        // BLE Ext
        if ('controller.data.bleExt.enabled' in data) {
            $scope.matterInclusion.controller.bleExtEnabled = data['controller.data.bleExt.enabled'].value;
            $scope.matterInclusion.bleExtChanging = false;
        }
        if ('controller.data.bleExt.ws' in data) {
            $scope.matterInclusion.controller.bleExtWS = data['controller.data.bleExt.ws'].value;
            $scope.matterInclusion.bleExtChanging = false;
        }
        if ('controller.data.bleExt.rx' in data) {
            let rx = data['controller.data.bleExt.rx'].value;
            
            if (rx == null) {
                $scope.matterInclusion.controller.bleExtRxLen = 0;
                return;
            }
            
            if ($scope.matterInclusion.controller.bleExtRxLen >= rx.length) {
                // buffer restarted
                data = rx;
            } else {
                // buffer was appended, take new part only
                data = rx.slice($scope.matterInclusion.controller.bleExtRxLen);
            }
            $scope.matterInclusion.controller.bleExtRxLen = rx.length
            
            bleExtDHOnMessage(data);
        }
    };

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
    
    // BLE Ext DH
    
    // Logging
    
    function blewsLog() {
        let line = Array.prototype.slice.call(arguments).map(function(argument) {
            return typeof argument === "string" ? argument : JSON.stringify(argument);
        }).join(" ");
    }
    
    // Matter BLE Class
    
    class ZMatterDevice {
        constructor(onHandlerRx, onHandlerStatus) {
            this.device = null;
            this.serviceUUID = "0000fff6-0000-1000-8000-00805f9b34fb";
            this.txCharUUID = "18ee2ef5-263d-4559-959f-4f9c429f9d11";
            this.rxCharUUID = "18ee2ef5-263d-4559-959f-4f9c429f9d12";
            this.customRx = onHandlerRx;
            this.customStatus = onHandlerStatus;
            this.onDisconnected = this.onDisconnected.bind(this);
            this.onRxNotification = this.onRxNotification.bind(this);
        }
        
        request() {
            let options = {
                "acceptAllDevices":true,
                "optionalServices": [this.serviceUUID]
                };
            
            return navigator.bluetooth.requestDevice(options)
            .then(device => {
                this.device = device;
                this.device.addEventListener("gattserverdisconnected", this.onDisconnected);
            })
            .catch((error) => {
                blewsLog("Error selecting device: " + error);
                $scope.startStopProcess('inclusion', false);
            });
        }
    
        connect() {
            if (!this.device) {
                return Promise.reject("Device is not connected.");
            }
            return this.device.gatt.connect()
            .then(server => {
                blewsLog("Getting GAP Service...");
                return server.getPrimaryService(this.serviceUUID);
            }).then(service => {
                blewsLog("Getting GAP Characteristics...");
                return service.getCharacteristics();
            }).then(characteristics => {
                 let queue = Promise.resolve();
                 characteristics.forEach(characteristic => {
                    blewsLog("> Characteristic UUID: " + characteristic.uuid);
                    if(characteristic.uuid == this.txCharUUID){
                        this.txChr = characteristic;
                    } else if(characteristic.uuid == this.rxCharUUID){
                        this.rxChr = characteristic;
                    }
            });
            if (this.customStatus)
                this.customStatus(this, "connect", this.isValidConnectedDevice());
                return queue;
            }) .catch(error => {
                blewsLog("Argh! " + error);
            });
        }
        
        getDeviceName() {
            return this.device.name;
        }
        
        isValidConnectedDevice() {
            return this.device && this.txChr && this.rxChr;
        }
        
        subscribe(on) {
            if (!this.device) {
                return Promise.reject("Device is not connected.");
            }
            
            if (!this.rxChr) {
                return Promise.reject("No RxChr found.");
            }
            
            if (on) {
                return this.rxChr.startNotifications().then(_ => {
                    blewsLog("> Notifications started");
                    if (this.customStatus) {
                        this.customStatus(this, "subscribe", true);
                    }
                    this.rxChr.addEventListener("characteristicvaluechanged", this.onRxNotification);
                });
            } else {
                return this.rxChr.stopNotifications().then(_ => {
                    blewsLog("> Notifications stopped");
                    if(this.customStatus) {
                        this.customStatus(this, "unsubscribe", true);
                    }
                    this.rxChr.removeEventListener("characteristicvaluechanged", this.onRxNotification);
                });
            }
        }
        
        writeTx(data) {
            if (!this.device) {
                return Promise.reject("Device is not connected.");
            }
            if (!this.rxChr) {
                return Promise.reject("No TxChr found.");
            }
            var res = this.txChr.writeValue(data).then(_ => {
                if(this.customStatus) {
                    this.customStatus(this, "write", res);
                } 
            });
            return res;
        }
    
        disconnect() {
            if (!this.device) {
                return Promise.reject("Device is not connected.");
            }
            return this.subscribe(false).then(_=>{
                return this.device.gatt.disconnect()
            });
        }
        
        onRxNotification(event){
            let value = event.target.value;
            let a = [];
            let arr_data = [];
            
            // Convert raw data bytes to hex values just for the sake of showing something.
            // In the real world, you would use data.getUint8, data.getUint16 or even
            // TextDecoder to process raw data bytes.
            for (let i = 0; i < value.byteLength; i++) {
                a.push("0x" + ("00" + value.getUint8(i).toString(16)).slice(-2));
                arr_data.push(value.getUint8(i));
            }
            blewsLog("RX Notify: " + a.join(" "));
            if (this.customRx) {
                this.customRx(this, arr_data);
            }
        }
        
        onDisconnected() {
            blewsLog("Device is disconnected.");
            if (this.customStatus) {
                this.customStatus(this, "disconnect", true);
            }
        }
    }

    let BLEExtDHCommands = {    
        "unknown": {
            "type": 0,
            "iparam": "on"
        },
        "connection": {
            "type": 1,
            "str_params_0": "name",
            "str_params_1": "addr"
        },
        "rx": {
            "type": 2,
            "data": "data"
        },
        "tx": {
            "type": 3
        },
        "subscribe": {
            "type": 4
        },
        "rx_ack": {
            "type": 5
        },
        "tx_ack": {
            "type": 6,
            "iparam": "status"
        },
        "subscribe_ack": {
            "type": 7,
            "iparam": "on"
        },
        "terminate": {
            "type": 8,
            "iparam": "reason"
        }
    };
    
    function sendBLEExtDHCommand(cmd) {
        let cmdData = [];
        let len = 0;
        let seq = 0;
        let data = [];
        
        let cmdType = BLEExtDHCommands[cmd.type];
        let type = cmdType.type;
        
        if (cmdType.iparam) {
            let param = cmd[cmdType.iparam];
            data = [(param >> 24) & 0xff, (param >> 16) & 0xff, (param >> 8) & 0xff, (param >> 0) & 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            len = 4;
        } else if (cmdType.data) {
            data = cmd[cmdType.data];
            len = data.length;
        } else if (cmdType.str_params_0 && cmdType.str_params_1) {
            data = cmd[cmdType.str_params_0].split('').map(c => c.charCodeAt(0));
            data.push(0); // string null termination
            len = data.length;
        } else {
            console.log("Unhandled command ", JSON.stringify(cmd));
        }
        
        cmdData = cmdData.concat([(type >> 8) & 0xff, (type >> 0) & 0xff, (len >> 8) & 0xff, (len >> 0) & 0xff, (seq >> 24) & 0xff, (seq >> 16) & 0xff, (seq >> 8) & 0xff, (seq >> 0) & 0xff]);
        cmdData = cmdData.concat(data);
        
        $scope.sendBLEExtDHQueue.push("controller.data.bleExt.tx=" + JSON.stringify(cmdData));
        $scope.sendQueuedMatterCmd();
    };
    
    function BLEStatusHandler(ble_dev, name, result) {
        if (!result) return;
        
        let js_cmd;
        switch(name) {
            case "connect":
                js_cmd = {
                    "type": "connection",
                    "addr":"",
                    "name": ble_dev.getDeviceName()
                };
                break;
                
            case "write":
                js_cmd = {
                    "type":"tx_ack",
                    "status": 0
                };
                break;
                
            case "subscribe":
                js_cmd = {
                    "type":"subscribe_ack",
                    "on": 1
                };
                break;

            case "unsubscribe":
                js_cmd = {
                    "type":"subscribe_ack",
                    "on": 0
                };
                break;
            
            case "disconnect":
                js_cmd = {
                    "type":"terminate",
                    "reason": 1
                };
                break;
        }
        
        sendBLEExtDHCommand(js_cmd);
    };
    
    function BLERxHandler(ble_dev, value) {
        let js_cmd = {
            "type":"rx",
            "data": value
        
        };
        blewsLog("Sending WS cmd:" + JSON.stringify(js_cmd))
        sendBLEExtDHCommand(js_cmd);
    }
    
    $scope.bleExtDHInit = function() {
        $scope.matterDev = new ZMatterDevice(BLERxHandler, BLEStatusHandler);
        $scope.matterDev.request()
            .then(_ => $scope.matterDev.connect())
            .catch(error => { blewsLog(error) });
    };
    
    function bleExtDHUnpack(data, len)
    {
        // handle the next packet recursively
        data = data.slice(8 + len);
        if (data.length > 0)
        {
            if (data.length < 8) {
                blewsLog("ERROR handling remaining part of the packet ", data);
                return;
            }
            bleExtDHOnMessage(data);
        }
    };
    
    function bleExtDHOnMessage(data) {
        let type = (data[0] << 8) + data[1];
        let len = (data[2] << 8) + data[3];
        let seq = (data[4] << 24) + (data[5] << 16) + (data[6] << 8) + data[7]; 
        let typeName = Object.keys(BLEExtDHCommands).filter(k => BLEExtDHCommands[k].type == type)[0];
        switch (typeName) {
            case "tx":
                $scope.matterDev.writeTx(new Uint8Array(data.slice(8, 8 + len))).then(_=>bleExtDHUnpack(data, len));
                break;
            case "subscribe":
                len = 4*4; // iparam[4]
                $scope.matterDev.subscribe((data[8] << 24) + (data[9] << 16) + (data[10] << 8) + data[11]).then(_=>bleExtDHUnpack(data, len));
                break;
            case "terminate":
                len = 4*4; // iparam[4]
                $scope.matterDev.disconnect();
                break;
            case "rx_ack":
                // nothing to do
                len = 4*4; // iparam[4]
                bleExtDHUnpack(data, len);
                break;
            default:
                blewsLog("Unhandled command type " + type + " " + typeName);
                return;
        }
    }
});
