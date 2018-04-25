/**
 * @overview The controller that handles a timezone.
 * @author Martin Vach
 */

/**
 * The controller that handles a timezone.
 * @class ManagementTimezoneController
 */
myAppController.controller('ManagementTimezoneController', function ($scope, $timeout, $interval,$location,cfg, dataFactory, dataService) {
    $scope.managementTimezone = {
        lastTZ: '',
        input: {
            time_zone: ''
        },
        countdown: 60
    };

    /**
     * Load and set zwave configuration
     * @returns {undefined}
     */
    $scope.loadZwaveConfig = function () {
        // Set config
        dataFactory.getApi('configget_url', null, true).then(function (response) {
            $scope.managementTimezone.lastTZ = response.data.time_zone;
            $scope.managementTimezone.input.time_zone = response.data.time_zone;
            angular.extend($scope.cfg.zwavecfg, response.data);
        }, function (error) {});
    };

    $scope.loadZwaveConfig();
    /**
     * Set timezone
     */
    $scope.setTimezone = function (input,$event) {


        if(input.time_zone !== $scope.managementTimezone.lastTZ) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
            dataFactory.postApi('time_zone', input, null).then(function (response) {
                dataFactory.postApi('configupdate_url', input).then(function () {});
                $scope.loading = false;
                $scope.handleModal('timezoneModal', $event);
                var myint = $interval(function(){
                    $scope.managementTimezone.countdown--;
                    if($scope.managementTimezone.countdown === 0){
                        $interval.cancel(myint);
                        //$location.path('/');
                        dataService.setRememberMe(null);
                        dataFactory.getApi('logout').then(function (response) {
                            dataService.logOut();
                        });
                    }
                }, 1000);

            }, function (error) {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});

            });
        }
    };

});
