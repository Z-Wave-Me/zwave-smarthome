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
    'myAppConfig',
    'myAppController',
    'myAppFactory',
    'myAppService',
    'qAllSettled',
    'myAppTemplates',
    'httpLatency',
    'angular-sortable-view'

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
    angular.extend(config_data.cfg.route.fatalError, {
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



/**
 * Angular run function
 * @function run
 */
myApp.run(function ($rootScope, $location, dataService, dataFactory,cfg) {
    // Run underscore js in views
    $rootScope._ = _;
    /**
     * todo: deprecated
     */
   /* $rootScope.$on("$routeChangeStart", function (event, next, current) {
        /!**
         * Reset fatal error object
         *!/
        dataService.resetFatalError();

        /!**
         * Check if access is allowed for the page
         *!/
        dataService.isAccessAllowed(next);

    });*/
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
                        angular.extend(cfg.route.fatalError, fatalArray);
                        break;*/
                    case 0:
                        //console.log(rejection)
                        console.log('Request took longer than ' + (cfg.pending_remote_limit/1000) + ' seconds.');
                        angular.extend(cfg.route.fatalError, {
                            message: 'Request took longer than ' + (cfg.pending_remote_limit/1000) + ' seconds.',
                            hide: false
                        });
                        break;
                    case 401:
                        if (path[1] !== '') {
                            dataService.setRememberMe(null);
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


