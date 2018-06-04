/**
 * @overview Controllers that handls hazard notification
 * @author Martin Vach
 */
/**
 * Controller that handles list of hazard notifications
 * @class HazarController
 */
myAppController.controller('HazardNotificationController', function($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
	$scope.hazardProtections = {
		moduleId: 'HazardNotification',
		state: '',
		enableTest: []
	}

	$location.path('/hazard/0');

	//////////////////// OLD /////////////////////////////////////////

	/**
	 * Load instance with hazard module
	 * @returns {undefined}
	 */
	$scope.loadHazardModule = function() {
		dataFactory.getApi('instances', null, true).then(function(response) {
			/*var hazard = _.findWhere(response.data.data, {
			    moduleId: $scope.hazardProtections.moduleId
			});*/
			$location.path('/hazard/0');
		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});
	};
	//$scope.loadHazardModule();

	/**
	 * Load instances
	 * @returns {undefined}
	 */
	$scope.loadInstances = function() {
		dataFactory.getApi('instances', null, true).then(function(response) {
			$scope.hazardProtections.all = _.chain(response.data.data).flatten().where({
				moduleId: $scope.hazardProtections.moduleId
			}).value();
			// There are no instances
			if (!_.size($scope.hazardProtections.all)) {
				// Previous page is detail - clicked on cancel or page is reloaded - after delete
				if (cfg.route.previous.indexOf(dataService.getUrlSegment($location.path())) > -1) {
					$location.path('/automations');
					return;
				}
				$location.path('/' + dataService.getUrlSegment($location.path()) + '/0');
				return;
			}
			$scope.hazardProtections.state = 'success';
		}, function(error) {
			alertify.alertError($scope._t('error_load_data'));
		});
	};

	//$scope.loadInstances();

	/**
	 * Activate/Deactivate instance
	 * @param {object} input 
	 * @param {boolean} activeStatus 
	 */
	$scope.activateInstance = function(input, state) {
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
	 * Clone 
	 * @param {object} input
	 * @param {string} redirect
	 * @returns {undefined}
	 */
	$scope.cloneInstance = function(input, redirect) {
		input.id = 0;
		input.title = input.title + ' - copy';
		dataFactory.postApi('instances', input).then(function(response) {
			$location.path($location.path() + '/' + response.data.data.id);
		}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
		});
	};

	/**
	 * Delete
	 */
	$scope.deleteInstance = function(input, message) {
		alertify.confirm(message, function() {
			dataFactory.deleteApi('instances', input.id).then(function(response) {
				$scope.reloadData();
			}, function(error) {
				alertify.alertError($scope._t('error_delete_data'));
			});

		});
	};

});

/**
 * Controller that handles a fire protection detail
 * @class LeakageIdController
 */
