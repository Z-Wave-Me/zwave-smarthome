/**
 * Application controllers
 * @author Martin Vach
 */

/**
 * Error controller
 */
myAppController.controller('ErrorController', function($scope, $routeParams, dataService) {
    $scope.errorCfg = {
        code: false,
        icon: 'fa-warning'
    };
    /**
     * Logout proccess
     */
    $scope.loadError = function(code) {
        if (code) {
            $scope.errorCfg.code = code;
        } else {
            $scope.errorCfg.code = 0;
        }
        dataService.showConnectionError(code);

    };
    $scope.loadError($routeParams.code);

});

