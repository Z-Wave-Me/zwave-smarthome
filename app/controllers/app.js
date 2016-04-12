/**
 * Application App controller
 * @author Martin Vach
 */

/**
 * App base controller
 */
myAppController.controller('AppBaseController', function ($scope, $filter, $cookies, $q, $route, $routeParams, dataFactory, dataService, _) {
    angular.copy({
        appsCategories: false
    }, $scope.expand);


    $scope.dataHolder = {
        modules: {
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                featured: 0
            },
            all: {},
            categories: {},
            ids: {},
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
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                featured: 0
            },
            ratingRange: _.range(1, 6),
            all: {},
            ids: {},
            filter: {},
            hideInstalled: ($cookies.hideInstalledApps ? $filter('toBool')($cookies.hideInstalledApps) : false),
            orderBy: ($cookies.orderByAppsOnline ? $cookies.orderByAppsOnline : 'creationTimeDESC')
        },
        tokens: {
            all: {}
        },
        instances: {
            all: {},
            orderBy: ($cookies.orderByAppsInstances ? $cookies.orderByAppsInstances : 'creationTimeDESC')
        }
    };

    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;

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
     * Load all promises
     */
    $scope.allSettled = function (tokens) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules_categories'),
            dataFactory.getApi('modules', null, true),
            dataFactory.getOnlineModules({token: _.values(tokens)}, true),
            dataFactory.getApi('instances', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var categories = response[0];
            var modules = response[1];
            var onlineModules = response[2];
            var instances = response[3];
            $scope.loading = false;
            // Error message
            if (modules.state === 'rejected' && $scope.routeMatch('/apps/local')) {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            if (onlineModules.state === 'rejected' && $scope.routeMatch('/apps/online')) {
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
                }
            }

            // Success - modules
            if (modules.state === 'fulfilled') {
                setModules(modules.value.data.data);
            }

            // Success - online modules
            if (onlineModules.state === 'fulfilled') {
                setOnlineModules(onlineModules.value.data.data)
            }
            // Success - instances
            if (instances.state === 'fulfilled') {
                setInstances(instances.value.data.data);
            }

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
     * Set modules
     */
    function setModules(data) {
        // Reset featured cnt
        $scope.dataHolder.modules.cnt.featured = 0;
        var modules = _.chain(data)
                .flatten()
                .filter(function (item) {
                    $scope.dataHolder.modules.ids[item.id] = {version: item.version};
                    var isHidden = false;
                    var items = [];
                    if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                        if ($scope.user.role !== 1) {
                            isHidden = true;
                        } else {
                            isHidden = ($scope.user.expert_view ? false : true);
                        }

                    }
                    if (item.category === 'surveillance') {
                        $scope.dataHolder.modules.cameraIds.push(item.id);
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
                        return items;
                    }
                });
        // Count apps in categories
        $scope.dataHolder.modules.cnt.appsCat = modules.countBy(function (v) {
            return v.category;
        }).value();
        // Count all apps
        $scope.dataHolder.modules.cnt.apps = modules.size().value();

        $scope.dataHolder.modules.all = modules.where($scope.dataHolder.modules.filter).value();
        // Count collection
        $scope.dataHolder.modules.cnt.collection = _.size($scope.dataHolder.modules.all);
    }
    ;

    /**
     * Set online modules
     */
    function setOnlineModules(data) {
        // Reset featured cnt
        $scope.dataHolder.onlineModules.cnt.featured = 0;
        var onlineModules = _.chain(data)
                .flatten()
                .filter(function (item) {
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
                                    if ((parseInt(localVersion[i], 10) < parseInt(onlineVersion[i], 10)) || ((parseInt(localVersion[i], 10) <= parseInt(onlineVersion[i], 10)) && (!localVersion[i+1] && onlineVersion[i+1] && parseInt(onlineVersion[i+1], 10) > 0))) {
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
                    } else {
                        item.featured = false;
                    }
                    return item;
                }).reject(function (v) {
            return v.isHidden === true;
        });
        // Count apps in categories
        $scope.dataHolder.onlineModules.cnt.appsCat = onlineModules.countBy(function (v) {
            return v.category;
        }).value();

        // Count all apps
        $scope.dataHolder.onlineModules.cnt.apps = onlineModules.size().value();
        $scope.dataHolder.onlineModules.all = onlineModules.where($scope.dataHolder.onlineModules.filter).value();
        // Count collection
        $scope.dataHolder.onlineModules.cnt.collection = _.size($scope.dataHolder.onlineModules.all);
        $scope.loading = false;
    };
    /**
     * Set instances
     */
    function setInstances(data) {
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
    };

});
/**
 * App local controller
 */
myAppController.controller('AppLocalController', function ($scope, $filter, $cookies, $timeout, $route, $routeParams, $location, dataFactory, dataService, myCache, _) {
    $scope.activeTab = 'local';
    //$scope.dataHolder.modules.filter = {featured: true};
    $scope.dataHolder.modules.filter = ($cookies.filterAppsLocal ? angular.fromJson($cookies.filterAppsLocal) : {featured: true});
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
 * App online controller
 */
myAppController.controller('AppOnlineController', function ($scope, $filter, $cookies, $window, dataFactory, dataService, _) {
    $scope.activeTab = 'online';
    $scope.dataHolder.onlineModules.filter = ($cookies.filterAppsOnline ? angular.fromJson($cookies.filterAppsOnline) : {featured: true});

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
 * App Instance controller
 */
myAppController.controller('AppInstanceController', function ($scope, $cookies, dataFactory, dataService, myCache, _) {
    $scope.activeTab = 'instance';
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
                $scope.reloadData();
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
 * App local detail controller
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
 * App online detail controller
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
 * App controller - add module
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



    // Post new module instance
    $scope.postModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
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
    };

    // Put module instance
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
            $scope.loading = false;
            $location.path('/error/' + error.status);
        });

    };


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
        default:
            break;
    }
    /**
     * Store form data
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
     * Activate module instance
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
     * Install module
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
     * Set dependencies
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