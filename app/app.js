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
                when('/elements/:filter?/:val?', {
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
                    templateUrl: 'app/views/config/profiles.html'
                }).
                //Apps
                when('/apps', {
                    templateUrl: 'app/views/config/apps.html'
                }).
                //Module
                when('/module/:action/:id', {
                    templateUrl: 'app/views/config/app_module.html'
                }).
                //Devices
                when('/devices', {
                    templateUrl: 'app/views/config/devices.html'
                }).
                //Rooms
                when('/config-rooms', {
                    templateUrl: 'app/views/config/config_rooms.html'
                }).
                //Network
                when('/network', {
                    templateUrl: 'app/views/config/network.html'
                }).
                //About
                when('/about', {
                    templateUrl: 'app/views/pages/about.html'
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


