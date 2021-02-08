/**
 * @overview Controllers that handle EnOcean Services.
 * @author Martin Vach, Serguei Poltorak
 */

/***************************************************************************************************************************
 * The controller that renders the list of EnOcean vendors or products.
 * @class EnoceanVendorController
 */
myAppController.controller('EnoceanVendorController', function ($scope, $routeParams, dataFactory, dataService, cfg, _) {
  $scope.enocean = {
    vendor: '',
    vendors: [],
    products:[]
  };
  $scope.enoceanVendors = [];
  $scope.enoceanProducts = [];

  /**
   * Load enocean vendors
   */
  $scope.loadData = function (brandname) {
    dataFactory.getApiLocal('devices_enocean.json').then(function (response) {
      if (brandname) {
        $scope.enocean.vendor =  brandname;
        $scope.enocean.products = _.where(response.data, {
          vendor: brandname
        });
      } else {
        $scope.enocean.vendors = _.uniq(response.data, 'vendor');
      }
      $scope.enocean.products.forEach(function(product) {
        if (product.smartAck) {
          product.teachIn = "smartAck";
        } else if (product.rorg == 0xB0) {
          product.teachIn = "genericProfile";
        } else {
          product.teachIn = product.id
        }
      });
    }, function (error) {});
  };


  /**
   * Load Remote access data
   */
  $scope.loadEnOceanModule = function () {
    $scope.loading = {
      status: 'loading-spin',
      icon: 'fa-spinner fa-spin',
      message: $scope._t('loading')
    };
    dataFactory.getApi('instances', '/EnOcean').then(function (response) {
      $scope.loading = false;
      var module = response.data.data[0];
      if (Object.keys(module).length < 1) {
        alertify.alertWarning($scope._t('no_data'));
        return;
      }
      if (!module.active) {
        alertify.alertError($scope._t('enocean_not_active'));
        return;
      }
      $scope.loadData($routeParams.brandname);
    }, function (error) {
      $scope.loading = false;
      if (error.status == 404) {
        alertify.alertError($scope._t('enocean_nosupport'));
      } else {
        angular.extend(cfg.route.alert, {
          message: $scope._t('error_load_data')
        });
      }

    });
  };

  $scope.loadEnOceanModule();
});

/***************************************************************************************************************************
 * The controller that teach-in a device from the list.
 * @class EnoceanTeachinController
 */
