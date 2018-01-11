/**
 * @overview Controllers that handls schedules
 * @author Martin Vach
 */
/**
 * Controller that handles list of schedules
 * @class AutomationScheduleController
 */
myAppController.controller('AutomationScheduleController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.schedules = {
    state: '',
    enableTest: [],

  };


  /**
   * Load schedules
   * @returns {undefined}
   */
  $scope.loadSchedules = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.schedules.all = _.chain(response.data.data).flatten().where({
        moduleId: 'Schedules'
      }).filter(function (v) {
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
        $scope.schedules.state = 'blank';
        return;
      }
      $scope.schedules.state = 'success';
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };
  $scope.loadSchedules();

  /**
   * Run schedule test
   * @param {object} instance
   */
  $scope.runScheduleTest = function (instance) {
    $scope.toggleRowSpinner(instance.id);
    $timeout($scope.toggleRowSpinner, 1000);
    var params = 'controller.emit("scheduledScene.run.' + instance.id + '")';
    dataFactory.runJs(params).then(function (response) {
      $timeout($scope.toggleRowSpinner, 2000);
    }, function (error) {
      $timeout($scope.toggleRowSpinner, 2000);
    });
  };


  /**
   * Activate schedule
   * @param {object} input 
   * @param {boolean} activeStatus 
   */
  $scope.activateSchedule = function (input, state) {
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
   * Clone schedule
   * @param {object} input
   * @returns {undefined}
   */
  $scope.cloneSchedule = function (input) {
    input.id = 0;
    input.title = input.title + ' - copy';
    dataFactory.postApi('instances', input).then(function (response) {
      $location.path('/schedules/' + response.data.data.id);
    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  };

  /**
   * Delete schedule
   */
  $scope.deleteSchedule = function (input, message) {
    alertify.confirm(message, function () {
      dataFactory.deleteApi('instances', input.id).then(function (response) {
        /*dataService.showNotifier({
          message: $scope._t('delete_successful')
        });*/
        $scope.reloadData();
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });

    });
  };

});


/**
 * Controller that handles schedules
 * @class AutomationScheduleIdController
 */
myAppController.controller('AutomationScheduleIdController', function ($scope, $routeParams, $location, $route, cfg, dataFactory, dataService, _, myCache) {
  $scope.schedule = {
    model: {
      weekday: {},
      time: '',
      switchBinary: {
        device: '',
        status: 'off',
        sendAction: false
      },
      switchMultilevel: {
        device: '',
        status: 0,
        sendAction: false
      },
      thermostat: {
        device: '',
        status: 0,
        sendAction: false
      },
      doorlock: {
        device: '',
        status: 'close',
        sendAction: false
      },
      toggleButton: ''
    },
    days: [1, 2, 3, 4, 5, 6, 0],
    rooms: [],
    devicesInRoom: [],
    availableDevices: [],
    assignedDevices: [],
    cfg: {

      switchBinary: {
        paramsDevices: 'switches',
        enum: ['off', 'on']
      },
      switchMultilevel: {
        paramsDevices: 'dimmers',
        min: 0,
        max: 99
      },
      thermostat: {
        paramsDevices: 'thermostats',
        min: 0,
        max: 99
      },
      doorlock: {
        paramsDevices: 'locks',
        enum: ['close', 'open']
      },
      toggleButton: {
        paramsDevices: 'scenes',
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
        devices: {
          switches: [],
          dimmers: [],
          thermostats: [],
          locks: [],
          scenes: []
        }
      }
    }
  };
  // Original data
  $scope.orig = {
    model: {}
  };
  $scope.orig.model = angular.copy($scope.schedule.model);

  /**
   * Load instances
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      var assignedDevices = $scope.schedule.assignedDevices;
      angular.extend($scope.schedule.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      angular.forEach(instance.params.devices, function (v, k) {
        switch (k) {
          case 'scenes':
            _.filter(v, function (s) {
              if (assignedDevices.indexOf(s) === -1) {
                $scope.schedule.assignedDevices.push(s);
              }

            })
            break;
          default:
            _.filter(v, function (d) {
              if (assignedDevices.indexOf(d.device) === -1) {
                $scope.schedule.assignedDevices.push(d.device);
              }

            })
            break;
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
      $scope.schedule.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
    });

  };
  $scope.loadRooms();

  /**
   * Load devices
   */
  $scope.loadDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      var whiteList = _.keys($scope.schedule.cfg);
      var devices = dataService.getDevicesData(response.data.data.devices);
      $scope.schedule.availableDevices = devices.filter(function (v) {
        return whiteList.indexOf(v.deviceType) > -1;
      }).value();
      $scope.schedule.devicesInRoom = _.countBy($scope.schedule.availableDevices, function (v) {
        return v.location;
      });
    }, function (error) {});
  };
  $scope.loadDevices();

  /**
   * Toggle Weekday
   */
  $scope.toggleWeekday = function (day) {
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
  $scope.addTime = function (time) {
    var index = $scope.schedule.input.params.times.indexOf(time);
    if (index === -1) {
      $scope.schedule.input.params.times.push(time);
    }

  };

  /**
   * Reset model
   */
  $scope.resetModel = function () {
    $scope.schedule.model = angular.copy($scope.orig.model);

  };

  /**
   * Assign device to a schedule
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignDevice = function (device) {
    var model = [];
    var type = '';

    switch (device.deviceType) {
      // scenes
      case 'toggleButton':
        model = device.id;
        $scope.handleSceneDevice(model);
        break;
        // switches|dimmers|thermostats|locks
      default:
        model = $scope.schedule.model[device.deviceType];
        model.device = device.id;
        type = $scope.schedule.cfg[device.deviceType].paramsDevices;
        $scope.handleDevice(model, type);
        break;
    }
    $scope.schedule.assignedDevices.push(device.id);
    return;
  };

  /**
   * Remove device id from assigned device
   * @param {object} device 
   */
  $scope.unassignDevice = function (device) {
    var index = $scope.schedule.assignedDevices.indexOf(device.id);
    if (index > -1) {
      $scope.schedule.assignedDevices.splice(index, 1);
      removeDeviceFromParams(device);


    }

  };

  /**
   * Add or update device to the list (by type)
   * type: switches|dimmers|thermostats|locks
   */
  $scope.expandParams = function (element, device) {

    var type = $scope.schedule.cfg[device.deviceType].paramsDevices;
    var params = _.findWhere($scope.schedule.input.params.devices[type], {
      device: device.id
    });

    // Colapse all params except 'element'
    _.filter($scope.expand, function (v, k) {
      if (k != element) {
        $scope.expand[k] = false;
      }

    });
    $scope.resetModel();

    $scope.schedule.model[device.deviceType] = params;
    $scope.expandElement(element);



  };
  /**
   * Remove device from the params list
   * @param {object} device 
   */
  function removeDeviceFromParams(device) {
    var index;
    var type = $scope.schedule.cfg[device.deviceType].paramsDevices;
    switch (device.deviceType) {
      // scenes
      case 'toggleButton':
        index = $scope.schedule.input.params.devices[type].indexOf(device.id);
        break;
        // switches|dimmers|thermostats|locks
      default:
        index = _.findIndex($scope.schedule.input.params.devices[type], {
          device: device.id
        });
        break;
    }
    if (index > -1) {
      $scope.schedule.input.params.devices[type].splice(index, 1);
    }


  };

  /**
   * Add or update device to the list (by type)
   * type: switches|dimmers|thermostats|locks
   */
  $scope.handleDevice = function (v, type, element) {
    /* if (element) {
      $scope.expandElement(element);
    } */
    //$scope.expand = {};
    //$scope.resetModel();
    if (!v || v.device == '') {
      return;
    }
    // Adding new device
    var index = _.findIndex($scope.schedule.input.params.devices[type], {
      device: v.device
    });
    if (index > -1) {
      $scope.schedule.input.params.devices[type][index] = v;
    } else {
      $scope.schedule.input.params.devices[type].push(v)
    }


  };

  /**
   * Add or update scene device
   */
  $scope.handleSceneDevice = function (v, element) {
    if (element) {
      $scope.resetModel(element);
      $scope.expandElement(element);
    }

    if (!v) {
      return;
    }
    var index = $scope.schedule.input.params.devices.scenes.indexOf(v);
    if (index > -1) { // Update an item
      $scope.schedule.input.params.devices.scenes[index] = v;
    } else { // Add new item
      $scope.schedule.input.params.devices.scenes.push(v)
    }
  };

  /**
   * Remove device from the list (by type)
   */
  /* $scope.removeDeviceFromList = function (index, type) {
    $scope.schedule.input.params.devices[type].splice(index, 1);


  }; */
  /**
   * Store schedule
   */
  $scope.storeSchedule = function (input, redirect) {
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function (response) {
      if (redirect) {
        $location.path('/schedules');
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

});