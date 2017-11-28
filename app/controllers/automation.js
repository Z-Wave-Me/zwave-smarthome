/**
 * @overview Controllers that handle automation actions – scenes, rules, schedules.
 * @author Martin Vach
 */

/**
 * Aoutomation parent controller
 * @class AutomationController
 */
myAppController.controller('AutomationController', function ($scope, $routeParams, $location, cfg, dataFactory, dataService, _, myCache) {
  $scope.automation = {
    moduleId: $routeParams.moduleId,
    allowedIds: ['Scenes', 'Rules', 'Schedules'],
    icons: {
      Scenes: 'scene.png',
      Rules: 'security-pending.png',
      Schedules: 'alarm.png'
    },
    prototypeRoutes: {
      Scenes: 'scenes',
      Rules: 'rules',
      Schedules: 'schedules'
    },
    imgPath: cfg.server_url + cfg.api_url + 'load/modulemedia/',

    //imgPath: cfg.server_url + cfg.api_url + 'load/modulemedia/',
    state: '',
    localModules: {},
    instances: {
      all: []

    }
  };

  /**
   * Load local modules
   * @returns {undefined}
   */
  $scope.loadLocalModules = function () {
    dataFactory.getApi('modules').then(function (response) {
      // Get info from module
      _.filter(response.data.data, function (v) {
        if ($scope.automation.allowedIds.indexOf(v.moduleName) > -1) {
          $scope.automation.localModules[v.moduleName] = {
            version: v.version,
            icon: $scope.automation.imgPath + v.id + '/' + v.icon,
            //icon: cfg.img.icons + $scope.automation.icons[v.moduleName],
            singleton: v.singleton,
            title: v.defaults.title
          };

        }

      });
    });
  };


  /**
   * Load instances
   * @returns {undefined}
   */
  $scope.loadInstances = function (moduleId) {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.automation.instances.all = _.where(response.data.data, {
        moduleId: moduleId
      });
      if (!_.size($scope.automation.instances.all)) {
        $scope.automation.state = 'blank';
        return;
      }
      $scope.automation.state = 'success';
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };
  if ($scope.automation.allowedIds.indexOf($routeParams.moduleId) > -1) {
    $scope.loadLocalModules();
    $scope.loadInstances($routeParams.moduleId);
  } else {
    $location.path('/error403');
  }


  /**
   * Activate instance
   */
  $scope.activateInstance = function (input, activeStatus) {
    input.active = activeStatus;
    if (input.id) {
      dataFactory.putApi('instances', input.id, input).then(function (response) {
        $scope.loading = false;

      }, function (error) {
        alertify.alertError($scope._t('error_update_data'));
        $scope.loading = false;
      });
    }

  };

  /**
   * Delete instance
   */
  $scope.deleteInstance = function (input, message) {
    alertify.confirm(message, function () {
      dataFactory.deleteApi('instances', input.id).then(function (response) {
        dataService.showNotifier({
          message: $scope._t('delete_successful')
        });
        $scope.reloadData();
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });

    });
  };

});

/**
 * Aoutomation mock controller
 * @class AutomationMockController
 */
myAppController.controller('AutomationMockController', function ($scope, $routeParams, $location, cfg, dataFactory, dataService, _, myCache) {
  $scope.mock = {
    input: {},
    rooms: [],
    modules: {
      switches: {
        title: 'Switches',
        all: ['Dummy Binary Switch', 'Everspring Switch 1', 'Everspring Switch 2', 'POPP Switch 1', 'POPP Switch 2']
      },
      dimmers: {
        title: 'Dimmers',
        all: ['Dimmer 1', 'Dimmer 2']
      },
      thermostats: {
        title: 'Thermostats',
        all: ['Thermostat 1', 'Thermostat 2', 'Thermostat 3']
      },
      locks: {
        title: 'Locks',
        all: ['Lock 1']
      },
      scenes: {
        title: 'Scenes',
        all: ['Scene 1', 'Scene 2', 'Scene 3', 'Scene 4']
      }
    },
    deviceTypes: [{
        type: 'switchBinary',
        title: 'Binary Switch'
      },
      {
        type: 'sensorBinary',
        title: 'Sensor binary'
      },
      {
        type: 'doorlock',
        title: 'Doorlock'
      },
      {
        type: 'switchMultilevel',
        title: 'Multilevel Switch'
      },
      {
        type: 'notification',
        title: 'Notification'
      },
      {
        type: 'scene',
        title: 'Scene'
      },
      {
        type: 'thermostat',
        title: 'Thermostat'
      }

    ],
    devices: [{
        id: 1,
        type: 'switchBinary',
        title: 'Device switchBinary'
      },
      {
        id: 2,
        type: 'sensorBinary',
        title: 'Device sensorBinary'
      },
      {
        id: 3,
        type: 'doorlock',
        title: 'Device doorlock'
      },
      {
        id: 4,
        type: 'switchMultilevel',
        title: 'Device switchMultilevel'
      },
      {
        id: 5,
        type: 'notification',
        title: 'Device notification'
      },
      {
        id: 6,
        type: 'scene',
        title: 'Device scene'
      },
      {
        id: 7,
        type: 'thermostat',
        title: 'Device thermostat'
      },
      {
        id: 10,
        type: 'switchBinary',
        title: 'Device switchBinary'
      },
      {
        id: 20,
        type: 'sensorBinary',
        title: 'Device sensorBinary'
      },
      {
        id: 30,
        type: 'doorlock',
        title: 'Device doorlock'
      },
      {
        id: 40,
        type: 'switchMultilevel',
        title: 'Device switchMultilevel'
      },
      {
        id: 50,
        type: 'notification',
        title: 'Device notification'
      },
      {
        id: 60,
        type: 'scene',
        title: 'Device scene'
      },
      {
        id: 70,
        type: 'thermostat',
        title: 'Device thermostat'
      }
    ]
  }

  /**
   * Load locations
   */
  $scope.loadLocations = function () {
    dataFactory.getApi('locations').then(function (response) {
      $scope.mock.rooms = dataService.getRooms(response.data.data).value();
    }, function (error) {});
  };
  $scope.loadLocations();
});

