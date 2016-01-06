/**
 * Application App controller
 * @author Martin Vach
 */

/**
 * App base controller
 */
myAppController.controller('AppBaseController', function ($scope, $filter, $cookies, $timeout, $route, $routeParams, $location, dataFactory, dataService, myCache, _) {
    angular.copy({
        appsCategories: false
    }, $scope.expand);
    $scope.dataHolder = {
        modules: {
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
            }
        },
        onlineModules: {
            all: {},
            ids: {},
            filter: {}
        },
        tokens: {
            all: {}
        },
        instances: {
            all: {}
        }
    };

    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;

    /**
     * Load tokens
     */
    $scope.loadTokens = function (filter) {
        dataFactory.getApi('tokens', null, true).then(function (response) {
            angular.extend($scope.dataHolder.tokens.all, response.data.data.tokens);
            $scope.loadOnlineModules();
            //$scope.loadOnlineModules(filter);
        }, function (error) {
        });
    };
    $scope.loadTokens();
    /**
     * Load categories
     */
    $scope.loadLocalCategories = function () {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (cat) {
                $scope.dataHolder.modules.categories = cat[$scope.lang] ? _.indexBy(cat[$scope.lang], 'id') : _.indexBy(cat[$scope.cfg.lang], 'id');
            }

        }, function (error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadLocalCategories();

    /**
     * Load local modules
     */
    $scope.loadLocalModules = function () {
        dataFactory.getApi('modules').then(function (response) {
            $scope.dataHolder.modules.all = _.chain(response.data.data)
                    .flatten()
                    .filter(function (item) {
                        //$scope.dataHolder.modules.ids.push(item.id);
                        $scope.dataHolder.modules.ids[item.id] = {version: item.version};
                        //$scope.dataHolder.modules.all[item.id] = item;
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
                                //$scope.localModules.featured[item.moduleName] = item;
                            } else {
                                angular.extend(item, {featured: false});
                            }
                            return items;
                        }
                    })
                    .where($scope.dataHolder.modules.filter)
                    .value();
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function (error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };

    $scope.loadLocalModules();

    /**
     * Load online modules
     */
    $scope.loadOnlineModules = function () {
        dataFactory.getOnlineModules({token: _.values($scope.dataHolder.tokens.all)}).then(function (response) {
            $scope.dataHolder.onlineModules.all = _.chain(response.data.data)
                    .flatten()
                    .filter(function (item) {
                        var isHidden = false;
                        var obj = {};
                        obj[item.modulename] = 'dfdf';
                        $scope.dataHolder.onlineModules.ids[item.modulename] = {version: item.version};
                        if ($scope.getHiddenApps().indexOf(item.modulename) > -1) {
                            if ($scope.user.role !== 1) {
                                isHidden = true;
                            } else {
                                isHidden = ($scope.user.expert_view ? false : true);
                            }
                        }
                        if (!isHidden) {
                            item.featured = (item.featured == 1 ? true : false);
                            return item;
                        }
                    })
                    .where($scope.dataHolder.onlineModules.filter)
                    .value();
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function (error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };

    /**
     * Load instances
     */
    $scope.loadInstances = function () {
        dataFactory.getApi('instances').then(function (response) {
            $scope.dataHolder.instances.all = _.reject(response.data.data, function (v) {
                //return v.state === 'hidden' && ($scope.user.role !== 1 && $scope.user.expert_view !== true);
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
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function (error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };
    $scope.loadInstances();

});
/**
 * App local controller
 */
myAppController.controller('AppLocalController', function ($scope, $filter, $cookies, $timeout, $route, $routeParams, $location, dataFactory, dataService, myCache, _) {
    $scope.activeTab = 'local';
    //$scope.dataHolder.modules.filter = {featured: true};
    $scope.dataHolder.modules.filter = ($cookies.filterAppsLocal ? angular.fromJson($cookies.filterAppsLocal) : {featured: true});
    console.log($cookies.filterAppsLocal)
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

        $scope.loadLocalModules();
    };

    /**
     * Delete module
     */
    $scope.deleteModule = function (input, message) {

        alertify.confirm(message, function () {
            //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('online_delete', input.id).then(function (response) {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t(response.data.data.key)};
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alert(message);
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
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t(response.data.data.key)};
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alert(message);
            });
        });
    };

});
/**
 * App online controller
 */
myAppController.controller('AppOnlineController', function ($scope, $filter, $cookies, $timeout, $route, dataFactory, myCache, _) {
    $scope.activeTab = 'online';
    $scope.dataHolder.onlineModules.filter = ($cookies.filterAppsOnline ? angular.fromJson($cookies.filterAppsOnline) : {featured: true});

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        if (!filter) {
            angular.extend($scope.dataHolder.onlineModules, {filter: {}});
            $cookies.filterAppsOnline = angular.toJson({});
            //delete $cookies['filterAppsOnline'];
        } else {
            angular.extend($scope.dataHolder.onlineModules, {filter: filter});
            $cookies.filterAppsOnline = angular.toJson(filter);
        }
        $scope.loadOnlineModules();
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
            $timeout(function () {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t(response.data.data.key)};
                myCache.removeAll();
                $route.reload();
            }, 3000);

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alert(message);
        });

    };
    /**
     * Update module
     */
    $scope.updateModule = function (module, confirm) {
        alertify.confirm(confirm, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
            var data = {
                moduleUrl: $scope.cfg.online_module_download_url + module.file
            };
            dataFactory.installOnlineModule(data, 'online_update').then(function (response) {
                $timeout(function () {
                    $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t(response.data.data.key)};
                    myCache.removeAll();
                    $route.reload();
                }, 3000);

            }, function (error) {
                $scope.loading = false;
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
                alertify.alert(message);
            });
        });


    };

});
/**
 * App Instance controller
 */
