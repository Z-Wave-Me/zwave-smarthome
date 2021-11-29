/**
 * @overview The parent controller that stores all function used in the child controllers.
 * @author Martin Vach
 */

/**
 * Angular module instance
 */
var myAppController = angular.module('myAppController', []);

/**
 * The app base controller.
 * @class BaseController
 */
myAppController.controller('BaseController', function($scope, $rootScope, $cookies, $filter, $location, $route, $window, $interval, $timeout, $http, $q, $websocket, cfg, cfgicons, dataFactory, dataService, deviceDetector, myCache, _) {

    // Global scopes
    $scope.nightMode = false;
    $scope.color = null;
    $scope.$location = $location;
    $scope.deviceDetector = deviceDetector;
    angular.extend(cfg.route, {
        os: deviceDetector.os
    });
    $scope.cfg = cfg;
    $scope.css = 'app/css/main.css';
    $scope.timeZoneInterval = null;
    $scope.languages = {};
    $scope.loading = false;
    $scope.alert = {
        message: false,
        status: 'is-hidden',
        icon: false
    };
    $scope.authCtrl = {
        processed: false
    }; // for AuthController
    $scope.user = dataService.getUser();
    $scope.hostName = $location.host();
    $scope.hostProtocol = $location.protocol();
    $scope.ZWAYSession = dataService.getZWAYSession();
    $scope.lastLogin = dataService.getLastLogin();
    $scope.rss = {
        unread: 0,
        read: [],
        all: [],
        find: {},
        alert: {
            message: false,
            status: 'is-hidden',
            icon: false
        }
    };
    $scope.connection = {
        online: false,
        local: false,
        remote: false
    }
    $scope.swipeDir = false;

    $scope.swipe = function(dir) {
        $scope.$broadcast('swipe', dir);
    }

    /**
     * Disable contextmenu on mobile devices
     */
    if ($scope.deviceDetector.isMobile()) {
        $(document).contextmenu(function() {
            return false;
        });
    }

    /**
     * Extend an user
     * @returns {undefined}
     */
    $scope.extendUser = function() {
        dataFactory.getApi('profiles', '/' + $scope.user.id).then(function(response) {
            angular.extend($scope.user, response.data.data);
            angular.extend(cfg.user, response.data.data);

        }, function(error) {});

    };
    if ($scope.user) {
        $scope.extendUser();
    }

    //dataService.getUser();
    /**
     * Set app skin
     * @returns {undefined}
     */
    $scope.setSkin = function() {
        if ($cookies.skin && $cookies.skin !== 'default') {
            cfg.skin.active = $cookies.skin;
            cfg.img.icons = cfg.skin.path + $cookies.skin + '/img/icons/';
            cfg.img.logo = cfg.skin.path + $cookies.skin + '/img/logo/';
            $("link[id='main_css']").attr('href', cfg.skin.path + $cookies.skin + '/main.css');
            $scope.css = cfg.skin.path + $cookies.skin + '/main.css';


        } else {
            dataFactory.getApi('skins_active').then(function(response) {
                if (response.data.data.name !== 'default') {
                    cfg.skin.active = response.data.data.name;
                    cfg.img.icons = cfg.skin.path + response.data.data.name + '/img/icons/';
                    cfg.img.logo = cfg.skin.path + response.data.data.name + '/img/logo/';
                    $("link[id='main_css']").attr('href', cfg.skin.path + response.data.data.name + '/main.css');
                    $scope.css = cfg.skin.path + response.data.data.name + '/main.css';
                }
            });
        }
        // Set night mode
        $scope.user.night_mode = ($scope.user.night_mode == 'true');
    };
    $scope.setSkin();

    /**
     * Set night mode
     * @returns {undefined}
     */
    $scope.setNightMode = function(nightMode) {
        $scope.user.night_mode = nightMode;
        //$cookies.nightMode = nightMode;
        dataFactory.putApi('profiles', $scope.user.id, $scope.user);
    };

    /**
     * Watch nicht_mode flag to change bowser theme (Firefox OS,Chrome for Android, Opera)
     */
    $scope.$watch("user.night_mode", function(newVal, oldVal) {
        // night_mode true  #24262D
        // night_mode false #E9E9E9
        $scope.color = newVal ?  '#24262D' : '#E9E9E9';
    });

    /**
     * Check if route match the pattern.
     * @param {string} path
     * @returns {Boolean}
     */
    $scope.routeMatch = function(path) {
        if ($route.current && $route.current.regexp) {
            return $route.current.regexp.test(path);
        }
        return false;
    };

    /**
     * Allow to access page elements by role.
     *
     * @param {array} roles
     * @param {boolean} mobile
     * @returns {Boolean}
     */
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
     * Load a rss info
     * @returns {undefined}
     */
    $scope.loadRssInfo = function() {
        var cached = myCache.get('rssinfo');
        if (cached) {
            angular.extend($scope.rss, cached);
            return;
        }
        dataFactory.getApi('configget_url', null, true).then(function(response) {
            dataFactory.xmlToJson(cfg.api_remote.rss_feed + '?boxtype=' + $scope.getCustomCfgArr('boxtype')).then(function(data) {
                // Count all items and set as unread
                var unread = 0;
                var read = response.data.rss ? response.data.rss.read : [];
                var channel = _.isArray(data.rss.channel.item) && data.rss.channel.item ? data.rss.channel.item : (data.rss.channel.item ? [data.rss.channel.item] : []);

                _.filter(channel, function(v, k) {
                    //$scope.rss.all.push(v);
                    // If item ID is  not in the array READ
                    // add 1 to unread
                    if (read.indexOf(v.id) === -1) {
                        unread++;
                    }
                });
                myCache.put('rssinfo', {
                    read: read,
                    unread: unread
                });
                angular.extend($scope.rss, {
                    read: read,
                    unread: unread
                });
            });
            // }
        });

    };
    if ($scope.elementAccess($scope.cfg.role_access.admin)) {
        $scope.loadRssInfo();
    }

    /**
     * Set timestamp and ping server if request fails
     * @returns {undefined}
     */
    $scope.setTimeStamp = function() {
        if (!$scope.user) {
            return;
        }
        dataFactory.pingServer(cfg.server_url + cfg.api['time']).then(function(response) {
            $interval.cancel($scope.timeZoneInterval);
            $scope.connection.online = true;

            var remote = cfg.find_hosts.indexOf($location.host());
            if (remote > -1) {
                $scope.connection.remote = true;
            } else {
                $scope.connection.local = true;
            }

            angular.extend(cfg.route.time, {
                string: $filter('setTimeFromBox')(response.data.data.localTimeUT)
            }, {
                timestamp: response.data.data.localTimeUT
            }, {
                timeZoneOffset: response.data.data.localTimeZoneOffset
            });

            var refresh = function() {
                //var oldTime = cfg.route.time.string;
                //cfg.route.time.timestamp += (cfg.interval < 1000 ? 1 : cfg.interval / 1000);
                //cfg.route.time.string = $filter('setTimeFromBox')(cfg.route.time.timestamp);
                if (cfg.route.alert.type === 'network') {
                    $scope.connection.online = false;
                    //cfg.route.time.string = oldTime;
                    $scope.reloadAfterError();
                } else {
                    $scope.connection.online = true;
                }

            };
            $scope.timeZoneInterval = $interval(refresh, $scope.cfg.interval);

        }, function(error) {
            console.log('Error connection', error)
            if (error.status === 0) {
                var fatalArray = {
                    type: 'network',
                    message: $scope._t('connection_refused'),
                    info: $scope._t('connection_refused_info'),
                    permanent: true,
                    hide: true
                };
                if ($scope.routeMatch('/boxupdate')) {
                    fatalArray.message = $scope._t('jamesbox_connection_refused');
                    fatalArray.info = $scope._t('jamesbox_connection_refused_info', {
                        __reload_begintag__: '<div>',
                        __reload_endtag__: '</div>',
                        __attention_begintag__: '<div class="alert alert-warning"><i class="fas fa-exclamation-circle"></i>',
                        __attention_endtag__: '<div>'
                    });
                    fatalArray.icon = 'fa-spinner fa-spin text-success';
                }
                angular.extend(cfg.route.alert, fatalArray);

            }

        });

    };
    /**
     * Set user session and reload page after connection error if session change
     * @returns {undefined}
     */
    $scope.reloadAfterError = function() {
        //return;
        if (!$scope.user) {
            return;
        }
        dataFactory.sessionApi().then(function(sessionRes) {
            var fatalArray = {
                type: 'warning',
                message: $scope._t('reloading_page'),
                info: false,
                icon: 'fa-spinner fa-spin text-success',
                permanent: false,
                hide: true
            };
            var user = sessionRes.data.data;
            if (user) {
                if(!dataService.checkZWAYSession(user.sid)) {
                    angular.extend(cfg.route.alert, fatalArray);
                    dataService.setZWAYSession(user.sid);
                    dataService.setUser(user);
                    if (dataService.getUser()) {
                        $timeout(function() {
                            $window.location.reload();
                        }, 5000);
                    }
                } else {
                    // set route alert to default
                    angular.extend(cfg.route.alert, {
                        type: 'system',
                        message: false,
                        info: false,
                        permanent: false,
                        hide: false,
                        icon: 'fa-exclamation-triangle text-danger'
                    });
                }
            }

        }, function(error) {});

    };

    /**
     * Route on change start
     */
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        /**
         * Cancels pending requests
         */
        angular.forEach($http.pendingRequests, function(request) {
            request.cancel = $q.defer();
            request.timeout = request.cancel.promise;
        });
        /**
         * Reset expanded elements
         */
        $scope.expand = {};
        /**
         * Reset alert object
         */
        dataService.resetAlert();
        /**
         * Check if access is allowed for the page
         */
        dataService.isAccessAllowed(next);
        /**
         * Set timestamp and ping server if request fails
         */
        if (!current) {
            $scope.setTimeStamp();
        }

        angular.copy({}, $scope.naviExpanded);
        angular.copy({}, $scope.autocompleteExpanded);
        angular.copy({}, $scope.expand);
    });

    /**
     * Set poll interval
     * @returns {undefined}
     */
    $scope.setPollInterval = function() {
        if (!$scope.user) {
            $scope.cfg.interval = $scope.cfg.interval;
        } else {
            $scope.cfg.interval = ($filter('toInt')($scope.user.interval) >= 1000 ? $filter('toInt')($scope.user.interval) : $scope.cfg.interval);
        }

    };
    $scope.setPollInterval();

    /**
     * Check if value is in array
     *
     * @param {array} array
     * @param {mixed} value
     * @returns {Boolean}
     */
    $scope.isInArray = function(array, value) {
        if (array.indexOf(value) > -1) {
            return true;
        }
        return false;
    };


    $scope.lang_list = cfg.lang_list;
    /**
     * Get a language key from the cookie or set a default language.
     * @returns {undefined}
     */
    $scope.getLang = function() {
        if ($scope.user) {
            $scope.lang = $scope.user.lang;
        } else {
            $scope.lang = angular.isDefined($cookies.lang) ? $cookies.lang : cfg.lang;
        }
    };
    //$scope.lang = cfg.route.lang;
    $scope.getLang();
    $cookies.lang = $scope.lang;

    /**
     * Load an language file
     * @param {string} lang
     * @returns {undefined}
     */
    $scope.loadLang = function(lang) {
        // Is lang in language list?
        var lang = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        dataFactory.getLanguageFile(lang).then(function(response) {
            angular.extend($scope.languages, response.data);
            $scope.setAlertifyDefaults();
        }, function(error) {});
    };
    /**
     * Get a language line by key.
     * @param {type} key
     * @param {type} replacement
     * @returns {unresolved}
     */
    $scope._t = function(key, replacement) {
        return dataService.getLangLine(key, $scope.languages, replacement);
    };

    /**
     * Watch for lang changes
     */
    $scope.$watch('lang', function() {
        $scope.loadLang($scope.lang);
    });
    /**
     * Order by
     * @param {string} field
     * @returns {undefined}
     */
    $scope.orderBy = function(field) {
        $scope.predicate = field;
        $scope.reverse = !$scope.reverse;
    };

    /**
     * Get body ID
     * @returns {String}
     */
    $scope.getBodyId = function() {
        var path = $location.path().split('/');
        return path[1] || 'login';

    };
    // Mobile detect
    $scope.isMobile = dataService.isMobile(navigator.userAgent || navigator.vendor || window.opera);

    /**
     * Check if the route match the given param and set active class in the element.
     * @param {string} route
     * @returns {String}
     */
    $scope.isActive = function(route) {
        return (route === $scope.getBodyId() ? 'active' : '');
    };

    /**
     * Causes $route service to reload the current route even if $location hasn't changed.
     * @param {boolean} cache
     * @returns {undefined}
     */
    $scope.reloadData = function(cache) {
        // Clear also cache?
        if (cache) {
            myCache.removeAll();
        }

        $route.reload();
    };

    /**
     * Redirect to given url
     * @param {string} url
     * @returns {undefined}
     */
    $scope.redirectToRoute = function(url) {
        if (url) {
            $location.path(url);
        }
    };
    /**
     * Get an app logo according to app_type settings
     * @returns {String}
     */
    $scope.getAppLogo = function() {
        var logo = cfg.img.logo + 'app-logo-default.png';
        if (cfg.custom_cfg[cfg.app_type]) {
            logo = cfg.img.logo + cfg.custom_cfg[cfg.app_type].logo || logo;
        }
        return logo;
    };
    /**
     * Get an array of the hidden apps according to app_type settings
     * @returns {Array}
     */
    $scope.getHiddenApps = function() {
        var apps = [];
        if (cfg.custom_cfg[cfg.app_type]) {
            apps = cfg.custom_cfg[cfg.app_type].hidden_apps || [];
        }
        return apps;
    };

    /**
     * Get array from custom config
     * @param {string} key
     * @returns {Array}
     */
    $scope.getCustomCfgArr = function(key) {
        if (cfg.custom_cfg[cfg.app_type]) {
            return cfg.custom_cfg[cfg.app_type][key] || [];
        }
        return [];
    };

    /**
     * Redirect to Expert
     * @param {string} url
     * @param {string} message
     * @returns {undefined}
     */
    $scope.toExpert = function(url, message) {
        alertify.confirm(message, function() {
            //$window.location.href = url;
            $window.open(url, '_blank');
        }).set('labels', {
            ok: $scope._t('goahead')
        });
    };

    /**
     * Expand/collapse navigation
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
    $scope.naviExpanded = {};
    $scope.expandNavi = function(key, $event, status) {
        $event.stopPropagation();
        var keyHolder = !$scope.naviExpanded[key];
        $scope.naviExpanded = {};
        if (keyHolder) {
            $scope.naviExpanded[key] = typeof status === 'boolean'
                ? status : keyHolder;
        }
    };
    /**
     * hold Search bar when get click
     * @param evt
     */
    $scope.elSearchHolder = function (evt) {
        evt.stopPropagation();
    }
    /**
     * Expand/collapse autocomplete
     * @param {string} key
     * @returns {undefined}
     */
    $scope.autocompleteExpanded = {};
    $scope.expandAutocomplete = function(key) {
        $scope.autocompleteExpanded = {};
        if (key) {
            $scope.autocompleteExpanded[key] = true;
        }
    };
    /**
     * todo: deprecated
     */
    /*$scope.expandAutocomplete = function (key, $event, status) {
        if ($scope.autocompleteExpanded[key]) {
            $scope.utocompleteExpanded = {};
            $event.stopPropagation();
            return;
        }
        $scope.utocompleteExpanded = {};
        if (typeof status === 'boolean') {
            $scope.utocompleteExpanded[key] = status;
        } else {
            $scope.utocompleteExpanded[key] = !$scope.utocompleteExpanded[key];
        }
        $event.stopPropagation();
    };*/
    /**
     * Collapse navi, menu and autocomplete when clicking outside
     */
    window.onclick = function(event) {
        if ($scope.autocompleteExpanded) {
            angular.copy({}, $scope.autocompleteExpanded);
            $scope.$apply();
        }
        if ($scope.naviExpanded && !$scope.naviExpanded.elCategories || $('#elCategories').has($(event.target)).length == 0) {
            angular.copy({}, $scope.naviExpanded);
            $scope.$apply();
        }
    };

    /**
     * Open/close a modal window
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
    $scope.modalArr = {};
    $scope.isModal = false;
    $scope.handleModal = function(key, $event, status) {
        if (typeof status === 'boolean') {
            $scope.modalArr[key] = status;
        } else {
            $scope.modalArr[key] = !($scope.modalArr[key]);
        }
        if ($event) {
            $event.stopPropagation();
        }
        $scope.isModal = $scope.modalArr[key];
    };

    $scope.expand = {};
    /**
     * Expand/collapse an element
     * @param {string} key
     * @param {boolean} hidePrevious
     * @returns {undefined}
     */
    $scope.expandElement = function(key, hidePrevious = false) {
        // Reset if an empty key
        if (!key) {
            $scope.expand = [];
            return;
        }
        // Also hide previous expanded elements
        if (hidePrevious) {
         angular.forEach($scope.expand,function(v,k){
              if(k != key){
                $scope.expand[k] = false;

              }

            });
        }
        $scope.expand[key] = !($scope.expand[key]);
    };

    $scope.rowSpinner = [];
    /**
     * Toggle row spinner
     * @param {string} key
     * @returns {undefined}
     */
    $scope.toggleRowSpinner = function(key) {
        if (!key) {
            $scope.rowSpinner = [];
            return;
        }
        $scope.rowSpinner[key] = !$scope.rowSpinner[key];
    };

    /**
     * Set alertify defaults
     */
    $scope.setAlertifyDefaults = function() {
        // Alertify defaults
        alertify.defaults.glossary.title = cfg.app_name;
        alertify.defaults.glossary.ok = 'OK';
        alertify.defaults.glossary.cancel = $scope._t('lb_cancel');
    };
    $scope.setAlertifyDefaults();

    // Extend existing alert (ERROR) dialog
    if (!alertify.alertError) {
        //define a new errorAlert base on alert
        alertify.dialog('alertError', function factory() {
            return {
                build: function() {
                    var errorHeader = '<span class="fas fa-exclamation-triangle fa-lg text-danger" ' +
                        'style="vertical-align:middle;">' +
                        '</span> ' + cfg.app_name + ' - ERROR';
                    this.setHeader(errorHeader);
                }
            };
        }, true, 'alert');
    }

    // Extend existing alert (WARNING) dialog
    if (!alertify.alertWarning) {
        alertify.dialog('alertWarning', function factory() {
            return {
                build: function() {
                    var errorHeader = '<span class="fas fa-exclamation-circle fa-lg text-warning" ' +
                        'style="vertical-align:middle;">' +
                        '</span> ' + cfg.app_name + ' - WARNING';
                    this.setHeader(errorHeader);
                }
            };
        }, true, 'alert');
    }


    $scope.openSideNav = function($event) {
        if($scope.deviceDetector.isMobile() && $(".appmodal").length == 0 && $location.path().indexOf("rooms") == -1 && $location.path().indexOf("events") == -1) {
            $scope.expandNavi('mainNav', $event, true)
        }
    };

    $scope.closeSideNav = function($event) {
        if($location.path().indexOf("rooms") == 1 || $location.path().indexOf("events") == 1 && $event.type == "click" && $scope.deviceDetector.isMobile()) {
            $scope.expandNavi('mainNav', $event, false)
        }

        if($location.path().indexOf("rooms") != 1 || $location.path().indexOf("events") != 1 && $scope.deviceDetector.isMobile()) {
            $scope.expandNavi('mainNav', $event, false);
        }
    };


    /**
     * Test Webserver
     */

    // var ws = $websocket('ws://' + $location.$$host + ':8083/');
    // var collection = [];
    // console.log("cfg.server_url", $location.$$host);
    // ws.onMessage(function(event) {
    //   //console.log('message: ', event);
    //   //console.log('message: ', JSON.parse(event.data));
    //   var event_data = JSON.parse(event.data);
    //   console.log("event data type", event_data.type);
    //   console.log("event data data", JSON.parse(event_data.data));

    // });

    // ws.onError(function(event) {
    //   console.log('connection Error', event);
    // });

    // ws.onClose(function(event) {
    //   console.log('connection closed', event);
    // });

    // ws.onOpen(function() {
    //   console.log('connection open');
    // });


});

