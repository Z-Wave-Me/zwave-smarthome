/**
 * @overview Handles Z-Wave SmartStart process.
 * @author Martin Vach
 */


/**
 * The controller that include device with DSK.
 * @class SmartStartDskController
 */
myAppController.controller('SmartStartDskController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
     $scope.dsk = {
        input: {
            dsk: ''
        },
        state: 'start'
    };
     /**
     * Reset state to start
     */
    $scope.resetState = function () {
        $scope.dsk.state = 'start';
        $scope.reloadData();
    };
     /**
     * Authenticate by DSK
     */
    $scope.authenticate = function () {
        console.log($scope.dsk.input.dsk)
        $scope.dsk.state = 'authenticating';
        $timeout(function(){
            $scope.dsk.state = ($scope.dsk.input.dsk ? 'success-authenticate' : 'error');
        }, 2000);
    };
    
     /**
     * Discover the device
     */
    $scope.discover = function () {
        $scope.dsk.state = 'discovering';
        $timeout(function(){
            //$scope.dsk.state = 'success-discover';
            $scope.dsk.state = ($scope.dsk.input.dsk == 1 ? 'error' : 'success-discover');
        }, 2000);
    };
    
});

/**
 * The controller that include device by scanning QR code.
 * @class SmartStartQrController
 */
myAppController.controller('SmartStartQrController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
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
        $timeout(function(){
            $scope.qrcode.state = (error ? 'error' : 'success-scan');
        }, 4000);
    };
    
     /**
     * Discover the device
     */
    $scope.discover = function () {
        $scope.qrcode.state = 'discovering';
        $timeout(function(){
            $scope.qrcode.state = 'success-discover';
        }, 2000);
    };

});

/**
 * The controller that displays DSK list.
 * @class SmartStartListController
 */
myAppController.controller('SmartStartListController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    $scope.list = {
        all:[
            "90013462300751525354554142434445313233343521222324250010163870076802206552101000000170028806420021222324254142434445111213141531323334351",
            "90013462300751525354554142434445313233343521222324250010163870076802206552101000000170028806420021222324254142434445111213141531323334352",
            "90013462300751525354554142434445313233343521222324250010163870076802206552101000000170028806420021222324254142434445111213141531323334353",
            "90013462300751525354554142434445313233343521222324250010163870076802206552101000000170028806420021222324254142434445111213141531323334354",
            "90013462300751525354554142434445313233343521222324250010163870076802206552101000000170028806420021222324254142434445111213141531323334355",
            "90013462300751525354554142434445313233343521222324250010163870076802206552101000000170028806420021222324254142434445111213141531323334356",
            "90013462300751525354554142434445313233343521222324250010163870076802206552101000000170028806420021222324254142434445111213141531323334357"
        ]
    };
    
    
});

