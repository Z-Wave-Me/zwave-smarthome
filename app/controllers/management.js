/**
 * @overview Controllers that handle management actions.
 * @author Martin Vach
 */

/**
 * The management base controller
 * @class ManagementController
 */
myAppController.controller('ManagementController', function ($scope, $interval, $q, $filter, cfg, dataFactory, dataService, myCache) {
    //Set elements to expand/collapse
    angular.copy({
        user: false,
        remote: false,
        licence: false,
        firmware: false,
        backup_restore: false,
        info: false,
        report: false,
        appstore: false
    }, $scope.expand);
    $scope.ZwaveApiData = false;
    $scope.controllerInfo = {
        uuid: null,
        remoteId: null,
        isZeroUuid: false,
        softwareRevisionVersion: null,
        softwareLatestVersion: null,
        capabillities: null,
        scratchId: null,
        capsLimited: false,
        manufacturerId: null
    };
    $scope.remoteAccess = false;
    $scope.handleLicense = {
        alert: {message: false, status: 'is-hidden', icon: false},
        error: true,
        show: false,
        disabled: false,
        replug: false
    };

    $scope.handleTimezone = {
        instance: {},
        show: false
    };

    $scope.builtInfo = false;

    $scope.zwaveDataInterval = null;
    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.zwaveDataInterval);
        angular.copy({}, $scope.expand);
    });

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZwaveApiData()
        ];
        if($scope.isInArray(['jb'],cfg.app_type)){
            promises.push(dataFactory.getApi('instances', '/ZMEOpenWRT'));
        }
        $q.allSettled(promises).then(function (response) {
            var zwave = response[0];
            var timezone = response[1];
            $scope.loading = false;
            // Success - api data
            if (zwave.state === 'fulfilled') {
                $scope.ZwaveApiData = zwave.value;
                setControllerInfo(zwave.value);
            }

            if(timezone){
                // Success - timezone
                if (timezone.state === 'fulfilled' && timezone.value.data.data[0].active === true) {
                    $scope.handleTimezone.show = true;
                    $scope.handleTimezone.instance = timezone.value.data.data[0];
                }
            }

        });
    };
    $scope.allSettled();

    /**
     * Load app built info
     */
    $scope.loadAppBuiltInfo = function() {
        dataFactory.getAppBuiltInfo().then(function(response) {
            $scope.builtInfo = response.data;
        }, function(error) {});
    };
    $scope.loadAppBuiltInfo();

    /// --- Private functions --- ///
    /**
     * Set controller info
     */
    function setControllerInfo(ZWaveAPIData) {
        var caps = function (arr) {
            var cap = '';
            if (angular.isArray(arr)) {
                cap += (arr[3] & 0x01 ? 'S' : 's');
                cap += (arr[3] & 0x02 ? 'L' : 'l');
                cap += (arr[3] & 0x04 ? 'M' : 'm');
            }
            return cap;

        };
        var nodeLimit = function (str) {
            return parseInt(str, 16) > 0x00 ? false : true;
        };
        $scope.controllerInfo.uuid = ZWaveAPIData.controller.data.uuid.value;
        $scope.controllerInfo.isZeroUuid = parseInt(ZWaveAPIData.controller.data.uuid.value, 16) === 0;
        $scope.controllerInfo.softwareRevisionVersion = ZWaveAPIData.controller.data.softwareRevisionVersion.value;
        $scope.controllerInfo.manufacturerId = ZWaveAPIData.controller.data.manufacturerId.value;
        $scope.controllerInfo.capsSubvendor = ((ZWaveAPIData.controller.data.caps.value[0] << 8) + ZWaveAPIData.controller.data.caps.value[1]);
        $scope.controllerInfo.capabillities = caps(ZWaveAPIData.controller.data.caps.value);
        $scope.controllerInfo.capsLimited = nodeLimit($filter('dec2hex')(ZWaveAPIData.controller.data.caps.value[2]).slice(-2));
        setLicenceScratchId($scope.controllerInfo);
        //console.log(ZWaveAPIData.controller.data.caps.value);
        //console.log('Limited: ', $scope.controllerInfo.capsLimited);
    };

    /**
     * Set licence ID
     * @param {object} controllerInfo
     * @returns {undefined}
     */
    function  setLicenceScratchId(controllerInfo) {
        dataFactory.getRemoteData($scope.cfg.get_licence_scratchid + '?uuid=' + controllerInfo.uuid).then(function (response) {
            if(response.data !== "") {
                $scope.controllerInfo.scratchId = response.data.scratch_id;
                $scope.handleLicense.error = false;
            } else {
                $scope.handleLicense.alert = {message: $scope._t('error_license_request'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
            }
            handleLicense($scope.controllerInfo);
        }, function (error) {
            handleLicense($scope.controllerInfo);
            $scope.handleLicense.alert = {message: $scope._t('error_license_request'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
            //alertify.alertError($scope._t('error_license_request'));
        });
    };

    /**
     * Show or hide licencese block
     * @param {object} controllerInfo
     * @returns {undefined}
     */
    function handleLicense(controllerInfo) {

        //Razberry/RaZ = 327
        //UZB/ZME = 277

        $scope.handleLicense.show = false;
        if($scope.controllerInfo.manufacturerId === 277) {
            // Hide license if
            // forbidden, mobile device, not uuid
            if ((cfg.license_forbidden.indexOf(cfg.app_type) > -1) || $scope.isMobile || !controllerInfo.uuid) {
                //console.log('Hide license if: forbidden, mobile device, not uuid')
                $scope.handleLicense.show = false;
                return;
            }

            // check if error (request failed)
            // controllerInfo.capsSubvendor === 0 ... no licence applied
            if (controllerInfo.capsSubvendor > 0 && $scope.handleLicense.error && !controllerInfo.scratchId && !controllerInfo.capsLimited) {
                $scope.handleLicense.show = true;
                return;
            }

            // Hide license if
            // Controller UUID = string and scratchId  is NOT found  and cap unlimited
            if (controllerInfo.capsSubvendor > 0 && !controllerInfo.scratchId && !controllerInfo.capsLimited) {
                //console.log('Hide license if: Controller UUID = string and scratchId  is NOT found  and cap unlimited');
                $scope.handleLicense.show = false;
                return;
            }

            // Show modal if
            // Controller UUID = string and scratchId  is NOT found  and cap limited
            if (!controllerInfo.scratchId && controllerInfo.capsLimited) {
                //console.log('Show modal if: Controller UUID = string and scratchId  is NOT found  and cap limited');
                alertify.alertWarning($scope._t('info_missing_licence'));
            }

            // Disable input and show unplug message
            if (controllerInfo.isZeroUuid) {
                //console.log('Disable input and show unplug message');
                $scope.handleLicense.disabled = true;
                $scope.handleLicense.replug = true;
            }
            $scope.handleLicense.show = true;
        }
    }

});


/**
 * The controller that renders postfix data.
 * @class ManagementPostfixController
 */
/*myAppController.controller('ManagementPostfixController', function ($scope, dataFactory, _) {
    $scope.postfix = {
        all: {}
    };
    /!**
     * Load postfix data
     *!/
    $scope.loadPostfix = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('postfix', null, true).then(function (response) {
            if (_.isEmpty(response.data)) {
                alertify.alertWarning($scope._t('no_data'));
            }
            $scope.loading = false;
            $scope.postfix.all = response.data;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));

        });
    };
    $scope.loadPostfix();

});*/
/**
 * The controller that renders info data.
 * @class ManagementInfoController
 */
/*myAppController.controller('ManagementInfoController', function ($scope, dataFactory, dataService) {

});*/
