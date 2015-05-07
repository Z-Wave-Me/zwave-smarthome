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
    $scope.user = dataService.getUser();
    $scope.cfg.interval = ($scope.user.interval || $scope.cfg.interval);

    $scope.isValidUser = function(role) {

        if (!$scope.user || $scope.user.id < 1) {
            $location.path('/');
            return;

        }
        if (role && $scope.user.role != role) {
            $location.path('/elements');
            return;
        }
    };


    /**
     * Language settings
     */
    $scope.lang_list = cfg.lang_list;
    // Set language
    $scope.lang = ($scope.user ? $scope.user.lang : cfg.lang);
    $cookies.lang = $scope.lang;

    // Load language files
    $scope.loadLang = function(lang) {
        // Is lang in language list?
        var lang = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        dataFactory.getLanguageFile(lang).then(function(response) {
            $scope.languages = response.data;
        }, function(error) {
            dataService.showConnectionError(error);
            dataService.logError(error);
        });
    };
    // Get language lines
    $scope._t = function(key) {
        return dataService.getLangLine(key, $scope.languages);
    };

    // Watch for lang change
    $scope.$watch('lang', function() {
        $scope.loadLang($scope.lang);
    });

    // Order by
    $scope.orderBy = function(field) {
        $scope.predicate = field;
        $scope.reverse = !$scope.reverse;
    };

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
            return path[1] || 'login';
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
     * Set time
     */
    $scope.setTime = function() {
        dataService.updateTimeTick();
    };
    $scope.setTime();
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
myAppController.controller('TestController', function($scope, $routeParams, $filter, $location, $log, $cookies, $timeout, dataFactory, dataService) {
    $scope.isValidUser();
    console.log($cookies);
});
/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, $interval, dataFactory, dataService, myCache) {
    $scope.isValidUser();
    $scope.goHidden = [];
    $scope.goHistory = [];
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
        'level': null,
        'hide_events': false
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
        $('.modal').remove();
        $('.modal-backdrop').remove();
        $('body').removeClass("modal-open");
    });

    /**
     * Load data into collection
     */

    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices').then(function(response) {
            var filter = null;
            $scope.deviceType = dataService.getDeviceType(response.data.data.devices);
            $scope.tags = dataService.getTags(response.data.data.devices);
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
            loadInstances(response.data.data.devices, filter);
            $scope.loading = false;
            if (Object.keys(response.data.data.devices).length < 1) {
                $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-warning', message: $scope._t('no_data')};
            }

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
            dataFactory.refreshApi('devices').then(function(response) {
                dataService.updateDevices(response.data);
                dataService.updateTimeTick(response.data.data.updateTime);
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshData();

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
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            dataFactory.putApi('devices', input.id, input).then(function(response) {
                $scope.profileData.positions = dataService.setArrayValue($scope.profileData.positions, input.id, input.dashboard);
                $scope.profileData.hide_single_device_events = dataService.setArrayValue($scope.profileData.hide_single_device_events, input.id, input.hide_events);
                updateProfile($scope.profileData);

            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                dataService.logError(error);
            });
        }

    };
    /**
     * Run command
     */
    $scope.runCmd = function(cmd, id) {
        runCmd(cmd, id);
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

        runCmd(cmd);
        return;
    };

    /**
     * Save color
     */
    $scope.setRBGColor = function(id, color) {
        var array = color.match(/\((.*)\)/)[1].split(',');
        var cmd = id + '/command/exact?red=' + array[0] + '&green=' + array[1] + '&blue=' + array[2];
        runCmd(cmd);
        myCache.remove('devices');
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
        $scope.profileData = [];
        dataFactory.getApi('profiles', '/' + $scope.user.id).then(function(response) {
            var profile = response.data.data;
            $scope.profileData = {
                'id': profile.id,
                'name': profile.name,
                'positions': profile.positions,
                'hide_single_device_events': profile.hide_single_device_events
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
            dataService.updateTimeTick(response.data.data.updateTime);
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

    /**
     * Update profile
     */
    function updateProfile(profileData) {
        dataFactory.putApi('profiles', profileData.id, profileData).then(function(response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            myCache.remove('devices');
            myCache.remove('profiles');
            myCache.remove('profiles/' + $scope.user.id);
            $scope.profileData = [];
            $scope.input = [];
            $scope.loadData();

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });
        return;
    }

    /**
     * Process CMD
     */
    function runCmd(cmd, id) {
        var widgetId = '#Widget_' + id;
        dataFactory.runApiCmd(cmd).then(function(response) {
            $(widgetId + ' .widget-image').addClass('trans-true');
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });
        return;
    }
});
/**
 * Element detail controller controller
 */
myAppController.controller('ElementDetailController', function($scope, $routeParams,$window, dataFactory, dataService, myCache) {
    $scope.isValidUser();
    $scope.input = [];
    $scope.rooms = [];
    $scope.profileData = [];

    /**
     * Load data into collection
     */

    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices', '/' + id).then(function(response) {
            var devices = [];
            devices[0] = response.data.data;
            $scope.deviceType = dataService.getDeviceType(devices);
            $scope.tags = dataService.getTags(devices);
            //Profile
            loadProfile();
            // Loacations
            loadLocations();
            // Instances
            loadInstances(devices);

        }, function(error) {
            alert($scope._t('error_load_data'));
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData($routeParams.id);

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
        if (input.id) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            input.location = parseInt(input.location, 10);
            input.metrics.title = input.title;
            dataFactory.putApi('devices', input.id, input).then(function(response) {
                $scope.profileData.positions = dataService.setArrayValue($scope.profileData.positions, input.id, input.dashboard);
                $scope.profileData.hide_single_device_events = dataService.setArrayValue($scope.profileData.hide_single_device_events, input.id, input.hide_events);
                updateProfile($scope.profileData, input.id);

            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                dataService.logError(error);
            });
        }

    };

    /// --- Private functions --- ///
    /**
     * Load profile
     */
    function loadProfile() {
        $scope.profileData = [];
        dataFactory.getApi('profiles', '/' + $scope.user.id).then(function(response) {
            var profile = response.data.data;
            $scope.profileData = {
                'id': profile.id,
                'name': profile.name,
                'positions': profile.positions,
                'hide_single_device_events': profile.hide_single_device_events
            };
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
    function loadInstances(devices) {
        dataFactory.getApi('instances').then(function(response) {
            var v = dataService.getDevices(devices, null, $scope.profileData.positions, response.data.data)[0];
            if (v) {
                $scope.input = {
                    'id': v.id,
                    'title': v.title,
                    'dashboard': v.onDashboard == true ? true : false,
                    'location': v.location,
                    'tags': v.tags,
                    'deviceType': v.deviceType,
                    'level': v.level,
                    'metrics': v.metrics,
                    'updateTime': v.updateTime,
                    'cfg': v.cfg,
                    'permanently_hidden': v.permanently_hidden,
                    //'rooms': $scope.rooms,
                    'hide_events': false
                };
                dataService.updateTimeTick(response.data.data.updateTime);
            } else {
                alert($scope._t('no_data'));
                dataService.showConnectionError($scope._t('no_data'));
            }

        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

    /**
     * Update profile
     */
    function updateProfile(profileData, deviceId) {
        dataFactory.putApi('profiles', profileData.id, profileData).then(function(response) {
            $scope.loading = false;
            myCache.remove('devices');
            myCache.remove('devices/' + deviceId);
            myCache.remove('profiles/' + $scope.user.id);
            myCache.remove('locations');
            $window.history.back();

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });
        return;
    }



});
/**
 * Event controller
 */
myAppController.controller('EventController', function($scope, $routeParams, $interval, $window, $filter, $cookies, dataFactory, dataService, myCache, paginationService, cfg) {
    $scope.isValidUser();
    $scope.collection = [];
    $scope.eventLevels = [];
    $scope.eventSources = [];
    $scope.profileData = [];
    $scope.currLevel = null;
    $scope.timeFilterDefault = {
        since: $filter('unixStartOfDay')(),
        to: $filter('unixStartOfDay')('+', 86400),
        day: 1
    };
    $scope.timeFilter = $scope.timeFilterDefault;
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
        dataService.showConnectionSpinner();
        $scope.timeFilter = (angular.isDefined($cookies.events_timeFilter) ? angular.fromJson($cookies.events_timeFilter) : $scope.timeFilter);
        var urlParam = '?since=' + $scope.timeFilter.since;
        dataFactory.getApi('notifications', urlParam, true).then(function(response) {
            setData(response.data);
            dataService.updateTimeTick(response.data.data.updateTime);
            loadProfile();
            $scope.loading = false;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();
    /**
     * Change time
     */
    $scope.changeTime = function(day) {
        switch (day) {
            case 1:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')(),
                    to: $filter('unixStartOfDay')('+', 86400),
                    day: day
                };
                break;
            case 2:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', 86400),
                    to: $filter('unixStartOfDay')(),
                    day: day
                };
                break;
            case 3:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 2)),
                    to: $filter('unixStartOfDay')('-', 86400),
                    day: day
                };
                break;
            case 4:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 3)),
                    to: $filter('unixStartOfDay')('-', (86400 * 2)),
                    day: day
                };
                break;
            case 5:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 4)),
                    to: $filter('unixStartOfDay')('-', (86400 * 3)),
                    day: day
                };
                break;
            case 6:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 5)),
                    to: $filter('unixStartOfDay')('-', (86400 * 4)),
                    day: day
                };
                break;
            case 7:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 6)),
                    to: $filter('unixStartOfDay')('-', (86400 * 5)),
                    day: day
                };
                break;
            default:
                break;
        }
        $cookies.events_timeFilter = angular.toJson($scope.timeFilter);
        $scope.loadData($scope.timeFilter);
    };

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            dataFactory.refreshApi('notifications').then(function(response) {
                dataService.logInfo(response.data.data.notifications, 'Updating notifications');
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
     * Delete event
     */
    $scope.deleteEvent = function(id, params, target, dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('notifications', id, params).then(function(response) {
                myCache.remove('notifications');
                $scope.loading = false;
                $(target).fadeOut(2000);
            }, function(error) {
                $scope.loading = false;
                alert($scope._t('error_delete_data'));
                dataService.logError(error);
            });
        }
    };

    /**
     * Hide source events
     */
    $scope.hideSourceEvents = function(deviceId) {
        $scope.profileData.hide_single_device_events = dataService.setArrayValue($scope.profileData.hide_single_device_events, deviceId, true);
        updateProfile($scope.profileData);
    };

    /// --- Private functions --- ///
    /**
     * Set events data
     */
    function setData(data) {
        $scope.collection = [];
        $scope.eventLevels = dataService.getEventLevel(data.data.notifications, [{'key': null, 'val': 'all'}]);
        $scope.eventSources = dataService.getPairs(data.data.notifications, 'source', 'source');
        var filter = null;
        if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
            $scope.currSource = $routeParams.val;
            $scope.currLevel = $routeParams.val;
            filter = $routeParams;
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
        //dataService.logInfo($scope.collection,'$scope.collection');
    }
    ;
    /**
     * Load profile
     */
    function loadProfile() {
        $scope.profileData = [];
        dataFactory.getApi('profiles', '/' + $scope.user.id).then(function(response) {
            $scope.profileData = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    /**
     * Update profile
     */
    function updateProfile(profileData) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', profileData.id, profileData).then(function(response) {
            //dataService.logInfo(response, 'Updating Devices');
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            myCache.remove('notifications');
            myCache.remove('profiles');
            $scope.profileData = [];
            $scope.input = [];
            $scope.loadData();

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });
        return;
    }
});
/**
 * App controller
 */
