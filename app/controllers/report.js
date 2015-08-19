/**
 * Application Bug Report controller
 * @author Martin Vach
 */

/**
 * Report controller
 */
myAppController.controller('ReportController', function($scope, $window, dataFactory, dataService) {
    $scope.ZwaveApiData = false;
    $scope.remoteAccess = false;
    $scope.input = {
        browser_agent: '',
        browser_version: '',
        browser_info: '',
        shui_version: '',
        zwave_vesion: '',
        controller_info: '',
        remote_id: '',
        remote_activated: 0,
        remote_support_activated: 0,
        zwave_binding: 0,
        email: null,
        content: null
    };

    /**
     * Load ZwaveApiData
     */
    $scope.loadZwaveApiData = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            $scope.ZwaveApiData = ZWaveAPIData;
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadZwaveApiData();
    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function() {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        dataFactory.getApi('instances', '/RemoteAccess').then(function(response) {
            $scope.remoteAccess = response.data.data[0];
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadRemoteAccess();

    /**
     * Create/Update an item
     */
    $scope.store = function(form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('sending')};
        if ($scope.ZwaveApiData) {
            input.zwave_binding = 1;
            input.zwave_vesion = $scope.ZwaveApiData.controller.data.softwareRevisionVersion.value;
            input.controller_info = JSON.stringify($scope.ZwaveApiData.controller.data);
        }
        if (Object.keys($scope.remoteAccess).length > 0) {
            input.remote_activated = $scope.remoteAccess.params.actStatus ? 1 : 0;
            input.remote_support_activated = $scope.remoteAccess.params.sshStatus ? 1 : 0;
            input.remote_id = $scope.remoteAccess.params.userId;

        }
        input.browser_agent = $window.navigator.appCodeName;
        input.browser_version = $window.navigator.appVersion;
        input.browser_info = 'PLATFORM: ' + $window.navigator.platform + '\nUSER-AGENT: ' + $window.navigator.userAgent;
        input.shui_version = $scope.cfg.app_version;
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postReport(input).then(function(response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_send_report') + ' ' + input.email};
            $window.location.reload();
//            $scope.form.$setPristine();
//           input.content = null;
//            input.email = null;


        }, function(error) {
            alert($scope._t('error_send_report'));
            $scope.loading = false;
        });

    };

});