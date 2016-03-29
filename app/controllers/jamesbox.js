/**
 * Application jamesBox controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('JbUpdateController', function ($scope, $timeout, dataFactory, dataService, _) {
    $scope.jamesbox = {
        proccess: false
    };

    /**
     * Update firmware
     */
    $scope.updateFirmware = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.getApi('jb_update').then(function (response) {
            $timeout(function () {
                $scope.loading = false;
                dataService.showNotifier({message: 'Firmware successfully updated'});
            }, 3000);
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
    };

});