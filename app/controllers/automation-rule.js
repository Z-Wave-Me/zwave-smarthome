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
      $location.path('/rules/' + response.data.data.id);
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
    tab: 'if',
    source: {
      selected: {
        device: ''
      },
      devices: []
    },
    target: {
      devicesInRoom: [],
      availableDevices: [],
      assignedDevices: [],
    },
   
    rooms: [],
    cfg: {
      operators: [
        '=',
        '>',
        '<'
      ],
      source: {
        toggleButton: {},
        switchControl: {
          min: 0,
          max: 99
        },
        switchBinary: {},
        switchMultilevel: {
          min: 0,
          max: 99
        },
        sensorBinary: {},
        sensorMultilevel: {},
        sensorDiscrete: {}
      },
      target: {
        doorlock: {},
        notification: {},
        switchBinary: {},
        switchMultilevel: {
          min: 0,
          max: 99
        },
        switchRGBW: {
          min: 0,
          max: 255
        },
        thermostat: {
          min: 0,
          max: 99
        },
        toggleButton: {},
      }

    },
    advanced:{
      tab: 'then',
      target: {
        devicesInRoom: [],
        availableDevices: [],
        assignedDevices: [],
      },
      cfg:{
       target:{
        switchBinary: {
          action: 'switches',
          default: {status: 'off'},
          enum: ['off', 'on']
        },
        switchMultilevel: {
          action: 'dimmers',
          min: 0,
          max: 99
        },
        thermostat: {
          action: 'thermostats',
          min: 0,
          max: 99
        },
        doorlock: {
          action: 'locks',
          enum: ['close', 'open']
        },
        toggleButton: {
          action: 'scenes',
        },
        notification: {
          action: 'notification',
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
          filterIf: ''
        },
        delay: {
          eventstart: 0
        },
        targets: {
          elements: []
        },
        advanced: {
          activate: false,
          logicalOperator: 'none',
          delay: {
            eventstart: 0
          },
          tests:[],
          action: {
            switches:[],
            dimmers:[],
            sthermostats:[],
            locks:[],
            scenes:[],
            notification:[]
          }
        },
        reverse: {
          activate: false
        }
      }
    }
  };
 
  /**
   * Load instances
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      var assignedTargetDevices = $scope.rule.target.assignedDevices;
      // Set input data
      angular.extend($scope.rule.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      // Set source device
      var filterIf = instance.params.sourceDevice.filterIf;
      if (filterIf) {
        $scope.rule.source.selected = instance.params.sourceDevice[filterIf];
      }
      // Set target assigned devices
      angular.forEach(instance.params.targets.elements, function (v, k) {
        var targetId = $filter('hasNode')(v[v['filterThen']], 'target');
        if (targetId) {
          $scope.rule.target.assignedDevices.push(targetId);
        }

      });
       // Set advanced target assigned devices
       angular.forEach(instance.params.advanced.action, function (v, k) {
       _.filter(v,function(val,key){
         if(val.device)
          $scope.rule.advanced.target.assignedDevices.push(val.device);
        });

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
      $scope.rule.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
    });

  };
  $scope.loadRooms();

  /**
   * Load devices
   */
  $scope.loadDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      var whiteListSource = _.keys($scope.rule.cfg.source);
      var whiteListTarget = _.keys($scope.rule.cfg.target);
      var whiteListAdvancedTarget = _.keys($scope.rule.advanced.cfg.target);
      var devices = dataService.getDevicesData(response.data.data.devices);
      // Set source devices
      $scope.rule.source.devices = devices.filter(function (v) {
        return whiteListSource.indexOf(v.deviceType) > -1;
      })
      .indexBy('id')
      .value();
      // Set target devices
      $scope.rule.target.availableDevices = devices.filter(function (v) {
        // Replacing deviceType with "notification"
        if(v.probeType == 'notification_push'){
          v.deviceType = 'notification';
        }
        
        return whiteListTarget.indexOf(v.deviceType) > -1;
      })
      .indexBy('id')
      .value();
      // Set target sum of devices in the room
      $scope.rule.target.devicesInRoom = _.countBy($scope.rule.target.availableDevices, function (v) {
        return v.location;
      });
       // Set advanced target devices
      $scope.rule.advanced.target.availableDevices = devices.filter(function (v) {
        // Replacing deviceType with "notification"
        if(v.probeType == 'notification_push'){
          v.deviceType = 'notification';
        }
        
        return whiteListAdvancedTarget.indexOf(v.deviceType) > -1;
      })
      .indexBy('id')
      .value();

       // Set advanced target sum of devices in the room
       $scope.rule.advanced.target.devicesInRoom = _.countBy($scope.rule.advanced.target.availableDevices, function (v) {
        return v.location;
      });
    }, function (error) {});
  };
  $scope.loadDevices();


  /**
   * Assign source device
   * @param {object} device
   */
  $scope.assignSourceDevice = function (device) {
   if (!device) {
      return;
    }
    $scope.rule.input.params.sourceDevice = {};
    $scope.rule.source.selected = {};

    var sourceDevice = {
      filterIf: device.deviceType
    };
    $scope.rule.source.selected = {
      device: device.id,
      filterIf: device.deviceType
    };
    sourceDevice[device.deviceType] = {
      device: device.id
    }
    angular.extend($scope.rule.input.params.sourceDevice, sourceDevice);
   };

   /**
   * Remove device id from source assigned device
   */
  $scope.unassignSourceDevice = function () {
    $scope.rule.input.params.sourceDevice = {};
    $scope.rule.source.selected = {};

  };

  /**
   * Assign device to the target
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignTargetDevice = function (device) {
    var element = {
      filterThen: device.deviceType,
      reverseLVL: "undefined"
    };
    element[device.deviceType] = {
      target: device.id
    };
    $scope.rule.target.assignedDevices.push(device.id);
    $scope.rule.input.params.targets.elements.push(element);
    
  };
  /**
   * Remove device id from target assigned device
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignTargetDevice = function (targetIndex,deviceId) {
    var deviceIndex = $scope.rule.target.assignedDevices.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.rule.input.params.targets.elements.splice(targetIndex, 1);
      $scope.rule.target.assignedDevices.splice(deviceIndex, 1);
    }

  };

  /**
   * Expand/Collapse target params
   */
  $scope.expandTargetParams = function (element) {
    var blackList = ['ruleThen'];
    // Colapse all params except 'element'
   /*  _.filter($scope.expand, function (v, k) {
      if (k != element || blackList.indexOf(k) === -1) {
        $scope.expand[k] = false;
      }

    }); */
     $scope.expandElement(element);

  };

  /**
   * Remove device from the target list
   * @param {object} device 
   */
  $scope.removeDeviceFromTarget = function (device) {
    var index;
    // Find index of the target device
    _.filter($scope.rule.input.params.targets.elements, function (v, k) {
      var targetId = $filter('hasNode')(v[v['filterThen']], 'target');
      if (targetId == device.id) {
        index = k;
        return;
      }

    });
    // Remove target device
    if (index > -1) {
      $scope.rule.input.params.targets.elements.splice(index, 1);
    }


  };

  
  /**
   * Assign device to the advanced target
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignAdvancedTargetDevice = function (device) {
    var action = {
      device: device.id,
      reverseLVL: "undefined"
    };
    var actionType = $scope.rule.advanced.cfg.target[device.deviceType].action;
    if(!actionType){
      return;
    }
    var status = $filter('hasNode')($scope.rule.advanced.cfg.target[device.deviceType],'enum.0');
    if(status){
      action['status'] = status;
    }
    $scope.rule.input.params.advanced.action[actionType].push(action);
    $scope.rule.advanced.target.assignedDevices.push( device.id,);
   
    
  };

  /**
   * Remove device id from advanced target assigned device
   *  @param {string} targetType
   * @param {int} targetIndex 
   * @param {string} deviceId 
   */
  $scope.unassignAdvancedTargetDevice = function (targetType,targetIndex,deviceId) {
    var deviceIndex = $scope.rule.advanced.target.assignedDevices.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.rule.input.params.advanced.action[targetType].splice(targetIndex, 1);
      $scope.rule.advanced.target.assignedDevices.splice(deviceIndex, 1);
    }

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