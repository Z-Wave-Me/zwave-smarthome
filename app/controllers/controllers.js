/**
 * Application controllers
 * @author Martin Vach
 */

/*** Controllers ***/
var myAppController = angular.module('myAppController', []);
/**
 * Base controller
 */
myAppController.controller('BaseController', function($scope, $cookies, $filter, $location, cfg, dataFactory, dataService) {
    /**
     * Global scopes
     */
    $scope.cfg = cfg;
    $scope.loading = false;
    $scope.alert = {message: false, status: 'is-hidden', icon: false};
    $scope.user = dataService.getUser();
    $scope.ZWAYSession = dataService.getZWAYSession();
    $scope.lastLogin = dataService.getLastLogin();
    $scope.setPollInterval = function() {
        if (!$scope.user) {
            $scope.cfg.interval = $scope.cfg.interval;
        } else {
            $scope.cfg.interval = ($filter('toInt')($scope.user.interval) >= 1000 ? $filter('toInt')($scope.user.interval) : $scope.cfg.interval);
        }

    };
    $scope.setPollInterval();

    $scope.elementAccess = function(roles, mobile) {
        if (!$scope.user) {
            return false;
        }
        // Hide on mobile devices
        if (mobile) {
            return false;
        }
        // Hide for restricted roles
        if (angular.isArray(roles) && roles.indexOf($scope.user.role) === -1) {
            return false;
        }
        return true;
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
myAppController.controller('TestController', function($scope, $routeParams, $filter, $location, $log, $cookies, $timeout, $interval, dataFactory, dataService) {
    $scope.testHeader = function() {
        dataFactory.getRemoteData('http://zwave.eu/api/test/headers/index.php?code=401').then(function(response) {

            dataService.updateTimeTick();
        }, function(error) {

            dataService.showConnectionError(error);
        });
    };
    //$scope.testHeader();
    var master = {
        email: null,
        content: null
    };
    $scope.input = master;
    $scope.store = function(form, input) {
        console.log($scope.input)
        // console.log(input)
        //var original = $scope.input;
        $scope.input = angular.copy($scope.master);
        $scope.form_report.$setPristine();
        console.log(master)
    };
//
//    $scope.fruitArraySource = ['Mango', 'Apple'];
//    $scope.fruitArrayDestination = ['Orange', 'Grapes'];
//    console.log($scope.fruitArrayDestination)
//    angular.copy($scope.fruitArraySource, $scope.fruitArrayDestination);
//    console.log($scope.fruitArrayDestination)

    $scope.fruitArraySourceEx = {id: 25};
    $scope.fruitArrayDestinationEx = {val: 'myName'};
    $scope.fruitArrayDestinationExA = {val: 'myNameRew'};
    $scope.fruitArrayDestinationExB = {blabla: 'ABC'};

    angular.extend($scope.fruitArrayDestinationEx, $scope.fruitArraySourceEx);
    console.log($scope.fruitArrayDestinationEx)
    angular.extend($scope.fruitArrayDestinationEx, $scope.fruitArraySourceEx, $scope.fruitArrayDestinationExA);
    console.log($scope.fruitArrayDestinationEx)
    angular.extend($scope.fruitArrayDestinationEx, $scope.fruitArraySourceEx, $scope.fruitArrayDestinationExA, $scope.fruitArrayDestinationExB);
    console.log($scope.fruitArrayDestinationEx)

});
/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, $interval, $location, dataFactory, dataService, myCache) {
    $scope.goHidden = [];
    $scope.goHistory = [];
    $scope.apiDataInterval = null;
    $scope.collection = [];
    $scope.showFooter = true;
    $scope.deviceType = [];
    $scope.tags = [];
    $scope.rooms = [];
    $scope.history = [];
    $scope.historyStatus = [];
    $scope.multilineSensor = false;
    $scope.levelVal = [];
    $scope.rgbVal = [];
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
            var notFound = $scope._t('no_devices') + ' <a href="#devices">' + $scope._t('lb_include_device') + '</a>'
            $scope.loading = false;
            $scope.deviceType = dataService.getDeviceType(response.data.data.devices);
            $scope.tags = dataService.getTags(response.data.data.devices);
            // Filter
            if (angular.isDefined($routeParams.filter) && angular.isDefined($routeParams.val)) {
                switch ($routeParams.filter) {
                    case 'dashboard':
                        $scope.showFooter = false;
                        filter = {filter: "onDashboard", val: true};
                        notFound = $scope._t('no_devices_dashboard');
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
            var collection = dataService.getDevices(response.data.data.devices, filter, $scope.user.dashboard, null);
            if (collection.length < 1) {
                $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-warning', message: notFound};
                return;
            }
            $scope.collection = collection;
            dataService.updateTimeTick(response.data.data.updateTime);
        }, function(error) {
            $location.path('/error/' + error.status);
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

    /**
     * Load device history
     */
    $scope.loadDeviceHistory = function(deviceId) {
        $scope.goHistory[deviceId] = !$scope.goHistory[deviceId];
        $scope.history[deviceId] = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('history', '/' + deviceId + '?show=24', true).then(function(response) {
            if (!response.data.data.deviceHistory) {
                $scope.history[deviceId] = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
                return;
            }
            var data = dataService.getChartData(response.data.data.deviceHistory, $scope.cfg.chart_colors);
            $scope.history[deviceId] = {data: data};
        }, function(error) {
            $scope.history[deviceId] = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

    };

    /**
     * Show camera modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };

    /**
     * Show Multiline Sensor modal window
     */
    $scope.loadMultilineSensor = function(target, id, input) {
        $(target).modal();
        $scope.input = input;
        $scope.multilineSensor = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices', '/' + id, true).then(function(response) {
            if (response.data.data.metrics.sensors) {
                $scope.multilineSensor = {data: response.data.data};
            } else {
                $scope.multilineSensor = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
            }
        }, function(error) {
            $scope.multilineSensor = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

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
        });
        return;
    }
});
/**
 * Element detail controller controller
 */
myAppController.controller('ElementDetailController', function($scope, $routeParams, $window, $location, dataFactory, dataService, myCache) {
    $scope.input = [];
    $scope.rooms = [];
    $scope.tagList = [];
    $scope.searchText = '';
    $scope.suggestions = [];
    $scope.autoCompletePanel = false;


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
            // Loacations
            loadLocations();
            // Instances
            loadInstances(devices);

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData($routeParams.id);

    /**
     * Load tag list
     */
    $scope.loadTagList = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            angular.forEach(response.data.data.devices, function(v, k) {
                if (v.tags) {
                    angular.forEach(v.tags, function(t, kt) {
                        if ($scope.tagList.indexOf(t) === -1) {
                            $scope.tagList.push(t);
                        }

                    });
                }
            });

        }, function(error) {
            alert($scope._t('error_load_data'));
            dataService.showConnectionError(error);
        });
    };
    $scope.loadTagList();



    $scope.itemsSelectedArr = [];
    //$scope.itemsArr = [];

    $scope.searchMe = function(search) {
        $scope.suggestions = [];
        $scope.autoCompletePanel = false;
        if (search.length > 2) {
            var foundText = containsText($scope.tagList, search);
            $scope.autoCompletePanel = (foundText) ? true : false;
        }
    };


    /**
     * Add tag to list
     */
    $scope.addTag = function(searchText) {
        $scope.searchText = '';
        $scope.autoCompletePanel = false;
        if (!searchText || $scope.input.tags.indexOf(searchText) > -1) {
            return;
        }
        $scope.input.tags.push(searchText);
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function(index) {
        $scope.input.tags.splice(index, 1);
        $scope.autoCompletePanel = false;
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
                $scope.user.dashboard = dataService.setArrayValue($scope.user.dashboard, input.id, input.dashboard);
                $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, input.id, input.hide_events);
                updateProfile($scope.user, input.id);

            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };
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
        if (!$scope.elementAccess($scope.cfg.role_access.apps)) {
            var v = dataService.getDevices(devices, null, $scope.user.dashboard, false)[0];
            setInput(v, devices.updateTime);
            return;
        }
        dataFactory.getApi('instances').then(function(response) {
            var v = dataService.getDevices(devices, null, $scope.user.dashboard, response.data.data)[0];
            setInput(v, response.data.data.updateTime);

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
            dataService.setUser(response.data.data);
            $scope.loading = false;
            myCache.remove('devices');
            myCache.remove('devices/' + deviceId);
            myCache.remove('locations');
            $window.history.back();

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    }

    /// --- Private functions --- ///
    /**
     * Set input
     */
    function setInput(v, updateTime) {
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
            dataService.updateTimeTick(updateTime);
        } else {
            alert($scope._t('no_data'));
            dataService.showConnectionError($scope._t('no_data'));
        }
    }
    ;
    /**
     * Load locations
     */
    function containsText(n, search) {
        var gotText = false;
        for (var i in n) {
            var re = new RegExp(search, "ig");
            var s = re.test(n[i]);
            if (s) {
                $scope.suggestions.push(n[i]);
                gotText = true;
            }
        }
        return gotText;
    }
    ;
});
/**
 * Event controller
 */
