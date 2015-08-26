/**
 * Application My Access controller
 * @author Martin Vach
 */

/**
 * My Access
 */
myAppController.controller('MyAccessController', function($scope, $window, $location,$cookies,dataFactory, dataService, myCache) {
    $scope.id = $scope.user.id;
    $scope.devices = {};
    $scope.input = {
        id: 0,
        name: '',
        active: true,
        description: '',
        //positions: [],
        password: '',
        lang: 'en',
        color: '',
        hide_all_device_events: false,
        hide_system_events: false,
        hide_single_device_events: [],
        interval: 2000

    };
    $scope.newPassword = null;

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            loadDevices();
            $scope.input = response.data.data;
            dataService.updateTimeTick();
        }, function(error) {
            $scope.input = false;
            $scope.loading = false;
            $location.path('/error/' + error.status);
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    }

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
    $scope.store = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }

            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            $cookies.lang = input.lang;
            myCache.remove('profiles');
            dataService.setUser(data);
            $window.location.reload();
            $window.history.back();
            //$route.reload();

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Change password
     */
    $scope.changePassword = function(newPassword) {
        if (!newPassword || newPassword == '') {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            password: newPassword

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            $window.history.back();

        }, function(error) {
            alert($scope._t('error_update_data'));
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
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

});