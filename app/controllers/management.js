/**
 * Application Management controller
 * @author Martin Vach
 */

/**
 * Management controller
 */
myAppController.controller('ManagementController', function($scope, $window, $location, $timeout, $interval, $sce, $cookies, dataFactory, dataService, myCache) {
    //Set elements to expand/collapse
    angular.copy({
        user: false,
        remote: false,
        licence: false,
        firmware: false,
        backup: false,
        restore: false,
        info: false,
        report: false,
        appstore: false
    }, $scope.expand);

    //$scope.profiles = {};
    //$scope.remoteAccess = false;
    $scope.controllerInfo = {
        uuid: null,
        softwareRevisionVersion: null,
        softwareLatestVersion: null
    };
//    $scope.proccessLicence = false;
//    $scope.proccessVerify = {
//        'message': false,
//        'status': 'is-hidden'
//    };
//    $scope.proccessUpdate = {
//        'message': false,
//        'status': 'is-hidden'
//    };
//    $scope.inputLicence = {
//        "scratch_id": null
//    };
    $scope.restoreBck = {
        chip: '0'
    };

    $scope.zwaveDataInterval = null;
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.zwaveDataInterval);
        angular.copy({}, $scope.expand);
    });

//    $scope.firmwareUpdateUrl = $sce.trustAsResourceUrl('http://' + $scope.hostName + ':8084/cgi-bin/main.cgi');
//
//
//    /**
//     * Load razberry latest version
//     */
//    $scope.loadRazLatest = function() {
//        dataFactory.getRemoteData($scope.cfg.raz_latest_version_url).then(function(response) {
//            $scope.controllerInfo.softwareLatestVersion = response;
//        }, function(error) {
//        });
//    };
//    //$scope.loadRazLatest();

    /**
     * Load ZwaveApiData
     */
    $scope.loadZwaveApiData = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            $scope.controllerInfo.uuid = ZWaveAPIData.controller.data.uuid.value;
            $scope.controllerInfo.softwareRevisionVersion = ZWaveAPIData.controller.data.softwareRevisionVersion.value;
            //$scope.controllerUuid = ZWaveAPIData.controller.data.uuid.value;
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadZwaveApiData();

    /************************************** User management **************************************/

//    /**
//     * Load data into collection
//     */
//    $scope.loadData = function() {
//        dataService.showConnectionSpinner();
//        dataFactory.getApi('profiles').then(function(response) {
//            $scope.profiles = response.data.data;
//            dataService.updateTimeTick();
//        }, function(error) {
//            $location.path('/error/' + error.status);
//        });
//    };
    //$scope.loadData();
    /**
     * Delete an item
     */
//    $scope.delete = function(target, input, message, except) {
//        if (input.id == except) {
//            return;
//        }
//        alertify.confirm(message, function() {
//            dataFactory.deleteApi('profiles', input.id).then(function(response) {
//                $(target).fadeOut(2000);
//                myCache.remove('profiles');
//
//            }, function(error) {
//                alertify.alert($scope._t('error_delete_data'));
//            });
//        });
//    };

    /************************************** Remote access **************************************/

//    /**
//     * Load Remote access data
//     */
//    $scope.loadRemoteAccess = function() {
//        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
//            return;
//        }
//        dataFactory.getApi('instances', '/RemoteAccess').then(function(response) {
//            var remoteAccess = response.data.data[0];
//            if (Object.keys(remoteAccess).length < 1) {
//                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
//            }
//            if (!remoteAccess.active) {
//                $scope.alert = {message: $scope._t('remote_access_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
//                return;
//            }
//            if (!remoteAccess.params.userId) {
//                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
//                return;
//            }
//            remoteAccess.params.pass = null;
//            $scope.remoteAccess = remoteAccess;
//        }, function(error) {
//            $scope.alert = {message: $scope._t('remote_access_not_installed'), status: 'alert-danger', icon: 'fa-warning'};
//        });
//    };
//
//    $scope.loadRemoteAccess();
//
//    /**
//     * PUT Remote access
//     */
//    $scope.putRemoteAccess = function(input) {
//        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
//        dataFactory.putApi('instances', input.id, input).then(function(response) {
//            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
//
//        }, function(error) {
//            alertify.alert($scope._t('error_update_data'));
//            $scope.loading = false;
//        });
//
//    };

    /************************************** Licence **************************************/

