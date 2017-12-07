/**
 * @overview Handles Z-Wave SmartStart process.
 * @author Martin Vach
 */


/**
 * The controller that .
 * @class SmartStartBaseController
 */
myAppController.controller('SmartStartBaseController', function ($scope, $timeout, cfg, dataFactory, dataService, _) { 
  $scope.dataHolder = {
    video: {
      obj: null,
      supported: false
    },
    canvas: {
      gCanvas: null,
      gCtx: null,
      width:640,
      height: 480
    }
  };

  $scope.checkWebcam = function() {
    var hasWebcam = false,
        isGetUserMediaSupported = false;

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {

        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.enumerateDevices = function(callback) {
            var enumerateDevices = navigator.mediaDevices.enumerateDevices();
            if (enumerateDevices && enumerateDevices.then) {
                navigator.mediaDevices.enumerateDevices().then(callback).catch(function() {
                    callback([]);
                });
            } else {
                callback([]);
            }
        };
    }

   if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
      navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
   }

    if (!navigator.enumerateDevices && navigator.enumerateDevices) {
        navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
    }

    if (navigator.getUserMedia) {
        isGetUserMediaSupported = true;
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        isGetUserMediaSupported = true;
    }

    if($scope.deviceDetector.browser == 'chrome' && 
       $scope.deviceDetector.browser_version.split(".")[0]  >= 46 && 
       !/^(https:|chrome-extension:)$/g.test(location.protocol || '')) { 

      if (typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
          isGetUserMediaSupported = false;
      }
    }

    navigator.enumerateDevices(function(devices) {
      devices.forEach(function(_device) {
          var device = {};
          for (var d in _device) {
              try {
                  if (typeof _device[d] !== 'function') {
                      device[d] = _device[d];
                  }
              } catch (e) {}
          }

          if (device.kind === 'videoinput') {
              hasWebcam = true;
          }
      });
      if(hasWebcam && isGetUserMediaSupported) {
        $scope.dataHolder.video.supported = true;  
      }
    });

  };
  $scope.checkWebcam();

});

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
    var dsk = {dsk: _.map($scope.dsk.input, function (v) { return v;}).join('-') };
    
    $scope.dsk.state = 'registering';
    $scope.toggleRowSpinner(cfg.api.add_dsk);
    console.log("dsk", dsk);
    dataFactory.postApi('add_dsk_provisioning_list', dsk).then(function (response) {

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
  $scope.error = null;

  /**
   * Init QR-Code-Reader if supported
   */
  $scope.initQRCodeReader =  function() {
    if($scope.dataHolder.video.supported) {
      var constraints = $scope.deviceDetector.isMobile() ? {video: {facingMode: "environment"}} : {video: true};

      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        $scope.initCanvas();
        qrcode.callback = $scope.callbackQrCode;
        $scope.dataHolder.video.obj = document.querySelector('video');

        // Older browsers may not have srcObject
        if ("srcObject" in $scope.dataHolder.video) {
          $scope.dataHolder.video.obj.srcObject = stream;
        } else {
          // Avoid using this in new browsers, as it is going away.
          $scope.dataHolder.video.obj.src = window.URL.createObjectURL(stream);
        }
        $scope.dataHolder.video.obj.onloadedmetadata = function(e) {
          $scope.dataHolder.video.obj.play();
        };
        setTimeout(captureToCanvas(), 500);
      
      }).catch(function(err) {
        $scope.dataHolder.video.supported = false;
        console.log(err.name + ": " + err.message);
      });
    }
  };
  //$scope.initQRCodeReader();

  $scope.$watch("dataHolder.video.supported", function(newVal, oldVal) {
    if($scope.dataHolder.video.supported) {
      $scope.initQRCodeReader();
    }
  });

  /**
   * Init canvas to discover qrcode
   */
  $scope.initCanvas = function() {
    $scope.dataHolder.canvas.gCanvas = document.getElementById("qr-canvas");
    $scope.dataHolder.canvas.gCanvas.style.width = $scope.dataHolder.canvas.width + "px";
    $scope.dataHolder.canvas.gCanvas.style.height = $scope.dataHolder.canvas.height + "px";
    $scope.dataHolder.canvas.gCanvas.width = $scope.dataHolder.canvas.width;
    $scope.dataHolder.canvas.gCanvas.height = $scope.dataHolder.canvas.height;
    $scope.dataHolder.canvas.gCtx = $scope.dataHolder.canvas.gCanvas.getContext("2d");
    //$scope.dataHolder.canvas.gCtx.clearRect(0, 0, $scope.dataHolder.canvas.width, $scope.dataHolder.canvas.height);
  };

  /**
   * Callback   
   */
  $scope.callbackQrCode = function(data) {
    alert(data);
    var index = data.indexOf(":");
    if(index !== -1) {
      var data = data.substr(0, index);  
    }
    dataFactory.postApi("add_dsk", data).then(function(response) {
      alert("OK", data);
    }, function(error) {
      alert("ERROR", error);
    });
  };

  function captureToCanvas() {
    try {
     $scope.dataHolder.canvas.gCtx.drawImage($scope.dataHolder.video.obj, 0, 0);
     qrcode.decode();
    } catch(e) {
      console.log(e);
      $scope.error = e;
      setTimeout(captureToCanvas, 500);  
    };
  }
});
