/**
 * @overview Controllers that handle the Online apps.
 * @author Martin Vach
 */

/**
 * The controller that handles all online APPs actions.
 * @class AppOnlineController
 */
myAppController.controller('AppOnlineController', function ($scope, $filter, $cookies, $window, $location, $routeParams, dataFactory, dataService, _) {
    $scope.dataHolder.onlineModules.filter = ($cookies.filterAppsOnline ? angular.fromJson($cookies.filterAppsOnline) : {});

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.dataHolder.onlineModules.autocomplete.results = dataService.autocomplete($scope.dataHolder.onlineModules.all, $scope.dataHolder.onlineModules.autocomplete);
        // Reset filter q if is input empty
        if ($scope.dataHolder.onlineModules.filter.q && $scope.dataHolder.onlineModules.autocomplete.term.length < 1) {
            $scope.setFilter();
        }
    }

    if ($routeParams['category']) {
        var filter = {category: $routeParams['category']};
        //console.log(filter);
        angular.extend($scope.dataHolder.onlineModules, {filter: filter});
        $cookies.filterAppsOnline = angular.toJson(filter);
        //$scope.setFilter({category:$routeParams['category']});

    }

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.onlineModules, {orderBy: key});
        $cookies.orderByAppsOnline = key;
        $scope.reloadData();
    };

    /**
     * Hide installed
     */
    $scope.hideInstalled = function (status) {
        status = $filter('toBool')(status);
        angular.extend($scope.dataHolder.onlineModules, {hideInstalled: status});
        $cookies.hideInstalledApps = status;
        $scope.reloadData();
    };

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        // Reset
        $scope.dataHolder.onlineModules.autocomplete.results = [];
        $scope.dataHolder.onlineModules.noSearch = false;

        // Is fiter value empty?
        var empty = (_.values(filter) == '');
       if (!filter || empty) {// Remove filter
            angular.extend($scope.dataHolder.onlineModules, {filter: {}});
            $cookies.filterAppsOnline = angular.toJson({});
           $scope.loadTokens();
            //$scope.reloadData();
        } else {
            angular.extend($scope.dataHolder.onlineModules, {filter: filter});
            $cookies.filterAppsOnline = angular.toJson(filter);
           $scope.loadTokens();
            //$scope.reloadData();
            if (!$scope.routeMatch('/apps/online/filter')) {
                //console.log('Redirect to /apps/online/filter')
                $location.path('/apps/online/filter');
            }
        }


    };


    /**
     * Install module
     */
    $scope.installModule = function (module) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + module.file
        };
        dataFactory.installOnlineModule(data, 'online_install').then(function (response) {
            dataFactory.postToRemote($scope.cfg.online_module_installed_url, {id: module.id});
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t(response.data.data.key)});
            window.location = '#/module/post/' + module.modulename;

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alertError(message);
        });

    };


});

/**
 * The controller that handles on-line app detail actions.
 * @class AppOnlineDetailController
 */
