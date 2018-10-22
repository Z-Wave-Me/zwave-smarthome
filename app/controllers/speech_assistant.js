/**
 * @overview This controller handles speech assistants setup.
 * @author Michael Hensche
 */

/**
 * The controller that manage speech assistants
 * @class SpeechAssistantsManageController
 *
 */
myAppController.controller('SpeechAssistantsManageController', function($scope, $q, $route, $location, dataFactory, dataService, myCache, cfg, _) {
	$scope.instances = [];
	$scope.modules = {
		mediaUrl: $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/',
		collection: [],
		ids: [],
		imgs: []
	};
	$scope.alert = "";

	/**
	 * Load all promises
	 */
	$scope.allSettled = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		var promises = [
			dataFactory.getApi('modules'),
			dataFactory.getApi('instances')
		];

		$q.allSettled(promises).then(function(response) {
			var modules = response[0];
			var instances = response[1];
			$scope.loading = false;
			// Error message
			if (instances.state == 'rejected') {
				$scope.loading = false;
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}
			// Success - modules
			if (modules.state === 'fulfilled') {
				setModules(modules.value.data.data);
			}
			// Success - instances
			if (instances.state === 'fulfilled') {
				setInstances(instances.value.data.data);
				if (_.size($scope.instances) < 1) {
					$location.path('/speech_assistants/devices');
				}
			}
		});
	};
	$scope.allSettled();

	/**
	 * Ictivate instance
	 */
	$scope.activateInstance = function(input, activeStatus) {
		input.active = activeStatus;
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('updating')
		};
		if (input.id) {
			dataFactory.putApi('instances', input.id, input).then(function(response) {
				$scope.loading = false;
				myCache.remove('instances');
				myCache.remove('instances/' + input.moduleId);
				myCache.remove('devices');
				$scope.allSettled();
			}, function(error) {
				alertify.alertError($scope._t('error_update_data'));
				$scope.loading = false;
			});
		}
	};

	/**
	 * Delete instance
	 */
	$scope.deleteInstance = function(input, message) {
		alertify.confirm(message, function() {
			$scope.loading = {
				status: 'loading-spin',
				icon: 'fa-spinner fa-spin',
				message: $scope._t('updating')
			};
			dataFactory.deleteApi('instances', input.id).then(function(response) {
				$scope.loading = false;
				myCache.remove('instances');
				myCache.remove('devices');
				$scope.allSettled();
				$route.reload();
			}, function(error) {
				$scope.loading = false;
				alertify.alertError($scope._t('error_delete_data'));
			});
		}).setting('labels', {
            'ok': $scope._t('ok')
        });
	};

	/// --- Private functions --- ///

	/**
	 * Set modules
	 */
	function setModules(data) {
		_.filter(data, function(item) {
			var isHidden = false;
			if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
				if ($scope.user.role !== 1) {
					isHidden = true;
				} else {
					isHidden = ($scope.user.expert_view ? false : true);
				}
			}

			if (item.moduleName !== 'Alexa' && item.moduleName !== 'GoogleHome') {
				isHidden = true;
			}

			if (!isHidden) {
				$scope.modules.ids.push(item.id);
				$scope.modules.imgs[item.id] = item.icon;
				return item;
			}
		});
	};

	/**
	 * Set instances
	 */
	function setInstances(data) {
		$scope.instances = _.reject(data, function(v) {
			if ($scope.modules.ids.indexOf(v.moduleId) > -1) {
				return false;
			}
			return true;
		});
	};

});


/**
 * The controller that add speech assistants
 * @class SpeechAssistantsAddController
 *
 */
