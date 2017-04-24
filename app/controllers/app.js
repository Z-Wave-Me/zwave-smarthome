/**
 * @overview Controllers that handle the Local apps, Online Apps and Active apps.
 * @author Martin Vach
 */

/**
 * Apps root controller
 * @class AppBaseController
 *
 */
myAppController.controller('AppBaseController', function ($scope, $rootScope,$filter, $cookies, $q, $route, $http,$timeout,cfg,dataFactory, dataService, _) {
    angular.copy({
        appsCategories: false
    }, $scope.expand);


    $scope.dataHolder = {
        modules: {
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                appsCatFeatured: 0,
                featured: 0
            },
            all: [],
            collection: [],
            featured: [],
            categories: {},
            ids: {},
            singleton: {},
            filter: {},
            cameraIds: [],
            imgs: [],
            cats: [],
            currentCategory: {
                id: false,
                name: ''
            },
            orderBy: ($cookies.orderByAppsLocal ? $cookies.orderByAppsLocal : 'titleASC')
        },
        onlineModules: {
            connect: {
                status: false,
                icon: 'fa-exclamation-triangle text-danger',
            },
            alert: {message: false, status: 'is-hidden', icon: false},
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                appsCatFeatured: 0,
                featured: 0
            },
            ratingRange: _.range(1, 6),
            collection: [],
            all: {},
            featured: [],
            ids: {},
            filter: {},
            hideInstalled: ($cookies.hideInstalledApps ? $filter('toBool')($cookies.hideInstalledApps) : false),
            orderBy: ($cookies.orderByAppsOnline ? $cookies.orderByAppsOnline : 'creationTimeDESC')
        },
        tokens: {
            all: {}
        },
        instances: {
            expanded: ($cookies.instancesExpanded == 'true'),//$cookies.instancesExpanded,
            all: {},
            groups: {},
            cnt: {
                modules: 0
            },
            orderBy: ($cookies.orderByAppsInstances ? $cookies.orderByAppsInstances : 'creationTimeDESC')
        }
    };

    $scope.slider = {
        cfg: {
            start: 0,
            end: 3,
            max: 0,
            show: 3
        }
    }
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;

    /**
     * Check if online modules are loaded
     */
    $scope.checkOnlineModules = function () {
        if ($scope.routeMatch('/apps/online')) {
            $timeout(function(){
                $scope.loading = false;
                $http.pendingRequests.forEach(function(v) {
                    if(v.url === cfg.online_module_url){
                        $scope.dataHolder.onlineModules.alert = {message: $scope._t('no_internet_connection'), status: 'alert-warning', icon: 'fa-wifi'};
                    }
                });
            }, 10000);


        }
    };
    $scope.checkOnlineModules();

    /**
     * Load tokens
     */
    $scope.loadTokens = function () {
        dataFactory.getApi('tokens', null, true).then(function (response) {
            angular.extend($scope.dataHolder.tokens.all, response.data.data.tokens);
            $scope.allSettled($scope.dataHolder.tokens.all);

        }, function (error) {
            $scope.allSettled($scope.dataHolder.tokens.all);
        });
    };
    $scope.loadTokens();

    /**
     * Load online modules
     */
    $scope.loadOnlineModules = function (tokens) {
        dataFactory.getOnlineModules({token: _.values(tokens)}).then(function (response) {
            $scope.dataHolder.onlineModules.alert = false;
            $scope.dataHolder.onlineModules.connect.status = true;
            $scope.dataHolder.onlineModules.connect.icon = 'fa-globe';
            setOnlineModules(response.data.data)
        }, function (error) {

            $scope.dataHolder.onlineModules.alert = {message: $scope._t('no_internet_connection'), status: 'alert-warning', icon: 'fa-wifi'};
        });
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function (tokens) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules_categories'),
            dataFactory.getApi('modules', null, true),
            dataFactory.getApi('instances', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            if (!$scope.routeMatch('/apps/online')){
                $scope.loading = false;
            }

            var categories = response[0];
            var modules = response[1];
            //var onlineModules = response[2];
            var instances = response[2];
            // Error message
            if (modules.state === 'rejected' && $scope.routeMatch('/apps/local')) {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }

            if (instances.state === 'rejected' && $scope.routeMatch('/apps/instance')) {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }

            // Success - categories
            if (categories.state === 'fulfilled') {
                var cat = categories.value.data.data;
                if (cat) {
                    $scope.dataHolder.modules.categories = cat[$scope.lang] ? _.indexBy(cat[$scope.lang], 'id') : _.indexBy(cat[$scope.cfg.lang], 'id');
                    angular.forEach($scope.dataHolder.modules.categories,function (v,k) {
                        angular.extend($scope.dataHolder.modules.categories[k],{onlineModules: []});
                    });
                }
            }
            // Success - instances
            if (instances.state === 'fulfilled') {
                setInstances(instances.value.data.data);
            }

            // Success - modules
            if (modules.state === 'fulfilled') {
                setModules(modules.value.data.data, $scope.dataHolder.instances.all);
            }
            $scope.loadOnlineModules(tokens);
        });
    };



    /**
     * Update module
     */
    $scope.updateModule = function (module, confirm) {
        var patches = module.patchnotes ? '<div class="app-confirm-content">' + $filter('stripTags')(module.patchnotes) + '</div>' : '';
        alertify.confirm(patches + confirm, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
            var data = {
                moduleUrl: $scope.cfg.online_module_download_url + module.file
            };
            dataFactory.installOnlineModule(data, 'online_update').then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t(response.data.data.key)});
                $route.reload();

            }, function (error) {
                $scope.loading = false;
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
                alertify.alertError(message);
            });
        });


    };

    /// --- Private functions --- ///
    /**
     * Set local modules
     */
    function setModules(data, instances) {
        // Reset featured cnt
        $scope.dataHolder.modules.cnt.featured = 0;
        var modules = _.chain(data)
                .flatten()
                .filter(function (item) {
                    item.title = item.defaults.title;
                    item.description = item.defaults.description;
                    // Has already instance ?
                    item.hasInstance = $scope.dataHolder.instances.cnt.modules[item.id]||0;
                    $scope.dataHolder.modules.ids[item.id] = {version: item.version};
                    $scope.dataHolder.modules.singleton[item.id] = {singelton: item.singleton};

                    var isHidden = false;
                    var items = [];
                    if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                        if ($scope.user.role !== 1) {
                            isHidden = true;
                        } else {
                            isHidden = ($scope.user.expert_view ? false : true);
                        }

                    }
                    // Hides video item
                    if (item.category === 'surveillance') {
                        $scope.dataHolder.modules.cameraIds.push(item.id);
                        isHidden = true;
                    }
                    // Hides singelton item with instance
                    if (item.singleton && item.hasInstance) {
                        isHidden = true;
                    }

                    if (!isHidden) {
                        var findLocationStr = item.location.split('/');
                        if (findLocationStr[0] === 'userModules') {
                            angular.extend(item, {custom: true});
                        } else {
                            angular.extend(item, {custom: false});
                        }
                        //$scope.modulesIds.push(item.id);
                        $scope.dataHolder.modules.imgs[item.id] = item.icon;
                        if (item.category && $scope.dataHolder.modules.cats.indexOf(item.category) === -1) {
                            $scope.dataHolder.modules.cats.push(item.category);
                        }
                        if ($scope.getCustomCfgArr('featured_apps').indexOf(item.moduleName) > -1) {
                            angular.extend(item, {featured: true});
                            // Count featured apps
                            $scope.dataHolder.modules.cnt.featured += 1;
                        } else {
                            angular.extend(item, {featured: false});
                        }
                        // Has already instance ?
                        //angular.extend(item, {hasInstance: $scope.dataHolder.instances.cnt.modules[item.id]||0});
                         
                        //Tooltip description
                        angular.extend(item, {toolTipDescription: $filter('stripTags')(item.defaults.description)});

                        if(item.featured) {
                            $scope.dataHolder.modules.featured.push(item);
                        }

                        return items;
                    }
                });

        // Count apps in categories
        $scope.dataHolder.modules.cnt.appsCat = modules.countBy(function (v) {
            return v.category;
        }).value();

        // Count featured apps in categories
        $scope.dataHolder.modules.cnt.appsCatFeatured = modules.countBy(function (v) {
            if(v.featured) {
                return v.category;
            }
        }).value();

        // Count all apps
        $scope.dataHolder.modules.cnt.apps = modules.size().value();
        $scope.dataHolder.modules.collection = modules.where($scope.dataHolder.modules.filter).value();
        $scope.dataHolder.modules.all = modules.value();
        // Count collection
        $scope.dataHolder.modules.cnt.collection = _.size($scope.dataHolder.modules.collection);
    }
    ;

    /**
     * Set online modules
     */
    function setOnlineModules(data) {
        //console.log($scope.dataHolder.modules.categories)
        // Reset featured cnt
        $scope.dataHolder.onlineModules.cnt.featured = 0;
        $scope.slider.cfg.max = 0;
        var onlineModules = _.chain(data)
                .flatten()
                .filter(function (item) {
                    // Replacing categories
                    if(cfg.replace_online_cat[item.category]){
                        item.category = cfg.replace_online_cat[item.category];
                    }
                    var isHidden = false;
                    var obj = {};
                    $scope.dataHolder.onlineModules.ids[item.modulename] = {version: item.version, file: item.file, patchnotes: item.patchnotes};
                    if ($scope.getHiddenApps().indexOf(item.modulename) > -1) {
                        if ($scope.user.role !== 1) {
                            isHidden = true;
                        } else {
                            isHidden = ($scope.user.expert_view ? false : true);
                        }
                    }
                    if ($scope.dataHolder.modules.ids[item.modulename]) {
                        item['status'] = 'installed';
                        if ($scope.dataHolder.modules.ids[item.modulename].version !== item.version) {
                            if (!$scope.dataHolder.modules.ids[item.modulename].version && !item.version) {
                                item['status'] = 'error';
                            } else if (!$scope.dataHolder.modules.ids[item.modulename].version && item.version) {
                                item['status'] = 'upgrade';
                            } else {
                                var localVersion = $scope.dataHolder.modules.ids[item.modulename].version.toString().split('.'),
                                        onlineVersion = item.version.toString().split('.');

                                for (var i = 0; i < localVersion.length; i++) {
                                    if ((parseInt(localVersion[i], 10) < parseInt(onlineVersion[i], 10)) || ((parseInt(localVersion[i], 10) <= parseInt(onlineVersion[i], 10)) && (!localVersion[i + 1] && onlineVersion[i + 1] && parseInt(onlineVersion[i + 1], 10) > 0))) {
                                        item['status'] = 'upgrade';
                                        break;
                                    }
                                }
                            }
                        }
                        isHidden = $scope.dataHolder.onlineModules.hideInstalled;
                    } else {
                        item['status'] = 'download';
                    }

                    $scope.dataHolder.onlineModules.ids[item.modulename].status = item.status;
                    angular.extend(item, {isHidden: isHidden});

                    if (item.featured == 1) {
                        item.featured = true;
                        // Count featured apps
                        $scope.dataHolder.onlineModules.cnt.featured += 1;
                        $scope.slider.cfg.max += 1;
                    } else {
                        item.featured = false;
                    }

                    if(item.featured) {
                        $scope.dataHolder.onlineModules.featured.push(item)
                    }

                    item.installedSort = $filter('zeroFill')(item.installed);
                     //Tooltip description
                     angular.extend(item, {toolTipDescription: $filter('stripTags')(item.description)});
                    var hasCat = $scope.dataHolder.modules.categories[item.category];
                    if(hasCat){
                        $scope.dataHolder.modules.categories[item.category].onlineModules.push(item);
                        //console.log($scope.dataHolder.modules.categories[item.category].onlineModules);
                    }

                    //angular.extend($scope.dataHolder.modules.categories[item.category], {onlineModules: []});
                    //$scope.dataHolder.modules.categories[item.category].onlineModules = [];
                    return item;
                }).reject(function (v) {
            return v.isHidden === true;
        });
        // Count apps in categories
        $scope.dataHolder.onlineModules.cnt.appsCat = onlineModules.countBy(function (v) {
            return v.category;
        }).value();

        // Count featured apps in categories
        $scope.dataHolder.onlineModules.cnt.appsCatFeatured = onlineModules.countBy(function (v) {
            if(v.featured) {
                return v.category;
            }
        }).value();

        // Count all apps
        $scope.dataHolder.onlineModules.cnt.apps = onlineModules.size().value();
        $scope.dataHolder.onlineModules.collection = onlineModules.where($scope.dataHolder.onlineModules.filter).value();
        $scope.dataHolder.onlineModules.all = onlineModules.value();
        // Count collection
        $scope.dataHolder.onlineModules.cnt.collection = _.size($scope.dataHolder.onlineModules.collection);
        $scope.loading = false;
    }
    ;

    /**
     * Set instances
     */
    function setInstances(data) {
        $scope.dataHolder.instances.cnt.modules = _.countBy(data, function (v) {
            return v.moduleId;
        });
        _.filter(data, function (v) {
            if(!$scope.dataHolder.instances.groups[v.moduleId]){
                $scope.dataHolder.instances.groups[v.moduleId] = {
                    id: v.id,
                    moduleId: v.moduleId,
                    title: v.title,
                    instances: []
                };
            }
        });

        $scope.dataHolder.instances.all = _.chain(data)
            .flatten()
            .reject(function (v) {
            if ($scope.getHiddenApps().indexOf(v.moduleId) > -1) {
                if ($scope.user.role !== 1) {
                    return true;
                } else {
                    return ($scope.user.expert_view ? false : true);
                }

            } else {
                return false;
            }
        }).filter(function(v){
                if($scope.dataHolder.instances.groups[v.moduleId]){
                    $scope.dataHolder.instances.groups[v.moduleId].instances.push(v);
                }
                return v;
            }).value();
    }
    ;
    /**
     * todo: deprecated
     * Set instances
     */
    /*function setInstances(data) {
        $scope.dataHolder.instances.cnt.modules = _.countBy(data, function (v) {
                                    return v.moduleId;
                                });
        $scope.dataHolder.instances.all = _.reject(data, function (v) {
            if ($scope.getHiddenApps().indexOf(v.moduleId) > -1) {
                if ($scope.user.role !== 1) {
                    return true;
                } else {
                    return ($scope.user.expert_view ? false : true);
                }

            } else {
                return false;
            }
        });
    }
    ;*/

});
/**
 * The controller that handles all local APPs actions.
 * @class AppLocalController
 */
