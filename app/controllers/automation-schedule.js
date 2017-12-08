/**
 * @overview Controllers that handls schedules
 * @author Martin Vach
 */
/**
 * Controller that handles list of schedules
 * @class AutomationScheduleController
 */
myAppController.controller('AutomationScheduleController', function ($scope, $routeParams, $location, cfg, dataFactory, dataService, _, myCache) {
  $scope.schedules = {
    state: '',
    all: []
  };


  /**
   * Load schedules
   * @returns {undefined}
   */
  $scope.loadSchedules = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.schedules.all = _.where(response.data.data, {
        moduleId: 'Schedules'
      });
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
   * Clone schedule
   * @param {object} input
   * @returns {undefined}
   */
  $scope.cloneSchedule = function (input) {
    input.id = 0;
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
 * @class AutomationScheduleController
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
    devices: [],
    devicesById: [],
    deviceTypeCnt: [],
    cfg: {
      switchBinary: {
        enum: ['off', 'on']
      },
      switchMultilevel: {
        min: 0,
        max: 99
      },
      thermostat: {
        min: 0,
        max: 99
      },
      doorlock: {
        enum: ['close', 'open']
      },
      toggleButton: {}

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
      angular.extend($scope.schedule.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
      $scope.loading = false;
    });

  };
  if ($routeParams.id > 0) {
    $scope.loadInstance($routeParams.id);
  }

  /**
   * Load devices
   */
  $scope.loadDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      var devices = dataService.getDevicesData(response.data.data.devices);
      // Set by type counter
      $scope.schedule.deviceTypeCnt = devices.countBy(function (v) {
        return v.deviceType;
      }).value();
      $scope.schedule.devices = devices.indexBy('id').value();

      /*  _.filter(devices.value(),function(v){
         $scope.schedule.devicesById[v.id] = v.metrics.title;
       }); */
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
   * Add or update device to the list (by type)
   * type: switches|dimmers|thermostats|locks
   */
  $scope.handleDevice = function (v, type,element) {
    if(element){
      $scope.expandElement(element);
    }
    $scope.resetModel(element);
    if (!v) {
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
  $scope.handleSceneDevice= function (v,element) {
    if(element){
      $scope.expandElement(element);
    }
    $scope.resetModel(element);
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
  $scope.removeDeviceFromList = function (index,type) {
    $scope.schedule.input.params.devices[type].splice(index, 1);


  };


  /**
   * Handle switch - add new switch and close modal
   */
  $scope.handleSwitchModal = function (v, modal, $event) {
    $scope.resetModel();
    $scope.handleModal(modal, $event);
    // Open/close modal only
    if (!v) {
      return;
    }
    // Adding new switch
    var index = _.findIndex($scope.schedule.input.params.devices.switches, {
      device: v.device
    });
    if (index > -1) {
      $scope.schedule.input.params.devices.switches[index] = v;
    } else {
      $scope.schedule.input.params.devices.switches.push(v)
    }


  };

  /**
   * Remove switch
   */
  $scope.removeSwitch = function (index) {
    $scope.schedule.input.params.devices.switches.splice(index, 1);


  };

  /**
   * Handle switch multilevel - add new dimmer and close modal
   */
  $scope.handleDimmerModal = function (v, modal, $event) {
    $scope.resetModel();
    $scope.handleModal(modal, $event);
    // Open/close modal only
    if (!v) {
      return;
    }
    // Add new dimmer
    var index = _.findIndex($scope.schedule.input.params.devices.dimmers, {
      device: v.device
    });
    if (index > -1) {
      $scope.schedule.input.params.devices.dimmers[index] = v;
    } else {
      $scope.schedule.input.params.devices.dimmers.push(v)
    }


  };

  /**
   * Remove dimmer
   */
  $scope.removeDimmer = function (index) {
    $scope.schedule.input.params.devices.dimmers.splice(index, 1);


  };
  /**
   * Handle thermostat modal
   */
  $scope.handleThermostatModal = function (v, modal, $event) {
    $scope.resetModel();
    $scope.handleModal(modal, $event);
    // Open/close modal only
    if (!v) {
      return;
    }
    // Add new dimmer
    var index = _.findIndex($scope.schedule.input.params.devices.thermostats, {
      device: v.device
    });
    if (index > -1) {
      $scope.schedule.input.params.devices.thermostats[index] = v;
    } else {
      $scope.schedule.input.params.devices.thermostats.push(v)
    }


  };

  /**
   * Remove thermostat
   */
  $scope.removeThermostat = function (index) {
    $scope.schedule.input.params.devices.thermostats.splice(index, 1);
  };

  /**
   * Handle lock modal
   */
  $scope.handleLockModal = function (v, modal, $event) {
    $scope.resetModel();
    $scope.handleModal(modal, $event);
    // Open/close modal only
    if (!v || v.device == '') {
      return;
    }
    // Adding new switch
    var index = _.findIndex($scope.schedule.input.params.devices.locks, {
      device: v.device
    });
    if (index > -1) {
      $scope.schedule.input.params.devices.locks[index] = v;
    } else {
      $scope.schedule.input.params.devices.locks.push(v)
    }
  };

  /**
   * Remove lock
   */
  $scope.removeLock = function (index) {
    $scope.schedule.input.params.devices.locks.splice(index, 1);
  };

  /**
   * Handle scene modal
   */
  $scope.handleSceneModal = function (v, modal) {
    $scope.resetModel();
    $scope.handleModal(modal);
    // Open/close modal only
    if (!v) {
      return;
    }

    //var index = _.findIndex($scope.schedule.input.params.devices.scenes,{device: v.device});
    var index = $scope.schedule.input.params.devices.scenes.indexOf(v);
    if (index > -1) { // Update an item
      $scope.schedule.input.params.devices.scenes[index] = v;
    } else { // Add new item
      $scope.schedule.input.params.devices.scenes.push(v)
    }
  };

  /**
   * Remove scene
   */
  /* $scope.removeScene = function (index) {
    $scope.schedule.input.params.devices.scenes.splice(index, 1);
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