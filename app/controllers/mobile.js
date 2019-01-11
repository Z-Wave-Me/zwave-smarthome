/**
 * @overview Controllers manage and add mobile devices.
 * @author Michael Hensche
 */


/**
 * The controller that manage mobile devices.
 * @class MobileManageController
 */
myAppController.controller('MobileManageController', function($scope, $q, $filter, mobile_cfg, dataFactory, dataService, _) {
    $scope.mobile = {
        rooms: [],
        devicesInRoom: [],
        availableDevices: [],
        assignedDevices: [],
        input: {},
        cfg: mobile_cfg
    };

    $scope.allSettled = function() {
        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('loading')
        };

        var promises = [
            dataFactory.getApi('instances', '/MobileAppSupport', true)
        ];

        $q.allSettled(promises).then(function(response) {
            $scope.loading = false;

            var instance = response[0];

            if(instance.state == 'rejected') {
                // Error
                angular.extend(cfg.route.alert, {
                    message: $scope._t('error_load_data')
                });
                return;
            }

            if(instance.state == 'fulfilled') {

                var instance = instance.value.data.data[0];

                // transform device data
                instance.params.devices = instance.params.devices.map(function(dev) {
                    var obj = {
                        id: dev.id,
                        deviceType: dev.deviceType,
                        msg: dev.msg
                    };

                    if(!isNaN(dev.level) &&
                        $scope.mobile.cfg[dev.deviceType].level &&
                        $scope.mobile.cfg[dev.deviceType].level.indexOf('lvl') > -1)
                    {
                        obj['level'] = 'lvl';
                        obj['exact'] = dev.level;
                    } else {
                        obj['level'] = dev.level;
                    }

                    if(dev.operator) {
                        obj['operator'] = dev.operator;
                    }
                    return obj;
                });

                // transform app data
                instance.params.apps = instance.params.apps.map(function(dev) {
                    angular.extend(dev, {
                        last_seen_formated: $filter('dateTimeFromTimestamp')(dev.last_seen),
                        created_formated: $filter('dateTimeFromTimestamp')(dev.created)
                    });
                    return dev;
                });

                angular.extend($scope.mobile.input, instance);


                var assignedDevices = $scope.mobile.assignedDevices;
                angular.forEach(instance.params.devices, function(d) {
                    if (assignedDevices.indexOf(d.id) === -1) {
                        $scope.mobile.assignedDevices.push(d.id);
                    }
                });
            }
        });
    }
    $scope.allSettled();


    /**
     * Remove app from List
     */
    $scope.removeApp = function(token) {
        var data = {
            token: token
        };
        dataFactory.deleteApi('remove_app', data).then(function(response) {
            var apps = $scope.mobile.input.params.apps;

            apps = _.without(apps, _.findWhere(apps, {token: token}));
            $scope.mobile.input.params.apps = apps;

            console.log("response", response);
        },function(error) {
            console.log("error", error);
        });
    }

    /**
     * Load rooms
     */
    $scope.loadRooms = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.mobile.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
            $scope.loadDevices($scope.mobile.rooms);
        });
    };
    $scope.loadRooms();

    /**
     * Load devices
     */
    $scope.loadDevices = function(rooms) {
        dataFactory.getApi('devices').then(function(response) {
            var devices = dataService.getDevicesData(response.data.data.devices),
                whiteList = Object.keys($scope.mobile.cfg);
            // Set available devices
            $scope.mobile.availableDevices = devices.map(function(v) {
                var obj = {
                    id: v.id,
                    deviceName: v.metrics.title,
                    deviceType: v.deviceType,
                    probeType: v.probeType,
                    location: v.location,
                    locationName: rooms[v.location].title,
                    iconPath: v.iconPath
                };
                return obj;
            }).filter(function(v) {
                // filter device based on mobile.cfg
                return whiteList.indexOf(v.deviceType) > -1;
            }).indexBy('id').value();
            // Set devices in the room
            $scope.mobile.devicesInRoom = _.countBy($scope.mobile.availableDevices, function(v) {
                return v.location;
            });
        }, function(error) {});
    };

    /**
     * Assign device to instance
     * @param {object} device
     * @returns {undefined}
     */
    $scope.assignDevice = function(device) {
        var data = angular.copy($scope.mobile.cfg[device.deviceType].default);

        data.id = device.id;

        $scope.mobile.input.params.devices.push(data);
        $scope.mobile.assignedDevices.push(device.id);
        return;
    };
    /**
     * Remove device id from assigned device and from input
     * @param {int} targetIndex
     * @param {string} deviceId
     */
    $scope.unassignDevice = function(targetIndex, deviceId) {
        var deviceIndex = $scope.mobile.assignedDevices.indexOf(deviceId);
        $scope.mobile.input.params.devices.splice(targetIndex, 1);
        if (deviceIndex > -1) {
            $scope.mobile.assignedDevices.splice(deviceIndex, 1);
        }
    };

    /**
     * Store
     */
    $scope.storeMobile = function(input) {
        // transform data back to original format
        input.params.devices = input.params.devices.map(function(dev) {
            var obj = {
                id: dev.id,
                deviceType: dev.deviceType,
                msg: dev.msg,
                level: dev.level == 'lvl' && dev.exact ? dev.exact : dev.level
            };
            if(dev.operator && dev.level == 'lvl' || dev.deviceType == 'sensorMultilevel') {
                obj['operator'] = dev.operator;
            }
            return obj;
        });

        // transform data back to original format remove unecessary keys
        input.params.apps = input.params.apps.map(function(app) {
            delete app.last_seen_formated;
            delete app.created_formated;
            return app;
        });

        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('loading')
        };

        console.log("input.params.devices", input.params.devices);
        dataFactory.storeApi('instances', parseInt(input.id, 10), input).then(function(response) {
            $scope.reloadData();
            dataService.showNotifier({
                message: $scope._t('success_updated')
            });
        }, function(error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_update_data'));
        });
    };
});


/**
 * The controller that show that show or update the QR-Code.
 * @class MobileAddController
 */
myAppController.controller('MobileAddController', function ($scope, $timeout, $window, dataFactory, dataService, _) {
    $scope.qrcode = "";

    /**
     *  Add Qrcode
     */
    $scope.addQRCode = function(id) {
        alertify.prompt($scope._t('verify_qrcode'), "", function(evt, pass) {
            var data = {
                "password": pass
            };
            $scope.toggleRowSpinner(id);
            dataFactory.postApi('profiles', data, '/qrcode/'+$scope.user.id,).then(function(response) {
                dataService.showNotifier({message: $scope._t('success_updated')});

                var qr = new QRious({
                  level: 'H',
                  size: 255,
                  value: response.data.data
                });
                $scope.qrcode = qr.toDataURL();

                $scope.toggleRowSpinner(id);

            }, function(error) {
                $scope.toggleRowSpinner(id);
                if(error.data.error == "wrong_password") {
                    alertify.alertError($scope._t('wrong_password'));
                } else {
                    alertify.alertError($scope._t('error_update_data'));
                }
            });
        }).set('type', 'password');
    }
});