myAppController.controller('EventController', function($scope, $routeParams, $interval, $window, $filter, $cookies, $location, dataFactory, dataService, myCache, paginationService, cfg) {
    $scope.collection = [];
    $scope.eventLevels = [];
    $scope.dayCount = [
        {key: 1, val: $scope._t('lb_today')},
        {key: 2, val: $scope._t('lb_yesterday')},
        {key: 3, val: '3 ' + $scope._t('lb_days')},
        {key: 4, val: '4 ' + $scope._t('lb_days')},
        {key: 5, val: '5 ' + $scope._t('lb_days')},
        {key: 6, val: '6 ' + $scope._t('lb_days')},
        {key: 7, val: '7 ' + $scope._t('lb_days')}
    ];

    $scope.eventSources = [];
    //$scope.profileData = [];
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
            $scope.loading = false;
        }, function(error) {
            $location.path('/error/' + error.status);
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
            });
        }
    };

    /**
     * Hide source events
     */
    $scope.hideSourceEvents = function(deviceId) {
        $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, deviceId, true);
        updateProfile($scope.user);
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
            dataService.setUser(response.data.data);
            myCache.remove('notifications');
            $scope.input = [];
            $scope.loadData();

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    }
});
/**
 * App controller
 */
myAppController.controller('AppController', function($scope, $window, $cookies, $timeout, dataFactory, dataService, myCache) {
    $scope.instances = [];
    $scope.hasImage = [];
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
//        if ($scope.cfg.app_type === 'default') {
//            if ($scope.user.role === 1 && $scope.user.expert_view) {
//                filter = null;
//            } else {
//                filter = {filter: "state", val: "hidden", not: true};
//            }
//        } else {
//            filter = {filter: "state", val: "hidden", not: true};
//        }
        if ($scope.user.role === 1 && $scope.user.expert_view) {
            filter = null;
        } else {
            filter = {filter: "state", val: "hidden", not: true};
        }
        //filter = {filter: "state", val: "hidden", not: true};
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
    $scope.loadInstances = function() {
        var filter;
//        if ($scope.cfg.app_type === 'default') {
//            if ($scope.user.role === 1 && $scope.user.expert_view) {
//                filter = null;
//            } else {
//                filter = {filter: "state", val: "hidden", not: true};
//            }
//        } else {
//            filter = {filter: "state", val: "hidden", not: true};
//        }
        if ($scope.user.role === 1 && $scope.user.expert_view) {
            filter = null;
        } else {
            filter = {filter: "state", val: "hidden", not: true};
        }
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
//            case 'online':
//                $scope.loadOnlineModules();
//                $scope.loadModules();
//                $scope.showInFooter.categories = false;
//                break;
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
myAppController.controller('AppLocalDetailController', function($scope, $routeParams, $location, dataFactory, dataService) {
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
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function(response) {
            $scope.isOnline = dataService.getRowBy(response.data, 'modulename', moduleName);
            dataService.updateTimeTick();
        }, function(error) {
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
            dataFactory.getApi('modules', '/' + instance.moduleId + '?lang=' + $scope.lang).then(function(module) {
                if (module.data.data.state === 'hidden') {
                    if (!$scope.user.expert_view) {
                        dataService.updateTimeTick();
                        return;
                    }

                }
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
/**
 * Device controller
 */
myAppController.controller('DeviceController', function($scope, $routeParams, dataFactory, dataService) {
});
/**
 * Device Zwave  controller
 */
myAppController.controller('DeviceZwaveController', function($scope, $routeParams, dataFactory, dataService) {
    $scope.zwaveDevices = [];
    $scope.deviceVendor = false;
    $scope.manufacturers = [];
    $scope.manufacturer = false;
    /**
     * Load z-wave devices
     */
    $scope.loadData = function(brandname, lang) {
        dataService.showConnectionSpinner();
        dataFactory.getApiLocal('device.' + lang + '.json').then(function(response) {
            $scope.manufacturers = dataService.getPairs(response.data, 'brandname', 'brand_image', 'manufacturers');
            if (brandname) {
                $scope.zwaveDevices = dataService.getData(response.data, {'filter': 'brandname', 'val': brandname});
                $scope.manufacturer = brandname;
            }
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData($routeParams.brandname, $scope.lang);
});
/**
 * Device IP camerae  controller
 */
myAppController.controller('DeviceIpCameraController', function($scope, dataFactory, dataService) {
    $scope.ipcameraDevices = [];
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load ip cameras
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('modules').then(function(response) {
            $scope.ipcameraDevices = dataService.getData(response.data.data, {filter: "category", val: "surveillance"});
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();
});
/**
 * Device controller
 */
myAppController.controller('IncludeController', function($scope, $routeParams, $interval, $filter, dataFactory, dataService, myCache) {
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
    $scope.interviewCfg = {
        commandClassesCnt: 0,
        time: 0,
        stop: 0,
        isDone: []
    };

    $scope.nodeId = null;
    $scope.updateDevices = false;
    $scope.zWaveDevice = [];
    $scope.devices = [];
    $scope.dev = [];
    $scope.rooms = [];
    $scope.modelRoom;
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
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            var refresh = function() {
                dataFactory.joinedZwaveData(ZWaveAPIData).then(function(response) {
                    checkController(response.data.update, response.data.joined);
                    dataService.updateTimeTick(response.data.update.updateTime);
                }, function(error) {
                    dataService.showConnectionError(error);
                    return;
                });
            };
            $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
        }, function(error) {
            dataService.showConnectionError(error);
            return;
        });
        return;
    };
    $scope.loadZwaveApiData();
    /**
     * Watch for last excluded device
     */
    $scope.$watch('includedDeviceId', function() {
        if ($scope.includedDeviceId) {
            var refresh = function() {
                $scope.deviceFound = false;
                $scope.checkInterview = true;
                dataFactory.loadZwaveApiData(true).then(function(ZWaveAPIData) {
                    //dataFactory.joinedZwaveData($scope.zwaveApiData).then(function(response) {
                    //var ZWaveAPIData = response.data.joined;
                    //var ZWaveAPIData = response;
                    var nodeId = $scope.includedDeviceId;
                    var node = ZWaveAPIData.devices[nodeId];
                    if (!node) {
                        return;
                    }
                    var interviewDone = true;
                    //var instanceId = 0;
                    var hasBattery = false;
                    if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                        hasBattery = 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses;
                    }
                    //var vendor = ZWaveAPIData.devices[nodeId].data.vendorString.value;
                    //var deviceType = ZWaveAPIData.devices[nodeId].data.deviceTypeString.value;
                    $scope.hasBattery = hasBattery;

                    //console.log('CHECK interview -----------------------------------------------------')
                    // Check interview
                    if (ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value && ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length) {
                        for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                            if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0) {
                                $scope.interviewCfg.commandClassesCnt = Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length;
                                if ($scope.interviewCfg.stop === 0) {
                                    // Wait 20 seconds after interview start check
                                    $scope.interviewCfg.time = (Math.round(+new Date() / 1000)) + 20;
                                }
                                $scope.interviewCfg.stop = (Math.round(+new Date() / 1000));
                                for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                                    var notInterviewClass = 'devices.' + nodeId + '.instances.' + iId + '.commandClasses.' + ccId + '.data.interviewDone.value';
                                    // Interview is not done
                                    if (!ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId].data.interviewDone.value) {
                                        interviewDone = false;
                                    } else {  // Interview is done
                                        if ($scope.interviewCfg.isDone.indexOf(notInterviewClass) === -1) {
                                            $scope.interviewCfg.isDone.push(notInterviewClass);
                                        }
                                    }
                                }
                            } else {
                                interviewDone = false;
                            }
                        }

                    } else {
                        interviewDone = false;
                    }
                    if (interviewDone) {
                        $scope.lastIncludedDevice = node.data.givenName.value || 'Device ' + '_' + nodeId;
                        myCache.remove('devices');
                        $scope.includedDeviceId = null;
                        $scope.checkInterview = false;
                        $interval.cancel($scope.includeDataInterval);
                        $scope.nodeId = nodeId;
                        $scope.loadLocations();
                        $scope.loadElements(nodeId);


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
    $scope.$watch('updateDevices', function() {
        if ($scope.nodeId) {
            $scope.updateDevices = false;
            $scope.loadElements($scope.nodeId);
        }
    });

    /**
     * Watch for last excluded device
     */
    //$scope.$watch('interviewCfg', function() {});


    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function(cmd) {
        $scope.lastIncludedDevice = null;
        $scope.lastExcludedDevice = null;
        dataFactory.runZwaveCmd(cmd).then(function() {
            myCache.remove('devices');
        }, function(error) {
        });

    };

    /**
     * Load data
     */
    $scope.loadElements = function(nodeId) {
        //console.log('Loading nodeId',nodeId)
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            zwaveApiData(nodeId, response.data.data.devices);

        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    /**
     * Load locations
     */
    $scope.loadLocations = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;


    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };
            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        myCache.remove('devices');
        $scope.loadData();
        $scope.loading = false;
        return;

    };
    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            //$scope.loadData($scope.nodeId);
            $scope.updateDevices = true;
            $scope.loading = false;
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///
    /**
     * Check controller data data
     */
    function checkController(data, ZWaveAPIData) {
        //var data = response.data;
        if ('controller.data.controllerState' in data) {
            $scope.controllerState = data['controller.data.controllerState'].value;
            //console.log('controllerState: ', $scope.controllerState)
        }

        if ('controller.data.lastExcludedDevice' in data) {
            $scope.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            //console.log('lastExcludedDevice: ', $scope.lastExcludedDevice)
        }
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            if (deviceIncId != null) {
                var givenName = 'Device_' + deviceIncId;
                var cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                dataFactory.runZwaveCmd(cmd).then(function() {
                    $scope.includedDeviceId = deviceIncId;
                    $scope.deviceFound = true;
                    //getLastIncluded(deviceIncId,ZWaveAPIData);
                }, function(error) {
                    dataService.showConnectionError(error);
                });

            }
        }
    }
    ;

    /**
     * Get last included device
     */
//    function getLastIncluded(nodeId, ZWaveAPIData) {
//        if (!$scope.includedDeviceId) {
//            return;
//        }
//        $scope.deviceFound = false;
//        $scope.checkInterview = true;
//        var node = ZWaveAPIData.devices[nodeId];
//        if (!node) {
//            return;
//        }
//        var interviewDone = true;
//        //var instanceId = 0;
//        var hasBattery = false;
//        if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
//            hasBattery = 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses;
//        }
//        $scope.hasBattery = hasBattery;
//
//        console.log('CHECK interview NEW -----------------------------------------------------')
//        // Check interview
//        if (ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value && ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length) {
//             console.log('ZWaveAPIData.devices[nodeId].instances',ZWaveAPIData.devices[nodeId].instances)
//            for (var iId in ZWaveAPIData.devices[nodeId].instances) {
//                if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0) {
//                     console.log('ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0 -----------------------------------------------------')
//                    $scope.interviewCfg.commandClassesCnt = Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length;
//                    if ($scope.interviewCfg.stop === 0) {
//                        // Wait 20 seconds after interview start check
//                        $scope.interviewCfg.time = (Math.round(+new Date() / 1000)) + 20;
//                    }
//                    $scope.interviewCfg.stop = (Math.round(+new Date() / 1000));
//                    for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
//                        var notInterviewClass = 'devices.' + nodeId + '.instances.' + iId + '.commandClasses.' + ccId + '.data.interviewDone.value';
//                        // Interview is not done
//                        if (!ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId].data.interviewDone.value) {
//                            interviewDone = false;
//                        } else {  // Interview is done
//                            if ($scope.interviewCfg.isDone.indexOf(notInterviewClass) === -1) {
//                                $scope.interviewCfg.isDone.push(notInterviewClass);
//                            }
//                        }
//                    }
//                } else {
//                    interviewDone = false;
//                }
//            }
//
//        } else {
//            interviewDone = false;
//        }
//        if (interviewDone) {
//            $scope.lastIncludedDevice = node.data.givenName.value || 'Device ' + '_' + nodeId;
//            myCache.remove('devices');
//            $scope.includedDeviceId = null;
//            $scope.checkInterview = false;
//            //$interval.cancel($scope.includeDataInterval);
//            $scope.nodeId = nodeId;
//            $scope.loadLocations();
//            $scope.loadElements(nodeId);
//
//
//        } else {
//            $scope.checkInterview = true;
//        }
//    }
//    ;

    /**
     * Get zwaveApiData
     */
    function zwaveApiData(nodeId, devices) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            dataService.updateTimeTick();
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }

            $scope.zWaveDevice = {
                id: nodeId,
                title: node.data.givenName.value || 'Device ' + '_' + nodeId,
                cfg: []
            };
            // Has config file
            if (angular.isDefined(node.data.ZDDXMLFile) && node.data.ZDDXMLFile.value != '') {
                if ($scope.zWaveDevice['cfg'].indexOf('config') === -1) {
                    $scope.zWaveDevice['cfg'].push('config');
                }
            }
            // Has wakeup
            if (0x84 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('wakeup') === -1) {
                    $scope.zWaveDevice['cfg'].push('wakeup');
                }
            }
            // Has SwitchAll
            if (0x27 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('switchall') === -1) {
                    $scope.zWaveDevice['cfg'].push('switchall');
                }
            }
            // Has protection
            if (0x75 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('protection') === -1) {
                    $scope.zWaveDevice['cfg'].push('protection');
                }
            }
            if ($scope.devices.length > 0) {
                $scope.devices = angular.copy([]);
            }
            var findZwaveStr = "ZWayVDev_zway_";
            angular.forEach(devices, function(v, k) {
                if (v.id.indexOf(findZwaveStr) === -1) {
                    return;
                }
                var cmd = v.id.split(findZwaveStr)[1].split('-');
                var zwaveId = cmd[0];
                var iId = cmd[1];
                var ccId = cmd[2];
                if (zwaveId == nodeId) {
                    var obj = {};
                    obj['id'] = v.id;
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['level'] = $filter('toInt')(v.metrics.level);
                    obj['metrics'] = v.metrics;
                    $scope.devices.push(obj);
                }

            });
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;


});
/**
 * Device Enocean  controller
 */
myAppController.controller('DeviceEnoceanController', function($scope, $routeParams, $location, dataFactory, dataService) {
    $scope.hasEnOcean = false;
    $scope.enoceanDevices = [];
    $scope.manufacturers = [];
    $scope.manufacturer = false;

    /**
     * Load Remote access data
     */
    $scope.loadEnOceanModule = function() {
        dataFactory.getApi('instances', '/EnOcean').then(function(response) {
            var module = response.data.data[0];
            if (Object.keys(module).length < 1) {
                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
                return;
            }
            if (!module.active) {
                $scope.alert = {message: $scope._t('enocean_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
            $scope.hasEnOcean = true;
        }, function(error) {
            if (error.status == 404) {
                $scope.alert = {message: $scope._t('enocean_nosupport'), status: 'alert-danger', icon: 'fa-warning'};
            } else {
                $location.path('/error/' + error.status);
            }

        });
    };

    $scope.loadEnOceanModule();


    /**
     * Load z-wave devices
     */
    $scope.loadData = function(brandname) {
        dataService.showConnectionSpinner();
        dataFactory.getApiLocal('devices_enocean.json').then(function(response) {
            $scope.manufacturers = dataService.getPairs(response.data, 'vendor', 'vendorLogo', 'manufacturers_enocean');
            if (brandname) {
                $scope.enoceanDevices = dataService.getData(response.data, {'filter': 'vendor', 'val': brandname});
                $scope.manufacturer = brandname;
            }
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData($routeParams.brandname);

});
/**
 * EnOcean devices controller
 */
myAppController.controller('EnoceanDeviceController', function($scope, $routeParams, dataFactory, dataService) {
    $scope.activeTab = 'devices';
    $scope.hasEnOcean = false;
    $scope.enoceanDevices = [];
    $scope.manufacturers = [];
    $scope.manufacturer = false;

    /**
     * Load Remote access data
     */
    $scope.loadEnOceanModule = function() {
        dataFactory.getApi('instances', '/EnOcean').then(function(response) {
            var module = response.data.data[0];
            if (Object.keys(module).length < 1) {
                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
                return;
            }
            if (!module.active) {
                $scope.alert = {message: $scope._t('enocean_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
            $scope.hasEnOcean = true;
        }, function(error) {
            if (error.status == 404) {
                $scope.alert = {message: $scope._t('enocean_nosupport'), status: 'alert-danger', icon: 'fa-warning'};
            } else {
                $location.path('/error/' + error.status);
            }

        });
    };

    $scope.loadEnOceanModule();


    /**
     * Load z-wave devices
     */
    $scope.loadData = function(brandname) {
        dataService.showConnectionSpinner();
        dataFactory.getApiLocal('devices_enocean.json').then(function(response) {
            $scope.manufacturers = dataService.getPairs(response.data, 'vendor', 'vendorLogo', 'manufacturers_enocean');
            if (brandname) {
                $scope.enoceanDevices = dataService.getData(response.data, {'filter': 'vendor', 'val': brandname});
                $scope.manufacturer = brandname;
            }
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData($routeParams.brandname);
});
/**
 * EnOcean assign profile controller
 */
myAppController.controller('EnoceanAssignController', function($scope, $interval, dataFactory, dataService, myCache) {
    $scope.activeTab = 'assign';
    $scope.profile = false;
    $scope.device = [];
    $scope.includedDevices = [];
    $scope.lastIncludedDevice = [];
    $scope.enoceanDevices = {};
    $scope.enoceanProfiles = {};
    $scope.apiDevices = [];
    $scope.dev = [];
    $scope.rooms = [];
    $scope.modelRoom;
    $scope.inclusion = {
        promisc: false,
        done: false,
        config: false,
        message: false,
        status: 'is-hidden',
        icon: false
    };
    $scope.apiDataInterval = null;

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load included devices
     */
    $scope.loadIncludedDevices = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadEnoceanDevices(true).then(function(response) {
            dataService.updateTimeTick();
            angular.forEach(response, function(v, k) {
                $scope.includedDevices.push(v.id);
            });

        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadIncludedDevices();

    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
        }, function(error) {
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load locations
     */
    $scope.loadLocations = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    $scope.loadLocations();


    /**
     * Load API devices
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.apiDevices = [];
            var findZenoStr = "ZEnoVDev_zeno_";
            angular.forEach(response.data.data.devices, function(v, k) {
                if (v.id.indexOf(findZenoStr) === -1) {
                    return;
                }
                var cmd = v.id.split(findZenoStr)[1].split('_');
                var zenoId = cmd[0];
                if (zenoId == $scope.lastIncludedDevice.id) {
                    var obj = {};
                    obj['id'] = v.id;
                    obj['title'] = v.metrics.title;
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['metrics'] = v.metrics;
                    $scope.apiDevices.push(obj);
                }

            });

        }, function(error) {
        });
    };


    /**
     * Assign profile
     */
    $scope.loadDevice = function(profile) {
        $interval.cancel($scope.apiDataInterval);
        $scope.device = angular.fromJson(profile);
        $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        $scope.runCmd('controller.data.promisc=true');
        $scope.refreshData();
    }
    ;

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            var findStr = 'devices';
            dataFactory.refreshEnoceanDevices().then(function(response) {
                if ('controller.data.promisc' in response.data) {
                    var pomisc = response.data['controller.data.promisc'].value;
                    if (pomisc === true) {
                        $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
                    } else {
                        $scope.inclusion = {done: false, promisc: false, message: $scope._t('teachin_canceled'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                    }
                    return;
                }

                if ('devices' in response.data) {
                    angular.forEach(response.data.devices, function(v, k) {
                        $scope.findDevice(k);
                    });
                    return;
                }
                angular.forEach(response.data, function(v, k) {
                    var array = k.split('.');
                    if (array.indexOf(findStr) > -1) {
                        $scope.findDevice(array[1]);
                    }
                });
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };



    /**
     * Find last included device
     */
    $scope.findDevice = function(id) {
        var rorg = parseInt($scope.device.rorg);
        dataFactory.loadEnoceanDevices(true).then(function(response) {
            angular.forEach(response, function(v, k) {
                if (v.id == id) {
                    // if (v.data.rorg.value == rorg) {
                    var name = '(#' + v.id + ')';
                    var profile = assignProfile(v.data);
                    if (profile) {
                        name = profile._funcDescription + ' (#' + v.id + ')';
                    }

                    $scope.runCmd('controller.data.promisc=false');
                    $scope.lastIncludedDevice = {
                        id: v.id,
                        rorg: v.data.rorg.value,
                        name: name,
                        data: v.data,
                        deviceProfileId: v.data.rorg.value + '_' + v.data.funcId.value + '_' + v.data.typeId.value,
                        profile: profile
                    };


                    $scope.runCmd('devices["' + v.id + '"].data.funcId=' + $scope.device.funcId);
                    $scope.runCmd('devices["' + v.id + '"].data.typeId=' + +$scope.device.typeId);
                    $interval.cancel($scope.apiDataInterval);
                    $scope.inclusion = {done: true, config: true, promisc: false, message: $scope._t('inclusion_proces_done'), status: 'alert-success', icon: 'fa-check'};
                    $scope.loadApiDevices();
                    dataService.updateTimeTick();
                    return;
                }
                //}
            });

        }, function(error) {
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};
        });

    };

    /**
     * Run CMD
     */
    $scope.runCmd = function(cmd) {
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};

        });
        return;
    };

    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadApiDevices();
            $scope.loading = false;
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        myCache.remove('devices');
        $scope.loadApiDevices();
        $scope.loading = false;
        return;

    };

    /**
     * Assign profile to device
     */
    function assignProfile() {
        var profile = false;
        var deviceProfileId = parseInt($scope.device.rorg, 16) + '_' + parseInt($scope.device.funcId, 16) + '_' + parseInt($scope.device.typeId, 16);
        angular.forEach($scope.enoceanProfiles, function(v, k) {
            if (deviceProfileId == v.id) {
                console.log(v.id)
                profile = v;
                return;
            }
        });
        return profile;
    }
    ;

});
/**
 * EnOcean teach In controller
 */
myAppController.controller('EnoceanTeachinController', function($scope, $routeParams, $interval, $location, dataFactory, dataService, myCache) {
    $scope.device = [];
    $scope.includedDevices = [];
    $scope.lastIncludedDevice = [];
    $scope.enoceanDevices = {};
    $scope.enoceanProfiles = {};
    $scope.apiDevices = [];
    $scope.dev = [];
    $scope.rooms = [];
    $scope.modelRoom;
    $scope.inclusion = {
        promisc: false,
        done: false,
        config: false,
        message: false,
        status: 'is-hidden',
        icon: false
    };
    $scope.apiDataInterval = null;

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load included devices
     */
    $scope.loadIncludedDevices = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadEnoceanDevices(true).then(function(response) {
            dataService.updateTimeTick();
            angular.forEach(response, function(v, k) {
                $scope.includedDevices.push(v.id);
            });

        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadIncludedDevices();

    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
        }, function(error) {
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load locations
     */
    $scope.loadLocations = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    $scope.loadLocations();

    /**
     * Load API devices
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.apiDevices = [];
            var findZenoStr = "ZEnoVDev_zeno_";
            angular.forEach(response.data.data.devices, function(v, k) {
                if (v.id.indexOf(findZenoStr) === -1) {
                    return;
                }
                var cmd = v.id.split(findZenoStr)[1].split('_');
                var zenoId = cmd[0];
                if (zenoId == $scope.lastIncludedDevice.id) {
                    var obj = {};
                    obj['id'] = v.id;
                    obj['title'] = v.metrics.title;
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['metrics'] = v.metrics;
                    $scope.apiDevices.push(obj);
                }

            });

        }, function(error) {
        });
    };

    /**
     * Load single device
     */
    $scope.loadDevice = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApiLocal('devices_enocean.json').then(function(response) {
            angular.forEach(response.data, function(v, k) {
                if (v.id == $routeParams.device) {
                    $scope.device = v;
                    return;
                }
            });
            if (!$scope.device) {
                $location.path('/error/404');
            }

            dataService.updateTimeTick();
            $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
            $scope.runCmd('controller.data.promisc=true');

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };

    $scope.loadDevice();

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            var findStr = 'devices';
            dataFactory.refreshEnoceanDevices().then(function(response) {
                if ('controller.data.promisc' in response.data) {
                    var pomisc = response.data['controller.data.promisc'].value;
                    if (pomisc === true) {
                        $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
                    } else {
                        $scope.inclusion = {done: false, promisc: false, message: $scope._t('teachin_canceled'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                    }
                    return;
                }

                if ('devices' in response.data) {
                    angular.forEach(response.data.devices, function(v, k) {
                        $scope.findDevice(k);
                    });
                    return;
                }
                angular.forEach(response.data, function(v, k) {
                    var array = k.split('.');
                    if (array.indexOf(findStr) > -1) {
                        $scope.findDevice(array[1]);
                    }
                });
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshData();

    /**
     * Find last included device
     */
    $scope.findDevice = function(id) {
        var rorg = parseInt($scope.device.rorg);
        dataFactory.loadEnoceanDevices(true).then(function(response) {
            angular.forEach(response, function(v, k) {
                if (v.id == id) {
                    // if (v.data.rorg.value == rorg) {
                    var config = false;
                    var name = '(#' + v.id + ')';
                    var profile = assignProfile(v.data);
                    if (profile) {
                        name = profile._funcDescription + ' (#' + v.id + ')';
                    }

                    $scope.runCmd('controller.data.promisc=false');
                    $scope.lastIncludedDevice = {
                        id: v.id,
                        rorg: v.data.rorg.value,
                        name: name,
                        data: v.data,
                        deviceProfileId: v.data.rorg.value + '_' + v.data.funcId.value + '_' + v.data.typeId.value,
                        profile: profile
                    };


                    $scope.runCmd('devices["' + v.id + '"].data.funcId=' + $scope.device.funcId);
                    $scope.runCmd('devices["' + v.id + '"].data.typeId=' + +$scope.device.typeId);
                    $interval.cancel($scope.apiDataInterval);
                    $scope.inclusion = {done: true, config: true, promisc: false, message: $scope._t('inclusion_proces_done'), status: 'alert-success', icon: 'fa-check'};
                    $scope.loadApiDevices();
                    dataService.updateTimeTick();
                    return;
                }
                //}
            });

        }, function(error) {
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};
        });

    };

    /**
     * Run CMD
     */
    $scope.runCmd = function(cmd) {
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};

        });
        return;
    };

    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadApiDevices();
            $scope.loading = false;
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        myCache.remove('devices');
        $scope.loadApiDevices();
        $scope.loading = false;
        return;

    };

    /**
     * Assign profile to device
     */
    function assignProfile(device, profiles) {
        var profile = false;
        var deviceProfileId = parseInt($scope.device.rorg, 16) + '_' + parseInt($scope.device.funcId, 16) + '_' + parseInt($scope.device.typeId, 16);
        angular.forEach($scope.enoceanProfiles, function(v, k) {
            var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);

            if (deviceProfileId == v.id) {
                profile = v;
                return;
            }
        });
        return profile;
    }
    ;
});
/**
 * EnOcean manage  controller
 */
myAppController.controller('EnoceanManageController', function($scope, $location, $window, dataFactory, dataService) {
    $scope.activeTab = 'manage';
    $scope.goEdit = [];
    $scope.apiDevices = [];
    $scope.enoceanDevices = {};

    /**
     * Load API devices
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.apiDevices = response.data.data.devices;
        }, function(error) {
            // $location.path('/error/' + error.status);
        });
    };
    $scope.loadApiDevices();

    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            var profile = dataService.setEnoProfile(response.Profiles.Profile);
            $scope.loadData(profile);
        }, function(error) {
            $scope.loadData(null);
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load enocean data
     */
    $scope.loadData = function(enoceanProfiles) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataService.showConnectionSpinner();
        dataFactory.loadEnoceanDevices(true).then(function(response) {
            dataService.updateTimeTick();
            if (Object.keys(response).length < 1) {
                $scope.loading = {status: 'loading-fade', icon: 'fa-exclamation-circle text-warning', message: $scope._t('no_devices')};
                return;
            }
            setDevices(response, enoceanProfiles);
            $scope.loading = false;

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };




    /**
     * Run CMD
     */
    $scope.runCmd = function(cmd) {
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};

        });
        return;
    };
    /**
     * Delete device
     */
    $scope.deleteDevice = function(id, target, dialog) {
        var confirm = true;
        var cmd = 'delete devices["' + id + '"]';
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.runEnoceanCmd(cmd).then(function(response) {
                $(target).fadeOut(500);
                //$scope.loadData();
            }, function(error) {
                alert($scope._t('error_delete_data'));
            });

        }
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices, profiles) {

        angular.forEach(devices, function(v, k) {
            $scope.enoceanDevices[v.id] = {
                id: v.id,
                data: v.data,
                profile: assignProfile(v.data, profiles),
                elements: getElements($scope.apiDevices, v.id)
            };
        });
    }
    ;
    /**
     * Assign profile to device
     */
    function assignProfile(device, profiles) {
        var profile = false;
        var deviceProfileId = device.rorg.value + '_' + device.funcId.value + '_' + device.typeId.value;
        angular.forEach(profiles, function(v, k) {
            //var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);
            if (deviceProfileId == v.id) {
                profile = v;
                return;
            }
        });
        return profile;
    }
    ;

    /**
     * Get elements
     */
    function getElements(devices, nodeId) {
        var elements = [];
        var findZenoStr = "ZEnoVDev_zeno_";
        angular.forEach(devices, function(v, k) {
            if (v.id.indexOf(findZenoStr) === -1) {
                return;
            }
            var cmd = v.id.split(findZenoStr)[1].split('_');
            var zenoId = cmd[0];
            if (zenoId == nodeId) {
                var obj = {};
                obj['id'] = v.id;
                obj['title'] = v.metrics.title;
                obj['permanently_hidden'] = v.permanently_hidden;
                obj['metrics'] = v.metrics;
                elements.push(obj);
            }

        });
        return elements;
    }
    ;
});
/**
 * EnOcean manage detail  controller
 */
myAppController.controller('EnoceanManageDetailController', function($scope, $routeParams, $location, $filter, dataFactory, dataService, myCache) {
    $scope.activeTab = 'manage';
    $scope.nodeId = $routeParams.deviceId;
    $scope.enoceanDevice = [];
    $scope.enoceanProfiles = {};
    $scope.input = {};
    $scope.dev = [];
    $scope.apiDevices = [];
    $scope.rooms = [];
    $scope.modelRoom;

    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
        }, function(error) {
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load enocean data
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.runEnoceanCmd('zeno.devices["' + $routeParams.deviceId + '"]').then(function(response) {
            if (response.data == 'null') {
                $location.path('/error/404');
                return;
            }
            var device = response.data;
            var name = '';
            var profile = assignProfile(device.data, $scope.enoceanProfiles);
            if (profile) {
                //profileId = profile.profileId;
                name = profile._funcDescription;
            }
            dataService.updateTimeTick();
            $scope.input = {
                id: device.id,
                rorg: device.data.rorg.value,
                name: name,
                deviceProfileId: device.data.rorg.value + '_' + device.data.funcId.value + '_' + device.data.typeId.value,
                profile: profile,
                profileId: ''

            };
        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData();

    /**
     * Load API devices
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices', null, true).then(function(response) {
            $scope.apiDevices = [];
            var findZenoStr = "ZEnoVDev_zeno_";
            angular.forEach(response.data.data.devices, function(v, k) {
                if (v.id.indexOf(findZenoStr) === -1) {
                    return;
                }
                var cmd = v.id.split(findZenoStr)[1].split('_');
                var zenoId = cmd[0];
                if (zenoId == $scope.nodeId) {
                    var obj = {};
                    obj['id'] = v.id;
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['level'] = $filter('toInt')(v.metrics.level);
                    obj['metrics'] = v.metrics;
                    $scope.apiDevices.push(obj);
                }

            });
            loadLocations();

        }, function(error) {
            // $location.path('/error/' + error.status);
        });
    };
    $scope.loadApiDevices();

    /**
     * Store device data
     */
    $scope.store = function(input) {
        if (input.profileId) {
            var device = angular.fromJson(input.profileId);
            $scope.runCmd('devices["' + $scope.nodeId + '"].data.funcId=' + device.funcId);
            $scope.runCmd('devices["' + $scope.nodeId + '"].data.typeId=' + device.typeId);

        }
        if (input.name) {
            //$scope.runCmd('devices["' + $scope.nodeId + '"].data.name=' + input.name);
        }
        $scope.loadData();
        $scope.loadApiDevices();

    };

    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadApiDevices();
            $scope.loading = false;
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        //myCache.remove('devices');
        $scope.loadApiDevices();
        $scope.loading = false;
        return;

    };



    /**
     * Run CMD
     */
    $scope.runCmd = function(cmd) {
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};

        });
        return;
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices, profiles) {
        angular.forEach(devices, function(v, k) {
            $scope.enoceanDevices[v.id] = {
                id: v.id,
                data: v.data,
                profile: assignProfile(v.data, profiles)
            };
        });
        //console.log($scope.deviceCollection)
    }
    ;
    /**
     * Assign profile to device
     */
    function assignProfile(device, profiles) {
        var profile = false;
        var deviceProfileId = device.rorg.value + '_' + device.funcId.value + '_' + device.typeId.value;
        angular.forEach(profiles, function(v, k) {
            //var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);
            if (deviceProfileId == v.id) {
                profile = v;
                return;
            }
        });
        return profile;
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
});
/**
 * EnOcean controller info controller
 */
myAppController.controller('EnoceanControllerController', function($scope, $location, dataFactory, dataService) {
    $scope.activeTab = 'controller';
    $scope.controller = false;
    $scope.controllerShow = ['APIVersion', 'AppDescription', 'AppVersion', 'ChipID', 'ChipVersion'];

    /**
     * Load enocean data
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.dataEnoceanCmd().then(function(response) {
            $scope.controller = response.data.controller.data;
            dataService.updateTimeTick();
        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData();
});
/**
 * Room controller
 */
myAppController.controller('RoomController', function($scope, $location, dataFactory, dataService) {
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
//            if (Object.keys($scope.collection).length < 1) {
//                $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-warning', message: $scope._t('no_data')};
//            }
            dataService.updateTimeTick();
        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData();
});
/**
 * Room config controller
 */
myAppController.controller('RoomConfigController', function($scope, $window, $location, dataFactory, dataService, myCache) {
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
            $location.path('/error/' + error.status);
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
            dataFactory.putApi('devices', v.id, {'location': 0}).then(function(response) {
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
myAppController.controller('RoomConfigEditController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache) {
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
            $location.path('/error/' + error.status);
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
    $scope.assignDevice = function(device) {
        device.location = null;
        $scope.devicesAssigned.push(device.id);
        return;
    };

    /**
     * Remove device from the room
     */
    $scope.removeDevice = function(device) {
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        $scope.devicesToRemove = $scope.devicesToRemove.length > 0 ? $scope.devicesToRemove : [];
        angular.forEach(oldList, function(v, k) {
            if (v != device.id) {
                $scope.devicesAssigned.push(v);
            } else {
                device.location = 0;
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
                //$scope.loadData(id);
                $location.path('/config-rooms');
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;

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
                if (v.location == locationId && v.location !== 0) {
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
            dataFactory.putApi('devices', v, {'location': 0}).then(function(response) {
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
myAppController.controller('NetworkController', function($scope, $cookies, $filter, $window, $location, dataFactory, dataService, myCache) {
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
    $scope.goEdit = [];
    $scope.zWaveDevices = {};

//    $scope.modelName = [];
//    $scope.modelRoom = {};
//
//    $scope.rooms = [];
    /**
     * Set tab
     */
    $scope.setTab = function(tabId) {
        $scope.activeTab = tabId;
        $cookies.tab_network = tabId;
    };


    /**
     * Load data
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            zwaveApiData(response.data.data.devices);
            loadLocations();

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData();

    /**
     * DEPRECATED
     * Assign devices to room
     */
//    $scope.devicesToRoom = function(roomId, devices) {
//        if (!roomId) {
//            return;
//        }
//        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
//        for (var i = 0; i <= devices.length; i++) {
//            var v = devices[i];
//            if (!v) {
//                continue;
//            }
//            var input = {
//                id: v.id,
//                location: roomId
//            };
//            dataFactory.putApi('devices', v.id, input).then(function(response) {
//            }, function(error) {
//                alert($scope._t('error_update_data'));
//                $scope.loading = false;
//                dataService.logError(error);
//                return;
//            });
//        }
//        myCache.remove('devices');
//        $scope.loadData();
//        $scope.loading = false;
//        return;
//
//    };

    /**
     * DEPRECATED
     * Set device visibility
     */
//    $scope.setVisibility = function(deviceId, visibility) {
//        var input = {
//            id: deviceId,
//            visibility: visibility
//        };
//
//        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
//        dataFactory.putApi('devices', deviceId, input).then(function(response) {
//            myCache.remove('devices');
//            $scope.loadData();
//            $scope.loading = false;
//        }, function(error) {
//            alert($scope._t('error_update_data'));
//            $scope.loading = false;
//            dataService.logError(error);
//        });
//
//    };

    /**
     * DEPRECATED
     * Set device visibility
     */
//    $scope.renameDevice = function(deviceId, title) {
//        var input = {
//            id: deviceId,
//            metrics: {
//                title: title
//            }
//        };
//
//        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
//        dataFactory.putApi('devices', deviceId, input).then(function(response) {
//            myCache.remove('devices');
//            $scope.loadData();
//            $scope.loading = false;
//        }, function(error) {
//            alert($scope._t('error_update_data'));
//            $scope.loading = false;
//            dataService.logError(error);
//        });
//
//    };

    /**
     * DEPRECATED
     * Add/Remove device in list
     */
//    $scope.hiddenList = function(deviceId, checked) {
//        if (checked) {
//            if ($scope.hiddenDevices.indexOf(deviceId) === -1) {
//                $scope.hiddenDevices.push(deviceId);
//            }
//        } else {
//            for (var i = 0; i <= $scope.hiddenDevices.length; i++) {
//                var v = $scope.hiddenDevices[i];
//                if (v === deviceId) {
//                    $scope.hiddenDevices.splice(i, 1);
//                }
//            }
//        }
//    };

    /**
     * DEPRECATED
     * Update devices with status hidden
     */
//    $scope.handleHidden = function() {
//        var devices = [];
//        for (var i = 0; i <= $scope.devices.zwave.length; i++) {
//            var v = $scope.devices.zwave[i];
//            if(!v){
//                continue;
//            }
//            var isHidden = false;
//            if ($scope.hiddenDevices.indexOf(v.id) !== -1) {
//                isHidden = true;
//            }
//            devices[v.id] = isHidden;
//        }
//
//         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
//            dataFactory.postApi('hide_devices', {data: devices}).then(function(response) {
//                  myCache.remove('devices');
//                   $scope.loadData();
//                   $scope.loading = false;
//            }, function(error) {
//                alert($scope._t('error_update_data'));
//                $scope.loading = false;
//                dataService.logError(error);
//            });
//
//    };

    /// --- Private functions --- ///
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
                    cfg: [],
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
                        // Has config file
//                        if (angular.isDefined(node.data.ZDDXMLFile) && node.data.ZDDXMLFile.value != '') {
//                            if ($scope.zWaveDevices[nodeId]['cfg'].indexOf('config') === -1) {
//                                $scope.zWaveDevices[nodeId]['cfg'].push('config');
//                            }
//                        }
//                        // Has wakeup
//                        if (0x84 in node.instances[0].commandClasses) {
//                            if ($scope.zWaveDevices[nodeId]['cfg'].indexOf('wakeup') === -1) {
//                                $scope.zWaveDevices[nodeId]['cfg'].push('wakeup');
//                            }
//                        }
//                        // Has SwitchAll
//                        if (0x27 in node.instances[0].commandClasses) {
//                            if ($scope.zWaveDevices[nodeId]['cfg'].indexOf('switchall') === -1) {
//                                $scope.zWaveDevices[nodeId]['cfg'].push('switchall');
//                            }
//                        }
//                        // Has protection
//                        if (0x75 in node.instances[0].commandClasses) {
//                            if ($scope.zWaveDevices[nodeId]['cfg'].indexOf('protection') === -1) {
//                                $scope.zWaveDevices[nodeId]['cfg'].push('protection');
//                            }
//                        }
                        var obj = {};
                        obj['id'] = v.id;
                        obj['visibility'] = v.visibility;
                        obj['permanently_hidden'] = v.permanently_hidden;
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
            $location.path('/error/' + error.status);
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
myAppController.controller('NetworkConfigController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache) {
    $scope.zWaveDevice = [];
    $scope.devices = [];
    $scope.dev = [];
    $scope.rooms = [];
    $scope.modelRoom;

    /**
     * Load data
     */
    $scope.loadData = function(nodeId) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            zwaveApiData(nodeId, response.data.data.devices);
            loadLocations();

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData($routeParams.nodeId);

    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        myCache.remove('devices');
        $scope.loadData($routeParams.nodeId);
        $scope.loading = false;
        return;

    };
    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadData($routeParams.nodeId);
            $scope.loading = false;
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///
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
     * Get zwaveApiData
     */
    function zwaveApiData(nodeId, devices) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            dataService.updateTimeTick();
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                $location.path('/error/404');
                return;
            }

            $scope.zWaveDevice = {
                id: nodeId,
                title: node.data.givenName.value || 'Device ' + '_' + nodeId,
                cfg: []
            };
            // Has config file
            if (angular.isDefined(node.data.ZDDXMLFile) && node.data.ZDDXMLFile.value != '') {
                if ($scope.zWaveDevice['cfg'].indexOf('config') === -1) {
                    $scope.zWaveDevice['cfg'].push('config');
                }
            }
            // Has wakeup
            if (0x84 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('wakeup') === -1) {
                    $scope.zWaveDevice['cfg'].push('wakeup');
                }
            }
            // Has SwitchAll
            if (0x27 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('switchall') === -1) {
                    $scope.zWaveDevice['cfg'].push('switchall');
                }
            }
            // Has protection
            if (0x75 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('protection') === -1) {
                    $scope.zWaveDevice['cfg'].push('protection');
                }
            }
            if ($scope.devices.length > 0) {
                $scope.devices = angular.copy([]);
            }
            var findZwaveStr = "ZWayVDev_zway_";
            angular.forEach(devices, function(v, k) {
                if (v.id.indexOf(findZwaveStr) === -1) {
                    return;
                }
                var cmd = v.id.split(findZwaveStr)[1].split('-');
                var zwaveId = cmd[0];
                var iId = cmd[1];
                var ccId = cmd[2];
                if (zwaveId == nodeId) {
                    var obj = {};
                    obj['id'] = v.id;
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['level'] = $filter('toInt')(v.metrics.level);
                    obj['metrics'] = v.metrics;
                    $scope.devices.push(obj);
                }

            });
        }, function(error) {
            $location.path('/error/404');
        });
    }
    ;


});
/**
 * Profile controller
 */
myAppController.controller('AdminController', function($scope, $window, $location, $timeout, $interval, dataFactory, dataService, myCache) {
    $scope.profiles = {};
    $scope.remoteAccess = false;

    // Licence
    $scope.controllerUuid = null;
    $scope.proccessLicence = false;
    $scope.proccessVerify = {
        'message': false,
        'status': 'is-hidden'
    };
    $scope.proccessUpdate = {
        'message': false,
        'status': 'is-hidden'
    };
    $scope.inputLicence = {
        "scratch_id": null
    };
    $scope.restoreBck = {
        chip: '0'
    };

    $scope.zwaveDataInterval = null;
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.zwaveDataInterval);
    });

    /**
     * Load ZwaveApiData
     */
    $scope.loadZwaveApiData = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            $scope.controllerUuid = ZWaveAPIData.controller.data.uuid.value;
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadZwaveApiData();

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('profiles').then(function(response) {
            $scope.profiles = response.data.data;
            dataService.updateTimeTick();
        }, function(error) {
            $location.path('/error/' + error.status);
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
            });
        }
    };

    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function() {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        dataFactory.getApi('instances', '/RemoteAccess').then(function(response) {
            var remoteAccess = response.data.data[0];
            if (Object.keys(remoteAccess).length < 1) {
                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
            }
            if (!remoteAccess.active) {
                $scope.alert = {message: $scope._t('remote_access_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
            if (!remoteAccess.params.userId) {
                $scope.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-warning'};
                return;
            }
            remoteAccess.params.pass = null;
            $scope.remoteAccess = remoteAccess;
        }, function(error) {
            $scope.alert = {message: $scope._t('remote_access_not_installed'), status: 'alert-danger', icon: 'fa-warning'};
        });
    };

    $scope.loadRemoteAccess();

    /**
     * PUT Remote access
     */
    $scope.putRemoteAccess = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.putApi('instances', input.id, input).then(function(response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};

        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Get license key
     */
    $scope.getLicense = function(inputLicence) {
        // Clear messages
        $scope.proccessVerify.message = false;
        $scope.proccessUpdate.message = false;
        if (!inputLicence.scratch_id) {
            return;
        }

        $scope.proccessVerify = {'message': $scope._t('verifying_licence_key'), 'status': 'fa fa-spinner fa-spin'};
        $scope.proccessLicence = true;
        var input = {
            'uuid': $scope.controllerUuid,
            'scratch': inputLicence.scratch_id
        };

//        $timeout(function() {
//            $scope.proccessVerify = {'message': $scope._t('success_licence_key'), 'status': 'fa fa-check text-success'};
//            updateCapabilities();
//        }, 3000);
        dataFactory.getLicense(input).then(function(response) {
            $scope.proccessVerify = {'message': $scope._t('success_licence_key'), 'status': 'fa fa-check text-success'};
            // Update capabilities
            updateCapabilities(response);
        }, function(error) {
            var message = $scope._t('error_no_licence_key');
            if (error.status == 404) {
                var message = $scope._t('error_404_licence_key');
            }
            $scope.proccessVerify = {'message': message, 'status': 'fa fa-exclamation-triangle text-danger'};
            $scope.proccessLicence = false;

        });
        return;
    };

    /**
     * Update capabilities
     */
    function updateCapabilities(data) {
        $scope.proccessUpdate = {'message': $scope._t('upgrading_capabilities'), 'status': 'fa fa-spinner fa-spin'};
//        $timeout(function() {
//             $scope.proccessUpdate = {'message': $scope._t('success_capabilities'), 'status': 'fa fa-check text-success'};
//             $scope.proccessLicence = false;
//        }, 3000);
        dataFactory.zmeCapabilities(data).then(function(response) {
            $scope.proccessUpdate = {'message': $scope._t('success_capabilities'), 'status': 'fa fa-check text-success'};
            $scope.proccessLicence = false;
        }, function(error) {
            $scope.proccessUpdate = {'message': $scope._t('error_no_capabilities'), 'status': 'fa fa-exclamation-triangle text-danger'};
            $scope.proccessLicence = false;
        });
    }
    ;

    /**
     * Upload image
     */
    $scope.uploadFile = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('restore_wait')};
        var fd = new FormData();
        fd.append('config_backup', $scope.myFile);
        dataFactory.restoreFromBck(fd, input.chip).then(function(response) {
            $timeout(function() {
                $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('restore_done_reload_ui')};
                //$interval.cancel($scope.zwaveDataInterval);
                $window.location.reload();
            }, 20000);
        }, function(error) {
            $scope.loading = false;
            alert($scope._t('restore_backup_failed'));
        });
    };

    /**
     * Cancel restore
     */
    $scope.cancelRestore = function() {
        $("#restore_confirm").attr('checked', false);
        $("#restore_chip_info").attr('checked', false);
        $scope.goRestore = false;
        $scope.goRestoreUpload = false;

    };

    /**
     * Refresh ZWAVE api data
     */
//    $scope.refreshZwaveApiData = function() {
//        var refresh = function() {
//            dataFactory.refreshZwaveApiData().then(function(response) {
//                if ('controller.data.controllerState' in response.data) {
//                    var state = response.data['controller.data.controllerState'].value;
//                    if (state == 20) {
//                        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('restore_wait')};
//                        $timeout(function() {
//                            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('restore_done_reload_ui')};
//                             $interval.cancel($scope.zwaveDataInterval);
//                        }, 20000);
//                    }
//                }
//               
//            }, function(error) {
//                dataService.showConnectionError(error);
//                return;
//            });
//        };
//        $scope.zwaveDataInterval = $interval(refresh, $scope.cfg.interval);
//        return;
//    };
//    $scope.refreshZwaveApiData();
});
/**
 * Orofile detail
 */
myAppController.controller('AdminUserController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.rooms = {};
    $scope.input = {
        id: 0,
        name: '',
        active: true,
        role: 2,
        password: '',
        login: '',
        lang: 'en',
        color: '#dddddd',
        hide_all_device_events: false,
        hide_system_events: false,
        hide_single_device_events: [],
        rooms: [0],
        default_ui: 1,
        expert_view: false

    };
    $scope.auth = {
        login: null,
        password: null

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
            $location.path('/error/' + error.status);
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
            input.password = input.password;
        }
        input.role = parseInt(input.role, 10);
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
        });

    };

    /**
     * Change auth data
     */
    $scope.changeAuth = function(auth) {
        if (!auth.login && !auth.password) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            login: auth.login,
            password: auth.password

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
        });

    };

    /// --- Private functions --- ///


});
/**
 * My Access
 */
myAppController.controller('MyAccessController', function($scope, $window, $location, dataFactory, dataService, myCache) {
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
            $scope.loading = false;
            $location.path('/error/' + error.status);
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
        });

    };

    /**
     * Change password
     */
    $scope.changePassword = function(newPassword) {
        if (!newPassword || newPassword == '') {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            password: newPassword

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
 * Report controller
 */
myAppController.controller('ReportController', function($scope, $window, dataFactory, dataService) {
    $scope.ZwaveApiData = false;
    $scope.remoteAccess = false;
    $scope.input = {
        browser_agent: '',
        browser_version: '',
        browser_info: '',
        shui_version: '',
        zwave_vesion: '',
        controller_info: '',
        remote_id: '',
        remote_activated: 0,
        remote_support_activated: 0,
        zwave_binding: 0,
        email: null,
        content: null
    };

    /**
     * Load ZwaveApiData
     */
    $scope.loadZwaveApiData = function() {
        dataService.showConnectionSpinner();
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            $scope.ZwaveApiData = ZWaveAPIData;
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadZwaveApiData();
    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function() {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        dataFactory.getApi('instances', '/RemoteAccess').then(function(response) {
            $scope.remoteAccess = response.data.data[0];
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };

    $scope.loadRemoteAccess();

    /**
     * Create/Update an item
     */
    $scope.store = function(form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('sending')};
        if ($scope.ZwaveApiData) {
            input.zwave_binding = 1;
            input.zwave_vesion = $scope.ZwaveApiData.controller.data.softwareRevisionVersion.value;
            input.controller_info = JSON.stringify($scope.ZwaveApiData.controller.data);
        }
        if (Object.keys($scope.remoteAccess).length > 0) {
            input.remote_activated = $scope.remoteAccess.params.actStatus ? 1 : 0;
            input.remote_support_activated = $scope.remoteAccess.params.sshStatus ? 1 : 0;
            input.remote_id = $scope.remoteAccess.params.userId;

        }
        input.browser_agent = $window.navigator.appCodeName;
        input.browser_version = $window.navigator.appVersion;
        input.browser_info = 'PLATFORM: ' + $window.navigator.platform + '\nUSER-AGENT: ' + $window.navigator.userAgent;
        input.shui_version = $scope.cfg.app_version;
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postReport(input).then(function(response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_send_report')};
            $window.location.reload();
//            $scope.form.$setPristine();
//           input.content = null;
//            input.email = null;


        }, function(error) {
            alert($scope._t('error_send_report'));
            $scope.loading = false;
        });

    };

});
/**
 * Login controller
 */
myAppController.controller('LoginController', function($scope, $location, $window, $routeParams, $document, $cookies, dataFactory, dataService) {
    $scope.input = {
        form: true,
        login: '',
        password: '',
        keepme: false,
        default_ui: 1
    };
    if (dataService.getUser()) {
        $location.path('/elements');
        return;
    }

    // var bareDomain = $window.location.host
    //console.log(bareDomain)
//document.cookie = 'ZWAYSession=; Domain=' + bareDomain + '; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//delete $cookies['ZWAYSession'];
//$document.cookie = 'ZWAYSession=; path=/; expires=' + new Date(0).toUTCString();
//console.log($document.cookie)
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
        input.password = input.password;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.alert = {message: false};
        dataFactory.logInApi(input).then(function(response) {
            var user = response.data.data;
            dataService.setZWAYSession(user.sid);
            //delete user['sid'];
            dataService.setUser(user);
            dataService.setLastLogin(Math.round(+new Date() / 1000));
            //$scope.loading = false;
            $scope.input.form = false;
            $window.location.href = '#/elements';
            $window.location.reload();
        }, function(error) {
            var message = $scope._t('error_load_data');
            if (error.status == 401) {
                message = $scope._t('error_load_user');
            }
            $scope.loading = false;
            $scope.alert = {message: message, status: 'alert-danger', icon: 'fa-warning'};
        });
    };
    if ($routeParams.login && $routeParams.password) {
        $scope.login($routeParams);
    }

});
/**
 * Logout controller
 */
myAppController.controller('LogoutController', function($scope, dataService) {
    $scope.logout = function() {
        dataService.logOut();
    };
    $scope.logout();

});
/**
 * Error controller
 */
myAppController.controller('ErrorController', function($scope, $routeParams, dataService) {
    $scope.errorCfg = {
        code: false,
        icon: 'fa-warning'
    };
    /**
     * Logout proccess
     */
    $scope.loadError = function(code) {
        if (code) {
            $scope.errorCfg.code = code;
        } else {
            $scope.errorCfg.code = 0;
        }
        dataService.showConnectionError(code);

    };
    $scope.loadError($routeParams.code);

});

