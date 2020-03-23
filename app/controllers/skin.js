/**
 * @overview Controllers that handle all Skins actions.
 * @author Martin Vach
 */

/**
 * This is the Skin root controller
 * @class SkinBaseController
 *
 */
myAppController.controller('SkinBaseController', function ($scope, $q, $timeout, $window, cfg, dataFactory, dataService, _) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            active: cfg.skin.active,
            show: true
        },
        online: {
            connect: {
                status: false,
                icon: 'fa-globe fa-spin'
            },
            alert: {message: false, status: 'is-hidden', icon: false},
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
            dataFactory.getApi('skins', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            // console.log(response)
            var localSkins = response[0];
            $scope.loading = false;
            // Error message
            if (localSkins.state === 'rejected' && $scope.routeMatch('/customize/skinslocal')) {
                $scope.skins.local.show = false;
                angular.extend(cfg.route.alert, {message: $scope._t('failed_to_load_skins')});
                return;
            }
            // Success - local skins
            if (localSkins.state === 'fulfilled') {
                $scope.skins.local.all = dataService.getLocalSkins(localSkins.value.data.data).indexBy('name').value();
                $scope.loadOnlineSkins();
            }

        });

    };
    $scope.allSettled();

    /**
     * Load online skins
     */
    $scope.loadOnlineSkins = function () {
        dataFactory.getRemoteData(cfg.online_skin_url).then(function (response) {
            $scope.skins.online.alert = false;
            $scope.skins.online.connect = {
                status: true,
                icon: 'fa-globe'
            };
            setOnlineSkins(response.data.data)
        }, function (error) {
            if(error.status === 0){
                $scope.skins.online.connect = {
                    status: false,
                    icon: 'fa-exclamation-triangle text-danger'
                };
                 angular.extend(cfg.route.alert, {message: $scope._t('no_internet_connection',{__sec__: (cfg.pending_remote_limit/1000)}),icon: 'fa-wifi text-danger'});

            }else{
              angular.extend(cfg.route.alert, {message: $scope._t('failed_to_load_skins')});
            }
        }).finally(function(){
            $scope.loading = false;
        });
    };

    /**
     * Update skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.updateSkin = function (skin) {
        if(!skin){
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.putApi('skins_update', skin.name, skin).then(function (response) {
            dataService.showNotifier({message: $scope._t('skin_update_successful')});
            $timeout(function () {
                // Reload the whole page when an updated skin is active
                 if($scope.skins.local.active === skin.name){
                      $scope.loading = {status: 'loading-spin', icon: '--', message: $scope._t('reloading_page')};
                       //dataService.showNotifier({message: $scope._t('reloading_page')});
                        alertify.dismissAll();
                        $window.location.reload();
                 }else{// Otherwise reload  nly controller data
                     $scope.reloadData();
                 }
               
            }, 2000);
        }, function (error) {
            var langkey = (error.data.error ? error.data.error : 'error_file_download');
            alertify.alertError($scope._t(langkey));
        }).finally(function(){
             $scope.loading = false;
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
    };
});

/**
 * This controller handles local skins actions.
 * @class SkinLocalController
 *
 */
myAppController.controller('SkinLocalController', function ($scope, $window, $cookies, $timeout, dataFactory, dataService) {
    /**
     * Activate skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.activateSkin = function (skin) {
        //$scope.user.skin = skin.name;
        dataFactory.putApi('skins', skin.name, {active: true}).then(function (response) {
            dataService.showNotifier({message: $scope._t('skin_activate_successful')});
            $cookies.skin = skin.name;
            $timeout(function () {
                $scope.loading = {status: 'loading-spin', icon: '--', message: $scope._t('reloading_page')};
                alertify.dismissAll();
                $window.location.reload();
            }, 2000);
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('failed_to_activate_skin'));
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
                dataService.showNotifier({message: $scope._t('skin_delete_successful')});

                //$route.reload();
            }, function (error) {
                $scope.loading = false;
                var langkey = (error.data.error ? error.data.error : 'error_delete_data');
                alertify.alertError($scope._t(langkey));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
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
        skin.active = false;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.postApi('skins_install', skin).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('skin_installation_successful')});
            if ($scope.skins.online.all[skin.name]) {
                $scope.skins.online.all[skin.name].status = 'equal';
            }
        }, function (error) {
            $scope.loading = false;
            var langkey = (error.data.error ? error.data.error : 'error_file_download');
            alertify.alertError($scope._t(langkey));
        });
    };

});

/**
 * This controller handles reset skin proccess.
 * @class SkinOnlineController
 *
 */
myAppController.controller('SkinToDefaultController', function ($scope, $cookies, dataFactory, dataService) {
    /**
     * Download skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.resetToDefault = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('skins_reset', null, true).then(function (response) {
            dataFactory.getApi('logout').then(function (response) {
                delete $cookies['skin'];
                dataService.logOut();
            });
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_update_data'));
        });
    };
    $scope.resetToDefault();

});