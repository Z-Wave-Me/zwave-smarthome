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
		rooms: {},
		devices: {
			all: [],
			SensorsByRoom: {},
			ThermostateByRoom: {}
		},
		roomsAvailable: true,
		alert: {
			message: '',
			status: 'alert-warning',
			icon: 'fa-exclamation-circle'
		},
		routeId: 0,
		input: {
			instanceId: $routeParams.id,
			moduleId: "Heating",
			active: false,
			title: "",
			params: {
				resetTime: 2,
				roomSettings: {}
			}
		},
		cfg: {
			energySave: {
				min: 5,
				max: 35,
				step: 0.5,
				temp: {}
			},
			comfort: {
				min: 5,
				max: 35,
				step: 0.5,
				temp: {}
			},
			fallback: {
				"F": "frost_protection_temp",
				"E": "energy_save_temp",
				"C": "comfort_temp"
			},
			default: { // room template
				comfortTemp: 21, // default value
				energySaveTemp: 18,
				fallbackTemp: "",
				sensorId: null,
				schedule: {}
			},
			mobileSchedule_entry: {
				'0': false,
				'1': false,
				'2': false,
				'3': false,
				'4': false,
				'5': false,
				'6': false,
				stime: '00:00',
				etime: '00:00',
				temp: null
			}
		},
		tempModal: {
			title: "",
			scheduleId: "",
			delete: false,
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
		},
		mobileSchedule: {}
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
			$scope.updateData();
		},
		init_data: function(node, data) {},
		click: function(node, data) {},
		append: function(node, data) {},
		time_click: function(time, data, timeline, timelineData) {
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
		},
		confirm: function() {
			return $scope._t('connect_schedules');
		},
		delete_bar: function() {
			$scope.updateData();
		}
	};

	$scope.jQuery_schedules = {};

	/**
	 * [renderSchedule description]
	 * @param  {[type]} scheduleId [description]
	 * @param  {[type]} roomId     [description]
	 * @return {[type]}            [description]
	 */
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
	};

	/**
	 * delete schedule Bar
	 * @param  {obj} input  schedule data
	 * @param  {obj} $event dom event
	 */
	$scope.deleteBar = function(input, $event) {
		if ($scope.jQuery_schedules[input.scheduleId]) {
			var jq_schedule = $scope.jQuery_schedules[input.scheduleId],
				arr = input.scheduleId.split("-"),
				roomId = arr[1];

			var start = jq_schedule.formatTime(input.stime),
				end = jq_schedule.formatTime(input.etime);

			var index = _.findIndex($scope.heating.input.params.roomSettings[roomId].schedule[input.timeline], {
				stime: start,
				etime: end,
				temp: input.temp.value
			});

			if (index !== -1) {
				$scope.heating.input.params.roomSettings[roomId].schedule[input.timeline].splice(index, 1);
				$scope.updateSchedule(input.scheduleId, roomId);
				input.delete = true;
				$scope.handleModal('temperatureModal', $event);
				$scope.transformFromInstToMobile();
			}
		}
	};

	/**
	 * Update the schedule
	 * @param  {int} scheduleId element ID
	 * @param  {int} roomId     z-way roomId
	 */
	$scope.updateSchedule = function(scheduleId, roomId) {
		if ($scope.jQuery_schedules[scheduleId]) {
			var jq_schedule = $scope.jQuery_schedules[scheduleId];

			var days = Object.keys($scope.heating.input.params.roomSettings[roomId].schedule),
				data = {};
			angular.copy($scope.scheduleOptions.rows, data);
			days.forEach(function(day) {
				$scope.heating.input.params.roomSettings[roomId].schedule[day].forEach(function(schedule) {
					var sc = {
						start: schedule.stime,
						end: schedule.etime,
						text: schedule.temp + " C°",
						data: {
							temp: schedule.temp
						}
					}
					data[day].schedule.push(sc);
				});
			});
			jq_schedule.update(data);
		}
	}

	/**
	 * Update all schedules
	 */
	$scope.updateAllSchedules = function() {
		_.each($scope.jQuery_schedules, function(jq_schedule, scheduleId) {
			var roomId = scheduleId.split("-")[1]

			var days = Object.keys($scope.heating.input.params.roomSettings[roomId].schedule),
				data = {};
			angular.copy($scope.scheduleOptions.rows, data);
			days.forEach(function(day) {
				$scope.heating.input.params.roomSettings[roomId].schedule[day].forEach(function(schedule) {
					var sc = {
						start: schedule.stime,
						end: schedule.etime,
						text: schedule.temp + " C°",
						data: {
							temp: schedule.temp
						}
					}
					data[day].schedule.push(sc);
				});
			});
			jq_schedule.update(data);
		});
	}

	/**
	 * init
	 * @return {[type]} [description]
	 */
	$scope.init = function() {
		var obj = {
			temp: [6],
			label: [$scope._t('frostProtection')]
		};
		$scope.heating.cfg.energySave.temp = temperatureArray(obj, $scope.heating.cfg.energySave, "°C");
		$scope.heating.cfg.comfort.temp = temperatureArray(false, $scope.heating.cfg.comfort, "°C");
	};
	$scope.init();

	/**
	 * [loadRooms description]
	 * @return {[type]} [description]
	 */
	$scope.loadRooms = function() {
		dataFactory.getApi('locations').then(function(response) {
			var rooms = response.data.data.filter(function(r) {
				return r.id !== 0; // get rooms without global room (id 0)
			});
			$scope.heating.rooms = dataService.getRooms(rooms).indexBy('id').value();
			// add temp copy option
			angular.forEach($scope.heating.rooms, function(room) {
				angular.extend($scope.heating.rooms[room.id], {
					copyOption: null
				});
			});

			if (!_.size($scope.heating.rooms)) {
				$scope.heating.roomsAvailable = false;
				$scope.heating.alert.message = $scope._t('no_rooms');
			}

			$scope.loadDevices($scope.heating.rooms);
		});
	};
	$scope.loadRooms();

	/**
	 * Load Heating instance
	 * @param  {[type]} id [description]
	 * @return {[type]}    [description]
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
			// transform to mobile
			$scope.transformFromInstToMobile();

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
	 * [hasSchedules description]
	 * @param  {[type]}  roomId [description]
	 * @return {Boolean}        [description]
	 */
	$scope.hasSchedules = function(roomId) {
		var hasSC = false;
		if ($scope.heating.input.params.roomSettings && $scope.heating.input.params.roomSettings[roomId]) {
			var schedule = $scope.heating.input.params.roomSettings[roomId].schedule;
			for (sc in schedule) {
				if (schedule[sc].length > 0) {
					hasSC = true;
					break;
				}
			}
		}
		return hasSC;
	};

	/**
	 * [copySchedule description]
	 * @param  {[type]} roomId [description]
	 * @return {[type]}        [description]
	 */
	$scope.copySchedule = function(srcRoomId, destRoomId, message) {
		alertify.confirm(message, function() {
			angular.extend($scope.heating.input.params.roomSettings[destRoomId], $scope.heating.input.params.roomSettings[srcRoomId]);
			$scope.updateSchedule("#schedule-" + destRoomId, destRoomId)
		}).setting('labels', {
            'ok': $scope._t('ok')
        });
	};

	/**
	 * watch modalArr to handle close temperatureModal
	 */
	$scope.$watch("modalArr", function(newVal, oldVal) {
		if (newVal.hasOwnProperty("temperatureModal") && !newVal.temperatureModal) {
			if (!$scope.heating.tempModal.delete) {
				$scope.updateData();
				var roomId = $scope.heating.tempModal.scheduleId.split("-")[1];

				if ($scope.heating.input.params.roomSettings[roomId]) {
					var jq_schedule = $scope.jQuery_schedules[$scope.heating.tempModal.scheduleId],
						scIndex = _.findIndex($scope.heating.input.params.roomSettings[roomId].schedule[$scope.heating.tempModal.timeline], {
							stime: jq_schedule.formatTime($scope.heating.tempModal.stime),
							etime: jq_schedule.formatTime($scope.heating.tempModal.etime)
						});

					if(scIndex != -1) {
						$scope.heating.input.params.roomSettings[roomId].schedule[$scope.heating.tempModal.timeline][scIndex].temp = parseInt($scope.heating.tempModal.temp.value);

						var rows_copy = {};
						angular.copy($scope.scheduleOptions.rows, rows_copy);

						var days = Object.keys($scope.heating.input.params.roomSettings[roomId].schedule);
						days.forEach(function(day) {
							$scope.heating.input.params.roomSettings[roomId].schedule[day].forEach(function(schedule) {
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
			}
		}
	}, true);

	/**
	 * [loadDevices description]
	 * @param  {[type]} rooms [description]
	 * @return {[type]}       [description]
	 */
	$scope.loadDevices = function(rooms) {
		dataFactory.getApi('devices').then(function(response) {
				var devices = dataService.getDevicesData(response.data.data.devices);
				var roomKeys = Object.keys(rooms);
				_.filter(devices.value(), function(v) {
					if (roomKeys.indexOf(v.location.toString()) != -1) {
						if (v.deviceType == "sensorMultilevel" && v.probeType == "temperature" || v.deviceType == "thermostat") {
							var obj = {
								deviceId: v.id,
								zwaveId: getZwayId(v.id),
								deviceName: v.metrics.title,
								deviceNameShort: $filter('cutText')(v.metrics.title, true, 30) + (getZwayId(v.id) ? '#' + getZwayId(v.id) : ''),
								deviceType: v.deviceType,
								probeType: v.probeType,
								location: v.location,
								locationName: rooms[v.location].title,
								iconPath: v.iconPath,
								level: v.metrics.level,
								scale: v.metrics.scale ? v.metrics.scale : ""
							};
							$scope.heating.devices.all.push(obj);
							// add room sensors
							if (v.deviceType !== "thermostat") {
								if ($scope.heating.devices.SensorsByRoom[v.location]) {
									$scope.heating.devices.SensorsByRoom[v.location].push(obj);
								} else {
									$scope.heating.devices.SensorsByRoom[v.location] = [];
									$scope.heating.devices.SensorsByRoom[v.location].push(obj);
								}
							}
							// add room termostate
							if (v.deviceType == "thermostat") {
								if ($scope.heating.devices.ThermostateByRoom[v.location]) {
									$scope.heating.devices.ThermostateByRoom[v.location].push(obj);
								} else {
									$scope.heating.devices.ThermostateByRoom[v.location] = [];
									$scope.heating.devices.ThermostateByRoom[v.location].push(obj);
								}
							}
						}
					}
				});
				if(_.size($scope.heating.devices.ThermostateByRoom) > 0) {
					$scope.heating.input.active = true;
				}
				$scope.loadPreset();
			},
			function(error) {});
	};

	/**
	 * load preset/default data to instance data
	 */
	$scope.loadPreset = function() {
		var rooms = {};

		angular.forEach($scope.heating.rooms, function(room) {
			if (!$scope.heating.input.params.roomSettings[room.id]) {
				$scope.heating.input.params.roomSettings[room.id] = {};
				var copy_default = {};
				angular.copy($scope.heating.cfg.default, copy_default);
				$scope.heating.input.params.roomSettings[room.id] = copy_default;
			}
			// set default comfort Temp
			if ($scope.heating.input.params.roomSettings[room.id].comfortTemp == "" || $scope.heating.input.params.roomSettings[room.id].comfortTemp == null) {
				$scope.heating.input.params.roomSettings[room.id].comfortTemp = $scope.heating.cfg.default.comfortTemp;
			}
			// set temp senor is only one available
			if ($scope.heating.devices.SensorsByRoom[room.id] && $scope.heating.devices.SensorsByRoom[room.id].length == 1 && $scope.heating.input.params.roomSettings[room.id].sensorId == null) {
				$scope.heating.input.params.roomSettings[room.id].sensorId = $scope.heating.devices.SensorsByRoom[room.id][0].deviceId
			}
		});
	};


	/**
	 * Time changed
	 * @param  {int} roomId      roomId
	 * @param  {int} targetIndex entry index
	 * @param  {string} oldValue    prev time
	 * @param  {string} type        stime/etime
	 */
	$scope.timeChanged = function(roomId, targetIndex, oldValue, type) {

		var stime = stringToTime($scope.heating.mobileSchedule[roomId][targetIndex].stime),
			etime = stringToTime($scope.heating.mobileSchedule[roomId][targetIndex].etime);

		for (var i = 0; i <= 6; i++) { // days
			if ($scope.heating.mobileSchedule[roomId][targetIndex][i]) { // day true
				overlaps = timeOverlaps($scope.heating.mobileSchedule[roomId], stime, etime, i); // check for day
				if (overlaps.length > 0) {
					$scope.heating.mobileSchedule[roomId][targetIndex][type] = oldValue;
					alertify.alertWarning($scope._t('data_overlaps'));
					i = 6;
				}
			}
		}
	}

	/**
	 * activate/deactivate time for day
	 * @param  {obj} data
	 * @param  {int} day         day nubmer [0 - 6] [SU - SA]
	 * @param  {int} roomId      roomId
	 * @param  {int} targetIndex entry index
	 * @return {string}          stime/etime
	 */
	$scope.toggleTime = function(data, day, roomId, targetIndex) {
		$scope.heating.mobileSchedule[roomId][targetIndex][day] = !$scope.heating.mobileSchedule[roomId][targetIndex][day];

		if ($scope.heating.mobileSchedule[roomId][targetIndex][day]) {
			var stime = stringToTime(data.stime),
				etime = stringToTime(data.etime);

			var overlaps = timeOverlaps($scope.heating.mobileSchedule[roomId], stime, etime, day);

			if (overlaps.length > 0) {
				$scope.heating.mobileSchedule[roomId][targetIndex][day] = false;
				alertify.alertWarning($scope._t('data_overlaps'));
			}
		}
	}

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
	 * Update instance data from room schedule data
	 */
	$scope.updateData = function() {
		var schedule_ids = Object.keys($scope.jQuery_schedules);

		angular.forEach(schedule_ids, function(id) {
			var jq_sc = $scope.jQuery_schedules[id],
				roomId = id.split("-")[1],
				sc_data = jq_sc.getScheduleData();

			angular.forEach(sc_data, function(row, day) {
				var sorted_sc = _.sortBy(row.schedule, 'start'),
					new_sc = sorted_sc.map(function(sc) {
						return {
							"stime": sc.start,
							"etime": sc.end,
							"temp": sc.data.temp
						};
					});
				if (!$scope.heating.input.params.roomSettings[roomId].hasOwnProperty("schedule")) {
					$scope.heating.input.params.roomSettings[roomId].schedule = {};
				}

				$scope.heating.input.params.roomSettings[roomId].schedule[day] = new_sc;
			});
		});
		$scope.transformFromInstToMobile();
	};

	/**
	 * Store heating
	 */
	$scope.storeInstance = function(redirect) {
		$scope.updateData();
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};

		dataFactory.storeApi('instances', parseInt($scope.heating.input.instanceId, 10), $scope.heating.input).then(function(response) {
			$scope.loading = false;
			if (redirect) {
				$location.path('/automations');
			}

		}, function(error) {
			$scope.loading = false;
			alertify.alertError($scope._t('error_update_data'));
		});

	};

	/**
	 * Transform mobile vire back to instance data
	 */
	$scope.transformFromMobileToInst = function() {
		// transform data for Instance
		if($scope.deviceDetector.isMobile() || cfg.route.os == 'PoppApp_Z_Way' || cfg.route.os == 'ZWayMobileAppAndroid' || cfg.route.os == 'IOSWRAPPER' || cfg.route.os == 'ZWayMobileAppiOS') {
			_.each($scope.heating.mobileSchedule, function(data, roomId) {
				$scope.heating.input.params.roomSettings[roomId].schedule = {};
				_.each(data, function(d) {
					for (var i = 0; i <= 6; i++) {
						if (!$scope.heating.input.params.roomSettings[roomId].schedule[i]) {
							$scope.heating.input.params.roomSettings[roomId].schedule[i] = [];
						}
						if (d[i]) {
							var e = {
								stime: d.stime,
								etime: d.etime,
								temp: d.temp
							};
							$scope.heating.input.params.roomSettings[roomId].schedule[i].push(e);
						}
					}
				});
			});
		}
	};

	/**
	 * Transform Instance data to use in mobile view
	 */
	$scope.transformFromInstToMobile = function() {
		// transform data for mobile view
		if($scope.deviceDetector.isMobile() || cfg.route.os == 'PoppApp_Z_Way' || cfg.route.os == 'ZWayMobileAppAndroid' || cfg.route.os == 'IOSWRAPPER' || cfg.route.os == 'ZWayMobileAppiOS') {
			_.each($scope.heating.input.params.roomSettings, function(data, roomId) {
				var schedule = data.schedule;

				$scope.heating.mobileSchedule[roomId] = [];
				_.each(schedule, function(sc, day) {
					if (sc.length > 0) {
						_.each(sc, function(e) {
							var index = _.findIndex($scope.heating.mobileSchedule[roomId], {
								stime: e.stime,
								etime: e.etime,
								temp: e.temp
							});
							if (index == -1) {
								var entry = {};
								angular.copy($scope.heating.cfg.mobileSchedule_entry, entry);

								entry[day] = true
								entry.stime = e.stime;
								entry.etime = e.etime;
								entry.temp = e.temp;
								$scope.heating.mobileSchedule[roomId].push(entry);
							} else {
								$scope.heating.mobileSchedule[roomId][index][day] = true
							}
						});
					}
				});
			});
		}
	};


	/**
	 * watch $scope.heating.mobileSchedule to handle data changes
	 */
	$scope.$watch("heating.mobileSchedule", function(newVal, oldVal) {
		// transform mobile schedule data back to instance schedule data structure
		$scope.transformFromMobileToInst();
		$scope.updateAllSchedules();

	}, true);

	/**
	 * Assign a time scheduler
	 */
	$scope.assignTimeSchedule = function(roomId) {
		var input = {},
			obj = {};
		angular.copy($scope.heating.cfg.mobileSchedule_entry, input);
		if (!$scope.heating.mobileSchedule[roomId]) {
			$scope.heating.mobileSchedule[roomId] = [];
		}
		input.temp = $scope.heating.input.params.roomSettings[roomId].comfortTemp;
		$scope.heating.mobileSchedule[roomId].push(input);
	};

	/**
	 * Unassign a time scheduler
	 * @param {int} targetIndex
	 */
	$scope.unassignTimeSchedule = function(roomId, targetIndex) {
		if (targetIndex > -1 && $scope.heating.mobileSchedule[roomId]) {
			$scope.heating.mobileSchedule[roomId].splice(targetIndex, 1);
		}
	};


	/**
	 * create temperatureArray for select
	 * @param  {[type]} temp  [description]
	 * @param  {[type]} scale [description]
	 * @return {[objet]}       [description]
	 */
	function temperatureArray(obj, temp, scale) {
		if (!obj) {
			var obj = {
				temp: [],
				label: []
			};
		}
		for (var i = temp.min; i <= temp.max; i += temp.step) {
			obj.temp.push(i.toString());
			obj.label.push(i.toString() + " " + scale);
		}
		return obj;
	}

	/**
	 * getZwayId
	 * @param  {string} deviceId
	 * @return {string} zwaveId
	 */
	function getZwayId(deviceId) {
		var zwaveId = false;
		if (deviceId.indexOf("ZWayVDev_zway_") > -1) {
			zwaveId = deviceId.split("ZWayVDev_zway_")[1].split('-')[0];
			return zwaveId.replace(/[^0-9]/g, '');
		}
		return zwaveId;
	}

	/**
	 * Function return a array with times or empty
	 * @param  {[type]} mobileSchedule array with times
	 * @param  {[type]} stime          start time
	 * @param  {[type]} etime          end time
	 * @param  {[type]} day            day to check
	 */
	function timeOverlaps(mobileSchedule, stime, etime, day) {
		var overlaps = _.filter(mobileSchedule, function(e) {
			var st = stringToTime(e.stime),
				et = stringToTime(e.etime);

			if (st < stime && et > stime && e[day]) {
				return e;
			}
			if (st > stime && st < etime && e[day]) {
				return e;
			}
		});
		return overlaps;
	}

	/**
	 * conervet time string 12:40 into mins
	 * @param  {string} time string
	 * @return {int}    time in mins
	 */
	function stringToTime(string) {
		var slice = string.split(':');
		var h = Number(slice[0]) * 60 * 60;
		var i = Number(slice[1]) * 60;
		var min = h + i;
		return min;
	}

});