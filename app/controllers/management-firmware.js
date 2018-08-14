/**
 * @overviewThe controller that handles firmware update process.
 * @author Martin Vach
 */

/**
 * The controller that handles firmware update process.
 * @class ManagementFirmwareController
 */
myAppController.controller('ManagementFirmwareController', function ($scope, $sce, $timeout, dataFactory, dataService,cfg) {
    $scope.firmwareUpdateUrl = $sce.trustAsResourceUrl('http://' + $scope.hostName + ':8084/cgi-bin/main.cgi');
    $scope.firmwareUpdate = {
        show: false,
        loaded: false,
        url: $sce.trustAsResourceUrl('http://' + $scope.hostName + ':8084/cgi-bin/main.cgi')
    };
     $scope.databaseUpdate = {
        updating_vendors: false,
        updating_devices: false
    };
    $scope.databaseProcess = false; 
    /**
     * Set access
     */
    $scope.setAccess = function (param, loader) {
        if (loader) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        }
        dataFactory.getApi('firmwareupdate', param, true).then(function (response) {
            if (loader) {
                $scope.firmwareUpdate.show = true;
                $timeout(function () {
                    $scope.loading = false;
                    $scope.firmwareUpdate.loaded = true;
                }, 5000);
            }

        }, function (error) {
            $scope.loading = false;
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});

        });
    };
    /**
     * Load latest version
     */
    $scope.loadRazLatest = function () {
        dataFactory.getRemoteData($scope.cfg.raz_latest_version_url).then(function (response) {
            $scope.controllerInfo.softwareLatestVersion = response;
        }, function (error) {
        });
    };
    //$scope.loadRazLatest();

    $scope.updateDatabases = function () {
        $scope.databaseUpdate.updating_vendors = false;
        $scope.databaseUpdate.updating_devices = false;
        $scope.databaseProcess = true;
        $scope.updateVendorDatabase();
    };

    /**
     * update device database
     */
    $scope.updateVendorDatabase = function () {
        $scope.databaseUpdate.updating_vendors = 'fa-spinner fa-spin';
        dataFactory.getApi('update_zwave_vendors').then(function (response) {
            res = response.data;
            if (res && res.code === 200) {
                $scope.databaseUpdate.updating_vendors = 'fa-check text-success';
            } else {
                $scope.databaseUpdate.updating_vendors = 'fa-ban text-danger';
                 alertify.alertError($scope._t('vendors_error_load_data'));
            }
        }, function (error) {
            $scope.databaseUpdate.updating_vendors = 'fa-ban text-danger';
             alertify.alertError($scope._t('vendors_error_load_data'));
        }).finally(function () { // Always execute this on both error and success
             $scope.updateDeviceDatabase();
        });
    };
    /**
     * update device database
     */
    $scope.updateDeviceDatabase = function () {
        
        $scope.databaseUpdate.updating_devices = 'fa-spinner fa-spin';
        dataFactory.getApi('update_device_database').then(function (response) {
             res = response.data;
            if (res && res.code === 200) {
                 $scope.databaseUpdate.updating_devices = 'fa-check text-success';
            } else {
                $scope.databaseUpdate.updating_devices = 'fa-ban text-danger';// error update device database
                 alertify.alertError($scope._t('update_device_database_failed'));
            }
        }, function (response) {
             $scope.databaseUpdate.updating_devices = 'fa-ban text-danger';// error update device database
              alertify.alertError($scope._t('update_device_database_failed'));
        }).finally(function () { // Always execute this on both error and success
             $scope.databaseProcess = false;
             
        });
    };

});

