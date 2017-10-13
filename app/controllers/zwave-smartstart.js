/**
 * @overview Handles Z-Wave SmartStart process.
 * @author Martin Vach
 */

/**
 * The base SmartStart controller.
 * @class SmartStartController
 */
myAppController.controller('SmartStartController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    $scope.smartStart = {
        input: {
            dsk: ''
        },
        show: false,
        process: false,
        progress: 0
    };

    /**
     * Load zwave data
     */
    $scope.loadZwaveData = function () {
        dataFactory.loadZwaveApiData().then(function (ZWaveAPIData) {
            var controllerId = ZWaveAPIData.controller.data.nodeId.value;
            var controller = ZWaveAPIData.devices[controllerId];
            var s2Support = $filter('hasNode')(controller, 'instances.0.commandClasses.159.data.supported.value');
            if (!s2Support) {
                alertify.alertError('Your controller does not support SmartStart. Please update your firmware.');
            }
            $scope.loadQrcode();

        }, function (error) {
            alertify.alertError('Something went wrong. Please try to include your device manualy.');
        });
    };
    $scope.loadZwaveData();

    /**
     * Load QR code
     */
    $scope.loadQrcode = function () {
        dataFactory.getApi('devices', null, true).then(function (response) {
            $scope.smartStart.qrcode = new QRCode('qrcode_smartstart', {
                text: 'textcode',
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            $scope.smartStart.show = true;

        }, function (error) {
            alertify.alertError('Something went wrong. Please try to include your device manualy.');
        });
    };

    /**
     * Start QR code inclusion
     */
    $scope.startQrCodeInclusion = function () {
         if ($scope.smartStart.process) {
            return;
        }
       processInclusion();
    };

    /**
     * Start inclusion from input
     */
    $scope.startDskInclusion = function () {
        if ($scope.smartStart.process) {
            return;
        }
        processInclusion();

    };

    /// --- Private functions --- ///
    /**
     * Set local modules
     */
    function processInclusion() {
        var counter = 0;
        var progress_object = $interval(function () {
            if (counter === 10) {
                $interval.cancel(progress_object);
                return;
            }
            counter++;
            $scope.smartStart.progress = (counter * 10);
            console.log('Percent: ' + $scope.smartStart.progress)


        }, 1000, 0);
    }



});

/**
 * The controller that include device by scanning QR code.
 * @class SmartStartQrController
 */
myAppController.controller('SmartStartQrController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    

});

/**
 * The controller that include device with DSK.
 * @class SmartStartDskController
 */
myAppController.controller('SmartStartDskController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    
});