myAppController.controller('SpeechAssistantsAddController', function($scope, $q, dataFactory, $location, dataService, cfg, _) {
	$scope.speechAssistants = {
		mediaUrl: $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/',
		Alexa: {
			module: {},
			instance: {}
		},
		GoogleHome: {
			module: {},
			instance: {}
		}
	};

	/**
	 * Load all promises
	 */
	$scope.allSettled = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		var promises = [
			dataFactory.getApi('modules'),
			dataFactory.getApi('instances', null, true)
		];

		$q.allSettled(promises).then(function(response) {
			$scope.loading = false;

			var modules = response[0];
			var instances = response[1];
			// Error message
			if (modules.state === 'rejected' && $scope.routeMatch('/apps/local')) {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			if (instances.state === 'rejected' && $scope.routeMatch('/apps/instance')) {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			// Success - instances
			if (instances.state === 'fulfilled') {
				setInstances(instances.value.data.data);
			}

			// Success - modules
			if (modules.state === 'fulfilled') {
				setModules(modules.value.data.data, $scope.speechAssistants.instances);
			}
		});
	};
	$scope.allSettled();


	$scope.createInstance = function(input) {
		var inputData = {
			'id': 0,
			'moduleId': input.id,
			'active': true,
			'title': input.defaults.title,
			'description': input.defaults.description,
			'params': {}
		};

		dataFactory.postApi('instances', inputData).then(function(response) {
			$location.path('/speech_assistants/' + response.data.data.module);
		}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
		});
	}

	/// --- Private functions --- ///

	/**
	 * Set modules
	 */
	function setModules(data, instances) {
		var Alexa_module = _.findWhere(data, {
			moduleName: 'Alexa'
		});
		if (Alexa_module) {
			Alexa_module.iconPath = $scope.speechAssistants.mediaUrl + Alexa_module.id + '/' + Alexa_module.icon
			$scope.speechAssistants.Alexa.module = Alexa_module;
		}

		var GoogleHome_module = _.findWhere(data, {
			moduleName: 'GoogleHome'
		});
		if (GoogleHome_module) {
			GoogleHome_module.iconPath = $scope.speechAssistants.mediaUrl + GoogleHome_module.id + '/' + GoogleHome_module.icon;
			$scope.speechAssistants.GoogleHome.module = GoogleHome_module;
		}
	};

	/**
	 * Set instances
	 */
	function setInstances(data) {
		var Alexa = _.findWhere(data, {
			moduleId: 'Alexa'
		});
		if (Alexa) {
			$scope.speechAssistants.Alexa.instance = Alexa;
		}

		var GoogleHome = _.findWhere(data, {
			moduleId: 'GoogleHome'
		});
		if (GoogleHome) {
			$scope.speechAssistants.GoogleHome.instance = GoogleHome;
		}
	};
});


myAppController.controller('AlexaSetupController', function($scope, $q, $timeout, dataFactory, dataService, cfg, _) {
	$scope.currentStep = 1;
	$scope.steps = _.range(0, 8);
	$scope.myImage = "";

	$timeout(function() {
		if (['razberry'].indexOf($scope.getCustomCfgArr('boxtype')) > -1) {
			$scope.boxtype = $scope._t('lb_z_way');
		} else {
			$scope.boxtype = $scope._t('lb_popp'); 
		}	
	}, 0);
	

	$scope.prevNext = function(n) {
		$scope.currentStep += n;
	}

	$scope.setStep = function(step) {
		$scope.currentStep = parseInt(step);
	}

	$scope.setImagePath = function(path) {
		$scope.myImage = path;
	}

});

