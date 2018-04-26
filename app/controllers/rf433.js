/**
 * @overview Controllers that handle RF433 Services.
 * @author Michael Hensche
 */


/**
 * The controller that teach-in a device.
 * @class RF433TeachinController
 */
myAppController.controller('RF433TeachinController', function($scope, $q, $routeParams, $interval, $timeout, $location, dataFactory, dataService, myCache,cfg) {
    $scope.inclusion = {
        process: false,
        done: false
    };

    $scope.input = {
        device_typ: "",
        table: []
    };

    $scope.intervalTime = 1000;
    $scope.timeoutTime = 1000 * 300; // 5 min
    $scope.inclusionTimeout = null;
    $scope.inclusionInterval = null;

    $scope.device_typs = [];
    $scope.module = [];
    $scope.instance = {};

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $timeout.cancel($scope.inclusionTimout);
        $interval.cancel($scope.inclusionInterval);
    });

    $scope.startStopTeachin = function(process) {
        if(process) {
            $scope.inclusionInterval = $interval(function() {
                $scope.loadPulseTrain();
            }, $scope.intervalTime);

            /* stop inclusin after 5 min */
            $scope.inclusionTimeout = $timeout(function() {
                $scope.inclusion.process = false;
                $interval.cancel($scope.inclusionInterval);
            }, $scope.timeoutTime);

        } else {
            /* stop inclusin */
            $timeout.cancel($scope.inclusionTimout);
            $interval.cancel($scope.inclusionInterval);
        }
        $scope.inclusion.done = true;
        $scope.inclusion.process = process;
    };

    $scope.removeRow = function(index) {
        $scope.input.table.splice(index, 1);
    }


    $scope.testCode = function(code) {
        dataFactory.postApi('send_pulse_train', null, '/'+code).then(function(response) {

        }, function(error){

        });
    }


    $scope.loadPulseTrain = function() {

        dataFactory.getApi('get_pulse_trains', false, true).then(function(response) {
            var data = response.data

            var row = {
                'code': "",
                'nano_string': "",
                'on': $scope.input.device_typ == 'sensorBinary' ? true : false,
                'off': false,
                'btn': null,
                'timeout': 30,
                'timeout_on': true,
                'count': 0
            };

            if(_.isEmpty(data)) {
                return;
            }

            var iRow = $scope.input.table.map(function(row) {
                return row.code
            }).indexOf(data.code);

            if(iRow != -1) {
                $scope.input.table[iRow].count++;
            } else {
                row.code = data.code;
                row.nano_string = data.nano_string;
                row.count = 1;

                $scope.input.table.push(row);
            }

        }, function(error){

        });

    };

    $scope.toggleOnOff = function(index) {

        if($scope.input.table[index].on == true) {
            $scope.input.table[index].off = true;
            $scope.input.table[index].on = false;
        } else {
            $scope.input.table[index].off = false;
            $scope.input.table[index].on = true;
        }
    };


    $scope.allSettled = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            dataFactory.getApi('instances', '/RF433', true),
            dataFactory.getApi('modules', '/RF433')
        ];

        $q.allSettled(promises).then(function (response) {
            $scope.loading = false;
            var instance = response[0];
            var module = response[1];

            if (instance.state === 'fulfilled') {
                $scope.instance = instance.value.data.data[0];
            }

            if (module.state === 'fulfilled') {
                // Module
                $scope.module = module.value.data.data;
                $scope.loadDeviceTyps();
            }
        });
    };
    $scope.allSettled();

    $scope.loadDeviceTyps = function() {

        angular.forEach($scope.module.schema.definitions.device.properties.deviceTyp.enum, function(v) {
           var device_typ = {"value": v, "label": ""};

           $scope.device_typs.push(device_typ);
        });

        angular.forEach($scope.module.options.definitions.device.fields.deviceTyp.optionLabels, function(v, k) {
            $scope.device_typs[k].label = v;
        });
    };


    /**
     * Update instance
     */
    $scope.updateInstance = function (input) {

        var new_id = input.params.device_list.length + 1;
        var device_data = {
            "deviceName": "RF433 Device " + new_id,
            "deviceTyp": $scope.input.device_typ,
            "pulseTrainTable": $scope.input.table
        };
        input.params.device_list.push(device_data);

        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                dataService.showNotifier({message: $scope._t('success_updated')});

                $timeout(function() {
                    dataFactory.getApi('instances', '/RF433', true).then(function (response) {
                        var devices = response.data.data[0].params.device_list;
                        var i = _.find(devices, function (dev) {
                            return dev.deviceName == device_data.deviceName;
                        });
                        console.log(i);
                        if (typeof i !== 'undefined') {
                            var vDevId = i.vdevId
                            $location.path('/rf433/manage/' + vDevId);
                        }
                        $scope.loading = false;
                    }, function (error) {
                        $scope.loading = false;
                        angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                        alertify.dismissAll();
                    });
                }, 10000);
            }, function (error) {

                alertify.alertError($scope._t('error_update_data'));
                alertify.dismissAll();
                $scope.loading = false;
            });
        }
    };

});
/**
 * The controller that manage RF433 devices.
 * @class RF433ManageController
 */
