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
    tab: 'else',
    namespaces: [],
    rooms: [],
    options: {
      switchBinary: {
        level: ['on', 'off'],
        default: {
          deviceId: '',
          deviceType: 'switchBinary',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      sensorBinary: {
        level: ['on', 'off'],
        default: {
          deviceId: '',
          deviceType: 'sensorBinary',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      doorlock: {
        level: ['open', 'close'],
        default: {
          deviceId: '',
          deviceType: 'doorlock',
          level: 'open',
          sendAction: false,
          reverseLevel: null
        }
      },
      switchRGBW: {
        level: ['on', 'off'],
        min: 0,
        max: 255,
        default: {
          deviceId: '',
          deviceType: 'switchRGBW',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      switchControl: {
        level: ['on', 'off', 'upstart', 'upstop', 'downstart', 'downstop'],
        default: {
          deviceId: '',
          deviceType: 'switchControl',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      sensorDiscrete: {
        default: {
          deviceId: '',
          deviceType: 'switchControl',
          level: '',
          sendAction: false,
          reverseLevel: null
        }
      },
      sensorMultilevel: {
        level: ['on', 'off'],
        operator: ['=', '!=', '>', '>=', '<', '<='],
        min: 0,
        max: 99,
        default: {
          deviceId: '',
          deviceType: 'sensorMultilevel',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      switchMultilevel: {
        level: ['on', 'off'],
        operator: ['=', '!=', '>', '>=', '<', '<='],
        min: 0,
        max: 99,
        default: {
          deviceId: '',
          deviceType: 'switchMultilevel',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      thermostat: {
        level: ['on', 'off'],
        operator: ['=', '!=', '>', '>=', '<', '<='],
        min: 0,
        max: 99,
        default: {
          deviceId: '',
          deviceType: 'thermostat',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      toggleButton: {
        default: {
          deviceId: '',
          deviceType: 'toggleButton',
          level: 'on',
          sendAction: false,
          reverseLevel: null
        }
      },
      time: {
        operator: ['<=', '>='],
        default: {
          type: 'time',
          operator: '>=',
          level: '00:00',
        }
      },
      nested: {
        logicalOperator: ['and', ',or'],
        default: {
          type: 'nested',
          logicalOperator: 'and',
          tests: []

        }
      },
      notification: {
        default: {
          target: '',
          message: ''
        }
      }
    },
    source: {
      deviceTypes: ['toggleButton', 'switchControl', 'switchBinary', 'switchMultilevel', 'sensorBinary', 'sensorMultilevel', 'sensorDiscrete'],
      selected: {
        device: ''
      },
      devicesInRoom: [],
      devices: []
    },
    target: {
      deviceTypes: ['doorlock', 'switchBinary', 'switchMultilevel', 'thermostat', 'switchRGBW', 'switchControl', 'toggleButton', 'notification'],
      devicesInRoom: [],
      availableDevices: [],
      assignedDevices: [],
    },
    else: {
      deviceTypes: ['doorlock', 'switchBinary', 'switchMultilevel'],
    },
    advanced: {
      tab: 'if',
      target: {
        devicesInRoom: [],
        availableDevices: [],
        assignedDevices: [],
        eventSourceDevices: [],
        eventSourceTypes: ['toggleButton', 'notification']
      },
      tests: {
        devicesInRoom: [],
        availableDevices: [],
        assignedDevices: [],
        types: ['switchBinary', 'sensorBinary', 'doorlock', 'switchRGBW', 'switchControl', 'sensorDiscrete', 'sensorMultilevel', 'switchMultilevel', 'thermostat', 'toggleButton', 'time', 'nested']
      }

      /*  cfg: {
         eventSourceDevices: ['toggleButton', 'notification']
       } */
    },
    input: {
      id: $routeParams.id,
      moduleId: "Rules",
      active: true,
      title: "",
      params: {
        simple: {
          triggerEvent: {},
          triggerDelay: 0,
          targetElements: [],
          sendNotifications: [],
          reverseDelay: 0
        },
        advanced: {
          active: false,
          triggerScenes: [],
          triggerDelay: 0,
          logicalOperator: "and",
          tests: [],
          targetElements: [],
          sendNotifications: [],
          reverseDelay: 0,
          triggerOnDevicesChange: true
        },
        reverse: false
      }
    }
  };

  /**
   *  Reset Original data 
   */
  $scope.orig = {
    options: {}
  };
  $scope.orig.options = angular.copy($scope.rule.options);
  $scope.resetOptions = function () {
    $scope.rule.options = angular.copy($scope.orig.options);

  };

  /**
   * Load instances
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      var assignedTargetDevices = $scope.rule.target.assignedDevices;
      // Set input data
      //instance.params.advanced.tests = _.sortBy(instance.params.advanced.tests, 'testType');
      angular.extend($scope.rule.input, instance);
      // Set target assigned devices
      angular.forEach(instance.params.simple.targetElements, function (v, k) {
        $scope.rule.target.assignedDevices.push(v.deviceId);

      });
      // Set target assigned devices from notifications
      angular.forEach(instance.params.simple.sendNotifications, function (v, k) {
        $scope.rule.target.assignedDevices.push(v.target);

      });
      // Set advanced tests assigned devices
      angular.forEach(instance.params.advanced.tests, function (v, k) {
        if (v.type == 'nested') {
          _.filter(v.tests, function (test) {
            if (test.deviceId && $scope.rule.advanced.tests.assignedDevices.indexOf(test.deviceId) === -1) {
              $scope.rule.advanced.tests.assignedDevices.push(test.deviceId);
            }
          });
        } else {
          if (v.deviceId && $scope.rule.advanced.tests.assignedDevices.indexOf(v.deviceId) === -1) {
            $scope.rule.advanced.tests.assignedDevices.push(v.deviceId);
          }
        }


      });

      // Set advanced target assigned devices
      angular.forEach(instance.params.advanced.targetElements, function (v, k) {
        $scope.rule.advanced.target.assignedDevices.push(v.deviceId);

      });
      // Set advanced target assigned devices from notifications
      angular.forEach(instance.params.advanced.sendNotifications, function (v, k) {
        $scope.rule.advanced.target.assignedDevices.push(v.target);

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
      $scope.loadDevices($scope.rule.rooms);
    });

  };
  $scope.loadRooms();

  /**
   * Load devices
   */
  $scope.loadDevices = function (rooms) {
    dataFactory.getApi('devices').then(function (response) {
      var whiteListSource = $scope.rule.source.deviceTypes;
      var whiteListTarget = $scope.rule.target.deviceTypes;
      var whiteListAdvancedTests = $scope.rule.advanced.tests.types;
      var whiteListAdvancedEventSource = $scope.rule.advanced.target.eventSourceTypes;
      var devices = dataService.getDevicesData(response.data.data.devices, false, false, true).map(function (v) {
        var obj = {
          deviceId: v.id,
          deviceName: v.metrics.title,
          deviceType: v.deviceType,
          probeType: v.probeType,
          //level: !_.isNaN(v.metrics.level) ? parseInt(v.metrics.level) : v.metrics.level,
          level:v.metrics.level,
          location: v.location,
          locationName: rooms[v.location].title
        };
        return obj;
      });

      $scope.rule.namespaces = devices.indexBy('deviceId').value();

      // Set source devices
      $scope.rule.source.devices = devices.filter(function (v) {
          return whiteListSource.indexOf(v.deviceType) > -1;
        })
        .indexBy('deviceId')
        .value();
      // Set source sum of devices in the room
      $scope.rule.source.devicesInRoom = _.countBy($scope.rule.source.devices, function (v) {
        return v.location;
      });

      // Set target devices
      $scope.rule.target.availableDevices = devices.filter(function (v) {
          // Replacing deviceType with "notification"
          if (v.probeType == 'notification_push') {
            v.deviceType = 'notification';
          }

          return whiteListTarget.indexOf(v.deviceType) > -1;
        })
        .reject(function (v) {
          if ($scope.rule.source.selected.device == v.id) {
            return true;
          }
        })
        .indexBy('deviceId')
        .value();
      // Set target sum of devices in the room
      $scope.rule.target.devicesInRoom = _.countBy($scope.rule.target.availableDevices, function (v) {
        return v.location;
      });

      // Set advanced test devices
      $scope.rule.advanced.tests.availableDevices = devices.filter(function (v) {
          return whiteListAdvancedTests.indexOf(v.deviceType) > -1;
        })
        .indexBy('deviceId')
        .value();

      // Set advanced test sum of devices in the room
      $scope.rule.advanced.tests.devicesInRoom = _.countBy($scope.rule.advanced.tests.availableDevices, function (v) {
        return v.location;
      });

      // Set advanced event source devices
      $scope.rule.advanced.target.eventSourceDevices = devices.filter(function (v) {
          return whiteListAdvancedEventSource.indexOf(v.deviceType) > -1;
        })
        .indexBy('deviceId')
        .value();

    }, function (error) {});
  };


  // ctrl watch ?
  $scope.$watch('rule.input.params.simple.triggerEvent', function (newVal, oldVal) {

    if (newVal !== oldVal) {
      $scope.loadRooms();
    }
  });


  /**
   * Assign source device
   * @param {object} device
   */
  $scope.assignSourceDevice = function (device) {
    var defaultDevice = $scope.rule.options[device.deviceType].default;
    if (!defaultDevice) {
      return;
    }
    defaultDevice.deviceId = device.deviceId;
    $scope.rule.input.params.simple.triggerEvent = defaultDevice;
  };

  /**
   * Remove device id from source assigned device
   */
  $scope.unassignSourceDevice = function () {
    $scope.rule.input.params.simple.triggerEvent = {};
  };

  /**
   * Assign device to the target
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignTargetDevice = function (device) {
    var input = $scope.rule.options[device.deviceType].default;
    if (!input || $scope.rule.target.assignedDevices.indexOf(device.deviceId) > -1) {
      return;
    }
    $scope.rule.target.assignedDevices.push(device.deviceId);
    switch (device.deviceType) {
      // Notification
      case 'notification':
        var notifion = {
          target: device.deviceId,
          message: ''
        };
        $scope.rule.input.params.simple.sendNotifications.push(notifion);
        break;
        // Default
      default:
        var element = {
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          level: input.level,
          sendAction: input.sendAction,
          reverseLevel: input.reverseLevel
        };
        $scope.rule.input.params.simple.targetElements.push(element);
        break;

    }
    $scope.resetOptions();

  };


  /**
   * Remove device id from target assigned device
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignTargetDevice = function (targetIndex, deviceId) {

    var deviceIndex = $scope.rule.target.assignedDevices.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.rule.input.params.simple.targetElements.splice(targetIndex, 1);
      $scope.rule.target.assignedDevices.splice(deviceIndex, 1);
    }

  };

  /**
   * Assign notification
   * @param {object} notification
   * @returns {undefined}
   */
  $scope.assignTargetNotification = function (notification) {
    if (notification.target && $scope.rule.target.assignedDevices.indexOf(notification.target) === -1) {
      $scope.rule.input.params.simple.sendNotifications.push(notification);
      $scope.rule.target.assignedDevices.push(notification.target);
      $scope.resetOptions();
    }

  };

  /**
   * Remove notification from sendNotifications
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignTargetNotification = function (targetIndex, target) {

    var notificationIndex = $scope.rule.target.assignedDevices.indexOf(target);
    if (targetIndex > -1) {
      $scope.rule.input.params.simple.sendNotifications.splice(targetIndex, 1);
      $scope.rule.target.assignedDevices.splice(notificationIndex, 1);
    }

  };

  /**
   * Assign advanced device condition
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignAdvancedTestDevice = function (device) {
    var input = $scope.rule.options[device.deviceType].default;
    if (!input || $scope.rule.advanced.tests.assignedDevices.indexOf(device.deviceId) > -1) {
      return;
    }
    var index = _.size($scope.rule.input.params.advanced.tests);
    var test = {
      deviceId: device.deviceId,
      type: device.deviceType,
      level: input.level,
      sendAction: input.sendAction
    };
    $scope.rule.advanced.tests.assignedDevices.push(device.deviceId);
    $scope.rule.input.params.advanced.tests.push(test);
    $scope.resetOptions();
    $scope.expandElement('test_' + index);

  };

  /**
   * Assign advanced condition
   *  @param {string} type
   * @returns {undefined}
   */
  $scope.assignAdvancedTestCondition = function (type) {
    $scope.resetOptions();
    var input = $scope.rule.options[type].default;
    var index = _.size($scope.rule.input.params.advanced.tests);
    switch (type) {
      // time
      case 'time':
        var test = {
          type: input.type,
          operator: input.operator,
          level: input.level
        };
        break;
        // nested
      case 'nested':
        var test = {
          type: input.type,
          logicalOperator: input.logicalOperator,
          tests: input.tests
        };
        break;
        // default
      default:
        return;
    }
    $scope.rule.input.params.advanced.tests.push(test);
    $scope.expandElement('test_' + index);

  };

  /**
   * Remove advanced test
   * @param {int} argetIndex 
   * @param {string} target 
   */
  $scope.unassignAdvancedTest = function (targetIndex, deviceId) {
    var test = $scope.rule.input.params.advanced.tests[targetIndex];
    if (test.type == 'nested') {
      // Set advanced tests assigned devices
      angular.forEach(test.tests, function (v, k) {
        if (v.deviceId) {
          var deviceIndex = $scope.rule.advanced.tests.assignedDevices.indexOf(v.deviceId);
          $scope.rule.advanced.tests.assignedDevices.splice(deviceId, 1);
        }

      });
      $scope.rule.input.params.advanced.tests.splice(targetIndex, 1);

    } else {
      $scope.rule.input.params.advanced.tests.splice(targetIndex, 1);
      if (deviceId) {
        var deviceIndex = $scope.rule.advanced.tests.assignedDevices.indexOf(deviceId);
        $scope.rule.advanced.tests.assignedDevices.splice(deviceId, 1);
      }
    }
  };

  /**
   * Assign advanced nested device condition
   * @param {object} device
   * @param {int} testIndex
   * @returns {undefined}
   */
  $scope.assignAdvancedTestNestedDevice = function (device, testIndex) {
    var input = $scope.rule.options[device.deviceType].default;
    if (!input || $scope.rule.advanced.tests.assignedDevices.indexOf(device.deviceId) > -1) {
      return;
    }
    var index = _.size($scope.rule.input.params.advanced.tests[testIndex].tests);
    var test = {
      deviceId: device.deviceId,
      type: device.deviceType,
      level: input.level,
      sendAction: input.sendAction
    };
    $scope.rule.advanced.tests.assignedDevices.push(device.deviceId);
    $scope.rule.input.params.advanced.tests[testIndex].tests.push(test);
    $scope.resetOptions();
    $scope.expandElement('test_nested_' + testIndex + index);

  };

  /**
   * Assign advanced nested condition
   *  @param {string} type
   * @param {int} testIndex
   * @returns {undefined}
   */
  $scope.assignAdvancedTestNestedCondition = function (type, testIndex) {
    $scope.resetOptions();
    var input = $scope.rule.options[type].default;
    var index = _.size($scope.rule.input.params.advanced.tests[testIndex].tests);
    switch (type) {
      // time
      case 'time':
        var test = {
          type: input.type,
          operator: input.operator,
          level: input.level
        };
        break;
        // nested
      case 'nested':
        var test = {
          type: input.type,
          logicalOperator: input.logicalOperator,
          tests: input.tests
        };
        break;
        // default
      default:
        return;
    }
    $scope.rule.input.params.advanced.tests[testIndex].tests.push(test);
    $scope.expandElement('test_nested_' + testIndex + index);

  };

  /**
   * Remove advanced nested test
   * @param {int} targetIndex 
   * @param {string} deviceId
   * @param {int} testIndex 
   */
  $scope.unassignAdvancedTestNested = function (targetIndex, deviceId, testIndex) {
    $scope.rule.input.params.advanced.tests[testIndex].tests.splice(targetIndex, 1);

    if (deviceId) {
      var deviceIndex = $scope.rule.advanced.tests.assignedDevices.indexOf(deviceId);
      $scope.rule.advanced.tests.assignedDevices.splice(deviceId, 1);
    }

  };
  /**
   * Assign advanced device to the target
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignAdvancedTargetDevice = function (device) {
    var input = $scope.rule.options[device.deviceType].default;
    if (!input || $scope.rule.advanced.target.assignedDevices.indexOf(device.deviceId) > -1) {
      return;
    }
    $scope.rule.advanced.target.assignedDevices.push(device.deviceId);
    switch (device.deviceType) {
      // Notification
      case 'notification':
        var notifion = {
          target: device.deviceId,
          message: ''
        };
        $scope.rule.input.params.advanced.sendNotifications.push(notifion);
        break;
        // Default
      default:
        var element = {
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          level: input.level,
          sendAction: input.sendAction,
          reverseLevel: input.reverseLevel
        };
        $scope.rule.input.params.advanced.targetElements.push(element);
        break;

    }
    $scope.resetOptions();

  };

  /**
   * Remove device id from advanced target assigned device
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignAdvancedTargetDevice = function (targetIndex, deviceId) {

    var deviceIndex = $scope.rule.target.assignedDevices.indexOf(deviceId);
    if (targetIndex > -1) {
      $scope.rule.input.params.advanced.targetElements.splice(targetIndex, 1);
      $scope.rule.advanced.target.assignedDevices.splice(deviceIndex, 1);
    }

  };

  /**
   * Assign notification
   * @param {object} notification
   * @returns {undefined}
   */
  $scope.assignAdvancedTargetNotification = function (notification) {
    if (notification.target && $scope.rule.advanced.target.assignedDevices.indexOf(notification.target) === -1) {
      $scope.rule.input.params.advanced.sendNotifications.push(notification);
      $scope.rule.advanced.target.assignedDevices.push(notification.target);
      $scope.resetOptions();
    }

  };

  /**
   * Remove notification from sendNotifications
   * @param {int} index 
   * @param {string} deviceId 
   */
  $scope.unassignAdvancedTargetNotification = function (targetIndex, target) {

    var notificationIndex = $scope.rule.advanced.target.assignedDevices.indexOf(target);
    if (targetIndex > -1) {
      $scope.rule.input.params.advanced.sendNotifications.splice(targetIndex, 1);
      $scope.rule.advanced.target.assignedDevices.splice(notificationIndex, 1);
    }

  };

  /**
   * Assign device ID to the advanced event source
   * @param {string} deviceId
   * @returns {undefined}
   */
  $scope.assignAdvancedEventSource = function (deviceId) {
    $scope.rule.input.params.advanced.triggerScenes.push(deviceId);

  };

  /**
   * Remove device id from advanced event source
   * @param {string} deviceId
   * @returns {undefined}
   */
  $scope.unassignAdvancedEventSource = function (deviceId) {
    var deviceIndex = $scope.rule.input.params.advanced.triggerScenes.indexOf(deviceId);
    if (deviceIndex > -1) {
      $scope.rule.input.params.advanced.triggerScenes.splice(deviceIndex, 1);
    }

  };

  /**
   * Store 
   */
  $scope.storeRule = function (input, redirect) {
    dataFactory.storeApi('instances', parseInt(input.id, 10), input).then(function (response) {
      if (redirect) {
        $location.path('/rules');
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

});