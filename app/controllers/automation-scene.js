/**
 * @overview Controllers that handls scenes
 * @author Martin Vach
 */
/**
 * Controller that handles list of scenes
 * @class AutomationSceneController
 */
myAppController.controller('AutomationSceneController', function($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
	$scope.scenes = {
		state: '',
		enableTest: [],
	};
	$scope.oldScenes = [];

	/**
	 * Load schedules
	 * @returns {undefined}
	 */
	var loadScenes = function() {
		dataFactory.getApi('instances', null, true).then(function(response) {
			$scope.scenes.all = _.chain(response.data.data).flatten().where({
				moduleId: 'Scenes'
			}).filter(function(v) {
				var size = 0;
				for (k in v.params.devices) {
					if (v.params.devices[k].length) {
						size++;
					}
				}
				for (k in v.params.notifications) {
						size++;
				}
				if (size) {
					$scope.scenes.enableTest.push(v.id)
				}
				return v;
			}).value();
			// There are no instances
			if (!_.size($scope.scenes.all)) {
				// Url is entered in address bar or previous page is automations
				/* if (!cfg.route.previous || cfg.route.previous == '/automations') {
					$location.path('/' + dataService.getUrlSegment($location.path()) + '/0');
					return;
				} */
				// Previous page is detail - clicked on cancel or page is reloaded - after delete
				if (cfg.route.previous.indexOf(dataService.getUrlSegment($location.path())) > -1) {
					$location.path('/automations');
					return;
				}
				$location.path('/' + dataService.getUrlSegment($location.path()) + '/0');
				/*  $scope.scenes.state = 'blank';
				return; */
			}
			//$scope.scenes.state = 'success';
		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});
	};

	/**
	 * Load oldScenes
	 * @returns {undefined}
	 * deprecated
	 */
	var loadOldScenes = function() {
		dataFactory.getApi('instances', '/LightScene', true).then(function(response) {
			$scope.oldScenes = _.filter(response.data.data, function(v) {
				console.log(v);
				return !v.params.moduleAPITransformed;
			});
		});
	};
	loadOldScenes();
	loadScenes();
	$scope.convertScene = function () {
		dataFactory.postApi('modules_transform', {
			source: 'LightScene',
			target: 'Scenes'
		}).then(function(response) {
			console.log(response);
			if (response.data && response.data.data) {
				var newScenes = response.data.data.map(function(entry) {
					return entry.title
				});
				dataService.showNotifier({
					message: $scope._t('successfully_transformed') + '<br>' + newScenes.join(',<br>')
				});
			}
			$scope.oldScenes = [];
		}, function(error) {
			dataService.showNotifier({
				message: $scope._t('error_transformed'),
				type: 'error'
			});
			$scope.oldScenes = [];
		}).finally(loadScenes);
	}
	/**
	 * Run test
	 * @param {object} instance
	 */
	$scope.runSceneTest = function(instance) {
		$scope.toggleRowSpinner(instance.id);
		$timeout($scope.toggleRowSpinner, 1000);
		var params = '/Scenes_' + instance.id + '/command/on';
		dataFactory.getApi('devices', params, true).then(function(response) {
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
	$scope.activateScene = function(input, state) {
		input.active = state;
		if (!input.id) {
			return;
		}
		dataFactory.putApi('instances', input.id, input).then(function(response) {}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
		});
	};
	/**
	 * Clone
	 * @param {object} input
	 * @returns {undefined}
	 */
	$scope.cloneScene = function(input) {
		input.id = 0;
		input.title = input.title + ' - copy';
		dataFactory.postApi('instances', input).then(function(response) {
			$location.path('/scenes/' + response.data.data.id);
		}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
		});
	};
	/**
	 * Delete
	 */
	$scope.deleteScene = function(input, message) {
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
 * Controller that handles scene detail
 * @class AutomationSceneIdController
 */
myAppController.controller('AutomationSceneIdController', function($scope, $routeParams, $location, $route, $filter, $timeout, cfg, dataFactory, dataService, _, myCache) {
	$scope.scene = {
		show: true,
		rooms: [],
		devicesInRoom: [],
		availableDevices: [],
		assignedDevices: [],
		assignedNotifications: [],
		cfg: {
			switchBinary: {
				level: ['off', 'on'],
				default: {
					level: 'on',
					sendAction: false
				}
			},
			switchMultilevel: {
				level: ['on', 'off', 'lvl'],
				min: 0,
				max: 99,
				default: {
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
					level: 0,
					sendAction: false
				}
			},
			doorlock: {
				level: ['close', 'open'],
				default: {
					level: 'open',
					sendAction: false
				}
			},
			toggleButton: {
				default: {}
			},
			notification: {
				default: {
					target: '',
					targetName: '',
					message: ''
				}
			}
		},
		input: {
			instanceId: $routeParams.id,
			moduleId: "Scenes",
			active: true,
			title: "Scene",
			params: {
				customIcon: {
					table: [{
						icon: false
					}]
				},
				devices: [],
				notifications: []
			}
		},
		upload: {
			fileName: false,
			maxSize: $filter('fileSizeString')(cfg.upload.icon.size),
			extensions: cfg.upload.icon.extension.toString()
		},
		icons: {}
	};
	$scope.notifications = {
		channels: []
	};
	/**
	 * Load instances
	 */
	$scope.loadInstance = function(id) {
		dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
			var instance = instances.data.data;
			var assignedDevices = $scope.scene.assignedDevices;
			var assignedNotifications = $scope.scene.assignedNotifications;
			angular.extend($scope.scene.input, {
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
					$scope.scene.assignedDevices.push(d.deviceId);
				}
			});

			angular.forEach(instance.params.notifications, function(d) {
				var nc = _.findWhere($scope.notifications.channels, { id: d.target });
				d.targetName = nc ? nc.name : d.target;
				if (assignedNotifications.indexOf(d.target) === -1) {
					$scope.scene.assignedNotifications.push(d.target);
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
			$scope.scene.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
			$scope.loadDevices($scope.scene.rooms);
		});
	};
	$scope.loadRooms();
	/**
	 * Load devices
	 */
	$scope.loadDevices = function(rooms) {
		dataFactory.getApi('devices').then(function(response) {
			var whiteList = _.keys($scope.scene.cfg);
			var devices = dataService.getDevicesData(response.data.data.devices);
			// Set available devices
			$scope.scene.availableDevices = devices.map(function(v) {
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
			}).filter(function(v) {
				return whiteList.indexOf(v.deviceType) > -1;
			}).indexBy('deviceId').value();
			if (!_.size($scope.scene.availableDevices)) {
				$scope.scene.show = false;
				return;
			}
			// Set devices in the room
			$scope.scene.devicesInRoom = _.countBy($scope.scene.availableDevices, function(v) {
				return v.location;
			});
		}, function(error) {});
	};
	/**
	 * Load notification channels
	 */
	$scope.loadNotificationChannels = function(rooms) {
		dataFactory.getApi('notification_channels', '/all').then(function(response) {
			$scope.notifications.channels = response.data.data;
			if ($scope.scene.input.params.notifications) {
				$scope.scene.input.params.notifications.forEach(function(n) {
					var nc = _.findWhere($scope.notifications.channels, { id: n.target });
					if (nc) {
						n.targetName = nc.name;
					}
				});
			}
		}, function(error) {});
	};
	$scope.loadNotificationChannels();
	/**
	 * Load already uploaded icons
	 * @returns {undefined}
	 */
	$scope.loadUploadedIcons = function() {
		// Atempt to load data
		dataFactory.getApi('icons', null, true).then(function(response) {
			$scope.scene.icons = response.data.data;
		}, function(error) {
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
			$scope.loading = false;
		});
	};
	$scope.loadUploadedIcons();
	/**
	 * Validate an uploaded icon
	 * @param {object} files
	 * @param {object} info
	 * @returns {undefined}
	 */
	$scope.uploadCustomIcon = function(files, info) {
		var ext = $filter('fileExtension')(files[0].name);
		// Extends files object with a new property
		files[0].newName = dataService.uploadFileNewName('scene_' + $routeParams.id + '.' + ext);
		// Check allowed file formats
		if (info.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
			alertify.alertError($scope._t('upload_format_unsupported', {
				'__extension__': $filter('fileExtension')(files[0].name)
			}) + ' ' + $scope._t('upload_allowed_formats', {
				'__extensions__': info.extension.toString()
			}));
			return;
		}
		// Check allowed file size
		if (files[0].size > info.size) {
			alertify.alertError($scope._t('upload_allowed_size', {
				'__size__': $filter('fileSizeString')(info.size)
			}) + ' ' + $scope._t('upload_size_is', {
				'__size__': $filter('fileSizeString')(files[0].size)
			}));
			return;
		}
		// Set selected file name
		$scope.scene.upload.fileName = files[0].name;
		// Set form data
		// Set local variables
		var fd = new FormData();
		fd.append('files_files', files[0]);
		// Atempt to upload a file
		dataFactory.uploadApiFile(cfg.api.icons_upload, fd).then(function(response) {
			$scope.scene.input.params.customIcon.table['0'].icon = response.data.data;
			$scope.loadUploadedIcons();
		}, function(error) {
			alertify.alertError($scope._t('error_upload'));
		});
	};
	/**
	 * Set a custom icon with an icon from the list
	 * @param {string} icon
	 * @returns {undefined}
	 */
	$scope.setCustomIcon = function(icon) {
		if (!icon) {
			return;
		}
		$scope.scene.input.params.customIcon.table['0'].icon = icon;
	};
	/**
	 * Remove custom icon
	 * @param {string} string
	 * @returns {undefined}
	 */
	$scope.removeCustomIcon = function(icon) {
		if (!icon) {
			return;
		}
		$scope.scene.input.params.customIcon.table['0'].icon = false;
	};
	/**
	 * Assign device to a schedule
	 * @param {object} device
	 * @returns {undefined}
	 */
	$scope.assignDevice = function(device) {
		var obj, data;

		obj = $scope.scene.cfg[device.deviceType];
		var data = {
			deviceId: device.deviceId,
			deviceType: device.deviceType,
			exact: obj.default.exact,
			level: obj.default.level,
			sendAction: obj.default.sendAction
		};
		$scope.scene.input.params.devices.push(data);

		$scope.scene.assignedDevices.push(device.deviceId);
		return;
	};
	/**
	 * Remove device id from assigned device and from input
	 *  @param {string} targetType
	 * @param {int} targetIndex
	 * @param {string} deviceId
	 */
	$scope.unassignDevice = function(targetIndex, deviceId) {
		var deviceIndex = $scope.scene.assignedDevices.indexOf(deviceId);
		$scope.scene.input.params.devices.splice(targetIndex, 1);
		if (deviceIndex > -1) {
			$scope.scene.assignedDevices.splice(deviceIndex, 1);
		}
	};

	/**
	 * Assign notification
	 * @param {object} notification
	 * @returns {undefined}
	 */
	$scope.assignNotification = function(notification) {
		if ((notification.target && $scope.scene.assignedNotifications.indexOf(notification.target) === -1) || (notification.target_custom && $scope.scene.assignedNotifications.indexOf(notification.target_custom) === -1)) {
			var nc = _.findWhere($scope.notifications.channels, { id: notification.target });
			var not = {
				target: notification.target,
				targetName: nc ? nc.name : notification.target,
				message: notification.message
			};
			$scope.scene.input.params.notifications.push(not);
			$scope.scene.assignedNotifications.push(not.target);

			// reset options
			$scope.scene.cfg.notification.default.target = '';
			$scope.scene.cfg.notification.default.message = '';
		}

	};

	/**
	 * Remove notification from sendNotifications
	 * @param {int} index
	 * @param {string} deviceId
	 */
	$scope.unassignNotification = function(targetIndex, target) {

		var notificationIndex = $scope.scene.assignedNotifications.indexOf(target);
		if (targetIndex > -1) {
			$scope.scene.input.params.notifications.splice(targetIndex, 1);
			$scope.scene.assignedNotifications.splice(notificationIndex, 1);
		}

	};

	/**
	 * Store
	 */
	$scope.storeScene = function(input, redirect) {
		input.params.devices = input.params.devices.map(function(dev) {
			return {
				deviceId: dev.deviceId,
				deviceType: dev.deviceType,
				level: dev.level == 'lvl' ? dev.exact : dev.level,
				sendAction: dev.sendAction
			};
		});

		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function(response) {
			$scope.loading = false;
			if (redirect) {
				$location.path('/' + dataService.getUrlSegment($location.path()));
				return;
			}
		}, function(error) {
			$scope.loading = false;
			alertify.alertError($scope._t('error_update_data'));
		});
	};
});
