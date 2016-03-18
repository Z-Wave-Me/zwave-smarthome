/**
 * Application Element controller
 * @author Martin Vach
 */

/**
 * Elemt base controller 
 */
myAppController.controller('ElementBaseController', function ($scope, $routeParams, $interval, $location, $cookies, $filter, dataFactory, dataService) {
    $scope.dataHolder = {
        devices: {
            welcome: false,
            show: true,
            all: {},
            byId: {},
            collection: {},
            deviceType: {},
            find: {},
            tags: [],
            filter: ($cookies.filterElements ? angular.fromJson($cookies.filterElements) : {}),
            rooms: {},
            orderBy: ($cookies.orderByElements ? $cookies.orderByElements : 'creationTimeDESC')
        }
    };
    $scope.apiDataInterval = null;

    /**
     * Cancel interval on page destroy
     */
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load locations
     */
    $scope.loadLocations = function () {
        dataFactory.getApi('locations').then(function (response) {
            angular.extend($scope.dataHolder.devices.rooms, _.indexBy(response.data.data, 'id'));
        }, function (error) {});
    }
    ;
    $scope.loadLocations();

    /**
     * Load data into collection
     */
    $scope.loadDevices = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices', null, true).then(function (response) {
            $scope.loading = false;
            var devices = dataService.getDevicesData(response.data.data.devices);
            // Set tags
            _.filter(devices.value(), function (v) {
                if (v.tags.length > 0) {
                    angular.forEach(v.tags, function (t) {
                        if ($scope.dataHolder.devices.tags.indexOf(t) === -1) {
                            $scope.dataHolder.devices.tags.push(t);
                        }
                    });
                }
            });
            // Set categories
            $scope.dataHolder.devices.deviceType = devices
                    .reject(function (v) {
                        return !('deviceType' in v);
                    })
                    .uniq(function (v) {
                        return v.deviceType;
                    })
                    .pluck('deviceType')
                    .value();
            
            //All devices
            $scope.dataHolder.devices.all = devices.value();
            // Build collection and run all filters
            $scope.dataHolder.devices.collection = _.filter($scope.dataHolder.devices.all,function (device) {
                var match = _.every($scope.dataHolder.devices.filter,function(filterValue,filterKey) {
                    if (filterKey === 'tag') {
                        if (device.tags.indexOf(filterValue) > -1) {
                            return true; 
                        }
                    } else if (filterValue === device[filterKey]) {
                        return true;
                    }
                    return false;
                });
                return match;
            });
            if (_.isEmpty($scope.dataHolder.devices.all)) {
                $scope.dataHolder.devices.welcome = true;
            }
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
            $scope.dataHolder.devices.show = false;
        });
    };
    $scope.loadDevices();
    /**
     * Get device by ID
     */
    $scope.getDeviceById = function (id) {
        var device = _.where($scope.dataHolder.devices.collection, {id: id});
        if (device[0]) {
            angular.extend($scope.dataHolder.devices.byId, device[0]);
        }
    };



    /**
     * Refresh data
     */
    $scope.refreshDevices = function () {
        var refresh = function () {
            dataFactory.refreshApi('devices').then(function (response) {
                if (response.data.data.devices.length > 0) {
                    angular.forEach(response.data.data.devices, function (v, k) {
                        if (v.metrics.level) {
                            v.metrics.level = $filter('numberFixedLen')(v.metrics.level);
                        }
                        var index = _.findIndex($scope.dataHolder.devices.all, {id: v.id});
                        if (!$scope.dataHolder.devices.all[index]) {
                            return;
                        }
                        angular.extend($scope.dataHolder.devices.all[index],
                                {metrics: v.metrics},
                                {imgTrans: false},
                                {iconPath: $filter('getElementIcon')(v.metrics.icon, v, v.metrics.level)},
                                {updateTime: v.updateTime}
                        );
                        console.log('Updating device ID: ' + v.id + ', metrics.level: ' + v.metrics.level + ', updateTime: ' + v.updateTime + ', iconPath: ' + $filter('getElementIcon')(v.metrics.icon, v, v.metrics.level))
                    });
                }
                if (response.data.data.structureChanged === true) {
                    $scope.loadDevices();
                }

            }, function (error) {
                $interval.cancel($scope.apiDataInterval);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshDevices();

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        var newFilter = {};
        if (!filter) {
            angular.extend($scope.dataHolder.devices, {filter: {}});
        } else {
            newFilter = angular.extend({}, $scope.dataHolder.devices.filter, filter);
            _.each(newFilter,function(value,key,list) {
                if (typeof(value) === 'undefined') {
                    delete list[key];
                }
            });
            angular.extend($scope.dataHolder.devices, {filter: newFilter});
        }
        $cookies.filterElements = angular.toJson(newFilter);

        $scope.loadDevices();
    };

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.devices, {orderBy: key});
        $cookies.orderByElements = key;

        $scope.loadDevices();
    };

    /**
     * Run command
     */
    $scope.runCmd = function (cmd, id) {
        //var widgetId = '#Widget_' + id;
        dataFactory.runApiCmd(cmd).then(function (response) {
            var index = _.findIndex($scope.dataHolder.devices.all, {id: id});
            if ($scope.dataHolder.devices.all[index]) {
                angular.extend($scope.dataHolder.devices.all[index],
                        {imgTrans: true}
                );
            }


//            if (id) {
//                $(widgetId + ' .widget-icon').addClass('trans-true');
//            }

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    };
    /**
     * Reset devicse data holder
     */
    $scope.resetDevices = function (devices) {
        angular.extend($scope.dataHolder.devices, devices);
    };

    /**
     * Set exact value for cmd command
     */
    $scope.setExactCmd = function (v, type, run) {
        //console.log(type)
        var count;
        var val = parseInt(v.metrics.level);
        var min = parseInt(v.minMax.min, 10);
        var max = parseInt(v.minMax.max, 10);
        switch (type) {
            case '-':
                count = val - 1;
                break;
            case '+':
                count = val + 1;
                break;
            default:
                count = parseInt(type, 10);
                break;
        }

        if (count < min) {
            count = min;
        }
        if (count > max) {
            count = max;
        }

        var cmd = v.id + '/command/exact?level=' + count;
        //if (count < 100 && count > 0) {
        v.metrics.level = count;
        //}
        if (run) {
            $scope.runCmd(cmd);
        }

        return cmd;
    };

});

/**
 * Element SensorMultiline controller
 */
myAppController.controller('ElementHistoryController', function ($scope, dataFactory, dataService, _) {
    $scope.widgetHistory = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        chartData: {},
        chartOptions: {
            // Chart.js options can go here.
            //responsive: true
        }
    };

    /**
     * Load device history
     */
    $scope.loadDeviceHistory = function () {
        var device = !_.isEmpty($scope.dataHolder.devices.byId) ? $scope.dataHolder.devices.byId : $scope.dataHolder.devices.find;
        if (!device) {
            $scope.widgetHistory.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetHistory.find = device;
        $scope.widgetHistory.alert = {message: $scope._t('loading'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        dataFactory.getApi('history', '/' + device.id + '?show=24', true).then(function (response) {
            $scope.widgetHistory.alert = {message: false};
            if (!response.data.data.deviceHistory) {
                $scope.widgetHistory.alert = {message: $scope._t('no_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                return;
            }
            $scope.widgetHistory.alert = {message: false};
            $scope.widgetHistory.chartData = dataService.getChartData(response.data.data.deviceHistory, $scope.cfg.chart_colors);
        }, function (error) {
            $scope.widgetHistory.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });

    };
    $scope.loadDeviceHistory();

});

/**
 * Element SwitchMultilevelController controller
 */
myAppController.controller('ElementSwitchMultilevelController', function ($scope) {
    $scope.widgetSwitchMultilevel = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    $scope.knobopt = {
        width: 160
    };
    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (!device) {
            $scope.widgetSwitchMultilevel.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetSwitchMultilevel.find = device[0];
        return;
    };

    $scope.loadDeviceId();

});

/**
 * Element thermostat controller
 */
myAppController.controller('ElementThermostatController', function ($scope) {
    $scope.widgetThermostat = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    $scope.knobopt = {
        width: 160
    };
    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (!device) {
            $scope.widgetSwitchMultilevel.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetThermostat.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * Element SwitchRGBW controller
 */
myAppController.controller('ElementSwitchRGBWController', function ($scope, dataFactory) {
    $scope.widgetSwitchRGBW = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        process: false
    };

    /**
     * Show RGB modal window
     */
    $scope.loadRgbWheel = function (input) {
        //$(target).modal();
        $scope.input = input;
        var bCanPreview = true; // can preview

        // create canvas and context objects
        var canvas = document.getElementById('wheel_picker');

        var ctx = canvas.getContext('2d');
        // drawing active image
        var image = new Image();
        image.onload = function () {
            ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
        };
        image.src = 'app/img/colorwheel.png';

        var defaultColor = "rgb(" + input.metrics.color.r + ", " + input.metrics.color.g + ", " + input.metrics.color.b + ")";
        $('#wheel_picker_preview').css('backgroundColor', defaultColor);

        $('#wheel_picker').mousemove(function (e) { // mouse move handler
            if (bCanPreview) {
                // get coordinates of current position
                var canvasOffset = $(canvas).offset();
                var canvasX = Math.floor(e.pageX - canvasOffset.left);
                var canvasY = Math.floor(e.pageY - canvasOffset.top);

                // get current pixel
                var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
                var pixel = imageData.data;

                // update preview color
                var pixelColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";

                if (pixelColor == 'rgb(0, 0, 0)') {
                    $('#wheel_picker_preview').css('backgroundColor', defaultColor);

                } else {
                    $('#wheel_picker_preview').css('backgroundColor', pixelColor);
                }

                // update controls
                $('#rVal').val('R: ' + pixel[0]);
                $('#gVal').val('G: ' + pixel[1]);
                $('#bVal').val('B: ' + pixel[2]);
                $('#rgbVal').val(pixel[0] + ',' + pixel[1] + ',' + pixel[2]);
            }
        });

        $('#wheel_picker').click(function (e) { // click event handler
            bCanPreview = !bCanPreview;
            if (!bCanPreview) {
                var cmdColor = $('#rgbVal').val().split(',');
                var cmd = input.id + '/command/exact?red=' + cmdColor[0] + '&green=' + cmdColor[1] + '&blue=' + cmdColor[2] + '';
                $scope.widgetSwitchRGBW.process = true;
                dataFactory.runApiCmd(cmd).then(function (response) {
                    $scope.widgetSwitchRGBW.process = false;
                }, function (error) {
                    $scope.widgetSwitchRGBW.process = false;
                    $scope.widgetSwitchRGBW.alert = {message: $scope._t('error_update_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                });
            }
        });
    };


    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetSwitchRGBW.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetSwitchRGBW.find = device[0];
        $scope.loadRgbWheel($scope.widgetSwitchRGBW.find);
        return;
    };
    $scope.loadDeviceId();

});


/**
 * Element SensorMultiline controller
 */
myAppController.controller('ElementSensorMultilineController', function ($scope) {
    $scope.widgetSensorMultiline = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetSensorMultiline.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetSensorMultiline.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * Element Camera controller
 */
myAppController.controller('ElementCameraController', function ($scope) {
    $scope.widgetCamera = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetCamera.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetCamera.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * Element text controller
 */
myAppController.controller('ElementTextController', function ($scope) {
    $scope.widgetText = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetText.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetText.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * Element OpenWeather controller
 */
myAppController.controller('ElementOpenWeatherController', function ($scope) {
    $scope.widgetOpenWeather = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetOpenWeather.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetOpenWeather.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * Element ClimateControl controller
 */
myAppController.controller('ElementClimateControlController', function ($scope, $filter, dataFactory) {
    $scope.widgetClimateControl = {
        find: {},
        rooms: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        model: [],
        devicesId: _.indexBy($scope.dataHolder.devices.all, 'id')
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var device = response.data.data;
            if (_.isEmpty(device)) {
                $scope.widgetClimateControl.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                return;
            }
            $scope.widgetClimateControl.find = device;
            $scope.widgetClimateControl.rooms = _.chain(device.metrics.rooms)
                    .flatten()
                    .filter(function (v) {
                        angular.extend(v,
                                {roomTitle: $scope.dataHolder.devices.rooms[v.room].title},
                                {roomIcon: $filter('getRoomIcon')($scope.dataHolder.devices.rooms[v.room])},
                                {sensorLevel: $scope.widgetClimateControl.devicesId[v.mainSensor] ? $scope.widgetClimateControl.devicesId[v.mainSensor].metrics.level : null},
                                {scaleTitle: $scope.widgetClimateControl.devicesId[v.mainSensor] ? $scope.widgetClimateControl.devicesId[v.mainSensor].metrics.scaleTitle : null}
                        );
                        return v;
                    })
                    .value();


        }, function (error) {
            $scope.widgetClimateControl.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };
    $scope.loadDeviceId();

    /**
     * Change climate element mode
     */
    $scope.changeClimateControlMode = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.runApiCmd(input.cmd).then(function (response) {
            $scope.widgetClimateControl.alert = {message: false};
            $scope.loadDeviceId();
        }, function (error) {
            $scope.widgetClimateControl.alert = {message: $scope._t('error_update_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            $scope.loading = false;
        });

    };
});

/**
 * Element dashboard controller
 */
myAppController.controller('ElementDashboardController', function ($scope, $routeParams, $window, $location, $cookies, $filter, dataFactory, dataService, myCache) {
    $scope.dataHolder.devices.filter = {onDashboard: true};

});

/**
 * Element room controller
 */
myAppController.controller('ElementRoomController', function ($scope, $routeParams, $window, $location, $cookies, $filter, dataFactory, dataService, myCache) {
    $scope.dataHolder.devices.filter = {location: parseInt($routeParams.id)};

});

/**
 * Element ID controller
 */
myAppController.controller('ElementIdController', function ($scope, $q, $routeParams, $window, $location, dataFactory, dataService, myCache) {
    $scope.elementId = {
        show: false,
        appType: {},
        input: {},
        locations: {},
        instances: {}
    };
    $scope.tagList = [];
    $scope.searchText = '';
    $scope.suggestions = [];
    $scope.autoCompletePanel = false;

    $scope.icons = [
        {
            default: $scope.cfg.img.icons + 'switch-off.png',
            custom: $scope.cfg.img.icons + 'dimmer-off.png'
        },
        {
            default: $scope.cfg.img.icons + 'switch-on.png',
            custom: false
        },
        {
            default: $scope.cfg.img.icons + 'temperature.png',
            custom: $scope.cfg.img.icons + 'dimmer-half.png'
        }
    ];

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('devices', '/' + $routeParams.id),
            dataFactory.getApi('locations'),
            dataFactory.getApi('instances'),
            dataFactory.getApi('devices')
        ];

        $q.allSettled(promises).then(function (response) {
            var device = response[0];
            var locations = response[1];
            var instances = response[2];
            var devices = response[3];
            $scope.loading = false;
            // Error message
            if (device.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.elementId.locations = locations.value.data.data;
            }
            // Success - instances
            if (locations.state === 'fulfilled') {
                $scope.elementId.instances = instances.value.data.data;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                setTagList(devices.value.data.data.devices);
            }
            // Success - device
            if (device.state === 'fulfilled') {
                var arr = [];
                arr[0] = device.value.data.data;
                setDevice(dataService.getDevicesData(arr).value()[0]);
                $scope.elementId.show = true;
            }



        });

    };
    $scope.allSettled();

    /**
     * Search me
     */
    $scope.searchMe = function (search) {
        $scope.suggestions = [];
        $scope.autoCompletePanel = false;
        if (search.length > 2) {
            var foundText = findText($scope.tagList, search);
            $scope.autoCompletePanel = (foundText) ? true : false;
            console.log($scope.autoCompletePanel)
        }
    };

    /**
     * Add tag to list
     */
    $scope.addTag = function (searchText) {
        $scope.searchText = '';
        $scope.autoCompletePanel = false;
        if (!searchText || $scope.elementId.input.tags.indexOf(searchText) > -1) {
            return;
        }
        $scope.elementId.input.tags.push(searchText);
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function (index) {
        $scope.elementId.input.tags.splice(index, 1);
        $scope.autoCompletePanel = false;
    };
    /**
     * Update an item
     */
    $scope.store = function (input) {
        if (input.id) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            dataFactory.putApi('devices', input.id, setOutput(input)).then(function (response) {
                $scope.user.dashboard = dataService.setArrayValue($scope.user.dashboard, input.id, input.onDashboard);
                $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, input.id, input.hide_events);
                $scope.updateProfile($scope.user, input.id);

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };
    /**
     * Update profile
     */
    $scope.updateProfile = function (profileData, deviceId) {
        dataFactory.putApi('profiles', profileData.id, profileData).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
            dataService.setUser(response.data.data);
            myCache.remove('devices');
            myCache.remove('devices/' + deviceId);
            myCache.remove('locations');
            $window.history.back();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    }

    /// --- Private functions --- ///
    /**
     * Set device
     */
    function setDevice(device) {
        var findZwaveStr = "ZWayVDev_zway_";
        var findZenoStr = "ZEnoVDev_zeno_x";
        var zwaveId = false;
        $scope.elementId.input = device;
        if (device.id.indexOf(findZwaveStr) > -1) {
            zwaveId = device.id.split(findZwaveStr)[1].split('-')[0];
            $scope.elementId.appType['zwave'] = zwaveId.replace(/[^0-9]/g, '');
        } else if (device.id.indexOf(findZenoStr) > -1) {
            $scope.elementId.appType['enocean'] = device.id.split(findZenoStr)[1].split('_')[0];
        } else {
            var instance = _.findWhere($scope.elementId.instances, {id: device.creatorId});
            if (instance && instance['moduleId'] != 'ZWave') {
                $scope.elementId.appType['instance'] = instance;

            }
        }
    }
    ;

    /**
     * Set output
     */
    function setOutput(input) {
        return {
            'id': input.id,
            'location': parseInt(input.location, 10),
            'tags': input.tags,
            'metrics': input.metrics,
            'permanently_hidden': input.permanently_hidden
        };
    }
    ;

    /**
     * Set tag list
     */
    function setTagList(devices) {
        angular.forEach(devices, function (v, k) {
            if (v.tags) {
                angular.forEach(v.tags, function (t, kt) {
                    if ($scope.tagList.indexOf(t) === -1) {
                        $scope.tagList.push(t);
                    }

                });
            }
        });
    }
    ;

    /**
     * Find text
     */
    function findText(n, search) {
        var gotText = false;
        for (var i in n) {
            var re = new RegExp(search, "ig");
            var s = re.test(n[i]);
            if (s) {
                $scope.suggestions.push(n[i]);
                gotText = true;
            }
        }
        return gotText;
    }
    ;

});
