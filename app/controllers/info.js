/**
 * Application info controller
 * @author Martin Vach
 */

myAppController.controller('InfoController', function($scope, dataFactory,dataService) {
    $scope.input = {
        software: {
            firmwareVersion: '',
            uiVersion: $scope.cfg.app_version
        }
    };
    
    /**
     * Load ZwaveApiData
     */
    $scope.loadZwaveApiData = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            angular.extend($scope.input.software,{firmwareVersion: ZWaveAPIData.controller.data.softwareRevisionVersion.value});
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadZwaveApiData();
});