myAppController.controller('EnoceanTeachinController', function ($scope, $routeParams, $interval, $location, dataFactory, dataService, cfg, myCache) {
  $scope.device = [];
  $scope.includedDevices = [];
  $scope.lastIncludedDevice = [];
  $scope.enoceanDevices = {};
  $scope.enoceanProfiles = {};
  $scope.apiDevices = [];
  $scope.dev = [];
  $scope.rooms = [];
  $scope.modelRoom;
  $scope.inclusion = {
    promisc: false,
    smartAckLearnMode: false,
    smartAckLearnIn: false,
    done: false,
    config: false,
    message: false,
    status: 'is-hidden',
    icon: false
  };
  $scope.apiDataInterval = null;
  $scope.isSmartAck = false;

  $scope.inclusion.update = function(obj) {
    for (var key in obj) {
      $scope.inclusion[key] = obj[key];
    }
  };

  // Cancel interval on page destroy
  $scope.$on('$destroy', function () {
    $interval.cancel($scope.apiDataInterval);
  });

  /**
   * Load included devices
   */
  $scope.loadIncludedDevices = function () {
    dataFactory.loadEnoceanApiData(true).then(function (response) {
      angular.forEach(response.data.devices, function (v, k) {
        $scope.includedDevices.push(k);
      });
    }, function (error) {});
  };
  $scope.loadIncludedDevices();

  /**
   * Load profiles
   */
  $scope.loadProfiles = function () {
    dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function (response) {
      $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
    }, function (error) {});
  };
  $scope.loadProfiles();

  /**
   * Load locations
   */
  $scope.loadLocations = function () {
    dataFactory.getApi('locations').then(function (response) {
      $scope.rooms = response.data.data;
    }, function (error) {});
  };
  $scope.loadLocations();

  /**
   * Load device data holder
   */
  $scope.loadApiDevices = function () {
    dataFactory.getApi('devices', null, true).then(function (response) {
      $scope.apiDevices = [];
      var findZenoStr = "ZEnoVDev_zeno_x";
      var elements = dataService.getDevicesData(response.data.data.devices, false);
      angular.forEach(elements.value(), function (v, k) {
        if (v.id.indexOf(findZenoStr + $scope.lastIncludedDevice.id) === -1) {
          return;
        }

        v.title = v.metrics.title;
        $scope.apiDevices.push(v);
      });

    }, function (error) {});
  };

  $scope.AddDeviceStart = function () {
    $scope.runCmd('devices.Add(true,' + $scope.device.rorg + ','  + $scope.device.funcId + ',' + $scope.device.typeId + ')');
  };

  $scope.AddDeviceStop = function () {
    $scope.runCmd('devices.Add(false)');
  };

  // Special handling for Generic Profile page
  if ($location.$$path === "/enocean/teachin/genericProfile") {
    $scope.device = {
      rorg: "0xB0",
      funcID: "0x00",
      typeId: "0x00",
      description: "EnOcean Generic Profile Device",
      inclusion: "Press LRN-button",
      smartAck: false
    }
  }
  
  // Special handling for Smart Ack page
  if ($location.$$path === "/enocean/teachin/smartAck") {
    $scope.isSmartAck = true;
  }

  /**
   * Load single device
   */
  $scope.loadDevice = function () {
    dataFactory.getApiLocal('devices_enocean.json').then(function (response) {
      angular.forEach(response.data, function (v, k) {
        if (v.id == $routeParams.device) {
          $scope.device = v;
          return;
        }
      });
      if (!$scope.device) {
        alertify.alertWarning($scope._t('no_data'));
      }

      // Smart Ack can be Teach-In and Teach-Out so we don't start by default
      if (!$scope.isSmartAck) {
        $scope.AddDeviceStart();
        $scope.inclusion.update({
          message: $scope._t('teachin_starting'),
          status: 'alert-warning',
          icon: 'fa-spinner fa-spin'
        });
      }
    }, function (error) {
      angular.extend(cfg.route.alert, {
        message: $scope._t('error_load_data')
      });
    });
  };
  $scope.loadDevice();

  /**
   * Refresh data
   */
  $scope.refreshData = function () {
    var refresh = function () {
      dataFactory.refreshEnoceanApiData().then(function (response) {
        if (!$scope.apiDataInterval) return; // don't parse if it was stopped (reply might come with a delay)

        if (!$scope.isSmartAck) {
          var promisc = null;
          if ('controller' in response.data) {
            promisc = response.data['controller'].data.promisc.value;
          }
          if ('controller.data.promisc' in response.data) {
            promisc = response.data['controller.data.promisc'].value;
          }
          if (promisc === true) {
            if (!$scope.done) {
              $scope.inclusion.update({
                promisc: true,
                message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion || ''),
                status: 'alert-warning',
                icon: 'fa-spinner fa-spin'
              });
            }
          } else if (promisc === false) {
            if (!$scope.done) {
              $scope.inclusion.update({
                promisc: false,
                message: $scope._t('teachin_stopped'),
                status: 'alert-warning',
                icon: 'fa-exclamation-circle'
              });
            }
          }
        } else {
          var smartAckLearnMode = null, smartAckLearnIn = null;
          if ('controller' in response.data) {
            smartAckLearnMode = response.data['controller'].data.smartAckLearnMode.value;
            smartAckLearnIn = response.data['controller'].data.smartAckLearnIn.value;
          }
          if ('controller.data.smartAckLearnMode' in response.data) {
            smartAckLearnMode = response.data['controller.data.smartAckLearnMode'].value;
            smartAckLearnIn = response.data['controller.data.smartAckLearnIn'].value;
          }
          if (smartAckLearnMode === true) {
            if (!$scope.done) {
              $scope.inclusion.update({
                smartAckLearnMode: true,
                smartAckLearnIn: smartAckLearnIn,
                message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion || ''),
                status: 'alert-warning',
                icon: 'fa-spinner fa-spin'
              });
            }
          } else if (smartAckLearnMode === false) {
            var teachIn = $scope.inclusion.smartAckLearnIn;
            if (!$scope.done) {
              $scope.inclusion.update({
                smartAckLearnMode: false,
                smartAckLearnIn: false,
                message: $scope._t('teachin_stopped'),
                status: 'alert-warning',
                icon: 'fa-exclamation-circle'
              });
            }
          }
        }
        
        if ('devices' in response.data) {
          // update the list of included devices in case of structure changes
          Object.keys(response.data.devices).forEach(function(k) {
            if ($scope.includedDevices.indexOf(k) === -1) {
              // new device
              $scope.findDevice(k);
            }
          });
          $scope.loadIncludedDevices();
        }
      }, function (error) {});
    };
    $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
  };
  $scope.refreshData();

  /**
   * Find last included device
   */
  $scope.findDevice = function (lastId) {
    var id = lastId.replace(/^(x)/, "");
    if ($scope.includedDevices.indexOf(id) > -1) {
      return;
    }
    // new device - request more info
    dataFactory.loadEnoceanApiData(true).then(function (response) {
      angular.forEach(response.data.devices, function (v, k) {
        if (k === id) {
          var config = false;
          var name = 'Device ' + k;
          var profile = assignProfile(v.data);
          if (profile) {
            name = profile._funcDescription + ' ' + k;
          }

          $scope.lastIncludedDevice = {
            id: k,
            rorg: v.data.rorg.value,
            name: name,
            data: v.data,
            deviceProfileId: v.data.rorg.value + '_' + v.data.funcId.value + '_' + v.data.typeId.value,
            profile: profile
          };
          $scope.runCmd('devices["x' + k + '"].data.givenName=\'' + name + '\'');
          $interval.cancel($scope.apiDataInterval);
          $scope.inclusion.update({
            done: true,
            config: true,
            message: $scope._t('inclusion_proces_done'),
            status: 'alert-success',
            icon: 'fa-check'
          });
          $scope.loadApiDevices();
        }
      });
    }, function (error) {
      $scope.inclusion.update({
        message: $scope._t('inclusion_error'),
        status: 'alert-danger',
        icon: 'fa-warning'
      });
    });
  };

  /**
   * Run command
   */
  $scope.runCmd = function (cmd) {
    // Run CMD
    dataFactory.runEnoceanCmd(cmd).then(function (response) {}, function (error) {
      $scope.inclusion.update({
        message: $scope._t('inclusion_error'),
        status: 'alert-danger',
        icon: 'fa-warning'
      });
    });
    return;
  };

  /**
   * Update device
   */
  $scope.updateDevice = function (input) {
    $scope.loading = {
      status: 'loading-spin',
      icon: 'fa-spinner fa-spin',
      message: $scope._t('updating')
    };
    dataFactory.putApi('devices', input.id, input).then(function (response) {
      myCache.remove('devices');
      $scope.loadApiDevices();
      $scope.loading = false;
    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
      $scope.loading = false;
    });

  };
  /**
   * Assign devices to room
   */
  $scope.devicesToRoom = function (roomId, devices) {
    if (!roomId) {
      return;
    }
    $scope.loading = {
      status: 'loading-spin',
      icon: 'fa-spinner fa-spin',
      message: $scope._t('updating')
    };
    for (var i = 0; i <= devices.length; i++) {
      var v = devices[i];
      if (!v) {
        continue;
      }
      var input = {
        id: v.id,
        location: roomId
      };

      dataFactory.putApi('devices', v.id, input).then(function (response) {}, function (error) {
        alertify.alertError($scope._t('error_update_data'));
        $scope.loading = false;
        return;
      });
    }
    myCache.remove('devices');
    $scope.loadApiDevices();
    $scope.loading = false;
    return;

  };

  /**
   * Assign profile to device
   */
  function assignProfile(device, profiles) {
    var profile = false;
    var deviceProfileId = parseInt($scope.device.rorg, 16) + '_' + parseInt($scope.device.funcId, 16) + '_' + parseInt($scope.device.typeId, 16);
    angular.forEach($scope.enoceanProfiles, function (v, k) {
      var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);

      if (deviceProfileId == v.id) {
        profile = v;
        return;
      }
    });
    return profile;
  };
});

