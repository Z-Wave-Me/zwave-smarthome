/**
 * Application jamesBox controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('JbUpdateController', function ($scope, $timeout, $location,cfg, dataFactory, dataService, _) {
    $scope.jamesbox = {
        proccess: false,
        success: false
    };

    /**
     * Update firmware
     */
    $scope.firmwareUpdate = function () {
        var input = {
            uuid: '6318a0d97e65da6c728daa63fe7fcea4',
            confirm_exec2: 1
        };
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postToRemote(cfg.api_remote['jamesbox_update'],input).then(function (response) {
                $scope.loading = false;
                alertify.alertWarning('The firmware will be automatically upgraded to version XXX on next restart.')
                        .set('onok', function (closeEvent) {
                            alertify.dismissAll();
                            $location.path("/dashboard");
                        });
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