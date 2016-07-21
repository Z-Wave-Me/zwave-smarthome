/**
 * @overview Controllers that handle the list of elements, as well as an element detail.
 * @author Martin Vach
 */

/**
 * The element root controller
 * @class ElementBaseController
 */
myAppController.controller('ElementBaseController', function ($scope, $q, $interval, $cookies, $filter, dataFactory, dataService) {
    $scope.dataHolder = {
        firstLogin: false,
        cnt: {
            devices: 0,
            collection: 0,
            hidden: 0
        },
        devices: {
            noDashboard: false,
            noDevices: false,
            show: true,
            all: {},
            byId: {},
            collection: {},
            deviceType: {},
            find: {},
            tags: [],
            filter: ($cookies.filterElements ? angular.fromJson($cookies.filterElements) : {}),
            rooms: {},
            orderBy: ($cookies.orderByElements ? $cookies.orderByElements : 'creationTimeDESC'),
            showHidden: ($cookies.showHiddenEl ? $filter('toBool')($cookies.showHiddenEl) : false)
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
            if (devices.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                $scope.dataHolder.devices.show = false;
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.dataHolder.devices.rooms = dataService.getRooms(locations.value.data.data).indexBy('id').value();
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                // Count hidden apps
                $scope.dataHolder.cnt.hidden = _.chain(dataService.getDevicesData(devices.value.data.data.devices, true))
                        .flatten().where({visibility: false})
                        .size()
                        .value();
                // Set devices
                setDevices(dataService.getDevicesData(devices.value.data.data.devices, $scope.dataHolder.devices.showHidden));

            }
        });
    };
    $scope.allSettled();

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
                                {iconPath: dataService.assignElementIcon(v)},
                                {updateTime: v.updateTime}
                        );
                        //console.log('Updating from server response: device ID: ' + v.id + ', metrics.level: ' + v.metrics.level + ', updateTime: ' + v.updateTime);
                    });
                }
                if (response.data.data.structureChanged === true) {
                    $scope.allSettled();
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
        if (!filter) {
            angular.extend($scope.dataHolder.devices, {filter: {}});
            $cookies.filterElements = angular.toJson({});
        } else {
            angular.extend($scope.dataHolder.devices, {filter: filter});
            $cookies.filterElements = angular.toJson(filter);
        }

        $scope.reloadData();
    };

    /**
     * Show hidden elements
     */
    $scope.showHiddenEl = function (status) {
        angular.extend($scope.dataHolder.devices, {filter: {}});
        $cookies.filterElements = angular.toJson({});
        status = $filter('toBool')(status);
        angular.extend($scope.dataHolder.devices, {showHidden: status});
        $cookies.showHiddenEl = status;
        $scope.reloadData();
    };

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.devices, {orderBy: key});
        $cookies.orderByElements = key;
        $scope.reloadData();
    };

    /**
     * Run command
     */
    $scope.runCmd = function (cmd, id) {
        dataFactory.runApiCmd(cmd).then(function (response) {
            var index = _.findIndex($scope.dataHolder.devices.all, {id: id});
            if ($scope.dataHolder.devices.all[index]) {
                angular.extend($scope.dataHolder.devices.all[index],
                        {imgTrans: true}
                );
            }

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
     * Delete device history
     */
    $scope.deleteHistory = function (input, message, event) {
        alertify.confirm(message, function () {
            dataFactory.deleteApi('history', input.id).then(function (response) {
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.handleModal('modalHistory', event);
                $scope.reloadData();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });

        });
    };

    /**
     * Set visibility
     */
    $scope.setVisibility = function (v, visibility) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', v.id, {visibility: visibility}).then(function (response) {
            $scope.loading = false;
            $scope.reloadData();
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
    };

    /**
     * Set exact value for the command
     */
    $scope.setExactCmd = function (v, type, run) {
        var count;
        var val = parseInt(v.metrics.level);
        var min = parseInt(v.minMax.min, 10);
        var max = parseInt(v.minMax.max, 10);
        var step = parseFloat(v.minMax.step);
        switch (type) {
            case '-':
                count = val - step;
                break;
            case '+':
                count = val + step;
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
        v.metrics.level = count;
         //console.log('ElementBaseController.setExactCmd - Sending request: ', cmd)
        //if (run) {
            $scope.runCmd(cmd);
       // }

        //return cmd;
    };

    /// --- Private functions --- ///
    /**
     * Set device
     */
    function setDevices(devices) {
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
        $scope.dataHolder.devices.deviceType = devices.countBy(function (v) {
            return v.deviceType;
        }).value();

        $scope.dataHolder.cnt.devices = devices.size().value();

        //All devices
        $scope.dataHolder.devices.all = devices.value();
        if (_.isEmpty($scope.dataHolder.devices.all)) {
            $scope.dataHolder.devices.noDevices = true;
            return;
        }
        // Collection
        if ('tag' in $scope.dataHolder.devices.filter) {
            $scope.dataHolder.devices.collection = _.filter($scope.dataHolder.devices.all, function (v) {
                if (v.tags.indexOf($scope.dataHolder.devices.filter.tag) > -1) {
                    return v;
                }
            });
        } else {
            $scope.dataHolder.devices.collection = _.where($scope.dataHolder.devices.all, $scope.dataHolder.devices.filter);
        }
        if (_.isEmpty($scope.dataHolder.devices.collection)) {
            if ($scope.routeMatch('/dashboard')) {
                $scope.dataHolder.devices.noDashboard = true;
            } else {
                $scope.dataHolder.devices.noDevices = true;
            }
        }
        $scope.dataHolder.cnt.collection = _.size($scope.dataHolder.devices.collection);
    }
    ;

});

/**
 * The controller that handles a device history.
 * @class ElementHistoryController
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
 * The controller that handles SwitchMultilevel element.
 * @class ElementSwitchMultilevelController
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
 * The controller that handles Thermostat element.
 * @class ElementThermostatController
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
 * The controller that handles SwitchRGBW element.
 * @class ElementSwitchRGBWController
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
 * The controller that handles SensorMultiline element.
 * @class ElementSensorMultilineController
 */
myAppController.controller('ElementSensorMultilineController', function ($scope, $timeout, dataFactory, dataService) {
    $scope.widgetSensorMultiline = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var arr = [];
            arr[0] = response.data.data;
            $scope.widgetSensorMultiline.find = dataService.getDevicesData(arr).value()[0];
            if (_.isEmpty(response.data.data.metrics.sensors)) {
                $scope.widgetSensorMultiline.alert = {message: $scope._t('no_data'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
           $scope.widgetSensorMultiline.find.metrics.sensors = dataService.getDevicesData(response.data.data.metrics.sensors).value();
        }, function (error) {
            $scope.widgetSensorMultiline.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };
    $scope.loadDeviceId();
    /**
     * Run a command request
     */
    $scope.runMultilineCmd = function (cmd, id) {
        $scope.runCmd(cmd, id);
        $scope.loadDeviceId();
        $timeout(function () {
            $scope.loadDeviceId();
        }, 2000);
    };

});

/**
 * The controller that handles Camera element.
 * @class ElementCameraController
 */
myAppController.controller('ElementCameraController', function ($scope, $interval) {
    $scope.widgetCamera = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    $scope.url = undefined;
    $scope.refreshInterval = undefined;
    /**
     * Set camera url
     */
    $scope.setUrl = function () {
        var url = $scope.widgetCamera.find.metrics.url;
        if ($scope.widgetCamera.find.metrics.autoRefresh === true) {
            var now = new Date().getTime();
            if (url.indexOf('?') === -1) {
                url = url + '?' + now;
            } else {
                url = url + '&' + now;
            }
        }
        $scope.url = url;
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
        $scope.setUrl();
        if ($scope.widgetCamera.find.metrics.autoRefresh === true) {
            $scope.refreshInterval = $interval($scope.setUrl, 1000 * 15);
        }
        return;
    };
    $scope.loadDeviceId();
});

/**
 * The controller that handles Text element.
 * @class ElementTextController
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
 * The controller that handles OpenWeather element.
 * @class ElementOpenWeatherController
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
 * The controller that handles ClimateControl element.
 * @class ElementClimateControlController
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
                                {roomIcon: $scope.dataHolder.devices.rooms[v.room].img_src},
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
 * The controller that handles elements on the dashboard.
 * @class ElementDashboardController
 */
myAppController.controller('ElementDashboardController', function ($scope, $routeParams) {
    $scope.dataHolder.devices.filter = {onDashboard: true};
    $scope.elementDashboard = {
        firstLogin: ($routeParams.firstlogin || false),
        firstFile: ($scope.lang === 'de' ? 'first_login_de.html' : 'first_login_en.html')
    };


});

/**
 * The controller that handles elements in the room.
 * @class ElementRoomController
 */
myAppController.controller('ElementRoomController', function ($scope, $routeParams, $window, $location, $cookies, $filter, dataFactory, dataService, myCache) {
    $scope.dataHolder.devices.filter = {location: parseInt($routeParams.id)};

});

/**
 * The controller that handles element detail actions.
 * @class ElementIdController
 */
myAppController.controller('ElementIdController', function ($scope, $q, $routeParams, $filter, dataFactory, dataService, myCache) {
    $scope.elementId = {
        show: false,
        appType: {},
        input: {},
        locations: {},
        instances: {}
    };
    $scope.tagList = [];
    $scope.search = {
        text: ''
    };
    $scope.suggestions = [];

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('devices', '/' + $routeParams.id),
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices')

        ];

        if ($scope.user.role === 1) {
            promises.push(dataFactory.getApi('instances'));
        }

        $q.allSettled(promises).then(function (response) {
            var device = response[0];
            var locations = response[1];
            var devices = response[2];
            var instances = response[3];

            $scope.loading = false;
            // Error message
            if (device.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.elementId.locations = dataService.getRooms(locations.value.data.data).indexBy('id').value();
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                setTagList(devices.value.data.data.devices);
            }
            // Success - instances
            if (instances && instances.state === 'fulfilled') {
                $scope.elementId.instances = instances.value.data.data;
            }
            // Success - device
            if (device.state === 'fulfilled') {
                var arr = [];
                arr[0] = device.value.data.data;
                if (!dataService.getDevicesData(arr, true).value()[0]) {
                    alertify.alertError($scope._t('error_load_data'));
                    return;
                }
                setDevice(dataService.getDevicesData(arr, true).value()[0]);
                $scope.elementId.show = true;
            }


        });
    };
    $scope.allSettled();

    /**
     * Search me
     */
    $scope.searchMe = function () {
        $scope.suggestions = [];
        if ($scope.search.text.length >= 2) {
            findText($scope.tagList, $scope.search.text,$scope.elementId.input.tags);
        }
    };

    /**
     * Add tag to list
     */
    $scope.addTag = function (tag) {
        tag = tag || $scope.search.text;
        $scope.suggestions = [];
        if (!tag || $scope.elementId.input.tags.indexOf(tag) > -1) {
            return;
        }
        $scope.elementId.input.tags.push(tag);
        $scope.search.text = '';
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function (index) {
        $scope.elementId.input.tags.splice(index, 1);
        $scope.suggestions = [];
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
            dataService.goBack();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    };

    /// --- Private functions --- ///
    /**
     * Set device
     */
    function setDevice(device) {
        var findZwaveStr = "ZWayVDev_zway_";
        var findZenoStr = "ZEnoVDev_zeno_x";
        var zwaveId = false;
        $scope.elementId.input = device;
        //$scope.elementId.input.custom_icons = { on: 'Modem-icon.png',off: 'Stop-icon.png'};
        if (device.id.indexOf(findZwaveStr) > -1) {
            zwaveId = device.id.split(findZwaveStr)[1].split('-')[0];
            $scope.elementId.appType['zwave'] = zwaveId.replace(/[^0-9]/g, '');
        } else if (device.id.indexOf(findZenoStr) > -1) {
            $scope.elementId.appType['enocean'] = device.id.split(findZenoStr)[1].split('_')[0];
        } else {
            var instance = _.findWhere($scope.elementId.instances, {id: $filter('toInt')(device.creatorId)});
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
            'visibility': input.visibility,
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
    function findText(n, search, exclude) {
        var gotText = false;
        for (var i in n) {
            var re = new RegExp(search, "ig");
            var s = re.test(n[i]);
            if (s
                && (! _.isArray(exclude) || exclude.indexOf(n[i]) === -1)) {
                $scope.suggestions.push(n[i]);
                gotText = true;
            }
        }
        return gotText;
    }
    ;

});

/**
 * The controller that handles custom icon actions in the elemt detail view.
 * @class ElementIconController
 */
myAppController.controller('ElementIconController', function ($scope, $timeout, $filter, cfg, dataFactory, dataService) {
    $scope.icons = {
        selected: false,
        uploadedFileName: false,
        all: {},
        uploaded: {},
        info: {
            maxSize: $filter('fileSizeString')(cfg.upload.icon.size),
            extensions: cfg.upload.icon.extension.toString()
        }
    };
    /**
     * Load icons from config
     * @returns {undefined}
     */
    $scope.loadCfgIcons = function () {
        $scope.icons.all = dataService.getSingleElementIcons($scope.elementId.input);

    };
    //$scope.loadCfgIcons();

    /**
     * Load already uploaded icons
     * @returns {undefined}
     */
    $scope.loadUploadedIcons = function () {
        // Atempt to load data
        dataFactory.getApiLocal('icons.json').then(function (response) {
            $scope.icons.uploaded = response.data.data;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });

    };
    //$scope.loadUploadedIcons();
    /**
     * Set selected icon
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.setSelectedIcon = function (icon) {
        if (!icon) {
            return;
        }
        $scope.icons.selected = icon;
    };
    /**
     * Set a custom icon with an icon from the list
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.setCustomIcon = function (icon) {
        if (!icon) {
            return;
        }
        $scope.icons.all.custom[$scope.icons.selected] = icon;

    };
    /**
     * Remove a custom icon
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.removeCustomIcon = function (icon) {
        if (!icon) {
            return;
        }
        delete $scope.icons.all.custom[icon];

    };

    /**
     * Update custom icons with selected icons from the list
     * @returns {undefined}
     */
    $scope.updateWithCustomIcon = function () {
        var input = {
            id: $scope.elementId.input.id,
            custom_icons: $scope.icons.all.custom
        };
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', $scope.elementId.input.id, input).then(function (response) {
            $scope.icons.selected = false;
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_update_data'));
        });
    };
    /**
     * Cancel all updates and hide a list with uploaded icons
     * @returns {undefined}
     */
    $scope.cancelUpdate = function () {
        // Reset icons
        $scope.loadCfgIcons();
        // Set selected icon to false
        $scope.icons.selected = false;
    };
    /**
     * Check and validate an uploaded file
     * @param {object} files
     * @returns {undefined}
     */
    $scope.checkUploadedFile = function (files) {
        // Extends files object with a new property
        files[0].newName = dataService.uploadFileNewName(files[0].name);
        // Check allowed file formats
        //if(cfg.upload.room.type.indexOf(files[0].type) === -1){
        if (cfg.upload.icon.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                    $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                    $scope._t('upload_allowed_formats', {'__extensions__': $scope.icons.info.extensions})
                    );
            return;

        }
        // Check allowed file size
        if (files[0].size > cfg.upload.icon.size) {
            alertify.alertError(
                    $scope._t('upload_allowed_size', {'__size__': $scope.icons.info.maxSize}) + ' ' +
                    $scope._t('upload_size_is', {'__size__': $filter('fileSizeString')(files[0].size)})
                    );
            return;

        }
        // Check if uploaded filename already exists
        if (_.findWhere($scope.icons.uploaded, {file: files[0].name})) {
            // Displays a confirm dialog and on OK atempt to upload file
            alertify.confirm($scope._t('uploaded_file_exists', {__file__: files[0].name})).set('onok', function (closeEvent) {
                uploadFile(files);
            });
        } else {
            uploadFile(files);
        }

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
        var input = {file: files[0].name, device: []};
        // Set selected file name
        $scope.icons.uploadedFileName = files[0].name;
        // Set form data
        fd.append('files_files', files[0]);

        // Atempt to upload a file
        dataFactory.getApiLocal('icons.json').then(function (response) {
            $timeout(function () {
                if (!_.findWhere($scope.icons.uploaded, {file: files[0].name})) {
                    $scope.icons.uploaded.push({file: files[0].name});
                }
                $scope.icons.all.custom[$scope.icons.selected] = files[0].name;
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('success_upload')});
            }, 1000);

        }, function (error) {
            alertify.alertError($scope._t('error_upload'));
            $scope.loading = false;
        });
    }
    ;

    /**
     * ???
     */
    function updateUploaded(input) {
        var output = [];
        angular.forEach(input.custom_icons, function (v, k) {

            var index = _.findIndex($scope.icons.uploaded, {file: v});
            if (index === -1) {
                return;
            }
            if ($scope.icons.uploaded[index].device.indexOf(input.id) === -1) {
                $scope.icons.uploaded[index].device.push(input.id);
            }
            if (!_.findWhere(output, {file: v})) {
                output.push({file: $scope.icons.uploaded[index].file, device: $scope.icons.uploaded[index].device});
            }
        });
        console.log(output);
    }
    ;

    /**
     * ???
     */
    function removeDeviceFromUploaded(input) {
        var output = [];
        angular.forEach(input.isset_icons, function (v, k) {
            var index = _.findIndex($scope.icons.uploaded, {file: v});
            if (index === -1) {
                return;
            }
            if ($scope.icons.uploaded[index].device.indexOf(input.id) === -1) {
                $scope.icons.uploaded[index].device.push(input.id);
            }
            if (!_.findWhere(output, {file: v})) {
                output.push({file: $scope.icons.uploaded[index].file, device: $scope.icons.uploaded[index].device});
            }
        });
        console.log(output);
    }
    ;
});