/***************************************************************************************************************************
 * The controller that manage EnOcean devices.
 * @class EnoceanManageController
 */
myAppController.controller('EnoceanManageController', function ($scope, $location, $window, dataFactory, dataService, cfg) {
  $scope.goEdit = [];
  $scope.apiDevices = [];
  $scope.enoceanDevices = {};

  /**
   * Load ZAutomation devices
   */
  $scope.loadApiDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      $scope.apiDevices = dataService.getDevicesData(response.data.data.devices, false)
    }, function (error) {});
  };
  $scope.loadApiDevices();

  /**
   * Load profiles
   */
  $scope.loadProfiles = function () {
    dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function (response) {
      var profile = dataService.setEnoProfile(response.Profiles.Profile);
      $scope.loadData(profile);
    }, function (error) {
      $scope.loadData(null);
    });
  };
  $scope.loadProfiles();

  /**
   * Load enocean data
   */
  $scope.loadData = function (enoceanProfiles) {
    $scope.loading = {
      status: 'loading-spin',
      icon: 'fa-spinner fa-spin',
      message: $scope._t('loading')
    };
    dataFactory.loadEnoceanApiData(true).then(function (response) {
      $scope.loading = false;
      setDevices(response.data.devices, enoceanProfiles);
    }, function (error) {
      angular.extend(cfg.route.alert, {
        message: $scope._t('error_load_data')
      });
      $scope.loading = false;
    });
  };

  /**
   * Delete device
   */
  $scope.deleteDevice = function (id, target, message) {
    var cmd = 'delete devices["x' + id + '"]';
    alertify.confirm(message, function () {
      dataFactory.runEnoceanCmd(cmd).then(function (response) {
        if (response.data === 'false') {
          alertify.alertError($scope._t('error_delete_data'));
          return;
        }
        $(target).fadeOut(500);
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });
    }).setting('labels', {
        'ok': $scope._t('ok')
    });
  };

  /// --- Private functions --- ///
  /**
   * Set devices
   */
  function setDevices(devices, profiles) {
    angular.forEach(devices, function (v, k) {
      $scope.enoceanDevices[k] = {
        id: k,
        givenName: v.data.givenName.value,
        data: v.data,
        profile: assignProfile(v.data, profiles),
        elements: getElements($scope.apiDevices, k)
      };
    });
  };

  /**
   * Assign profile to device
   */
  function assignProfile(device, profiles) {
    var profile = false;
    var deviceProfileId = device.rorg.value + '_' + device.funcId.value + '_' + device.typeId.value;
    angular.forEach(profiles, function (v, k) {
      if (deviceProfileId == v.id) {
        profile = v;
      }
    });
    return profile;
  };

  /**
   * Get elements
   */
  function getElements(devices, nodeId) {
    var elements = [];
    var findZenoStr = "ZEnoVDev_zeno_";
    angular.forEach(devices, function (v, k) {
      if (v.id.indexOf(findZenoStr) === -1) {
        return;
      }
      var cmd = v.id.split(findZenoStr)[1].split('_');
      var zenoId = cmd[0];
      if (zenoId == nodeId) {
        var obj = v;
        obj['title'] = v.metrics.title;
        elements.push(obj);
      }
    });
    return elements;
  };
});

