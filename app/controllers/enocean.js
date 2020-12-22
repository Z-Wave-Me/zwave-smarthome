/**
 * @overview Controllers that handle EnOcean Services.
 * @author Martin Vach
 */

/**
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
      }else{
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
/**
 * The controller that teach-in a device by the profile.
 * @class EnoceanAssignController
 */
myAppController.controller('EnoceanAssignController', function ($scope, $interval, dataFactory, dataService, myCache, cfg) {
  $scope.profile = false;
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
   * Load EnOcean profiles
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
   * Load devices from the data holder
   */
  $scope.loadApiDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      $scope.apiDevices = [];
      var findZenoStr = "ZEnoVDev_zeno_x";
      var elements = dataService.getDevicesData(response.data.data.devices, false);
      angular.forEach(elements.value(), function (v, k) {
        if (v.id.indexOf(findZenoStr) === -1) {
          return;
        }
        var cmd = v.id.split(findZenoStr)[1].split('_');
        var zenoId = cmd[0];
        if (zenoId == $scope.lastIncludedDevice.id) {
          var obj = v;
          obj['title'] = v.metrics.title;
          $scope.apiDevices.push(obj);
        }

      });

    }, function (error) {});
  };


  /**
   * Assign profile
   */
  $scope.loadDevice = function (profile) {
    $interval.cancel($scope.apiDataInterval);
    $scope.device = angular.fromJson(profile);
    $scope.inclusion = {
      done: false,
      promisc: true,
      smartAckLearnMode: false,
      smartAckLearnIn: false,
      message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''),
      status: 'alert-warning',
      icon: 'fa-spinner fa-spin'
    };
    $scope.runCmd('controller.data.promisc=true');
    $scope.refreshData();
  };

  /**
   * Refresh data
   */
  $scope.refreshData = function () {
    var refresh = function () {
      var findStr = 'devices';
      dataFactory.refreshEnoceanApiData().then(function (response) {
        if ('controller.data.promisc' in response.data) {
          var promisc = response.data['controller.data.promisc'].value;
          if (promisc === true) {
            $scope.inclusion = {
              done: false,
              promisc: true,
              message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''),
              status: 'alert-warning',
              icon: 'fa-spinner fa-spin'
            };
          } else {
            $scope.inclusion = {
              done: false,
              promisc: false,
              message: $scope._t('teachin_canceled'),
              status: 'alert-warning',
              icon: 'fa-exclamation-circle'
            };
          }
          return;
        }
        if ('controller.data.smartAckLearnMode' in response.data) {
          var smartAckLearnMode = response.data['controller.data.smartAckLearnMode'].value;
          if (smartAckLearnMode === true) {
            $scope.inclusion = {
              done: false,
              promisc: false,
              smartAckLearnMode: true,
              smartAckLearnIn: response.data['controller.data.smartAckLearnIn'].value || false,
              message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''),
              status: 'alert-warning',
              icon: 'fa-spinner fa-spin'
            };
          } else {
            $scope.inclusion = {
              done: false,
              promisc: false,
              smartAckLearnMode: false,
              smartAckLearnIn: false,
              message: $scope._t('teachin_canceled'),
              status: 'alert-warning',
              icon: 'fa-exclamation-circle'
            };
          }
          return;
        }

        if ('devices' in response.data) {
          angular.forEach(response.data.devices, function (v, k) {
            if ($scope.cfg.enocean_black_list.indexOf(k) === -1) {
              $scope.findDevice(k);
            }

          });
          return;
        }
        angular.forEach(response.data, function (v, k) {
          var array = k.split('.');
          if (array.indexOf(findStr) > -1) {
            if ($scope.cfg.enocean_black_list.indexOf(array[1]) === -1) {
              $scope.findDevice(array[1]);
            }

          }
        });
      }, function (error) {});
    };
    $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
  };



  /**
   * Find last included device
   */
  $scope.findDevice = function (lastId) {
    var id = lastId.replace(/^(x)/, "");
    if ($scope.includedDevices.indexOf(id) > -1) {
      $scope.inclusion = {
        done: false,
        promisc: false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: '<a href="#enocean/manage"><strong>' + $scope._t('device_exists') + '</strong></a>',
        status: 'alert-warning',
        icon: 'fa-exclamation-circle'
      };
      return;
    }

    dataFactory.loadEnoceanApiData(true).then(function (response) {
      angular.forEach(response.data.devices, function (v, k) {
        if (k == id) {
          var name = 'Device ' + k;
          var profile = assignProfile(v.data);
          if (profile) {
            name = profile._funcDescription + ' ' + k;
          }

          $scope.runCmd('controller.data.promisc=false');
          $scope.lastIncludedDevice = {
            id: k,
            rorg: v.data.rorg.value,
            name: name,
            data: v.data,
            deviceProfileId: v.data.rorg.value + '_' + v.data.funcId.value + '_' + v.data.typeId.value,
            profile: profile
          };

          $scope.runCmd('devices["x' + k + '"].data.givenName=\'' + name + '\'');
          if ($scope.device.funcId && $scope.device.typeId) {
            $scope.runCmd('devices["x' + k + '"].data.funcId=' + $scope.device.funcId);
            $scope.runCmd('devices["x' + k + '"].data.typeId=' + $scope.device.typeId);
          }
          $interval.cancel($scope.apiDataInterval);
          $scope.inclusion = {
            done: true,
            config: true,
            promisc: false,
            message: $scope._t('inclusion_proces_done'),
            status: 'alert-success',
            icon: 'fa-check'
          };
          $scope.loadApiDevices();
          return;
        }
      });

    }, function (error) {
      $scope.inclusion = {
        done: false,
        promisc: false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: $scope._t('inclusion_error'),
        status: 'alert-danger',
        icon: 'fa-warning'
      };
    });

  };

  /**
   * Run command
   */
  $scope.runCmd = function (cmd) {
    // Run CMD
    dataFactory.runEnoceanCmd(cmd).then(function (response) {}, function (error) {
      $scope.inclusion = {
        done: false,
        promisc: false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: $scope._t('inclusion_error'),
        status: 'alert-danger',
        icon: 'fa-warning'
      };

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
   * Assign devices to the room
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
   * Assign profile to the device
   */
  function assignProfile() {
    var profile = false;
    var deviceProfileId = parseInt($scope.device.rorg, 16) + '_' + parseInt($scope.device.funcId, 16) + '_' + parseInt($scope.device.typeId, 16);
    angular.forEach($scope.enoceanProfiles, function (v, k) {
      if (deviceProfileId == v.id) {
        profile = v;
        return;
      }
    });
    return profile;
  };

});
/**
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
    dataFactory.getApi('devices').then(function (response) {
      $scope.apiDevices = [];
      var findZenoStr = "ZEnoVDev_zeno_x";
      var elements = dataService.getDevicesData(response.data.data.devices, false);
      angular.forEach(elements.value(), function (v, k) {
        if (v.id.indexOf(findZenoStr) === -1) {
          return;
        }

        var cmd = v.id.split(findZenoStr)[1].split('_');
        var zenoId = cmd[0];
        if (zenoId == $scope.lastIncludedDevice.id) {
          var obj = v;
          //obj['id'] = v.id;
          obj['title'] = v.metrics.title;
          /*obj['permanently_hidden'] = v.permanently_hidden;
          obj['visibility'] = v.visibility;
          obj['metrics'] = v.metrics;*/
          $scope.apiDevices.push(obj);
        }

      });

    }, function (error) {});
  };

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

      $scope.inclusion = {
        done: false,
        promisc: $routeParams.devices ? true : false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''),
        status: 'alert-warning',
        icon: 'fa-spinner fa-spin'
      };
      if ($routeParams.devices) // not SmartAck
        $scope.runCmd('controller.data.promisc=true');
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
      var findStr = 'devices';
      dataFactory.refreshEnoceanApiData().then(function (response) {
        if ('controller.data.promisc' in response.data) {
          var promisc = response.data['controller.data.promisc'].value;
          if (promisc === true) {
            $scope.inclusion = {
              done: false,
              promisc: true,
              smartAckLearnMode: false,
              smartAckLearnIn: false,
              message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''),
              status: 'alert-warning',
              icon: 'fa-spinner fa-spin'
            };
          } else {
            $scope.inclusion = {
              done: false,
              promisc: false,
              smartAckLearnMode: false,
              smartAckLearnIn: false,
              message: $scope._t('teachin_canceled'),
              status: 'alert-warning',
              icon: 'fa-exclamation-circle'
            };
          }
          return;
        }
        if ('controller.data.smartAckLearnMode' in response.data) {
          var smartAckLearnMode = response.data['controller.data.smartAckLearnMode'].value;
          if (smartAckLearnMode === true) {
            $scope.inclusion = {
              done: false,
              promisc: false,
              smartAckLearnMode: true,
              smartAckLearnIn: response.data['controller.data.smartAckLearnIn'].value || false,
              message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''),
              status: 'alert-warning',
              icon: 'fa-spinner fa-spin'
            };
            return;
          } else {
            var teachIn = $scope.inclusion.smartAckLearnIn;
            $scope.inclusion = {
              done: false,
              promisc: false,
              smartAckLearnMode: false,
              smartAckLearnIn: false,
              message: $scope._t('teachin_canceled'),
              status: 'alert-warning',
              icon: 'fa-exclamation-circle'
            };
            if (!teachIn) {
              if ('devices' in response.data) {
                $scope.includedDevices = [];
                angular.forEach(response.data.devices, function (v, k) {
                  $scope.includedDevices.push(k);
                });
              }
              return;
            }
          }
        }
        if ('devices' in response.data) {
          angular.forEach(response.data.devices, function (v, k) {
            if ($scope.cfg.enocean_black_list.indexOf(k) === -1) {
              $scope.findDevice(k);
            }

          });
          return;
        }
        angular.forEach(response.data, function (v, k) {
          var array = k.split('.');
          if (array.indexOf(findStr) > -1) {
            if ($scope.cfg.enocean_black_list.indexOf(array[1]) === -1) {
              $scope.findDevice(array[1]);
            }

          }
        });
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
      $scope.inclusion = {
        done: false,
        promisc: false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: '<a href="#enocean/manage"><strong>' + $scope._t('device_exists') + '</strong></a>',
        status: 'alert-warning',
        icon: 'fa-exclamation-circle'
      };
      return;
    }
    console.log("id:" + id + "   " + lastId);
    dataFactory.loadEnoceanApiData(true).then(function (response) {
      angular.forEach(response.data.devices, function (v, k) {
        if (k === id) {
          var config = false;
          var name = 'Device ' + k;
          var profile = assignProfile(v.data);
          if (profile) {
            name = profile._funcDescription + ' ' + k;
          }

          $scope.runCmd('controller.data.promisc=false');
          $scope.lastIncludedDevice = {
            id: k,
            rorg: v.data.rorg.value,
            name: name,
            data: v.data,
            deviceProfileId: v.data.rorg.value + '_' + v.data.funcId.value + '_' + v.data.typeId.value,
            profile: profile
          };
          $scope.runCmd('devices["x' + k + '"].data.givenName=\'' + name + '\'');
          if ($scope.device.funcId && $scope.device.typeId) {
            $scope.runCmd('devices["x' + k + '"].data.funcId=' + $scope.device.funcId);
            $scope.runCmd('devices["x' + k + '"].data.typeId=' + +$scope.device.typeId);
          }
          $interval.cancel($scope.apiDataInterval);
          $scope.inclusion = {
            done: true,
            config: true,
            promisc: false,
            message: $scope._t('inclusion_proces_done'),
            status: 'alert-success',
            icon: 'fa-check'
          };
          $scope.loadApiDevices();
          return;
        }
      });

    }, function (error) {
      $scope.inclusion = {
        done: false,
        promisc: false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: $scope._t('inclusion_error'),
        status: 'alert-danger',
        icon: 'fa-warning'
      };
    });

  };

  /**
   * Run command
   */
  $scope.runCmd = function (cmd) {
    // Run CMD
    dataFactory.runEnoceanCmd(cmd).then(function (response) {}, function (error) {
      $scope.inclusion = {
        done: false,
        promisc: false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: $scope._t('inclusion_error'),
        status: 'alert-danger',
        icon: 'fa-warning'
      };

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
/**
 * The controller that manage EnOcean devices.
 * @class EnoceanManageController
 */
myAppController.controller('EnoceanManageController', function ($scope, $location, $window, dataFactory, dataService, cfg) {
  $scope.goEdit = [];
  $scope.apiDevices = [];
  $scope.enoceanDevices = {};

  /**
   * Load API devices
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
      if (Object.keys(response.data.devices).length < 1) {
        alertify.alertWarning($scope._t('no_data'));
        return;
      }

      setDevices(response.data.devices, enoceanProfiles);
      $scope.loading = false;

    }, function (error) {
      angular.extend(cfg.route.alert, {
        message: $scope._t('error_load_data')
      });
      $scope.loading = false;
    });
  };




  /**
   * Run CMD
   */
  $scope.runCmd = function (cmd) {
    // Run CMD
    dataFactory.runEnoceanCmd(cmd).then(function (response) {}, function (error) {
      $scope.inclusion = {
        done: false,
        promisc: false,
        smartAckLearnMode: false,
        smartAckLearnIn: false,
        message: $scope._t('inclusion_error'),
        status: 'alert-danger',
        icon: 'fa-warning'
      };

    });
    return;
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
        //$scope.loadData();
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
    // console.log(profiles)
    angular.forEach(devices, function (v, k) {
      if ($scope.cfg.enocean_black_list.indexOf(k) > -1) {
        return;
      };
      $scope.enoceanDevices[k] = {
        id: k,
        givenName: v.data.givenName.value,
        data: v.data,
        profile: assignProfile(v.data, profiles),
        elements: getElements($scope.apiDevices, k)

      };

    });

    //console.log($scope.enoceanDevices)
  };
  /**
   * Assign profile to device
   */
  function assignProfile(device, profiles) {
    var profile = false;
    var deviceProfileId = device.rorg.value + '_' + device.funcId.value + '_' + device.typeId.value;
    angular.forEach(profiles, function (v, k) {
      //console.log('deviceProfileId: ' + deviceProfileId)
      //console.log('v.id: ' + v.id)
      //var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);
      if (deviceProfileId == v.id) {
        profile = v;
        return;
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
        /*obj['id'] = v.id;
        obj['permanently_hidden'] = v.permanently_hidden;
        obj['metrics'] = v.metrics;*/
        elements.push(obj);
      }

    });
    return elements;
  };
});
/**
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
        //profileId = profile.profileId;
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
          /*obj['id'] = v.id;
          obj['permanently_hidden'] = v.permanently_hidden;
          obj['visibility'] = v.visibility;
          obj['level'] = $filter('toInt')(v.metrics.level);
          obj['metrics'] = v.metrics;*/
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
    //myCache.remove('devices');
    $scope.loadApiDevices();
    $scope.loading = false;
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
   * Set devices
   */
  function setDevices(devices, profiles) {
    angular.forEach(devices, function (v, k) {
      $scope.enoceanDevices[v.id] = {
        id: v.id,
        data: v.data,
        profile: assignProfile(v.data, profiles)
      };
    });
    //console.log($scope.deviceCollection)
  };
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
/**
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