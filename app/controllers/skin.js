/**
 * @overview Controllers that handle all Skins actions.
 * @author Martin Vach
 */

/**
 * This is the Skin root controller
 * @class SkinBaseController
 *
 */
myAppController.controller('SkinBaseController', function ($scope, $q, $timeout, dataFactory, dataService, _) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            active: $scope.cfg.skin.active,
            show: true
        },
        online: {
            all: {},
            find: {},
            ids: {},
            show: true
        },
        installed: {
            all: {}
        }
    };

    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('skins'),
            dataFactory.getRemoteData($scope.cfg.online_skin_url)
        ];

        $q.allSettled(promises).then(function (response) {
            // console.log(response)
            var localSkins = response[0];
            var onlineSkins = response[1];
            $scope.loading = false;
            // Error message
            if (localSkins.state === 'rejected' && $scope.routeMatch('/customize/skinslocal')) {
                alertify.alertError($scope._t('error_load_data'));
                $scope.skins.local.show = false;
                return;
            }
            if (onlineSkins.state === 'rejected' && $scope.routeMatch('/customize/skinsonline')) {
                alertify.alertError($scope._t('error_load_data'));
                 $scope.skins.online.show = false;
                return;
            }
            // Success - local skins
            if (localSkins.state === 'fulfilled') {
                $scope.skins.local.all = dataService.getLocalSkins(localSkins.value.data.data).indexBy('name').value();
            }

            // Success - online skins
            if (onlineSkins.state === 'fulfilled') {
                setOnlineSkins(onlineSkins.value.data.data);
            }

        });

    };
    $scope.allSettled();



    /**
     * Upgrade skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.upgradeSkin = function (skin) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.putApi('skins','/' + skin.name, skin).then(function (response) {
            $timeout(function () {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('success_file_download')});
            }, 2000);
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_file_download'));
        });
    };

    /// --- Private functions --- ///

    /**
     * Set online skins $scope
     * @param {object} response
     * @returns {undefined}
     */
    function setOnlineSkins(response) {
        $scope.skins.online.all = _.chain(response)
                .flatten()
                .filter(function (v) {
                    // Set status
                    v.status = (_.isEmpty($scope.skins.local.all) ? 'error' : 'download');
                    // Compare local and online versions
                    if ($scope.skins.local.all[v.name]) {
                        v.status = dataService.compareVersions($scope.skins.local.all[v.name].version, v.version);
                    }
                    return v;
                })
                .indexBy('name')
                .value();
        ;
       
    }
    ;

});

/**
 * This controller handles local skins actions.
 * @class SkinLocalController
 *
 */
myAppController.controller('SkinLocalController', function ($scope, $window, $route, $timeout, $cookies, dataFactory, dataService) {
    /**
     * Activate skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.activateSkin = function (skin) {
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        
        $scope.user.skin = skin.name;

        dataFactory.putApi('profiles', $scope.user.id, $scope.user).then(function (response) {
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
     * @param {object} skin
     * @param {string} message
     * @returns {undefined}
     */
    $scope.removeSkin = function (skin, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('skins', skin.name).then(function (response) {
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
 * This controller handles online skins actions.
 * @class SkinOnlineController
 *
 */
myAppController.controller('SkinOnlineController', function ($scope, $timeout, dataFactory, dataService) {
    /**
     * Download skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.downloadSkin = function (skin) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.postApi('skins', skin).then(function (response) {
            $timeout(function () {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('success_file_download')});
            }, 2000);
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_file_download'));
        });
    };

});