myAppController.controller('AppOnlineDetailController', function ($scope, $routeParams, $timeout, $location, $route, $filter, myCache, cfg, dataFactory, dataService, _) {
    $scope.local = {
        installed: false,
        alert: false
    };
    $scope.module = [];
    $scope.comments = {
        all: {},
        model: {
            module_id: parseInt($routeParams.id, 10),
            content: '',
            name: '',
            remote_id: false
        },
        show: true
    };
    $scope.rating = {
        range: _.range(1, 6),
        model: {
            module_id: parseInt($routeParams.id, 10),
            remote_id: false,
            score: 0

        }
    };
    $scope.categoryName = '';
    $scope.onlineMediaUrl = cfg.online_module_img_url;

    /**
     * Load Remote ID
     */
    $scope.loadRemoteId = function () {
        dataFactory.getApi('remote_id').then(function (response) {
            $scope.rating.model.remote_id = response.data.data.remote_id;
           });
    };
    $scope.loadRemoteId();

    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[cfg.lang], {id: id});
            if (category) {
                $scope.categoryName = category.name;
            }
        }, function (error) {
        });
    };
    /**
     * Load local modules
     */
    $scope.loadLocalModules = function (query) {
        dataFactory.getApi('modules').then(function (response) {
            $scope.local.installed = _.findWhere(response.data.data, query);
        }, function (error) {
        });
    };

    /**
     * Load module detail
     */
    $scope.loadModuleId = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postToRemote(cfg.online_moduleid_url, {id: id, lang: $scope.lang}).then(function (response) {
            if (_.isEmpty(response.data.data)) {
                $scope.local.alert = {
                    message: $scope._t('no_data'),
                    status: 'alert-warning',
                    icon: 'fa-exclamation-circle'
                };
                return;
            }
            $scope.module = response.data.data;

            $scope.loadLocalModules({moduleName: $scope.module.modulename});
            $scope.loadCategories($scope.module.category);
        }, function (error) {
            if (error.status === 0) {

                $scope.local.alert = {
                    message: $scope._t('no_internet_connection', {__sec__: (cfg.pending_remote_limit / 1000)}),
                    status: 'alert-warning',
                    icon: 'fa-wifi'
                };

            } else {
                alertify.alertError($scope._t('error_load_data'));
            }
        }).finally(function () {
            $scope.loading = false;
        });
    };
    $scope.loadModuleId($routeParams.id);

    /**
     * Load comments
     */
    $scope.loadComments = function (id) {
        dataFactory.getRemoteData(cfg.online_module_comments_url + '/' + id, true).then(function (response) {
            $scope.comments.all = response.data.data;
            if (_.isEmpty(response.data.data)) {
                $scope.comments.show = false;
            } else {
                $scope.comments.show = true;
            }
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_comments'));
        });

    };
    $scope.loadComments($routeParams.id);

    /**
     * Install module
     */
    $scope.installModule = function (module) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: cfg.online_module_download_url + module.file
        };
        dataFactory.installOnlineModule(data, 'online_install').then(function (response) {
            dataFactory.postToRemote(cfg.online_module_installed_url, {id: module.id});
            dataService.showNotifier({message: $scope._t(response.data.data.key)});
            window.location = '#/module/post/' + module.modulename;

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alertError(message);
        });

    };

    /**
     * Add comment
     */
    $scope.addComment = function (form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postToRemote(cfg.online_module_comment_create_url, input).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('comment_add_successful')});
            $scope.expand.appcommentadd = false;
            $scope.loadComments($routeParams.id);
            input.content = '';
            input.name = '';
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('comment_add_failed'));

        });

    };

    /**
     * Rate module
     */
    $scope.rateModule = function (score) {
        $scope.rating.model.score = parseInt(score);
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postToRemote(cfg.online_module_rating_create_url, $scope.rating.model).then(function (response) {
            $scope.loading = false;
            $scope.loadModuleId($routeParams.id);
        }, function (error) {
            var message = $scope._t('error_update_data');
            $scope.loading = false;
            if (error.status === 409) {
                message = $scope._t('already_rated');
            }
            alertify.alertError(message);

        });
    };

});

/**
 * Apps online featured controller
 * @class AppOnlineFeaturedController
 *
 */
myAppController.controller('AppOnlineFeaturedController', function ($scope, _) {

    $scope.sliderImages = {
        'Alexa': 'storage/img/slider/Alexa.png',
        'IntChart': 'storage/img/slider/IntChart.png',
        'SecurityModule': 'storage/img/slider/SecurityModule.png',
        'ToggleDevices': 'storage/img/slider/ToggleDevices.png',
        'ClimateControl': 'storage/img/slider/ClimateControl.png',
        'NotificationPushover': 'storage/img/slider/NotificationPushover.png',
        'ImportRemoteHA': 'storage/img/slider/ImportRemoteHA.png',
        'CustomUserCode': 'storage/img/slider/CustomUserCode.png',
        'HTTPDevice': 'storage/img/slider/HTTPDevice.png'
    };

    $scope.prevSlide = function () {
        $scope.slider.cfg.start -= 1;
        $scope.slider.cfg.end -= 1;
        if ($scope.slider.cfg.start < 0) {
            $scope.slider.cfg.start = 0;
            $scope.slider.cfg.end = $scope.slider.cfg.show;
        }
    };

    $scope.nextSlide = function () {
        $scope.slider.cfg.start += 1;
        $scope.slider.cfg.end += 1;
        if ($scope.slider.cfg.end > $scope.slider.cfg.max) {
            $scope.slider.cfg.start = 0;
            $scope.slider.cfg.end = $scope.slider.cfg.show;
        }
    };


});
