/**
 * @overview Controllers that handls rules
 * @author Martin Vach
 */
/**
 * Controller that handles list of rules
 * @class AutomationRuleController
 */
myAppController.controller('AutomationRuleController', function($scope, $routeParams, $location, $timeout, $q, cfg, dataFactory, dataService, _, myCache) {
	$scope.rules = {
		state: '',
		enableTest: []
	};
	$scope.oldLogics = [];

	/**
	 * Load
	 * @returns {undefined}
	 */
	$scope.loadRules = function() {
		dataFactory.getApi('instances', null, true).then(function(response) {
			$scope.rules.all = _.chain(response.data.data).flatten().where({
				moduleId: 'Rules'
			}).filter(function(v) {
				var size = 0;
				for (k in v.params.devices) {
					if (v.params.devices[k].length) {
						size++;
					}
				}
				if (size) {
					$scope.rules.enableTest.push(v.id)
				}
				return v;
			}).value();
			// There are no instances
			if (!_.size($scope.rules.all)) {
				if (cfg.route.previous.indexOf(dataService.getUrlSegment($location.path())) > -1) {
					$location.path('/automations');
					return;
				}
				$location.path('/' + dataService.getUrlSegment($location.path()) + '/0');
				return;
			}
			// $scope.rules.state = 'success';
		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});
	};

	/**
	 * Load old LogicalRules and IfThen
	 * @returns {undefined}
	 */
	$scope.loadOldLogics = function() {

		var promises = [
				dataFactory.getApi('instances', '/IfThen', true),
				dataFactory.getApi('instances', '/LogicalRules', true)
			],
			ifThenList = [],
			logicalRulesList = [];

		$q.allSettled(promises).then(function(response) {
			var ifThen = response[0];
			var logicalRules = response[1];

			// Success - modules
			if (ifThen.state === 'fulfilled') {
				ifThenList = _.filter(ifThen.value.data.data, function(v) {
					return !v.params.moduleAPITransformed;
				});
			}

			// Success - instances
			if (logicalRules.state === 'fulfilled') {
				logicalRulesList = _.filter(logicalRules.value.data.data, function(v) {
					return !v.params.moduleAPITransformed;
				});
			}

			// Error message
			if (ifThen.state === 'rejected' && logicalRules.state === 'rejected') {
				$scope.loadRules();
				return;
			}

			console.log('### logicalRulesList:', logicalRulesList);

			$scope.oldLogics = $scope.oldLogics.concat(ifThenList, logicalRulesList);

			if ($scope.oldLogics.length) {
				var ifThenPostData = {
						source: 'IfThen',
						target: 'Rules'
					},
					logicalRulesPostData = {
						source: 'LogicalRules',
						target: 'Rules'
					};

				alertify.confirm($scope._t('logics_exists'))
					.setting('labels', {
						'ok': $scope._t('ok_import')
					})
					.set('onok', function(closeEvent) { //after clicking OK
						var confirmProm = [],
							hasLogicalRules = logicalRulesList.length ? true : false,
							hasIfThen = ifThenList.length ? true : false;

						if (hasLogicalRules) {
							confirmProm.push(dataFactory.postApi('modules_transform', logicalRulesPostData));
						}

						if (hasIfThen) {
							confirmProm.push(dataFactory.postApi('modules_transform', ifThenPostData));
						}

						if (confirmProm.length) {
							$q.allSettled(confirmProm).then(function(res) {
								var ifThenRes = hasIfThen && hasLogicalRules ? res[1] : (hasIfThen && !hasLogicalRules ? res[0] : undefined),
									logicalRulesRes = (hasIfThen && hasLogicalRules) || (!hasIfThen && hasLogicalRules) ? res[0] : undefined,
									resTitles = [];

								console.log('ifThenRes:', ifThenRes);
								console.log('logicalRulesRes:', logicalRulesRes);

								// Error message
								if (ifThenRes && ifThenRes.state === 'rejected' && logicalRulesRes && logicalRulesRes.state === 'rejected') {
									dataService.showNotifier({
										message: $scope._t('error_transformed'),
										type: 'error'
									});
									$scope.oldLogics = [];
									$scope.loadRules();
									return;
								}
								// Success - modules
								if (ifThenRes && ifThenRes.state === 'fulfilled') {
									resTitles = resTitles.concat(ifThenRes.value.data.data.map(function(entry) {
										return entry.title
									}));
								}

								// Success - instances
								if (logicalRulesRes && logicalRulesRes.state === 'fulfilled') {
									resTitles = resTitles.concat(logicalRulesRes.value.data.data.map(function(entry) {
										return entry.title
									}));
								}

								console.log('resTitles:', resTitles);

								if (resTitles.length) {
									dataService.showNotifier({
										message: $scope._t('successfully_transformed') + '<br>' + resTitles.join(',<br>')
									});
									$scope.loadRules();
								}

								$scope.oldLogics = [];

							});
						}
					})
					.set('oncancel', function(closeEvent) { //after clicking Cancel
						$scope.oldLogics = [];
						$scope.loadRules();
					});
			} else {
				$scope.oldLogics = [];
				$scope.loadRules();
			}
		});
	};
	$scope.loadOldLogics();

	/**
	 * Run test
	 * @param {object} instance
	 */
	$scope.runRuleTest = function(instance) {
		$scope.toggleRowSpinner(instance.id);
		$timeout($scope.toggleRowSpinner, 1000);
		var params = '/Scenes_' + instance.id + '/command/on';
		dataFactory.getApi('devices', params).then(function(response) {
			$timeout($scope.toggleRowSpinner, 2000);
		}, function(error) {
			$timeout($scope.toggleRowSpinner, 2000);
		});
	};


	/**
	 * Activate
	 * @param {object} input
	 * @param {boolean} activeStatus
	 */
	$scope.activateRule = function(input, state) {
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
	 * @returns {undefined}
	 */
	$scope.cloneRule = function(input) {
		input.id = 0;
		input.title = input.title + ' - copy';
		dataFactory.postApi('instances', input).then(function(response) {
			$location.path('/rules/' + response.data.data.id);
		}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
		});
	};

	/**
	 * Delete
	 */
	$scope.deleteRule = function(input, message) {
		alertify.confirm(message, function() {
			dataFactory.deleteApi('instances', input.id).then(function(response) {
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
 * Controller that handles rule detail
 * @class AutomationRuleIdController
 */
myAppController.controller('AutomationRuleIdController', function($scope, $routeParams, $location, $route, $filter, cfg, dataFactory, dataService, _, myCache) {
	$scope.rule = {
		show: true,
		tab: 'if',
		namespaces: [],
		rooms: [],
		options: {
			switchBinary: {
				level: ['on', 'off'],
				default: {
					deviceId: '',
					deviceType: 'switchBinary',
					level: 'on',
					sendAction: false,
					reverseLevel: 'off'
				}
			},
			sensorBinary: {
				level: ['on', 'off'],
				default: {
					deviceId: '',
					deviceType: 'sensorBinary',
					level: 'on',
					sendAction: false,
					reverseLevel: null
				}
			},
			doorlock: {
				level: ['open', 'close'],
				default: {
					deviceId: '',
					deviceType: 'doorlock',
					level: 'open',
					sendAction: false,
					reverseLevel: 'close'
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
			switchControl: {
				level: ['on', 'off', 'upstart', 'upstop', 'downstart', 'downstop'],
				default: {
					deviceId: '',
					deviceType: 'switchControl',
					level: 'on',
					sendAction: false,
					reverseLevel: null
				}
			},
			sensorDiscrete: {
				//TODO
				//level: ['press', 'hold', 'release', 'tap', 'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right', 'swipe_top_left_to_bottom_right', 'swipe_top_right_to_bottom_left', 'swipe_bottom_left_to_top_right', 'swipe_bottom_right_to_top_left'],
				default: {
					deviceId: '',
					deviceType: 'sensorDiscrete',
					level: '',
					sendAction: false,
					reverseLevel: null
				}
			},
			sensorMultilevel: {
				operator: ['=', '!=', '>', '>=', '<', '<='],
				min: 0,
				max: 99,
				default: {
					deviceId: '',
					deviceType: 'sensorMultilevel',
					level: 0,
					operator: '=',
					sendAction: false,
					reverseLevel: null
				}
			},
			switchMultilevel: {
				level: ['on', 'off', 'lvl'],
				operator: ['=', '!=', '>', '>=', '<', '<='],
				min: 0,
				max: 99,
				default: {
					deviceId: '',
					deviceType: 'switchMultilevel',
					level: 'on',
					exact: 0,
					operator: '=',
					sendAction: false,
					reverseLevel: 'off'
				}
			},
			thermostat: {
				level: ['on', 'off', 'lvl'],
				operator: ['=', '!=', '>', '>=', '<', '<='],
				min: 0,
				max: 99,
				default: {
					deviceId: '',
					deviceType: 'thermostat',
					level: 'on',
					exact: 0,
					operator: '=',
					sendAction: false,
					reverseLevel: null
				}
			},
			toggleButton: {
				default: {
					deviceId: '',
					deviceType: 'toggleButton',
					level: 'on',
					sendAction: false,
					reverseLevel: null
				}
			},
			time: {
				operator: ['<=', '>='],
				default: {
					type: 'time',
					operator: '>=',
					level: '00:00',
				}
			},
			nested: {
				logicalOperator: ['and', ',or'],
				default: {
					type: 'nested',
					logicalOperator: 'and',
					tests: []

				}
			},
			compare: {
				binaryOperators: ['=', '!='],
				multilevelOperators: ['=', '!=', '>', '>=', '<', '<='],
				default: {
					type: 'compare',
					operator: '=',
					operators: [],
					devices: []
				}
			},
			notification: {
				default: {
					target: '',
					target_custom: '',
					message: ''
				}
			}
		},
		source: {
			deviceTypes: ['toggleButton', 'switchControl', 'switchBinary', 'switchMultilevel', 'sensorBinary', 'sensorMultilevel', 'sensorDiscrete'],
			selected: {
				device: ''
			},
			devicesInRoom: [],
			devices: []
		},
		target: {
			deviceTypes: ['doorlock', 'switchBinary', 'switchMultilevel', 'thermostat', 'switchRGBW', 'switchControl', 'toggleButton', 'notification'],
			devicesInRoom: [],
			availableDevices: [],
			assignedDevices: [],
		},
		else: {
			deviceTypes: ['doorlock', 'switchBinary', 'switchMultilevel'],
		},
		advanced: {
			tab: 'if',
			target: {
				devicesInRoom: [],
				availableDevices: [],
				assignedDevices: [],
				eventSourceDevices: [],
				eventSourceTypes: ['toggleButton', 'notification']
			},
			tests: {
				devicesInRoom: [],
				availableDevices: [],
				assignedDevices: [],
				types: ['switchBinary', 'sensorBinary', 'doorlock', 'switchRGBW', 'switchControl', 'sensorDiscrete', 'sensorMultilevel', 'switchMultilevel', 'thermostat', 'toggleButton', 'time', 'nested']
			}

			/*  cfg: {
			   eventSourceDevices: ['toggleButton', 'notification']
			 } */
		},
		input: {
			id: $routeParams.id,
			moduleId: "Rules",
			active: true,
			title: "",
			params: {
				simple: {
					triggerEvent: {},
					triggerDelay: 0,
					targetElements: [],
					sendNotifications: [],
					reverseDelay: 0
				},
				advanced: {
					active: false,
					triggerScenes: [],
					triggerDelay: 0,
					logicalOperator: "and",
					tests: [],
					targetElements: [],
					sendNotifications: [],
					reverseDelay: 0,
					triggerOnDevicesChange: true
				},
				reverse: false
			}
		}
	};

	/**
	 *  Reset Original data
	 */
	$scope.orig = {
		options: {}
	};
	$scope.orig.options = angular.copy($scope.rule.options);
	$scope.resetOptions = function() {
		$scope.rule.options = angular.copy($scope.orig.options);

	};

	/**
	 * Load instances
	 */
	$scope.loadInstance = function(id) {
		dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
			var instance = instances.data.data;
			var assignedTargetDevices = $scope.rule.target.assignedDevices;

			instance.params.simple.targetElements = instance.params.simple.targetElements.map(function(d) {
				return {
					deviceId: d.deviceId,
					deviceType: d.deviceType,
					level: d.deviceType == 'switchMultilevel' ? (isNaN(d.level) ? d.level : 'lvl') : d.level,
					exact: d.deviceType == 'switchMultilevel' ? (!isNaN(d.level) ? d.level : 0) : undefined,
					sendAction: d.sendAction
				};
			});

			instance.params.advanced.targetElements = instance.params.advanced.targetElements.map(function(d) {
				return {
					deviceId: d.deviceId,
					deviceType: d.deviceType,
					level: d.deviceType == 'switchMultilevel' ? (isNaN(d.level) ? d.level : 'lvl') : d.level,
					exact: d.deviceType == 'switchMultilevel' ? (!isNaN(d.level) ? d.level : 0) : undefined,
					sendAction: d.sendAction
				};
			});

			// angular.forEach(instance.params.devices, function (d) {
			//   if (assignedDevices.indexOf(d.deviceId) === -1) {
			//     $scope.scene.assignedDevices.push(d.deviceId);
			//   }
			// });


			// Set input data
			//instance.params.advanced.tests = _.sortBy(instance.params.advanced.tests, 'testType');
			angular.extend($scope.rule.input, instance);
			// Set target assigned devices
			angular.forEach(instance.params.simple.targetElements, function(v, k) {
				$scope.rule.target.assignedDevices.push(v.deviceId);

			});
			// Set target assigned devices from notifications
			angular.forEach(instance.params.simple.sendNotifications, function(v, k) {
				$scope.rule.target.assignedDevices.push(v.target);

			});
			// Set advanced tests assigned devices
			angular.forEach(instance.params.advanced.tests, function(v, k) {
				if (v.type == 'nested') {
					_.filter(v.tests, function(test) {
						if (test.deviceId && $scope.rule.advanced.tests.assignedDevices.indexOf(test.deviceId) === -1) {
							$scope.rule.advanced.tests.assignedDevices.push(test.deviceId);
						}
					});
				} else {
					if (v.deviceId && $scope.rule.advanced.tests.assignedDevices.indexOf(v.deviceId) === -1) {
						$scope.rule.advanced.tests.assignedDevices.push(v.deviceId);
					}
				}


			});

			// Set advanced target assigned devices
			angular.forEach(instance.params.advanced.targetElements, function(v, k) {
				$scope.rule.advanced.target.assignedDevices.push(v.deviceId);

			});
			// Set advanced target assigned devices from notifications
			angular.forEach(instance.params.advanced.sendNotifications, function(v, k) {
				$scope.rule.advanced.target.assignedDevices.push(v.target);

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
			$scope.rule.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
			$scope.loadDevices($scope.rule.rooms);
		});

	};
	$scope.loadRooms();

	/**
	 * Load devices
	 */
	$scope.loadDevices = function(rooms) {
		dataFactory.getApi('devices').then(function(response) {
			var whiteListSource = $scope.rule.source.deviceTypes;
			var whiteListTarget = $scope.rule.target.deviceTypes;
			var whiteListAdvancedTests = $scope.rule.advanced.tests.types;
			var whiteListAdvancedEventSource = $scope.rule.advanced.target.eventSourceTypes;
			var devices = dataService.getDevicesData(response.data.data.devices, false, false, true).map(function(v) {
				var obj = {
					deviceId: v.id,
					deviceName: v.metrics.title,
					deviceType: v.deviceType,
					probeType: v.probeType,
					level: !_.isNaN(v.metrics.level) ? parseInt(v.metrics.level) : v.metrics.level,
					//level:v.metrics.level,
					location: v.location,
					locationName: rooms[v.location].title,
					iconPath: v.iconPath
				};
				return obj;
			});

			$scope.rule.namespaces = devices.indexBy('deviceId').value();

			// Set source devices
			$scope.rule.source.devices = devices.filter(function(v) {
					return whiteListSource.indexOf(v.deviceType) > -1;
				})
				.indexBy('deviceId')
				.value();
			// Set source sum of devices in the room
			$scope.rule.source.devicesInRoom = _.countBy($scope.rule.source.devices, function(v) {
				return v.location;
			});

			// Set target devices
			$scope.rule.target.availableDevices = devices.filter(function(v) {
					// Replacing deviceType with "notification"
					if (v.probeType == 'notification_push') {
						v.deviceType = 'notification';
					}

					return whiteListTarget.indexOf(v.deviceType) > -1;
				})
				.reject(function(v) {
					if ($scope.rule.source.selected.device == v.id) {
						return true;
					}
				})
				.indexBy('deviceId')
				.value();
			if (!_.size($scope.rule.target.availableDevices) || !_.size($scope.rule.source.devices)) {
				$scope.rule.show = false;
				return;
			}
			// Set target sum of devices in the room
			$scope.rule.target.devicesInRoom = _.countBy($scope.rule.target.availableDevices, function(v) {
				return v.location;
			});

			// Set advanced test devices
			$scope.rule.advanced.tests.availableDevices = devices.filter(function(v) {
					return whiteListAdvancedTests.indexOf(v.deviceType) > -1;
				})
				.indexBy('deviceId')
				.value();

			// Set advanced test sum of devices in the room
			$scope.rule.advanced.tests.devicesInRoom = _.countBy($scope.rule.advanced.tests.availableDevices, function(v) {
				return v.location;
			});

			// Set advanced event source devices
			$scope.rule.advanced.target.eventSourceDevices = devices.filter(function(v) {
					return whiteListAdvancedEventSource.indexOf(v.deviceType) > -1;
				})
				.indexBy('deviceId')
				.value();

		}, function(error) {});
	};


	// ctrl watch ?
	$scope.$watch('rule.input.params.simple.triggerEvent', function(newVal, oldVal) {

		if (newVal !== oldVal) {
			$scope.loadRooms();
		}
	});


	/**
	 * Assign source device
	 * @param {object} device
	 */
	$scope.assignSourceDevice = function(device) {
		var defaultDevice = $scope.rule.options[device.deviceType].default;
		if (!defaultDevice) {
			return;
		}
		defaultDevice.deviceId = device.deviceId;
		$scope.rule.input.params.simple.triggerEvent = defaultDevice;
	};

	/**
	 * Remove device id from source assigned device
	 */
	$scope.unassignSourceDevice = function() {
		$scope.rule.input.params.simple.triggerEvent = {};
	};

	/**
	 * Assign device to the target
	 * @param {object} device
	 * @returns {undefined}
	 */
	$scope.assignTargetDevice = function(device) {
		var input = $scope.rule.options[device.deviceType].default;
		if (!input || $scope.rule.target.assignedDevices.indexOf(device.deviceId) > -1) {
			return;
		}
		$scope.rule.target.assignedDevices.push(device.deviceId);
		switch (device.deviceType) {
			// Notification
			case 'notification':
				var notifion = {
					target: device.deviceId,
					message: ''
				};
				$scope.rule.input.params.simple.sendNotifications.push(notifion);
				break;
				// Default
			default:
				var element = {
					deviceId: device.deviceId,
					deviceType: device.deviceType,
					exact: input.exact,
					level: input.level,
					sendAction: input.sendAction,
					reverseLevel: input.reverseLevel
				};
				$scope.rule.input.params.simple.targetElements.push(element);
				break;

		}
		$scope.resetOptions();

	};


	/**
	 * Remove device id from target assigned device
	 * @param {int} index
	 * @param {string} deviceId
	 */
	$scope.unassignTargetDevice = function(targetIndex, deviceId) {

		var deviceIndex = $scope.rule.target.assignedDevices.indexOf(deviceId);
		if (targetIndex > -1) {
			$scope.rule.input.params.simple.targetElements.splice(targetIndex, 1);
			$scope.rule.target.assignedDevices.splice(deviceIndex, 1);
		}

	};

	/**
	 * Assign notification
	 * @param {object} notification
	 * @returns {undefined}
	 */
	$scope.assignTargetNotification = function(notification) {
		if ((notification.target && $scope.rule.target.assignedDevices.indexOf(notification.target) === -1)||(notification.target_custom && $scope.rule.target.assignedDevices.indexOf(notification.target_custom) === -1)) {
			var not = {
				target: notification.target ? notification.target : notification.target_custom,
				message: notification.message
			};
			$scope.rule.input.params.simple.sendNotifications.push(not);
			$scope.rule.target.assignedDevices.push(not.target);

			// reset options
			$scope.resetOptions();
		}
	};

	/**
	 * Remove notification from sendNotifications
	 * @param {int} index
	 * @param {string} deviceId
	 */
	$scope.unassignTargetNotification = function(targetIndex, target) {

		var notificationIndex = $scope.rule.target.assignedDevices.indexOf(target);
		if (targetIndex > -1) {
			$scope.rule.input.params.simple.sendNotifications.splice(targetIndex, 1);
			$scope.rule.target.assignedDevices.splice(notificationIndex, 1);
		}

	};

	/**
	 * Set reverse level
	 * @param {string} deviceType
	 */
	$scope.setReverseLevel = function(deviceType, inputType, index) {
		var model = $scope.rule.input.params[inputType].targetElements[index];
		switch (deviceType) {
			case 'switchBinary':
				model.reverseLevel = (model.level == 'on' ? 'off' : 'on');
				break;
			case 'doorlock':
				model.reverseLevel = (model.level == 'open' ? 'close' : 'open');
				break;
			case 'switchMultilevel':
				if (['off', 'on'].indexOf(model.level) > -1) {
					model.reverseLevel = (model.level == 'on' ? 'off' : 'on');
				} else {
					model.reverseLevel = $scope.rule.namespaces[model.deviceId].level;
				}
				break;
		}
	};

	/**
	 * get reverse level from target element
	 * @param {object} el
	 */
	$scope.getReverseLevel = function(el) {
		var reverseLevel = '';

		switch (el.deviceType) {
			case 'switchBinary':
				reverseLevel = (el.level == 'on' ? 'off' : 'on');
				break;
			case 'doorlock':
				reverseLevel = (el.level == 'open' ? 'close' : 'open');
				break;
			case 'switchMultilevel':
				if (['off', 'on'].indexOf(el.level) > -1) {
					reverseLevel = (el.level == 'on' ? 'off' : 'on');
				} else {
					reverseLevel = el.exact;
				}
				break;
		}

		return reverseLevel;
	};

	/**
	 * Assign advanced device condition
	 * @param {object} device
	 * @returns {undefined}
	 */
	$scope.assignAdvancedTestDevice = function(device) {
		var input = $scope.rule.options[device.deviceType].default;
		if (!input || $scope.rule.advanced.tests.assignedDevices.indexOf(device.deviceId) > -1) {
			return;
		}
		var index = _.size($scope.rule.input.params.advanced.tests);
		var test = {
			deviceId: device.deviceId,
			type: device.deviceType,
			level: input.level,
			operator: input.operator,
			sendAction: input.sendAction
		};
		$scope.rule.advanced.tests.assignedDevices.push(device.deviceId);
		$scope.rule.input.params.advanced.tests.push(test);
		$scope.resetOptions();
		$scope.expandElement('test_' + index);

	};

	/**
	 * Assign advanced condition
	 *  @param {string} type
	 * @returns {undefined}
	 */
	$scope.assignAdvancedTestCondition = function(type) {
		$scope.resetOptions();
		var input = $scope.rule.options[type].default;
		var index = _.size($scope.rule.input.params.advanced.tests);
		switch (type) {
			// time
			case 'time':
				var test = {
					type: input.type,
					operator: input.operator,
					level: input.level
				};
				break;
				// nested
			case 'nested':
				var test = {
					type: input.type,
					logicalOperator: input.logicalOperator,
					tests: input.tests
				};
				break;
			case 'compare':
				var test = {
					type: input.type,
					operator: input.operator,
					operators: input.operators,
					devices: []
				};
				break;
				// default
			default:
				return;
		}
		$scope.rule.input.params.advanced.tests.push(test);
		$scope.expandElement('test_' + index);
	};

	/**
	 * Remove advanced test
	 * @param {int} argetIndex
	 * @param {string} target
	 */
	$scope.unassignAdvancedTest = function(targetIndex, deviceId) {
		var test = $scope.rule.input.params.advanced.tests[targetIndex];
		if (test.type == 'nested') {
			// Set advanced tests assigned devices
			angular.forEach(test.tests, function(v, k) {
				if (v.deviceId) {
					var deviceIndex = $scope.rule.advanced.tests.assignedDevices.indexOf(v.deviceId);
					$scope.rule.advanced.tests.assignedDevices.splice(deviceId, 1);
				}

			});
			$scope.rule.input.params.advanced.tests.splice(targetIndex, 1);

		} else {
			$scope.rule.input.params.advanced.tests.splice(targetIndex, 1);
			if (deviceId) {
				var deviceIndex = $scope.rule.advanced.tests.assignedDevices.indexOf(deviceId);
				$scope.rule.advanced.tests.assignedDevices.splice(deviceId, 1);
			}
		}
	};

	/**
	 * Assign advanced compare device condition
	 * @param {object} device
	 * @param {int} testIndex
	 * @returns {undefined}
	 */
	$scope.assignAdvancedTestCompareDevice = function(device, testIndex) {
		var input = $scope.rule.options[device.deviceType].default;
		if (!input || $scope.rule.advanced.tests.assignedDevices.indexOf(device.deviceId) > -1) {
			return;
		}
		if (_.size($scope.rule.input.params.advanced.tests[testIndex].devices) == 0) {
			$scope.rule.input.params.advanced.tests[testIndex].devices.push({
				deviceId: device.deviceId,
				type: device.deviceType
			});
		} else if (_.size($scope.rule.input.params.advanced.tests[testIndex].devices) == 1) {
			// only assign second device if types are almost equal
			if ($scope.rule.input.params.advanced.tests[testIndex].devices[0].type == device.deviceType ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type.indexOf('Binary') != -1 && device.deviceType.indexOf('Binary') != -1) ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type.indexOf('Multilevel') != -1 && device.deviceType.indexOf('Multilevel') != -1) ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type == 'thermostat' && device.deviceType.indexOf('Multilevel') != -1) ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type.indexOf('Multilevel') != -1 && device.deviceType== 'thermostat')
				) {

				$scope.rule.input.params.advanced.tests[testIndex].devices.push({
					deviceId: device.deviceId,
					type: device.deviceType
				});

				// if two devices assigned, define possible operators

				if (device.deviceType == 'sensorBinary') {
					$scope.rule.input.params.advanced.tests[testIndex].operators = $scope.rule.options.compare.binaryOperators;
				} else {
					$scope.rule.input.params.advanced.tests[testIndex].operators = $scope.rule.options.compare.multilevelOperators;
				}
			} else {
				return;
			}
		} else {
			return;
		}
		$scope.rule.advanced.tests.assignedDevices.push(device.deviceId);
		$scope.resetOptions();
		$scope.expandElement('test_compare_' + testIndex + '1');
	};

	/**
	 * Assign advanced nested device condition
	 * @param {object} device
	 * @param {int} testIndex
	 * @returns {undefined}
	 */
	$scope.assignAdvancedTestNestedDevice = function(device, testIndex) {
		var input = $scope.rule.options[device.deviceType].default;
		if (!input || $scope.rule.advanced.tests.assignedDevices.indexOf(device.deviceId) > -1) {
			return;
		}
		var index = _.size($scope.rule.input.params.advanced.tests[testIndex].tests);
		var test = {
			deviceId: device.deviceId,
			type: device.deviceType,
			level: input.level,
			operator: input.operator,
			exact: input.exact,
			sendAction: input.sendAction
		};
		$scope.rule.advanced.tests.assignedDevices.push(device.deviceId);
		$scope.rule.input.params.advanced.tests[testIndex].tests.push(test);
		$scope.resetOptions();
		$scope.expandElement('test_nested_' + testIndex + index);

	};

	/**
	 * Assign advanced nested condition
	 *  @param {string} type
	 * @param {int} testIndex
	 * @returns {undefined}
	 */
	$scope.assignAdvancedTestNestedCondition = function(type, testIndex) {
		$scope.resetOptions();
		var input = $scope.rule.options[type].default;
		var index = _.size($scope.rule.input.params.advanced.tests[testIndex].tests);
		switch (type) {
			// time
			case 'time':
				var test = {
					type: input.type,
					operator: input.operator,
					level: input.level
				};
				break;
				// nested
			case 'compare':
				var test = {
					type: input.type,
					operator: input.operator,
					operator: input.operators,
					devices: []
				};
				break;
				// default
			default:
				return;
		}
		$scope.rule.input.params.advanced.tests[testIndex].tests.push(test);
		$scope.expandElement('test_nested_' + testIndex + index);

	};

	/**
	 * Show only valid devices based on current selection
	 * @param {string} deviceType
	 */
	$scope.filterDeviceListCompare = function(deviceType, testIndex) {
		if (_.size($scope.rule.input.params.advanced.tests[testIndex].devices) == 0) {
			switch(deviceType) {
				case 'sensorMultilevel':
				case 'sensorBinary':
				case 'switchMultilevel':
				case 'switchBinary':
				case 'thermostat':
					return false;
				default:
					return true;
			}
		} else if (_.size($scope.rule.input.params.advanced.tests[testIndex].devices) == 1) {
			if ($scope.rule.input.params.advanced.tests[testIndex].devices[0].type == deviceType ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type.indexOf('Binary') != -1 && deviceType.indexOf('Binary') != -1) ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type.indexOf('Multilevel') != -1 && deviceType.indexOf('Multilevel') != -1) ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type == 'thermostat' && deviceType.indexOf('Multilevel') != -1) ||
				($scope.rule.input.params.advanced.tests[testIndex].devices[0].type.indexOf('Multilevel') != -1 && deviceType== 'thermostat')
				) {
					return false;
				}
		}
		return true;
	};

	/**
	 * Remove advanced compare
	 * @param {int} targetIndex
	 * @param {string} deviceId
	 * @param {int} testIndex
	 */
	$scope.unassignAdvancedTestCompare = function(targetIndex, deviceId, testIndex) {
		$scope.rule.input.params.advanced.tests[testIndex].devices.splice(targetIndex, 1);

		if (deviceId) {
			var deviceIndex = $scope.rule.advanced.tests.assignedDevices.indexOf(deviceId);
			$scope.rule.advanced.tests.assignedDevices.splice(deviceId, 1);
		}

	};

	/**
	 * Remove advanced nested test
	 * @param {int} targetIndex
	 * @param {string} deviceId
	 * @param {int} testIndex
	 */
	$scope.unassignAdvancedTestNested = function(targetIndex, deviceId, testIndex) {
		$scope.rule.input.params.advanced.tests[testIndex].tests.splice(targetIndex, 1);

		if (deviceId) {
			var deviceIndex = $scope.rule.advanced.tests.assignedDevices.indexOf(deviceId);
			$scope.rule.advanced.tests.assignedDevices.splice(deviceId, 1);
		}

	};
	/**
	 * Assign advanced device to the target
	 * @param {object} device
	 * @returns {undefined}
	 */
	$scope.assignAdvancedTargetDevice = function(device) {
		var input = $scope.rule.options[device.deviceType].default;
		if (!input || $scope.rule.advanced.target.assignedDevices.indexOf(device.deviceId) > -1) {
			return;
		}
		$scope.rule.advanced.target.assignedDevices.push(device.deviceId);
		switch (device.deviceType) {
			// Notification
			case 'notification':
				var notifion = {
					target: device.deviceId,
					message: ''
				};
				$scope.rule.input.params.advanced.sendNotifications.push(notifion);
				break;
				// Default
			default:
				var element = {
					deviceId: device.deviceId,
					deviceType: device.deviceType,
					level: input.level,
					sendAction: input.sendAction,
					reverseLevel: input.reverseLevel
				};
				$scope.rule.input.params.advanced.targetElements.push(element);
				break;

		}
		$scope.resetOptions();

	};

	/**
	 * Remove device id from advanced target assigned device
	 * @param {int} index
	 * @param {string} deviceId
	 */
	$scope.unassignAdvancedTargetDevice = function(targetIndex, deviceId) {

		var deviceIndex = $scope.rule.target.assignedDevices.indexOf(deviceId);
		if (targetIndex > -1) {
			$scope.rule.input.params.advanced.targetElements.splice(targetIndex, 1);
			$scope.rule.advanced.target.assignedDevices.splice(deviceIndex, 1);
		}

	};

	/**
	 * Assign notification
	 * @param {object} notification
	 * @returns {undefined}
	 */
	$scope.assignAdvancedTargetNotification = function(notification) {
		if ((notification.target && $scope.rule.target.assignedDevices.indexOf(notification.target) === -1)||(notification.target_custom && $scope.rule.target.assignedDevices.indexOf(notification.target_custom) === -1)) {
			var not = {
				target: notification.target ? notification.target : notification.target_custom,
				message: notification.message
			};

			$scope.rule.input.params.advanced.sendNotifications.push(notification);
			$scope.rule.advanced.target.assignedDevices.push(notification.target);
			$scope.resetOptions();
		}

	};

	/**
	 * Remove notification from sendNotifications
	 * @param {int} index
	 * @param {string} deviceId
	 */
	$scope.unassignAdvancedTargetNotification = function(targetIndex, target) {

		var notificationIndex = $scope.rule.advanced.target.assignedDevices.indexOf(target);
		if (targetIndex > -1) {
			$scope.rule.input.params.advanced.sendNotifications.splice(targetIndex, 1);
			$scope.rule.advanced.target.assignedDevices.splice(notificationIndex, 1);
		}

	};

	/**
	 * Assign device ID to the advanced event source
	 * @param {string} deviceId
	 * @returns {undefined}
	 */
	$scope.assignAdvancedEventSource = function(deviceId) {
		$scope.rule.input.params.advanced.triggerScenes.push(deviceId);

	};

	/**
	 * Remove device id from advanced event source
	 * @param {string} deviceId
	 * @returns {undefined}
	 */
	$scope.unassignAdvancedEventSource = function(deviceId) {
		var deviceIndex = $scope.rule.input.params.advanced.triggerScenes.indexOf(deviceId);
		if (deviceIndex > -1) {
			$scope.rule.input.params.advanced.triggerScenes.splice(deviceIndex, 1);
		}

	};

	/**
	 * Store
	 */
	$scope.storeRule = function(input, redirect) {
		input.params.advanced.targetElements = input.params.advanced.targetElements.map(function(dev) {
			return {
				deviceId: dev.deviceId,
				deviceType: dev.deviceType,
				level: dev.level == 'lvl' ? dev.exact : dev.level,
				sendAction: dev.sendAction,
				reverseLevel: dev.reverseLevel
			};
		});

		input.params.simple.targetElements = input.params.simple.targetElements.map(function(dev) {
			return {
				deviceId: dev.deviceId,
				deviceType: dev.deviceType,
				level: dev.level == 'lvl' ? dev.exact : dev.level,
				sendAction: dev.sendAction,
				reverseLevel: dev.reverseLevel
			};
		});

		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};

		dataFactory.storeApi('instances', parseInt(input.id, 10), input).then(function(response) {
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