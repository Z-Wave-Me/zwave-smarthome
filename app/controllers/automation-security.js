/**
 * @overview Controllers that handls security
 * @author Martin Vach
 */
/**
 * Controller that handles list of security instances
 * @class SecurityController
 */
myAppController.controller('SecurityController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.security = {
    moduleId: 'Security',
    state: '',
    enableTest: [],
  }
  /**
   * Load instance with security module
   * @returns {undefined}
   */
  $scope.loadSecurityModule = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      var security = _.findWhere(response.data.data, {
        moduleId: $scope.security.moduleId
      });
      if (!security || security.id < 1) {
        $location.path('/security/0');
        return;
      }
      $location.path('/security/' + security.id);
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };
  $scope.loadSecurityModule();
  /**
   * TODO: deprecated
   * Load instances
   * @returns {undefined}
   */
  /*  $scope.loadInstances = function () {
     dataFactory.getApi('instances', null, true).then(function (response) {
       $scope.security.all = _.chain(response.data.data).flatten().where({
         moduleId: $scope.security.moduleId
       }).value();
       if (!_.size($scope.security.all)) {
         $scope.security.state = 'blank';
         return;
       }
       $scope.security.state = 'success';
     }, function (error) {
       alertify.alertError($scope._t('error_load_data'));
     });
   }; */

  // $scope.loadInstances();

  /**
   * Activate/Deactivate instance
   * @param {object} input 
   * @param {boolean} activeStatus 
   */
  /* $scope.activateInstance = function (input, state) {
    input.active = state;
    if (!input.id) {
      return;
    }
    dataFactory.putApi('instances', input.id, input).then(function (response) {

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  }; */


  /**
   * Clone 
   * @param {object} input
   * @param {string} redirect
   * @returns {undefined}
   */
  /* $scope.cloneInstance = function (input, redirect) {
    input.id = 0;
    input.title = input.title + ' - copy';
    dataFactory.postApi('instances', input).then(function (response) {
      $location.path($location.path() + '/' + response.data.data.id);
    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  }; */

  /**
   * Delete
   */
  /*  $scope.deleteInstance = function (input, message) {
     alertify.confirm(message, function () {
       dataFactory.deleteApi('instances', input.id).then(function (response) {
         $scope.reloadData();
       }, function (error) {
         alertify.alertError($scope._t('error_delete_data'));
       });

     });
   }; */

});

/**
 * Controller that handles a security detail
 * @class SecurityIdController
 */
myAppController.controller('SecurityIdController', function ($scope, $routeParams, $location, $timeout, $filter, cfg, dataFactory, dataService, _, myCache) {
  $scope.security = {
    routeId: 0,
    tab: 1,
    days: [1, 2, 3, 4, 5, 6, 0],
    devices: {
      input: [],
      alarms: [],
      armConfirm: [],
      controls: [],
      notification: []
    },
    cfg: {
      input: {
        deviceType: ['sensorBinary'],
        status: ['on', 'off'],
        default: {
          devices: '',
          conditions: 'on'
        }
      },
      silentAlarms: {
        deviceType: ['toggleButton', 'switchBinary'],
        default: {
          devices: ''
        }
      },
      alarms: {
        deviceType: ['toggleButton', 'switchBinary'],
        default: {
          devices: ''
        }
      },
      armConfirm: {
        deviceType: ['toggleButton'],
        default: {
          devices: ''
        }
      },
      disarmConfirm: {
        deviceType: ['toggleButton'],
        default: {
          devices: ''
        }
      },
      clean: {
        deviceType: ['toggleButton'],
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
      title: "",
      params: {
        devices: [],
        times: {
          aktive: false,
          start: 10,
          interval: 1,
          silent: 0,
          table: []
        },
        time: '00:00',
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
        }

      },
    }
  };

  /**
   *  Reset Original data 
   */
  $scope.orig = {
    options: {}
  };
  $scope.orig.options = angular.copy($scope.security.cfg);
  $scope.resetOptions = function () {
    $scope.security.cfg = angular.copy($scope.orig.options);

  };

  /**
   * Load instance
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      $scope.security.routeId = id;
      var instance = instances.data.data;
      angular.extend($scope.security.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      // Set assigned devices
      /*  angular.forEach(instance.params.controls.table, function (v, k) {
         if (v.devices) {
           $scope.security.assigned.controls.push(v.devices);
         }
       }); */

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
      $scope.security.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
      $scope.loadDevices($scope.security.rooms);
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
        var getZwayId = function (deviceId) {
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
          deviceNameShort: $filter('cutText')(v.metrics.title,true,30) + (getZwayId(v.id) ? '#' + getZwayId(v.id) : ''),
          deviceType: v.deviceType,
          probeType: v.probeType,
          location: v.location,
          locationName: rooms[v.location].title,
          iconPath: v.iconPath
        };
        console.log(obj.deviceNameShort)
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
    }, function (error) {});
  };

  /**
   * Get model index by device ID
   * @param {string} deviceId
   * @returns {undefined}
   */
  $scope.getModelIndex = function (deviceId, node) {
    var index = _.findIndex($filter('hasNode')($scope.security.input.params, node), {
      devices: deviceId
    });
    return index;
  };
  ////////// Devices ////////// 
  /**
   * Assign a device
   * @param {string} deviceId
   * @param {string} param
   * @returns {undefined}
   */
  $scope.assignDevice = function (deviceId, param) {
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
  $scope.unassignDevice = function (deviceId, param) {
    var deviceIndex = _.findIndex($scope.security.input.params[param].table, {
      devices: deviceId
    });
    if (deviceIndex > -1) {
      $scope.security.input.params[param].table.splice(deviceIndex, 1);

    }
  };
  ////////// Advanced schedule ////////// 
  /**
   * Assign a time scheduler
   * @returns {undefined}
   */
  $scope.assignTimeScheduler = function () {
    var input = $scope.security.cfg.times.default,
      obj = {};
    $scope.security.input.params.times.table.push(input);
    $scope.resetOptions();
  };

  /**
   * Unassign a time scheduler
   *  @param {int} targetIndex 
   * @returns {undefined}
   */
  $scope.unassignTimeScheduler = function (targetIndex) {
    if (targetIndex > -1) {
      $scope.security.input.params.times.table.splice(targetIndex, 1);
    }
  };


  ////////// Save complete form ////////// 
  /**
   * Store instance
   */
  $scope.storeInstance = function (input, redirect) {
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function (response) {
      if (redirect) {
        //TODO: redirect to automation base
        //$location.path('/' + dataService.getUrlSegment($location.path()));
        $location.path('/automations');
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

  /**
   * Delete instance
   */
  $scope.deleteInstance = function (id, message) {
    alertify.confirm(message, function () {
      dataFactory.deleteApi('instances', id).then(function (response) {
        $location.path('/automations');
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });

    });
  };

});