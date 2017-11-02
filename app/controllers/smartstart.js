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
    //console.log(dataService.compareVersion(cfg.SDKVersion, cfg.smart_start.required_min_sdk, '>='))
    $scope.checkSdkVersion = function () {
        if(!dataService.compareVersion(cfg.SDKVersion, cfg.smart_start.required_min_sdk, '>=')){
            //$scope.dsk.firmwareAlert = {message: $scope._t('Your device does not support SmartStart. Please upgrade your firmware'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
        }
    }
    //$scope.checkSdkVersion();

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
                //$scope.dsk.list.unshift($scope.dsk.input.dsk);
                //$scope.getDskProvisioningList();
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

    /**
     * Get DSK Provisioning List
     */
    /*$scope.getDskProvisioningList = function () {
        dataFactory.getApi('get_dsk_provisioning_list', null, true).then(function (response) {
            if (_.isEmpty(response.data)) {
                return;
            }
            $scope.dsk.list = response.data;
        });
    };*/


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

/**
 * The controller that displays DSK list.
 * @class SmartStartListController
 */
myAppController.controller('SmartStartListController', function ($scope, $timeout, dataFactory) {
    $scope.list = {
        all: []
    };

    /**
     * Get DSK Provisioning List
     */
    $scope.getDskProvisioningList = function () {
        dataFactory.getApi('get_dsk_provisioning_list', null, true).then(function (response) {
            if (_.isEmpty(response.data)) {
                $scope.alert = {message: $scope._t('empty_dsk_list'), status: 'alert', icon: 'fa-exclamation-circle'};
                return;
            }

            $scope.list.all = response.data;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.getDskProvisioningList();

    /**
     * Remov a DSK item
     * @param {string} dsk
     * @returns {undefined}
     */
    $scope.removeDsk = function (dsk) {
        dataFactory.getApi('remove_dsk', dsk, true).then(function (response) {
            var index = $scope.list.all.indexOf(dsk);
            if (index > -1) {
                $scope.list.all.splice(index, 1);
            }
            //$scope.reloadData();
        }, function (error) {
            alertify.alertError($scope._t('error_delete_data'));
        });
    };



});

