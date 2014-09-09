/**
 * Application base
 * @author Martin Vach
 */

//Define an angular module for our app
var myApp = angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'myAppConfig',
    'myAppSettings',
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
                    templateUrl: 'app/views/home/home.html'
                }).
                // Elements
                when('/elements', {
                    templateUrl: 'app/views/elements/elements.html'
                }).
                // Elements
                when('/elements-1', {
                    templateUrl: 'app/views/elements/elements_1.html'
                }).
                // Rooms
                when('/rooms', {
                    templateUrl: 'app/views/rooms/rooms.html'
                }).
                         // Room detail
                when('/room/:id', {
                    templateUrl: 'app/views/rooms/room_device.html'
                }).
                // Events
                when('/events', {
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
                    redirectTo: '/'
                });
    }]);