/**
 * Aoutomation rule detail controller
 * @class AutomationRuleIdController
 */
myAppController.controller('AutomationRuleIdController', function ($scope, $routeParams, $location, $filter, cfg, dataFactory, dataService, _, myCache) {

  $scope.rule = {
    deviceType: ["toggleButton", "switchControl", "switchBinary", "switchMultilevel", "sensorBinary", "sensorMultilevel", "sensorDiscrete"],
    cfg:{
      toggleButton: {},
      switchControl:{},
      switchBinary:{},
      switchMultilevel:{},
      sensorBinary:{},
      sensorMultilevel:{},
      sensorDiscrete: {}



    },
    devices: [],
    sourceDevice: {},
    targets: [],
    data: {},
    model:{
      sourceDevice:{
        id:'',
        value: '',
        device: {}
      }
    },
    input: {
      instanceId: $routeParams.id,
      moduleId: "Rules",
      active: true,
      title: "",
      params: {
        sourceDevice: { },
        targets: [{
          filterThen: "switchBinary",
          switchBinary: {
            target: "DummyDevice_40",
            status: "off",
            sendAction: false
          }
        }]
      }
    }
  }

  
  /**
   * Load devices
   */
  $scope.loadDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      $scope.rule.devices = dataService.getDevicesData(response.data.data.devices)
        .filter(function (v) {
          return $scope.rule.deviceType.indexOf(v.deviceType) > -1;
        }).value();
    }, function (error) {});
  };
  $scope.loadDevices();

  /**
   * On source device change
   */
  $scope.onSourceDeviceChange = function (deviceId) {
    console.log(deviceId)
   var device = _.findWhere($scope.rule.devices,{id: deviceId});
   //console.log(device)
    var sourceDevice = {};
    sourceDevice['filterIf'] = device.deviceType;
    sourceDevice[device.deviceType] = {
      device: device.id
    };

    console.log(sourceDevice)
   // $scope.rule.input.params.sourceDevice = sourceDevice;
   
  angular.extend($scope.rule.input.params,{sourceDevice: sourceDevice});
    angular.extend($scope.rule.model.sourceDevice,{id:device.id,value:'',device:device});

  };

  /**
   * On source device change value
   */
  $scope.onSourceDeviceChangeStatus = function (v,device) {
    console.log(v)
    angular.extend($scope.rule.input.params.sourceDevice[device.deviceType],{status: v});
    

  };


  /**
   * Load module
   */
  $scope.loadModule = function () {
    dataFactory.getApi('modules', '/Rules').then(function (response) {
      $scope.rule.data = response.data.data;
      $scope.rule.deviceType = $filter('hasNode')(response.data.data, 'schema.properties.sourceDevice.properties.filterIf.enum');
      console.log($scope.rule.deviceType);
      var schema = response.data.data.schema.properties.sourceDevice.properties;
      var options = response.data.data.options.fields.sourceDevice.fields;
      //getSourceDevice(schema, options);
    }, function (error) {});
  };
  //$scope.loadModule();


  /**
   * Store instance
   */
  $scope.storeInstance = function () {
    var input = $scope.rule.input;

  };
  /// --- Private functions --- ///

  function getSourceDevice(schema, options) {
    var deviceId = [];
    _.filter(schema, function (v) {
      if (!v.properties) {
        return;
      }
      var hasEnum = $filter('hasNode')(v, 'properties.device.enum');
      deviceId.push(hasEnum);
      //console.log(v.properties.device.enum)
    });

    console.log(deviceId)

  }

  function getSourceDeviceId() {

  }

  function getSourceDeviceTitle() {

  }
});