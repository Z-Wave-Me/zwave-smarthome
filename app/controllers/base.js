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
myAppController.controller('BaseController', function ($scope, $cookies, $filter, $location, $route, $window, $interval, cfg, dataFactory, dataService, myCache) {
    // Global scopes
    angular.extend(cfg.route, {os: dataService.getOs()});
    $scope.cfg = cfg;
    $scope.timeZoneInterval = null;
    $scope.languages = {};
    $scope.loading = false;
    $scope.alert = {message: false, status: 'is-hidden', icon: false};
    $scope.user = dataService.getUser();
    $scope.hostName = $location.host();
    $scope.ZWAYSession = dataService.getZWAYSession();
    $scope.lastLogin = dataService.getLastLogin();
    /*$scope.setSkin = function () {
     if($cookies.skin && $cookies.skin !== 'default'){
     cfg.skin.active =  $cookies.skin;
     cfg.img.icons = cfg.skin.path + $cookies.skin + '/img/icons/';
     cfg.img.logo = cfg.skin.path + $cookies.skin + '/img/logo/';
     //$("link[id='main_css']").attr('href', 'storage/skins/defaultzip/main.css');
     $("link[id='main_css']").attr('href', cfg.skin.path + $cookies.skin + '/main.css');
     }
     
     };
     
     $scope.setSkin();*/


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
     * Reset a fatal error.
     * @param {object} obj
     * @returns {undefined}
     */
    $scope.resetFatalError = function (obj) {
        angular.extend(cfg.route.fatalError, obj || {message: false, info: false, hide: false});

    };
    /**
     * Set a time
     * @returns {undefined}
     */
    $scope.setTimeZone = function () {
        if (!$scope.user) {
            return;
        }
        dataFactory.getApi('timezone', null, true).then(function (response) {
            angular.extend(cfg.route.time, {string: $filter('setTimeFromBox')(response.data.data)});
            var refresh = function () {
                dataFactory.getApi('timezone', null, true).then(function (response) {
                    angular.extend(cfg.route.time, {string: $filter('setTimeFromBox')(response.data.data)});
                }, function (error) {
                    if (!error.status || error.status === 0) {
                        var fatalArray = {
                            message: $scope._t('connection_refused'),
                            info: $scope._t('connection_refused_info'),
                            permanent: true,
                            hide: true
                        };
                        if ($scope.routeMatch('/boxupdate')) {
                            fatalArray.message = $scope._t('jamesbox_connection_refused');
                            fatalArray.info = $scope._t('jamesbox_connection_refused_info',{__reload_begintag__:'<div>', __reload_endtag__:'</div>', __attention_begintag__:'<div class="alert alert-warning"><i class="fa fa-exclamation-circle"></i>', __attention_endtag__:'<div>'});
                            fatalArray.icon = cfg.route.fatalError.icon_jamesbox;
                        }
                        angular.extend(cfg.route.fatalError, fatalArray);
                    }
                    //$interval.cancel($scope.timeZoneInterval);
                });
            };
            $scope.timeZoneInterval = $interval(refresh, $scope.cfg.interval);
        }, function (error) {});

    };
    $scope.setTimeZone();
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
        }, function (error) {});
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
    
    // IF IE or Edge displays an message
    if (dataService.isIeEdge()) {
        angular.extend(cfg.route.fatalError, {
            message: cfg.route.t['ie_edge_not_supported'],
            info: cfg.route.t['ie_edge_not_supported_info']
        });
    }

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
    $scope.naviExpanded = {};
    /**
     * Expand/collapse navigation
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
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
    // Collapse element/menu when clicking outside
    window.onclick = function () {
        if ($scope.naviExpanded) {
            angular.copy({}, $scope.naviExpanded);
            $scope.$apply();
        }
    };

    $scope.modalArr = {};
    /**
     * Open/close a modal window
     * @param {string} key
     * @param {object} $event
     * @param {boolean} status
     * @returns {undefined}
     */
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


    // Alertify defaults
    alertify.defaults.glossary.title = cfg.app_name;
    alertify.defaults.glossary.ok = 'OK';
    alertify.defaults.glossary.cancel = 'CANCEL';

    // Extend existing alert (ERROR) dialog
    if (!alertify.alertError) {
        //define a new errorAlert base on alert
        alertify.dialog('alertError', function factory() {
            return{
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
            return{
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
