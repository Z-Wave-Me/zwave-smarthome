/**
 * @overview 
 * @author Michael Hensche
 */


/**
 * 
 * @class ClimateController
 */
myAppController.controller('ClimateController', function($scope, $routeParams, $location, $timeout, $interval, cfg, dataFactory, dataService, _, myCache) {
    $scope.climate = {
        moduleId: 'Climate',
        state: '',
        enableTest: []
    };

    /**
     * Load instance with security module
     * @returns {undefined}
     */
    $scope.loadClimateModule = function() {
        dataFactory.getApi('instances', null, true).then(function(response) {
            var climate = _.findWhere(response.data.data, {
                moduleId: $scope.climate.moduleId
            });
            if (!climate || climate.id < 1) {
                $location.path('/climate/0');
                return;
            }
            $location.path('/climate/' + climate.id);
        }, function(error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadClimateModule();

});

/**
 * Controller that handles a climate detail
 * @class ClimateIdController
 */
myAppController.controller('ClimateIdController', function($scope, $routeParams, $location, $timeout, $filter, cfg, dataFactory, dataService, _, myCache) {
    $scope.climate = {
        rooms: [],
        devices: {
            all: [],
            byRoom: {}
        },
        routeId: 0,
        input: {
            instanceId: $routeParams.id,
            moduleId: "Climate",
            active: true,
            title: "",
            params: {
                roomSettings: {
                    roomTable: []
                },
                schedule: {
                    scheduleTable: []
                },
                resetTime: 2
            }
        },
        cfg: {
            energySave: {
                min: 14,
                max: 27,
                step: 0.5,
                temp: []
            },
            comfort: {
                min: 14,
                max: 27,
                step: 0.5,
                temp: []
            },
            fallback: [
                "F",
                "E",
                "C"
            ],
            roomSettings: {

            },
            schedule: {

            },
            resetTime: {

            }
        }
    };

    // {
    //                 start: '09:00',
    //                 end: '12:00',
    //                 text: 'Text Area',
    //                 data: {}
    //             }
    $scope.scheduleOptions = {
        startTime: "00:00", // schedule start time(HH:ii)
        endTime: "24:00", // schedule end time(HH:ii)
        widthTime: 60 * 5, // cell timestamp  5 minutes
        timeLineY: 30, // height(px)
        verticalScrollbar: 20, // scrollbar (px)
        timeLineBorder: 2, // border(top and bottom)
        rows: {
            '0': {
                title: 'day_short_1',
                schedule: []
            },
            '1': {
                title: 'day_short_2',
                schedule: []
            },
            '2': {
                title: 'day_short_3',
                schedule: []
            },
            '3': {
                title: 'day_short_4',
                schedule: []
            },
            '4': {
                title: 'day_short_5',
                schedule: []
            },
            '5': {
                title: 'day_short_6',
                schedule: []
            },
            '6': {
                title: 'day_short_0',
                schedule: []
            }
        },
        change: function(node, data) {
            //alert("change event");
        },
        init_data: function(node, data) {},
        click: function(node, data) {
            console.log("data", data);
            console.log("node", node);
        },
        append: function(node, data) {
            //alert("append");
        },
        time_click: function(time, data, timeline, timelineData) {
            console.log("this", this);
            console.log("time", time);
            console.log("data", data);
            console.log("timeline", timeline);
            console.log("timelineData", timelineData);
            var start = this.calcStringTime(data),
                end = start + 3600;
            var newEntry = {
                data: {},
                start: start,
                end: end,
                text: "new Entry",
                timeline: parseInt(timeline)
            };
            console.log(newEntry);
            this.addScheduleData(newEntry);
        },
        append_on_click: function(timeline, startTime, endTime) {
            console.log("timeline", timeline);
            console.log(startTime + " - " + endTime);
            var start = this.calcStringTime(startTime),
                end = this.calcStringTime(endTime);

            end = end == start ? end + 3600 : end;

            var newEntry = {
                timeline: parseInt(timeline),
                start: start,
                end: end,
                text: "new Entry",
                data: {}
            };
            console.log(newEntry);
            this.addScheduleData(newEntry);
        },
        bar_Click: function(node, timelineData) {
            console.log("timelineData", timelineData);
            console.log("node", node);
            $scope.handleModal('temperatureModal');
        }
    };
    angular.element("#schedule-test").timeSchedule($scope.scheduleOptions);
    $scope.schedules = [];
    $scope.renderSchedule = function(id) {
        if ($scope.schedules.indexOf(id) == -1) {
            $timeout(function() {
                angular.element(id).timeSchedule($scope.scheduleOptions);
                var titles = angular.element(".title");
                angular.forEach(titles, function(t) {
                    var title = angular.element(t).data('title');
                    angular.element(t).html($scope._t(title));
                });

            }, 0);
            $scope.schedules.push(id);
        }
    }

    /**
     * Load instance
     */
    $scope.loadInstance = function(id) {
        dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
            $scope.climate.routeId = id;
            var instance = instances.data.data;
            angular.extend($scope.climate.input, {
                title: instance.title,
                active: instance.active,
                params: instance.params
            });

        }, function(error) {
            alertify.alertError($scope._t('error_load_data'));
        });

    };

    if ($routeParams.id > 0) {
        $scope.loadInstance($routeParams.id);
    }

    $scope.init = function() {
        $scope.climate.cfg.energySave.temp = temperatureArray($scope.climate.cfg.energySave);
        $scope.climate.cfg.comfort.temp = temperatureArray($scope.climate.cfg.comfort);
    }
    $scope.init();

    /**
     * Load rooms
     */
    $scope.loadRooms = function() {
        dataFactory.getApi('locations').then(function(response) {
            var rooms = response.data.data.filter(function(r) {
                return r.id !== 0; // get rooms without global room (id 0)
            });
            $scope.climate.rooms = dataService.getRooms(rooms).indexBy('id').value();
            $scope.loadDevices($scope.climate.rooms);
        });

    };
    $scope.loadRooms();

    /**
     * Load devices
     */
    $scope.loadDevices = function(rooms) {
        dataFactory.getApi('devices').then(function(response) {
            var devices = dataService.getDevicesData(response.data.data.devices);
            var roomKeys = Object.keys(rooms);
            _.filter(devices.value(), function(v) {
                if (roomKeys.indexOf(v.location.toString()) != -1) {
                    if (v.deviceType == "sensorMultilevel" && v.probeType == "temperature") {
                        var getZwayId = function(deviceId) {
                            var zwaveId = false;
                            if (deviceId.indexOf("ZWayVDev_zway_") > -1) {
                                zwaveId = deviceId.split("ZWayVDev_zway_")[1].split('-')[0];
                                return zwaveId.replace(/[^0-9]/g, '');
                            }
                            return zwaveId;
                        }
                        var obj = {
                            deviceId: v.id,
                            zwaveId: getZwayId(v.id),
                            deviceName: v.metrics.title,
                            deviceNameShort: $filter('cutText')(v.metrics.title, true, 30) + (getZwayId(v.id) ? '#' + getZwayId(v.id) : ''),
                            deviceType: v.deviceType,
                            probeType: v.probeType,
                            location: v.location,
                            locationName: rooms[v.location].title,
                            iconPath: v.iconPath
                        };
                        $scope.climate.devices.all.push(obj);

                        if ($scope.climate.devices.byRoom[v.location]) {
                            $scope.climate.devices.byRoom[v.location].push(obj);
                        } else {
                            $scope.climate.devices.byRoom[v.location] = [];
                            $scope.climate.devices.byRoom[v.location].push(obj);
                        }
                    }

                }
            });
        }, function(error) {});
    };



    /**
     * Store climate
     */
    $scope.storeInstance = function(input, redirect) {
        dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function(response) {
            if (redirect) {
                $location.path('/automations');
            }

        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
        });

    };
    /**
     * Return a array with temperatures base on temp
     * @param  {object} temp {min: 12, max: 15, step: 0.5}
     * @return {Array}  Array with temperatures ["12","12.5","13","13.5","14","14.5","15"]
     */
    function temperatureArray(temp) {
        var arr = [];
        for (var i = temp.min; i <= temp.max; i += temp.step) {
            arr.push(i.toString());
        }
        return arr;
    }

});

/**
 * Controller that handles a cliamte schedule temperature
 * @class ClimateTemperatureController
 */
myAppController.controller('ClimateTemperatureController', function($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {


});