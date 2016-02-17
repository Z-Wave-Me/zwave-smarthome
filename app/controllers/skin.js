/**
 * Application skins controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('SkinBaseController', function ($scope, $cookies,dataFactory, _) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            active: 'default',
            show: false
        },
        online: {
            all: {},
            find: {},
            ids: {},
            show: false
        },
        installed: {
            all: {}
        }
    };
    
    /**
     * Get active skin
     */
    $scope.getActiveSkin= function () {
        if($cookies.skin && $cookies.skin !== 'default'){
             $scope.skins.local = $cookies.skin;
        }
    };
    $scope.getActiveSkin();

    /**
     * Load local skins
     */
    $scope.loadLocalSkins = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApiLocal('skins.json').then(function (response) {
            $scope.loading = false;
            $scope.skins.local.all = _.chain(response.data.data)
                    .flatten()
                    .filter(function (v) {
                        v.icon = (!v.icon ? 'storage/img/placeholder-img.png' : v.icon );
                        return v;
                    })
                    .indexBy('name')
                    .value();
            ;
            $scope.skins.local.show = true;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadLocalSkins();
    
    /**
     * Load online skins
     */
    $scope.loadOnlineSkins = function () {
        dataFactory.getApiLocal('skins-online.json').then(function (response) {
            $scope.skins.online.all = _.chain(response.data.data)
                    .flatten()
                    .filter(function (v) {
                        v.icon = (v.icon == '' ? 'storage/img/placeholder-img.png' :'storage/skins/' + v.icon );
                        return v;
                    })
                    .indexBy('name')
                    .value();
            ;
            $scope.skins.online.show = true;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadOnlineSkins();

});

/**
 * Skin local controller
 */
myAppController.controller('SkinLocalController', function ($scope, $window, $route,$timeout,$cookies,dataFactory, dataService) {
    $scope.activeTab = 'local';
    
    /**
     * Activate skin
     */
    $scope.activateSkin = function (skin) {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        
        dataFactory.getApiLocal('skins-online.json').then(function (response) {
                $scope.loading = false;
                 $cookies.skin = skin.name;
                 dataService.showNotifier({message: $scope._t('success_updated')});
                 //return;
             $timeout(function () {
                  $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('reloading_page')};
                 alertify.dismissAll();
                $window.location.reload();
            }, 2000);
            $scope.loading = false;
        }, function (error) {
              $scope.loading = false;
            alertify.alertError($scope._t('error_update_data'));
        });
    };
    
    
    /**
     * Remove skin
     */
    $scope.removeSkin = function (skin,message) {
        alertify.confirm(message, function () {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
        dataFactory.getApiLocal('skins-online.json').then(function (response) {
                 dataService.showNotifier({message: $scope._t('delete_successful')});
                $route.reload();
        }, function (error) {
              $scope.loading = false;
            alertify.alertError($scope._t('error_delete_data'));
        });
        });
    };
});
/**
 * Skin online controller
 */
myAppController.controller('SkinOnlineController', function ($scope, dataFactory, dataService) {
    $scope.activeTab = 'online';
    
    /**
     * Download skin
     */
    $scope.downloadSkin = function (v) {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
         dataFactory.getApiLocal('skins-online.json').then(function (response) {
                $scope.loading = false;
                 dataService.showNotifier({message: $scope._t('success_file_download')});
        }, function (error) {
              $scope.loading = false;
            alertify.alertError($scope._t('error_file_download'));
        });
         
    };
    
    /**
     * Upgrade skin
     */
    $scope.upgradeSkin = function (skin) {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        
        dataFactory.getApiLocal('skins-online.json').then(function (response) {
                $scope.loading = false;
                 dataService.showNotifier({message: $scope._t('success_file_download')});
        }, function (error) {
              $scope.loading = false;
             alertify.alertError($scope._t('error_file_download'));
        });
    };
});