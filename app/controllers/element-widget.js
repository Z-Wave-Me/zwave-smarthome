/**
 * @overview Controllers that handle specifics widget actions.
 * @author Martin Vach
 */

/**
 * The controller that handles a device chart.
 * @class ElementChartController
 */
myAppController.controller('ElementChartController', function ($scope, $sce, dataFactory, $interval) {
    $scope.widgetChart = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        hasURL: false,
        intchartUrl: '',
        url: {},
        time: 0,
        chartOptions: {
            // Chart.js options can go here.
            //responsive: true
        }
    };

    /**
     * Reload chart url
     */
    $scope.reloadUrl = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var device = response.data.data;

            if ($scope.widgetChart.time < device.metrics.intchartTime) {
                $scope.widgetChart.find = device;
                $scope.widgetChart.intchartUrl = device.metrics.intchartUrl + '&' + new Date().getTime();
                $scope.widgetChart.time = device.metrics.intchartTime;
                $scope.widgetChart.url = $sce.trustAsResourceUrl($scope.widgetChart.intchartUrl);
            }
        });
    };

    /**
     * Load device
     */
    $scope.loadDeviceUrl = function () {
        $scope.widgetChart.alert = {message: $scope._t('loading'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};

        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var device = response.data.data;
            if (!device) {
                $scope.widgetChart.alert = {
                    message: $scope._t('error_load_data'),
                    status: 'alert-danger',
                    icon: 'fa-exclamation-triangle'
                };
                return;
            }
            $scope.widgetChart.find = device;

            if (!device.metrics.intchartUrl) {
                $scope.widgetChart.alert = {
                    message: $scope._t('error_load_data'),
                    status: 'alert-danger',
                    icon: 'fa-exclamation-triangle'
                };
                return;
            }

            $scope.widgetChart.hasURL = true;
            $scope.widgetChart.intchartUrl = device.metrics.intchartUrl;
            $scope.widgetChart.time = device.metrics.intchartTime;
            $scope.widgetChart.url = $sce.trustAsResourceUrl($scope.widgetChart.intchartUrl);

            $scope.refreshInterval = $interval($scope.reloadUrl, $scope.cfg.interval);

            $scope.widgetChart.alert = {message: false};

        }, function (error) {
            $scope.widgetChart.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
        });
    };

    $scope.loadDeviceUrl();
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
            $scope.widgetHistory.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
            return;
        }
        $scope.widgetHistory.find = device;
        $scope.widgetHistory.alert = {
            message: $scope._t('loading'),
            status: 'alert-warning',
            icon: 'fa-spinner fa-spin'
        };
        dataFactory.getApi('history', '/' + device.id + '?show=24', true).then(function (response) {
            $scope.widgetHistory.alert = {message: false};
            if (!response.data.data.deviceHistory) {
                $scope.widgetHistory.alert = {
                    message: $scope._t('no_data'),
                    status: 'alert-danger',
                    icon: 'fa-exclamation-triangle'
                };
                return;
            }
            $scope.widgetHistory.alert = {message: false};
            $scope.widgetHistory.chartData = dataService.getChartData(response.data.data.deviceHistory, $scope.cfg.chart_colors);
        }, function (error) {
            $scope.widgetHistory.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
        });

    };
    $scope.loadDeviceHistory();

});

/**
 * The controller that handles a device events.
 * @class ElementEventController
 */
