/**
 * @overview Controllers that handls scenes
 * @author Martin Vach
 */
/**
 * Controller that handles list of scenes
 * @class AutomationSceneController
 */
myAppController.controller('AutomationSceneController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.scenes = {
    state: '',
    enableTest: [],

  };


  /**
   * Load schedules
   * @returns {undefined}
   */
  $scope.loadScenes = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.scenes.all = _.chain(response.data.data).flatten().where({
        moduleId: 'Scenes'
      }).filter(function (v) {
        var size = 0;
        for (k in v.params.devices) {
          if (v.params.devices[k].length) {
            size++;
          }
        }
        if (size) {
          $scope.scenes.enableTest.push(v.id)
        }
        return v;
      }).value();
      if (!_.size($scope.scenes.all)) {
        $scope.scenes.state = 'blank';
        return;
      }
      $scope.scenes.state = 'success';
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };
  $scope.loadScenes();

  /**
   * Run test
   * @param {object} instance
   */
  $scope.runSceneTest = function (instance) {
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
  $scope.activateScene = function (input, state) {
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
  $scope.cloneScene = function (input) {
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
  $scope.deleteScene = function (input, message) {
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
 * Controller that handles scene detail
 * @class AutomationSceneIdController
 */
myAppController.controller('AutomationSceneIdController', function ($scope, $routeParams, $location, $route, $filter, cfg, dataFactory, dataService, _, myCache) {
  $scope.scene = {
    model: {
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
      moduleId: "Scenes",
      active: true,
      title: "",
     
      params: {
        customIcon: {
          table:[{icon: false}]
          
        },
        devices:{
          switches: [],
          dimmers: [],
          thermostats: [],
          locks: [],
          scenes: []
        }
       
      }
    },
    upload: {
      fileName: false,
      maxSize: $filter('fileSizeString')(cfg.upload.icon.size),
      extensions: cfg.upload.icon.extension.toString()
    },
  };
  // Original data
  $scope.orig = {
    model: {}
  };
  $scope.orig.model = angular.copy($scope.scene.model);

  /**
   * Reset model
   */
  $scope.resetModel = function () {
    $scope.scene.model = angular.copy($scope.orig.model);

  };


  /**
   * Load instances
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      var assignedDevices = $scope.scene.assignedDevices;
      angular.extend($scope.scene.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
      angular.forEach(instance.params.devices, function (v, k) {
        switch (k) {
          case 'scenes':
            _.filter(v, function (s) {
              if (assignedDevices.indexOf(s) === -1) {
                $scope.scene.assignedDevices.push(s);
              }

            })
            break;
          default:
            _.filter(v, function (d) {
              if (assignedDevices.indexOf(d.device) === -1) {
                $scope.scene.assignedDevices.push(d.device);
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
      $scope.scene.rooms = dataService.getRooms(response.data.data).indexBy('id').value();
    });

  };
  $scope.loadRooms();

  /**
   * Load devices
   */
  $scope.loadDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      var whiteList = _.keys($scope.scene.cfg);
      var devices = dataService.getDevicesData(response.data.data.devices);
      $scope.scene.availableDevices = devices.filter(function (v) {
        return whiteList.indexOf(v.deviceType) > -1;
      }).value();
      $scope.scene.devicesInRoom = _.countBy($scope.scene.availableDevices, function (v) {
        return v.location;
      });
    }, function (error) {});
  };
  $scope.loadDevices();


  /**
   * Validate an uploaded icon
   * @param {object} files
   * @param {object} info
   * @returns {undefined}
   */
  $scope.uploadIcon = function (files, info) {
   var ext =  $filter('fileExtension')(files[0].name);
    // Extends files object with a new property
    files[0].newName = dataService.uploadFileNewName('scene_' + $routeParams.id + '.' + ext);
    // Check allowed file formats
    if (info.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
      alertify.alertError(
        $scope._t('upload_format_unsupported', {
          '__extension__': $filter('fileExtension')(files[0].name)
        }) + ' ' +
        $scope._t('upload_allowed_formats', {
          '__extensions__': info.extension.toString()
        })
      );
      return;

    }
    // Check allowed file size
    if (files[0].size > info.size) {
      alertify.alertError(
        $scope._t('upload_allowed_size', {
          '__size__': $filter('fileSizeString')(info.size)
        }) + ' ' +
        $scope._t('upload_size_is', {
          '__size__': $filter('fileSizeString')(files[0].size)
        })
      );
      return;

    }
   // Set selected file name
   $scope.scene.upload.fileName = files[0].name;
   // Set form data
    // Set local variables
    var fd = new FormData();
   fd.append('files_files', files[0]);
   // Atempt to upload a file
   dataFactory.uploadApiFile(cfg.api.icons_upload, fd).then(function (response) {
     console.log(response)
     $scope.scene.input.params.customIcon.table['0'].icon = response.data.data;
     /* if ($routeParams.id > 0) {
      $scope.storeScene($scope.scene.input);
    } */
   }, function (error) {
      alertify.alertError($scope._t('error_upload'));
   });
  };

   /**
   * Delete icon
   * @param {string} string
   * @returns {undefined}
   */
  $scope.deleteIcon = function (icon) {
    dataFactory.deleteApi('icons',icon).then(function (response) {
      $scope.scene.input.params.customIcon.table['0'].icon = false;
      /* if ($routeParams.id > 0) {
        $scope.storeScene($scope.scene.input);
      } */
      
    }, function (error) {
      alertify.alertError($scope._t('error_delete_data'));
    });
  };

  /**
   * Assign device to a schedule
   * @param {object} device
   * @returns {undefined}
   */
  $scope.assignDevice = function (device) {
    console.log('device', device)
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
        model = $scope.scene.model[device.deviceType];
        model.device = device.id;
        type = $scope.scene.cfg[device.deviceType].paramsDevices;
        $scope.handleDevice(model, type);
        break;
    }
    $scope.scene.assignedDevices.push(device.id);
    return;
  };

  /**
   * Remove device id from assigned device
   * @param {object} device 
   */
  $scope.unassignDevice = function (device) {
    var index = $scope.scene.assignedDevices.indexOf(device.id);
    if (index > -1) {
      $scope.scene.assignedDevices.splice(index, 1);
      removeDeviceFromParams(device);

    }

  };

  /**
   * Add or update device to the list (by type)
   * type: switches|dimmers|thermostats|locks
   */
  $scope.expandParams = function (element, device) {

    var type = $scope.scene.cfg[device.deviceType].paramsDevices;
    var params = _.findWhere($scope.scene.input.params.devices[type], {
      device: device.id
    });

    // Colapse all params except 'element'
    _.filter($scope.expand, function (v, k) {
      if (k != element) {
        $scope.expand[k] = false;
      }

    });
    $scope.resetModel();

    $scope.scene.model[device.deviceType] = params;
    $scope.expandElement(element);



  };


  /**
   * Add or update device to the list (by type)
   * type: switches|dimmers|thermostats|locks
   */
  $scope.handleDevice = function (v, type, element) {
    if (!v || v.device == '') {
      return;
    }
    // Adding new device
    var index = _.findIndex($scope.scene.input.params.devices[type], {
      device: v.device
    });
    if (index > -1) {
      $scope.scene.input.params.devices[type][index] = v;
    } else {
      $scope.scene.input.params.devices[type].push(v)
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
    var index = $scope.scene.input.params.devices.scenes.indexOf(v);
    if (index > -1) { // Update an item
      $scope.scene.input.params.devices.scenes[index] = v;
    } else { // Add new item
      $scope.scene.input.params.devices.scenes.push(v)
    }
  };

  /**
   * Store 
   */
  $scope.storeScene = function (input, redirect) {
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function (response) {
      if (redirect) {
        $location.path('/scenes');
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

  /// --- Private functions --- ///
  /**
   * Remove device from the params list
   * @param {object} device 
   */
  function removeDeviceFromParams(device) {
    var index;
    var type = $scope.scene.cfg[device.deviceType].paramsDevices;
    switch (device.deviceType) {
      // scenes
      case 'toggleButton':
        index = $scope.scene.input.params.devices[type].indexOf(device.id);
        break;
        // switches|dimmers|thermostats|locks
      default:
        index = _.findIndex($scope.scene.input.params.devices[type], {
          device: device.id
        });
        break;
    }
    if (index > -1) {
      $scope.scene.input.params.devices[type].splice(index, 1);
    }


  };

});