myAppController.controller('AppInstanceController', function ($scope, $route, dataFactory, myCache, _) {
    $scope.activeTab = 'instance';
    $scope.activateInstance = function (input, activeStatus) {
        input.active = activeStatus;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.loading = false;
                myCache.remove('instances');
                myCache.remove('instances/' + input.moduleId);
                myCache.remove('devices');
                //$scope.loadInstances();
                $route.reload();

            }, function (error) {
                alertify.alert($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function (target, input, message) {
        alertify.confirm(message, function () {
            dataFactory.deleteApi('instances', input.id).then(function (response) {
                $(target).fadeOut(500);
                myCache.remove('instances');
                myCache.remove('devices');
            }, function (error) {
                alertify.alert($scope._t('error_delete_data'));
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
        }, function (error) {
            dataService.showConnectionError(error);
        });
    };

    /**
     * Load module detail
     */
    $scope.loadModule = function (id) {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/' + id).then(function (response) {
            loadOnlineModules(id);
            $scope.module = response.data.data;
            $scope.loadCategories(response.data.data.category);
            //$scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function (response) {
            $scope.isOnline = _.findWhere(response.data, {modulename: moduleName});
            dataService.updateTimeTick();
        }, function (error) {
        });
    }

});
/**
 * App online detail controller
 */
myAppController.controller('AppOnlineDetailController', function ($scope, $routeParams, $timeout, $location, $route, myCache, dataFactory, dataService, _) {
    $scope.local = {
        installed: false
    };
    $scope.module = [];
    $scope.comments = {
        all: {},
        model: {
            module_id: parseInt($routeParams.id,10),
            content: '',
            name: '',
            remote_id: ''
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
            }

        }, function (error) {
            dataService.showConnectionError(error);
        });
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
        }, function (error) {
            dataService.showConnectionError(error);
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
        dataService.showConnectionSpinner();
        dataFactory.postToRemote($scope.cfg.online_moduleid_url, {id: id, lang: $scope.lang}).then(function (response) {
            $scope.module = response.data.data;
            $scope.loadLocalModules({moduleName: $scope.module.modulename});
            $scope.loadCategories($scope.module.category);
            dataService.updateTimeTick();
        }, function (error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadModuleId($routeParams.id);

    /**
     * Load comments
     */
    $scope.loadComments = function () {
        var response = [
            {
                "id": 0,
                "module_id": 222,
                "remote_id": 12345,
                "type": 0,
                "name": "Sanchez",
                "content": "Officia cupidatat consectetur officia eiusmod nulla enim voluptate minim. Reprehenderit nulla minim occaecat exercitation culpa laborum anim occaecat id sunt enim do sunt deserunt. Eiusmod cupidatat exercitation et deserunt reprehenderit minim ad tempor minim eiusmod consequat eiusmod culpa veniam. Proident officia veniam fugiat aliqua cupidatat nostrud elit ex exercitation culpa fugiat aliquip veniam.\r\n",
                "created_at": "2015-09-24T09:30:43 -02:00"
            },
            {
                "id": 1,
                "module_id": 222,
                "remote_id": 12345,
                "type": 1,
                "name": "Abbott",
                "content": "Dolor amet nulla magna consectetur adipisicing ullamco irure pariatur. Voluptate dolor eu qui labore do ipsum consequat proident velit irure adipisicing proident elit non. In nisi non enim ipsum fugiat qui.\r\n",
                "created_at": "2014-02-14T05:06:51 -01:00"
            },
            {
                "id": 2,
                "module_id": 222,
                "remote_id": 12345,
                "type": 0,
                "name": "Hurley",
                "content": "Nostrud sit voluptate mollit amet voluptate. Excepteur quis in minim veniam ad esse exercitation anim irure consequat. Sunt laboris elit duis quis eiusmod occaecat amet occaecat ex incididunt anim amet. Aliquip labore eiusmod officia nulla exercitation aliquip duis nisi.\r\n",
                "created_at": "2015-09-17T03:07:58 -02:00"
            },
            {
                "id": 3,
                "module_id": 222,
                "remote_id": 12345,
                "type": 1,
                "name": "Bernard",
                "content": "Eu est anim elit nostrud veniam exercitation incididunt enim. Velit velit officia dolore in esse occaecat consectetur. Consectetur occaecat qui culpa dolore pariatur cupidatat ipsum Lorem veniam enim voluptate. Velit nisi exercitation in tempor exercitation. Amet veniam dolore et cupidatat. Cillum ea enim eu duis esse enim reprehenderit amet dolore aliquip.\r\n",
                "created_at": "2014-07-11T10:30:07 -02:00"
            },
            {
                "id": 4,
                "module_id": 222,
                "remote_id": 12345,
                "type": 0,
                "name": "Hunt",
                "content": "Dolore adipisicing fugiat culpa eu officia laboris cillum consectetur eiusmod nostrud. Nisi deserunt voluptate cillum in dolor labore veniam eu commodo laboris esse labore aute eiusmod. Sint ipsum magna culpa ea.\r\n",
                "created_at": "2014-06-16T08:12:39 -02:00"
            },
            {
                "id": 5,
                "module_id": 222,
                "remote_id": 12345,
                "type": 1,
                "name": "Cochran",
                "content": "Cupidatat cupidatat adipisicing duis et consequat laboris ipsum deserunt excepteur. Minim est culpa elit nisi duis tempor dolor esse aliquip. Culpa commodo cupidatat sit esse tempor laboris nostrud et reprehenderit labore do.\r\n",
                "created_at": "2015-12-26T04:40:46 -01:00"
            },
            {
                "id": 6,
                "module_id": 222,
                "remote_id": 12345,
                "type": 1,
                "name": "Jennings",
                "content": "Ipsum mollit Lorem fugiat non aute. Consectetur cillum voluptate nulla reprehenderit eu tempor id. Quis aliqua mollit labore do adipisicing quis velit. Et mollit ad officia dolore esse ea exercitation duis ut voluptate in adipisicing deserunt.\r\n",
                "created_at": "2015-01-07T09:59:07 -01:00"
            },
            {
                "id": 7,
                "module_id": 222,
                "remote_id": 12345,
                "type": 0,
                "name": "Crosby",
                "content": "Commodo officia cupidatat laborum velit et quis Lorem eu ullamco nisi qui cillum sit cillum. Anim laborum consequat in cupidatat pariatur velit voluptate in anim occaecat laborum. Mollit voluptate nostrud non eiusmod aute do adipisicing id aliqua Lorem consequat laborum. Voluptate reprehenderit reprehenderit nostrud sint culpa. Velit laboris veniam laborum consectetur excepteur ad adipisicing nostrud. Est reprehenderit proident consequat deserunt est anim nulla amet reprehenderit.\r\n",
                "created_at": "2015-08-11T01:33:29 -02:00"
            },
            {
                "id": 8,
                "module_id": 222,
                "remote_id": 12345,
                "type": 1,
                "name": "Charles",
                "content": "Est aliquip aute consectetur ad Lorem quis irure elit ad voluptate aute est Lorem. Enim aliqua duis commodo do elit voluptate ut sint dolor voluptate voluptate dolor. Aute do ipsum nisi sit consequat deserunt culpa nisi reprehenderit cupidatat nulla incididunt eu enim. Qui sit culpa ipsum minim. Ea eiusmod reprehenderit culpa nostrud irure velit incididunt dolor enim.\r\n",
                "created_at": "2015-09-21T12:40:25 -02:00"
            }
        ];
        $scope.comments.all = response;
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
            $timeout(function () {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t(response.data.data.key)};
                myCache.removeAll();
                $route.reload();
            }, 3000);

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alert(message);
        });

    };

    /**
     * Add comment
     */
    $scope.addComment = function (form, input) {
        if (form.$invalid) {
            return;
        }
        console.log(input)
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        //alertify.alert($scope._t('error_update_data'));
        $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('comment_add_successful')};
        $scope.expand.appcommentadd = false;
        $scope.loadComments($routeParams.id);
        input.content = '';
        input.name = '';
        return;
        dataFactory.postToRemote($scope.cfg.online_module_installed_url, {id: module.id}).then(function (response) {
            $timeout(function () {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('comment_add_successful')};
                myCache.removeAll();
                $route.reload();
            }, 3000);

        }, function (error) {
            $scope.loading = false;
            alertify.alert($scope._t('comment_add_failed'));

        });

    };

});
/**
 * App controller - add module
 */
