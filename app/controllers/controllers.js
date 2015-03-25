/**
 * Application controllers
 * @author Martin Vach
 */

/*** Controllers ***/
var myAppController = angular.module('myAppController', []);
/**
 * Base controller
 */
myAppController.controller('BaseController', function($scope, $cookies, $filter, $location, $route, cfg, dataFactory, dataService) {
    /**
     * Global scopes
     */
    $scope.cfg = cfg;
    $scope.loading = false;
    // Current profile
    $scope.demoColor = ['#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e'];
    $scope.profile = {
        'id': 1,
        'name': 'Default',
        'cssClass': 'profile-default',
        'active': true,
        'lang': cfg.lang,
        'positions': []
    };
    /**
     * Language settings
     */
    $scope.lang_list = cfg.lang_list;
    // Set language
    $scope.lang = (angular.isDefined($cookies.lang) ? $cookies.lang : cfg.lang);
    //$scope.lang = (angular.isDefined($scope.profile.lang) ? $scope.profile.lang : cfg.lang);
    // TODO: remove?
    $scope.changeLang = function(lang) {
        $cookies.lang = lang;
        $scope.lang = lang;
    };
    // Load language files
    $scope.loadLang = function(lang) {
        // Is lang in language list?
        var lang = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        dataFactory.getLanguageFile(function(data) {
            $scope.languages = data;
        }, lang);
    };
    // Get language lines
    $scope._t = function(key) {
        return dataService.getLangLine(key, $scope.languages);
    };
    // Watch for lang change
    $scope.$watch('lang', function() {
        $scope.loadLang($scope.lang);
    });

    /**
     * Set time
     */
    $scope.setTime = function() {
        var time = Math.round(+new Date() / 1000);
        $('#update_time_tick').html($filter('getCurrentTime')(time));
    };
    $scope.setTime();

    // Order by
    $scope.orderBy = function(field) {
        $scope.predicate = field;
        $scope.reverse = !$scope.reverse;
    };

    /**
     * Load base data (profiles, languages)
     */
    $scope.navpPofiles = [];
    $scope.loadBaseData = function() {
        dataFactory.getApiData('profiles', function(data) {
            $scope.navpPofiles = data.data;
        });
    };
    $scope.loadBaseData();

    /**
     * Get body ID
     */
    $scope.getBodyId = function() {
        var path = $location.path().split('/');
        if (path[1] == 'elements') {
            switch (path[2]) {
                case 'location':
                    return 'location';
                    break;
                case 'dashboard':
                    return 'dashboard';
                    break;
                default:
                    return 'elements';
                    break;
            }

        } else {
            return path[1];
        }

    };

    /**
     * Get current filter
     */
    $scope.getCurrFilter = function(index, val) {
        var path = $location.path().split('/');

    };
    /**
     * Get body ID
     */
    $scope.footer = 'Home footer';
    /**
     * 
     * Mobile detect
     */
    $scope.isMobile = dataService.isMobile(navigator.userAgent || navigator.vendor || window.opera);
    /*
     * Menu active class
     */
    $scope.isActive = function(route) {
        return (route === $scope.getBodyId() ? 'active' : '');
    };
    /**
     * Set profile
     */
    $scope.setProfile = function(data) {
        if (data.color) {
            $scope.profile.cssClass = 'profile-' + data.color.substring(1);
            data.cssClass = 'profile-' + data.color.substring(1);
        }
        if (data.name) {
            $scope.profile.name = data.name;
        }
        if (data.id) {
            $scope.profile.id = data.id;
        }
        if (data.lang) {
            $scope.profile.lang = data.lang;
        }
        if (data.positions) {
            $scope.profile.positions = data.positions;
        }

        $cookies.profile = angular.toJson(data);
        $route.reload();
    };
    /**
     * Get profile
     */
    $scope.getProfile = function() {
        var cookie = angular.fromJson($cookies.profile);
        if (cookie) {
            $scope.profile = cookie;
        }
    };
    $scope.getProfile();
    /**
     * Redirect to given url
     */
    $scope.redirectToRoute = function(url) {
        if (url) {
            $location.path(url);
        }
    };
});
/**
 * Test controller
 */
