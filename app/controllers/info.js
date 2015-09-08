/**
 * Application info controller
 * @author Martin Vach
 */

myAppController.controller('InfoController', function($scope, $location, $window, $routeParams, $cookies,dataFactory, dataService) {
    $scope.input = {
        firmwareVersion: 'v2.0.2-rc8',
        uiVersion: $scope.cfg.app_version,
    };
    

});