/**
 * Application jamesBox controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('JbUpdateController', function ($scope, $timeout, $location, dataFactory, dataService, _) {
    $scope.jamesbox = {
        proccess: false,
        success: false
    };

    /**
     * Update firmware
     */
    $scope.firmwareUpdate = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.getApi('jb_update').then(function (response) {
            $timeout(function () {
                $scope.loading = false;
                alertify.alertWarning('The firmware will be automatically upgraded to version XXX on next restart.')
                        .set('onok', function (closeEvent) {
                            alertify.dismissAll();
                            $location.path("/dashboard");
                        });
            }, 5000);
        }, function (error) {
            alertify.alertError($scope._t('Something went wrong. Please restart this process.'));
            $scope.loading = false;
        });
    };

    /**
     * Cancel firmware update
     */
    $scope.firmwareCancel = function () {
        alertify.alertWarning('The firmware will be automatically upgraded to version XXX on next restart.')
                .set('onok', function (closeEvent) {
                    alertify.dismissAll();
                    $location.path("/login");
                });
    };

});