myAppController.controller('AppLocalController', function ($scope, $filter, $cookies, $timeout, $route, $routeParams, $location, dataFactory, dataService, myCache, _) {
    $scope.dataHolder.modules.filter = ($cookies.filterAppsLocal ? angular.fromJson($cookies.filterAppsLocal) : {});
    $scope.autocomplete = {
        source: [],
        term: '',
        searchInKeys: 'id,title,description,author',
        returnKeys: 'id,title,author,icon,moduleName,hasInstance',
        strLength: 2,
        resultLength: 10
    };

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.autocomplete.results = dataService.autocomplete($scope.dataHolder.modules.all,$scope.autocomplete);
    }
    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.modules, {orderBy: key});
        $cookies.orderByAppsLocal = key;
        $scope.reloadData();
    };
    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        if (!filter) {
            angular.extend($scope.dataHolder.modules, {filter: {}});
            $cookies.filterAppsLocal = angular.toJson({});
        } else {
            angular.extend($scope.dataHolder.modules, {filter: filter});
            $cookies.filterAppsLocal = angular.toJson(filter);
        }
        $scope.reloadData();
    };

    /**
     * Delete module
     */
    $scope.deleteModule = function (input, message) {

        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('online_delete', input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });
        });
    };

    /**
     * Reset module
     */
    $scope.resetModule = function (input, message) {

        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.postApi('online_reset', input, '/' + input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });
        });
    };

});

