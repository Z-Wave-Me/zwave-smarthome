/**
 * @overview This is used to handle angular routes.
 * @author Martin Vach
 */


/**
 * Define Angular routes
 * @function $routeProvider
 */
myApp.config(['$routeProvider', function ($routeProvider) {
    var cfg = config_data.cfg;
    $routeProvider.// Login
    when('/', {
        templateUrl: 'app/views/auth/auth.html'
    }).// Home
    when('/home', {
        redirectTo: '/dashboard'
    }).// Elements Dashboard
    when('/dashboard/:firstlogin?', {
        templateUrl: 'app/views/elements/elements_dashboard.html',
        requireLogin: true
    }).// Elements list
    when('/elements', {
        templateUrl: 'app/views/elements/elements_page.html',
        requireLogin: true
    }).// Element id
    when('/element/:id', {
        templateUrl: 'app/views/elements/element_id.html',
        requireLogin: true,
        roles: cfg.role_access.element
    }).// Rooms
    when('/rooms', {
        templateUrl: 'app/views/rooms/rooms.html',
        requireLogin: true,
        roles: cfg.role_access.rooms
    }).// Elements rooms
    when('/rooms/:id', {
        templateUrl: 'app/views/elements/elements_room.html',
        requireLogin: true
    }).// Events
    when('/events/:param?/:val?', {
        templateUrl: 'app/views/events/events.html',
        requireLogin: true
    }).//Admin
    when('/admin', {
        templateUrl: 'app/views/management/management.html',
        requireLogin: true,
        roles: cfg.role_access.admin
    }).//Admin detail
    when('/admin/user/:id', {
        templateUrl: 'app/views/management/management_user_id.html',
        requireLogin: true,
        roles: cfg.role_access.admin_user
    }).//My Access
    when('/myaccess', {
        templateUrl: 'app/views/mysettings/mysettings.html',
        requireLogin: true,
        roles: cfg.role_access.myaccess
    }).//Apps local
    when('/apps/local', {
        templateUrl: 'app/views/apps/apps_local.html',
        requireLogin: true,
        roles: cfg.role_access.apps
    }).//Apps - local detail
    when('/apps/local/:id', {
        templateUrl: 'app/views/apps/apps_local_id.html',
        requireLogin: true,
        roles: cfg.role_access.apps_local
    }).//Apps online
    when('/apps/online', {
        templateUrl: 'app/views/apps/apps_online.html',
        requireLogin: true,
        roles: cfg.role_access.apps
    }).//Apps - online detail
    when('/apps/online/:id', {
        templateUrl: 'app/views/apps/apps_online_id.html',
        requireLogin: true,
        roles: cfg.role_access.apps_online
    }).//Apps -instance
    when('/apps/instance', {
        templateUrl: 'app/views/apps/apps_instance.html',
        requireLogin: true,
        roles: cfg.role_access.apps_online
    }).//Module
    when('/module/:action/:id/:fromapp?', {
        templateUrl: 'app/views/apps/app_module_alpaca.html',
        requireLogin: true,
        roles: cfg.role_access.module
    }).//Local skins
    when('/customize/skinslocal', {
        templateUrl: 'app/views/customize/skins_local.html',
        requireLogin: true,
        roles: cfg.role_access.customize
    }).//Online skins
    when('/customize/skinsonline', {
        templateUrl: 'app/views/customize/skins_online.html',
        requireLogin: true,
        roles: cfg.role_access.customize
    }).//Online skins
    when('/skinreset', {
        template: ' ',
        controller: 'SkinToDefaultController',
        requireLogin: true,
        roles: cfg.role_access.customize
    }).//Custom icons
    when('/customize/iconslocal', {
        templateUrl: 'app/views/customize/icons_local.html',
        requireLogin: true,
        roles: cfg.role_access.customize
    }).//Online icons
    when('/customize/iconsonline', {
        templateUrl: 'app/views/customize/icons_online.html',
        requireLogin: true,
        roles: cfg.role_access.customize
    }).//Devices_
    when('/devices', {
        templateUrl: 'app/views/devices/devices.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Zwave select vendors
    when('/zwave/vendors', {
        templateUrl: 'app/views/zwave/zwave_vendors.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Zwave select devices by vendor id
    when('/zwave/vendors/:id', {
        templateUrl: 'app/views/zwave/zwave_vendors_id.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Include Zwave device
    when('/zwave/inclusion/:id?', {
        templateUrl: 'app/views/zwave/zwave_inclusion.html',
        requireLogin: true,
        roles: cfg.role_access.devices_include
    }).//Include Zwave device
    when('/zwave/interview/:id', {
        templateUrl: 'app/views/zwave/zwave_interview.html',
        requireLogin: true,
        roles: cfg.role_access.devices_include
    }).// DEPRECATED
    //Include Zwave device
    when('/zwave/include/:device?', {
        templateUrl: 'app/views/zwave/zwave_include.html',
        requireLogin: true,
        roles: cfg.role_access.devices_include
    }).//Include Zwave device
    when('/zwave/exclude/:id', {
        templateUrl: 'app/views/zwave/zwave_exclude.html',
        requireLogin: true,
        roles: cfg.role_access.devices_include
    }).//Zwave devices
    when('/zwave/devices', {
        templateUrl: 'app/views/zwave/zwave_manage.html',
        requireLogin: true
    }).//Zwave devices config
    when('/zwave/devices/:nodeId/:nohistory?', {
        templateUrl: 'app/views/zwave/zwave_manage_id.html',
        requireLogin: true,
        roles: cfg.role_access.network_config_id
    }).//Zwave battery
    when('/zwave/batteries', {
        templateUrl: 'app/views/zwave/zwave_batteries.html',
        requireLogin: true
    }).//Zwave Network
    when('/zwave/network', {
        templateUrl: 'app/views/zwave/zwave_network.html',
        requireLogin: true
    }).//Camera add
    when('/camera/add', {
        templateUrl: 'app/views/camera/camera_add.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Camera manage
    when('/camera/manage', {
        templateUrl: 'app/views/camera/camera_manage.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Enocean Devices
    when('/enocean/devices/:brandname?', {
        templateUrl: 'app/views/enocean/devices.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Enocean Teach-In
    when('/enocean/teachin/:device', {
        templateUrl: 'app/views/enocean/teachin.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Enocean devices
    when('/enocean/manage', {
        templateUrl: 'app/views/enocean/manage.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Enocean device manage
    when('/enocean/manage/:deviceId', {
        templateUrl: 'app/views/enocean/manage_detail.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Enocean controller
    when('/enocean/controller', {
        templateUrl: 'app/views/enocean/controller.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Enocean assign profile
    when('/enocean/assign', {
        templateUrl: 'app/views/enocean/assign.html',
        requireLogin: true,
        roles: cfg.role_access.devices
    }).//Rooms
    when('/config-rooms', {
        templateUrl: 'app/views/rooms/config_rooms.html',
        requireLogin: true,
        roles: cfg.role_access.config_rooms
    }).when('/config-rooms/:id', {
        templateUrl: 'app/views/rooms/config_rooms_id.html',
        requireLogin: true,
        roles: cfg.role_access.config_rooms_id
    }).//Device configuration
    when('/deviceconfig/:nodeId', {
        templateUrl: 'app/views/expertui/configuration.html',
        requireLogin: true
    }).//Report
    when('/report', {
        templateUrl: 'app/views/report/report.html',
        requireLogin: true
    }).//Login
    when('/login', {
        redirectTo: '/'
    }).//Password
    when('/password', {
        templateUrl: 'app/views/auth/password.html',
        requireLogin: true
    }).//Password
    when('/passwordchange', {
        templateUrl: 'app/views/auth/password_change.html'
    }).//Password forgot
    when('/passwordforgot', {
        templateUrl: 'app/views/auth/password_forgot.html'
    }).//Password reset
    when('/passwordforgot/reset/:token?', {
        templateUrl: 'app/views/auth/password_reset.html'
    }).//Jamesbox update
    when('/boxupdate', {
        templateUrl: 'app/views/jamesbox/update.html'
    }).//Login
    when('/logout', {
        template: ' ',
        controller: 'LogoutController',
        requireLogin: true
    }).//Error 403
    when('/error403', {
        templateUrl: 'app/views/error_403.html'
    }).//Test
    when('/test', {
        templateUrl: 'app/views/test.html'
    }).otherwise({
        template: ' ',
        controller: 'Error404Controller'
    });
}]);