//    /**
//     * Get license key
//     */
//    $scope.getLicense = function(inputLicence) {
//        // Clear messages
//        $scope.proccessVerify.message = false;
//        $scope.proccessUpdate.message = false;
//        if (!inputLicence.scratch_id) {
//            return;
//        }
//
//        $scope.proccessVerify = {'message': $scope._t('verifying_licence_key'), 'status': 'fa fa-spinner fa-spin'};
//        $scope.proccessLicence = true;
//        var input = {
//            'uuid': $scope.controllerInfo.uuid,
//            'scratch': inputLicence.scratch_id
//        };
//        dataFactory.getLicense(input).then(function(response) {
//            $scope.proccessVerify = {'message': $scope._t('success_licence_key'), 'status': 'fa fa-check text-success'};
//            // Update capabilities
//            updateCapabilities(response);
//        }, function(error) {
//            var message = $scope._t('error_no_licence_key');
//            if (error.status == 404) {
//                var message = $scope._t('error_404_licence_key');
//            }
//            $scope.proccessVerify = {'message': message, 'status': 'fa fa-exclamation-triangle text-danger'};
//            $scope.proccessLicence = false;
//
//        });
//        return;
//    };
//
//    /**
//     * Update capabilities
//     */
//    function updateCapabilities(data) {
//        $scope.proccessUpdate = {'message': $scope._t('upgrading_capabilities'), 'status': 'fa fa-spinner fa-spin'};
////        $timeout(function() {
////             $scope.proccessUpdate = {'message': $scope._t('success_capabilities'), 'status': 'fa fa-check text-success'};
////             $scope.proccessLicence = false;
////        }, 3000);
//        dataFactory.zmeCapabilities(data).then(function(response) {
//            $scope.proccessUpdate = {'message': $scope._t('success_capabilities'), 'status': 'fa fa-check text-success'};
//            $scope.proccessLicence = false;
//        }, function(error) {
//            $scope.proccessUpdate = {'message': $scope._t('error_no_capabilities'), 'status': 'fa fa-exclamation-triangle text-danger'};
//            $scope.proccessLicence = false;
//        });
//    }
//    ;

    /************************************** Backup, Restore, Factory default **************************************/
//    // Backup, restore, Factory default
//    $scope.backupRestore = {
//        activeTab: (angular.isDefined($cookies.tab_admin_backup) ? $cookies.tab_admin_backup : 'backup'),
//        restore: {
//            alert: {message: false, status: 'is-hidden', icon: false},
//            process: false
//        },
//        factory: {
//            alert: {message: false, status: 'is-hidden', icon: false},
//            process: false
//        }
//
//    };
//    $scope.factoryDefault = {
//        alert: {message: false, status: 'is-hidden', icon: false},
//        process: false
//
//    };
//
//    /**
//     * Set tab
//     */
//    $scope.setBackupTab = function(tabId) {
//        $scope.backupRestore.activeTab = tabId;
//        $cookies.tab_admin_backup = tabId;
//    };
//
//    /**
//     * Upload backup file
//     */
//    $scope.uploadBackupFile = function(input) {
//        var cnt = 0;
//        $scope.backupRestore.restore.process = true;
//        var refresh = function() {
//            $scope.backupRestore.restore.alert = {message: $scope._t('restore_wait'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
//            cnt += 1;
//            if (cnt >= 10) {
//                $interval.cancel(interval);
//                $scope.backupRestore.restore.alert = {message: $scope._t('factory_default_success'), status: 'alert-success', icon: 'fa-check'};
//                //$scope.backupRestore.restore.alert = {message: $scope._t('factory_default_error'), status: 'alert-danger', icon: 'fa-warning'};
//                $scope.backupRestore.restore.process = false;
//            }
//        };
//        var interval = $interval(refresh, 1000);
//        return;
//        /*$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('restore_wait')};
//         var fd = new FormData();
//         fd.append('file_upload', $scope.myFile);
//         dataFactory.restoreFromBck(fd).then(function(response) {
//         $timeout(function() {
//         $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('restore_done_reload_ui')};
//         //$interval.cancel($scope.zwaveDataInterval);
//         $window.location.reload();
//         }, 20000);
//         }, function(error) {
//         $scope.loading = false;
//         });*/
//    };
//
//    /**
//     * Cancel restore
//     */
//    $scope.cancelRestore = function() {
//        $("#restore_confirm").attr('checked', false);
//        $("#restore_chip_info").attr('checked', false);
//        $scope.goRestore = false;
//        $scope.goRestoreUpload = false;
//
//    };
//
//    /**
//     * Back to Factory default
//     */
//    $scope.backFactoryDefault = function(input) {
//        var cnt = 0;
//        $scope.backupRestore.factory.process = true;
//        var refresh = function() {
//            $scope.backupRestore.factory.alert = {message: $scope._t('returning_factory_default'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
//            cnt += 1;
//            if (cnt >= 10) {
//                $interval.cancel(interval);
//                $scope.backupRestore.factory.alert = {message: $scope._t('factory_default_success'), status: 'alert-success', icon: 'fa-check'};
//                //$scope.backupRestore.factory.alert = {message: $scope._t('factory_default_error'), status: 'alert-danger', icon: 'fa-warning'};
//                $scope.backupRestore.factory.process = false;
//            }
//        };
//        var interval = $interval(refresh, 1000);
//    };

    /************************************** Firmware **************************************/
    /**
     * Show modal window
     */
