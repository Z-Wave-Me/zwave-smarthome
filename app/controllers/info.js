/**
 * Application info controller
 * @author Martin Vach
 */

myAppController.controller('InfoController', function($scope, $timeout) {
    $scope.input = {
        firmwareVersion: 'v2.0.2-rc8',
        uiVersion: $scope.cfg.app_version
    };
   alertify.success("Welcome to ngAlertify!");
    $scope.loadData = function() {
         $scope.alert = {message: $scope._t('Loading'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
         
          
        $timeout(function() {
             $scope.alert = {message: $scope._t('Success'), status: 'alert-success', icon: 'fa-check'};

        }, 3000);
         $timeout(function() {
             $scope.alert = {message: $scope._t('Error'), status: 'alert-danger', icon: 'fa-warning'};

        }, 6000);

    };

    $scope.loadData();


});