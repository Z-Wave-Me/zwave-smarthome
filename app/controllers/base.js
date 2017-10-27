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
myAppController.controller('BaseController', function ($scope, $rootScope, $cookies, $filter, $location, $route, $window, $interval, $timeout, $http, $q,cfg, cfgicons, dataFactory, dataService, deviceDetector,myCache, _) {
    
    // Global scopes
    $scope.$location = $location;
    $scope.deviceDetector = deviceDetector;
    angular.extend(cfg.route, {os:  deviceDetector.os});
    $scope.cfg = cfg;
    $scope.css = 'app/css/main.css';
    $scope.timeZoneInterval = null;
    $scope.languages = {};
    $scope.loading = false;
    $scope.alert = {message: false, status: 'is-hidden', icon: false};
    $scope.user = dataService.getUser();
    $scope.hostName = $location.host();
    $scope.ZWAYSession = dataService.getZWAYSession();
    $scope.lastLogin = dataService.getLastLogin();
    $scope.rss = {
        unread: 0,
        read: [],
        all: [],
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Extend an user
     * @returns {undefined}
     */
    $scope.extendUser = function () {
        dataFactory.getApi('profiles', '/' + $scope.user.id).then(function (response) {
            angular.extend($scope.user, response.data.data);
            angular.extend(cfg.user, response.data.data);
        }, function (error) {
        });

    };
    if ($scope.user) {
        $scope.extendUser();
    }

    //dataService.getUser();
    /**
     * Set app skin
     * @returns {undefined}
     */
    $scope.setSkin = function () {
        if ($cookies.skin && $cookies.skin !== 'default') {
            cfg.skin.active = $cookies.skin;
            cfg.img.icons = cfg.skin.path + $cookies.skin + '/img/icons/';
            cfg.img.logo = cfg.skin.path + $cookies.skin + '/img/logo/';
            $("link[id='main_css']").attr('href', cfg.skin.path + $cookies.skin + '/main.css');
            $scope.css = cfg.skin.path + $cookies.skin + '/main.css';


        } else {
            dataFactory.getApi('skins_active').then(function (response) {
                if (response.data.data.name !== 'default') {
                    cfg.skin.active = response.data.data.name;
                    cfg.img.icons = cfg.skin.path + response.data.data.name + '/img/icons/';
                    cfg.img.logo = cfg.skin.path + response.data.data.name + '/img/logo/';
                    $("link[id='main_css']").attr('href', cfg.skin.path + response.data.data.name + '/main.css');
                    $scope.css = cfg.skin.path + response.data.data.name + '/main.css';
                }
            });
        }
    };
    $scope.setSkin();


    /**
     * Check if route match the pattern.
     * @param {string} path
     * @returns {Boolean}
     */
    $scope.routeMatch = function (path) {
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
    $scope.elementAccess = function (roles, mobile) {
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
    $scope.loadRssInfo = function () {
        var cached = myCache.get('rssinfo');
        if(cached){
           angular.extend($scope.rss,cached);
            return;
        }
        dataFactory.getApi('configget_url', null, true).then(function (response) {
            dataFactory.xmlToJson(cfg.api_remote.rss_feed + '?boxtype=' + $scope.getCustomCfgArr('boxtype')).then(function (data) {
                // Count all items and set as unread
                var unread = 0;
                var read =  response.data.rss ?  response.data.rss.read : [];
                var channel = _.isArray(data.rss.channel.item) && data.rss.channel.item? data.rss.channel.item : (data.rss.channel.item? [data.rss.channel.item] : []);

                _.filter(channel, function (v, k) {
                    //$scope.rss.all.push(v);
                    // If item ID is  not in the array READ
                    // add 1 to unread
                    if (read.indexOf(v.id) === -1) {
                        unread++;
                    }
                });
                myCache.put('rssinfo', {read: read,unread: unread});
                angular.extend($scope.rss,{read: read,unread: unread});
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
    $scope.setTimeStamp = function () {
        if (!$scope.user) {
            return;
        }
        dataFactory.pingServer(cfg.server_url + cfg.api['time']).then(function (response) {
            $interval.cancel($scope.timeZoneInterval);
            angular.extend(cfg.route.time, {string: $filter('setTimeFromBox')(response.data.data.localTimeUT)},
                {timestamp: response.data.data.localTimeUT});
            var refresh = function () {
                cfg.route.time.timestamp += (cfg.interval < 1000 ? 1 : cfg.interval / 1000);
                cfg.route.time.string = $filter('setTimeFromBox')(cfg.route.time.timestamp);
                if (cfg.route.fatalError.type === 'network') {
                    $scope.reloadAfterError();
                }

            };
            $scope.timeZoneInterval = $interval(refresh, $scope.cfg.interval);

        }, function (error) {
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
                        __attention_begintag__: '<div class="alert alert-warning"><i class="fa fa-exclamation-circle"></i>',
                        __attention_endtag__: '<div>'
                    });
                    fatalArray.icon = cfg.route.fatalError.icon_jamesbox;
                }
                angular.extend(cfg.route.fatalError, fatalArray);

            }

        });

    };
    /**
     * Set user session and reload page after connection error
     * @returns {undefined}
     */
    $scope.reloadAfterError = function () {
        //return;
        if (!$scope.user) {
            return;
        }
        dataFactory.sessionApi().then(function (sessionRes) {
            var fatalArray = {
                type: 'warning',
                message: $scope._t('reloading_page'),
                info: false,
                icon: 'fa-spinner fa-spin',
                permanent: false,
                hide: true
            };
            angular.extend(cfg.route.fatalError, fatalArray);
            var user = sessionRes.data.data;
            if (sessionRes.data.data) {
                dataService.setZWAYSession(user.sid);
                dataService.setUser(user);
                if (dataService.getUser()) {
                    $timeout(function () {
                        $window.location.reload();
                    }, 5000);

                }
            }

        }, function (error) {
        });

    };

    /**
     * Route on change start
     */
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        /**
         * Cancels pending requests
         */
        angular.forEach($http.pendingRequests, function(request) {
            request.cancel  = $q.defer();
            request.timeout = request.cancel.promise;
        });
        /**
         * Reset fatal error object
         */
        dataService.resetFatalError();
        /**
         * Check if access is allowed for the page
         */
        dataService.isAccessAllowed(next);
        /**
         * Set timestamp and ping server if request fails
         */
        $scope.setTimeStamp();
    });

    /**
     * Set poll interval
     * @returns {undefined}
     */
    $scope.setPollInterval = function () {
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
    $scope.isInArray = function (array, value) {
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
    $scope.getLang = function () {
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
    $scope.loadLang = function (lang) {
        // Is lang in language list?
        var lang = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        dataFactory.getLanguageFile(lang).then(function (response) {
            angular.extend($scope.languages, response.data);
            $scope.setAlertifyDefaults();
        }, function (error) {
        });
    };
    /**
     * Get a language line by key.
     * @param {type} key
     * @param {type} replacement
     * @returns {unresolved}
     */
    $scope._t = function (key, replacement) {
        return dataService.getLangLine(key, $scope.languages, replacement);
    };

    /**
     * Watch for lang changes
     */
    $scope.$watch('lang', function () {
        $scope.loadLang($scope.lang);
    });
    /**
     * Order by
     * @param {string} field
     * @returns {undefined}
     */
    $scope.orderBy = function (field) {
        $scope.predicate = field;
        $scope.reverse = !$scope.reverse;
    };

    /**
     * Get body ID
     * @returns {String}
     */
    $scope.getBodyId = function () {
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
    $scope.isActive = function (route) {
        return (route === $scope.getBodyId() ? 'active' : '');
    };

    /**
     * Causes $route service to reload the current route even if $location hasn't changed.
     * @returns {undefined}
     */
    $scope.reloadData = function () {
        myCache.removeAll();
        $route.reload();
    };

    /**
     * Redirect to given url
     * @param {string} url
     * @returns {undefined}
     */
    $scope.redirectToRoute = function (url) {
        if (url) {
            $location.path(url);
        }
    };
    /**
     * Get an app logo according to app_type settings
     * @returns {String}
     */
    $scope.getAppLogo = function () {
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
    $scope.getHiddenApps = function () {
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
    $scope.getCustomCfgArr = function (key) {
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
    $scope.toExpert = function (url, message) {
        alertify.confirm(message, function () {
            //$window.location.href = url;
            $window.open(url, '_blank');
        }).set('labels', {ok: $scope._t('goahead')});
    };

    /**
     * Expand/collapse navigation
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
    $scope.naviExpanded = {};
    $scope.expandNavi = function (key, $event, status) {
        if ($scope.naviExpanded[key]) {
            $scope.naviExpanded = {};
            $event.stopPropagation();
            return;
        }
        $scope.naviExpanded = {};
        if (typeof status === 'boolean') {
            $scope.naviExpanded[key] = status;
        } else {
            $scope.naviExpanded[key] = !$scope.naviExpanded[key];
        }
        $event.stopPropagation();
    };

    /**
     * Expand/collapse autocomplete
     * @param {string} key
     * @returns {undefined}
     */
    $scope.autocompleteExpanded = {};
    $scope.expandAutocomplete = function (key) {
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
    window.onclick = function () {
        if ($scope.autocompleteExpanded) {
            angular.copy({}, $scope.autocompleteExpanded);
            $scope.$apply();
        }
        if ($scope.naviExpanded) {
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
    $scope.handleModal = function (key, $event, status) {
        if (typeof status === 'boolean') {
            $scope.modalArr[key] = status;
        } else {
            $scope.modalArr[key] = !($scope.modalArr[key]);
        }

        $event.stopPropagation();
    };
    $scope.expand = {};
    /**
     * Expand/collapse an element
     * @param {string} key
     * @returns {undefined}
     */
    $scope.expandElement = function (key) {
        $scope.expand[key] = !($scope.expand[key]);
    };

    $scope.rowSpinner = [];
    /**
     * Toggle row spinner
     * @param {string} key
     * @returns {undefined}
     */
    $scope.toggleRowSpinner = function (key) {
        if (!key) {
            $scope.rowSpinner = [];
            return;
        }
        $scope.rowSpinner[key] = !$scope.rowSpinner[key];
    };

    /**
     * Set alertify defaults
     */
    $scope.setAlertifyDefaults = function () {
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
                build: function () {
                    var errorHeader = '<span class="fa fa-exclamation-triangle fa-lg text-danger" '
                        + 'style="vertical-align:middle;">'
                        + '</span> ' + cfg.app_name + ' - ERROR';
                    this.setHeader(errorHeader);
                }
            };
        }, true, 'alert');
    }

    // Extend existing alert (WARNING) dialog
    if (!alertify.alertWarning) {
        alertify.dialog('alertWarning', function factory() {
            return {
                build: function () {
                    var errorHeader = '<span class="fa fa-exclamation-circle fa-lg text-warning" '
                        + 'style="vertical-align:middle;">'
                        + '</span> ' + cfg.app_name + ' - WARNING';
                    this.setHeader(errorHeader);
                }
            };
        }, true, 'alert');
    }
});
