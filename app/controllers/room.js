/**
 * Application Room controller
 * @author Martin Vach
 */

/**
 * Room controller
 */
myAppController.controller('RoomController', function($scope, $location, dataFactory, dataService, _) {
    $scope.collection = [];
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';
    $scope.devices = {
        count: {}
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations').then(function(response) {
            $scope.loading = false;
            $scope.collection = response.data.data;
//            if (Object.keys($scope.collection).length < 1) {
//                $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-warning', message: $scope._t('no_data')};
//            }
            $scope.loadDevices();
        }, function(error) {
              $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadData();

    /**
     * Load devices
     */
    $scope.loadDevices = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices.count = _.chain(response.data.data.devices)
                    .flatten()
                    .reject(function(v){ return v.deviceType == 'battery' || v.permanently_hidden == true; })
                    .groupBy('location')
                    .value();
        }, function(error) {});
    }
    ;
});
/**
 * Room config controller
 */
myAppController.controller('RoomConfigController', function($scope, $window, $location, dataFactory, dataService, myCache, _) {
    $scope.roomConfig = {
         show: true,
         all: {}
     };
    $scope.devices = [];
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';

    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function(id) {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations').then(function(response) {
            $scope.loading = false;
            $scope.roomConfig.all = _.filter(response.data.data, function(v) {
                if (v.id !== 0) {
                    return v;
                }
            });
            loadDevices();
        }, function(error) {
            $scope.roomConfig.show = false;
             $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadData();

    /**
     * Delete an item
     */
    $scope.delete = function(target, roomId, message) {

        alertify.confirm(message, function() {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('locations', roomId).then(function(response) {
                $scope.loading = false;
                var devices = _.where($scope.devices, {location: roomId});
                removeRoomIdFromDevice(devices);
                myCache.remove('locations');
                myCache.remove('devices');
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.loadData();

            }, function(error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices = response.data.data.devices;
        }, function(error) {});
    }
    ;

    /**
     * Remove room id from device
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.putApi('devices', v.id, {'location': 0}).then(function(response) {
            }, function(error) {
            });
        });
        return;

    }
    ;
});
/**
 * Config room detail controller
 */
myAppController.controller('RoomConfigEditController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache) {
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
    $scope.loadData = function(id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations', '/' + id, true).then(function(response) {
            $scope.loading = false;
            $scope.input = response.data.data;
            loadDevices(id);
        }, function(error) {
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
    $scope.uploadFile = function(files) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        var cmd = $scope.cfg.api_url + 'upload/file';
        var fd = new FormData();
        //fd.append('file_upload', $scope.myFile);
        fd.append('files_files', files[0]);
        dataFactory.uploadApiFile(cmd, fd).then(function(response) {
             $scope.loading = false;
            $scope.input.user_img = response.data.data;
            $scope.input.img_type = 'user';
            dataService.showNotifier({message: $scope._t('success_upload')});
        }, function(error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_upload'));
        });
    };

    /**
     * Assign device to room
     */
    $scope.assignDevice = function(device) {
        device.location = null;
        $scope.devicesAssigned.push(device.id);
        return;
    };

    /**
     * Remove device from the room
     */
    $scope.removeDevice = function(device) {
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        $scope.devicesToRemove = $scope.devicesToRemove.length > 0 ? $scope.devicesToRemove : [];
        angular.forEach(oldList, function(v, k) {
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
    $scope.store = function(form,input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.storeApi('locations', input.id, input).then(function(response) {
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
           

        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;

        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices(locationId) {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devicesAssigned = [];
            $scope.devices = dataService.getDevices(response.data.data.devices, false, false, false, locationId > 0 ? locationId : 'post');
            angular.forEach($scope.devices, function(v, k) {
                if (v.location == locationId && v.location !== 0) {
                    $scope.devicesAssigned.push(v.id);
                }

            });
        }, function(error) {});
    }
    ;

    /**
     * Save room id into device
     */
    function saveRoomIdIntoDevice(data, devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.storeApi('devices', v, {'location': data.data.id}).then(function(response) {
            }, function(error) {

            });
        });
        return;

    }
    ;

    /**
     * Remove room id from device
     */
    function removeRoomIdFromDevice(data, devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.putApi('devices', v, {'location': 0}).then(function(response) {
            }, function(error) {

            });
        });
        return;

    }
    ;

});