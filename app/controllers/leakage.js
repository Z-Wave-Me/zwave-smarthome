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
    sensors:['flood','alarm_flood','alarmSensor_flood'],
    notifiers:['notification'],
    interval: [60,120,300,600,900,1800,3600],
    availableSensors: {},
    availableDevices: {},
    availableNotifiers: {},
    devicesInRoom: [],
    assignedSensors: [],
    assignedDevices: [],
    assignedNotifiers: [],
    devicesInRoom:[],
    rooms: [],
      
    cfg: {
      switchBinary: {
        filter: 'switchBinary',
        level: ['on', 'off'],
        default: {
          device: '',
          status: 'on'
        }
      },
      switchMultilevel: {
        filter: 'switchMultilevel',
        level: ['on', 'off'],
        operator: ['=', '!=', '>', '>=', '<', '<='],
        default: {
          device: '',
          status: 'on'
        }
      },
      toggleButton: {
        filter: 'scene',
        default: {
          device: ''
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
        action: [],
        notification: {
          notifiers: []
        }
      },
    }
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
       // Set assigned sensors
       angular.forEach(instance.params.sensors, function (v) {
        if(v !==''){
         $scope.leakage.assignedSensors.push(v);
        }
      });

       // Set assigned devices
       angular.forEach(instance.params.action, function (v, k) {
         var deviceId = $filter('hasNode')(v, v.filter + '.device');
         if(deviceId){
          $scope.leakage.assignedDevices.push(deviceId);
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

      _.filter(devices.value(),function(v){
        var obj = {
          deviceId: v.id,
          deviceName: v.metrics.title,
          deviceType: v.deviceType,
          probeType: v.probeType,
          location: v.location,
          locationName: rooms[v.location].title
        };
        // Set sensors
       if($scope.leakage.sensors.indexOf(v.probeType) > -1) {
        $scope.leakage.availableSensors[v.id] =obj;
       }
         // Set devices
         if(_.keys($scope.leakage.cfg).indexOf(v.deviceType) > -1) {
          $scope.leakage.availableDevices[v.id] =obj;
        }
         // Set notifiers
       if($scope.leakage.notifiers.indexOf(v.probeTyp) > -1) {
        $scope.leakage.availableNotifiers[v.id] =obj;
      }
      });
      // Set devices in the room
      $scope.leakage.devicesInRoom = _.countBy($scope.leakage.availableDevices, function (v) {
        return v.location;
      });
    }, function (error) {});
  };

  /**
   * Store schedule
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