myAppController.controller('AppController', function($scope, $window, $cookies, $timeout, $log, dataFactory, dataService, myCache) {
    $scope.isValidUser();
    $scope.instances = [];
    $scope.modules = [];
    $scope.modulesIds = [];
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
    $scope.loadModules = function(filter) {
        // var filter;
//        if ($scope.user.role === 1 && $scope.user.expert_view) {
//            filter = null;
//        } else {
//            filter = {filter: "status", val: "hidden", not: true};
//        }
        dataFactory.getApi('modules').then(function(response) {
            $scope.modules = dataService.getData(response.data.data, filter, true);
            angular.forEach(response.data.data, function(v, k) {
                $scope.modulesIds.push(v.id);
                $scope.moduleImgs[v.id] = v.icon;

            });
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
    $scope.loadInstances = function() {
        var filter;
//        if ($scope.user.role === 1 && $scope.user.expert_view) {
//            filter = null;
//        } else {
//            filter = {filter: "status", val: "hidden", not: true};
//        }
        dataFactory.getApi('instances').then(function(response) {
            $scope.instances = dataService.getData(response.data.data, filter, true);
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
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function(response) {
                $scope.loading = false;
                myCache.remove('instances');
                $scope.loadInstances();

            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                dataService.logError(error);
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
                myCache.remove('instances');
                myCache.remove('devices');
            }, function(error) {
                alert($scope._t('error_delete_data'));
                dataService.logError(error);
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
                dataService.logError(error);
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
            dataService.logError(error);
        });

    };

});
/**
 * App local detail controller
 */
myAppController.controller('AppLocalDetailController', function($scope, $routeParams, $log, dataFactory, dataService) {
    $scope.isValidUser();
    $scope.module = [];
    $scope.isOnline = null;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/' + id).then(function(response) {
            loadOnlineModules(id);
            $scope.module = response.data.data;
            //$scope.loading = false;

        }, function(error) {
            $scope.loading = false;
            dataService.showConnectionError(error);
        });
    };
    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
            $scope.isOnline = dataService.getRowBy(response.data, 'modulename', moduleName);
            dataService.updateTimeTick();
        }, function(error) {
            dataService.logError(error);
        });
    }

});
/**
 * App online detail controller
 */
