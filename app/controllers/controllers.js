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
    //$scope.demoColor = ['#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e'];
    $scope.profile = {
        'id': 1,
        'name': 'Default',
        'cssClass': 'profile-80ad80',
        'active': true,
        'lang': cfg.lang,
        'positions': []
    };
    $scope.user = dataService.getUser();
    /**
     * Language settings
     */
    $scope.lang_list = cfg.lang_list;
    // Set language
    $scope.lang = ($scope.user ? $scope.user.lang : cfg.lang);

    //$scope.lang = (angular.isDefined($scope.profile.lang) ? $scope.profile.lang : cfg.lang);
    // TODO: remove?
//    $scope.changeLang = function(lang) {
//        $cookies.lang = lang;
//        $scope.lang = lang;
//    };
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
myAppController.controller('TestController', function($scope, $routeParams, $filter, $location, $log, $timeout, dataFactory, dataService) {
    $scope.userImage = false;
    $scope.uploadFile = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        var cmd = $scope.cfg.zwave_js_url + 'Upload_Image';
        var fd = new FormData();
        fd.append('file_upload', $scope.myFile);
        dataService.logInfo(fd, 'File upload')
        dataFactory.uploadApiFile(cmd, fd).then(function(response) {
            $scope.userImage = $scope.cfg.server_url + $scope.cfg.zwave_js_url + 'Load_Image/' + response.data.img
            dataService.logInfo($scope.userImage, 'Image')
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_upload')};
        }, function(error) {
            dataService.logError(error, 'File upload')
            $scope.loading = false;
            alert($scope._t('error_upload'));
        });
    };
});
/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, $interval, dataFactory, dataService, myCache) {
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
     * DEPRECATED
     */
//    $scope.$watch('rgbVal', function() {
//        console.log($scope.val)
//    });

    /**
     * Load data into collection
     */

    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
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
            if (response.data.data.devices.length < 1) {
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
                dataService.updateDevices(response.data, $scope.updateValues);
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
    $scope.runCmd = function(cmd) {
        runCmd(cmd);
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
            //dataService.logInfo(response, 'Updating Devices');
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            myCache.remove('devices');
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

    /**
     * Process CMD
     */
    function runCmd(cmd) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.runApiCmd(cmd).then(function(response) {
            $scope.loading = false;

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
        //$cookies.events_timeFilter = angular.toJson($scope.timeFilterDefault);
        //$cookies.events_timeFilter = false;
        //$cookies.remove('events_timeFilter');
    });

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.timeFilter = (angular.isDefined($cookies.events_timeFilter) ? angular.fromJson($cookies.events_timeFilter) : $scope.timeFilter);
        var urlParam = '?since=' + $scope.timeFilter.since + '&profile=' + $scope.user.id;
        dataFactory.getApi('notifications', urlParam, true).then(function(response) {
            setData(response.data);
            dataService.updateTimeTick(response.data.data.updateTime);
            loadProfile();
            $scope.loading = false;
        }, function(error) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
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
            dataFactory.refreshApi('notifications', '&profile=' + $scope.user.id).then(function(response) {
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
    $scope.deleteEvent = function(id, target, dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('notifications', id).then(function(response) {
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
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.zwave_js_url + 'Load_Module_Media/';
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
        dataFactory.getApi('modules').then(function(response) {
            $scope.modules = dataService.getData(response.data.data, filter);
            angular.forEach(response.data.data, function(v, k) {
                $scope.modulesIds.push(v.id);

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
        dataFactory.getApi('instances').then(function(response) {
            $scope.instances = response.data.data;
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
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
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
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function(response) {
                dataService.logInfo(response, 'activateInstance');
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
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
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('modules', input.id).then(function(response) {
                myCache.remove('modules');
                $(target).fadeOut(2000);
                $scope.loading = false;

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
    $scope.module = [];
    $scope.isOnline = null;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.zwave_js_url + 'Load_Module_Media/';
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/' + id).then(function(response) {
            loadOnlineModules(id);
            $scope.module = response.data.data;
            $scope.loading = false;

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
        }, function(error) {
            dataService.logError(error);
        });
    }

});
/**
 * App online detail controller
 */
myAppController.controller('AppOnlineDetailController', function($scope, $routeParams, $timeout, dataFactory, dataService) {
    $scope.module = [];
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;
    /**
     * Load module detail
     */
    $scope.loadModule = function(id) {
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var param = parseInt(id, 10);
        var filter = 'id';
        if (isNaN(param)) {
            filter = 'modulename';
        }
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
            $scope.module = dataService.getRowBy(response.data, filter, id);
            $scope.loading = false;
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
                dataService.logError(error);
            });
            
         }, function(error) {
                alert($scope._t('error_load_data'));
                dataService.logError(error);
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
            dataFactory.getApi('modules',  '/' + instance.moduleId + '?lang=' + $scope.lang).then(function(module) {
            dataFactory.getApi('namespaces').then(function(namespaces) {
                    var formData = dataService.getModuleFormData(module.data.data, instance.params, namespaces.data.data);

                    $scope.input = {
                        'instanceId': instance.id,
                        'moduleId': module.data.data.id,
                        'active': instance.active,
                        'title': instance.title,
                        'description': instance.description,
                        'moduleTitle': instance.title,
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
                dataService.logError(error);
            });
             dataService.updateTimeTick();
             }, function(error) {
                alert($scope._t('error_load_data'));
                dataService.logError(error);
            });
        }, function(error) {
                alert($scope._t('error_load_data'));
                dataService.logError(error);
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
            $scope.ipcameraDevices = dataService.getData(response.data.data, {filter: "category", val: "surveillance"});
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
myAppController.controller('IncludeController', function($scope, $routeParams, $timeout, $interval, dataFactory, dataService) {
     $scope.apiDataInterval = null;
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
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
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
                dataService.updateTimeTick();
            }, function(error) {
                dataService.showConnectionError(error);
                return;
            });
        }
        return;
    };
    $scope.loadData($scope.lang);

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            dataFactory.refreshZwaveApiData().then(function(response) {
                var data = response.data;
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
                        }, function(error) {
                            dataService.logError(error);
                        });
                        $scope.includedDeviceId = deviceIncId;
                    }
                }
                dataService.updateTimeTick(data.updateTime);
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
            var timeOut;
            timeOut = $timeout(function() {
                dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
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
                }, function(error) {
                    dataService.showConnectionError(error);
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
        dataFactory.runZwaveCmd(cmd).then(function() {
        }, function(error) {
            dataService.logError(error);
        });

    };


});
/**
 * Room controller
 */
myAppController.controller('RoomController', function($scope, dataFactory, dataService) {
    $scope.collection = [];
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.zwave_js_url + 'Load_Image/';
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations').then(function(response) {
            $scope.collection = response.data.data;
            $scope.loading = false;
            if ($scope.collection.length < 1) {
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
    $scope.collection = [];
    $scope.devices = [];
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.zwave_js_url + 'Load_Image/';
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function(id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations').then(function(response) {
            $scope.collection = response.data.data;
            loadDevices();
            $scope.loading = false;
        }, function(error) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
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
            dataFactory.deleteApi('locations', input.id).then(function(response) {
                //$(target).fadeOut(2000);
                var devices = dataService.getData($scope.devices, {filter: 'location', val: input.id});
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
        }, function(error) {
            //dataService.showConnectionError(error);
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
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.zwave_js_url + 'Load_Image/';

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations', '/' + id, true).then(function(response) {
            $scope.input = response.data.data;
            loadDevices(id);
            $scope.loading = false;
        }, function(error) {
            $scope.input = false;
            $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
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
        var cmd = $scope.cfg.zwave_js_url + 'Upload_Image';
        var fd = new FormData();
        fd.append('file_upload', $scope.myFile);
        dataFactory.uploadApiFile(cmd, fd).then(function(response) {
            $scope.input.user_img = response.data.img;
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
                //dataService.logInfo(k, 'Node ID')
                $scope.zWaveDevices[k] = {
                    id: k,
                    title: v.data.givenName.value || 'Device ' + '_' + k,
                    elements: []
                };
            });
            //dataService.logInfo($scope.zWaveDevices, 'Node ID')
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
                //$(target).fadeOut(2000);
                myCache.remove('profiles');
                $scope.loadData();

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
        color: '',
        hide_all_device_events: false,
        hide_system_events: false,
        hide_single_device_events: []

    };

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            //dataService.logInfo(response.data.data);
            loadRooms();
            $scope.input = response.data.data;
            $scope.loading = false;
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
     * Assign room to list
     */
    $scope.assignRoom = function(assign) {
        $scope.input.hide_rooms.push(assign);
        return;

    };

    /**
     * Remove room from the list
     */
    $scope.removeRoom = function(roomId) {
        var oldList = $scope.input.hide_rooms;
        $scope.input.hide_rooms = [];
        angular.forEach(oldList, function(v, k) {
            if (v != roomId) {
                $scope.input.hide_rooms.push(v);
            }
        });
        return;
    };

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
        dataFactory.storeApi('profiles', input.id, input).then(function(response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            //dataService.logInfo(response, 'Profile http response data');
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

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadRooms() {
        dataFactory.getApi('locations').then(function(response) {
            dataService.logInfo(response.data.data, 'Rooms');
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

});
/**
 * My Access
 */
myAppController.controller('MyAccessController', function($scope, $window, dataFactory, dataService, myCache) {
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
        hide_single_device_events: []

    };

    /**
     * Load data
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('profiles', '/' + id, true).then(function(response) {
            loadDevices();
            $scope.input = response.data.data;
            $scope.loading = false;
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

//        var inputData = {
//            id: input.id,
//            name: input.name,
//            active: input.active,
//            positions: $scope.input.positions,
//            lang: input.lang
//
//        };
        dataFactory.putApi('profiles', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }

            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            myCache.remove('profiles');

            var user = {
                lang: data.lang,
                color: data.color
            };

            dataService.setUser(user);
            $window.location.reload();
            //$route.reload();

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
        //dataService.setUser($scope.cfg.user_default);
    };

});
/**
 * Logout controller
 */
myAppController.controller('LogoutController', function($scope, $cookies, $location, $timeout, dataService) {

    /**
     * Logout proccess
     */
    $scope.logout = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('logout')};
        //$cookies.user = false;
        $timeout(function() {
            $location.path('/login');
        }, 2000);

    };
    $scope.logout();

});
/**
 * About controller
 */
myAppController.controller('AboutController', function($scope, dataFactory) {

});

