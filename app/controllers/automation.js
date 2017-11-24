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
    deviceTypes:[
      {type: 'switchBinary',title: 'Binary Switch'},
      {type: 'switchRGBW',title: 'Color Switch'},
      {type: 'doorlock',title: 'Doorlock'},
      {type: 'switchMultilevel',title: 'Multilevel Switch'},
      {type: 'notification',title: 'Notification'},
      {type: 'scene',title: 'Scene'},
      {type: 'thermostat',title: 'Thermostat'}

    ],
    devices:[
      {id: 1,type:'switchBinary',title: 'Device switchBinary'},
      {id: 2,type:'switchRGBW',title: 'Device switchRGBW'},
      {id: 3,type:'doorlock',title: 'Device doorlock'},
      {id: 4,type:'switchMultilevel',title: 'Device switchMultilevel'},
      {id: 5,type:'notification',title: 'Device notification'},
      {id: 6,type:'scene',title: 'Device scene'},
      {id: 7,type:'thermostat',title: 'Device thermostat'},
      {id: 10,type:'switchBinary',title: 'Device switchBinary'},
      {id: 20,type:'switchRGBW',title: 'Device switchRGBW'},
      {id: 30,type:'doorlock',title: 'Device doorlock'},
      {id: 40,type:'switchMultilevel',title: 'Device switchMultilevel'},
      {id: 50,type:'notification',title: 'Device notification'},
      {id: 60,type:'scene',title: 'Device scene'},
      {id: 70,type:'thermostat',title: 'Device thermostat'}
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

