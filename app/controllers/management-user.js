/**
 * @overview Controllers that handle user list and detail
 * @author Martin Vach
 */
/**
 * The controller that renders the list of users.
 * @class ManagementUserController
 */
myAppController.controller('ManagementUserController', function ($scope, $cookies, dataFactory, dataService, myCache) {
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
            alertify.alertError($scope._t('error_load_data'));
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
        });
    };


});

/**
 * The controller that renders and handles user detail.
 * @class ManagementUserIdController
 */
myAppController.controller('ManagementUserIdController', function ($scope, $routeParams, $filter, $q, dataFactory, dataService, myCache) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.rooms = {};
    $scope.show = true;
    $scope.input = {
        "id": 0,
        "role": 2,
        "login": "",
        "name": "",
        "lang": "en",
        "color": "#dddddd",
        "dashboard": [],
        "interval": 1000,
        "rooms": [],
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

    /**
     * Load all promises
     */
    $scope.allSettledUserId = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('profiles', ($scope.id !== 0 ? '/' + $scope.id : ''), true),
            dataFactory.getApi('locations')
        ];

        $q.allSettled(promises).then(function (response) {
            var profile = response[0];
            var locations = response[1];
            $scope.loading = false;
            // Error message
            if (profile.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                $scope.show = false;
                return;
            }
            // Success - profile
            if (profile.state === 'fulfilled') {
                if ($scope.id !== 0) {
                    $scope.input = profile.value.data.data;
                    $scope.auth.login = profile.value.data.data.login;
                    $scope.lastEmail = profile.value.data.data.email;
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
        //console.log(input);
        //return;
        dataFactory.storeApi('profiles', input.id, input).then(function (response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                myCache.remove('profiles');
                $scope.reloadData();
            }

            // Email change --> update e-mail cloudbackup if instance exist
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
