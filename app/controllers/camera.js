/**
 * Application Camera controller
 * @author Martin Vach
 */

/**
 * Camera add controller
 */
myAppController.controller('CameraAddController', function($scope, dataFactory, dataService, _) {
    $scope.ipcameraDevices = [];
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load ip cameras
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('modules').then(function(response) {
            $scope.ipcameraDevices = _.filter(response.data.data, function(item) {
                var isHidden = false;
                if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                    if ($scope.user.role !== 1) {
                        isHidden = true;
                    } else {
                        isHidden = ($scope.user.expert_view ? false : true);
                    }

                }
                if (item.category !== 'surveillance') {
                    isHidden = true;
                }

                if (!isHidden) {
                    return item;
                }
            });
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();
});

/**
 * Camera manage controller
 */
myAppController.controller('CameraManageController', function($scope, $route,$window, dataFactory, dataService, myCache, _) {
    $scope.instances = [];
    $scope.modules = {
        mediaUrl: $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/',
        collection: [],
        ids: [],
        imgs: []
    };
    

    /**
     * Load local modules
     */
    $scope.loadModules = function() {
        dataFactory.getApi('modules').then(function(response) {
            var modulesFiltered = _.filter(response.data.data, function(item) {
                var isHidden = false;
                if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                    if ($scope.user.role !== 1) {
                        isHidden = true;
                    } else {
                        isHidden = ($scope.user.expert_view ? false : true);
                    }

                }
                if (item.category !== 'surveillance') {
                    isHidden = true;
                }

                if (!isHidden) {
                   $scope.modules.ids.push(item.id);
                   $scope.modules.imgs[item.id] = item.icon;
                   return item;
                }
            });
            $scope.modules.collection = modulesFiltered;
             $scope.loadInstances();
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
     $scope.loadModules();
     
     /**
     * Load instances
     */
    $scope.loadInstances = function() {
        dataFactory.getApi('instances').then(function(response) {
            $scope.instances = _.reject(response.data.data, function(v) {
                if ($scope.modules.ids.indexOf(v.moduleId) > -1) {
                   return false;
                }
                return true;
            });
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };
    
     /**
     * Ictivate instance
     */
    $scope.activateInstance = function(input, activeStatus) {
        input.active = activeStatus;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function(response) {
                $scope.loading = false;
                myCache.remove('instances');
                myCache.remove('instances/' + input.moduleId);
                myCache.remove('devices');
                //$route.reload();
                $scope.loadInstances();

            }, function(error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };
    
    /**
     * Delete instance
     */
    $scope.deleteInstance = function(target, input, message) {
         alertify.confirm(message, function() {
            dataFactory.deleteApi('instances', input.id).then(function(response) {
                $(target).fadeOut(500);
                myCache.remove('instances');
                myCache.remove('devices');
            }, function(error) {
                alertify.alertError($scope._t('error_delete_data'));
            });

       });
    };
   
});
