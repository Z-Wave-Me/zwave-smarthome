/**
 * @overview Controllers that handls schedules
 * @author Martin Vach
 */
/**
 * Controller that handles list of schedules
 * @class AutomationScheduleController
 */
myAppController.controller('AutomationScheduleController', function($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
	$scope.schedules = {
		state: '',
		enableTest: []
	};
	$scope.oldSchedules = [];


	/**
	 * Load schedules
	 * @returns {undefined}
	 */
	$scope.loadSchedules = function() {
		dataFactory.getApi('instances', null, true).then(function(response) {
			$scope.schedules.all = _.chain(response.data.data).flatten().where({
				moduleId: 'Schedules'
			}).filter(function(v) {
				var size = 0;
				for (k in v.params.devices) {
					if (v.params.devices[k].length) {
						size++;
					}
				}
				if (size) {
					$scope.schedules.enableTest.push(v.id)
				}
				return v;
			}).value();
			if (!_.size($scope.schedules.all)) {
				// Previous page is detail - clicked on cancel or page is reloaded - after delete
				if (cfg.route.previous.indexOf(dataService.getUrlSegment($location.path())) > -1) {
					$location.path('/automations');
					return;
				}
				$location.path('/' + dataService.getUrlSegment($location.path()) + '/0');
				return;
			}
			//$scope.schedules.state = 'success';
		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});
	};

	/**
	 * Load old schedules
	 * @returns {undefined}
	 */
	$scope.loadOldSchedules = function() {
		dataFactory.getApi('instances', '/ScheduledScene', true).then(function(response) {
			$scope.oldSchedules = _.filter(response.data.data, function(v) {
				return !v.params.transformed;
			});

			if ($scope.oldSchedules.length) {
				var postData = {
					source: 'ScheduledScene',
					target: 'Schedules'
				}

				alertify.confirm($scope._t('scheduledscenes_exists'))
					.setting('labels', {
						'ok': $scope._t('ok_import')
					})
					.set('onok', function(closeEvent) { //after clicking OK
						dataFactory.postApi('modules_transform', postData).then(function(response) {
							if (response.data && response.data.data) {
								var newSchedules = response.data.data.map(function(entry) {
									return entry.title
								});
								dataService.showNotifier({
									message: $scope._t('successfully_transformed') + '<br>' + newSchedules.join(',<br>')
								});
								$scope.loadSchedules();
							}

							$scope.oldSchedules = [];
						}, function(error) {
							dataService.showNotifier({
								message: $scope._t('error_transformed'),
								type: 'error'
							});
							$scope.oldSchedules = [];
							$scope.loadSchedules();
						});
					})
					.set('oncancel', function(closeEvent) { //after clicking Cancel
						$scope.oldSchedules = [];
						$scope.loadSchedules();
					});
			} else {
				$scope.loadSchedules();
			}
		}, function(error) {
			$scope.loadSchedules();
		});
	};
	$scope.loadOldSchedules();

	/**
	 * Run schedule test
	 * @param {object} instance
	 */
	$scope.runScheduleTest = function(instance) {
		$scope.toggleRowSpinner(instance.id);
		$timeout($scope.toggleRowSpinner, 1000);
		var params = 'controller.emit("scheduledScene.run.' + instance.id + '")';
		dataFactory.runJs(params).then(function(response) {
			$timeout($scope.toggleRowSpinner, 2000);
		}, function(error) {
			$timeout($scope.toggleRowSpinner, 2000);
		});
	};


	/**
	 * Activate schedule
	 * @param {object} input 
	 * @param {boolean} activeStatus 
	 */
	$scope.activateSchedule = function(input, state) {
		input.active = state;
		if (!input.id) {
			return;
		}
		dataFactory.putApi('instances', input.id, input).then(function(response) {

		}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
		});


	};



	/**
	 * Clone schedule
	 * @param {object} input
	 * @returns {undefined}
	 */
	$scope.cloneSchedule = function(input) {
		input.id = 0;
		input.title = input.title + ' - copy';
		dataFactory.postApi('instances', input).then(function(response) {
			$location.path('/schedules/' + response.data.data.id);
		}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
		});
	};

	/**
	 * Delete schedule
	 */
	$scope.deleteSchedule = function(input, message) {
		alertify.confirm(message, function() {
			dataFactory.deleteApi('instances', input.id).then(function(response) {
				/*dataService.showNotifier({
				  message: $scope._t('delete_successful')
				});*/
				$scope.reloadData();
			}, function(error) {
				alertify.alertError($scope._t('error_delete_data'));
			});
		}).setting('labels', {
			'ok': $scope._t('ok')
		});
	};

});


/**
 * Controller that handles schedules
 * @class AutomationScheduleIdController
 */
