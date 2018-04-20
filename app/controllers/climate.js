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
                    1: { // roomId
                        "comfortTemp": 25,
                        "energySaveTemp": 14,
                        "fallbackTemp": "",
                        "sensorId": "",
                        "schedule": {
                            0: [{ // SU 
                                "stime": "08:00",
                                "etime": "12:30",
                                "temp": 23.5
                            }, {
                                "stime": "12:30",
                                "etime": "19:30",
                                "temp": 25.5
                            }],
                            1: [{ // MO 
                                "stime": "08:00",
                                "etime": "12:30",
                                "temp": 23.5
                            }],
                            2: [{ // DI 
                                "stime": "08:00",
                                "etime": "12:30",
                                "temp": 23.5
                            }],
                            3: [{ // MI 
                                "stime": "08:00",
                                "etime": "12:30",
                                "temp": 23.5
                            }],
                            4: [{ // DO 
                                "stime": "08:00",
                                "etime": "12:30",
                                "temp": 23.5
                            }],
                            5: [{ // FR 
                                "stime": "08:00",
                                "etime": "12:30",
                                "temp": 23.5
                            }],
                            6: [{ // SA 
                                "stime": "08:00",
                                "etime": "12:30",
                                "temp": 23.5
                            }]
                        }
                    },
                    5: { // roomId
                        "comfortTemp": 22,
                        "energySaveTemp": 17,
                        "fallbackTemp": "",
                        "sensorId": "",
                        "schedule": []
                    },
                    6: { // roomId
                        "comfortTemp": 22,
                        "energySaveTemp": 15,
                        "fallbackTemp": "",
                        "sensorId": "",
                        "schedule": []
                    },
                    7: { // roomId
                        "comfortTemp": 22,
                        "energySaveTemp": 15,
                        "fallbackTemp": "",
                        "sensorId": "",
                        "schedule": []
                    }

                }
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
        },
        tempModal: {
            title: "",
            scheduleId: "",
            timeline: null,
            scheduleIndex: null,
            stime: null,
            etime: null,
            temp: {
                min: 14,
                max: 27,
                step: 0.5,
                value: 0
            }
        }
    };

    $scope.scheduleOptions = {
        startTime: "00:00", // schedule start time(HH:ii)
        endTime: "24:00", // schedule end time(HH:ii)
        widthTime: 60 * 5, // cell timestamp  5 minutes
        timeLineY: 30, // height(px)
        verticalScrollbar: 20, // scrollbar (px)
        timeLineBorder: 2, // border(top and bottom)
        rows: {
            '0': {
                title: 'day_short_0',
                schedule: []
            },
            '1': {
                title: 'day_short_1',
                schedule: []
            },
            '2': {
                title: 'day_short_2',
                schedule: []
            },
            '3': {
                title: 'day_short_3',
                schedule: []
            },
            '4': {
                title: 'day_short_4',
                schedule: []
            },
            '5': {
                title: 'day_short_5',
                schedule: []
            },
            '6': {
                title: 'day_short_6',
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
        bar_Click: function(node, timelineData, scheduleIndex) {
            console.log("timelineData", timelineData);
            $scope.climate.tempModal.scheduleId = "#" + $(this).attr('id');
            $scope.climate.tempModal.timeline = timelineData.timeline;
            $scope.climate.tempModal.stime = timelineData.start;
            $scope.climate.tempModal.etime = timelineData.end;
            $scope.climate.tempModal.scheduleIndex = scheduleIndex;
            $scope.climate.tempModal.title = this.formatTime(timelineData.start) + " - " + this.formatTime(timelineData.end);
            $scope.climate.tempModal.temp.value = timelineData.data.temp;
            $scope.handleModal('temperatureModal');
        }
    };
    angular.element("#schedule-test").timeSchedule($scope.scheduleOptions);
    $scope.jQuery_schedules = {};

    $scope.renderSchedule = function(scheduleId, roomId) {
        if (!$scope.jQuery_schedules[scheduleId]) {
            // add instance data
            var scheduleOptions_copy = {};
            angular.copy($scope.scheduleOptions, scheduleOptions_copy);
            var roomSetting = $scope.climate.input.params.roomSettings[roomId];

            if (roomSetting) {
                if (roomSetting.schedule) {
                    var days = Object.keys(roomSetting.schedule);
                    days.forEach(function(day) {
                        console.log("roomSetting.schedule[day]", roomSetting.schedule[day]);
                        roomSetting.schedule[day].forEach(function(schedule) {
                            console.log(schedule);
                            var sc = {
                                start: schedule.stime,
                                end: schedule.etime,
                                text: schedule.temp + " C°",
                                data: {
                                    temp: schedule.temp
                                }
                            }
                            scheduleOptions_copy.rows[day].schedule.push(sc);
                        });
                    });
                }
            }

            // set weekday titles
            $timeout(function() {
                var schedule = angular.element(scheduleId).timeSchedule(scheduleOptions_copy);
                var titles = angular.element(".title");
                angular.forEach(titles, function(t) {
                    var title = angular.element(t).data('title');
                    angular.element(t).html($scope._t(title));
                });
                $scope.jQuery_schedules[scheduleId] = schedule;
            }, 0);
        }
    }

    /**
     * watch modalArr to handle close temperatureModal
     */
    $scope.$watch("modalArr", function(newVal) {
        if (newVal.hasOwnProperty("temperatureModal") && !newVal.temperatureModal) {
            console.log("modal close");
            console.log($scope.climate.tempModal);
            var arr = $scope.climate.tempModal.scheduleId.split("-"),
                roomId = arr[1];
            if ($scope.climate.input.params.roomSettings[roomId]) {
                var jq_schedule = $scope.jQuery_schedules[$scope.climate.tempModal.scheduleId],
                    scIndex = _.findIndex($scope.climate.input.params.roomSettings[roomId].schedule[$scope.climate.tempModal.timeline], {
                        stime: jq_schedule.formatTime($scope.climate.tempModal.stime),
                        etime: jq_schedule.formatTime($scope.climate.tempModal.etime)
                    });
                console.log("jq_schedule", jq_schedule);
                $scope.climate.input.params.roomSettings[roomId].schedule[$scope.climate.tempModal.timeline][scIndex] = $scope.climate.tempModal.temp;
            }

        }
    }, true);

    $scope.init = function() {
        $scope.climate.cfg.energySave.temp = temperatureArray($scope.climate.cfg.energySave);
        $scope.climate.cfg.comfort.temp = temperatureArray($scope.climate.cfg.comfort);
    }
    $scope.init();

    /**
     * Load instance
     */
    $scope.loadInstance = function(id) {
        dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
            $scope.climate.routeId = id;
            // var instance = instances.data.data;
            // angular.extend($scope.climate.input, {
            //     title: instance.title,
            //     active: instance.active,
            //     params: instance.params
            // });

        }, function(error) {
            alertify.alertError($scope._t('error_load_data'));
        });

    };

    if ($routeParams.id > 0) {
        $scope.loadInstance($routeParams.id);
    }

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
     * Set temperature
     */
    $scope.setTemp = function(v, type, run) {
        var count;
        var val = parseFloat(v.value);
        var min = parseInt(v.min, 10);
        var max = parseInt(v.max, 10);
        var step = parseFloat(v.step);
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

        v.value = count;
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