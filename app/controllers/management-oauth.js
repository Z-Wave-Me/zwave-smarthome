/**
 * @overview Controllers that handle OAuth2 grant page
 * @author Alexander Avaliani and Serguei Poltorak
 */
/**
 * The controller that renders and handles permissions from user.
 * @class ManagementUserOauthController
 */
myAppController.controller('ManagementUserOauthController', function ($scope, $routeParams, $filter, $q, dataFactory, dataService, myCache, $location) {
    $scope.rooms = {};
    $scope.devices = [];
    $scope.authTokens = [];
    $scope.show = true;
    $scope.callback_url = $location.search().redirect_uri;
    $scope.timestamp = new Date().getTime();
    $scope.input = {
        "role": 2,
        "login": $scope.callback_url + $scope.timestamp,
        "name": $scope.callback_url + $scope.timestamp,
        "lang": "en",
        "email":"",
        "rooms": [],
        "devices": [],
    };
    $scope.state = $location.search().state
    $scope.auth_code = {};
    /**
     * Load all promises
     */
    $scope.allSettledUserId = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices')
        ];

        $q.allSettled(promises).then(function (response) {
            var locations = response[0];
            var devices = response[1];
            $scope.loading = false;
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms = dataService.getRooms(locations.value.data.data)
                    .reject(function (v) {
                        return (v.id === 0);

                    })
                    .value();
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.devices = devices.value.data.data.devices;
            }
        });
    };
    $scope.allSettledUserId();

    /**
     * Assign room to list
     */
    $scope.assignRoom = function (assign) {
        $scope.input.rooms.push(assign);
    };

    /**
     * Remove room from the list
     */
    $scope.removeRoom = function (roomId) {
        var oldList = $scope.input.rooms;
        $scope.input.rooms = [];
        angular.forEach(oldList, function (v, k) {
            if (v != roomId) {
                $scope.input.rooms.push(v);
            }
        });
        return;
    };

    /**
     * Assign device to list
     */
    $scope.assignDevice = function (assign) {
        $scope.input.devices.push(assign);
    };

    /**
     * Remove device from the list
     */
    $scope.removeDevice = function (deviceId) {
        var oldList = $scope.input.devices;
        $scope.input.devices = [];
        angular.forEach(oldList, function (v, k) {
            if (v != deviceId) {
                $scope.input.devices.push(v);
            }
        });
        return;
    };

    /**
     * Redirects to Oauth2 server and gets authorization token 
     */
    $scope.redirToClient = function() {
        window.location = $scope.callback_url + '?code=' + $scope.auth_code + '&state=' + $scope.state;
    };

    /**
     * Create
     */
    $scope.store = function (form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        client_credentials = {
            'client_id': $location.search().client_id,
            'redirect_uri': $location.search().redirect_uri,
            'response_type': $location.search().response_type,
        } 
        input = Object.assign(input, client_credentials)
        dataFactory.storeApi('oauth2', '', input).then(function (response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            $scope.auth_code = response.data.data.auth_code
            console.log($scope.oauth_response)
            if (id) {
                myCache.remove('oauth2');
                $scope.reloadData();
            }
            $scope.loading = false;
            $scope.show = false;  
        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409 || error.status == 405 || error.status == 406) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
            alertify.alertError(message);
            $scope.loading = false;
        });

    };


});

