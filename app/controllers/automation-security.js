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
		devicesInRoom: {
			input: [],
			alarms: [],
			armConfirm: [],
			controls: [],
			notification: []
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
			notification: []
		},
		cfg: {
			options: {
				switchMultilevel: {
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
				deviceType: ['sensorBinary'],
				status: ['on', 'off'],
				default: {
					devices: '',
					conditions: 'on'
				}
			},
			silentAlarms: {
				deviceType: ['toggleButton', 'switchBinary', 'switchMultilevel'],
				default: {
					devices: ''
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
			times: {
				default: {
					'0': false,
					'1': false,
					'2': false,
					'3': false,
					'4': false,
					'5': false,
					'6': false,
					'times': '00:00',
					'condition': 'disarm'
				}
			},
			notification: {
				probeType: 'notification_push'
			}
		},
		input: {
			instanceId: $routeParams.id,
			moduleId: "Security",
			active: true,
			title: "Security",
			params: {
				times: {
					aktive: true,
					start: 10,
					interval: 1,
					silent: 0,
					table: []
				},
				input: {
					table: []
				},
				silentAlarms: {
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
		}
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
		bar_Click: function(node, timelineData, scheduleIndex) {},
		connect: function(data) {},
		confirm: function() {},
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
				params: instance.params
			});
			// Adding rows to scheduleOptions
			angular.forEach($scope.security.input.params.schedules, function(v, k) {
				if (_.size(v)) {
					angular.forEach(v, function(t) {
						$scope.scheduleOptions.rows[k]['schedule'].push({
							start: t.arm,
							end: t.disarm,
							text: $scope._t('lb_arm')
						})
					});
				}

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
					level: _.isNumber(v.metrics.level) ? parseInt(v.metrics.level) : v.metrics.level,
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
	////////// Devices ////////// 

	/**
	 * Get device entry by deviceId
	 * @param  {string} deviceId 
	 * @return {object} device          
	 */
	$scope.getDevice = function(deviceId) {
		var device = _.findWhere($scope.security.devices.alarms, {
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
		input.devices = deviceId;
		$scope.security.input.params[param].table.push(input);
		$scope.resetOptions();
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
	};

	////////// Dis-arm by time ////////// 
	/**
	 * Renders dis-arm schedule
	 * @param {string} elementId 
	 */
	$scope.renderSchedule = function(elementId) {
		if (_.isEmpty($scope.jQuerySchedule)) {
			var schedule = angular.element(elementId),
				scheduleOptions_copy = {};

			angular.copy($scope.scheduleOptions, scheduleOptions_copy);

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
		}
	};

	/**
	 * Update input data
	 */
	$scope.updateData = function() {
		angular.forEach($scope.jQuerySchedule.getScheduleData(), function(v, k) {
			$scope.security.input.params.schedules[k] = _.map(v.schedule, function(sc) {
				return {
					arm: sc.start,
					disarm: sc.end,
				};
			});
		});
	};

	/**
	 * Assign dis-arm schedule
	 * @param {object} data 
	 */
	/* $scope.assignSchedule = function (data) {

	  if ($scope.security.input.params.schedules[data.day]) {
	    $scope.security.input.params.schedules[data.day].push({
	      time: data.time
	    })
	  }
	  //$scope.security.input.params.schedules
	} */

	////////// Advanced schedule ////////// 
	/**
	 * TODO: deprecated
	 * Assign a time scheduler
	 * @returns {undefined}
	 */
	$scope.assignTimeScheduler = function() {
		var input = $scope.security.cfg.times.default,
			obj = {};
		$scope.security.input.params.times.table.push(input);
		$scope.resetOptions();
	};

	/**
	 * TODO: deprecated
	 * Unassign a time scheduler
	 *  @param {int} targetIndex 
	 * @returns {undefined}
	 */
	$scope.unassignTimeScheduler = function(targetIndex) {
		if (targetIndex > -1) {
			$scope.security.input.params.times.table.splice(targetIndex, 1);
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

});