myAppController.controller('AppModuleAlpacaController', function ($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache, cfg) {
    $scope.showForm = false;
    $scope.success = false;
    $scope.alpacaData = true;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.collection = {};
    $scope.input = {
        'instanceId': 0,
        'active': true,
        'moduleId': null,
        'title': null,
        'description': null,
        'moduleTitle': null,
        'category': null
    };

    $scope.onLoad = function () {
        myCache.remove('instances');
    };
    $scope.onLoad();
    // Post new module instance
    $scope.postModule = function (id) {
        dataService.showConnectionSpinner();
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
            dataService.updateTimeTick();
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
            $location.path('/error/' + error.status);
        });
    };

    // Put module instance
    $scope.putModule = function (id) {
        if (id < 1) {
            return;
        }
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
            var instance = instances.data.data;
            dataFactory.getApi('modules', '/' + instance.moduleId + '?lang=' + $scope.lang, true).then(function (module) {
                if (module.data.data.state === 'hidden') {
                    if (!$scope.user.expert_view) {
                        dataService.updateTimeTick();
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
                dataService.updateTimeTick();
                $scope.loading = false;
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }

                $('#alpaca_data').alpaca(formData);

            }, function (error) {
                alertify.alert($scope._t('error_load_data'));
                dataService.showConnectionError(error);
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
                $location.path('/apps/instance');

            }, function (error) {
                alertify.alert($scope._t('error_update_data'));
            });
        } else {
            dataFactory.postApi('instances', inputData).then(function (response) {
                myCache.remove('devices');
                $location.path('/apps/local');

            }, function (error) {
                alertify.alert($scope._t('error_update_data'));
            });
        }
    };

});