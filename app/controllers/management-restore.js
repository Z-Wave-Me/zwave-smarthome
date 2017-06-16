/**
 * @overview The controller that handles restore process.
 * @author Martin Vach
 */


/**
 * The controller that handles restore process.
 * @class ManagementRestoreController
 */
myAppController.controller('ManagementRestoreController', function ($scope, $window, $timeout, dataFactory, dataService) {
    $scope.myFile = null;
    $scope.managementRestore = {
        confirm: false,
        alert: {message: false, status: 'is-hidden', icon: false},
        process: false
    };

    /**
     * Upload backup file
     */
    $scope.uploadFile = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('restore_wait')};
        $scope.managementRestore.alert = {message: $scope._t('restore_wait'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        var cmd = $scope.cfg.api['restore'];
        var fd = new FormData();

        fd.append('backupFile', $scope.myFile);
        //fd.append('backupFile', files[0]);
        dataFactory.uploadApiFile(cmd, fd).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('restore_done_reload_ui')});
            $scope.managementRestore.alert = {message: $scope._t('restore_done_reload_ui'), status: 'alert-success', icon: 'fa-check'};
            $timeout(function () {
                alertify.dismissAll();
                $window.location.reload();
            }, 2000);
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('restore_backup_failed'));
            $scope.managementRestore.alert = false;
        });

    };
});