/**
 * The controller that handles all online APPs actions.
 * @class AppOnlineController
 */
myAppController.controller('AppOnlineController', function ($scope, $filter, $cookies, $window, $routeParams,dataFactory, dataService, _) {
    $scope.dataHolder.onlineModules.filter = ($cookies.filterAppsOnline ? angular.fromJson($cookies.filterAppsOnline) : {});
    $scope.autocomplete = {
        source: [],
        term: '',
        searchInKeys: 'id,title,description,author',
        returnKeys: 'id,title,author,installed,rating,icon',
        strLength: 2,
        resultLength: 10
    };

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.autocomplete.results = dataService.autocomplete($scope.dataHolder.onlineModules.all,$scope.autocomplete);
    }

    if($routeParams['category']){
        var filter = {category:$routeParams['category']};
        //console.log(filter);
        angular.extend($scope.dataHolder.onlineModules, {filter: filter});
        $cookies.filterAppsOnline = angular.toJson(filter);
        //$scope.setFilter({category:$routeParams['category']});

    }

    /*$scope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
        console.log('success', evt, absNewUrl, absOldUrl);
        if($routeParams['category']){
            var filter = {category:$routeParams['category']};
            //console.log(filter);
            angular.extend($scope.dataHolder.onlineModules, {filter: filter});
            $cookies.filterAppsOnline = angular.toJson(filter);
            //$scope.setFilter({category:$routeParams['category']});

        }
    });*/


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
        if (!filter) {
            angular.extend($scope.dataHolder.onlineModules, {filter: {}});
            $cookies.filterAppsOnline = angular.toJson({});
        } else {
            angular.extend($scope.dataHolder.onlineModules, {filter: filter});
            $cookies.filterAppsOnline = angular.toJson(filter);
        }
         $scope.reloadData();
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
 * The controller that handles all instances actions.
 * @class AppInstanceController
 */
myAppController.controller('AppInstanceController', function ($scope, $cookies, dataFactory, dataService, myCache, _) {
    $scope.autocomplete = {
        source: [],
        term: '',
        searchInKeys: 'id,title,description,moduleId',
        returnKeys: 'id,title,active,moduleId',
        strLength: 2,
        resultLength: 10
    };

    /**
     * Expand instances
     */
    $scope.expandInstances = function (state) {
        angular.forEach($scope.expand,function(v,k){
            console.log(k)
            $scope.expand[k] = state;
        });
        $cookies.instancesExpanded = state;
    };

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.autocomplete.results = dataService.autocomplete($scope.dataHolder.instances.all,$scope.autocomplete);
    }

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.instances, {orderBy: key});
        $cookies.orderByAppsInstances = key;
        $scope.reloadData();
    };
    /**
     * Activate instance
     */
    $scope.activateInstance = function (input, activeStatus) {
        input.active = activeStatus;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.loading = false;
                //$scope.reloadData();
                //$route.reload();

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function (target, input, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('instances', input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.reloadData();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });

        });
    };

});
/**
 * The controller that handles local app detail actions.
 * @class AppLocalDetailController
 */
