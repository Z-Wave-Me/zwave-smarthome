/**
 * @overview The controller that handles a timezone for JB.
 * @author Martin Vach
 */

/**
 * The controller that handles a timezone for JB.
 * @class ManagementTimezoneJBController
 */
myAppController.controller('ManagementTimezoneJBController', function ($scope, $timeout, dataFactory, dataService) {
    $scope.managementTimezone = {
        labels: {},
        enums: {}
    };

    /**
     * Load module detail
     */
    $scope.loadModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/ZMEOpenWRT').then(function (response) {
            $scope.loading = false;
            $scope.managementTimezone.enums = response.data.data.schema.properties.timezone.enum;
            $scope.managementTimezone.labels = response.data.data.options.fields.timezone.optionLabels;

            console.log($scope.handleTimezone)
            console.log($scope.managementTimezone)
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadModule();

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
     * System reboot
     */
    $scope.systemReboot = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('system_rebooting')};
        dataFactory.getApi('system_reboot').then(function (response) {
        }, function (error) {
            alertify.alertError($scope._t('error_system_reboot'));
        });

    };

});

