/**
 * @overview Controllers manage and add mobile devices.
 * @author Michael Hensche
 */

/**
 * The controller that show that show or update the QR-Code.
 * @class MobileAddController
 */
myAppController.controller('MobileAddController', function ($scope, $timeout, $window, dataFactory, dataService, _) {
    $scope.qrcode = $scope.user.qrcode;

    /**
     *  Add Qrcode
     */
    $scope.addQRCode = function(id) {
        alertify.prompt($scope._t('verify_qrcode'), $scope._t('lb_password'), function(evt, pass) {
            var data = {
                "password": pass
            };
            $scope.toggleRowSpinner(id);
            dataFactory.putApi('profiles', 'qrcode/'+$scope.user.id, data).then(function(response) {
                dataService.showNotifier({message: $scope._t('success_updated')});
                $timeout(function () {
                    $scope.toggleRowSpinner(id);
                    $window.location.reload();
                }, 2000);
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
