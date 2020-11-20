/**
 * @overview Controllers that handle wifi list and detail
 * @author Aleksei Itckovich
 */
/**
 * The controller that renders the list of wifi.
 * @class ManagementWiFiController
 */
myAppController.controller('ManagementWiFiController', function ($scope, $cookies, $interval, dataFactory, dataService, myCache, cfg) {
    $scope.wifiNets = {
        all: [],
        orderBy: ($cookies.usersOrderBy ? $cookies.usersOrderBy : 'titleASC')
    };
    const connectionDict = new Map([
            ['ethernet', ['wifi_ethernet', 'fa-network-wired' ]],
            ['wifi', ['wifi_wifi', 'fa-wifi' ]],
            ['mobile', ['wifi_mobile','fa-mobile']],
            ['error',['', 'fa-warning']]
        ]);
    $scope.currentConnect = {
        'essid': 'disconnected'
    };
    $scope.connectionStatus = {}
    // "currentConnection": "wifi", // <-- зелёным
    // "availableConnections": [
    //     "wifi" ,
    //     "mobile"// <-- чёрным
    // ],
    // "possibleConnections": [
    //     "ethernet",                // <-- \
    //     "wifi",                    //     > -- серым
    //     "mobile"                  // <-- /
    // ]
    $scope.selectedConnect = null;
    $scope.connecting = {
        data: null,
        progress: false
    }
    $scope.loadingWiFilist = true;

    /**
     * Load current wifi connection status
     */
    $scope.loadConnectionStatus = function () {
        dataFactory.getApi('wifi_cli_connection_type', null, true).then(function (response) {
            $scope.connectionStatus = response.data.data;
        }, function (error) {
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        });
    }
    $scope.loadConnectionStatus();
    let updateStatus = $interval($scope.loadConnectionStatus, 10_000);
    $scope.colorizeConnections = function (connectionType) {
        if (connectionType === $scope.connectionStatus.currentConnection) {
            return 'current-connection';
        }
        if ($scope.connectionStatus.availableConnections.indexOf(connectionType) !== -1) {
            return 'available-connections';
        }
        return 'possible-connections';
    }
    $scope.connectToStr = function (connect) {
        if (connectionDict.has(connect)){
            return connectionDict.get(connect);
        }
        return connectionDict.get('error');
    }
    /**
     * Load all nets
     */
    $scope.loadNets = function () {
        // $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('wifi_cli', null, true).then(function (response) {
            $scope.wifiNets.all = response.data.data;
            // $scope.loading = false;
            if ($scope.wifiNets.all.length !== 0) {
                $scope.selectedConnect = $scope.wifiNets.all[0];
            }
        }, function (error) {
            // $scope.loading = false;
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        }).then(() => $scope.loadingWiFilist = false);
        // $scope.wifiNets.all = {}
    };
    $scope.loadNets();
    let updateList = $interval($scope.loadNets, 30_000);

    const delay = t => new Promise(resolve => setTimeout(resolve, t));
    const connect_mock = () => delay(4000)
        .then(() => {
            $scope.connecting.data = {};
            $scope.connecting.data.error = null;
            console.log($scope.connecting);
        })
        .then(() => delay(4000))
        .then(() => {
            $scope.connecting.data.error = 'error';
        })
        .then(() => delay(4000))
        .then(() => {
            console.log($scope.connecting);
            $scope.connecting.progress = false;
            $scope.connecting.data = {
                code: 200,
                data: {},
                error: null,
                message: "200 OK"
            }
        });

    $scope.tryConnect = function (connect, password) {

        $scope.connecting.progress = true;
        connect_mock();
        // later
        // dataFactory.postApi('wifi_cli', {
        //     ...connect,
        //     'password': password
        // }).then(function (response) {
        //     $scope.connecting.data = response.data;
        // }, function (error) {
        //     // $scope.loading = false;
        //     angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        // }).then(() => setTimeout(() => {
        //         $scope.connecting.progress = false;
        //         $scope.connecting.data = {};
        // }, 2000));
    }
    $scope.disconnect = function () {
        dataFactory.postApi('wifi_cli', {
                'essid' : ''
            }).then(function (response) {
               $scope.currentConnect = {
                   'essid': 'disconnected'
               }
                // $scope.connecting.data = response.data;
            }, function (error) {
            // $scope.loading = false;
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        });
    }
    $scope.$on('$destroy', function() {
        $interval.cancel(updateList);
        $interval.cancel(updateStatus);
    });

})
;

myAppController.controller('ManagementWiFiSelectController', function ($scope, $cookies, dataFactory, dataService, myCache, cfg) {
    $scope.enteringPassord = false;
    $scope.wifiPassword = '';
    $scope.showPassword = false;
    $scope.inputType = 'password';
    /**
     * Connect new Net
     */
    $scope.connectWiFi = function () {
        console.log($scope.selectedConnect, $scope.selectedConnect.security === 'NONE');
        if ($scope.selectedConnect.security !== 'NONE') {
            $scope.enteringPassord = true;
        } else {
            $scope.tryConnect($scope.selectedConnect);
        }
    }
    /**
     * Requesting password
     */

    $scope.passwordRequest = function () {
        console.log($scope.wifiPassword);
        $scope.enteringPassord = false;
        $scope.tryConnect($scope.selectedConnect, $scope.wifiPassword);
    }

    $scope.cancelConnection = function () {
        $scope.enteringPassord = false;
    }
    $scope.selectWiFi = function (wifi) {
        $scope.wifiPassword = '';
        $scope.selectedConnect = wifi;
    }
    $scope.showPass = function () {
        $scope.showPassword = !$scope.showPassword;
        if ($scope.showPassword) {
            $scope.inputType = 'text';
        } else {
            $scope.inputType = 'password';
        }
    }
});