/**
 * @overview This is used to handle angular modules, routes and other settings.
 * @author Martin Vach
 */


/**
 * Define an angular module for our app
 * @function myApp
 */
var myApp = angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'ngTouch',
    'myAppConfig',
    'myAppController',
    'myAppFactory',
    'myAppService',
    'qAllSettled',
    'myAppTemplates',
    'httpLatency',
    'ng.deviceDetector',
    'pr.longpress',
    'angular-sortable-view',
]);

// App configuration
var config_module = angular.module('myAppConfig', []);
var appCookies = angular.injector(['ngCookies']).get('$cookies');
var appUser = false;
var appHttp = angular.injector(["ng"]).get("$http");
// Attempt to get user cookie
/*if (appCookies.user) {
    appUser = angular.fromJson(appCookies.user);
    angular.extend(config_data.cfg.route, {user: appUser});
}*/
// Attempt to get lang cookie
if (appCookies.lang) {
    angular.extend(config_data.cfg.route, {lang: appCookies.lang});
}

// Attempt to load language file
appHttp.get('app/lang/' + config_data.cfg.route.lang + '.json').success(function (data) {
    angular.extend(config_data.cfg.route, {t: data});
}).error(function () {
    angular.extend(config_data.cfg.route.alert, {
        message: 'An unexpected error occurred while loading the language file.',
        hide: true
    });
});

// Create a config constant
angular.forEach(config_data, function (key, value) {
    config_module.constant(value, key);
});

// Create an icon constant
angular.forEach(icon_data, function (key, value) {
    config_module.constant(value, key);
});

// Create an mobile config constant
angular.forEach(notifications_data, function (key, value) {
    config_module.constant(value, key);
});

/**
 * Angular run function
 * @function run
 */
myApp.run(function ($rootScope, $route, $location, dataService, dataFactory, cfg) {

    // Run underscore js in views
    $rootScope._ = _;
      $rootScope.$on("$routeChangeStart", function (event, next, current) {

        var route = {
            previous: (current && current.$$route) ? current.$$route.originalPath : false
        };
        angular.extend(cfg.route,route);
    });
});

/**
 * Intercepting HTTP calls with AngularJS.
 * @function config
 */
myApp.config(function ($provide, $httpProvider) {
    $httpProvider.defaults.timeout = 5000;
    // Intercept http calls.
    $provide.factory('MyHttpInterceptor', function ($q, $location, dataService,cfg) {
        var path = $location.path().split('/');
        return {
            // On request success
            request: function (config) {
                // Return the config or wrap it in a promise if blank.
                if(config.url.indexOf('views') !== -1 && cfg.app_version == "@@app_version") { // only for dev
                        config.url += "?rel=" + Date.now();
                }

                return config || $q.when(config);
            },
            // On request failure
            requestError: function (rejection) {
                // Return the promise rejection.
                return $q.reject(rejection);
            },
            // On response success
            response: function (response) {

                // Return the response or promise.
                return response || $q.when(response);
            },
            // On response failture
            responseError: function (rejection) {
                //dataService.logError(rejection);
                switch(rejection.status){
                   /* case 1:
                       console.log('CONNECTION ERROR');
                        var fatalArray = {
                            type: 'network',
                            message: cfg.route.t['connection_refused'],
                            info: cfg.route.t['connection_refused_info'],
                            permanent: true,
                            hide: true
                        };
                        angular.extend(cfg.route.alert, fatalArray);
                        break;*/
                    case 0:
                        // Check if request has no timeout or location url is on the black list and pending is from a remote server
                        // then does not display an error message
                        if(rejection.config.headers.isZWAY) {
                            angular.extend(cfg.route.alert, {
                                type: 'network',
                                message: 'The request failed because the server is not responding',
                                hide: false
                            });
                            break;
                        }
                        var test = (!rejection.config.headers.timeout || rejection.config.headers.suppressFtalError || (cfg.pending_black_list.indexOf($location.url()) > -1 && rejection.config.headers.isRemote));
                        //if(!rejection.config.headers.timeout || rejection.config.headers.suppressFtalError || (cfg.pending_black_list.indexOf($location.url()) > -1 && rejection.config.headers.isRemote)){
                        if(test) {
                           break;
                        }
                        angular.extend(cfg.route.alert, {
                            type: 'network',
                            message: 'The request failed because the server is not responding',
                            hide: false
                        });
                        break;
                    case 401:
                        if (path[1] !== '') {
                            dataService.logOut();
                         }
                        break;

                     case 403:
                        dataService.logError(rejection);
                        $location.path('/error403');
                        break;

                }
                return $q.reject(rejection);
            }
        };
    });

    // Add the interceptor to the $httpProvider.
    $httpProvider.interceptors.push('MyHttpInterceptor');

});


