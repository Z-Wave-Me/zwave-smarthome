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
        ['ethernet', ['wifi_ethernet', 'fa-network-wired']],
        ['wifi', ['wifi_wifi', 'fa-wifi']],
        ['mobile', ['wifi_mobile', 'fa-signal']],
        ['error', ['', 'fa-warning']]
    ]);
    $scope.currentConnect = null;
    $scope.connectionStatus = {}
    $scope.selectedConnect = null;
    $scope.connecting = {
        data: null,
        progress: false
    }
    $scope.loadingWiFilist = true;

    $scope.wifiSignalIcon = function (signal) {
        return 'fa-wifi' + (signal > 70 ? '' : (signal > 30 ? '-2' : '-1'));
    }
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
        if (connectionDict.has(connect)) {
            return connectionDict.get(connect);
        }
        return connectionDict.get('error');
    }
    /**
     * Load all nets
     */
    $scope.currentConnectStatus = function (){
        if ($scope.connecting.progress || $scope.loadingWiFilist) return 'fas fa-spinner fa-pulse';
        else if ($scope.currentConnect && $scope.currentConnect.signal) return 'fad ' + $scope.wifiSignalIcon($scope.currentConnect.signal);
        else return 'fad fa-wifi-slash';
    }
    $scope.loadNets = function () {
        // $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('wifi_cli', null, true).then(function (response) {
            $scope.wifiNets.all = response.data.data;
            if ($scope.wifiNets.all.length !== 0) {
                $scope.selectedConnect = $scope.wifiNets.all[0];
                $scope.currentConnect = $scope.wifiNets.all.find(net => net.saved);
                $scope.connecting.progress = false;
            }
        }, function (error) {
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        }).then(() => $scope.loadingWiFilist = false);
    };
    $scope.loadNets();
    let updateList = $interval($scope.loadNets, 30_000);

    $scope.tryConnect = function (connect, password) {
        $scope.selectedConnect = connect;
        $scope.connecting.progress = true;
        dataFactory.postApi('wifi_cli', {
            ...connect,
            'password': password
        }).then(function (response) {
            $scope.connecting.data = response.data;
        }, function (error) {
            angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        }).then(setTimeout( () => {
                // $scope.connecting.response = !!$scope.currentConnect;
                $scope.loadNets();
            }, 1000)
        );
    }
    $scope.disconnect = function () {
        dataFactory.postApi('wifi_cli', {
            'essid': '',
            'security': '',
            'encryption': '',
            'password': ''
        })
        $scope.currentConnect = null;
    }
    $scope.$on('$destroy', function () {
        $interval.cancel(updateList);
        $interval.cancel(updateStatus);
    });

});

myAppController.controller('ManagementWiFiSelectController', function ($scope, $cookies, dataFactory, dataService, myCache, cfg) {
    $scope.enteringPassword = false;
    $scope.wifiPassword = '';
    $scope.showPassword = false;
    $scope.inputType = 'password';
    /**
     * Connect new Net
     */
    $scope.connectWiFi = function () {
        if ($scope.selectedConnect.security !== 'NONE') {
            $scope.enteringPassword = true;
        } else {
            $scope.tryConnect($scope.selectedConnect);
        }
    }
    /**
     * Requesting password
     */

    $scope.passwordRequest = function () {
        $scope.enteringPassword = false;
        $scope.tryConnect($scope.selectedConnect, $scope.wifiPassword);
        $scope.wifiPassword = '';
    }

    $scope.cancelConnection = function () {
        $scope.enteringPassword = false;
    }
    $scope.selectWiFi = function (wifi) {
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
