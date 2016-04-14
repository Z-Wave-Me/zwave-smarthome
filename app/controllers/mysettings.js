/**
 * Application MySettings controller
 * @author Martin Vach
 */

/**
 * My Access
 */
myAppController.controller('MySettingsController', function($scope, $window, $cookies,$timeout,$filter,$q,dataFactory, dataService, myCache) {
    $scope.id = $scope.user.id;
    $scope.devices = {};
    $scope.input = false;
    $scope.newPassword = null;
    $scope.trustMyNetwork = true;
    
    
     /**
     * Trust my network
     */
//    $scope.loadTrustMyNetwork = function() {
//        dataFactory.getApi('trust_my_network').then(function (response) {
//            $scope.trustMyNetwork = response.data.data.trustMyNetwork;
//                console.log($scope.trustMyNetwork)
//            }, function (error) {
//                $scope.loading = false;
//                alertify.alertError($scope._t('error_load_data'));
//
//            });
//    };

 /**
     * Load all promises
     */
    $scope.allSettled = function () {
        var promises = [
             dataFactory.getApi('profiles', '/' + $scope.id, true),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var profile = response[0];
            var devices = response[1];

            $scope.loading = false;
            // Error message
            if (profile.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - profile
            if (profile.state === 'fulfilled') {
                 $scope.input = profile.value.data.data;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
               $scope.devices = devices.value.data.data.devices;
            }
        });
    };
    $scope.allSettled();  
    
    /**
     * Assign device to list
     */
    $scope.assignDevice = function(assign) {
        $scope.input.hide_single_device_events.push(assign);
        return;

    };
    /**
     * Remove device from the list
     */
    $scope.removeDevice = function(deviceId) {
        var oldList = $scope.input.hide_single_device_events;
        $scope.input.hide_single_device_events = [];
        angular.forEach(oldList, function(v, k) {
            if (v != deviceId) {
                $scope.input.hide_single_device_events.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function(form,input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }

            $scope.loading = false;
            $cookies.lang = input.lang;
            myCache.remove('profiles');
            dataService.setUser(data);
             dataService.showNotifier({message: $scope._t('success_updated')});
             $timeout(function () {
                 alertify.dismissAll();
                $window.location.reload();
            }, 2000);

        }, function(error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
             alertify.alertError(message);
            $scope.loading = false;
        });
    };
    
     /**
     * Set Trust my network
     */
//    $scope.setTrustMyNetwork = function(trustMyNetwork) {
//       $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
//                dataFactory.putApi('trust_my_network', null, {trustMyNetwork: trustMyNetwork}).then(function (response) {
//                    $scope.loading = false;
//                   dataService.showNotifier({message: $scope._t('success_updated')});
//                }, function (error) {
//                    $scope.loading = false;
//                    alertify.alertError($scope._t('error_update_data'));
//                    return;
//                });
//    };
   

    /**
     * Change password
     */
    $scope.changePassword = function(form,newPassword) {
        if (form.$invalid) {
            return;
        }
//       if (!newPassword || newPassword === '' || newPassword === $scope.cfg.default_credentials.password) {
//            alertify.alertError($scope._t('enter_valid_password'));
//            $scope.loading = false;
//            return;
//        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            password: newPassword

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            dataService.showNotifier({message: $scope._t('success_updated')});
             dataService.goBack();

        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices = response.data.data.devices;
        }, function(error) {});
    }
    ;

});
