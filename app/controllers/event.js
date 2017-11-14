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
    $scope.filter = {};
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
    $scope.rooms = {
        all: {}
    };
    $scope.currentPage = 1;
    $scope.pageSize = cfg.page_results_events;
    $scope.pagesSum = 0;
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
        var urlParam = '?since=' + ($scope.timeFilter.since * 1000);

        var promises = [
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices', null, true),
            dataFactory.getApi('notifications', urlParam, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var locations = response[0];
            var devices = response[1];
            var events = response[2];

            $scope.loading = false;
            // Error message
            if (events.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                 _.filter(dataService.getRooms(locations.value.data.data).value(),function (v) {
                       if(v.id != 0){
                           $scope.rooms.all[v.id] = v.title;
                       }
                    });
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
            if(cfg.route.fatalError.type !== "network") {
                dataFactory.refreshApi('notifications').then(function (response) {
                    if(!response){
                        return;
                    }
                    //console.log('Run refresh',response.data.data.notifications)
                    angular.forEach(response.data.data.notifications, function (v, k) {
                        //$scope.collection.push(v);
                        setEvent(v);
                    });
                });
            }
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };


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
     * prepare notification data
     */
    function prepareNotification(v) {
        v.icon = !v.message.customIcon? $filter('getEventIcon')(v.type,v.message): cfg.img.custom_icons+v.message.customIcon;
        if (v.message['l'] !== null && v.message['l'] !== undefined) {
            v.messageView = '<span><span>'+v.message.dev+' : ' +
                '<strong>' + v.message.l +'</strong></span>';
        } else {
            v.messageView = '<span>'+typeof v.message == 'string'? v.message : JSON.stringify(v.message)+'</span>';
        }

        v.lvl = $filter('hasNode')(v.message,'l')? $filter('hasNode')(v.message,'l') : JSON.stringify({dev: v.message.dev, l: v.message.l, location: v.message.location});

        return v;
    };

    /**
     * Set events data
     */
    function setEvents(data) {
        $scope.collection = [];
        $scope.iconSource = '';
        $scope.eventLevels = dataService.getEventLevel(data, [{'key': null, 'val': 'all'}]);

        //var filter = null;
        if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
            if ($routeParams.param === 'source' && $routeParams.val !== '') {
                $scope.currSource = $routeParams.val;
            }
            if ($routeParams.param === 'level' && $routeParams.val !== '') {
                $scope.currLevel = $routeParams.val;
            }
            $scope.filter = $routeParams;
            angular.forEach(data, function (v, k) {
                if ($scope.filter && angular.isDefined(v[$scope.filter.param])) {
                    if (v[$scope.filter.param] == $scope.filter.val) {
                        _v = prepareNotification(v);
                        $scope.collection.push(_v);
                    }
                }
            });
        } else if (angular.isDefined($routeParams.param) && $routeParams.param == 'source_type') {
            $scope.filter = $routeParams;
            angular.forEach(data, function (v, k) {
                if (v.source == $scope.filter.source && v.type == $scope.filter.type) {
                    _v = prepareNotification(v);
                    $scope.collection.push(_v);
                }
            });
        } else {
            $scope.filter = {};
            angular.forEach(data, function (v, k) {
                _v = prepareNotification(v);
                $scope.collection.push(_v);
            });
        }

        // Count events in the device
        $scope.devices.cnt.deviceEvents =_.countBy(data,function (v) {
            return v.source;
        });
        // Run refresh only when filter is empty
        //if(_.isEmpty($scope.filter)){
        $scope.refreshData();
        //}
        // No data in the collection
        if (_.size($scope.collection) < 1) {
            alertify.alertWarning($scope._t('no_events'));
            return;
        }
        $scope.pagesSum = Math.ceil($scope.collection.length/$scope.pageSize);
    };

    /**
     * Set data
     */
    function setEvent(obj) {
        if (_.isEmpty($scope.filter) || (obj[$scope.filter.param] === $scope.filter.val)) {
            var findIndex = _.findIndex($scope.collection, {timestamp: obj.timestamp});
            _obj = prepareNotification(obj);
            if(findIndex > -1){
                angular.extend($scope.collection[findIndex],_obj);

            }else{
                $scope.collection.push(_obj);
            }
        }
    }

    /**
     * Update profile
     */
    function updateProfile(profileData) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', profileData.id, profileData).then(function (response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            angular.extend($scope.user, response.data.data);
            angular.extend(cfg.user, response.data.data);
            //dataService.setUser(response.data.data);
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
    /**
     * Swipe left/right or click previous/next
     */
    $scope.swipeMe = function (direction) {
        var items = $scope.collection.length;
        var itemsPerPage = cfg.page_results_events;
        if(items  <= itemsPerPage){
            return;
        }
        
        var min = 1;
        var max = Math.ceil(items/itemsPerPage);
        var newCurrentPage = 1;
        
        if(direction === 'right'){
            $scope.currentPage--;
            newCurrentPage = ($scope.currentPage > min ? $scope.currentPage :  min);
         }else{
            $scope.currentPage++;
            newCurrentPage = ($scope.currentPage > max ?  min :  $scope.currentPage);
         }
         $scope.currentPage = newCurrentPage;
        //$scope.currentPage = 16;
        //console.log('ng-swipe: ' + direction)
        //console.log('currentPage: ' +  $scope.currentPage)
    };

    /**
     * Go to page
     */
    $scope.goToPage = function (page) {
        $scope.currentPage = page;
    };
});