/**
 * @overview Controllers that handle user list and detail
 * @author Martin Vach
 */
/**
 * The controller that renders the list of users.
 * @class ManagementUserController
 */
myAppController.controller('ManagementUserController', function ($scope, $cookies, dataFactory, dataService, myCache,cfg) {
    $scope.userProfiles = {
        all: false,
        orderBy: ($cookies.usersOrderBy ? $cookies.usersOrderBy : 'titleASC')
    };
    /**
     * Load profiles
     */
    $scope.loadProfiles = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('profiles', null, true).then(function (response) {
            $scope.userProfiles.all = response.data.data;
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        });
    };
    $scope.loadProfiles();

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.userProfiles, {orderBy: key});
        $cookies.usersOrderBy = key;
        $scope.loadProfiles();
    };

    /**
     * Delete an user
     */
    $scope.deleteProfile = function (input, message, except) {
        if (input.id == except) {
            return;
        }
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('profiles', input.id).then(function (response) {
                myCache.remove('profiles');
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.loading = false;
                $scope.loadProfiles();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
    };
});

/**
 * The controller that renders and handles user detail.
 * @class ManagementUserIdController
 */
myAppController.controller('ManagementUserIdController', function ($scope, $cookies, $routeParams, $filter, $q, dataFactory, dataService, myCache,cfg) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.rooms = {};
    $scope.devices = [];
    $scope.authTokens = [];
    $scope.show = true;
    $scope.input = {
        "id": 0,
        "role": 2,
        "login": "",
        "name": "",
        "lang": "en",
        "dashboard": [],
        "interval": 1000,
        "rooms": [],
        "devices": [],
        "expert_view": true,
        "hide_all_device_events": false,
        "hide_system_events": false,
        "hide_single_device_events": []
    };
    $scope.auth = {
        id: $routeParams.id,
        login: null,
        password: null
    };
    $scope.lastEmail = "";
    
    $scope.currentZWayAuthToken  = $cookies.ZWAYSession;
    $scope.currentFullAuthToken = ($cookies.ZBW_SESSID || "") + "/" + $cookies.ZWAYSession;
    $scope.currentFullAuthTokenGlobal = !!$cookies.ZBW_SESSID;

    /**
     * Load all promises
     */
    $scope.allSettledUserId = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('profiles', ($scope.id !== 0 ? '/' + $scope.id : ''), true),
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices')
        ];

        $q.allSettled(promises).then(function (response) {
            var profile = response[0];
            var locations = response[1];
            var devices = response[2];
            $scope.loading = false;
            // Error message
            if (profile.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                $scope.show = false;
                return;
            }
            // Success - profile
            if (profile.state === 'fulfilled') {
                if ($scope.id !== 0) {
                    $scope.input = profile.value.data.data;
                    if (!$scope.input.devices) $scope.input.devices = [];
                    $scope.auth.login = profile.value.data.data.login;
                    $scope.lastEmail = profile.value.data.data.email;
                    $scope.authTokens = profile.value.data.data.authTokens;
                    $scope.authTokens.forEach(function(token) {
                        token.date_str = (new Date(token.date)).toLocaleString();
                        token.lastSeen_str = (new Date(token.lastSeen)).toLocaleString();
                        token.expire_str = (token.expire === 0 || typeof token.expire == "undefined") ? '-' : (new Date(token.expire)).toLocaleString();
                    });
                }
            }

            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms = dataService.getRooms(locations.value.data.data)
                    .reject(function (v) {
                        return (v.id === 0);

                    })
                    .value();
            }
            // Success - locations
            if (devices.state === 'fulfilled') {
                $scope.devices = devices.value.data.data.devices;
            }
        });
    };
    $scope.allSettledUserId();

    /**
     * Assign room to list
     */
    $scope.assignRoom = function (assign) {
        if($scope.input.role !== 1) {
            $scope.input.rooms.push(assign);
        }
    };

    /**
     * Remove room from the list
     */
    $scope.removeRoom = function (roomId) {
        var oldList = $scope.input.rooms;
        $scope.input.rooms = [];
        angular.forEach(oldList, function (v, k) {
            if (v != roomId) {
                $scope.input.rooms.push(v);
            }
        });
        return;
    };

    /**
     * Assign device to list
     */
    $scope.assignDevice = function (assign) {
        if($scope.input.role !== 1) {
            $scope.input.devices.push(assign);
        }
    };

    /**
     * Remove device from the list
     */
    $scope.removeDevice = function (deviceId) {
        var oldList = $scope.input.devices;
        $scope.input.devices = [];
        angular.forEach(oldList, function (v, k) {
            if (v != deviceId) {
                $scope.input.devices.push(v);
            }
        });
        return;
    };

    /**
     * Remove auth token
     */
    $scope.removeAuthToken = function (profileId, token, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('profiles', profileId, '/token/' + token).then(function (response) {
                myCache.remove('profiles');
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.loading = false;
                $scope.allSettledUserId();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
        return;
    };

    /**
     * Remove all auth tokens
     */
    $scope.removeAllAuthTokens = function (profileId, tokens, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            var curToken = $cookies.ZWAYSession;
            console.log(tokens);
            tokens.forEach(function(d) {
                var token = d.sid;
                if (curToken.substr(0,6) !== token.substr(0,6)) {
                    dataFactory.deleteApi('profiles', profileId, '/token/' + token).then(function (response) {
                        myCache.remove('profiles');
                        dataService.showNotifier({message: $scope._t('delete_successful')});
                        $scope.loading = false;
                        $scope.allSettledUserId();
                    }, function (error) {
                        $scope.loading = false;
                        alertify.alertError($scope._t('error_delete_data'));
                    });
                }
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
        return;
    };
    
    /**
     * Make auth token permanent
     */
    $scope.permanentAuthToken = function (profileId, token, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            dataFactory.putApi('profiles', profileId, {}, '/token/' + token).then(function (response) {
                myCache.remove('profiles');
                dataService.showNotifier({message: $scope._t('success_updated')});
                $scope.loading = false;
                $scope.allSettledUserId();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_update_data'));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function (form, input) {
        if (form.$invalid) {
            return;
        }
        var globalRoomIndex = input.rooms.indexOf(0);
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if ($scope.id == 0) {
            input.password = input.password;
        }
        if (input.role === 1) {
            input.rooms = [0];
        }else if(globalRoomIndex > -1){
            input.rooms.splice(globalRoomIndex, 1);
        }
        dataFactory.storeApi('profiles', input.id, input).then(function (response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                myCache.remove('profiles');
                $scope.reloadData();
            }

            // Email change --> update e-mail cloudbackup if instance exist
            if($scope.user.role == 1) {
                if($scope.lastEmail != input.email) {
                    var promises = [
                        dataFactory.getApi('instances', '/CloudBackup')
                    ];

                    $q.allSettled(promises).then(function (response) {
                        var instance = response[0];

                        if (instance.state === 'rejected') {
                            return;
                        }

                        if (instance.state === 'fulfilled') {
                            var instanceData = instance.value.data.data[0];
                            instanceData.params.email = input.email;
                            dataFactory.putApi('instances', instanceData.id, instanceData).then(function (response) {
                                $scope.lastEmail = input.email
                            }, function (error) {
                                alertify.alertError($scope._t('error_update_data'));
                            });
                        }
                    });
                }
            }

            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
            window.location = '#/admin';

            //$window.location.reload();

        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
            alertify.alertError(message);
            $scope.loading = false;
        });

    };

    /**
     * Change auth data
     */
    $scope.changeAuth = function (form, auth) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles_auth_update', $scope.id, $scope.auth).then(function (response) {
            $scope.loading = false;
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                return;
            }
            dataService.showNotifier({message: $scope._t('success_updated')});

        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
            alertify.alertError(message);
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///


});
