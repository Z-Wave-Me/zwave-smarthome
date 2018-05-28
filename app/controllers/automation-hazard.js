/**
 * @overview Controllers that handls hazard notification
 * @author Martin Vach
 */
/**
 * Controller that handles list of hazard notifications
 * @class HazarController
 */
myAppController.controller('HazardNotificationController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.hazardProtections = {
    moduleId: 'HazardNotification',
    state: '',
    enableTest: [],
  }
  /**
   * Load instances
   * @returns {undefined}
   */
  $scope.loadInstances = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
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
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };

  $scope.loadInstances();

  /**
   * Activate/Deactivate instance
   * @param {object} input 
   * @param {boolean} activeStatus 
   */
  $scope.activateInstance = function (input, state) {
    input.active = state;
    if (!input.id) {
      return;
    }
    dataFactory.putApi('instances', input.id, input).then(function (response) {

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  };


  /**
   * Clone 
   * @param {object} input
   * @param {string} redirect
   * @returns {undefined}
   */
  $scope.cloneInstance = function (input, redirect) {
    input.id = 0;
    input.title = input.title + ' - copy';
    dataFactory.postApi('instances', input).then(function (response) {
      $location.path($location.path() + '/' + response.data.data.id);
    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  };

  /**
   * Delete
   */
  $scope.deleteInstance = function (input, message) {
    alertify.confirm(message, function () {
      dataFactory.deleteApi('instances', input.id).then(function (response) {
        $scope.reloadData();
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });

    });
  };

});

/**
 * Controller that handles a fire protection detail
 * @class LeakageIdController
 */
myAppController.controller('HazardNotificationIdController', function ($scope, $routeParams, $location, $timeout, $filter, cfg, dataFactory, dataService, _, myCache) {
  $scope.hazardProtection = {
    show: true,
    sensors: ['smoke', 'alarm_smoke', 'alarmSensor_smoke', 'flood', 'alarm_flood', 'alarmSensor_flood'],
    fire_sensors: ['smoke', 'alarm_smoke', 'alarmSensor_smoke'],
    leakage_sensors: ['flood', 'alarm_flood', 'alarmSensor_flood'],
    devices: ['switchBinary', 'switchMultilevel', 'toggleButton'],
    notifiers: ['notification_email', 'notification_push'],
    interval: [60, 120, 300, 600, 900, 1800, 3600],
    firedOn: ['on', 'off', 'alarm', 'revert'],
    sensorTyp: "",
    availableSensors: {},
    availableDevices: {},
    availableNotifiers: {},
    devicesInRoom: [],
    assignedDevices: [],
    assignedNotifiers: [],
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
    input: {
      instanceId: $routeParams.id,
      moduleId: "HazardNotification",
      active: true,
      title: "",
      params: {
        sensors: [],
        triggerEvent: [],
        sendNotifications: [],
        notificationsInterval: 0,
        hazardType: ""
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
  $scope.resetOptions = function () {
    $scope.hazardProtection.cfg = angular.copy($scope.orig.options);
  };

  /**
   * Load instance
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      angular.extend($scope.hazardProtection.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      // Set assigned devices
      angular.forEach(instance.params.triggerEvent, function (v, k) {
        if (v.deviceId) {
          $scope.hazardProtection.assignedDevices.push(v.deviceId);
        }
      });

      // Set assigned devices
      angular.forEach(instance.params.sendNotifications, function (v, k) {
        if (v.notifier) {
          $scope.hazardProtection.assignedNotifiers.push(v.notifier);
        }
      });

    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });

  };

  if ($routeParams.id > 0) {
    $scope.loadInstance($routeParams.id);
  }

  /**
   * Load rooms
   */
  $scope.loadRooms = function () {
    dataFactory.getApi('locations').then(function (response) {
      $scope.hazardProtection.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
      $scope.loadDevices($scope.hazardProtection.rooms);
    });

  };
  $scope.loadRooms();

  /**
   * Load devices
   */
  $scope.loadDevices = function (rooms) {
    dataFactory.getApi('devices').then(function (response) {
      var devices = dataService.getDevicesData(response.data.data.devices);

      _.filter(devices.value(), function (v) {
        var obj = {
          deviceId: v.id,
          deviceName: v.metrics.title,
          deviceType: v.deviceType,
          probeType: v.probeType,
          location: v.location,
          locationName: rooms[v.location].title
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
      $scope.hazardProtection.devicesInRoom = _.countBy($scope.hazardProtection.availableDevices, function (v) {
        return v.location;
      });
    }, function (error) {});
  };

  /**
   * Assign sensor
   * @param {int} sensorId
   * @returns {undefined}
   */
  $scope.assignSensor = function (sensorId) {
    if ($scope.hazardProtection.input.params.sensors.indexOf(sensorId) === -1) {
      if ($scope.hazardProtection.leakage_sensors.indexOf($scope.hazardProtection.availableSensors[sensorId].probeType) > -1) {
        $scope.hazardProtection.input.params.hazardType = "leakage";
      } else {
        $scope.hazardProtection.input.params.hazardType = "fire";
      }
      $scope.hazardProtection.input.params.sensors.push(sensorId);
    }

  };

  /**
   * Remove sensor id from assigned sensors
   * @param {string} deviceId 
   */
  $scope.unassignSensor = function (deviceId) {
    var deviceIndex = $scope.hazardProtection.input.params.sensors.indexOf(deviceId);
    if (deviceIndex > -1) {
      $scope.hazardProtection.input.params.sensors.splice(deviceIndex, 1);
    }
    if ($scope.hazardProtection.input.params.sensors.length == 0) {
      $scope.hazardProtection.input.params.hazardType = "";
    }
  };

  /**
   * Assign a device
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignDevice = function (device) {
    var input = $scope.hazardProtection.cfg[device.deviceType],
      obj = {};
    if (!input || $scope.hazardProtection.assignedDevices.indexOf(device.deviceId) > -1) {
      return;
    }

    /* obj['filter'] = input.filter;
    obj[input.filter] = input.default;
    obj[input.filter].device = device.deviceId; */
    obj = input.default;
    obj.deviceId = device.deviceId;
    console.log(input.default)
    $scope.hazardProtection.input.params.triggerEvent.push(input.default);
    $scope.hazardProtection.assignedDevices.push(device.deviceId);
    $scope.resetOptions();
  };

  /**
   * Remove device id from assigned device
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignDevice = function (targetIndex, deviceId) {

    var deviceIndex = $scope.hazardProtection.assignedDevices.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.hazardProtection.input.params.triggerEvent.splice(targetIndex, 1);
      $scope.hazardProtection.assignedDevices.splice(deviceIndex, 1);
    }

  };

  /**
   * Assign notification
   * @param {object} notification
   * @returns {undefined}
   */
  $scope.assignNotification = function (notification) {
    //if (notification.notifier && $scope.hazardProtection.assignedNotifiers.indexOf(notification.notifier) === -1) {
    $scope.hazardProtection.input.params.sendNotifications.push(notification);
    //$scope.hazardProtection.assignedNotifiers.push(notification.notifier);
    $scope.resetOptions();
    //}

  };

  /**
   * Remove notification id from assigned notifications
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignNotification = function (targetIndex, deviceId) {

    var deviceIndex = $scope.hazardProtection.assignedNotifiers.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.hazardProtection.input.params.sendNotifications.splice(targetIndex, 1);
      $scope.hazardProtection.assignedNotifiers.splice(deviceIndex, 1);
    }

  };

  /**
   * Store instance
   */
  $scope.storeInstance = function (input, redirect) {
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function (response) {
      if (redirect) {
        $location.path('/' + dataService.getUrlSegment($location.path()));
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

});