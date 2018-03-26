/**
 * @overview Controllers that handls leakages
 * @author Martin Vach
 */
/**
 * Controller that handles list of leakages
 * @class LeakageController
 */
myAppController.controller('LeakageController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.leakages = {
    moduleId: 'LeakageProtection',
    state: '',
    enableTest: [],
  }
  /**
   * Load instances
   * @returns {undefined}
   */
  $scope.loadInstances = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.leakages.all = _.chain(response.data.data).flatten().where({
        moduleId: $scope.leakages.moduleId
      }).filter(function (v) {
        var size = 0;
        for (k in v.params.devices) {
          if (v.params.devices[k].length) {
            size++;
          }
        }
        if (size) {
          $scope.leakages.enableTest.push(v.id)
        }
        return v;
      }).value();
      if (!_.size($scope.leakages.all)) {
        $scope.leakages.state = 'blank';
        return;
      }
      $scope.leakages.state = 'success';
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
 * Controller that handles a leakage detail
 * @class LeakageIdController
 */
myAppController.controller('LeakageIdController', function ($scope, $routeParams, $location, $timeout, $filter, cfg, dataFactory, dataService, _, myCache) {
  $scope.leakage = {
    sensors: ['flood', 'alarm_flood', 'alarmSensor_flood'],
    devices: ['switchBinary', 'switchMultilevel', 'toggleButton'],
    notifiers: ['notification_email','notification_push'],
    interval: [60, 120, 300, 600, 900, 1800, 3600],
    firedOn: ['on','off','alarm','revert'],
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
          deviceType:'switchBinary',
          status: 'on',
          sendAction:false
        }
      },
      switchMultilevel: {
        status: ['on', 'off','lvl'],
        min: 0,
        max: 99,
        operator: ['=', '!=', '>', '>=', '<', '<='],
        default: {
          deviceId: '',
          deviceType:'switchMultilevel',
          status: 'on',
          level:0,
          sendAction:false
        }
      },
      toggleButton: {
        default: {
          deviceId: '',
          deviceType:'toggleButton',
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
      moduleId: "LeakageProtection",
      active: true,
      title: "",
      params: {
        sensors: [],
        triggerEvent:[],
        sendNotifications:[],
        notificationsInterval: 0
      },
    }
  };

  /**
   *  Reset Original data 
   */
  $scope.orig = {
    options: {}
  };
  $scope.orig.options = angular.copy($scope.leakage.cfg);
  $scope.resetOptions = function () {
   $scope.leakage.cfg = angular.copy($scope.orig.options);

  };

  /**
   * Load instance
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      angular.extend($scope.leakage.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      // Set assigned devices
      angular.forEach(instance.params.triggerEvent, function (v, k) {
        if (v.deviceId) {
          $scope.leakage.assignedDevices.push(v.deviceId);
        }
      });

      // Set assigned devices
      angular.forEach(instance.params.sendNotifications, function (v, k) {
        if (v.notifier) {
          $scope.leakage.assignedNotifiers.push(v.notifier);
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
      $scope.leakage.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
      $scope.loadDevices($scope.leakage.rooms);
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
        if ($scope.leakage.sensors.indexOf(v.probeType) > -1) {
          $scope.leakage.availableSensors[v.id] = obj;
        }
        // Set devices
        if ($scope.leakage.devices.indexOf(v.deviceType) > -1) {
          $scope.leakage.availableDevices[v.id] = obj;
        }
        // Set notifiers
        if ($scope.leakage.notifiers.indexOf(v.probeType) > -1) {
          $scope.leakage.availableNotifiers[v.id] = obj;
        }
      });
      // Set devices in the room
      $scope.leakage.devicesInRoom = _.countBy($scope.leakage.availableDevices, function (v) {
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
    if ($scope.leakage.input.params.sensors.indexOf(sensorId) === -1) {
      $scope.leakage.input.params.sensors.push(sensorId);
    }

  };

  /**
   * Remove sensor id from assigned sensors
   * @param {string} deviceId 
   */
  $scope.unassignSensor = function (deviceId) {
    var deviceIndex = $scope.leakage.input.params.sensors.indexOf(deviceId);
    if (deviceIndex > -1) {
      $scope.leakage.input.params.sensors.splice(deviceIndex, 1);
    }

  };

  /**
   * Assign a device
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignDevice = function (device) {
    var input = $scope.leakage.cfg[device.deviceType], obj = {};
    if (!input || $scope.leakage.assignedDevices.indexOf(device.deviceId) > -1) {
      return;
    }
    
    /* obj['filter'] = input.filter;
    obj[input.filter] = input.default;
    obj[input.filter].device = device.deviceId; */
    obj = input.default;
    obj.deviceId = device.deviceId;
    console.log(input.default)
    $scope.leakage.input.params.triggerEvent.push(input.default);
    $scope.leakage.assignedDevices.push(device.deviceId);
    $scope.resetOptions();
  };

  /**
   * Remove device id from assigned device
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignDevice = function (targetIndex, deviceId) {

    var deviceIndex = $scope.leakage.assignedDevices.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.leakage.input.params.triggerEvent.splice(targetIndex, 1);
      $scope.leakage.assignedDevices.splice(deviceIndex, 1);
    }

  };

  /**
   * Assign notification
   * @param {object} notification
   * @returns {undefined}
   */
  $scope.assignNotification = function (notification) {
    //if (notification.notifier && $scope.leakage.assignedNotifiers.indexOf(notification.notifier) === -1) {
      $scope.leakage.input.params.sendNotifications.push(notification);
      //$scope.leakage.assignedNotifiers.push(notification.notifier);
      $scope.resetOptions();
    //}

  };

  /**
   * Remove notification id from assigned notifications
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignNotification = function (targetIndex, deviceId) {

    var deviceIndex = $scope.leakage.assignedNotifiers.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.leakage.input.params.sendNotifications.splice(targetIndex, 1);
      $scope.leakage.assignedNotifiers.splice(deviceIndex, 1);
    }

  };

  /**
   * Store instance
   */
  $scope.storeInstance = function (input, redirect) {
    console.log(input)
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function (response) {
      if (redirect) {
        $location.path('/' + dataService.getUrlSegment($location.path()));
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

});