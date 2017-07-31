/**
 * @overview The controller that renders and handles remote access data.
 * @author Martin Vach
 */

/**
 * The controller that renders and handles remote access data.
 * @class ManagementRemoteController
 */
myAppController.controller('ManagementRemoteController', function ($scope, dataFactory, dataService) {
    $scope.remoteAccess = false;
    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function () {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', '/RemoteAccess').then(function (response) {

            $scope.loading = false;
            var remoteAccess = response.data.data[0];
            if (Object.keys(remoteAccess).length < 1) {
                alertify.alertError($scope._t('error_load_data'));
            }
            if (!remoteAccess.active) {
                alertify.alertWarning($scope._t('remote_access_not_active'));
                return;
            }
            if (!remoteAccess.params.userId) {
                alertify.alertError($scope._t('error_remote_access_init'));
                return;
            }
            remoteAccess.params.pass = null;
            $scope.remoteAccess = remoteAccess;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('remote_access_not_installed'));
        });
    };

    $scope.loadRemoteAccess();

    /**
     * PUT Remote access
     */
    $scope.putRemoteAccess = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('instances', input.id, input).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
});

