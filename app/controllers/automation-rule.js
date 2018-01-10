/**
 * @overview Controllers that handls rules
 * @author Martin Vach
 */
/**
 * Controller that handles list of rules
 * @class AutomationRuleController
 */
myAppController.controller('AutomationRuleController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.rules = {
    state: '',
    enableTest: [],

  };


  /**
   * Load
   * @returns {undefined}
   */
  $scope.loadRules = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.rules.all = _.chain(response.data.data).flatten().where({
        moduleId: 'Rules'
      }).filter(function (v) {
        var size = 0;
        for (k in v.params.devices) {
          if (v.params.devices[k].length) {
            size++;
          }
        }
        if (size) {
          $scope.rules.enableTest.push(v.id)
        }
        return v;
      }).value();
      if (!_.size($scope.rules.all)) {
        $scope.rules.state = 'blank';
        return;
      }
      $scope.rules.state = 'success';
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };
  $scope.loadRules();

  /**
   * Run test
   * @param {object} instance
   */
  $scope.runRuleTest = function (instance) {
    $scope.toggleRowSpinner(instance.id);
    $timeout($scope.toggleRowSpinner, 1000);
    var params = '/Scenes_' + instance.id + '/command/on';
    dataFactory.getApi('devices', params).then(function (response) {
      $timeout($scope.toggleRowSpinner, 2000);
    }, function (error) {
      $timeout($scope.toggleRowSpinner, 2000);
    });
  };


  /**
   * Activate
   * @param {object} input 
   * @param {boolean} activeStatus 
   */
  $scope.activateRule = function (input, state) {
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
   * @returns {undefined}
   */
  $scope.cloneRule = function (input) {
    input.id = 0;
    input.title = input.title + ' - copy';
    dataFactory.postApi('instances', input).then(function (response) {
      $location.path('/scenes/' + response.data.data.id);
    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  };

  /**
   * Delete
   */
  $scope.deleteRule = function (input, message) {
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
 * Controller that handles rule detail
 * @class AutomationRuleIdController
 */
myAppController.controller('AutomationRuleIdController', function ($scope, $routeParams, $location, $route, $filter, cfg, dataFactory, dataService, _, myCache) {
  $scope.rule = {
    model: {},
    source:{
      selected: {
        device:''
      },
      devices:[]
    },
    rooms: [],
    cfg: {
      operators:[
        '=',
        '>',
        '<'
      ],
      source:{
        toggleButton: {},
        switchControl:{
          status:{
            type: 'string',
            name: 'status',
            enum: [
              'off',
              'on',
              'level'
            ],
            operator:[
              '=',
              '>',
              '<'
            ],
            level:{
              min: 0,
              max: 99
            }
          }
        },
        switchBinary:{
          status:{
            type: 'string',
            name: 'status',
            enum: [
              'off',
              'on'
            ],
          }
        },
        switchMultilevel:{
          status:{
            type: 'string',
            name: 'status',
            enum: [
              'off',
              'on',
              'level'
            ],
            operator:[
              '=',
              '>',
              '<'
            ],
            level:{
              min: 0,
              max: 99
            }
          }
        },
        sensorBinary:{
          status:{
            type: 'string',
            name: 'status',
            enum: [
              'off',
              'on'
            ],
          }
        },
        sensorMultilevel:{
          status:{
            type: 'string',
            name: 'status'
          }, 
          operator:[
            '=',
            '>',
            '<'
          ],
        },
        sensorDiscrete:{
          status:{
            type: 'integer',
            name: 'level'
          }
        }
      }

      

    },
    input: {
      instanceId: $routeParams.id,
      moduleId: "Rules",
      active: true,
      title: "",
      params: {
        sourceDevice: {
          filterIf:''
        },
        delay: {
          eventstart: 0
        },
        targets: {
          elements: []
        },
        advanced: {
          activate: false,
          delay: {
            eventstart: 0
          }
        },
        reverse: {
          activate: false
        }
      }
    }
  };
  // Original data
  $scope.orig = {
    model: {}
  };
  $scope.orig.model = angular.copy($scope.rule.model);

  /**
   * Reset model
   */
  $scope.resetModel = function () {
    $scope.rule.model = angular.copy($scope.orig.model);

  };


  /**
   * Load instances
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      angular.extend($scope.rule.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      var filterIf = instance.params.sourceDevice.filterIf;
      console.log(instance.params.sourceDevice[filterIf])
      if(filterIf){
        $scope.rule.source.selected = instance.params.sourceDevice[filterIf];
      }

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
      $scope.rule.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
    });

  };
  $scope.loadRooms();

  /**
   * Load devices
   */
  $scope.loadDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      var whiteList = _.keys($scope.rule.cfg.source);
      var devices = dataService.getDevicesData(response.data.data.devices);
      $scope.rule.source.devices = devices.filter(function (v) {
        return whiteList.indexOf(v.deviceType) > -1;
      }).value();
      /* $scope.rule.devicesInRoom = _.countBy($scope.rule.availableDevices, function (v) {
        return v.location;
      }); */
    }, function (error) {});
  };
  $scope.loadDevices();

  /**
   * Change source device
   */
  $scope.changeSource = function (deviceId) {
    var device = _.findWhere($scope.rule.source.devices,{id: deviceId});
    if(!device){
      return;
    }
    $scope.rule.input.params.sourceDevice = {};
    $scope.rule.source.selected = {};
    
    var sourceDevice = {
      filterIf: device.deviceType
    };
    $scope.rule.source.selected = {device: device.id,filterIf:device.deviceType};
    sourceDevice[device.deviceType] = {
      device: device.id
    }
   angular.extend($scope.rule.input.params.sourceDevice,sourceDevice);


  };

   /**
   * Store 
   */
  $scope.storeRule = function (input, redirect) {
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function (response) {
      if (redirect) {
        $location.path('/rules');
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

});