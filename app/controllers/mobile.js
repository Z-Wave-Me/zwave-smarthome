/**
 * @overview Controllers manage and add mobile devices.
 * @author Michael Hensche
 */

/**
 * The controller that show that show or update the QR-Code.
 * @class MobileAddController
 */
myAppController.controller('MobileAddController', function ($scope, $timeout, $window, dataFactory, dataService, _) {
    $scope.qrcode = "";

    /**
     *  Add Qrcode
     */
    $scope.addQRCode = function(id) {
        alertify.prompt($scope._t('verify_qrcode'), "", function(evt, pass) {
            var data = {
                "password": pass
            };
            $scope.toggleRowSpinner(id);
            dataFactory.postApi('profiles', data, '/qrcode/'+$scope.user.id,).then(function(response) {
                dataService.showNotifier({message: $scope._t('success_updated')});
                
                var qr = new QRious({
                  level: 'H',
                  size: 255,
                  value: response.data.data
                });
                $scope.qrcode = qr.toDataURL();
                
                $scope.toggleRowSpinner(id);

            }, function(error) {
                $scope.toggleRowSpinner(id);
                if(error.data.error == "wrong_password") {
                    alertify.alertError($scope._t('wrong_password'));    
                } else {
                    alertify.alertError($scope._t('error_update_data'));
                }
            });
        }).set('type', 'password');
    }
});
