/**
 * Application App controller
 * @author Martin Vach
 */

/**
 * App controller
 */
myAppController.controller('AppController', function($scope, $window, $cookies, $timeout, $route, dataFactory, dataService, myCache, _) {
    $scope.instances = [];
    $scope.hasImage = [];
    $scope.modules = [];
    $scope.modulesIds = [];
    $scope.modulesCats = [];
    $scope.moduleImgs = [];
    $scope.onlineModules = [];
    $scope.onlineVersion = [];
    $scope.categories = [];
    $scope.activeTab = (angular.isDefined($cookies.tab_app) ? $cookies.tab_app : 'local');
    $scope.category = '';
    $scope.showFooter = true;
    $scope.modalLocal = {};
    $scope.showInFooter = {
        'categories': true,
        'serach': true
    };
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;
    /**
     * Load categories
     */
    $scope.loadCategories = function() {
        dataFactory.getApi('modules_categories').then(function(response) {
            $scope.categories = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadCategories();

    /**
     * Load local modules
     */
    $scope.loadModules = function(query) {
        var filter = null;
        if ($scope.user.role === 1 && $scope.user.expert_view) {
            filter = null;
        } else {
            filter = {filter: "state", val: "hidden", not: true};
        }
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
                if (item.category === 'surveillance') {
                    isHidden = true;
                }

                if (!isHidden) {
                    $scope.modulesIds.push(item.id);
                    $scope.moduleImgs[item.id] = item.icon;
                    if (item.category && $scope.modulesCats.indexOf(item.category) === -1) {
                        $scope.modulesCats.push(item.category);
                    }
                    return item;
                }
            });
            $scope.modules = _.where(modulesFiltered, query);
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };

    /**
     * Load online modules
     */
    $scope.loadOnlineModules = function() {
        
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
//            $scope.onlineModules = response.data;
//            angular.forEach(response.data, function(v, k) {
//                if (v.modulename && v.modulename != '') {
//                    $scope.onlineVersion[v.modulename] = v.version;
//                }
//            });
            $scope.onlineModules = _.filter(response.data, function(item) {
                var isHidden = false;
                if ($scope.getHiddenApps().indexOf(item.modulename) > -1) {
                    if ($scope.user.role !== 1) {
                        isHidden = true;
                    } else {
                        isHidden = ($scope.user.expert_view ? false : true);
                    }
                }

                if (!isHidden) {
                    return item;
                }
            });
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };
    /**
     * Load instances
     */
    $scope.loadInstances = function() {
        dataFactory.getApi('instances').then(function(response) {
            $scope.instances = _.reject(response.data.data, function(v) {
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
        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };

    /**
     * Set tab
     */
    $scope.setTab = function(tabId) {
        $scope.activeTab = tabId;
        $cookies.tab_app = tabId;
    };

    // Watch for tab change
    $scope.$watch('activeTab', function() {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        switch ($scope.activeTab) {
            case 'instance':
                $scope.loadModules();
                $scope.showInFooter.categories = false;
                $scope.loadInstances();

                break;
            case 'hidden':
                $scope.showInFooter.categories = false;
                break;
            case 'online':
                $scope.loadOnlineModules();
                $scope.loadModules();
                $scope.showInFooter.categories = false;
                break;
            default:
                $scope.showInFooter.categories = true;
                $scope.$watch('category', function() {
                    $scope.modules = angular.copy([]);
                    var filter = false;
                    if ($scope.category != '') {
                        filter = {category: $scope.category};
                    }
                    $scope.loadModules(filter);
                    $scope.loadOnlineModules();
                    $scope.loadInstances();
                });
                break;
        }
    });

    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.modalLocal = input;
        $(target).modal();
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
                $scope.loadInstances();

            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function(target, input, dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApi('instances', input.id).then(function(response) {
                $(target).fadeOut(500);
                myCache.remove('instances');
                myCache.remove('devices');
            }, function(error) {
                alert($scope._t('error_delete_data'));
            });

        }
    };
    /**
     * Delete module
     */
    $scope.deleteModule = function(target, input, dialog) {
        var hasInstance = false;
        angular.forEach($scope.instances, function(v, k) {
            if (input.id == v.moduleId)
                hasInstance = $scope._t('error_module_delete_active') + v.title;
            return;

        });
        if (hasInstance) {
            alert(hasInstance);
            return;
        }
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('modules', input.id).then(function(response) {
                myCache.remove('modules');
                $(target).fadeOut(2000);
                //$scope.loading = false;

            }, function(error) {
                $scope.loading = false;
                alert($scope._t('error_delete_data'));
            });
        }
    };
    /**
     * Download module
     */
    $scope.downloadModule = function(modulename) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + modulename + '.tar.gz'
        };
        dataFactory.installOnlineModule(data).then(function(response) {
            $timeout(function() {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_module_download')};
                myCache.removeAll();
                $route.reload();
            }, 3000);

        }, function(error) {
            $scope.loading = false;
            alert($scope._t('error_no_module_download'));
        });

    };

});

/**
 * IN PROGRESS
 * App local controller
 */
myAppController.controller('AppLocalController', function($scope, $window, $cookies, $timeout, $route, dataFactory, dataService, myCache, _) {
    $scope.instances = [];
    $scope.hasImage = [];
    $scope.modules = [];
    $scope.modulesIds = [];
    $scope.modulesCats = [];
    $scope.moduleImgs = [];
    $scope.onlineModules = [];
    $scope.onlineVersion = [];
    $scope.categories = [];
    $scope.activeTab = (angular.isDefined($cookies.tab_app) ? $cookies.tab_app : 'local');
    $scope.category = '';
    $scope.showFooter = true;
    $scope.modalLocal = {};
    $scope.showInFooter = {
        'categories': true,
        'serach': true
    };
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;
    /**
     * Load categories
     */
    $scope.loadCategories = function() {
        dataFactory.getApi('modules_categories').then(function(response) {
            $scope.categories = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadCategories();

    /**
     * Load local modules
     */
    $scope.loadModules = function(query) {
        var filter = null;
        if ($scope.user.role === 1 && $scope.user.expert_view) {
            filter = null;
        } else {
            filter = {filter: "state", val: "hidden", not: true};
        }
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
                if (item.category === 'surveillance') {
                    isHidden = true;
                }

                if (!isHidden) {
                    $scope.modulesIds.push(item.id);
                    $scope.moduleImgs[item.id] = item.icon;
                    if (item.category && $scope.modulesCats.indexOf(item.category) === -1) {
                        $scope.modulesCats.push(item.category);
                    }
                    return item;
                }
            });
            $scope.modules = _.where(modulesFiltered, query);
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };
    
     $scope.loadModules(filter);

    /**
     * Load online modules
     */
    $scope.loadOnlineModules = function() {
        //return;
        // Uncomment after integration
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
            $scope.onlineModules = response.data;
            angular.forEach(response.data, function(v, k) {
                if (v.modulename && v.modulename != '') {
                    $scope.onlineVersion[v.modulename] = v.version;
                }
            });
            $scope.loading = false;
            dataService.updateTimeTick();
        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };
    /**
     * Load instances
     */
    $scope.loadInstances = function() {
        dataFactory.getApi('instances').then(function(response) {
            $scope.instances = _.reject(response.data.data, function(v) {
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
        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };

    /**
     * Set tab
     */
    $scope.setTab = function(tabId) {
        $scope.activeTab = tabId;
        $cookies.tab_app = tabId;
    };

    // Watch for tab change
    $scope.$watch('activeTab', function() {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        switch ($scope.activeTab) {
            case 'instance':
                $scope.loadModules();
                $scope.showInFooter.categories = false;
                $scope.loadInstances();

                break;
            case 'hidden':
                $scope.showInFooter.categories = false;
                break;
            case 'online':
                $scope.loadOnlineModules();
                $scope.loadModules();
                $scope.showInFooter.categories = false;
                break;
            default:
                $scope.showInFooter.categories = true;
                $scope.$watch('category', function() {
                    $scope.modules = angular.copy([]);
                    var filter = false;
                    if ($scope.category != '') {
                        filter = {category: $scope.category};
                    }
                    $scope.loadModules(filter);
                    $scope.loadOnlineModules();
                    $scope.loadInstances();
                });
                break;
        }
    });

    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.modalLocal = input;
        $(target).modal();
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
                $scope.loadInstances();

            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function(target, input, dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApi('instances', input.id).then(function(response) {
                $(target).fadeOut(500);
                myCache.remove('instances');
                myCache.remove('devices');
            }, function(error) {
                alert($scope._t('error_delete_data'));
            });

        }
    };
    /**
     * Delete module
     */
    $scope.deleteModule = function(target, input, dialog) {
        var hasInstance = false;
        angular.forEach($scope.instances, function(v, k) {
            if (input.id == v.moduleId)
                hasInstance = $scope._t('error_module_delete_active') + v.title;
            return;

        });
        if (hasInstance) {
            alert(hasInstance);
            return;
        }
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('modules', input.id).then(function(response) {
                myCache.remove('modules');
                $(target).fadeOut(2000);
                //$scope.loading = false;

            }, function(error) {
                $scope.loading = false;
                alert($scope._t('error_delete_data'));
            });
        }
    };
    /**
     * Download module
     */
    $scope.downloadModule = function(modulename) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + modulename + '.tar.gz'
        };
        dataFactory.installOnlineModule(data).then(function(response) {
            $timeout(function() {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_module_download')};
                myCache.removeAll();
                $route.reload();
            }, 3000);

        }, function(error) {
            $scope.loading = false;
            alert($scope._t('error_no_module_download'));
        });

    };

});
/**
 * App local detail controller
 */
myAppController.controller('AppLocalDetailController', function($scope, $routeParams, $location, dataFactory, dataService, _) {
    $scope.module = [];
     $scope.categoryName = '';
    $scope.isOnline = null;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load categories
     */
    $scope.loadCategories = function(id) {
        dataFactory.getApi('modules_categories').then(function(response) {
           var category = _.findWhere(response.data.data, {id: id});
           if(category){
               $scope.categoryName = category.name;
           }
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
   
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/' + id).then(function(response) {
            loadOnlineModules(id);
            $scope.module = response.data.data;
             $scope.loadCategories(response.data.data.category);
            //$scope.loading = false;
        }, function(error) {
            $scope.loading = false;
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
            $scope.isOnline = _.findWhere(response.data, {modulename: moduleName});
            dataService.updateTimeTick();
        }, function(error) {
        });
    }

});
/**
 * App online detail controller
 */
myAppController.controller('AppOnlineDetailController', function($scope, $routeParams, $timeout, $location, dataFactory, dataService, _) {
    $scope.module = [];
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        dataService.showConnectionSpinner();
        var param = parseInt(id, 10);
        var filter = {id: id};
        if (isNaN(param)) {
            filter = {modulename: id};
        }
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
            $scope.module = _.findWhere(response.data, filter);
            if (!$scope.module) {
                $location.path('/error/404');
                return;
            }
            dataService.updateTimeTick();
        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };

    $scope.loadModule($routeParams.id);

    /**
     * Download module
     */
    $scope.downloadModule = function(id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + id + '.tar.gz'
        };
        dataFactory.installOnlineModule(data).then(function(response) {
            $timeout(function() {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_module_download')};
            }, 3000);

        }, function(error) {
            $scope.loading = false;
            alert($scope._t('error_no_module_download'));
        });

    };

});
/**
 * App controller - add module
 */