myAppController.controller('AppOnlineDetailController', function($scope, $routeParams, $timeout, dataFactory, dataService) {
    $scope.isValidUser();
    $scope.module = [];
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var param = parseInt(id, 10);
        var filter = 'id';
        if (isNaN(param)) {
            filter = 'modulename';
        }
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
            $scope.module = dataService.getRowBy(response.data, filter, id);
            //$scope.loading = false;
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
            $scope.loading = false;
        });
    };

    $scope.loadModule($routeParams.id);

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
            dataService.logError(error);
        });

    };

});
/**
 * App controller - add module
 */
myAppController.controller('AppModuleAlpacaController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache, cfg) {
    $scope.isValidUser(1);
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
        dataFactory.getApi('modules', '/' + id + '?lang=' + $scope.lang).then(function(module) {
            dataFactory.getApi('namespaces').then(function(namespaces) {
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
            alert($scope._t('error_load_data'));
            dataService.showConnectionError(error);
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
            dataFactory.getApi('modules', '/' + instance.moduleId + '?lang=' + $scope.lang).then(function(module) {
//                if (module.data.data.status === 'hidden') {
//                    if (!$scope.user.expert_view) {
//                        dataService.updateTimeTick();
//                        return;
//                    }
//
//                }
                dataFactory.getApi('namespaces').then(function(namespaces) {
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
            alert($scope._t('error_load_data'));
            dataService.showConnectionError(error);
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
                dataService.logError(error);
            });
        } else {
            dataFactory.postApi('instances', inputData).then(function(response) {
                myCache.remove('devices');
                $location.path('/apps');

            }, function(error) {
                alert($scope._t('error_update_data'));
                dataService.logError(error);
            });
        }
    };

});
/**
 * Device controller
 */
myAppController.controller('DeviceController', function($scope, $routeParams, dataFactory, dataService) {
    $scope.isValidUser();
    $scope.zwaveDevices = [];
    $scope.zwaveDevicesFilter = false;
    $scope.deviceVendor = false;
    $scope.manufacturers = [];
    $scope.manufacturer = false;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
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
        dataService.showConnectionSpinner();
        dataFactory.getApiLocal('device.' + lang + '.json').then(function(response) {
            $scope.manufacturers = dataService.getPairs(response.data, 'brandname', 'brand_image', 'manufacturers');
            if (filter) {
                $scope.zwaveDevices = dataService.getData(response.data, filter);
                $scope.manufacturer = filter.val;
            }
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    /**
     * Load ip cameras
     */
    $scope.loadIpcameras = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('modules').then(function(response) {
            $scope.ipcameraDevices = dataService.getData(response.data.data, {filter: "status", val: "camera"});
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
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
myAppController.controller('IncludeController', function($scope, $routeParams, $timeout, $interval, dataFactory, dataService, myCache) {
    $scope.isValidUser();
    $scope.apiDataInterval = null;
    $scope.includeDataInterval = null;
    $scope.device = {
        'data': null
    };
    $scope.controllerState = 0;
    $scope.zwaveApiData = [];
    $scope.includedDeviceId = null;
    $scope.lastIncludedDevice = null;
    $scope.lastExcludedDevice = null;
    $scope.deviceFound = false;
    $scope.checkInterview = false;
    $scope.hasBattery = false;
    $scope.inclusionError = false;
    $scope.clearStepStatus = false;
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
        $interval.cancel($scope.includeDataInterval);
    });

    /**
     * Load data into collection
     */
    $scope.loadData = function(lang) {
        dataService.showConnectionSpinner();
        if (angular.isDefined($routeParams.device)) {
            dataFactory.getApiLocal('device.' + lang + '.json').then(function(response) {
                angular.forEach(response.data, function(v, k) {
                    if (v.id == $routeParams.device) {
                        $scope.device.data = v;
                        return;
                    }
                });

            }, function(error) {
                dataService.showConnectionError(error);
                return;
            });
        }
        return;
    };
    $scope.loadData($scope.lang);
    
     /**
     * Load data into collection
     */
    $scope.loadZwaveApiData = function() {
        dataFactory.loadZwaveApiData().then(function(response) {

            }, function(error) {
                dataService.showConnectionError(error);
                return;
            });
        return;
    };
    $scope.loadZwaveApiData();

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            dataFactory.joinedZwaveData().then(function(response) {
                var data = response.data.update;
                if ('controller.data.controllerState' in data) {
                    $scope.controllerState = data['controller.data.controllerState'].value;
                }
                if ('controller.data.lastExcludedDevice' in data) {
                    $scope.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
                }
                if ('controller.data.lastIncludedDevice' in data) {
                    var deviceIncId = data['controller.data.lastIncludedDevice'].value;
                    if (deviceIncId != null) {
                        var givenName = 'Device_' + deviceIncId;
                        var cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                        dataFactory.runZwaveCmd(cmd).then(function() {
                             $scope.includedDeviceId = deviceIncId;
                             $scope.deviceFound = true;
                        }, function(error) {
                            dataService.showConnectionError(error);
                        });
                       
                    }
                }
                dataService.updateTimeTick(data.updateTime);
//                dataService.logInfo($scope.controllerState, 'controllerState');
//                dataService.logInfo($scope.lastExcludedDevice, 'lastExcludedDevice');
//                dataService.logInfo($scope.includedDeviceId, 'includedDeviceId');
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshData();
    /**
     * Watch for last excluded device
     */
    $scope.$watch('includedDeviceId', function() {
        if ($scope.includedDeviceId) {
                var refresh = function() {
                     $scope.deviceFound = false;
                    $scope.checkInterview = true;
                    dataFactory.loadZwaveApiData().then(function(response) {
                    //dataFactory.joinedZwaveData($scope.zwaveApiData).then(function(response) {
                     //var ZWaveAPIData = response.data.joined;
                    var ZWaveAPIData = response;
                        var nodeId = $scope.includedDeviceId;
                        if (!ZWaveAPIData.devices[nodeId]) {
                            return;
                        }
                        var interviewDone = true;
                        var instanceId = 0;
                        var hasBattery = false;
                        if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                            hasBattery = 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses;
                        }
                        var vendor = ZWaveAPIData.devices[nodeId].data.vendorString.value;
                        var deviceType = ZWaveAPIData.devices[nodeId].data.deviceTypeString.value;
                        $scope.hasBattery = hasBattery;

                        // Check interview
                        if (ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value && ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length) {
                            for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                                if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0) {
                                    for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                                        if (!ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId].data.interviewDone.value) {
                                            //console.log('Interview false: 1')
                                            interviewDone = false;
                                        }
                                    }
                                } else {
                                    //console.log('Interview false: 2')
                                    interviewDone = false;
                                }
                            }

                        } else {
                            //console.log('Interview false: 3')
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
                            myCache.remove('devices');
                            $scope.includedDeviceId = null;
                             $scope.checkInterview = false;
                             $interval.cancel($scope.includeDataInterval);

                        } else {
                             $scope.checkInterview = true;
                        }
                        

                    }, function(error) {
                        $scope.inclusionError = true;
                        dataService.showConnectionError(error);
                    });
                };
                $scope.includeDataInterval = $interval(refresh, $scope.cfg.interval);
           
        }
    });

    /**
     * Watch for last excluded device
     */
    $scope.$watch('includedDeviceId_', function() {
        return;
        if ($scope.includedDeviceId) {
            var timeOut;
            timeOut = $timeout(function() {
                dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
                    var nodeId = $scope.includedDeviceId;
                    if (!ZWaveAPIData.devices[nodeId]) {
                        $scope.inclusionError = true;
                        dataService.logInfo($scope.includedDeviceId, 'includedDeviceId');
                        return;
                    }
                    var interviewDone = true;
                    var instanceId = 0;
                    var hasBattery = false;
                    if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                        hasBattery = 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses;
                    }
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
                    myCache.remove('devices');
                    $scope.includedDeviceId = null;
                }, function(error) {
                    dataService.showConnectionError(error);
                });

            }, 20000);
        }
    });

    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function(cmd) {
        $scope.lastIncludedDevice = null;
        $scope.lastExcludedDevice = null;
        dataFactory.runZwaveCmd(cmd).then(function() {
            myCache.remove('devices');
        }, function(error) {
            dataService.logError(error);
        });

    };


});
/**
 * Room controller
 */
myAppController.controller('RoomController', function($scope, dataFactory, dataService) {
    $scope.isValidUser();
    $scope.collection = [];
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('locations').then(function(response) {
            $scope.collection = response.data.data;
            if (Object.keys($scope.collection).length < 1) {
                $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-warning', message: $scope._t('no_data')};
            }
            dataService.updateTimeTick();
        }, function(error) {

            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();
});
/**
 * Room config controller
 */
myAppController.controller('RoomConfigController', function($scope, $window, dataFactory, dataService, myCache) {
    $scope.isValidUser();
    $scope.collection = [];
    $scope.devices = [];
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';

    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function(id) {
        dataFactory.getApi('locations').then(function(response) {
            $scope.collection = response.data.data;
            loadDevices();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();

    /**
     * Delete an item
     */
    $scope.delete = function(target, roomId, dialog) {

        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApi('locations', roomId).then(function(response) {
                var devices = dataService.getData($scope.devices, {filter: 'location', val: roomId});
                removeRoomIdFromDevice(devices);
                myCache.remove('locations');
                myCache.remove('devices');
                $scope.loadData();

            }, function(error) {
                alert($scope._t('error_delete_data'));
                dataService.logError(error);
            });
        }
    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices = response.data.data.devices;
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

    /**
     * Remove room id from device
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.putApi('devices', v.id, {'location': null}).then(function(response) {
            }, function(error) {
            });
        });
        return;

    }
    ;
});
/**
 * Config room detail controller
 */
myAppController.controller('RoomConfigEditController', function($scope, $routeParams, $filter, dataFactory, dataService, myCache) {
    $scope.isValidUser();
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.input = {
        'id': 0,
        'title': '',
        'user_img': '',
        'default_img': '',
        'img_type': 'default'
    };
    $scope.devices = {};
    $scope.devicesAssigned = [];
    //$scope.devicesAvailable = [];
    $scope.devicesToRemove = [];
    $scope.defaultImages = $scope.cfg.room_images;
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('locations', '/' + id, true).then(function(response) {
            $scope.input = response.data.data;
            loadDevices(id);
        }, function(error) {
            $scope.input = false;
            dataService.showConnectionError(error);
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    } else {
        loadDevices(0);
    }

    /**
     * Upload image
     */
    $scope.uploadFile = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        var cmd = $scope.cfg.api_url + 'upload/image';
        var fd = new FormData();
        fd.append('file_upload', $scope.myFile);
        dataFactory.uploadApiFile(cmd, fd).then(function(response) {
            $scope.input.user_img = response.data.data;
            $scope.input.img_type = 'user';
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_upload')};
        }, function(error) {
            $scope.loading = false;
            alert($scope._t('error_upload'));
        });
    };

    /**
     * Assign device to room
     */
    $scope.assignDevice = function(deviceId) {
        $scope.devicesAssigned.push(deviceId);
        return;

    };
    /**
     * Remove device from the room
     */
    $scope.removeDevice = function(deviceId) {
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        $scope.devicesToRemove = [];
        angular.forEach(oldList, function(v, k) {
            if (v != deviceId) {
                $scope.devicesAssigned.push(v);
            } else {
                $scope.devicesToRemove.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.storeApi('locations', input.id, input).then(function(response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                saveRoomIdIntoDevice(response.data, $scope.devicesAssigned);
                removeRoomIdFromDevice(response.data, $scope.devicesToRemove);
                myCache.remove('locations');
                myCache.remove('devices');
                $scope.loadData(id);
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);

        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices(locationId) {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devicesAssigned = [];
            $scope.devices = dataService.getDevices(response.data.data.devices, false, false, false, locationId > 0 ? locationId : 'post');
            angular.forEach($scope.devices, function(v, k) {
                if (v.location == locationId) {
                    $scope.devicesAssigned.push(v.id);
                }

            });
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

    /**
     * Save room id into device
     */
    function saveRoomIdIntoDevice(data, devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.storeApi('devices', v, {'location': data.data.id}).then(function(response) {
            }, function(error) {

            });
        });
        return;

    }
    ;

    /**
     * Remove room id from device
     */
    function removeRoomIdFromDevice(data, devices) {
        angular.forEach(devices, function(v, k) {
            dataFactory.putApi('devices', v, {'location': null}).then(function(response) {
            }, function(error) {

            });
        });
        return;

    }
    ;

});
/**
 * Network controller
 */
myAppController.controller('NetworkController', function($scope, $cookies, $filter, $window, dataFactory, dataService) {
    $scope.isValidUser();
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
    /**
     * Set tab
     */
    $scope.setTab = function(tabId) {
        $scope.activeTab = tabId;
        $cookies.tab_network = tabId;
    };

    $scope.loadData = function() {
        dataService.showConnectionSpinner();
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
            dataService.updateTimeTick();
            if (!ZWaveAPIData.devices) {
                return;
            }

            angular.forEach(ZWaveAPIData.devices, function(v, k) {
                if (k == 1) {
                    return;
                }

                $scope.zWaveDevices[k] = {
                    id: k,
                    title: v.data.givenName.value || 'Device ' + '_' + k,
                    icon: null,
                    elements: [],
                    messages: []
                };

            });
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
                        var interviewDone = isInterviewDone(node, nodeId);
                        var isFailed = node.data.isFailed.value;
                        var hasBattery = 0x80 in node.instances[0].commandClasses;
                        var obj = {};
                        obj['id'] = v.id;
                        obj['nodeId'] = nodeId;
                        obj['nodeName'] = node.data.givenName.value || 'Device ' + '_' + k,
                                obj['title'] = v.metrics.title;
                        obj['level'] = $filter('toInt')(v.metrics.level);
                        obj['metrics'] = v.metrics;
                        obj['messages'] = [];
                        $scope.devices.zwave.push(obj);
                        $scope.zWaveDevices[nodeId]['elements'].push(obj);
                        $scope.zWaveDevices[nodeId]['icon'] = obj.metrics.icon;
                        // Batteries
                        if (v.deviceType === 'battery') {
                            $scope.devices.batteries.push(obj);
                        }
                        if (hasBattery && interviewDone) {
                            var batteryCharge = parseInt(node.instances[0].commandClasses[0x80].data.last.value);
                            if (batteryCharge <= 20) {
                                $scope.zWaveDevices[nodeId]['messages'].push({
                                    type: 'battery',
                                    error: $scope._t('lb_low_battery') + ' (' + batteryCharge + '%)'
                                });
                                obj['messages'].push({
                                    type: 'battery',
                                    error: $scope._t('lb_low_battery') + ' (' + batteryCharge + '%)'
                                });
                            }
                        }
                        // Not interview
                        if (!interviewDone) {
                            $scope.zWaveDevices[nodeId]['messages'].push({
                                type: 'config',
                                error: $scope._t('lb_not_configured')

                            });

                            obj['messages'].push({
                                type: 'config',
                                error: $scope._t('lb_not_configured')

                            });
                        }
                        // Is failed 
                        if (isFailed) {
                            $scope.zWaveDevices[nodeId]['messages'].push({
                                type: 'failed',
                                error: $scope._t('lb_is_failed')

                            });
                            obj['messages'].push({
                                type: 'failed',
                                error: $scope._t('lb_is_failed')

                            });
                        }
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
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

    /**
     * Redirect to Expert
     */
    $scope.toExpert = function(url, dialog) {
        if ($window.confirm(dialog)) {
            $window.location.href = url;
        }
    };
    /**
     * notInterviewDevices
     */
    function isInterviewDone(node, nodeId) {
        for (var iId in node.instances) {
            for (var ccId in node.instances[iId].commandClasses) {
                var isDone = node.instances[iId].commandClasses[ccId].data.interviewDone.value;
                if (isDone == false) {
                    return false;
                }
            }
        }
        return true;

    }
    ;
});
/**
 * Profile controller
 */
myAppController.controller('AdminController', function($scope, $window, $cookies, dataFactory, dataService, myCache) {
    $scope.isValidUser(1);
    $scope.profiles = {};

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('profiles').then(function(response) {
            $scope.profiles = response.data.data;
            dataService.updateTimeTick();
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
                $(target).fadeOut(2000);
                myCache.remove('profiles');

            }, function(error) {
                alert($scope._t('error_delete_data'));
                dataService.logError(error);
            });
        }
    };
});
/**
 * Orofile detail
 */
myAppController.controller('AdminUserController', function($scope, $routeParams, $filter, dataFactory, dataService, myCache) {
    $scope.isValidUser(1);
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.rooms = {};
    $scope.input = {
        id: 0,
        name: '',
        active: true,
        role: 2,
        description: '',
        //positions: [],
        password: '',
        login: '',
        lang: 'en',
        color: '#dddddd',
        hide_all_device_events: false,
        hide_system_events: false,
        hide_single_device_events: [],
        rooms: [],
        default_ui: 1,
        expert_view: false

    };

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            $scope.input = response.data.data;
            dataService.updateTimeTick();
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
     * Load Rooms
     */
    $scope.loadRooms = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    $scope.loadRooms();
    /**
     * Assign room to list
     */
    $scope.assignRoom = function(assign) {
        $scope.input.rooms.push(assign);
        return;

    };

    /**
     * Remove room from the list
     */
    $scope.removeRoom = function(roomId) {
        var oldList = $scope.input.rooms;
        $scope.input.rooms = [];
        angular.forEach(oldList, function(v, k) {
            if (v != roomId) {
                $scope.input.rooms.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if ($scope.id == 0) {
            input.password = md5(input.password);
        }

        dataFactory.storeApi('profiles', input.id, input).then(function(response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                myCache.remove('profiles');
                $scope.loadData(id);
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });

    };

    /// --- Private functions --- ///


});
/**
 * My Access
 */
myAppController.controller('MyAccessController', function($scope, $window, dataFactory, dataService, myCache) {
    $scope.isValidUser();
    $scope.id = $scope.user.id;
    $scope.devices = {};
    $scope.input = {
        id: 0,
        name: '',
        active: true,
        description: '',
        //positions: [],
        password: '',
        lang: 'en',
        color: '',
        hide_all_device_events: false,
        hide_system_events: false,
        hide_single_device_events: [],
        interval: 2000

    };
    $scope.newPassword = null;
    /**
     * Load data
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            loadDevices();
            $scope.input = response.data.data;
            dataService.updateTimeTick();
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
     * Assign device to list
     */
    $scope.assignDevice = function(assign) {
        $scope.input.hide_single_device_events.push(assign);
        return;

    };
    /**
     * Remove device from the list
     */
    $scope.removeDevice = function(deviceId) {
        var oldList = $scope.input.hide_single_device_events;
        $scope.input.hide_single_device_events = [];
        angular.forEach(oldList, function(v, k) {
            if (v != deviceId) {
                $scope.input.hide_single_device_events.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }

            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            myCache.remove('profiles');
            dataService.setUser(data);
            $window.location.reload();
            //$route.reload();

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });

    };

    /**
     * Change password
     */
    $scope.changePassword = function(newPassword) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            password: md5(newPassword)

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
            dataService.logError(error);
        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices = response.data.data.devices;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

});
/**
 * Login controller
 */
myAppController.controller('LoginController', function($scope, $cookies, $location, $window, $routeParams,dataFactory, dataService) {
    $scope.input = {
        login: '',
        password: '',
        keepme: false,
        default_ui: 1
    };
    if ($scope.user) {
        $location.path('/elements');
        return;
    }
    $cookies.user = undefined;
    /**
     * Login language
     */
    $scope.loginLang = function(lang) {
        $scope.loadLang(lang);
    };
    /**
     * Login proccess
     */
    $scope.login = function(input) {

        //dataService.logInfo(input);
        input.password = md5(input.password);
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.logInApi(input).then(function(response) {
            //dataService.logInfo(response, 'User logged in')
            dataService.setUser(response.data.data);
//            if (input.keepme) {
//                dataService.logInfo(input, 'Remeber user')
//            }
            $scope.loading = false;
            $scope.user = dataService.getUser();
            $window.location.reload();

            //$window.location.href = '#elements';
            //$location.path('/myaccesss');
        }, function(error) {
            var message = $scope._t('error_load_data');
            if (error.status == 404) {
                message = $scope._t('error_load_user');
            }
            alert(message);
            $scope.loading = false;
            dataService.logError(error.status);
        });
    };
     console.log($routeParams)
    if($routeParams.login && $routeParams.password){
       
        $scope.login($routeParams);
    }

});
/**
 * Logout controller
 */
myAppController.controller('LogoutController', function($scope, $cookies, $location, $window, $timeout, dataService) {
    $scope.isValidUser();
    /**
     * Logout proccess
     */
    $scope.logout = function() {
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('logout')};
        $cookies.user = undefined;
        $scope.user = false;
        //$window.location.href = '#login';
        $window.location.reload();
        //$location.path('/login');

    };
    $scope.logout();

});
/**
 * About controller
 */
myAppController.controller('AboutController', function($scope, dataFactory) {

});