myAppController.controller('HazardNotificationIdController', function($scope, $routeParams, $location, $timeout, $interval, $filter, cfg, dataFactory, dataService, _, myCache) {
	$scope.hazardProtection = {
		moduleId: 'HazardNotification',
		active: true,
		show: true,
		tab: 'fire',
		hazardsTypes: ['fire', 'leakage'],
		sensors: ['smoke', 'alarm_smoke', 'alarmSensor_smoke', 'flood', 'alarm_flood', 'alarmSensor_flood'],
		devices: ['switchBinary', 'switchMultilevel', 'toggleButton'],
		notifiers: ['notification_push'],
		interval: [60, 120, 300, 600, 900, 1800, 3600],
		firedOn: ['on', 'off', 'alarm', 'revert'],
		sensorTyp: "",
		availableSensors: {},
		availableDevices: {},
		availableNotifiers: {},
		devicesInRoom: [],
		devicesInRoom: [],
		rooms: [],
		cfg: {
			switchBinary: {
				status: ['on', 'off'],
				default: {
					deviceId: '',
					deviceType: 'switchBinary',
					status: 'on',
					sendAction: false
				}
			},
			switchMultilevel: {
				status: ['on', 'off', 'lvl'],
				min: 0,
				max: 99,
				operator: ['=', '!=', '>', '>=', '<', '<='],
				default: {
					deviceId: '',
					deviceType: 'switchMultilevel',
					status: 'on',
					level: 0,
					sendAction: false
				}
			},
			toggleButton: {
				default: {
					deviceId: '',
					deviceType: 'toggleButton',
					status: '',
				}
			},
			notification: {
				default: {
					target: '',
					message: '',
					firedOn: 'alarm'
				}
			}

		},
		fire: {
			sensors: ['smoke', 'alarm_smoke', 'alarmSensor_smoke'],
			message: 'default_fire_message', // default message label
			instance: false,
			assignedDevices: [],
			assignedNotifiers: [],
			input: {
				instanceId: $routeParams.id,
				id: null,
				moduleId: "HazardNotification",
				active: true,
				title: "",
				params: {
					sensors: [],
					triggerEvent: [],
					sendNotifications: [],
					notificationsInterval: 0,
					hazardType: "fire"
				}
			}
		},
		leakage: {
			sensors: ['flood', 'alarm_flood', 'alarmSensor_flood'],
			message: 'default_leakage_message', // default message label
			instance: false,
			assignedDevices: [],
			assignedNotifiers: [],
			input: {
				instanceId: $routeParams.id,
				id: null,
				moduleId: "HazardNotification",
				active: true,
				title: "",
				params: {
					sensors: [],
					triggerEvent: [],
					sendNotifications: [],
					notificationsInterval: 0,
					hazardType: "leakage"
				}
			}
		}
	};

	/**
	 *  Reset Original data 
	 */
	$scope.orig = {
		options: {}
	};
	$scope.orig.options = angular.copy($scope.hazardProtection.cfg);
	$scope.resetOptions = function() {
		$scope.hazardProtection.cfg = angular.copy($scope.orig.options);
	};

	/**
	 * Load instances
	 */
	$scope.loadInstances = function() {
		dataFactory.getApi('instances', null, true).then(function(response) {
			var hazards = _.filter(response.data.data, function(h) {
				return h.moduleId == $scope.hazardProtection.moduleId;
			});

			hazards.forEach(function(instance) {
				console.log(instance);
				if ($scope.hazardProtection[instance.params.hazardType]) {
					$scope.hazardProtection[instance.params.hazardType].instance = true;

					angular.extend($scope.hazardProtection[instance.params.hazardType].input, {
						title: instance.title,
						active: instance.active,
						params: instance.params,
						id: instance.id
					});

					// Set assigned devices
					angular.forEach(instance.params.triggerEvent, function(v, k) {
						if (v.deviceId) {
							$scope.hazardProtection[instance.params.hazardType].assignedDevices.push(v.deviceId);
						}
					});

					// Set assigned devices
					angular.forEach(instance.params.sendNotifications, function(v, k) {
						if (v.notifier) {
							$scope.hazardProtection[instance.params.hazardType].assignedNotifiers.push(v.notifier);
						}
					});
				}
			});

		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});
	};
	$scope.loadInstances();

	/**
	 * Load rooms
	 */
	$scope.loadRooms = function() {
		dataFactory.getApi('locations').then(function(response) {
			$scope.hazardProtection.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
			$scope.loadDevices($scope.hazardProtection.rooms);
		});

	};
	$scope.loadRooms();

	/**
	 * Load devices
	 * @param  {mixed} rooms [description]
	 */
	$scope.loadDevices = function(rooms) {
		dataFactory.getApi('devices').then(function(response) {
				var devices = dataService.getDevicesData(response.data.data.devices);

				_.filter(devices.value(), function(v) {
					var obj = {
						deviceId: v.id,
						deviceName: v.metrics.title,
						deviceType: v.deviceType,
						probeType: v.probeType,
						location: v.location,
						locationName: rooms[v.location].title,
						iconPath: v.iconPath
					};
					// Set sensors
					if ($scope.hazardProtection.sensors.indexOf(v.probeType) > -1) {
						$scope.hazardProtection.availableSensors[v.id] = obj;
					}
					// Set devices
					if ($scope.hazardProtection.devices.indexOf(v.deviceType) > -1) {
						$scope.hazardProtection.availableDevices[v.id] = obj;
					}
					// Set notifiers
					if ($scope.hazardProtection.notifiers.indexOf(v.probeType) > -1) {
						$scope.hazardProtection.availableNotifiers[v.id] = obj;
					}
				});
				if (!_.size($scope.hazardProtection.availableSensors)) {
					$scope.hazardProtection.show = false;
					return;
				}
				// Set devices in the room
				$scope.hazardProtection.devicesInRoom = _.countBy($scope.hazardProtection.availableDevices, function(v) {
					return v.location;
				});

				// load preset for instance
				$scope.loadPreset();

			},
			function(error) {});
	};

	/**
	 * loadPreset configuration
	 */
	$scope.loadPreset = function() {

		$scope.hazardProtection.hazardsTypes.forEach(function(type) {

			if (!$scope.hazardProtection[type].instance) {
				// assign all device if no instances exists (only on start)
				angular.forEach($scope.hazardProtection.availableSensors, function(sensor) {
					if ($scope.hazardProtection[type].sensors.indexOf(sensor.probeType) !== -1) {
						$scope.assignSensor(sensor.deviceId, type);
					}
				});

				// set default notification
				var notification = {};
				angular.copy($scope.hazardProtection.cfg.notification.default, notification)
				notification.target = $scope.user.email;
				notification.message = $scope._t($scope.hazardProtection[type].message);
				$scope.hazardProtection[type].input.params.sendNotifications.push(notification);

				// expand notification
				$scope.expandElement('hazardProtection_' + type + '_0');
			}
		});
	}

	/**
	 * Assign sensor
	 * @param {int} sensorId
	 * @param {string} type fire/leakage
	 */
	$scope.assignSensor = function(sensorId, type) {
		if ($scope.hazardProtection[type]) {
			if ($scope.hazardProtection[type].input.params.sensors.indexOf(sensorId) === -1) {
				$scope.hazardProtection[type].input.params.sensors.push(sensorId);
			}
		}
	};

	/**
	 * Remove sensor id from assigned sensors
	 * @param {string} deviceId 
	 * @param {string} type fire/leakage
	 */
	$scope.unassignSensor = function(deviceId, type) {
		if ($scope.hazardProtection[type]) {
			var deviceIndex = $scope.hazardProtection[type].input.params.sensors.indexOf(deviceId);
			if (deviceIndex > -1) {
				$scope.hazardProtection[type].input.params.sensors.splice(deviceIndex, 1);
			}
		}
	};

	/**
	 * Assign a device
	 * @param {object} device
	 * @returns {undefined}
	 */
	$scope.assignDevice = function(device, type) {
		var input = $scope.hazardProtection.cfg[device.deviceType],
			obj = {};
		if ($scope.hazardProtection[type]) {
			if (!input || $scope.hazardProtection[type].assignedDevices.indexOf(device.deviceId) > -1) {
				return;
			}
			obj = input.default;
			obj.deviceId = device.deviceId;

			$scope.hazardProtection[type].input.params.triggerEvent.push(input.default);
			$scope.hazardProtection[type].assignedDevices.push(device.deviceId);
			$scope.resetOptions();
		}
	};

	/**
	 * Remove device id from assigned device
	 * @param {int} index 
	 * @param {string} deviceId 
	 */
	$scope.unassignDevice = function(targetIndex, deviceId, type) {
		if ($scope.hazardProtection[type]) {
			var deviceIndex = $scope.hazardProtection[type].assignedDevices.indexOf(deviceId);
			if (targetIndex > -1) {
				$scope.hazardProtection[type].input.params.triggerEvent.splice(targetIndex, 1);
				$scope.hazardProtection[type].assignedDevices.splice(deviceIndex, 1);
			}
		}
	};

	/**
	 * Assign notification
	 * @param  {object} notification 
	 * @param  {string} type         fire/leakage
	 */
	$scope.assignNotification = function(notification, type) {
		if ($scope.hazardProtection[type]) {
			$scope.hazardProtection[type].input.params.sendNotifications.push(notification);
			$scope.resetOptions();
		}
	};

	/**
	 * Remove notification id from assigned notifications
	 * @param {int} targetIndex 
	 * @param {string} deviceId
	 * @param {string} type fire/leakage 
	 */
	$scope.unassignNotification = function(targetIndex, deviceId, type) {
		if ($scope.hazardProtection[type]) {
			var deviceIndex = $scope.hazardProtection[type].assignedNotifiers.indexOf(deviceId);
			if (targetIndex > -1) {
				$scope.hazardProtection[type].input.params.sendNotifications.splice(targetIndex, 1);
				$scope.hazardProtection[type].assignedNotifiers.splice(deviceIndex, 1);
			}
		}
	};

	/**
	 * Aktivate deaktivate the hazard instances
	 */
	$scope.activateInstances = function() {
		if ($scope.hazardProtection.active) {
			$scope.hazardProtection.fire.input.active = false;
			$scope.hazardProtection.leakage.input.active = false;
			$scope.hazardProtection.active = false;
		} else {
			$scope.hazardProtection.fire.input.active = true;
			$scope.hazardProtection.leakage.input.active = true;
			$scope.hazardProtection.active = true;
		}
	};

	/**
	 * Store instances 
	 * @param  {object} fire        instance data
	 * @param  {object} leakage     instance data
	 * @param  {boolean} redirect   if ture redirect 
	 */
	$scope.storeInstances = function(fire, leakage, redirect) {
		var fireError = true,
			leakageError = true,
			fireDone = false,
			leakageDone = false;

		fire.instanceId = fire.id !== null ? fire.id : fire.instanceId;
		leakage.instanceId = leakage.id !== null ? leakage.id : leakage.instanceId;

		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		// store hazard fire instance
		dataFactory.storeApi('instances', parseInt(fire.instanceId, 10), fire).then(function(response) {
			fireError = false;
			fireDone = true;
		}, function(error) {
			fireDone = true;
		});

		// store hazard leakage instance
		dataFactory.storeApi('instances', parseInt(leakage.instanceId, 10), leakage).then(function(response) {
			leakageError = false;
			leakageDone = true;
		}, function(error) {
			leakageDone = true;
		});

		var timer = $interval(function() {
			if (leakageDone && fireDone) {
				$scope.loading = false;
				$interval.cancel(timer);

				if (leakageError || fireError) {
					alertify.alertError($scope._t('error_update_data'));
				} else {
					if (redirect) {
						$location.path('/' + dataService.getUrlSegment($location.path()));
					}
				}
			}
		}, 1000);
	};
});