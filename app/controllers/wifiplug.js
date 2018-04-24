/**
 * @overview Controllers that handle all Wifi Plug actions – manage and add wifi plugs.
 * @author Karsten Reichel
 */

/**
 * The controller that renders a list of the wifi plugs.
 * @class WifiPlugAddController
 */
myAppController.controller('WifiPlugAddController', function ($scope, dataFactory, dataService, cfg,_) {
    $scope.wifiplugDevices = [];
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load ip wifi plugs
     */
    $scope.loadData = function () {
        dataFactory.getApi('modules').then(function (response) {
            $scope.wifiplugDevices = _.filter(response.data.data, function (item) {
                var isHidden = false;
                if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                    if ($scope.user.role !== 1) {
                        isHidden = true;
                    } else {
                        isHidden = ($scope.user.expert_view ? false : true);
                    }

                }
                if (item.category !== 'wifiplug') {
                    isHidden = true;
                }

                if (!isHidden) {
                    return item;
                }
            });
            if( _.size($scope.wifiplugDevices) < 1){
                   angular.extend(cfg.route.alert, {message: $scope._t('no_wifiplugs')});
                }
        }, function (error) {
          angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        });
    };
    $scope.loadData();
});

/**
 * The controller that handles wifi plugs manage actions .
 * @class WifiPlugManageController
 */
myAppController.controller('WifiPlugManageController', function ($scope, $q, $location,dataFactory, dataService, myCache, cfg,_) {
    $scope.instances = [];
    $scope.modules = {
        mediaUrl: $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/',
        collection: [],
        ids: [],
        imgs: []
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules'),
            dataFactory.getApi('instances')
        ];

        $q.allSettled(promises).then(function (response) {
            var modules = response[0];
            var instances = response[1];
            $scope.loading = false;
            // Error message
            if (instances.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Success - modules
            if (modules.state === 'fulfilled') {
                setModules(modules.value.data.data);
            }
            // Success - instances
            if (instances.state === 'fulfilled') {
                setInstances(instances.value.data.data);
                if( _.size($scope.instances) < 1){
                    $location.path('/wifiplug/add');
                }
            }
        });
    };
    $scope.allSettled();

    /**
     * Ictivate instance
     */
    $scope.activateInstance = function (input, activeStatus) {
        input.active = activeStatus;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.loading = false;
                myCache.remove('instances');
                myCache.remove('instances/' + input.moduleId);
                myCache.remove('devices');
                $scope.allSettled();

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function (input, message) {
        alertify.confirm(message, function () {
            dataFactory.deleteApi('instances', input.id).then(function (response) {
                myCache.remove('instances');
                myCache.remove('devices');
                $scope.allSettled();
            }, function (error) {
                alertify.alertError($scope._t('error_delete_data'));
            });

        });
    };

    /// --- Private functions --- ///

    /**
     * Set modules
     */
    function setModules(data) {
        _.filter(data, function (item) {
            var isHidden = false;
            if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                if ($scope.user.role !== 1) {
                    isHidden = true;
                } else {
                    isHidden = ($scope.user.expert_view ? false : true);
                }

            }
            if (item.category !== 'wifiplug') {
                isHidden = true;
            }

            if (!isHidden) {
                $scope.modules.ids.push(item.id);
                $scope.modules.imgs[item.id] = item.icon;
                return item;
            }
        });
    }
    ;

    /**
     * Set instances
     */
    function setInstances(data) {
        $scope.instances = _.reject(data, function (v) {
            if ($scope.modules.ids.indexOf(v.moduleId) > -1) {
                return false;
            }
            return true;
        });
    };

});
