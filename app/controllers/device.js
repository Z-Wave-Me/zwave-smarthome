/**
 * @overview This controller handles devices submenus – Z-Wave, Camera and EnOcean.
 * @author Martin Vach
 */

/**
 * Device root controller
 * @class DeviceController
 *
 */
myAppController.controller('DeviceController', function($scope, dataFactory) {
    $scope.enocean = {
        installed: false,
        active: false,
        alert: {message: false}
    };
     /**
     * Load EnOcean module
     */
    $scope.loadEnOceanModule = function() {
        dataFactory.getApi('instances',false,true).then(function(response) {
            var module = _.findWhere(response.data.data,{moduleId:'EnOcean'});
            if(!module){
                return;
            }
            $scope.enocean.installed = true;
            if (!module.active) {
                $scope.enocean.alert = {message: $scope._t('enocean_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
            $scope.enocean.active = true;
        });
    };

    $scope.loadEnOceanModule();
});