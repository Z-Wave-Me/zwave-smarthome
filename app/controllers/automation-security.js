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
    moduleId: 'SecurityModule',
    state: '',
    enableTest: [],
  }
  /**
   * Load instances
   * @returns {undefined}
   */
  $scope.loadInstances = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.security.all = _.chain(response.data.data).flatten().where({
        moduleId: $scope.security.moduleId
      }).filter(function (v) {
        var size = 0;
        for (k in v.params.devices) {
          if (v.params.devices[k].length) {
            size++;
          }
        }
        if (size) {
          $scope.security.enableTest.push(v.id)
        }
        return v;
      }).value();
      if (!_.size($scope.security.all)) {
        $scope.security.state = 'blank';
        return;
      }
      $scope.security.state = 'success';
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
 * Controller that handles a security detail
 * @class SecurityIdController
 */
myAppController.controller('SecurityIdController', function ($scope, $routeParams, $location, $timeout, $filter, cfg, dataFactory, dataService, _, myCache) {
  $scope.security = {
    tab: 3,
    days: [1, 2, 3, 4, 5, 6, 0],
    cfg: {
      times:{
        default:{
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
      }
    },
    input: {
      instanceId: $routeParams.id,
      moduleId: "SecurityModule",
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
        input:  [],
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
        controls: []

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
      var instance = instances.data.data;
      angular.extend($scope.security.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      // Set assigned devices
      angular.forEach(instance.params.triggerEvent, function (v, k) {
        if (v.deviceId) {
          $scope.security.assignedDevices.push(v.deviceId);
        }
      });

      // Set assigned devices
      angular.forEach(instance.params.sendNotifications, function (v, k) {
        if (v.notifier) {
          $scope.security.assignedNotifiers.push(v.notifier);
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
        var obj = {
          deviceId: v.id,
          deviceName: v.metrics.title,
          deviceType: v.deviceType,
          probeType: v.probeType,
          location: v.location,
          locationName: rooms[v.location].title
        };
      });
    }, function (error) {});
  };
  ////////// Advanced schedule ////////// 
  /**
   * Assign a time scheduler
   * @returns {undefined}
   */
  $scope.assignTimeScheduler = function () {
    var input = $scope.security.cfg.times.default, obj = {};
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
        $location.path('/' + dataService.getUrlSegment($location.path()));
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

});