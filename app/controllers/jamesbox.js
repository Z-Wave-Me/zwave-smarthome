/**
 * @overview Controllers that handle the JamesBox actions.
 * @author Martin Vach
 */

/**
 * Load required http requests an update JamesBox record in the database.
 * @class JbUpdateController
 */
myAppController.controller('JbUpdateController', function ($scope, $q, $location, cfg, dataFactory, _) {
    $scope.jamesbox = {
        show: false,
        rule_id: '',
        uuid: '',
        version: '',
        versionNew: ''
    };
    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZwaveApiData()
        ];

        $q.allSettled(promises).then(function (response) {
            var zwave = response[0];
            $scope.loading = false;
            // Error message
            if (zwave.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
            }

            // Success - zwave controller
            if (zwave.state === 'fulfilled') {
                $scope.jamesbox.uuid = zwave.value.controller.data.uuid.value;
                $scope.jamesbox.version = zwave.value.controller.data.softwareRevisionVersion.value;
                $scope.jamesBoxRequest();
            }
        });
    };
    $scope.allSettled();

    /**
     * Load JamesBox data
     */
    $scope.jamesBoxRequest = function () {
        $scope.loading = false;
        dataFactory.postToRemote(cfg.api_remote['jamesbox_request'], $scope.jamesbox).then(function (response) {
            if (!_.isEmpty(response.data)) {
                $scope.jamesbox.versionNew = response.data.firmware_version;
                $scope.jamesbox.rule_id = response.data.rule_id;
                $scope.jamesbox.show = true; 
            }else{
               alertify.alertError($scope._t('no_update_available'));
            }
        }, function (error) { });
    }
    ;

   

    /**
     * Update JamesBox record
     */
    $scope.firmwareUpdate = function () {
        var input = {
            uuid: $scope.jamesbox.uuid,
            rule_id: $scope.jamesbox.rule_id
        };
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postToRemote(cfg.api_remote['jamesbox_update'], input).then(function (response) {
            $scope.loading = false;
            alertify.alertWarning($scope._t('jamesbox_autoupgrade', {__newfw__: $scope.jamesbox.versionNew}))
                    .set('onok', function (closeEvent) {
                        alertify.dismissAll();
                        $location.path("/dashboard");
                    });
        }, function (error) {
            var message = $scope._t('error_update_data');
            if(error.status === 409){
                message = $scope._t('jamesbox_update_exists');
            }
            alertify.alertError($scope._t(message));
            $scope.loading = false;
        });
    };

});