myAppController.controller('ElementEventController', function ($scope, $filter,$cookies, cfg,dataFactory, dataService, _) {
    $scope.widgetEvent = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        collection: []
    };

    /**
     * Load device events
     */
    $scope.loadDeviceEvents = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetEvent.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
            return;
        }
        // Get device icons
        var deviceIcons = dataService.getSingleElementIcons(device[0],true);
        // Set default or custom icons
        var icons = dataService.setIcon(deviceIcons['default'], deviceIcons['custom']);
        $scope.widgetEvent.find = device[0];
        var since = '?since=' + $scope.dataHolder.devices.notificationsSince;
        dataFactory.getApi('notifications', since, true).then(function (response) {
            $scope.widgetEvent.collection = _.chain(response.data.data.notifications)
                .flatten()
                .where({source: $scope.widgetEvent.find.id})
                .filter(function(v){
                    var hasL;
                    // Default event icon
                    v.iconPath = $filter('getEventIcon')(v.type,v.message);
                    // Has an event level?
                    hasL = $filter('hasNode')(v, 'message.l');

                    // Has device a level icon?
                    if(icons[hasL]){
                        v.iconPath = icons[hasL];
                        return v;
                    }
                    // Has device a default icon?
                    if(icons['default']){
                        v.iconPath = icons['default'];
                        return v;
                    }
                    return v;

                })
                .value();
            if (_.isEmpty($scope.widgetEvent.collection)) {
                $scope.widgetEvent.alert = {
                    message: $scope._t('no_events'),
                    status: 'alert-warning',
                    icon: 'fa-exclamation-circle'
                };
                return;
            }
        }, function (error) {
            $scope.widgetEvent.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
        });

    };
    $scope.loadDeviceEvents();

    /**
     * Redirect to events
     * @param {string} url
     */
    $scope.redirectToEvents = function (url) {
        // Setting time filter to 7 days
        var timeFilter = {
            since: $filter('unixStartOfDay')('-', (86400 * 6)),
            to: $filter('unixStartOfDay')('-', (86400 * 5)),
            day: 7
        };
        $cookies.events_timeFilter = angular.toJson(timeFilter);
        // Redirecting to events
        $scope.redirectToRoute(url);
    };

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
            $scope.widgetSwitchMultilevel.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
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
            $scope.widgetSwitchMultilevel.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
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
myAppController.controller('ElementSwitchRGBWController', function ($scope, dataFactory, $interval) {
    $scope.widgetSwitchRGBW = {
        find: {},
        all: [],
        alert: {message: false, status: 'is-hidden', icon: false},
        process: false,
        previewColor: 'rgb(255, 255, 255)',
        selectedColor: 'rgb(255, 255, 255)'
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
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height); // draw the image on the canvas
        };
        image.src = 'app/img/colorwheel.png';

        var defaultColor = "rgb(" + input.metrics.color.r + ", " + input.metrics.color.g + ", " + input.metrics.color.b + ")";
        //$('#wheel_picker_preview').css('backgroundColor', defaultColor);
        $scope.widgetSwitchRGBW.selectedColor = defaultColor;
        $scope.widgetSwitchRGBW.previewColor = defaultColor;
        $('#wheel_picker').mousemove(function (e) { // mouse move handler
            if (bCanPreview) {
                // get coordinates of current position
                var canvasOffset = $(canvas).offset();
                var canvasX = Math.floor(e.pageX - canvasOffset.left);
                var canvasY = Math.floor(e.pageY - canvasOffset.top);

                // get current pixel
                var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
                var pixel = imageData.data;

                updatePreviewColor(pixel[0], pixel[1], pixel[2]);

                // update controls
                $('#rVal').val('R: ' + pixel[0]);
                $('#gVal').val('G: ' + pixel[1]);
                $('#bVal').val('B: ' + pixel[2]);
                $('#rgbVal').val(pixel[0] + ',' + pixel[1] + ',' + pixel[2]);
            }
        });

        $('#wheel_picker').click(function (e) { // click event handler
            // bCanPreview = true;//!bCanPreview;
            if (bCanPreview) {
                var cmdColor = $('#rgbVal').val().split(',');
                var cmd = input.id + '/command/exact?red=' + cmdColor[0] + '&green=' + cmdColor[1] + '&blue=' + cmdColor[2] + '';
                var rgbColors = 'rgb(' + cmdColor[0] + ',' + cmdColor[1] + ',' + cmdColor[2] + ')';
                var rgbColorsObj = {
                    r: cmdColor[0],
                    g: cmdColor[1],
                    b: cmdColor[2]
                };
                $scope.widgetSwitchRGBW.process = true;
                dataFactory.runApiCmd(cmd).then(function (response) {
                    var findIndex = _.findIndex($scope.dataHolder.devices.collection, {id: input.id});
                    //angular.extend($scope.dataHolder.devices.collection[findIndex ].metrics,{rgbColors: rgbColors});
                    angular.extend($scope.dataHolder.devices.collection[findIndex].metrics.color, rgbColorsObj);
                    angular.extend(input.metrics.color, rgbColorsObj);
                    $scope.widgetSwitchRGBW.process = false;
                    $scope.widgetSwitchRGBW.selectedColor = rgbColors;
                }, function (error) {
                    $scope.widgetSwitchRGBW.process = false;
                    $scope.widgetSwitchRGBW.alert = {
                        message: $scope._t('error_update_data'),
                        status: 'alert-danger',
                        icon: 'fa-exclamation-triangle'
                    };
                });
            }
        });
    };

    $scope.colorHexChange = function() {
        var colorHex = $scope.widgetSwitchRGBW.colorHex;
        var rgb = hexToRgb(colorHex);
        $scope.widgetSwitchRGBW.find.metrics.color = rgb;
    };

    /**
     * Calls function when slider handle is grabbed
     */
    $scope.sliderOnHandleDown = function(input) {
        sliderInterval = $interval(function() {
            updatePreviewColor(input.metrics.color.r, input.metrics.color.g, input.metrics.color.b);
        }, 500);
    };


    /**
     * Calls function when slider handle is released
     */
    $scope.sliderOnHandleUpRGB = function(input) {
        $scope.setRGBColor(input);
        $interval.cancel($scope.widgetSwitchRGBW.sliderInterval);
    };

    /**
     * Calls function when slider handle is released
     */
    $scope.sliderOnHandleUp = function(input) {
        var count;
        var val = parseFloat(input.metrics.level);

        var cmd = input.id + '/command/exact?level=' + val;
        input.metrics.level = count;

        $scope.runCmd(cmd);
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetSwitchRGBW.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
            return;
        }
        angular.extend($scope.widgetSwitchRGBW.find, device[0]);

        // TODO finish refactoring
        /*var str = $scope.widgetSwitchRGBW.find.id;
        var index = str.indexOf('-');
        var res = str.substr(0, index);

        var devs = _.filter($scope.dataHolder.devices.collection, function(dev) {
           if(dev.id.indexOf(res) > -1) {
               return dev;
           }
        });

        $scope.widgetSwitchRGBW.all = devs;
        var find = _.find($scope.widgetSwitchRGBW.all, function(dev) {
            return dev.deviceType == 'switchRGBW';
        });

        var color = find.metrics.color;
        $scope.widgetSwitchRGBW.colorHex = rgbToHex(color.r, color.g, color.b);
        $scope.loadRgbWheel(find);*/
        $scope.loadRgbWheel($scope.widgetSwitchRGBW.find);
        return;
    };
    $scope.loadDeviceId();

    $scope.setRGBColor = function (input) {
        var cmd = input.id + '/command/exact?red=' + input.metrics.color.r + '&green=' + input.metrics.color.g + '&blue=' + input.metrics.color.b + '',
            rgbColors = 'rgb(' + input.metrics.color.r + ',' + input.metrics.color.g + ',' + input.metrics.color.b + ')',
            rgbColorsObj = input.metrics.color;

        $scope.widgetSwitchRGBW.process = true;
        dataFactory.runApiCmd(cmd).then(function (response) {
            var findIndex = _.findIndex($scope.dataHolder.devices.collection, {id: input.id});
            //angular.extend($scope.dataHolder.devices.collection[findIndex ].metrics,{rgbColors: rgbColors});
            angular.extend($scope.dataHolder.devices.collection[findIndex].metrics.color, rgbColorsObj);
            angular.extend($scope.widgetSwitchRGBW.find.metrics.color, rgbColorsObj);
            $scope.widgetSwitchRGBW.process = false;
            $scope.widgetSwitchRGBW.selectedColor = rgbColors;
        }, function (error) {
            $scope.widgetSwitchRGBW.process = false;
            $scope.widgetSwitchRGBW.alert = {
                message: $scope._t('error_update_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
        });
    }

    /// --- Private functions --- ///

    function updatePreviewColor(r,g,b) {
        // update preview color
        var pixelColor = "rgb(" + r + ", " + g + ", " + b + ")";
        pixelColor = (pixelColor == 'rgb(0, 0, 0)' ? $scope.widgetSwitchRGBW.selectedColor : pixelColor);
        $scope.widgetSwitchRGBW.previewColor = pixelColor;
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

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
                $scope.widgetSensorMultiline.alert = {
                    message: $scope._t('no_data'),
                    status: 'alert-warning',
                    icon: 'fa-exclamation-circle'
                };
                return;
            }
            $scope.widgetSensorMultiline.find.metrics.sensors = dataService.getDevicesData(response.data.data.metrics.sensors).value();
        }, function (error) {
            $scope.widgetSensorMultiline.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
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
            $scope.widgetCamera.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
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
            $scope.widgetText.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
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
            $scope.widgetOpenWeather.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
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
                $scope.widgetClimateControl.alert = {
                    message: $scope._t('error_load_data'),
                    status: 'alert-danger',
                    icon: 'fa-exclamation-triangle'
                };
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
            $scope.widgetClimateControl.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
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
            $scope.widgetClimateControl.alert = {
                message: $scope._t('error_update_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
            $scope.loading = false;
        });

    };
});

/**
 * The controller that handles Security Control  module.
 * @class ElementSecurityControlController
 */
myAppController.controller('ElementSecurityControlController', function ($scope, $filter, dataFactory) {
    $scope.widgetSecurityControl = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var lastTriggerList = response.data.data.metrics.lastTriggerList;
            if (_.isEmpty(lastTriggerList)) {
                $scope.widgetSecurityControl.alert = {
                    message: $scope._t('error_load_data'),
                    status: 'alert-danger',
                    icon: 'fa-exclamation-triangle'
                };
                return;
            }

            $scope.widgetSecurityControl.find = lastTriggerList;

        }, function (error) {
            $scope.widgetSecurityControl.alert = {
                message: $scope._t('error_load_data'),
                status: 'alert-danger',
                icon: 'fa-exclamation-triangle'
            };
        });
    };
    $scope.loadDeviceId();
});