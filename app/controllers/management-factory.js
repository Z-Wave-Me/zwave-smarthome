/**
 * @overview The controller that resets the system to factory default.
 * @author Martin Vach
 */

/**
 * The controller that resets the system to factory default.
 * @class ManagementFactoryController
 */
myAppController.controller('ManagementFactoryController', function ($scope, $window, $cookies, $cookieStore, dataFactory, dataService) {
    $scope.factoryDefault = {
        model: {
            overwriteBackupCfg: true,
            resetZway: true,
            useDefaultConfig: 'ttyAMA0'
        }


    };
    /**
     * Reset to factory default
     */
    $scope.resetFactoryDefault = function (message) {
//        var params = '?useDefaultConfig=' + $scope.factoryDefault.model.overwriteBackupCfg
//                + '&resetZway=' + $scope.factoryDefault.model.resetZway
//                + '&useDefaultConfig=' + $scope.factoryDefault.model.useDefaultConfig;
        var params = false;
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('returning_factory_default')};
            dataFactory.getApi('factory_default', params).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('factory_default_success')});
                angular.forEach($cookies, function (v, k) {
                    $cookieStore.remove(k);
                    //delete $cookies[k];
                });
                //dataService.setRememberMe(null);
                dataService.logOut();
                //$window.location.reload();
            }, function (error) {
                alertify.alertError($scope._t('factory_default_error'));
                $scope.loading = false;
            });
        });
    };

});

