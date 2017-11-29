/**
 * @overview Controllers that handle the Local apps, Online Apps and Active apps.
 * @author Martin Vach
 */

/**
 * Apps root controller
 * @class AppBaseController
 *
 */
myAppController.controller('AppBaseController', function ($scope, $rootScope, $filter, $cookies, $q, $route, $http, $timeout, cfg, dataFactory, dataService, _) {
    angular.copy({
        appsCategories: false
    }, $scope.expand);


    $scope.dataHolder = {
        modules: {
            hasUpgrade: {},
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                appsCatFeatured: 0,
                featured: 0
            },
            all: [],
            collection: [],
            noSearch: false,
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
            orderBy: ($cookies.orderByAppsLocal ? $cookies.orderByAppsLocal : 'titleASC'),
            autocomplete: {
                source: [],
                term: '',
                searchInKeys: 'id,title,description,author',
                returnKeys: 'id,title,author,icon,moduleName,hasInstance',
                strLength: 2,
                resultLength: 10
            }
        },
        onlineModules: {
            connect: {
                status: false,
                icon: 'fa-globe fa-spin'
            },
            alert: {message: false, status: 'is-hidden', icon: false},
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                appsCatFeatured: 0,
                featured: 0,
                featuredStatus: 0,
                upgraded: 0
            },
            noSearch: false,
            ratingRange: _.range(1, 6),
            collection: [],
            all: {},
            featured: [],
            ids: {},
            filter: {},
            hideInstalled: ($cookies.hideInstalledApps ? $filter('toBool')($cookies.hideInstalledApps) : false),
            orderBy: ($cookies.orderByAppsOnline ? $cookies.orderByAppsOnline : 'creationTimeDESC'),
            autocomplete: {
                source: [],
                term: '',
                searchInKeys: 'id,title,description,author',
                returnKeys: 'id,title,author,installed,rating,icon',
                strLength: 2,
                resultLength: 10
            }
        },
        tokens: {
            all: {}
        },
        instances: {
            expanded: ($cookies.instancesExpanded == 'true'),//$cookies.instancesExpanded,
            expandable: false,
            all: {},
            groups: {},
            cnt: {
                modules: 0
            },
            noSearch: false,
            filter: {},
            orderBy: ($cookies.orderByAppsInstances ? $cookies.orderByAppsInstances : 'creationTimeDESC'),
            autocomplete: {
                source: [],
                term: '',
                searchInKeys: 'id,title,description,moduleId',
                returnKeys: 'id,title,active,moduleId',
                strLength: 2,
                resultLength: 10
            }
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
     * Load tokens
     */
    $scope.loadTokens = function () {
        dataFactory.getApi('tokens').then(function (response) {
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
            $scope.dataHolder.onlineModules.connect = {
                status: true,
                icon: 'fa-globe'
            };
            setOnlineModules(response.data.data)
        }, function (error) {
            if (error.status === 0) {
                $scope.dataHolder.onlineModules.connect = {
                    status: false,
                    icon: 'fa-exclamation-triangle text-danger'
                };
                $scope.dataHolder.onlineModules.alert = {
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

    /**
     * Load all promises
     */
    $scope.allSettled = function (tokens) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules_categories'),
            dataFactory.getApi('modules'),
            dataFactory.getApi('instances',null,true)
        ];

        $q.allSettled(promises).then(function (response) {
            if (!$scope.routeMatch('/apps/online')) {
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
                    angular.forEach($scope.dataHolder.modules.categories, function (v, k) {
                        angular.extend($scope.dataHolder.modules.categories[k], {onlineModules: []});
                    });
                }
            }
            // Success - instances
            if (instances.state === 'fulfilled') {
                setInstances(instances.value.data.data);
                $scope.instancesExpandable();
            }

            // Success - modules
            if (modules.state === 'fulfilled') {
                setModules(modules.value.data.data, $scope.dataHolder.instances.all);
            }
            $scope.loadOnlineModules(tokens);
        });
    };


    /**
     * Check if instances expandable
     */
    $scope.instancesExpandable = function() {
        $scope.dataHolder.instances.expandable = _.find($scope.dataHolder.instances.cnt.modules, function(m) {return m >= 2;}) == undefined ? false : true ;
    }

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
                $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('reloading_page')};

                dataService.showNotifier({message: $scope._t(response.data.data.key)});
                //$route.reload();
                $timeout(function () {
                    $scope.loading = false;
                    $scope.reloadData();
                }, 2000);

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
        $scope.dataHolder.modules.cnt.advanced = 0;
        var modules = _.chain(data)
            .flatten()
            .filter(function (item) {
                item.title = item.defaults.title;
                item.description = item.defaults.description;
                // Has already instance ?
                item.hasInstance = $scope.dataHolder.instances.cnt.modules[item.id] || 0;
                // Prevent instalation for singelton item with instance
                item.preventInstall = (item.singleton && item.hasInstance ? true : false);
                // IDSs settings
                $scope.dataHolder.modules.ids[item.id] = {
                    version: item.version,
                    icon: $scope.moduleMediaUrl + item.id + '/' + item.icon,
                    singleton: item.singleton,
                    title: item.title
                };

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
//                if (item.singleton && item.hasInstance) {
//                    isHidden = true;
//                }

                if (!isHidden) {
                    var findLocationStr = item.location.split('/');
                    if (findLocationStr[0] === 'userModules') {
                        angular.extend(item, {custom: true});
                    } else {
                        angular.extend(item, {custom: false});
                    }
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
                    if ($scope.getCustomCfgArr('advanced_apps').indexOf(item.moduleName) > -1) {
                        angular.extend(item, {advanced: true});
                        // Count advanced apps
                        $scope.dataHolder.modules.cnt.advanced += 1;
                    } else {
                        angular.extend(item, {advanced: false});
                    }

                    //Tooltip description
                    angular.extend(item, {toolTipDescription: $filter('stripTags')(item.defaults.description)});

                    if (item.featured) {
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
            if (v.featured) {
                return v.category;
            }
        }).value();

        // Count advanced apps in categories
        $scope.dataHolder.modules.cnt.appsCatAdvanced = modules.countBy(function (v) {
            if (v.advanced) {
                return v.category;
            }
        }).value();

        // Count all apps
        $scope.dataHolder.modules.cnt.apps = modules.size().value();
        $scope.dataHolder.modules.all = modules.value();

        // Collection
        if ('q' in $scope.dataHolder.modules.filter) {// Filter by query
            // Set autcomplete term
            $scope.dataHolder.modules.autocomplete.term = $scope.dataHolder.modules.filter.q;
            var searchResult = _.indexBy(dataService.autocomplete($scope.dataHolder.modules.all, $scope.dataHolder.modules.autocomplete), 'id');
            if (_.isEmpty(searchResult)) {
                $scope.dataHolder.modules.noSearch = true;
            }
            $scope.dataHolder.modules.collection = _.filter($scope.dataHolder.modules.all, function (v) {
                if (searchResult[v.id]) {
                    return v;
                }
            });

        } else if('status' in $scope.dataHolder.modules.filter){
            $scope.dataHolder.modules.collection = modules.value();
        } else {
            $scope.dataHolder.modules.collection = modules.where($scope.dataHolder.modules.filter).value();
        }


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
        $scope.dataHolder.onlineModules.cnt.upgraded = 0;
        var featuredApps = [];
        var onlineModules = _.chain(data)
            .flatten()
            .filter(function (item) {
                // Replacing categories
                if (cfg.replace_online_cat[item.category]) {
                    item.category = cfg.replace_online_cat[item.category];
                }
                var isHidden = false;
                var obj = {};
                $scope.dataHolder.onlineModules.ids[item.modulename] = {
                    version: item.version,
                    file: item.file,
                    patchnotes: item.patchnotes
                };
                if ($scope.getHiddenApps().indexOf(item.modulename) > -1) {
                    if ($scope.user.role !== 1) {
                        isHidden = true;
                    } else {
                        isHidden = ($scope.user.expert_view ? false : true);
                    }
                }
                if ($scope.dataHolder.modules.ids[item.modulename]) {
                    item['status'] = 'installed';
                    item['statusSort'] = 3;
                    if ($scope.dataHolder.modules.ids[item.modulename].version !== item.version) {
                        if (!$scope.dataHolder.modules.ids[item.modulename].version && !item.version) {
                            item['status'] = 'error';

                        } else if (!$scope.dataHolder.modules.ids[item.modulename].version && item.version) {
                            item['status'] = 'upgrade';
                            item['statusSort'] = 1;
                        } else {
                            var localVersion = $scope.dataHolder.modules.ids[item.modulename].version.toString().split('.'),
                                onlineVersion = item.version.toString().split('.');

                            for (var i = 0; i < localVersion.length; i++) {
                                if ((parseInt(localVersion[i], 10) < parseInt(onlineVersion[i], 10)) || ((parseInt(localVersion[i], 10) <= parseInt(onlineVersion[i], 10)) && (!localVersion[i + 1] && onlineVersion[i + 1] && parseInt(onlineVersion[i + 1], 10) > 0))) {
                                    item['status'] = 'upgrade';
                                    item['statusSort'] = 1;
                                    $scope.dataHolder.onlineModules.cnt.upgraded++;
                                    break;
                                } else if ((parseInt(localVersion[i], 10) > parseInt(onlineVersion[i], 10))) {
                                    break;
                                }
                            }
                        }
                    }
                    isHidden = $scope.dataHolder.onlineModules.hideInstalled;
                } else {
                    item['statusSort'] = 2;
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

                if (item.featured) {
                    //$scope.dataHolder.onlineModules.featured.push(item)
                    featuredApps.push(item)
                }

                item.installedSort = $filter('zeroFill')(item.installed);
                //Tooltip description
                angular.extend(item, {toolTipDescription: $filter('stripTags')(item.description)});
                var hasCat = $scope.dataHolder.modules.categories[item.category];
                if (hasCat) {
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
            if (v.featured) {
                return v.category;
            }
        }).value();

        // Count all apps
        $scope.dataHolder.onlineModules.all = onlineModules.value();
        $scope.dataHolder.onlineModules.cnt.apps = onlineModules.size().value();
        // Sort featured
        $scope.dataHolder.onlineModules.featured =  _.sortBy(featuredApps, function(v) {
            return v.statusSort;
        });
        // Count featured by astatus
        $scope.dataHolder.onlineModules.cnt.featuredStatus = _.countBy(featuredApps,function (v) {
            return v.status;
        });

        // Collection
        if ('q' in $scope.dataHolder.onlineModules.filter) {// Filter by query
            // Set autcomplete term
            $scope.dataHolder.onlineModules.autocomplete.term = $scope.dataHolder.onlineModules.filter.q;
            var searchResult = _.indexBy(dataService.autocomplete($scope.dataHolder.onlineModules.all, $scope.dataHolder.onlineModules.autocomplete), 'id');
            if (_.isEmpty(searchResult)) {
                $scope.dataHolder.onlineModules.noSearch = true;
            }
            $scope.dataHolder.onlineModules.collection = _.filter($scope.dataHolder.onlineModules.all, function (v) {
                if (searchResult[v.id]) {
                    return v;
                }
            });

        } else {
            $scope.dataHolder.onlineModules.collection = onlineModules.where($scope.dataHolder.onlineModules.filter).value();
            //$scope.dataHolder.onlineModules.collection = modules.where($scope.dataHolder.onlineModules.filter).value();
        }


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
            if (!$scope.dataHolder.instances.groups[v.moduleId]) {
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
            }).filter(function (v) {
                if ($scope.dataHolder.instances.groups[v.moduleId]) {
                    var index = _.findIndex($scope.dataHolder.instances.groups[v.moduleId].instances,{id:v.id});
                    if(index === -1){
                        $scope.dataHolder.instances.groups[v.moduleId].instances.push(v);
                    }


                }
                return v;
            }).value();

        if ('q' in $scope.dataHolder.instances.filter) {// Filter by query
            // Set autcomplete term
            $scope.dataHolder.instances.autocomplete.term = $scope.dataHolder.instances.filter.q;
            var instancesGroup = $scope.dataHolder.instances.groups;
            // Clear scoupe group
            $scope.dataHolder.instances.groups = {};
            var searchResult = _.indexBy(dataService.autocomplete($scope.dataHolder.instances.all, $scope.dataHolder.instances.autocomplete), 'id');
            if (_.isEmpty(searchResult)) {
                $scope.dataHolder.instances.noSearch = true;
            }
            _.filter($scope.dataHolder.instances.all, function (v) {
                if (searchResult[v.id]) {
                    $scope.dataHolder.instances.groups[v.moduleId] = instancesGroup[v.moduleId];
                    return v;
                }
            });

        }
    }
    ;

});
