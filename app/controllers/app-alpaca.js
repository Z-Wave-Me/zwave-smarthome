/**
 * @overview Controllers that handle the Alpaca.
 * @author Martin Vach
 */

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
        fromapp: ($routeParams.fromapp && $routeParams.fromapp !== 'false') ? $routeParams.fromapp : false,
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
        }, function (error) {
        });
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
