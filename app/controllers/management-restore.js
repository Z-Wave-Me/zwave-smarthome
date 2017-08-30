/**
 * @overview The controller that handles restore process.
 * @author Martin Vach
 */


/**
 * The controller that handles restore process.
 * @class ManagementRestoreController
 */
myAppController.controller('ManagementRestoreController', function ($scope, $window, $timeout,  $route,$filter,dataFactory, dataService) {
    $scope.myFile = null;
    $scope.managementRestore = {
        fileName: false,
        overwriteNetwork: false,
        file: {},
        confirm: false,
        alert: {message: false, status: 'is-hidden', icon: false},
        process: false
    };

    /**
     * Check if file is select and with valid extension
     */
    $scope.checkSelectedFile = function (files,info) {
       if(!files[0]){
           return;
       }
        // Check allowed file formats
        if (info.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                $scope._t('upload_allowed_formats', {'__extensions__': info.extension.toString()})
            );
            return;

        }
        // Set filename
       $scope.managementRestore.fileName = files[0].name;
    }

    /**
     * Upload backup file
     */
    $scope.uploadFile = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('restore_wait')};
        $scope.managementRestore.alert = {message: $scope._t('restore_wait'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        var cmd = $scope.cfg.api['restore'];
        var fd = new FormData();

        fd.append('backupFile', $scope.myFile);
        fd.append('overwriteNetwork', $scope.managementRestore.overwriteNetwork);

        dataFactory.uploadApiFile(cmd, fd).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('restore_done_reload_ui')});
            $scope.managementRestore.alert = {message: $scope._t('restore_done_reload_ui'), status: 'alert-success', icon: 'fa-check'};
            $timeout(function () {
                alertify.dismissAll();
                $window.location.reload();
            }, 2000);
        }, function (error) {
            $route.reload();
            $scope.loading = false;
            alertify.alertError($scope._t('restore_backup_failed'));
            $scope.managementRestore.alert = false;
        });

    };
});