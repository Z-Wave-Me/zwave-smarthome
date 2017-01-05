/**
 * @overview Handles all events.
 * @author Martin Vach
 */

/**
 * The controller that renders and handles event actions.
 * @class EventController
 */
myAppController.controller('EventController', function ($scope, $routeParams, $interval, $q, $filter, $cookies, dataFactory, dataService, myCache, paginationService, cfg, _) {
    $scope.page = {
        title: false
    };
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
    $scope.currSource = false;
    $scope.eventSources = [];
    //$scope.profileData = [];
    $scope.currLevel = false;
    $scope.timeFilterDefault = {
        since: $filter('unixStartOfDay')(),
        to: $filter('unixStartOfDay')('+', 86400),
        day: 1
    };
    $scope.timeFilter = $scope.timeFilterDefault;
    $scope.devices = {
        cnt:{
            deviceEvents:{}
        },
        find: {
            id: false,
            title: false,
            data: {}
        },
        data: {},
        show: false
    };
    $scope.currentPage = 1;
    $scope.pageSize = cfg.page_results_events;
    $scope.reset = function () {
        $scope.collection = angular.copy([]);
    };
    $scope.apiDataInterval = null;

    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $scope.currSource = false;
        $scope.currLevel = false;
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.timeFilter = (angular.isDefined($cookies.events_timeFilter) ? angular.fromJson($cookies.events_timeFilter) : $scope.timeFilter);
        var urlParam = '?since=' + $scope.timeFilter.since;

        var promises = [
            dataFactory.getApi('devices', null, true),
            dataFactory.getApi('notifications', urlParam, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var events = response[1];

            $scope.loading = false;
            // Error message
            if (events.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                //setDevices(devices.value.data.data.devices);
                setDevices(dataService.getDevicesData(devices.value.data.data.devices,false));
            }

            // Success - notifications
            if (events.state === 'fulfilled') {
                setEvents(events.value.data.data.notifications);
            }

        });
    };
    $scope.allSettled();
    /**
     * Change time
     */
    $scope.changeTime = function (day) {
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
        //$scope.loadData();
        $scope.allSettled();
    };

    /**
     * Refresh data
     */
    $scope.refreshData = function () {
        var refresh = function () {
            dataFactory.refreshApi('notifications').then(function (response) {
                angular.forEach(response.data.data.notifications, function (v, k) {
                    $scope.collection.push(v);
                });
            }, function (error) {});
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };
    $scope.refreshData();
    // Watch for pagination change
    $scope.$watch('currentPage', function (page) {
        paginationService.setCurrentPage(page);
    });

    $scope.setCurrentPage = function (val) {
        $scope.currentPage = val;
    };

    /**
     * Delete event
     */
    $scope.deleteEvent = function (id, params, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('notifications', id, params).then(function (response) {
                myCache.remove('notifications');
                $scope.loading = false;
                $scope.allSettled();
                //$scope.loadData();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };

    /**
     * Hide an event by the source
     */
    $scope.hideSourceEvents = function (deviceId) {
        $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, deviceId, true);
        updateProfile($scope.user);
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices) {
        var rejectType = ['battery', 'text', 'camera'];
        var data = devices.reject(function (v) {
                    return rejectType.indexOf(v.deviceType) > -1 || v.permanently_hidden === true;
                })
                .indexBy('id')
                .value();
        if (!_.isEmpty(data)) {
            angular.extend($scope.devices, {data: data, show: true});
        }

        if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
            if ($routeParams.param === 'source' && !_.isEmpty(data) && data[$routeParams.val]) {
                angular.extend($scope.devices.find, {id: $routeParams.val}, {title: data[$routeParams.val].metrics.title});
                angular.extend($scope.page, {title: data[$routeParams.val].metrics.title});
            }
        }
    }
    /**
     * Set events data
     */
    function setEvents(data) {
        $scope.collection = [];
        $scope.eventLevels = dataService.getEventLevel(data, [{'key': null, 'val': 'all'}]);
        var filter = null;
        if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
            if ($routeParams.param === 'source' && $routeParams.val !== '') {
                $scope.currSource = $routeParams.val;
            }
            if ($routeParams.param === 'level' && $routeParams.val !== '') {
                $scope.currLevel = $routeParams.val;
            }
            filter = $routeParams;
            angular.forEach(data, function (v, k) {
                if (filter && angular.isDefined(v[filter.param])) {
                    if (v[filter.param] == filter.val) {
                        $scope.collection.push(v);
                    }
                }
            });
        } else if (angular.isDefined($routeParams.param) && $routeParams.param == 'source_type') {
            filter = $routeParams;
            angular.forEach(data, function (v, k) {
                if (v.source == filter.source && v.type == filter.type) {
                    $scope.collection.push(v);
                }
            });
        } else {
            $scope.collection = data;
        }
        
         // Count events in the device
         $scope.devices.cnt.deviceEvents =_.countBy(data,function (v) {
            return v.source;
        });
        if (_.size($scope.collection) < 1) {
            alertify.alertWarning($scope._t('no_events'));
            return;
        }
    }
    ;
    /**
     * Update profile
     */
    function updateProfile(profileData) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', profileData.id, profileData).then(function (response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            dataService.setUser(response.data.data);
            myCache.remove('notifications');
            $scope.input = [];
            $scope.allSettled();
            //$scope.loadData();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    }
});