myAppController.controller('AppModuleAlpacaController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache, cfg) {
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

    $scope.onLoad = function() {
        myCache.remove('instances');
    };
    $scope.onLoad();
    // Post new module instance
    $scope.postModule = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('modules', '/' + id + '?lang=' + $scope.lang,true).then(function(module) {
            dataFactory.getApi('namespaces',null,true).then(function(namespaces) {
                var formData = dataService.getModuleFormData(module.data.data, module.data.data.defaults, namespaces.data.data);
                var langCode = (angular.isDefined(cfg.lang_codes[$scope.lang]) ? cfg.lang_codes[$scope.lang] : null);
                $scope.input = {
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
                $scope.showForm = true;
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }
                $.alpaca.setDefaultLocale(langCode);
                $('#alpaca_data').alpaca(formData);
                dataService.updateTimeTick();
            }, function(error) {
                alert($scope._t('error_load_data'));
                dataService.showConnectionError(error);
            });

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };

    // Put module instance
    $scope.putModule = function(id) {
        if (id < 1) {
            return;
        }
        dataService.showConnectionSpinner();
        dataFactory.getApi('instances', '/' + id, true).then(function(instances) {
            var instance = instances.data.data;
            dataFactory.getApi('modules', '/' + instance.moduleId + '?lang=' + $scope.lang,true).then(function(module) {
                if (module.data.data.state === 'hidden') {
                    if (!$scope.user.expert_view) {
                        dataService.updateTimeTick();
                        return;
                    }

                }
                dataFactory.getApi('namespaces',null,true).then(function(namespaces) {
                    var formData = dataService.getModuleFormData(module.data.data, instance.params, namespaces.data.data);

                    $scope.input = {
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
                    if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                        $scope.alpacaData = false;
                        return;
                    }

                    $('#alpaca_data').alpaca(formData);

                    dataService.updateTimeTick();
                }, function(error) {
                    alert($scope._t('error_load_data'));
                    dataService.showConnectionError(error);
                });
                dataService.updateTimeTick();
            }, function(error) {
                alert($scope._t('error_load_data'));
                dataService.showConnectionError(error);
            });
        }, function(error) {
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
    $scope.store = function(data) {
        var defaults = ['instanceId', 'moduleId', 'active', 'title', 'description'];
        var input = [];
        var params = {};
        angular.forEach(data, function(v, k) {
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
            dataFactory.putApi('instances', input.instanceId, inputData).then(function(response) {
                myCache.remove('devices');
                $location.path('/apps');

            }, function(error) {
                alert($scope._t('error_update_data'));
            });
        } else {
            dataFactory.postApi('instances', inputData).then(function(response) {
                myCache.remove('devices');
                $location.path('/apps');

            }, function(error) {
                alert($scope._t('error_update_data'));
            });
        }
    };

});