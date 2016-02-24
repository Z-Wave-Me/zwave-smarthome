/**
 * Application Zwave inclusion controller
 * @author Martin Vach
 */
/**
 * Zwave include controller
 */
myAppController.controller('ZwaveInclusionController', function ($scope, $routeParams, $interval, $timeout, $route, $location, dataFactory, dataService, myCache) {
    $scope.zwaveInclusion = {
         steps: {
            done: []
        },
        device: {
            hasBattery: false,
            secureInclusion: true,
            find: {}
        },
        controller: {
            controllerState: 0,
            security: false,
            securityInterview: false
        },
        zwaveApiData: {}
    };
    
    /**
     * Load data into collection
     */
    $scope.loadDeviceId = function() {
        dataFactory.getApiLocal('device.' + $scope.lang + '.json').then(function(response) {
            angular.forEach(response.data, function(v, k) {
                if (v.id == $scope.device.id) {
                    $scope.device.data = v;
                    if (v.inclusion_type === 'unsecure') {
                        $scope.secureInclusion = false;
                        $scope.device.secureInclusion = false;
                    }
                    return;
                }
            });

        }, function(error) {
            dataService.showConnectionError(error);
            return;
        });

    };
    $scope.loadDeviceId($scope.lang);



});