myAppController.controller('AutomationScheduleIdController', function($scope, $routeParams, $location, $route, cfg, dataFactory, dataService, _, myCache) {
	$scope.schedule = {
		show: true,
		days: [1, 2, 3, 4, 5, 6, 0],
		rooms: [],
		devicesInRoom: [],
		availableDevices: [],
		assignedDevices: [],
		cfg: {
			switchBinary: {
				level: ['off', 'on'],
				default: {
					device: '',
					level: 'on',
					sendAction: false
				}
			},
			switchMultilevel: {
				level: ['off', 'on', 'lvl'],
				min: 0,
				max: 99,
				default: {
					device: '',
					level: 'on',
					exact: 0,
					sendAction: false
				}
			},
			switchRGBW: {
				level: ['on', 'off'],
				min: 0,
				max: 255,
				default: {
					deviceId: '',
					deviceType: 'switchRGBW',
					level: 'on',
					sendAction: false,
					reverseLevel: null
				}
			},
			thermostat: {
				min: 0,
				max: 99,
				default: {
					device: '',
					level: 0,
					sendAction: false
				}
			},
			doorlock: {
				level: ['close', 'open'],
				default: {
					device: '',
					level: 'open',
					sendAction: false
				}
			},
			toggleButton: {
				default: {}
			}

		},
		input: {
			instanceId: $routeParams.id,
			moduleId: "Schedules",
			active: true,
			title: "",
			params: {
				weekdays: [],
				times: ['00:00'],
				devices: []
			}
		}
	};
	// Original data
	$scope.orig = {
		model: {}
	};
	$scope.orig.model = angular.copy($scope.schedule.model);

	/**
	 * Reset model
	 */
	$scope.resetModel = function() {
		$scope.schedule.model = angular.copy($scope.orig.model);

	};

	/**
	 * Load instances
	 */
	$scope.loadInstance = function(id) {
		dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
			var instance = instances.data.data;
			var assignedDevices = $scope.schedule.assignedDevices;
			angular.extend($scope.schedule.input, {
				title: instance.title,
				active: instance.active,
				params: instance.params
			});

			instance.params.devices = instance.params.devices.map(function(d) {
				return {
					deviceId: d.deviceId,
					deviceType: d.deviceType,
					level: d.deviceType == 'switchMultilevel' ? (isNaN(d.level) ? d.level : 'lvl') : d.level,
					exact: d.deviceType == 'switchMultilevel' ? (!isNaN(d.level) ? d.level : 0) : undefined,
					sendAction: d.sendAction
				};
			});


			angular.forEach(instance.params.devices, function(d) {
				if (assignedDevices.indexOf(d.deviceId) === -1) {
					$scope.schedule.assignedDevices.push(d.deviceId);
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
			$scope.schedule.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
			$scope.loadDevices($scope.schedule.rooms);
		});

	};
	$scope.loadRooms();

	/**
	 * Load devices
	 */
	$scope.loadDevices = function(rooms) {
		dataFactory.getApi('devices').then(function(response) {
			var whiteList = _.keys($scope.schedule.cfg);
			var devices = dataService.getDevicesData(response.data.data.devices);
			// Set available devices
			$scope.schedule.availableDevices = devices.map(function(v) {
					var obj = {
						deviceId: v.id,
						deviceName: v.metrics.title,
						deviceType: v.deviceType,
						probeType: v.probeType,
						location: v.location,
						locationName: rooms[v.location].title,
						iconPath: v.iconPath
					};
					return obj;
				})
				.filter(function(v) {
					return whiteList.indexOf(v.deviceType) > -1;
				})
				.indexBy('deviceId')
				.value();

			if (!_.size($scope.schedule.availableDevices)) {
				$scope.schedule.show = false;
				return;
			}

			$scope.schedule.devicesInRoom = _.countBy($scope.schedule.availableDevices, function(v) {
				return v.location;
			});
		}, function(error) {});
	};


	/**
	 * Toggle Weekday
	 */
	$scope.toggleWeekday = function(day) {
		day = day.toString();
		var index = $scope.schedule.input.params.weekdays.indexOf(day);
		if (index > -1) {
			$scope.schedule.input.params.weekdays.splice(index, 1);
		} else {
			$scope.schedule.input.params.weekdays.push(day);

		}

	};

	/**
	 * Add time
	 */
	$scope.addTime = function(time) {
		var index = $scope.schedule.input.params.times.indexOf(time);
		if (index === -1) {
			$scope.schedule.input.params.times.push(time);
		}

	};
	/**
	 * Assign device to a schedule
	 * @param {object} device
	 * @returns {undefined}
	 */
	$scope.assignDevice = function(device) {
		var obj = $scope.schedule.cfg[device.deviceType];
		var data = {
			deviceId: device.deviceId,
			deviceType: device.deviceType,
			level: obj.default.level,
			exact: obj.default.exact,
			sendAction: obj.default.sendAction
		};
		$scope.schedule.input.params.devices.push(data);
		$scope.schedule.assignedDevices.push(device.deviceId);
		return;
	};

	/**
	 * Remove device id from assigned device and from input
	 *  @param {string} targetType
	 * @param {int} targetIndex 
	 * @param {string} deviceId 
	 */
	$scope.unassignDevice = function(targetIndex, deviceId) {
		var deviceIndex = $scope.schedule.assignedDevices.indexOf(deviceId);
		$scope.schedule.input.params.devices.splice(targetIndex, 1);
		if (deviceIndex > -1) {
			$scope.schedule.assignedDevices.splice(deviceIndex, 1);
		}
	};

	/**
	 * Store schedule
	 */
	$scope.storeSchedule = function(input, redirect) {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		input.params.devices = input.params.devices.map(function(dev) {
			return {
				deviceId: dev.deviceId,
				deviceType: dev.deviceType,
				level: dev.level == 'lvl' ? dev.exact : dev.level,
				sendAction: dev.sendAction
			};
		});

		dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function(response) {
			$scope.loading = false;
			if (redirect) {
				$location.path('/' + dataService.getUrlSegment($location.path()));
			}

		}, function(error) {
			$scope.loading = false;
			alertify.alertError($scope._t('error_update_data'));
		});

	};

});