myAppController.controller('TestController', function($scope, $routeParams, $filter, $location, $log, $timeout, dataFactory, dataService) {
    $scope.loading = false;
    $scope.hideStuff = function() {
        $scope.startFade = true;
        $timeout(function() {
            $scope.hidden = true;
        }, 2000);

    };
    $scope.testLoader = function() {
        $scope.loading = {icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $timeout(function() {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
        }, 5000);
        console.log($scope.loading)
    };
    $scope.showModuleImage = function() {
        var cmd = 'fs.load("/blub/test_base64.jpg")';
        dataFactory.getJSCmd(cmd).then(function(response) {
            var x = response.data.replace(/["']/g, "");
            //x = btoa(unescape(encodeURIComponent(x)));
            console.log('blub: ', response.data.replace(/["']/g, ""));
            $scope.getModuleImage = x;
        }, function(error) {
            $log.error('ERROR: ', error);
        });
    };
    $scope.showModuleImage();
    dataFactory.localData('test_base64.jpeg', function(response) {
        console.log(response)
        $scope.binImage2 = response;

    });
});
/**
 * Home controller
 */
myAppController.controller('HomeController', function($scope, dataFactory, dataService) {

});
/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, $location, $interval, dataFactory, dataService, myCache) {
    $scope.apiDataInterval = null;
    $scope.collection = [];
    $scope.showFooter = true;
    $scope.deviceType = [];
    $scope.tags = [];
    $scope.rooms = [];
    $scope.history = [];
    $scope.levelVal = [];
    $scope.rgbVal = [];
    $scope.profileData = [];
    $scope.chartOptions = {
        // Chart.js options can go here.
        //responsive: true
    };
    $scope.knobopt = {
        width: 100
    };

    $scope.slider = {
        modelMax: 38
    };
    $scope.input = {
        'id': null,
        'metrics': null,
        'location': null,
        'tags': null,
        'permanently_hidden': false,
        'title': '',
        'dashboard': false,
        'deviceType': null,
        'level': null
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        dataFactory.cancelApiDataInterval();
        $interval.cancel($scope.apiDataInterval);
    });
    /**
     * DEPRECATED
     */
//    $scope.$watch('rgbVal', function() {
//        console.log($scope.val)
//    });

    /**
     * Load data into collection
     */
    dataFactory.setCache(true);
    $scope.loadData = function() {
        //getData(callback,api,cache,params)
        dataFactory.getApiData('devices', function(data) {
            var filter = null;
            $scope.deviceType = dataService.getDeviceType(data.data.devices);
            $scope.tags = dataService.getTags(data.data.devices);
            loadProfile();
            // Loacations
            loadLocations();
            // History
            loadHistory();
            // Filter
            if (angular.isDefined($routeParams.filter) && angular.isDefined($routeParams.val)) {
                switch ($routeParams.filter) {
                    case 'dashboard':
                        $scope.showFooter = false;
                        filter = {filter: "onDashboard", val: true};
                        break;
                    case 'deviceType':
                        filter = $routeParams;
                        break;
                    case 'tags':
                        filter = $routeParams;
                        break;
                    case 'location':
                        $scope.showFooter = false;
                        filter = $routeParams;
                        if (angular.isDefined($routeParams.name)) {
                            $scope.headline = $scope._t('lb_devices_room') + ' ' + $routeParams.name;
                        }
                        break;
                    default:
                        break;
                }
            }
            loadInstances(data.data.devices, filter);

        });
    };
    $scope.loadData();

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            dataFactory.refreshApi('devices').then(function(response) {
                dataService.updateDevices(response.data, $scope.updateValues);
                dataService.updateTimeTick(response.data.data.updateTime);
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshData();
    /**
     * DEPRECATED
     */

//    $scope.updateData = function() {
//        dataFactory.updateApiData('devices', function(data) {
//            dataService.updateDevices(data, $scope.updateValues);
//        });
//    };
    //$scope.updateData();

    // Clear history json cache
    $scope.clearHistoryCache = function() {
        var refresh = function() {
            myCache.remove('history');
        };
        $interval(refresh, $scope.cfg.history_cache_interval);
    };
    $scope.clearHistoryCache();

    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
    /**
     * Add tag to list
     */
    $scope.addTag = function(tag) {
        if (!tag || $scope.input.tags.indexOf(tag) > -1) {
            return;
        }
        $scope.input.tags.push(tag);
        $scope.addNewTag = null;
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function(index) {
        $scope.input.tags.splice(index, 1);
    };
    /**
     * Update an item
     */
    $scope.store = function(input) {
        var inputData = {
            'id': input.id,
            'location': input.location,
            'tags': dataService.setArrayValue(input.tags, 'dashboard', input.dashboard),
            'permanently_hidden': input.permanently_hidden,
            'metrics': input.metrics
        };
        inputData.metrics.title = input.title;
        if (input.id) {
            //Load devices
            dataFactory.putApiData('devices', input.id, inputData, function(data) {
                //Load profiles
                dataFactory.getApiData('profiles', function(data) {
                    var profile = dataService.getRowBy(data.data, 'id', $scope.profile.id);
                    $scope.profileData = {
                        'id': profile.id,
                        'name': profile.name,
                        'positions': dataService.setArrayValue(profile.positions, input.id, input.dashboard)
                    };
                    saveDeviceIdIntoProfile(data, $scope.profileData);
                });
                myCache.remove('devices');
                myCache.remove('profiles');
                $scope.loadData();
            });
        }

    };
    /**
     * Redirect to module config
     */
    $scope.toModule = function(id, target) {
        $('.modal').remove();
        $('.modal-backdrop').remove();
        $('body').removeClass("modal-open");
        $location.path('module/put/' + id);
    };
    /**
     * Run command
     */
    $scope.runCmd = function(cmd) {
        dataFactory.runCmd(cmd);
        return;
    };
    /**
     * Run command exact value
     */
    $scope.runCmdExact = function(id, type, min, max) {
        var count;
        var val = parseInt($scope.levelVal[id]);
        var min = parseInt(min, 10);
        var max = parseInt(max, 10);
        switch (type) {
            case '-':
                count = val - 1;
                break;
            case '+':
                count = val + 1;
                break;
            default:
                count = parseInt(type, 10);
                break;
        }

        if (count < min) {
            count = min;
        }
        if (count > max) {
            count = max;
        }

        var cmd = id + '/command/exact?level=' + count;
        //if (count < 100 && count > 0) {
        $scope.levelVal[id] = count;
        //}

        console.log(cmd);
        dataFactory.runCmd(cmd);
        return;
    };

    /**
     * Save color
     */
    $scope.setRBGColor = function(id, color) {
        var array = color.match(/\((.*)\)/)[1].split(',');
        var cmd = id + '/command/exact?red=' + array[0] + '&green=' + array[1] + '&blue=' + array[2];
        dataFactory.runCmd(cmd);
        myCache.remove('devices');
        //$scope.rgbVal[id] = color;
    };
    /**
     * Reset color
     */
    $scope.resetRBGColor = function(id, color) {
        $scope.rgbVal[id] = color;
    };

    /// --- Private functions --- ///
    /**
     * Load profile
     */
    function loadProfile() {
        dataFactory.getApi('profiles').then(function(response) {
            var profile = dataService.getRowBy(response.data.data, 'id', $scope.profile.id);
            $scope.profileData = {
                'id': profile ? profile.id : 1,
                'name': profile ? profile.name : 'Default',
                'positions': profile ? profile.positions : []
            };
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    /**
     * Load history
     */
    function loadHistory() {
        dataFactory.getApi('history').then(function(response) {
            angular.forEach(response.data.data.history, function(v, k) {
                $scope.history[v.id] = dataService.getChartData(v.mH, $scope.cfg.chart_colors);

            });
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    /**
     * Load locations
     */
    function loadLocations() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    /**
     * Load instances
     */
    function loadInstances(devices, filter) {
        dataFactory.getApi('instances').then(function(response) {
            $scope.collection = dataService.getDevices(devices, filter, $scope.profileData.positions, response.data.data);
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

    /**
     * Save device id into profile
     */
    function saveDeviceIdIntoProfile(data, profileData) {
        if (data.error == null) {
            dataFactory.putApiData('profiles', profileData.id, profileData, function(data) {
            });
        }
        return;
    }
});
/**
 * Event controller
 */
myAppController.controller('EventController', function($scope, $routeParams, $interval, $window, dataFactory, dataService, myCache, paginationService, cfg) {
    $scope.collection = [];
    $scope.eventLevels = [];
    $scope.eventSources = [];
    $scope.currLevel = null;
    $scope.currentPage = 1;
    $scope.pageSize = cfg.page_results_events;
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };
    $scope.apiDataInterval = null;

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getApi('notifications').then(function(response) {
            setData(response.data);
            dataService.updateTimeTick(response.data.data.updateTime);
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            dataFactory.refreshApi('notifications').then(function(response) {
                //dataService.logInfo(response,'Refresh notifications');
                angular.forEach(response.data.data.notifications, function(v, k) {
                    $scope.collection.push(v);
                });
                dataService.updateTimeTick(response.data.data.updateTime);
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshData();

    /**
     * Watch for pagination change
     */
    $scope.$watch('currentPage', function(page) {
        paginationService.setCurrentPage(page);
    });

    $scope.setCurrentPage = function(val) {
        $scope.currentPage = val;
    };

    /**
     * Delete system events
     */
    $scope.deleteSystemEvents = function(dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApi('notifications', 'system').then(function(response) {
                myCache.remove('notifications');
            }, function(error) {
                alert($scope._t('error_delete_data'));
                dataService.logError(error);
            });
        }
    };

    /**
     * Update data into collection
     */
    $scope.markAsRead = function(id) {
        $('#row_' + id).fadeOut();
    };

    /// --- Private functions --- ///
    /**
     * Set events data
     */
    function setData(data) {
        $scope.eventLevels = dataService.getEventLevel(data.data.notifications, [{'key': null, 'val': 'all'}]);
        $scope.eventSources = dataService.getPairs(data.data.notifications, 'source', 'source');
        var filter = null;
        if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
            $scope.currSource = $routeParams.val;
            $scope.currLevel = $routeParams.val;
            filter = $routeParams;
            console.log(filter)
            angular.forEach(data.data.notifications, function(v, k) {
                if (filter && angular.isDefined(v[filter.param])) {
                    if (v[filter.param] == filter.val) {
                        $scope.collection.push(v);
                    }
                }
            });
        } else if (angular.isDefined($routeParams.param) && $routeParams.param == 'source_type') {
            filter = $routeParams;
            angular.forEach(data.data.notifications, function(v, k) {
                if (v.source == filter.source && v.type == filter.type) {
                    $scope.collection.push(v);
                }
            });
        } else {
            $scope.collection = data.data.notifications;
        }
    }
    ;
});
/**
 * Profile controller
 */
myAppController.controller('ProfileController', function($scope, $window, $cookies, dataFactory, dataService) {
    $scope.collection = [];
    $scope.targetColor = '#6C7A89';
    $scope.input = {
        "id": null,
        "active": "false",
        "name": null,
        "description": null,
        "lang": 'en',
        "positions": [],
        "color": null,
        "groups": {
            "instances": []
        }

    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getApi('profiles').then(function(response) {
            dataService.logInfo(response, 'Profiles');
            $scope.collection = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();
    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        //var profileLang = (angular.fromJson($cookies.profileLang) ? angular.fromJson($cookies.profileLang) : []);
        var inputData = {
            "id": input.id,
            "name": input.name,
            "active": input.active,
            "lang": input.lang

        };
        if (input.id) {
            dataFactory.putApiData('profiles', input.id, inputData, function(data) {
                $scope.collection.push = data.data;
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            });
        } else {
            dataFactory.postApiData('profiles', inputData, function(data) {
                $scope.collection.push = data.data;
                dataFactory.setCache(false);
                $scope.loadData();
                input.id = data.data.id

            });
        }
//        if (profileLang.length > 0) {
//            angular.forEach(profileLang, function(v, k) {
//                if (v['id'] != input.id) {
//                    profileLang.push({'id': input.id, 'lang': input.lang});
//                }
//            });
//        } else {
//            profileLang.push({'id': input.id, 'lang': input.lang});
//        }
//         $cookies.profileLang = angular.toJson(profileLang);

    };
    /**
     * Delete an item
     */
    $scope.delete = function(target, input, dialog, except) {
        if (input.id == except) {
            return;
        }
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApiData('profiles', input.id, target);
            dataFactory.setCache(false);
            $scope.loadData();
        }
    };
});
/**
 * App controller
 */
myAppController.controller('AppController', function($scope, $window, $cookies, $timeout, $log, dataFactory, dataService, myCache) {
    $scope.instances = [];
    $scope.modules = [];
    $scope.modulesIds = [];
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
    $scope.proccessDownload = [];
    $scope.proccessDeleteModule = [];
    /**
     * Load data into collections
     */
    dataFactory.setCache(true);

    $scope.loadCategories = function() {
        dataFactory.getApiData('modules_categories', function(data) {
            $scope.categories = data.data;
        });
    };
    $scope.loadCategories();
    $scope.loadModules = function(filter) {
        dataFactory.getApiData('modules', function(data) {
            $scope.modules = dataService.getData(data.data, filter);
            angular.forEach(data.data, function(v, k) {
                $scope.modulesIds.push(v.id);

            });
        });
    };
    $scope.loadOnlineModules = function(filter) {
        dataFactory.localData('online.json', function(response) {
            $scope.onlineModules = response;
            angular.forEach(response, function(v, k) {
                if (v.modulename && v.modulename != '') {
                    $scope.onlineVersion[v.modulename] = v.version;
                }
            });
        });
//        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
//            $scope.onlineModules = response.data;//dataService.getData(response.data, filter);
//        }, function(error) {
//            dataService.showConnectionError(error);
//        });

    };
    $scope.loadInstances = function() {
        dataFactory.getApiData('instances', function(data) {
            $scope.instances = data.data;
        }, null, true);
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
        switch ($scope.activeTab) {
            case 'instance':
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
                        filter = {
                            'filter': 'category',
                            'val': $scope.category
                        };
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
        if (input.id) {
            dataFactory.putApiData('instances', input.id, input, function(data) {
                myCache.remove('devices');
                myCache.remove('instances');
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
                $(target).fadeOut(2000);

            }, function(error) {
                alert($scope._t('error_delete_data'));
                $log.error('ERROR: ', error);
            });
            myCache.remove('instances');
            myCache.remove('devices');
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
            $scope.proccessDeleteModule[input.id] = {icon: 'fa-spinner fa-spin'};
            dataFactory.deleteApi('modules', input.id).then(function(response) {
                $scope.proccessDeleteModule[input.id] = {icon: false};
                $(target).fadeOut(2000);

            }, function(error) {
                alert($scope._t('error_delete_data'));
                $scope.proccessDeleteModule[input.id] = {icon: false};
                $log.error('ERROR: ', error);
            });
        }
    };
    /**
     * Download module
     */
    $scope.downloadModule = function(id, modulename) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var cmd = 'Run/system("/opt/module_downloader.sh ' + id + ' ' + modulename + '")';
        dataFactory.getSystemCmd(cmd).then(function(response) {
            $timeout(function() {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_module_download')};
            }, 3000);

        }, function(error) {
            $scope.loading = false;
            alert($scope._t('error_no_module_download'));
            $log.error('ERROR: ', error);
        });

    };

});
/**
 * App local detail controller
 */
myAppController.controller('AppLocalDetailController', function($scope, $routeParams, $log, dataFactory, dataService) {
    $scope.module = [];
    $scope.isOnline = null;
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        dataFactory.getApiData('modules', function(data) {
            $scope.module = dataService.getRowBy(data.data, 'id', id);
            loadOnlineModules(id);
        });
    };
    /**
     * Load online modules
     */
    $scope.loadOnlineModules = function(moduleName) {
        dataFactory.localData('online.json', function(response) {
            var hasOnline = dataService.getRowBy(response, 'modulename', moduleName);

            console.log(hasOnline)
        });
//        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
//            $scope.onlineModules = response.data;//dataService.getData(response.data, filter);
//        }, function(error) {
//            dataService.showConnectionError(error);
//        });

    };

    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
//        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
//             $scope.isOnline = dataService.getRowBy(response, 'modulename', moduleName);
//        }, function(error) {
//            $log.error('ERROR: ', error);
//            //dataService.showConnectionError(error);
//        });
        dataFactory.localData('online.json', function(response) {
            $scope.isOnline = dataService.getRowBy(response, 'modulename', moduleName);
        });
    }

});
/**
 * App online detail controller
 */
myAppController.controller('AppOnlineDetailController', function($scope, $routeParams, $log, $timeout, dataFactory, dataService) {
    $scope.module = [];
    $scope.proccessDownload = {
        icon: false,
        message: false,
        status: 'alert-hidden'
    };
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        var param = parseInt(id, 10);
        var filter = 'id';
        if (isNaN(param)) {
            filter = 'modulename';
        }
        dataFactory.localData('online.json', function(response) {
            $scope.module = dataService.getRowBy(response, filter, id);
        });
//        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
//            $scope.module = dataService.getRowBy(response.data, filter, id);
//        }, function(error) {
//            dataService.showConnectionError(error);
//        });
    };

    $scope.loadModule($routeParams.id);

    /**
     * Download module
     */
    $scope.downloadModule = function(id, modulename) {
        $scope.proccessDownload = {icon: 'fa-spinner fa-spin'};
        var cmd = 'Run/system("/opt/module_downloader.sh ' + id + ' ' + modulename + '")';
        dataFactory.getSystemCmd(cmd).then(function(response) {
            $scope.proccessDownload = {icon: false, message: $scope._t('success_module_download'), status: 'alert-success'};
            $timeout(function() {
                $scope.proccessDownload = {icon: false, message: false};
            }, 3000);
        }, function(error) {
            $scope.proccessDownload = {icon: false};
            alert($scope._t('error_no_module_download'));
            $log.error('ERROR: ', error);
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

    // Post new module instance
    $scope.postModule = function(id) {
        dataFactory.getApiData('modules', function(module) {
            dataFactory.getApiData('namespaces', function(namespaces) {
                var formData = dataService.getModuleFormData(module.data, module.data.defaults, namespaces.data);
                var langCode = (angular.isDefined(cfg.lang_codes[$scope.lang]) ? cfg.lang_codes[$scope.lang] : null);
                $scope.input = {
                    'instanceId': 0,
                    'moduleId': id,
                    'active': true,
                    'title': $filter('hasNode')(formData, 'data.title'),
                    'description': $filter('hasNode')(formData, 'data.description'),
                    'moduleTitle': $filter('hasNode')(formData, 'data.title'),
                    'category': module.data.category
                };
                $scope.showForm = true;
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }
                $.alpaca.setDefaultLocale(langCode);
                $('#alpaca_data').alpaca(formData);
            });
        }, '/' + id + '?lang=' + $scope.lang);
    };

    // Put module instance
    $scope.putModule = function(id) {
        if (id < 1) {
            return;
        }
        dataFactory.getApiData('instances', function(data) {
            var instance = data.data;
            dataFactory.getApiData('modules', function(module) {
                dataFactory.getApiData('namespaces', function(namespaces) {
                    var formData = dataService.getModuleFormData(module.data, instance.params, namespaces.data);

                    $scope.input = {
                        'instanceId': instance.id,
                        'moduleId': module.data.id,
                        'active': instance.active,
                        'title': instance.title,
                        'description': instance.description,
                        'moduleTitle': instance.title,
                        'category': module.data.category
                    };
                    $scope.showForm = true;
                    if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                        $scope.alpacaData = false;
                        return;
                    }

                    $('#alpaca_data').alpaca(formData);


                });
            }, '/' + instance.moduleId + '?lang=' + $scope.lang);

        }, '/' + id, true);
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
     * 
     * Deprecated
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
            dataFactory.putApiData('instances', input.instanceId, inputData, function(data) {
                myCache.remove('devices');
                $location.path('/apps');
            });
        } else {

            dataFactory.postApiData('instances', inputData, function(data) {
                myCache.remove('devices');
                $location.path('/apps');
            });
        }
    };

});
/**
 * Device controller
 */
myAppController.controller('DeviceController', function($scope, $routeParams, dataFactory, dataService) {
    $scope.zwaveDevices = [];
    $scope.zwaveDevicesFilter = false;
    $scope.deviceVendor = false;
    $scope.manufacturers = [];
    $scope.manufacturer = false;

    $scope.ipcameraDevices = [];

    if (angular.isDefined($routeParams.type)) {
        $scope.deviceVendor = $routeParams.type;
    }
    /**
     * Set filter
     */
    $scope.setFilter = function(filter) {
        $scope.zwaveDevicesFilter = filter;
    };
    /**
     * Load z-wave devices
     */
    $scope.loadZwaveDevices = function(filter, lang) {
        dataFactory.localData('device.' + lang + '.json', function(data) {
            $scope.manufacturers = dataService.getPairs(data, 'brandname', 'brand_image', 'manufacturers');
            if (filter) {
                console.log(filter)
                $scope.zwaveDevices = dataService.getData(data, filter);
                console.log($scope.zwaveDevices)
                $scope.manufacturer = filter.val;
            }

        });
    };

    /**
     * Load ip cameras
     */
    $scope.loadIpcameras = function() {
        dataFactory.getApiData('modules', function(data) {
            $scope.ipcameraDevices = dataService.getData(data.data, {filter: "category", val: "surveillance"});
        });
    };

    $scope.$watch('deviceVendor', function() {
        switch ($scope.deviceVendor) {
            case 'zwave':
                $scope.$watch('zwaveDevicesFilter', function() {
                    $scope.loadZwaveDevices($scope.zwaveDevicesFilter, $scope.lang);
                });
                break;
            case 'ipcamera':
                $scope.loadIpcameras();
                break;
            case 'enocean':
                break;
            default:
                break;
        }
    });
});
/**
 * Device controller
 */
myAppController.controller('IncludeController', function($scope, $routeParams, $timeout, dataFactory) {
    $scope.device = {
        'data': null
    };
    $scope.controllerState = 0;
    $scope.zwaveApiData = [];
    $scope.includedDeviceId = null;
    $scope.lastIncludedDevice = null;
    $scope.lastExcludedDevice = null;
    $scope.hasBattery = false;
    $scope.inclusionError = false;
    $scope.clearStepStatus = false;
    $scope.messages = {
        "nm_controller_state_0": "Controller is in normal mode",
        "nm_controller_state_1": "Ready to include.",
        "nm_controller_state_2": "Device found, please wait...",
        "nm_controller_state_3": "Including device, please wait...",
        "nm_controller_state_4": "Device included.",
        "nm_controller_state_5": "Ready to exclude.",
        "nm_controller_state_6": "Device found, please wait...",
        "nm_controller_state_7": "Device excluded.",
        "nm_controller_state_8": "Ready to be (re-)included in the network.",
        "nm_controller_state_9": "(Re-)inclusion started.",
        "nm_controller_state_10": "Controller found, please wait...",
        "nm_controller_state_11": "(Re-)including myself in network, please wait...",
        "nm_controller_state_12": "Controller was (re-)included in network.",
        "nm_controller_state_13": "Ready to include new primary. Press a button on the device to be included.",
        "nm_controller_state_14": "Device found, please wait...",
        "nm_controller_state_15": "Including new primary, please wait...",
        "nm_controller_state_16": "Device included as primary.",
        "nm_controller_state_17": "Canceling.",
        "nm_controller_state_18": "Replace Failed Node process started.",
        "nm_controller_state_19": "Replace Failed Node ready to include replacement device."
    };
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        dataFactory.cancelApiDataInterval();
    });
    /**
     * Load data into collection
     */
    $scope.loadData = function(lang) {
        // Get device from JSON
        if (angular.isDefined($routeParams.device)) {
            dataFactory.localData('device.' + lang + '.json', function(devices) {
                angular.forEach(devices, function(v, k) {
                    if (v.id == $routeParams.device) {
                        $scope.device.data = v;
                        return;
                    }
                });

            });
        }

        // Get ZwaveApiData
        dataFactory.updateZwaveApiData(function(data) {
            if ('controller.data.controllerState' in data) {
                $scope.controllerState = data['controller.data.controllerState'].value;
                //console.log($scope.controllerState);
            }
            if ('controller.data.lastExcludedDevice' in data) {
                $scope.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            }
            if ('controller.data.lastIncludedDevice' in data) {
                var deviceIncId = data['controller.data.lastIncludedDevice'].value;
                if (deviceIncId != null) {
                    var givenName = 'Device_' + deviceIncId;
                    var cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                    dataFactory.runZwaveCmd(cmd);
                    $scope.includedDeviceId = deviceIncId;
                }
            }
        });
    };

    $scope.loadData($scope.lang);

    // Watch for last excluded device
    $scope.$watch('includedDeviceId', function() {
        if ($scope.includedDeviceId) {
            var timeOut;
            timeOut = $timeout(function() {
                dataFactory.getZwaveApiData(function(ZWaveAPIData) {
                    var interviewDone = true;
                    var nodeId = $scope.includedDeviceId;
                    var instanceId = 0;
                    var hasBattery = 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses;
                    var vendor = ZWaveAPIData.devices[nodeId].data.vendorString.value;
                    var deviceType = ZWaveAPIData.devices[nodeId].data.deviceTypeString.value;
                    $scope.hasBattery = hasBattery;
                    // Check interview
                    if (ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value && ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length) {
                        for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                            if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0) {
                                for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                                    if (!ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId].data.interviewDone.value) {
                                        console.log('Interview false: 1')
                                        interviewDone = false;
                                    }
                                }
                            } else {
                                console.log('Interview false: 2')
                                interviewDone = false;
                            }
                        }

                    } else {
                        console.log('Interview false: 3')
                        interviewDone = false;
                    }
                    // Set device name
                    var deviceName = function(vendor, deviceType) {
                        if (!vendor && deviceType) {
                            return 'Device';
                        }
                        return vendor + ' ' + deviceType;
                    };
                    if (interviewDone) {
                        $scope.lastIncludedDevice = deviceName(vendor, deviceType) + ' ' + nodeId + '-' + instanceId;
                    } else {
                        $scope.inclusionError = true;
                    }

                    $scope.includedDeviceId = null;
                });

            }, 15000);
        }
    });

    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function(cmd) {
        $scope.lastIncludedDevice = null;
        $scope.lastExcludedDevice = null;
        dataFactory.runZwaveCmd(cmd);

    };


});
/**
 * Room controller
 */
myAppController.controller('RoomController', function($scope, dataFactory) {
    $scope.collection = [];
    $scope.upload = {
        'showProgress': false,
        'progressVal': 0
    };
    $scope.showProgress = false;
    $scope.input = {
        'id': null,
        'name': null
    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getApiData('locations', function(data) {
            $scope.collection = data.data;
        });
    };
    $scope.loadData();
    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
});
/**
 * Room config controller
 */
myAppController.controller('RoomConfigController', function($scope, $window, $interval, $upload, cfg, dataFactory, dataService) {
    $scope.collection = [];
    $scope.devicesAssigned = [];
    //$scope.devicesAvailable = [];
    $scope.devicesToRemove = [];
    $scope.upload = {
        'showProgress': false,
        'progressVal': 0
    };
    $scope.defaultImages = $scope.cfg.room_images;
    $scope.showProgress = false;
    $scope.input = {
        'id': null,
        'title': null,
        'icon': null
    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    dataFactory.setCache(true);
    $scope.loadData = function() {
        dataFactory.getApiData('locations', function(data) {
            $scope.collection = data.data;
        });
    };
    $scope.loadData();


    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.loadDevices = function() {
            dataFactory.getApiData('devices', function(data) {
                $scope.devices = dataService.getDevices(data.data.devices, false, false, false, input.id);
                $scope.devicesAssigned = dataService.getDevices(data.data.devices, {filter: "location", val: input.id});

            });
        };
        $scope.loadDevices();
        $scope.input = input;
        $(target).modal();
    };
    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        var inputData = {
            "id": input.id,
            "title": input.title,
            "icon": input.icon
        };

        if (input.id) {
            dataFactory.putApiData('locations', input.id, inputData, function(data) {
                $scope.collection.push = data.data;
                $scope.saveRoomIdIntoDevice(data, $scope.devicesAssigned);
                $scope.removeRoomIdFromDevice(data, $scope.devicesToRemove);
                dataFactory.setCache(false);
                $scope.loadData();
            });
        } else {
            dataFactory.postApiData('locations', inputData, function(data) {
                $scope.collection.push = data.data;
                $scope.saveRoomIdIntoDevice(data, $scope.devicesAssigned);
                $scope.removeRoomIdFromDevice(data, $scope.devicesToRemove);
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            });
        }
        return;

    };
    /**
     * Delete an item
     */
    $scope.delete = function(target, input, dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApiData('locations', input.id, target);
            dataFactory.getApiData('devices', function(data) {
                var devices = dataService.getDevices(data.data.devices, {filter: "location", val: input.id});
                $scope.removeRoomIdFromDevice({'error': null}, devices);

            });
            dataFactory.setCache(false);
            $scope.loadData();
        }
    };
    /**
     * Assign device to room
     */
    $scope.assignDevice = function(id, selector, assign) {
        $(selector).toggleClass('hidden-device');
        $('#device_assigned_' + id).toggleClass('hidden-device');
        $scope.devicesAssigned.push(assign);
        return;

    };
    /**
     * Remove device from the room
     */
    $scope.removeDevice = function(id, selector, deviceId) {
        $(selector).toggleClass('hidden-device');
        $('#device_unassigned_' + id).toggleClass('hidden-device');
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        angular.forEach(oldList, function(v, k) {
            if (v.id != deviceId) {
                $scope.devicesAssigned.push(v);
            } else {
                $scope.devicesToRemove.push(v);
            }
        });
        return;
    };

    /**
     * Save room id into device
     */
    $scope.saveRoomIdIntoDevice = function(data, devices) {
        if (data.error == null) {
            angular.forEach(devices, function(v, k) {
                dataFactory.putApiData('devices', v.id, {'location': data.data.id}, function(data) {
                    //console.log(data);
                });
            });
        }
        return;

    };

    /**
     * Remove room id from device
     */
    $scope.removeRoomIdFromDevice = function(data, devices) {
        if (data.error == null) {
            angular.forEach(devices, function(v, k) {
                dataFactory.putApiData('devices', v.id, {'location': null}, function(data) {
                    // console.log(data);
                });
            });
        }
        return;

    };

    /**
     * Upload image
     */
    $scope.uploadImage = function($files) {
        $scope.showProgress = true;
        $scope.upload.showProgress = true;
        var url = 'upload.php';
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];
            $upload.upload({
                url: url,
                fileFormDataName: 'config_backup',
                file: $file
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                console.log(data);
            });
        }
        var countUp = function() {

            $scope.upload.progressVal += 5;
            if ($scope.upload.progressVal == 100) {
                $interval.cancel(progress);
                $scope.upload.showProgress = false;
                $scope.upload.progressVal = 0;
            }
        };
        var progress = $interval(countUp, 100);
    };
});
/**
 * Network controller
 */
myAppController.controller('NetworkController', function($scope, $cookies, $filter, dataFactory, dataService) {
    $scope.activeTab = (angular.isDefined($cookies.tab_network) ? $cookies.tab_network : 'battery');
    $scope.batteries = {
        'list': [],
        'cntLess20': [],
        'cnt0': []
    };
    $scope.devices = {
        'failed': [],
        'batteries': [],
        'zwave': []
    };

    $scope.zWaveDevices = {};

    $scope.testSort = [];

    $scope.notInterviewDevices = [];
    $scope.reset = function() {
        $scope.batteries = angular.copy([]);
    };

    /**
     * Set tab
     */
    $scope.setTab = function(tabId) {
        $scope.activeTab = tabId;
        $cookies.tab_network = tabId;
    };

    $scope.loadData = function() {
        dataFactory.getApi('devices').then(function(response) {
            zwaveApiData(response.data.data.devices);
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();

    /// --- Private functions --- ///
    /**
     * Get zwaveApiData
     */
    function zwaveApiData(devices) {

        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            if (!ZWaveAPIData.devices) {
                return;
            }

            angular.forEach(ZWaveAPIData.devices, function(v, k) {
                if (k == 1) {
                    return;
                }
                dataService.logInfo(k, 'Node ID')
                $scope.zWaveDevices[k] = {
                    id: k,
                    title: v.data.givenName.value || 'Device ' + '_' + k,
                    elements: []
                };
            });
            dataService.logInfo($scope.zWaveDevices, 'Node ID')
            var findZwaveStr = "ZWayVDev_zway_";
            angular.forEach(devices, function(v, k) {
                var cmd;
                var nodeId;
                var iId;
                var ccId;
                if (v.id.indexOf(findZwaveStr) > -1) {
                    cmd = v.id.split(findZwaveStr)[1].split('-');
                    nodeId = cmd[0];
                    iId = cmd[1];
                    ccId = cmd[2];
                    var node = ZWaveAPIData.devices[nodeId];
                    if (node) {
                        var isFailed = node.data.isFailed.value;
                        var interviewDone = node.instances[iId].commandClasses[ccId].data.interviewDone.value;
                        //var hasBattery = 0x80 in node.instances[0].commandClasses;
                        var obj = {};
                        obj['id'] = v.id;
                        obj['nodeId'] = nodeId;
                        obj['title'] = v.metrics.title;
                        obj['level'] = $filter('toInt')(v.metrics.level);
                        obj['metrics'] = v.metrics;
                        obj['messages'] = [];
                        $scope.devices.zwave.push(obj);
                        $scope.zWaveDevices[nodeId]['elements'].push(obj);
                        // Batteries
                        if (v.deviceType === 'battery') {
                            $scope.devices.batteries.push(obj);
                        }
//                            if (hasBattery) {
//                                $scope.devices.batteries.push(obj);
//                            }
                        // Not interview
                        if (!interviewDone) {
                            obj['messages'].push($scope._t('lb_not_configured'));
                        }
                        // Is failed
                        if (isFailed) {
                            obj['messages'].push($scope._t('lb_is_failed'));
                        }
                        //console.log(v.id + ': ' + nodeId + ', ' + iId + ', ' + ccId)
                        //console.log('Interview done:' + interviewDone, 'isFailed:' + isFailed);
                        $scope.devices.failed.push(obj);
                    }

                }
            });
            // Count device batteries
            for (i = 0; i < $scope.devices.batteries.length; ++i) {
                var battery = $scope.devices.batteries[i];
                if (battery.level < 1) {
                    $scope.batteries.cnt0.push(battery.id);
                }
                if (battery.level > 0 && battery.level < 20) {
                    $scope.batteries.cntLess20.push(battery.id);
                }

            }
            //dataService.updateTimeTick(12345);
            //$scope.devices.zwave = $filter('naturalSort')($scope.devices.zwave);
//                $scope.devices.zwave.sort(function(a, b) {
//                    var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
//                    if (nameA < nameB){ //sort string ascending
//                        return -1;
//                    }
//                    if (nameA > nameB){
//                        return 1;
//                    }
//                    return 0; //default return value (no sorting)
//                });
            //console.log($scope.devices.zwave)
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
});
/**
 * Profile controller
 */
myAppController.controller('AdminController', function($scope, $window, $cookies, dataFactory, dataService, myCache) {
    $scope.profiles = [];

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getApi('profiles').then(function(response) {
            $scope.profiles = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();

    /**
     * Delete an item
     */
    $scope.delete = function(target, input, dialog, except) {
        if (input.id == except) {
            return;
        }
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }

        if (confirm) {
            dataFactory.deleteApi('profiles', input.id).then(function(response) {
                //$(target).fadeOut(2000);
                myCache.remove('profiles');
                $scope.loadData();

            }, function(error) {
                alert($scope._t('error_delete_data'));
                $log.error('ERROR: ', error);
            });
        }
    };
});
/**
 * Orofile detail
 */
myAppController.controller('AdminUserController', function($scope, $routeParams, $filter, $location, $log, $timeout, dataFactory, dataService, myCache) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.input = {
        id: 0,
        name: null,
        active: true,
        description: null,
        positions: [],
        lang: 'en'

    };

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            dataService.logInfo(response.data.data);
            $scope.input = response.data.data;
            $scope.loading = false;
        }, function(error) {
            $scope.input = false;
            $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
            dataService.showConnectionError(error);
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    }

    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        //var profileLang = (angular.fromJson($cookies.profileLang) ? angular.fromJson($cookies.profileLang) : []);

        var inputData = {
            id: input.id,
            name: input.name,
            active: input.active,
            positions: $scope.input.positions,
            lang: input.lang

        };
        dataFactory.storeApi('profiles', input.id, inputData).then(function(response) {
            var id = $filter('hasNode')(response,'data.data.id');
            //dataService.logInfo(response, 'Profile http response data');
            if(id){
                myCache.remove('profiles');
                $scope.loadData(id);
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });
//        if (profileLang.length > 0) {
//            angular.forEach(profileLang, function(v, k) {
//                if (v['id'] != input.id) {
//                    profileLang.push({'id': input.id, 'lang': input.lang});
//                }
//            });
//        } else {
//            profileLang.push({'id': input.id, 'lang': input.lang});
//        }
//         $cookies.profileLang = angular.toJson(profileLang);

    };

});
/**
 * My Access
 */
myAppController.controller('MyAccessController', function($scope, $routeParams, $filter, $location, $log, $timeout, dataFactory, dataService, myCache) {
    $scope.id = 1;//$filter('toInt')($routeParams.id);
    $scope.input = {
        id: 0,
        name: null,
        active: true,
        description: null,
        positions: [],
        lang: 'en'

    };

    /**
     * Load data
     */
    $scope.loadData = function(id) {

        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            dataService.logInfo(response.data.data);
            $scope.input = response.data.data;
            $scope.loading = false;
        }, function(error) {
            $scope.input = false;
            $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
            dataService.showConnectionError(error);
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    }

    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        //var profileLang = (angular.fromJson($cookies.profileLang) ? angular.fromJson($cookies.profileLang) : []);

//        var inputData = {
//            id: input.id,
//            name: input.name,
//            active: input.active,
//            positions: $scope.input.positions,
//            lang: input.lang
//
//        };
        dataFactory.putApi('profiles', input.id, input).then(function(response) {
            dataService.logInfo(response, 'Profile http response data');
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            myCache.remove('profiles');
            $scope.loadData(input.id);

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });

    };

});
/**
 * Login controller
 */
myAppController.controller('LoginController', function($scope, $cookies, $location, dataFactory, dataService) {
    $scope.input = {
        login: '',
        password: '',
        keepme: false
    };
    /**
     * Login proccess
     */
    $scope.login = function(input) {
        dataService.logInfo(input);
        $location.path('/elements/dashboard/1');
    };

});
/**
 * About controller
 */
myAppController.controller('AboutController', function($scope, dataFactory) {

});

