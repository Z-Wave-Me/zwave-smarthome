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
      mediaStream: null,
      supported: false,
      alert: {}
    },
    canvas: {
      gCanvas: null,
      gCtx: null,
      width:640,
      height: 480
    },
    manual_add: false
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
      } else {
        $scope.dataHolder.video.alert = {message: $scope._t('camera_not_supported'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
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
    list: [],
    response: '',
  };
  // Copy original input values
  $scope.origInput = angular.copy($scope.dsk.input);
   /**
   * Split string into 8 substrings and then fill DSK inputs
   */
  $scope.fillInput = function (e) {
    var txt = e.originalEvent.clipboardData.getData('text/plain');
    if(txt){
      angular.forEach(txt.split('-'),function(v,k){
        $scope.dsk.input['dsk_' + (k+1)] = v.substring(0, 5);
      });
    }
   
  }

  /**
   * Check if SDK version match
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
    
    $scope.dataHolder.state = 'registering';
    $scope.toggleRowSpinner(cfg.api.add_dsk);
    console.log("dsk", dsk);
    dataFactory.postApi('add_dsk_provisioning_list', dsk).then(function (response) {

        // Set state
        $scope.dsk.state = 'success-register';
        // Reset model
        $scope.dsk.input = angular.copy($scope.origInput);
        // Set response
        $scope.dsk.response = response.data[0];

    }, function (error) {
      $scope.dataHolder.state = null;
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
    /*dataFactory.getApiLocal('dsk-collection.json').then(function (response) {
      var data = response.data;*/
      dataFactory.getApi('get_dsk', null, true).then(function (response) {
        var data = response.data;
      // There are no data
      if (_.isEmpty(data)) {
        $scope.collection.alert = {
          message: $scope._t('empty_dsk_list'),
          status: 'alert-warning',
          icon: 'fa-exclamation-circle'
        };
        return;
      }

      // Data collection
      $scope.collection.all = _.filter(data, function (v) {
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
myAppController.controller('SmartStartQrController', function ($scope, $timeout,$location, dataFactory) {
  $scope.qrcode = {
    input: {
      qrcode: ''
    },
    state: 'start',
    response: ''
  };

  /**
  * stop video on page destroy
  */
  $scope.$on('$destroy', function () {
    $scope.stopStream();    
  });

  $scope.stopStream = function() {
    if($scope.dataHolder.video.mediaStream !== null) {
      $scope.dataHolder.video.mediaStream.stop();
      $scope.dataHolder.video.mediaStream = null;
      $scope.dataHolder.video.obj = null;  
    }
  }

  /**
  * Callback   
  */
 $scope.callbackQrCode = function(data) {
    var index = data.indexOf(":");
    if(index !== -1) {
      data = data.substr(index + 1);  
    }
    $scope.qrcode.input = data;
    var qr_code_str = {dsk: data};
    dataFactory.postApi('add_dsk', qr_code_str).then(function (response) {
      $scope.qrcode.state = 'success-register';
      $scope.stopStream();
      $scope.qrcode.response = response.data;

      $timeout(function() {
          $location.path('/smartstartlist');
      }, 1000);

      
    }, function (error) {
      $scope.dataHolder.state = null;
      if(error.status == 409) {
        alertify.alertError($scope._t('error_smartstart_already_exists')).set('onok', function(closeEvent){ 
          captureToCanvas();
        });
      } else {
        alertify.alertError($scope._t('error_smartstart_add_dsk'));
      }
    });
  };


  /**
   * Init QR-Code-Reader if supported
   */
  $scope.initQRCodeReader =  function() {
    if($scope.dataHolder.video.supported) {
      var constraints = $scope.deviceDetector.isMobile() ? {video: {facingMode: "environment"}} : {video: true};

      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        qrcode.callback = $scope.callbackQrCode;
        $scope.dataHolder.video.obj = document.querySelector('video');
        $scope.dataHolder.video.mediaStream = stream;
        // Older browsers may not have srcObject
        if ("srcObject" in $scope.dataHolder.video) {
          $scope.dataHolder.video.obj.srcObject = stream;
        } else {
          // Avoid using this in new browsers, as it is going away.
          $scope.dataHolder.video.obj.src = window.URL.createObjectURL(stream);
        }

        $scope.dataHolder.video.mediaStream.stop = function () {
            this.getVideoTracks().forEach(function (track) { 
                track.stop();
            });
        };

        $scope.dataHolder.video.obj.onloadedmetadata = function(e) {
          $scope.initCanvas();
          $scope.dataHolder.video.obj.play();
        };

        setTimeout(captureToCanvas(), 500);
      
      }).catch(function(err) {
        $scope.dataHolder.video.supported = false;
        console.log(err.name + ": " + err.message);
      });
    }
  };
 
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
    $scope.dataHolder.canvas.gCanvas.style.width = $scope.dataHolder.video.obj.videoWidth + "px";
    $scope.dataHolder.canvas.gCanvas.style.height = $scope.dataHolder.video.obj.videoHeight + "px";
    $scope.dataHolder.canvas.gCanvas.width = $scope.dataHolder.video.obj.videoWidth;
    $scope.dataHolder.canvas.gCanvas.height = $scope.dataHolder.video.obj.videoHeight;
    $scope.dataHolder.canvas.gCtx = $scope.dataHolder.canvas.gCanvas.getContext("2d");
    $scope.dataHolder.canvas.gCtx.clearRect(0, 0, $scope.dataHolder.video.obj.videoWidth, $scope.dataHolder.video.obj.videoHeight);
  };

  function captureToCanvas() {
    try {
      $scope.dataHolder.canvas.gCtx.drawImage($scope.dataHolder.video.obj, 0, 0);
      qrcode.decode();
    } catch(e) {
      console.log(e);
      setTimeout(captureToCanvas, 500);  
    };
  }
});