myAppController.controller('AlexaManageController', function($scope, $q, $location, cfg, dataFactory, dataService, cfg, _) {
	$scope.alexa = {
		instance: {},
		devices: {
			available: {},
			active: {}
		},
		rooms: []
	};

	/**
	 * Load all promises
	 */
	$scope.allSettled = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		var promises = [
			dataFactory.getApi('instances', '/Alexa', true),
			dataFactory.getApi('locations'),
			dataFactory.getApi('devices')
		];

		$q.allSettled(promises).then(function(response) {
			$scope.loading = false;

			var instances = response[0],
				rooms = response[1],
				devices = response[2];
			// Error message
			if (instances.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			if (devices.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			if (rooms.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			// Success - rooms
			if (rooms.state === 'fulfilled') {
				setRooms(rooms.value.data.data);
			}

			// Success - instance
			if (instances.state === 'fulfilled') {
				setInstance(instances.value.data.data[0]);
				//console.log($scope.alexa.instance);
			}

			// Success - devices
			if (devices.state === 'fulfilled') {
				setDevices(devices.value.data.data.devices);
			}
		});
	};
	$scope.allSettled();

	/**
	 * Add device to active list
	 * @param {object} deviceId 
	 */
	$scope.activateDevice = function(device) {
		var obj = {},
			dev = angular.copy(device);
		obj[device.deviceId] = dev;
		angular.extend($scope.alexa.devices.active, obj);
	};

	/**
	 * Remove device from active list
	 * @param {string} deviceId 
	 */
	$scope.deactivateDevice = function(deviceId) {
		if ($scope.alexa.devices.active[deviceId]) {
			delete $scope.alexa.devices.active[deviceId];
		}
	};

	/**
	 * Store 
	 */
	$scope.store = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		var devcies = _.chain($scope.alexa.devices.active).map(function(dev) {
			return {
				"id": dev.deviceId,
				"name": dev.deviceName,
				"callName": dev.callName == "" ? dev.deviceName : dev.callName // fallback! used deviceName is callName empty
			}
		}).flatten().value();

		var input = $scope.alexa.instance;

		input.params.devices = devcies;

		dataFactory.storeApi('instances', parseInt(input.id, 10), input).then(function(response) {
			$scope.loading = false
			dataService.showNotifier({
				message: $scope._t('success_updated')
			});
			$location.path('/speech_assistants/devices');
		}, function(error) {
			$scope.loading = false
			alertify.alertError($scope._t('error_update_data'));
		});
	};

	/**
	 * Set devices
	 */
	function setDevices(data) {
		var devices = dataService.getDevicesData(data).map(function(v) {
			var obj = {
				deviceId: v.id,
				deviceName: v.metrics.title,
				deviceType: v.deviceType,
				probeType: v.probeType,
				location: v.location,
				locationName: $scope.alexa.rooms[v.location].title,
				callName: v.metrics.title,
				iconPath: v.iconPath
			};
			return obj;
		});
		devices = devices.filter(function(dev) {
			var wlDev = _.find(cfg.speechAssistants.Alexa.deviceTypeWhitelist, function(needle) {
				if (Object.keys(needle) == dev.deviceType) {
					return needle;
				}
			});
			if (typeof wlDev !== 'undefined') {
				if (wlDev[Object.keys(wlDev)].length > 0) {
					if (wlDev[Object.keys(wlDev)].indexOf(dev.probeType) > -1) {
						return dev;
					}
				} else {
					return dev;
				}
			}
		});

		$scope.alexa.devices.available = devices.indexBy("deviceId").value();

		if ($scope.alexa.instance.params.devices.length > 0) {

			var active_devices = devices.filter(function(dev) {
				if ($scope.alexa.instance.params.devices.map(function(d) {
						return d.id;
					}).indexOf(dev.deviceId) !== -1) {
					return dev;
				}
			}).map(function(d) {
				var deviceIndex = $scope.alexa.instance.params.devices.map(function(v) {
					return v.id;
				}).indexOf(d.deviceId);
				if (deviceIndex !== -1) {
					d.callName = $scope.alexa.instance.params.devices[deviceIndex].callName;
				}
				return d;
			});

			$scope.alexa.devices.active = active_devices.indexBy("deviceId").value();
		}

	}

	/**
	 * set rooms
	 */
	function setRooms(data) {
		$scope.alexa.rooms = dataService.getRooms(data).indexBy('id').value();
	};

	/**
	 * Set instance
	 */
	function setInstance(data) {
		$scope.alexa.instance = data;
	};


});

myAppController.controller('GoogleHomeManageController', function($scope, $q, cfg, dataFactory, dataService, cfg, _) {
	$scope.google_home = {
		instance: {},
		devices: {
			available: {},
			active: {}
		},
		rooms: []
	};

	/**
	 * Load all promises
	 */
	$scope.allSettled = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		var promises = [
			dataFactory.getApi('instances', false, true),
			dataFactory.getApi('locations'),
			dataFactory.getApi('devices')
		];

		$q.allSettled(promises).then(function(response) {
			$scope.loading = false;

			var instances = response[0],
				rooms = response[1],
				devices = response[2];
			// Error message
			if (instances.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			if (alexa_instance.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			if (devices.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			if (rooms.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
				return;
			}

			// Success - rooms
			if (rooms.state === 'fulfilled') {
				setRooms(rooms.value.data.data);
			}

			// Success - instance
			if (instances.state === 'fulfilled') {
				setInstance(instances.value.data.data);
			}

			// Success - devices
			if (devices.state === 'fulfilled') {
				setDevices(devices.value.data.data.devices);
			}
		});
	};
	$scope.allSettled();

	/**
	 * Add device to active list
	 * @param {object} deviceId 
	 */
	$scope.activateDevice = function(device) {
		var obj = {},
			dev = angular.copy(device);
		obj[device.deviceId] = dev;
		angular.extend($scope.google_home.devices.active, obj);
	};

	/**
	 * Remove device from active list
	 * @param {string} deviceId 
	 */
	$scope.deactivateDevice = function(deviceId) {
		if ($scope.google_home.devices.active[deviceId]) {
			delete $scope.google_home.devices.active[deviceId];
		}
	};

	/**
	 * Store 
	 */
	$scope.store = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		var devcies = _.chain($scope.google_home.devices.active).map(function(dev) {
			return {
				"id": dev.deviceId,
				"name": dev.deviceName,
				"callName": dev.callName == "" ? dev.deviceName : dev.callName // fallback! used deviceName is callName empty
			}
		}).flatten().value();

		var input = $scope.google_home.instance;

		input.params.devices = devcies;

		dataFactory.storeApi('instances', parseInt(input.id, 10), input).then(function(response) {
			$scope.loading = false
			dataService.showNotifier({
				message: $scope._t('success_updated')
			});
		}, function(error) {
			$scope.loading = false
			alertify.alertError($scope._t('error_update_data'));
		});
	};

	/**
	 * Set devices
	 */
	function setDevices(data) {
		var devices = dataService.getDevicesData(data, true, true, false).map(function(v) {
			var obj = {
				deviceId: v.id,
				deviceName: v.metrics.title,
				deviceType: v.deviceType,
				probeType: v.probeType,
				location: v.location,
				locationName: $scope.google_home.rooms[v.location].title,
				callName: v.metrics.title
			};
			return obj;
		});
		devices = devices.filter(function(dev) {
			var wlDev = _.find(cfg.speechAssistants.GoogleHome.deviceTypeWhitelist, function(needle) {
				if (Object.keys(needle) == dev.deviceType) {
					return needle;
				}
			});
			if (typeof wlDev !== 'undefined') {
				if (wlDev[Object.keys(wlDev)].length > 0) {
					if (wlDev[Object.keys(wlDev)].indexOf(dev.probeType) > -1) {
						return dev;
					}
				} else {
					return dev;
				}
			}
		});

		$scope.google_home.devices.available = devices.indexBy("deviceId").value();

		if ($scope.google_home.instance.params.devices.length > 0) {

			var active_devices = devices.filter(function(dev) {
				if ($scope.google_home.instance.params.devices.map(function(d) {
						return d.id;
					}).indexOf(dev.deviceId) !== -1) {
					return dev;
				}
			}).map(function(d) {
				var deviceIndex = $scope.google_home.instance.params.devices.map(function(v) {
					return v.id;
				}).indexOf(d.deviceId);
				if (deviceIndex !== -1) {
					d.callName = $scope.google_home.instance.params.devices[deviceIndex].callName;
				}
				return d;
			});
			$scope.google_home.devices.active = active_devices.indexBy("deviceId").value();
		}
	}

	/**
	 * set rooms
	 */
	function setRooms(data) {
		$scope.google_home.rooms = dataService.getRooms(data).indexBy('id').value();
	};

	/**
	 * Set instance
	 */
	function setInstance(data) {
		var GoogleHome = _.findWhere(data, {
			moduleId: 'GoogleHome'
		});
		if (GoogleHome) {
			$scope.google_home.instance = GoogleHome;
		}
	};


});

myAppController.controller('GoogleHomeSetupController', function($scope, $q, dataFactory, dataService, cfg, _) {
	$scope.currentStep = 1;
	$scope.steps = _.range(0, 5);
	$scope.myImage = "";

	$scope.prevNext = function(n) {
		$scope.currentStep += n;
	}

	$scope.setStep = function(step) {
		$scope.currentStep = parseInt(step);
	}

	$scope.setImagePath = function(path) {
		$scope.myImage = path;
	}

});