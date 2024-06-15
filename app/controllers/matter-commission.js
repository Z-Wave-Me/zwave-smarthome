/**
 * @overview Handles Z-Wave MatterCommission process.
 * @author Serguei Poltorak
 */


/**
 * The controller that .
 * @class MatterCommissionBaseController
 */
myAppController.controller('MatterCommissionBaseController', function($scope, $timeout, cfg, dataFactory, dataService, _) {
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
			width: 640,
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
			navigator.mediaDevices.getUserMedia = function (constraints) {

				// First get ahold of the legacy getUserMedia, if present
				var getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia;

				// Some browsers just don't implement it - return a rejected promise with an error
				// to keep a consistent interface
				if (!getUserMedia) {
					return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
				}

				// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
				return new Promise(function (resolve, reject) {
					getUserMedia.call(navigator, constraints, resolve, reject);
				});
			}
		}

		if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
			navigator.enumerateDevices = function (callback) {
				var enumerateDevices = navigator.mediaDevices.enumerateDevices();
				if (enumerateDevices && enumerateDevices.then) {
					navigator.mediaDevices.enumerateDevices().then(callback).catch(function () {
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

		if ($scope.deviceDetector.browser == 'chrome' &&
			$scope.deviceDetector.browser_version.split(".")[0] >= 46 &&
			!/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {

			if (typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
				isGetUserMediaSupported = false;
			}
		}
		if (navigator.enumerateDevices) {
			navigator.enumerateDevices(function (devices) {
				devices.forEach(function (_device) {
					var device = {};
					for (var d in _device) {
						try {
							if (typeof _device[d] !== 'function') {
								device[d] = _device[d];
							}
						} catch (e) {
						}
					}

					if (device.kind === 'videoinput') {
						hasWebcam = true;
					}
				});
				if (hasWebcam && isGetUserMediaSupported) {
					$scope.dataHolder.video.supported = true;
				} else {
					$scope.dataHolder.video.alert = {
						message: $scope._t('camera_not_supported'),
						status: 'alert-warning',
						icon: 'fa-exclamation-circle'
					};
				}
			});

		} else {
			$scope.dataHolder.video.supported = false;
		}
	}
	$scope.checkWebcam();

});

/**
 * The controller that include device with DSK.
 * @class MatterCommissionCodeController
 */
myAppController.controller('MatterCommissionCodeController', function($scope, $timeout, $filter, cfg, dataFactory, dataService, mobileDetector, _) {
	$scope.discrCode = {
		input: {
			qrCodeData: '',
			setupCode: ''
		},
		list: [],
		response: '',
	};
	$scope.isMobile = mobileDetector.isMobile()
	$scope.registerDisabled = true;
	var validateInputs = function () {
		$scope.registerDisabled = $scope.discrCode.input.qrCodeData.length == 0 && $scope.discrCode.input.setupCode.length == 0;
	}
	// Copy original input values
	$scope.origInput = angular.copy($scope.discrCode.input);

	/**
	 * Commission with a code
	 * @returns {undefined}
	 */
	$scope.commissionWithCode = function() {
		var code = $scope.dsk.input.qrCodeData;

		$scope.dataHolder.state = 'registering';
		$scope.toggleRowSpinner(cfg.api.add_dsk);
		dataFactory.runZMatterCmd('controller.AddNodeToNetwork("' +  code + '")').then(function (response) {
			// Set state
			$scope.dsk.state = 'success-register';
			// Reset model
			$scope.dsk.input = angular.copy($scope.origInput);
			// Set response
			$scope.discrCode.response = response.data[0];
			$scope.smartStartEnabled = true;
			$timeout($scope.toggleRowSpinner, timeout);
		}, function(error) {
			$scope.dataHolder.state = null;
			$scope.discrCode.state = 'error-register';
			alertify.alertError($scope._t('error_update_data'));
		}).finally(function() {
			$timeout($scope.toggleRowSpinner, 1000).then(function (){
				if ($scope.discrCode.state === 'success-register') {
					window.location.href = '#/matter/inclusion';
				}
			});
		});
	};

});


/**
 * The controller that include device by scanning QR code.
 * @class MatterCommissionQrController
 */
myAppController.controller('MatterCommissionQrController', function($route, $scope, $timeout, $location, dataFactory) {
	$scope.qrcode = {
		input: '',
		state: 'start',
		response: ''
	};
	var active = true;
	/**
	 * stop video on page destroy
	 */
	$scope.$on('$destroy', function() {
		$scope.stopStream();
		active = false;
	});
	$scope.stopStream = function() {
		if ($scope.dataHolder.video.mediaStream !== null) {
			$scope.dataHolder.video.mediaStream.stop();
			$scope.dataHolder.video.mediaStream = null;
			$scope.dataHolder.video.obj = null;
		}
	}

	/**
	 * Callback
	 */
	$scope.callbackQrCode = function(data) {
		$scope.stopStream();
		$scope.qrcode.state = 'success-register'; // hide the QR reader
		if (!data.match(/^MT:[A-Z0-9.-]{19,}$/)) {
			$scope.dataHolder.video.alert = {
				message: $scope._t('matter_invalid_qrcode'),
				status: 'alert-warning',
				icon: 'fa-exclamation-circle'
			};
			$timeout(function() {
				$route.reload();
			}, 5000);
			return;
		}
		$scope.qrcode.input = data;
		$timeout(function() {
			$location.path('/matter/inclusion/' + $scope.qrcode.input);
		}, 1000);
	};


	/**
	 * Init QR-Code-Reader if supported
	 */
	$scope.initQRCodeReader = function() {
		if ($scope.dataHolder.video.supported) {
			var constraints = $scope.deviceDetector.isMobile() ? {
				video: {
					facingMode: "environment"
				}
			} : {
				video: true
			};

			navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
				qrcode.callback = $scope.callbackQrCode;
				$scope.dataHolder.video.obj = document.querySelector('video');
				$scope.dataHolder.video.mediaStream = stream;
				// Older browsers may not have srcObject
				if ("srcObject" in $scope.dataHolder.video.obj) {
					$scope.dataHolder.video.obj.srcObject = stream;
				} else {
					// Avoid using this in new browsers, as it is going away.
					$scope.dataHolder.video.obj.src = window.URL.createObjectURL(stream);
				}

				$scope.dataHolder.video.mediaStream.stop = function() {
					this.getVideoTracks().forEach(function(track) {
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
		if ($scope.dataHolder.video.supported) {
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
		if (active) {
			try {
				$scope.dataHolder.canvas.gCtx.drawImage($scope.dataHolder.video.obj, 0, 0);
				qrcode.decode();
			} catch (e) {
				console.log(e);
				setTimeout(captureToCanvas, 500);
			}
		}
	}
});
