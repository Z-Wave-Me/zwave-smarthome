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
myApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
                // Home
                when('/', {
                    redirectTo: '/elements/dashboard/1'
                }).
                // Elements
                when('/elements/:filter?/:val?/:name?', {
                    templateUrl: 'app/views/elements/elements.html'
                }).
                // Rooms
                when('/rooms', {
                    templateUrl: 'app/views/rooms/rooms.html'
                }).
                // Events
                when('/events/:param?/:val?', {
                    templateUrl: 'app/views/events/events.html'
                }).
                //Profile
                when('/profiles', {
                    templateUrl: 'app/views/profiles/profiles.html'
                }).
                //Profile detail
                when('/profiles/:id', {
                    templateUrl: 'app/views/profiles/profile.html'
                }).
                //My Access
                when('/myaccess', {
                    templateUrl: 'app/views/myaccess/myaccess.html'
                }).
                //Apps
                when('/apps', {
                    templateUrl: 'app/views/apps/apps.html'
                }).
                //Apps - local detail
                when('/apps/local/:id', {
                    templateUrl: 'app/views/apps/app_local_detail.html'
                }).
                //Apps - online detail
                when('/apps/online/:id', {
                    templateUrl: 'app/views/apps/app_online_detail.html'
                }).
                //Module
                when('/module/:action/:id', {
                    templateUrl: 'app/views/apps/app_module_alpaca.html'
                }).
                //Devices
                when('/devices/:type?', {
                    templateUrl: 'app/views/devices/devices.html' 
                }).
                //Include Devices
                when('/include/:device?', {
                    templateUrl: 'app/views/devices/device_include.html'
                }).
                //Rooms
                when('/config-rooms', {
                    templateUrl: 'app/views/rooms/config_rooms.html'
                }).
                //Network
                when('/network', {
                    templateUrl: 'app/views/network/network.html'
                }).
                //Device configuration
                when('/deviceconfig/:nodeId', {
                    templateUrl: 'app/views/expertui/configuration.html'
                }).
                //About
                when('/about', {
                    templateUrl: 'app/views/pages/about.html'
                }).
                //Login
                when('/login', {
                    templateUrl: 'app/views/login/login.html'
                }).
                // Test
                when('/test', {
                    templateUrl: 'app/views/test.html'
                }).
                otherwise({
                    redirectTo: '/elements/dashboard/1'
                });
    }]);

/**
 * App configuration
 */

var config_module = angular.module('myAppConfig', []);

angular.forEach(config_data,function(key,value) {
  config_module.constant(value,key);
});

// Intercepting HTTP calls with AngularJS.
myApp.config(function ($provide, $httpProvider) {
  $httpProvider.defaults.timeout = 5000;
  // Intercept http calls.
  $provide.factory('MyHttpInterceptor', function ($q) {
    return {
      // On request success
      request: function (config) {
       //console.log(config); // Contains the data about the request before it is sent.

        // Return the config or wrap it in a promise if blank.
        return config || $q.when(config);
      },

      // On request failure
      requestError: function (rejection) {
        console.log(rejection); // Contains the data about the error on the request.
        
        // Return the promise rejection.
        return $q.reject(rejection);
      },

      // On response success
      response: function (response) {
        //console.log(response.data); // Contains the data from the response.
        
        // Return the response or promise.
        return response || $q.when(response);
      },

      // On response failture
      responseError: function (rejection) {
        // console.log(rejection); // Contains the data about the error.
        
        // Return the promise rejection.
        return $q.reject(rejection);
      }
    };
  });

  // Add the interceptor to the $httpProvider.
  //$httpProvider.interceptors.push('MyHttpInterceptor');

});


