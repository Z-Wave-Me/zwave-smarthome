/**
 * Application Zwave inclusion controller
 * @author Martin Vach
 */
/**
 * Zwave include controller
 */
myAppController.controller('ZwaveInclusionController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    $scope.zwaveInclusion = {
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
        includedDevice: {
            nodeId: 0,
            security: false,
            securityInterview: false
        },
        preparation: {
            process: false,
            done: false
        },
        inclusionProcess: {
            process: false,
            ready: false,
            lastIncluded: 0,
            done: false
        },
        automatedConfiguration: {
            process: false,
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
    $scope.startStopExclusion = function (cmd, status) {
        $scope.zwaveInclusion.preparation.process = status;
        $scope.zwaveInclusion.preparation.done = false;
        $scope.runZwaveCmd(cmd);
        if(status){
          $scope.refreshZwaveApiData();
          $timeout(function () {
              if($scope.zwaveInclusion.preparation.process && !$scope.zwaveInclusion.preparation.done){
                  $scope.runZwaveCmd('controller.RemoveNodeFromNetwork(0)');
                   $scope.zwaveInclusion.preparation.process = false;
                   $scope.zwaveInclusion.preparation.done = false;
                   $interval.cancel($scope.interval.api);
                    alertify.dismissAll();
                    alertify.alertWarning($scope._t('Text if EXCLUSION takes a long time (20 - 30 seconds?) and nothing happens'));
              }
                 
            }, 3000);
        }else{
            $interval.cancel($scope.interval.api);
        }
        
    };
    
    /**
     * Start/Stop Inclusion
     */
    $scope.startStopInclusion = function (cmd, status) {
        $scope.zwaveInclusion.inclusionProcess.done = false;
        $scope.zwaveInclusion.inclusionProcess.process = status;
        $scope.zwaveInclusion.inclusionProcess.ready = status;
        $scope.runZwaveCmd(cmd);
        if(status){
          $scope.refreshZwaveApiData();
          /*$timeout(function () {
              if($scope.zwaveInclusion.inclusionProcess.process && !$scope.zwaveInclusion.inclusionProcess.done){
                  $scope.runZwaveCmd('controller.AddNodeToNetwork(0)');
                   $scope.zwaveInclusion.inclusionProcess.process = false;
                   $scope.zwaveInclusion.inclusionProcess.done = false;
                   $interval.cancel($scope.interval.api);
                    alertify.dismissAll();
                    alertify.alertWarning($scope._t('Text if INCLUSION PROCESS takes a long time (20 - 30 seconds?) and nothing happens'));
              }
                 
            }, 3000);*/
        }else{
            $interval.cancel($scope.interval.api);
        }
        
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
                dataService.showNotifier({message: $scope._t('lb_device_excluded')});
                $scope.zwaveInclusion.preparation.process = false;
                $scope.zwaveInclusion.preparation.done = true;
                $interval.cancel($scope.interval.api);
            }
            console.log('lastExcludedDevice: ', $scope.zwaveInclusion.controller.lastExcludedDevice);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
             console.log('lastIncludedDevice: ', deviceIncId);
//            if (deviceIncId != null) {
//                var givenName = 'Device_' + deviceIncId;
//                var cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
//                dataFactory.runZwaveCmd(cmd).then(function() {
//                    $scope.includedDeviceId = deviceIncId;
//                    $scope.deviceFound = true;
//                    //getLastIncluded(deviceIncId,ZWaveAPIData);
//                }, function(error) {
//                    dataService.showConnectionError(error);
//                });
//
//            }
        }
        if ('controller.data.secureInclusion' in data) {
            $scope.zwaveInclusion.controller.secureInclusion = data['controller.data.secureInclusion'].value;
            console.log('secureInclusion: ', $scope.zwaveInclusion.controller.secureInclusion);
        }
    }
    ;




});
