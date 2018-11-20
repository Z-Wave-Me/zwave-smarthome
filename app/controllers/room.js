/**
 * @overview Controllers that handle room actions.
 * @author Martin Vach
 */

/**
 * The room root controller
 * @class RoomController
 */
myAppController.controller('RoomController', function($scope, $q, $cookies, $filter, $timeout, dataFactory, dataService, cfg, _) {
    $scope.rooms = {
        show: true,
        all: {},
        cnt: {
            devices: {}
        },
        showHidden: ($cookies.showHiddenEl ? $filter('toBool')($cookies.showHiddenEl) : false),
        orderBy: ($cookies.roomsOrderBy ? $cookies.roomsOrderBy : 'titleASC'),
    };

    $scope.devices = {
        all: {}
    };

    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function() {
        var promises = [
            dataFactory.getApi('locations', null, true),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function(response) {
            var locations = response[0];
            var devices = response[1];
            $scope.loading = false;
            // Error message
            if (locations.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {
                    message: $scope._t('error_load_data')
                });
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
                $scope.rooms.cnt.devices = _.countBy($scope.devices.all, function(v) {
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
    $scope.setOrderBy = function(key) {
        angular.extend($scope.rooms, {
            orderBy: key
        });
        $cookies.roomsOrderBy = key;
        $scope.reloadData();
        //$scope.allSettled();
    };

    /**
     * Set order by
     * @param {string} key
     * @returns {undefined}
     */
    $scope.setOrderBy = function(key) {
        angular.extend($scope.rooms, {
            orderBy: key
        });
        $cookies.roomsOrderBy = key;
        $scope.reloadData();
        //$scope.allSettled();
    };

    /**
     * Room on long press
     * @param {string} id
     * @returns {undefined}
     */
    $scope.onLongPress = function(id) {
        $scope.longPressTimeout = $timeout(function() {
            $scope.redirectToRoute('config-rooms/' + id);
        }, 1000);
    };

    /**
     * Room on long press end
     * @returns {undefined}
     */
    $scope.onTouchEnd = function() {
        $timeout.cancel($scope.longPressTimeout);
    }


    /**
     * todo: Deprecated - moved to detail
     * Delete a room
     * @param {int} roomId
     * @param {string} message
     * @returns {undefined}
     */
    /*$scope.deleteRoom = function (roomId, message) {
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
     };*/

    /// --- Private functions --- ///

    /**
     * Remove room id from a device
     * @param {object} devices
     * @returns {undefined}
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.putApi('devices', v.id, {
                'location': 0
            }).then(function(response) {}, function(error) {});
        });
        return;

    };
});
/**
 * The controller that renders and handles single room data.
 * @class RoomConfigIdController
 */
myAppController.controller('RoomConfigIdController', function($scope, $routeParams, $filter, $location, cfg, dataFactory, dataService, myCache, _) {
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
    $scope.userImages = [];
    //$scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';
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
    $scope.loadData = function(id) {
        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('loading')
        };
        dataFactory.getApi('locations', '/' + id, true).then(function(response) {
            $scope.loading = false;
            angular.extend($scope.input, response.data.data);
            loadDevices(id);
        }, function(error) {
            $scope.input = false;
            $scope.loading = false;
            angular.extend(cfg.route.alert, {
                message: $scope._t('error_load_data')
            });
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
        loadImages();
    } else {
        loadDevices(0);
        loadImages();
    }

    /**
     * Check and validate an uploaded file
     * @param {object} files
     * @param {object} info
     * @returns {undefined}
     */
    $scope.checkUploadedFile = function (files, info) {
        // Extends files object with a new property
        files[0].newName = dataService.uploadFileNewName(files[0].name);
        // Check allowed file formats
        if ($scope.file.info.extensions.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                    $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                    $scope._t('upload_allowed_formats', {'__extensions__': $scope.file.info.extensions.toString()})
                    );
            return;

        }
        // Check allowed file size
        if (files[0].size > $scope.file.info.maxSize) {
            alertify.alertError(
                    $scope._t('upload_allowed_size', {'__size__': $filter('fileSizeString')($scope.file.info.maxSize)}) + ' ' +
                    $scope._t('upload_size_is', {'__size__': $filter('fileSizeString')(files[0].size)})
                    );
            return;

        }
        // Check if uploaded filename already exists
        if (_.findWhere($scope.userImages, {file: files[0].name})) {
            // Displays a confirm dialog and on OK atempt to upload file
            alertify.confirm($scope._t('uploaded_file_exists', {__file__: files[0].name})).set('onok', function (closeEvent) {
                uploadFile(files);
            }).setting('labels', {
                'ok': $scope._t('ok')
            });
        } else {
            uploadFile(files);
        }
    };

    /**
     * Assign device to a room
     * @param {object} device
     * @returns {undefined}
     */
    $scope.assignDevice = function(device) {
        device.location = null;
        $scope.devicesAssigned.push(device.id);
        return;
    };

    /**
     * Remove device from the room
     * @param {object} device
     * @returns {undefined}
     */
    $scope.removeDevice = function(device) {
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        $scope.devicesToRemove = $scope.devicesToRemove.length > 0 ? $scope.devicesToRemove : [];
        angular.forEach(oldList, function(v, k) {
            if (v != device.id) {
                $scope.devicesAssigned.push(v);
            } else {
                var i = $scope.input.main_sensors.indexOf(device.id);
                if (i > -1) {
                    $scope.input.main_sensors.splice(i, 1);
                }
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
    $scope.assignSensor = function($event, device) {
        device.location = null;
        if ($event.target.checked) {
            $scope.input.main_sensors.push(device.id);
        } else {
            var i = $scope.input.main_sensors.indexOf(device.id);
            $scope.input.main_sensors.splice(i, 1);
        }
        return;
    };

    /**
     * Clear all sensors (remove them from the array) and save to lacation
     * @param {object} input
     * @returns {undefined}
     */
    $scope.clearSensors = function(v) {
        $scope.input.main_sensors=[];
    };

    /**
     * Create new or update an existing location
     * @param {object} form
     * @param {object} input
     * @returns {undefined}
     */
    $scope.store = function(form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('updating')
        };
        dataFactory.storeApi('locations', input.id, input).then(function(response) {
            $scope.loading = false;
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                saveRoomIdIntoDevice(response.data, $scope.devicesAssigned);
                removeRoomIdFromDevice($scope.devicesToRemove);
                myCache.removeAll();
                /*myCache.remove('locations');
                 myCache.remove('devices');*/
                dataService.showNotifier({
                    message: $scope._t('success_updated')
                });
                $location.path('/rooms');
            }


        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;

        });

    };

    /**
     * Select room image
     * @param {string} image
     * @param {string} type
     * @returns {undefined}
     */
    $scope.selectRoomImage = function(image, type) {
        if (type == 'default' && $scope.input.default_img == image) {
            $scope.input.default_img = '';
            $scope.input.img_type = '';
            $scope.input.user_img = '';
            return;
        } else if (type == 'default' && $scope.input.default_img !== image) {
            $scope.input.default_img = image;
            $scope.input.img_type = 'default';
            $scope.input.user_img = '';
            return;
        }
        if (type == 'user' && $scope.input.user_img == image) {
            $scope.input.img_type = '';
            $scope.input.default_img = '';
            $scope.input.user_img = '';
            return;
        } else {
            $scope.input.img_type = 'user';
            $scope.input.user_img = image;
            $scope.input.default_img = '';
            return;
        }
    };

    /**
     * Delete a room
     * @param {int} roomId
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteRoom = function(roomId, message) {
        alertify.confirm(message, function() {
            $scope.loading = {
                status: 'loading-spin',
                icon: 'fa-spinner fa-spin',
                message: $scope._t('deleting')
            };
            dataFactory.deleteApi('locations', roomId).then(function(response) {
                $scope.loading = false;
                var deviceIds = [];
                _.filter($scope.devices, function(v) {
                    if (v.location == roomId) {
                        return deviceIds.push(v.id);
                    }
                });
                removeRoomIdFromDevice(deviceIds);

                dataService.showNotifier({
                    message: $scope._t('delete_successful')
                });
                $location.path('/rooms');

            }, function(error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
    };

    /**
     * Delete cutom room image
     * @param {string} image
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteImage = function (image, message) {
        alertify.dismissAll();
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('images', image).then(function (response) {
                $scope.loading = false;
                $scope.userImages = _.reject($scope.userImages, function (v) {
                    return v.file === image;
                });
                if ($scope.input.user_img == image) {
                    $scope.input.user_img = '';
                    $scope.input.img_type = '';
                }
                dataService.showNotifier({message: $scope._t('delete_successful')});
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
    };

    /// --- Private functions --- ///

    /**
     * Upload a file
     * @param {object} files
     * @returns {undefined}
     */
    function uploadFile(files) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        // Clear all alerts and file name selected
        alertify.dismissAll();
        // Set local variables
        var fd = new FormData();
        // Set selected file name
        $scope.file.upload = files[0].name;
        // Set form data
        fd.append('files_files', files[0]);
        // Atempt to upload a file
        dataFactory.uploadApiFile($scope.cfg.api_url + 'images/upload', fd).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_upload')});
            // add new image to the list
            $scope.userImages.push(response.data.data);

        }, function (error) {
            // $scope.icons.find = {};
            alertify.alertError($scope._t('error_upload'));
            $scope.loading = false;
        });
    };
    /**
     * Load devices
     * @param {int} locationId
     * @returns {undefined}
     */
    function loadDevices(locationId) {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devicesAssigned = [];
            var devices = dataService.getDevicesData(response.data.data.devices).value();
            _.filter(devices, function(v) {
                if (locationId > 0 && v.location === locationId) {
                    $scope.devicesAssigned.push(v.id);
                }
                if (v.location == 0 || v.location == locationId) {
                    $scope.devices[v.id] = v;
                }
            });
        }, function(error) {});
    };

    /**
     * Load images
     * @param
     * @returns {undefined}
     */
    function loadImages() {
        dataFactory.getApi('images').then(function(response) {
            $scope.userImages = response.data.data;
        }, function(error) {});
    };

    /**
     * Save room id into device
     * @param {object} data
     * @param {object} devices
     * @returns {undefined}
     */
    function saveRoomIdIntoDevice(data, devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.storeApi('devices', v, {
                'location': data.data.id
            }).then(function(response) {}, function(error) {

            });
        });
        return;

    };

    /**
     * Remove room id from device
     * @param {object} devices
     * @returns {undefined}
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.putApi('devices', v, {
                'location': 0
            }).then(function(response) {}, function(error) {

            });
        });
        return;

    };


});