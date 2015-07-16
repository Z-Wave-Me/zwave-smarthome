/**
 * Application base
 * @author Martin Vach
 */

//Define an angular module for our app
var myApp = angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'myAppConfig',
    'myAppController',
    'myAppFactory',
    'myAppService',
    'colorpicker.module',
    'angularFileUpload'

]);

//Define Routing for app
myApp.config(['$routeProvider', function($routeProvider) {
        var cfg = config_data.cfg;
        $routeProvider.
                // Login
                when('/', {
                    //redirectTo: '/elements/dashboard/1'
                    templateUrl: 'app/views/login/login.html'
                }).
                 // Home
                when('/home', {
                   redirectTo: '/elements/dashboard/1'
                }).
                // Elements
                when('/elements/:filter?/:val?/:name?', {
                    templateUrl: 'app/views/elements/elements.html',
                    requireLogin: true
                }).
                // Element
                when('/element/:id', {
                    templateUrl: 'app/views/elements/element.html',
                    requireLogin: true,
                    roles: cfg.role_access.element
                }).
                // Rooms
                when('/rooms', {
                    templateUrl: 'app/views/rooms/rooms.html',
                    requireLogin: true,
                    roles: cfg.role_access.rooms
                }).
                // Events
                when('/events/:param?/:val?', {
                    templateUrl: 'app/views/events/events.html',
                     requireLogin: true
                }).
                //Admin
                when('/admin', {
                    templateUrl: 'app/views/admin/admin.html',
                    requireLogin: true,
                    roles: cfg.role_access.admin
                }).
                //Admin detail
                when('/admin/user/:id', {
                    templateUrl: 'app/views/admin/admin_user.html',
                    requireLogin: true,
                    roles: cfg.role_access.admin_user
                }).
                //My Access
                when('/myaccess', {
                    templateUrl: 'app/views/myaccess/myaccess.html',
                    requireLogin: true,
                    roles: cfg.role_access.myaccess
                }).
                //Apps
                when('/apps', { 
                    templateUrl: 'app/views/apps/apps.html',
                     requireLogin: true,
                    roles: cfg.role_access.apps
                }).
                //Apps - local detail
                when('/apps/local/:id', {
                    templateUrl: 'app/views/apps/app_local_detail.html',
                    requireLogin: true,
                    roles: cfg.role_access.apps_local
                }).
                //Apps - online detail
                when('/apps/online/:id', {
                    templateUrl: 'app/views/apps/app_online_detail.html',
                    requireLogin: true,
                   roles: cfg.role_access.apps_online
                }).
                //Module
                when('/module/:action/:id', {
                    templateUrl: 'app/views/apps/app_module_alpaca.html',
                    requireLogin: true,
                    roles: cfg.role_access.module
                }).
                //Devices_
                when('/devices', {
                    templateUrl: 'app/views/devices/devices.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //Zwave device
                when('/devices/zwave/:brandname?', {
                    templateUrl: 'app/views/devices/devices_zwave.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //IP camera device
                when('/devices/ipcamera', {
                    templateUrl: 'app/views/devices/devices_ipcamera.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //IP camera device
               /* when('/devices/enocean/:brandname?', {
                    templateUrl: 'app/views/devices/devices_enocean.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).*/
                //Include Zwave device
                when('/include/:device?', {
                    templateUrl: 'app/views/devices/device_include.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices_include
                }).
                //Enocean Devices
                when('/enocean/devices/:brandname?', {
                    templateUrl: 'app/views/enocean/devices.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //Enocean Teach-In
                when('/enocean/teachin/:device', {
                    templateUrl: 'app/views/enocean/teachin.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //Enocean devices
                when('/enocean/manage', {
                    templateUrl: 'app/views/enocean/manage.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //Enocean device manage
                when('/enocean/manage/:deviceId', {
                    templateUrl: 'app/views/enocean/manage_detail.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //Enocean controller
                when('/enocean/controller', {
                    templateUrl: 'app/views/enocean/controller.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //Enocean assign profile
                when('/enocean/assign', {
                    templateUrl: 'app/views/enocean/assign.html',
                    requireLogin: true,
                    roles: cfg.role_access.devices
                }).
                //Rooms
                when('/config-rooms', {
                    templateUrl: 'app/views/rooms/config_rooms.html',
                    requireLogin: true,
                    roles: cfg.role_access.config_rooms
                }).
                when('/config-rooms/:id', {
                    templateUrl: 'app/views/rooms/config_rooms_edit.html',
                    requireLogin: true,
                    roles: cfg.role_access.config_rooms_id
                }).
                //Network
                when('/network', {
                    templateUrl: 'app/views/network/network.html',
                    requireLogin: true
                }).
                //Network config
                when('/network/config/:nodeId', {
                    templateUrl: 'app/views/network/config.html',
                    requireLogin: true,
                    roles: cfg.role_access.network_config_id
                }).
                //Device configuration
                when('/deviceconfig/:nodeId', {
                    templateUrl: 'app/views/expertui/configuration.html',
                    requireLogin: true
                }).
                //Report
                when('/report', {
                    templateUrl: 'app/views/report/report.html',
                    requireLogin: true
                }).
                //Login
                when('/login', {
                    redirectTo: '/'
                    //templateUrl: 'app/views/login/login.html',
                }).
                //Login
                when('/logout', {
                    templateUrl: 'app/views/login/logout.html',
                    requireLogin: true
                }).
                // Error page
                when('/error/:code?', {
                    templateUrl: 'app/views/error.html'
                }).
                // Test
                when('/test', {
                    templateUrl: 'app/views/test.html'
                }).
                otherwise({
                    redirectTo: '/error/404'
                });
    }]);

/**
 * App configuration
 */

//myApp.config([
//    "$routeProvider",
//    "$httpProvider",
//    function($routeProvider, $httpProvider){
//        $httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
//    }
//]);

var config_module = angular.module('myAppConfig', []);

angular.forEach(config_data, function(key, value) {
    config_module.constant(value, key);
});

/**
 * Route Access Control and Authentication
 */
myApp.run(function($rootScope, $location, dataService) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        var user;
        if (next.requireLogin) {
            user = dataService.getUser();
            if (!user) {
                //alert('You need to be authenticated to see this page!');
                //event.preventDefault();
                $location.path('/');
                return;
            }
            if (next.roles && angular.isArray(next.roles)) {
                if (next.roles.indexOf(user.role) === -1) {
                    //alert('You have no permissions to see this page!');
                    //$location.path('/elements');
                     $location.path('/error/403');
                    return;
                }
            }
        }
    });
});

// Intercepting HTTP calls with AngularJS.
myApp.config(function($provide, $httpProvider) {
    $httpProvider.defaults.timeout = 5000;
    // Intercept http calls.
    $provide.factory('MyHttpInterceptor', function($q,$location,dataService) {
         var path = $location.path().split('/');
        return {
            // On request success
            request: function(config) {
                // Return the config or wrap it in a promise if blank.
                return config || $q.when(config);
            },
            // On request failure
            requestError: function(rejection) {
                // Return the promise rejection.
                return $q.reject(rejection);
            },
            // On response success
            response: function(response) {
                // Return the response or promise.
                return response || $q.when(response);
            },
            // On response failture
            responseError: function(rejection) {
                dataService.logError(rejection);
               if(rejection.status == 401){
                  
                   //$cookies.user = undefined;
                   if(path[1] !== ''){
                        dataService.logOut();
                   }
                   return $q.reject(rejection);
                    
                }else if(rejection.status == 403){
                    $location.path('/error/403');
                    return $q.reject(rejection);
                }else{
                    // Return the promise rejection.
                    return $q.reject(rejection);
                }
                //
                
            }
        };
    });

    // Add the interceptor to the $httpProvider.
    $httpProvider.interceptors.push('MyHttpInterceptor');

});