//    $scope.showModal = function(target) {
//        $(target).modal();
//    };
});
/**
 * List of users
 */
myAppController.controller('ManagementUserController', function($scope, $location, dataFactory, dataService, myCache) {
    $scope.profiles = {};
    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('profiles').then(function(response) {
            $scope.profiles = response.data.data;
            dataService.updateTimeTick();
        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadProfiles();

    /**
     * Delete an user
     */
    $scope.deleteProfile = function(target, input, message, except) {
        if (input.id == except) {
            return;
        }
        alertify.confirm(message, function() {
            dataFactory.deleteApi('profiles', input.id).then(function(response) {
                $(target).fadeOut(2000);
                myCache.remove('profiles');

            }, function(error) {
                alertify.alert($scope._t('error_delete_data'));
            });
        });
    };


});
/**
 * User detail
 */
myAppController.controller('ManagementUserIdController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.rooms = {};
    $scope.input = {
        id: 0,
        name: '',
        active: true,
        role: 2,
        password: '',
        login: '',
        lang: 'en',
        color: '#dddddd',
        hide_all_device_events: false,
        hide_system_events: false,
        hide_single_device_events: [],
        rooms: [0],
        default_ui: 1,
        expert_view: false

    };
    $scope.auth = {
        login: null,
        password: null

    };

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            $scope.input = response.data.data;
            dataService.updateTimeTick();
        }, function(error) {
            $scope.input = false;
            $location.path('/error/' + error.status);
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    }

    /**
     * Load Rooms
     */
    $scope.loadRooms = function() {
        dataFactory.getApi('locations').then(function(response) {
            //$scope.rooms = response.data.data;
            $scope.rooms = _.filter(response.data.data, function(v) {
                if (v.id !== 0) {
                    return v;
                }
            });
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    $scope.loadRooms();
    /**
     * Assign room to list
     */
    $scope.assignRoom = function(assign) {
        $scope.input.rooms.push(assign);
        return;

    };

    /**
     * Remove room from the list
     */
    $scope.removeRoom = function(roomId) {
        var oldList = $scope.input.rooms;
        $scope.input.rooms = [];
        angular.forEach(oldList, function(v, k) {
            if (v != roomId) {
                $scope.input.rooms.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if ($scope.id == 0) {
            input.password = input.password;
        }
        input.role = parseInt(input.role, 10);
        dataFactory.storeApi('profiles', input.id, input).then(function(response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                myCache.remove('profiles');
                $scope.loadData(id);
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Change auth data
     */
    $scope.changeAuth = function(auth) {
        if (!auth.login && !auth.password) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            login: auth.login,
            password: auth.password

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///


});
/**
 * Remote access controller
 */
myAppController.controller('ManagementRemoteController', function($scope, dataFactory) {
    $scope.remoteAccess = false;
    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function() {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        dataFactory.getApi('instances', '/RemoteAccess').then(function(response) {
            var remoteAccess = response.data.data[0];
            if (Object.keys(remoteAccess).length < 1) {
                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
            }
            if (!remoteAccess.active) {
                $scope.alert = {message: $scope._t('remote_access_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
            if (!remoteAccess.params.userId) {
                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
                return;
            }
            remoteAccess.params.pass = null;
            $scope.remoteAccess = remoteAccess;
        }, function(error) {
            $scope.alert = {message: $scope._t('remote_access_not_installed'), status: 'alert-danger', icon: 'fa-warning'};
        });
    };

    $scope.loadRemoteAccess();

    /**
     * PUT Remote access
     */
    $scope.putRemoteAccess = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.putApi('instances', input.id, input).then(function(response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
});
/**
 * Licence controller
 */
myAppController.controller('ManagementLicenceController', function($scope, dataFactory) {
    $scope.proccessLicence = false;
    $scope.proccessVerify = {
        'message': false,
        'status': 'is-hidden'
    };
    $scope.proccessUpdate = {
        'message': false,
        'status': 'is-hidden'
    };
    $scope.inputLicence = {
        "scratch_id": null
    };
    /**
     * Get license key
     */
    $scope.getLicense = function(inputLicence) {
        // Clear messages
        $scope.proccessVerify.message = false;
        $scope.proccessUpdate.message = false;
        if (!inputLicence.scratch_id) {
            return;
        }

        $scope.proccessVerify = {'message': $scope._t('verifying_licence_key'), 'status': 'fa fa-spinner fa-spin'};
        $scope.proccessLicence = true;
        var input = {
            'uuid': $scope.controllerInfo.uuid,
            'scratch': inputLicence.scratch_id
        };
        dataFactory.getLicense(input).then(function(response) {
            $scope.proccessVerify = {'message': $scope._t('success_licence_key'), 'status': 'fa fa-check text-success'};
            // Update capabilities
            updateCapabilities(response);
        }, function(error) {
            var message = $scope._t('error_no_licence_key');
            if (error.status == 404) {
                var message = $scope._t('error_404_licence_key');
            }
            $scope.proccessVerify = {'message': message, 'status': 'fa fa-exclamation-triangle text-danger'};
            $scope.proccessLicence = false;

        });
        return;
    };

    /**
     * Update capabilities
     */
    function updateCapabilities(data) {
        $scope.proccessUpdate = {'message': $scope._t('upgrading_capabilities'), 'status': 'fa fa-spinner fa-spin'};
        dataFactory.zmeCapabilities(data).then(function(response) {
            $scope.proccessUpdate = {'message': $scope._t('success_capabilities'), 'status': 'fa fa-check text-success'};
            $scope.proccessLicence = false;
        }, function(error) {
            $scope.proccessUpdate = {'message': $scope._t('error_no_capabilities'), 'status': 'fa fa-exclamation-triangle text-danger'};
            $scope.proccessLicence = false;
        });
    }
    ;
});
/**
 * Firmware update controller
 */
myAppController.controller('ManagementFirmwareController', function($scope, $sce, dataFactory) {
    $scope.firmwareUpdateUrl = $sce.trustAsResourceUrl('http://' + $scope.hostName + ':8084/cgi-bin/main.cgi');


    /**
     * Load razberry latest version
     */
    $scope.loadRazLatest = function() {
        dataFactory.getRemoteData($scope.cfg.raz_latest_version_url).then(function(response) {
            $scope.controllerInfo.softwareLatestVersion = response;
        }, function(error) {
        });
    };
    //$scope.loadRazLatest();

    /**
     * Show modal window
     */
    $scope.showModalFirmware = function(target) {
        $(target).modal();
    };
});
/**
 * Back up controller
 */
myAppController.controller('ManagementBackupController', function($scope, $timeout, dataFactory, _) {
    $scope.managementBackup = {
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    $scope.downloadBackupFile = function() {
        $scope.managementBackup.alert = {message: $scope._t('backup_wait'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        dataFactory.getApi('backup', null, true).then(function(response) {
            $timeout(function() {
                $scope.managementBackup.alert = false;
                var saveData = (function() {
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    return function(data, fileName) {
                        var json = JSON.stringify(data),
                                blob = new Blob([json], {type: "octet/stream"}),
                                url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    };
                }());
                fileName = 'z-way-backup-' + _.now() + '.zab';
                saveData(response.data.data, fileName);
            });

        }, function(error) {
            alertify.alert($scope._t('backup_failed'));
            $scope.managementBackup.alert = false;
        });

    };
});
/**
 * Restor controller
 */
myAppController.controller('ManagementRestoreController', function($scope, dataFactory) {
    $scope.myFile = null;
    $scope.managementRestore = {
        confirm: false,
        alert: {message: false, status: 'is-hidden', icon: false},
        process: false
    };

    /**
     * Upload image
     */
    $scope.uploadFile = function() {
        $scope.managementRestore.alert = {message: $scope._t('restore_wait'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        var cmd = $scope.cfg.api['restore'];
        var fd = new FormData();

        fd.append('backupFile', $scope.myFile);
        //fd.append('backupFile', files[0]); 
        dataFactory.uploadApiFile(cmd, fd).then(function(response) {
            $scope.managementRestore.alert = {message: $scope._t('restore_done_reload_ui'), status: 'alert-success', icon: 'fa-check'};
        }, function(error) {
            $scope.loading = false;
            alertify.alert($scope._t('restore_backup_failed'));
            $scope.managementRestore.alert = false;
        });

    };
});
/**
 * App Store controller
 */
myAppController.controller('ManagementAppStoreController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache) {
    $scope.appStore = {
        input: {
            token: ''
        },
        tokens: {}

    };

    /**
     * Load tokens
     */
    $scope.appStoreLoadTokens = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('tokens', null, true).then(function(response) {
            angular.extend($scope.appStore.tokens, response.data.data.tokens);
        }, function(error) {
        });
    };
    $scope.appStoreLoadTokens();

    /**
     * Create/Update an item
     */
    $scope.appStoreAddToken = function() {
        if ($scope.appStore.input.token === '') {
            return;
        }
        dataFactory.putApiFormdata('tokens', $scope.appStore.input).then(function(response) {
            $scope.appStore.input.token = '';
            $scope.appStoreLoadTokens();
        }, function(error) {
            var message = $scope._t('error_update_data');
            if (error.status === 409) {
                message = $scope._t('notunique_token') + ' - ' + $scope.appStore.input.token;
            }
            alertify.alert(message);
        });

    };

    /**
     * Remove a token from the list
     */
    $scope.appStoreRemoveToken = function(token, message) {
        alertify.confirm(message, function() {
            dataFactory.deleteApiFormdata('tokens', {token: token}).then(function(response) {
                angular.extend($scope.appStore, response.data.data);
                ;
            }, function(error) {
                alertify.alert($scope._t('error_delete_data'));
            });
        });
        return;
    };

    /// --- Private functions --- ///


});
/**
 * Management report controller
 */
myAppController.controller('ManagementReportController', function($scope, $window, $route, dataFactory, dataService) {
    $scope.ZwaveApiData = false;
    $scope.remoteAccess = false;
    $scope.input = {
        browser_agent: '',
        browser_version: '',
        browser_info: '',
        shui_version: '',
        zwave_vesion: '',
        controller_info: '',
        remote_id: '',
        remote_activated: 0,
        remote_support_activated: 0,
        zwave_binding: 0,
        email: null,
        content: null
    };

    /**
     * Load ZwaveApiData
     */
    $scope.loadZwaveApiData = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            $scope.ZwaveApiData = ZWaveAPIData;
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadZwaveApiData();
    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function() {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        dataFactory.getApi('instances', '/RemoteAccess').then(function(response) {
            $scope.remoteAccess = response.data.data[0];
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadRemoteAccess();

    /**
     * Send and save report
     */
    $scope.sendReport = function(form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('sending')};
        if ($scope.ZwaveApiData) {
            input.zwave_binding = 1;
            input.zwave_vesion = $scope.ZwaveApiData.controller.data.softwareRevisionVersion.value;
            input.controller_info = JSON.stringify($scope.ZwaveApiData.controller.data);
        }
        if (Object.keys($scope.remoteAccess).length > 0) {
            input.remote_activated = $scope.remoteAccess.params.actStatus ? 1 : 0;
            input.remote_support_activated = $scope.remoteAccess.params.sshStatus ? 1 : 0;
            input.remote_id = $scope.remoteAccess.params.userId;

        }
        input.browser_agent = $window.navigator.appCodeName;
        input.browser_version = $window.navigator.appVersion;
        input.browser_info = 'PLATFORM: ' + $window.navigator.platform + '\nUSER-AGENT: ' + $window.navigator.userAgent;
        input.shui_version = $scope.cfg.app_version;
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postReport(input).then(function(response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_send_report') + ' ' + input.email};
            $route.reload();
            //$window.location.reload();
//            $scope.form.$setPristine();
//           input.content = null;
//            input.email = null;


        }, function(error) {
            alertify.alert($scope._t('error_send_report'));
            $scope.loading = false;
        });

    };

});
/**
 * Management info controller
 */
myAppController.controller('ManagementInfoController', function($scope, dataFactory, dataService) {
    $scope.input = {
        software: {
            firmwareVersion: '',
            uiVersion: $scope.cfg.app_version
        }
    };

    /**
     * Load ZwaveApiData
     */
    $scope.loadZwaveApiData = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            angular.extend($scope.input.software, {firmwareVersion: ZWaveAPIData.controller.data.softwareRevisionVersion.value});
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadZwaveApiData();
});