/**
 * @overview Handles Reset/Remove proccess of elemnts.
 * @author Martin Vach
 */

/**
 * The controller that handles Reset/Remove proccess of elemnts.
 * @class ZwaveExcludeController
 */
myAppController.controller('ZwaveExcludeController', function ($scope, $location, $routeParams, $interval, $timeout, $window, $q, dataFactory, dataService, myCache, cfg,_) {
    $scope.zWaveDevice = {
        controllerState: 0,
        lastExcludedDevice: 0,
        id: null,
        name: null,
        apiDataInterval: null,
        devices: [],
        isFailed: false
        /* removeNode: false,
         removeNodeProcess: false,
         find: {}*/
    };

    $scope.zWaveExclude = {
        resetRemove: {
            process: false,
            alert: false
        },
        remove: {
            process: false,
            alert: false,
            devicesCnt: 0,
            done: 0,
            progress:0
        }

    }
    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.zWaveDevice.apiDataInterval);
        $scope.zWaveDevice.removeNode = false;
        $scope.runZwaveCmd('controller.RemoveNodeFromNetwork(0)');
    });

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('devices'),
            dataFactory.loadZwaveApiData()
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var ZWaveAPIData = response[1];

            $scope.loading = false;
            // Error message
            if (ZWaveAPIData.state === 'rejected') {
              angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                _.filter(devices.value.data.data.devices, function (v) {
                    var findZwaveStr = v.id.split('_');
                    if ((findZwaveStr[0] !== 'ZWayVDev' && findZwaveStr[1] !== 'zway') || v.deviceType === 'battery') {
                        return;
                    }
                    var cmd = findZwaveStr[findZwaveStr.length - 1].split('-');
                    var nodeId = cmd[0];
                    if ($routeParams.id == nodeId) {
                        var obj = {
                            id: v.id,
                            name: v.metrics.title
                        };
                        $scope.zWaveDevice.devices.push(obj);
                        $scope.zWaveExclude.remove.devicesCnt += 1;
                    }


                });
            }
            // Success - ZWaveAPIData
            if (ZWaveAPIData.state === 'fulfilled') {
                var node = ZWaveAPIData.value.devices[$routeParams.id];
                if (!node) {
                    alertify.alertWarning($scope._t('no_data'));
                    return;
                }
                $scope.zWaveDevice.controllerState = ZWaveAPIData.value.controller.data.controllerState.value;
                $scope.zWaveDevice.id = $routeParams.id;
                $scope.zWaveDevice.name = node.data.givenName.value || 'Device ' + '_' + $routeParams.id;
                $scope.zWaveDevice.isFailed = node.data.isFailed.value;
            }

        });
    };
    $scope.allSettled();
    /**
     *  Refresh z-wave devices
     */
    $scope.refreshZwaveApiData = function () {
        var refresh = function () {
            dataFactory.refreshZwaveApiData().then(function (response) {
                if (!response) {
                    return;
                }
                if ('controller.data.controllerState' in response.data) {
                    $scope.zWaveDevice.controllerState = response.data['controller.data.controllerState'].value;
                    console.log('controllerState: ', $scope.zWaveDevice.controllerState);
                }

                if ('controller.data.lastExcludedDevice' in response.data) {
                    $scope.zWaveDevice.lastExcludedDevice = response.data['controller.data.lastExcludedDevice'].value;
                    console.log('lastExcludedDevice: ', $scope.zWaveDevice.lastExcludedDevice);
                    if ($scope.zWaveDevice.lastExcludedDevice == $scope.zWaveDevice.id) {
                        $scope.zWaveExclude.resetRemove.process = false;
                        dataService.showNotifier({message: $scope._t('reloading_page')});
                        myCache.removeAll();
                        $timeout(function () {
                            $window.location.href = '#/zwave/devices';
                            $window.location.reload();
                        }, 3000);

                    }
                }
            });
        };
        $scope.zWaveDevice.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };
    $scope.refreshZwaveApiData();

    /**
     * Reset and remove device
     */
    $scope.resetRemoveDevice = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
            $scope.zWaveExclude.resetRemove.alert = {
                message: $scope._t('confirm_exclusion'),
                status: 'alert-warning',
                icon: 'fa-spinner fa-spin'
            };
            $scope.zWaveExclude.resetRemove.process = true
        }, function (error) {
            $scope.loading = false;
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        });

    };


    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
        });

    };

    /**
     * Remove device
     */
    $scope.removeDevice = function () {
        $scope.runZwaveCmd('devices[' + $scope.zWaveDevice.id + '].RemoveFailedNode()');
        myCache.removeAll();
        $timeout(function () {
          $window.location.href = '#/zwave/devices';
            $window.location.reload();
        }, 1000);
    };
});