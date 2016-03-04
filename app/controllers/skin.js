/**
 * Application skins controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('SkinBaseController', function ($scope, $q, $cookies, dataFactory, _) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            active: $scope.cfg.skin.active,
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
//    $scope.getActiveSkin = function () {
//        if ($cookies.skin && $cookies.skin !== 'default') {
//            $scope.skins.local.active = $cookies.skin;
//        }
//    };
//    $scope.getActiveSkin();


    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApiLocal('skins.json'),
            dataFactory.getRemoteData($scope.cfg.online_skin_url)
        ];

        $q.allSettled(promises).then(function (response) {
            // console.log(response)
            var localSkins = response[0];
            var onlineSkins = response[1];
            // Error message
            if (localSkins.state === 'rejected' || onlineSkins.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
            }
            // Success - local skins
            if (localSkins.state === 'fulfilled') {
                setLocalSkins(localSkins.value.data.data);
            }

            // Success - online skins
            if (onlineSkins.state === 'fulfilled') {
                setOnlineSkins(onlineSkins.value.data.data);
            }
            
            $scope.loading = false;
           
        });

    };
    $scope.allSettled();

    /// --- Private functions --- ///

    /**
     * Set local skins
     */
    var setLocalSkins = function (response) {
        $scope.skins.local.all = _.chain(response)
                .flatten()
                .filter(function (v) {
                    var iconPath = v.name !== 'default' ? $scope.cfg.skin.path + v.name  : $scope.cfg.img.skin_screenshot;
                    v.icon = (!v.icon ? 'storage/img/placeholder-img.png' : iconPath + '/screenshot.png');
                    return v;
                })
                .indexBy('name')
                .value();
        ;
        $scope.skins.local.show = true;
    };

    /**
     * Set online skins
     */
    var setOnlineSkins = function (response) {
        $scope.skins.online.all = _.chain(response)
                .flatten()
                .filter(function (v) {
                    angular.extend(v, {download: $scope.cfg.online_skin_storage + v.file});
                    v.icon = (v.icon == '' ? 'storage/img/placeholder-img.png' : $scope.cfg.online_skin_storage + v.icon);
                    return v;
                })
                .indexBy('name')
                .value();
        ;
        $scope.skins.online.show = true;
    };

});

/**
 * Skin local controller
 */
myAppController.controller('SkinLocalController', function ($scope, $window, $route, $timeout, $cookies, dataFactory, dataService) {
    $scope.activeTab = 'local';

    /**
     * Activate skin
     */
    $scope.activateSkin = function (skin) {
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};

        dataFactory.getApiLocal('skins-online.json').then(function (response) {
            $cookies.skin = skin.name;
            dataService.showNotifier({message: $scope._t('success_updated')});
            //return;
            $timeout(function () {
                $scope.loading = {status: 'loading-spin', icon: '--', message: $scope._t('reloading_page')};
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
    $scope.removeSkin = function (skin, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.getApiLocal('skins-online.json').then(function (response) {
                delete $scope.skins.local.all[skin.name];
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});

                //$route.reload();
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
    $scope.downloadSkin = function (skin) {
        console.log(skin)
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
        console.log(skin)
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