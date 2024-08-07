/**
 * @overview This controller handles devices submenus – Z-Wave, Camera and EnOcean.
 * @author Martin Vach
 */

/**
 * Device root controller
 * @class DeviceController
 *
 */
myAppController.controller('DeviceController', function($scope, $location, dataFactory) {
    $scope.loading = false;

    $scope.zwave = {
        installed: false,
        active: false,
        alert: {message: false}
    };

    $scope.zigbee = {
        installed: false,
        active: false,
        alert: {message: false}
    };

    $scope.matter = {
        installed: false,
        active: false,
        alert: {message: false}
    };

    $scope.enocean = {
        installed: false,
        active: false,
        alert: {message: false}
    };

    $scope.mobileAppSupport = {
        installed: false,
        active: false,
        instanceId: null,
        instance: null,
        module: {
            "instanceId":"0",
            "moduleId":"MobileAppSupport",
            "active": true
        }
    };

    /**
     * Load ext. Peripherals modules (Z-Wave, EnOcean, Zigbee, Matter)
     */
    $scope.loadperipheralsModules = function() {
        if ($scope.user.role === 1) {
            dataFactory.getApi('instances',false,true).then(function(response) {
                var ZWave_module = _.findWhere(response.data.data,{moduleId:'ZWave', active: true});
                if (ZWave_module){
                    $scope.zwave.installed = true;
                    $scope.zwave.active = !!ZWave_module.active;
                }
                if (!$scope.zwave.installed || !$scope.zwave.active) {
                    $scope.zwave.alert = {message: $scope._t('zwave_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                }

                var Zigbee_module = _.findWhere(response.data.data,{moduleId:'Zigbee', active: true});
                if (Zigbee_module){
                    $scope.zigbee.installed = true;
                    $scope.zigbee.active = !!Zigbee_module.active;
                }
                if (!$scope.zigbee.installed || !$scope.zigbee.active) {
                    $scope.zigbee.alert = {message: $scope._t('zigbee_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                }

                var ZMatter_module = _.findWhere(response.data.data,{moduleId:'ZMatter', active: true});
                if (ZMatter_module){
                    $scope.matter.installed = true;
                    $scope.matter.active = !!ZMatter_module.active;
                }
                if (!$scope.matter.installed || !$scope.matter.active) {
                    $scope.matter.alert = {message: $scope._t('matter_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                }

                var EnOcean_module = _.findWhere(response.data.data,{moduleId:'EnOcean', active: true});
                if (EnOcean_module){
                    $scope.enocean.installed = true;
                    $scope.enocean.active = !!EnOcean_module.active;
                }
                if (!$scope.enocean.installed || !$scope.enocean.active) {
                    $scope.enocean.alert = {message: $scope._t('enocean_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                }

                var MobileAppSupport_module = _.findWhere(response.data.data,{moduleId:'MobileAppSupport', active: true});
                if (MobileAppSupport_module){
                    $scope.mobileAppSupport.instance = MobileAppSupport_module;
                    $scope.mobileAppSupport.installed = true;
                    $scope.mobileAppSupport.instanceId = MobileAppSupport_module.id;
                    $scope.mobileAppSupport.active = MobileAppSupport_module.active;
                }

            });
        } else {
            $scope.mobileAppSupport.installed = true;
            $scope.mobileAppSupport.active = true;
        }
    };

    $scope.loadperipheralsModules();

    /**
     * Create instance
     */
    $scope.createInstance = function(module, callback) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postApi('instances', module).then(function (response) {
            $scope.loading = false
            if(typeof callback === 'function') {
                callback(response.data.data.id);
            }
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            alertify.dismissAll();
            $scope.loading = false;
        });
    }

    /**
     * Update instance
     */
    $scope.updateInstance = function(input,callback) {
        if (input.id) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
            dataFactory.putApi('instances', input.id, input).then(function(response) {
                $scope.loading = false
                if(typeof callback === 'function') {
                    callback();
                }
            }, function(error) {
                $scope.loading = false
                alertify.alertError($scope._t('error_update_data'));
                alertify.dismissAll();
            });
        }
    };

    /***************** MobileAppSupport *****************/


    $scope.handleMobileModal = function($event) {
        if($scope.user.role === 1 && !$scope.mobileAppSupport.installed) {
            $scope.createInstance($scope.mobileAppSupport.module, function(instanceId) {
                $scope.mobileAppSupport.active = true;
                $scope.mobileAppSupport.installed = true;
                $scope.mobileAppSupport.instanceId = instanceId;
                $scope.handleModal('qrCodeModal', $event);
            });
        } else if($scope.user.role === 1 && $scope.mobileAppSupport.installed && !$scope.mobileAppSupport.active) {
            $scope.updateInstance($scope.mobileAppSupport.instance, function() {
                $scope.mobileAppSupport.active = true;
                $scope.handleModal('qrCodeModal', $event);
            });
        } else if($scope.mobileAppSupport.installed && $scope.mobileAppSupport.active) {
            $scope.handleModal('qrCodeModal', $event);
        }
    }

    $scope.handleManage = function() {
        if(!$scope.mobileAppSupport.installed) {
            $scope.createInstance($scope.mobileAppSupport.module, function(instanceId) {
                $scope.mobileAppSupport.active = true;
                $scope.mobileAppSupport.installed = true;
                $scope.mobileAppSupport.instanceId = instanceId;
                $location.path("module/put/" + instanceId);
            });
        } else if($scope.mobileAppSupport.installed) {
            $location.path("module/put/" + $scope.mobileAppSupport.instanceId);
        }
    }
});