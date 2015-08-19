/**
 * Application Event controller
 * @author Martin Vach
 */

/**
 * Event controller
 */
myAppController.controller('EventController', function($scope, $routeParams, $interval, $window, $filter, $cookies, $location, dataFactory, dataService, myCache, paginationService, cfg, _) {
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
        //$scope.eventSources = dataService.getPairs(data.data.notifications, 'source', 'source');
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