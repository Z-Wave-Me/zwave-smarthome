/**
 * @overview Controllers that handle room actions.
 * @author Martin Vach
 */

/**
 * The room root controller
 * @class RoomController
 */
myAppController.controller('RoomController', function ($scope, $q, $cookies, $filter, dataFactory, dataService, _) {
    $scope.rooms = {
        show: true,
        all: {},
        cnt: {
            devices: {}
        },
        showHidden: ($cookies.showHiddenEl ? $filter('toBool')($cookies.showHiddenEl) : false),
        orderBy: ($cookies.roomsOrderBy ? $cookies.roomsOrderBy : 'titleASC'),
        sensors: {}
    };

    $scope.devices = {
        all: {}
    };

    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('locations', null, true),
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
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.devices.all = dataService.getDevicesData(devices.value.data.data.devices, $scope.rooms.showHidden).value();
                $scope.rooms.cnt.devices = _.countBy($scope.devices.all, function (v) {
                    return v.location;
                });
            }
        });
    };
    $scope.allSettled();

    /**
     * Set order by
     * @param {string} key
     * @returns {undefined}
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.rooms, {orderBy: key});
        $cookies.roomsOrderBy = key;
        $scope.reloadData();
        //$scope.allSettled();
    };

    /**
     * Delete a room
     * @param {int} roomId
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteRoom = function (roomId, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('locations', roomId).then(function (response) {
                $scope.loading = false;
                removeRoomIdFromDevice(_.where($scope.devices.all, {location: roomId}));
                //myCache.remove('locations');
                //myCache.remove('devices');
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.reloadData();
                //$scope.allSettled();

            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };

    /// --- Private functions --- ///

    /**
     * Remove room id from a device
     * @param {object} devices
     * @returns {undefined}
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
 * The controller that renders and handles single room data.
 * @class RoomConfigIdController
 */
myAppController.controller('RoomConfigIdController', function ($scope, $routeParams, $filter, $location, cfg, dataFactory, dataService, myCache, _) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.input = {
        'id': 0,
        'title': '',
        'user_img': '',
        'default_img': '',
        'img_type': 'default',
        'main_sensors': []
    };
    $scope.devices = {};
    $scope.devicesAssigned = [];
    //$scope.devicesAvailable = [];
    $scope.devicesToRemove = [];
    $scope.defaultImages = $scope.cfg.room_images;
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';
    $scope.file = {
        upload: false,
        info: {
            maxSize: $filter('fileSizeString')(cfg.upload.room.size),
            extensions: cfg.upload.room.extension.toString()
        }
    };

   /**
    * Load a data holder with rooms
    * @param {int} id
    * @returns {undefined}
    */
    $scope.loadData = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations', '/' + id, true).then(function (response) {
            $scope.loading = false;
            angular.extend($scope.input, response.data.data);
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
     * Upload an image file
     * @param {object} files
     * @returns {undefined}
     */
    $scope.uploadFile = function (files) {
        // Check allowed file formats
        //if(cfg.upload.room.type.indexOf(files[0].type) === -1){
        if (cfg.upload.room.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                    $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                    $scope._t('upload_allowed_formats', {'__extensions__': $scope.file.info.extensions})
                    );
            return;

        }
        // Check allowed file size
        if (files[0].size > cfg.upload.room.size) {
            alertify.alertError(
                    $scope._t('upload_allowed_size', {'__size__': $scope.file.info.maxSize}) + ' ' +
                    $scope._t('upload_size_is', {'__size__': $filter('fileSizeString')(files[0].size)})
                    );
            return;

        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        // Clear all alerts and file name selected
        alertify.dismissAll();
        $scope.file.upload = false;
        // Set local variables
        var cmd = $scope.cfg.api_url + 'upload/file',
                fd = new FormData();
        // Set selected file name
        $scope.file.upload = files[0].name;
        fd.append('files_files', files[0]);
        console.log(fd);
        // Atempt to upload a file
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
    * Assign device to a room
    * @param {object} device
    * @returns {undefined}
    */
    $scope.assignDevice = function (device) {
        device.location = null;
        $scope.devicesAssigned.push(device.id);
        return;
    };

    /**
     * Remove device from the room
     * @param {object} device
     * @returns {undefined}
     */
    $scope.removeDevice = function (device) {
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        $scope.devicesToRemove = $scope.devicesToRemove.length > 0 ? $scope.devicesToRemove : [];
        angular.forEach(oldList, function (v, k) {
            if (v != device.id) {
                $scope.devicesAssigned.push(v);
            } else {
                $scope.input.main_sensors.splice($scope.input.main_sensors.indexOf(device.id) , 1);
                device.location = 0;
                $scope.devicesToRemove.push(v);
            }
        });
        return;
    };

    /**
     * Assign device (sensorBianry, senosrMultilevel) to the room main sensors
     * @param {object} $event
     * @param {object} device
     * @returns {undefined}
     */
    $scope.assignSensor = function ($event, device) {
        device.location = null;
        if($event.target.checked) {
            $scope.input.main_sensors.push(device.id);
        } else {
            $scope.input.main_sensors.splice($scope.input.main_sensors.indexOf(device.id) , 1);
        }
        return;
    };


    /**
     * Create new or update an existing location
     * @param {object} form
     * @param {object} input
     * @returns {undefined}
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
                removeRoomIdFromDevice($scope.devicesToRemove);
                myCache.remove('locations');
                myCache.remove('devices');
                dataService.showNotifier({message: $scope._t('success_updated')});
                $location.path('/rooms');
            }


        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;

        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     * @param {int} locationId
     * @returns {undefined}
     */
    function loadDevices(locationId) {
        dataFactory.getApi('devices').then(function (response) {
            $scope.devicesAssigned = [];
            var devices = dataService.getDevicesData(response.data.data.devices).value();
            _.filter(devices, function (v) {
                if (locationId > 0 && v.location === locationId) {
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
     * @param {object} data
     * @param {object} devices
     * @returns {undefined}
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
     * @param {object} devices
     * @returns {undefined}
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function (v, k) {
            dataFactory.putApi('devices', v, {'location': 0}).then(function (response) {
            }, function (error) {

            });
        });
        return;

    }
    ;

});