/***************************************************************************************************************************
 * The controller that handles actions on the EnOcean device.
 * @class EnoceanManageDetailController
 */
 myAppController.controller('EnoceanManageDetailController', function ($scope, $routeParams, $filter, dataFactory, dataService, cfg, myCache) {
   $scope.nodeId = $routeParams.deviceId;
   $scope.enoceanDevice = [];
   $scope.enoceanProfiles = {};
   $scope.input = {};
   $scope.dev = [];
   $scope.apiDevices = [];
   $scope.rooms = [];
   $scope.modelRoom;

   /**
    * Load profiles
    */
   $scope.loadProfiles = function () {
     dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function (response) {
       $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
     }, function (error) {});
   };
   $scope.loadProfiles();

   /**
    * Load enocean data
    */
   $scope.loadData = function () {
     dataFactory.runEnoceanCmd('zeno.devices["' + $routeParams.deviceId + '"]').then(function (response) {
       if (response.data == 'null') {
         console.log('ERROR')
         return;
       }
       var device = response.data;
       var name = '';
       var profile = assignProfile(device.data, $scope.enoceanProfiles);
       if (profile) {
         name = profile._funcDescription;
       }
       $scope.input = {
         id: device.id.replace(/^(x)/, ""),
         rorg: device.data.rorg.value,
         name: device.data.givenName.value || name,
         deviceProfileId: device.data.rorg.value + '_' + device.data.funcId.value + '_' + device.data.typeId.value,
         profile: profile,
         profileId: ''

       };
     }, function (error) {});
   };
   $scope.loadData();

   /**
    * Load devices data holder
    */
   $scope.loadApiDevices = function () {
     dataFactory.getApi('devices', null, true).then(function (response) {
       $scope.apiDevices = [];
       var findZenoStr = "ZEnoVDev_zeno_";
       var elements = dataService.getDevicesData(response.data.data.devices, false);
       angular.forEach(elements.value(), function (v, k) {
         if (v.id.indexOf(findZenoStr) === -1) {
           return;
         }
         var cmd = v.id.split(findZenoStr)[1].split('_');
         var zenoId = cmd[0];
         if (zenoId == $scope.nodeId) {
           var obj = v;
           obj['level'] = $filter('toInt')(v.metrics.level);
           $scope.apiDevices.push(obj);
         }

       });
       loadLocations();

     }, function (error) {});
   };
   $scope.loadApiDevices();

   /**
    * Store device data
    */
   $scope.store = function (input) {
     if (input.name == '') {
       return;
     }
     //$scope.input.name = input.name;
     $scope.runCmd('devices["' + $scope.nodeId + '"].data.givenName=\'' + input.name + '\'');
     if (input.profileId) {
       var device = angular.fromJson(input.profileId);
       $scope.runCmd('devices["' + $scope.nodeId + '"].data.funcId=' + device.funcId);
       $scope.runCmd('devices["' + $scope.nodeId + '"].data.typeId=' + device.typeId);
       $scope.input.profileId = device.rorg + '_' + device.funcId + '_' + device.typeId;
     }
     $scope.loadData();
     $scope.loadApiDevices();
   };

   /**
    * Update device
    */
   $scope.updateDevice = function (input) {
     $scope.loading = {
       status: 'loading-spin',
       icon: 'fa-spinner fa-spin',
       message: $scope._t('updating')
     };
     dataFactory.putApi('devices', input.id, input).then(function (response) {
       myCache.remove('devices');
       $scope.loadApiDevices();
       $scope.loading = false;
     }, function (error) {
       alertify.alertError($scope._t('error_update_data'));
       $scope.loading = false;
     });

   };

   /**
    * Assign devices to room
    */
   $scope.devicesToRoom = function (roomId, devices) {
     if (!roomId) {
       return;
     }
     $scope.loading = {
       status: 'loading-spin',
       icon: 'fa-spinner fa-spin',
       message: $scope._t('updating')
     };
     for (var i = 0; i <= devices.length; i++) {
       var v = devices[i];
       if (!v) {
         continue;
       }
       var input = {
         id: v.id,
         location: roomId
       };

       dataFactory.putApi('devices', v.id, input).then(function (response) {}, function (error) {
         alertify.alertError($scope._t('error_update_data'));
         $scope.loading = false;
         return;
       });
     }
     $scope.loadApiDevices();
     return;
   };

   /**
    * Run command
    */
   $scope.runCmd = function (cmd) {
     $scope.loading = {
       status: 'loading-spin',
       icon: 'fa-spinner fa-spin',
       message: $scope._t('updating')
     };
     // Run CMD
     dataFactory.runEnoceanCmd(cmd).then(function (response) {
       $scope.loading = false;
     }, function (error) {
       $scope.loading = false;
     });
     return;
   };

   /// --- Private functions --- ///
   /**
    * Assign profile to device
    */
   function assignProfile(device, profiles) {
     var profile = false;
     var deviceProfileId = device.rorg.value + '_' + device.funcId.value + '_' + device.typeId.value;
     angular.forEach(profiles, function (v, k) {
       //var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);
       if (deviceProfileId == v.id) {
         profile = v;
         return;
       }
     });
     return profile;
   };

   /**
    * Load locations
    */
   function loadLocations() {
     dataFactory.getApi('locations').then(function (response) {
       $scope.rooms = response.data.data;
     }, function (error) {});
   };
 });

/***************************************************************************************************************************
 * The controller that renders informations about the controller.
 * @class EnoceanControllerController
 */
myAppController.controller('EnoceanControllerController', function ($scope, $location, dataFactory, dataService, cfg) {
  $scope.controller = false;
  $scope.controllerShow = ['APIVersion', 'AppDescription', 'AppVersion', 'ChipID', 'ChipVersion'];

  /**
   * Load enocean data
   */
  $scope.loadData = function () {
    $scope.loading = {
      status: 'loading-spin',
      icon: 'fa-spinner fa-spin',
      message: $scope._t('loading')
    };
    dataFactory.loadEnoceanApiData(true).then(function (response) {
      $scope.controller = response.data.controller.data;
      $scope.loading = false;
    }, function (error) {
      angular.extend(cfg.route.alert, {
        message: $scope._t('error_load_data')
      });
      $scope.loading = false;
    });
  };
  $scope.loadData();
});