myAppController.controller('RF433ManageController', function($scope, $location, $q, $window, $timeout, dataFactory, dataService) {
    $scope.rf433Devices = {};
    $scope.instance = {};


    $scope.allSettled = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            dataFactory.getApi('instances', '/RF433', true),
            dataFactory.getApi('devices')
        ];

        $q.allSettled(promises).then(function (response) {
            $scope.loading = false;
            var instance = response[0];
            var devices = response[1];

            if (instance.state === 'fulfilled') {
                $scope.instance = instance.value.data.data[0];
            }

            if (devices.state === 'fulfilled') {
                setDevices(devices.value.data.data.devices, $scope.instance);
            }
        });
    };
    $scope.allSettled();

    /**
     * Delete device
     */
    $scope.deleteDevice = function(vDevId, target, input, message) {
        alertify.confirm(message, function() {

            var index = input.params.device_list.map(function(dev) {return dev.vdevId}).indexOf(vDevId);
            if(index !== -1) {

                input.params.device_list.splice(index, 1);
                dataFactory.putApi('instances', input.id, input).then(function (response) {
                    $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
                    $timeout(function() {
                        $scope.loading = false;
                        $(target).fadeOut(500);
                    }, 10000);
                }, function(error) {
                    $scope.loading = false;
                });
            } else {
                alertify.alertError($scope._t('error_delete_data'));
            }

        });
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices, instance) {
        console.log(instance);
        console.log(devices);
        angular.forEach(devices, function(v, k) {
            if(v.creatorId !== instance.id) {
                return;
            }
            $scope.rf433Devices[k] = {
                id: k,
                vDevId: v.id,
                givenName: v.metrics.title
            };

        });

    };
});
/**
 * The controller that handles actions on the RF433 device.
 * @class RF433ManageDetailController
 */
myAppController.controller('RF433ManageDetailController', function($scope, $routeParams, $filter, $q, $window, $timeout, dataFactory, dataService, myCache) {
    $scope.vDevId = $routeParams.vDevId;
    $scope.apiDevices = [];
    $scope.rooms = [];
    $scope.dev = [];
    $scope.modelRoom;
    $scope.instance = {};
    $scope.input = {
        id: "",
        name: "",
        device_typ: "",
        table: []
    };

    $scope.allSettled = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            dataFactory.getApi('devices', null, true),
            dataFactory.getApi('instances', '/RF433', true),
            dataFactory.getApi('locations'),
            dataFactory.getApi('modules', '/RF433')
        ];

        $q.allSettled(promises).then(function (response) {
            $scope.loading = false;
            var devices = response[0];
            var instance = response[1];
            var locations = response[2];
            var module = response[3];

            if (devices.state === 'fulfilled') {
                setDevices(devices.value.data.data.devices);
            }

            if (instance.state === 'fulfilled') {
                $scope.instance = instance.value.data.data[0];

                var device = _.find($scope.instance.params.device_list, function(dev) {
                    return dev.vdevId == $scope.vDevId;
                });

                if(typeof device !== 'undefined') {
                    $scope.input.device_typ = device.deviceTyp
                    $scope.input.table = device.pulseTrainTable
                }
            }

            if(locations.state === 'fulfilled') {
                $scope.rooms = locations.value.data.data;
            }
            if (module.state === 'fulfilled') {
                $scope.module = module.value.data.data;
            }
        });
    };
    $scope.allSettled();

    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.allSettled();
            $scope.loading = false;
        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        $scope.allSettled();
        $scope.loading = false;
        return;

    };

    $scope.toggleOnOff = function(index) {

        if($scope.input.table[index].on == true) {
            $scope.input.table[index].off = true;
            $scope.input.table[index].on = false;
        } else {
            $scope.input.table[index].off = false;
            $scope.input.table[index].on = true;
        }
    };


    /**
     * update instacne
     * @param {object} instance
     * @returns {undefined}
     */
    $scope.updateInstance = function(input) {

        var index = input.params.device_list.map(function(dev){return dev.vdevId}).indexOf($scope.input.id);

        if(index > -1) {
            input.params.device_list[index].pulseTrainTable = $scope.input.table;
        }

            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            console.log(input);
            console.log($scope.input);

            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $timeout(function() {
                    $scope.loading = false;
                    dataService.showNotifier({message: $scope._t('success_updated')});
                    $window.location.reload();
                }, 10000);
            }, function (error) {

                alertify.alertError($scope._t('error_update_data'));
                alertify.dismissAll();
                $scope.loading = false;
            });

    };

        /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices) {
        $scope.apiDevices = [];
        var elements = dataService.getDevicesData(devices,false);
        obj = _.find(elements.value(), function(el) {
            return  el.id == $scope.vDevId;
        });

        $scope.input.id = obj.id;
        $scope.input.name = obj.metrics.title;


        $scope.apiDevices.push(obj);

    };
});
