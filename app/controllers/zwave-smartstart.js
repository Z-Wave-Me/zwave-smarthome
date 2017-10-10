/**
 * @overview Handles Z-Wave SmartStart process.
 * @author Martin Vach
 */

/**
 * The controller that handlesZ-Wave SmartStart process.
 * @class waveISmartStartController
 */
myAppController.controller('ZwaveISmartStartController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    $scope.smartStart = {
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
     * Run inclusion
     */
    $scope.runInclusion = function () {
        $scope.smartStart.process = !$scope.smartStart.process;
        if ($scope.smartStart.process) {
            return;
        }
        var progress_object = $interval(function () {
            if ($scope.smartStart.progress === 11) {
                $interval.cancel(progress_object);
                return;
            }
            console.log($scope.smartStart.progress++)
             
           
        }, 500, 0);
        
        console.log('runInclusion')
    };



});

