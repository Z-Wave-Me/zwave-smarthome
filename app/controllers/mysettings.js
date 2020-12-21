/**
 * @overview Handles user actions.
 * @author Martin Vach
 */

/**
 * The controller that renders and handles user data.
 * @class MySettingsController
 */
myAppController.controller('MySettingsController', function($scope, $window, $cookies,$timeout,$filter,$q,cfg,dataFactory, dataService, myCache) {
    $scope.id = $scope.user.id;
    $scope.authTokens = [];
    $scope.devices = {};
    $scope.input = false;
    $scope.newPassword = null;
    $scope.trustMyNetwork = true;
    $scope.lastEmail = "";

    $scope.currentZWayAuthToken  = $cookies.ZWAYSession;
    $scope.currentFullAuthToken = ($cookies.ZBW_SESSID || "") + "/" + $cookies.ZWAYSession;
    $scope.currentFullAuthTokenGlobal = !!$cookies.ZBW_SESSID;
    
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
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Success - profile
            if (profile.state === 'fulfilled') {
                $scope.input = profile.value.data.data;
                $scope.lastEmail = profile.value.data.data.email;
                $scope.authTokens = profile.value.data.data.authTokens;
                $scope.authTokens.forEach(function(token) {
                    token.date_str = (new Date(token.date)).toLocaleString();
                    token.lastSeen_str = (new Date(token.lastSeen)).toLocaleString();
                    token.expire_str = (token.expire === 0 || typeof token.expire == "undefined") ? '-' : (new Date(token.expire)).toLocaleString();
                });
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.devices = devices.value.data.data.devices;
            }
        });
    };
    $scope.allSettled();
    /**
     * Assign device to the list
     */
    $scope.assignDevice = function(assign) {
        $scope.input.hide_single_device_events.push(assign);
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
    };

    /**
     *  Add Qrcode
     */
    $scope.addQRCode = function() {
        alertify.prompt($scope._t('verify_qrcode'),$scope._t('lb_password'), function(evt, pass) {
            console.log("Password", pass)
            var data = {
                "password": pass
            };
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            dataFactory.putApi('profiles', 'qrcode/'+$scope.input.id, data).then(function(response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('success_updated')});
                $timeout(function () {
                    $window.location.reload();
                }, 2000);
            }, function(error) {
                $scope.loading = false;
                console.log(error);
                if(error.data.error == "wrong_password") {
                    alertify.alertError($scope._t('wrong_password'));
                } else {
                    alertify.alertError($scope._t('error_update_data'));
                }
            });
        }).set('type', 'password');
    }

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices = response.data.data.devices;
        }, function(error) {});
    }
});
