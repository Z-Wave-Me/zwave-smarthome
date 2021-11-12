/**
 * @overview Controllers that handls security
 * @author Martin Vach
 */
/**
 * Controller that handles list of security instances
 * @class SecurityController
 */
myAppController.controller('SecurityController', function($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
	$scope.security = {
			moduleId: 'Security',
			state: '',
			enableTest: [],
		}
		/**
		 * Load instance with security module
		 * @returns {undefined}
		 */
	$scope.loadSecurityModule = function() {
		dataFactory.getApi('instances', null, true).then(function(response) {
			var security = _.findWhere(response.data.data, {
				moduleId: $scope.security.moduleId
			});
			if (!security || security.id < 1) {
				$location.path('/security/0');
				return;
			}
			$location.path('/security/' + security.id);
		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});
	};
	$scope.loadSecurityModule();

});

/**
 * Controller that handles a security detail
 * @class SecurityIdController
 */
myAppController.controller('SecurityIdController', function($scope, $routeParams, $location, $timeout, $filter, cfg, dataFactory, dataService, _, myCache) {
	$scope.security = {
		routeId: 0,
		tab: 1,
		days: [1, 2, 3, 4, 5, 6, 0],
		intervals: [0, 5, 15, 30, 60],
		devicesInRoom: {
			input: [],
			alarms: [],
			armConfirm: [],
			controls: [],
			notification: [],
			armFailureAction: [],
			inputArming: [],
		},
		devicesAvailable: true,
		alert: {
			message: '',
			status: 'alert-warning',
			icon: 'fa-exclamation-circle'
		},
		devices: {
			input: [],
			alarms: [],
			armConfirm: [],
			controls: [],
			notification: [],
			armFailureAction: [],
			inputArming: [],
		},
		cfg: {
			options: {
				switchMultilevel: {
					level: ['on', 'off', 'lvl'],
					min: 0,
					max: 99
				},
				switchRGBW: {
					min: 0,
					max: 255
				},
				thermostat: {
					min: 0,
					max: 99
				}
			},
			input: {
				deviceType: ['sensorBinary', 'switchBinary'],
				status: ['on', 'off'],
				default: {
					devices: '',
					conditions: 'on',
					armCondition: 'on',
					sensorAtTheEntrance: 'off'
				}
			},
			silentAlarms: {
				deviceType: ['toggleButton', 'switchBinary', 'switchMultilevel'],
				default: {
					devices: ''
				}
			},
			inputArming: {
				deviceType: ['sensorBinary', 'switchBinary'],
				default: {
					devices: '',
					conditions: 'on',
				}
			},
			alarms: {
				deviceType: ['toggleButton', 'switchBinary', 'switchMultilevel'],
				default: {
					devices: ''
				}
			},
			armConfirm: {
				deviceType: ['toggleButton', 'switchBinary', 'switchMultilevel'],
				default: {
					devices: ''
				}
			},
			disarmConfirm: {
				deviceType: ['toggleButton', 'switchBinary', 'switchMultilevel'],
				default: {
					devices: ''
				}
			},
			clean: {
				deviceType: ['toggleButton', 'switchBinary', 'switchMultilevel'],
				default: {
					devices: ''
				}
			},
			armFailureAction: {
				deviceType: ['toggleButton', 'switchBinary', 'switchMultilevel'],
				default: {
					devices: ''
				}
			},
			controls: {
				deviceType: ['switchBinary'],
				status: ['on', 'off', 'never'],
				default: {
					devices: '',
					armCondition: 'never',
					disarmCondition: 'never',
					clearCondition: 'never'
				}
			},
			notification: {
				probeType: 'notification_push'
			},
			mobileSchedule_entry: {
				'0': false,
				'1': false,
				'2': false,
				'3': false,
				'4': false,
				'5': false,
				'6': false,
				arm: '00:00',
				disarm: '00:00'
			}
		},
		input: {
			instanceId: $routeParams.id,
			moduleId: "Security",
			active: false,
			title: "Security",
			params: {
				times: {
					aktive: true,
					start: 10,
					interval: 1,
					silent: 0,
					table: [],
					delaySensorAtTheEntrance: 30
				},
				input: {
					table: []
				},
				inputArming: {
					table: []
				},
				silentAlarms: {
					table: [],
					notification: {}
				},
				armFailureAction: {
					table: [],
					notification: {}
				},

				alarms: {
					table: [],
					notification: {}
				},
				armConfirm: {
					table: [],
					notification: {}
				},
				disarmConfirm: {
					table: [],
					notification: {}
				},
				clean: {
					table: [],
					notification: {}
				},
				controls: {
					table: []
				},
				schedules: {
					'0': [],
					'1': [],
					'2': [],
					'3': [],
					'4': [],
					'5': [],
					'6': []
				}
			}
		},
		securityModal: {
			title: "",
			scheduleId: "",
			delete: false,
			timeline: null,
			scheduleIndex: null,
			arm: null,
			disarm: null
		},
		mobileSchedule: []
	};

	$scope.notifications = {
		channels: []
	};
	
	/**
	 *  Schedule
	 */
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
			var start = this.calcStringTime(data),
				end = start + 3600,
				data = {
					timeline: parseInt(timeline),
					start: start,
					end: end,
					text: $scope._t('lb_arm')
				};
			this.addScheduleData(data);
			$scope.updateData();
		},
		append_on_click: function(timeline, startTime, endTime) {
			var start = this.calcStringTime(startTime),
				end = this.calcStringTime(endTime)

			end = end == start ? end + 3600 : end;

			var data = {
				timeline: parseInt(timeline),
				start: start,
				end: end,
				text: $scope._t('lb_arm')
			};

			this.addScheduleData(data);
			$scope.updateData();
		},
		bar_Click: function(node, timelineData, scheduleIndex) {
			$scope.security.securityModal.scheduleId = "#" + $(this).attr('id');
			$scope.security.securityModal.timeline = timelineData.timeline;
			$scope.security.securityModal.arm = timelineData.start;
			$scope.security.securityModal.disarm = timelineData.end;
			$scope.security.securityModal.scheduleIndex = scheduleIndex;
			$scope.security.securityModal.title = this.formatTime(timelineData.start) + " - " + this.formatTime(timelineData.end);
			$scope.handleModal('securityModal');
		},
		connect: function(data) {
			data.text = $scope._t('lb_arm')
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

	$scope.jQuerySchedule = {};

	/**
	 *  Reset Original data
	 */
	$scope.orig = {
		options: {}
	};
	$scope.orig.options = angular.copy($scope.security.cfg);
	$scope.resetOptions = function() {
		$scope.security.cfg = angular.copy($scope.orig.options);

	};

	/**
	 * Load instance
	 */
	$scope.loadInstance = function(id) {
		dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
			$scope.security.routeId = id;
			// Adding params from instatnce
			var instance = instances.data.data;
			angular.extend($scope.security.input, {
				title: instance.title,
				active: instance.active,
				// TODO add server realisation
				params: {inputArming: {table:[]}, ...instance.params, }
			});

			// load additional device data
			_.each(['silentAlarms','alarms','armConfirm','disarmConfirm','clean', 'armFailureAction', 'inputArming'], function(e){
				$scope.security.input.params[e].table = $scope.security.input.params[e].table.map(function(d) {
					if (e == 'silentAlarms')
						e = 'alarms';
					else if (e == 'disarmConfirm' || e == 'clean')
						e = 'armConfirm';
					dev = $scope.getDevice(d.devices, e);
					if (dev)
					{
						return {
							devices: d.devices,
							zwaveId: dev.zwaveId,
							deviceName: dev.deviceName,
							deviceNameShort: dev.deviceNameShort,
							level: _.isNumber(d.level) ? 'lvl' : d.level,
							exact: _.isNumber(d.level) ? parseInt(d.level) : null,
							deviceType: dev.deviceType,
							probeType: dev.probeType,
							location: dev.location,
							locationName: dev.locationName,
							iconPath: dev.iconPath
						};
					}
				});
			});
			$scope.security.input.params.input.table = $scope.security.input.params.input.table.map(function(d) {
				dev = $scope.getDevice(d.devices, 'input');
				if (dev)
				{
					return {
						devices: d.devices,
						zwaveId: dev.zwaveId,
						deviceName: dev.deviceName,
						deviceNameShort: dev.deviceNameShort,
						// level: _.isNumber(d.level) ? 'lvl' : d.level,
						// exact: _.isNumber(d.level) ? parseInt(d.level) : null,
						conditions: d.conditions,
						armCondition: d.armCondition,
						inputArming: d.inputArming,
						sensorAtTheEntrance: d.sensorAtTheEntrance,
						deviceType: dev.deviceType,
						probeType: dev.probeType,
						location: dev.location,
						locationName: dev.locationName,
						iconPath: dev.iconPath
					};
				}
				else {
					return {
						devices: d.devices,
						deviceName: $scope._t('device_removed') + ": " + d.devices,
						conditions: d.conditions,
						armCondition: d.armCondition,
						inputArming: d.inputArming,
						sensorAtTheEntrance: d.sensorAtTheEntrance,
						iconPath: "storage/img/icons/placeholder.png"
					};
				}
			});

			$scope.security.input.params.controls.table = $scope.security.input.params.controls.table.map(function(d) {
				dev = $scope.getDevice(d.devices, 'controls');
				if (dev)
				{
					return {
						devices: d.devices,
						zwaveId: dev.zwaveId,
						deviceName: dev.deviceName,
						deviceNameShort: dev.deviceNameShort,
						armCondition: d.armCondition,
						inputArming: d.inputArming,
						disarmCondition: d.disarmCondition,
						clearCondition: d.clearCondition,
						deviceType: dev.deviceType,
						probeType: dev.probeType,
						location: dev.location,
						locationName: dev.locationName,
						iconPath: dev.iconPath
					};
				}
			});

			// transform to mobile
			$scope.transformFromInstToMobile();

		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});

	};

	/**
	 * Load notification channels
	 */
	$scope.loadNotificationChannels = function(rooms) {
		dataFactory.getApi('notification_channels', '/all').then(function(response) {
			$scope.notifications.channels = response.data.data;
		}, function(error) {});
	};
	$scope.loadNotificationChannels();


	/**
	 * Load rooms
	 */
	$scope.loadRooms = function() {
		dataFactory.getApi('locations').then(function(response) {
			$scope.security.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
			$scope.loadDevices($scope.security.rooms);
		});

	};
	$scope.loadRooms();

	/**
	 * Load devices
	 */
	$scope.loadDevices = function(rooms) {
		dataFactory.getApi('devices').then(function(response) {
			var devices = dataService.getDevicesData(response.data.data.devices);
			_.filter(devices.value(), function(v) {
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
					level: _.isNumber(v.metrics.level) ? 'lvl' : v.metrics.level,
					exact: _.isNumber(v.metrics.level) ? parseInt(v.metrics.level) : null,
					deviceType: v.deviceType,
					probeType: v.probeType,
					location: v.location,
					locationName: rooms[v.location].title,
					iconPath: v.iconPath
				};
				// Set input
				if ($scope.security.cfg.input.deviceType.indexOf(v.deviceType) > -1) {
					$scope.security.devices.input.push(obj);
				}
				// Set alarm, silent alarm
				if ($scope.security.cfg.alarms.deviceType.indexOf(v.deviceType) > -1) {
					$scope.security.devices.alarms.push(obj);
				}
				// Set armFailureAction
				if ($scope.security.cfg.inputArming.deviceType.indexOf(v.deviceType) > -1) {
					$scope.security.devices.inputArming.push(obj);
				}
				// Set armFailureAction
				if ($scope.security.cfg.armFailureAction.deviceType.indexOf(v.deviceType) > -1) {
					$scope.security.devices.armFailureAction.push(obj);
				}
				// Set arm, disarm, clean
				if ($scope.security.cfg.armConfirm.deviceType.indexOf(v.deviceType) > -1) {
					$scope.security.devices.armConfirm.push(obj);
				}
				// Set controls
				if ($scope.security.cfg.controls.deviceType.indexOf(v.deviceType) > -1) {

					$scope.security.devices.controls.push(obj);
				}
				// Set notifications
				if (v.probeType && $scope.security.cfg.notification.probeType.indexOf(v.probeType) > -1) {
					$scope.security.devices.notification.push(obj);
				}
			});

			// Set devices in the rooms
			$scope.security.devicesInRoom.input = _.countBy($scope.security.devices.input, function(v) {
				return v.location;
			});
			$scope.security.devicesInRoom.alarms = _.countBy($scope.security.devices.alarms, function(v) {
				return v.location;
			});
			$scope.security.devicesInRoom.inputArming = _.countBy($scope.security.devices.inputArming, function(v) {
				return v.location;
			});
			$scope.security.devicesInRoom.armFailureAction = _.countBy($scope.security.devices.armFailureAction, function(v) {
				return v.location;
			});
			$scope.security.devicesInRoom.armConfirm = _.countBy($scope.security.devices.armConfirm, function(v) {
				return v.location;
			});
			$scope.security.devicesInRoom.controls = _.countBy($scope.security.devices.controls, function(v) {
				return v.location;
			});
			$scope.security.devicesInRoom.notification = _.countBy($scope.security.devices.notification, function(v) {
				return v.location;
			});

			if (!_.size($scope.security.devices.input)) {
				$scope.security.devicesAvailable = false;
				$scope.security.alert.message = $scope._t('no_device_installed');
			}
			_.each(['input','silentAlarms','alarms','armConfirm','disarmConfirm','clean', 'armFailureAction', 'inputArming'], function(e){
				$scope.security.input.params[e].table = $scope.security.input.params[e].table.map(function(d) {
					if (e == 'silentAlarms')
						e = 'alarms';
					else if (e == 'disarmConfirm' || e == 'clean')
						e = 'armConfirm';
					dev = $scope.getDevice(d.devices, e);
					if (dev)
					{
						return {
							devices: d.devices,
							zwaveId: dev.zwaveId,
							deviceName: dev.deviceName,
							deviceNameShort: dev.deviceNameShort,
							level: _.isNumber(d.level) ? 'lvl' : d.level,
							exact: _.isNumber(d.level) ? parseInt(d.level) : null,
							deviceType: dev.deviceType,
							probeType: dev.probeType,
							location: dev.location,
							locationName: dev.locationName,
							iconPath: dev.iconPath
						};
					}
				});
			});

			$scope.security.input.params.input.table = $scope.security.input.params.input.table.map(function(d) {
				dev = $scope.getDevice(d.devices, 'input');
				if (dev)
				{
					return {
						devices: d.devices,
						zwaveId: dev.zwaveId,
						deviceName: dev.deviceName,
						deviceNameShort: dev.deviceNameShort,
						// level: _.isNumber(d.level) ? 'lvl' : d.level,
						// exact: _.isNumber(d.level) ? parseInt(d.level) : null,
						conditions: d.level,
						deviceType: dev.deviceType,
						probeType: dev.probeType,
						location: dev.location,
						locationName: dev.locationName,
						iconPath: dev.iconPath
					};
				}
			});

			$scope.security.input.params.controls.table = $scope.security.input.params.controls.table.map(function(d) {
				dev = $scope.getDevice(d.devices, 'controls');
				if (dev)
				{
					return {
						devices: d.devices,
						zwaveId: dev.zwaveId,
						deviceName: dev.deviceName,
						deviceNameShort: dev.deviceNameShort,
						armCondition: d.armCondition,
						disarmCondition: d.disarmCondition,
						clearCondition: d.clearCondition,
						deviceType: dev.deviceType,
						probeType: dev.probeType,
						location: dev.location,
						locationName: dev.locationName,
						iconPath: dev.iconPath
					};
				}
			});

			// it is here to make sure devices are already loaded
			if ($routeParams.id > 0) {
				$scope.loadInstance($routeParams.id);
			}
		}, function(error) {});
	};

	/**
	 * Get model index by device ID
	 * @param {string} deviceId
	 * @returns {undefined}
	 */
	$scope.getModelIndex = function(deviceId, node) {
		var index = _.findIndex($filter('hasNode')($scope.security.input.params, node), {
			devices: deviceId
		});
		return index;
	};

	/**
	 * delete schedule Bar
	 * @param  {obj} input  schedule data
	 * @param  {obj} $event dom event
	 */
	$scope.deleteBar = function(input, $event) {
		var arm = $scope.jQuerySchedule.formatTime(input.arm),
			disarm = $scope.jQuerySchedule.formatTime(input.disarm),
			index = _.findIndex($scope.security.input.params.schedules[input.timeline], {
				arm: arm,
				disarm: disarm,
			});

		if (index !== -1) {
			$scope.security.input.params.schedules[input.timeline].splice(index, 1);
			$scope.updateSchedule();
			input.delete = true;
			$scope.handleModal('securityModal', $event);
			$scope.transformFromInstToMobile();
		}
	};

	////////// Devices //////////

	/**
	 * Get device entry by deviceId
	 * @param  {string} deviceId
	 * @return {object} device
	 */
	$scope.getDevice = function(deviceId, param) {
		var device = _.findWhere($scope.security.devices[param], {
			deviceId: deviceId
		});
		return device;
	}

	/**
	 * Assign a device
	 * @param {string} deviceId
	 * @param {string} param
	 * @returns {undefined}
	 */
	$scope.assignDevice = function(deviceId, param) {
		var input = $scope.security.cfg[param].default;
		var deviceIndex = _.findIndex($scope.security.input.params[param].table, {
			devices: deviceId
		});
		if (deviceIndex > -1) {
			return;
		}
		if (param == 'silentAlarms') {
			p = 'alarms';
		}
		else if (param == 'disarmConfirm' || param == 'clean') {
			p = 'armConfirm';
		}
		else {
			p = param;
		}

		dev = $scope.getDevice(deviceId, p);
		if (dev)
		{
			input = {...input,
				devices: deviceId,
				level: dev.level,
				exact: dev.exact,
				sendAction: false,
				deviceName: dev.deviceName,
				deviceType: dev.deviceType,
				probeType: dev.probeType,
				location: dev.location,
				locationName: dev.locationName,
				iconPath: dev.iconPath
			};
			if (p == 'input') {
				$scope.security.input.active = true;
			}
			$scope.security.input.params[param].table.push(input);
			$scope.resetOptions();
		}
	};

	/**
	 * Unassign a device
	 * @param {string} deviceId
	 * @param {string} param
	 * @returns {undefined}
	 */
	$scope.unassignDevice = function(deviceId, param) {
		var deviceIndex = _.findIndex($scope.security.input.params[param].table, {
			devices: deviceId
		});
		if (deviceIndex > -1) {
			$scope.security.input.params[param].table.splice(deviceIndex, 1);
		}

		if (param == 'input' && _.size($scope.security.input.params.input.table) < 1) {
			$scope.security.input.active = false;
		}
	};

	////////// Dis-arm by time //////////

	/**
	 * Update schedule
	 */
	$scope.updateSchedule = function() {
		if (!_.isEmpty($scope.jQuerySchedule)) {
			var days = Object.keys($scope.security.input.params.schedules),
				data = {};
			angular.copy($scope.scheduleOptions.rows, data);
			days.forEach(function(day) {
				$scope.security.input.params.schedules[day].forEach(function(schedule) {
					var sc = {
						start: schedule.arm,
						end: schedule.disarm,
						text: $scope._t('lb_arm')
					}
					data[day].schedule.push(sc);
				});
			});
			$scope.jQuerySchedule.update(data);
		}
	}

	/**
	 * Renders dis-arm schedule
	 * @param {string} elementId
	 */
	$scope.renderSchedule = function(elementId) {
		if (_.isEmpty($scope.jQuerySchedule)) {
			var schedule = angular.element(elementId),
				scheduleOptions_copy = {};

			angular.copy($scope.scheduleOptions, scheduleOptions_copy);

			// set data
			angular.forEach($scope.security.input.params.schedules, function(v, day) {
				if (_.size(v)) {
					angular.forEach(v, function(t) {
						scheduleOptions_copy.rows[day]['schedule'].push({
							start: t.arm,
							end: t.disarm,
							text: $scope._t('lb_arm')
						})
					});
				}
			});

			// set weekday titles
			schedule.empty();
			$timeout(function() {
				schedule.timeSchedule(scheduleOptions_copy);
				var titles = angular.element(".title");
				angular.forEach(titles, function(t) {
					var title = angular.element(t).data('title');
					angular.element(t).html($scope._t(title));
				});
				$scope.jQuerySchedule = schedule;
			}, 10);
		} else {
			$timeout(function() {
				$scope.jQuerySchedule.resizeWindow();
			}, 0);
		}
	};

	/**
	 * Update input data
	 */
	$scope.updateData = function() {
		angular.forEach($scope.jQuerySchedule.getScheduleData(), function(row, day) {
			var sorted_sc = _.sortBy(row.schedule, 'start'),
				new_sc = sorted_sc.map(function(sc) {
					return {
						arm: sc.start,
						disarm: sc.end,
					};
				});
			$scope.security.input.params.schedules[day] = new_sc;
		});
		$scope.transformFromInstToMobile();
	};

	/**
	 * Time changed
	 * @param  {int} roomId      roomId
	 * @param  {int} targetIndex entry index
	 * @param  {string} oldValue    prev time
	 * @param  {string} type        arm/disarm
	 */
	$scope.timeChanged = function(targetIndex, oldValue, type) {
		var arm = stringToTime($scope.security.mobileSchedule[targetIndex].arm),
			disarm = stringToTime($scope.security.mobileSchedule[targetIndex].disarm);

		for (var i = 0; i <= 6; i++) { // days
			if ($scope.security.mobileSchedule[targetIndex][i]) { // day true
				overlaps = timeOverlaps($scope.security.mobileSchedule, arm, disarm, i); // check for day
				if (overlaps.length > 0) {
					$scope.security.mobileSchedule[targetIndex][type] = oldValue;
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
	 * @return {string}          arm/disarm
	 */
	$scope.toggleTime = function(data, day, targetIndex) {
		$scope.security.mobileSchedule[targetIndex][day] = !$scope.security.mobileSchedule[targetIndex][day];

		if ($scope.security.mobileSchedule[targetIndex][day]) {
			var arm = stringToTime(data.arm),
				disarm = stringToTime(data.disarm);

			var overlaps = timeOverlaps($scope.security.mobileSchedule, arm, disarm, day);

			if (overlaps.length > 0) {
				$scope.security.mobileSchedule[targetIndex][day] = false;
				alertify.alertWarning($scope._t('data_overlaps'));
			}
		}
	}

	/**
	 * Transform mobile vire back to instance data
	 */
	$scope.transformFromMobileToInst = function() {
		// transform data for Instance
		$scope.security.input.params.schedules = {};
		_.each($scope.security.mobileSchedule, function(data) {
			for (var i = 0; i <= 6; i++) {
				if (!$scope.security.input.params.schedules[i]) {
					$scope.security.input.params.schedules[i] = [];
				}
				if (data[i]) {
					var e = {
						arm: data.arm,
						disarm: data.disarm
					};
					$scope.security.input.params.schedules[i].push(e);
				}
			}
		});
	};

	/**
	 * Transform Instance data to use in mobile view
	 */
	$scope.transformFromInstToMobile = function() {
		// transform data for mobile view
		$scope.security.mobileSchedule = [];
		_.each($scope.security.input.params.schedules, function(sc, day) {
			if (sc.length > 0) {
				_.each(sc, function(e) {
					var index = _.findIndex($scope.security.mobileSchedule, {
						arm: e.arm,
						disarm: e.disarm
					});
					if (index == -1) {
						var entry = {};
						angular.copy($scope.security.cfg.mobileSchedule_entry, entry);

						entry[day] = true
						entry.arm = e.arm;
						entry.disarm = e.disarm;
						$scope.security.mobileSchedule.push(entry);
					} else {
						$scope.security.mobileSchedule[index][day] = true
					}
				});
			}
		});
	};

	/**
	 * watch $scope.security.mobileSchedule to handle data changes
	 */
	$scope.$watch("security.mobileSchedule", function(newVal) {
		// transform mobile schdule data back to instance schedule data structure
		$scope.transformFromMobileToInst();
		$scope.updateSchedule();
	}, true);

	////////// Advanced schedule //////////

	/**
	 * Assign a time scheduler
	 */
	$scope.assignTimeSchedule = function() {
		var input = {},
			obj = {};
		angular.copy($scope.security.cfg.mobileSchedule_entry, input);
		$scope.security.mobileSchedule.push(input);
	};

	/**
	 * Unassign a time scheduler
	 *  @param {int} targetIndex
	 */
	$scope.unassignTimeSchedule = function(targetIndex) {
		if (targetIndex > -1) {
			$scope.security.mobileSchedule.splice(targetIndex, 1);
		}
	};

	////////// Save complete form //////////
	/**
	 * Store instance
	 */
	$scope.storeInstance = function(input, redirect) {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};

		_.each(['silentAlarms','alarms','armConfirm','disarmConfirm','clean', 'armFailureAction'], function(e){
			input.params[e].table = input.params[e].table.map(function(dev) {
				return {
					devices: dev.devices,
					level: dev.level == 'lvl' ? dev.exact : dev.level,
					sendAction: dev.sendAction
				};
			});
		});

		input.params.input.table = input.params.input.table.map(function(dev) {
			return {
				devices: dev.devices,
				conditions: dev.conditions,
				armCondition: dev.armCondition,
				sensorAtTheEntrance: dev.sensorAtTheEntrance,
			};
		});

		input.params.controls.table = input.params.controls.table.map(function(dev) {
			return {
				devices: dev.devices,
				armCondition: dev.armCondition,
				disarmCondition: dev.disarmCondition,
				clearCondition: dev.clearCondition
			};
		});
		input.params.inputArming.table = input.params.inputArming.table.map(function(dev) {
			return {
				devices: dev.devices,
				conditions: dev.conditions,
			};
		});
		dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function(response) {
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
	 * TODO: deprecated
	 * Delete instance
	 */
	/* $scope.deleteInstance = function (id, message) {
	  alertify.confirm(message, function () {
	    dataFactory.deleteApi('instances', id).then(function (response) {
	      $location.path('/automations');
	    }, function (error) {
	      alertify.alertError($scope._t('error_delete_data'));
	    });

	  });
	}; */

	/**
	 * Function return a array with times or empty
	 * @param  {[type]} mobileSchedule array with times
	 * @param  {[type]} stime          start time
	 * @param  {[type]} etime          end time
	 * @param  {[type]} day            day to check
	 */
	function timeOverlaps(mobileSchedule, stime, etime, day) {
		var overlaps = _.filter(mobileSchedule, function(e) {
			var st = stringToTime(e.arm),
				et = stringToTime(e.disarm);

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
