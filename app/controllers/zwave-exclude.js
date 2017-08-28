/**
 * @overview Handles Reset/Remove proccess of elemnts.
 * @author Martin Vach
 */

/**
 * The controller that handles Reset/Remove proccess of elemnts.
 * @class ZwaveExcludeController
 */
myAppController.controller('ZwaveExcludeController', function ($scope, $location, $routeParams, $interval, $timeout, $window,dataFactory, dataService,myCache, _) {
    $scope.zWaveDevice = {
        controllerState: 0,
        lastExcludedDevice: 0,
        id: null,
        name: null,
        apiDataInterval: null,
        removeNode: false,
        removeNodeProcess: false,
        find: {}
    };

    $scope.zWaveExclude = {
        resetRemove: {
            process: false,
            alert: false
        },
        remove: {
            process: false,
            alert: false
        }

    }
    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.zWaveDevice.apiDataInterval);
        $scope.zWaveDevice.removeNode = false;
        $scope.runZwaveCmd('controller.RemoveNodeFromNetwork(0)');
    });
    /**
     * Load z-wave devices
     */
    $scope.loadZwaveApiData = function () {
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            if(!ZWaveAPIData){
                return;
            }
            var node = ZWaveAPIData.devices[$routeParams.id];
            if (!node) {
                alertify.alertWarning($scope._t('no_data'));
                return;
            }
            $scope.zWaveDevice.controllerState = ZWaveAPIData.controller.data.controllerState.value;
            $scope.zWaveDevice.id = $routeParams.id;
            $scope.zWaveDevice.name = node.data.givenName.value || 'Device ' + '_' + $routeParams.id;
            return;

        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadZwaveApiData();

    /**
     *  Refresh z-wave devices
     */
    $scope.refreshZwaveApiData = function () {
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            if(!ZWaveAPIData){
                return;
            }
            var refresh = function () {
                dataFactory.refreshZwaveApiData().then(function (response) {
                    if(!response){
                        return;
                    }
                    //var data = response.data;
                    if ('controller.data.controllerState' in response.data) {
                        $scope.zWaveDevice.controllerState = response.data['controller.data.controllerState'].value;
                        console.log('controllerState: ', $scope.zWaveDevice.controllerState);
                       /* if($scope.zWaveDevice.controllerState == 5){
                            $scope.zWaveExclude.resetRemove.alert = {
                                message: $scope._t('confirm_exclusion'),
                                status: 'alert-warning',
                                icon: 'fa-spinner fa-spin'
                            };
                        }*/
                    }

                    if ('controller.data.lastExcludedDevice' in response.data) {
                        $scope.zWaveDevice.lastExcludedDevice = response.data['controller.data.lastExcludedDevice'].value;
                        console.log('lastExcludedDevice: ', $scope.zWaveDevice.lastExcludedDevice);
                        if($scope.zWaveDevice.lastExcludedDevice == $scope.zWaveDevice.id){
                            $scope.zWaveExclude.resetRemove.process = false;
                            dataService.showNotifier({message: $scope._t('reloading_page')});
                           /* $scope.zWaveExclude.resetRemove.alert = {
                                message: $scope._t('lb_device_excluded') + ' ' +  $scope._t('reloading_page'),
                                status: 'alert-success',
                                icon: 'fa-spinner fa-spin'
                            };*/
                           myCache.removeAll();
                            console.log('redirecting to: #/zwave/devices');
                            $timeout(function() {
                                $window.location.href = '#/zwave/devices';
                                //$window.location.reload();
                            }, 3000);

                        }
                    }
                });
            };
            $scope.zWaveDevice.apiDataInterval = $interval(refresh, $scope.cfg.interval);
        }, function (error) {});
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
            alertify.alertError($scope._t('error_load_data'));
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
    $scope.removeDevice = function (cmd) {
        $scope.zWaveExclude.resetRemove.alert = {
            message: $scope._t('confirm_exclusion'),
            status: 'alert-warning',
            icon: 'fa-exclamation-circle'
        };
        $scope.zWaveExclude.remove.process = true

    };
});