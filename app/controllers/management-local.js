/**
 * @overview  The controller that renders and handles local access.
 * @author Martin Vach
 */
/**
 * The controller that renders and handles local access.
 * @class ManagementLocalController
 */
myAppController.controller('ManagementLocalController', function ($scope, dataFactory, dataService) {


    /**
     * Update instance
     */
    $scope.updateInstance = function (input) {
        //var input = $scope.handleTimezone.instance;
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                alertify.confirm($scope._t('timezone_alert'))
                    .setting('labels', {'ok': $scope._t('yes'),'cancel': $scope._t('lb_cancel')})
                    .set('onok', function (closeEvent) {//after clicking OK
                        $scope.systemReboot();
                    });

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        }
    };

    /**
     * System rebboot
     */
    $scope.systemReboot = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('system_rebooting')};
        dataFactory.getApi('system_reboot').then(function (response) {
        }, function (error) {
            alertify.alertError($scope._t('error_system_reboot'));
        });

    };
});
