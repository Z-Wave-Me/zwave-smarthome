/**
 * @overview 
 * @author Michael Hensche
 */


/**
 * 
 * @class HeatingController
 */
myAppController.controller('HeatingController', function($scope, $routeParams, $location, $timeout, $interval, cfg, dataFactory, dataService, _, myCache) {
    $scope.heating = {
        moduleId: 'Heating',
        state: '',
        enableTest: []
    };

    /**
     * Load instance with heating module
     * @returns {undefined}
     */
    $scope.loadHeatingModule = function() {
        dataFactory.getApi('instances', null, true).then(function(response) {
            var heating = _.findWhere(response.data.data, {
                moduleId: $scope.heating.moduleId
            });
            if (!heating || heating.id < 1) {
                $location.path('/heating/0');
                return;
            }
            $location.path('/heating/' + heating.id);
        }, function(error) {
            angular.extend(cfg.route.alert, {
                message: $scope._t('error_load_data')
            });
        });
    };
    $scope.loadHeatingModule();

});

/**
 * Controller that handles a heating detail
 * @class HeatingIdController
 */
myAppController.controller('HeatingIdController', function($scope, $routeParams, $location, $timeout, $filter, cfg, dataFactory, dataService, _, myCache) {
    $scope.heating = {
        rooms: [],
        devices: {
            all: [],
            byRoom: {}
        },
        routeId: 0,
        input: {
            instanceId: $routeParams.id,
            moduleId: "Heating",
            active: true,
            title: "",
            params: {}
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
            fallback: {
                "F": "frost_protection_temp",
                "E": "energy_save_temp",
                "C": "comfort_temp"
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
        change: function(node, data) {},
        init_data: function(node, data) {},
        click: function(node, data) {},
        append: function(node, data) {},
        time_click: function(time, data, timeline, timelineData) {
            console.log("this", this);
            console.log("time", time);
            console.log("data", data);
            console.log("timeline", timeline);
            console.log("timelineData", timelineData);

            var roomId = $(this).attr('id').split("-")[1],
                temp = $scope.heating.input.params.roomSettings[roomId].comfortTemp,
                start = this.calcStringTime(data),
                end = start + 3600,
                newEntry = {
                    data: {
                        temp: temp
                    },
                    start: start,
                    end: end,
                    text: temp + " C°",
                    timeline: parseInt(timeline)
                };
            this.addScheduleData(newEntry);
            $scope.updateData();
        },
        append_on_click: function(timeline, startTime, endTime) {
            var start = this.calcStringTime(startTime),
                end = this.calcStringTime(endTime),
                roomId = $(this).attr('id').split("-")[1],
                temp = $scope.heating.input.params.roomSettings[roomId].comfortTemp;

            end = end == start ? end + 3600 : end;

            var newEntry = {
                timeline: parseInt(timeline),
                start: start,
                end: end,
                text: temp + " C°",
                data: {
                    temp: temp
                }
            };

            this.addScheduleData(newEntry);
            $scope.updateData();
        },
        bar_Click: function(node, timelineData, scheduleIndex) {
            console.log("timelineData", timelineData);
            $scope.heating.tempModal.scheduleId = "#" + $(this).attr('id');
            $scope.heating.tempModal.timeline = timelineData.timeline;
            $scope.heating.tempModal.stime = timelineData.start;
            $scope.heating.tempModal.etime = timelineData.end;
            $scope.heating.tempModal.scheduleIndex = scheduleIndex;
            $scope.heating.tempModal.title = this.formatTime(timelineData.start) + " - " + this.formatTime(timelineData.end);
            $scope.heating.tempModal.temp.value = timelineData.data.temp;
            $scope.handleModal('temperatureModal');
        },
        connect: function(data) {
            var roomId = $(this).attr('id').split("-")[1],
                temp = $scope.heating.input.params.roomSettings[roomId].comfortTemp;
            data.data.temp = temp;
            data.text = temp + " C°";
            this.addScheduleData(data);
            $scope.updateData();
        }
    };
    angular.element("#schedule-test").timeSchedule($scope.scheduleOptions);
    $scope.jQuery_schedules = {};

    $scope.renderSchedule = function(scheduleId, roomId) {
        if (!$scope.jQuery_schedules[scheduleId]) {
            // add instance data
            var scheduleOptions_copy = {};
            angular.copy($scope.scheduleOptions, scheduleOptions_copy);
            var roomSetting = $scope.heating.input.params.roomSettings[roomId];

            if (roomSetting) {
                if (roomSetting.schedule) {
                    var days = Object.keys(roomSetting.schedule);
                    days.forEach(function(day) {
                        roomSetting.schedule[day].forEach(function(schedule) {
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
        } else {
            $timeout(function() {
                $scope.jQuery_schedules[scheduleId].resizeWindow();
            }, 0);
        }
    }

    /**
     * watch modalArr to handle close temperatureModal
     */
    $scope.$watch("modalArr", function(newVal) {
        if (newVal.hasOwnProperty("temperatureModal") && !newVal.temperatureModal) {
            $scope.updateData();
            console.log("modal close");
            console.log($scope.heating.tempModal);
            var arr = $scope.heating.tempModal.scheduleId.split("-"),
                roomId = arr[1];
            if ($scope.heating.input.params.roomSettings[roomId]) {
                var jq_schedule = $scope.jQuery_schedules[$scope.heating.tempModal.scheduleId],
                    scIndex = _.findIndex($scope.heating.input.params.roomSettings[roomId].schedule[$scope.heating.tempModal.timeline], {
                        stime: jq_schedule.formatTime($scope.heating.tempModal.stime),
                        etime: jq_schedule.formatTime($scope.heating.tempModal.etime)
                    });

                $scope.heating.input.params.roomSettings[roomId].schedule[$scope.heating.tempModal.timeline][scIndex].temp = parseInt($scope.heating.tempModal.temp.value);

                var rows_copy = {};
                angular.copy($scope.scheduleOptions.rows, rows_copy);

                var days = Object.keys($scope.heating.input.params.roomSettings[roomId].schedule);
                days.forEach(function(day) {
                    $scope.heating.input.params.roomSettings[roomId].schedule[day].forEach(function(schedule) {
                        console.log("schdeudle ", schedule);
                        var sc = {
                            start: schedule.stime,
                            end: schedule.etime,
                            text: schedule.temp + " C°",
                            data: {
                                temp: schedule.temp
                            }
                        }
                        rows_copy[day].schedule.push(sc);
                    });
                });
                jq_schedule.update(rows_copy);
            }

        }
    }, true);

    $scope.init = function() {
        $scope.heating.cfg.energySave.temp = temperatureArray($scope.heating.cfg.energySave);
        $scope.heating.cfg.comfort.temp = temperatureArray($scope.heating.cfg.comfort);
    }
    $scope.init();

    /**
     * Load instance
     */
    $scope.loadInstance = function(id) {
        dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
            $scope.heating.routeId = id;
            var instance = instances.data.data;
            angular.extend($scope.heating.input, {
                title: instance.title,
                active: instance.active,
                params: instance.params
            });

        }, function(error) {
            angular.extend(cfg.route.alert, {
                message: $scope._t('error_load_data')
            });
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
            $scope.heating.rooms = dataService.getRooms(rooms).indexBy('id').value();
            $scope.loadDevices($scope.heating.rooms);
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
                        $scope.heating.devices.all.push(obj);

                        if ($scope.heating.devices.byRoom[v.location]) {
                            $scope.heating.devices.byRoom[v.location].push(obj);
                        } else {
                            $scope.heating.devices.byRoom[v.location] = [];
                            $scope.heating.devices.byRoom[v.location].push(obj);
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

    $scope.updateData = function() {
        var schedule_ids = Object.keys($scope.jQuery_schedules);
        angular.forEach(schedule_ids, function(id) {
            var jq_sc = $scope.jQuery_schedules[id],
                roomId = id.split("-")[1],
                sc_data = jq_sc.getScheduleData(),
                data = {};

            angular.forEach(sc_data, function(day, k) {
                var sorted_sc = _.sortBy(day.schedule, 'start'),
                    new_sc = sorted_sc.map(function(sc) {
                        return {
                            "stime": sc.start,
                            "etime": sc.end,
                            "temp": sc.data.temp
                        };
                    });
                $scope.heating.input.params.roomSettings[roomId].schedule[k] = new_sc;
            });
        });
    };

    /**
     * Store heating
     */
    $scope.storeInstance = function(redirect) {
        $scope.updateData();
        dataFactory.storeApi('instances', parseInt($scope.heating.input.instanceId, 10), $scope.heating.input).then(function(response) {
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