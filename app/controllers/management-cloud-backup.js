/**
 * @overview  The controller that handles a backup to the cloud.
 * @author Martin Vach
 */


/**
 * The controller that handles a backup to the cloud.
 * @class ManagementCloudBackupController
 */
myAppController.controller('ManagementCloudBackupController', function ($scope, $timeout, $q, cfg, $window, dataFactory, dataService) {
    $scope.managementCloud = {
        alert: {message: false, status: 'is-hidden', icon: false},
        show: false,
        module:[],
        instance: {},
        process: false,
        email: "",
        service_status: ""
    };
    /**
     * Load all promises
     */
    $scope.allCloudSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('instances', '/CloudBackup', true),
            dataFactory.getApi('modules', '/CloudBackup')
        ];

        $q.allSettled(promises).then(function (response) {
            $scope.loading = false;

            var instance = response[0],
                module = response[1],
                message = "";

            if($scope.user.email === '') {
                $scope.managementCloud.alert = {message: $scope._t('email_not_set'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            } else {
                $scope.managementCloud.email = $scope.user.email;
            }

            // Error message
            if (instance.state === 'rejected') {
                return;
            }

            if (module.state === 'rejected') {
                return;
            }

            // Success - api data
            if (instance.state === 'fulfilled') {
                if (!instance.value.data.data[0].active) {
                    $scope.managementCloud.alert = {message: $scope._t('cloud_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                } else {
                    $scope.managementCloud.alert = false;
                }

                $scope.managementCloud.instance = instance.value.data.data[0];

                if(!$scope.managementCloud.instance.params.service_status) {
                    $scope.managementCloud.alert = {message: $scope._t('service_not_available', {__service__: "CloudBackup"}), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                } else {
                    $scope.managementCloud.alert = false;
                }
                $scope.managementCloud.show = true;
            }

            // Success - module
            if (module.state === 'fulfilled') {
                // Module
                $scope.managementCloud.module = module.value.data.data;
            }
        });
    };
    $scope.allCloudSettled();

    /**
     * Set scheduler type
     */
    $scope.setSchedulerType = function (type) {
        $scope.managementCloud.instance.params.scheduler = type;
    };


    /**
     * Start backup and get backup.file
     */
    $scope.downLoadBackup = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var old = cfg.pending_remote_limit;
        var timeout  = 600000; // max 10 min
        cfg.pending_remote_limit = timeout;

        dataFactory.getRemoteData(cfg.server_url + cfg.api.backup).then(function(response) {
            $scope.loading = false;
            var headers = response.headers(),
                filenameRegex = /.*filename=([\'\"]?)([^\"]+)\1/,
                matches = filenameRegex.exec(headers['content-disposition']),
                file = new Blob([JSON.stringify(response.data)], {type: 'application/json'}),
                fileURL = URL.createObjectURL(file),
                a = document.createElement('a');

            a.href = fileURL;
            a.target = '_blank';
            a.download = matches[2];
            document.body.appendChild(a);
            cfg.pending_remote_limit = old;
            a.click();
        }, function(error) {
            alertify.alertError($scope._t('error_backup'));
            $scope.loading = false;
            cfg.pending_remote_limit = old;
        });
    };

    /**
     * Start cloud backup
     */
    $scope.manualCloudBackup = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('cloudbackup').then(function(response) {
            dataService.showNotifier({message: $scope._t('success_backup')});
            $scope.loading = false;
        }, function(error) {
            dataService.showNotifier({message: $scope._t('error_backup'), type: 'error'});
            $scope.loading = false;
        });
    };

    /**
     * Activate cloud backup
     */
    $scope.activateCloudBackup = function (input, activeStatus) {

        if(_.isEmpty(input)) {
            $scope.createInstance();
        } else {
            input.active = activeStatus;
            input.params.email = $scope.managementCloud.email;
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            if (input.id) {
                dataFactory.putApi('instances', input.id, input).then(function (response) {
                    dataService.showNotifier({message: $scope._t('success_updated')});
                    $scope.loading = false;
                    $scope.allCloudSettled();
                }, function (error) {
                    alertify.alertError($scope._t('error_update_data'));
                    alertify.dismissAll();
                    $scope.loading = false;
                });
            }
        }
    };

    /**
     * Update instance
     */
    $scope.updateInstance = function (form, input) {
        if (form.$invalid) {
            return;
        }
        input.params.email = $scope.managementCloud.email;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                dataService.showNotifier({message: $scope._t('success_updated')});
                $scope.loading = false;
                $scope.allCloudSettled();
            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                alertify.dismissAll();
                $scope.loading = false;
            });
        }
    };

    /**
     * Create instance
     */
    $scope.createInstance = function() {
        var inputData = {
            "instanceId":"0",
            "moduleId":"CloudBackup",
            "active":"true",
            "title":"CloudBackup",
            "params":{
                "email": $scope.managementCloud.email
            }
        };

        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postApi('instances', inputData).then(function (response) {
            $scope.loading = false
            dataService.showNotifier({message: $scope._t('reloading_page')});
            $window.location.reload();
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            alertify.dismissAll();
            $scope.loading = false;
        });
    }
});