myAppController.controller('GlobalDevicesController', function ($rootScope, $scope, $timeout, $cookies, $filter, $interval, dataService, dataFactory, $q, $routeParams, cfg) {
    $scope.dataHolder = {
        mode: 'default',
        firstLogin: false,
        cnt: {
            devices: 0,
            collection: 0,
            hidden: 0,
            rooms: {}
        },
        devices: {
            updateTime: false,
            switchButton: [],
            noDashboard: false,
            noDevices: false,
            noSearch: false,
            show: true,
            all: [],
            byId: {},
            collection: [],
            deviceType: {},
            find: {},
            tags: [],
            get filter() {
                var cookies = angular.fromJson($cookies.filterElements);
                if (cookies && cookies[$scope.getBodyId()]) {
                    return cookies[$scope.getBodyId()];
                }
                return {};
            },
            set filter(filterObj) {
                var cookies = angular.fromJson($cookies.filterElements);
                if (cookies) {
                    cookies[$scope.getBodyId()] = filterObj;
                } else {
                    cookies = {[$scope.getBodyId()]: filterObj};
                }
                $cookies.filterElements = angular.toJson(cookies);
                filterDevices();
            },
            rooms: {},
            get orderBy() {
                const location = $scope.getBodyId();
                return ($cookies[location] ? $cookies[location] : 'order_' + location);
            },
            set orderBy(key) {
                $cookies[$scope.getBodyId()] = key;
            },
            showHidden: ($cookies.showHiddenEl ? $filter('toBool')($cookies.showHiddenEl) : false),
            notificationsSince: ($filter('unixStartOfDay')('-', (86400 * 6)) * 1000)
        },
        dragdrop: {
            get action() {
                return $scope.getBodyId()
            },
            data: []
        }
    };
    $scope.list = [];
    $scope.apiDataInterval = null;

    $scope.initialLoadFinish = false;

    $scope.autocomplete = {
        source: [],
        term: '',
        searchInKeys: 'id,title',
        returnKeys: 'id,title,iconPath',
        strLength: 2,
        resultLength: 1000
    };

    /**
     * Drop mode on change page
     */
    $rootScope.$on('$routeChangeStart', function($event, next, current) {
        if (next.$$route.originalPath === '/elements') {
            filterDevices();
        }
        $scope.dataHolder.mode = 'default';
    });

    $scope.cmdTimeouts = [];
    /**
     * Room data
     */
    $scope.room = {};

    /**
     * Cancel interval on page destroy
     */
    $scope.$on('$destroy', function() {
        cfg.route.time.timeUpdating = false;
        $interval.cancel($scope.apiDataInterval);
    });


    /**
     * Load all promises
     */
    $scope.allSettled = function(noCache) {
        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('loading')
        };
        var promises = [
            dataFactory.getApi('locations', null, noCache),
            dataFactory.getApi('devices', null, noCache)
        ];
        $q.allSettled(promises).then(function(response) {
            var locations = response[0];
            var devices = response[1];
            $scope.loading = false;
            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                $scope.dataHolder.devices.show = false;
                return;
            }

            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.dataHolder.devices.rooms = dataService.getRooms(locations.value.data.data).indexBy('id').value();
                // When rooms section loads single room data
                if ($scope.getBodyId() === 'rooms') {
                    var room = _.find(locations.value.data.data, function(room) {
                        return room.id === $routeParams.id;
                    });
                    if (typeof room != 'undefined') {
                        $scope.room = dataService.getRooms([room]).value()[0];

                    }
                }

            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.dataHolder.devices.updateTime = devices.value.data.data.updateTime;
                // Count hidden apps
                $scope.dataHolder.cnt.hidden = _.chain(dataService.getDevicesData(devices.value.data.data.devices, true))
                    .flatten().where({
                        visibility: false
                    })
                    .size()
                    .value();
                // Set devices
                setDevices(dataService.getDevicesData(devices.value.data.data.devices, $scope.dataHolder.devices.showHidden));
                $scope.initialLoadFinish = true;
            }
        });
    };
    if (dataService.getUser()) $scope.allSettled();
    $scope.reloadDevicesFromServer = $scope.allSettled;

    var filterDevices = function () {
        if ($scope.dataHolder.mode === 'edit') {
            return;
        }
        var devices = $scope.dataHolder.devices
        var collection;
        if ('tag' in devices.filter) { // Filter by tag
            collection = devices.all.filter((v) => v.tags.includes(devices.filter.tag));
        } else if ('q' in  devices.filter) { // Filter by query
            //angular.element('#input_search').focus();
            $scope.autocomplete.term = devices.filter.q;
            var searchResult = _.indexBy(dataService.autocomplete(devices.all, $scope.autocomplete), 'id');
            collection = _.filter(devices.all, function(v) {
                if (searchResult[v.id]) {
                    return v;
                }
            });
        } else if ('list' in devices.filter) { // Filter by list
            var list = {},
                key = Object.keys(devices.filter.list[0])[0];
            _.each(devices.filter.list, function(i) {
                list[i[key]] = true;
            });

            collection = _.filter(devices.all, function(v) {
                return list[v[key]];
            }, list);

        } else {
            collection = _.where(devices.all, devices.filter);
        }
        devices.noSearch = false;
        devices.noDashboard = false;
        devices.noDevices = false;
        if (_.isEmpty(collection)) {
            if ($scope.routeMatch('/dashboard')) {
                devices.noDashboard = true;
            } else {
                if (devices.filter.q) {
                    devices.noSearch = true;
                } else {
                    devices.noDevices = true;
                }
            }
        } else {
            if ($scope.dataHolder.mode === 'edit') {
                var nodePath = 'order.' + $scope.dataHolder.dragdrop.action;
                collection = _.sortBy(collection, function(v) {
                    return $filter('hasNode')(v, nodePath) || 0;
                });
            }

        }
        $scope.dataHolder.devices.collection = collection;
        $scope.dataHolder.cnt.collection = _.size(collection);
    }
    /**
     * deprecated
     */
    // $scope.filterDevices = function (){
    //     if ('tag' in $scope.dataHolder.devices.filter) { // Filter by tag
    //         $scope.dataHolder.devices.collection = _.filter($scope.dataHolder.devices.all, function(v) {
    //             if (v.tags.indexOf($scope.dataHolder.devices.filter.tag) > -1) {
    //                 return v;
    //             }
    //         });
    //     } else if ('q' in $scope.dataHolder.devices.filter) { // Filter by query
    //         //angular.element('#input_search').focus();
    //         // Set autcomplete term
    //         $scope.autocomplete.term = $scope.dataHolder.devices.filter.q;
    //         var searchResult = _.indexBy(dataService.autocomplete($scope.dataHolder.devices.all, $scope.autocomplete), 'id');
    //         $scope.dataHolder.devices.collection = _.filter($scope.dataHolder.devices.all, function(v) {
    //             if (searchResult[v.id]) {
    //                 return v;
    //             }
    //         });
    //     } else if ('list' in $scope.dataHolder.devices.filter) { // Filter by list
    //         var list = {},
    //             key = Object.keys($scope.dataHolder.devices.filter.list[0])[0];
    //         _.each($scope.dataHolder.devices.filter.list, function(i) {
    //             list[i[key]] = true;
    //         });
    //
    //         $scope.dataHolder.devices.collection = _.filter($scope.dataHolder.devices.all, function(v) {
    //             return list[v[key]];
    //         }, list);
    //
    //     } else {
    //         $scope.dataHolder.devices.collection = _.where($scope.dataHolder.devices.all, $scope.dataHolder.devices.filter);
    //     }
    // }
    function setDevices(devices) {
        // Set tags
        _.filter(devices.value(), function(v) {
            if (v.tags.length > 0) {
                angular.forEach(v.tags, function(t) {
                    if ($scope.dataHolder.devices.tags.indexOf(t) === -1) {
                        $scope.dataHolder.devices.tags.push(t);
                    }
                });
            }
        });

        // Set categories
        $scope.dataHolder.devices.deviceType = devices.countBy(function(v) {
            return v.deviceType;
        }).value();

        $scope.dataHolder.cnt.devices = devices.size().value();
        $scope.dataHolder.cnt.rooms = _.countBy(devices.value(), function(v) {
            return v.location;
        });


        // If page ID is  rooms removing current room from the list
        if ($scope.getBodyId() === 'rooms' && $routeParams.id) {
            delete $scope.dataHolder.cnt.rooms[$routeParams.id];
        }
        //All devices
        $scope.dataHolder.devices.all = devices.value();
        if (_.isEmpty($scope.dataHolder.devices.all)) {
            $scope.dataHolder.devices.noDevices = true;
            return;
        }
        // Collection
        filterDevices();
    }
    /**
     * Refresh data
     */
    $scope.refreshDevices = function() {
        var refresh = function() {
            if (cfg.route.alert.type !== "network") {
                dataFactory.refreshApi('devices', false, $scope.dataHolder.devices.updateTime).then(function(response) {
                    if (!response) {
                        return;
                    }
                    $scope.dataHolder.devices.updateTime = response.data.data.updateTime;
                    if (response.data.data.devices.length > 0) {
                        angular.forEach(response.data.data.devices, function(v, k) {
                           $scope.updateDevice(v)
                        });
                    }
                    if (response.data.data.structureChanged === true) {
                        $scope.allSettled(true);
                    }

                });
            }
            filterDevices();
        };
        if (!$scope.apiDataInterval) {
            $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
        }
    };

    $scope.updateDevice = function (v) {
        var index = _.findIndex($scope.dataHolder.devices.all, {
            id: v.id
        });
        var device;
        if (!(device = $scope.dataHolder.devices.all[index])) {
            return;
        }
        if (v.metrics.level) {
            v.metrics.level = $filter('numberFixedLen')(v.metrics.level);
        }
        if ($scope.cmdTimeouts[v.id]) {
            $timeout.cancel($scope.cmdTimeouts[v.id]);
            delete $scope.cmdTimeouts[v.id]
            $scope.cmdTimeouts.splice($scope.cmdTimeouts.indexOf(v.id), 1);
        }
        angular.extend($scope.dataHolder.devices.all[index], {
            isFailed: v.metrics.isFailed
        }, {
            metrics: v.metrics
        }, {
            progress: false
        }, {
            iconPath: dataService.assignElementIcon(v)
        }, {
            updateTime: v.updateTime
        });
        var updated = {};
        angular.copy(device, updated)
        Object.keys(v).forEach((key) => {
            updated[key] = v[key];
        })
        angular.copy(updated, device);
    }
});
