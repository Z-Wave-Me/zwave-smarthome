/**
 * Application Room controller
 * @author Martin Vach
 */

/**
 * Room controller
 */
myAppController.controller('RoomController', function ($scope, $q, $cookies, $filter, dataFactory, dataService, _) {
    $scope.rooms = {
        show: true,
        all: {},
        cnt: {
            devices: {}
        },
        showHidden: ($cookies.showHiddenEl ? $filter('toBool')($cookies.showHiddenEl) : false)
    };
    
    $scope.devices = {
         all: {}
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var locations = response[0];
            var devices = response[1];
            $scope.loading = false;
            // Error message
            if (locations.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                $scope.rooms.show = false;
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms.all = dataService.getRooms(locations.value.data.data).value();
                if( _.size($scope.rooms.all) < 2){
                    alertify.alertWarning($scope._t('no_rooms')); 
                }
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.devices.all = dataService.getDevicesData(devices.value.data.data.devices, $scope.rooms.showHidden).value();
                $scope.rooms.cnt.devices =_.countBy( $scope.devices.all,function (v) {
                    return v.location;
                });
            }
        });
    };
    $scope.allSettled();
});
/**
 * Room config controller
 */
myAppController.controller('RoomConfigController', function ($scope, $q, dataFactory, dataService, myCache, _) {
    /**
     * Delete a room
     */
    $scope.deleteRoom = function (roomId, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('locations', roomId).then(function (response) {
                $scope.loading = false;
                removeRoomIdFromDevice(_.where($scope.devices.all, {location: roomId}));
                myCache.remove('locations');
                myCache.remove('devices');
                dataService.showNotifier({message: $scope._t('delete_successful')});
               $scope.reloadData();

            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };

    /// --- Private functions --- ///

    /**
     * Remove room id from device
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function (v, k) {
            dataFactory.putApi('devices', v.id, {'location': 0}).then(function (response) {
            }, function (error) {
            });
        });
        return;

    }
    ;
});
/**
 * Config room detail controller
 */
myAppController.controller('RoomConfigEditController', function ($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache, _) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.input = {
        'id': 0,
        'title': '',
        'user_img': '',
        'default_img': '',
        'img_type': 'default'
    };
    $scope.devices = {};
    $scope.devicesAssigned = [];
    //$scope.devicesAvailable = [];
    $scope.devicesToRemove = [];
    $scope.defaultImages = $scope.cfg.room_images;
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';
    $scope.myFile = false;

    /**
     * Load data
     */
    $scope.loadData = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations', '/' + id, true).then(function (response) {
            $scope.loading = false;
            $scope.input = response.data.data;
            loadDevices(id);
        }, function (error) {
            $scope.input = false;
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    } else {
        loadDevices(0);
    }

    /**
     * Upload image
     */
    $scope.uploadFile = function (files) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        var cmd = $scope.cfg.api_url + 'upload/file';
        var fd = new FormData();
        //fd.append('file_upload', $scope.myFile);
        fd.append('files_files', files[0]);
        dataFactory.uploadApiFile(cmd, fd).then(function (response) {
            $scope.loading = false;
            $scope.input.user_img = response.data.data;
            $scope.input.img_type = 'user';
            dataService.showNotifier({message: $scope._t('success_upload')});
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_upload'));
        });
    };

    /**
     * Assign device to room
     */
    $scope.assignDevice = function (device) {
        device.location = null;
        $scope.devicesAssigned.push(device.id);
        return;
    };

    /**
     * Remove device from the room
     */
    $scope.removeDevice = function (device) {
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        $scope.devicesToRemove = $scope.devicesToRemove.length > 0 ? $scope.devicesToRemove : [];
        angular.forEach(oldList, function (v, k) {
            if (v != device.id) {
                $scope.devicesAssigned.push(v);
            } else {
                device.location = 0;
                $scope.devicesToRemove.push(v);
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
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.storeApi('locations', input.id, input).then(function (response) {
            $scope.loading = false;
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                saveRoomIdIntoDevice(response.data, $scope.devicesAssigned);
                removeRoomIdFromDevice(response.data, $scope.devicesToRemove);
                myCache.remove('locations');
                myCache.remove('devices');
                //$scope.loadData(id);
                dataService.showNotifier({message: $scope._t('success_updated')});
                $location.path('/config-rooms');
            }


        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;

        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices(locationId) {
        dataFactory.getApi('devices').then(function (response) {
            $scope.devicesAssigned = [];
            var devices = dataService.getDevicesData(response.data.data.devices).value();
            _.filter(devices, function (v) {
                if (v.location == locationId) {
                    $scope.devicesAssigned.push(v.id);
                }
                if (v.location == 0 || v.location == locationId) {
                    $scope.devices[v.id] = v;
                }
            });
        }, function (error) {});
    }
    ;

    /**
     * Save room id into device
     */
    function saveRoomIdIntoDevice(data, devices) {
        angular.forEach(devices, function (v, k) {
            dataFactory.storeApi('devices', v, {'location': data.data.id}).then(function (response) {
            }, function (error) {

            });
        });
        return;

    }
    ;

    /**
     * Remove room id from device
     */
    function removeRoomIdFromDevice(data, devices) {
        angular.forEach(devices, function (v, k) {
            dataFactory.putApi('devices', v, {'location': 0}).then(function (response) {
            }, function (error) {

            });
        });
        return;

    }
    ;

});