/**
 * @overview Handles Z-Wave SmartStart process.
 * @author Martin Vach
 */


/**
 * The controller that include device with DSK.
 * @class SmartStartDskController
 */
myAppController.controller('SmartStartDskController', function ($scope, $timeout, cfg, dataFactory, dataService, _) {
  $scope.dsk = {
    firmwareAlert: {},
    input: {
      dsk_1: '',
      dsk_2: '',
      dsk_3: '',
      dsk_4: '',
      dsk_5: '',
      dsk_6: '',
      dsk_7: '',
      dsk_8: ''
    },
    state: null,
    list: [],
    response: ''
  };
  // Copy original input values
  $scope.origInput = angular.copy($scope.dsk.input);
  /**
   * Check if SDK version match
   * TODO: Unncoment when finished
   */
  $scope.checkSdkVersion = function () {
    dataFactory.loadZwaveApiData().then(function (ZWaveAPIData) {
      var SDKMatch = dataService.compareVersion(ZWaveAPIData.controller.data.SDK.value, cfg.smart_start.required_min_sdk, '>=');
      if (!SDKMatch) {
        $scope.dsk.firmwareAlert = {
          message: $scope._t('smartstart_not_supported'),
          status: 'alert-warning',
          icon: 'fa-exclamation-circle'
        };
      }
    });
  }
  /* $scope.checkSdkVersion(); */

  /**
   * Add DSK 
   * @returns {undefined} 
   */
  $scope.addDskProvisioningList = function () {
    var dsk = _.map($scope.dsk.input, function (v) {
      return v;
    }).join('-');

    $scope.dsk.state = 'registering';
    $scope.toggleRowSpinner(cfg.api.add_dsk);
    dataFactory.getApi('add_dsk_provisioning_list', dsk, true).then(function (response) {

      $timeout(function () {
        // Set state
        $scope.dsk.state = 'success-register';
        // Reset model
        $scope.dsk.input = angular.copy($scope.origInput);
        // Set response
        $scope.dsk.response = response.data[0];

      }, 1000);

    }, function (error) {
      $scope.dsk.state = null;
      alertify.alertError($scope._t('error_update_data'));
    }).finally(function () {
      $timeout($scope.toggleRowSpinner, 1000);
    });
  };

});

/**
 * The controller that displays DSK list.
 * @class SmartStartListController
 */
myAppController.controller('SmartStartListController', function ($scope, $timeout, $filter, cfg, dataFactory, expertService) {
 

  $scope.collection = {
    alert: {},
    all: [],
    find: {},
    deviceTypes: {},
    deviceInfos: {}
  };

  /**
   * Load DeviceClasses.xml from translations
   */
  $scope.loadXml = function () {

    // 
    dataFactory.xmlToJson(cfg.server_url + cfg.translations_xml_path + 'DeviceClasses.xml').then(function (response) {
      _.filter(response.DeviceClasses.Generic, function (v) {
        $scope.collection.deviceTypes[v._id] = expertService.configGetZddxLang($filter('hasNode')(v, 'name.lang'), $scope.lang);
      })
    });
  };
  $scope.loadXml();

  /**
   * Load device info
   */
  $scope.loadDeviceInfo = function () {
    dataFactory.getApi('zwave_devices', '?lang=' + $scope.lang).then(function (response) {
      _.filter(response.data.data.zwave_devices, function (v) {
        var parts = v.ConfigData.ProductId.split('.');
        if(parts.length > 3){
          parts.pop();
        }
        
        var id = parts.join('.');
        $scope.collection.deviceInfos[id] = {
          BrandName: v.BrandName,
          Name: v.Name
        }
      });

    });
  }
  $scope.loadDeviceInfo();

  /**
   * Get DSK Collection - DEMO
   */
  var getDskCollectionDemo = function () {
    dataFactory.getApiLocal('dsk-collection.json').then(function (response) {
      // There are no data
      if (_.isEmpty(response.data)) {
        $scope.collection.alert = {
          message: $scope._t('empty_dsk_list'),
          status: 'alert-warning',
          icon: 'fa-exclamation-circle'
        };
        return;
      }

      // Data collection
      $scope.collection.all = _.filter(response.data, function (v) {
        var typeId = $filter('decToHexString')(parseInt(v.ZW_QR_TLVVAL_PRODUCTID_ZWPRODUCTTYPE), 2, '0x');
        var pIdArray = v.p_id.split('.');
        var pId = parseInt(pIdArray[0]) + '.' + parseInt(pIdArray[1]) + '.' + parseInt(pIdArray[2]);
        //var pId = parseInt(pIdArray[0]) + '.' + parseInt(pIdArray[1]) + '.' + parseInt(pIdArray[2]) + (pIdArray[3] ? '.' + parseInt(pIdArray[3]) : '');
        //getDeviceInfo(pId);
        //console.log('pId',pId.map(parseInt,10))

        // Extending an object
        v.added = {
          pId: pId,
          typeId: typeId,
          dskArray: v.ZW_QR_DSK.split('-'),
          timeformat: $filter('dateTimeFromTimestamp')(v.timestamp)

        }

        return v;
      });

      // console.log($scope.collection.all)

    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };
  $timeout(getDskCollectionDemo);
  // $scope.getDskCollectionDemo();

  /**
   * Get DSK Collection
   */
  /* $scope.getDskCollection = function () {
      dataFactory.getApi('get_dsk', null, true).then(function (response) {
          
          
      }, function (error) {
          alertify.alertError($scope._t('error_load_data'));
      });
  };
  $scope.getDskCollection(); */

  /**
   * Update DSK 
   * @returns {undefined} 
   */
  $scope.updateDsk = function (input) {
    input.ZW_QR_DSK = _.map(input.added.dskArray, function (v) {
      return v;
    }).join('-');
    dataFactory.postApi('update_dsk', _.omit(input, 'added')).then(function (response) {

      myCache.removeAll();
      $route.reload();

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  };

  /**
   * Remov a DSK item
   * @param {object} input
   * @param {string} message
   * @returns {undefined}
   */
  $scope.removeDsk = function (input, message) {
    if (!input.isSmartStart) {
      alertify.alertError($scope._t('delete_no_smartstart_warning'));
      return;
    }

    alertify.confirm(message, function () {
      dataFactory.getApi('remove_dsk', input.id, true).then(function (response) {
        var index = _.findIndex($scope.collection.all, {
          id: input.id
        });
        if (index > -1) {
          $scope.collection.all.splice(index, 1);
        }
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });
    });
  };


});


/**
 * The controller that include device by scanning QR code.
 * @class SmartStartQrController
 */
myAppController.controller('SmartStartQrController', function ($scope, $timeout) {
  $scope.qrcode = {
    input: {
      qrcode: ''
    },
    state: 'start'
  };

  /**
   * Reset state to start
   */
  $scope.resetState = function () {
    $scope.qrcode.state = 'start';
    $scope.reloadData();
  };
  /**
   * Scan QR code
   */
  $scope.scan = function (error) {
    $scope.qrcode.state = 'scanning';
    $timeout(function () {
      $scope.qrcode.state = (error ? 'error' : 'success-scan');
    }, 4000);
  };

  /**
   * Discover the device
   */
  $scope.discover = function () {
    $scope.qrcode.state = 'discovering';
    $timeout(function () {
      $scope.qrcode.state = 'success-discover';
    }, 2000);
  };

});