myAppController.controller('AppLocalDetailController', function ($scope, $routeParams, $location, dataFactory, dataService, _) {
    $scope.module = [];
    $scope.categoryName = '';
    $scope.isOnline = null;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[$scope.cfg.lang], {id: id});
            if (category) {
                $scope.categoryName = category.name;
            }
        }, function (error) {});
    };

    /**
     * Load module detail
     */
    $scope.loadModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/' + id).then(function (response) {
            loadOnlineModules(id);
            $scope.module = response.data.data;
            $scope.loadCategories(response.data.data.category);
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function (response) {
            $scope.isOnline = _.findWhere(response.data, {modulename: moduleName});
        }, function (error) {
        });
    }

});

/**
 * The controller that handles on-line app detail actions.
 * @class AppOnlineDetailController
 */
myAppController.controller('AppOnlineDetailController', function ($scope, $routeParams, $timeout, $location, $route, $filter, myCache, dataFactory, dataService, _) {
    $scope.local = {
        installed: false
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
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;

    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function () {
        dataFactory.getApi('instances', '/RemoteAccess').then(function (response) {
            $scope.remoteAccess = response.data.data[0];
            if (Object.keys(response.data.data[0]).length > 0) {
                $scope.comments.model.remote_id = response.data.data[0].params.userId;
                $scope.rating.model.remote_id = response.data.data[0].params.userId;
            }

        }, function (error) {});
    };

    $scope.loadRemoteAccess();

    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[$scope.cfg.lang], {id: id});
            if (category) {
                $scope.categoryName = category.name;
            }
        }, function (error) {});
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
        dataFactory.postToRemote($scope.cfg.online_moduleid_url, {id: id, lang: $scope.lang}).then(function (response) {
            $scope.loading = false;
            if (_.isEmpty(response.data.data)) {
                alertify.alertWarning($scope._t('no_data'));
                return;
            }
            $scope.module = response.data.data;

            $scope.loadLocalModules({moduleName: $scope.module.modulename});
            $scope.loadCategories($scope.module.category);
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadModuleId($routeParams.id);

    /**
     * Load comments
     */
    $scope.loadComments = function (id) {
        dataFactory.getRemoteData($scope.cfg.online_module_comments_url + '/' + id, true).then(function (response) {
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
            moduleUrl: $scope.cfg.online_module_download_url + module.file
        };
        dataFactory.installOnlineModule(data, 'online_install').then(function (response) {
            dataFactory.postToRemote($scope.cfg.online_module_installed_url, {id: module.id});
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
        dataFactory.postToRemote($scope.cfg.online_module_comment_create_url, input).then(function (response) {
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
        dataFactory.postToRemote($scope.cfg.online_module_rating_create_url, $scope.rating.model).then(function (response) {
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
 * The controller that handles Alpaca forms inputs and outputs.
 * @class AppModuleAlpacaController
 */
myAppController.controller('AppModuleAlpacaController', function ($scope, $routeParams, $route, $filter, $location, $q, dataFactory, dataService, myCache, cfg) {
    $scope.showForm = false;
    $scope.success = false;
    $scope.alpacaData = true;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.input = {
        'instanceId': 0,
        'active': true,
        'moduleId': null,
        'title': null,
        'description': null,
        'moduleTitle': null,
        'category': null
    };
    $scope.moduleId = {
        submit: true,
        fromapp: $routeParams.fromapp,
        find: {},
        categoryName: null,
        singletonActive: false,
        modules: {},
        instances: {},
        dependency: {
            activate: {},
            add: {},
            download: {}
        }
    };


    $scope.onLoad = function () {
        myCache.remove('instances');
    };
    $scope.onLoad();

    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[$scope.cfg.lang], {id: id});
            if (category) {
                $scope.moduleId.categoryName = category.name;
            }
        }, function (error) {});
    };

    /**
     * Generates the form for creating a new app instance
     */
    $scope.postModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', null, true).then(function (instances) {
            dataFactory.getApi('modules', '/' + id + '?lang=' + $scope.lang, true).then(function (module) {
                // get module postRender data
                var modulePR = null;
                if (angular.isString(module.data.data.postRender) && module.data.data.postRender.indexOf('function') === 0) {
                    modulePR = module.data.data.postRender;
                }
                var formData = dataService.getModuleFormData(module.data.data, module.data.data.defaults);
                var langCode = (angular.isDefined(cfg.lang_codes[$scope.lang]) ? cfg.lang_codes[$scope.lang] : null);
                $scope.input = {
                    'modulePostrender': modulePR,
                    'instanceId': 0,
                    'moduleId': id,
                    'active': true,
                    'title': $filter('hasNode')(formData, 'data.title'),
                    'description': $filter('hasNode')(formData, 'data.description'),
                    'moduleTitle': $filter('hasNode')(formData, 'data.title'),
                    'icon': $filter('hasNode')(module, 'data.data.icon'),
                    'moduleName': $filter('hasNode')(module, 'data.data.moduleName'),
                    'category': module.data.data.category
                };
                angular.extend($scope.moduleId, {find: module.data.data});
                $scope.loadCategories(module.data.data.category);
                setDependencies(module.data.data.dependencies);
                $scope.showForm = true;
                $scope.loading = false;
                // Is singelton and has already instance?
                if (module.data.data.singleton && _.findWhere(instances.data.data, {moduleId: id})) {
                    $scope.moduleId.singletonActive = true;
                    return;
                }
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }
                $.alpaca.setDefaultLocale(langCode);
                $('#alpaca_data').alpaca(formData);


            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
            });
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });
    };

    /**
     * Generates the form for updating an app instance
     */
    $scope.putModule = function (id) {
        if (id < 1) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
            var instance = instances.data.data;
            dataFactory.getApi('modules', '/' + instance.moduleId + '?lang=' + $scope.lang, true).then(function (module) {
                if (module.data.data.state === 'hidden') {
                    if (!$scope.user.expert_view) {
                        $scope.loading = false;
                        return;
                    }

                }
                // get module postRender data
                var modulePR = null;
                if (angular.isString(module.data.data.postRender) && module.data.data.postRender.indexOf('function') === 0) {
                    modulePR = module.data.data.postRender;
                }
                var formData = dataService.getModuleFormData(module.data.data, instance.params);

                $scope.input = {
                    'modulePostrender': modulePR,
                    'instanceId': instance.id,
                    'moduleId': module.data.data.id,
                    'active': instance.active,
                    'title': instance.title,
                    'description': instance.description,
                    'moduleTitle': instance.title,
                    'icon': $filter('hasNode')(module, 'data.data.icon'),
                    'moduleName': $filter('hasNode')(module, 'data.data.moduleName'),
                    'category': module.data.data.category
                };
                $scope.showForm = true;
                angular.extend($scope.moduleId, {find: module.data.data});
                $scope.loadCategories(module.data.data.category);
                setDependencies(module.data.data.dependencies);
                $scope.loading = false;
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }

                $('#alpaca_data').alpaca(formData);

            }, function (error) {
                alertify.alertError($scope._t('error_load_data'));
                $scope.loading = false;
            });
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });

    };

    /**
     * Generates the form for clon an app instance
     */
    $scope.cloneModule = function (id, instanceId) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', '/' + instanceId, true).then(function (instances) {
            var instance = instances.data.data;
            dataFactory.getApi('modules', '/' + id + '?lang=' + $scope.lang, true).then(function (module) {
                // get module postRender data
                var modulePR = null;
                if (angular.isString(module.data.data.postRender) && module.data.data.postRender.indexOf('function') === 0) {
                    modulePR = module.data.data.postRender;
                }
                var formData = dataService.getModuleFormData(module.data.data, instance.params);

                var langCode = (angular.isDefined(cfg.lang_codes[$scope.lang]) ? cfg.lang_codes[$scope.lang] : null);
                $scope.input = {
                    'modulePostrender': modulePR,
                    'instanceId': 0,
                    'moduleId': id,
                    'active': true,
                    'title': $filter('hasNode')(formData, 'data.title'),
                    'description': $filter('hasNode')(formData, 'data.description'),
                    'moduleTitle': $filter('hasNode')(formData, 'data.title'),
                    'icon': $filter('hasNode')(module, 'data.data.icon'),
                    'moduleName': $filter('hasNode')(module, 'data.data.moduleName'),
                    'category': module.data.data.category
                };
                angular.extend($scope.moduleId, {find: module.data.data});
                $scope.loadCategories(module.data.data.category);
                setDependencies(module.data.data.dependencies);
                $scope.showForm = true;
                $scope.loading = false;
                // Is singelton and has already instance?
                if (module.data.data.singleton && _.findWhere(instances.data.data, {moduleId: id})) {
                    $scope.moduleId.singletonActive = true;
                    return;
                }
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }
                $.alpaca.setDefaultLocale(langCode);
                $('#alpaca_data').alpaca(formData);


            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
            });
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });
    }

    /**
     * Load data
     */
    switch ($routeParams.action) {
        case 'put':
            $scope.putModule($routeParams.id);
            break;
        case 'post':
            $scope.postModule($routeParams.id);
            break;
        case 'clone':
            $scope.cloneModule($routeParams.id, $routeParams.instanceId);
        default:
            break;
    }
    /**
     * Create/Update an app instance
     */
    $scope.store = function (data) {
        var defaults = ['instanceId', 'moduleId', 'active', 'title', 'description'];
        var input = [];
        var params = {};
        angular.forEach(data, function (v, k) {
            if (defaults.indexOf(k) > -1) {
                input[k] = v;
            }
        });

        var inputData = {
            'id': input.instanceId,
            'moduleId': input.moduleId,
            'active': input.active,
            'title': input.title,
            'description': input.description,
            'params': params
        };
        if (input.instanceId > 0) {
            dataFactory.putApi('instances', input.instanceId, inputData).then(function (response) {
                myCache.remove('devices');
                if ($scope.moduleId.fromapp) {
                    $location.path('/module/post/' + $scope.moduleId.fromapp);
                } else {
                    $location.path('/apps/instance');
                }


            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        } else {
            dataFactory.postApi('instances', inputData).then(function (response) {
                myCache.remove('devices');
                if ($scope.moduleId.fromapp) {
                    $location.path('/module/post/' + $scope.moduleId.fromapp);
                } else {
                    $location.path('/apps/instance');
                }

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        }
    };
    /**
     * Activates an instance of the module
     */
    $scope.activateInstance = function (input) {
        input.active = true;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('instances', input.id, input).then(function (response) {
            $scope.loading = false;
            $route.reload();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Install the module
     */
    $scope.installModule = function (module) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + module.file
        };
        dataFactory.installOnlineModule(data, 'online_install').then(function (response) {
            dataService.showNotifier({message: $scope._t(response.data.data.key)});
            window.location = '#/module/post/' + module.modulename + '/' + $routeParams.id;

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alertError(message);
        });

    };

    // --- Private functions

    /**
     * Set moduledependencies
     */
    function setDependencies(dependencies) {
        if (!_.isArray(dependencies)) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules', null, true),
            dataFactory.getApi('instances', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var modules = response[0];
            var instances = response[1];
            // Error message
            if (modules.state === 'rejected' || instances.state === 'rejected') {
                $scope.loading = false;
                return;
            }
            // Success - modules
            if (modules.state === 'fulfilled') {
                $scope.moduleId.modules = _.indexBy(modules.value.data.data, 'moduleName');
            }

            // Success - instances
            if (instances.state === 'fulfilled') {
                $scope.moduleId.instances = _.indexBy(instances.value.data.data, 'moduleId');
            }

            // Loop throught dependencies
            angular.forEach(dependencies, function (k) {
                if ($scope.moduleId.modules[k]) {
                    if ($scope.moduleId.instances[k]) {
                        if ($scope.moduleId.instances[k].active === false) {
                            $scope.moduleId.submit = false;
                            $scope.moduleId.dependency.activate[k] = $scope.moduleId.instances[k];
                        }
                    } else {
                        $scope.moduleId.submit = false;
                        $scope.moduleId.dependency.add[k] = {
                            modulename: k
                        };
                    }
                } else {
                    $scope.moduleId.submit = false;
                    $scope.moduleId.dependency.download[k] = {
                        id: k,
                        modulename: k,
                        file: k + '.tar.gz'
                    };
                }
            });
            $scope.loading = false;
        });
    }
    ;

});
/**
 * Apps online featured controller
 * @class AppOnlineFeaturedController
 *
 */
myAppController.controller('AppOnlineFeaturedController', function ($scope, _) {
    $scope.imgReplace = {
        364: 'storage/img/slider/01-alarm.png',
        342: 'storage/img/slider/02-dimmer.png',
        304: 'storage/img/slider/03-power.png',
        222: 'storage/img/slider/04-motion.png',
        181: 'storage/img/slider/05-switch.png',
        158: 'storage/img/slider/06-thermostat.png',
        154: 'storage/img/slider/07-camera.png',
        152: 'storage/img/slider/08-rgb.png'
    };
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
    //$scope.direction = 'left';
    //$scope.currentIndex = 0;
    /*$scope.slides = [
        {image: 'storage/img/slider/01-alarm.png', title: 'Alarm 1 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/02-dimmer.png', title: 'Dimmer 2 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/03-power.png', title: 'Power 3 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/04-motion.png', title: 'Motion 4 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/05-switch.png', title: 'Switch 5 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/06-thermostat.png', title: 'Thermostat 6 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/07-camera.png', title: 'Camera 7 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/08-rgb.png', title: 'RGB 8 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/09-temp.png', title: 'Temperature 9 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
        {image: 'storage/img/slider/10-luminosity.png', title: 'Luminosity 10 Morbi vitae pellentesque diam',installed: '42',rating: '4'},
    ];*/

   /* $scope.isCurrentSlideIndex = function (index) {
        return $scope.currentIndex === index;
    };*/

    $scope.prevSlide = function () {
        $scope.slider.cfg.start -= 1;
        $scope.slider.cfg.end -= 1;
        if($scope.slider.cfg.start < 0){
            $scope.slider.cfg.start = 0;
            $scope.slider.cfg.end = $scope.slider.cfg.show;
        }
        //$scope.direction = 'right';
        //$scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.slides.length - 1;
        //console.log($scope.currentIndex)
    };

    $scope.nextSlide = function () {
        $scope.slider.cfg.start += 1;
        $scope.slider.cfg.end += 1;
        if($scope.slider.cfg.end > $scope.slider.cfg.max){
            $scope.slider.cfg.start = 0;
            $scope.slider.cfg.end = $scope.slider.cfg.show;
        }
       // $scope.direction = 'left';
        //$scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
        //console.log($scope.currentIndex)
    };



});
    /*.animation('.slide-animation_', function () {
        return {
            beforeAddClass: function (element, className, done) {
                var scope = element.scope();

                if (className == 'ng-hide') {
                    var finishPoint = element.parent().width();
                    if(scope.direction !== 'right') {
                        finishPoint = -finishPoint;
                    }
                    TweenMax.to(element, 0.5, {left: finishPoint, onComplete: done });
                }
                else {
                    done();
                }
            },
            removeClass: function (element, className, done) {
                var scope = element.scope();

                if (className == 'ng-hide') {
                    element.removeClass('ng-hide');

                    var startPoint = element.parent().width();
                    if(scope.direction === 'right') {
                        startPoint = -startPoint;
                    }

                    TweenMax.fromTo(element, 0.5, { left: startPoint }, {left: 0, onComplete: done });
                }
                else {
                    done();
                }
            }
        };
    });*/
/**
 * todo: deprecated
 * Apps feature controller
 * @class AppModuleFeaturedController
 *
 */
/*
myAppController.controller('AppModuleFeaturedController', function ($scope, $routeParams, $route, $filter, $location, $q, dataFactory, dataService, myCache, cfg) {

    $scope.slider = {
        direction: 'right',
        currentIndex: 0,
        slidesperslide: 5,
        slides: []
    };


    $scope.allSettled = function (tokens) {
        var promises = [
            dataFactory.getOnlineModules({token: _.values(tokens)})
        ];

        $q.allSettled(promises).then(function (response) {
            var onlineModules = response[0];

            // Success - online modules
            if (onlineModules.state === 'fulfilled') {
                prepareSlides(onlineModules.value.data.data)
            }
        });
    };
    $scope.allSettled();

    function prepareSlides(data) {

        var slide = [];

        _.each(data, function(item) {
            if (item.featured == 1) {
                item.featured = true;
            } else {
                item.featured = false;
            }
            if(item.featured) {
                slide.push(item);
                if(slide.length >= $scope.slider.slidesperslide) {
                    $scope.slider.slides.push(slide);
                    slide = [];
                }
            }
        });
        if(slide.length != 0) {
            $scope.slider.slides.push(slide);
        }

        console.log( $scope.slider.slides);
    };

    $scope.setCurrentSlideIndex = function (index) {
        $scope.slider.direction = (index > $scope.slider.currentIndex) ? 'left' : 'right';
        $scope.slider.currentIndex = index;
    };

    $scope.isCurrentSlideIndex = function (index) {
        return $scope.slider.currentIndex === index;
    };

    $scope.prevSlide = function () {
        $scope.slider.direction = 'left';
        $scope.currentIndex = ($scope.slider.currentIndex < $scope.slider.slides.length - 1) ? ++$scope.slider.currentIndex : 0;
    };

    $scope.nextSlide = function () {
        $scope.slider.direction = 'right';
        $scope.currentIndex = ($scope.slider.currentIndex > 0) ? --$scope.slider.currentIndex : $scope.slider.slides.length - 1;
    };

}).animation('.slide-animation', function () {
    return {
        beforeAddClass: function (element, className, done) {
            var scope = element.scope();

            if (className == 'ng-hide') {
                var finishPoint = element.parent().width();
                if(scope.direction !== 'right') {
                    finishPoint = -finishPoint;
                }
                TweenMax.to(element, 0.5, {left: finishPoint, onComplete: done });
            }
            else {
                done();
            }
        },
        removeClass: function (element, className, done) {
            var scope = element.scope();

            if (className == 'ng-hide') {
                element.removeClass('ng-hide');

                var startPoint = element.parent().width();
                if(scope.direction === 'right') {
                    startPoint = -startPoint;
                }

                TweenMax.fromTo(element, 0.5, { left: startPoint }, {left: 0, onComplete: done });
            }
            else {
                done();
            }
        }
    };
});*/
