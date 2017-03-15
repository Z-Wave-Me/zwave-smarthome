/* Copyright:  Z-Wave Europe GmbH, Created: 15-03-2017 15:01:10 */
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
    'myAppConfig',
    'myAppController',
    'myAppFactory',
    'myAppService',
    'dndLists',
    'qAllSettled',
    'myAppTemplates',
    'httpLatency'

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
    }).otherwise({
        template: ' ',
        controller: 'Error404Controller'
    });
}]);

angular.module('myAppTemplates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/views/apps/app_module_alpaca.html',
    "<div class=mobile-padding id=page_module_update ng-controller=AppModuleAlpacaController><bb-loader></bb-loader><div class=form-page ng-show=showForm><div class=\"fieldset clearfix\"><div class=app-detail-img><img class=app-image-detail ng-src=\"{{moduleMediaUrl + input.moduleName + '/' + input.icon}}\" ng-if=input.icon alt=\"img\"></div><div class=app-detail-body><h2 ng-bind=input.moduleTitle></h2><p class=app-detail-perex ng-bind-html=\"moduleId.find.defaults.description | toTrusted\"></p><p class=app-detail-list ng-if=moduleId.categoryName><i class=\"fa fa-list\"></i> <span ng-bind=moduleId.categoryName></span></p><p class=app-detail-list ng-if=moduleId.find.author><i class=\"fa fa-user\"></i> <span ng-show=!moduleId.find.homepage ng-bind=moduleId.find.author></span> <a ng-href={{moduleId.find.homepage}} ng-if=moduleId.find.homepage ng-bind=moduleId.find.author></a></p><p class=app-detail-list ng-if=moduleId.find.version><i class=\"fa fa-info-circle\"></i> <span class=app-version ng-bind=moduleId.find.version></span> <span class=label ng-class=\"moduleId.find.maturity == 'stable' ? 'label-success' : 'label-warning'\">{{moduleId.find.maturity}}</span></p><p class=app-detail-list ng-if=\"moduleId.find.dependencies.length > 0\"><i class=\"fa fa-link\"></i> <strong>{{_t('dependent_modules')}}:</strong> <span ng-repeat=\"i in moduleId.find.dependencies\">{{i}},</span></p><div class=\"alert alert-warning\" ng-if=!_.isEmpty(moduleId.dependency.activate)><p>{{_t('war_dependency_module_activate')}}</p><a href=\"\" class=\"btn btn-default btn-tag\" ng-repeat=\"v in moduleId.dependency.activate\" ng-click=activateInstance(v)>{{v.moduleId}} <i class=\"fa fa-fire text-success\" title=\"{{_t('lb_activate')}}\"></i></a></div><div class=\"alert alert-warning\" ng-if=!_.isEmpty(moduleId.dependency.add)><p>{{_t('war_dependency_module_add')}}</p><a ng-href=#module/post/{{v.modulename}}/{{input.moduleId}} class=\"btn btn-default btn-tag\" ng-repeat=\"v in moduleId.dependency.add\">{{v.modulename}} <i class=\"fa fa-plus text-success\" title=\"{{_t('lb_add_app')}}\"></i></a></div><div class=\"alert alert-warning\" ng-if=!_.isEmpty(moduleId.dependency.download)><p>{{_t('war_dependency_module_install')}}</p><a href=\"\" class=\"btn btn-default btn-tag\" ng-repeat=\"v in moduleId.dependency.download\" ng-click=installModule(v)>{{v.modulename}} <i class=\"fa fa-download text-success\" title=\"{{_t('lb_download')}}\"></i></a></div><div class=form-group></div></div></div><div ng-if=moduleId.singletonActive><div class=\"fieldset clearfix\"><div class=\"alert alert-warning\"><i class=\"fa fa-exclamation-circle\"></i> {{_t('singleton_with_instance',{__module_title__:input.moduleTitle})}}</div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <a class=\"btn btn-submit\" title=\"{{_t('lb_active')}}\" href=#apps/instance><i class=\"fa fa-fire\"></i> <span class=btn-name>{{_t('active_apps')}}</span></a></div></div><form id=form_module ng-if=!moduleId.singletonActive><input name=instanceId id=instanceId type=hidden class=form-control value=\"{{input.instanceId}}\"> <input name=moduleId id=moduleId type=hidden class=form-control value=\"{{input.moduleId}}\"><fieldset><div class=form-group><input type=checkbox name=active value={{input.active}} id=active ng-model=input.active ng-checked=\"input.active\"><label>{{_t('lb_active')}}</label></div><div class=form-group><label>{{_t('lb_name')}}</label><input name=title id=title class=form-control value={{input.title}} ng-model=\"input.title\"></div></fieldset><div id=alpaca_data ng-show=alpacaData data-module-postrender={{input.modulePostrender}}></div><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit title=\"{{_t('lb_save')}}\" id=btn_module_submit_ang class=\"btn btn-submit\" ng-click=store(input) ng-disabled=!moduleId.submit ng-if=!alpacaData><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button> <button type=submit title=\"{{_t('lb_save')}}\" id=btn_module_submit class=\"btn btn-submit\" data-sid={{ZWAYSession}} data-fromapp={{moduleId.fromapp}} data-lang={{lang}} ng-disabled=!moduleId.submit ng-if=alpacaData><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form></div></div>"
  );


  $templateCache.put('app/views/apps/apps_instance.html',
    "<div ng-controller=AppBaseController><bb-loader></bb-loader><div ng-controller=AppInstanceController id=apps_instances><div ng-include=\"'app/views/apps/navi.html'\"></div><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-1\"><button class=\"btn btn-default\" ng-click=\"expandNavi('appsInstancesOrderBy', $event)\"><i class=\"fa fa-sort-alpha-asc\"></i> <span class=btn-name>{{_t(dataHolder.instances.orderBy) | cutText:true:15}}</span></button></div><div class=input-group><input ng-model=q class=\"form-control form-search\" value={{q}}> <span class=input-group-addon><i class=\"fa fa-search\"></i></span></div></div><div class=page-navi ng-if=naviExpanded.appsInstancesOrderBy><div class=page-navi-in><div class=page-navi-content><p class=page-navi-title>{{_t('sortby')}}</p><a class=\"btn btn-default btn-tag\" href=\"\" ng-repeat=\"(k,v) in cfg.orderby.instances\" ng-click=setOrderBy(k) ng-class=\"dataHolder.instances.orderBy == k ? 'active': ''\">{{_t(k) | cutText:true:30}}</a></div></div></div><div class=\"app-row app-row-report app-row-event clearfix\"><div class=\"report-entry bcg-active\" id=instance_{{$index}} ng-repeat=\"v in dataHolder.instances.all|orderBy:cfg.orderby.instances[dataHolder.instances.orderBy] | filter:q track by v.id\" ng-class=\"v.active ? 'true': 'false'\" ng-if=\"dataHolder.modules.cameraIds.indexOf(v.moduleId) === -1\"><div class=\"report-col report-media\"><img class=report-img ng-src=\"{{moduleMediaUrl + v.moduleId + '/' + dataHolder.modules.imgs[v.moduleId]}}\" ng-if=dataHolder.modules.imgs[v.moduleId] alt=\"img\"> <img class=report-img ng-src=storage/img/placeholder-img.png ng-if=!dataHolder.modules.imgs[v.moduleId] alt=\"img\"></div><div class=\"report-col report-body\"><a href=#module/put/{{v.id}}><span ng-bind=v.title></span></a></div><div class=\"report-col report-ctrl report-ctrl-3\"><div class=btn-group><a ng-href=#module/put/{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_settings')}}\"><i class=\"fa fa-cog\"></i></a> <button title=\"{{_t('lb_deactivate')}}\" class=\"btn btn-default\" href=\"\" ng-if=v.active ng-class=\"v.active ? 'active' : ''\" ng-click=\"activateInstance(v, false)\"><i class=\"fa fa-fire text-success\"></i></button> <button title=\"{{_t('lb_activate')}}\" class=\"btn btn-default\" ng-if=!v.active ng-click=\"activateInstance(v, true)\"><i class=\"fa fa-power-off text-danger\"></i></button> <button title=\"{{_t('lb_remove')}}\" class=\"btn btn-default\" ng-click=\"deleteInstance('#instance_' + $index, {'id': v.id}, _t('lb_delete_confirm'))\"><i class=\"fa fa-remove text-danger\"></i></button></div></div></div></div></div></div>"
  );


  $templateCache.put('app/views/apps/apps_local.html',
    "<div ng-controller=AppBaseController><bb-loader></bb-loader><div ng-controller=AppLocalController id=apps_local><div ng-include=\"'app/views/apps/navi.html'\"></div><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-2\"><button class=\"btn btn-default\" ng-click=\"expandNavi('appsCategories', $event)\" ng-class=\"!_.isEmpty(dataHolder.modules.filter) ? 'active':'' \"><i class=\"fa fa-filter\"></i> <span class=btn-name ng-if=dataHolder.modules.filter.category>{{dataHolder.modules.categories[dataHolder.modules.filter.category].name|cutText:true:30}}</span> <span class=btn-name ng-if=dataHolder.modules.filter.featured>{{_t('featured_apps')}}</span> <span class=btn-name ng-if=_.isEmpty(dataHolder.modules.filter)>{{_t('all_apps')}}</span> <span class=\"btn-name item-cnt\">({{dataHolder.modules.cnt.collection}})</span></button> <button class=\"btn btn-default\" ng-click=\"expandNavi('appsLocalOrderBy', $event)\"><i class=\"fa fa-sort-alpha-asc\"></i> <span class=btn-name>{{_t(dataHolder.modules.orderBy) | cutText:true:15}}</span></button></div><div class=input-group><input ng-model=q class=\"form-control form-search\" value={{q}}> <span class=input-group-addon><i class=\"fa fa-search\"></i></span></div></div><div class=page-navi ng-if=naviExpanded.appsCategories><div class=page-navi-in><ul><li class=page-cat-0 ng-class=\"_.isEmpty(dataHolder.modules.filter) == true ? 'active': ''\"><a href=\"\" ng-click=setFilter()><i class=\"fa fa-check-circle-o\"></i> {{_t('all_apps')}} <span class=item-cnt>({{dataHolder.modules.cnt.apps}})</span> <span class=page-navi-icon><i class=\"fa fa-chevron-right\"></i></span></a></li><li class=page-cat-{{v.id}} ng-repeat=\"v in dataHolder.modules.categories\" ng-if=\"dataHolder.modules.cats.indexOf(v.id) > -1 && dataHolder.modules.cnt.appsCat[v.id]\" ng-class=\"dataHolder.modules.filter.category == v.id ? 'active': ''\"><a href=\"\" ng-click=\"setFilter({category: v.id})\"><i class=\"fa {{v.id|getAppCategoryIcon}}\"></i> {{v.name|cutText:true:30}} <span class=item-cnt>({{dataHolder.modules.cnt.appsCat[v.id]}})</span> <span class=page-navi-icon><i class=\"fa fa-chevron-right\"></i></span></a></li></ul></div></div><div class=page-navi ng-if=naviExpanded.appsLocalOrderBy><div class=page-navi-in><div class=page-navi-content><p class=page-navi-title>{{_t('sortby')}}</p><a class=\"btn btn-default btn-tag\" href=\"\" ng-repeat=\"(k,v) in cfg.orderby.appslocal\" ng-click=setOrderBy(k) ng-class=\"dataHolder.modules.orderBy == k ? 'active': ''\">{{_t(k) | cutText:true:30}}</a></div></div></div><div ng-if=\"dataHolder.modules.cnt.appsCatFeatured[dataHolder.modules.filter.category] > 0\"><h1 style=\"margin: 0px 0px 10px 10px\">{{_t('featured_apps')}}</h1><span style=\"display:block; width:100%; height: 4px; float: left; background-color: #80ad80\"></span><div class=\"app-row app-row-widget clearfix\"><div class=\"widget-entry widget-entry-app\" id=local_module_{{v.id}} ng-repeat=\"v in dataHolder.modules.all|orderBy:cfg.orderby.appslocal[dataHolder.modules.orderBy] | filter:q  track by v.id\" ng-if=v.featured ng-class=\"{'widget-danger': dataHolder.onlineModules.ids[v.id] && dataHolder.onlineModules.ids[v.id].version != v.version}\"><div class=widget-entry-in><div class=widget-img><a href=#apps/local/{{v.id}} title={{v.toolTipDescription}}><img class=widget-preview-img ng-src=\"{{moduleMediaUrl + v.moduleName + '/' + v.icon}}\" ng-if=v.icon alt=\"{{v.defaults.title}}\"> <img class=widget-preview-img ng-src=storage/img/placeholder-img.png ng-if=!v.icon alt=\"{{v.defaults.title}}\"></a></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3><a href=#apps/local/{{v.id}} title={{v.defaults.title}} ng-bind=v.defaults.title|cutText:true:25></a> <span class=btn-name>&raquo;</span></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\"><span ng-if=v.hasInstance><i class=\"fa fa-fire text-success\"></i> ({{v.hasInstance}})</span></div><div class=\"widget-ctrl ctrl-right clearfix\"><div class=btn-group><a ng-href=#module/post/{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_add_app')}}\"><i class=\"fa fa-plus text-success\"></i> <span class=btn-name ng-bind=\"_t('lb_add_app')\"></span></a> <button class=\"btn btn-default\" title=\"{{_t('lb_remove')}}\" ng-click=\"deleteModule({'id': v.id}, _t('app_delete_confirm'),'#local_module_' + v.id)\" ng-if=\"v.custom && !v.hasReset\"><i class=\"fa fa-remove text-danger\"></i> <span class=btn-name ng-bind=\"_t('lb_remove')\"></span></button> <button class=\"btn btn-default\" title=\"{{_t('reset')}}\" ng-click=\"resetModule({'id': v.id}, _t('app_reset_confirm'),'#local_module_' + v.id)\" ng-if=\"v.custom && v.hasReset\"><i class=\"fa fa-remove fa-refresh text-warning\"></i> <span class=btn-name ng-bind=\"_t('reset')\"></span></button> <button href=\"\" class=\"btn btn-danger\" title=\"{{_t('update_to_latest')}}\" ng-click=\"updateModule(dataHolder.onlineModules.ids[v.moduleName], _t('app_update_confirm'))\" ng-if=\"dataHolder.onlineModules.ids[v.moduleName] && dataHolder.onlineModules.ids[v.moduleName].status == 'upgrade'\"><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('update_to_latest')}}</span></button></div></div></div></div></div></div></div></div><h1 style=\"margin: 30px 0px 10px 10px\">{{dataHolder.modules.categories[dataHolder.modules.filter.category].name|cutText:true:30}}</h1><h1 style=\"margin: 30px 0px 10px 10px\" ng-if=_.isEmpty(dataHolder.modules.filter)>{{_t('all_apps')}}</h1><span style=\"display:block; width:100%; height: 4px; float: left; background-color: #80ad80\"></span><div class=\"app-row app-row-widget clearfix\"><div class=\"widget-entry widget-entry-app\" id=local_module_{{v.id}} ng-if=!v.featured ng-repeat=\"v in dataHolder.modules.all|orderBy:cfg.orderby.appslocal[dataHolder.modules.orderBy] | filter:q  track by v.id\" ng-class=\"{'widget-danger': dataHolder.onlineModules.ids[v.id] && dataHolder.onlineModules.ids[v.id].version != v.version}\"><div class=widget-entry-in><div class=widget-img><a href=#apps/local/{{v.id}} title={{v.toolTipDescription}}><img class=widget-preview-img ng-src=\"{{moduleMediaUrl + v.moduleName + '/' + v.icon}}\" ng-if=v.icon alt=\"{{v.defaults.title}}\"> <img class=widget-preview-img ng-src=storage/img/placeholder-img.png ng-if=!v.icon alt=\"{{v.defaults.title}}\"></a></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3><a href=#apps/local/{{v.id}} title={{v.defaults.title}} ng-bind=v.defaults.title|cutText:true:25></a> <span class=btn-name>&raquo;</span></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\"><span ng-if=v.hasInstance><i class=\"fa fa-fire text-success\"></i> ({{v.hasInstance}})</span></div><div class=\"widget-ctrl ctrl-right clearfix\"><div class=btn-group><a ng-href=#module/post/{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_add_app')}}\"><i class=\"fa fa-plus text-success\"></i> <span class=btn-name ng-bind=\"_t('lb_add_app')\"></span></a> <button class=\"btn btn-default\" title=\"{{_t('lb_remove')}}\" ng-click=\"deleteModule({'id': v.id}, _t('app_delete_confirm'),'#local_module_' + v.id)\" ng-if=\"v.custom && !v.hasReset\"><i class=\"fa fa-remove text-danger\"></i> <span class=btn-name ng-bind=\"_t('lb_remove')\"></span></button> <button class=\"btn btn-default\" title=\"{{_t('reset')}}\" ng-click=\"resetModule({'id': v.id}, _t('app_reset_confirm'),'#local_module_' + v.id)\" ng-if=\"v.custom && v.hasReset\"><i class=\"fa fa-remove fa-refresh text-warning\"></i> <span class=btn-name ng-bind=\"_t('reset')\"></span></button> <button href=\"\" class=\"btn btn-danger\" title=\"{{_t('update_to_latest')}}\" ng-click=\"updateModule(dataHolder.onlineModules.ids[v.moduleName], _t('app_update_confirm'))\" ng-if=\"dataHolder.onlineModules.ids[v.moduleName] && dataHolder.onlineModules.ids[v.moduleName].status == 'upgrade'\"><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('update_to_latest')}}</span></button></div></div></div></div></div></div></div><div class=text-right ng-if=\"dataHolder.modules.filter.featured == true\"><button class=\"btn btn-default\" ng-click=setFilter()><i class=\"fa fa-search-plus text-success\"></i> {{_t('show_more_apps')}}</button></div></div></div>"
  );


  $templateCache.put('app/views/apps/apps_local_id.html',
    "<div ng-controller=AppLocalDetailController><bb-loader></bb-loader><div class=\"form form-inline form-page\" ng-if=!_.isEmpty(module)><div class=\"fieldset clearfix\"><div class=app-detail-img><img class=app-image-detail ng-src=\"{{moduleMediaUrl + module.moduleName + '/' + module.icon}}\" ng-if=module.icon alt=\"{{module.defaults.title}}\"> <img class=app-image-detail ng-src=storage/img/placeholder-img.png ng-if=!module.icon alt=\"{{module.defaults.title}}\"></div><div class=app-detail-body><h2 ng-bind=module.defaults.title></h2><p class=app-detail-perex ng-bind-html=\"module.defaults.description | toTrusted\"></p><p class=app-detail-list ng-show=module.category><i class=\"fa fa-list\"></i> <span ng-bind=categoryName></span></p><p class=app-detail-list ng-show=module.author><i class=\"fa fa-user\"></i> <span ng-show=!module.homepage ng-bind=module.author></span> <a ng-href={{module.homepage}} ng-show=module.homepage ng-bind=module.author></a></p><p class=app-detail-list ng-show=module.version><i class=\"fa fa-info-circle\"></i> <span class=app-version ng-bind=module.version></span> <span class=label ng-class=\"module.maturity == 'stable' ? 'label-success' : 'label-warning'\">{{module.maturity}}</span></p><p class=app-detail-list ng-show=\"module.dependencies.length > 0\"><i class=\"fa fa-link\"></i> <strong>{{_t('dependent_modules')}}:</strong> <span ng-repeat=\"i in module.dependencies\">{{i}},</span></p></div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <a class=\"btn btn-submit\" href=#module/post/{{module.id}} title=\"{{_t('lb_add_app')}}\"><i class=\"fa fa-plus\"></i> <span class=btn-name>{{_t('lb_add_app')}}</span></a></div></div></div>"
  );


  $templateCache.put('app/views/apps/apps_online.html',
    "<div ng-controller=AppBaseController><bb-loader></bb-loader><div ng-controller=AppOnlineController id=apps_online><div ng-include=\"'app/views/apps/navi.html'\"></div><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-2\"><button class=\"btn btn-default\" ng-click=\"expandNavi('appsCategories', $event)\" ng-class=\"!_.isEmpty(dataHolder.onlineModules.filter) ? 'active':'' \"><i class=\"fa fa-filter\"></i> <span class=btn-name ng-if=dataHolder.onlineModules.filter.category>{{dataHolder.modules.categories[dataHolder.onlineModules.filter.category].name|cutText:true:30}}</span> <span class=btn-name ng-if=dataHolder.onlineModules.filter.featured>{{_t('featured_apps')}}</span> <span class=btn-name ng-if=_.isEmpty(dataHolder.onlineModules.filter)>{{_t('all_apps')}}</span> <span class=\"btn-name item-cnt\">({{dataHolder.onlineModules.cnt.collection}})</span></button> <button class=\"btn btn-default\" ng-click=\"expandNavi('appsOnlineOrderBy', $event)\"><i class=\"fa fa-sort-alpha-asc\"></i> <span class=btn-name>{{_t(dataHolder.onlineModules.orderBy) | cutText:true:15}}</span></button></div><div class=input-group><input ng-model=q class=\"form-control form-search\" value={{q}}> <span class=input-group-addon><i class=\"fa fa-search\"></i></span></div></div><div class=page-navi ng-if=naviExpanded.appsCategories><div class=page-navi-in><ul><li class=page-cat-0 ng-class=\"_.isEmpty(dataHolder.onlineModules.filter) == true ? 'active': ''\"><a href=\"\" ng-click=setFilter()><i class=\"fa fa-check-circle-o\"></i> {{_t('all_apps')}} <span class=\"btn-name item-cnt\">({{dataHolder.onlineModules.cnt.apps}})</span> <span class=page-navi-icon><i class=\"fa fa-chevron-right\"></i></span></a></li><li class=page-cat-{{v.id}} ng-repeat=\"v in dataHolder.modules.categories\" ng-if=dataHolder.onlineModules.cnt.appsCat[v.id] ng-class=\"dataHolder.onlineModules.filter.category == v.id ? 'active': ''\"><a href=\"\" ng-click=\"setFilter({category: v.id})\" ng-switch=v.id><i class=\"fa {{v.id|getAppCategoryIcon}}\"></i> {{v.name|cutText:true:30}} <span class=item-cnt>({{dataHolder.onlineModules.cnt.appsCat[v.id]}})</span> <span class=page-navi-icon><i class=\"fa fa-chevron-right\"></i></span></a></li></ul><div class=page-navi-content><a class=\"btn btn-default btn-tag\" ng-click=\"hideInstalled((dataHolder.onlineModules.hideInstalled ? false:true))\" ng-class=\"dataHolder.onlineModules.hideInstalled ? 'active': ''\"><i class=\"fa fa-eye-slash\"></i> {{_t('hide_installed_apps')}}</a></div></div></div><div class=page-navi ng-if=naviExpanded.appsOnlineOrderBy><div class=page-navi-in><div class=page-navi-content><p class=page-navi-title>{{_t('sortby')}}</p><a class=\"btn btn-default btn-tag\" href=\"\" ng-repeat=\"(k,v) in cfg.orderby.appsonline\" ng-click=setOrderBy(k) ng-class=\"dataHolder.onlineModules.orderBy == k ? 'active': ''\">{{_t(k) | cutText:true:30}}</a></div></div></div><div ng-if=\"dataHolder.onlineModules.cnt.appsCatFeatured[dataHolder.onlineModules.filter.category] > 0\"><h1 style=\"margin: 0px 0px 10px 10px\">{{_t('featured_apps')}}</h1><span style=\"display:block; width:100%; height: 4px; float: left; background-color: #80ad80\"></span><div class=\"app-row app-row-widget clearfix\"><div class=\"widget-entry widget-entry-app\" ng-class=\"{'widget-warning': dataHolder.modules.ids[v.modulename],'widget-danger': dataHolder.modules.ids[v.modulename] && dataHolder.modules.ids[v.modulename].version != v.version}\" ng-repeat=\"v in dataHolder.onlineModules.all| orderBy: cfg.orderby.appsonline[dataHolder.onlineModules.orderBy] | filter:q track by v.id\" ng-if=v.featured ng-hide=\"v.status !== 'download' && dataHolder.onlineModules.hideInstalled\"><div class=widget-entry-in><div class=widget-img><a ng-href=#apps/online/{{v.id}}><img class=widget-preview-img alt={{v.title}} title={{v.toolTipDescription}} ng-src=\"{{v.icon ? onlineMediaUrl + v.icon : 'storage/img/placeholder-img.png'}}\" ng-click=\"redirectToRoute(dataHolder.modules.ids[v.modulename] ? false : 'apps/online/' + v.id)\"></a></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3><a ng-href=#apps/online/{{v.id}} title={{v.title}}>{{v.title|cutText:true:25}} <span class=btn-name>&raquo;</span></a></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\"><div class=rating-group><i class=\"fa widget-rating\" title={{r}} ng-class=\"r > v.rating ? 'fa-star-o' : 'fa-star israted'\" ng-repeat=\"r in dataHolder.onlineModules.ratingRange\"></i> <span class=widget-rating>| <i class=\"fa fa-download\"></i> {{v.installed}}&times;</span></div></div><div class=\"widget-ctrl ctrl-right\"><div class=\"btn-group group-apps\"><button href=\"\" class=\"btn btn-default\" title=\"{{_t('lb_download')}}\" ng-click=\"installModule(v, 'online_install')\" ng-if=!dataHolder.modules.ids[v.modulename]><i class=\"fa fa-download text-success\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-disabled\" disabled title=\"{{_t('installed')}}\" ng-if=\"dataHolder.modules.ids[v.modulename] && dataHolder.modules.ids[v.modulename].version == v.version\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('installed')}}</span></button> <button href=\"\" class=\"btn btn-danger\" title=\"{{_t('update_to_latest')}}\" ng-click=\"updateModule(v, _t('app_update_confirm'))\" ng-if=\"dataHolder.modules.ids[v.modulename] && v.status == 'upgrade' \"><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('update_to_latest')}}</span></button></div></div></div></div></div></div></div></div><h1 style=\"margin: 30px 0px 10px 10px\">{{dataHolder.modules.categories[dataHolder.onlineModules.filter.category].name|cutText:true:30}}</h1><h1 style=\"margin: 30px 0px 10px 10px\" ng-if=_.isEmpty(dataHolder.onlineModules.filter)>{{_t('all_apps')}}</h1><span style=\"display:block; width:100%; height: 4px; float: left; background-color: #80ad80\"></span><div class=\"app-row app-row-widget clearfix\"><div class=\"widget-entry widget-entry-app\" ng-class=\"{'widget-warning': dataHolder.modules.ids[v.modulename],'widget-danger': dataHolder.modules.ids[v.modulename] && dataHolder.modules.ids[v.modulename].version != v.version}\" ng-if=!v.featured ng-repeat=\"v in dataHolder.onlineModules.all| orderBy: cfg.orderby.appsonline[dataHolder.onlineModules.orderBy] | filter:q track by v.id\" ng-hide=\"v.status !== 'download' && dataHolder.onlineModules.hideInstalled\"><div class=widget-entry-in><div class=widget-img><a ng-href=#apps/online/{{v.id}}><img class=widget-preview-img alt={{v.title}} title={{v.toolTipDescription}} ng-src=\"{{v.icon ? onlineMediaUrl + v.icon : 'storage/img/placeholder-img.png'}}\" ng-click=\"redirectToRoute(dataHolder.modules.ids[v.modulename] ? false : 'apps/online/' + v.id)\"></a></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3><a ng-href=#apps/online/{{v.id}} title={{v.title}}>{{v.title|cutText:true:25}} <span class=btn-name>&raquo;</span></a></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\"><div class=rating-group><i class=\"fa widget-rating\" title={{r}} ng-class=\"r > v.rating ? 'fa-star-o' : 'fa-star israted'\" ng-repeat=\"r in dataHolder.onlineModules.ratingRange\"></i> <span class=widget-rating>| <i class=\"fa fa-download\"></i> {{v.installed}}&times;</span></div></div><div class=\"widget-ctrl ctrl-right\"><div class=\"btn-group group-apps\"><button href=\"\" class=\"btn btn-default\" title=\"{{_t('lb_download')}}\" ng-click=\"installModule(v, 'online_install')\" ng-if=!dataHolder.modules.ids[v.modulename]><i class=\"fa fa-download text-success\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-disabled\" disabled title=\"{{_t('installed')}}\" ng-if=\"dataHolder.modules.ids[v.modulename] && dataHolder.modules.ids[v.modulename].version == v.version\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('installed')}}</span></button> <button href=\"\" class=\"btn btn-danger\" title=\"{{_t('update_to_latest')}}\" ng-click=\"updateModule(v, _t('app_update_confirm'))\" ng-if=\"dataHolder.modules.ids[v.modulename] && v.status == 'upgrade' \"><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('update_to_latest')}}</span></button></div></div></div></div></div></div></div><div class=text-right ng-if=\"dataHolder.onlineModules.filter.featured == true\"><button class=\"btn btn-default\" ng-click=setFilter()><i class=\"fa fa-search-plus text-success\"></i> {{_t('show_more_apps')}}</button></div></div></div>"
  );


  $templateCache.put('app/views/apps/apps_online_id.html',
    "<div ng-controller=AppOnlineDetailController><bb-loader></bb-loader><div ng-if=!_.isEmpty(module)><div class=accordion-entry ng-include=\"'app/views/apps/apps_online_id_info.html'\"></div><div class=accordion-entry ng-if=module.patchnotes ng-include=\"'app/views/apps/apps_online_id_patches.html'\"></div><div class=accordion-entry ng-include=\"'app/views/apps/apps_online_id_comments.html'\"></div></div></div>"
  );


  $templateCache.put('app/views/apps/apps_online_id_comments.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('appcomments')\"><i class=\"fa fa-comments\"></i> {{_t('comments')}} ({{comments.all.length}}) <i class=\"fa accordion-arrow\" ng-class=\"expand.appcomments ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.appcomments><p class=\"text-right clickable\"><button type=button class=\"btn btn-default\" title=\"{{_t('add_comment')}}\" ng-click=\"expandElement('appcommentadd')\"><i class=\"fa fa-plus text-success\"></i> <span class=btn-name>{{_t('add_comment')}}</span></button></p><form name=form_comment id=form_profile class=\"form form-page\" ng-if=expand.appcommentadd ng-submit=\"addComment(form_comment, comments.model)\" novalidate><fieldset><div class=form-group_><textarea name=content id=content class=\"form-control report-content\" ng-blur=\"contentBlur = true\" ng-model=comments.model.content ng-required=true></textarea><bb-validator input-name=form_comment.content.$error.required trans=_t(&quot;field_required&quot;) has-blur=contentBlur></bb-validator></div><div class=\"form-group form-inline\"><label>{{_t('lb_name')}}:</label><input name=name id=name class=form-control value={{comments.model.name}} ng-blur=\"nameBlur = true\" ng-model=comments.model.name ng-required=\"true\"><bb-validator input-name=form_comment.name.$error.required trans=_t(&quot;field_required&quot;) has-blur=nameBlur></bb-validator></div></fieldset><fieldset class=submit-entry><button type=button class=\"btn btn-default\" ng-click=\"expandElement('appcommentadd')\"><i class=\"fa fa-times text-danger\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit class=\"btn btn-submit\" ng-disabled=form_comment.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_submit')}}</span></button></fieldset></form><div class=\"form form-inline form-page\" ng-if=!expand.appcommentadd><div class=fieldset><bb-help-text trans=\"_t('no_comments')\" ng-if=!comments.show></bb-help-text><div class=\"comment-entry comment-type-{{v.type}}\" ng-repeat=\"v in comments.all track by v.id\" ng-class-odd=\"'odd'\" ng-class-even=\"'even'\"><div class=comment-header><i class=\"fa fa-clock-o\"></i> {{v.created_at}} | <i class=fa ng-class=\"v.type == 1 ? 'fa-user-plus text-success' : 'fa-user'\"></i> {{v.name}}</div><div class=comment-body>{{v.content}}</div></div></div></div></div>"
  );


  $templateCache.put('app/views/apps/apps_online_id_info.html',
    "<div class=\"form form-inline form-page\" ng-if=module><div class=\"fieldset clearfix\"><div class=app-detail-img><img class=app-image-detail ng-src=\"{{onlineMediaUrl + module.icon}}\" ng-if=module.icon alt=\"{{module.title}}\"> <img class=app-image-detail ng-src=storage/img/placeholder-img.png ng-if=!module.icon alt=\"{{module.title}}\"></div><div class=app-detail-body><h2 ng-bind=module.title></h2><p class=app-detail-perex ng-bind-html=module.description|toTrusted></p><p class=app-detail-list ng-show=module.category><i class=\"fa fa-list\"></i> <span ng-bind=categoryName></span></p><p class=app-detail-list ng-show=module.author><i class=\"fa fa-user\"></i> <span ng-show=!module.homepage ng-bind=module.author></span> <a ng-href={{module.homepage}} ng-show=module.homepage ng-bind=module.author></a></p><p class=app-detail-list ng-show=module.version><i class=\"fa fa-info-circle\"></i> <span class=app-version ng-bind=module.version></span> <span class=label ng-class=\"module.maturity == 'stable' ? 'label-success' : 'label-warning'\">{{module.maturity}}</span></p><p class=app-detail-list ng-show=module.installed><i class=\"fa fa-download\"></i> {{module.installed}}x</p><p class=app-detail-list ng-show=module.last_updated><i class=\"fa fa-clock-o\"></i> <span ng-bind=module.last_updated></span></p><div class=app-detail-list ng-if=rating.model.remote_id><p><strong>{{_t('rate_app')}}:</strong> <i class=\"fa clickable module-rating\" title={{v}} ng-class=\"v > module.rating ? 'fa-star-o' : 'fa-star israted'\" ng-repeat=\"v in rating.range\" ng-click=rateModule(v)></i></p><p>{{_t('app_was_rated')}}: <strong>{{module.ratingscnt}}</strong>&times;</p><p>{{_t('app_average_scored')}}: <strong>{{module.rating}}</strong></p></div></div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button class=\"btn btn-submit\" title=\"{{_t('lb_download')}}\" ng-click=installModule(module) ng-if=!local.installed><i class=\"fa fa-download\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-default\" title=\"{{_t('installed')}}\" disabled ng-if=local.installed><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('installed')}}</span></button> <a href=#module/post/{{module.modulename}} title=\"{{_t('lb_add_app')}}\" class=\"btn btn-default\" ng-if=local.installed><i class=\"fa fa-plus text-success\"></i> <span class=btn-name ng-bind=\"_t('lb_add_app')\"></span></a></div></div>"
  );


  $templateCache.put('app/views/apps/apps_online_id_patches.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('apppatches')\"><i class=\"fa fa-sticky-note-o\"></i> {{_t('patches')}} <i class=\"fa accordion-arrow\" ng-class=\"expand.apppatches ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.apppatches><div class=\"form form-inline form-page\"><div class=fieldset ng-bind-html=module.patchnotes|toTrusted></div></div></div>"
  );


  $templateCache.put('app/views/apps/navi.html',
    "<div class=\"tabs-wrap form-inline\"><div class=\"btn-group btn-goup-tabs btn-tabs-3\"><a class=\"btn btn-default\" title=\"{{_t('lb_local_modules')}}\" href=#apps/local ng-class=\"routeMatch('/apps/local') ? 'active' : ''\"><i class=\"fa fa-cloud-download\"></i> <span class=btn-name>{{_t('lb_local_modules')}}</span></a> <a class=\"btn btn-default\" title=\"{{_t('lb_online_modules')}}\" href=#apps/online ng-class=\"routeMatch('/apps/online') ? 'active' : ''\"><i class=\"fa fa-globe\"></i> <span class=btn-name>{{_t('lb_online_modules')}}</span></a> <a class=\"btn btn-default\" title=\"{{_t('lb_active')}}\" href=#apps/instance ng-class=\"routeMatch('/apps/instance') ? 'active' : ''\"><i class=\"fa fa-fire\"></i> <span class=btn-name>{{_t('lb_active')}}</span></a></div></div>"
  );


  $templateCache.put('app/views/auth/auth.html',
    "<div ng-controller=AuthController><div ng-if=!auth.firstaccess ng-include=\"'app/views/auth/auth_login.html'\"></div><div ng-if=auth.firstaccess ng-include=\"'app/views/auth/auth_password.html'\"></div></div>"
  );


  $templateCache.put('app/views/auth/auth_header.html',
    "<div class=login-lang ng-if=!auth.fromexpert><div class=btn-group ng-if_=!auth.firstaccess><button type=button class=\"btn btn-default\" title=\"{{_t('lb_language')}}\" ng-click=\"expandNavi('loginLang', $event)\"><i class=\"fa fa-globe\"></i></button><div class=\"app-dropdown dropdown-lang\" ng-if=naviExpanded.loginLang><ul><li class=clickable ng-repeat=\"v in cfg.lang_list\" ng-click=setLoginLang(v)><img class=lang-img ng-src=app/img/flags/{{v}}.png alt=\"{{v}}\"></li></ul></div></div></div><div class=welcome-screen><h1>{{_t('welcome_1')}} {{auth.remoteId}}</h1></div>"
  );


  $templateCache.put('app/views/auth/auth_login.html',
    "<div ng-controller=AuthLoginController><bb-loader></bb-loader><div ng-include=\"'app/views/auth/auth_header.html'\"></div><form name=form_login id=form_login class=\"form form-page\" ng-submit=login(input) novalidate><fieldset><h3><span ng-bind=\"_t('nav_login')\"></span></h3><div class=form-group><input name=login id=login class=form-control placeholder=\"{{_t('lb_login')}}\" value={{input.login}} ng-model=\"input.login\"></div><div class=form-group><input name=password id=password type=password class=form-control placeholder=\"{{_t('lb_password')}}\" ng-model=\"input.password\"></div><div class=form-group><input type=checkbox name=rememberme value=true id=rememberme ng-model=input.rememberme ng-checked=\"input.remember\"><label ng-bind=\"_t('remember_me')\"></label></div><a href=#passwordforgot><i class=\"fa fa-question-circle text-primary\"></i> {{_t('password_forgot')}}</a></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_enter')}}\"><i class=\"fa fa-sign-in\"></i> {{_t('lb_enter')}}</button></fieldset></form></div>"
  );


  $templateCache.put('app/views/auth/auth_password.html',
    "<div ng-controller=AuthPasswordController><bb-loader></bb-loader><div ng-include=\"'app/views/auth/auth_header.html'\"></div><div class=\"alert alert-warning\"><i class=\"fa fa-exclamation-circle\"></i> {{_t('password_info')}}</div><form name=form_password id=form_password class=\"form form-page\" ng-submit=\"changePassword(form_password, input,handleTimezone.instance)\" novalidate><fieldset><p class=form-control-static><span ng-bind=\"_t('lb_login')\"></span>: <strong ng-bind=cfg.default_credentials.login></strong></p></fieldset><fieldset><label class=isrequired>{{_t('lb_new_password')}}:</label><input name=password id=password type=password class=form-control ng-model=input.password ng-blur=\"passwordBlur = true\" ng-required=true ng-minlength=\"6\"><bb-validator input-name=form_password.password.$error.required trans=_t(&quot;field_required&quot;) has-blur=passwordBlur></bb-validator><bb-validator input-name=form_password.password.$error.minlength trans=_t(&quot;password_valid&quot;) has-blur=passwordBlur></bb-validator></fieldset><fieldset><label class=isrequired>{{_t('confirm_password')}}:</label><input name=password_confirm id=password_confirm type=password class=form-control ng-blur=\"passwordConfirmBlur = true\" ng-model=input.passwordConfirm bb-compare-to=\"password\"><bb-validator input-name=form_password.password_confirm.$error.compareto trans=_t(&quot;passwords_must_match&quot;) has-blur=passwordConfirmBlur></bb-validator></fieldset><fieldset><div class=form-group><label>{{_t('lb_email')}}:</label><input name=email id=email type=email class=form-control ng-model=input.email ng-blur=\"emailBlur = true\"><bb-validator input-name=form_password.email.$error.required trans=_t(&quot;field_required&quot;) has-blur=emailBlur></bb-validator><bb-validator input-name=form_password.email.$error.email trans=_t(&quot;email_invalid&quot;) has-blur=emailBlur></bb-validator></div><bb-help-text trans=\"_t('password_email_info')\"></bb-help-text></fieldset><fieldset ng-if=\"cfg.app_type === 'jb' && handleTimezone.show\"><div class=form-group><label>{{_t('timezone_select')}}</label><select class=form-control ng-model=handleTimezone.instance.params.timezone><option value={{v}} ng-repeat=\"v in managementTimezone.enums track by $index\" ng-selected=\"v === handleTimezone.instance.params.timezone\">{{managementTimezone.labels[$index]}}</option></select><bb-help-text trans=\"_t('timezone_info')\"></bb-help-text></div><div class=form-group><div><input type=checkbox name=wan_port_access id=wan_port_access value=true ng-model=handleTimezone.instance.params.wan_port_access ng-checked=\"handleTimezone.instance.params.wan_port_access\"><label ng-bind=\"_t('local_access_activate')\"></label><bb-help-text trans=\"_t('timezone_info')\"></bb-help-text></div></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_enter')}}\" ng-disabled=form_password.$invalid><i class=\"fa fa-check\"></i> <span ng-bind=\"_t('lb_submit')\"></span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/auth/password_forgot.html',
    "<div ng-controller=PasswordForgotController class=mobile-padding><bb-loader></bb-loader><bb-alert alert=passwordForgot.alert></bb-alert><form name=form_password id=form_password class=\"form form-page\" ng-submit=\"sendEmail(form_password, passwordForgot)\" novalidate ng-hide=\"passwordForgot.alert.status == 'alert-success'\"><fieldset><h3>{{_t('password_forgot_info')}}</h3><div class=form-group><label class=isrequired>{{_t('lb_email')}}:</label><input name=email id=email type=email class=form-control ng-model=passwordForgot.input.email ng-blur=\"emailBlur = true\" ng-required=\"true\"><bb-validator input-name=form_password.email.$error.required trans=_t(&quot;field_required&quot;) has-blur=emailBlur></bb-validator><bb-validator input-name=form_password.email.$error.email trans=_t(&quot;email_invalid&quot;) has-blur=emailBlur></bb-validator></div><bb-help-text trans=\"_t('works_with_internet')\"></bb-help-text></fieldset><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_submit')}}\" ng-disabled=form_password.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name ng-bind=\"_t('lb_submit')\"></span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/auth/password_reset.html',
    "<div ng-controller=PasswordResetController class=mobile-padding><bb-loader></bb-loader><bb-alert alert=passwordReset.alert></bb-alert><form name=form_password id=form_password class=\"form form-page\" ng-submit=changePassword(form_password) novalidate ng-if=\"passwordReset.input.userId !== null\"><fieldset><h3><i class=\"fa fa-chevron-down\"></i> {{_t('password_reset')}}</h3><div class=form-group><label class=isrequired>{{_t('lb_new_password')}}:</label><input name=password id=password type=password class=form-control ng-model=passwordReset.input.password ng-blur=\"passwordBlur = true\" ng-required=true ng-minlength=\"6\"><bb-validator input-name=form_password.password.$error.required trans=_t(&quot;field_required&quot;) has-blur=passwordBlur></bb-validator><bb-validator input-name=form_password.password.$error.minlength trans=_t(&quot;password_valid&quot;) has-blur=passwordBlur></bb-validator></div><div class=form-group><label class=isrequired>{{_t('confirm_password')}}:</label><input name=password_confirm id=password_confirm type=password class=form-control ng-blur=\"passwordConfirmBlur = true\" ng-model=passwordReset.input.passwordConfirm bb-compare-to=\"password\"><bb-validator input-name=form_password.password_confirm.$error.compareto trans=_t(&quot;passwords_must_match&quot;) has-blur=passwordConfirmBlur></bb-validator></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_submit')}}\" ng-disabled=form_password.$invalid><i class=\"fa fa-check\"></i> <span ng-bind=\"_t('lb_submit')\"></span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/camera/camera_add.html',
    "<div ng-controller=CameraAddController><div ng-show=ipcameraDevices><div class=\"app-row app-row-report app-row-cameraadd clearfix\"><div id=row_camera_{{v.id}} class=report-entry ng-repeat=\"v in ipcameraDevices | orderBy:'defaults.title' track by v.moduleName\"><div class=\"report-col report-media\"><img class=product-img ng-src=\"{{moduleMediaUrl + v.moduleName + '/' + v.icon}}\" ng-if=v.icon alt=\"img\"> <img class=product-img ng-src=storage/img/icons/camera.png ng-if=!v.icon alt=\"img\"></div><div class=\"report-col report-body\">{{v.defaults.title}}</div><div class=\"report-col report-ctrl\"><a href=#module/post/{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_include_device')}}\"><i class=\"fa fa-plug text-primary\"></i></a></div></div></div></div><div class=device-logo ng-include=\"'app/views/camera/camera_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/camera/camera_manage.html',
    "<div ng-controller=CameraManageController><div class=\"app-row app-row-report app-row-event clearfix\"><div class=\"report-entry bcg-active\" id=instance_{{$index}} ng-repeat=\"v in instances |orderBy:'title' track by v.id\" ng-class=\"v.active ? 'true': 'false'\"><div class=\"report-col report-media\"><img class=product-img ng-src=\"{{modules.mediaUrl + v.moduleId + '/' + modules.imgs[v.moduleId]}}\" ng-if=modules.imgs[v.moduleId] alt=\"img\"> <img class=product-img ng-src=storage/img/placeholder-img.png ng-if=!modules.imgs[v.moduleId] alt=\"img\"></div><div class=\"report-col report-body\"><a href=#module/put/{{v.id}}><span ng-bind=v.title></span></a></div><div class=\"report-col report-ctrl report-ctrl-3\"><div class=btn-group><a href=#module/put/{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_settings')}}\"><i class=\"fa fa-cog\"></i></a> <button title=\"{{_t('lb_deactivate')}}\" class=\"btn btn-default\" href=\"\" ng-if=v.active ng-class=\"v.active ? 'active' : ''\" ng-click=\"activateInstance(v, false)\"><i class=\"fa fa-fire text-success\"></i></button> <button title=\"{{_t('lb_activate')}}\" class=\"btn btn-default\" ng-if=!v.active ng-click=\"activateInstance(v, true)\"><i class=\"fa fa-power-off text-danger\"></i></button> <button title=\"{{_t('lb_remove')}}\" class=\"btn btn-default\" ng-click=\"deleteInstance('#instance_' + $index, {'id': v.id}, _t('lb_delete_confirm'))\"><i class=\"fa fa-remove text-danger\"></i></button></div></div></div></div><div class=device-logo ng-include=\"'app/views/camera/camera_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/camera/camera_nav.html',
    " <a href=#devices><img class=apps-image ng-src=app/img/logo-camera.png alt=\"Logo\"></a>"
  );


  $templateCache.put('app/views/customize/icons.html',
    "<div ng-controller=SkinBaseController><div ng-controller=SkinOnlineController id=skins_online><bb-loader></bb-loader><div ng-include=\"'app/views/customize/navi.html'\"></div><div ng-if=skins.online.show><div class=\"app-row app-row-widget app-row-skins clearfix\"><div class=\"widget-entry widget-entry-skin\" id=local_skin_{{v.id}} ng-class=\"{'widget-warning': skins.local.all[v.name],'widget-danger': skins.local.all[v.name] && skins.local.all[v.name].version != v.version}\" ng-repeat=\"v in skins.online.all track by v.id\"><div class=widget-entry-in><div class=widget-img><img class=\"skin-preview-img clickable\" ng-src={{v.icon}} alt={{v.title}} ng-click=\"skins.online.find = v;handleModal('skinOnlineModal', $event)\"></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3 class=clickable ng-click=\"skins.online.find = v;handleModal('skinOnlineModal', $event)\">{{v.title|cutText:true:20}} <span class=btn-name>&raquo;</span></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right clearfix\"><div class=btn-group><button class=\"btn btn-default\" title=\"{{_t('lb_download')}}\" ng-if=\"v.status === 'download'\" ng-click=downloadSkin(v)><i class=\"fa fa-download text-success\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-danger\" title=\"{{_t('upgrade')}}\" ng-if=\"v.status === 'notequal'\" ng-click=upgradeSkin(v)><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('upgrade')}}</span></button> <button class=\"btn btn-disabled\" title=\"{{_t('installed')}}\" disabled ng-if=\"v.status === 'equal'\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('installed')}}</span></button></div></div></div></div></div></div></div></div><div id=skinOnlineModal class=appmodal ng-if=modalArr.skinOnlineModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('skinOnlineModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{skins.online.find.title}}</h3></div><div class=appmodal-body><div class=skin-detail-img><img class=skin-image-detail ng-src={{skins.online.find.icon}} alt=\"{{skins.online.find.title}}\"></div><p class=skin-detail-perex>{{skins.online.find.description}}</p><p class=skin-detail-list ng-if=skins.online.find.author><i class=\"fa fa-user\"></i> <span ng-if=!skins.online.find.homepage>{{skins.online.find.author}}</span> <a ng-href={{skins.online.find.homepage}} ng-if=skins.online.find.homepage>{{skins.online.find.author}}</a></p><p class=skin-detail-list><i class=\"fa fa-info-circle\"></i> {{skins.online.find.version}}</p></div></div></div></div></div>"
  );


  $templateCache.put('app/views/customize/icons_local.html',
    "<div ng-controller=LocalIconController><bb-loader></bb-loader><div ng-include=\"'app/views/customize/navi.html'\"></div><div ng-if=icons.show><div class=\"form form-inline form-page clearfix\"><div class=\"fieldset block-50\"><input class=inputfile type=file name=file id=file{{v.id}} ng-click=\"icons.find = v\" onchange=\"angular.element(this).scope().checkUploadedFile(this.files, angular.element(this).scope().cfg.upload.icon)\"><label for=file{{v.id}} class=\"btn btn-success\" title=\"{{_t('lb_upload_image')}}\" ng-click=\"icons.find = v\"><i class=\"fa fa-upload\"></i> {{_t('upload_single_icon')}}</label><bb-help-text trans=\"_t('upload_file_info',{'__size__':icons.info.maxSize,'__extensions__': icons.info.extensions})\"></bb-help-text><bb-help-text trans=\"_t('image_recommended_dimension',{'__dimension__':cfg.upload.icon.dimension})\"></bb-help-text></div><div class=\"fieldset block-50\"><input class=inputfile type=file name=file_packed id=file_packed{{v.id}} ng-click=\"icons.find = v\" onchange=\"angular.element(this).scope().checkUploadedFile(this.files, angular.element(this).scope().cfg.upload.icon_packed)\"><label for=file_packed{{v.id}} class=\"btn btn-primary\" title=\"{{_t('lb_upload_image')}}\" ng-click=\"icons.find = v\"><i class=\"fa fa-upload\"></i> {{_t('upload_packed_icon')}}</label><bb-help-text trans=\"_t('upload_file_info',{'__size__':icons.infoPacked.maxSize,'__extensions__': icons.infoPacked.extensions})\"></bb-help-text><bb-help-text trans=\"_t('image_recommended_dimension',{'__dimension__':cfg.upload.icon_packed.dimension})\"></bb-help-text></div></div><div ng-if=!_.isEmpty(icons.all)><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-1\"><button class=\"btn btn-default\" ng-click=\"expandNavi('iconsLocalFilter', $event)\" ng-class=\"icons.filter.source ? 'active' : ''\"><i class=\"fa fa-filter\"></i> <span ng-if=!icons.filter.source>{{_t('lb_show_all')}}</span> <span ng-if=icons.filter.source>{{icons.source.title[icons.filter.source]| cutText:true:30}}</span></button></div></div><div class=page-navi ng-if=naviExpanded.iconsLocalFilter><div class=page-navi-in><div class=page-navi-content><a class=\"btn btn-default btn-tag\" ng-click=setFilter() ng-class=\"!icons.filter.source ? 'active' : ''\">{{_t('lb_show_all')}}</a> <a class=\"btn btn-default btn-tag\" ng-repeat=\"(k,v) in icons.source.cnt\" ng-click=\"setFilter({source: k})\" ng-class=\"k === icons.filter.source ? 'active' : ''\">{{icons.source.title[k]|cutText:true:30}}<span class=item-cnt>({{v}})</span></a></div></div></div><div class=\"app-row clearfix app-row-imglist\"><div class=imglist-entry ng-repeat=\"v in icons.all| orderBy : '-timestamp' track by $index\"><div class=\"imglist-entry-in infowindow-wrap\"><img class=\"imglist-img clickable\" alt={{v.file}} title={{v.file}} ng-click=\"expandNavi('iconInfowindow_' + $index, $event)\" ng-src=\"{{cfg.img.custom_icons + v.file}}\"><div class=\"infowindow top\" ng-if=\"naviExpanded['iconInfowindow' + '_' + $index]\"><div class=\"infowindow-in text-center\"><img class=imglist-img-preview alt={{v.file}} title={{v.file}} ng-src=\"{{cfg.img.custom_icons + v.file}}\"><p>{{_t('lb_category')}}: {{v.source_title}}</p><div ng-if=icons.used.device[v.file]><strong>{{_t('used_in')}}</strong><div ng-repeat=\"d in icons.used.device[v.file]\"><a class=text-danger ng-href=#element/{{d}}>{{d|cutText:true:20}}</a></div></div><button title=\"{{_t('lb_remove')}}\" class=\"btn btn-default\" ng-hide_=icons.used.device[v.file] ng-click=\"deleteIcon(v, (icons.used.device[v.file] ? _t('remove_icon_confirm_device') :_t('remove_icon_confirm_device')))\"><i class=\"fa fa-remove text-danger\"></i> <span class=btn-name>{{_t('lb_remove')}}</span></button></div></div></div></div></div></div></div></div>"
  );


  $templateCache.put('app/views/customize/icons_online.html',
    "<div ng-controller=OnlineIconController><bb-loader></bb-loader><div ng-include=\"'app/views/customize/navi.html'\"></div><div class=\"app-row app-row-widget app-row-customize clearfix\"><div class=\"widget-entry widget-entry-customize\" id=icon_online_{{v.id}} ng-repeat=\"v in iconsOnline.all track by v.id\"><div class=widget-entry-in><div class=widget-img><img class=\"customize-preview-img clickable\" ng-src={{v.icon_path}} alt={{v.title}} ng-click=\"handleOnlineIconModal(v,'iconOnlineModal', $event)\"></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3 class=clickable title={{v.title}} ng-click=\"handleOnlineIconModal(v,'iconOnlineModal', $event)\">{{v.title|cutText:true:25}} <span class=btn-name>&raquo;</span></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right clearfix\"><div class=btn-group><button class=\"btn btn-default\" title=\"{{_t('lb_download')}}\" ng-if=\"v.status === 'download'\" ng-click=downloadIconSet(v)><i class=\"fa fa-download text-success\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-disabled\" title=\"{{_t('installed')}}\" disabled ng-if=\"v.status === 'installed'\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('installed')}}</span></button></div></div></div></div></div></div></div><div id=iconOnlineModal class=appmodal ng-if=modalArr.iconOnlineModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('iconOnlineModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{iconsOnline.find.title|cutText:true:30}}</h3></div><div class=\"appmodal-body customize-detail\"><p class=customize-detail-title>{{iconsOnline.find.title}}</p><p class=customize-detail-list ng-if=iconsOnline.find.author><strong>{{_t('author')}}:</strong> <span ng-if=!iconsOnline.find.homepage>{{iconsOnline.find.author}}</span> <a ng-href={{iconsOnline.find.homepage}} ng-if=iconsOnline.find.homepage>{{iconsOnline.find.author}}</a></p><p class=customize-detail-list ng-if=iconsOnline.find.license><strong>{{_t('license')}}:</strong> {{iconsOnline.find.license}}</p><div class=customize-icon-list><img class=customize-icon-preview ng-src=\"{{iconsOnline.find.preview_path + v}}\" ng-repeat=\"v in iconsOnline.preview\"></div></div><div class=appmodal-footer><button type=button class=\"btn btn-default\" ng-click=\"handleModal('iconOnlineModal', $event)\"><i class=\"fa fa-times text-danger\"></i> <span class=btn-name>{{_t('lb_close')}}</span></button> <button href=\"\" class=\"btn btn-submit\" title=\"{{_t('lb_download')}}\" ng-if=\"v.status === 'download'\" ng-click=\"handleModal('iconOnlineModal', $event);downloadIconSet(iconsOnline.find)\"><i class=\"fa fa-download\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-disabled\" title=\"{{_t('installed')}}\" disabled ng-if=\"v.status === 'installed'\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('installed')}}</span></button></div></div></div></div>"
  );


  $templateCache.put('app/views/customize/navi.html',
    "<div class=\"tabs-wrap form-inline\"><div class=\"btn-group btn-goup-tabs btn-tabs-4\"><a class=\"btn btn-default\" title=\"{{_t('local_skins')}}\" href=#customize/skinslocal ng-class=\"routeMatch('/customize/skinslocal') ? 'active' : ''\"><i class=\"fa fa-cloud-download\"></i> <span class=btn-name>{{_t('local_skins')}}</span></a> <a class=\"btn btn-default\" title=\"{{_t('online_skins')}}\" href=#customize/skinsonline ng-class=\"routeMatch('/customize/skinsonline') ? 'active' : ''\" ng-if=elementAccess(cfg.role_access.admin)><i class=\"fa fa-globe\"></i> <span class=btn-name>{{_t('online_skins')}}</span></a> <a class=\"btn btn-default\" title=\"{{_t('local_icons')}}\" href=#customize/iconslocal ng-class=\"routeMatch('/customize/iconslocal') ? 'active' : ''\" ng-if=elementAccess(cfg.role_access.admin)><i class=\"fa fa-image\"></i> <span class=btn-name>{{_t('local_icons')}}</span></a> <a class=\"btn btn-default\" title=\"{{_t('online_icons')}}\" href=#customize/iconsonline ng-class=\"routeMatch('/customize/iconsonline') ? 'active' : ''\" ng-if=elementAccess(cfg.role_access.admin)><i class=\"fa fa-archive\"></i> <span class=btn-name>{{_t('online_icons')}}</span></a></div></div>"
  );


  $templateCache.put('app/views/customize/skins_local.html',
    "<div ng-controller=SkinBaseController><div ng-controller=SkinLocalController id=skins_local><bb-loader></bb-loader><div ng-include=\"'app/views/customize/navi.html'\"></div><div ng-if=skins.local.show><div class=\"app-row app-row-widget app-row-customize clearfix\"><div class=\"widget-entry widget-entry-customize\" id=local_skin_{{v.id}} ng-class=\"{'widget-warning': v.name === skins.local.active}\" ng-repeat=\"v in skins.local.all track by v.name\"><div class=widget-entry-in><div class=widget-img><img class=\"customize-preview-img clickable\" ng-src={{v.icon}} alt={{v.title}} ng-click=\"skins.local.find = v;handleModal('skinLocalModal', $event)\"></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3 class=clickable title={{v.title}} ng-click=\"skins.local.find = v;handleModal('skinLocalModal', $event)\">{{v.title|cutText:true:25}} <span class=btn-name>&raquo;</span></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right clearfix\"><div class=btn-group><button href=\"\" class=\"btn btn-default\" title=\"{{_t('lb_activate')}}\" ng-if=\"v.name !== skins.local.active\" ng-click=activateSkin(v)><i class=\"fa fa-fire text-success\"></i> <span class=btn-name>{{_t('lb_activate')}}</span></button> <button class=\"btn btn-disabled\" title=\"{{_t('lb_active')}}\" disabled ng-if=\"v.name === skins.local.active\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_active')}}</span></button> <button class=\"btn btn-danger\" title=\"{{_t('upgrade')}}\" ng-click=updateSkin(skins.online.all[v.name]) ng-if=\"skins.online.all[v.name] && skins.online.all[v.name].status === 'notequal'\"><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('upgrade')}}</span></button> <button class=\"btn btn-default\" title=\"{{_t('lb_remove')}}\" ng-click=\"removeSkin(v, _t('lb_delete_confirm'))\" ng-hide=\"v.name === skins.local.active\" ng-if=\"v.name !== 'default'\"><i class=\"fa fa-remove text-danger\"></i> <span class=btn-name>{{_t('lb_remove')}}</span></button></div></div></div></div></div></div></div></div><div id=skinLocalModal class=appmodal ng-if=modalArr.skinLocalModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('skinLocalModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{skins.local.find.title|cutText:true:30}}</h3></div><div class=\"appmodal-body customize-detail\"><p class=customize-detail-title>{{skins.local.find.title}}</p><p class=customize-detail-perex>{{skins.local.find.description}}</p><p class=customize-detail-list ng-if=skins.local.find.author><strong>{{_t('author')}}:</strong> <span ng-if=!skins.local.find.homepage>{{skins.local.find.author}}</span> <a ng-href={{skins.local.find.homepage}} ng-if=skins.local.find.homepage>{{skins.local.find.author}}</a></p><p class=customize-detail-list><strong>{{_t('version')}}:</strong> {{skins.local.find.version}}</p><div class=customize-detail-img><img class=customize-image-detail ng-src={{skins.local.find.icon}} alt=\"{{skins.local.find.title}}\"></div></div><div class=appmodal-footer><button type=button class=\"btn btn-default\" ng-click=\"handleModal('skinLocalModal', $event)\"><i class=\"fa fa-times text-danger\"></i> <span class=btn-name>{{_t('lb_close')}}</span></button> <button href=\"\" class=\"btn btn-submit\" title=\"{{_t('lb_activate')}}\" ng-if=\"skins.local.find.name !== skins.local.active\" ng-click=\"handleModal('skinLocalModal', $event);activateSkin(skins.local.find)\"><i class=\"fa fa-fire\"></i> <span class=btn-name>{{_t('lb_activate')}}</span></button> <button class=\"btn btn-danger\" title=\"{{_t('upgrade')}}\" ng-if=\"skins.online.all[skins.local.find.name] && skins.online.all[skins.local.find.name].status === 'notequal'\" ng-click=\"handleModal('skinLocalModal', $event);updateSkin(skins.online.all[skins.local.find.name])\"><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('upgrade')}}</span></button></div></div></div></div></div>"
  );


  $templateCache.put('app/views/customize/skins_online.html',
    "<div ng-controller=SkinBaseController><div ng-controller=SkinOnlineController id=skins_online><bb-loader></bb-loader><div ng-include=\"'app/views/customize/navi.html'\"></div><div ng-if=skins.online.show><div class=\"app-row app-row-widget app-row-customize clearfix\"><div class=\"widget-entry widget-entry-customize\" id=local_skin_{{v.id}} ng-class=\"{'widget-warning': skins.local.all[v.name],'widget-danger': skins.local.all[v.name] && skins.local.all[v.name].version != v.version}\" ng-repeat=\"v in skins.online.all track by v.id\"><div class=widget-entry-in><div class=widget-img><img class=\"customize-preview-img clickable\" ng-src={{v.icon_path}} alt={{v.title}} ng-click=\"skins.online.find = v;handleModal('skinOnlineModal', $event)\"></div><div class=widget-header></div><div class=widget-content><div class=widget-title><h3 class=clickable title={{v.title}} ng-click=\"skins.online.find = v;handleModal('skinOnlineModal', $event)\">{{v.title|cutText:true:25}} <span class=btn-name>&raquo;</span></h3></div><hr class=\"bottom-aligner\"><div class=widget-footer><div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right clearfix\"><div class=btn-group><button class=\"btn btn-default\" title=\"{{_t('lb_download')}}\" ng-if=\"v.status === 'download'\" ng-click=downloadSkin(v)><i class=\"fa fa-download text-success\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-danger\" title=\"{{_t('upgrade')}}\" ng-if=\"v.status === 'notequal'\" ng-click=uupdateSkin(v)><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('upgrade')}}</span></button> <button class=\"btn btn-disabled\" title=\"{{_t('installed')}}\" disabled ng-if=\"v.status === 'equal'\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('installed')}}</span></button></div></div></div></div></div></div></div></div><div id=skinOnlineModal class=appmodal ng-if=modalArr.skinOnlineModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('skinOnlineModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{skins.online.find.title|cutText:true:30}}</h3></div><div class=\"appmodal-body customize-detail\"><p class=customize-detail-title>{{skins.online.find.title}}</p><p class=customize-detail-perex>{{skins.online.find.description}}</p><p class=customize-detail-list ng-if=skins.online.find.author><strong>{{_t('author')}}:</strong> <span ng-if=!skins.online.find.homepage>{{skins.online.find.author}}</span> <a ng-href={{skins.online.find.homepage}} ng-if=skins.online.find.homepage>{{skins.online.find.author}}</a></p><p class=customize-detail-list><strong>{{_t('version')}}:</strong> {{skins.online.find.version}}</p><div class=customize-detail-img><img class=customize-image-detail ng-src={{skins.online.find.icon_path}} alt=\"{{skins.online.find.title}}\"></div></div><div class=appmodal-footer><button type=button class=\"btn btn-default\" ng-click=\"handleModal('skinOnlineModal', $event)\"><i class=\"fa fa-times text-danger\"></i> <span class=btn-name>{{_t('lb_close')}}</span></button> <button href=\"\" class=\"btn btn-submit\" title=\"{{_t('lb_download')}}\" ng-if=\"skins.online.find.status === 'download'\" ng-click=\"handleModal('skinOnlineModal', $event);downloadSkin(skins.online.find)\"><i class=\"fa fa-download\"></i> <span class=btn-name>{{_t('lb_download')}}</span></button> <button class=\"btn btn-danger\" title=\"{{_t('upgrade')}}\" ng-if=\"skins.online.find.status === 'notequal'\" ng-click=\"handleModal('skinOnlineModal', $event);updateSkin(skins.online.find)\"><i class=\"fa fa-level-up\"></i> <span class=btn-name>{{_t('upgrade')}}</span></button></div></div></div></div></div>"
  );


  $templateCache.put('app/views/devices/devices.html',
    "<div ng-controller=DeviceController><h2 ng-bind=\"_t('lb_select_device_type')\"></h2><table class=\"table table-report table-products\"><tbody><tr><td><img class=device-type-logo ng-src=app/img/logo-zwave.png alt=\"Logo\"></td><td class=td-action><div class=btn-group><a class=\"btn btn-default\" href=\"\" title=\"{{_t('manage_with_expertui')}}\" ng-click=\"toExpert('/expert',_t('redirect_to_expert'))\" ng-if=\"elementAccess(cfg.role_access.admin,isMobile) && cfg.app_type === 'default'\"><i class=\"fa fa-external-link\"></i> <span class=btn-name ng-bind=\"_t('manage_with_expertui')\"></span></a> <a class=\"btn btn-default\" href=#zwave/vendors title=\"{{_t('add_new')}}\"><i class=\"fa fa-plus text-success\"></i> <span class=btn-name ng-bind=\"_t('add_new')\"></span></a> <a class=\"btn btn-default\" href=#zwave/devices title=\"{{_t('manage')}}\"><i class=\"fa fa-edit text-primary\"></i> <span class=btn-name ng-bind=\"_t('manage')\"></span></a></div></td></tr><tr><td><img class=device-type-logo ng-src=app/img/logo-camera.png alt=\"Logo\"></td><td class=td-action><div class=btn-group><a class=\"btn btn-default\" href=#camera/add title=\"{{_t('add_new')}}\"><i class=\"fa fa-plus text-success\"></i> <span class=btn-name ng-bind=\"_t('add_new')\"></span></a> <a class=\"btn btn-default\" href=#camera/manage title=\"{{_t('manage')}}\"><i class=\"fa fa-edit text-primary\"></i> <span class=btn-name ng-bind=\"_t('manage')\"></span></a></div></td></tr><tr ng-if=enocean.installed><td><img class=device-type-logo ng-src=app/img/logo-enocean.png alt=\"Logo\"></td><td class=td-action><bb-alert-text alert=enocean.alert></bb-alert-text><div ng-if=enocean.active><div class=btn-group><a class=\"btn btn-default\" href=#enocean/devices title=\"{{_t('add_new')}}\"><i class=\"fa fa-plus text-success\"></i> <span class=btn-name ng-bind=\"_t('add_new')\"></span></a> <a class=\"btn btn-default\" href=#enocean/manage title=\"{{_t('manage')}}\"><i class=\"fa fa-edit text-primary\"></i> <span class=btn-name ng-bind=\"_t('manage')\"></span></a></div></div></td></tr></tbody></table></div>"
  );


  $templateCache.put('app/views/dir-pagination.html',
    "<ul class=pagination ng-if=\"1 < pages.length\"><li ng-if=boundaryLinks ng-class=\"{ disabled : pagination.current == 1 }\"><a href=\"\" ng-click=setCurrent(1)>&laquo;</a></li><li ng-if=directionLinks ng-class=\"{ disabled : pagination.current == 1 }\" class=ng-scope><a href=\"\" ng-click=\"setCurrent(pagination.current - 1)\" class=ng-binding>‹</a></li><li ng-repeat=\"pageNumber in pages track by $index\" ng-class=\"{ active : pagination.current == pageNumber, disabled : pageNumber == '...' }\"><a href=\"\" ng-click=setCurrent(pageNumber)>{{ pageNumber }}</a></li><li ng-if=directionLinks ng-class=\"{ disabled : pagination.current == pagination.last }\" class=ng-scope><a href=\"\" ng-click=\"setCurrent(pagination.current + 1)\" class=ng-binding>›</a></li><li ng-if=boundaryLinks ng-class=\"{ disabled : pagination.current == pagination.last }\"><a href=\"\" ng-click=setCurrent(pagination.last)>&raquo;</a></li></ul>"
  );


  $templateCache.put('app/views/elements/element_id.html',
    "<div ng-controller=ElementIdController class=mobile-padding><bb-loader></bb-loader><div ng-if=elementId.show><h2><span ng-bind=\"_t('lb_cfg_view')\"></span>: <span ng-bind=elementId.input.metrics.title></span></h2><form name=form_element id=form_element class=\"form form-page\" autocomplete=off ng-submit=store(elementId.input) novalidate><fieldset ng-if=elementAccess(cfg.role_access.admin)><p class=form-control-static><span ng-bind=\"_t('element_id')\"></span>: <strong ng-bind=elementId.input.id></strong></p><div class=form-group_><label>{{_t('lb_element_name')}}:</label><input name=title id=title class=form-control value={{elementId.input.metrics.title}} placeholder=\"{{_t('lb_element_name')}}\" ng-model=\"elementId.input.metrics.title\"></div></fieldset><fieldset><h3><span ng-bind=\"_t('lb_configuration')\"></span></h3><div ng-if=elementAccess(cfg.role_access.admin)><div class=form-group ng-if=elementId.appType.instance><span ng-bind=\"_t('lb_gen_by_module')\"></span> <a class=\"btn btn-default\" ng-href=#module/put/{{elementId.appType.instance.id}}><strong>{{elementId.appType.instance.title}}</strong></a></div><div class=form-group ng-if=elementId.appType.zwave>{{_t('lb_gen_by')}} <a href=#zwave/devices/{{elementId.appType.zwave}} class=\"btn btn-default\">{{_t('lb_zwave_device')}} #{{elementId.appType.zwave}}</a></div><div class=form-group ng-if=elementId.appType.enocean>{{_t('lb_gen_by')}} <a href=#enocean/manage/{{elementId.appType.enocean}} class=\"btn btn-default\">{{_t('enocean_device')}} #{{elementId.appType.enocean}}</a></div><div class=form-group><input type=checkbox name=dashboard id=dashboard ng-init=\"visibility.checked = !elementId.input.visibility\" ng-model=visibility.checked ng-change=\"elementId.input.visibility = !visibility.checked\" ng-checked=\"!elementId.input.visibility\"><label>{{_t('hide_element')}}</label><bb-help-text trans=\"_t('hide_element_info')\"></bb-help-text></div></div><div class=form-group ng-if=\"elementAccess(cfg.role_access.admin) && elementId.appType.zwave\"><input type=checkbox name=permanently_hidden id=permanently_hidden ng-model=elementId.input.permanently_hidden ng-checked=\"elementId.input.permanently_hidden\"><label>{{_t('lb_deactivate')}}</label><bb-help-text trans=\"_t('deactivate_element_info')\"></bb-help-text></div><div class=form-group><div><input type=checkbox name=dashboard value={{elementId.input.onDashboard}} id=dashboard ng-model=elementId.input.onDashboard ng-checked=\"elementId.input.onDashboard\"><label>{{_t('lb_add_dashboard')}}</label></div><div><input type=checkbox name=hide_events value={{elementId.input.id}} id=hide_events ng-model=elementId.input.hide_events ng-checked=\"user.hide_single_device_events.indexOf(elementId.input.id) === -1 ? false : true\"><label>{{_t('lb_hide_events_device')}}</label></div></div><div class=\"form-group form-inline\" ng-if=elementAccess(cfg.role_access.admin)><h3>{{_t('lb_assign_room')}}</h3><div class=btn-group><button type=button class=\"btn btn-default\" ng-click=\"expandNavi('elidDropDown', $event)\">{{elementId.locations[elementId.input.location].title|cutText:true:20}} <i class=\"fa fa-caret-down\"></i></button><div class=\"app-dropdown app-dropdown-left\" ng-if=naviExpanded.elidDropDown><ul><li class=clickable ng-class=\"elementId.input.location == v.id ? 'active':''\" ng-click=\"elementId.input.location = v.id\" ng-repeat=\"v in elementId.locations\"><a><img class=navi-img ng-src={{v.img_src}} alt=\"img\"> {{v.title|cutText:true:20}} <i class=\"fa fa-check menu-arrow\" ng-if=\"elementId.input.location == v.id\"></i></a></li></ul></div></div></div></fieldset><fieldset ng-if=elementAccess(cfg.role_access.admin)><h3><span ng-bind=\"_t('lb_tags')\"></span></h3><div class=\"form-group form-inline\"><div class=input-group><input name=add_tag id=add_tag class=form-control placeholder=\"{{_t('lb_add_tag')}}\" ng-model=search.text bb-key-event=searchMe() data-toggle=\"dropdown\"> <span class=\"input-group-addon clickable\" title=\"{{_t('lb_add_tag')}}\" ng-click=addTag()><i class=\"fa fa-plus text-success\"></i></span><div class=\"app-dropdown app-dropdown-left\" ng-if=suggestions.length><ul><li href=\"\" ng-click=addTag(v) ng-repeat=\"v in suggestions | orderBy:'toString()'\"><a href=\"\"><i class=\"fa fa-plus text-success\"></i> {{v}}</a></li></ul></div></div></div><div class=\"form-group last\"><a href=\"\" class=\"btn btn-default btn-tag\" id=tag_{{$index}} ng-repeat=\"t in elementId.input.tags | orderBy:'toString()'\" ng-click=removeTag($index)>{{t}} <i class=\"fa fa-times text-danger\" title=\"{{_t('lb_remove')}}\"></i></a></div></fieldset><fieldset class=submit-entry><button type=button title=\"{{_t('lb_cancel')}}\" class=\"btn btn-default\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name ng-bind=\"_t('lb_cancel')\"></span></button> <button type=submit title=\"{{_t('lb_save')}}\" class=\"btn btn-submit\"><i class=\"fa fa-check\"></i> <span class=btn-name ng-bind=\"_t('lb_save')\"></span></button></fieldset></form><div ng-include=\"'app/views/elements/element_id_icons.html'\"></div></div></div>"
  );


  $templateCache.put('app/views/elements/element_id_icons.html',
    "<div ng-controller=ElementIconController ng-if_=blablabla><div class=\"form form-inline form-page\" ng-if=!_.isEmpty(icons.all)><bb-loader></bb-loader><div class=fieldset><h2>{{_t('custom_icons')}}</h2><div class=\"alert alert-warning\" ng-if=_.isEmpty(icons.uploaded)><i class=\"fa fa-exclamation-circle\"></i> {{_t('custom_icons_no_available')}} <a href=#/customize/iconslocal class=\"btn btn-primary\"><i class=\"fa fa-upload\"></i> {{_t('upload_icon')}}</a></div></div><div class=fieldset ng-if=!_.isEmpty(icons.uploaded)><div class=\"app-row app-row-report app-row-icons clearfix\"><div class=report-entry><div class=\"report-col report-media\">Default</div><div class=\"report-col report-body\">&nbsp;</div><div class=\"report-col report-media\">Custom</div><div class=\"report-col report-ctrl\">&nbsp;</div></div><div class=\"report-entry clickable\" ng-class=\"k=== icons.selected ? 'bcg-success' : ''\" ng-repeat=\"(k,v) in icons.all.default\" ng-click=setSelectedIcon(k)><div class=\"report-col report-media\"><img class=report-img ng-src=\"{{cfg.img.icons + v}}\" alt=\"{{v}}\"></div><div class=\"report-col report-body\"><i class=\"fa fa-long-arrow-right\" ng-if=icons.all.custom[k]></i></div><div class=\"report-col report-media\"><img class=report-img ng-src=\"{{cfg.img.custom_icons + icons.all.custom[k]}}\" ng-if=icons.all.custom[k] alt=\"{{v.type}}\"> <img class=\"report-img img-opacity-50\" ng-src=\"{{cfg.img.icons }}cancel.png\" ng-if=!icons.all.custom[k] alt=\"img\"></div><div class=\"report-col report-ctrl\"><button title=\"{{_t('lb_update')}}\" class=\"btn btn-default\" ng-disabled=\"icons.selected === k\" ng-click=setSelectedIcon(k)><i class=\"fa fa-pencil text-primary\"></i></button> <button title=\"{{_t('lb_remove')}}\" class=\"btn btn-default\" ng-if=icons.all.custom[k] ng-click=removeCustomIcon(k)><i class=\"fa fa-ban text-danger\"></i></button></div></div></div></div><div ng-if=\"icons.selected && !_.isEmpty(icons.uploaded)\"><div class=fieldset><div class=\"app-row clearfix app-row-imglist\"><div class=imglist-entry ng-repeat=\"v in icons.uploaded| orderBy : '-timestamp' track by $index\"><div class=\"imglist-entry-in infowindow-wrap\"><img class=\"imglist-img clickable\" ng-click=setCustomIcon(v.file) ng-src=\"{{cfg.img.custom_icons + v.file}}\"></div></div></div></div><div class=fieldset><a href=#/customize/iconslocal class=\"btn btn-primary\"><i class=\"fa fa-image\"></i> {{_t('manage_custom_icons')}}</a></div><fieldset class=submit-entry><button type=button title=\"{{_t('lb_cancel')}}\" class=\"btn btn-default\" ng-click=cancelUpdate()><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=button title=\"{{_t('lb_save')}}\" class=\"btn btn-submit\" ng-click=updateWithCustomIcon()><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></div></div></div>"
  );


  $templateCache.put('app/views/elements/elements_dashboard.html',
    "<div ng-controller=ElementBaseController><bb-loader></bb-loader><div ng-controller=ElementDashboardController><div ng-if=elementDashboard.firstLogin ng-include=\"'app/views/elements/' + elementDashboard.firstFile\"></div><div ng-if=\"!elementDashboard.firstLogin && dataHolder.devices.noDevices\" ng-include=\"'app/views/elements/no_devices.html'\"></div><div ng-if=\"!elementDashboard.firstLogin && dataHolder.devices.noDashboard\" ng-include=\"'app/views/elements/no_dashboard.html'\"></div><div ng-if=dataHolder.devices.show ng-include=\"'app/views/elements/list.html'\"></div></div></div>"
  );


  $templateCache.put('app/views/elements/elements_page.html',
    "<div ng-controller=ElementBaseController><bb-loader></bb-loader><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-3\"><button class=\"btn btn-default\" ng-click=\"expandNavi('elCategories', $event)\" ng-class=\"!_.isEmpty(dataHolder.devices.filter) ? 'active':''\"><i class=\"fa fa-filter\"></i> <span class=btn-name ng-if=dataHolder.devices.filter.deviceType>{{_t(dataHolder.devices.filter.deviceType) | cutText:true:15}}</span> <span class=btn-name ng-if=\"dataHolder.devices.filter.visibility === false\">{{_t('hidden_elements') | cutText:true:15}}</span> <span class=btn-name ng-if=_.isEmpty(dataHolder.devices.filter)>{{_t('all_elements') | cutText:true:15}}</span> <span class=\"btn-name item-cnt\">({{dataHolder.cnt.collection}})</span></button> <button class=\"btn btn-default\" ng-click=\"expandNavi('elTags', $event)\" ng-class=\"dataHolder.devices.filter.tag ? 'active':''\"><i class=\"fa fa-tags\"></i> <span class=btn-name ng-if=dataHolder.devices.filter.tag>{{dataHolder.devices.filter.tag|cutText:true:15}}</span> <span class=btn-name ng-if=!dataHolder.devices.filter.tag>{{_t('lb_tags')}}</span></button> <button class=\"btn btn-default\" ng-click=\"expandNavi('elOrderBy', $event)\"><i class=\"fa fa-sort-alpha-asc\"></i> <span class=btn-name>{{_t(dataHolder.devices.orderBy) | cutText:true:15}}</span></button></div><div class=\"input-group search-group\"><input ng-model=q class=form-control value={{q}}> <span class=input-group-addon><i class=\"fa fa-search\"></i></span></div></div><div class=page-navi ng-if=naviExpanded.elCategories><div class=page-navi-in><ul><li class=page-cat-0 ng-class=\"_.isEmpty(dataHolder.devices.filter) == true ? 'active': ''\"><a href=\"\" ng-click=setFilter()><i class=\"fa fa-check-circle-o\"></i> {{_t('all_elements')}} <span class=item-cnt>({{dataHolder.cnt.devices}})</span> <span class=page-navi-icon><i class=\"fa fa-chevron-right\"></i></span></a></li><li class=page-cat-{{v}} ng-repeat=\"(v,k) in dataHolder.devices.deviceType\" ng-class=\"dataHolder.devices.filter.deviceType == v ? 'active': ''\"><a href=\"\" ng-click=\"setFilter({deviceType: v})\"><i class=\"fa {{v|getElCategoryIcon}}\"></i> {{_t(v) | cutText:true:30}} <span class=item-cnt>({{k}})</span> <span class=page-navi-icon><i class=\"fa fa-chevron-right\"></i></span></a></li></ul><div class=page-navi-content><a class=\"btn btn-default btn-tag\" ng-click=\"showHiddenEl((dataHolder.devices.showHidden ? false:true))\" ng-class=\"dataHolder.devices.showHidden ? 'active': ''\"><i class=\"fa fa-eye\"></i> {{_t('show_hidden')}}</a></div></div></div><div class=page-navi ng-if=naviExpanded.elTags><div class=page-navi-in><div class=page-navi-content><a class=\"btn btn-default btn-tag\" ng-click=setFilter() ng-class=\"_.isEmpty(dataHolder.devices.filter) == true ? 'active': ''\">{{_t('all_elements')}}</a> <a class=\"btn btn-default btn-tag\" ng-repeat=\"v in dataHolder.devices.tags|orderBy:'toString()'\" ng-click=\"setFilter({tag: v})\" ng-class=\"dataHolder.devices.filter.tag == v ? 'active': ''\">{{v|cutText:true:30}}</a></div></div></div><div class=page-navi ng-if=naviExpanded.elOrderBy><div class=page-navi-in><div class=page-navi-content><p class=page-navi-title>{{_t('sortby')}}</p><a class=\"btn btn-default btn-tag\" href=\"\" ng-repeat=\"(k,v) in cfg.orderby.elements\" ng-click=setOrderBy(k) ng-class=\"dataHolder.devices.orderBy == k ? 'active': ''\">{{_t(k) | cutText:true:30}}</a></div></div></div><div ng-if=dataHolder.devices.noDevices ng-include=\"'app/views/elements/no_devices.html'\"></div><div ng-if=\"dataHolder.devices.show && !dataHolder.devices.noDevices\"><div ng-include=\"'app/views/elements/list.html'\"></div></div></div>"
  );


  $templateCache.put('app/views/elements/elements_room.html',
    "<div ng-controller=ElementBaseController><bb-loader></bb-loader><div ng-controller=ElementRoomController><h1>{{_t('lb_devices_room')}} {{dataHolder.devices.rooms[dataHolder.devices.filter.location].title}}</h1><div ng-if=!dataHolder.devices.show ng-include=\"'app/views/elements/no_elements_room.html'\"></div><div ng-if=dataHolder.devices.show ng-include=\"'app/views/elements/list.html'\"></div></div></div>"
  );


  $templateCache.put('app/views/elements/first_login_de.html',
    "<div class=\"form-page welcome-entry\"><div class=fieldset><h1>Willkommen in ihrem Smart Home</h1><div>Hier können Sie die Z-Wave Geräte in ihrem Haus managen. Jede Funktion eines Gerätes wird als ein <strong>Element</strong> dargestellt (Hat ein physisches Gerät mehrere Funktionen, wie Sensoren oder Aktoren dann werden mehrere Elemente erzeugt). Alle Elemente sind in der <strong>Elementeübersicht</strong> dargestellt und können hier nach Name oder Elementtyp gefiltert werden.<br><br>Jedes Element hat ein <strong>Konfigurationsmenü</strong>, wo es unter anderem auch ausgeblendet werden kann, wenn es nicht benötigt wird. Wichtige Elemente können dort für das <strong>Dashboard</strong> markiert werden. Zusätzlich können die Elemente auch nach Räumen angeordnet werden.<br><br>Jeder Neue Sensorwert oder jede Statusänderung eines Sensors ist ein Ereignis und wird in der <strong>Ereignisübersicht</strong> angezeigt. Die Ereignisse eines einzelnen Elementes oder einer einzelnen Funktionsgruppe können herausgefiltert werden.<br><br>Alle anderen Funktionen, wie das Aktivieren einer Szene im Haus, die Nutzung von über Ethernet erreichbaren Geräten oder Internetdiensten werden alle als <strong>Anwendungen</strong> bezeichnet. Diese Anwendungen erzeugen wieder entsprechend ihrer Funktion keine, ein oder mehrere Elemente. Der Menüpunkt <a href=#apps/local class=\"btn btn-default\"><i class=\"fa fa-cubes\"></i> {{_t('nav_apps')}}</a> ermöglicht das Herunterladen, Installieren, Aktivieren und Konfigurieren dieser Anwendungen.<br><br>Um ein neues Gerät zur Smart Home-Steuerung hinzuzufügen, folgen Sie den Anweisungen unter <a href=#devices class=\"btn btn-default\"><i class=\"fa fa-cogs\"></i> {{_t('nav_devices')}}</a></div></div></div>"
  );


  $templateCache.put('app/views/elements/first_login_en.html',
    "<div class=\"form-page welcome-entry\"><div class=fieldset><h1>Welcome to your Smart Home</h1><div>This interface allows managing your Smart Home equipped with interconnected Z-Wave devices. It will show every function of the device as one single <strong>Element</strong> (In case a physical device has multiple functions like switching and metering – it will generate multiple elements). All elements are listed in the <strong>Element View</strong> and can be filtered by function type (switch, dimmer, sensor) or other filtering criteria.<br><br>Each Element has an <strong>Element Configuration Dialog</strong> to rename it or to hide it in case was created but it is not needed. Important elements can be marked to be shown in the <strong>Dashboard</strong>. Additionally the elements can be grouped into rooms.<br><br>Every change of a sensor value or a switching status is called an <strong>Event</strong> and is shown in the <strong>Timeline</strong>. Filtering allows monitoring the changes of one single function or device.<br><br><div ng-if=elementAccess(cfg.role_access.admin)>All other functions such as time triggered actions, the use of information from the Internet, scenes plugin of other technologies and service are realized in <strong>Apps</strong>. These apps can create none, one or multiple new elements and events. The menu <a href=#apps/local class=\"btn btn-default\"><i class=\"fa fa-cubes\"></i> {{_t('nav_apps')}}</a> allows downloading, activating and configuring your Apps.<br><br>To Add a new device please follow the instruction under <a href=#devices class=\"btn btn-default\"><i class=\"fa fa-cogs\"></i> {{_t('nav_devices')}}</a></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/list.html',
    "<div class=\"app-row app-row-widget app-row-element clearfix\"><div id=Widget_{{v.id}} class=\"widget-entry widget-entry-element {{v.deviceType}} {{v.metrics.multilineType}}\" ng-class=\"{'widget-success': v.isNew}\" ng-repeat=\"v in dataHolder.devices.collection| filter:q | orderBy: cfg.orderby.elements[dataHolder.devices.orderBy] track by v.id\"><div class=widget-entry-in><div class=widget-img title=\"{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}\"><img class=\"widget-preview-img widget-icon-update img-circle trans-{{v.imgTrans}}\" ng-src={{v.iconPath}} alt=img ng-click=\"runCmd(v.id + '/command/' + v.updateCmd)\" ng-if=\"cfg.element_update_icon.indexOf(v.deviceType) > -1\"> <img class=\"widget-preview-img img-circle\" ng-src={{v.iconPath}} alt=img ng-if=\"cfg.element_update_icon.indexOf(v.deviceType) === -1\"></div><div class=widget-header><a class=\"widget-icon widget-hidden\" href=\"\" ng-click=setVisibility(v,true) ng-if=!v.visibility><i class=\"fa fa-eye-slash\"></i></a> <a class=\"widget-icon widget-chart\" href=\"\" title=\"{{_t('chart')}}\" ng-click=\"dataHolder.devices.find = v;handleModal('modalIntchart', $event)\" ng-if=v.metrics.intchartUrl><i class=\"fa fa-line-chart\"></i></a> <a class=\"widget-icon widget-history\" href=\"\" title=\"{{_t('history')}}\" ng-click=\"dataHolder.devices.find = v;handleModal('modalHistory', $event)\" ng-if=v.hasHistory><i class=\"fa fa-history\"></i></a> <a class=\"widget-icon widget-config\" href=#element/{{v.id}} title=\"{{_t('lb_cfg_view')}}\" ng-if=elementAccess(cfg.role_access.element)><i class=\"fa fa-cog\"></i></a></div><div class=widget-content><div class=widget-title><span class=widget-room><span ng-if=\"v.location !== 0\">{{dataHolder.devices.rooms[v.location].title|cutText:true:25}}</span>&nbsp;</span><h3 title={{v.metrics.title}}>{{v.metrics.title|cutText:true:25}}</h3></div><hr class=\"bottom-aligner\"><div class=widget-footer ng-switch=v.deviceType><div ng-switch-when=switchMultilevel><div ng-include=\"'app/views/elements/widgets/switchMultilevel.html'\"></div></div><div ng-switch-when=switchBinary><div ng-include=\"'app/views/elements/widgets/switchBinary.html'\"></div></div><div ng-switch-when=switchRGBW><div ng-include=\"'app/views/elements/widgets/switchRGBW.html'\"></div></div><div ng-switch-when=doorlock><div ng-include=\"'app/views/elements/widgets/doorlock.html'\"></div></div><div ng-switch-when=doorLockControl><div ng-include=\"'app/views/elements/widgets/doorLockControl.html'\"></div></div><div ng-switch-when=toggleButton><div ng-include=\"'app/views/elements/widgets/toggleButton.html'\"></div></div><div ng-switch-when=sensorMultilevel><div ng-include=\"'app/views/elements/widgets/sensorMultilevel.html'\"></div></div><div ng-switch-when=sensorBinary><div ng-include=\"'app/views/elements/widgets/sensorBinary.html'\"></div></div><div ng-switch-when=sensorDiscrete><div ng-include=\"'app/views/elements/widgets/sensorDiscrete.html'\"></div></div><div ng-switch-when=thermostat><div ng-include=\"'app/views/elements/widgets/thermostat.html'\"></div></div><div ng-switch-when=camera><div ng-include=\"'app/views/elements/widgets/camera.html'\"></div></div><div ng-switch-when=text><div ng-include=\"'app/views/elements/widgets/text.html'\"></div></div><div ng-switch-when=switchControl><div ng-include=\"'app/views/elements/widgets/switchControl.html'\"></div></div><div ng-switch-when=sensorMultiline><div ng-include=\"'app/views/elements/widgets/sensorMultiline.html'\"></div></div><div ng-switch-default><div ng-include=\"'app/views/elements/widgets/default.html'\"></div></div></div></div></div></div></div><div ng-include=\"'app/views/elements/widgets/intchartModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/historyModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/switchMultilevelModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/thermostatModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/sensorMultilineModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/openWeatherModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/multiButtonModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/textModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/cameraModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/climateControlModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/doorLockControlModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/switchRGBWModal.html'\"></div><div ng-include=\"'app/views/elements/widgets/securityControlModal.html'\"></div>"
  );


  $templateCache.put('app/views/elements/no_dashboard.html',
    "<h2>{{_t('welcome_no_devices')}}</h2><div class=\"form-page welcome-entry\"><div class=fieldset><div class=form-group><span class=\"badge badge-number\">1</span> <span class=welcome-help><a href=#elements>{{_t('welcome_step1')}} <i class=\"fa fa-clone\"></i></a></span></div><div class=form-group><span class=\"badge badge-number\">2</span> <span class=welcome-help>{{_t('welcome_step2')}} <i class=\"fa fa-cog\"></i></span></div><div class=\"form-group last\"><span class=\"badge badge-number\">3</span> <span class=welcome-help>{{_t('welcome_step3')}}</span></div></div><div class=\"fieldset submit-entry\"><a class=\"btn btn-submit\" href=#elements>{{_t('continue')}} <i class=\"fa fa-chevron-right\"></i></a></div></div>"
  );


  $templateCache.put('app/views/elements/no_devices.html',
    "<h2>{{_t('no_device_installed')}}</h2><div class=\"form-page welcome-entry\" ng-if=elementAccess(cfg.role_access.admin)><div class=fieldset><div class=form-group><span class=\"badge badge-number\">1</span> <span class=welcome-help>{{_t('can_add_app')}}</span> <a href=#apps/local class=\"btn btn-default\"><i class=\"fa fa-cubes\"></i> {{_t('nav_apps')}}</a></div><div class=form-group><span class=\"badge badge-number\">2</span> <span class=welcome-help>{{_t('can_include_device')}}</span> <a href=#devices class=\"btn btn-default\"><i class=\"fa fa-cogs\"></i> {{_t('nav_devices')}}</a></div></div><div class=\"fieldset submit-entry\" ng-if=\"dataHolder.cnt.hidden > 0\"><button class=\"btn btn-default\" ng-click=showHiddenEl(true)><i class=\"fa fa-eye\"></i> {{_t('show_hidden')}}</button></div></div>"
  );


  $templateCache.put('app/views/elements/no_elements_room.html',
    "<div class=\"alert alert-warning\"><i class=\"fa fa-exclamation-circle\"></i> {{_t('no_devices')}}</div>"
  );


  $templateCache.put('app/views/elements/widgets/_muster.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn widget-btn-frostProtection btn-primary\"><i class=\"fa fa-asterisk\"></i></button> <button class=\"btn widget-btn-energySave btn-default\"><i class=\"fa fa-leaf\"></i></button> <button class=\"btn widget-btn-comfort btn-default\"><i class=\"fa fa-building\"></i></button></div></div><div class=\"widget-ctrl ctrl-right\"><i class=\"fa fa-caret-down\"></i> <span class=widget-level>100</span> <span class=widget-scale>%</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/camera.html',
    "<div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right\" ng-click=\"dataHolder.devices.find = v;handleModal('cameraModal', $event)\"><div class=btn-group><button class=\"btn btn-default\"><i class=\"fa fa-video-camera text-primary\"></i></button></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/cameraModal.html',
    "<div id=cameraModal class=appmodal ng-controller=ElementCameraController ng-if=modalArr.cameraModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('cameraModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetCamera.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetCamera.alert></bb-alert><div class=element-camera-control><a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/zoomIn')\" ng-if=widgetCamera.find.metrics.hasZoomIn><i class=\"fa fa-search-plus\"></i></a>&nbsp;&nbsp;&nbsp; <a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/zoomOut')\" ng-if=widgetCamera.find.metrics.hasZoomOut><i class=\"fa fa-search-minus\"></i></a>&nbsp;&nbsp;&nbsp; <a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/left')\" ng-if=widgetCamera.find.metrics.hasLeft><i class=\"fa fa-arrow-circle-left\"></i></a>&nbsp;&nbsp;&nbsp; <a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/right')\" ng-if=widgetCamera.find.metrics.hasRight><i class=\"fa fa-arrow-circle-right\"></i></a>&nbsp;&nbsp;&nbsp; <a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/up')\" ng-if=widgetCamera.find.metrics.hasUp><i class=\"fa fa-arrow-circle-up\"></i></a>&nbsp;&nbsp;&nbsp; <a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/down')\" ng-if=widgetCamera.find.metrics.hasDown><i class=\"fa fa-arrow-circle-down\"></i></a>&nbsp;&nbsp;&nbsp; <a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/open')\" ng-if=widgetCamera.find.metrics.hasOpen><i class=\"fa fa-power-off\"></i></a>&nbsp;&nbsp;&nbsp; <a href=\"\" ng-click=\"runCmd(widgetCamera.find.id + '/command/close')\" ng-if=widgetCamera.find.metrics.hasClose><i class=\"fa fa-close\"></i></a>&nbsp;&nbsp;&nbsp;</div><div class=camera-img><img class=\"text-center camera-img\" ng-src={{url}}></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/climateControlModal.html',
    "<div id=climateControlModal class=appmodal ng-controller=ElementClimateControlController ng-if=modalArr.climateControlModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('climateControlModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{dataHolder.devices.find.metrics.title}}</h3></div><div class=appmodal-body><bb-alert alert=widgetClimateControl.alert></bb-alert><div class=multiline-entry ng-if=widgetClimateControl.rooms><table class=\"table table-report table-condensed\"><tbody><tr class=bcg-success ng-repeat=\"n in widgetClimateControl.rooms\" ng-if=\"n.room > 0\"><td class=td-img><img class=\"report-img img-circle\" ng-src=\"{{n.roomIcon}}\"></td><td class=text-left>{{n.roomTitle}}</td><td><span class=text-primary_>{{n.sensorLevel}} {{n.scaleTitle}}</span></td><td class=text-right>=></td><td class=text-right><span class=text-success>{{n.targetTemp}} {{n.scaleTitle}}</span></td><td class=text-right><select class=form-control name=changeMode_{{n.room}} id=changeMode_{{n.room}} ng-model=widgetClimateControl.model[n.room] ng-change=\"changeClimateControlMode({cmd: widgetClimateControl.find.id + '/command/' + widgetClimateControl.model[n.room] + '?room=' + n.room, room: n.room})\"><option value={{m}} ng-repeat=\"m in cfg.climate_state\" ng-disabled=\"m == 'schedule' && !n.hasSchedule\" ng-selected=\"n.state == m\">{{_t(m)}}</option></select></td></tr></tbody></table></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/default.html',
    "<div class=\"widget-ctrl ctrl-right\"><span class=widget-level>{{v.metrics.level}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/doorLockControl.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-off\" ng-class=\"v.metrics.level=='close' ? 'btn-primary': 'btn-default'\" data-ng-click=\"runCmd(v.id + '/command/close', v.id)\"><i class=\"fa fa-lock\"></i></button> <button class=\"btn btn-on\" ng-class=\"v.metrics.level =='open' ? 'btn-primary': 'btn-default'\" data-ng-click=\"runCmd(v.id + '/command/open', v.id)\"><i class=\"fa fa-unlock\"></i></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" title=\"{{_t('lb_settings')}}\" ng-click=\"dataHolder.devices.find = v;handleModal('doorLockControlModal', $event)\"><i class=\"fa fa-caret-down\"></i> <span class=widget-level>Closed at</span> <span>{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/doorLockControlModal.html',
    "<div id=doorLockControlModal class=appmodal ng-controller_=ElementThermostatController ng-if=modalArr.doorLockControlModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('doorLockControlModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{dataHolder.devices.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetThermostat.alert></bb-alert>Content: doorLockControlModal</div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/doorlock.html',
    "<div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\"><div class=btn-group><button class=\"btn btn-off\" ng-class=\"v.metrics.level=='close' ? 'btn-primary': 'btn-default'\" data-ng-click=\"runCmd(v.id + '/command/close', v.id)\"><i class=\"fa fa-lock\"></i></button> <button class=\"btn btn-on\" ng-class=\"v.metrics.level =='open' ? 'btn-primary': 'btn-default'\" data-ng-click=\"runCmd(v.id + '/command/open', v.id)\"><i class=\"fa fa-unlock\"></i></button></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/historyModal.html',
    "<div id=modalHistory class=appmodal ng-controller=ElementHistoryController ng-if=modalArr.modalHistory><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"resetDevices({byId:{}});handleModal('modalHistory', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetHistory.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetHistory.alert></bb-alert><div ng-if=!(_.isEmpty(widgetHistory.chartData))><canvas tc-chartjs-line chart-data=widgetHistory.chartData chart-options=widgetHistory.chartOptions width=340 height=200></canvas></div></div><div class=appmodal-footer><button type=button class=\"btn btn-default\" ng-click=\"deleteHistory(widgetHistory.find,_t('history_delete_confirm'),$event)\"><i class=\"fa fa-times text-danger\"></i> <span class=btn-name>{{_t('delete_history')}}</span></button></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/intchartModal.html',
    "<div id=modalIntchart class=appmodal ng-controller=ElementChartController ng-if=modalArr.modalIntchart><div class=appmodal-in style=min-height:128px><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('modalIntchart', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetChart.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetChart.alert></bb-alert><div ng-if=widgetChart.hasURL ng-include=widgetChart.url></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/multiButtonModal.html',
    "<div id=multiButtonModal class=appmodal ng-controller=ElementSensorMultilineController ng-if=modalArr.multiButtonModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('multiButtonModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetSensorMultiline.find.metrics.title}}</h3></div><div class=appmodal-body><bb-alert alert=widgetSensorMultiline.alert></bb-alert><div class=multiline-entry ng-if=widgetSensorMultiline.find><table class=\"table table-report table-condensed\"><tbody><tr ng-repeat=\"n in widgetSensorMultiline.find.metrics.sensors track by n.id\"><td class=td-img><img id=widget_multiline_img_{{n.id}} class=report-img ng-src={{n.iconPath}} alt=\"img\"></td><td><span ng-bind=\"n.metrics.title\"></td><td class=\"text-right tbl-widget-ctrl\"><a class=widget-history href=\"\" ng-click=\"getDeviceById(n.id);handleModal('modalHistory', $event)\" ng-if=n.hasHistory><i class=\"fa fa-history\"></i></a>&nbsp;<div class=btn-group ng-if=\"n.deviceType==='switchBinary'\"><button class=\"btn btn-off\" data-ng-click=\"runMultilineCmd(n.id + '/command/off', n.id)\" ng-class=\"n.metrics.level =='off' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_off')}}\"><span class=widget-btn-symbol>0</span></button> <button class=\"btn btn-on\" data-ng-click=\"runMultilineCmd(n.id + '/command/on', n.id)\" ng-class=\"n.metrics.level =='on' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_on')}}\"><span class=widget-btn-symbol>I</span></button></div><div class=btn-group ng-if=\"n.deviceType==='toggleButton'\"><button class=\"btn btn-default btn-label-on\" ng-click=\"runCmd(n.id + '/command/on')\" title=\"{{_t('lb_on')}}\">{{_t('lb_on')}}</button></div></td></tr></tbody></table></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/openWeatherModal.html',
    "<div id=openWeatherModal class=appmodal ng-controller=ElementOpenWeatherController ng-if=modalArr.openWeatherModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('openWeatherModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetOpenWeather.find.metrics.title}}, {{widgetOpenWeather.find.metrics.country}} <img ng-src={{widgetOpenWeather.find.metrics.flag}}></h3></div><div class=appmodal-body><bb-alert alert=widgetOpenWeather.alert></bb-alert><table class=\"table table-report table-condensed\"><tbody><tr><td><b>{{_t('lb_humidity')}}</b></td><td><span ng-bind=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.main.humidity\"><span>%</span></td></tr><tr><td><b>{{_t('lb_pressure')}}</b></td><td><span ng-bind=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.main.pressure\"><span>hPa</span></td></tr><tr><td><b>{{_t('lb_weather')}}</b></td><td><span ng-bind=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.weather[0].description\"></td></tr><tr><td><b>{{_t('lb_wind')}}</b></td><td><span ng-bind=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.speed | number:1\"><span>m/s</span> <span ng-if=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg === 0\">{{_t('lb_n')}}</span> <span ng-if=\"0 < widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg < 45\">{{_t('lb_ne')}}</span> <span ng-if=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg === 90\">{{_t('lb_e')}}</span> <span ng-if=\"90 < widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg < 180\">{{_t('lb_se')}}</span> <span ng-if=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg === 180\">{{_t('lb_s')}}</span> <span ng-if=\"180 < widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg < 270\">{{_t('lb_sw')}}</span> <span ng-if=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.speed === 270\">{{_t('lb_w')}}</span> <span ng-if=\"270 < widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg < 360\">{{_t('lb_nw')}}</span> (<span ng-bind=\"widgetOpenWeather.find.metrics.zwaveOpenWeather.wind.deg | number:0\"><span>°</span>)</td></tr><tr><td><b>{{_t('lb_last_update')}}</b></td><td>{{widgetOpenWeather.find.updateTime|isToday:true}}</td></tr></tbody></table></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/securityControlModal.html',
    "<div id=securityControlModal class=appmodal ng-controller=ElementSecurityControlController ng-if=modalArr.securityControlModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('securityControlModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{dataHolder.devices.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetSecurityControl.alert></bb-alert><div class=multiline-entry ng-if=!_.isEmpty(widgetSecurityControl.find)><table class=\"table table-report table-condensed\"><tbody><tr class=bcg-success ng-repeat=\"n in widgetSecurityControl.find\"><td class=text-left>{{n.name}}</td><td class=text-left>{{n.state}}</td><td class=text-left>{{n.time | date:'dd.MM.yyyy H:mm'}}</td></tr></tbody></table></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/sensorBinary.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-default btn-widget-time\" title=\"{{_t('lb_update')}}\" ng-click=\"runCmd(v.id + '/command/update')\"><i class=\"fa fa-clock-o\"></i> <span class=widget-update-time>{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\"><span class=widget-level>{{v.metrics.level}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/sensorDiscrete.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-default btn-widget-time\" title=\"{{_t('lb_update')}}\" ng-click=\"runCmd(v.id + '/command/update')\"><i class=\"fa fa-clock-o\"></i> <span class=widget-update-time>{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\"><span class=widget-scale ng-if=\"v.metrics.cnt !== ''\">{{v.metrics.cnt}}x</span> <span class=widget-scale ng-if=\"v.metrics.cnt === ''\">{{v.metrics.level}}</span> <span class=widget-scale ng-if=\"v.metrics.type === 'B'\">{{_t('button')}} #{{v.metrics.currentScene}}</span> <span class=widget-scale ng-if=\"v.metrics.type === 'G'\">{{_t('gesture')}} #{{v.metrics.currentScene}}</span> <span class=widget-scale>{{_t(v.metrics.state)}}</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/sensorMultilevel.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-default btn-widget-time\" title=\"{{_t('lb_update')}}\" ng-click=\"runCmd(v.id + '/command/update')\"><i class=\"fa fa-clock-o\"></i> <span class=widget-update-time>{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\"><span class=widget-level>{{v.metrics.level}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/sensorMultiline.html',
    "<div ng-if=\"v.metrics.multilineType === 'climateControl'\"><div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn widget-btn-frostProtection\" id=\"btn_frostProtection_{{ v.id}}\" ng-click=\"runCmd(v.id + '/command/' + cfg.climate_state[0] + '?room=null', false)\" ng-class=\"v.metrics.state == cfg.climate_state[0] ? 'btn-primary': 'btn-default'\" title={{_t(cfg.climate_state[0])}}><i class=\"fa fa-asterisk\"></i></button> <button class=\"btn widget-btn-energySave\" id=\"btn_energySave_{{ v.id}}\" ng-click=\"runCmd(v.id + '/command/' + cfg.climate_state[1] + '?room=null', false)\" ng-class=\"v.metrics.state ==cfg.climate_state[1] ? 'btn-primary': 'btn-default'\" title={{_t(cfg.climate_state[1])}}><i class=\"fa fa-leaf\"></i></button> <button class=\"btn widget-btn-comfort\" id=\"btn_comfort_{{ v.id}}\" ng-click=\"runCmd(v.id + '/command/' + cfg.climate_state[2] + '?room=null', false)\" ng-class=\"v.metrics.state == cfg.climate_state[2] ? 'btn-primary': 'btn-default'\" title={{_t(cfg.climate_state[2])}}><i class=\"fa fa-building\"></i></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" ng-click=\"dataHolder.devices.find = v;handleModal('climateControlModal', $event)\"><i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i> <strong>{{_t('nav_rooms')}}</strong></div></div><div ng-if=\"v.metrics.multilineType === 'securityControl'\"><div class=\"widget-ctrl ctrl-left\"><div class=switch-wrap><label class=switch><input type=checkbox ng-checked=\"v.metrics.Clevel === 'cOn'\" ng-model=dataHolder.devices.switchButton[v.id] ng-change=\"runCmd(v.id + '/command/' + (dataHolder.devices.switchButton[v.id] ? 'cOn':'cOff'), v.id)\"><div class=\"slider round\"></div></label></div><div class=btn-group><button class=\"btn btn-off\" ng-class=\"v.metrics.Rlevel=='on' ? 'btn-primary': 'btn-default'\" ng-click=\"runCmd(v.id + '/command/cReset', v.id)\"><i class=\"fa fa-refresh\"></i></button> <button class=\"btn btn-on\" ng-class=\"v.metrics.Alevel =='on' ? 'btn-primary': 'btn-default'\" ng-click=\"runCmd(v.id + '/command/automationToggle', v.id)\"><i class=\"fa fa-clock-o\"></i></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" title=\"{{_t('lb_settings')}}\" ng-click=\"dataHolder.devices.find = v;handleModal('securityControlModal', $event)\"><i class=\"fa fa-caret-down\"></i></div></div><div ng-if=\"v.metrics.multilineType === 'multilineSensor'\"><div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-default btn-widget-time\" title=\"{{_t('lb_update')}}\" ng-click=\"runCmd(v.id + '/command/update')\"><i class=\"fa fa-clock-o\"></i> <span class=widget-update-time>{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" ng-click=\"dataHolder.devices.find = v;handleModal('sensorMultilineModal', $event)\"><i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i> <span class=widget-level>{{v.metrics.level}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div></div><div ng-if=\"v.metrics.multilineType === 'multiButton'\"><div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-off\" id=\"btn_off_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/off?device=null', v.id)\" ng-class=\"v.metrics.level =='off' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_off')}}\"><span class=widget-btn-symbol>0</span></button> <button class=\"btn btn-on\" id=\"btn_on_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/on?device=null', v.id)\" ng-class=\"v.metrics.level =='on' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_on')}}\"><span class=widget-btn-symbol>I</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" ng-click=\"dataHolder.devices.find = v;handleModal('multiButtonModal', $event)\"><i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i> <span class=widget-level>{{v.metrics.level}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div></div><div ng-if=\"v.metrics.multilineType === 'protection'\"><div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-off\" id=\"btn_off_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/disarm', v.id)\" ng-class=\"v.metrics.state =='disarmed' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_disarm')}}\"><span class=widget-btn-symbol>0</span></button> <button class=\"btn btn-on\" id=\"btn_on_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/arm', v.id)\" ng-class=\"v.metrics.state =='armed' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_arm')}}\"><span class=widget-btn-symbol>I</span></button></div></div><div class=\"widget-ctrl ctrl-right\" ng-click=\"dataHolder.devices.find = v;handleModal('sensorMultilineModal', $event)\"><i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i> <span class=widget-level>{{v.metrics.level}}</span></div></div><div ng-if=\"v.metrics.multilineType === 'openWeather'\"><div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-default btn-widget-time\" title=\"{{_t('lb_update')}}\" ng-click=\"runCmd(v.id + '/command/update')\"><i class=\"fa fa-clock-o\"></i> <span class=widget-update-time>{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" ng-click=\"dataHolder.devices.find = v;handleModal('openWeatherModal', $event)\"><i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i> <span class=widget-level>{{v.metrics.level}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/sensorMultilineModal.html',
    "<div id=sensorMultilineModal class=appmodal ng-controller=ElementSensorMultilineController ng-if=modalArr.sensorMultilineModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('sensorMultilineModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetSensorMultiline.find.metrics.title}}</h3></div><div class=appmodal-body><bb-alert alert=widgetSensorMultiline.alert></bb-alert><div class=multiline-entry ng-if=widgetSensorMultiline.find.metrics.sensors><table class=\"table table-report table-condensed\"><tbody><tr ng-repeat=\"n in widgetSensorMultiline.find.metrics.sensors track by n.id\"><td class=td-img><img id=widget_multiline_img_{{n.id}} class=report-img ng-src={{n.iconPath}} alt=\"img\"></td><td><span ng-bind=\"n.metrics.title\"><br></td><td><strong>{{n.metrics.level | numberFixedLen}} {{n.metrics.scaleTitle}}</strong></td><td class=\"text-right tbl-widget-ctrl\"><a class=widget-history href=\"\" ng-click=\"getDeviceById(n.id);handleModal('modalHistory', $event)\" ng-if=n.hasHistory><i class=\"fa fa-history\"></i></a>&nbsp; <button class=\"btn btn-default\" ng-click=\"runCmd(n.id + '/command/update')\" ng-if=\"cfg.element_update_time_btn.indexOf(n.deviceType) > - 1 && n.updateTime\"><i class=\"fa fa-clock-o\"></i> <span class=widget-update-time>{{n.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></button></td></tr></tbody></table></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/switchBinary.html',
    "<div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right\"><div class=btn-group><button class=\"btn btn-off\" id=\"btn_off_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/off', v.id)\" ng-class=\"v.metrics.level =='off' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_off')}}\"><span class=widget-btn-symbol>0</span></button> <button class=\"btn btn-on\" id=\"btn_on_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/on', v.id)\" ng-class=\"v.metrics.level =='on' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_on')}}\"><span class=widget-btn-symbol>I</span></button></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/switchControl.html',
    "<div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right\"><div class=btn-group><button class=\"btn btn-off\" id=\"btn_off_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/off', v.id)\" ng-class=\"v.metrics.level =='off' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_off')}}\"><span class=widget-btn-symbol>0</span></button> <button class=\"btn btn-on\" id=\"btn_on_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/on', v.id)\" ng-class=\"v.metrics.level =='on' ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_on')}}\"><span class=widget-btn-symbol>I</span></button></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/switchMultilevel.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group ng-if=\"v.probeType == 'multilevel'\"><button class=\"btn btn-off\" id=\"btn_off_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/off', v.id)\" ng-class=\"v.metrics.level < 1 ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_off')}}\"><span class=widget-btn-symbol>0</span></button> <button class=\"btn btn-on\" id=\"btn_on_{{ v.id}}\" title=\"{{_t('lb_on')}}\" data-ng-click=\"runCmd(v.id + '/command/on', v.id)\" ng-class=\"v.metrics.level > 0 ? 'btn-primary': 'btn-default'\"><span class=widget-btn-symbol>I</span></button> <button class=btn id=\"btn_max_{{ v.id}}\" data-ng-click=\"setExactCmd( v,v.minMax.max)\" ng-class=\"v.metrics.level == v.minMax.max ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_on')}}\"><i class=\"fa fa-arrow-up\"></i></button></div><div class=btn-group ng-if=\"v.probeType == 'motor'\"><button class=\"btn btn-off\" id=\"btn_off_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/off', v.id)\" ng-class=\"v.metrics.level < 1 ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_down')}}\"><i class=\"fa fa-arrow-down\"></i></button> <button class=\"btn btn btn-on\" id=\"btn_on_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/on', v.id)\" ng-class=\"v.metrics.level > 0 ? 'btn-primary': 'btn-default'\" title=\"{{_t('lb_up')}}\"><i class=\"fa fa-arrow-up\"></i></button> <button class=\"btn btn btn-default\" id=\"btn_stop_{{ v.id}}\" data-ng-click=\"runCmd(v.id + '/command/stop', v.id)\" title=\"{{_t('lb_stop')}}\"><i class=\"fa fa-square text-danger\"></i></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" ng-click=\"dataHolder.devices.find = v;handleModal('switchMultilevelModal', $event)\"><i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i> <span class=widget-level>{{v.metrics.level | getMaxLevel:v.minMax.max}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/switchMultilevelModal.html',
    "<div id=switchMultilevelModal class=appmodal ng-controller=ElementSwitchMultilevelController ng-if=modalArr.switchMultilevelModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('switchMultilevelModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetSwitchMultilevel.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetSwitchMultilevel.alert></bb-alert><div class=\"app-row app-row-knob clearfix\"><div class=\"knob-col knob-ctrl\"><input value={{widgetSwitchMultilevel.find.metrics.level|getMaxLevel:widgetSwitchMultilevel.find.minMax.max}} class=\"dial widget-level-knob\" data-width=160 data-height=160 knob-step=widgetSwitchMultilevel.find.minMax.step knob-min=widgetSwitchMultilevel.find.minMax.min knob-max=widgetSwitchMultilevel.find.minMax.max knob-id=widgetSwitchMultilevel.find.id knob-data=widgetSwitchMultilevel.find.metrics.level knob-options=knobopt ng-model=widgetSwitchMultilevel.find.metrics.level myknob></div><div class=\"knob-col knob-btn\"><p><button class=\"btn btn-primary\" ng-click=\"setExactCmd(widgetSwitchMultilevel.find, '+')\"><i class=\"fa fa-angle-up\"></i></button>&nbsp; <button class=\"btn btn-info\" ng-click=\"setExactCmd(widgetSwitchMultilevel.find, widgetSwitchMultilevel.find.minMax.max)\"><i class=\"fa fa-angle-double-up\"></i></button></p><p><button class=\"btn btn-primary\" ng-click=\"setExactCmd(widgetSwitchMultilevel.find, '-')\"><i class=\"fa fa-angle-down\"></i></button>&nbsp; <button class=\"btn btn-info\" ng-click=\"setExactCmd(widgetSwitchMultilevel.find, widgetSwitchMultilevel.find.minMax.min)\"><i class=\"fa fa-angle-double-down\"></i></button></p><p><button class=\"btn btn-info\" ng-click=\"setExactCmd(widgetSwitchMultilevel.find, widgetSwitchMultilevel.find.minMax.max)\" ng-bind=\"_t('lb_full')\"></button></p></div></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/switchRGBW.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-off\" id=\"btn_off_{{ v.id}}\" ng-class=\"v.metrics.level =='off' ? 'btn-primary': 'btn-default'\" data-ng-click=\"runCmd(v.id + '/command/off', v.id)\" title=\"{{_t('lb_off')}}\"><span class=widget-btn-symbol>0</span></button> <button class=\"btn btn-on\" id=\"btn_on_{{ v.id}}\" ng-class=\"v.metrics.level =='on' ? 'btn-primary': 'btn-default'\" data-ng-click=\"runCmd(v.id + '/command/on', v.id)\" title=\"{{_t('lb_on')}}\"><span class=widget-btn-symbol>I</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" ng-click=\"dataHolder.devices.find = v;handleModal('switchRGBWModal', $event)\"><span class=color-picker-show style=\"background-color: {{v.metrics.color|setRgbColors}}\">&nbsp;</span> <span>RGB <i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i></span></div>"
  );


  $templateCache.put('app/views/elements/widgets/switchRGBWModal.html',
    "<div id=switchRGBWModal class=appmodal ng-controller=ElementSwitchRGBWController ng-if=modalArr.switchRGBWModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('switchRGBWModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetSwitchRGBW.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetSwitchRGBW.alert></bb-alert><div class=\"row wheel-colorpicker\"><div class=\"col-rgb col-sm-6\"><canvas id=wheel_picker var=4 width=300 height=300 ng-mousemove=setColor($element)></canvas><input type=hidden id=\"rgbVal\"></div><div class=\"col-rgb col-sm-6\"><div id=wheel_picker_selected style=\"background-color: {{widgetSwitchRGBW.selectedColor}}\"><div id=wheel_picker_selected_spin ng-if=widgetSwitchRGBW.process><i class=\"fa fa-spinner fa-spin\"></i> {{_t('updating')}}</div></div><div id=wheel_picker_preview style=\"background-color: {{widgetSwitchRGBW.previewColor}}\">&nbsp;</div><p>{{widgetSwitchRGBW.previewColor}}</p></div></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/text.html',
    "<div class=widget-ctrl-block><a href=\"\" ng-click=\"dataHolder.devices.find = v;handleModal('textModal', $event)\">{{v.metrics.text|stripTags|cutText:true:35}} &raquo;</a><br>&nbsp;</div>"
  );


  $templateCache.put('app/views/elements/widgets/textModal.html',
    "<div id=textModal class=appmodal ng-controller=ElementTextController ng-if=modalArr.textModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('textModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetText.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetText.alert></bb-alert><img class=widget-promo-image ng-show=widgetText.find.metrics.icon ng-src={{widgetText.find.metrics.icon}} alt=\"input.title\"><div class=widget-promo-text ng-bind-html=\"widgetText.find.metrics.text | toTrusted\"></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/thermostat.html',
    "<div class=\"widget-ctrl ctrl-left\">&nbsp;</div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\" ng-click=\"dataHolder.devices.find = v;handleModal('thermostatModal', $event)\"><i class=\"fa fa-caret-down\" title=\"{{_t('lb_settings')}}\"></i> <span class=widget-level>{{v.metrics.level}}</span> <span class=widget-scale>{{v.metrics.scaleTitle}}</span></div>"
  );


  $templateCache.put('app/views/elements/widgets/thermostatModal.html',
    "<div id=thermostatModal class=appmodal ng-controller=ElementThermostatController ng-if=modalArr.thermostatModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"handleModal('thermostatModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{widgetThermostat.find.metrics.title}}</h3></div><div class=\"appmodal-body text-center\"><bb-alert alert=widgetThermostat.alert></bb-alert><div class=\"app-row app-row-knob clearfix\"><div class=\"knob-col knob-ctrl\"><input value={{widgetThermostat.find.metrics.level}} class=\"dial widget-level-knob\" data-width=160 data-height=160 knob-step=widgetThermostat.find.minMax.step knob-min=widgetThermostat.find.minMax.min knob-max=widgetThermostat.find.minMax.max knob-id=widgetThermostat.find.id knob-data=widgetThermostat.find.metrics.level knob-options=knobopt ng-model=widgetThermostat.find.metrics.level myknob></div><div class=\"knob-col knob-btn\"><p><button class=\"btn btn-primary\" ng-click=\"setExactCmd(widgetThermostat.find, '+')\"><i class=\"fa fa-angle-up\"></i></button>&nbsp; <button class=\"btn btn-info\" ng-click=\"setExactCmd(widgetThermostat.find, widgetThermostat.find.minMax.max)\"><i class=\"fa fa-angle-double-up\"></i></button></p><p><button class=\"btn btn-primary\" ng-click=\"setExactCmd(widgetThermostat.find, '-')\"><i class=\"fa fa-angle-down\"></i></button>&nbsp; <button class=\"btn btn-info\" ng-click=\"setExactCmd(widgetThermostat.find, widgetThermostat.find.minMax.min)\"><i class=\"fa fa-angle-double-down\"></i></button></p></div></div></div></div></div>"
  );


  $templateCache.put('app/views/elements/widgets/toggleButton.html',
    "<div class=\"widget-ctrl ctrl-left\"><div class=btn-group><button class=\"btn btn-default btn-widget-time\" title=\"{{_t('lb_update')}}\" ng-click=\"runCmd(v.id + '/command/update')\"><i class=\"fa fa-clock-o\"></i> <span class=widget-update-time>{{v.updateTime|isToday:true:_t('lb_days'):_t('lb_yesterday')}}</span></button></div></div><div class=\"widget-ctrl ctrl-right widget-ctrl-click\"><div class=btn-group><button class=\"btn btn-default btn-label-on\" ng-click=\"runCmd(v.id + '/command/on')\" title=\"{{_t('lb_on')}}\">{{_t('lb_on')}}</button></div></div>"
  );


  $templateCache.put('app/views/enocean/assign.html',
    "<div ng-controller=EnoceanAssignController class=mobile-padding><div ng-include=\"'app/views/enocean/navi.html'\"></div><bb-loader></bb-loader><div class=tab-content><div class=\"col-device app-border app-gradient app-shadow\"><table class=\"table table-report table-inclusion\"><tbody><tr><td><span class=\"badge badge-number\">1</span></td><td><strong ng-bind=\"_t('assign_profile')\"></strong><div class=form-group><select name=enoceanProfiles class=form-control ng-model=profile ng-change=loadDevice(profile) ng-disabled=\"inclusion.promisc || inclusion.done\"><option value={{manProfile}} ng-repeat=\"v in enoceanProfiles| orderBy:'_funcDescription'\" ng-init=\"manProfile = {rorg:v._rorg,funcId: v._func,typeId: v._type}\">{{v._funcDescription}} | rorg: {{v._rorg}} | func: {{v._func}} | type: {{v._type}}</option></select></div></td></tr><tr><td><span class=\"badge badge-number\">2</span></td><td><strong ng-bind=\"_t('teach_in')\"></strong><div class=alert ng-if=inclusion.message ng-class=inclusion.status><i class=fa ng-class=inclusion.icon></i> <span ng-bind-html=\"inclusion.message | toTrusted\"></span> <button class=\"btn btn-danger\" ng-if=\"!inclusion.done && inclusion.promisc\" ng-click=\"runCmd('controller.data.promisc=false')\"><i class=\"fa fa-ban\"></i> <span class=btn-name>{{_t('stop_teachin')}}</span></button> <button class=\"btn btn-success\" ng-if=\"!inclusion.done && !inclusion.promisc\" ng-click=\"runCmd('controller.data.promisc=true')\"><i class=\"fa fa-plug\"></i> <span class=btn-name>{{_t('start_teachin')}}</span></button></div></td></tr><tr><td><span class=\"badge badge-number\">3</span></td><td><strong ng-bind=\"_t('lb_settings')\"></strong><form name=form_enocean_config id=form_enocean_config class=\"form form-page\" ng-if=inclusion.config novalidate><fieldset><div class=\"form-group form-inline\"><input name=enocean_name id=enocean_name class=\"form-control form-control-md\" ng-model=lastIncludedDevice.name value=\"{{lastIncludedDevice.name}}\"> <button class=\"btn btn-primary\" ng-click=\"runCmd('devices[\\'x' + lastIncludedDevice.id + '\\'].data.givenName=\\'' + lastIncludedDevice.name + '\\'')\" ng-bind=\"_t('rename_device')\"></button></div></fieldset><div class=\"alert alert-warning\" ng-if=\"apiDevices.length < 1\"><i class=\"fa fa-exclamation-circle\"></i> <span ng-bind=\"_t('enocean_no_settings')\"></span></div><fieldset ng-if=apiDevices><div class=\"form-group form-inline\" ng-repeat=\"e in apiDevices| orderBy:'title':false\" ng-init=\"dev[e.id] = e\"><h3><img id=widget_img_{{v.id}} class=report-img ng-src={{e.iconPath}} alt=\"img\"> <span ng-bind=dev[e.id].metrics.title></span></h3><div><input name=fdf class=\"form-control form-control-md\" ng-model=dev[e.id].metrics.title value=\"{{dev[e.id].metrics.title}}\"> <button class=\"btn btn-primary\" ng-click=updateDevice(dev[e.id]) ng-bind=\"_t('rename_element')\"></button> <button class=btn ng-click=\"updateDevice({id: e.id, permanently_hidden: e.permanently_hidden ? false : true})\" ng-bind=\"e.permanently_hidden ? _t('show_element') : _t('hide_element')\" ng-class=\"e.permanently_hidden ? 'btn-danger' : 'btn-info'\"></button></div></div></fieldset><fieldset ng-if=apiDevices><div class=\"form-group form-inline\" ng-if=rooms><h3><i class=\"fa fa-chevron-down\"></i> <span ng-bind=\"_t('devices_to_room')\"></span></h3><select class=form-control ng-model=modelRoom><option value=\"\">------</option><option ng-repeat=\"v in rooms\" ng-selected_=\"input.location == v.id\" value={{v.id}} ng-bind=v.title></option></select><button class=\"btn btn-primary\" ng-click=\"devicesToRoom(modelRoom, apiDevices)\" ng-bind=\"_t('lb_save')\"></button></div></fieldset></form></td></tr></tbody></table></div><div class=\"submit-entry save-continue\" ng-if=inclusion.done><a href=#enocean/manage class=\"btn btn-info\">{{_t('continue')}} <i class=\"fa fa-chevron-right\"></i></a></div></div><div class=device-logo ng-include=\"'app/views/enocean/enocean_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/enocean/controller.html',
    "<div ng-controller=EnoceanControllerController class=mobile-padding><bb-loader></bb-loader><div ng-include=\"'app/views/enocean/navi.html'\"></div><div class=tab-content><table class=\"table table-report table-condensed\"><tbody><tr ng-repeat=\"(k,v) in controller\" id=\"row_controller_{{ v}}\" ng-if=\"controllerShow.indexOf(k) > -1\"><td style=\"width: 30%\" ng-bind=k></td><td ng-bind=v.value></td></tr></tbody></table></div><div class=device-logo ng-include=\"'app/views/enocean/enocean_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/enocean/devices.html',
    "<div ng-controller=EnoceanDeviceController class=mobile-padding><bb-loader></bb-loader><bb-alert alert=alert></bb-alert><div ng-if=hasEnOcean><div class=\"app-row app-row-vendor clearfix\" ng-hide=enoceanDevices><div class=vendor-entry ng-repeat=\"v in manufacturers\"><a ng-href=#enocean/devices/{{v.vendor}} class=vendor-list><p class=vendor-image><img ng-src=storage/img/enocean/vendors/{{v.vendorLogo}} alt=img ng-show=\"v.vendorLogo\"></p></a></div></div><div ng-if=manufacturer><h3><button class=\"btn btn-default\" bb-go-back><i class=\"fa fa-arrow-left\"></i></button> {{manufacturer}}</h3><div class=\"app-row app-row-report app-row-enoceanadd clearfix\"><div id=row_enoceanadd_{{v.id}} class=report-entry ng-repeat=\"v in enoceanDevices track by v.id\"><div class=\"report-col report-media\"><img class=product-img ng-src=storage/img/enocean/devices/{{v.image}} alt=\"img\"></div><div class=\"report-col report-body\">{{v.name}}</div><div class=\"report-col report-ctrl\"><a href=#enocean/teachin/{{v.id}} class=\"btn btn-default\" title=\"{{_t('teach_in')}}\"><i class=\"fa fa-plug text-primary\"></i></a></div></div></div></div></div><div class=device-logo ng-include=\"'app/views/enocean/enocean_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/enocean/enocean_nav.html',
    " <a href=#devices><img class=apps-image ng-src=app/img/logo-enocean.png alt=\"Logo\"></a>"
  );


  $templateCache.put('app/views/enocean/manage.html',
    "<div ng-controller=EnoceanManageController class=mobile-padding><bb-loader></bb-loader><div ng-include=\"'app/views/enocean/navi.html'\"></div><div ng-if=enoceanDevices><table class=\"table table-condensed table-report\"><tbody><tr id=enocean_row_{{v.id}} ng-repeat=\"v in enoceanDevices track by v.id\"><td class=text-left><a href=\"\" class=network-zwave-title ng-click=\"goEdit[v.id] = !goEdit[v.id]\"><i class=fa ng-class=\"goEdit[v.id] ? 'fa-chevron-up': 'fa-chevron-down'\"></i> <span ng-bind=v.givenName></span> (#{{v.id}})</a><div class=network-zwave-element ng-repeat=\"e in v.elements| orderBy:'title':false\" ng-if=goEdit[v.id]><img class=report-img ng-src={{e.iconPath}} alt=\"img\"> <span class=network-hidden-{{e.permanently_hidden}} ng-bind=e.title></span></div></td><td class=td-action><div class=btn-group><a href=#enocean/manage/x{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_configuration')}}\"><i class=\"fa fa-cog\"></i></a> <button title=\"{{_t('lb_remove')}}\" class=\"btn btn-default\" ng-click=\"deleteDevice(v.id, '#enocean_row_' + v.id, _t('lb_delete_confirm'))\"><i class=\"fa fa-remove text-danger\"></i></button></div></td></tr></tbody></table></div><div class=device-logo ng-include=\"'app/views/enocean/enocean_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/enocean/manage_detail.html',
    "<div ng-controller=EnoceanManageDetailController class=mobile-padding><bb-loader></bb-loader><div ng-include=\"'app/views/enocean/navi.html'\"></div><div class=tab-content><h2><span ng-bind=\"_t('enocean_device')\"></span>: {{input.name}} (#{{input.id}})</h2><form name=form_enocean_edit id=form_enocean_edit class=\"form form-page\" ng-submit=store(input) novalidate><fieldset><h3><i class=\"fa fa-chevron-down\"></i> <span ng-bind=\"_t('lb_name')\"></span></h3><div class=form-group><input name=name id=name class=form-control value={{input.name}} ng-model=\"input.name\"></div><h3><i class=\"fa fa-chevron-down\"></i> <span ng-bind=\"_t('select_profile')\"></span></h3><div class=form-group><select name=enoceanProfiles class=form-control ng-model=input.profileId><option value={{manProfile}} ng-repeat=\"v in enoceanProfiles | orderBy:'_funcDescription'\" ng-init=\"manProfile = {rorg:v._rorg,funcId: v._func,typeId: v._type}\" ng-selected=\"v.id == input.deviceProfileId\" ng-if=\"input.rorg == v.rorgInt\">{{v._funcDescription}} | rorg: {{v._rorg}} | func: {{v._func}} | type: {{v._type}}</option></select></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form><form name=form_enocean_config id=form_enocean_config class=\"form form-page\" novalidate ng-if=apiDevices><fieldset><div class=\"form-group form-inline\" ng-repeat=\"e in apiDevices | orderBy:'title':false\" ng-init=\"dev[e.id] = e\"><h3><img id=widget_img_{{v.id}} class=report-img ng-src={{e.iconPath}} alt=\"img\"> <span ng-bind=dev[e.id].metrics.title></span></h3><div><input name=fdf class=\"form-control form-control-md\" ng-model=dev[e.id].metrics.title value=\"{{dev[e.id].metrics.title}}\"> <button class=\"btn btn-primary\" ng-click=updateDevice(dev[e.id]) ng-bind=\"_t('rename_element')\"></button> <button class=btn ng-click=\"updateDevice({id: e.id,permanently_hidden: e.permanently_hidden ? false : true})\" ng-bind=\"e.permanently_hidden ? _t('show_element') : _t('hide_element')\" ng-class=\"e.permanently_hidden ? 'btn-danger' : 'btn-info'\"></button></div></div></fieldset><fieldset><div class=\"form-group form-inline\"><h3><i class=\"fa fa-chevron-down\"></i> <span ng-bind=\"_t('devices_to_room')\"></span></h3><select class=form-control ng-model=modelRoom><option ng-repeat=\"v in rooms\" value={{v.id}} ng-bind=\"(v.id === 0 ? _t(v.title) : v.title)\"></option></select><button class=\"btn btn-primary\" ng-click=\"devicesToRoom(modelRoom, apiDevices)\" ng-bind=\"_t('lb_save')\"></button></div></fieldset></form><div class=\"fieldset submit-entry\"><button class=\"btn btn-submit\" title=\"{{_t('continue')}}\" bb-go-back><span class=btn-name>{{_t('continue')}}</span> <i class=\"fa fa-chevron-right\"></i></button></div></div><div class=device-logo ng-include=\"'app/views/enocean/enocean_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/enocean/navi.html',
    "<div class=\"tabs-wrap form-inline\"><div class=\"btn-group btn-goup-tabs btn-tabs-3\"><a class=\"btn btn-default\" href=#enocean/controller title=\"{{_t('controller_info')}}\" ng-class=\"routeMatch('/enocean/controller') ? 'active' : ''\"><i class=\"fa fa-info-circle\"></i> <span class=btn-name>{{_t('controller_info')}}</span></a> <a class=\"btn btn-default\" href=#enocean/manage title=\"{{_t('manage')}}\" ng-class=\"routeMatch('/enocean/manage') ? 'active' : ''\"><i class=\"fa fa-bolt\"></i> <span class=btn-name>{{_t('manage')}}</span></a> <a class=\"btn btn-default\" href=#enocean/assign title=\"{{_t('teach_in')}}\" ng-class=\"routeMatch('/enocean/assign') ? 'active' : ''\"><i class=\"fa fa-sitemap\"></i> <span class=btn-name>{{_t('teach_in')}}</span></a></div></div>"
  );


  $templateCache.put('app/views/enocean/teachin.html',
    "<div ng-controller=EnoceanTeachinController class=mobile-padding><bb-loader></bb-loader><div class=\"form form-inline form-page\"><div class=\"fieldset clearfix\"><div class=include-device-img ng-if=device.image><img class=include-image-detail ng-src=storage/img/enocean/devices/{{device.image}} alt=img ng-if=\"device.image\"></div><div class=include-device-body><h1 ng-if=!device.name ng-bind=\"_t('teach_in')\"></h1><h1 ng-if=device.name ng-bind=device.name></h1><p ng-if=device.description ng-bind=device.description></p></div></div><div class=\"fieldset clearfix\"><table class=\"table table-report table-inclusion\"><tbody><tr><td><span class=\"badge badge-number\">1</span></td><td><div class=alert ng-if=inclusion.message ng-class=inclusion.status><i class=fa ng-class=inclusion.icon></i> <span ng-bind-html=\"inclusion.message | toTrusted\"></span> <button class=\"btn btn-danger\" ng-if=\"!inclusion.done && inclusion.promisc\" ng-click=\"runCmd('controller.data.promisc=false')\"><i class=\"fa fa-ban\"></i> <span class=btn-name>{{_t('stop_teachin')}}</span></button> <button class=\"btn btn-success\" ng-if=\"!inclusion.done && !inclusion.promisc\" ng-click=\"runCmd('controller.data.promisc=true')\"><i class=\"fa fa-plug\"></i> <span class=btn-name>{{_t('start_teachin')}}</span></button></div></td></tr><tr><td><span class=\"badge badge-number\">2</span></td><td><strong ng-bind=\"_t('lb_settings')\"></strong><form name=form_enocean_config id=form_enocean_config class=\"form form-page\" ng-if=inclusion.config novalidate><fieldset><div class=\"form-group form-inline\"><input name=enocean_name id=enocean_name class=\"form-control form-control-md\" ng-model=lastIncludedDevice.name value=\"{{lastIncludedDevice.name}}\"> <button class=\"btn btn-primary\" ng-click=\"runCmd('devices[\\'x' + lastIncludedDevice.id + '\\'].data.givenName=\\'' + lastIncludedDevice.name + '\\'')\" ng-bind=\"_t('rename_device')\"></button></div></fieldset><div class=\"alert alert-warning\" ng-if=\"apiDevices.length < 1\"><i class=\"fa fa-exclamation-circle\"></i> <span ng-bind=\"_t('enocean_no_settings')\"></span></div><fieldset ng-if=apiDevices><div class=\"form-group form-inline\" ng-repeat=\"e in apiDevices | orderBy:'title':false\" ng-init=\"dev[e.id] = e\"><h3><img id=widget_img_{{v.id}} class=report-img ng-src={{e.iconPath}} alt=\"img\"> <span ng-bind=dev[e.id].metrics.title></span></h3><div><input name=fdf class=\"form-control form-control-md\" ng-model=dev[e.id].metrics.title value=\"{{dev[e.id].metrics.title}}\"> <button class=\"btn btn-primary\" ng-click=updateDevice(dev[e.id]) ng-bind=\"_t('rename_element')\"></button> <button class=btn ng-click=\"updateDevice({id: e.id,permanently_hidden: e.permanently_hidden ? false : true})\" ng-bind=\"e.permanently_hidden ? _t('show_element') : _t('hide_element')\" ng-class=\"e.permanently_hidden ? 'btn-danger' : 'btn-info'\"></button></div></div></fieldset><fieldset ng-if=apiDevices><div class=\"form-group form-inline\" ng-if=rooms><h3><i class=\"fa fa-chevron-down\"></i> <span ng-bind=\"_t('devices_to_room')\"></span></h3><select class=form-control ng-model=modelRoom><option value=\"\">------</option><option ng-repeat=\"v in rooms\" ng-selected_=\"input.location == v.id\" value={{v.id}} ng-bind=v.title></option></select><button class=\"btn btn-primary\" ng-click=\"devicesToRoom(modelRoom, apiDevices)\" ng-bind=\"_t('lb_save')\"></button></div></fieldset></form></td></tr></tbody></table></div><div class=\"fieldset submit-entry\"><a href=#enocean/manage class=\"btn btn-submit\"><span class=btn-name>{{_t('manage_enocean_devices')}}</span> <i class=\"fa fa-chevron-right\"></i></a></div></div><div class=device-logo ng-include=\"'app/views/enocean/enocean_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/error_403.html',
    "<div class=app-fatal-error><div class=fatal-error-message><i class=\"fa fa-exclamation-triangle fa-lg\"></i> {{_t('error_403')}}</div></div>"
  );


  $templateCache.put('app/views/events/dropdown.html',
    "<div class=\"btn-group group-event-dropdown\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_settings')}}\" ng-click=\"expandNavi('evDropDown_' + $index, $event)\"><i class=\"fa fa-caret-down\"></i></button><div class=\"app-dropdown dropdown-events\" ng-if=\"naviExpanded['evDropDown' + '_' + $index]\"><ul><li><a ng-href=#events><i class=\"fa fa-eye\"></i> <span ng-bind=\"_t('lb_show_all')\"></span></a></li><li><a ng-href=#events/source/{{v.source}}><i class=\"fa fa-check\"></i> <span ng-bind=\"_t('lb_events_source')\"></span></a></li><li><a ng-href=#events/type/{{v.type}}><i class=\"fa fa-check-square\"></i> <span ng-bind=\"_t('lb_events_type')\"></span></a></li><li><a ng-href=\"#events/source_type?source={{v.source}}&type={{v.type}}\"><i class=\"fa fa-check-circle\"></i> <span ng-bind=\"_t('lb_events_source_type')\"></span></a></li><li ng-if=\"elementAccess(cfg.role_access.element) && (cfg.events_clickable.indexOf(v.level) > -1) && (v.source && v.message)\"><a href=#element/{{v.source}}><i class=\"fa fa-cog\"></i> <span ng-bind=\"_t('lb_source_cfg')\"></span></a></li><li><a href=\"\" ng-click=hideSourceEvents(v.source) ng-if=\"user.hide_single_device_events.indexOf(v.source) === -1\"><i class=\"fa fa-minus-circle text-danger\"></i> <span ng-bind=\"_t('lb_hide_events_source')\"></span></a></li><li ng-if=elementAccess(cfg.role_access.event_delete)><a href=\"\" ng-click=\"deleteEvent(v.id, '?uid=' + v.h,_t('lb_delete_confirm'))\" ng-if=\"v.level == 'error' || v.level == 'notification'\"><i class=\"fa fa-times text-danger\"></i> <span ng-bind=\"_t('lb_delete_event')\"></span></a></li></ul></div></div>"
  );


  $templateCache.put('app/views/events/events.html',
    "<div ng-controller=EventController><bb-loader></bb-loader><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-2\"><button class=\"btn btn-default\" ng-click=\"expandNavi('evFilter', $event)\" ng-class=\"devices.find.title || currLevel ? 'active':'' \"><i class=\"fa fa-filter\"></i> <span ng-if=\"!devices.find.title && !currLevel\">{{_t('lb_show_all')}}</span> <span ng-if=devices.find.title>{{devices.find.title | cutText:true:15}}</span> <span ng-if=currLevel>{{_t('lb_notify_' + currLevel)}}</span></button> <button class=\"btn btn-default\" ng-click=\"expandNavi('evDays', $event)\" ng-switch=timeFilter.day><i class=\"fa fa-calendar-check-o\"></i> <span ng-switch-when=2>{{_t('lb_yesterday')}}</span> <span ng-switch-when=7>7 {{_t('lb_days')}}</span> <span ng-switch-default>{{_t('lb_today')}}</span></button></div></div><div class=page-navi ng-if=naviExpanded.evFilter><div class=page-navi-in><div class=page-navi-content><a class=\"btn btn-default btn-tag\" ng-href=#events/level/{{v.key}} ng-repeat=\"v in eventLevels\" ng-class=\"v.key == currLevel? 'active': ''\">{{_t('lb_notify_' + v.val)}}</a></div><div ng-if=devices.show><div class=page-navi-content><a class=\"btn btn-default btn-tag\" ng-href=#events/source/{{v.id}} ng-repeat=\"v in devices.data\" ng-class=\"v.id===devices.find.id ? 'active':''\" ng-if=devices.cnt.deviceEvents[v.id]><img class=navi-img ng-src={{v.iconPath}} alt=\"img\"> {{v.metrics.title|cutText:true:25}} <span class=item-cnt>({{devices.cnt.deviceEvents[v.id]}})</span></a></div></div></div></div><div class=page-navi ng-if=naviExpanded.evDays><div class=page-navi-in><div class=page-navi-content><a class=\"btn btn-default btn-tag\" href=\"\" ng-class=\"timeFilter.day == 1 ? 'active': ''\" ng-click=changeTime(1)>{{_t('lb_today')}}</a> <a class=\"btn btn-default btn-tag\" href=\"\" ng-class=\"timeFilter.day == 2 ? 'active': ''\" ng-click=changeTime(2)>{{_t('lb_yesterday')}}</a> <a class=\"btn btn-default btn-tag\" href=\"\" ng-class=\"timeFilter.day == 7 ? 'active': ''\" ng-click=changeTime(7)>7 {{_t('lb_days')}}</a></div></div></div><div class=info-lert ng-if=\"devices.find.id && collection.length < 1\"><i class=\"fa fa-info-circle text-info\"></i> {{_t('device_no_event')}}.</div><div class=info-lert ng-if=\"user.hide_all_device_events || user.hide_system_events\"><i class=\"fa fa-info-circle text-info\"></i> <span ng-bind=\"_t('events_hidden')\"></span></div><div class=\"app-row app-row-report app-row-event clearfix\"><div class=\"report-entry event-level-{{v.level}}\" dir-paginate=\"v in collection | orderBy: '-timestamp' | itemsPerPage: pageSize track by $index\" current-page=currentPage id=row_{{v.id}}><div class=\"report-col report-media\"><img id=event_img_{{v.id}} class=report-img ng-src={{v.type|getEventIcon:v.message}} alt=\"{{v.type}}\"></div><div class=\"report-col report-body\"><span class=\"text-supp event-date\" title=\"{{v.timestamp| date:'dd.MM.yyyy H:mm'}}\" ng-bind=\"v.timestamp | eventDate\"></span> <span class=hide-on-mobile>|</span> <span ng-if=\"v.source && v.message\"><a ng-href=#element/{{v.source}} ng-if=\"elementAccess(cfg.role_access.element) && (cfg.events_clickable.indexOf(v.level) > -1)\"><span ng-if=\"v.message | hasNode:'l'\"><span ng-bind=v.message.dev></span> {{_t('lb_is')}} <strong ng-bind=v.message.l></strong></span> <span ng-if=\"!(v.message | hasNode:'l')\" ng-bind=v.message></span></a> <span ng-if=\"!elementAccess(cfg.role_access.element) || (cfg.events_clickable.indexOf(v.level) === -1)\"><span ng-if=\"v.message | hasNode:'l'\"><span ng-bind=v.message.dev></span> {{_t('lb_is')}} <strong ng-bind=v.message.l></strong></span> <span ng-if=\"!(v.message | hasNode:'l')\" ng-bind=v.message></span></span></span> <span class=report-message ng-bind=v.message ng-if=\"!v.source && !v.message\"></span></div><div class=\"report-col report-ctrl\" ng-include=\"'app/views/events/dropdown.html'\"></div></div></div><div class=\"text-center mobile-padding\" ng-if=\"collection.length > 0\"><dir-pagination-controls boundary-links=true></dir-pagination-controls></div></div>"
  );


  $templateCache.put('app/views/expertui/commands.html',
    "<div class=cfg-block ng-controller=ConfigCommandsController><div class=row><div class=col-md-6><h2>{{hasConfigurationCc.commandClass}}</h2><div class=commands-data ng-repeat=\"c in hasConfigurationCc.command| orderBy:predicate:reverse\" ng-init=\"formName = 'form_' + c.data.method + '_' + v.rowId\"><form name={{formName}} id={{formName}} class=\"form form_commands\" role=form ng-submit=\"submitExpertCommndsForm(formName, hasConfigurationCc.cmd + '.' + c.data.method,c)\" novalidate><div class=commands-data-control><div class=form-inline ng-repeat=\"(pk,p) in c.data.params\"><expert-command-input collection=p values=c.data.values[pk] devices=devices name=c.data.method get-node-devices=getNodeDevices></expert-command-input></div><button type=submit class=\"btn btn-primary\" id=\"btn_update_{{ v.rowId}}\">{{c.data.method}}</button></div></form></div></div><div class=col-md-6><table class=\"table _table-report\"><thead><tr><th>{{_t('param')}}</th><th>{{_t('date')}}</th><th>{{_t('size')}}</th><th>{{_t('value')}}</th><th>&nbsp;</th></tr></thead><tbody><tr class=\"{{v.isEqual ? 'na':'bcg-success'}}\" ng-repeat=\"v in ccConfiguration.all track by $index\"><td>{{v.param}}</td><td><span ng-class=\"v.isUpdated ? 'color-green':'color-red'\">{{v.updateTime | isTodayFromUnix}}</span></td><td>{{v.size || '-'}}</td><td>{{v.val || '-'}}</td><td><bb-row-spinner spinner=rowSpinner[v.rowId] icon=\"'fa-minus icon-hidden'\"></bb-row-spinner></td></tr></tbody></table></div></div></div>"
  );


  $templateCache.put('app/views/expertui/configuration.html',
    "<div ng-controller=ConfigConfigurationController class=mobile-padding><bb-loader></bb-loader><div ng-show=\"deviceId > 0\"><h1>(#{{deviceId}}) <span ng-bind=deviceName></span></h1><div ng-include=\"'app/views/expertui/commands.html'\" ng-if=hasConfigurationCc.command></div><div class=cfg-block id=config_cont ng-if=configCont><h2>{{_t('configurations_list')}}</h2><div class=alert-list><p class=\"text-danger text-alert-list\" ng-repeat=\"v in configCont\" ng-if=\"v.configCconfigValue != v.configZwaveValue\">{{v.label}}: {{_t('value_changed_to')}} <strong config-value-title collection=v show_value=v.configCconfigValue></strong> {{_t('value_not_stored_indevice')}}</p></div><div class=cfg-block-content ng-init=\"formName = 'form_config'\"><form name={{formName}} id={{formName}} class=form role=form ng-submit=\"submitApplyConfigCfg(formName,{'id': deviceId,'instance': '0','commandclass': '70','command': 'Set'}, configCont, hasBattery)\" novalidate><div class=cfg-control-content id=cfg_control_{{v.confNum}} ng-repeat=\"v in configCont\"><div class=form-inline><expert-command-input collection=v div_id=$index default_value=v.defaultValue show_default_value=v.showDefaultValue curr_value=v.configCconfigValue></expert-command-input></div><div class=\"text-danger text-alert\" ng-if=\"v.configCconfigValue != v.configZwaveValue\" title=\"Val: {{v.configCconfigValue}} | Device: {{v.configZwaveValue}}\"><i class=\"fa fa-exclamation-triangle\"></i> {{_t('value_changed_to')}} <strong config-value-title collection=v show_value=v.configCconfigValue></strong> {{_t('value_not_stored_indevice')}}</div><p class=cfg-info><span class=is-updated-{{v.isUpdated}}>{{_t('updated')}}: {{v.updateTime}}</span> <span>| {{_t('default_value_is')}}:<config-default-value collection=v show_default_value=v.showDefaultValue default_value=v.defaultValue></config-default-value></span> <span ng-if=v.description>| <a href=\"\" ng-click=\"goInfo = !goInfo\"><i class=\"fa fa-info-circle\"></i></a> <em ng-show=goInfo>{{v.description}}</em></span></p><button type=button class=\"btn btn-info spin-true\" ng-click=\"submitApplyConfigCfg(formName, {'id': deviceId, 'instance': '0', 'commandclass': '70', 'command': 'Set'}, configCont, hasBattery,v.confNum)\">{{_t('apply_config_into_device')}} <i class=\"fa fa-spinner fa-spin\"></i></button></div><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <a class=\"btn btn-primary\" title=\"{{_t('btn_update_from_device')}}\" ng-click=\"updateFromDeviceCfg('devices[' + deviceId + '].instances[0].commandClasses[0x70].Get', configCont,deviceId)\"><i class=\"fa fa-refresh\"></i> <span class=btn-name>{{_t('btn_update_from_device')}}</span></a> <button type=submit title=\"{{_t('apply_config')}}\" class=\"btn btn-submit\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('apply_config')}}</span></button></fieldset></form></div></div><div class=cfg-block id=wakeup_cont ng-if=wakeupCont><h2>{{_t('wakeup_list')}}</h2><div class=cfg-block-content ng-init=\"formName = 'form_wakeup'\"><form name={{formName}} id={{formName}} class=form role=form ng-submit=\"submitApplyConfigCfg(formName,{'id': deviceId,'instance': '0','commandclass': '84','command': 'Set'}, wakeupCont, hasBattery)\" novalidate><div class=clearfix></div><div class=cfg-control-content><div ng-repeat=\"v in wakeupCont.params\"><div class=form-inline><expert-command-input collection=v values=wakeupCont.values[0] devices=devices get-node-devices=getNodeDevices curr_value=wakeupCont.configCconfigValue curr_node_value=wakeupCont.configCconfigNodeValue name=wakeupCont.name></expert-command-input></div></div><div class=clearfix></div><p class=cfg-info><span class=is-updated-{{wakeupCont.isUpdated}}>{{_t('updated')}}: {{wakeupCont.updateTime}}</span> <span>| {{_t('default_value_is')}}:<config-default-value collection=v show_default_value=wakeupCont.showDefaultValue default_value=wakeupCont.defaultValue></config-default-value></span></p></div><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <a href=\"\" class=\"btn btn-primary\" title=\"{{_t('btn_update_from_device')}}\" ng-click=\"updateFromDevice(wakeupCont.cmd + '.Get()',hasBattery)\"><i class=\"fa fa-refresh\"></i> <span class=btn-name>{{_t('btn_update_from_device')}}</span></a> <button type=submit title=\"{{_t('apply_config')}}\" class=\"btn btn-submit\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('apply_config')}}</span></button></fieldset></form></div></div><div class=cfg-block id=switchall_cont ng-if=switchAllCont><h2>{{_t('switchall_list')}}</h2><div class=cfg-block-content ng-init=\"formName = 'form_switch_all'\"><form name={{formName}} id={{formName}} class=form role=form ng-submit=\"submitApplyConfigCfg(formName,{'id': deviceId,'instance': '0','commandclass': '27','command': 'Set'}, switchAllCont, hasBattery)\" novalidate><div class=cfg-control-content ng-repeat=\"v in switchAllCont.params\"><div class=form-inline><expert-command-input collection=v values=switchAllCont.values[0] default_value=switchAllCont.defaultValue curr_value=switchAllCont.configCconfigValue name=switchAllCont.name is_dropdown=1></expert-command-input></div><p class=cfg-info><span class=is-updated-{{switchAllCont.isUpdated}}>{{_t('updated')}}: {{switchAllCont.updateTime}}</span> <span>| {{_t('default_value_is')}}:<config-default-value collection=v show_default_value=switchAllCont.showDefaultValue default_value=switchAllCont.defaultValue></config-default-value></span></p></div><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <a class=\"btn btn-primary\" title=\"{{_t('btn_update_from_device')}}\" ng-click=\"updateFromDevice(switchAllCont.cmd + '.Get()',hasBattery)\"><i class=\"fa fa-refresh\"></i> <span class=btn-name>{{_t('btn_update_from_device')}}</span></a> <button type=submit title=\"{{_t('apply_config')}}\" class=\"btn btn-submit\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('apply_config')}}</span></button></fieldset></form></div></div><div class=cfg-block id=protection_cont ng-if=protectionCont><h2>{{_t('protection_list')}}</h2><div class=cfg-block-content ng-init=\"formName = 'form_protection_list'\"><form name={{formName}} id={{formName}} class=form role=form ng-submit=\"submitApplyConfigCfg(formName,{'id': deviceId,'instance': '0','commandclass': '75','command': 'Set'}, protectionCont, hasBattery)\" novalidate><div class=cfg-control-content ng-repeat=\"v in protectionCont.params\"><div class=form-inline><expert-command-input collection=v values=protectionCont.values[0] default_value=protectionCont.defaultValue curr_value=protectionCont.configCconfigValue name=protectionCont.name is_dropdown=1></expert-command-input></div><p class=cfg-info><span class=is-updated-{{protectionCont.isUpdated}}>{{_t('updated')}}: {{protectionCont.updateTime}}</span> <span>| {{_t('default_value_is')}}:<config-default-value collection=v show_default_value=protectionCont.showDefaultValue default_value=protectionCont.defaultValue></config-default-value></span></p></div><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <a class=\"btn btn-primary\" title=\"{{_t('btn_update_from_device')}}\" ng-click=\"updateFromDevice(protectionCont.cmd + '.Get()',hasBattery)\"><i class=\"fa fa-refresh\"></i> <span class=btn-name>{{_t('btn_update_from_device')}}</span></a> <button title=\"{{_t('apply_config')}}\" type=submit class=\"btn btn-submit\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('apply_config')}}</span></button></fieldset></form></div></div></div></div>"
  );


  $templateCache.put('app/views/jamesbox/update.html',
    "<div ng-controller=JbUpdateController><bb-loader></bb-loader><div id=jamesBoxConfirmModal class=appmodal ng-if=jamesbox.showConfirm><div class=appmodal-in><div class=appmodal-header><h3>{{_t('jamesbox_software_upgrade')}}</h3></div><div class=appmodal-body><div class=\"alert alert-warning\">{{_t('jamesbox_current_firmware', {__currentfw__: jamesbox.version, __newfw__: jamesbox.versionNew})}}</div><div class=text-center><button class=\"btn btn-submit btn-lg\" title=\"{{_t('update_now')}}\" ng-click=firmwareUpdate()><i class=\"fa fa-check\"></i> {{_t('update_now')}}</button></div></div><div class=appmodal-footer><a ng-href=#dashboard class=\"btn btn-default\" title=\"{{_t('jamesbox_not_update')}}\"><span class=btn-name>{{_t('jamesbox_not_update')}}</span> <i class=\"fa fa-arrow-right\"></i></a></div></div></div><div id=jamesBoxUpdateModal class=appmodal ng-if=jamesbox.showUpdate><div class=appmodal-in><div class=appmodal-header><h3>{{_t('jamesbox_software_upgrade')}}</h3></div><div class=appmodal-body><div id=jamesboxUpdateInfo><div id=updateTimeout>{{_t('jamesbox_update_update_timeout')}}</div><div>{{_t('jamesbox_update_follow_steps')}}</div></div><ol><li class=jamesboxUpdateInfoList>{{_t('jamesbox_update_1')}}</li><li class=jamesboxUpdateInfoList>{{_t('jamesbox_update_2')}}</li><li class=jamesboxUpdateInfoList>{{_t('jamesbox_update_3')}}</li></ol><div class=\"alert alert-warning\"><i class=\"fa fa-exclamation-circle\"></i> {{_t('jamesbox_update_attention')}}</div><div class=text-center><button class=\"btn btn-submit btn-lg\" title=\"{{_t('reboot_now')}}\" ng-click=systemReboot()><i class=\"fa fa-check\"></i> {{_t('reboot_now')}}</button></div></div><div class=appmodal-footer><button class=\"btn btn-default\" title=\"{{_t('jamesbox_not_update')}}\" ng-click=cancelUpdate()><span class=btn-name>{{_t('jamesbox_not_update')}}</span> <i class=\"fa fa-arrow-right\"></i></button></div></div></div></div>"
  );


  $templateCache.put('app/views/management/__management_cloud_backup.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('cloud')\"><i class=\"fa fa-download\"></i> <span ng-bind=\"_t('backup')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.backup ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.cloud ng-controller=ManagementCloudBackupController><bb-loader></bb-loader><bb-alert alert=managementCloud.alert></bb-alert><form name=form_cloud_backup id=form_cloud_backup class=\"form form-page\" ng-submit=\"updateInstance(form_cloud_backup, managementCloud.instance)\" novalidate><fieldset><p>{{_t('backup_info')}}</p><div class=btn-group><button class=\"btn btn-default\" type=button title=\"{{_t('nm_backup_download')}}\" ng-click=downLoadBackup()><i class=\"fa fa-download\"></i> <span class=btn-name>{{_t('download_backup_computer')}}</span></button> <button class=\"btn btn-default\" type=button title=\"{{_t('activate_module',{__module__ : 'CloudBackup'})}}\" ng-click=\"activateCloudBackup(managementCloud.instance,(managementCloud.instance.active ? false : true))\" ng-class=\"managementCloud.instance.active ? 'active' : ''\" ng-disabled=\"managementCloud.email === ''? true : false\"><i class=\"fa fa-cloud\" ng-class=\"managementCloud.instance.active ? 'text-success' : 'text-danger'\"></i> <span class=btn-name>{{_t('activate_module',{__module__ : 'CloudBackup'})}}</span></button></div></fieldset><div ng-if=\"managementCloud.instance.active === true\"><fieldset><div class=\"form-group form-inline\"><a class=\"btn btn-default\" href=https://service.z-wave.me/cloudbackup/ target=_blank title=\"{{_t('online_cloudbackup')}}\"><i class=\"fa fa-cloud-download\"></i> <span class=btn-name>{{_t('online_cloudbackup')}}</span></a></div><div class=\"form-group form-inline\"><label>{{managementCloud.module.options.fields.email.label}}:</label><input name=email id=email type=email class=form-control disabled value={{managementCloud.email}} ng-model=\"managementCloud.email\"></div><div class=form-group><h4>{{managementCloud.module.options.fields.email_log.label}}</h4><div ng-repeat=\"v in managementCloud.module.schema.properties.email_log.enum track by $index\"><input type=radio name=email_log value={{v}} id=email_log_{{v}} ng-model=managementCloud.instance.params.email_log ng-checked=\"managementCloud.instance.params.email_log === v\"><label>{{managementCloud.module.options.fields.email_log.optionLabels[$index]}}</label></div></div></fieldset><fieldset ng-if=managementCloud.instance.params.user_active><p class=btn-group><button class=\"btn btn-default\" title=\"{{_t('daily')}}\" type=button ng-repeat=\"v in managementCloud.module.schema.properties.scheduler.enum track by $index\" ng-class=\"v === managementCloud.instance.params.scheduler ? 'active' : ''\" ng-click=setSchedulerType(v)>{{managementCloud.module.options.fields.scheduler.optionLabels[$index]}}</button></p><div class=\"form-group form-inline form-block\"><span ng-if=\"managementCloud.module.options.fields.hours.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.hours.label}}</label><select class=form-control ng-model=managementCloud.instance.params.hours ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.hours.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.hours\">{{v}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.minutes.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.minutes.label}}</label><select class=form-control ng-model=managementCloud.instance.params.minutes ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.minutes.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.minutes\">{{v}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.weekDays.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.weekDays.label}}</label><select class=form-control ng-model=managementCloud.instance.params.weekDays ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.weekDays.enum track by $index\" ng-selected=\"v.toString() === managementCloud.instance.params.weekDays\">{{managementCloud.module.options.fields.weekDays.optionLabels[$index]}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.days.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.days.label}}</label><select class=form-control ng-model=managementCloud.instance.params.days ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.days.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.days\">{{v}}</option></select></span><div ng-if=\"managementCloud.instance.params.scheduler === '0'\"><button class=\"btn btn-default\" title=\"{{_t('upload_backup')}}\" type=button ng-click=manualCloudBackup()><i class=\"fa fa-cloud-upload\"></i> <span class=btn-name>{{_t('upload_backup')}}</span></button></div></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\" ng-disabled=form_cloud_backup.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></div></form></div>"
  );


  $templateCache.put('app/views/management/_management_add_mobile_device.html',
    ""
  );


  $templateCache.put('app/views/management/_management_backup.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('backup')\"><i class=\"fa fa-download\"></i> <span ng-bind=\"_t('backup')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.backup  ? 'fa-chevron-up':'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.backup><div class=\"form form-inline form-page\"><div class=fieldset><p>{{_t('backup_info')}}</p></div><div class=\"fieldset submit-entry\"><a class=\"btn btn-submit\" ng-href=\"{{cfg.server_url + cfg.api.backup}}\" title=\"{{_t('nm_backup_download')}}\"><i class=\"fa fa-download\"></i> <span class=btn-name>{{_t('nm_backup_download')}}</span></a></div></div></div>"
  );


  $templateCache.put('app/views/management/_management_cloud_backup.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('cloud')\"><i class=\"fa fa-cloud-download\"></i> <span ng-bind=\"_t('backup_cloud')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.backup ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.cloud ng-controller=ManagementCloudBackupController><bb-loader></bb-loader><bb-alert alert=managementCloud.alert></bb-alert><form name=form_cloud_backup id=form_cloud_backup class=\"form form-page\" ng-if=managementCloud.show ng-submit=\"updateInstance(form_cloud_backup, managementCloud.instance)\" novalidate><fieldset><div class=\"form-group form-inline\"><label>{{managementCloud.module.options.fields.email.label}}:</label><input name=email id=email type=email class=form-control value={{managementCloud.instance.params.email}} ng-model=managementCloud.instance.params.email ng-required=true ng-blur=\"emailBlur = true\"><bb-validator input-name=form_cloud_backup.email.$error.required trans=_t(&quot;field_required&quot;) has-blur=emailBlur></bb-validator><bb-validator input-name=form_cloud_backup.email.$error.email trans=_t(&quot;email_invalid&quot;) has-blur=emailBlur></bb-validator></div><div class=form-group><h4>{{managementCloud.module.options.fields.email_log.label}}</h4><div ng-repeat=\"v in managementCloud.module.schema.properties.email_log.enum track by $index\"><input type=radio name=email_log value={{v}} id=email_log_{{v}} ng-model=managementCloud.instance.params.email_log ng-checked=\"managementCloud.instance.params.email_log === v\"><label>{{managementCloud.module.options.fields.email_log.optionLabels[$index]}}</label></div></div></fieldset><fieldset ng-if=managementCloud.instance.params.user_active><div class=btn-group><button class=\"btn btn-default\" title=\"{{_t('daily')}}\" type=button ng-repeat=\"v in managementCloud.module.schema.properties.scheduler.enum track by $index\" ng-class=\"v === managementCloud.instance.params.scheduler ? 'active' : ''\" ng-click=setSchedulerType(v)>{{managementCloud.module.options.fields.scheduler.optionLabels[$index]}}</button></div><div class=\"form-group form-inline form-block\"><span ng-if=\"managementCloud.module.options.fields.hours.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.hours.label}}</label><select class=form-control ng-model=managementCloud.instance.params.hours><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.hours.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.hours\">{{v}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.minutes.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.minutes.label}}</label><select class=form-control ng-model=managementCloud.instance.params.minutes><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.minutes.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.minutes\">{{v}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.weekDays.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.weekDays.label}}</label><select class=form-control ng-model=managementCloud.instance.params.weekDays><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.weekDays.enum track by $index\" ng-selected=\"v.toString() === managementCloud.instance.params.weekDays\">{{managementCloud.module.options.fields.weekDays.optionLabels[$index]}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.days.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.days.label}}</label><select class=form-control ng-model=managementCloud.instance.params.days><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.days.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.days\">{{v}}</option></select></span><div ng-if=\"managementCloud.instance.params.scheduler === '0'\"><a class=\"btn btn-default\" ng-href={{managementCloud.module.defaults.api}} title=\"{{_t('upload_backup')}}\"><i class=\"fa fa-cloud-upload\"></i> <span class=btn-name>{{_t('upload_backup')}}</span></a></div></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\" ng-disabled=form_cloud_backup.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/management/_management_restore.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('restore')\"><i class=\"fa fa-repeat\"></i> <span ng-bind=\"_t('nm_restore_backup_upload')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.restore  ? 'fa-chevron-up':'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.restore ng-controller=ManagementRestoreController><bb-loader></bb-loader><div class=\"form form-page\"><div class=fieldset><bb-alert alert=managementRestore.alert></bb-alert><div ng-hide=managementRestore.alert.message><div class=\"alert alert-warning\"><input type=checkbox name=restore_confirm value=1 id=restore_confirm ng-click=\"managementRestore.confirm = !managementRestore.confirm\"> <span ng-bind=\"_t('are_you_sure_restore')\"></span></div><div class=form-group ng-show=managementRestore.confirm><input type=file class=form-control_ file-model=\"myFile\"></div></div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-submit\" title=\"{{_t('nm_restore_pick_up')}}\" ng-click=uploadFile() ng-disabled=\"!managementRestore.confirm || managementRestore.alert.message\"><i class=\"fa fa-upload\"></i> <span class=btn-name>{{_t('nm_restore_pick_up')}}</span></button></div></div></div>"
  );


  $templateCache.put('app/views/management/management.html',
    "<div ng-controller=ManagementController class=mobile-padding><div class=accordion-entry ng-include=\"'app/views/management/management_user.html'\"></div><div class=accordion-entry ng-include=\"'app/views/management/management_remote.html'\"></div><div class=accordion-entry ng-if=handleLicense.show ng-include=\"'app/views/management/management_licence.html'\"></div><div class=accordion-entry ng-include=\"'app/views/management/management_local.html'\" ng-if=\"cfg.app_type === 'jb'\"></div><div class=accordion-entry ng-include=\"'app/views/management/management_timezone.html'\" ng-if=\"cfg.app_type === 'jb'\"></div><div class=accordion-entry ng-include=\"'app/views/management/management_backup_restore.html'\" ng-if=!isMobile></div><div class=accordion-entry ng-include=\"'app/views/management/management_factory.html'\"></div><div class=accordion-entry ng-if=\"!isMobile && !isInArray(['wd','jb'],cfg.app_type)\" ng-include=\"'app/views/management/management_firmware.html'\"></div><div class=accordion-entry ng-if=\"cfg.app_type === 'jb'\" ng-include=\"'app/views/management/management_firmware_jb.html'\"></div><div class=accordion-entry ng-include=\"'app/views/management/management_appstore.html'\"></div><div class=accordion-entry ng-include=\"'app/views/management/management_report.html'\"></div><div class=accordion-entry ng-include=\"'app/views/management/management_info.html'\"></div></div>"
  );


  $templateCache.put('app/views/management/management_appstore.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('appstore')\"><i class=\"fa fa-cart-plus\"></i> <span ng-bind=\"_t('app_store_access')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.appstore  ? 'fa-chevron-up':'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.appstore ng-controller=ManagementAppStoreController><div class=\"form form-page\"><div class=fieldset>{{_t('app_store_access_info')}}</div><div class=fieldset><div class=\"form-group form-inline\"><div class=input-group><input name=appstore_token id=appstore_token class=form-control placeholder=\"{{_t('add_token')}}\" ng-model=\"appStore.input.token\"> <span class=\"input-group-addon clickable\" title=\"{{_t('add_new')}}\" ng-click=appStoreAddToken()><i class=\"fa fa-plus text-success\"></i></span></div></div><div class=\"form-group last\"><a href=\"\" class=\"btn btn-default btn-tag\" id=tag_{{$index}} title=\"{{_t('lb_remove')}}\" ng-repeat=\"v in appStore.tokens track by $index\" ng-click=\"appStoreRemoveToken(v, _t('lb_delete_confirm'))\">{{v}} <i class=\"fa fa-times text-danger\"></i></a></div></div></div></div>"
  );


  $templateCache.put('app/views/management/management_backup_restore.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('backup_restore')\"><i class=\"fa fa-download\"></i> <span ng-bind=\"_t('backup_restore')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.backup_restore ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.backup_restore ng-controller=ManagementCloudBackupController><bb-loader></bb-loader><form name=form_cloud_backup id=form_cloud_backup class=\"form form-page\" ng-submit=\"updateInstance(form_cloud_backup, managementCloud.instance)\" novalidate><fieldset><h3>{{_t('cloudbackup')}}</h3><p ng-bind-html=\"_t('cloudbackup_info', {__email__ : managementCloud.email === '' ? '<b>'+_t('not_set')+'</b>' : '<b>'+managementCloud.email+'</b>'}) | toTrusted\"></p><bb-alert alert=managementCloud.alert></bb-alert><button class=\"btn btn-default\" type=button title=\"{{_t('activate_module',{__module__ : 'CloudBackup'})}}\" ng-click=\"activateCloudBackup(managementCloud.instance,(managementCloud.instance.active ? false : true))\" ng-class=\"managementCloud.instance.active ? 'active' : ''\" ng-if=\"managementCloud.service_status === '' || managementCloud.service_status === true\" ng-disabled=\"managementCloud.email === ''? true : false\"><i class=\"fa fa-cloud\" ng-class=\"managementCloud.instance.active ? 'text-success' : 'text-danger'\"></i> <span class=btn-name ng-if=\"managementCloud.instance.active === true\">{{_t('cloudbackup_active')}}</span> <span class=btn-name ng-if=\"managementCloud.instance.active === false\">{{_t('cloudbackup_inactive')}}</span> <span class=btn-name ng-if=\"!managementCloud.instance.active && managementCloud.instance.active != false\">{{_t('cloudbackup_install')}}</span></button></fieldset><div ng-if=\"managementCloud.instance.active === true && managementCloud.instance.params.user_active === true && managementCloud.service_status === true\"><fieldset><div class=form-group><h4>{{managementCloud.module.options.fields.email_log.label}}</h4><div ng-repeat=\"v in managementCloud.module.schema.properties.email_log.enum track by $index\"><input type=radio name=email_log value={{v}} id=email_log_{{v}} ng-model=managementCloud.instance.params.email_log ng-checked=\"managementCloud.instance.params.email_log === v\"><label>{{managementCloud.module.options.fields.email_log.optionLabels[$index]}}</label></div></div></fieldset><fieldset><p class=btn-group><button class=\"btn btn-default\" title=\"{{_t('daily')}}\" type=button ng-repeat=\"v in managementCloud.module.schema.properties.scheduler.enum track by $index\" ng-class=\"v === managementCloud.instance.params.scheduler ? 'active' : ''\" ng-click=setSchedulerType(v)>{{managementCloud.module.options.fields.scheduler.optionLabels[$index]}}</button></p><div class=\"form-group form-inline form-block\"><span ng-if=\"managementCloud.module.options.fields.hours.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.hours.label}}</label><select class=form-control ng-model=managementCloud.instance.params.hours ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.hours.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.hours\">{{v}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.minutes.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.minutes.label}}</label><select class=form-control ng-model=managementCloud.instance.params.minutes ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.minutes.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.minutes\">{{v}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.weekDays.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.weekDays.label}}</label><select class=form-control ng-model=managementCloud.instance.params.weekDays ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.weekDays.enum track by $index\" ng-selected=\"v.toString() === managementCloud.instance.params.weekDays\">{{managementCloud.module.options.fields.weekDays.optionLabels[$index]}}</option></select></span> <span ng-if=\"managementCloud.module.options.fields.days.dependencies.scheduler.indexOf(managementCloud.instance.params.scheduler) > -1\"><label>{{managementCloud.module.options.fields.days.label}}</label><select class=form-control ng-model=managementCloud.instance.params.days ng-required=true><option value={{v}} ng-repeat=\"v in managementCloud.module.schema.properties.days.enum track by $index\" ng-selected=\"v === managementCloud.instance.params.days\">{{v}}</option></select></span><div ng-if=\"managementCloud.instance.params.scheduler === '0'\"><button class=\"btn btn-default\" title=\"{{_t('upload_backup')}}\" type=button ng-click=manualCloudBackup()><i class=\"fa fa-cloud-upload\"></i> <span class=btn-name>{{_t('upload_backup')}}</span></button></div></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\" ng-disabled=form_cloud_backup.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></div></form><div class=\"form form-page\"><fieldset><h3>{{_t('local_backup')}}</h3><p ng-bind-html=\"_t('backup_info', {__link__ : 'http://'+hostName+':8083/expert/#/network/control'}) | toTrusted\"></p><button class=\"btn btn-default\" type=button title=\"{{_t('nm_backup_download')}}\" ng-click=downLoadBackup()><i class=\"fa fa-download\"></i> <span class=btn-name>{{_t('download_backup_computer')}}</span></button></fieldset></div></div><div class=accordion-entry-ctrl ng-if=expand.backup_restore ng-controller=ManagementRestoreController><bb-loader></bb-loader><div class=\"form form-page\"><div class=fieldset><h3>{{_t('restore')}}</h3><p ng-bind-html=\"_t('restore_info') | toTrusted\">{{_t('restore_info')}}<div class=\"form-group form-inline\"><a class=\"btn btn-default\" href=https://service.z-wave.me/cloudbackup/ target=_blank title=\"{{_t('online_cloudbackup')}}\"><i class=\"fa fa-cloud-download\"></i> <span class=btn-name>{{_t('online_cloudbackup')}}</span></a></div></p><bb-alert alert=managementRestore.alert></bb-alert><div ng-hide=managementRestore.alert.message><div class=\"alert alert-warning\"><input type=checkbox name=restore_confirm value=1 id=restore_confirm ng-click=\"managementRestore.confirm = !managementRestore.confirm\"> <span ng-bind-html=\"_t('are_you_sure_restore', {__link__ : 'http://'+hostName+':8083/expert/#/network/control'}) | toTrusted\"></span></div><div class=form-group ng-show=managementRestore.confirm><input type=file class=form-control_ file-model=\"myFile\"></div></div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-submit\" title=\"{{_t('nm_restore_pick_up')}}\" ng-click=uploadFile() ng-disabled=\"!managementRestore.confirm || managementRestore.alert.message\"><i class=\"fa fa-upload\"></i> <span class=btn-name>{{_t('nm_restore_pick_up')}}</span></button></div></div></div>"
  );


  $templateCache.put('app/views/management/management_factory.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('factory')\"><i class=\"fa fa-refresh\"></i> <span ng-bind=\"_t('factory_default')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.factory ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.factory ng-controller=ManagementFactoryController><bb-loader></bb-loader><form name=form_factory_default id=form_profile class=\"form form-page\" ng-submit=\"resetFactoryDefault(_t('factory_default_war'))\" novalidate><fieldset><p>{{_t('factory_default_info')}}</p></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('reset_factory_default')}}\"><i class=\"fa fa-refresh\"></i> <span class=btn-name>{{_t('reset_factory_default')}}</span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/management/management_firmware.html',
    "<!-- Admin firmware view -->\r" +
    "\n" +
    "<h2 class=\"accordion-entry-title\" ng-click=\"expandElement('firmware')\">\r" +
    "\n" +
    "    <i class=\"fa fa-level-up\"></i> <span ng-bind=\"_t('firmware_update')\"></span>\r" +
    "\n" +
    "    <i class=\"fa accordion-arrow\" ng-class=\"expand.firmware ? 'fa-chevron-up' : 'fa-chevron-down'\"></i>\r" +
    "\n" +
    "</h2>\r" +
    "\n" +
    "<div class=\"accordion-entry-ctrl\" ng-if=\"expand.firmware\" ng-controller=\"ManagementFirmwareController\">\r" +
    "\n" +
    "    <bb-loader></bb-loader>\r" +
    "\n" +
    "    <form name=\"form_update_device_database\" id=\"form_update_device_database\" class=\"form form-page\" ng-submit=\"updateDeviceDatabase()\">\r" +
    "\n" +
    "        <fieldset>\r" +
    "\n" +
    "            <!-Device database->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <p class=\"form-control-static\">\r" +
    "\n" +
    "                <span ng-bind=\"_t('device_database_info')\"></span>\r" +
    "\n" +
    "            </p>\r" +
    "\n" +
    "        </fieldset>\r" +
    "\n" +
    "        <fieldset class=\"submit-entry\">\r" +
    "\n" +
    "            <button type=\"submit\" class=\"btn btn-submit\" title=\"{{_t('btn_update_device_database')}}\">\r" +
    "\n" +
    "                <i class=\"fa fa-level-up\"></i> <span class=\"btn-name\">{{_t('btn_update_device_database')}}</span>\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "        </fieldset>\r" +
    "\n" +
    "    </form>\r" +
    "\n" +
    "    <form name=\"form_firmware\" id=\"form_firmware\" class=\"form form-page\" ng-submit=\"updateFirmware()\" novalidate>\r" +
    "\n" +
    "        <fieldset>\r" +
    "\n" +
    "            <!-- Currentt version -->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <p class=\"form-control-static\">\r" +
    "\n" +
    "                <span ng-bind=\"_t('current_firmware')\"></span>: <strong ng-bind=\"controllerInfo.softwareRevisionVersion\"></strong>\r" +
    "\n" +
    "            </p>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <div class=\"form-group\">\r" +
    "\n" +
    "                <bb-help-text trans=\"_t('firmware_update_info')\"></bb-help-text>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "        </fieldset>\r" +
    "\n" +
    "        <fieldset class=\"submit-entry\">\r" +
    "\n" +
    "            <button type=\"button\" class=\"btn btn-submit\" title=\"{{_t('update_to_latest')}}\"\r" +
    "\n" +
    "                    ng-click=\"setAccess('?allow_access=1',true);handleModal('firmwareUpdateModal', $event)\">\r" +
    "\n" +
    "                <i class=\"fa fa-level-up\"></i> <span class=\"btn-name\">{{_t('update_to_latest')}}</span>\r" +
    "\n" +
    "            </button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "        </fieldset>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    </form>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!-- firmwareUpdateModal -->\r" +
    "\n" +
    "    <div id=\"firmwareUpdateModal\" class=\"appmodal appmodal-100\" ng-if=\"modalArr.firmwareUpdateModal && firmwareUpdate.show\">\r" +
    "\n" +
    "        <div class=\"appmodal-in\">\r" +
    "\n" +
    "            <div class=\"appmodal-header\">\r" +
    "\n" +
    "                <span class=\"appmodal-close\" ng-click=\"setAccess('?allow_access=0');handleModal('firmwareUpdateModal', $event)\"><i class=\"fa fa-times\"></i></span>\r" +
    "\n" +
    "                <h3>{{_t('firmware_update')}}</h3>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "            <div class=\"appmodal-body text-center\">\r" +
    "\n" +
    "               <iframe ng-src=\"{{firmwareUpdate.url}}\" height=\"600\" style=\"width: 100%;\" ng-if=\"firmwareUpdate.loaded\"></iframe> \r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('app/views/management/management_firmware_jb.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('firmware')\"><i class=\"fa fa-level-up\"></i> <span ng-bind=\"_t('firmware_update')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.firmware ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.firmware ng-controller=ManagementFirmwareController><bb-loader></bb-loader><div class=\"form form-page\"><div class=fieldset><p class=form-control-static><span ng-bind=\"_t('current_firmware')\"></span>: <strong ng-bind=controllerInfo.softwareRevisionVersion></strong></p><div class=form-group><bb-help-text trans=\"_t('jb_upgrade_info')\"></bb-help-text></div></div></div><div id=firmwareUpdateModal class=\"appmodal appmodal-100\" ng-if=\"modalArr.firmwareUpdateModal && firmwareUpdate.show\"><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=\"setAccess('?allow_access=0');handleModal('firmwareUpdateModal', $event)\"><i class=\"fa fa-times\"></i></span><h3>{{_t('firmware_update')}}</h3></div><div class=\"appmodal-body text-center\"><iframe ng-src={{firmwareUpdate.url}} height=600 style=\"width: 100%\" ng-if=firmwareUpdate.loaded></iframe></div></div></div></div>"
  );


  $templateCache.put('app/views/management/management_info.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('appinfo')\"><i class=\"fa fa-info-circle\"></i> <span ng-bind=\"_t('info')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.appinfo ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.appinfo ng-controller=ManagementInfoController><div class=\"form form-inline form-page\"><div class=fieldset><h3>{{_t('software_info')}}</h3><table class=\"table table-report\"><tbody><tr><td>{{_t('firmware_version')}}</td><td class=td20>{{controllerInfo.softwareRevisionVersion}}</td></tr><tr><td>{{_t('ui_version')}}</td><td class=td20>{{cfg.app_version}}</td></tr><tr><td>{{_t('built_date')}}</td><td class=td20>{{builtInfo.built}}</td></tr><tr><td>{{_t('ctrl_info_caps_cap_title')}}</td><td class=td20>{{controllerInfo.capabillities}}</td></tr></tbody></table></div><div class=fieldset><h3>{{_t('translation')}}</h3><div>{{_t('management_trans_info')}}</div></div></div></div>"
  );


  $templateCache.put('app/views/management/management_licence.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('licence')\"><i class=\"fa fa-key\"></i> <span ng-bind=\"_t('licence_upgrade')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.licence  ? 'fa-chevron-up':'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-class=\"\" ng-if=expand.licence ng-controller=ManagementLicenceController><bb-loader></bb-loader><bb-alert alert=handleLicense.alert></bb-alert><form name=form_licence id=form_password class=\"form form-page\" ng-submit=getLicense(inputLicence) ng-if=!handleLicense.error novalidate><fieldset><div class=\"alert alert-danger\" ng-if=handleLicense.replug><i class=\"fa fa-plug\"></i> {{_t('replug_device')}}</div><p>{{_t('licence_upgrade_key')}}</p><p class=form-inline><label>{{_t('licence_key_insert')}}:</label><input class=\"form-control form-control-sm\" name=scratch_id id=scratch_id value={{inputLicence.scratch_id}} ng-disabled=handleLicense.disabled ng-model=\"inputLicence.scratch_id\"></p><div><p ng-if=proccessVerify.message><i ng-class=proccessVerify.status></i> <strong ng-bind=proccessVerify.message></strong></p><p ng-if=proccessUpdate.message><i ng-class=proccessUpdate.status></i> <strong ng-bind=proccessUpdate.message></strong></p></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('btn_licence_verify')}}\" ng-disabled=\"proccessLicence || controllerInfo.isZeroUuid\"><i class=\"fa fa-share\"></i> <span class=btn-name>{{_t('btn_licence_verify')}}</span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/management/management_local.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('local')\"><i class=\"fa fa-database\"></i> <span ng-bind=\"_t('local_access_manage')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.local ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-class=\"\" ng-if=expand.local ng-controller=ManagementLocalController><bb-loader></bb-loader><form name=form_local id=form_local class=\"form form-page\" ng-if=handleTimezone.show ng-submit=updateInstance(handleTimezone.instance)><fieldset><p>{{_t('wan_port_access_info')}}</p><div class=form-group><div><input type=checkbox name=wan_port_access id=wan_port_access value=true ng-model=handleTimezone.instance.params.wan_port_access ng-checked=\"handleTimezone.instance.params.wan_port_access\"><label ng-bind=\"_t('local_access_activate')\"></label><bb-help-text trans=\"_t('timezone_info')\"></bb-help-text></div></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form><div class=\"alert alert-warning\" ng-bind=\"_t('local_access_not_installed')\" ng-if=!handleTimezone.show></div></div>"
  );


  $templateCache.put('app/views/management/management_remote.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('remote')\"><i class=\"fa fa-wifi\"></i> <span ng-bind=\"_t('remote_access_manage')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.remote  ? 'fa-chevron-up':'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-class=\"\" ng-if=expand.remote ng-controller=ManagementRemoteController><bb-loader></bb-loader><form name=form_remote id=form_remote class=\"form form-page\" ng-if=remoteAccess ng-submit=\"putRemoteAccess(remoteAccess, newRemoteAccessPassword)\" novalidate><fieldset><p ng-bind=\"_t('remote_access_info')\"></p><div ng-if=remoteAccess><div class=form-group><p class=form-control-static><span ng-bind=\"_t('remote_access_id')\"></span>: <strong ng-bind=remoteAccess.params.userId></strong></p></div><div class=form-group><div><input type=checkbox name=remote_access value=true id=remote_access ng-model=remoteAccess.params.zbwStatus ng-checked=\"remoteAccess.params.zbwStatus\"><label ng-bind=\"_t('remote_access')\"></label><div class=\"alert alert-warning\" ng-bind=\"_t('remote_access_warning')\" ng-if=!remoteAccess.params.zbwStatus></div></div><div><input type=checkbox name=remote_support value=true id=remote_support ng-model=remoteAccess.params.sshStatus ng-checked=\"remoteAccess.params.sshStatus\"><label ng-bind=\"_t('remote_access_support')\"></label></div></div></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/management/management_report.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('report')\"><i class=\"fa fa-bug\"></i> <span ng-bind=\"_t('nav_report')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.report  ? 'fa-chevron-up':'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.report ng-controller=ManagementReportController><bb-loader></bb-loader><form name=form_report id=form_profile class=\"form form-page\" ng-submit=sendReport(form_report,input) novalidate><fieldset><div class=\"alert alert-warning\"><i class=\"fa fa-exclamation-circle\"></i> {{_t('bugreport_info')}}</div><div class=form-group><textarea name=content id=content class=\"form-control report-content\" ng-blur=\"contentBlur = true\" ng-model=input.content ng-required=true></textarea><bb-validator input-name=form_report.content.$error.required trans=_t(&quot;field_required&quot;) has-blur=contentBlur></bb-validator></div><div class=\"form-group form-inline last\"><label>{{_t('lb_email')}}:</label><input name=email id=email type=email class=form-control value={{input.email}} ng-blur=\"emailBlur = true\" ng-model=input.email ng-required=\"true\"><bb-validator input-name=form_report.email.$error.required trans=_t(&quot;email_invalid&quot;) has-blur=emailBlur></bb-validator></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_submit')}}\" ng-disabled=form_report.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_submit')}}</span></button></fieldset></form></div>"
  );


  $templateCache.put('app/views/management/management_timezone.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('timezone')\"><i class=\"fa fa-clock-o\"></i> <span ng-bind=\"_t('timezone')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.timezone ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-class=\"\" ng-if=expand.timezone ng-controller=ManagementTimezoneController><bb-loader></bb-loader><form name=form_timezone id=form_password class=\"form form-page\" ng-if=handleTimezone.show ng-submit=updateInstance(handleTimezone.instance) novalidate><fieldset><div class=\"form-group form-inline\"><label>{{_t('timezone_select')}}</label><select class=form-control ng-model=handleTimezone.instance.params.timezone><option value={{v}} ng-repeat=\"v in managementTimezone.enums track by $index\" ng-selected=\"v === handleTimezone.instance.params.timezone\">{{managementTimezone.labels[$index]}}</option></select><bb-help-text trans=\"_t('timezone_info')\"></bb-help-text></div></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('set_timezone')}}\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('set_timezone')}}</span></button></fieldset></form><div class=\"alert alert-warning\" ng-bind=\"_t('timezone_not_installed')\" ng-if=!handleTimezone.show></div></div>"
  );


  $templateCache.put('app/views/management/management_user.html',
    "<h2 class=accordion-entry-title ng-click=\"expandElement('user')\"><i class=\"fa fa-users\"></i> <span ng-bind=\"_t('nav_admin')\"></span> <i class=\"fa accordion-arrow\" ng-class=\"expand.user ? 'fa-chevron-up':'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-class=\"\" ng-if=expand.user ng-controller=ManagementUserController><bb-loader></bb-loader><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-1\"><button class=\"btn btn-default\" ng-click=\"expandNavi('roomsOrderBy', $event)\"><i class=\"fa fa-sort-alpha-asc\"></i> <span class=btn-name>{{_t(userProfiles.orderBy) | cutText:true:15}}</span></button></div><div class=input-group><input ng-model=q class=\"form-control form-search\" value={{q}}> <span class=input-group-addon><i class=\"fa fa-search\"></i></span></div></div><div class=page-navi ng-if=naviExpanded.roomsOrderBy><div class=page-navi-in><div class=page-navi-content><p class=page-navi-title>{{_t('sortby')}}</p><a class=\"btn btn-default btn-tag\" href=\"\" ng-repeat=\"(k,v) in cfg.orderby.users\" ng-click=setOrderBy(k) ng-class=\"userProfiles.orderBy == k ? 'active': ''\">{{_t(k) | cutText:true:30}}</a></div></div></div><div class=\"app-row app-row-report app-row-user clearfix\"><div id=row_user_{{v.id}} class=report-entry ng-repeat=\"v in userProfiles.all|orderBy:cfg.orderby.users[userProfiles.orderBy]| filter:q  track by v.id\"><div class=\"report-col report-media\"><img class=report-img ng-src=storage/img/icons/user.png alt=\"{{v.name}}\"></div><div class=\"report-col report-body\">{{v.name|cutText:true:25}}</div><div class=\"report-col report-ctrl\"><div class=btn-group><a class=\"btn btn-default\" ng-href=#admin/user/{{v.id}} title=\"{{_t('lb_update')}}\"><i class=\"fa fa-pencil text-info\"></i></a> <button class=\"btn btn-default\" title=\"{{_t('lb_remove')}}\" ng-hide=\"v.id == 1\" ng-click=\"deleteProfile(v, _t('lb_delete_confirm'), 1)\"><i class=\"fa fa-times text-danger\"></i></button></div></div></div></div><div class=\"fieldset submit-entry\"><a class=\"btn btn-submit\" ng-href=#admin/user/0 title=\"{{_t('lb_add_user')}}\"><i class=\"fa fa-plus\"></i> <span class=btn-name>{{_t('lb_add_user')}}</span></a></div></div>"
  );


  $templateCache.put('app/views/management/management_user_id.html',
    "<div ng-controller=ManagementUserIdController class=mobile-padding><bb-loader></bb-loader><div ng-if=show><h2><span ng-bind=\"_t('lb_user')\"></span>: <span ng-show=\"input.id > 0\">(#{{input.id}})</span> <span ng-bind=input.name></span></h2><form name=form_profile id=form_profile class=\"form form-page\" ng-submit=store(form_profile,input) novalidate><fieldset><div class=\"form-group form-inline\"><label class=\"isrequired display-block\">{{_t('lb_name')}}:</label><input name=name id=name class=form-control value={{input.name}} ng-model=input.name ng-blur=\"nameBlur = true\" ng-required=\"true\"><bb-validator input-name=form_profile.name.$error.required trans=_t(&quot;field_required&quot;) has-blur=nameBlur></bb-validator></div><div class=\"form-group form-inline\"><label class=display-block>{{_t('lb_email')}}:</label><input name=email id=email type=email class=form-control value={{input.email}} ng-model=input.email ng-blur=\"emailBlur = true\"><bb-validator input-name=form_profile.email.$error.email trans=_t(&quot;email_invalid&quot;) has-blur=emailBlur></bb-validator></div></fieldset><fieldset ng-if=\"id == 0\"><div class=form-group><label class=isrequired>{{_t('lb_login')}}:</label><input name=login id=login class=\"form-control form-control-sm\" value={{input.login}} ng-model=input.login g-blur=\"loginBlur = true\" ng-required=\"true\"><bb-validator input-name=form_profile.name.$error.required trans=_t(&quot;field_required&quot;) has-blur=loginBlur></bb-validator></div><div class=form-group><label class=isrequired>{{_t('lb_password')}}:</label><input name=password id=password type=password class=\"form-control form-control-sm\" ng-model=input.password ng-blur=\"passwordBlur = true\" ng-required=true ng-minlength=\"6\"><bb-validator input-name=form_profile.password.$error.required trans=_t(&quot;field_required&quot;) has-blur=passwordBlur></bb-validator><bb-validator input-name=form_profile.password.$error.minlength trans=_t(&quot;password_valid&quot;) has-blur=passwordBlur></bb-validator></div><div class=form-group><label class=isrequired>{{_t('confirm_password')}}:</label><input name=password_confirm id=password_confirm type=password class=\"form-control form-control-sm\" ng-blur=\"passwordConfirmBlur = true\" ng-model=input.passwordConfirm bb-compare-to=\"password\"><bb-validator input-name=form_profile.password_confirm.$error.compareto trans=_t(&quot;passwords_must_match&quot;) has-blur=passwordConfirmBlur></bb-validator></div></fieldset><fieldset><h3><span ng-bind=\"_t('lb_settings')\"></span></h3><div><div class=\"form-group form-inline\" ng-if=\"user.id != id\"><label>{{_t('lb_role')}}:</label><input type=radio name=role value=1 ng-model=input.role ng-checked=\"input.role == 1\" bb-integer> {{_t('lb_admin')}}<input type=radio name=role value=2 ng-model=input.role ng-checked=\"input.role == 2\" bb-integer> {{_t('lb_user')}}<input type=radio name=role value=3 ng-model=input.role ng-checked=\"input.role == 3\" bb-integer> {{_t('lb_local')}}<input type=radio name=role value=4 ng-model=input.role ng-checked=\"input.role == 4\" bb-integer> {{_t('lb_anonymous')}}</div><div class=\"form-group form-inline\"><label>{{_t('lb_language')}}:</label><span ng-repeat=\"v in cfg.lang_list\"><input class=form-control-hidden type=radio name=color value={{v}} ng-model=input.lang ng-checked=\"input.color == v\"> <img class=\"form-control-img profile-lang\" ng-click=\"input.lang = v\" ng-class=\"v == input.lang ? 'control-active':''\" ng-src=app/img/flags/{{v}}.png alt=\"{{ v}}\"></span> <span ng-bind=input.lang></span></div></div></fieldset><fieldset ng-if=\"input.role === 1\"><h3>{{_t('lb_allow_access_to_all_rooms')}}</h3></fieldset><fieldset ng-if=\"input.role !== 1\"><h3>{{_t('lb_allow_rooms')}}</h3><div><div class=device-available-block><a href=\"\" class=\"btn btn-default btn-tag\" ng-repeat=\"d in rooms\" ng-if=\"input.rooms.indexOf(d.id) > -1\" ng-click=removeRoom(d.id)>{{d.title|cutText:true:20}} <i class=\"fa fa-times text-danger\"></i></a></div><h3>{{_t('lb_available_rooms')}}</h3><div class=device-available-block><a href=\"\" class=\"btn btn-default btn-tag\" ng-repeat=\"d in rooms\" ng-if=\"input.rooms.indexOf(d.id) === -1\" ng-click=assignRoom(d.id)>{{d.title|cutText:true:20}} <i class=\"fa fa-plus text-success\"></i></a></div></div></fieldset><fieldset class=submit-entry><button type=button class=\"btn btn-default\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit class=\"btn btn-submit\" ng-disabled=form_profile.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form><div ng-if=\"id > 0\"><h2 ng-bind=\"_t('local_access')\"></h2><form name=form_password id=form_password class=\"form form-page\" ng-submit=changeAuth(form_password) novalidate><fieldset><div class=\"form-group form-inline\"><label class=\"isrequired display-block\">{{_t('lb_login')}}: <em>{{input.login}}</em></label><input name=login id=login class=form-control ng-model=auth.login ng-blur=\"loginBlur = true\" ng-required=\"true\"><bb-validator input-name=form_password.name.$error.required trans=_t(&quot;field_required&quot;) has-blur=loginBlur></bb-validator></div><div class=\"form-group form-inline\"><label class=\"isrequired display-block\">{{_t('lb_new_password')}}:</label><input name=password id=password type=password class=form-control ng-model=auth.password ng-blur=\"passwordBlur = true\" ng-required=true ng-minlength=\"6\"><bb-validator input-name=form_password.password.$error.required trans=_t(&quot;field_required&quot;) has-blur=passwordBlur></bb-validator><bb-validator input-name=form_password.password.$error.minlength trans=_t(&quot;password_valid&quot;) has-blur=passwordBlur></bb-validator></div><div class=\"form-group form-inline\"><label class=\"isrequired display-block\">{{_t('confirm_password')}}:</label><input name=password_confirm id=password_confirm type=password class=form-control ng-blur=\"passwordConfirmBlur = true\" ng-model=input.passwordConfirm bb-compare-to=\"password\"><bb-validator input-name=form_password.password_confirm.$error.compareto trans=_t(&quot;passwords_must_match&quot;) has-blur=passwordConfirmBlur></bb-validator></div></fieldset><fieldset class=submit-entry><button type=button class=\"btn btn-default\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit class=\"btn btn-submit\" ng-disabled=form_password.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_submit')}}</span></button></fieldset></form></div></div></div>"
  );


  $templateCache.put('app/views/mysettings/mysettings.html',
    "<div ng-controller=MySettingsController class=mobile-padding><bb-loader></bb-loader><div ng-show=input><h2 ng-bind=\"_t('nav_myaccess')\"></h2><form name=form_profile id=form_profile class=\"form form-page\" ng-submit=store(form_profile,input) novalidate><fieldset><div class=\"form-group form-inline\"><label class=\"isrequired display-block\">{{_t('lb_name')}}:</label><input name=name id=name class=form-control placeholder=\"{{_t('lb_profile_name_insert')}}\" value={{input.name}} ng-model=input.name ng-blur=\"nameBlur = true\" ng-required=\"true\"><bb-validator input-name=form_profile.name.$error.required trans=_t(&quot;field_required&quot;) has-blur=nameBlur></bb-validator></div><div class=\"form-group form-inline\"><label class=display-block>{{_t('lb_email')}}:</label><input name=email id=email type=email class=form-control value={{input.email}} ng-model=input.email ng-blur=\"emailBlur = true\"><bb-validator input-name=form_profile.email.$error.email trans=_t(&quot;email_invalid&quot;) has-blur=emailBlur></bb-validator></div></fieldset><fieldset><h3><span ng-bind=\"_t('lb_settings')\"></span></h3><div><div class=\"form-group form-inline\"><label>{{_t('lb_language')}}:</label><span class=mobile-block><span ng-repeat=\"v in cfg.lang_list\"><input class=form-control-hidden type=radio name=color value={{v}} ng-model=input.lang ng-checked=\"input.color == v\"> <img class=\"form-control-img profile-lang\" ng-click=\"input.lang = v\" ng-class=\"v == input.lang ? 'control-active':''\" ng-src=app/img/flags/{{v}}.png alt=\"{{ v}}\"></span></span></div><div class=\"form-group form-inline\"><label>{{_t('lb_interval')}} ({{_t('miliseconds')}}):</label><input name=interval id=interval class=form-control placeholder=\"{{_t('lb_interval_placeholder')}}\" value={{input.interval}} ng-model=\"input.interval\"></div></div></fieldset><fieldset ng-if=elementAccess(cfg.role_access.expert_view)><h3><span ng-bind=\"_t('lb_expert_view')\"></span></h3><div class=\"form-group form-inline\"><input type=checkbox name=expert_view ng-model=input.expert_view ng-checked=\"input.expert_view\"><label ng-bind=\"_t('lb_expert_app_view')\"></label></div></fieldset><fieldset><h3><span ng-bind=\"_t('nav_events')\"></span></h3><div><div><input type=checkbox name=hide_all_device_events value=true id=hide_all_device_events ng-model=input.hide_all_device_events ng-checked=\"input.hide_all_device_events\"><label ng-bind=\"_t('lb_hide_device_events')\"></label></div><div><input type=checkbox name=hide_system_events value=true id=hide_system_events ng-model=input.hide_system_events ng-checked=\"input.hide_system_events\"><label ng-bind=\"_t('lb_hide_system_events')\"></label></div></div></fieldset><fieldset><h3><span ng-bind=\"_t('lb_hidden_events_device')\"></span></h3><div class=device-assigned-block_><div class=btn-device-admin id=device_assigned_{{$index}} ng-repeat=\"d in devices\" ng-if=\"input.hide_single_device_events.indexOf(d.id) > -1\"><a href=\"\" ng-click=removeDevice(d.id)>{{d.metrics.title}} <i class=\"fa fa-times text-danger\"></i></a></div></div></fieldset><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\" ng-disabled=form_profile.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form><div class=accordion-entry><h2 class=accordion-entry-title ng-click=\"expandElement('settingsaccount')\"><i class=\"fa fa-key\"></i> {{_t('my_local_access')}} <i class=\"fa accordion-arrow\" ng-class=\"expand.settingsaccount ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.settingsaccount ng-controller_=ManagementFirmwareController><form name=form_password id=form_password class=\"form form-inline form-page\" ng-submit=changePassword(form_password,newPassword) novalidate><fieldset><p class=form-control-static><span ng-bind=\"_t('lb_login')\"></span>: <strong ng-bind=input.login></strong></p><div><label class=\"isrequired display-block\">{{_t('lb_new_password')}}:</label><input name=password id=password type=password class=form-control ng-model=newPassword ng-blur=\"passwordBlur = true\" ng-required=true ng-minlength=\"6\"><bb-validator input-name=form_password.password.$error.required trans=_t(&quot;field_required&quot;) has-blur=passwordBlur></bb-validator><bb-validator input-name=form_password.password.$error.minlength trans=_t(&quot;password_valid&quot;) has-blur=passwordBlur></bb-validator></div></fieldset><fieldset><label class=\"isrequired display-block\">{{_t('confirm_password')}}:</label><input name=password_confirm id=password_confirm type=password class=form-control ng-blur=\"passwordConfirmBlur = true\" ng-model=input.passwordConfirm bb-compare-to=\"password\"><bb-validator input-name=form_password.password_confirm.$error.compareto trans=_t(&quot;passwords_must_match&quot;) has-blur=passwordConfirmBlur></bb-validator></fieldset><fieldset class=submit-entry><button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_change_password')}}\" ng-disabled=form_password.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_change_password')}}</span></button></fieldset></form></div></div><div class=accordion-entry><h2 class=accordion-entry-title ng-click=\"expandElement('add_mobile_device')\"><i class=\"fa fa-mobile-phone\"></i> {{_t('add_mobile_device')}} <i class=\"fa accordion-arrow\" ng-class=\"expand.add_mobile_device ? 'fa-chevron-up' : 'fa-chevron-down'\"></i></h2><div class=accordion-entry-ctrl ng-if=expand.add_mobile_device ng-controller=ManagementAddMobileDevice><div class=\"form form-page\"><div class=fieldset><div class=\"form-group form-inline\"><img ng-src=/ZAutomation/api/v1/load/image/{{qrcode}}></div></div></div></div></div></div></div>"
  );


  $templateCache.put('app/views/pages/about.html',
    "<div ng-controller=AboutController class=mobile-padding><h1>{{_t('nav_about')}}</h1><p>This User Interfaces allows to operate a Smart Home Network based on Z-Wave devices. It utilizes the software architecture \"Z_Way\", certified as Z-Wave Plus Controller under the Certification number ZC10-14110009.</p><p><em>All rights reserved by Z-Wave Me, c/o Alsenet S.A. Switzerland</em></p></div>"
  );


  $templateCache.put('app/views/rooms/config_rooms.html',
    "<div ng-controller=RoomController><bb-loader></bb-loader><div ng-if=rooms.show><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-1\"><button class=\"btn btn-default\" ng-click=\"expandNavi('roomsOrderBy', $event)\"><i class=\"fa fa-sort-alpha-asc\"></i> <span class=btn-name>{{_t(rooms.orderBy) | cutText:true:15}}</span></button></div><div class=input-group><input ng-model=q class=\"form-control form-search\" value={{q}}> <span class=input-group-addon><i class=\"fa fa-search\"></i></span></div></div><div class=page-navi ng-if=naviExpanded.roomsOrderBy><div class=page-navi-in><div class=page-navi-content><p class=page-navi-title>{{_t('sortby')}}</p><a class=\"btn btn-default btn-tag\" href=\"\" ng-repeat=\"(k,v) in cfg.orderby.rooms\" ng-click=setOrderBy(k) ng-class=\"rooms.orderBy == k ? 'active': ''\">{{_t(k) | cutText:true:30}}</a></div></div></div><div class=\"app-row app-row-report app-row-room clearfix\"><div id=row_{{v.id}} class=report-entry ng-repeat=\"v in rooms.all|orderBy:cfg.orderby.rooms[rooms.orderBy] | filter:q  track by v.id\" ng-if=\"v.id !== 0\"><div class=\"report-col report-media\"><img class=\"report-img img-circle\" ng-src=\"{{v.img_src}}\"></div><div class=\"report-col report-body\">{{v.title|cutText:true:25}} <span class=item-cnt>({{rooms.cnt.devices[v.id]||0}})</span></div><div class=\"report-col report-ctrl\"><div class=btn-group><a class=\"btn btn-default\" title=\"{{_t('lb_update')}}\" href=#config-rooms/{{v.id}}><i class=\"fa fa-pencil text-info\"></i></a> <button class=\"btn btn-default\" title=\"{{_t('lb_remove')}}\" ng-click=\"deleteRoom(v.id, _t('lb_delete_confirm'))\"><i class=\"fa fa-times text-danger\"></i></button></div></div></div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <a type=button class=\"btn btn-submit\" title=\"{{_t('lb_add_room')}}\" ng-href=#config-rooms/0><i class=\"fa fa-plus\"></i> <span class=btn-name>{{_t('lb_add_room')}}</span></a></div></div></div>"
  );


  $templateCache.put('app/views/rooms/config_rooms_id.html',
    "<div ng-controller=RoomConfigIdController class=mobile-padding><bb-loader></bb-loader><div ng-show=input><h2><span ng-bind=\"_t('lb_room')\"></span>: <span ng-show=\"input.id > 0\">(#{{input.id}})</span> <span ng-bind=input.title></span></h2><form name=form_room id=form_room class=\"form form-page\" ng-submit=store(form_room,input) novalidate><fieldset><h3><span ng-bind=\"_t('lb_name')\"></span></h3><div><div class=form-group><input name=title id=title class=form-control placeholder=\"{{_t('lb_room_name')}}\" value={{input.title}} ng-model=input.title ng-blur=\"titleBlur = true\" ng-required=\"true\"><bb-validator input-name=form_room.title.$error.required trans=_t(&quot;field_required&quot;) has-blur=titleBlur></bb-validator></div></div></fieldset><fieldset class=mobile-hide><h3><span ng-bind=\"_t('lb_select_image')\"></span></h3><div class=clearfix><div class=form-group><img class=\"room-img-upload form-control-img\" ng-repeat=\"v in defaultImages\" ng-click=\"input.default_img = v;input.img_type = 'default'\" ng-class=\"input.img_type == 'default' && v == input.default_img ? 'control-active':''\" ng-src=storage/img/rooms/{{v}} alt=\"{{v}}\"> <img class=\"room-img-upload form-control-img\" ng-click=\"input.user_img = input.user_img;input.img_type = 'user'\" ng-class=\"input.img_type == 'user' ? 'control-active':''\" ng-src=\"{{userImageUrl + input.user_img}}\" ng-if=\"input.user_img\"></div></div></fieldset><fieldset class=mobile-hide><div><div class=form-group><input class=inputfile type=file name=file id=file{{v.id}} ng-click=\"icons.find = v\" onchange=\"angular.element(this).scope().uploadFile(this.files)\"><label for=file{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_upload_image')}}\" ng-click=\"icons.find = v\"><i class=\"fa fa-upload text-success\"></i> {{_t('lb_upload_image')}}</label><div ng-if=file.upload>{{file.upload|cutText:true:30}}</div><bb-help-text trans=\"_t('upload_file_info',{'__size__':file.info.maxSize,'__extensions__': file.info.extensions})\"></bb-help-text><bb-help-text trans=\"_t('image_recommended_dimension',{'__dimension__':cfg.upload.room.dimension})\"></bb-help-text></div></div></fieldset><fieldset><h3><span ng-bind=\"_t('lb_devices_in_room')\"></span></h3><div class=device-available-block><a href=\"\" class=\"btn btn-default btn-tag\" title=\"{{_t('lb_remove')}}\" ng-repeat=\"d in devices\" ng-if=\"devicesAssigned.indexOf(d.id) > -1 && d.location !== 0\" ng-click=removeDevice(d)>{{d.metrics.title|cutText:true:20}} <i class=\"fa fa-times text-danger\"></i></a></div></fieldset><fieldset><h3>{{_t('lb_available_devices')}}</h3><div class=device-available-block><a href=\"\" class=\"btn btn-default btn-tag\" title=\"{{_t('add_new')}}\" ng-repeat=\"d in devices\" ng-if=\"devicesAssigned.indexOf(d.id) === -1 || d.location === 0\" ng-click=assignDevice(d)>{{d.metrics.title|cutText:true:20}} <i class=\"fa fa-plus text-success\"></i></a></div></fieldset><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\" ng-disabled=form_room.$invalid><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form></div></div>"
  );


  $templateCache.put('app/views/rooms/rooms.html',
    "<div ng-controller=RoomController><bb-loader></bb-loader><div class=\"page-control form-inline\"><div class=\"btn-group btn-goup-block btn-goup-1\"><button class=\"btn btn-default\" ng-click=\"expandNavi('roomsOrderBy', $event)\"><i class=\"fa fa-sort-alpha-asc\"></i> <span class=btn-name>{{_t(rooms.orderBy) | cutText:true:15}}</span></button></div><div class=input-group><input ng-model=q class=\"form-control form-search\" value={{q}}> <span class=input-group-addon><i class=\"fa fa-search\"></i></span></div></div><div class=page-navi ng-if=naviExpanded.roomsOrderBy><div class=page-navi-in><div class=page-navi-content><p class=page-navi-title>{{_t('sortby')}}</p><a class=\"btn btn-default btn-tag\" href=\"\" ng-repeat=\"(k,v) in cfg.orderby.rooms\" ng-click=setOrderBy(k) ng-class=\"rooms.orderBy == k ? 'active': ''\">{{_t(k) | cutText:true:30}}</a></div></div></div><div class=\"app-row app-row-room clearfix\" ng-if=rooms.show><div class=\"room-entry has-device-{{rooms.cnt.devices[v.id]||'false'}}\" id=panel_{{$index}} ng-hide=\"v.id === 0 && !rooms.cnt.devices[v.id]\" ng-repeat=\"v in rooms.all|orderBy:cfg.orderby.rooms[rooms.orderBy] | filter:q  track by v.id\"><div class=room-entry-in><h4><a href=#/rooms/{{v.id}} title=\"{{_t('lb_devices_room')}} {{v.title}}\" ng-if=rooms.cnt.devices[v.id]>{{v.title}} <span class=item-cnt>({{rooms.cnt.devices[v.id]}})</span></a> <span ng-if=!rooms.cnt.devices[v.id]>{{v.title}} <span class=item-cnt>(0)</span></span></h4><a ng-href=\"#/rooms{{(rooms.cnt.devices[v.id] ? '/' + v.id : '')}}\" ng-disabled=!rooms.cnt.devices[v.id] title=\"{{_t('lb_devices_room')}} {{v.title}}\"><img class=\"room-image-preview img-circle\" ng-src={{v.img_src}} alt=\"img\"></a></div></div><div class=room-entry id=panel_new_room ng-if=elementAccess(cfg.role_access.config_rooms)><div class=room-entry-in><h4><a href=#config-rooms/0 ng-bind=\"_t('lb_add_room')\"></a></h4><a href=#config-rooms/0><img class=\"room-image-preview img-circle\" src=storage/img/rooms/add-icon.png alt=\"{{_t('lb_add_room')}}\"></a></div></div></div></div>"
  );


  $templateCache.put('app/views/zwave/navi.html',
    "<div class=\"tabs-wrap form-inline\" ng-if=devices.show><div class=\"btn-group btn-goup-tabs btn-tabs-3\"><a class=\"btn btn-default\" href=#zwave/devices title=\"{{_t('lb_zwave_devices')}}\" ng-class=\"routeMatch('/zwave/devices') ? 'active' : ''\"><i class=\"fa fa-wifi\"></i> <span class=btn-name>{{_t('lb_zwave_devices')}}</span></a> <a class=\"btn btn-default\" href=#zwave/batteries title=\"{{_t('lb_battery_status')}}\" ng-class=\"routeMatch('/zwave/batteries') ? 'active' : ''\" ng-if=elementAccess(cfg.role_access.network)><i class=\"fa fa-bolt\"></i> <span class=btn-name>{{_t('lb_battery_status')}}</span></a> <a class=\"btn btn-default\" href=#zwave/network title=\"{{_t('lb_network_status')}}\" ng-class=\"routeMatch('/zwave/network') ? 'active' : ''\" ng-if=elementAccess(cfg.role_access.network)><i class=\"fa fa-sitemap\"></i> <span class=btn-name>{{_t('lb_network_status')}}</span></a></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_batteries.html',
    "<div ng-controller=ZwaveManageController><bb-loader></bb-loader><div ng-include=\"'app/views/zwave/navi.html'\"></div><div class=\"app-row app-row-report app-row-zwave clearfix\"><div id=row_battery_{{v.id}} class=report-entry ng-repeat=\"v in devices.zw| orderBy:'title':false\" ng-if=v.hasBattery><div class=\"report-col report-media\"><img class=report-img ng-src={{v.batteryCharge|getBatteryIcon}} alt=\"img\"></div><div class=\"report-col report-body report-col-w30\"><span class=\"network-zwave-title noelements\" ng-if=\"_.size(v.elements) < 1\">{{v.title}} (#{{v.id}})</span><div class=btn-group ng-if=\"_.size(v.elements) > 0\"><a href=\"\" class=network-zwave-title ng-click=\"expandNavi('accZwaveManage_' + v.id, $event)\"><i class=fa ng-class=\"naviExpanded['accZwaveManage_' + v.id] ? 'fa-chevron-up' : 'fa-chevron-down'\"></i> {{v.title}} (#{{v.id}})</a><div class=\"app-dropdown app-dropdown-left\" ng-if=\"naviExpanded['accZwaveManage_' + v.id]\"><ul><li class=\"clickable zwave-hidden-{{e.permanently_hidden}}\" ng-init=\"elUrl = (e.permanently_hidden ? '': '#/element/' + e.id)\" ng-repeat=\"e in v.elements| orderBy:'metrics.title':false\"><a ng-href={{elUrl}} title={{e.metrics.title}}><img class=report-img-s ng-src={{e.iconPath}} alt=\"img\"> {{e.metrics.title|cutText:true:20}} <span class=zwave-raquo>&raquo;</span></a></li></ul></div></div></div><div class=\"report-col report-battery-info\"><div ng-if=v.date><i class=\"fa fa-clock-o\"></i> {{v.date}}</div><div ng-if=v.awake><i class=\"fa {{v.awake|getAwakeIcon}}\"></i> <span ng-if=v.sleeping ng-bind-html=\"v.sleeping | toTrusted\"></span></div></div><div class=\"report-col report-ctrl\"><span class=text-success ng-show=\"v.batteryCharge >= 80\">{{v.batteryCharge}} %</span> <span class=text-default ng-show=\"v.batteryCharge < 80 && v.batteryCharge > 20\">{{v.batteryCharge}} %</span> <span class=text-danger ng-show=\"v.batteryCharge <= 20\"><i class=\"fa fa-exclamation-triangle\"></i> {{v.batteryCharge}} %</span></div></div></div><div class=device-logo ng-include=\"'app/views/zwave/zwave_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_exclude.html',
    "<div ng-controller=ZwaveExcludeController><div ng-if=zWaveDevice.id><div class=\"device-perex clearfix\"><h2>{{zWaveDevice.name}}</h2><p>{{_t('remove_device_from_network')}}</p></div><div class=form-page><div class=fieldset><div class=\"form-group form-inline\"><div ng-if=\"zWaveDevice.lastExcludedDevice != zWaveDevice.id\"><div class=exclude-device ng-hide=\"[5].indexOf(zWaveDevice.controllerState) > -1\"><p><strong>{{_t('start_removal')}}</strong></p><button class=\"btn btn-default btn-lg\" ng-click=\"runZwaveCmd('controller.RemoveNodeFromNetwork(1)')\"><i class=\"fa fa-play-circle text-success\"></i> {{_t('btn_exclusion_start')}}</button></div><div class=exclude-device ng-show=\"zWaveDevice.controllerState == 5\"><div class=\"alert alert-warning\"><i class=\"fa fa-spinner fa-spin\"></i> <strong>{{_t('confirm_exclusion')}}</strong></div><button class=\"btn btn-default btn-lg\" ng-click=\"runZwaveCmd('controller.RemoveNodeFromNetwork(0)')\"><i class=\"fa fa-ban text-danger\"></i> {{_t('btn_exclusion_stop')}}</button></div></div><div class=exclude-device ng-if=\"zWaveDevice.lastExcludedDevice == zWaveDevice.id\"><div class=\"alert alert-success\"><i class=\"fa fa-check\"></i> <strong>{{_t('lb_device_excluded')}}</strong></div></div></div><div class=\"form-group form-inline\"><div ng-if=!zWaveDevice.removeNodeProcess><div class=exclude-device><button class=\"btn btn-default btn-lg\" ng-disabled_=\"[5, 6, 7, 20].indexOf(controllerState) > -1\" ng-show_=\"[1, 2, 3, 4].indexOf(controllerState) == -1\" ng-click=\"zWaveDevice.removeNode = !zWaveDevice.removeNode\"><i class=\"fa fa-chain-broken text-danger\"></i> {{_t('broken_device')}}</button></div><div class=exclude-device ng-if=zWaveDevice.removeNode><div class=\"alert alert-warning\"><i class=\"fa fa-info-circle\"></i> {{_t('broken_device_war')}}</div><button class=\"btn btn-danger btn-lg\" ng-click=\"removeFailedNode('devices[' + zWaveDevice.id + '].RemoveFailedNode()')\"><i class=\"fa fa-exclamation-triangle\"></i> {{_t('remove_permanently')}}</button></div></div><div class=exclude-device ng-if=zWaveDevice.removeNodeProcess><div class=\"alert alert-warning\"><i class=\"fa fa-spinner fa-spin\"></i> <strong>{{_t('broken_device_info')}}</strong></div></div></div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name ng-bind=\"_t('lb_cancel')\"></span></button></div></div></div><div class=device-logo ng-include=\"'app/views/zwave/zwave_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_inclusion.html',
    "<div ng-controller=ZwaveInclusionController id=zwave_inclusion><bb-loader></bb-loader><div class=\"form form-inline form-page\"><div class=\"fieldset clearfix\"><div class=include-device-img><img class=include-image-detail ng-src={{zwaveInclusion.device.find.product_image}} alt=img ng-if=\"zwaveInclusion.device.find.product_image\"></div><div class=include-device-body><h1 ng-if=zwaveInclusion.device.find>{{zwaveInclusion.device.find.brandname + ' ' + zwaveInclusion.device.find.name}}</h1><h1 ng-if=_.isEmpty(zwaveInclusion.device.find)>{{_t('lb_include_device')}}</h1></div></div><div class=\"fieldset clearfix\"><div class=\"app-row app-row-report clearfix\"><div class=report-entry><div class=\"report-col report-media\"><span class=\"badge badge-number\">1</span></div><div class=\"report-col report-body\"><div class=inclusion-header ng-if=!zwaveInclusion.exclusionProcess.process><h3>{{_t('lb_preparation')}}</h3>{{_t('lb_include_preparation')}} <button class=\"btn btn-default\" title=\"{{_t('lb_include_preparation_start')}}\" ng-disabled=\"zwaveInclusion.inclusionProcess.process || zwaveInclusion.automatedConfiguration.includedDevice.nodeId > 0\" ng-click=startStopExclusion(true)><i class=\"fa fa-refresh\"></i> {{_t('lb_include_preparation_start')}}</button><p ng-if=zwaveInclusion.device.find.prep><em>{{zwaveInclusion.device.find.prep}}</em></p></div><div class=inclusion-process ng-if=zwaveInclusion.exclusionProcess.process><div class=\"alert alert-warning\"><i class=\"fa fa-spinner fa-spin\"></i> {{_t('lb_ready_exclude')}} {{zwaveInclusion.device.find.exc}} <button class=\"btn btn-danger btn-lg\" title=\"{{_t('btn_exclusion_stop')}}\" ng-click=\"startStopExclusion( false)\"><i class=\"fa fa-ban\"></i> <span class=btn-name>{{_t('btn_exclusion_stop')}}</span></button></div></div></div><div class=\"report-col report-ctrl\"><i class=\"fa fa-check fa-2x text-success\" ng-if=zwaveInclusion.exclusionProcess.done></i></div></div><div class=report-entry><div class=\"report-col report-media\"><span class=\"badge badge-number\">2</span></div><div class=\"report-col report-body\"><div class=inclusion-header ng-if=!zwaveInclusion.inclusionProcess.process><h3>{{_t('lb_inclusion_progress')}}</h3><button class=\"btn btn-success btn-lg\" title=\"{{_t('btn_inclusion_start')}}\" ng-disabled=\"zwaveInclusion.exclusionProcess.process || zwaveInclusion.automatedConfiguration.includedDevice.nodeId > 0\" ng-click=startStopInclusion(true)><i class=\"fa fa-plug\"></i> <span class=btn-name>{{_t('btn_inclusion_start')}}</span></button> <button type=button class=\"btn btn-primary btn-lg\" id=btn_force_unsecure_lock ng-class=\"!zwaveInclusion.controller.secureInclusion ? 'active' : ''\" ng-click=\"setSecureInclusion('controller.data.secureInclusion=' + (zwaveInclusion.controller.secureInclusion ? 'false' : 'true'))\" ng-disabled=zwaveInclusion.exclusionProcess.process><i ng-if=!zwaveInclusion.controller.secureInclusion class=\"fa fa-unlock\"></i> <i ng-if=zwaveInclusion.controller.secureInclusion class=\"fa fa-lock\"></i></button></div><div class=inclusion-process ng-if=zwaveInclusion.inclusionProcess.process><div class=\"alert alert-warning\"><i class=\"fa fa-spinner fa-spin\"></i> {{_t('lb_ready_include')}} {{zwaveInclusion.device.find.inc}} <button class=\"btn btn-danger btn-lg\" title=\"{{_t('btn_inclusion_stop')}}\" ng-click=startStopInclusion(false)><i class=\"fa fa-ban\"></i> <span class=btn-name>{{_t('btn_inclusion_stop')}}</span></button></div></div></div><div class=\"report-col report-ctrl\"><i class=\"fa fa-check fa-2x text-success\" ng-if=zwaveInclusion.inclusionProcess.done></i></div></div><div class=report-entry><div class=\"report-col report-media\"><span class=\"badge badge-number\">3</span></div><div class=\"report-col report-body\"><div class=inclusion-header ng-if=!zwaveInclusion.automatedConfiguration.process><h3>{{_t('automated_konfiguration')}}</h3></div><div class=inclusion-process ng-if=zwaveInclusion.automatedConfiguration.process><div class=\"alert alert-warning\" ng-hide=\"zwaveInclusion.automatedConfiguration.progress > 99\"><i class=\"fa fa-spinner fa-spin\"></i> <strong>{{_t('configuring_device')}}</strong> <span>(#{{zwaveInclusion.automatedConfiguration.includedDevice.nodeId}})</span></div><div class=progress ng-if_=\"zwaveInclusion.automatedConfiguration.progress < 101\"><div class=progress-bar style=\"min-height:40px;min-width: 2em; width: {{zwaveInclusion.automatedConfiguration.progress}}%\" ng-class=\"zwaveInclusion.automatedConfiguration.progress < 100 ? 'progress-bar-striped active' : 'progress-bar-success'\">{{zwaveInclusion.automatedConfiguration.progress}}%</div></div></div></div><div class=\"report-col report-ctrl\"><i class=\"fa fa-check fa-2x text-success\" ng-if=zwaveInclusion.automatedConfiguration.done></i></div></div><div class=report-entry><div class=\"report-col report-media\"><span class=\"badge badge-number\">4</span></div><div class=\"report-col report-body\"><div class=inclusion-header ng-if=!zwaveInclusion.manualConfiguration.process><h3>{{_t('manual_konfiguration')}}</h3></div><div class=inclusion-process ng-if=zwaveInclusion.manualConfiguration.process><div class=\"alert alert-warning\"><i class=\"fa fa-spinner fa-spin\"></i> <strong ng-bind=\"_t('manual_config_prepare')\"></strong></div></div></div><div class=\"report-col report-ctrl\"><i class=\"fa fa-check fa-2x text-success\" ng-if=zwaveInclusion.manualConfiguration.done></i></div></div></div></div><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button></div></div><div id=cancelConfigurationModal class=appmodal ng-if=zwaveInclusion.cancelModal><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=cancelManualConfiguration(true)><i class=\"fa fa-times\"></i></span><h3>{{cfg.app_name}}</h3></div><div class=appmodal-body>{{_t('configuration_cancel')}}</div><div class=appmodal-footer><button type=button class=\"btn btn-default\" ng-click=cancelManualConfiguration(true)><i class=\"fa fa-refresh text-success\"></i> {{_t('reset_redo_inclusion')}}</button> <button type=button class=\"btn btn-default\" ng-click=cancelManualConfiguration(false)>{{_t('continue_anyway')}} <i class=\"fa fa-arrow-right text-primary\"></i></button></div></div></div><div class=device-logo ng-include=\"'app/views/zwave/zwave_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_manage.html',
    "<div ng-controller=ZwaveManageController><bb-loader></bb-loader><div ng-include=\"'app/views/zwave/navi.html'\"></div><div class=\"app-row app-row-report app-row-zwave clearfix\"><div id=row_zwave_{{v.id}} class=report-entry ng-repeat=\"v in devices.zw | orderBy:'title':false\"><div class=\"report-col report-body zwave-devices\"><div class=btn-group><span class=\"network-zwave-title noelements\" ng-if=\"_.size(v.elements) < 1\">{{v.title}} (#{{v.id}})</span> <a href=\"\" class=network-zwave-title ng-click=\"expandNavi('accZwaveManage_' + v.id, $event)\" ng-if=\"_.size(v.elements) > 0\"><i class=fa ng-class=\"naviExpanded['accZwaveManage_' + v.id] ? 'fa-chevron-up' : 'fa-chevron-down'\"></i> {{v.title}} (#{{v.id}}) <span class=\"label label-success\" ng-if=v.security><i class=\"fa fa-shield\"></i> {{_t('secure')}}</span></a><div class=\"app-dropdown app-dropdown-left\" ng-if=\"naviExpanded['accZwaveManage_' + v.id]\"><ul><li class=zwave-hidden-{{e.permanently_hidden}} ng-init=\"elUrl = (e.permanently_hidden ? '': '#/element/' + e.id)\" ng-repeat=\"e in v.elements| orderBy:'metrics.title':false\"><a ng-href={{elUrl}} title={{e.metrics.title}}><img class=report-img-s ng-src={{e.iconPath}} alt=\"img\"> {{e.metrics.title|cutText:true:20}} <span class=zwave-raquo>&raquo;</span></a></li></ul></div></div></div><div class=\"report-col report-ctrl\" ng-if=elementAccess(cfg.role_access.network)><div class=btn-group><a class=\"btn btn-default\" href=#zwave/devices/{{v.id}} title=\"{{_t('lb_configuration')}}\"><i class=\"fa fa-cog text-primary\"></i></a> <a class=\"btn btn-default\" href=#zwave/exclude/{{v.id}} title=\"{{_t('lb_remove')}}\"><i class=\"fa fa-remove text-danger\"></i></a></div></div></div></div><div class=device-logo ng-include=\"'app/views/zwave/zwave_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_manage_id.html',
    "<div ng-controller=ZwaveManageIdController class=mobile-padding><bb-loader></bb-loader><div ng-show=formInput.show><h1>(#{{zWaveDevice.id}}) {{formInput.deviceName}}</h1><form name=form_network_config id=form_profile class=\"form form-page\" ng-submit=updateAllDevices(formInput) novalidate><fieldset><label ng-bind=\"_t('rename_device')\"></label><input name=device_name id=device_name class=form-control value={{formInput.deviceName}} ng-model=\"formInput.deviceName\"></fieldset><div ng-if=\"devices.length > 0\"><fieldset><div class=\"form-group form-inline\"><div class=input-group><input name=appstore_token id=appstore_token class=form-control placeholder=\"{{_t('lb_add_room')}}\" ng-model=\"formInput.newRoom\"> <span class=\"input-group-addon clickable\" title=\"{{_t('add_new')}}\" ng-click=addRoom(formInput.newRoom)><i class=\"fa fa-plus text-success\"></i></span></div></div><div class=\"form-group form-inline\"><label class=display-block ng-bind=\"_t('devices_to_room')\"></label><div class=btn-group><button type=button class=\"btn btn-default\" ng-click=\"expandNavi('devidDropDown', $event)\">{{rooms[formInput.room].title|cutText:true:20}} <i class=\"fa fa-caret-down\"></i></button><div class=\"app-dropdown app-dropdown-left\" ng-if=naviExpanded.devidDropDown><ul><li class=clickable ng-click=\"formInput.room = v.id\" ng-repeat=\"v in rooms\"><a><img class=navi-img ng-src={{v.img_src}} alt=\"img\"> {{v.title|cutText:true:20}} <i class=\"fa fa-check menu-arrow\" ng-if=\"formInput.room == v.id\"></i></a></li></ul></div></div></div></fieldset><fieldset><div class=\"form-group form-inline zwave-hidden-{{formInput.elements[e.id].permanently_hidden}}\" ng-repeat=\"e in devices| orderBy:'title':false track by e.id\" ng-init=\"dev[e.id] = e\"><h3><img class=report-img-s ng-src={{e.iconPath}} alt=\"img\"> <span ng-bind=formInput.elements[e.id].metrics.title></span></h3><div class=\"form-group form-inline\"><input name=title_{{$index}} id=title_{{$index}} class=form-control ng-model=formInput.elements[e.id].metrics.title value=\"{{formInput.elements[e.id].metrics.title}}\"> <span class=mobile-block><input type=checkbox name=permanently_hidden_{{$index}} id=permanently_hidden_{{$index}} ng-model=formInput.elements[e.id].permanently_hidden ng-checked=\"formInput.elements[e.id].permanently_hidden\"><label>{{_t('lb_deactivate')}}</label></span></div></div><div class=\"form-group form-inline\"><a class=\"btn btn-primary\" href=#deviceconfig/{{zWaveDevice.id}} title=\"{{_t('hardware_konfiguration')}}\" ng-if=\"zWaveDevice.cfg.length > 0\"><i class=\"fa fa-wrench\"></i> <span class=btn-name ng-bind=\"_t('hardware_konfiguration')\"></span></a></div></fieldset></div><fieldset class=submit-entry><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" ng-if=!nohistory bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button> <button type=submit class=\"btn btn-submit\" title=\"{{_t('lb_save')}}\"><i class=\"fa fa-check\"></i> <span class=btn-name>{{_t('lb_save')}}</span></button></fieldset></form></div><div class=device-logo ng-include=\"'app/views/zwave/zwave_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_nav.html',
    " <a href=#devices><img class=apps-image ng-src=app/img/logo-zwave.png alt=\"Logo\"></a>"
  );


  $templateCache.put('app/views/zwave/zwave_network.html',
    "<div ng-controller=ZwaveManageController><bb-loader></bb-loader><div ng-include=\"'app/views/zwave/navi.html'\"></div><div class=\"app-row app-row-report app-row-zwave clearfix\"><div id=row_zwave_network_{{v.id}} class=report-entry ng-repeat=\"v in devices.zw | orderBy:'title':false\" ng-class=\"v.isFailed ? 'bcg-danger': ''\" ng-if=\"_.size(v.messages) > 0\"><div class=\"report-col report-body zwave-network\"><span class=\"network-zwave-title noelements\" ng-if=\"_.size(v.elements) < 1\">{{v.title}} (#{{v.id}})</span><div class=btn-group ng-if=\"_.size(v.elements) > 0\"><a href=\"\" class=network-zwave-title ng-click=\"expandNavi('accZwaveManage_' + v.id, $event)\"><i class=fa ng-class=\"naviExpanded['accZwaveManage_' + v.id] ? 'fa-chevron-up' : 'fa-chevron-down'\"></i> {{v.title}} (#{{v.id}})</a><div class=\"app-dropdown app-dropdown-left\" ng-if=\"naviExpanded['accZwaveManage_' + v.id]\"><ul><li class=\"clickable zwave-hidden-{{e.permanently_hidden}}\" ng-init=\"elUrl = (e.permanently_hidden ? '': '#/element/' + e.id)\" ng-repeat=\"e in v.elements| orderBy:'metrics.title':false\"><a ng-href={{elUrl}} title={{e.metrics.title}}><img class=report-img-s ng-src={{e.iconPath}} alt=\"img\"> {{e.metrics.title|cutText:true:20}} <span class=zwave-raquo>&raquo;</span></a></li></ul></div></div></div><div class=\"report-col report-ctrl\"><div ng-repeat=\"m in v.messages|unique:true\"><div class=text-danger ng-if=\"m.type !== 'config'\">{{m.error}}</div><button class=\"btn btn-default\" ng-if=\"!v.interviewDone  && !v.isFailed\" ng-click=\"devices.find = v;handleModal('zwaveNetworkModal', $event)\"><i class=\"fa fa-refresh text-primary\"></i> <span class=btn-name>{{_t('configure_device')}}</span></button></div></div></div></div><div class=device-logo ng-include=\"'app/views/zwave/zwave_nav.html'\"></div><div id=zwaveNetworkModal class=appmodal ng-controller=ZwaveInterviewController ng-if=\"modalArr.zwaveNetworkModal && !_.isEmpty(devices.find)\"><div class=appmodal-in><div class=appmodal-header><span class=appmodal-close ng-click=cancelConfiguration($event)><i class=\"fa fa-times\"></i></span><h3>{{devices.find.title|cutText:true:25}} (#{{devices.find.id}})</h3></div><div class=appmodal-body><div class=\"alert alert-warning\" ng-hide=\"zwaveInterview.progress > 99\"><i class=\"fa fa-spinner fa-spin\"></i> <strong>{{_t('configuring_device')}}</strong></div><div class=progress><div class=progress-bar style=\"min-height:40px;min-width: 2em; width: {{zwaveInterview.progress}}%\" ng-class=\"zwaveInterview.progress < 100 ? 'progress-bar-striped active' : 'progress-bar-success'\">{{zwaveInterview.progress}}%</div></div></div><div class=appmodal-footer><button type=button class=\"btn btn-default\" ng-click=cancelConfiguration($event)><i class=\"fa fa-times text-danger\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button></div></div></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_vendors.html',
    "<div ng-controller=ZwaveVendorController><bb-loader></bb-loader><div class=\"text-center device-autodetect\" ng-include=\"'app/views/zwave/zwave_vendors_autodetect.html'\"></div><div class=clearfix><div class=vendor-entry ng-repeat=\"v in zwaveVendors.all| orderBy:'brandname' track by $index\" ng-if=\"v.frequencies.indexOf(zwaveVendors.frequency) > -1\"><a ng-href=#zwave/vendors/{{v.brandid}} class=vendor-list title={{v.brandname}}><p class=vendor-image ng-if=v.brandname_image><img ng-src=\"{{cfg.img.zwavevendors + v.brandname_image}}\" alt=\"{{v.brandname|cutText:true:20}}\"></p><p class=vendor-image title={{v.brandname}} ng-if=!v.brandname_image><span>{{v.brandname|cutText:true:20}}</span></p></a></div></div><div class=device-logo ng-include=\"'app/views/zwave/zwave_nav.html'\"></div></div>"
  );


  $templateCache.put('app/views/zwave/zwave_vendors_autodetect.html',
    "<div class=\"text-center device-autodetect\"><a href=#zwave/inclusion class=\"btn btn-default btn-lg btn-block\" title=\"{{_t('lb_zwave_autodetect')}}\"><i class=\"fa fa-plug text-success\"></i> <span class=btn-name>{{_t('lb_zwave_autodetect')}}</span></a></div>"
  );


  $templateCache.put('app/views/zwave/zwave_vendors_id.html',
    "<div ng-controller=ZwaveVendorIdController><bb-loader></bb-loader><div class=\"text-center device-autodetect\" ng-include=\"'app/views/zwave/zwave_vendors_autodetect.html'\"></div><h3><button class=\"btn btn-default\" bb-go-back><i class=\"fa fa-arrow-left\"></i></button> <strong>{{zwaveProducts.vendor.brandname}}</strong> | {{_t('products')}} <span class=\"badge text-primary\">{{zwaveProducts.cnt}}</span> | {{_t('frequency')}} <span class=badge>{{zwaveProducts.frequency}}</span> <em ng-class=\"zwaveProducts.cnt == 0 ? 'text-danger': '' \"></em></h3><table class=\"table table-report\"><tbody><tr ng-repeat=\"v in zwaveProducts.all | orderBy:'name' track by $index\"><td><a href=#zwave/inclusion/{{v.id}}><img class=product-img ng-src={{v.product_image}} alt=img ng-if=\"v.product_image\"> <img class=product-img ng-src=storage/img/placeholder-img.png alt=img ng-if=\"!v.product_image\"></a></td><td><a href=#zwave/inclusion/{{v.id}}>{{v.productcode}}</a></td><td><a href=#zwave/inclusion/{{v.id}}>{{v.name}}</a></td><td><span class=\"label label-info\">{{v.frequencyid}}</span></td><td class=td-action><a href=#zwave/inclusion/{{v.id}} class=\"btn btn-default\" title=\"{{_t('lb_include_device')}}\"><i class=\"fa fa-plug text-primary\"></i></a></td></tr></tbody></table><div class=\"fieldset submit-entry\"><button type=button class=\"btn btn-default\" title=\"{{_t('lb_cancel')}}\" bb-go-back><i class=\"fa fa-reply\"></i> <span class=btn-name>{{_t('lb_cancel')}}</span></button></div></div>"
  );

}]);

/**
 * @overview Angular module qAllSettled executes a number of operations concurrently.
 */
'use strict';
/**
 * This method is often used in its static form on arrays of promises, in order to execute a number of operations concurrently 
 * and be notified when they all finish, regardless of success or failure.
 * Returns a promise that is fulfilled with an array of promise state snapshots,
 * but only after all the original promises have settled, i.e. become either fulfilled or rejected.
 * @method qAllSettled
 */
angular.module('qAllSettled', []).config(function($provide) {
  $provide.decorator('$q', function($delegate) {
    var $q = $delegate;
     $q.allSettled = function(promises) {
        var wrappedPromises = angular.isArray(promises) ? promises.slice(0) : {};
        angular.forEach(promises, function(promise, index){
          wrappedPromises[index] = promise.then(function(value){
            return { state: 'fulfilled', value: value };
          }, function(reason){
            return { state: 'rejected', reason: reason };
          });
        });
        return $q.all(wrappedPromises);
      };
    return $q;
  });
});
/**
 * @overview Angular module httpLatency simulates Latency for AngularJS $http Calls with Response Interceptorsy.
 */

'use strict';
/**
 * Simulates Latency for AngularJS $http Calls with Response Interceptorsy.
 * Source: http://blog.brillskills.com/2013/05/simulating-latency-for-angularjs-http-calls-with-response-interceptors/
 * @method httpLatency
 */

angular.module('httpLatency', [], function($httpProvider,cfg) {

    var handlerFactory = function($q, $timeout) {
        console.log(cfg)
        return function(promise) {
            return promise.then(function(response) {
                return $timeout(function() {
                    return response;
                }, cfg.latency_timeout);
            }, function(response) {
                return $q.reject(response);
            });
        };
    }
    if(cfg.latency_timeout > 0){
        $httpProvider.responseInterceptors.push(handlerFactory);
    }

});
/**
 * @overview Angular factories that handle cache, Underscore and HTTP requests.
 * @author Martin Vach
 */

// Angular module
var myAppFactory = angular.module('myAppFactory', []);

/**
 * The factory that handles angular $cacheFactory
 * @class myCache
 */
myAppFactory.factory('myCache', function ($cacheFactory) {
    return $cacheFactory('myData');
});

/**
 * The factory that handles the Underscore library
 * @class Underscore
 */
myAppFactory.factory('_', function () {
    return window._; // assumes underscore has already been loaded on the page
});

/**
 * The factory that handles all local and remote HTTP requests
 * @class dataFactory
 */
myAppFactory.factory('dataFactory', function ($http, $filter, $q, myCache, $interval,dataService, cfg, _) {
    var updatedTime = Math.round(+new Date() / 1000);
    var lang = cfg.lang;
    var ZWAYSession = dataService.getZWAYSession();
    var user = dataService.getUser();
    if (user) {
        lang = user.lang;

    }
    var pingInterval = null;
    return({
         pingServer: pingServer,
        logInApi: logInApi,
        sessionApi: sessionApi,
        getApiLocal: getApiLocal,
        getApi: getApi,
        deleteApi: deleteApi,
        deleteApiFormdata: deleteApiFormdata,
        postApi: postApi,
        putApi: putApi,
        putApiWithHeaders: putApiWithHeaders,
        putApiFormdata: putApiFormdata,
        storeApi: storeApi,
        runApiCmd: runApiCmd,
        getRemoteData: getRemoteData,
        refreshApi: refreshApi,
        runExpertCmd: runExpertCmd,
        xmlToJson: xmlToJson,
        uploadApiFile: uploadApiFile,
        putCfgXml: putCfgXml,
        //getJSCmd: getJSCmd,
        refreshZwaveApiData: refreshZwaveApiData,
        getSystemCmd: getSystemCmd,
        getLanguageFile: getLanguageFile,
        loadZwaveApiData: loadZwaveApiData,
        joinedZwaveData: joinedZwaveData,
        runZwaveCmd: runZwaveCmd,
        loadEnoceanApiData: loadEnoceanApiData,
        refreshEnoceanApiData: refreshEnoceanApiData,
        runEnoceanCmd: runEnoceanCmd,
        getLicense: getLicense,
        zmeCapabilities: zmeCapabilities,
        postReport: postReport,
        postToRemote: postToRemote,
        getOnlineModules: getOnlineModules,
        installOnlineModule: installOnlineModule,
        restoreFromBck: restoreFromBck,
        getHelp: getHelp,
        getAppBuiltInfo: getAppBuiltInfo
    });

    /// --- Public functions --- ///

    /**
     * Connect to the specified url
     * @param {string} url
     * @returns {unresolved}
     */
    function pingServer(url) {
         return $http({
            method: "get",
            timeout: 5000,
            cancel:  $q.defer(),
            url: url
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            //return response;
            return $q.reject(response);
        });
    }


    /**
     * Handles login process
     * @param {object} data
     * @returns {unresolved}
     */
    function logInApi(data) {
        return $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api['login']
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            //return response;
            return $q.reject(response);
        });
    }

    /**
     * Get Z-Wave session
     * @returns {unresolved}
     */
    function sessionApi() {
        return $http({
            method: "get",
            url: cfg.server_url + cfg.api['session']
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            //return response;
            return $q.reject(response);
        });
    }

    /**
     * Get local data from the storage directory
     * @param {string} file
     * @returns {unresolved}
     */
    function getApiLocal(file) {
        return $http({
            method: 'get',
            url: cfg.local_data_url + file
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }

    /**
     * Get ZAutomation api data
     * @param {string} api
     * @param {string} params
     * @param {boolean} noCache
     * @param {boolean} fatalError
     * @returns {unresolved}
     */
    function getApi(api, params, noCache, fatalError) {
        // Cached data
        var cacheName = api + (params || '');
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
                        //'Accept-Encoding': 'gzip, deflate',
                        //'Allow-compression': 'gz' 
            }
        }).then(function (response) {
            if (!angular.isDefined(response.data)) {
                return $q.reject(response);
            }
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response);
                return response;
            } else {// invalid response
                return $q.reject(response);
            }

        }, function (response) {// something went wrong
            if (_.isObject(fatalError)) {
                angular.extend(cfg.route.fatalError, fatalError);
                //response.fatalError = fatalError;
            }
            return $q.reject(response);
        });
    }
   /**
    * Post ZAutomation api data
    * @param {string} api
    * @param {object} data
    * @param {string} params
    * @returns {unresolved}
    */
    function postApi(api, data, params) {
        return $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Put ZAutomation api data
     * @param {string} api
     * @param {int} id
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function putApi(api, id, data, params) {
        return $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api[api] + (id ? '/' + id : '') + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }
    /**
     * Put ZAutomation api data with predefined HTTP headers
     * @param {string} api
     * @param {int} id
     * @param {object} data
     * @param {object} headers
     * @param {string} params
     * @returns {unresolved}
     */
    function putApiWithHeaders(api, id, data, headers, params) {
        return $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api[api] + (id ? '/' + id : '') + (params ? params : ''),
            headers: headers
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }
    /**
     * Put ZAutomation api data with x-www-form-urlencoded header
     * @param {string} api
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function putApiFormdata(api, data, params) {
        return $http({
            method: "put",
            data: $.param(data),
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }

    /**
     * Put or Post ZAutomation api data - depends on id
     * @param {string} api
     * @param {int} id
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function storeApi(api, id, data, params) {
        return $http({
            method: id ? 'put' : 'post',
            data: data,
            url: cfg.server_url + cfg.api[api] + (id ? '/' + id : '') + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }

    /**
     * Delete ZAutomation api data
     * @param {string} api
     * @param {int} id
     * @param {string} params
     * @returns {unresolved}
     */
    function deleteApi(api, id, params) {
        return $http({
            method: 'delete',
            url: cfg.server_url + cfg.api[api] + "/" + id + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Delete ZAutomation api data with x-www-form-urlencoded header
     * @param {string} api
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function deleteApiFormdata(api, data, params) {
        return $http({
            method: 'delete',
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Get ZAutomation api command
     * @param {string} cmd
     * @returns {unresolved}
     */
    function runApiCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api_url + "devices/" + cmd,
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (response.data.code == 200) {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post ZWaveAPI run command
     * @param {type} param
     * @returns {unresolved}
     */
    function runExpertCmd(param) {
        return $http({
            method: 'post',
            url: cfg.server_url + cfg.zwaveapi_run_url + param
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Get XML from url and convert it to JSON
     * @param {string} url
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function xmlToJson(url, noCache) {
        // Cached data
        var cacheName = 'cache_' + url;
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        // NOT Cached data
        return $http({
            method: 'get',
            url: url
        }).then(function (response) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(response.data);
            if (json) {
                myCache.put(cacheName, json);
                return json;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Put XML configuration file into Configuration.xml
     * @param {xml} data
     * @returns {unresolved}
     */
    function putCfgXml(data) {
        return $http({
            method: "POST",
            url: cfg.server_url + cfg.cfg_xml_url,
            data: data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }


    /**
     * Get data from the remote resource
     * @param {string} url
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function getRemoteData(url, noCache) {
        // Cached data
        var cacheName = 'cache_' + url;
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        // NOT Cached data
        return $http({
            method: 'get',
            url: url
                    /*headers: {
                     'Accept-Language': lang
                     }*/
        }).then(function (response) {
            return response;
        }, function (error) {// something went wrong

            return $q.reject(error);
        });
    }

    /**
     * Get data from the ZAutomation api and update it
     * @param {string} api
     * @param {string} params
     * @returns {unresolved}
     */
    function refreshApi(api, params) {
        //console.log('?since=' + updatedTime)
        if (api === 'notifications' && updatedTime.toString().length === 10) {
            updatedTime = updatedTime * 1000;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + '?since=' + updatedTime + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response.data, 'data.updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Upload a file to ZAutomation
     * @param {type} cmd
     * @param {type} data
     * @returns {unresolved}
     */
    function uploadApiFile(cmd, data) {
        var uploadUrl = cfg.server_url + cmd;
        return  $http.post(uploadUrl, data, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }

    /**
     * Get ZAutomation api system command
     * @param {string} cmd
     * @returns {unresolved}
     */
    function getSystemCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + cmd,
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get a file with language keys values from the app/lang directory
     * @param {string} lang
     * @returns {unresolved}
     */
    function getLanguageFile(lang) {
        var langFile = lang + '.json';
        var cached = myCache.get(langFile);

        if (cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.lang_dir + langFile
        }).then(function (response) {
            if (typeof response.data === 'object') {
                myCache.put(langFile, response);
                return response;
            } else {
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Get data holder from ZWaveAPI api
     * @param {boolean} noCache
     * @param {boolean} fatalError
     * @returns {unresolved}
     */
    function loadZwaveApiData(noCache, fatalError) {
        // Cached data
        var cacheName = 'cache_zwaveapidata';
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/0',
            headers: {'ZWAYSession': ZWAYSession}
        }).then(function (response) {
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response.data);
                return response.data;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            if(response.status !== 403){
                angular.extend(cfg.route.fatalError, {
                    message: cfg.route.t['error_zwave_network'],
                    info: cfg.route.t['how_to_resolve_zwave_errors'],
                    hide: false,
                    permanent: true
                });
            }

            return $q.reject(response);
        });
    }

    /**
     * Get updated data holder from the ZAutomation
     * @returns {unresolved}
     */
    function refreshZwaveApiData() {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/' + updatedTime
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Get updated ZAutomation data and join it to ZAutomation data holder
     * @param {object} ZWaveAPIData
     * @returns {unresolved}
     */
    function  joinedZwaveData(ZWaveAPIData) {
        var time = Math.round(+new Date() / 1000);
        var cacheName = 'cache_zwaveapidata';
        var apiData = myCache.get(cacheName) || ZWaveAPIData;
        //console.log(apiData)
        var result = {};
        return $http({
            method: 'post',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/' + updatedTime
        }).then(function (response) {
            if (typeof response.data === 'object' && apiData) {
                time = response.data.updateTime;
                angular.forEach(response.data, function (obj, path) {
                    if (!angular.isString(path)) {
                        return;
                    }
                    var pobj = apiData;
//                    if(pobj){
//                        return;
//                    }
                    var pe_arr = path.split('.');
                    for (var pe in pe_arr.slice(0, -1)) {
                        pobj = pobj[pe_arr[pe]];
                    }
                    pobj[pe_arr.slice(-1)] = obj;
                });
                result = {
                    "joined": apiData,
                    "update": response.data
                };
                response.data = result;
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || Math.round(+new Date() / 1000));
                myCache.put(cacheName, apiData);
                return response;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get Zwave api command
     * @param {string} cmd
     * @returns {unresolved}
     */
    function runZwaveCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + "Run/" + cmd
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get EnOcean data holder from the EnOceanAPI
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function loadEnoceanApiData(noCache) {
        // Cached data
        var cacheName = 'cache_enocean_data';
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_data_url + 0
        }).then(function (response) {
            //return response;
            if (typeof response === 'object') {
                myCache.put(cacheName, response);
                return response;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }
    /**
     * Get EnOcean command from the EnOceanAPI Run
     * @param {string} cmd
     * @returns {unresolved}
     */
    function runEnoceanCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_run_url + cmd
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Get updated Enocean data from the EnOceanAPI
     * @returns {unresolved}
     */
    function refreshEnoceanApiData() {
        //console.log('?since=' + updatedTime)
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_data_url + updatedTime
                    /*headers: {
                     'Accept-Language': lang,
                     'ZWAYSession': ZWAYSession
                     }*/
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response.data, 'data.updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post licence data from the remote server
     * @param {object} data
     * @returns {unresolved}
     */
    function getLicense(data) {
        return $http({
            method: 'post',
            url: cfg.license_url,
            data: $.param(data),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            if (response.data.license.length > 1) {
                return response.data.license;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post ZME Capabilities
     * @param {object} data
     * @returns {unresolved}
     */
    function zmeCapabilities(data) {
//        return $q.reject(data); // Test error response
//        var deferred = $q.defer();
//        deferred.resolve(data);
//        return deferred.promise;// Test success response

        return $http({
            method: 'POST',
            url: cfg.server_url + cfg.license_load_url,
            data: $.param({license: data.toString()}),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            return response;
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });

    }
    /**
     * Post a bug report on the remote server
     * @param {object} data
     * @returns {unresolved}
     */
    function postReport(data) {
        return $http({
            method: "POST",
            url: cfg.post_report_url,
            data: $.param(data),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
                        //'ZWAYSession': ZWAYSession 
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post on the remote server
     * @param {string} url
     * @param {object} data
     * @returns {unresolved}
     */
    function postToRemote(url, data) {
        return $http({
            method: "POST",
            url: url,
            data: $.param(data),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
                        //'ZWAYSession': ZWAYSession 
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Load On-line modules from the remote server
     * @param {object} data
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function getOnlineModules(data, noCache) {
        // Cached data
        var cacheName = 'cache_' + cfg.online_module_url;
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        // NOT Cached data
        return $http({
            method: 'post',
            url: cfg.online_module_url,
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang
            }
        }).then(function (response) {
            myCache.put(cacheName, response);
            return response;
        }, function (error) {// something went wrong

            return $q.reject(error);
        });
    }

    /**
     * Install a module from the remote server
     * @param {object} data
     * @param {string} api
     * @returns {unresolved}
     */
    function installOnlineModule(data, api) {
        return $http({
            method: "POST",
            url: cfg.server_url + cfg.api[api],
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Resore the system from the backup file
     * @param {object} data
     * @returns {unresolved}
     */
    function restoreFromBck(data) {
        var uploadUrl = cfg.server_url + cfg.api['restore'];
        return  $http.post(uploadUrl, data, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }


    /**
     * Load a help page from the storage directory
     * @param {string} file
     * @returns {unresolved}
     */
    function getHelp(file) {
        return $http({
            method: 'get',
            url: cfg.help_data_url + file
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }

    /**
     * Get app built info
     * @returns {unresolved}
     */
    function getAppBuiltInfo() {
        return $http({
            method: 'get',
            url: cfg.api['app_built_info']
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }
});


/**
 * @overview Stores methods that are used within controllers.
 * @author Martin Vach
 */

// Angular module
var myAppService = angular.module('myAppService', []);

/**
 * Angular module initialization
 * @class dataService
 */
myAppService.service('dataService', function ($filter, $log, $cookies, $window, $location,cfg, cfgicons, _) {
    /// --- Public functions --- ///
    /**
     * Resets the fatal error object
     * @param {object} notifier
     * @returns {undefined}
     */
    this.resetFatalError = function () {
        if (cfg.route.fatalError.message && !cfg.route.fatalError.permanent) {
            angular.extend(cfg.route.fatalError, {
                type: 'system',// system|network
                message: false,
                info: false,
                permanent: false, // Permanently displayed
                hide: false, // Hide page content
                icon: 'fa-exclamation-triangle',
                icon_jamesbox: 'fa-spinner fa-spin'
            });
        }
    };

    /**
     * Check if access is allowed for the page
     * @param {object} next
     * @returns {undefined}
     */
    this.isAccessAllowed = function (next) {
        if (next.requireLogin) {
            var user = this.getUser();
            if (!user) {
                $location.path('/');
                return;
            }
            if (next.roles && angular.isArray(next.roles)) {
                if (next.roles.indexOf(user.role) === -1) {
                    $location.path('/error403');
                    return;
                }
            }
        }
    };

    /**
     * Set timestamp and ping server if request fails
     * @param {object} next
     * @returns {undefined}
     */
    this.setTimeStamp = function () {
       /* dataFactory.getApi('timezone', null, true).then(function (response) {

        }, function (error) {});*/
    };

    /**
     * Get a language string by key
     * @param {string} key
     * @param {object} languages
     * @param {object} replacement
     * @returns {unresolved}
     */
    this.getLangLine = function (key, languages, replacement) {
        return getLangLine(key, languages, replacement);
    };

    /**
     * Render alertify notifier
     * @param {object} notifier
     * @returns {undefined}
     */
    this.showNotifier = function (notifier) {
        var param = _.defaults(notifier, {position: 'top-right', message: false, type: 'success', wait: 5});
        if (notifier.message) {
            alertify.set('notifier', 'position', 'top-right');
            alertify.notify(param.message, param.type, param.wait);
        }
    };


    /**
     * Log error in the console
     * @param {string} error
     * @param {string} message
     * @returns {undefined}
     */
    this.logError = function (error, message) {
        message = message || 'ERROR:';
        $log.error('---------- ' + message + ' ----------', error);
    };

    /**
     * Get OS (operating system)
     * @returns {String}
     */
    this.getOs = function () {
        if (navigator && navigator.userAgent && navigator.userAgent != null) {
            var agents = ['android', 'iemobile', 'iphone', 'ipad', 'ipod', 'opera mini', 'blackberry'];
            var ua = navigator.userAgent.toLowerCase();
            for (var i in agents) {
                if (ua.match('/' + agents[i] + '/i')) {
                    return agents[i];
                }
            }
            return 'any';
        }
        return 'any';
    };

    /**
     * Get OS (operating system)
     * @returns {String}
     */
    this.isIeEdge = function () {
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if (isIE) {
            return true;
        }
        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;
        if (isEdge) {
            return true;
        }
        return false;
    };


    /**
     * Detect a mobile device
     * @param {string} a
     * @returns {Boolean}
     */
    this.isMobile = function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Window history go back
     * @returns {undefined}
     */
    this.goBack = function () {
        window.history.back();
    };


    /**
     * Get user data from cookies
     * @returns {Array|Boolean}
     */
    this.getUser = function () {
        var user = ($cookies.user !== 'undefined' ? angular.fromJson($cookies.user) : false);
        return user;
    };

    /**
     * Set user data
     * @param {object} data
     * @returns {Boolean|Object}
     */
    this.setUser = function (data) {
        if (!data) {
            delete $cookies['user'];
            return false;
        }
        $cookies.user = angular.toJson(data);
        return data;
    };

    /**
     * Unset user data - delete user cookies
     * @returns {undefined}
     */
    this.unsetUser = function () {
        this.setUser(null);
        this.setZWAYSession(null);
    };

    /**
     * Get ZWAY session
     * @returns {string}
     */
    this.getZWAYSession = function () {
        return $cookies.ZWAYSession;
    };
    /**
     * Set ZWAY session
     * @param {string} sid
     * @returns {Boolean|Object}
     */
    this.setZWAYSession = function (sid) {
        if (!sid) {
            delete $cookies['ZWAYSession'];
            return false;
        }
        $cookies.ZWAYSession = sid;
    };
    /**
     * Get last login info
     * @returns {Sring|Boolean}
     */
    this.getLastLogin = function () {
        return $cookies.lastLogin !== 'undefined' ? $cookies.lastLogin : false;
    };

    /**
     * Set last login
     * @param {string} val
     * @returns {undefined}
     */
    this.setLastLogin = function (val) {
        $cookies.lastLogin = val;
    };

    /**
     * Get remember me
     * @returns {Object|Boolean}
     */
    this.getRememberMe = function () {
        var user = ($cookies.rememberme !== 'undefined' ? angular.fromJson($cookies.rememberme) : false);
        return user;
    };

    /**
     * Set remember me
     * @param {object} data
     * @returns {Boolean|Object}
     */
    this.setRememberMe = function (data) {
        if (!data) {
            delete $cookies['rememberme'];
            return false;
        }
        $cookies.rememberme = angular.toJson(data);
        return data;
    };

    /**
     * Logout from the system
     * @returns {undefined}
     */
    this.logOut = function () {
        this.setUser(null);
        this.setZWAYSession(null);
        $window.location.href = '#/?logout';
        $window.location.reload();

    };

    /**
     * Build a new file name without invalid chars
     * @param {string} fileName
     * @returns {string}
     */
    this.uploadFileNewName = function (fileName) {
        var name = fileName.split('.').slice(0, -1).join('.');
        return $filter('stringToSlug')(name) + '.' + $filter('fileExtension')(fileName);


    };

    /**
     * Assign an icon to the element
     * @param {object} element
     * @returns {string}
     */
    this.assignElementIcon = function (element) {
        return assignElementIcon(element);


    };

    /**
     * Get devices -  filtered data from devices dataholder
     * @param {object} data
     * @param {boolean} showHidden
     * @returns {unresolved}
     */
    this.getDevicesData = function (data, showHidden, showAll) {
        //var user = this.getUser();
        var user = cfg.user;
        return _.chain(data)
            .flatten()
            .uniq(false, function (v) {
                return v.id;
            })
            .reject(function (v) {
                if (showAll) {
                    return (v.deviceType === 'battery');
                } else if (showHidden) {
                    return (v.deviceType === 'battery') || (v.permanently_hidden === true);
                } else {
                    return (v.deviceType === 'battery') || (v.permanently_hidden === true) || (v.visibility === false);
                }

            })
            .filter(function (v) {
                var minMax;
                var yesterday = (Math.round(new Date().getTime() / 1000)) - (24 * 3600);
                var isNew = v.creationTime > yesterday ? true : false;
                // Create min/max value
                if (cfg.knob_255.indexOf(v.probeType) > -1) {
                    minMax = {min: 0, max: 255, step: 1};
                } else if (v.deviceType === 'thermostat') {
                    minMax = (v.metrics.scaleTitle === '°F' ? {min: 41, max: 104, step: 1} : {
                        min: 5,
                        max: 40,
                        step: 0.5
                    });
                } else {
                    minMax = {min: 0, max: 99, step: 1};
                }
                // Limit min/max with device metrics
                if (typeof(v.metrics.max) !== 'undefined') {
                    minMax.max = v.metrics.max;
                }
                if (typeof(v.metrics.min) !== 'undefined') {
                    minMax.min = v.metrics.min;
                }
                if (typeof(v.metrics.step) !== 'undefined') {
                    minMax.step = v.metrics.step;
                }
                angular.extend(v,
                    {onDashboard: (user.dashboard && user.dashboard.indexOf(v.id) !== -1 ? true : false)},
                    {creatorId: _.isString(v.creatorId) ? v.creatorId.replace(/[^0-9]/g, '') : v.creatorId},
                    {minMax: minMax},
                    {hasHistory: (v.hasHistory === true ? true : false)},
                    {imgTrans: false},
                    {isNew: isNew},
                    {iconPath: assignElementIcon(v)},
                    {updateCmd: (v.deviceType === 'switchControl' ? 'on' : 'update')}
                );
                if (v.metrics.color) {
                    angular.extend(v.metrics, {rgbColors: 'rgb(' + v.metrics.color.r + ',' + v.metrics.color.g + ',' + v.metrics.color.b + ')'});
                }
                if (v.metrics.level) {
                    angular.extend(v.metrics, {level: $filter('numberFixedLen')(v.metrics.level)});
                }
                if (v.metrics.scaleTitle) {
                    angular.extend(v.metrics, {scaleTitle: getLangLine(v.metrics.scaleTitle)});
                }
                return v;
            });
    };

    /**
     * Get an object with element icons
     * @param {object} element
     * @returns {object}
     */
    this.getSingleElementIcons = function (element) {
        var icons = {
            default: {
                default: 'placeholder.png'
            },
            custom: {}
        };
        var iconKey = $filter('hasNode')(element, 'metrics.icon');
        // Set custom icons
        if (_.size(element.customIcons) > 0) {
            icons.custom = (element.customIcons.level ?element.customIcons.level : element.customIcons);
        }
        // Set default icons by metrics.icon
        if (iconKey && iconKey !== '') {
            if ((/^https?:\/\//.test(iconKey))) { // If icon is the url (weather) then custom icons are not allowed
                icons = {};
            } else if ((/\.(png|gif|jpe?g)$/).test(iconKey)) {
                if (iconKey.indexOf('/') > -1) {// If an icon is the sytem icon then custom icons are not allowed
                    icons = {};
                } else {
                    icons.default.default = iconKey;
                }
            } else {
                if (cfgicons.element.icon[iconKey]) {
                    icons.default = setDefaultIcon(cfgicons.element.icon[iconKey]);
                    //console.log(icons.default)
                }

            }

        }
        // Set default icons by deviceType
        else {
            if (cfgicons.element.deviceType[element.deviceType]) {
                icons.default = setDefaultIcon(cfgicons.element.deviceType[element.deviceType]);
            }
        }

        // Build an object with default icons
        function setDefaultIcon(obj) {
            var ret = {};
            // Has level icons?
            if (obj.level) {
                return obj.level;
                /*ret['level'] = obj.level;
                return ret;*/
            }
            return obj;


        }
        ;
        return icons;

    };

    /**
     * Get rooms - filtered data from locations dataholder
     * @param {object} data
     * @returns {unresolved}
     */
    this.getRooms = function (data) {
        return _.chain(data)
            .flatten()
            .filter(function (v) {
                v.title = (v.id === 0 ? getLangLine(v.title) : v.title);
                v.img_src = 'storage/img/placeholder-img.png';
                if (v.id === 0) {
                    v.img_src = 'storage/img/rooms/unassigned.png';
                } else if (v.img_type === 'default' && v.default_img) {
                    v.img_src = 'storage/img/rooms/' + v.default_img;
                } else if (v.img_type === 'user' && v.user_img) {
                    v.img_src = cfg.server_url + cfg.api_url + 'load/image/' + v.user_img;
                }
                return v;
            });

    };

    /**
     * Get local skins - filtered data from skin dataholder
     * @param {object} data
     * @returns {unresolved}
     */
    this.getLocalSkins = function (data) {
        return _.chain(data)
            .flatten()
            .filter(function (v) {
                // Set icon path
                var screenshotPath = v.name !== 'default' ? cfg.skin.path + v.name + '/' : cfg.img.skin_screenshot;
                v.icon = (!v.icon ? 'storage/img/placeholder-img.png' : screenshotPath + 'screenshot.png');
                return v;
            });
    };

    /**
     * Get zwave products - filtered data from devices dataholder
     * @param {object} data
     * @returns {unresolved}
     */
    this.getZwaveProducts = function (data, lang) {
        lang = cfg.zwaveproducts_langs.indexOf(lang) > -1 ? lang.toUpperCase() : cfg.lang.toUpperCase();
        return _.chain(data)
            .flatten()
            .map(function (v) {
                return {
                    id: v.certification_ID,
                    name: v.Name,
                    productcode: v.product_code,
                    wake: v['wake_' + lang] || v['wake_EN'],
                    inc: v['inc_' + lang] || v['inc_EN'],
                    exc: v['exc_' + lang] || v['exc_EN'],
                    brandname: v.brandname,
                    brandid: v.brandid,
                    brand_image: (v.brandname_image ? cfg.img.zwavevendors + v.brandname_image : false),
                    product_image: (v.certification_ID ? cfg.img.zwavedevices + v.certification_ID + '.png' : false),
                    prep: v['prep_' + lang] || v['prep_EN'],
                    inclusion_type: (v.inc_type === 'secure' ? v.inc_type : 'unsecure'),
                    zwplus: v.zwplus,
                    frequencyid: v.frequencyid,
                    frequency: v.frequency,
                    ignore_ui: v.ignore_ui,
                    reset: v['ResetDescription_' + lang] || v['ResetDescription_EN']

                };
            });
    };

    /**
     * Renders the chart data
     * @param {object} data
     * @param {object} colors
     * @returns {Object|NULL}
     */
    this.getChartData = function (data, colors) {
        if (!angular.isObject(data, colors)) {
            return null;
        }
        var currTime = (Math.round(+new Date() / 1000) - 86400);
        var out = {
            labels: [],
            datasets: [{
                fillColor: colors.fillColor,
                strokeColor: colors.strokeColor,
                pointColor: colors.pointColor,
                pointStrokeColor: colors.pointStrokeColor,
                data: []
            }]
        };
        var cnt = 0;
        angular.forEach(data, function (v, k) {
            cnt++;
            var time = $filter('date')(((v.id) * 1000), 'H:mm');
            //if (v.id > currTime && out.labels.indexOf(time) === -1) {
            //if (v.id > currTime && (cnt % 2)) {
            if (v.id > currTime && (cnt % 2) === 0) {
                out.labels.push(time);
                //out.labels.push($filter('date')(v.timestamp,'dd.MM.yyyy H:mm'));
                out.datasets[0].data.push(v.l);
            }

        });
        if (out.datasets[0].data.length > 0) {
            return out;
        }
        return null;
    };

    /**
     * Renders Alpaca module data
     * @param {object} module
     * @param {object} data
     * @returns {unresolved}
     */
    this.getModuleFormData = function (module, data) {
        return getModuleFormData(module, data);
    };

    /**
     * Renders module config data
     * @param {object} module
     * @param {string} params
     * @param {object} namespaces
     * @returns {unresolved}
     */
    this.getModuleConfigInputs = function (module, params, namespaces) {
        return getModuleConfigInputs(module, params, namespaces);
    };

    /**
     *
     * @param {object} data
     * @param {string} key
     * @param {boolean} add
     * @returns {Array}
     */
    this.setArrayValue = function (data, key, add) {
        if (add) {
            return addArrayValue(data, key);
        } else {
            return removeArrayValue(data, key);
        }
    };

    /**
     * Get event level
     * @param {object} data
     * @param {array} set
     * @returns {unresolved}
     */
    this.getEventLevel = function (data, set) {
        var collection = (set ? set : []);
        angular.forEach(data, function (v, k) {
            collection.push({
                'key': v.level,
                'val': v.level
            });
        });

        return $filter('unique')(collection, 'key');
    };

    /**
     * Renders EnOcean profile
     * @param {object} data
     * @returns {unresolved}
     */
    this.setEnoProfile = function (data) {
        var profile = {};
        angular.forEach(data, function (v, k) {
            var profileId = parseInt(v._rorg, 16) + '_' + parseInt(v._func, 16) + '_' + parseInt(v._type, 16);
            profile[profileId] = v;
            profile[profileId]['id'] = profileId;
            profile[profileId]['rorgInt'] = parseInt(v._rorg, 16);
            profile[profileId]['funcInt'] = parseInt(v._func, 16);
            profile[profileId]['typeInt'] = parseInt(v._type, 16);
        });
        return profile;
    };

    /**
     * Compare whether two versions of a resource are the same
     * @param {string} v1
     * @param {string} v2
     * @returns {Boolean}
     */
    this.compareVersions = function (v1, v2) {
        var status = 'equal';
        if (!v1 || !v2) {
            return 'error';
        }
        v1 = v1.toString().split('.'),
            v2 = v2.toString().split('.');

        for (var i = 0; i < v1.length; i++) {
            if ((parseInt(v1[i], 10) < parseInt(v2[i], 10)) || ((parseInt(v1[i], 10) <= parseInt(v2[i], 10)) && (!v1[i + 1] && v2[i + 1] && parseInt(v2[i + 1], 10) > 0))) {
                status = 'notequal';
                break;
            }
        }
        return status;
    };

    /// --- Private functions --- ///
    /**
     * Assign an icon to the element
     */
    function assignElementIcon(element) {
        var icon = cfg.img.icons + 'placeholder.png';
        var iconKey = $filter('hasNode')(element, 'metrics.icon');
        // Assign icon by metrics.icon
        var iconArray = setIcon(cfgicons.element.icon[iconKey], element.customIcons || {});
        /**
         * Set icons by deviceType
         */
        switch (element.deviceType) {
            // switchControl
            case 'switchControl':
                //icon = iconArray.default;
                iconArray = setIcon(cfgicons.element.deviceType['switchControl'], element.customIcons || {});
                return iconArray.default;
            // default
            default:
                break;
        }
        /**
         * Set icons by metrics.icon
         */
        // The icon has a full path
        if ((/^https?:\/\//.test(iconKey))) {
            return iconKey;
        } else if ((/\.(png|gif|jpe?g)$/).test(iconKey)) {
            if (iconKey.indexOf('/') > -1) {
                return iconKey;
            } else {
                return cfg.img.icons + iconKey;
            }
        }

        if (!iconArray) {
            // set default
            return icon;
        }
        switch (iconKey) {
            // door
            case 'door':
                icon = (element.metrics.level === 'open' || element.metrics.level === 'on' ? iconArray.open : iconArray.closed);
                break;
            // window
            case 'window':
                if (typeof (element.metrics.level) === 'number') {
                    if (element.metrics.level === 0) {
                        icon = iconArray.down;
                    } else if (element.metrics.level >= 99) {
                        icon = iconArray.up;
                    } else {
                        icon = iconArray.half;
                    }
                } else {
                    icon = (element.metrics.level === 'open' || element.metrics.level === 'on' ? iconArray.open : iconArray.closed);
                }
                break;
            // switch
            case 'switch':
                icon = (element.metrics.level === 'on' ? iconArray.on : iconArray.off);
                break;
            // motion
            case 'motion':
                icon = (element.metrics.level === 'on' ? iconArray.on : iconArray.off);
                break;
            // alarm
            case 'alarm':
                icon = (element.metrics.level === 'on' ? iconArray.on : iconArray.off);
                break;
            // CO alarm
            case 'CO_alarm':
                icon = (element.metrics.level === 'on' ? iconArray.on : iconArray.off);
                break;
            // tamper
            case 'tamper':
                icon = (element.metrics.level === 'on' ? iconArray.on : iconArray.off);
                break;
            // smoke
            case 'smoke':
                icon = (element.metrics.level === 'on' ? iconArray.on : iconArray.off);
                break;
            // blinds
            case 'blinds':
                if (element.metrics.level === 0) {
                    icon = iconArray.down;
                } else if (element.metrics.level >= 99) {
                    icon = iconArray.up;
                } else {
                    icon = iconArray.half;
                }
                break;
            // multilevel
            case 'multilevel':
                if (element.metrics.level === 0) {
                    icon = iconArray.off;
                } else if (element.metrics.level >= 99) {
                    icon = iconArray.on;
                } else {
                    icon = iconArray.half;
                }
                break;
            // gesture
            case 'gesture':
                icon = (iconArray[element.metrics.state] || iconArray['press']);
                break;
            // default
            default:
                icon = iconArray.default;
                break;
        }


        return icon;

    }
    /**
     * Build an object with icons
     * @param {object} defaultIcon
     * @param {object} customIcon
     * @returns {*}
     */
    function setIcon(defaultIcon, customIcon) {
        var obj = {};
        customIcon = customIcon.level || customIcon
        if (defaultIcon) {
            // If a custom icon exists set it otherwise set a default icon
            angular.forEach(defaultIcon.level || defaultIcon, function (v, k) {
                obj[k] = (customIcon[k] ? cfg.img.custom_icons + customIcon[k] : cfg.img.icons + v);
            });
            return obj;
        } else {
            // If a custom icon exists set it otherwise set false
            if(!_.isEmpty(customIcon.default)){
                obj['default'] = cfg.img.custom_icons + customIcon['default'];
                return obj;
            }
            return false;
        }

    }
    /**
     * Get a language string by key
     */
    function getLangLine(key, languages, replacement) {
        var line = key;
        if (angular.isObject(languages)) {
            if (angular.isDefined(languages[key])) {
                line = (languages[key] !== '' ? languages[key] : key);
            }
        } else {
            line = (cfg.route.t[key] || key);
        }
        return setLangLine(line, replacement);
    }

    /**
     * Set lang line params
     */
    function setLangLine(line, replacement) {
        for (var val in replacement) {
            line = line.split(val).join(replacement[val]);
        }
        return line;
    }

    /**
     * Renders Alpaca module data
     */
    function getModuleFormData(module, data) {
        var collection = {
            'options': replaceModuleFormData(module.options, ['click', 'onFieldChange']),
            'schema': module.schema,
            'data': data,
            'postRender': postRenderAlpaca
        };
        return collection;
    }

    /**
     * Replace module object
     */
    function replaceModuleFormData(obj, keys) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i))
                continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(replaceModuleFormData(obj[i], keys));
            } else if (~keys.indexOf(i) && !angular.isArray(obj[i]) &&
                typeof obj[i] === 'string' &&
                obj[i].indexOf("function") === 0) {
                // overwrite old string with function                
                // we can only pass a function as string in JSON ==> doing a real function
                obj[i] = new Function('return ' + obj[i])();
            }
        }
        return obj;
    }

    /**
     * Add array value
     */
    function addArrayValue(data, key) {
        var collection = data;
        if (collection.indexOf(key) === -1) {
            collection.push(key);
        }
        return collection;
    }

    /**
     * Remove array value
     */
    function removeArrayValue(data, key) {
        var collection = [];
        angular.forEach(data, function (v, k) {
            if (v != key) {
                collection.push(v);
            }
        });
        return collection;
    }
});

/**
 * @overview Common Angular directives that are used within the views.
 * @author Martin Vach
 */

/**
 * Window history back
 * @class bbGoBack
 */
myApp.directive('bbGoBack', ['$window', function ($window) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    $window.history.back();
                });
            }
        };
    }]);

/**
 * Displays a page loader
 * @class bbLoader
 */
myApp.directive('bbLoader', function () {
    return {
        restrict: "E",
        replace: true,
        template: '<div id="loading" ng-show="loading" ng-class="loading.status"><div class="loading-in">'
                + '<i class="fa fa-lg" ng-class="loading.icon"></i> <span ng-bind-html="loading.message|toTrusted"></span>'
                + '</div></div>'
    };
});

/**
* Displays a spinner
* @class bbRowSpinner
*/
myApp.directive('bbRowSpinner', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            label: '=',
            spinner: '=',
            icon: '='
        },
        template: '<span title="{{label}}"><span class="btn-spin">' +
        '<i class="fa" ng-class="spinner ? \'fa-spinner fa-spin\':icon"></i>' +
        '</span> ' +
        '<span class="btn-label" ng-if="label">' +
        '{{label}}' +
        '</span></span>'
    };
});

/**
 * Displays an alert message within the div
 * @class bbAlert
 */
myApp.directive('bbAlert', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {alert: '='},
        template: '<div class="alert" ng-if="alert.message" ng-class="alert.status">'
                + '<i class="fa fa-lg" ng-class="alert.icon"></i> <span ng-bind-html="alert.message|toTrusted"></span>'
                + '</div>'
    };
});

/**
 * Displays an alert message within the span
 * @class bbAlertText
 */
myApp.directive('bbAlertText', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {alert: '='},
        template: '<span class="alert" ng-if="alert.message" ng-class="alert.status">'
                + '<i class="fa fa-lg" ng-class="alert.icon"></i> <span ng-bind-html="alert.message|toTrusted"></span>'
                + '</span>'
    };
});

/**
 * Displays a HTML help page
 * @class bbHelp
 */
myApp.directive('bbHelp', function ($sce, dataFactory, cfg) {
    var trusted = {};
    return {
        restrict: "E",
        replace: true, template: '<span class="clickable" ng-click="showHelp();handleModal(\'helpModal\', $event)"><i class="fa fa-question-circle fa-lg text-info"></i>'
                + '<div id="helpModal" class="appmodal" ng-if="modalArr.helpModal"><div class="appmodal-in">'
                + '<div class="appmodal-header">'
                + '<h3>{{cfg.app_name}}</h3>'
                + '<span class="appmodal-close" ng-click="handleModal(\'helpModal\', $event)"><i class="fa fa-times"></i></span>'
                + '</div>'
                + '<div class="appmodal-body" ng-bind-html="getSafeHtml(helpData)"></div>'
                + '</div></div>'
                + '</span>',
        link: function (scope, elem, attrs) {
            scope.file = attrs.file;
            scope.helpData = null;
            scope.show = false;
            scope.showHelp = function () {
                var defaultLang = 'en';
                var lang = attrs.lang;
                var helpFile = scope.file + '.' + lang + '.html';
                // Load help file for given language
                dataFactory.getHelp(helpFile).then(function (response) {
                    scope.helpData = response.data;
                    scope.show = true;

                }, function (error) {
                    // Load help file for default language
                    helpFile = scope.file + '.' + defaultLang + '.html';
                    dataFactory.getHelp(helpFile).then(function (response) {
                        scope.helpData = response.data;
                    }, function (error) {
                        alertify.alertError(scope._t('error_load_data'));
                    });
                });
            };
            scope.getSafeHtml = function (html) {
                return trusted[html] || (trusted[html] = $sce.trustAsHtml(html));
            };
        }
    };
});

/**
 * Displays a help text
 * @class bbHelpText
 */
myApp.directive('bbHelpText', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            trans: '=',
            display: '=',
            icon: '='
        },
        template: '<span class="help-text" ng-class="display"><i class="fa text-info" ng-class="icon ? icon : \' fa-info-circle\'"></i> {{trans}}</span>'
    };
});

/**
 * Displays a validation error
 * @class bbValidator
 */
myApp.directive('bbValidator', function ($window) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            inputName: '=',
            trans: '=',
            hasBlur: '='
        },
        template: '<div class="valid-error text-danger" ng-if="inputName && !inputName.$pristine && hasBlur">*{{trans}}</div>'
    };
});

/**
 * Compare two values
 * @class bbCompareTo
 */
myApp.directive("bbCompareTo", function () {
    return {
        require: "ngModel",
        link: function (scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.bbCompareTo];

            ctrl.$parsers.push(function (value) {
                if (value === otherInput.$viewValue) {
                    ctrl.$setValidity("compareto", true);
                    return value;
                }
                ctrl.$setValidity("compareto", false);
            });

            otherInput.$parsers.push(function (value) {
                ctrl.$setValidity("compareto", value === ctrl.$viewValue);
                return value;
            });
        }
    };
});
/**
 * Parse value as int
 * @class bbCompareTo
 */
myApp.directive('bbInteger', function(){
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(function(viewValue){
                return parseInt(viewValue, 10);
            });
        }
    };
});

// Knob directive
myApp.directive('knob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).val(25).knob();
        }
    };
});

/**
 * Displays a knob 
 * @class myknob
 */
myApp.directive('myknob', ['$timeout', 'dataFactory', function ($timeout, dataFactory, dataService) {
        'use strict';

        return {
            restrict: 'A',
            replace: true,
            //template: '<input class="dial" data-width="100" data-height="100" value="{{ knobData }}"/>',
            scope: {
                knobId: '=',
                knobData: '=',
                knobStep: '=',
                knobMin: '=',
                knobMax: '=',
                knobOptions: '&'
            },
            link: function ($scope, $element) {
                var knobInit = $scope.knobOptions() || {};
                knobInit.step = $scope.knobStep || 1;
                if (typeof ($scope.knobMin) !== 'undefined'){
                    knobInit.min = $scope.knobMin;
                }
                if (typeof ($scope.knobMax) !== 'undefined'){
                     knobInit.max = $scope.knobMax;
                }
               
                knobInit.release = function (newValue) {
                    //console.log(knobInit)
                    $timeout(function () {
                        var old = $scope.knobData;
                        //console.log('myKnob directive - Bafore request new/old: ',newValue, old)
                        if (old != newValue) {
                             //console.log('myKnob directive - Sending request new/old: ',newValue, old)
                            $scope.knobData = newValue;
                            runCmdExact($scope.knobId, newValue);
                            $scope.$apply();
                        }
                    });
                };

                $scope.$watch('knobData', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                         $($element).val(newValue).change();
                    }
                });

                $($element).val($scope.knobData).knob(knobInit);
            }
        };

        /**
         * Run command exact value
         * @param {int} id
         * @param {int} val
         * @returns {undefined}
         */
        function runCmdExact(id, val) {
            //console.log('Knob from directive:',val)
            var cmd = id + '/command/exact?level=' + val;
            dataFactory.runApiCmd(cmd).then(function (response) {
                //console.log('myKnob directive - request success: ',cmd)
            }, function (error) {});
            return;
        }
        ;
    }]);

/**
 * Displays a confirm dialog after click
 * @class ngConfirmClick
 */
myApp.directive('ngConfirmClick', [
    function () {
        return {
            priority: -1,
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
                    var message = attrs.ngConfirmClick;
                    if (message && !confirm(message)) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
            }
        };
    }
]);

/**
 * Upload a file
 * @class fileModel
 */
myApp.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

/**
 * Catch a key event
 * @class bbKeyEvent
 */
myApp.directive('bbKeyEvent', function () {
    return function (scope, element, attrs) {
        element.bind("keyup", function (event) {
            if (event.which !== 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.bbKeyEvent);
                });

                event.preventDefault();
            }
        });
    };
});


/**
 * @overview AngularJS module for paginating (almost) anything.
 * @author Created by Michael.
 */
myApp.directive('dirPaginate', function($compile, $parse, $timeout, paginationService) {
        return  {
            priority: 5000, //High priority means it will execute first
            terminal: true,
            compile: function(element, attrs){
                attrs.$set('ngRepeat', attrs.dirPaginate); //Add ng-repeat to the dom

                var expression = attrs.dirPaginate;
                // regex taken directly from https://github.com/angular/angular.js/blob/master/src/ng/directive/ngRepeat.js#L211
                var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

                var filterPattern = /\|\s*itemsPerPage:\s*\S+\s*/;
                if (match[2].match(filterPattern) === null) {
                    throw "pagination directive: the 'itemsPerPage' filter must be set.";
                }
                var itemsPerPageFilterRemoved = match[2].replace(filterPattern, '');
                var collectionGetter = $parse(itemsPerPageFilterRemoved);

                //Now that we added ng-repeat to the element, proceed with compilation
                //but skip directives with priority 5000 or above to avoid infinite
                //recursion (we don't want to compile ourselves again)
                var compiled =  $compile(element, null, 5000);

                paginationService.paginationDirectiveInitialized = true;

                return function(scope, element, attrs){
                    var currentPageGetter;
                    if (attrs.currentPage) {
                        currentPageGetter = $parse(attrs.currentPage);
                    } else {
                        // if the current-page attribute was not set, we'll make our own
                        scope.__currentPage = 1;
                        currentPageGetter = $parse('__currentPage');
                    }
                    paginationService.setCurrentPageParser(currentPageGetter, scope);

                    scope.$watchCollection(function() {
                        return collectionGetter(scope);
                    }, function(collection) {
                        if (collection) {
                            paginationService.setCollectionLength(collection.length);
                        }
                    });

                    compiled(scope);
                };
            }
        };
    })

    .filter('itemsPerPage', function(paginationService) {
        return function(collection, itemsPerPage) {
            itemsPerPage = itemsPerPage || 9999999999;
            var start = (paginationService.getCurrentPage() - 1) * itemsPerPage;
            var end = start + itemsPerPage;
            paginationService.setItemsPerPage(itemsPerPage);

            return collection.slice(start, end);
        };
    })

    .service('paginationService', function() {
        var itemsPerPage;
        var collectionLength;
        var currentPageParser;
        var context;
        this.paginationDirectiveInitialized = false;

        this.setCurrentPageParser = function(val, scope) {
            currentPageParser = val;
            context = scope;
        };
        this.setCurrentPage = function(val) {
            currentPageParser.assign(context, val);
        };
        this.getCurrentPage = function() {
            return currentPageParser(context);
        };

        this.setItemsPerPage = function(val) {
            itemsPerPage = val;
        };
        this.getItemsPerPage = function() {
            return itemsPerPage;
        };

        this.setCollectionLength = function(val) {
            collectionLength = val;
        };
        this.getCollectionLength = function() {
            return collectionLength;
        };
    })

    .directive('dirPaginationControls', function(paginationService) {

        /**
         * Generate an array of page numbers (or the '...' string) which is used in an ng-repeat to generate the
         * links used in pagination
         *
         * @param currentPage
         * @param dataset
         * @param rowsPerPage
         * @param paginationRange
         * @returns {Array}
         */
        function generatePagesArray(currentPage, collectionLength, rowsPerPage, paginationRange) {
            var pages = [];
            var totalPages = Math.ceil(collectionLength / rowsPerPage);
            var halfWay = Math.ceil(paginationRange / 2);
            var position;

            if (currentPage <= halfWay) {
                position = 'start';
            } else if (totalPages - halfWay < currentPage) {
                position = 'end';
            } else {
                position = 'middle';
            }

            var ellipsesNeeded = paginationRange < totalPages;
            var i = 1;
            while (i <= totalPages && i <= paginationRange) {
                var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

                var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
                var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
                if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                    pages.push('...');
                } else {
                    pages.push(pageNumber);
                }
                i ++;
            }
            return pages;
        }

        /**
         * Given the position in the sequence of pagination links [i], figure out what page number corresponds to that position.
         *
         * @param i
         * @param currentPage
         * @param paginationRange
         * @param totalPages
         * @returns {*}
         */
        function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
            var halfWay = Math.ceil(paginationRange/2);
            if (i === paginationRange) {
                return totalPages;
            } else if (i === 1) {
                return i;
            } else if (paginationRange < totalPages) {
                if (totalPages - halfWay < currentPage) {
                    return totalPages - paginationRange + i;
                } else if (halfWay < currentPage) {
                    return currentPage - halfWay + i;
                } else {
                    return i;
                }
            } else {
                return i;
            }
        }

        return {
            restrict: 'AE',
            templateUrl:  'app/views/dir-pagination.html',
            scope: {},
            link: function(scope, element, attrs) {
                if (!scope.maxSize) { scope.maxSize = 9; }
                scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : true;
                scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : false;

                if (paginationService.paginationDirectiveInitialized === false) {
                    throw "pagination directive: the pagination controls cannot be used without the corresponding pagination directive.";
                }

                var paginationRange = Math.max(scope.maxSize, 5);
                scope.pages = [];
                scope.pagination = {
                    last: 1,
                    current: 1
                };

                scope.$watch(function() {
                   return paginationService.getCollectionLength() * paginationService.getItemsPerPage();
                }, function(length) {
                    if (0 < length) {
                        generatePagination();
                    }
                });

                scope.$watch(function() {
                    return paginationService.getCurrentPage();
                }, function(currentPage) {
                    scope.pages = generatePagesArray(currentPage, paginationService.getCollectionLength(), paginationService.getItemsPerPage(), paginationRange);
                });

                scope.setCurrent = function(num) {
                    if (/^\d+$/.test(num)) {
                        if (0 < num && num <= scope.pagination.last) {
                            paginationService.setCurrentPage(num);
                            scope.pages = generatePagesArray(num, paginationService.getCollectionLength(), paginationService.getItemsPerPage(), paginationRange);
                            scope.pagination.current = num;
                        }
                    }
                };

                function generatePagination() {
                    scope.pages = generatePagesArray(1, paginationService.getCollectionLength(), paginationService.getItemsPerPage(), paginationRange);
                    scope.pagination.last = scope.pages[scope.pages.length - 1];
               
                    if (scope.pagination.last < scope.pagination.current) {
                        scope.setCurrent(scope.pagination.last);
                    }
                }
            }
        };
    });
/**
 * @overview Angular directive that is used to handle charts.
 * @author Carl Craig <carlcraig@3c-studios.com>.
 */
myApp.directive("tcChartjs", [ "TcChartjsFactory", function(TcChartjsFactory) {
    return new TcChartjsFactory();
} ]).directive("tcChartjsLine", [ "TcChartjsFactory", function(TcChartjsFactory) {
    return new TcChartjsFactory("line");
} ]).directive("tcChartjsBar", [ "TcChartjsFactory", function(TcChartjsFactory) {
    return new TcChartjsFactory("bar");
} ]).directive("tcChartjsRadar", [ "TcChartjsFactory", function(TcChartjsFactory) {
    return new TcChartjsFactory("radar");
} ]).directive("tcChartjsPolararea", [ "TcChartjsFactory", function(TcChartjsFactory) {
    return new TcChartjsFactory("polararea");
} ]).directive("tcChartjsPie", [ "TcChartjsFactory", function(TcChartjsFactory) {
    return new TcChartjsFactory("pie");
} ]).directive("tcChartjsDoughnut", [ "TcChartjsFactory", function(TcChartjsFactory) {
    return new TcChartjsFactory("doughnut");
} ]).factory("TcChartjsFactory", function() {
    return function(chartType) {
        return {
            restrict: "A",
            scope: {
                data: "=chartData",
                options: "=chartOptions",
                id: "@",
                type: "@chartType"
            },
            link: function($scope, $elem) {
                var ctx = $elem[0].getContext("2d");
                var chart = new Chart(ctx);
                $scope.$watch("data", function(value) {
                    if (value) {
                        if (chartType) {
                            chart[cleanChartName(chartType)]($scope.data, $scope.options);
                        } else {
                            chart[cleanChartName($scope.type)]($scope.data, $scope.options);
                        }
                    }
                }, true);
                function cleanChartName(type) {
                    type = type.toLowerCase();
                    switch (type) {
                      case "line":
                        return "Line";

                      case "bar":
                        return "Bar";

                      case "radar":
                        return "Radar";

                      case "polararea":
                        return "PolarArea";

                      case "pie":
                        return "Pie";

                      case "doughnut":
                        return "Doughnut";

                      default:
                        return "";
                    }
                }
            }
        };
    };
});
/**
 * @overview Filters that are used to format data within views and controllers.
 * @author Martin Vach
 */

/**
 * Allow to display html tags in the scope
 * @function toTrusted
 */
myApp.filter('toTrusted', ['$sce', function ($sce) {
        return function (text) {
            if (text == null) {
                return '';
            }
            return $sce.trustAsHtml(text);
        };
    }]);
/**
 * Strip HTML tags from input
 * @function stripTags
 */
myApp.filter('stripTags', function () {
    return function (text) {
        return String(text).replace(/<[^>]+>/gm, '');
    };
});
/**
 * Shorten the text to the specified number of characters
 * @function cutText
 */
myApp.filter('cutText', function () {
    return function (value, wordwise, max, tail) {
        if (!value)
            return '';

        max = parseInt(max, 10);
        if (!max)
            return value;
        if (value.length <= max)
            return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});
/**
 * Convert val to int
 * @function toInt
 */
myApp.filter('toInt', function () {
    return function (val, a) {
        a = typeof a !== 'undefined' ? a : 10;
        if (val === null || val === '' || isNaN(val)) {
            return 0;
        }
        return parseInt(val, a);
    };
});

/**
 * Convert val to string
 * @function toString
 */
myApp.filter('toString', function () {
    return function (val) {
        return val.toString();
    };
});

/**
 * Convert val to bool
 * @function toBool
 */
myApp.filter('toBool', function () {
    return function (val) {
        return (String(val).toLowerCase() === 'true');
    };
});

/**
 * Get type of a Javascript variable
 * @function typeOf
 */
myApp.filter('typeOf', function () {
    return function (obj) {
        return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
    };
});

/**
 * Convert a dec value to hex
 * @function dec2hex
 */
myApp.filter('dec2hex', function () {
    return function (i) {
        var result = "0000";
        if (i >= 0 && i <= 15) {
            result = "000" + i.toString(16);
        } else if (i >= 16 && i <= 255) {
            result = "00" + i.toString(16);
        } else if (i >= 256 && i <= 4095) {
            result = "0" + i.toString(16);
        } else if (i >= 4096 && i <= 65535) {
            result = i.toString(16);
        }
        return result;
    };
});

/**
 * Get a file extension from the path
 * @function fileExtension
 */
myApp.filter('fileExtension', function () {
    return function (path) {
        // extract file name from full path ...
        // (supports `\\` and `/` separators)
        var basename = path.split(/[\\/]/).pop(),
                // get last position of `.`                                      
                pos = basename.lastIndexOf(".");
        // if file name is empty or ...
        //  `.` not found (-1) or comes first (0)
        if (basename === '' || pos < 1) {
            return '';
        }

        // extract extension ignoring `.`
        return basename.slice(pos + 1);
    };
});

/**
 * Convert file size in bytes to human readable with a scale type
 * @function fileSizeString
 */
myApp.filter('fileSizeString', function () {
    return function (bytes) {
        var i = -1;
        var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
        do {
            bytes = bytes / 1024;
            i++;
        } while (bytes > 1024);

        return Math.max(bytes, 0.1).toFixed(1) + byteUnits[i];
    };
});

/**
 * Set max length of the number entered
 * @function numberFixedLen
 */
myApp.filter('numberFixedLen', function () {
    return function (val) {
        if (val == 0) {
            return 0;
        }
        if (!val) {
            return;
        }
        var len = 1;
        var isDec = val.toString().split(".");
        if (isDec.length > 1 && isDec[1].length > len) {
            var num = parseFloat(val);
            if (isNaN(num)) {
                return val;
            } else {
                return num.toFixed(len);
            }

        }
        return val;
    };
});

/**
 * Check if an object exists and has a node.
 * @function hasNode
 */
myApp.filter('hasNode', function () {
    return function (obj, path) {
        if (!obj || !path) {
            return null;
        }
        //console.log(path);
        path = path.split('.');
        var p = obj || {};
        for (var i in path) {
            if (p === null || typeof p[path[i]] === 'undefined') {
                return null;
            }
            p = p[path[i]];
        }
        return p;
    };
});
/**
 * Output integer with leading zeros
 * @function zeroFill
 */
myApp.filter('zeroFill', function () {
    return function (num, len) {
        len = len || 10;
        return (Array(len).join("0") + num).slice(-len);
    };
});
/**
 * DEPRECATED
 * Builds an element icon path
 * @function getElementIcon
 */
//myApp.filter('getElementIcon', function (cfg) {
//    return function (input, device, level) {
//        var icon = cfg.img.icons + 'placeholder.png';
//
//        if (input) {
//            if ((/^https?:\/\//.test(input))) {
//                return input;
//            } else if ((/\.(png|gif|jpe?g)$/).test(input)) {
//                if (input.indexOf('/') > -1) {
//                    return input;
//                } else {
//                    return cfg.img.icons + input;
//                }
//            }
//            switch (input) {
//                case 'door':
//                    icon = cfg.img.icons + (level == 'open' || level == 'on' ? 'door-open.png' : 'door-closed.png');
//                    break;
//
//                case 'window':
//                    if (typeof (level) === 'number') {
//                        if (level == 0) {
//                            icon = cfg.img.icons + 'window-down.png';
//                        } else if (level >= 99) {
//                            icon = cfg.img.icons + 'window-up.png';
//                        } else {
//                            icon = cfg.img.icons + 'window-half.png';
//                        }
//                    } else {
//                        icon = cfg.img.icons + (level == 'open' || level == 'on' ? 'window-open.png' : 'window-closed.png');
//                    }
//                    break;
//                case 'doorlockcontrol':
//                    icon = cfg.img.icons + 'lock-closed.png';
//                    break;
//
//                case 'switch':
//                    icon = cfg.img.icons + (level == 'on' ? 'switch-on.png' : 'switch-off.png');
//                    break;
//
//                case 'motion':
//                    icon = cfg.img.icons + (level == 'on' ? 'motion-on.png' : 'motion-off.png');
//                    break;
//
//                case 'blinds':
//                    if (level == 0) {
//                        icon = cfg.img.icons + 'blind-down.png';
//                    } else if (level >= 99) {
//                        icon = cfg.img.icons + 'blind-up.png';
//                    } else {
//                        icon = cfg.img.icons + 'blind-half.png';
//                    }
//                    break;
//
//                case 'multilevel':
//                    if (level == 0) {
//                        icon = cfg.img.icons + 'dimmer-off.png';
//                    } else if (level >= 99) {
//                        icon = cfg.img.icons + 'dimmer-on.png';
//                    } else {
//                        icon = cfg.img.icons + 'dimmer-half.png';
//                    }
//                    break;
//                case 'thermostat':
//                    icon = cfg.img.icons + 'thermostat.png';
//                    break;
//
//                case 'energy':
//                    icon = cfg.img.icons + 'energy.png';
//                    break;
//
//                case 'meter':
//                    icon = cfg.img.icons + 'meter.png';
//                    break;
//
//                case 'temperature':
//                    icon = cfg.img.icons + 'temperature.png';
//                    break;
//
//                case 'camera':
//                    icon = cfg.img.icons + 'camera.png';
//                    break;
//                case 'smoke':
//                    icon = cfg.img.icons + 'smoke.png';
//                    break;
//                case 'alarm':
//                    icon = cfg.img.icons + 'alarm.png';
//                    break;
//                case 'battery':
//                    icon = cfg.img.icons + 'battery.png';
//                    break;
//                case 'luminosity':
//                    icon = cfg.img.icons + 'luminosity.png';
//                    break;
//                case 'humidity':
//                    icon = cfg.img.icons + 'humidity.png';
//                    break;
//                case 'ultraviolet':
//                    icon = cfg.img.icons + 'ultraviolet.png';
//                    break;
//                case 'barometer':
//                    icon = cfg.img.icons + 'barometer.png';
//                    break;
//                case 'new':
//                    icon = cfg.img.icons + 'new.png';
//                    break;
//                default:
//                    break;
//            }
//
//        } else {
//            switch (device.deviceType) {
//                case 'switchControl':
//                    icon = cfg.img.icons + 'switch-control.png';
//                    break;
//                default:
//                    break;
//            }
//        }
//        return icon;
//    };
//});

/**
 * Builds an event icon path
 * @function getEventIcon
 */
myApp.filter('getEventIcon', function (cfg) {
    return function (input, message) {
        var icon = cfg.img.icons + 'placeholder.png';
        switch (input) {
            case 'device-temperature':
                icon = cfg.img.icons + 'event-device-temperature.png';
                break;
            case 'device-electric':
                icon = cfg.img.icons + 'event-device-electric.png';
                break;
            case 'device-power':
                icon = cfg.img.icons + 'event-device-power.png';
                break;
            case 'device-status':
                icon = cfg.img.icons + 'event-device-status.png';
                break
            case 'device-OnOff':
                if (angular.isObject(message)) {
                    icon = (message.l == 'on' ? cfg.img.icons + 'event-device-on.png' : cfg.img.icons + 'event-device-off.png');
                } else {
                    icon = cfg.img.icons + 'event-device-on.png';
                }
                break
            case 'device-luminiscence':
                icon = cfg.img.icons + 'event-device-luminiscence.png';
                break
            case 'device':
                icon = cfg.img.icons + 'event-device.png';
                break
            case 'module':
                icon = cfg.img.icons + 'event-module.png';
                break
            default:
                break;
        }
        return icon;
    };
});

/**
 * Builds a battery icon path
 * @function getBatteryIcon
 */
myApp.filter('getBatteryIcon', function (cfg) {
    return function (input) {
        var icon = cfg.img.icons + 'battery.png';
        if (isNaN(input)) {
            return icon;
        }
        var level = parseInt(input);
        if (level > 95) {
            icon = cfg.img.icons + 'battery-100.png';
        } else if (level >= 70 && level <= 95) {
            icon = cfg.img.icons + 'battery-80.png';
        } else if (level >= 50 && level < 70) {
            icon = cfg.img.icons + 'battery-50.png';
        } else if (level > 20 && level < 50) {
            icon = cfg.img.icons + 'battery-30.png';
        } else if (level >= 5 && level <= 20) {
            icon = cfg.img.icons + 'battery-20.png';
        } else {
            icon = cfg.img.icons + 'battery-0.png';
        }
        return icon;
    };
});

/**
 * Get a category icon in the Elements sections
 * @function getElCategoryIcon
 */
myApp.filter('getElCategoryIcon', function () {
    return function (input) {
        var array = {
            text: 'fa-file-text-o',
            camera: 'fa-video-camera',
            switchRGBW: 'fa-star-half-o',
            switchControl: 'fa-toggle-off',
            switchBinary: 'fa-toggle-on',
            sensorMultiline: 'fa-list-ul',
            switchMultilevel: 'fa-cogs',
            toggleButton: 'fa-dot-circle-o',
            sensorMultilevel: 'fa-clock-o',
            sensorBinary: 'fa-fire'
        };
        // Default icon
        if (!array[input]) {
            return 'fa-caret-right';
        }

        return array[input];
    };
});

/**
 * Get a category icon in the APPs sections
 * @function getAppCategoryIcon
 */
myApp.filter('getAppCategoryIcon', function () {
    return function (input) {
        var array = {
            basic_gateway_modules: 'fa-cube',
            legacy_products_workaround: 'fa-wrench',
            support_external_ui: 'fa-object-group',
            support_external_dev: 'fa-cubes',
            automation_basic: 'fa-refresh',
            device_enhancements: 'fa-plus-square',
            developers_stuff: 'fa-file-code-o',
            complex_applications: 'fa-link',
            //automation: '',
            security: 'fa-shield',
            peripherals: 'fa-bolt',
            logging: 'fa-list-ul',
            //scripting: '',
            devices: 'fa-cogs',
            scheduling: 'fa-calendar-plus-o',
            //climate: '',
            environment: 'fa-puzzle-piece',
            //scenes: '',
            notifications: 'fa-calendar',
            tagging: 'fa-tags'
        };
        // Default icon
        if (!array[input]) {
            return 'fa-caret-right';
        }

        return array[input];
    };
});

/**
 * Get an icon for awake/sleep status
 * @function getMaxLevel
 */
myApp.filter('getAwakeIcon', function () {
    return function (input) {
        switch (input) {
            case 'awake':
                return 'fa-certificate color-orange';
            case 'sleep':
                return 'fa-moon-o text-primary';
            default:
                return '';
        }

    };
});

/**
 * Get max level by probeType from the devices data holder
 * @function getMaxLevel
 */
myApp.filter('getMaxLevel', function () {
    return function (input, maxLevel) {
        maxLevel = maxLevel || 100;
        return Math.min(input, maxLevel);
    };
});

/**
 * Today from unix - ExpertUI filter used in the device hardware configuration
 * @function isTodayFromUnix
 */
myApp.filter('isTodayFromUnix', function () {
    return function (input) {
        if (isNaN(input)) {
            return '?';
        }

        var d = new Date(input * 1000);
        var day = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
        var mon = d.getMonth() + 1; //Months are zero based
        mon = (mon < 10 ? '0' + mon : mon);
        var year = d.getFullYear();
        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
        var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());

        if (d.toDateString() == (new Date()).toDateString()) {
            return hrs + ':' + min;

        } else {
            return day + '.' + mon + '.' + year;
        }
    };
});
/**
 * Get time from the box and displays it in the hrs:min:sec format
 * @function getCurrentTime
 */
myApp.filter('setTimeFromBox', function () {
    return function (input) {
        if (input) {
            var d = new Date(input * 1000);
        } else {
            var d = new Date();
        }
        // Convert to ISO
        // 2016-06-07T11:49:51.000Z
        return d.toISOString().substring(11, d.toISOString().indexOf('.'));
    };
});
/**
 * DEPRECATED
 * Get current time in the hrs:min:sec format
 * @function getCurrentTime
 */
//myApp.filter('getCurrentTime', function () {
//    return function (input) {
//        if (input.localTimeUT) {
//            var d = new Date(input.localTimeUT * 1000);
//            if(input.localTimeZoneOffset > 0){
//                 d.setHours(d.getHours() + Math.abs(input.localTimeZoneOffset));
//            }else if(input.localTimeZoneOffset < 0){
//                 d.setHours(d.getHours() - Math.abs(input.localTimeZoneOffset));
//            }
//            // 2016-06-07T11:49:51.000Z
//            
//        } else {
//            var d = new Date();
//        }
//        //var d = new Date();
//        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
//        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
//        var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());
//        var time = hrs + ':' + min + ':' + sec;
//        return time;
//    };
//});
/**
 * Get a day from the unix timstamp for filtering events
 * @function unixStartOfDay
 */
myApp.filter('unixStartOfDay', function () {
    return function (input, value) {
        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var timestamp = (startOfDay / 1000) + (3600 * 2);
        if (input && value) {
            switch (input) {
                case '+':
                    timestamp += value;
                    break;
                case '-':
                    timestamp -= value;
                    break;
                default:
                    break;
            }
        }
        return timestamp;
    };
});
/**
 * If is today display h:m otherwise d:m:y
 * @function isToday
 */
myApp.filter('isToday', function () {
    return function (input, fromunix, days, yesterday) {
        if (new Date(input) === "Invalid Date" && isNaN(new Date(input))) {
            return '';
        };
        if (fromunix) {
            var d = new Date(input * 1000);
            var startDate = new Date(input * 1000);  // 2000-01-01
        } else {
            var d = new Date(input);
            var startDate = new Date(input);  // 2000-01-01
        }


        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());

        if (d.toDateString() == (new Date()).toDateString()) {
            return hrs + ':' + min;

        } else {

            var endDate = new Date();              // Today
            var nDays = diffDays(startDate, endDate) + 1;
            var str = '' + (nDays + 1) + ' ' + days;
            if (nDays < 2) {
                str = yesterday;
            }
            return str;
        }
    };
    // Calculate the number of days between two dates
    function diffDays(d1, d2)
    {
        var ndays;
        var tv1 = d1.valueOf();  // msec since 1970
        var tv2 = d2.valueOf();

        ndays = (tv2 - tv1) / 1000 / 86400;
        ndays = Math.round(ndays - 0.5);
        return ndays;
    }
});

/**
 * Renders an event date - If is today display h:m otherwise d:m:y
 * @function eventDate
 */
myApp.filter('eventDate', function () {
    return function (input) {
        var d = new Date(input);
        var day = d.getDate();
        var mon = d.getMonth() + 1; //Months are zero based
        var year = d.getFullYear();
        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
        var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());

        if (d.toDateString() == (new Date()).toDateString()) {
            return hrs + ':' + min;

        } else {
            return day + '.' + mon + '. -  ' + hrs + ':' + min;
        }
    };
});

/**
 * Convert MySql DateTime stamp into JavaScript's Date format
 * @function mysqlToUnixTs
 */
myApp.filter('mysqlToUnixTs', function () {
    return function (input) {
        //function parses mysql datetime string and returns javascript Date object
        //input has to be in this format: 2007-06-05 15:26:02
        var regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
        var parts = input.replace(regex, "$1 $2 $3 $4 $5 $6").split(' ');
        return Math.floor(new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]).getTime() / 1000);
    };
});

/**
 * Set an object with unique key-values only
 * @function unique
 */
myApp.filter('unique', function () {
    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
});
/**
 * Get uri segment
 * @function uri
 */
myApp.filter('uri', function ($location) {
    return {
        segment: function (segment) {
            var data = $location.path().split("/");
            if (data[segment]) {
                return data[segment];
            }
            return false;
        },
        total_segments: function () {
            var data = $location.path().split("/");
            var i = 0;
            angular.forEach(data, function (value) {
                if (value.length) {
                    i++;
                }
            });
            return i;
        }
    };
});

/**
 * Build a device name
 * @function deviceName
 */
myApp.filter('deviceName', function () {
    return function (deviceId, device) {
        var name = (deviceId == 1 ? 'Z-Way' : 'Device ' + '_' + deviceId);
        if (device === undefined) {
            return name;
        }
        if (device.data.givenName.value != '') {
            name = device.data.givenName.value;
        }
        return name;
    };
});

/**
 * Convert text to slug
 * @function stringToSlug
 */
myApp.filter('stringToSlug', function () {
    return function (str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to = "aaaaeeeeiiiioooouuuunc------";
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/-+/g, '-'); // collapse dashes

        return str;
    };
});


/**
 * Set a hardware configuration value
 * @function setConfigValue
 */
myApp.filter('setConfigValue', function () {
    return function (value) {
        if (isNaN(parseInt(value))) {
            return '\'' + value + '\'';
        } else {
            return value;
        }

    };
});

/**
 * Set rgb colors
 * @function etRgbColors
 */
myApp.filter('setRgbColors', function () {
    return function (color) {
        return 'rgb('+ color.r +',' + color.g  + ',' + color.b  +')';

    };
});
/**
 * @overview Receives data from the Alpaca form and stores them on the server.
 * @author Martin Vach,Niels Roche 
 */

/**
 * POST/PUT data from Alpaca form
 * @returns false
 */
var postRenderAlpaca = function (renderedForm) {

    var $alpaca = $('#alpaca_data');

    //load postRender function from module
    if ($alpaca && $alpaca.data('modulePostrender') && !!$alpaca.data('modulePostrender')) {
        eval($alpaca.data('modulePostrender'));

        // call postRender function from module
        if (typeof (modulePostRender) == 'function') {
            $(document).ready(modulePostRender(renderedForm));
        }
    }

    $('#btn_module_submit').click(function () {
       var data = postRenderAlpacaData(renderedForm);
        var url = config_data.cfg.server_url + config_data.cfg.api['instances'] + (data.instanceId > 0 ? '/' + data.instanceId : '');
        var type = (data.instanceId > 0 ? 'PUT' : 'POST');
        var sid = $(this).data('sid');
        var lang = $(this).data('lang');
        var fromapp = $(this).data('fromapp');
        
        // submit via ajax
        $.ajax({
            type: type,
            cache: false,
            url: url,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': sid
            },
            data: JSON.stringify(data),
            beforeSend: function () {
                //console.log(data);
                return;
                //$('.module-spinner').show();
            },
            success: function (response) {
                $('.module-spinner').fadeOut();
                if (fromapp) {
                    window.location.replace("#module/post/" + fromapp);
                } else {
                    if (data.instanceId > 0) {
                        window.location.replace("#apps/instance");
                    } else {
                        window.location.replace("#apps/local");
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $('.module-spinner').fadeOut();
                if (xhr.status && xhr.status == 400) {
                    alert(xhr.responseText);
                } else {
                    alert("Something went wrong");
                }
            }
        });
        return false;
    });
};
/**
 * Build form data
 * @returns {Object}
 */
function postRenderAlpacaData(renderedForm) {
    var defaults = ['instanceId', 'moduleId', 'active', 'title', 'description'];
    var alpacaData = {'params': renderedForm.getValue()};
    var formData = $('#form_module').serializeArray();
    var inputData = {};
    $.each(formData, function (k, v) {
        if (defaults.indexOf(v.name) > -1) {
            inputData[v.name] = v.value;
        }

    });
    return $.extend(inputData, alpacaData);
}
;
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
myAppController.controller('BaseController', function ($scope, $rootScope, $cookies, $filter, $location, $route, $window, $interval, $timeout, $http, cfg, cfgicons, dataFactory, dataService, myCache) {

    // Global scopes
    $scope.$location = $location;
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
    if($scope.user){
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

        } else {
            dataFactory.getApi('skins_active').then(function (response) {
                if (response.data.data.name !== 'default') {
                    cfg.skin.active = response.data.data.name;
                    cfg.img.icons = cfg.skin.path + response.data.data.name + '/img/icons/';
                    cfg.img.logo = cfg.skin.path + response.data.data.name + '/img/logo/';
                    $("link[id='main_css']").attr('href', cfg.skin.path + response.data.data.name + '/main.css');
                }
            }, function (error) {
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
     * todo: deprecated
     * Reset a fatal error.
     * @param {object} obj
     * @returns {undefined}
     */
    /*$scope.resetFatalError = function (obj) {
        angular.extend(cfg.route.fatalError, obj || {message: false, info: false, hide: false});

    };*/

    /**
     * Set timestamp and ping server if request fails
     * @returns {undefined}
     */
    $scope.setTimeStamp = function () {
        if (!$scope.user) {
            return;
        }
        dataFactory.pingServer( cfg.server_url + cfg.api['time']).then(function (response) {
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
            console.log(error)
            if(error.status === 0){
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
                    $timeout(function(){ $window.location.reload();}, 5000);

                }
            }

        }, function (error) {
        });

    };

    /**
     * todo: Deprecated
     * Handle HTTP pending
     * @returns {undefined}
     */
    $scope.handlePending = function () {
       /* angular.forEach($http.pendingRequests, function(request) {
            if (request.cancel && request.timeout) {
               console.log(request)
                //request.cancel.resolve();
            }
        });
        return;*/
        /*var countUp = function () {
            var pending = _.findWhere($http.pendingRequests, {url: '/ZAutomation/api/v1/system/time/get'});
            if (pending) {
                console.log('HAS PENDING');
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
            //handleError(pending);
        }
        $timeout(countUp, cfg.pending_timeout_limit);*/

        /**
         * todo: deprecated
         * Handle error message
         * @param {object} pending
         */
        /*function handleError(pending) {
            if (pending) {
                console.log('HAS PENDING');
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
            } else {
                console.log('!!!!NO PENDING');
                if (cfg.route.fatalError.type === 'network') {
                 dataFactory.sessionApi().then(function (sessionRes) {
                 var user = sessionRes.data.data;
                 if (sessionRes.data.data) {
                 dataService.setZWAYSession(user.sid);
                 dataService.setUser(user);
                 if (dataService.getUser()) {
                 $window.location.reload();
                 }
                 }

                 }, function (error) {});
                 }
            }
        }*/

    };

    /**
     * Route on change start
     */
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
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
        //$scope.handlePending();
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

    // Alertify defaults
    alertify.defaults.glossary.title = cfg.app_name;
    alertify.defaults.glossary.ok = 'OK';
    alertify.defaults.glossary.cancel = 'CANCEL';

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

/**
 * @overview The uncategorized controllers.
 * @author Martin Vach
 */

/**
 * The controller that handles 404 Not found response.
 * @class Error404Controller
 */
myAppController.controller('Error404Controller', function($scope, cfg) {
    angular.extend(cfg.route.fatalError, {
        message: cfg.route.t['error_404'],
        hide: true
    });

});


/**
 * @overview Controllers that handle the JamesBox actions.
 * @author Martin Vach
 */

/**
 * Load required http requests an update JamesBox record in the database.
 * @class JbUpdateController
 */
myAppController.controller('JbUpdateController', function ($scope, $q, $location, cfg, dataFactory, _) {
    $scope.jamesbox = {
        showConfirm: false,
        showUpdate: false,
        rule_id: '',
        uuid: '',
        version: '',
        versionNew: '',
        interval: null
    };
    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZwaveApiData()
        ];

        $q.allSettled(promises).then(function (response) {
            var zwave = response[0];
            $scope.loading = false;
            // Error message
            if (zwave.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
            }

            // Success - zwave controller
            if (zwave.state === 'fulfilled') {
                $scope.jamesbox.uuid = zwave.value.controller.data.uuid.value;
                $scope.jamesbox.version = zwave.value.controller.data.softwareRevisionVersion.value;
                $scope.jamesBoxRequest();
            }
        });
    };
    $scope.allSettled();

    /**
     * Load JamesBox data
     */
    $scope.jamesBoxRequest = function () {
        $scope.loading = false;
        // REMOVE
        dataFactory.postToRemote(cfg.api_remote['jamesbox_request'], $scope.jamesbox).then(function (response) {
            if (!_.isEmpty(response.data)) {
                $scope.jamesbox.versionNew = response.data.firmware_version;
                $scope.jamesbox.rule_id = response.data.rule_id;
                $scope.jamesbox.showConfirm = true;
            } else {
                alertify.alertError($scope._t('no_update_available')).set('onok', function(closeEvent){ 
                     alertify.dismissAll();
                     $location.path("/dashboard");
                });
            }
        }, function (error) { });
    }
    ;

    /**
     * Update JamesBox record
     */
    $scope.firmwareUpdate = function () {
        var input = {
            uuid: $scope.jamesbox.uuid,
            rule_id: $scope.jamesbox.rule_id
        };
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('jamesbox_confirm')};
        dataFactory.postToRemote(cfg.api_remote['jamesbox_update'], input).then(function (response) {
            $scope.loading = false;
            $scope.jamesbox.showConfirm = false;
            $scope.jamesbox.showUpdate = true;
        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status === 409) {
                message = $scope._t('jamesbox_update_exists');
            }
            alertify.alertError($scope._t(message));
            $scope.loading = false;
        });
    };

    /**
     * Update JamesBox record
     */
    $scope.cancelUpdate = function () {
        var input = {
            uuid: $scope.jamesbox.uuid,
            rule_id: $scope.jamesbox.rule_id
        };
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('jamesbox_remove_confirm')};
        dataFactory.postToRemote(cfg.api_remote['jamesbox_cancel_update'], input).then(function (response) {
            $scope.loading = false;
            $location.path("/dashboard");
        }, function (error) {
            $scope.loading = false;
            var message = $scope._t('error_update_data');
            alertify.alertError($scope._t(message)).set('onok', function(closeEvent){
                 alertify.dismissAll();
                 $location.path("/dashboard");
            });
        });
    };

    /**
     * reboot system
     */
    $scope.systemReboot = function () {
        dataFactory.getApi('system_reboot').then(function (response) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('rebooting')};
        }, function (error) {
            var message = $scope._t('jamesbox_update_manuel_restart');
            alertify.alertError($scope._t(message));
            $scope.loading = false;
        });
    };

});
/**
 * @overview Controllers that handle the list of elements, as well as an element detail.
 * @author Martin Vach
 */

/**
 * The element root controller
 * @class ElementBaseController
 */
myAppController.controller('ElementBaseController', function ($scope, $q, $interval, $cookies, $filter, dataFactory, dataService) {
    $scope.dataHolder = {
        firstLogin: false,
        cnt: {
            devices: 0,
            collection: 0,
            hidden: 0
        },
        devices: {
            switchButton: [],
            noDashboard: false,
            noDevices: false,
            show: true,
            all: {},
            byId: {},
            collection: {},
            deviceType: {},
            find: {},
            tags: [],
            filter: ($cookies.filterElements ? angular.fromJson($cookies.filterElements) : {}),
            rooms: {},
            orderBy: ($cookies.orderByElements ? $cookies.orderByElements : 'creationTimeDESC'),
            showHidden: ($cookies.showHiddenEl ? $filter('toBool')($cookies.showHiddenEl) : false)
        }
    };
    $scope.apiDataInterval = null;

    /**
     * Cancel interval on page destroy
     */
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var locations = response[0];
            var devices = response[1];
            $scope.loading = false;
            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                $scope.dataHolder.devices.show = false;
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.dataHolder.devices.rooms = dataService.getRooms(locations.value.data.data).indexBy('id').value();
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                // Count hidden apps
                $scope.dataHolder.cnt.hidden = _.chain(dataService.getDevicesData(devices.value.data.data.devices, true))
                        .flatten().where({visibility: false})
                        .size()
                        .value();
                // Set devices
                setDevices(dataService.getDevicesData(devices.value.data.data.devices, $scope.dataHolder.devices.showHidden));

            }
        });
    };
    $scope.allSettled();

    /**
     * Get device by ID
     */
    $scope.getDeviceById = function (id) {
        var device = _.where($scope.dataHolder.devices.collection, {id: id});
        if (device[0]) {
            angular.extend($scope.dataHolder.devices.byId, device[0]);
        }
    };



    /**
     * Refresh data
     */
    $scope.refreshDevices = function () {
        var refresh = function () {
            dataFactory.refreshApi('devices').then(function (response) {
                if (response.data.data.devices.length > 0) {
                    angular.forEach(response.data.data.devices, function (v, k) {
                        if (v.metrics.level) {
                            v.metrics.level = $filter('numberFixedLen')(v.metrics.level);
                        }
                        var index = _.findIndex($scope.dataHolder.devices.all, {id: v.id});
                        if (!$scope.dataHolder.devices.all[index]) {
                            return;
                        }
                        angular.extend($scope.dataHolder.devices.all[index],
                                {metrics: v.metrics},
                                {imgTrans: false},
                                {iconPath: dataService.assignElementIcon(v)},
                                {updateTime: v.updateTime}
                        );
                        //console.log('Updating from server response: device ID: ' + v.id + ', metrics.level: ' + v.metrics.level + ', updateTime: ' + v.updateTime);
                    });
                }
                if (response.data.data.structureChanged === true) {
                    $scope.allSettled();
                }

            }, function (error) {
                $interval.cancel($scope.apiDataInterval);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshDevices();

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        if (!filter) {
            angular.extend($scope.dataHolder.devices, {filter: {}});
            $cookies.filterElements = angular.toJson({});
        } else {
            angular.extend($scope.dataHolder.devices, {filter: filter});
            $cookies.filterElements = angular.toJson(filter);
        }

        $scope.reloadData();
    };

    /**
     * Show hidden elements
     */
    $scope.showHiddenEl = function (status) {
        angular.extend($scope.dataHolder.devices, {filter: {}});
        $cookies.filterElements = angular.toJson({});
        status = $filter('toBool')(status);
        angular.extend($scope.dataHolder.devices, {showHidden: status});
        $cookies.showHiddenEl = status;
        $scope.reloadData();
    };

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.devices, {orderBy: key});
        $cookies.orderByElements = key;
        $scope.reloadData();
    };

    /**
     * Run command
     */
    $scope.runCmd = function (cmd, id) {
        dataFactory.runApiCmd(cmd).then(function (response) {
            var index = _.findIndex($scope.dataHolder.devices.all, {id: id});
            if ($scope.dataHolder.devices.all[index]) {
                angular.extend($scope.dataHolder.devices.all[index],
                        {imgTrans: true}
                );
            }

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    };
    /**
     * Reset devicse data holder
     */
    $scope.resetDevices = function (devices) {
        angular.extend($scope.dataHolder.devices, devices);
    };

    /**
     * Delete device history
     */
    $scope.deleteHistory = function (input, message, event) {
        alertify.confirm(message, function () {
            dataFactory.deleteApi('history', input.id).then(function (response) {
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.handleModal('modalHistory', event);
                $scope.reloadData();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });

        });
    };

    /**
     * Set visibility
     */
    $scope.setVisibility = function (v, visibility) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', v.id, {visibility: visibility}).then(function (response) {
            $scope.loading = false;
            $scope.reloadData();
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
    };

    /**
     * Set exact value for the command
     */
    $scope.setExactCmd = function (v, type, run) {
        var count;
        var val = parseInt(v.metrics.level);
        var min = parseInt(v.minMax.min, 10);
        var max = parseInt(v.minMax.max, 10);
        var step = parseFloat(v.minMax.step);
        switch (type) {
            case '-':
                count = val - step;
                break;
            case '+':
                count = val + step;
                break;
            default:
                count = parseInt(type, 10);
                break;
        }

        if (count < min) {
            count = min;
        }
        if (count > max) {
            count = max;
        }

        var cmd = v.id + '/command/exact?level=' + count;
        v.metrics.level = count;
         //console.log('ElementBaseController.setExactCmd - Sending request: ', cmd)
        //if (run) {
            $scope.runCmd(cmd);
       // }

        //return cmd;
    };

    /// --- Private functions --- ///
    /**
     * Set device
     */
    function setDevices(devices) {
        // Set tags
        _.filter(devices.value(), function (v) {
            if (v.tags.length > 0) {
                angular.forEach(v.tags, function (t) {
                    if ($scope.dataHolder.devices.tags.indexOf(t) === -1) {
                        $scope.dataHolder.devices.tags.push(t);
                    }
                });
            }
        });
        // Set categories
        $scope.dataHolder.devices.deviceType = devices.countBy(function (v) {
            return v.deviceType;
        }).value();

        $scope.dataHolder.cnt.devices = devices.size().value();

        //All devices
        $scope.dataHolder.devices.all = devices.value();
        if (_.isEmpty($scope.dataHolder.devices.all)) {
            $scope.dataHolder.devices.noDevices = true;
            return;
        }
        // Collection
        if ('tag' in $scope.dataHolder.devices.filter) {
            $scope.dataHolder.devices.collection = _.filter($scope.dataHolder.devices.all, function (v) {
                if (v.tags.indexOf($scope.dataHolder.devices.filter.tag) > -1) {
                    return v;
                }
            });
        } else {
            $scope.dataHolder.devices.collection = _.where($scope.dataHolder.devices.all, $scope.dataHolder.devices.filter);
        }
        if (_.isEmpty($scope.dataHolder.devices.collection)) {
            if ($scope.routeMatch('/dashboard')) {
                $scope.dataHolder.devices.noDashboard = true;
            } else {
                $scope.dataHolder.devices.noDevices = true;
            }
        }
        $scope.dataHolder.cnt.collection = _.size($scope.dataHolder.devices.collection);
    }
    ;

});

/**
 * The controller that handles a device chart.
 * @class ElementChartController
 */
myAppController.controller('ElementChartController', function ($scope, $sce, dataFactory, $interval) {
    $scope.widgetChart = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        hasURL : false,
        intchartUrl : '',
        url : {},
        time : 0,
        chartOptions: {
            // Chart.js options can go here.
            //responsive: true
        }
    };

    /**
      * Reload chart url
      */
    $scope.reloadUrl = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var device = response.data.data;

            if($scope.widgetChart.time < device.metrics.intchartTime){
                $scope.widgetChart.find = device;
                $scope.widgetChart.intchartUrl = device.metrics.intchartUrl + '&' + new Date().getTime();
                $scope.widgetChart.time = device.metrics.intchartTime;
                $scope.widgetChart.url = $sce.trustAsResourceUrl($scope.widgetChart.intchartUrl);
            }
        });
    };

    /**
      * Load device
      */
    $scope.loadDeviceUrl = function () {
        $scope.widgetChart.alert = {message: $scope._t('loading'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};

        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
                var device = response.data.data;
                if (!device) {
                    $scope.widgetChart.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                    return;
                }
                $scope.widgetChart.find = device;

                if (!device.metrics.intchartUrl){
                    $scope.widgetChart.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                    return;
                }

                $scope.widgetChart.hasURL = true;
                $scope.widgetChart.intchartUrl = device.metrics.intchartUrl;
                $scope.widgetChart.time = device.metrics.intchartTime;
                $scope.widgetChart.url = $sce.trustAsResourceUrl($scope.widgetChart.intchartUrl);

                $scope.refreshInterval = $interval($scope.reloadUrl, $scope.cfg.interval);

                $scope.widgetChart.alert = {message: false};

            }, function (error) {
            $scope.widgetChart.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };

    $scope.loadDeviceUrl();
});

/**
 * The controller that handles a device history.
 * @class ElementHistoryController
 */
myAppController.controller('ElementHistoryController', function ($scope, dataFactory, dataService, _) {
    $scope.widgetHistory = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        chartData: {},
        chartOptions: {
            // Chart.js options can go here.
            //responsive: true
        }
    };

    /**
     * Load device history
     */
    $scope.loadDeviceHistory = function () {
        var device = !_.isEmpty($scope.dataHolder.devices.byId) ? $scope.dataHolder.devices.byId : $scope.dataHolder.devices.find;
        if (!device) {
            $scope.widgetHistory.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetHistory.find = device;
        $scope.widgetHistory.alert = {message: $scope._t('loading'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        dataFactory.getApi('history', '/' + device.id + '?show=24', true).then(function (response) {
            $scope.widgetHistory.alert = {message: false};
            if (!response.data.data.deviceHistory) {
                $scope.widgetHistory.alert = {message: $scope._t('no_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                return;
            }
            $scope.widgetHistory.alert = {message: false};
            $scope.widgetHistory.chartData = dataService.getChartData(response.data.data.deviceHistory, $scope.cfg.chart_colors);
        }, function (error) {
            $scope.widgetHistory.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });

    };
    $scope.loadDeviceHistory();

});

/**
 * The controller that handles SwitchMultilevel element.
 * @class ElementSwitchMultilevelController
 */
myAppController.controller('ElementSwitchMultilevelController', function ($scope) {
    $scope.widgetSwitchMultilevel = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    $scope.knobopt = {
        width: 160
    };
    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (!device) {
            $scope.widgetSwitchMultilevel.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetSwitchMultilevel.find = device[0];
        return;
    };

    $scope.loadDeviceId();

});

/**
 * The controller that handles Thermostat element.
 * @class ElementThermostatController
 */
myAppController.controller('ElementThermostatController', function ($scope) {
    $scope.widgetThermostat = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    $scope.knobopt = {
        width: 160
    };
    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (!device) {
            $scope.widgetSwitchMultilevel.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetThermostat.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * The controller that handles SwitchRGBW element.
 * @class ElementSwitchRGBWController
 */
myAppController.controller('ElementSwitchRGBWController', function ($scope, dataFactory) {
    $scope.widgetSwitchRGBW = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        process: false,
        previewColor: 'rgb(255, 255, 255)',
        selectedColor: 'rgb(255, 255, 255)'
    };

    /**
     * Show RGB modal window
     */
    $scope.loadRgbWheel = function (input) {
        $scope.input = input;
        var bCanPreview = true; // can preview

        // create canvas and context objects
        var canvas = document.getElementById('wheel_picker');

        var ctx = canvas.getContext('2d');
        // drawing active image
        var image = new Image();
        image.onload = function () {
            ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
        };
        image.src = 'app/img/colorwheel.png';

        var defaultColor = "rgb(" + input.metrics.color.r + ", " + input.metrics.color.g + ", " + input.metrics.color.b + ")";
        //$('#wheel_picker_preview').css('backgroundColor', defaultColor);
        $scope.widgetSwitchRGBW.selectedColor = defaultColor;
        $scope.widgetSwitchRGBW.previewColor = defaultColor;
        $('#wheel_picker').mousemove(function (e) { // mouse move handler
            if (bCanPreview) {
                // get coordinates of current position
                var canvasOffset = $(canvas).offset();
                var canvasX = Math.floor(e.pageX - canvasOffset.left);
                var canvasY = Math.floor(e.pageY - canvasOffset.top);

                // get current pixel
                var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
                var pixel = imageData.data;

                // update preview color
                var pixelColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
                pixelColor = (pixelColor == 'rgb(0, 0, 0)' ? $scope.widgetSwitchRGBW.selectedColor : pixelColor);
                $scope.widgetSwitchRGBW.previewColor = pixelColor;

                // update controls
                $('#rVal').val('R: ' + pixel[0]);
                $('#gVal').val('G: ' + pixel[1]);
                $('#bVal').val('B: ' + pixel[2]);
                $('#rgbVal').val(pixel[0] + ',' + pixel[1] + ',' + pixel[2]);
            }
        });

        $('#wheel_picker').click(function (e) { // click event handler
           // bCanPreview = true;//!bCanPreview;
            if (bCanPreview) {
                var cmdColor = $('#rgbVal').val().split(',');
                var cmd = input.id + '/command/exact?red=' + cmdColor[0] + '&green=' + cmdColor[1] + '&blue=' + cmdColor[2] + '';
                var rgbColors = 'rgb('+ cmdColor[0]+',' + cmdColor[1] + ',' + cmdColor[2] +')';
                var rgbColorsObj = {
                    r: cmdColor[0],
                    g: cmdColor[1],
                    b: cmdColor[2]
                };
                $scope.widgetSwitchRGBW.process = true;
                dataFactory.runApiCmd(cmd).then(function (response) {
                    var findIndex = _.findIndex($scope.dataHolder.devices.collection, {id: input.id});
                   //angular.extend($scope.dataHolder.devices.collection[findIndex ].metrics,{rgbColors: rgbColors});
                    angular.extend($scope.dataHolder.devices.collection[findIndex ].metrics.color,rgbColorsObj);
                    angular.extend(input.metrics.color,rgbColorsObj);
                    $scope.widgetSwitchRGBW.process = false;
                    $scope.widgetSwitchRGBW.selectedColor = rgbColors;
                }, function (error) {
                    $scope.widgetSwitchRGBW.process = false;
                    $scope.widgetSwitchRGBW.alert = {message: $scope._t('error_update_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                });
            }
        });
    };


    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetSwitchRGBW.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetSwitchRGBW.find = device[0];
        $scope.loadRgbWheel($scope.widgetSwitchRGBW.find);
        return;
    };
    $scope.loadDeviceId();

});


/**
 * The controller that handles SensorMultiline element.
 * @class ElementSensorMultilineController
 */
myAppController.controller('ElementSensorMultilineController', function ($scope, $timeout, dataFactory, dataService) {
    $scope.widgetSensorMultiline = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var arr = [];
            arr[0] = response.data.data;
            $scope.widgetSensorMultiline.find = dataService.getDevicesData(arr).value()[0];
            if (_.isEmpty(response.data.data.metrics.sensors)) {
                $scope.widgetSensorMultiline.alert = {message: $scope._t('no_data'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
           $scope.widgetSensorMultiline.find.metrics.sensors = dataService.getDevicesData(response.data.data.metrics.sensors).value();
        }, function (error) {
            $scope.widgetSensorMultiline.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };
    $scope.loadDeviceId();
    /**
     * Run a command request
     */
    $scope.runMultilineCmd = function (cmd, id) {
        $scope.runCmd(cmd, id);
        $scope.loadDeviceId();
        $timeout(function () {
            $scope.loadDeviceId();
        }, 2000);
    };

});

/**
 * The controller that handles Camera element.
 * @class ElementCameraController
 */
myAppController.controller('ElementCameraController', function ($scope, $interval) {
    $scope.widgetCamera = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    $scope.url = undefined;
    $scope.refreshInterval = undefined;
    /**
     * Set camera url
     */
    $scope.setUrl = function () {
        var url = $scope.widgetCamera.find.metrics.url;
        if ($scope.widgetCamera.find.metrics.autoRefresh === true) {
            var now = new Date().getTime();
            if (url.indexOf('?') === -1) {
                url = url + '?' + now;
            } else {
                url = url + '&' + now;
            }
        }
        $scope.url = url;
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetCamera.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetCamera.find = device[0];
        $scope.setUrl();
        if ($scope.widgetCamera.find.metrics.autoRefresh === true) {
            $scope.refreshInterval = $interval($scope.setUrl, 1000 * 15);
        }
        return;
    };
    $scope.loadDeviceId();
});

/**
 * The controller that handles Text element.
 * @class ElementTextController
 */
myAppController.controller('ElementTextController', function ($scope) {
    $scope.widgetText = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetText.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetText.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * The controller that handles OpenWeather element.
 * @class ElementOpenWeatherController
 */
myAppController.controller('ElementOpenWeatherController', function ($scope) {
    $scope.widgetOpenWeather = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        var device = _.where($scope.dataHolder.devices.collection, {id: $scope.dataHolder.devices.find.id});
        if (_.isEmpty(device)) {
            $scope.widgetOpenWeather.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            return;
        }
        $scope.widgetOpenWeather.find = device[0];
        return;
    };
    $scope.loadDeviceId();

});

/**
 * The controller that handles ClimateControl element.
 * @class ElementClimateControlController
 */
myAppController.controller('ElementClimateControlController', function ($scope, $filter, dataFactory) {
    $scope.widgetClimateControl = {
        find: {},
        rooms: {},
        alert: {message: false, status: 'is-hidden', icon: false},
        model: [],
        devicesId: _.indexBy($scope.dataHolder.devices.all, 'id')
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var device = response.data.data;
            if (_.isEmpty(device)) {
                $scope.widgetClimateControl.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                return;
            }
            $scope.widgetClimateControl.find = device;
            $scope.widgetClimateControl.rooms = _.chain(device.metrics.rooms)
                    .flatten()
                    .filter(function (v) {
                        angular.extend(v,
                                {roomTitle: $scope.dataHolder.devices.rooms[v.room].title},
                                {roomIcon: $scope.dataHolder.devices.rooms[v.room].img_src},
                                {sensorLevel: $scope.widgetClimateControl.devicesId[v.mainSensor] ? $scope.widgetClimateControl.devicesId[v.mainSensor].metrics.level : null},
                                {scaleTitle: $scope.widgetClimateControl.devicesId[v.mainSensor] ? $scope.widgetClimateControl.devicesId[v.mainSensor].metrics.scaleTitle : null}
                        );
                        return v;
                    })
                    .value();


        }, function (error) {
            $scope.widgetClimateControl.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };
    $scope.loadDeviceId();

    /**
     * Change climate element mode
     */
    $scope.changeClimateControlMode = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.runApiCmd(input.cmd).then(function (response) {
            $scope.widgetClimateControl.alert = {message: false};
            $scope.loadDeviceId();
        }, function (error) {
            $scope.widgetClimateControl.alert = {message: $scope._t('error_update_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
            $scope.loading = false;
        });

    };
});

/**
 * The controller that handles Security Control  module.
 * @class ElementSecurityControlController
 */
myAppController.controller('ElementSecurityControlController', function ($scope, $filter, dataFactory) {
    $scope.widgetSecurityControl = {
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Load single device
     */
    $scope.loadDeviceId = function () {
        dataFactory.getApi('devices', '/' + $scope.dataHolder.devices.find.id, true).then(function (response) {
            var lastTriggerList = response.data.data.metrics.lastTriggerList;
            if (_.isEmpty(lastTriggerList)) {
                $scope.widgetSecurityControl.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
                return;
            }

            $scope.widgetSecurityControl.find = lastTriggerList;

        }, function (error) {
            $scope.widgetSecurityControl.alert = {message: $scope._t('error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };
    $scope.loadDeviceId();
});

/**
 * The controller that handles elements on the dashboard.
 * @class ElementDashboardController
 */
myAppController.controller('ElementDashboardController', function ($scope, $routeParams) {
    $scope.dataHolder.devices.filter = {onDashboard: true};
    $scope.elementDashboard = {
        firstLogin: ($routeParams.firstlogin || false),
        firstFile: ($scope.lang === 'de' ? 'first_login_de.html' : 'first_login_en.html')
    };


});

/**
 * The controller that handles elements in the room.
 * @class ElementRoomController
 */
myAppController.controller('ElementRoomController', function ($scope, $routeParams, $window, $location, $cookies, $filter, dataFactory, dataService, myCache) {
    $scope.dataHolder.devices.filter = {location: parseInt($routeParams.id)};

});

/**
 * The controller that handles element detail actions.
 * @class ElementIdController
 */
myAppController.controller('ElementIdController', function ($scope, $q, $routeParams, $filter, cfg,dataFactory, dataService, myCache) {
    $scope.elementId = {
        show: false,
        appType: {},
        input: {},
        locations: {},
        instances: {}
    };
    $scope.tagList = [];
    $scope.search = {
        text: ''
    };
    $scope.suggestions = [];

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('devices', '/' + $routeParams.id),
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices')

        ];

        if ($scope.user.role === 1) {
            promises.push(dataFactory.getApi('instances'));
        }

        $q.allSettled(promises).then(function (response) {
            var device = response[0];
            var locations = response[1];
            var devices = response[2];
            var instances = response[3];

            $scope.loading = false;
            // Error message
            if (device.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.elementId.locations = dataService.getRooms(locations.value.data.data).indexBy('id').value();
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                setTagList(devices.value.data.data.devices);
            }
            // Success - instances
            if (instances && instances.state === 'fulfilled') {
                $scope.elementId.instances = instances.value.data.data;
            }
            // Success - device
            if (device.state === 'fulfilled') {
                var arr = [];
                arr[0] = device.value.data.data;
                if (!dataService.getDevicesData(arr, true).value()[0]) {
                    alertify.alertError($scope._t('error_load_data'));
                    return;
                }
                setDevice(dataService.getDevicesData(arr, true).value()[0]);
                $scope.elementId.show = true;
            }


        });
    };
    $scope.allSettled();

    /**
     * Search me
     */
    $scope.searchMe = function () {
        $scope.suggestions = [];
        if ($scope.search.text.length >= 2) {
            findText($scope.tagList, $scope.search.text,$scope.elementId.input.tags);
        }
    };

    /**
     * Add tag to list
     */
    $scope.addTag = function (tag) {
        tag = tag || $scope.search.text;
        $scope.suggestions = [];
        if (!tag || $scope.elementId.input.tags.indexOf(tag) > -1) {
            return;
        }
        $scope.elementId.input.tags.push(tag);
        $scope.search.text = '';
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function (index) {
        $scope.elementId.input.tags.splice(index, 1);
        $scope.suggestions = [];
    };
    /**
     * Update an item
     */
    $scope.store = function (input) {
        if (input.id) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            dataFactory.putApi('devices', input.id, setOutput(input)).then(function (response) {
                $scope.user.dashboard = dataService.setArrayValue($scope.user.dashboard, input.id, input.onDashboard);
                $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, input.id, input.hide_events);
                $scope.updateProfile($scope.user, input.id);

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };
    /**
     * Update profile
     */
    $scope.updateProfile = function (profileData, deviceId) {
        dataFactory.putApi('profiles', profileData.id, profileData).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
            angular.extend($scope.user, response.data.data);
            angular.extend(cfg.user, response.data.data);
            //dataService.setUser(response.data.data);
            myCache.remove('devices');
            myCache.remove('devices/' + deviceId);
            myCache.remove('locations');
            dataService.goBack();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    };

    /// --- Private functions --- ///
    /**
     * Set device
     */
    function setDevice(device) {
        var findZwaveStr = "ZWayVDev_zway_";
        var findZenoStr = "ZEnoVDev_zeno_x";
        var zwaveId = false;
        $scope.elementId.input = device;
        //$scope.elementId.input.custom_icons = { on: 'Modem-icon.png',off: 'Stop-icon.png'};
        if (device.id.indexOf(findZwaveStr) > -1) {
            zwaveId = device.id.split(findZwaveStr)[1].split('-')[0];
            $scope.elementId.appType['zwave'] = zwaveId.replace(/[^0-9]/g, '');
        } else if (device.id.indexOf(findZenoStr) > -1) {
            $scope.elementId.appType['enocean'] = device.id.split(findZenoStr)[1].split('_')[0];
        } else {
            var instance = _.findWhere($scope.elementId.instances, {id: $filter('toInt')(device.creatorId)});
            if (instance && instance['moduleId'] != 'ZWave') {
                $scope.elementId.appType['instance'] = instance;

            }
        }
    }
    ;

    /**
     * Set output
     */
    function setOutput(input) {
        return {
            'id': input.id,
            'location': parseInt(input.location, 10),
            'tags': input.tags,
            'metrics': input.metrics,
            'visibility': input.visibility,
            'permanently_hidden': input.permanently_hidden
        };
    }
    ;

    /**
     * Set tag list
     */
    function setTagList(devices) {
        angular.forEach(devices, function (v, k) {
            if (v.tags) {
                angular.forEach(v.tags, function (t, kt) {
                    if ($scope.tagList.indexOf(t) === -1) {
                        $scope.tagList.push(t);
                    }

                });
            }
        });
    }
    ;

    /**
     * Find text
     */
    function findText(n, search, exclude) {
        var gotText = false;
        for (var i in n) {
            var re = new RegExp(search, "ig");
            var s = re.test(n[i]);
            if (s
                && (! _.isArray(exclude) || exclude.indexOf(n[i]) === -1)) {
                $scope.suggestions.push(n[i]);
                gotText = true;
            }
        }
        return gotText;
    }
    ;

});

/**
 * The controller that handles custom icon actions in the elemt detail view.
 * @class ElementIconController
 */
myAppController.controller('ElementIconController', function ($scope, $timeout, $filter, cfg, dataFactory, dataService) {
    $scope.icons = {
        selected: false,
        uploadedFileName: false,
        all: {},
        uploaded: {},
        info: {
            maxSize: $filter('fileSizeString')(cfg.upload.icon.size),
            extensions: cfg.upload.icon.extension.toString()
        }
    };
    /**
     * Load icons from config
     * @returns {undefined}
     */
    $scope.loadCfgIcons = function () {
        $scope.icons.all = dataService.getSingleElementIcons($scope.elementId.input);

    };
    $scope.loadCfgIcons();

    /**
     * Load already uploaded icons
     * @returns {undefined}
     */
    $scope.loadUploadedIcons = function () {
        // Atempt to load data
        dataFactory.getApi('icons', null, true).then(function (response) {
            $scope.icons.uploaded = response.data.data;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });

    };
    $scope.loadUploadedIcons();
    /**
     * Set selected icon
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.setSelectedIcon = function (icon) {
        if (!icon) {
            return;
        }
        $scope.icons.selected = icon;
    };
    /**
     * Set a custom icon with an icon from the list
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.setCustomIcon = function (icon) {
        if (!icon) {
            return;
        }
        $scope.icons.all.custom[$scope.icons.selected] = icon;

    };
    /**
     * Remove a custom icon
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.removeCustomIcon = function (icon) {
        if (!icon) {
            return;
        }
        delete $scope.icons.all.custom[icon];

    };

    /**
     * Update custom icons with selected icons from the list
     * @returns {undefined}
     */
    $scope.updateWithCustomIcon = function () {
        var customicons = function(icons,custom){
            var obj = {};
            if(_.isEmpty(custom)){
                return obj;
            }else if(icons['default']){
                return custom;
            }else{
                obj['level'] = custom;
                return obj;
            }
        }
        var input = {
            customicons: customicons($scope.icons.all.default,$scope.icons.all.custom)
        };
        var id = $scope.elementId.input.id;
        /*console.log(input)
        return;*/
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('customicon', id, input, '?icon').then(function (response) {
            $scope.icons.selected = false;
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_update_data'));
        });
    };
    /**
     * Cancel all updates and hide a list with uploaded icons
     * @returns {undefined}
     */
    $scope.cancelUpdate = function () {
        // Reset icons
        $scope.loadCfgIcons();
        // Set selected icon to false
        $scope.icons.selected = false;
    };
    /**
     * todo: deprecated
     * Check and validate an uploaded file
     * @param {object} files
     * @returns {undefined}
     */
    /*$scope.checkUploadedFile = function (files) {
        // Extends files object with a new property
        files[0].newName = dataService.uploadFileNewName(files[0].name);
        // Check allowed file formats
        //if(cfg.upload.room.type.indexOf(files[0].type) === -1){
        if (cfg.upload.icon.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                    $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                    $scope._t('upload_allowed_formats', {'__extensions__': $scope.icons.info.extensions})
                    );
            return;

        }
        // Check allowed file size
        if (files[0].size > cfg.upload.icon.size) {
            alertify.alertError(
                    $scope._t('upload_allowed_size', {'__size__': $scope.icons.info.maxSize}) + ' ' +
                    $scope._t('upload_size_is', {'__size__': $filter('fileSizeString')(files[0].size)})
                    );
            return;

        }
        // Check if uploaded filename already exists
        if (_.findWhere($scope.icons.uploaded, {file: files[0].name})) {
            // Displays a confirm dialog and on OK atempt to upload file
            alertify.confirm($scope._t('uploaded_file_exists', {__file__: files[0].name})).set('onok', function (closeEvent) {
                uploadFile(files);
            });
        } else {
            uploadFile(files);
        }

    };*/
    /// --- Private functions --- ///

    /**
     * todo: deprecated
     * Upload a file
     * @param {object} files
     * @returns {undefined}
     */
    /*function uploadFile(files) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        // Clear all alerts and file name selected
        alertify.dismissAll();
        // Set local variables
        var fd = new FormData();
        var input = {file: files[0].name, device: []};
        // Set selected file name
        $scope.icons.uploadedFileName = files[0].name;
        // Set form data
        fd.append('files_files', files[0]);

        // Atempt to upload a file
        dataFactory.getApiLocal('icons.json').then(function (response) {
            $timeout(function () {
                if (!_.findWhere($scope.icons.uploaded, {file: files[0].name})) {
                    $scope.icons.uploaded.push({file: files[0].name});
                }
                $scope.icons.all.custom[$scope.icons.selected] = files[0].name;
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('success_upload')});
            }, 1000);

        }, function (error) {
            alertify.alertError($scope._t('error_upload'));
            $scope.loading = false;
        });
    }
    ;*/

    /**
     * todo: deprecated
     */
    /*function updateUploaded(input) {
        var output = [];
        angular.forEach(input.custom_icons, function (v, k) {

            var index = _.findIndex($scope.icons.uploaded, {file: v});
            if (index === -1) {
                return;
            }
            if ($scope.icons.uploaded[index].device.indexOf(input.id) === -1) {
                $scope.icons.uploaded[index].device.push(input.id);
            }
            if (!_.findWhere(output, {file: v})) {
                output.push({file: $scope.icons.uploaded[index].file, device: $scope.icons.uploaded[index].device});
            }
        });
        console.log(output);
    }
    ;*/

    /**
     * todo: deprecated
     */
    /*function removeDeviceFromUploaded(input) {
        var output = [];
        angular.forEach(input.isset_icons, function (v, k) {
            var index = _.findIndex($scope.icons.uploaded, {file: v});
            if (index === -1) {
                return;
            }
            if ($scope.icons.uploaded[index].device.indexOf(input.id) === -1) {
                $scope.icons.uploaded[index].device.push(input.id);
            }
            if (!_.findWhere(output, {file: v})) {
                output.push({file: $scope.icons.uploaded[index].file, device: $scope.icons.uploaded[index].device});
            }
        });
        console.log(output);
    }
    ;*/
});
/**
 * @overview Handles all events.
 * @author Martin Vach
 */

/**
 * The controller that renders and handles event actions.
 * @class EventController
 */
myAppController.controller('EventController', function ($scope, $routeParams, $interval, $q, $filter, $cookies, dataFactory, dataService, myCache, paginationService, cfg, _) {
    $scope.page = {
        title: false
    };
    $scope.collection = [];
    $scope.eventLevels = [];
    $scope.dayCount = [
        {key: 1, val: $scope._t('lb_today')},
        {key: 2, val: $scope._t('lb_yesterday')},
        {key: 3, val: '3 ' + $scope._t('lb_days')},
        {key: 4, val: '4 ' + $scope._t('lb_days')},
        {key: 5, val: '5 ' + $scope._t('lb_days')},
        {key: 6, val: '6 ' + $scope._t('lb_days')},
        {key: 7, val: '7 ' + $scope._t('lb_days')}
    ];
    $scope.currSource = false;
    $scope.eventSources = [];
    //$scope.profileData = [];
    $scope.currLevel = false;
    $scope.timeFilterDefault = {
        since: $filter('unixStartOfDay')(),
        to: $filter('unixStartOfDay')('+', 86400),
        day: 1
    };
    $scope.timeFilter = $scope.timeFilterDefault;
    $scope.devices = {
        cnt:{
            deviceEvents:{}
        },
        find: {
            id: false,
            title: false,
            data: {}
        },
        data: {},
        show: false
    };
    $scope.currentPage = 1;
    $scope.pageSize = cfg.page_results_events;
    $scope.reset = function () {
        $scope.collection = angular.copy([]);
    };
    $scope.apiDataInterval = null;

    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $scope.currSource = false;
        $scope.currLevel = false;
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.timeFilter = (angular.isDefined($cookies.events_timeFilter) ? angular.fromJson($cookies.events_timeFilter) : $scope.timeFilter);
        var urlParam = '?since=' + ($scope.timeFilter.since * 1000);

        var promises = [
            dataFactory.getApi('devices', null, true),
            dataFactory.getApi('notifications', urlParam, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var events = response[1];

            $scope.loading = false;
            // Error message
            if (events.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                //setDevices(devices.value.data.data.devices);
                setDevices(dataService.getDevicesData(devices.value.data.data.devices,false));
            }

            // Success - notifications
            if (events.state === 'fulfilled') {
                setEvents(events.value.data.data.notifications);
            }

        });
    };
    $scope.allSettled();
    /**
     * Change time
     */
    $scope.changeTime = function (day) {
        switch (day) {
            case 1:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')(),
                    to: $filter('unixStartOfDay')('+', 86400),
                    day: day
                };
                break;
            case 2:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', 86400),
                    to: $filter('unixStartOfDay')(),
                    day: day
                };
                break;
            case 3:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 2)),
                    to: $filter('unixStartOfDay')('-', 86400),
                    day: day
                };
                break;
            case 4:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 3)),
                    to: $filter('unixStartOfDay')('-', (86400 * 2)),
                    day: day
                };
                break;
            case 5:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 4)),
                    to: $filter('unixStartOfDay')('-', (86400 * 3)),
                    day: day
                };
                break;
            case 6:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 5)),
                    to: $filter('unixStartOfDay')('-', (86400 * 4)),
                    day: day
                };
                break;
            case 7:
                $scope.timeFilter = {
                    since: $filter('unixStartOfDay')('-', (86400 * 6)),
                    to: $filter('unixStartOfDay')('-', (86400 * 5)),
                    day: day
                };
                break;
            default:
                break;
        }
        $cookies.events_timeFilter = angular.toJson($scope.timeFilter);
        //$scope.loadData();
        $scope.allSettled();
    };

    /**
     * Refresh data
     */
    $scope.refreshData = function () {
        var refresh = function () {
            dataFactory.refreshApi('notifications').then(function (response) {
                angular.forEach(response.data.data.notifications, function (v, k) {
                    //$scope.collection.push(v);
                    setEvent(v);
                });
            }, function (error) {});
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };
    $scope.refreshData();
    // Watch for pagination change
    $scope.$watch('currentPage', function (page) {
        paginationService.setCurrentPage(page);
    });

    $scope.setCurrentPage = function (val) {
        $scope.currentPage = val;
    };

    /**
     * Delete event
     */
    $scope.deleteEvent = function (id, params, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('notifications', id, params).then(function (response) {
                myCache.remove('notifications');
                $scope.loading = false;
                $scope.allSettled();
                //$scope.loadData();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };

    /**
     * Hide an event by the source
     */
    $scope.hideSourceEvents = function (deviceId) {
        $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, deviceId, true);
        updateProfile($scope.user);
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices) {
        var rejectType = ['battery', 'text', 'camera'];
        var data = devices.reject(function (v) {
                    return rejectType.indexOf(v.deviceType) > -1 || v.permanently_hidden === true;
                })
                .indexBy('id')
                .value();
        if (!_.isEmpty(data)) {
            angular.extend($scope.devices, {data: data, show: true});
        }

        if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
            if ($routeParams.param === 'source' && !_.isEmpty(data) && data[$routeParams.val]) {
                angular.extend($scope.devices.find, {id: $routeParams.val}, {title: data[$routeParams.val].metrics.title});
                angular.extend($scope.page, {title: data[$routeParams.val].metrics.title});
            }
        }
    }
    /**
     * Set events data
     */
    function setEvents(data) {
        $scope.collection = [];
        $scope.eventLevels = dataService.getEventLevel(data, [{'key': null, 'val': 'all'}]);
        var filter = null;
        if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
            if ($routeParams.param === 'source' && $routeParams.val !== '') {
                $scope.currSource = $routeParams.val;
            }
            if ($routeParams.param === 'level' && $routeParams.val !== '') {
                $scope.currLevel = $routeParams.val;
            }
            filter = $routeParams;
            angular.forEach(data, function (v, k) {
                if (filter && angular.isDefined(v[filter.param])) {
                    if (v[filter.param] == filter.val) {
                        $scope.collection.push(v);
                    }
                }
            });
        } else if (angular.isDefined($routeParams.param) && $routeParams.param == 'source_type') {
            filter = $routeParams;
            angular.forEach(data, function (v, k) {
                if (v.source == filter.source && v.type == filter.type) {
                    $scope.collection.push(v);
                }
            });
        } else {
            $scope.collection = data;
        }
        
         // Count events in the device
         $scope.devices.cnt.deviceEvents =_.countBy(data,function (v) {
            return v.source;
        });
        if (_.size($scope.collection) < 1) {
            alertify.alertWarning($scope._t('no_events'));
            return;
        }
    }
    ;
    /**
     * Set data
     */
    function setEvent(obj) {
        var findIndex = _.findIndex($scope.collection, {timestamp: obj.timestamp});
        if(findIndex > -1){
            angular.extend($scope.collection[findIndex],obj);

        }else{
            $scope.collection.push(obj);
        }
    }
    /**
     * Update profile
     */
    function updateProfile(profileData) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', profileData.id, profileData).then(function (response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            angular.extend($scope.user, response.data.data);
            angular.extend(cfg.user, response.data.data);
            //dataService.setUser(response.data.data);
            myCache.remove('notifications');
            $scope.input = [];
            $scope.allSettled();
            //$scope.loadData();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    }
});
/**
 * @overview Controllers that handle the Local apps, Online Apps and Active apps.
 * @author Martin Vach
 */

/**
 * Apps root controller
 * @class AppBaseController
 *
 */
myAppController.controller('AppBaseController', function ($scope, $filter, $cookies, $q, $route, dataFactory, dataService, _) {
    angular.copy({
        appsCategories: false
    }, $scope.expand);


    $scope.dataHolder = {
        modules: {
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                appsCatFeatured: 0,
                featured: 0
            },
            all: {},
            featured: [],
            categories: {},
            ids: {},
            filter: {},
            cameraIds: [],
            imgs: [],
            cats: [],
            currentCategory: {
                id: false,
                name: ''
            },
            orderBy: ($cookies.orderByAppsLocal ? $cookies.orderByAppsLocal : 'titleASC')
        },
        onlineModules: {
            cnt: {
                apps: 0,
                collection: 0,
                appsCat: 0,
                appsCatFeatured: 0,
                featured: 0
            },
            ratingRange: _.range(1, 6),
            all: {},
            featured: [],
            ids: {},
            filter: {},
            hideInstalled: ($cookies.hideInstalledApps ? $filter('toBool')($cookies.hideInstalledApps) : false),
            orderBy: ($cookies.orderByAppsOnline ? $cookies.orderByAppsOnline : 'creationTimeDESC')
        },
        tokens: {
            all: {}
        },
        instances: {
            all: {},
            cnt: {
                modules: 0
            },
            orderBy: ($cookies.orderByAppsInstances ? $cookies.orderByAppsInstances : 'creationTimeDESC')
        }
    };

    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;

    /**
     * Load tokens
     */
    $scope.loadTokens = function () {
        dataFactory.getApi('tokens', null, true).then(function (response) {
            angular.extend($scope.dataHolder.tokens.all, response.data.data.tokens);
            $scope.allSettled($scope.dataHolder.tokens.all);
        }, function (error) {
            $scope.allSettled($scope.dataHolder.tokens.all);
        });
    };
    $scope.loadTokens();

    /**
     * Load all promises
     */
    $scope.allSettled = function (tokens) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules_categories'),
            dataFactory.getApi('modules', null, true),
            dataFactory.getOnlineModules({token: _.values(tokens)}),
            dataFactory.getApi('instances', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var categories = response[0];
            var modules = response[1];
            var onlineModules = response[2];
            var instances = response[3];
            $scope.loading = false;
            // Error message
            if (modules.state === 'rejected' && $scope.routeMatch('/apps/local')) {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            if (onlineModules.state === 'rejected' && $scope.routeMatch('/apps/online')) {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }

            if (instances.state === 'rejected' && $scope.routeMatch('/apps/instance')) {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }

            // Success - categories
            if (categories.state === 'fulfilled') {
                var cat = categories.value.data.data;
                if (cat) {
                    $scope.dataHolder.modules.categories = cat[$scope.lang] ? _.indexBy(cat[$scope.lang], 'id') : _.indexBy(cat[$scope.cfg.lang], 'id');
                }
            }
            // Success - instances
            if (instances.state === 'fulfilled') {
                setInstances(instances.value.data.data);
            }

            // Success - modules
            if (modules.state === 'fulfilled') {
                setModules(modules.value.data.data, $scope.dataHolder.instances.all);
            }

            // Success - online modules
            if (onlineModules.state === 'fulfilled') {
                setOnlineModules(onlineModules.value.data.data)
            }


        });
    };

    /**
     * Update module
     */
    $scope.updateModule = function (module, confirm) {
        var patches = module.patchnotes ? '<div class="app-confirm-content">' + $filter('stripTags')(module.patchnotes) + '</div>' : '';
        alertify.confirm(patches + confirm, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
            var data = {
                moduleUrl: $scope.cfg.online_module_download_url + module.file
            };
            dataFactory.installOnlineModule(data, 'online_update').then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t(response.data.data.key)});
                $route.reload();

            }, function (error) {
                $scope.loading = false;
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
                alertify.alertError(message);
            });
        });


    };

    /// --- Private functions --- ///
    /**
     * Set local modules
     */
    function setModules(data, instances) {
        // Reset featured cnt
        $scope.dataHolder.modules.cnt.featured = 0;
        var modules = _.chain(data)
                .flatten()
                .filter(function (item) {
                    $scope.dataHolder.modules.ids[item.id] = {version: item.version};
                    var isHidden = false;
                    var items = [];
                    if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                        if ($scope.user.role !== 1) {
                            isHidden = true;
                        } else {
                            isHidden = ($scope.user.expert_view ? false : true);
                        }

                    }
                    if (item.category === 'surveillance') {
                        $scope.dataHolder.modules.cameraIds.push(item.id);
                        isHidden = true;
                    }

                    if (!isHidden) {
                        var findLocationStr = item.location.split('/');
                        if (findLocationStr[0] === 'userModules') {
                            angular.extend(item, {custom: true});
                        } else {
                            angular.extend(item, {custom: false});
                        }
                        //$scope.modulesIds.push(item.id);
                        $scope.dataHolder.modules.imgs[item.id] = item.icon;
                        if (item.category && $scope.dataHolder.modules.cats.indexOf(item.category) === -1) {
                            $scope.dataHolder.modules.cats.push(item.category);
                        }
                        if ($scope.getCustomCfgArr('featured_apps').indexOf(item.moduleName) > -1) {
                            angular.extend(item, {featured: true});
                            // Count featured apps
                            $scope.dataHolder.modules.cnt.featured += 1;
                        } else {
                            angular.extend(item, {featured: false});
                        }
                        // Has already instance ?
                        angular.extend(item, {hasInstance: $scope.dataHolder.instances.cnt.modules[item.id]||0});
                         
                        //Tooltip description
                        angular.extend(item, {toolTipDescription: $filter('stripTags')(item.defaults.description)});

                        if(item.featured) {
                            $scope.dataHolder.modules.featured.push(item);
                        }

                        return items;
                    }
                });

        // Count apps in categories
        $scope.dataHolder.modules.cnt.appsCat = modules.countBy(function (v) {
            return v.category;
        }).value();

        // Count featured apps in categories
        $scope.dataHolder.modules.cnt.appsCatFeatured = modules.countBy(function (v) {
            if(v.featured) {
                return v.category;
            }
        }).value();

        // Count all apps
        $scope.dataHolder.modules.cnt.apps = modules.size().value();

        $scope.dataHolder.modules.all = modules.where($scope.dataHolder.modules.filter).value();
        // Count collection
        $scope.dataHolder.modules.cnt.collection = _.size($scope.dataHolder.modules.all);
    }
    ;

    /**
     * Set online modules
     */
    function setOnlineModules(data) {
        // Reset featured cnt
        $scope.dataHolder.onlineModules.cnt.featured = 0;
        var onlineModules = _.chain(data)
                .flatten()
                .filter(function (item) {
                    var isHidden = false;
                    var obj = {};
                    $scope.dataHolder.onlineModules.ids[item.modulename] = {version: item.version, file: item.file, patchnotes: item.patchnotes};
                    if ($scope.getHiddenApps().indexOf(item.modulename) > -1) {
                        if ($scope.user.role !== 1) {
                            isHidden = true;
                        } else {
                            isHidden = ($scope.user.expert_view ? false : true);
                        }
                    }
                    if ($scope.dataHolder.modules.ids[item.modulename]) {
                        item['status'] = 'installed';
                        if ($scope.dataHolder.modules.ids[item.modulename].version !== item.version) {
                            if (!$scope.dataHolder.modules.ids[item.modulename].version && !item.version) {
                                item['status'] = 'error';
                            } else if (!$scope.dataHolder.modules.ids[item.modulename].version && item.version) {
                                item['status'] = 'upgrade';
                            } else {
                                var localVersion = $scope.dataHolder.modules.ids[item.modulename].version.toString().split('.'),
                                        onlineVersion = item.version.toString().split('.');

                                for (var i = 0; i < localVersion.length; i++) {
                                    if ((parseInt(localVersion[i], 10) < parseInt(onlineVersion[i], 10)) || ((parseInt(localVersion[i], 10) <= parseInt(onlineVersion[i], 10)) && (!localVersion[i + 1] && onlineVersion[i + 1] && parseInt(onlineVersion[i + 1], 10) > 0))) {
                                        item['status'] = 'upgrade';
                                        break;
                                    }
                                }
                            }
                        }
                        isHidden = $scope.dataHolder.onlineModules.hideInstalled;
                    } else {
                        item['status'] = 'download';
                    }

                    $scope.dataHolder.onlineModules.ids[item.modulename].status = item.status;
                    angular.extend(item, {isHidden: isHidden});

                    if (item.featured == 1) {
                        item.featured = true;
                        // Count featured apps
                        $scope.dataHolder.onlineModules.cnt.featured += 1;
                    } else {
                        item.featured = false;
                    }

                    if(item.featured) {
                        $scope.dataHolder.onlineModules.featured.push(item)
                    }

                    item.installedSort = $filter('zeroFill')(item.installed);
                     //Tooltip description
                     angular.extend(item, {toolTipDescription: $filter('stripTags')(item.description)});
                    return item;
                }).reject(function (v) {
            return v.isHidden === true;
        });
        // Count apps in categories
        $scope.dataHolder.onlineModules.cnt.appsCat = onlineModules.countBy(function (v) {
            return v.category;
        }).value();

        // Count featured apps in categories
        $scope.dataHolder.onlineModules.cnt.appsCatFeatured = onlineModules.countBy(function (v) {
            if(v.featured) {
                return v.category;
            }
        }).value();

        // Count all apps
        $scope.dataHolder.onlineModules.cnt.apps = onlineModules.size().value();
        $scope.dataHolder.onlineModules.all = onlineModules.where($scope.dataHolder.onlineModules.filter).value();
        // Count collection
        $scope.dataHolder.onlineModules.cnt.collection = _.size($scope.dataHolder.onlineModules.all);
        $scope.loading = false;
    }
    ;
    /**
     * Set instances
     */
    function setInstances(data) {
        $scope.dataHolder.instances.cnt.modules = _.countBy(data, function (v) {
                                    return v.moduleId;
                                });
        $scope.dataHolder.instances.all = _.reject(data, function (v) {
            if ($scope.getHiddenApps().indexOf(v.moduleId) > -1) {
                if ($scope.user.role !== 1) {
                    return true;
                } else {
                    return ($scope.user.expert_view ? false : true);
                }

            } else {
                return false;
            }
        });
    }
    ;

});
/**
 * The controller that handles all local APPs actions.
 * @class AppLocalController
 */
myAppController.controller('AppLocalController', function ($scope, $filter, $cookies, $timeout, $route, $routeParams, $location, dataFactory, dataService, myCache, _) {
    $scope.dataHolder.modules.filter = ($cookies.filterAppsLocal ? angular.fromJson($cookies.filterAppsLocal) : {});
    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.modules, {orderBy: key});
        $cookies.orderByAppsLocal = key;
        $scope.reloadData();
    };
    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        if (!filter) {
            angular.extend($scope.dataHolder.modules, {filter: {}});
            $cookies.filterAppsLocal = angular.toJson({});
        } else {
            angular.extend($scope.dataHolder.modules, {filter: filter});
            $cookies.filterAppsLocal = angular.toJson(filter);
        }
        $scope.reloadData();
    };

    /**
     * Delete module
     */
    $scope.deleteModule = function (input, message) {

        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('online_delete', input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });
        });
    };

    /**
     * Reset module
     */
    $scope.resetModule = function (input, message) {

        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.postApi('online_reset', input, '/' + input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });
        });
    };

});

/**
 * The controller that handles all online APPs actions.
 * @class AppOnlineController
 */
myAppController.controller('AppOnlineController', function ($scope, $filter, $cookies, $window, dataFactory, dataService, _) {
    $scope.dataHolder.onlineModules.filter = ($cookies.filterAppsOnline ? angular.fromJson($cookies.filterAppsOnline) : {});

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.onlineModules, {orderBy: key});
        $cookies.orderByAppsOnline = key;
        $scope.reloadData();
    };

    /**
     * Hide installed
     */
    $scope.hideInstalled = function (status) {
        status = $filter('toBool')(status);
        angular.extend($scope.dataHolder.onlineModules, {hideInstalled: status});
        $cookies.hideInstalledApps = status;
        $scope.reloadData();
    };

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        if (!filter) {
            angular.extend($scope.dataHolder.onlineModules, {filter: {}});
            $cookies.filterAppsOnline = angular.toJson({});
        } else {
            angular.extend($scope.dataHolder.onlineModules, {filter: filter});
            $cookies.filterAppsOnline = angular.toJson(filter);
        }
        $scope.reloadData();
    };

    /**
     * Install module
     */
    $scope.installModule = function (module) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + module.file
        };
        dataFactory.installOnlineModule(data, 'online_install').then(function (response) {
            dataFactory.postToRemote($scope.cfg.online_module_installed_url, {id: module.id});
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t(response.data.data.key)});
            window.location = '#/module/post/' + module.modulename;

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alertError(message);
        });

    };


});

/**
 * The controller that handles all instances actions.
 * @class AppInstanceController
 */
myAppController.controller('AppInstanceController', function ($scope, $cookies, dataFactory, dataService, myCache, _) {
    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.instances, {orderBy: key});
        $cookies.orderByAppsInstances = key;
        $scope.reloadData();
    };
    /**
     * Activate instance
     */
    $scope.activateInstance = function (input, activeStatus) {
        input.active = activeStatus;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.loading = false;
                $scope.reloadData();
                //$route.reload();

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function (target, input, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('instances', input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.reloadData();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });

        });
    };

});
/**
 * The controller that handles local app detail actions.
 * @class AppLocalDetailController
 */
myAppController.controller('AppLocalDetailController', function ($scope, $routeParams, $location, dataFactory, dataService, _) {
    $scope.module = [];
    $scope.categoryName = '';
    $scope.isOnline = null;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[$scope.cfg.lang], {id: id});
            if (category) {
                $scope.categoryName = category.name;
            }
        }, function (error) {});
    };

    /**
     * Load module detail
     */
    $scope.loadModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/' + id).then(function (response) {
            loadOnlineModules(id);
            $scope.module = response.data.data;
            $scope.loadCategories(response.data.data.category);
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function (response) {
            $scope.isOnline = _.findWhere(response.data, {modulename: moduleName});
        }, function (error) {
        });
    }

});

/**
 * The controller that handles on-line app detail actions.
 * @class AppOnlineDetailController
 */
myAppController.controller('AppOnlineDetailController', function ($scope, $routeParams, $timeout, $location, $route, $filter, myCache, dataFactory, dataService, _) {
    $scope.local = {
        installed: false
    };
    $scope.module = [];
    $scope.comments = {
        all: {},
        model: {
            module_id: parseInt($routeParams.id, 10),
            content: '',
            name: '',
            remote_id: false
        },
        show: true
    };
    $scope.rating = {
        range: _.range(1, 6),
        model: {
            module_id: parseInt($routeParams.id, 10),
            remote_id: false,
            score: 0

        }
    };
    $scope.categoryName = '';
    $scope.onlineMediaUrl = $scope.cfg.online_module_img_url;

    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function () {
        dataFactory.getApi('instances', '/RemoteAccess').then(function (response) {
            $scope.remoteAccess = response.data.data[0];
            if (Object.keys(response.data.data[0]).length > 0) {
                $scope.comments.model.remote_id = response.data.data[0].params.userId;
                $scope.rating.model.remote_id = response.data.data[0].params.userId;
            }

        }, function (error) {});
    };

    $scope.loadRemoteAccess();

    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[$scope.cfg.lang], {id: id});
            if (category) {
                $scope.categoryName = category.name;
            }
        }, function (error) {});
    };
    /**
     * Load local modules
     */
    $scope.loadLocalModules = function (query) {
        dataFactory.getApi('modules').then(function (response) {
            $scope.local.installed = _.findWhere(response.data.data, query);
        }, function (error) {
        });
    };

    /**
     * Load module detail
     */
    $scope.loadModuleId = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postToRemote($scope.cfg.online_moduleid_url, {id: id, lang: $scope.lang}).then(function (response) {
            $scope.loading = false;
            if (_.isEmpty(response.data.data)) {
                alertify.alertWarning($scope._t('no_data'));
                return;
            }
            $scope.module = response.data.data;

            $scope.loadLocalModules({moduleName: $scope.module.modulename});
            $scope.loadCategories($scope.module.category);
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadModuleId($routeParams.id);

    /**
     * Load comments
     */
    $scope.loadComments = function (id) {
        dataFactory.getRemoteData($scope.cfg.online_module_comments_url + '/' + id, true).then(function (response) {
            $scope.comments.all = response.data.data;
            if (_.isEmpty(response.data.data)) {
                $scope.comments.show = false;
            } else {
                $scope.comments.show = true;
            }
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_comments'));
        });

    };
    $scope.loadComments($routeParams.id);

    /**
     * Install module
     */
    $scope.installModule = function (module) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + module.file
        };
        dataFactory.installOnlineModule(data, 'online_install').then(function (response) {
            dataFactory.postToRemote($scope.cfg.online_module_installed_url, {id: module.id});
            dataService.showNotifier({message: $scope._t(response.data.data.key)});
            window.location = '#/module/post/' + module.modulename;

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alertError(message);
        });

    };

    /**
     * Add comment
     */
    $scope.addComment = function (form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postToRemote($scope.cfg.online_module_comment_create_url, input).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('comment_add_successful')});
            $scope.expand.appcommentadd = false;
            $scope.loadComments($routeParams.id);
            input.content = '';
            input.name = '';
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('comment_add_failed'));

        });

    };

    /**
     * Rate module
     */
    $scope.rateModule = function (score) {
        $scope.rating.model.score = parseInt(score);
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postToRemote($scope.cfg.online_module_rating_create_url, $scope.rating.model).then(function (response) {
            $scope.loading = false;
            $scope.loadModuleId($routeParams.id);
        }, function (error) {
            var message = $scope._t('error_update_data');
            $scope.loading = false;
            if (error.status === 409) {
                message = $scope._t('already_rated');
            }
            alertify.alertError(message);

        });
    };

});
/**
 * The controller that handles Alpaca forms inputs and outputs.
 * @class AppModuleAlpacaController
 */
myAppController.controller('AppModuleAlpacaController', function ($scope, $routeParams, $route, $filter, $location, $q, dataFactory, dataService, myCache, cfg) {
    $scope.showForm = false;
    $scope.success = false;
    $scope.alpacaData = true;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    $scope.input = {
        'instanceId': 0,
        'active': true,
        'moduleId': null,
        'title': null,
        'description': null,
        'moduleTitle': null,
        'category': null
    };
    $scope.moduleId = {
        submit: true,
        fromapp: $routeParams.fromapp,
        find: {},
        categoryName: null,
        singletonActive: false,
        modules: {},
        instances: {},
        dependency: {
            activate: {},
            add: {},
            download: {}
        }
    };


    $scope.onLoad = function () {
        myCache.remove('instances');
    };
    $scope.onLoad();

    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[$scope.cfg.lang], {id: id});
            if (category) {
                $scope.moduleId.categoryName = category.name;
            }
        }, function (error) {});
    };

    /**
     * Generates the form for creating a new app instance
     */
    $scope.postModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', null, true).then(function (instances) {
            dataFactory.getApi('modules', '/' + id + '?lang=' + $scope.lang, true).then(function (module) {
                // get module postRender data
                var modulePR = null;
                if (angular.isString(module.data.data.postRender) && module.data.data.postRender.indexOf('function') === 0) {
                    modulePR = module.data.data.postRender;
                }
                var formData = dataService.getModuleFormData(module.data.data, module.data.data.defaults);
                var langCode = (angular.isDefined(cfg.lang_codes[$scope.lang]) ? cfg.lang_codes[$scope.lang] : null);
                $scope.input = {
                    'modulePostrender': modulePR,
                    'instanceId': 0,
                    'moduleId': id,
                    'active': true,
                    'title': $filter('hasNode')(formData, 'data.title'),
                    'description': $filter('hasNode')(formData, 'data.description'),
                    'moduleTitle': $filter('hasNode')(formData, 'data.title'),
                    'icon': $filter('hasNode')(module, 'data.data.icon'),
                    'moduleName': $filter('hasNode')(module, 'data.data.moduleName'),
                    'category': module.data.data.category
                };
                angular.extend($scope.moduleId, {find: module.data.data});
                $scope.loadCategories(module.data.data.category);
                setDependencies(module.data.data.dependencies);
                $scope.showForm = true;
                $scope.loading = false;
                // Is singelton and has already instance?
                if (module.data.data.singleton && _.findWhere(instances.data.data, {moduleId: id})) {
                    $scope.moduleId.singletonActive = true;
                    return;
                }
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }
                $.alpaca.setDefaultLocale(langCode);
                $('#alpaca_data').alpaca(formData);


            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
            });
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });
    };

    /**
     * Generates the form for updating an app instance
     */
    $scope.putModule = function (id) {
        if (id < 1) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
            var instance = instances.data.data;
            dataFactory.getApi('modules', '/' + instance.moduleId + '?lang=' + $scope.lang, true).then(function (module) {
                if (module.data.data.state === 'hidden') {
                    if (!$scope.user.expert_view) {
                        $scope.loading = false;
                        return;
                    }

                }
                // get module postRender data
                var modulePR = null;
                if (angular.isString(module.data.data.postRender) && module.data.data.postRender.indexOf('function') === 0) {
                    modulePR = module.data.data.postRender;
                }
                var formData = dataService.getModuleFormData(module.data.data, instance.params);

                $scope.input = {
                    'modulePostrender': modulePR,
                    'instanceId': instance.id,
                    'moduleId': module.data.data.id,
                    'active': instance.active,
                    'title': instance.title,
                    'description': instance.description,
                    'moduleTitle': instance.title,
                    'icon': $filter('hasNode')(module, 'data.data.icon'),
                    'moduleName': $filter('hasNode')(module, 'data.data.moduleName'),
                    'category': module.data.data.category
                };
                $scope.showForm = true;
                angular.extend($scope.moduleId, {find: module.data.data});
                $scope.loadCategories(module.data.data.category);
                setDependencies(module.data.data.dependencies);
                $scope.loading = false;
                if (!$filter('hasNode')(formData, 'options.fields') || !$filter('hasNode')(formData, 'schema.properties')) {
                    $scope.alpacaData = false;
                    return;
                }

                $('#alpaca_data').alpaca(formData);

            }, function (error) {
                alertify.alertError($scope._t('error_load_data'));
                $scope.loading = false;
            });
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });

    };


    /**
     * Load data
     */
    switch ($routeParams.action) {
        case 'put':
            $scope.putModule($routeParams.id);
            break;
        case 'post':
            $scope.postModule($routeParams.id);
            break;
        default:
            break;
    }
    /**
     * Create/Update an app instance
     */
    $scope.store = function (data) {
        var defaults = ['instanceId', 'moduleId', 'active', 'title', 'description'];
        var input = [];
        var params = {};
        angular.forEach(data, function (v, k) {
            if (defaults.indexOf(k) > -1) {
                input[k] = v;
            }
        });

        var inputData = {
            'id': input.instanceId,
            'moduleId': input.moduleId,
            'active': input.active,
            'title': input.title,
            'description': input.description,
            'params': params
        };
        if (input.instanceId > 0) {
            dataFactory.putApi('instances', input.instanceId, inputData).then(function (response) {
                myCache.remove('devices');
                if ($scope.moduleId.fromapp) {
                    $location.path('/module/post/' + $scope.moduleId.fromapp);
                } else {
                    $location.path('/apps/instance');
                }


            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        } else {
            dataFactory.postApi('instances', inputData).then(function (response) {
                myCache.remove('devices');
                if ($scope.moduleId.fromapp) {
                    $location.path('/module/post/' + $scope.moduleId.fromapp);
                } else {
                    $location.path('/apps/instance');
                }

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        }
    };
    /**
     * Activates an instance of the module
     */
    $scope.activateInstance = function (input) {
        input.active = true;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('instances', input.id, input).then(function (response) {
            $scope.loading = false;
            $route.reload();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Install the module
     */
    $scope.installModule = function (module) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        var data = {
            moduleUrl: $scope.cfg.online_module_download_url + module.file
        };
        dataFactory.installOnlineModule(data, 'online_install').then(function (response) {
            dataService.showNotifier({message: $scope._t(response.data.data.key)});
            window.location = '#/module/post/' + module.modulename + '/' + $routeParams.id;

        }, function (error) {
            $scope.loading = false;
            var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_no_module_download'));
            alertify.alertError(message);
        });

    };

    // --- Private functions

    /**
     * Set moduledependencies
     */
    function setDependencies(dependencies) {
        if (!_.isArray(dependencies)) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules', null, true),
            dataFactory.getApi('instances', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var modules = response[0];
            var instances = response[1];
            // Error message
            if (modules.state === 'rejected' || instances.state === 'rejected') {
                $scope.loading = false;
                return;
            }
            // Success - modules
            if (modules.state === 'fulfilled') {
                $scope.moduleId.modules = _.indexBy(modules.value.data.data, 'moduleName');
            }

            // Success - instances
            if (instances.state === 'fulfilled') {
                $scope.moduleId.instances = _.indexBy(instances.value.data.data, 'moduleId');
            }

            // Loop throught dependencies
            angular.forEach(dependencies, function (k) {
                if ($scope.moduleId.modules[k]) {
                    if ($scope.moduleId.instances[k]) {
                        if ($scope.moduleId.instances[k].active === false) {
                            $scope.moduleId.submit = false;
                            $scope.moduleId.dependency.activate[k] = $scope.moduleId.instances[k];
                        }
                    } else {
                        $scope.moduleId.submit = false;
                        $scope.moduleId.dependency.add[k] = {
                            modulename: k
                        };
                    }
                } else {
                    $scope.moduleId.submit = false;
                    $scope.moduleId.dependency.download[k] = {
                        id: k,
                        modulename: k,
                        file: k + '.tar.gz'
                    };
                }
            });
            $scope.loading = false;
        });
    }
    ;

});
/**
 * @overview Controllers that handle all Skins actions.
 * @author Martin Vach
 */

/**
 * This is the Skin root controller
 * @class SkinBaseController
 *
 */
myAppController.controller('SkinBaseController', function ($scope, $q, $timeout, cfg, dataFactory, dataService, _) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            active: cfg.skin.active,
            show: true
        },
        online: {
            all: {},
            find: {},
            ids: {},
            show: true
        },
        installed: {
            all: {}
        }
    };

    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('skins', null, true),
            dataFactory.getRemoteData($scope.cfg.online_skin_url)
        ];

        $q.allSettled(promises).then(function (response) {
            // console.log(response)
            var localSkins = response[0];
            var onlineSkins = response[1];
            $scope.loading = false;
            // Error message
            if (localSkins.state === 'rejected' && $scope.routeMatch('/customize/skinslocal')) {
                alertify.alertError($scope._t('failed_to_load_skins'));
                $scope.skins.local.show = false;
                return;
            }
            if (onlineSkins.state === 'rejected' && $scope.routeMatch('/customize/skinsonline')) {
                alertify.alertError($scope._t('failed_to_load_skins'));
                $scope.skins.online.show = false;
                return;
            }
            // Success - local skins
            if (localSkins.state === 'fulfilled') {
                $scope.skins.local.all = dataService.getLocalSkins(localSkins.value.data.data).indexBy('name').value();
            }

            // Success - online skins
            if (onlineSkins.state === 'fulfilled') {
                setOnlineSkins(onlineSkins.value.data.data);
            }

        });

    };
    $scope.allSettled();

    /**
     * Update skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.updateSkin = function (skin) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.putApi('skins_update', skin.name, skin).then(function (response) {
            $timeout(function () {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('skin_update_successful')});
            }, 2000);
        }, function (error) {
            $scope.loading = false;
            var langkey = (error.data.error ? error.data.error : 'error_file_download');
            alertify.alertError($scope._t(langkey));
        });
    };

    /// --- Private functions --- ///

    /**
     * Set online skins $scope
     * @param {object} response
     * @returns {undefined}
     */
    function setOnlineSkins(response) {
        $scope.skins.online.all = _.chain(response)
                .flatten()
                .filter(function (v) {
                    // Set status
                    v.status = (_.isEmpty($scope.skins.local.all) ? 'error' : 'download');
                    // Compare local and online versions
                    if ($scope.skins.local.all[v.name]) {
                        v.status = dataService.compareVersions($scope.skins.local.all[v.name].version, v.version);
                    }
                    return v;
                })
                .indexBy('name')
                .value();
    };
});

/**
 * This controller handles local skins actions.
 * @class SkinLocalController
 *
 */
myAppController.controller('SkinLocalController', function ($scope, $window, $cookies, $timeout, dataFactory, dataService) {
    /**
     * Activate skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.activateSkin = function (skin) {
        //$scope.user.skin = skin.name;
        dataFactory.putApi('skins', skin.name, {active: true}).then(function (response) {
            dataService.showNotifier({message: $scope._t('skin_activate_successful')});
            $cookies.skin = skin.name;
            $timeout(function () {
                $scope.loading = {status: 'loading-spin', icon: '--', message: $scope._t('reloading_page')};
                alertify.dismissAll();
                $window.location.reload();
            }, 2000);
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('failed_to_activate_skin'));
        });
    };


    /**
     * Remove skin
     * @param {object} skin
     * @param {string} message
     * @returns {undefined}
     */
    $scope.removeSkin = function (skin, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('skins', skin.name).then(function (response) {
                delete $scope.skins.local.all[skin.name];
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('skin_delete_successful')});

                //$route.reload();
            }, function (error) {
                $scope.loading = false;
                var langkey = (error.data.error ? error.data.error : 'error_delete_data');
                alertify.alertError($scope._t(langkey));
            });
        });
    };
});
/**
 * This controller handles online skins actions.
 * @class SkinOnlineController
 *
 */
myAppController.controller('SkinOnlineController', function ($scope, $timeout, dataFactory, dataService) {
    /**
     * Download skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.downloadSkin = function (skin) {
        skin.active = false;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.postApi('skins_install', skin).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('skin_installation_successful')});
            if ($scope.skins.online.all[skin.name]) {
                $scope.skins.online.all[skin.name].status = 'equal';
            }
        }, function (error) {
            $scope.loading = false;
            var langkey = (error.data.error ? error.data.error : 'error_file_download');
            alertify.alertError($scope._t(langkey));
        });
    };

});

/**
 * This controller handles reset skin proccess.
 * @class SkinOnlineController
 *
 */
myAppController.controller('SkinToDefaultController', function ($scope, $cookies, dataFactory, dataService) {
    /**
     * Download skin
     * @param {object} skin
     * @returns {undefined}
     */
    $scope.resetToDefault = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('skins_reset', null, true).then(function (response) {
            //dataService.setRememberMe(null);
            dataFactory.getApi('logout').then(function (response) {
                delete $cookies['skin'];
                dataService.logOut();
            });
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_update_data'));
        });
    };
    $scope.resetToDefault();

});
/**
 * @overview Controllers that handle all custom icon actions – displays and uploads.
 * @author Martin Vach
 */

/**
 * The controller that renders and upload icons.
 * @class LocalIconController
 */
myAppController.controller('LocalIconController', function ($scope, $filter, $timeout, $q, cfg, dataFactory, dataService, _) {
    $scope.icons = {
        show: true,
        find: {},
        upload: false,
        all: {},
        source: {
            cnt:{},
            title: {}
        },
        filter: {},
        used: {
            device: {}
        },
        info: {
            maxSize: $filter('fileSizeString')(cfg.upload.icon.size),
            extensions: cfg.upload.icon.extension.toString()
        },
        infoPacked: {
            maxSize: $filter('fileSizeString')(cfg.upload.icon_packed.size),
            extensions: cfg.upload.icon_packed.extension.toString()
        }
    };
    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('icons', null, true),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var icons = response[0];
            var devices = response[1];

            $scope.loading = false;
            // Error message
            if (icons.state === 'rejected' || devices.state === 'rejected') {
                $scope.icons.show = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - icons
            if (icons.state === 'fulfilled') {
               // $scope.icons.all = icons.value.data.data;
                setIcons(icons.value.data.data);
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.icons.used.device = iconUsedInDevice(devices.value.data.data.devices);
            }


        });
    };
    $scope.allSettled();
    
    /**
     * Set a filter
     * @param {string} val
     * @returns {undefined}
     */
    $scope.setFilter = function (val) {
        $scope.icons.filter = (val||{});
        $scope.allSettled();
    };

    /**
     * Check and validate an uploaded file
     * @param {object} files
     * @param {object} info
     * @returns {undefined}
     */
    $scope.checkUploadedFile = function (files, info) {
        // Extends files object with a new property
        files[0].newName = dataService.uploadFileNewName(files[0].name);
        // Check allowed file formats
        if (info.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                    $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                    $scope._t('upload_allowed_formats', {'__extensions__': info.extension.toString()})
                    );
            return;

        }
        // Check allowed file size
        if (files[0].size > info.size) {
            alertify.alertError(
                    $scope._t('upload_allowed_size', {'__size__': $filter('fileSizeString')(info.size)}) + ' ' +
                    $scope._t('upload_size_is', {'__size__': $filter('fileSizeString')(files[0].size)})
                    );
            return;

        }
        // Check if uploaded filename already exists
        if (_.findWhere($scope.icons.all, {file: files[0].name})) {
            // Displays a confirm dialog and on OK atempt to upload file
            alertify.confirm($scope._t('uploaded_file_exists', {__file__: files[0].name})).set('onok', function (closeEvent) {
                uploadFile(files);
            });
        } else {
            uploadFile(files);
        }
    };

    /**
     * Delete an icon from the storage
     * @param {object} icon
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteIcon = function (icon, message) {
        alertify.dismissAll();
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('icons', icon.file).then(function (response) {
                $scope.loading = false;
                /*$scope.icons.all = _.reject($scope.icons.all, function (v) {
                    return v.file === icon.file;
                });*/
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.allSettled();

                //$route.reload();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });

    };

    /// --- Private functions --- ///

    /**
     * Upload a file
     * @param {object} files
     * @returns {undefined}
     */
    function uploadFile(files) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        // Clear all alerts and file name selected
        alertify.dismissAll();
        // Set local variables
        var fd = new FormData(),
                input = {file: files[0].name, device: []};
        // Set selected file name
        $scope.icons.upload = files[0].name;
        // Set form data
        fd.append('files_files', files[0]);
        // Atempt to upload a file
        dataFactory.uploadApiFile(cfg.api.icons_upload, fd).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_upload')});
            $scope.allSettled();

        }, function (error) {
            $scope.icons.find = {};
            alertify.alertError($scope._t('error_upload'));
            $scope.loading = false;
        });
    }
    ;
    /**
     * Set list with uploaded icons
     * @param {object} icons
     * @returns {undefined}
     */
    function setIcons(icons){
        var data = _.chain(icons)
                .flatten()
                .filter(function (v) {
                    v.source_title = (!v.source_title ? 'Custom': v.source_title);
                    $scope.icons.source.title[v.source] = v.source_title;
                    return v;
                });
        // Count apps in categories
         $scope.icons.source.cnt = data.countBy(function (v) {
            return v.source;
        }).value();
        var icons = data.where($scope.icons.filter).value();
        // If filter and no result show all icons
        if(!_.isEmpty($scope.icons.filter) && _.isEmpty(icons)){
            $scope.icons.filter = {};
            $scope.icons.all = data.value();
            return;
        }
        $scope.icons.all = icons;
    }
    /**
     * Build an object with icons that are used in devices
     * @param {object} devices
     * @returns {object}
     */
    function iconUsedInDevice(devices) {
        var output = {};
        angular.forEach(devices, function (v, k) {
            // Device has custom icons
            if (v.customIcons) {
                angular.forEach(v.customIcons.level || v.customIcons, function (iv, ik) {
                    if (output[iv]) {
                        if(!output[iv].indexOf(v.id)){
                            output[iv].push(v.id);
                        }

                    } else {
                        output[iv] = [v.id];
                    }
                });
            }
        });
        return output;
    }
    ;
});

/**
 * The controller that renders and download icons from the app store.
 * @class OnlineIconController
 */
myAppController.controller('OnlineIconController', function ($scope, $filter, $timeout, $q, $location, cfg, dataFactory, dataService, _) {
    $scope.iconsOnline = {
        all: {},
        find: {},
        preview: {}
    };
    $scope.iconsLocalSource = {};

    /**
     * Load all promises
     * @returns {undefined}
     */

    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('icons', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var icons = response[0];
            console.log(icons);
            // Error message
            if (icons.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - icons
            if (icons.state === 'fulfilled') {
                setLocalIcons(icons.value.data.data);
            }
        });
    };
    $scope.allSettled();

   /**
    * Load on-line icons
    * @returns {undefined}
    */
    $scope.loadOnlineIcons = function () {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getRemoteData(cfg.online_icon_url).then(function (response) {
            $scope.loading = false;
            if (_.size(response.data.data) < 1) {
                alertify.alertError($scope._t('no_data'));
                return;
            }
            setOnlineIcons(response.data.data);
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });
    };
    $scope.loadOnlineIcons();

    /**
     * Open a modal window and load icon previews
     * @returns {undefined}
     */
    $scope.handleOnlineIconModal = function (icon,modal,event) {
        $scope.iconsOnline.find = icon;
        $scope.handleModal(modal, event);
         dataFactory.getRemoteData(cfg.online_icon_preview_url + '/' + icon.name).then(function (response) {
              if (_.size(response.data.data) < 1) {
                alertify.alertError($scope._t('no_data'));
                return;
            }
            $scope.iconsOnline.preview = response.data.data;

        }, function (error) {
             alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });

    };

    
    /**
     * Download an icon set
     * @param {object} icon
     * @returns {undefined}
     */
    $scope.downloadIconSet = function (icon) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('downloading')};
        dataFactory.postApi('icons_install', icon).then(function (response) {
            dataService.showNotifier({message: $scope._t('success_file_download')});
            $location.path('/customize/iconslocal');
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_file_download'));
        });
    };

    /// --- Private functions --- ///

    /**
     * Set online icons $scope
     * @param {object} response
     * @returns {undefined}
     */
    function setOnlineIcons(response) {
        $scope.iconsOnline.all = _.chain(response)
                .flatten()
                .filter(function(v) {
                    v.status = 'download';
                    _.each($scope.iconsLocalSource, function(ils) {
                        if(ils.id === v.id && ils.source === v.name) {
                            v.status = 'installed';
                        }
                    });
                    return v;
                })
                .indexBy('name')
                .value();
    };

    /**
     * Set online icons $scope
     * @param {object} response
     * @returns {undefined}
     */
    function setLocalIcons(response) {

        $scope.iconsLocalSource = Object.keys(_.groupBy(response, function(icon){
            return icon.source;
        })).map(function(icon) {
            return {
                "id": getId(icon),
                "source": getSource(icon)
            };
        });
    }

    /**
     * Get source/name from source
     * @param {object} source
     * @returns {undefined}
     */
    function getSource(source) {
        return source.substring(0, source.lastIndexOf("_"));
    }

    /**
     * Get id from source
     * @param {object} source
     * @returns {undefined}
     */
    function getId(source) {
        return source.substring(source.lastIndexOf("_") + 1, source.length);
    }
});
/**
 * @overview This controller handles devices submenus – Z-Wave, Camera and EnOcean.
 * @author Martin Vach
 */

/**
 * Device root controller
 * @class DeviceController
 *
 */
myAppController.controller('DeviceController', function($scope, dataFactory) {
    $scope.enocean = {
        installed: false,
        active: false,
        alert: {message: false}
    };
     /**
     * Load EnOcean module
     */
    $scope.loadEnOceanModule = function() {
        dataFactory.getApi('instances',false,true).then(function(response) {
            var module = _.findWhere(response.data.data,{moduleId:'EnOcean'});
            if(!module){
                return;
            }
            $scope.enocean.installed = true;
            if (!module.active) {
                $scope.enocean.alert = {message: $scope._t('enocean_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
            $scope.enocean.active = true;
        });
    };

    $scope.loadEnOceanModule();
});
/**
 * @overview Handles Z-Wave device inclusion actions.
 * @author Martin Vach
 */

/**
 * The controller that handles Z-Wave device inclusion process.
 * @class ZwaveInclusionController
 */
myAppController.controller('ZwaveInclusionController', function ($scope, $q, $routeParams, $filter, $interval, $timeout, $route, $location, dataFactory, dataService, _) {
    $scope.zwaveInclusion = {
        cancelModal: false,
        cfg: {
            checkInterviewTimeout: 3000, // miliseconds
            checkInterviewRepeat: 7, // times
            inexTimeout: 30000 // Inclusion/Exclusion timeout - miliseconds
        },
        device: {
            hasBattery: false,
            secureInclusion: true,
            find: {}
        },
        controller: {
            controllerState: 0,
            lastExcludedDevice: null,
            secureInclusion: false
        },
        zwaveApiData: {},
        exclusionProcess: {
            process: false,
            done: false
        },
        inclusionProcess: {
            process: false,
            lastIncluded: 0,
            done: false
        },
        automatedConfiguration: {
            process: false,
            includedDevice: {
                nodeId: 0,
                nodeName: '',
                hasBattery: false,
                commandClassesCnt: 0,
                interviewDoneCnt: 0,
                interviewRepeatCnt: 0,
                security: false,
                securityInterview: false,
                errorType: '',
                interviewNotDone: {}
            },
            fprogress: 0,
            done: false
        },
        manualConfiguration: {
            process: false,
            done: false
        }
    };
    $scope.interval = {
        api: null
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval.api);
    });

    /**
     * Load all promises
     */
    $scope.allSettled = function (lang) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            dataFactory.getApiLocal('devices.json'),
            dataFactory.loadZwaveApiData(true)
        ];

        $q.allSettled(promises).then(function (response) {
            var deviceId = response[0];
            var ZWaveAPIData = response[1];
            // Error message
            if (ZWaveAPIData.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - device by id
            if ($routeParams.id) {
                if (deviceId.state === 'fulfilled') {
                    //setDeviceId(_.findWhere(deviceId.value.data, {id: $routeParams.id}));
                    var device = dataService.getZwaveProducts(deviceId.value.data, lang)
                            .findWhere({id: $routeParams.id})
                            .value();
                    setDeviceId(device);

                }
            }
            // Success - ZWaveAPIData
            if (ZWaveAPIData.state === 'fulfilled') {
                setZWaveAPIData(ZWaveAPIData.value);
            }

            $scope.loading = false;

        });

    };
    $scope.allSettled($scope.lang);

    /**
     * Refresh ZwaveApiData
     */
    $scope.refreshZwaveApiData = function (maxcnt) {
        var cnt = 0;
        if(typeof maxcnt !== 'undefined') {
            var refresh = function () {
                cnt++;
                dataFactory.refreshZwaveApiData().then(function (response) {
                    updateController(response.data);
                }, function (error) {
                    return;
                });

                if(cnt == maxcnt) {
                    $interval.cancel($scope.interval.api);
                    $scope.loading = false;
                }
            };
        } else {
            var refresh = function () {
                dataFactory.refreshZwaveApiData().then(function (response) {
                    updateController(response.data);
                }, function (error) {
                    return;
                });
            };
        }

        $scope.interval.api = $interval(refresh, $scope.cfg.interval);
    };


    /**
     * Start/Stop Exclusion
     */
    $scope.startStopExclusion = function (process) {
        if (process) {
            resetExclusion(process, false, 'controller.RemoveNodeFromNetwork(1)');
            $scope.refreshZwaveApiData();
            // If EXCLUSION takes a long time and nothing happens display an alert and reset exlusion process
            $timeout(function () {
                if ($scope.zwaveInclusion.exclusionProcess.process && !$scope.zwaveInclusion.exclusionProcess.done) {
                    resetExclusion(false, false, 'controller.RemoveNodeFromNetwork(0)', true);
                    alertify.alertWarning($scope._t('error_exclusion_time'));
                    $scope.reloadData();
                }

            }, $scope.zwaveInclusion.cfg.inexTimeout);
        } else {
            resetExclusion(false, false, 'controller.RemoveNodeFromNetwork(0)', true);
            $scope.reloadData();
        }

    };


    /**
     * Start/Stop Inclusion
     */
    $scope.startStopInclusion = function (process) {
        if (process) {
            // setSecureInclusion($scope.zwaveInclusion.device.secureInclusion);
            resetInclusion(process, false, 'controller.AddNodeToNetwork(1)');
            $scope.refreshZwaveApiData();
            // If INCLUSION takes a long time and nothing happens display an alert and reset inclusion process
            $timeout(function () {
                if ($scope.zwaveInclusion.inclusionProcess.process && !$scope.zwaveInclusion.inclusionProcess.done) {
                    resetInclusion(false, false, 'controller.AddNodeToNetwork(0)', true);
                    alertify.alertWarning($scope._t('error_inclusion_time'));
                    $scope.reloadData();
                }
            }, $scope.zwaveInclusion.cfg.inexTimeout);
        } else {
            // setSecureInclusion(true);
            resetInclusion(false, false, 'controller.AddNodeToNetwork(0)', true);
            $scope.reloadData();
        }

    };

    /**
     * Start configuration
     */
    $scope.startConfiguration = function (includedDevice) {
        resetConfiguration(true, false, includedDevice, false, true);
        checkInterview(includedDevice.nodeId);
        var refresh = function () {
            var interviewRepeatCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewRepeatCnt + 1;
            angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {interviewRepeatCnt: interviewRepeatCnt});

            // Try to comlete configuration
            if (interviewRepeatCnt > $scope.zwaveInclusion.cfg.checkInterviewRepeat && !$scope.zwaveInclusion.automatedConfiguration.done) {
                $interval.cancel($scope.interval.api);
                var batteryInfo = $scope.zwaveInclusion.automatedConfiguration.includedDevice.hasBattery
                        ? '<div class="alert alert-warning"> <i class="fa fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                        : '';

                // Error switch
                switch ($scope.zwaveInclusion.automatedConfiguration.includedDevice.errorType) {
                    // Secure interview failed
                    case 'error_interview_secure_failed':
                        alertify.alertError($scope._t('error_interview_secure_failed')).set('onok', function (closeEvent) {
                            resetConfiguration(false, false, null, false, true);
                            $scope.startStopExclusion(true);
                        });
                        break;
                        // Cc Version interview is not complete
                    case 'error_interview_again':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                                .setting('labels', {'ok': $scope._t('try_again_complete')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    $scope.zwaveInclusion.cancelModal = true;
                                });
                        break;
                        // Cc Version interview is complete but other interviews are not complete
                    case 'error_interview_retry':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInclusion.automatedConfiguration.progress + '%' + batteryInfo)
                                .setting('labels', {'ok': $scope._t('retry_complete_inclusion')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    $scope.zwaveInclusion.cancelModal = true;
                                });
                        break;
                        // Unexpected error
                    default:
                        alertify.alertError($scope._t('error_interview_unexpected')).set('onok', function (closeEvent) {
                            $scope.reloadData();
                        });
                        break;
                }
                return;
            }
            checkInterview(includedDevice.nodeId);
        };
        $scope.interval.api = $interval(refresh, $scope.zwaveInclusion.cfg.checkInterviewTimeout);
    };

    /**
     * Start manual configuration
     */
    $scope.startManualConfiguration = function (nodeId) {
        resetManualConfiguration(true, false);
        $timeout(function () {
            resetManualConfiguration(false, true);
            $location.path('/zwave/devices/' + nodeId + '/nohistory');
        }, 5000);
    };

    /**
     * Cancel manual configuration
     */
    $scope.cancelManualConfiguration = function (reset) {
        $scope.zwaveInclusion.cancelModal = false;
        resetConfiguration(false, false, null, false, true);
        if (reset) {
            $scope.startStopExclusion(true);
        } else {
            $scope.startManualConfiguration($scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeId);
        }
    };

    /**
     * Run zwave command
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
        }, function () {
        });
    };

    /**
     * Force interview
     */
    $scope.forceInterview = function (interviews) {
        angular.forEach(interviews, function (v, k) {
            $scope.runZwaveCmd(v);
        });
    };

    /**
     * Set inclusion as Secure/Unsecure.
     * state=true Set as secure.
     * state=false Set as unsecure.
     * @param {string} cmd
     */
    $scope.setSecureInclusion = function (cmd) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.runZwaveCmd(cmd);
        $scope.refreshZwaveApiData(1);
    };

    /// --- Private functions --- ///

    /**
     * Set device by ID
     */
    var setDeviceId = function (data) {
        $scope.zwaveInclusion.device.find = data;
        if (data.inclusion_type === 'unsecure') {
            $scope.zwaveInclusion.device.secureInclusion = false;
        }
    };

    /**
     * Set secure inclusion
     */
    function setSecureInclusion(status) {
        $scope.runZwaveCmd('controller.data.secureInclusion=' + status);
    };

    /**
     * Set ZWave API Data
     */
    function setZWaveAPIData(ZWaveAPIData) {
        $scope.zwaveInclusion.controller.controllerState = ZWaveAPIData.controller.data.controllerState.value;
        $scope.zwaveInclusion.controller.secureInclusion = ZWaveAPIData.controller.data.secureInclusion.value;
    };

    /**
     * Update controller data
     */
    function updateController(data) {
        // Set controller state
        if ('controller.data.controllerState' in data) {
            $scope.zwaveInclusion.controller.controllerState = data['controller.data.controllerState'].value;
            console.log('controllerState: ', $scope.zwaveInclusion.controller.controllerState);
        }
        // Set last excluded device
        if ('controller.data.lastExcludedDevice' in data) {
            $scope.zwaveInclusion.controller.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            if ($scope.zwaveInclusion.controller.lastExcludedDevice !== null) {
                resetExclusion(false, true, false, true);
                dataService.showNotifier({message: $scope._t('lb_device_excluded')});
                $scope.reloadData();
            }
            console.log('lastExcludedDevice: ', $scope.zwaveInclusion.controller.lastExcludedDevice);
        }
        // Set last included device
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            console.log('lastIncludedDevice: ', deviceIncId);
            if (deviceIncId != null) {
                var givenName = 'Device_' + deviceIncId;
                var cmd = false;
                if (data.devices[deviceIncId].data.givenName.value === '' || data.devices[deviceIncId].data.givenName.value === null) {
                    cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                }
                resetInclusion(false, true, false, true);
                //dataService.showNotifier({message: $scope._t('lb_new_device_found')});
                resetConfiguration(true, false, {nodeId: deviceIncId}, cmd, true);
                $scope.startConfiguration({nodeId: deviceIncId});

            }
        }
        if ('controller.data.secureInclusion' in data) {
            $scope.zwaveInclusion.controller.secureInclusion = data['controller.data.secureInclusion'].value;
            console.log('secureInclusion: ', $scope.zwaveInclusion.controller.secureInclusion);
        }
    }
    ;
    /**
     * Reset exclusion
     */
    function resetExclusion(process, done, cmd, cancelInterval) {
        // Set scope
        angular.extend($scope.zwaveInclusion.exclusionProcess,
                {process: process, done: done}
        );
        // Run CMD
        if (cmd) {
            $scope.runZwaveCmd(cmd);
        }
        // Cancel interval
        if (cancelInterval) {
            $interval.cancel($scope.interval.api);
        }
    }
    ;

    /**
     * Reset inclusion
     */
    function resetInclusion(process, done, cmd, cancelInterval) {
        // Set scope
        angular.extend($scope.zwaveInclusion.inclusionProcess,
                {process: process, done: done}
        );
        // Run CMD
        if (cmd) {
            $scope.runZwaveCmd(cmd);
        }
        // Cancel interval
        if (cancelInterval) {
            $interval.cancel($scope.interval.api);
        }
    }
    ;

    /**
     * Reset automated configuration
     */
    function resetConfiguration(process, done, includedDevice, cmd, cancelInterval) {
        /// Set scope
        angular.extend($scope.zwaveInclusion.automatedConfiguration,
                {process: process, done: done, forceInterview: false, progress: 0}
        );
        // Set included device
        if (_.isObject(includedDevice)) {
            angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, includedDevice);
        }
        // Run CMD
        if (cmd) {
            $scope.runZwaveCmd(cmd);
        }
        // Cancel interval
        if (cancelInterval) {
            $interval.cancel($scope.interval.api);
        }
    }
    ;

    /**
     * Check interview
     */
    function checkInterview(nodeId) {
        $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt = 0;
        $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt = 0;
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            $scope.zwaveInclusion.automatedConfiguration.includedDevice.nodeName = node.data.givenName.value || 'Device ' + '_' + nodeId;
            if (!ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value) {
                return;
            }

            // Is battery operated?
            if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {hasBattery: 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses});
            }
            for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length < 1) {
                    return;
                }
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {commandClassesCnt: Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length});
                for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                    var cmdClass = ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId];
                    var id = node.instances[iId].commandClasses[ccId].name;
                    var iData = 'devices[' + nodeId + '].instances[' + iId + '].commandClasses[' + ccId + '].Interview()';
                    //Is Security available?
                    if (ccId === '152') {
                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.security = true;
                    }
                    // Is interview done?
                    if (cmdClass.data.interviewDone.value) {
                        // Is security interview done?
                        if (ccId === '152') {
                            $scope.zwaveInclusion.automatedConfiguration.includedDevice.securityInterview = true;
                        }
                        // If an interview is done deleting from interviewNotDone
                        delete $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone[id];
                        // Extending an interview counter
                        angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice,
                                {interviewDoneCnt: $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt + 1}
                        );
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone[id] = iData;
                    }
                }
            }

            var commandClassesCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.commandClassesCnt;
            var intervewDoneCnt = $scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewDoneCnt;
            var progress = ((intervewDoneCnt / commandClassesCnt) * 100).toFixed();
            console.log('commandClassesCnt: ', commandClassesCnt);
            console.log('intervewDoneCnt: ', intervewDoneCnt);
            console.log('Percent %: ', progress);
            $scope.zwaveInclusion.automatedConfiguration.progress = (progress < 101 ? progress : 99);

            // Test if Security available and Security interview failed
            if ($scope.zwaveInclusion.automatedConfiguration.includedDevice.security && !$scope.zwaveInclusion.automatedConfiguration.includedDevice.securityInterview) {
                angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_secure_failed'});
                return;
            }

            // If no Security or Security ok but Interviews are not complete
            if (!_.isEmpty($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone)) {
                // If command class Version is not complet, „Force Interview Version“
                if ($scope.zwaveInclusion.automatedConfiguration.includedDevice.interviewNotDone['Version']) {
                    angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_again'});
                    return;
                    // If Version ok but other CC are missing, force only these command classes
                } else {
                    angular.extend($scope.zwaveInclusion.automatedConfiguration.includedDevice, {errorType: 'error_interview_retry'});
                    return;
                }
            }
            // All interviews are done
            if (progress >= 100) {
                $scope.zwaveInclusion.automatedConfiguration.progress = 100;
                resetConfiguration(false, true, null, false, true);
                setSecureInclusion(true);
                $scope.startManualConfiguration(nodeId);
                return;
                ;
            }
        }, function (error) {
            return;
        });
    }
    ;

    /**
     * Reset manual configuration
     */
    function resetManualConfiguration(process, done) {
        // Set scope
        angular.extend($scope.zwaveInclusion.manualConfiguration,
                {process: process, done: done}
        );
    }
    ;

});


/**
 * @overview Controllers that handle Z-Wave devices actions.
 * @author Martin Vach
 */

/**
 * The controller that renders Z-Wave vendors.
 * @class ZwaveVendorController
 */
myAppController.controller('ZwaveVendorController', function ($scope, $routeParams, cfg, dataFactory, dataService, _) {
    $scope.zwaveVendors = {
        frequency: false,
        cnt: {
            vendorProducts: {
            }
        },
        all: {},
        find: {}
    };
    /**
     * Load z-wave data
     */
    $scope.loadZwdata = function () {
        dataFactory.loadZwaveApiData().then(function (response) {
           $scope.zwaveVendors.frequency = response.controller.data.frequency.value;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadZwdata();
    /**
     * Load z-wave devices an parse vendors
     */
    $scope.loadVendors = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        //dataFactory.getApiLocal('device.' + lang + '.json').then(function (response) {
        dataFactory.getApiLocal('vendors.json').then(function (response) {
            $scope.loading = false;
            $scope.zwaveVendors.all = response.data;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadVendors();
});

/**
 * The controller that renders Z-Wave devices by vendor.
 * @class ZwaveVendorIdController
 */
myAppController.controller('ZwaveVendorIdController', function ($scope, $routeParams, $q,cfg, dataFactory, dataService, _) {
    $scope.zwaveProducts = {
        all: {},
        cnt: 0,
        frequency: false,
        vendors: {},
        vendor: {}
    };
    /**
     * Load all promises
     */
    $scope.allSettled = function (brandId,lang) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZwaveApiData(),
            dataFactory.getApiLocal('vendors.json'),
            dataFactory.getApiLocal('devices.json')
            
        ];

        $q.allSettled(promises).then(function (response) {
            var where = {
                brandid: brandId
            };
            var zwdata = response[0];
            var vendors = response[1];
            var products = response[2];
            
            $scope.loading = false;
            // Error message
            if (vendors.state === 'rejected' || products.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
             // Success - zwdata
            if (zwdata.state === 'fulfilled') {
                if(zwdata.value.controller.data.frequency.value){
                    $scope.zwaveProducts.frequency = zwdata.value.controller.data.frequency.value;
                    where.frequencyid =  $scope.zwaveProducts.frequency;
                }
            }

            // Success - vendors
            if (vendors.state === 'fulfilled') {
               $scope.zwaveProducts.vendors = vendors.value.data;
               $scope.zwaveProducts.vendor = _.findWhere($scope.zwaveProducts.vendors,{brandid: brandId});
            }
            // Success - products
            if (products.state === 'fulfilled') {
                 $scope.zwaveProducts.all = dataService.getZwaveProducts(products.value.data,lang)
                 .where(where)
                 .value();
                 $scope.zwaveProducts.cnt = _.size($scope.zwaveProducts.all);
            }


        });
    };
    $scope.allSettled($routeParams.id,$scope.lang);
});

/**
 * The controller that renders and handles data in the Z-Wave/Manage section.
 * @class ZwaveManageController
 */
myAppController.controller('ZwaveManageController', function ($scope, $cookies, $filter, $location, $q, dataFactory, dataService, myCache) {
    $scope.devices = {
        zw: {},
        find: {},
        show: true
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZwaveApiData(false),
            dataFactory.getApi('devices')
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var elements = response[1];
            $scope.loading = false;
            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                $scope.devices.show = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - zwave devices
            if (devices.state === 'fulfilled') {
                $scope.devices.zw = setZwaveApiData(devices.value);
            }
            // Success - elements
            if (elements.state === 'fulfilled') {
                //setElements(elements.value.data.data.devices);
                setElements(dataService.getDevicesData(elements.value.data.data.devices, false,true));
            }
        });
    };
    $scope.allSettled();

    /**
     * Run zwave CMD
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
        }, function () {
        });
    };


    /// --- Private functions --- ///
    /**
     * Set zwave devices
     * @param {array} elements
     * @returns {undefined}
     */
    function setZwaveApiData(ZWaveAPIData) {
        var obj = {};
        var controllerNodeId,
                interviewDone,
                isFailed,
                hasBattery,
                lastReceive,
                lastSend,
                lastCommunication,
                isListening,
                isFLiRS,
                isAwake,
                hasWakeup,
                sleepingSince,
                lastWakeup,
                interval,
                batteryCharge,
                instance,
                security;
        controllerNodeId = ZWaveAPIData.controller.data.nodeId.value;
        angular.forEach(ZWaveAPIData.devices, function (node, nodeId) {
            if (nodeId == 255 || nodeId == controllerNodeId || node.data.isVirtual.value) {
                return;
            }
            instance = getInstances(node);
            interviewDone = instance.interviewDone;
            security = instance.security;
            isFailed = node.data.isFailed.value;
            hasBattery = 0x80 in node.instances[0].commandClasses;
            lastReceive = parseInt(node.data.lastReceived.updateTime, 10) || 0;
            lastSend = parseInt(node.data.lastSend.updateTime, 10) || 0;
            lastCommunication = (lastSend > lastReceive) ? lastSend : lastReceive;
            isListening = node.data.isListening.value;
            isFLiRS = !isListening && (node.data.sensor250.value || node.data.sensor1000.value);
            isAwake = node.data.isAwake.value;
            hasWakeup = 0x84 in node.instances[0].commandClasses;
            sleepingSince = 0;
            lastWakeup = 0;
            interval = 0;
            if (!isListening && hasWakeup) {
                sleepingSince = parseInt(node.instances[0].commandClasses[0x84].data.lastSleep.value, 10);
                lastWakeup = parseInt(node.instances[0].commandClasses[0x84].data.lastWakeup.value, 10);
                interval = parseInt(node.instances[0].commandClasses[0x84].data.interval.value, 10);
            }
            //0x80 = 128
            batteryCharge = $filter('hasNode')(node, 'instances.0.commandClasses.128.data.last.value');//parseInt(node.instances[0].commandClasses[0x80].data.last.value);
            obj[nodeId] = {
                id: parseInt(nodeId),
                title: node.data.givenName.value || 'Device ' + '_' + nodeId,
                hasBattery: hasBattery,
                batteryCharge: (batteryCharge === null ? null : parseInt(batteryCharge)),
                interviewDone: interviewDone,
                security: security,
                isFailed: isFailed,
                sleeping: sleepingCont(isListening, hasWakeup, sleepingSince, lastWakeup, interval),
                awake: awakeCont(isAwake, isListening, isFLiRS),
                date: $filter('isTodayFromUnix')(lastCommunication),
                cfg: [],
                elements: {},
                messages: []
            };
            // Low battery level
            if (hasBattery && interviewDone) {
                var batteryCharge = parseInt(node.instances[0].commandClasses[0x80].data.last.value);
                if (batteryCharge <= 20) {
                    obj[nodeId]['messages'].push({
                        type: 'battery',
                        error: $scope._t('lb_low_battery') + ' (' + batteryCharge + '%)'
                    });
                }
            }
            // Is failed
            if (isFailed) {
                obj[nodeId]['messages'].push({
                    type: 'failed',
                    error: $scope._t('lb_is_failed')

                });
                return;
            }

            // Interview is not done
            if (!interviewDone) {
                obj[nodeId]['messages'].push({
                    type: 'config',
                    error: $scope._t('lb_not_configured')

                });
            }
        });
        return obj;
    }
    /**
     * Set elements created by zWave device
     * @param {array} elements
     * @returns {undefined}
     */
    function setElements(elements) {
        var findZwaveStr, cmd, nodeId;
        angular.forEach(elements.value(), function (v, k) {
            findZwaveStr = v.id.split('_');
            if (findZwaveStr[0] === 'ZWayVDev' && findZwaveStr[1] === 'zway') {
                cmd = findZwaveStr[findZwaveStr.length - 1].split('-');
                nodeId = cmd[0];
                if ($scope.devices.zw[nodeId]) {
                    $scope.devices.zw[nodeId]['elements'][v.id] = v;
                }
            }


        });
    }
    /**
     * Get selected instances status
     */
    function getInstances(node) {
        var instance = {
            interviewDone: true,
            security: false
        };
        for (var iId in node.instances) {
            for (var ccId in node.instances[iId].commandClasses) {

                var ccName = node.instances[iId].commandClasses[ccId].name;
                var isDone = node.instances[iId].commandClasses[ccId].data.interviewDone.value;
                if (ccName === 'Security') {
                    instance.security = isDone;
                }
                if (isDone == false) {
                    instance.interviewDone = false;
                }
            }
        }
        return instance;

    }
    ;
    // Get Awake Cont
    function awakeCont(isAwake, isListening, isFLiRS) {
        var awake_cont = false;
        if (!isListening && !isFLiRS) {
            awake_cont = isAwake ? 'awake' : 'sleep';
        }
        return awake_cont;
    }
    // Get Sleeping Cont
    function sleepingCont(isListening, hasWakeup, sleepingSince, lastWakeup, interval) {
        var sleeping_cont;
        if (!isListening && hasWakeup) {
            var approx = '';
            if (isNaN(sleepingSince) || sleepingSince < lastWakeup) {
                sleepingSince = lastWakeup;
                if (!isNaN(lastWakeup))
                    approx = '~';
            }
            ;
            if (interval == 0) {
                interval = NaN; // to indicate that interval and hence next wakeup are unknown
            }
            var lastSleep = $filter('isTodayFromUnix')(sleepingSince);
            var nextWakeup = $filter('isTodayFromUnix')(sleepingSince + interval);
            sleeping_cont = approx + lastSleep + ' &#8594; ' + approx + nextWakeup;
        }
        return sleeping_cont;
    }
});

/**
 * The controller that handles interview process in the Z-Wave/Network section.
 * @class ZwaveInterviewController
 */
myAppController.controller('ZwaveInterviewController', function ($scope, $location, $interval, dataFactory, dataService, _) {
    $scope.zwaveInterview = {
        cfg: {
            checkInterviewTimeout: 3000, // miliseconds
            checkInterviewRepeat: 3, // times
            inexTimeout: 30000 // Inclusion/Exclusion timeout - miliseconds
        },
        process: false,
        done: false,
        nodeId: 0,
        nodeName: '',
        hasBattery: false,
        progress: 0,
        commandClassesCnt: 0,
        interviewDoneCnt: 0,
        interviewRepeatCnt: 0,
        security: false,
        securityInterview: false,
        errorType: '',
        interviewNotDone: {}
    };
    $scope.interval = {
        api: null
    };

    /**
     * Start configuration
     */
    $scope.startConfiguration = function (includedDevice) {
        resetConfiguration(true, false, includedDevice, false, true);
        checkInterview($scope.devices.find.id);
        var refresh = function () {
            $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
            var interviewRepeatCnt = $scope.zwaveInterview.interviewRepeatCnt + 1;
            angular.extend($scope.zwaveInterview, {interviewRepeatCnt: interviewRepeatCnt});
            // Try to comlete configuration
            if (interviewRepeatCnt > $scope.zwaveInterview.cfg.checkInterviewRepeat && !$scope.zwaveInterview.done) {
                $interval.cancel($scope.interval.api);
                var resetInfo = '<div class="alert alert-warning"> <i class="fa fa-exclamation-circle"></i> ' + $scope._t('configuration_cancel') + '</div>';
                var batteryInfo = $scope.zwaveInterview.hasBattery
                        ? '<div class="alert alert-warning"> <i class="fa fa-exclamation-circle"></i> ' + $scope._t('error_interview_battery') + '</div>'
                        : '';

                // Error switch
                switch ($scope.zwaveInterview.errorType) {
                    // Secure interview failed
                    case 'error_interview_secure_failed':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zwave/inclusion');
                                });
                        break;
                        // Cc Version interview is not complete
                    case 'error_interview_again':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zwave/inclusion');
                                });
                        break;
                        // Cc Version interview is complete but other interviews are not complete
                    case 'error_interview_retry':
                        alertify.confirm($scope._t('configuration_complete_only') + ' ' + $scope.zwaveInterview.progress + '%' + batteryInfo + resetInfo)
                                .setting('labels', {'cancel': $scope._t('redo_inclusion')})
                                .set('onok', function (closeEvent) {//after clicking OK
                                    $scope.forceInterview($scope.zwaveInterview.interviewNotDone);
                                    $scope.startConfiguration({
                                        nodeId: $scope.devices.find.id,
                                        interviewDoneCnt: 0,
                                        interviewRepeatCnt: 0,
                                        errorType: ''});
                                })
                                .set('oncancel', function (closeEvent) {//after clicking Cancel
                                    alertify.dismissAll();
                                    $location.path('/zwave/inclusion');
                                });
                        break;
                        // Unexpected error
                    default:
                        alertify.alertError($scope._t('error_interview_unexpected')).set('onok', function (closeEvent) {
                            $scope.reloadData();
                        });
                        break;

                }

                return;
            }
            checkInterview($scope.devices.find.id);
        };
        $scope.interval.api = $interval(refresh, $scope.zwaveInterview.cfg.checkInterviewTimeout);
    };
    if (!_.isEmpty($scope.devices.find)) {
        $scope.startConfiguration();
    }


    /**
     * Cancel configuration
     */
    $scope.cancelConfiguration = function (event) {
        resetConfiguration(false, false, null, false, true);
        $scope.devices.find = {};
        if (event) {
            $scope.handleModal('zwaveNetworkModal', event);
        }
    };

    /**
     * Force interview
     */
    $scope.forceInterview = function (interviews) {
        angular.forEach(interviews, function (v, k) {
            $scope.runZwaveCmd(v);
        });
    };

    /// --- Private functions --- ///

    /**
     * Reset configuration
     */
    function resetConfiguration(process, done, includedDevice, cmd, cancelInterval) {
        /// Set scope
        angular.extend($scope.zwaveInterview,
                {process: process, done: done, forceInterview: false, progress: 0}
        );
        // Set included device
        if (_.isObject(includedDevice)) {
            angular.extend($scope.zwaveInterview, includedDevice);
        }
        // Run CMD
        if (cmd) {
            $scope.runZwaveCmd(cmd);
        }
        // Cancel interval
        if (cancelInterval) {
            $interval.cancel($scope.interval.api);
        }
    }
    ;

    /**
     * Check interview
     */
    function checkInterview(nodeId) {
        $scope.zwaveInterview.commandClassesCnt = 0;
        $scope.zwaveInterview.interviewDoneCnt = 0;
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            if (!ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value) {
                return;
            }

            // Is battery operated?
            if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                angular.extend($scope.zwaveInterview, {hasBattery: 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses});
            }
            for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length < 1) {
                    return;
                }
                angular.extend($scope.zwaveInterview, {commandClassesCnt: Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length});
                for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                    var cmdClass = ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId];
                    var id = node.instances[iId].commandClasses[ccId].name;
                    var iData = 'devices[' + nodeId + '].instances[' + iId + '].commandClasses[' + ccId + '].Interview()';
                    //Is Security available?
                    if (ccId === '152') {
                        $scope.zwaveInterview.security = true;
                    }
                    // Is interview done?
                    if (cmdClass.data.interviewDone.value) {
                        // Is security interview done?
                        if (ccId === '152') {
                            $scope.zwaveInterview.securityInterview = true;
                        }
                        // If an interview is done deleting from interviewNotDone
                        delete $scope.zwaveInterview.interviewNotDone[id];
                        // Extending an interview counter
                        angular.extend($scope.zwaveInterview,
                                {interviewDoneCnt: $scope.zwaveInterview.interviewDoneCnt + 1}
                        );
                    } else { // An interview is not done
                        // Extending interviewNotDone
                        $scope.zwaveInterview.interviewNotDone[id] = iData;
                    }
                }
            }

            var commandClassesCnt = $scope.zwaveInterview.commandClassesCnt;
            var intervewDoneCnt = $scope.zwaveInterview.interviewDoneCnt;
            var progress = ((intervewDoneCnt / commandClassesCnt) * 100).toFixed();
            console.log('commandClassesCnt: ', commandClassesCnt);
            console.log('intervewDoneCnt: ', intervewDoneCnt);
            console.log('Percent %: ', progress);
            $scope.zwaveInterview.progress = (progress < 101 ? progress : 99);

            // Test if Security available and Security interview failed
            if ($scope.zwaveInterview.security && !$scope.zwaveInterview.securityInterview) {
                angular.extend($scope.zwaveInterview, {errorType: 'error_interview_secure_failed'});
                return;
            }

            // If no Security or Security ok but Interviews are not complete
            if (!_.isEmpty($scope.zwaveInterview.interviewNotDone)) {
                // If command class Version is not complet, „Force Interview Version“
                if ($scope.zwaveInterview.interviewNotDone['Version']) {
                    angular.extend($scope.zwaveInterview, {errorType: 'error_interview_again'});
                    return;
                    // If Version ok but other CC are missing, force only these command classes
                } else {
                    angular.extend($scope.zwaveInterview, {errorType: 'error_interview_retry'});
                    return;
                }
            }
            // If interview is complete
            if (progress >= 100) {
                $scope.zwaveInterview.progress = 100;
                resetConfiguration(false, true, null, false, true);
                //setSecureInclusion(true);
                //$scope.startManualConfiguration(nodeId);
                return;
                ;
            }
        }, function (error) {
            return;
        });
    }
    ;

    /**
     * Set secure inclusion
     */
    function setSecureInclusion(status) {
        $scope.runZwaveCmd('controller.data.secureInclusion=' + status);
    }
    ;
});
/**
 * The controller that handles Z-Wave exclusion process.
 * @class ZwaveInterviewController
 */
myAppController.controller('ZwaveExcludeController', function ($scope, $location, $routeParams, $interval, dataFactory, dataService, _) {
    $scope.zWaveDevice = {
        controllerState: 0,
        lastExcludedDevice: 0,
        id: null,
        name: null,
        apiDataInterval: null,
        removeNode: false,
        removeNodeProcess: false,
        find: {}
    };
    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.zWaveDevice.apiDataInterval);
        $scope.zWaveDevice.removeNode = false;
        $scope.runZwaveCmd('controller.RemoveNodeFromNetwork(0)');
    });
    /**
     * Load z-wave devices
     */
    $scope.loadZwaveApiData = function () {
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var node = ZWaveAPIData.devices[$routeParams.id];
            if (!node) {
                alertify.alertWarning($scope._t('no_data'));
                return;
            }
            $scope.zWaveDevice.controllerState = ZWaveAPIData.controller.data.controllerState.value;
            $scope.zWaveDevice.id = $routeParams.id;
            $scope.zWaveDevice.name = node.data.givenName.value || 'Device ' + '_' + $routeParams.id;
            return;

        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadZwaveApiData();

    /**
     *  Refresh z-wave devices
     */
    $scope.refreshZwaveApiData = function () {

        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var refresh = function () {
                dataFactory.refreshZwaveApiData().then(function (response) {
                    //var data = response.data;
                    if ('controller.data.controllerState' in response.data) {
                        $scope.zWaveDevice.controllerState = response.data['controller.data.controllerState'].value;
                        console.log('controllerState: ', $scope.zWaveDevice.controllerState);
                    }

                    if ('controller.data.lastExcludedDevice' in response.data) {
                        $scope.zWaveDevice.lastExcludedDevice = response.data['controller.data.lastExcludedDevice'].value;
                        console.log('lastExcludedDevice: ', $scope.zWaveDevice.lastExcludedDevice);
                    }
                }, function (error) {});
            };
            $scope.zWaveDevice.apiDataInterval = $interval(refresh, $scope.cfg.interval);
        }, function (error) {});
    };
    $scope.refreshZwaveApiData();

    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
            //myCache.remove('devices');
            //myCache.removeAll();
            //console.log('Reload...')
            //$route.reload();
        }, function (error) {
        });

    };
    /**
     * Run ExpertUI command - remove failed node
     */
    $scope.removeFailedNode = function (cmd) {
        dataFactory.runZwaveCmd(cmd).then(function () {
            $scope.zWaveDevice.removeNodeProcess = true;
        }, function (error) {
        });

    };
});
/**
 * The controller that renders and handles configuration data for a single Z-Wave device.
 * @class ZwaveManageIdController
 */
myAppController.controller('ZwaveManageIdController', function ($scope, $window, $routeParams, $q, $filter, $location, dataFactory, dataService, myCache) {
    $scope.zwaveConfig = {
        nodeId: $routeParams.nodeId,
        nohistory: $routeParams.nohistory
    };

    $scope.zWaveDevice = [];
    $scope.devices = [];
    $scope.formInput = {
        show: true,
        newRoom: '',
        elements: {},
        room: 0,
        deviceName: false
    };
    $scope.rooms = [];

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('devices', null, true),
            dataFactory.getApi('locations', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var locations = response[1];

            $scope.loading = false;
            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                $scope.formInput.show = false;
                alertify.alertError($scope._t('error_load_data')).set('onok', function (closeEvent) {
                    dataService.goBack();
                });
                return;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                var elements = dataService.getDevicesData(devices.value.data.data.devices, false,true);
                zwaveConfigApiData($scope.zwaveConfig.nodeId, elements.value());
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms = dataService.getRooms(locations.value.data.data).indexBy('id').value();

            }

        });
    };
    $scope.allSettled();

    /**
     * Add room
     */
    $scope.addRoom = function (room) {
        if (!room) {
            return;
        }
        var input = {
            id: 0,
            title: room
        };
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.storeApi('locations', input.id, input).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
            $scope.formInput.newRoom = '';
            $scope.allSettled();
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;

        });

    };

    /**
     * Update all devices
     */
    $scope.updateAllDevices = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};

        // Update element
        angular.forEach(input.elements, function (v, k) {
            if (input.room) {
                angular.extend(v, {location: parseInt(input.room)})
            }
            dataFactory.putApi('devices', v.id, v).then(function (response) {
            }, function (error) {
            });
        });
        //Update device name
        var cmd = 'devices[' + $scope.zWaveDevice.id + '].data.givenName.value=\'' + input.deviceName + '\'';
        dataFactory.runZwaveCmd(cmd).then(function () {
        }, function (error) {
        });
        myCache.removeAll();
        $scope.loading = false;
        dataService.showNotifier({message: $scope._t('success_updated')});
        if (angular.isDefined($routeParams.nohistory)) {
            $location.path('/zwave/devices');
        } else {
            dataService.goBack();
        }
    };

    /// --- Private functions --- ///
    /**
     * Get zwaveApiData
     */
    function zwaveConfigApiData(nodeId, devices) {
        dataFactory.loadZwaveApiData(true).then(function (ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }

            $scope.zWaveDevice = {
                id: nodeId,
                cfg: []
            };
            $scope.formInput.deviceName = node.data.givenName.value || 'Device ' + '_' + nodeId;
            // Has config file
            if (angular.isDefined(node.data.ZDDXMLFile) && node.data.ZDDXMLFile.value != '') {
                if ($scope.zWaveDevice['cfg'].indexOf('config') === -1) {
                    $scope.zWaveDevice['cfg'].push('config');
                }
            }
            // Has wakeup
            if (0x84 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('wakeup') === -1) {
                    $scope.zWaveDevice['cfg'].push('wakeup');
                }
            }
            // Has SwitchAll
            if (0x27 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('switchall') === -1) {
                    $scope.zWaveDevice['cfg'].push('switchall');
                }
            }
            // Has protection
            if (0x75 in node.instances[0].commandClasses) {
                if ($scope.zWaveDevice['cfg'].indexOf('protection') === -1) {
                    $scope.zWaveDevice['cfg'].push('protection');
                }
            }
            if ($scope.devices.length > 0) {
                $scope.devices = angular.copy([]);
            }

            angular.forEach(devices, function (v, k) {
                var findZwaveStr = v.id.split('_');
                if ((findZwaveStr[0] !== 'ZWayVDev' && findZwaveStr[1] !== 'zway') || v.deviceType === 'battery') {
                    return;
                }
                var cmd = findZwaveStr[findZwaveStr.length - 1].split('-');
                var zwaveId = cmd[0];
                var iId = cmd[1];
                var ccId = cmd[2];
                if (zwaveId == nodeId) {
                    var obj = v;
                    /*var obj = {};
                     obj['id'] = v.id;
                     obj['permanently_hidden'] = v.permanently_hidden;
                     obj['visibility'] = v.visibility;
                     obj['level'] = $filter('toInt')(v.metrics.level);
                     obj['metrics'] = v.metrics;
                     obj['location'] = v.location;*/
                    $scope.formInput.elements[v.id] = obj;
                    $scope.devices.push(obj);
                }

            });
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    }
    ;

});


/**
 * @overview Controllers that handle all Camera actions – manage and add camera.
 * @author Martin Vach
 */

/**
 * The controller that renders a list of the cameras.
 * @class CameraAddController
 */
myAppController.controller('CameraAddController', function ($scope, dataFactory, dataService, _) {
    $scope.ipcameraDevices = [];
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load ip cameras
     */
    $scope.loadData = function () {
        dataFactory.getApi('modules').then(function (response) {
            $scope.ipcameraDevices = _.filter(response.data.data, function (item) {
                var isHidden = false;
                if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                    if ($scope.user.role !== 1) {
                        isHidden = true;
                    } else {
                        isHidden = ($scope.user.expert_view ? false : true);
                    }

                }
                if (item.category !== 'surveillance') {
                    isHidden = true;
                }

                if (!isHidden) {
                    return item;
                }
            });
            if( _.size($scope.ipcameraDevices) < 1){
                    alertify.alertWarning($scope._t('no_cameras')); 
                }
        }, function (error) {});
    };
    $scope.loadData();
});

/**
 * The controller that handles camera manage actions .
 * @class CameraManageController
 */
myAppController.controller('CameraManageController', function ($scope, $q, dataFactory, dataService, myCache, _) {
    $scope.instances = [];
    $scope.modules = {
        mediaUrl: $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/',
        collection: [],
        ids: [],
        imgs: []
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('modules'),
            dataFactory.getApi('instances')
        ];

        $q.allSettled(promises).then(function (response) {
            var modules = response[0];
            var instances = response[1];
            $scope.loading = false;
            // Error message
            if (instances.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                $scope.rooms.show = false;
                return;
            }
            // Success - modules
            if (modules.state === 'fulfilled') {
                setModules(modules.value.data.data);
            }
            // Success - instances
            if (instances.state === 'fulfilled') {
                setInstances(instances.value.data.data);
                if( _.size($scope.instances) < 1){
                    alertify.alertWarning($scope._t('no_cameras')); 
                }
            }
        });
    };
    $scope.allSettled();

    /**
     * Ictivate instance
     */
    $scope.activateInstance = function (input, activeStatus) {
        input.active = activeStatus;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.loading = false;
                myCache.remove('instances');
                myCache.remove('instances/' + input.moduleId);
                myCache.remove('devices');
                $scope.allSettled();

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function (target, input, message) {
        alertify.confirm(message, function () {
            dataFactory.deleteApi('instances', input.id).then(function (response) {
                $(target).fadeOut(500);
                myCache.remove('instances');
                myCache.remove('devices');
            }, function (error) {
                alertify.alertError($scope._t('error_delete_data'));
            });

        });
    };

    /// --- Private functions --- ///

    /**
     * Set modules
     */
    function setModules(data) {
        _.filter(data, function (item) {
            var isHidden = false;
            if ($scope.getHiddenApps().indexOf(item.moduleName) > -1) {
                if ($scope.user.role !== 1) {
                    isHidden = true;
                } else {
                    isHidden = ($scope.user.expert_view ? false : true);
                }

            }
            if (item.category !== 'surveillance') {
                isHidden = true;
            }

            if (!isHidden) {
                $scope.modules.ids.push(item.id);
                $scope.modules.imgs[item.id] = item.icon;
                return item;
            }
        });
    }
    ;

    /**
     * Set instances
     */
    function setInstances(data) {
        $scope.instances = _.reject(data, function (v) {
            if ($scope.modules.ids.indexOf(v.moduleId) > -1) {
                return false;
            }
            return true;
        });
    };

});

/**
 * @overview Controllers that handle EnOcean Services.
 * @author Martin Vach
 */


/**
 * The controller that renders the list of EnOcean manufacturers and devices.
 * @class EnoceanDeviceController
 */
myAppController.controller('EnoceanDeviceController', function($scope, $routeParams, dataFactory, dataService, _) {
    $scope.hasEnOcean = false;
    $scope.enoceanDevices = [];
    $scope.manufacturers = [];
    $scope.manufacturer = false;

    /**
     * Load Remote access data
     */
    $scope.loadEnOceanModule = function() {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', '/EnOcean').then(function(response) {
             $scope.loading = false;
            var module = response.data.data[0];
            if (Object.keys(module).length < 1) {
                alertify.alertWarning($scope._t('no_data'));
                return;
            }
            if (!module.active) {
                alertify.alertError($scope._t('enocean_not_active'));
                return;
            }
            $scope.hasEnOcean = true;
        }, function(error) {
             $scope.loading = false;
            if (error.status == 404) {
               alertify.alertError($scope._t('enocean_nosupport'));
            } else {
                 alertify.alertError($scope._t('error_load_data'));
            }

        });
    };

    $scope.loadEnOceanModule();

    /**
     * Load z-wave devices
     */
    $scope.loadData = function(brandname) {
        dataFactory.getApiLocal('devices_enocean.json').then(function(response) {
            //$scope.manufacturers = dataService.getPairs(response.data, 'vendor', 'vendorLogo', 'manufacturers_enocean');
            $scope.manufacturers = _.uniq(response.data, 'vendor');
            if (brandname) {
                $scope.enoceanDevices = _.where(response.data, {vendor: brandname});
                $scope.manufacturer = brandname;
            }
        }, function(error) {});
    };
    $scope.loadData($routeParams.brandname);
});
/**
 * The controller that teach-in a device by the profile.
 * @class EnoceanAssignController
 */
myAppController.controller('EnoceanAssignController', function($scope, $interval, dataFactory, dataService, myCache) {
    $scope.profile = false;
    $scope.device = [];
    $scope.includedDevices = [];
    $scope.lastIncludedDevice = [];
    $scope.enoceanDevices = {};
    $scope.enoceanProfiles = {};
    $scope.apiDevices = [];
    $scope.dev = [];
    $scope.rooms = [];
    $scope.modelRoom;
    $scope.inclusion = {
        promisc: false,
        done: false,
        config: false,
        message: false,
        status: 'is-hidden',
        icon: false
    };
    $scope.apiDataInterval = null;

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load included devices
     */
    $scope.loadIncludedDevices = function() {
        dataFactory.loadEnoceanApiData(true).then(function(response) {
            angular.forEach(response.data.devices, function(v, k) {
                $scope.includedDevices.push(k);
            });
        }, function(error) {});
    };
    $scope.loadIncludedDevices();

    /**
     * Load EnOcean profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
        }, function(error) {
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load locations
     */
    $scope.loadLocations = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {});
    }
    ;
    $scope.loadLocations();


    /**
     * Load devices from the data holder
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.apiDevices = [];
            var findZenoStr = "ZEnoVDev_zeno_x";
             var elements = dataService.getDevicesData(response.data.data.devices,false);
            angular.forEach(elements.value(), function(v, k) {
                if (v.id.indexOf(findZenoStr) === -1) {
                    return;
                }
                var cmd = v.id.split(findZenoStr)[1].split('_');
                var zenoId = cmd[0];
                if (zenoId == $scope.lastIncludedDevice.id) {
                    var obj = v;
                    obj['title'] = v.metrics.title;
                    /*obj['id'] = v.id;
                    
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['metrics'] = v.metrics;*/
                    $scope.apiDevices.push(obj);
                }

            });

        }, function(error) {
        });
    };


    /**
     * Assign profile
     */
    $scope.loadDevice = function(profile) {
        $interval.cancel($scope.apiDataInterval);
        $scope.device = angular.fromJson(profile);
        $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        $scope.runCmd('controller.data.promisc=true');
        $scope.refreshData();
    }
    ;

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            var findStr = 'devices';
            dataFactory.refreshEnoceanApiData().then(function(response) {
                if ('controller.data.promisc' in response.data) {
                    var pomisc = response.data['controller.data.promisc'].value;
                    if (pomisc === true) {
                        $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
                    } else {
                        $scope.inclusion = {done: false, promisc: false, message: $scope._t('teachin_canceled'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                    }
                    return;
                }

                if ('devices' in response.data) {
                    angular.forEach(response.data.devices, function(v, k) {
                        if ($scope.cfg.enocean_black_list.indexOf(k) === -1) {
                            $scope.findDevice(k);
                        }

                    });
                    return;
                }
                angular.forEach(response.data, function(v, k) {
                    var array = k.split('.');
                    if (array.indexOf(findStr) > -1) {
                        if ($scope.cfg.enocean_black_list.indexOf(array[1]) === -1) {
                            $scope.findDevice(array[1]);
                        }

                    }
                });
            }, function(error) {});
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };



    /**
     * Find last included device
     */
    $scope.findDevice = function(lastId) {
         var id = lastId.replace(/^(x)/, "");
         if($scope.includedDevices.indexOf(id) > -1){
             $scope.inclusion = {done: false, promisc: false, message: '<a href="#enocean/manage"><strong>' + $scope._t('device_exists') + '</strong></a>', status: 'alert-warning', icon: 'fa-exclamation-circle'};
            return;
        }
         
        var rorg = parseInt($scope.device.rorg);
         dataFactory.loadEnoceanApiData(true).then(function(response) {
            angular.forEach(response.data.devices, function(v, k) {
                if (k == id) {
                    // if (v.data.rorg.value == rorg) {
                    var name = 'Device ' + k;
                    var profile = assignProfile(v.data);
                    if (profile) {
                         name = profile._funcDescription + ' ' + k;
                    }

                    $scope.runCmd('controller.data.promisc=false');
                    $scope.lastIncludedDevice = {
                        id: k,
                        rorg: v.data.rorg.value,
                        name: name,
                        data: v.data,
                        deviceProfileId: v.data.rorg.value + '_' + v.data.funcId.value + '_' + v.data.typeId.value,
                        profile: profile
                    };

                    $scope.runCmd('devices["x' + k + '"].data.givenName=\'' + name + '\'');
                    $scope.runCmd('devices["x' + k + '"].data.funcId=' + $scope.device.funcId);
                    $scope.runCmd('devices["x' + k + '"].data.typeId=' + +$scope.device.typeId);
                    $interval.cancel($scope.apiDataInterval);
                    $scope.inclusion = {done: true, config: true, promisc: false, message: $scope._t('inclusion_proces_done'), status: 'alert-success', icon: 'fa-check'};
                    $scope.loadApiDevices();
                    return;
                }
                //}
            });

        }, function(error) {
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};
        });

    };

    /**
     * Run command
     */
    $scope.runCmd = function(cmd) {
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {}, function(error) {
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};

        });
        return;
    };

    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadApiDevices();
            $scope.loading = false;
        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
    /**
     * Assign devices to the room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        myCache.remove('devices');
        $scope.loadApiDevices();
        $scope.loading = false;
        return;

    };

    /**
     * Assign profile to the device
     */
    function assignProfile() {
        var profile = false;
        var deviceProfileId = parseInt($scope.device.rorg, 16) + '_' + parseInt($scope.device.funcId, 16) + '_' + parseInt($scope.device.typeId, 16);
        angular.forEach($scope.enoceanProfiles, function(v, k) {
            if (deviceProfileId == v.id) {
                profile = v;
                return;
            }
        });
        return profile;
    }
    ;

});
/**
 * The controller that teach-in a device from the list.
 * @class EnoceanTeachinController
 */
myAppController.controller('EnoceanTeachinController', function($scope, $routeParams, $interval, $location, dataFactory, dataService, myCache) {
    $scope.device = [];
    $scope.includedDevices = [];
    $scope.lastIncludedDevice = [];
    $scope.enoceanDevices = {};
    $scope.enoceanProfiles = {};
    $scope.apiDevices = [];
    $scope.dev = [];
    $scope.rooms = [];
    $scope.modelRoom;
    $scope.inclusion = {
        promisc: false,
        done: false,
        config: false,
        message: false,
        status: 'is-hidden',
        icon: false
    };
    $scope.apiDataInterval = null;

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load included devices
     */
    $scope.loadIncludedDevices = function() {
        dataFactory.loadEnoceanApiData(true).then(function(response) {
            angular.forEach(response.data.devices, function(v, k) {
                $scope.includedDevices.push(k);
            });
        }, function(error) {});
    };
    $scope.loadIncludedDevices();

    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
        }, function(error) {
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load locations
     */
    $scope.loadLocations = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {});
    }
    ;
    $scope.loadLocations();

    /**
     * Load device data holder
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.apiDevices = [];
            var findZenoStr = "ZEnoVDev_zeno_x";
             var elements = dataService.getDevicesData(response.data.data.devices,false);
            angular.forEach(elements.value(), function(v, k) {
                if (v.id.indexOf(findZenoStr) === -1) {
                    return;
                }
                
                var cmd = v.id.split(findZenoStr)[1].split('_');
                var zenoId = cmd[0];
                if (zenoId == $scope.lastIncludedDevice.id) {
                    var obj = v;
                    //obj['id'] = v.id;
                    obj['title'] = v.metrics.title;
                    /*obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['metrics'] = v.metrics;*/
                    $scope.apiDevices.push(obj);
                }

            });

        }, function(error) {
        });
    };

    /**
     * Load single device
     */
    $scope.loadDevice = function() {
        dataFactory.getApiLocal('devices_enocean.json').then(function(response) {
            angular.forEach(response.data, function(v, k) {
                if (v.id == $routeParams.device) {
                    $scope.device = v;
                    return;
                }
            });
            if (!$scope.device) {
                alertify.alertWarning($scope._t('no_data'));
            }

            $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
            $scope.runCmd('controller.data.promisc=true');

        }, function(error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };

    $scope.loadDevice();

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            var findStr = 'devices';
            dataFactory.refreshEnoceanApiData().then(function(response) {
                if ('controller.data.promisc' in response.data) {
                    var pomisc = response.data['controller.data.promisc'].value;
                    if (pomisc === true) {
                        $scope.inclusion = {done: false, promisc: true, message: $scope._t('teachin_ready') + ' ' + ($scope.device.inclusion ? $scope.device.inclusion : ''), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
                    } else {
                        $scope.inclusion = {done: false, promisc: false, message: $scope._t('teachin_canceled'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                    }
                    return;
                }
                //console.log(response.data)
                if ('devices' in response.data) {
                    angular.forEach(response.data.devices, function(v, k) {
                        if ($scope.cfg.enocean_black_list.indexOf(k) === -1) {
                            $scope.findDevice(k);
                        }

                    });
                    return;
                }
                angular.forEach(response.data, function(v, k) {
                    var array = k.split('.');
                    if (array.indexOf(findStr) > -1) {
                        if ($scope.cfg.enocean_black_list.indexOf(array[1]) === -1) {
                            $scope.findDevice(array[1]);
                        }

                    }
                });
            }, function(error) {});
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshData();

    /**
     * Find last included device
     */
    $scope.findDevice = function(lastId) {
        var id = lastId.replace(/^(x)/, "");
        if($scope.includedDevices.indexOf(id) > -1){
            $scope.inclusion = {done: false, promisc: false, message: '<a href="#enocean/manage"><strong>' + $scope._t('device_exists') + '</strong></a>', status: 'alert-warning', icon: 'fa-exclamation-circle'};
            return;
        }
        var rorg = parseInt($scope.device.rorg);
        dataFactory.loadEnoceanApiData(true).then(function(response) {
            angular.forEach(response.data.devices, function(v, k) {
               if (k === id) {
                     // if (v.data.rorg.value == rorg) {
                    var config = false;
                    var name = 'Device ' + k;
                    var profile = assignProfile(v.data);
                    if (profile) {
                        name = profile._funcDescription + ' ' + k;
                    }

                    $scope.runCmd('controller.data.promisc=false');
                    $scope.lastIncludedDevice = {
                        id: k,
                        rorg: v.data.rorg.value,
                        name: name,
                        data: v.data,
                        deviceProfileId: v.data.rorg.value + '_' + v.data.funcId.value + '_' + v.data.typeId.value,
                        profile: profile
                    };
                    $scope.runCmd('devices["x' + k + '"].data.givenName=\'' + name + '\'');
                    $scope.runCmd('devices["x' + k + '"].data.funcId=' + $scope.device.funcId);  
                    $scope.runCmd('devices["x' + k + '"].data.typeId=' + +$scope.device.typeId);
                    $interval.cancel($scope.apiDataInterval);
                    $scope.inclusion = {done: true, config: true, promisc: false, message: $scope._t('inclusion_proces_done'), status: 'alert-success', icon: 'fa-check'};
                    $scope.loadApiDevices();
                    return;
                }
                //}
            });

        }, function(error) {
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};
        });

    };

    /**
     * Run command
     */
    $scope.runCmd = function(cmd) {
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {}, function(error) {
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};

        });
        return;
    };

    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadApiDevices();
            $scope.loading = false;
        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        myCache.remove('devices');
        $scope.loadApiDevices();
        $scope.loading = false;
        return;

    };

    /**
     * Assign profile to device
     */
    function assignProfile(device, profiles) {
        var profile = false;
        var deviceProfileId = parseInt($scope.device.rorg, 16) + '_' + parseInt($scope.device.funcId, 16) + '_' + parseInt($scope.device.typeId, 16);
        angular.forEach($scope.enoceanProfiles, function(v, k) {
            var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);

            if (deviceProfileId == v.id) {
                profile = v;
                return;
            }
        });
        return profile;
    }
    ;
});
/**
 * The controller that manage EnOcean devices.
 * @class EnoceanManageController
 */
myAppController.controller('EnoceanManageController', function($scope, $location, $window, dataFactory, dataService) {
    $scope.goEdit = [];
    $scope.apiDevices = [];
    $scope.enoceanDevices = {};

    /**
     * Load API devices
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.apiDevices = dataService.getDevicesData(response.data.data.devices,false)
        }, function(error) {});
    };
    $scope.loadApiDevices();

    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            var profile = dataService.setEnoProfile(response.Profiles.Profile);
            $scope.loadData(profile);
        }, function(error) {
            $scope.loadData(null);
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load enocean data
     */
    $scope.loadData = function(enoceanProfiles) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.loadEnoceanApiData(true).then(function(response) {
             $scope.loading = false;
            if (Object.keys(response.data.devices).length < 1) {
                 alertify.alertWarning($scope._t('no_data'));
                return;
            }

            setDevices(response.data.devices, enoceanProfiles);
            $scope.loading = false;

        }, function(error) {
             alertify.alertError($scope._t('error_load_data'));
             $scope.loading = false;
        });
    };




    /**
     * Run CMD
     */
    $scope.runCmd = function(cmd) {
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {}, function(error) {
            $scope.inclusion = {done: false, promisc: false, message: $scope._t('inclusion_error'), status: 'alert-danger', icon: 'fa-warning'};

        });
        return;
    };
    /**
     * Delete device
     */
    $scope.deleteDevice = function(id, target, message) {
        var cmd = 'delete devices["x' + id + '"]';
        alertify.confirm(message, function() {
            dataFactory.runEnoceanCmd(cmd).then(function(response) {
                if(response.data === 'false'){
                    alertify.alertError($scope._t('error_delete_data'));
                    return;
                }
                $(target).fadeOut(500);
                //$scope.loadData();
            }, function(error) {
                alertify.alertError($scope._t('error_delete_data'));
            });

        });
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices, profiles) {
        // console.log(profiles)
        angular.forEach(devices, function(v, k) {
            if ($scope.cfg.enocean_black_list.indexOf(k) > -1) {
                return;
            };
            $scope.enoceanDevices[k] = {
                id: k,
                givenName: v.data.givenName.value,
                data: v.data,
                profile: assignProfile(v.data, profiles),
                elements: getElements($scope.apiDevices, k)

            };

        });

        //console.log($scope.enoceanDevices)
    }
    ;
    /**
     * Assign profile to device
     */
    function assignProfile(device, profiles) {
        var profile = false;
        var deviceProfileId = device.rorg.value + '_' + device.funcId.value + '_' + device.typeId.value;
        angular.forEach(profiles, function(v, k) {
            //console.log('deviceProfileId: ' + deviceProfileId)
            //console.log('v.id: ' + v.id)
            //var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);
            if (deviceProfileId == v.id) {
                profile = v;
                return;
            }
        });
        return profile;
    }
    ;

    /**
     * Get elements
     */
    function getElements(devices, nodeId) {
        var elements = [];
        var findZenoStr = "ZEnoVDev_zeno_";
        angular.forEach(devices, function(v, k) {
            if (v.id.indexOf(findZenoStr) === -1) {
                return;
            }
            var cmd = v.id.split(findZenoStr)[1].split('_');
            var zenoId = cmd[0];
            if (zenoId == nodeId) {
                var obj = v;
                obj['title'] = v.metrics.title;
                /*obj['id'] = v.id;
                obj['permanently_hidden'] = v.permanently_hidden;
                obj['metrics'] = v.metrics;*/
                elements.push(obj);
            }

        });
        return elements;
    }
    ;
});
/**
 * The controller that handles actions on the EnOcean device.
 * @class EnoceanManageDetailController
 */
myAppController.controller('EnoceanManageDetailController', function($scope, $routeParams, $filter, dataFactory, dataService, myCache) {
    $scope.nodeId = $routeParams.deviceId;
    $scope.enoceanDevice = [];
    $scope.enoceanProfiles = {};
    $scope.input = {};
    $scope.dev = [];
    $scope.apiDevices = [];
    $scope.rooms = [];
    $scope.modelRoom;

    /**
     * Load profiles
     */
    $scope.loadProfiles = function() {
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Profiles.xml').then(function(response) {
            $scope.enoceanProfiles = dataService.setEnoProfile(response.Profiles.Profile);
        }, function(error) {
        });
    }
    ;
    $scope.loadProfiles();

    /**
     * Load enocean data
     */
    $scope.loadData = function() {
        dataFactory.runEnoceanCmd('zeno.devices["' + $routeParams.deviceId + '"]').then(function(response) {
            if (response.data == 'null') {
                  console.log('ERROR')
                return;
            }
            var device = response.data;
            var name = '';
            var profile = assignProfile(device.data, $scope.enoceanProfiles);
            if (profile) {
                //profileId = profile.profileId;
                name = profile._funcDescription;
            }
            $scope.input = {
                id: device.id.replace(/^(x)/, ""),
                rorg: device.data.rorg.value,
                name: device.data.givenName.value||name,
                deviceProfileId: device.data.rorg.value + '_' + device.data.funcId.value + '_' + device.data.typeId.value,
                profile: profile,
                profileId: ''

            };
        }, function(error) {});
    };
    $scope.loadData();

    /**
     * Load devices data holder
     */
    $scope.loadApiDevices = function() {
        dataFactory.getApi('devices', null, true).then(function(response) {
            $scope.apiDevices = [];
            var findZenoStr = "ZEnoVDev_zeno_";
            var elements = dataService.getDevicesData(response.data.data.devices,false);
            angular.forEach(elements.value(), function(v, k) {
                if (v.id.indexOf(findZenoStr) === -1) {
                    return;
                }
                var cmd = v.id.split(findZenoStr)[1].split('_');
                var zenoId = cmd[0];
                if (zenoId == $scope.nodeId) {
                    var obj = v;
                    obj['level'] = $filter('toInt')(v.metrics.level);
                    /*obj['id'] = v.id;
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['level'] = $filter('toInt')(v.metrics.level);
                    obj['metrics'] = v.metrics;*/
                    $scope.apiDevices.push(obj);
                }

            });
            loadLocations();

        }, function(error) {});
    };
    $scope.loadApiDevices();

    /**
     * Store device data
     */
    $scope.store = function(input) {
        if (input.name == '') {
             return;
         }
         //$scope.input.name = input.name;
        $scope.runCmd('devices["' + $scope.nodeId + '"].data.givenName=\'' + input.name + '\'');
        if (input.profileId) {
            var device = angular.fromJson(input.profileId);
            $scope.runCmd('devices["' + $scope.nodeId + '"].data.funcId=' + device.funcId);
            $scope.runCmd('devices["' + $scope.nodeId + '"].data.typeId=' + device.typeId);
            $scope.input.profileId = device.rorg + '_' + device.funcId + '_' + device.typeId;
        }
        $scope.loadData();
        $scope.loadApiDevices();
    };

    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadApiDevices();
            $scope.loading = false;
        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /**
     * Assign devices to room
     */
    $scope.devicesToRoom = function(roomId, devices) {
        if (!roomId) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        for (var i = 0; i <= devices.length; i++) {
            var v = devices[i];
            if (!v) {
                continue;
            }
            var input = {
                id: v.id,
                location: roomId
            };

            dataFactory.putApi('devices', v.id, input).then(function(response) {
            }, function(error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        //myCache.remove('devices');
        $scope.loadApiDevices();
        $scope.loading = false;
        return;

    };



    /**
     * Run command
     */
    $scope.runCmd = function(cmd) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        // Run CMD
        dataFactory.runEnoceanCmd(cmd).then(function(response) {
            $scope.loading = false;
        }, function(error) {
            $scope.loading = false;

        });
        return;
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices, profiles) {
        angular.forEach(devices, function(v, k) {
            $scope.enoceanDevices[v.id] = {
                id: v.id,
                data: v.data,
                profile: assignProfile(v.data, profiles)
            };
        });
        //console.log($scope.deviceCollection)
    }
    ;
    /**
     * Assign profile to device
     */
    function assignProfile(device, profiles) {
        var profile = false;
        var deviceProfileId = device.rorg.value + '_' + device.funcId.value + '_' + device.typeId.value;
        angular.forEach(profiles, function(v, k) {
            //var profileId = parseInt(v._rorg) + '_' + parseInt(v._func) + '_' + parseInt(v._type);
            if (deviceProfileId == v.id) {
                profile = v;
                return;
            }
        });
        return profile;
    }
    ;

    /**
     * Load locations
     */
    function loadLocations() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {});
    }
    ;
});
/**
 * The controller that renders informations about the controller.
 * @class EnoceanControllerController
 */
myAppController.controller('EnoceanControllerController', function($scope, $location, dataFactory, dataService) {
    $scope.controller = false;
    $scope.controllerShow = ['APIVersion', 'AppDescription', 'AppVersion', 'ChipID', 'ChipVersion'];

    /**
     * Load enocean data
     */
    $scope.loadData = function() {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.loadEnoceanApiData(true).then(function(response) {
            $scope.controller = response.data.controller.data;
            $scope.loading = false;
        }, function(error) {
             alertify.alertError($scope._t('error_load_data'));
             $scope.loading = false;
        });
    };
    $scope.loadData();
});
/**
 * @overview Controllers that handle room actions.
 * @author Martin Vach
 */

/**
 * The room root controller
 * @class RoomController
 */
myAppController.controller('RoomController', function ($scope, $q, $cookies, $filter, dataFactory, dataService, _) {
    $scope.rooms = {
        show: true,
        all: {},
        cnt: {
            devices: {}
        },
        showHidden: ($cookies.showHiddenEl ? $filter('toBool')($cookies.showHiddenEl) : false),
        orderBy: ($cookies.roomsOrderBy ? $cookies.roomsOrderBy : 'titleASC')
    };

    $scope.devices = {
        all: {}
    };

    /**
     * Load all promises
     * @returns {undefined}
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('locations', null, true),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var locations = response[0];
            var devices = response[1];
            $scope.loading = false;
            // Error message
            if (locations.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                $scope.rooms.show = false;
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms.all = dataService.getRooms(locations.value.data.data).value();
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.devices.all = dataService.getDevicesData(devices.value.data.data.devices, $scope.rooms.showHidden).value();
                $scope.rooms.cnt.devices = _.countBy($scope.devices.all, function (v) {
                    return v.location;
                });
            }
        });
    };
    $scope.allSettled();

    /**
     * Set order by
     * @param {string} key
     * @returns {undefined}
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.rooms, {orderBy: key});
        $cookies.roomsOrderBy = key;
        $scope.allSettled();
    };

    /**
     * Delete a room
     * @param {int} roomId
     * @param {string} message
     * @returns {undefined}
     */
    $scope.deleteRoom = function (roomId, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('locations', roomId).then(function (response) {
                $scope.loading = false;
                removeRoomIdFromDevice(_.where($scope.devices.all, {location: roomId}));
                //myCache.remove('locations');
                //myCache.remove('devices');
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.reloadData();
                //$scope.allSettled();

            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };

    /// --- Private functions --- ///

    /**
     * Remove room id from a device
     * @param {object} devices
     * @returns {undefined}
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function (v, k) {
            dataFactory.putApi('devices', v.id, {'location': 0}).then(function (response) {
            }, function (error) {
            });
        });
        return;

    }
    ;
});
/**
 * The controller that renders and handles single room data.
 * @class RoomConfigIdController
 */
myAppController.controller('RoomConfigIdController', function ($scope, $routeParams, $filter, $location, cfg, dataFactory, dataService, myCache, _) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.input = {
        'id': 0,
        'title': '',
        'user_img': '',
        'default_img': '',
        'img_type': 'default'
    };
    $scope.devices = {};
    $scope.devicesAssigned = [];
    //$scope.devicesAvailable = [];
    $scope.devicesToRemove = [];
    $scope.defaultImages = $scope.cfg.room_images;
    $scope.userImageUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/image/';
    $scope.file = {
        upload: false,
        info: {
            maxSize: $filter('fileSizeString')(cfg.upload.room.size),
            extensions: cfg.upload.room.extension.toString()
        }
    };

   /**
    * Load a data holder with rooms
    * @param {int} id
    * @returns {undefined}
    */
    $scope.loadData = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('locations', '/' + id, true).then(function (response) {
            $scope.loading = false;
            $scope.input = response.data.data;
            loadDevices(id);
        }, function (error) {
            $scope.input = false;
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    if ($scope.id > 0) {
        $scope.loadData($scope.id);
    } else {
        loadDevices(0);
    }

    /**
     * Upload an image file
     * @param {object} files
     * @returns {undefined}
     */
    $scope.uploadFile = function (files) {
        // Check allowed file formats
        //if(cfg.upload.room.type.indexOf(files[0].type) === -1){
        if (cfg.upload.room.extension.indexOf($filter('fileExtension')(files[0].name)) === -1) {
            alertify.alertError(
                    $scope._t('upload_format_unsupported', {'__extension__': $filter('fileExtension')(files[0].name)}) + ' ' +
                    $scope._t('upload_allowed_formats', {'__extensions__': $scope.file.info.extensions})
                    );
            return;

        }
        // Check allowed file size
        if (files[0].size > cfg.upload.room.size) {
            alertify.alertError(
                    $scope._t('upload_allowed_size', {'__size__': $scope.file.info.maxSize}) + ' ' +
                    $scope._t('upload_size_is', {'__size__': $filter('fileSizeString')(files[0].size)})
                    );
            return;

        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('uploading')};
        // Clear all alerts and file name selected
        alertify.dismissAll();
        $scope.file.upload = false;
        // Set local variables
        var cmd = $scope.cfg.api_url + 'upload/file',
                fd = new FormData();
        // Set selected file name
        $scope.file.upload = files[0].name;
        fd.append('files_files', files[0]);
        console.log(fd);
        // Atempt to upload a file
        dataFactory.uploadApiFile(cmd, fd).then(function (response) {
            $scope.loading = false;
            $scope.input.user_img = response.data.data;
            $scope.input.img_type = 'user';
            dataService.showNotifier({message: $scope._t('success_upload')});
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_upload'));
        });
    };

   /**
    * Assign device to a room
    * @param {object} device
    * @returns {undefined}
    */
    $scope.assignDevice = function (device) {
        device.location = null;
        $scope.devicesAssigned.push(device.id);
        return;
    };

    /**
     * Remove device from the room
     * @param {object} device
     * @returns {undefined}
     */
    $scope.removeDevice = function (device) {
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        $scope.devicesToRemove = $scope.devicesToRemove.length > 0 ? $scope.devicesToRemove : [];
        angular.forEach(oldList, function (v, k) {
            if (v != device.id) {
                $scope.devicesAssigned.push(v);
            } else {
                device.location = 0;
                $scope.devicesToRemove.push(v);
            }
        });
        return;
    };

    /**
     * Create new or update an existing location
     * @param {object} form
     * @param {object} input
     * @returns {undefined}
     */
    $scope.store = function (form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.storeApi('locations', input.id, input).then(function (response) {
            $scope.loading = false;
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                saveRoomIdIntoDevice(response.data, $scope.devicesAssigned);
                removeRoomIdFromDevice($scope.devicesToRemove);
                myCache.remove('locations');
                myCache.remove('devices');
                dataService.showNotifier({message: $scope._t('success_updated')});
                $location.path('/rooms');
            }


        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;

        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     * @param {int} locationId
     * @returns {undefined}
     */
    function loadDevices(locationId) {
        dataFactory.getApi('devices').then(function (response) {
            $scope.devicesAssigned = [];
            var devices = dataService.getDevicesData(response.data.data.devices).value();
            _.filter(devices, function (v) {
                if (locationId > 0 && v.location === locationId) {
                    $scope.devicesAssigned.push(v.id);
                }
                if (v.location == 0 || v.location == locationId) {
                    $scope.devices[v.id] = v;
                }
            });
        }, function (error) {});
    }
    ;

    /**
     * Save room id into device
     * @param {object} data
     * @param {object} devices
     * @returns {undefined}
     */
    function saveRoomIdIntoDevice(data, devices) {
        angular.forEach(devices, function (v, k) {
            dataFactory.storeApi('devices', v, {'location': data.data.id}).then(function (response) {
            }, function (error) {

            });
        });
        return;

    }
    ;

    /**
     * Remove room id from device
     * @param {object} devices
     * @returns {undefined}
     */
    function removeRoomIdFromDevice(devices) {
        angular.forEach(devices, function (v, k) {
            dataFactory.putApi('devices', v, {'location': 0}).then(function (response) {
            }, function (error) {

            });
        });
        return;

    }
    ;

});
/**
 * @overview Controllers that handle management actions.
 * @author Martin Vach
 */

/**
 * The management root controller
 * @class ManagementController
 */
myAppController.controller('ManagementController', function ($scope, $interval, $q, $filter, cfg, dataFactory, dataService, myCache) {
    //Set elements to expand/collapse
    angular.copy({
        user: false,
        remote: false,
        licence: false,
        firmware: false,
        backup_restore: false,
        info: false,
        report: false,
        appstore: false
    }, $scope.expand);
    $scope.ZwaveApiData = false;
    $scope.controllerInfo = {
        uuid: null,
        remoteId: null,
        isZeroUuid: false,
        softwareRevisionVersion: null,
        softwareLatestVersion: null,
        capabillities: null,
        scratchId: null,
        capsLimited: false,
        manufacturerId: null
    };
    $scope.remoteAccess = false;
    $scope.handleLicense = {
        alert: {message: false, status: 'is-hidden', icon: false},
        error: true,
        show: false,
        disabled: false,
        replug: false
    };

    $scope.handleTimezone = {
        instance: {},
        show: false
    };

    $scope.builtInfo = false;

    $scope.zwaveDataInterval = null;
    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.zwaveDataInterval);
        angular.copy({}, $scope.expand);
    });

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZwaveApiData()
        ];
        if($scope.isInArray(['jb'],cfg.app_type)){
            promises.push(dataFactory.getApi('instances', '/ZMEOpenWRT'));
        }
        $q.allSettled(promises).then(function (response) {
            var zwave = response[0];
            var timezone = response[1];
            $scope.loading = false;
            // Success - api data
            if (zwave.state === 'fulfilled') {
                $scope.ZwaveApiData = zwave.value;
                setControllerInfo(zwave.value);
            }

            if(timezone){
                // Success - timezone
                if (timezone.state === 'fulfilled' && timezone.value.data.data[0].active === true) {
                    $scope.handleTimezone.show = true;
                    $scope.handleTimezone.instance = timezone.value.data.data[0];
                }
            }

        });
    };
    $scope.allSettled();

    /**
     * Load app built info
     */
    $scope.loadAppBuiltInfo = function() {
        dataFactory.getAppBuiltInfo().then(function(response) {
            $scope.builtInfo = response.data;
        }, function(error) {});
    };
    $scope.loadAppBuiltInfo();

    /// --- Private functions --- ///
    /**
     * Set controller info
     */
    function setControllerInfo(ZWaveAPIData) {
        var caps = function (arr) {
            var cap = '';
            if (angular.isArray(arr)) {
                cap += (arr[3] & 0x01 ? 'S' : 's');
                cap += (arr[3] & 0x02 ? 'L' : 'l');
                cap += (arr[3] & 0x04 ? 'M' : 'm');
            }
            return cap;

        };
        var nodeLimit = function (str) {
            return parseInt(str, 16) > 0x00 ? false : true;
        };
        $scope.controllerInfo.uuid = ZWaveAPIData.controller.data.uuid.value;
        $scope.controllerInfo.isZeroUuid = parseInt(ZWaveAPIData.controller.data.uuid.value, 16) === 0;
        $scope.controllerInfo.softwareRevisionVersion = ZWaveAPIData.controller.data.softwareRevisionVersion.value;
        $scope.controllerInfo.manufacturerId = ZWaveAPIData.controller.data.manufacturerId.value;
        $scope.controllerInfo.capabillities = caps(ZWaveAPIData.controller.data.caps.value);
        $scope.controllerInfo.capsLimited = nodeLimit($filter('dec2hex')(ZWaveAPIData.controller.data.caps.value[2]).slice(-2));
        setLicenceScratchId($scope.controllerInfo);
        //console.log(ZWaveAPIData.controller.data.caps.value);
        //console.log('Limited: ', $scope.controllerInfo.capsLimited);
    };

    /**
     * Set licence ID
     * @param {object} controllerInfo
     * @returns {undefined}
     */
    function  setLicenceScratchId(controllerInfo) {
        dataFactory.getRemoteData($scope.cfg.get_licence_scratchid + '?uuid=' + controllerInfo.uuid).then(function (response) {
            if(response.data !== "") {
                $scope.controllerInfo.scratchId = response.data.scratch_id;
                $scope.handleLicense.error = false;
            } else {
                $scope.handleLicense.alert = {message: $scope._t('error_license_request'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
            }
            handleLicense($scope.controllerInfo);
        }, function (error) {
            handleLicense($scope.controllerInfo);
            $scope.handleLicense.alert = {message: $scope._t('error_license_request'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
            //alertify.alertError($scope._t('error_license_request'));
        });
    };

    /**
     * Show or hide licencese block
     * @param {object} controllerInfo
     * @returns {undefined}
     */
    function handleLicense(controllerInfo) {

        //Razberry/RaZ = 327
        //UZB/ZME = 277

        $scope.handleLicense.show = false;
        if($scope.controllerInfo.manufacturerId === 277) {
            // Hide license if
            // forbidden, mobile device, not uuid
            if ((cfg.license_forbidden.indexOf(cfg.app_type) > -1) || $scope.isMobile || !controllerInfo.uuid) {
                //console.log('Hide license if: forbidden, mobile device, not uuid')
                $scope.handleLicense.show = false;
                return;
            }

            // check if error (request faild)
            if ($scope.handleLicense.error && !controllerInfo.scratchId && !controllerInfo.capsLimited) {
                $scope.handleLicense.show = true;
                return;
            }

            // Hide license if
            // Controller UUID = string and scratchId  is NOT found  and cap unlimited
            if (!controllerInfo.scratchId && !controllerInfo.capsLimited) {
                //console.log('Hide license if: Controller UUID = string and scratchId  is NOT found  and cap unlimited');
                $scope.handleLicense.show = false;
                return;
            }

            // Show modal if
            // Controller UUID = string and scratchId  is NOT found  and cap limited
            if (!controllerInfo.scratchId && controllerInfo.capsLimited) {
                //console.log('Show modal if: Controller UUID = string and scratchId  is NOT found  and cap limited');
                alertify.alertWarning($scope._t('info_missing_licence'));
            }

            // Disable input and show unplug message
            if (controllerInfo.isZeroUuid) {
                //console.log('Disable input and show unplug message');
                $scope.handleLicense.disabled = true;
                $scope.handleLicense.replug = true;
            }
            $scope.handleLicense.show = true;
        }
    }

});
/**
 * The controller that renders the list of users.
 * @class ManagementUserController
 */
myAppController.controller('ManagementUserController', function ($scope, $cookies, dataFactory, dataService, myCache) {
    $scope.userProfiles = {
        all: false,
        orderBy: ($cookies.usersOrderBy ? $cookies.usersOrderBy : 'titleASC')
    };
    /**
     * Load profiles
     */
    $scope.loadProfiles = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('profiles', null, true).then(function (response) {
            $scope.userProfiles.all = response.data.data;
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadProfiles();

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.userProfiles, {orderBy: key});
        $cookies.usersOrderBy = key;
        $scope.loadProfiles();
    };

    /**
     * Delete an user
     */
    $scope.deleteProfile = function (input, message, except) {
        if (input.id == except) {
            return;
        }
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('profiles', input.id).then(function (response) {
                myCache.remove('profiles');
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.loading = false;
                $scope.loadProfiles();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };


});
/**
 * The controller that handles user detail actions.
 * @class ManagementUserIdController
 */
myAppController.controller('ManagementUserIdController', function ($scope, $routeParams, $filter, $q, dataFactory, dataService, myCache) {
    $scope.id = $filter('toInt')($routeParams.id);
    $scope.rooms = {};
    $scope.show = true;
    $scope.input = {
        "id": 0,
        "role": 2,
        "login": "",
        "name": "",
        "lang": "en",
        "color": "#dddddd",
        "dashboard": [],
        "interval": 1000,
        "rooms": [],
        "expert_view": true,
        "hide_all_device_events": false,
        "hide_system_events": false,
        "hide_single_device_events": []
    };
    $scope.auth = {
        id: $routeParams.id,
        login: null,
        password: null
    };
    $scope.lastEmail = "";

    /**
     * Load all promises
     */
    $scope.allSettledUserId = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('profiles', ($scope.id !== 0 ? '/' + $scope.id : ''), true),
            dataFactory.getApi('locations')
        ];

        $q.allSettled(promises).then(function (response) {
            var profile = response[0];
            var locations = response[1];
            $scope.loading = false;
            // Error message
            if (profile.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                $scope.show = false;
                return;
            }
            // Success - profile
            if (profile.state === 'fulfilled') {
                if ($scope.id !== 0) {
                    $scope.input = profile.value.data.data;
                    $scope.auth.login = profile.value.data.data.login;
                    $scope.lastEmail = profile.value.data.data.email;
                }
            }

            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.rooms = dataService.getRooms(locations.value.data.data)
                    .reject(function (v) {
                        return (v.id === 0);

                    })
                    .value();
            }
        });
    };
    $scope.allSettledUserId();

    /**
     * Watch for the role change
     */
    /*$scope.$watch('input.role', function () {
     //var globalRoomIndex = $scope.input.rooms.indexOf(0);
     if($scope.input.role === 1){
     $scope.input.rooms = [0];
     }else{
     $scope.input.rooms = $scope.input.rooms.length > 0  ? $scope.input.rooms : [];
     //$scope.input.rooms = []
     }
     });*/
    /**
     * Assign room to list
     */
    $scope.assignRoom = function (assign) {
        if($scope.input.role !== 1) {
            $scope.input.rooms.push(assign);
        }
    };

    /*$scope.prepareRooms = function () {
     return;
     var globalRoomIndex = $scope.input.rooms.indexOf(0);
     //var roomIds = _.map(locations.value.data.data, function(location){});

     if ($scope.input.role === 1 && globalRoomIndex === -1) {
     $scope.input.rooms = [0];
     } else if ($scope.input.role !== 1 && globalRoomIndex > -1){
     if ($scope.input.id === 0) {
     $scope.input.rooms = [];
     } else {
     $scope.input.rooms.splice(globalRoomIndex, 1);
     }
     }
     return;
     };*/

    /**
     * Remove room from the list
     */
    $scope.removeRoom = function (roomId) {
        var oldList = $scope.input.rooms;
        $scope.input.rooms = [];
        angular.forEach(oldList, function (v, k) {
            if (v != roomId) {
                $scope.input.rooms.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update an item
     */
    $scope.store = function (form, input) {
        if (form.$invalid) {
            return;
        }
        var globalRoomIndex = input.rooms.indexOf(0);
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if ($scope.id == 0) {
            input.password = input.password;
        }
        if (input.role === 1) {
            input.rooms = [0];
        }else if(globalRoomIndex > -1){
            input.rooms.splice(globalRoomIndex, 1);
        }
        //console.log(input);
        //return;
        dataFactory.storeApi('profiles', input.id, input).then(function (response) {
            var id = $filter('hasNode')(response, 'data.data.id');
            if (id) {
                myCache.remove('profiles');
                $scope.reloadData();
            }

            // Email change --> update e-mail cloudbackup if instance exist
            if($scope.lastEmail != input.email) {
                var promises = [
                    dataFactory.getApi('instances', '/CloudBackup')
                ];

                $q.allSettled(promises).then(function (response) {
                    var instance = response[0];

                    if (instance.state === 'rejected') {
                        return;
                    }

                    if (instance.state === 'fulfilled') {
                        var instanceData = instance.value.data.data[0];
                        instanceData.params.email = input.email;
                        dataFactory.putApi('instances', instanceData.id, instanceData).then(function (response) {
                            $scope.lastEmail = input.email
                        }, function (error) {
                            alertify.alertError($scope._t('error_update_data'));
                        });
                    }
                });
            }

            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
            window.location = '#/admin';

            //$window.location.reload();

        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
            alertify.alertError(message);
            $scope.loading = false;
        });

    };

    /**
     * Change auth data
     */
    $scope.changeAuth = function (form, auth) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles_auth_update', $scope.id, $scope.auth).then(function (response) {
            $scope.loading = false;
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                return;
            }
            dataService.showNotifier({message: $scope._t('success_updated')});

        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
            alertify.alertError(message);
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///


});
/**
 * The controller that renders and handles remote access data.
 * @class ManagementRemoteController
 */
myAppController.controller('ManagementRemoteController', function ($scope, dataFactory, dataService) {
    $scope.remoteAccess = false;
    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function () {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('instances', '/RemoteAccess').then(function (response) {

            $scope.loading = false;
            var remoteAccess = response.data.data[0];
            if (Object.keys(remoteAccess).length < 1) {
                alertify.alertError($scope._t('error_load_data'));
            }
            if (!remoteAccess.active) {
                alertify.alertWarning($scope._t('remote_access_not_active'));
                return;
            }
            if (!remoteAccess.params.userId) {
                alertify.alertError($scope._t('error_remote_access_init'));
                return;
            }
            remoteAccess.params.pass = null;
            $scope.remoteAccess = remoteAccess;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('remote_access_not_installed'));
        });
    };

    $scope.loadRemoteAccess();

    /**
     * PUT Remote access
     */
    $scope.putRemoteAccess = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('instances', input.id, input).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
});
/**
 * The controller that renders and handles local access.
 * @class ManagementLocalController
 */
myAppController.controller('ManagementLocalController', function ($scope, dataFactory, dataService) {


    /**
     * Update instance
     */
    $scope.updateInstance = function (input) {
        //var input = $scope.handleTimezone.instance;
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                alertify.confirm($scope._t('timezone_alert'))
                    .setting('labels', {'ok': $scope._t('yes'),'cancel': $scope._t('lb_cancel')})
                    .set('onok', function (closeEvent) {//after clicking OK
                        $scope.systemReboot();
                    });

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        }
    };

    /**
     * System rebboot
     */
    $scope.systemReboot = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('system_rebooting')};
        dataFactory.getApi('system_reboot').then(function (response) {
        }, function (error) {
            alertify.alertError($scope._t('error_system_reboot'));
        });

    };
});
/**
 * The controller that handles the licence key.
 * @class ManagementLicenceController
 */
myAppController.controller('ManagementLicenceController', function ($scope, cfg, dataFactory) {

    $scope.proccessLicence = false;
    $scope.proccessVerify = {
        'message': false,
        'status': 'is-hidden'
    };
    $scope.proccessUpdate = {
        'message': false,
        'status': 'is-hidden'
    };
    $scope.inputLicence = {
        "show": false,
        "scratch_id": $scope.controllerInfo.scratchId
    };

    /**
     * Update capabilities
     */
    function updateCapabilities(data) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('upgrading_capabilities')};
        $scope.proccessUpdate = {'message': $scope._t('upgrading_capabilities'), 'status': 'fa fa-spinner fa-spin'};
        dataFactory.zmeCapabilities(data).then(function (response) {
            $scope.loading = false;
            $scope.proccessUpdate = {'message': $scope._t('success_capabilities'), 'status': 'fa fa-check text-success'};
            $scope.proccessLicence = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_no_capabilities'));
            $scope.proccessUpdate = {'message': $scope._t('error_no_capabilities'), 'status': 'fa fa-exclamation-triangle text-danger'};
            $scope.proccessLicence = false;
        });
    };

    /**
    * Get license key
    */
    $scope.getLicense = function (inputLicence) {
        // Clear messages
        $scope.proccessVerify.message = false;
        $scope.proccessUpdate.message = false;
        if (!inputLicence.scratch_id) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('verifying_licence_key')};
        $scope.proccessVerify = {'message': $scope._t('verifying_licence_key'), 'status': 'fa fa-spinner fa-spin'};
        $scope.proccessLicence = true;
        var input = {
            'uuid': $scope.controllerInfo.uuid,
            'scratch': inputLicence.scratch_id
        };
        dataFactory.getLicense(input).then(function (response) {
            $scope.proccessVerify = {'message': $scope._t('success_licence_key'), 'status': 'fa fa-check text-success'};
            $scope.loading = false;
            // Update capabilities
            updateCapabilities(response);
        }, function (error) {
            var message = $scope._t('error_no_licence_key');
            if (error.status == 404) {
                var message = $scope._t('error_404_licence_key');
            }
            $scope.loading = false;
            alertify.alertError(message);
            $scope.proccessVerify = {'message': message, 'status': 'fa fa-exclamation-triangle text-danger'};
            $scope.proccessLicence = false;
        });
    };
});
/**
 * The controller that handles firmware update process.
 * @class ManagementFirmwareController
 */
myAppController.controller('ManagementFirmwareController', function ($scope, $sce, $timeout, dataFactory, dataService) {
    $scope.firmwareUpdateUrl = $sce.trustAsResourceUrl('http://' + $scope.hostName + ':8084/cgi-bin/main.cgi');
    $scope.firmwareUpdate = {
        show: false,
        loaded: false,
        url: $sce.trustAsResourceUrl('http://' + $scope.hostName + ':8084/cgi-bin/main.cgi')
    };
    /**
     * Set access
     */
    $scope.setAccess = function (param, loader) {
        if (loader) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        }
        dataFactory.getApi('firmwareupdate', param, true).then(function (response) {
            if (loader) {
                $scope.firmwareUpdate.show = true;
                $timeout(function () {
                    $scope.loading = false;
                    $scope.firmwareUpdate.loaded = true;
                }, 5000);
            }

        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));

        });
    };
    /**
     * Load latest version
     */
    $scope.loadRazLatest = function () {
        dataFactory.getRemoteData($scope.cfg.raz_latest_version_url).then(function (response) {
            $scope.controllerInfo.softwareLatestVersion = response;
        }, function (error) {
        });
    };
    //$scope.loadRazLatest();

    /**
     * update device database
     */
    $scope.updateDeviceDatabase = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var success = [];
        var failed = [];
        var count = 0;
        dataFactory.getApi('update_device_database').then(function(response) {
            $scope.loading = false;
            if(response.data !== "" && !_.isEmpty(response.data)) {
                count = response.data.length;
                _.each(response.data, function(lang) {
                   if(lang[Object.keys(lang)[0]]) {
                       success.push(Object.keys(lang)[0]);
                   } else {
                       failed.push(Object.keys(lang)[0]);
                   }
               });

               if(failed.length == 0) {
                   // update device database successfull
                   dataService.showNotifier({message: $scope._t('success_updated')});
               } else {
                   // check if all failed
                   if(failed.length !== 0 && failed.length === count && success.length === 0) {
                       alertify.alertWarning($scope._t('update_device_database_failed'));
                   } else {
                       strSuccess = success.join(', ');
                       strFailed = failed.join(', ');
                       alertify.alertWarning($scope._t('update_device_database_failed_for', {
                           __success__: strSuccess,
                           __failed__: strFailed
                       }));
                   }
               }
            } else {
                alertify.alertError($scope._t('error_load_data')); // error update device database
            }
        }, function(error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data')); // error update device database
            alertify.dismissAll();
        });
    };
});
/**
 * The controller that handles a timezone.
 * @class ManagementTimezoneController
 */
myAppController.controller('ManagementTimezoneController', function ($scope, $timeout, dataFactory, dataService) {
    $scope.managementTimezone = {
        labels: {},
        enums: {}
    };

    /**
     * Load module detail
     */
    $scope.loadModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/ZMEOpenWRT').then(function (response) {
            $scope.loading = false;
            $scope.managementTimezone.enums = response.data.data.schema.properties.timezone.enum;
            $scope.managementTimezone.labels = response.data.data.options.fields.timezone.optionLabels;

            //console.log($scope.handleTimezone)
            //console.log($scope.managementTimezone)
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadModule();

    /**
     * Update instance
     */
    $scope.updateInstance = function (input) {
        //var input = $scope.handleTimezone.instance;
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                alertify.confirm($scope._t('timezone_alert'))
                    .setting('labels', {'ok': $scope._t('yes'),'cancel': $scope._t('lb_cancel')})
                    .set('onok', function (closeEvent) {//after clicking OK
                        $scope.systemReboot();
                    });

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        }
    };

    /**
     * System rebboot
     */
    $scope.systemReboot = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('system_rebooting')};
        dataFactory.getApi('system_reboot').then(function (response) {
        }, function (error) {
            alertify.alertError($scope._t('error_system_reboot'));
        });

    };

});
/**
 * The controller that handles restore process.
 * @class ManagementRestoreController
 */
myAppController.controller('ManagementRestoreController', function ($scope, $window, $timeout, dataFactory, dataService) {
    $scope.myFile = null;
    $scope.managementRestore = {
        confirm: false,
        alert: {message: false, status: 'is-hidden', icon: false},
        process: false
    };

    /**
     * Upload backup file
     */
    $scope.uploadFile = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('restore_wait')};
        $scope.managementRestore.alert = {message: $scope._t('restore_wait'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        var cmd = $scope.cfg.api['restore'];
        var fd = new FormData();

        fd.append('backupFile', $scope.myFile);
        //fd.append('backupFile', files[0]); 
        dataFactory.uploadApiFile(cmd, fd).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('restore_done_reload_ui')});
            $scope.managementRestore.alert = {message: $scope._t('restore_done_reload_ui'), status: 'alert-success', icon: 'fa-check'};
            $timeout(function () {
                alertify.dismissAll();
                $window.location.reload();
            }, 2000);
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('restore_backup_failed'));
            $scope.managementRestore.alert = false;
        });

    };
});
/**
 * The controller that resets the system to factory default.
 * @class ManagementFactoryController
 */
myAppController.controller('ManagementFactoryController', function ($scope, $window, $cookies, $cookieStore, dataFactory, dataService) {
    $scope.factoryDefault = {
        model: {
            overwriteBackupCfg: true,
            resetZway: true,
            useDefaultConfig: 'ttyAMA0'
        }


    };
    /**
     * Reset to factory default
     */
    $scope.resetFactoryDefault = function (message) {
//        var params = '?useDefaultConfig=' + $scope.factoryDefault.model.overwriteBackupCfg
//                + '&resetZway=' + $scope.factoryDefault.model.resetZway
//                + '&useDefaultConfig=' + $scope.factoryDefault.model.useDefaultConfig;
        var params = false;
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('returning_factory_default')};
            dataFactory.getApi('factory_default', params).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('factory_default_success')});
                angular.forEach($cookies, function (v, k) {
                    $cookieStore.remove(k);
                    //delete $cookies[k];
                });
                //dataService.setRememberMe(null);
                dataService.logOut();
                //$window.location.reload();
            }, function (error) {
                alertify.alertError($scope._t('factory_default_error'));
                $scope.loading = false;
            });
        });
    };

});
/**
 * The controller that renders and handles app store data.
 * @class ManagementAppStoreController
 */
myAppController.controller('ManagementAppStoreController', function ($scope, dataFactory, dataService) {
    $scope.appStore = {
        input: {
            token: ''
        },
        tokens: {}

    };

    /**
     * Load tokens
     */
    $scope.appStoreLoadTokens = function () {
        dataFactory.getApi('tokens', null, true).then(function (response) {
            angular.extend($scope.appStore.tokens, response.data.data.tokens);
        }, function (error) {
        });
    };
    $scope.appStoreLoadTokens();

    /**
     * Create/Update a token
     */
    $scope.appStoreAddToken = function () {
        if ($scope.appStore.input.token === '') {
            return;
        }
        dataFactory.putApiFormdata('tokens', $scope.appStore.input).then(function (response) {
            $scope.appStore.input.token = '';
            $scope.appStoreLoadTokens();
        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status === 409) {
                message = $scope._t('notunique_token') + ' - ' + $scope.appStore.input.token;
            }
            alertify.alertError(message);
        });

    };

    /**
     * Remove token from the list
     */
    $scope.appStoreRemoveToken = function (token, message) {
        alertify.confirm(message, function () {
            dataFactory.deleteApiFormdata('tokens', {token: token}).then(function (response) {
                angular.extend($scope.appStore, response.data.data);
                ;
            }, function (error) {
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
        return;
    };

    /// --- Private functions --- ///


});
/**
 * The controller that handles bug report info.
 * @class ManagementReportController
 */
myAppController.controller('ManagementReportController', function ($scope, $window, $route, cfg,dataFactory, dataService) {
    $scope.remoteAccess = false;
    $scope.input = {
        browser_agent: '',
        browser_version: '',
        browser_info: '',
        shui_version: cfg.app_version,
        zwave_vesion: '',
        controller_info: '',
        remote_id: '',
        remote_activated: 0,
        remote_support_activated: 0,
        zwave_binding: 0,
        email: null,
        content: null,
        app_name:  cfg.app_name,
        app_version: cfg.app_version,
        app_id: cfg.app_id,
        app_type: cfg.app_type,
        app_built_date: '',
        app_built_timestamp: ''
    };


    /**
     * Load Remote access data
     */
    $scope.loadRemoteAccess = function () {
        if (!$scope.elementAccess($scope.cfg.role_access.remote_access)) {
            return;
        }
        dataFactory.getApi('instances', '/RemoteAccess').then(function (response) {
            $scope.remoteAccess = response.data.data[0];
        }, function (error) {});
    };

    $scope.loadRemoteAccess();

    /**
     * Send and save report
     */
    $scope.sendReport = function (form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('sending')};
        if ($scope.ZwaveApiData) {
            input.zwave_binding = 1;
            input.zwave_vesion = $scope.ZwaveApiData.controller.data.softwareRevisionVersion.value;
            input.controller_info = JSON.stringify($scope.ZwaveApiData.controller.data);
        }
        if ($scope.builtInfo) {
            input.app_built_date = $scope.builtInfo.built;
            input.app_built_timestamp =  $scope.builtInfo.timestamp;
        }
        if (Object.keys($scope.remoteAccess).length > 0) {
            input.remote_activated = $scope.remoteAccess.params.actStatus ? 1 : 0;
            input.remote_support_activated = $scope.remoteAccess.params.sshStatus ? 1 : 0;
            input.remote_id = $scope.remoteAccess.params.userId;

        }
        input.browser_agent = $window.navigator.appCodeName;
        input.browser_version = $window.navigator.appVersion;
        input.browser_info = 'PLATFORM: ' + $window.navigator.platform + '\nUSER-AGENT: ' + $window.navigator.userAgent;
        dataFactory.postReport(input).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_send_report') + ' ' + input.email});
            $route.reload();
        }, function (error) {
            alertify.alertError($scope._t('error_send_report'));
            $scope.loading = false;
        });
    };
});
/**
 * The controller that renders postfix data.
 * @class ManagementPostfixController
 */
myAppController.controller('ManagementPostfixController', function ($scope, dataFactory, _) {
    $scope.postfix = {
        all: {}
    };
    /**
     * Load postfix data
     */
    $scope.loadPostfix = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('postfix', null, true).then(function (response) {
            if (_.isEmpty(response.data)) {
                alertify.alertWarning($scope._t('no_data'));
            }
            $scope.loading = false;
            $scope.postfix.all = response.data;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));

        });
    };
    $scope.loadPostfix();

});
/**
 * The controller that renders info data.
 * @class ManagementInfoController
 */
myAppController.controller('ManagementInfoController', function ($scope, dataFactory, dataService) {

});
/**
 * The controller that handles a backup to the cloud.
 * @class ManagementCloudBackupController
 */
myAppController.controller('ManagementCloudBackupController', function ($scope, $timeout, $q, cfg, $window, dataFactory, dataService) {
    $scope.managementCloud = {
        alert: {message: false, status: 'is-hidden', icon: false},
        show: false,
        module:[],
        instance: {},
        process: false,
        email: "",
        service_status: ""
    };
    /**
     * Load all promises
     */
    $scope.allCloudSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('instances', '/CloudBackup', true),
            dataFactory.getApi('modules', '/CloudBackup'),
            dataFactory.getApi('profiles', '/' +  $scope.user.id, true)
        ];

        $q.allSettled(promises).then(function (response) {
            $scope.loading = false;
            var instance = response[0];
            var module = response[1];
            var profile = response[2];

            var message = "";

            if(profile.value.data.data.email === '') {
                $scope.managementCloud.alert = {message: $scope._t('email_not_set'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            } else {
                $scope.managementCloud.email = profile.value.data.data.email;
            }

            // Error message
            if (instance.state === 'rejected') {
                return;
            }

            if (module.state === 'rejected') {
                return;
            }

            // Success - api data
            if (instance.state === 'fulfilled') {
                if (!instance.value.data.data[0].active) {
                    $scope.managementCloud.alert = {message: $scope._t('cloud_not_active'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                } else {
                    $scope.managementCloud.alert = false;
                }

                $scope.managementCloud.instance = instance.value.data.data[0];

                if(!$scope.managementCloud.instance.params.service_status) {
                    $scope.managementCloud.service_status = false;
                    $scope.managementCloud.alert = {message: $scope._t('service_not_available', {__service__: "CloudBackup"}), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                } else {
                    $scope.managementCloud.service_status = true;
                    $scope.managementCloud.alert = false;
                }
                $scope.managementCloud.show = true;
            }
            // Success - module
            if (module.state === 'fulfilled') {
                // Module
                $scope.managementCloud.module = module.value.data.data;
            }
        });
    };
    $scope.allCloudSettled();

    /**
     * Set scheduler type
     */
    $scope.setSchedulerType = function (type) {
        $scope.managementCloud.instance.params.scheduler = type;
    };


    /**
     * Start backup and get backup.file
     */
    $scope.downLoadBackup = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getRemoteData(cfg.server_url + cfg.api.backup).then(function(response) {
            $scope.loading = false;
            var headers = response.headers(),
                filenameRegex = /.*filename=([\'\"]?)([^\"]+)\1/,
                matches = filenameRegex.exec(headers['content-disposition']),
                file = new Blob([JSON.stringify(response.data)], {type: 'application/json'}),
                fileURL = URL.createObjectURL(file),
                a = document.createElement('a');

            a.href = fileURL;
            a.target = '_blank';
            a.download = matches[2];
            document.body.appendChild(a);
            a.click();
        }, function(error) {
            alertify.alertError($scope._t('error_backup'));
            $scope.loading = false;
        });
    };

    /**
     * Start cloud backup
     */
    $scope.manualCloudBackup = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('cloudbackup').then(function(response) {
            dataService.showNotifier({message: $scope._t('success_backup')});
            $scope.loading = false;
        }, function(error) {
            dataService.showNotifier({message: $scope._t('error_backup'), type: 'error'});
            $scope.loading = false;
        });
    };

    /**
     * Activate cloud backup
     */
    $scope.activateCloudBackup = function (input, activeStatus) {

        if(_.isEmpty(input)) {
            $scope.createInstance();
        } else {
            input.active = activeStatus;
            input.params.email = $scope.managementCloud.email;
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            if (input.id) {
                dataFactory.putApi('instances', input.id, input).then(function (response) {
                    dataService.showNotifier({message: $scope._t('success_updated')});
                    $scope.loading = false;
                    $scope.allCloudSettled();
                }, function (error) {
                    alertify.alertError($scope._t('error_update_data'));
                    alertify.dismissAll();
                    $scope.loading = false;
                });
            }
        }
    };

    /**
     * Update instance
     */
    $scope.updateInstance = function (form, input) {
        if (form.$invalid) {
            return;
        }
        input.params.email = $scope.managementCloud.email;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                dataService.showNotifier({message: $scope._t('success_updated')});
                $scope.loading = false;
                $scope.allCloudSettled();
            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                alertify.dismissAll();
                $scope.loading = false;
            });
        }
    };

    /**
     * Create instance
     */
    $scope.createInstance = function() {
        var inputData = {
            "instanceId":"0",
            "moduleId":"CloudBackup",
            "active":"true",
            "title":"CloudBackup",
            "params":{
                "email": $scope.managementCloud.email
            }
        };

        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.postApi('instances', inputData).then(function (response) {
            $scope.loading = false
            dataService.showNotifier({message: $scope._t('reloading_page')});
            $window.location.reload();
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            alertify.dismissAll();
            $scope.loading = false;
        });
    }
});

myAppController.controller('ManagementAddMobileDevice', function ($scope, $timeout, $q, cfg, $window, $location, dataFactory, dataService) {

    $scope.qrcode = $scope.user.qrcode;

});
/**
 * @overview Handles user actions.
 * @author Martin Vach
 */

/**
 * The controller that renders and handles user data.
 * @class MySettingsController
 */
myAppController.controller('MySettingsController', function($scope, $window, $cookies,$timeout,$filter,$q,cfg,dataFactory, dataService, myCache) {
    $scope.id = $scope.user.id;
    $scope.devices = {};
    $scope.input = false;
    $scope.newPassword = null;
    $scope.trustMyNetwork = true;
    $scope.lastEmail = "";


//     /**
//     * Trust my network
//     */
//    $scope.loadTrustMyNetwork = function() {
//        dataFactory.getApi('trust_my_network').then(function (response) {
//            $scope.trustMyNetwork = response.data.data.trustMyNetwork;
//                console.log($scope.trustMyNetwork)
//            }, function (error) {
//                $scope.loading = false;
//                alertify.alertError($scope._t('error_load_data'));
//
//            });
//    };

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        var promises = [
            dataFactory.getApi('profiles', '/' + $scope.id, true),
            dataFactory.getApi('devices', null, true)
        ];

        $q.allSettled(promises).then(function (response) {
            var profile = response[0];
            var devices = response[1];

            $scope.loading = false;
            // Error message
            if (profile.state === 'rejected') {
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - profile
            if (profile.state === 'fulfilled') {
                $scope.input = profile.value.data.data;
                $scope.lastEmail = profile.value.data.data.email;
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                $scope.devices = devices.value.data.data.devices;
            }
        });
    };
    $scope.allSettled();

    /**
     * Assign device to the list
     */
    $scope.assignDevice = function(assign) {
        $scope.input.hide_single_device_events.push(assign);
        return;
    };

    /**
     * Remove device from the list
     */
    $scope.removeDevice = function(deviceId) {
        var oldList = $scope.input.hide_single_device_events;
        $scope.input.hide_single_device_events = [];
        angular.forEach(oldList, function(v, k) {
            if (v != deviceId) {
                $scope.input.hide_single_device_events.push(v);
            }
        });
        return;
    };

    /**
     * Create/Update a profile
     */
    $scope.store = function(form,input) {
        if (form.$invalid) {
            return;
        }

        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }

            // Email change --> update e-mail cloudbackup if instance exist
            if($scope.lastEmail != input.email) {
                var promises = [
                    dataFactory.getApi('instances', '/CloudBackup')
                ];

                $q.allSettled(promises).then(function (response) {
                    var instance = response[0];

                    if (instance.state === 'rejected') {
                        return;
                    }

                    if (instance.state === 'fulfilled') {
                        var instanceData = instance.value.data.data[0];
                        instanceData.params.email = input.email;
                        dataFactory.putApi('instances', instanceData.id, instanceData).then(function (response) {
                            $scope.lastEmail = input.email
                        }, function (error) {
                            alertify.alertError($scope._t('error_update_data'));
                        });
                    }
                });
            }

            $scope.loading = false;
            $cookies.lang = input.lang;
            myCache.remove('profiles');
            dataService.setUser(data);
            dataService.showNotifier({message: $scope._t('success_updated')});
            $timeout(function () {
                $scope.loading = {status: 'loading-spin', icon: '--', message: $scope._t('reloading_page')};
                alertify.dismissAll();
                $window.location.reload();
            }, 2000);

        }, function(error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
            alertify.alertError(message);
            $scope.loading = false;
        });
    };

//     /**
//     * Set Trust my network
//     */
//    $scope.setTrustMyNetwork = function(trustMyNetwork) {
//       $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
//                dataFactory.putApi('trust_my_network', null, {trustMyNetwork: trustMyNetwork}).then(function (response) {
//                    $scope.loading = false;
//                   dataService.showNotifier({message: $scope._t('success_updated')});
//                }, function (error) {
//                    $scope.loading = false;
//                    alertify.alertError($scope._t('error_update_data'));
//                    return;
//                });
//    };


    /**
     * Change password
     */
    $scope.changePassword = function(form,newPassword) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            password: newPassword

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            dataService.showNotifier({message: $scope._t('success_updated')});
            dataService.goBack();

        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///
    /**
     * Load devices
     */
    function loadDevices() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.devices = response.data.data.devices;
        }, function(error) {});
    }
    ;

});

/**
 * @overview Controllers that handle the authentication of existing users, as well as forgot password.
 * @author Martin Vach
 */

/**
 * This is the Auth root controller
 * @class AuthController
 */
myAppController.controller('AuthController', function ($scope, $routeParams, $location, $cookies, $window, $q, cfg, dataFactory, dataService, _) {
    $scope.auth = {
        remoteId: null,
        firstaccess: false,
        defaultProfile: false,
        fromexpert: $routeParams.fromexpert
    };
    $scope.jamesbox = {
        first_start_up: '',
        count_of_reconnects: 0
    };

    if (dataService.getUser()) {
        $scope.auth.form = false;
        window.location = '#/dashboard';
        return;
    }
    // IF IE or Edge displays an message
    if (dataService.isIeEdge()) {
        angular.extend(cfg.route.fatalError, {
            message: cfg.route.t['ie_edge_not_supported'],
            info: cfg.route.t['ie_edge_not_supported_info']
        });
    }


    $scope.loginLang = (angular.isDefined($cookies.lang)) ? $cookies.lang : false;
    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('remote_id'),
            dataFactory.getApi('firstaccess')
        ];

        $q.allSettled(promises).then(function (response) {
            var remoteId = response[0];
            var firstAccess = response[1];
            $scope.loading = false;
            // Error message
            if (firstAccess.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
            }

            // Success - remote ID
            if (remoteId.state === 'fulfilled') {
                $scope.auth.remoteId = remoteId.value.data.data.remote_id;
            }

            // Success - first access
            if (firstAccess.state === 'fulfilled') {
                $scope.auth.firstaccess = firstAccess.value.data.data.firstaccess;
                $scope.auth.defaultProfile = firstAccess.value.data.data.defaultProfile;
            }
        });
    };
    $scope.allSettled();

    /**
     * Login language
     */
    $scope.setLoginLang = function (lang) {
        $scope.loginLang = lang;
        $cookies.lang = lang;
        $scope.loadLang(lang);
    };

    /**
     * Login with selected data from server response
     */
    $scope.processUser = function (user, rememberme) {
        if ($scope.loginLang) {
            user.lang = $scope.loginLang;
        }
        dataService.setZWAYSession(user.sid);
        dataService.setUser(user);
        //dataFactory.putApi('profiles', user.id, user).then(function (response) {}, function (error) {});
        if (rememberme) {
            dataService.setRememberMe(rememberme);
        }

        $scope.auth.form = false;
    };
    /**
     * Redirect
     */
    $scope.redirectAfterLogin = function (trust, user, password, rememberme, url) {
        var location = url || '#/dashboard';
        $scope.processUser(user, rememberme);
        if ($scope.auth.fromexpert) {
            window.location.href = $scope.cfg.expert_url;
            return;
        }
        if (cfg.app_type === 'jb' && user.role === 1) {
            getZwaveApiData(location);
        } else {
            window.location = location;
           $window.location.reload();
        }
    };

    /// --- Private functions --- ///
    /**
     * Gez zwave api data
     */
    function getZwaveApiData(location) {
        //var location = '#/dashboard';
        dataFactory.loadZwaveApiData().then(function (response) {
            var input = {
                uuid: response.controller.data.uuid.value
            };
            jamesBoxRequest(input, location);
        }, function (error) {
            window.location = location;
            $window.location.reload();
        });
    }
    ;

    /**
     * Get and update system info
     */
    function jamesBoxSystemInfo(uuid) {
        dataFactory.getApi('system_info', null, true).then(function (response) {
            var input = {
                uuid: uuid,
                first_start_up: response.data.data.first_start_up,
                count_of_reconnects: response.data.data.count_of_reconnects
            };
            dataFactory.postToRemote(cfg.api_remote['jamesbox_updateinfo'], input).then(function (response) {}, function (error) {});
        }, function (error) {});
    }
    ;

    /**
     * JamesBox request
     */
    function jamesBoxRequest(input, location) {
        //var location = '#/dashboard';
        jamesBoxSystemInfo(input.uuid);
        dataFactory.postToRemote(cfg.api_remote['jamesbox_request'], input).then(function (response) {
            if (!_.isEmpty(response.data)) {
                location = '#/boxupdate';
            }
            window.location = location;
            $window.location.reload();
        }, function (error) {
            window.location = location;
            $window.location.reload();
        });
    }
    ;


    /**
     * Redirect - with trust my network
     */
//    $scope.redirectAfterLogin = function (trust, user, password, rememberme) {
//        // Trusted
//        if (trust) {
//            $scope.processUser(user, rememberme);
//            if ($scope.auth.fromexpert) {
//                window.location.href = $scope.cfg.expert_url;
//                return;
//            }
//            window.location = '#/dashboard';
//            $window.location.reload();
//        } else {
//            dataService.unsetUser(user);
//            // find.popp.eu
//            if ($scope.cfg.app_type === 'popp') {
//               window.location = 'https://find.popp.eu/?login=' + user.login + '&password=' + password;
//            }
//            //find.z-wave.me
//            else {
//                var findInput = {
//                    act: 'login',
//                    login: $scope.auth.remoteId + '/' + user.login,
//                    pass: password
//                };
//                dataFactory.postToRemote($scope.cfg.find_zwaveme_zbox, findInput).then(function (response) {
//                    window.location = $scope.cfg.find_zwaveme_zbox + '?login=' + user.login + '&password=' + password;
//                }, function (error) {
//                    alertify.alertError($scope._t('error_load_data'));
//
//                });
//
//            }
//        }
//    };
});

/**
 * The controller that handles login process.
 * @class AuthLoginController
 */
myAppController.controller('AuthLoginController', function ($scope, $location, $window, $routeParams, $cookies,cfg,dataFactory, dataService,_) {
    $scope.input = {
        password: '',
        login: '',
        rememberme: false
    };
    /**
     * Get session (ie for users holding only a session id, or users that require no login)
     */
    $scope.getSession = function () {
        var hasCookie = ($cookies.user) ? true : false;
        dataFactory.sessionApi().then(function (response) {
            $scope.processUser(response.data.data);
            if (!hasCookie) {
                window.location = '#/dashboard';
                $window.location.reload();
            }
        });
    };

    /**
     * Login proccess
     */
    $scope.login = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.alert = {message: false};
        dataFactory.logInApi(input).then(function (response) {
            //angular.extend(cfg, {user: response.data.data});
            var rememberme = (input.rememberme ? input : null);
            var location = '#/dashboard';
            var profile = _.omit(response.data.data,'color','dashboard','hide_single_device_events','rooms','salt');
            if(response.data.data.showWelcome){
                 location = '#/dashboard/firstlogin';
                 profile = _.omit(profile, 'showWelcome');
            }
            $scope.redirectAfterLogin(true, profile, input.password, rememberme, location);
        }, function (error) {
            $scope.loading = false;
            var message = $scope._t('error_load_data');
            if (error.status == 401) {
                message = $scope._t('error_load_user');
            }
            alertify.alertError(message);
        });
    };

//    /**
//     * Login proccess
//     */
//    $scope.login = function (input) {
//        input.password = input.password;
//        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
//        $scope.alert = {message: false};
//        dataFactory.logInApi(input).then(function (response) {
//            dataFactory.getApi('trust_my_network').then(function (responseTrust) {
//                var rememberme = (input.rememberme ? input : null);
//                $scope.redirectAfterLogin(responseTrust.data.data.trustMyNetwork, response.data.data, input.password, rememberme);
//            }, function (error) {
//                $scope.loading = false;
//                alertify.alertError($scope._t('error_load_data'));
//
//            });
//
//        }, function (error) {
//            $scope.loading = false;
//            var message = $scope._t('error_load_data');
//            if (error.status == 401) {
//                message = $scope._t('error_load_user');
//            }
//             alertify.alertError(message);
//        });
//    };

    // Login from url, remember me or session

    var path = $location.path().split('/');

    if ($routeParams.login && $routeParams.password) {
        $scope.login($routeParams);
    } else if (dataService.getRememberMe() && !$scope.auth.firstaccess) {
        $scope.login(dataService.getRememberMe());
        // only ask for session forwarding if user is not logged out before or the request comes from trusted hosts
    } else if (typeof $routeParams.logout === 'undefined' ||
            !$routeParams.logout ||
            (path[1] === '' && $scope.cfg.find_hosts.indexOf($location.host()) !== -1)) {
        $scope.getSession();
    }
});

/**
 * The controller that handles first access and password update.
 * @class AuthPasswordController
 */
myAppController.controller('AuthPasswordController', function ($scope, $q, $window, cfg, dataFactory, dataService) {
    $scope.input = {
        id: 1,//$scope.auth.defaultProfile.id,
        password: '',
        passwordConfirm: '',
        email: '',
        trust_my_network: false
    };
    $scope.handleTimezone = {
        instance: {},
        show: false
    };
    $scope.managementTimezone = {
        labels: {},
        enums: {}
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('instances', '/ZMEOpenWRT'),
            dataFactory.getApi('modules', '/ZMEOpenWRT')
        ];

        $q.allSettled(promises).then(function (response) {
            var instance = response[0];
            var timezone = response[1];
            $scope.loading = false;
            // Success - instance
            if (instance.state === 'fulfilled' && instance.value.data.data[0].active === true) {
                $scope.handleTimezone.show = true;
                $scope.handleTimezone.instance = instance.value.data.data[0];
            }
            // Success - timezone
            if (timezone.state === 'fulfilled') {
                $scope.managementTimezone.enums = timezone.value.data.data.schema.properties.timezone.enum;
                $scope.managementTimezone.labels = timezone.value.data.data.options.fields.timezone.optionLabels;
            }
        });
    };
    if($scope.isInArray(['jb'],cfg.app_type)){
        $scope.allSettled();
    }

    /**
     * Change password
     */
    $scope.changePassword = function (form, input, instance) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var inputAuth = {
            id: input.id,
            password: input.password

        };
        var headers = {
            'Accept-Language': $scope.auth.defaultProfile.lang,
            'ZWAYSession': $scope.auth.defaultProfile.sid
        };
        // Update auth
        dataFactory.putApiWithHeaders('profiles_auth_update', inputAuth.id, input, headers).then(function (response) {
            $scope.loading = false;
            var profile = response.data.data;
            if (!profile) {
                alertify.alertError($scope._t('error_update_data'));
                return;
            }
            profile['email'] = input.email;
            profile['lang'] = $scope.loginLang;
            // Update profile
            dataFactory.putApiWithHeaders('profiles', input.id, profile, headers).then(function (response) {
                if (cfg.app_type === 'jb' && $scope.handleTimezone.show) {
                    $scope.updateInstance(instance);
                } else {
                    $scope.redirectAfterLogin(true, $scope.auth.defaultProfile, input.password, false, '#/dashboard/firstlogin');
                }

                // Update trust my network
                /*dataFactory.putApiWithHeaders('trust_my_network', null, {trustMyNetwork: input.trust_my_network}, headers).then(function (response) {
                 $scope.redirectAfterLogin(input.trust_my_network, $scope.auth.defaultProfile, input.password);
                 }, function (error) {
                 alertify.alertError($scope._t('error_update_data'));
                 return;
                 });*/
            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                return;
            });


        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = $scope._t('nonunique_email');
            }
            alertify.alertError(message);
            $scope.loading = false;
        });
    };

    /**
     * Update instance
     */
    $scope.updateInstance = function (input) {
        //var input = $scope.handleTimezone.instance;
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.systemReboot();
            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
            });
        }
    };

    /**
     * System rebboot
     */
    $scope.systemReboot = function () {
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('system_rebooting')};
        var fatalArray = {
                            message: $scope._t('system_rebooting'),
                            info: $scope._t('connection_refused_reboot'),
                            permanent: true,
                            hide: true
                        };
         angular.extend(cfg.route.fatalError, fatalArray);
        dataFactory.getApi('system_reboot','?firstaccess=true').then(function (response) {
//            $timeout(function () {
//                $scope.loading = false;
//                window.location = '#/?logout';
//                $window.location.reload();
//                
//            }, 10000);
        }, function (error) {
            alertify.alertError($scope._t('error_system_reboot'));
        });

    };

});

/**
 * The controller that sends an e-mail with the link to reset forgotten passwort.
 * @class PasswordForgotController
 */
myAppController.controller('PasswordForgotController', function ($scope, $location, dataFactory) {
    $scope.passwordForgot = {
        input: {email: '', token: null, resetUrl: null},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Send an email
     */
    $scope.sendEmail = function (form) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postApi('password_reset', $scope.passwordForgot.input).then(function (response) {
            $scope.passwordForgot.input.token = response.data.data.token;
            $scope.passwordForgot.input.resetUrl = $location.$$absUrl + '/reset/' + response.data.data.token;
            dataFactory.postToRemote($scope.cfg.post_password_request_url, $scope.passwordForgot.input).then(function (rdata) {
                $scope.passwordForgot.alert = {message: $scope._t('password_forgot_success'), status: 'alert-success', icon: 'fa-check'};
                $scope.loading = false;
            }, function (error) {
                alertify.alertError($scope._t('error_500'));
                $scope.loading = false;
            });
        }, function (error) {
            var langKey = (error.status === 404 ? 'email_notfound' : 'error_500');
            alertify.alertError($scope._t(langKey));
            $scope.loading = false;
        });

    };

});

/**
 * The controller that handles reset password actions.
 * @class PasswordResetController
 */
myAppController.controller('PasswordResetController', function ($scope, $routeParams, dataFactory) {
    $scope.passwordReset = {
        input: {userId: null, password: '', passwordConfirm: '', token: $routeParams.token},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    /**
     * Check a valid token
     */
    $scope.checkToken = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postApi('password_reset', $scope.passwordReset.input, '?token=' + $scope.passwordReset.input.token).then(function (response) {
            $scope.passwordReset.input.userId = response.data.data.userId;
            $scope.loading = false;
        }, function (error) {
            var message = $scope._t('error_500');
            if (error.status == 404) {
                message = $scope._t('token_notfound');
            }
            $scope.loading = false;
            $scope.passwordReset.alert = {message: message, status: 'alert-danger', icon: 'fa-warning'};
        });

    };
    $scope.checkToken();



    /**
     * Change password
     */
    $scope.changePassword = function (form) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.passwordReset.input.userId,
            password: $scope.passwordReset.input.password,
            token: $routeParams.token


        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function (response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/';
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
    };
});
/**
 * The controller that handles logout process.
 * @class LogoutController
 */
myAppController.controller('LogoutController', function ($scope, dataService, dataFactory) {
    /**
     * Logout an user
     */
    $scope.logout = function () {
        dataService.setRememberMe(null);
        dataFactory.getApi('logout').then(function (response) {
            dataService.logOut();
        });
    };
    $scope.logout();
});
/**
 * @overview Functions used to render the configuration arrays.
 * @author Unknown
 */

/**
 * Device filter for device select menu
 * @param {object} ZWaveAPIData
 * @param {string} span
 * @param {string} dev
 * @param {string} type
 * @returns {Boolean}
 */
function devices_htmlSelect_filter(ZWaveAPIData,span,dev,type) {
	// return true means to skip this node
	switch(type) {
		case 'srcnode':
			// allow everything, since events can come from any device via timed_event
			return false;

			// skip virtual, controller or broadcast as event source
			//return ( (ZWaveAPIData.devices[dev].data.isVirtual.value || dev == ZWaveAPIData.controller.data.nodeId.value || dev == 255));

		case 'dstnode':
			// skip not virtual, not controller and not broadcast as event destination
			return (!(ZWaveAPIData.devices[dev].data.isVirtual.value || dev == ZWaveAPIData.controller.data.nodeId.value || dev == 255));

		case 'device':
			return ZWaveAPIData.devices[dev].data.isVirtual.value || dev == ZWaveAPIData.controller.data.nodeId.value;

		case 'node':
			// skip non-FLiRS sleeping in list of associations/wakeup node notifications/... in CC params of type node
			return (!ZWaveAPIData.devices[dev].data.isListening.value && !ZWaveAPIData.devices[dev].data.sensor250.value && !ZWaveAPIData.devices[dev].data.sensor1000.value);

		default:
			return false;
	}
};

/**
 * Returns array with default values: first value from the enum, minimum value for range, empty string for string, first nodeId for node, default schedule for the climate_schedule
 * @param {object} ZWaveAPIData
 * @param {object} method
 * @returns {Array}
 */
function method_defaultValues(ZWaveAPIData,method) {
     
	function method_defaultValue(val) {
		if ('enumof' in val['type']) {
			if (val['type']['enumof'][0])
				return method_defaultValue(val['type']['enumof'][0]); // take first item of enumof
			else
				return null;
		}
		if ('range' in val['type'])
			return val['type']['range']['min'];
		if ('fix' in val['type'])
			return val['type']['fix']['value'];
		if ('string' in val['type'])
			return "";
		if ('node' in val['type'])
			for (var dev in ZWaveAPIData.devices) {
				if (devices_htmlSelect_filter(ZWaveAPIData,null,dev,'node')) {
					continue;
				};
				return parseInt(dev);
			};
		alert('method_defaultValue: unknown type of value');
	};

	var parameters = [];
//	method.forEach(function(val,parameter_index){
//		parameters[parameter_index] = method_defaultValue(val);
//	});
        angular.forEach(method,function(val,parameter_index){
		parameters[parameter_index] = method_defaultValue(val);
	});
       
	return parameters;
};

/**
 * Represent array with number, string and array elements in reversible way: use eval('[' + return_value + ']') to rever back to an array
 * @param {array} arr
 * @returns {String}
 */
function repr_array(arr) {
	var repr='';
	for (var indx in arr) {
		if (repr != '')
			repr += ',';
		switch (typeof(arr[indx])) {
			case 'number':
				repr += arr[indx].toString();
				break;
			case 'string':
				repr += "'" + arr[indx].replace(/'/g, "\'") + "'"; // " // just for joe to hilight syntax properly
				break;
			case 'object':
				repr += '[' + repr_array(arr[indx]) + ']';
				break;
			default:
				if (arr[indx] === null)
					repr += 'null'; // for null object
				else
					error_msg('Unknown type of parameter: ' + typeof(arr[indx]));
		}
	};

	return repr;
};

/**
 * Array unique
 * @param {array} arr
 * @returns {Array}
 */
function array_unique(arr) {
	var newArray = new Array();

	label:for (var i=0; i<arr.length;i++ ) {  
		for (var j=0; j<newArray.length;j++ )
			if (newArray[j] == arr[i]) 
				continue label;
		newArray[newArray.length] = arr[i];
	}
	return newArray;
};
/**
 * @overview Functions used to render the configuration JSON.
 * @author Unknown
 */
var _methods_specs_rendered = null;
/**
 * Get method spec
 * @param {object} ZWaveAPIData
 * @param {string} devId
 * @param {string} instId
 * @param {string} ccId
 * @param {string} method
 * @returns {getMethodSpec.methods}
 */
function getMethodSpec(ZWaveAPIData,devId, instId, ccId, method) {
	if (_methods_specs_rendered === null)
        renderAllMethodSpec(ZWaveAPIData);
	
	try {
		if (!(devId in _methods_specs_rendered))
			_methods_specs_rendered[devId] = {};
		if (!(instId in _methods_specs_rendered[devId]))
			_methods_specs_rendered[devId][instId] = {};
		if (!(ccId in _methods_specs_rendered[devId][instId]))
			 _methods_specs_rendered[devId][instId][ccId] = renderMethodSpec(parseInt(ccId, 10), ZWaveAPIData.devices[devId].instances[instId].commandClasses[ccId].data);

		var methods = _methods_specs_rendered[devId][instId][ccId];
		if (method)
			return methods[method];
		else
			return methods;
	} catch(err) {
		return null;
	}
}
/**
 * Renders all method spec
 * @param {object} ZWaveAPIData
 * @returns {undefined}
 */
function renderAllMethodSpec(ZWaveAPIData) {
	_methods_specs_rendered = {};
	
	for (var devId in ZWaveAPIData.devices) {
		_methods_specs_rendered[devId] = {};
		for (var instId in ZWaveAPIData.devices[devId].instances) {
			_methods_specs_rendered[devId][instId] = {};
			for (var ccId in ZWaveAPIData.devices[devId].instances[instId].commandClasses) {
				_methods_specs_rendered[devId][instId][ccId] = renderMethodSpec(parseInt(ccId, 10), ZWaveAPIData.devices[devId].instances[instId].commandClasses[ccId].data);
			}
		}
	}
}
/**
 * Renders method spec
 * @param {string} ccId
 * @param {object} data
 * @returns {object}
  */
function renderMethodSpec(ccId, data) {
	switch (ccId) {

		// PowerLevel
		case 0x73:
			return {
				"Get": [],
				"TestNodeGet": [],



				"TestNodeSet": [
					{
						"label": "Node ID",
						"type": {
							"range": {
								"min": 0,
								"max": 232
							}
						}
					},

					{			
						"label": "PowerLevel",
						"type": {
							"enumof": [
								{
									"label": "-9dbm ", "type":{
										"fix": 	{
											"value": 9
										}
									}
								},
								{
									"label": "-8dbm ", "type":{
										"fix": 	{
											"value": 8
										}
									}
								},
								{
									"label": "-7dbm ", "type":{
										"fix": 	{
											"value": 7
										}
									}
								},
								{
									"label": "-6dbm ", "type":{
										"fix": 	{
											"value": 6
										}
									}
								},
								{
									"label": "-5dbm ", "type":{
										"fix": 	{
											"value": 5
										}
									}
								},
								{
									"label": "-4dbm ", "type":{
										"fix": 	{
											"value": 4
										}
									}
								},
								{
									"label": "-3dbm ", "type":{
										"fix": 	{
											"value": 3
										}
									}
								},
								{
									"label": "-2dbm ", "type":{
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "-1dbm ", "type":{
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Normal ", "type":{
										"fix": 	{
											"value": 0
										}
									}
								}
							]
						}				
					},
					{				
						"label": "Number of pakets",
						"type": {
							"range": {
								"min": 0,
								"max": 1000
							}
						}					
					
					}
				],


				
				"Set":[
					{
						"label": "PowerLevel",
						"type": {
							"enumof": [
								{
									"label": "-9dbm ", "type":{
										"fix": 	{
											"value": 9
										}
									}
								},
								{
									"label": "-8dbm ", "type":{
										"fix": 	{
											"value": 8
										}
									}
								},
								{
									"label": "-7dbm ", "type":{
										"fix": 	{
											"value": 7
										}
									}
								},
								{
									"label": "-6dbm ", "type":{
										"fix": 	{
											"value": 6
										}
									}
								},
								{
									"label": "-5dbm ", "type":{
										"fix": 	{
											"value": 5
										}
									}
								},
								{
									"label": "-4dbm ", "type":{
										"fix": 	{
											"value": 4
										}
									}
								},
								{
									"label": "-3dbm ", "type":{
										"fix": 	{
											"value": 3
										}
									}
								},
								{
									"label": "-2dbm ", "type":{
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "-1dbm ", "type":{
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Normal ", "type":{
										"fix": 	{
											"value": 0
										}
									}
								}
							]
						}
					},
					{
						"label": "Timeout (s)",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				]
			};


	
		//SwitchColor
		case 0x33:
			return {
				"Get": [
				       {
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				],
				"Set": [
				       {
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Value",
						"type": {
							"range": {
								"min": 	0,
								"max": 	255
							}
						}
					}
				],
				"StartStateChange": [
					{
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},													
				],
				"StopStateChange": [
					{
						"label": "Color Capability",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].capabilityString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}								
				]
			};
 

		// Schedule (incomplete)
		case 0x53:
			return {
				"Get": [
					{
						"label": "Id",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};
		
		// AssociationGroupInformation
		case 0x59:
			return {
 
				"GetName": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"GetInfo": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"GetCommands": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};

		// ZWavePlusInfo
		case 0x5e:
			return {
				"Get": []
			};
		
		case 0x85:
			return {
				"GroupingsGet": [],
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					}
				],
				"Remove": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};
	
		// Version
		case 0x86:
			return {
				/*
				Version is not publically exported in Z-Way.C

				"CommandClassVersionGet": [
					{
						"label":"CommandClass",
						"type":	{
							"range":	{
								"min":	0x0001,
								"max":	0xFFFF
							}
						}
					}
				]
				*/
			};

		// UserCode
		case 0x63:
			return {
				"Get": [
					{
						"label": "User",
						"type":	{
							"range": {
								"min": 	0,
								"max": 	99
							}
						}
					}
				],
				"Set": [
					{
						"label": "User",
						"type": {
							"enumof": [
								{
									"label": "All usercodes",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Id",
									"type": {
										"range": {
											"min": 	1,
											"max": 	99
										}
									}
								}
							]
						}
					},
					{
						"label": "Code (4...10 Digits)",
						"type": {
							"string": {
							}
						}
					},
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Not Set",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Set",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Reserved",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								}
							]
						}
					}
				]
			};
			
		// Time Parameters
		case 0x8B:
			return {
				"Get": [],
				"Set": []
			};
			
		// Thermostat SetPoint
		case 0x43:
			return {
				"Get": [
				       {
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				],
				"Set": [
				       {
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Value",
						"type": {
							"range": {
								"min": 	0,
								"max": 	100
							}
						}
					}
				]
			};

		// Wakeup	
		case 0x84:
			return {
				"Get": [],
				"CapabilitiesGet": [],
				"Set": [
				       {
						"label": "Wakeup time, seconds",
						"type": {
							"range": {
								"min": 	(
									function() {
										try {
											if (data.version.value >= 2 && data.min.value !== null)
												return data.min.value;
										} catch(err) {}
										return 0;
									}
									)(),
								"max": 	(
									function() {
										try {
											if (data.version.value >= 2 && data.max.value !== null)
												return data.max.value;
										} catch(err) {}
										return 256 * 256 * 256 - 1;
									}
									)()
							}
						}
					},
					{
						"label": "to Node",
						"type": {
							"node": {}
						}
					}
				],
				"Sleep": []
			};

		// Time
		case 0x8A:
			return {
				"TimeGet": [],
				"DateGet": []
			};

		// ThermostatMode
		case 0x40:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				]
			};

		// ThermostatFanMode
		case 0x44:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].modeName.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				]
			};

		// ThermostatFanState
		case 0x45: 
			return {
				"Get": []
			};

		// ThermostatOperatingState
		case 0x42:
			return {
				"Get": [],
				"LoggingGet" : [
					{
						"label": "States (bitmask)",
						"type": {
							"range": {
								"min": 1,
								"max": 99
							}
						}
					}
				]
			};

		// SwitchMultilevel
		case 0x26:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Dimmer level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Full",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"StartLevelChange": [
				       {
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},
				],
				"StopLevelChange": [],
				"SetWithDuration": [
					{
						"label": "Dimmer level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Full",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
									"fix": 	{
										"value": 0
										}
									}
								},
									{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
									{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
											"shift": 127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"StartLevelChangeWithDurationV2": [
					{
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"SetMotorA": [
					{
						"label": "Status",
						"type": {
							"enumof": [
								{
									"label": "Close",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Open",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				],
				"StartLevelChangeMotorA": [
					{
						"label": "Start Move",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				],
				"StopLevelChangeMotorA": [],
				"SetMotorB": [
					{
						"label": "Blind Position",
						"type": {
							"enumof": [
								{
									"label": "Close",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Open",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								},
								]
						}
					}
				],
				"StartLevelChangeMotorB": [
					{
						"label": "Start Move",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				],
				"StopLevelChange": []
			};

		// SwtichBinary
		case 0x25:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};

		// SimpleAV
		case 0x94:
			return {
				"SetEmpty": [
					{
						"label": "Key attribute",
						"type": {
							"enumof": [
								{
									"label": "Key Down",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Key Up",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Key Alive",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								]
						}
					},
					{
						"label": "Media item",
						"type": {
							"enumof": [
								{
									"label": "No",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "ID",
									"type": {
										"range": {
											"min": 0,
											"max": 0
										}
									}
								},
								]
						}
					},
					{
						"label": "Button",
						"type": {
							"enumof": []
						}
					},
				],
				"SetFull": [
					{
						"label": "Mute",
						"type": {
							"fix": 	{
								"value": 0x0001
							}
						}
					},
					{
						"label": "Volume down",
						"type": {
							"fix": 	{
								"value": 0x0002
							}
						}
					},
					{
						"label": "Volume up",
						"type": {
							"fix": 	{
								"value": 0x0003
									}
								}
							},
							{
						"label": "Channel up",
						"type": {
							"fix": 	{
								"value": 0x0004
							}
						}
					},
					{
						"label": "Channel down",
						"type": {
							"fix": 	{
								"value": 0x0005
							}
						}
					},
					{
						"label": "0",
						"type": {
							"fix": 	{
								"value": 0x0006
							}
						}
					},
					{
						"label": "1",
						"type": {
							"fix": 	{
								"value": 0x0007
							}
						}
					},
					{
						"label": "2",
						"type": {
							"fix": 	{
								"value": 0x0008
							}
						}
					},
					{
						"label": "3",
						"type": {
							"fix": 	{
								"value": 0x0009
							}
						}
					},
					{
						"label": "4",
						"type": {
							"fix": 	{
								"value": 0x000A
							}
						}
					},
					{
						"label": "5",
						"type": {
							"fix": 	{
								"value": 0x000B
							}
						}
					},
					{
						"label": "6",
						"type": {
							"fix": 	{
								"value": 0x000C
							}
						}
					},
					{
						"label": "7",
						"type": {
							"fix": 	{
								"value": 0x000D
							}
						}
					},
					{
						"label": "8",
						"type": {
							"fix": 	{
								"value": 0x000E
							}
						}
					},
					{
						"label": "9",
						"type": {
							"fix": 	{
								"value": 0x000F
							}
						}
					},
					{
						"label": "Last channel",
						"type": {
							"fix": 	{
								"value": 0x0010
							}
						}
					},
					{
						"label": "Display",
						"type": {
							"fix": 	{
								"value": 0x0011
							}
						}
					},
					{
						"label": "Favorite channel",
						"type": {
							"fix": 	{
								"value": 0x0012
							}
						}
					},
					{
						"label": "Play",
						"type": {
							"fix": 	{
								"value": 0x0013
							}
						}
					},
					{
						"label": "Stop",
						"type": {
							"fix": 	{
								"value": 0x0014
							}
						}
					},
					{
						"label": "Pause",
						"type": {
							"fix": 	{
								"value": 0x0015
							}
						}
					},
					{
						"label": "Fast forward",
						"type": {
							"fix": 	{
								"value": 0x0016
							}
						}
					},
					{
						"label": "Rewind",
						"type": {
							"fix": 	{
								"value": 0x0017
							}
						}
					},
					{
						"label": "Instant replay",
						"type": {
							"fix": 	{
								"value": 0x0018
							}
						}
					},
					{
						"label": "Record",
						"type": {
							"fix": 	{
								"value": 0x0019
							}
						}
					},
					{
						"label": "AC3",
						"type": {
							"fix": 	{
								"value": 0x001A
							}
						}
					},
					{
						"label": "PVR menu",
						"type": {
							"fix": 	{
								"value": 0x001B
							}
						}
					},
					{
						"label": "Guide",
						"type": {
							"fix": 	{
								"value": 0x001C
							}
						}
					},
					{
						"label": "Menu",
						"type": {
							"fix": 	{
								"value": 0x001D
							}
						}
					},
					{
						"label": "Menu up",
						"type": {
							"fix": 	{
								"value": 0x001E
							}
						}
					},
					{
						"label": "Menu down",
						"type": {
							"fix": 	{
								"value": 0x001F
							}
						}
					},
					{
						"label": "Menu left",
						"type": {
							"fix": 	{
								"value": 0x0020
							}
						}
					},
					{
						"label": "Menu right",
						"type": {
							"fix": 	{
								"value": 0x0021
							}
						}
					},
					{
						"label": "Page up",
						"type": {
							"fix": 	{
								"value": 0x0022
							}
						}
					},
					{
						"label": "Page down",
						"type": {
							"fix": 	{
								"value": 0x0023
							}
						}
					},
					{
						"label": "Select",
						"type": {
							"fix": 	{
								"value": 0x0024
							}
						}
					},
					{
						"label": "Exit",
						"type": {
							"fix": 	{
								"value": 0x0025
							}
						}
					},
					{
						"label": "Input",
						"type": {
							"fix": 	{
								"value": 0x0026
							}
						}
					},
					{
						"label": "Power",
						"type": {
							"fix": 	{
								"value": 0x0027
							}
						}
					},
					{
						"label": "Enter channel",
						"type": {
							"fix": 	{
								"value": 0x0028
							}
						}
					},
					{
						"label": "10",
						"type": {
							"fix": 	{
								"value": 0x0029
							}
						}
					},
					{
						"label": "11",
						"type": {
							"fix": 	{
								"value": 0x002A
							}
						}
					},
					{
						"label": "12",
						"type": {
							"fix": 	{
								"value": 0x002B
							}
						}
					},
					{
						"label": "13",
						"type": {
							"fix": 	{
								"value": 0x002C
							}
						}
					},
					{
						"label": "14",
						"type": {
							"fix": 	{
								"value": 0x002D
							}
						}
					},
					{
						"label": "15",
						"type": {
							"fix": 	{
								"value": 0x002E
							}
						}
					},
					{
						"label": "16",
						"type": {
							"fix": 	{
								"value": 0x002F
							}
						}
					},
					{
						"label": "+10",
						"type": {
							"fix": 	{
								"value": 0x0030
							}
						}
					},
					{
						"label": "+20",
						"type": {
							"fix": 	{
								"value": 0x0031
							}
						}
					},
					{
						"label": "+100",
						"type": {
							"fix": 	{
								"value": 0x0032
							}
						}
					},
					{
						"label": "-/--",
						"type": {
							"fix": 	{
								"value": 0x0033
							}
						}
					},
					{
						"label": "3-CH",
						"type": {
							"fix": 	{
								"value": 0x0034
							}
						}
					},
					{
						"label": "3D",
						"type": {
							"fix": 	{
								"value": 0x0035
							}
						}
					},
					{
						"label": "6-CH input",
						"type": {
							"fix": 	{
								"value": 0x0036
							}
						}
					},
					{
						"label": "A",
						"type": {
							"fix": 	{
								"value": 0x0037
							}
						}
					},
					{
						"label": "Add",
						"type": {
							"fix": 	{
								"value": 0x0038
							}
						}
					},
					{
						"label": "Alarm",
						"type": {
							"fix": 	{
								"value": 0x0039
							}
						}
					},
					{
						"label": "AM",
						"type": {
							"fix": 	{
								"value": 0x003A
							}
						}
					},
					{
						"label": "Analog",
						"type": {
							"fix": 	{
								"value": 0x003B
							}
						}
					},
					{
						"label": "Angle",
						"type": {
							"fix": 	{
								"value": 0x003C
							}
						}
					},
					{
						"label": "Antenna",
						"type": {
							"fix": 	{
								"value": 0x003D
							}
						}
					},
					{
						"label": "Antenna east",
						"type": {
							"fix": 	{
								"value": 0x003E
							}
						}
					},
					{
						"label": "Antenna west",
						"type": {
							"fix": 	{
								"value": 0x003F
							}
						}
					},
					{
						"label": "Aspect",
						"type": {
							"fix": 	{
								"value": 0x0040
							}
						}
					},
					{
						"label": "Audio 1",
						"type": {
							"fix": 	{
								"value": 0x0041
							}
						}
					},
					{
						"label": "Audio 2",
						"type": {
							"fix": 	{
								"value": 0x0042
							}
						}
					},
					{
						"label": "Audio 3",
						"type": {
							"fix": 	{
								"value": 0x0043
							}
						}
					},
					{
						"label": "Audio dubbing",
						"type": {
							"fix": 	{
								"value": 0x0044
							}
						}
					},
					{
						"label": "Audio level down",
						"type": {
							"fix": 	{
								"value": 0x0045
							}
						}
					},
					{
						"label": "Audio level up",
						"type": {
							"fix": 	{
								"value": 0x0046
							}
						}
					},
					{
						"label": "Auto/Manual",
						"type": {
							"fix": 	{
								"value": 0x0047
							}
						}
					},
					{
						"label": "Aux 1",
						"type": {
							"fix": 	{
								"value": 0x0048
							}
						}
					},
					{
						"label": "Aux 2",
						"type": {
							"fix": 	{
								"value": 0x0049
							}
						}
					},
					{
						"label": "B",
						"type": {
							"fix": 	{
								"value": 0x004A
							}
						}
					},
					{
						"label": "Back",
						"type": {
							"fix": 	{
								"value": 0x004B
							}
						}
					},
					{
						"label": "Background",
						"type": {
							"fix": 	{
								"value": 0x004C
							}
						}
					},
					{
						"label": "Balance",
						"type": {
							"fix": 	{
								"value": 0x004D
							}
						}
					},
					{
						"label": "Balance left",
						"type": {
							"fix": 	{
								"value": 0x004E
							}
						}
					},
					{
						"label": "Balance right",
						"type": {
							"fix": 	{
								"value": 0x004F
							}
						}
					},
					{
						"label": "Band",
						"type": {
							"fix": 	{
								"value": 0x0050
							}
						}
					},
					{
						"label": "Bandwidth",
						"type": {
							"fix": 	{
								"value": 0x0051
							}
						}
					},
					{
						"label": "Bass",
						"type": {
							"fix": 	{
								"value": 0x0052
							}
						}
					},
					{
						"label": "Bass down",
						"type": {
							"fix": 	{
								"value": 0x0053
							}
						}
					},
					{
						"label": "Bass up",
						"type": {
							"fix": 	{
								"value": 0x0054
							}
						}
					},
					{
						"label": "Blank",
						"type": {
							"fix": 	{
								"value": 0x0055
							}
						}
					},
					{
						"label": "Breeze mode",
						"type": {
							"fix": 	{
								"value": 0x0056
							}
						}
					},
					{
						"label": "Bright",
						"type": {
							"fix": 	{
								"value": 0x0057
							}
						}
					},
					{
						"label": "Brightness",
						"type": {
							"fix": 	{
								"value": 0x0058
							}
						}
					},
					{
						"label": "Brightness down",
						"type": {
							"fix": 	{
								"value": 0x0059
							}
						}
					},
					{
						"label": "Brightness up",
						"type": {
							"fix": 	{
								"value": 0x005A
							}
						}
					},
					{
						"label": "Buy",
						"type": {
							"fix": 	{
								"value": 0x005B
							}
						}
					},
					{
						"label": "C",
						"type": {
							"fix": 	{
								"value": 0x005C
							}
						}
					},
					{
						"label": "Camera",
						"type": {
							"fix": 	{
								"value": 0x005D
							}
						}
					},
					{
						"label": "Category down",
						"type": {
							"fix": 	{
								"value": 0x005E
							}
						}
					},
					{
						"label": "Category up",
						"type": {
							"fix": 	{
								"value": 0x005F
							}
						}
					},
					{
						"label": "Center",
						"type": {
							"fix": 	{
								"value": 0x0060
							}
						}
					},
					{
						"label": "Center down",
						"type": {
							"fix": 	{
								"value": 0x0061
							}
						}
					},
					{
						"label": "Center mode",
						"type": {
							"fix": 	{
								"value": 0x0062
							}
						}
					},
					{
						"label": "Center up",
						"type": {
							"fix": 	{
								"value": 0x0063
							}
						}
					},
					{
						"label": "Channel/Program",
						"type": {
							"fix": 	{
								"value": 0x0064
							}
						}
					},
					{
						"label": "Clear",
						"type": {
							"fix": 	{
								"value": 0x0065
							}
						}
					},
					{
						"label": "Close",
						"type": {
							"fix": 	{
								"value": 0x0066
							}
						}
					},
					{
						"label": "Closed caption",
						"type": {
							"fix": 	{
								"value": 0x0067
							}
						}
					},
					{
						"label": "Cold",
						"type": {
							"fix": 	{
								"value": 0x0068
							}
						}
					},
					{
						"label": "Color",
						"type": {
							"fix": 	{
								"value": 0x0069
							}
						}
					},
					{
						"label": "Color down",
						"type": {
							"fix": 	{
								"value": 0x006A
							}
						}
					},
					{
						"label": "Color up",
						"type": {
							"fix": 	{
								"value": 0x006B
							}
						}
					},
					{
						"label": "Component 1",
						"type": {
							"fix": 	{
								"value": 0x006C
							}
						}
					},
					{
						"label": "Component 2",
						"type": {
							"fix": 	{
								"value": 0x006D
							}
						}
					},
					{
						"label": "Component 3",
						"type": {
							"fix": 	{
								"value": 0x006E
							}
						}
					},
					{
						"label": "Concert",
						"type": {
							"fix": 	{
								"value": 0x006F
							}
						}
					},
					{
						"label": "Confirm",
						"type": {
							"fix": 	{
								"value": 0x0070
							}
						}
					},
					{
						"label": "Continue",
						"type": {
							"fix": 	{
								"value": 0x0071
							}
						}
					},
					{
						"label": "Contrast",
						"type": {
							"fix": 	{
								"value": 0x0072
							}
						}
					},
					{
						"label": "Contrast down",
						"type": {
							"fix": 	{
								"value": 0x0073
							}
						}
					},
					{
						"label": "Contrast up",
						"type": {
							"fix": 	{
								"value": 0x0074
							}
						}
					},
					{
						"label": "Counter",
						"type": {
							"fix": 	{
								"value": 0x0075
							}
						}
					},
					{
						"label": "Counter reset",
						"type": {
							"fix": 	{
								"value": 0x0076
							}
						}
					},
					{
						"label": "D",
						"type": {
							"fix": 	{
								"value": 0x0077
							}
						}
					},
					{
						"label": "Day down",
						"type": {
							"fix": 	{
								"value": 0x0078
							}
						}
					},
					{
						"label": "Day up",
						"type": {
							"fix": 	{
								"value": 0x0079
							}
						}
					},
					{
						"label": "Delay",
						"type": {
							"fix": 	{
								"value": 0x007A
							}
						}
					},
					{
						"label": "Delay down",
						"type": {
							"fix": 	{
								"value": 0x007B
							}
						}
					},
					{
						"label": "Delay up",
						"type": {
							"fix": 	{
								"value": 0x007C
							}
						}
					},
					{
						"label": "Delete",
						"type": {
							"fix": 	{
								"value": 0x007D
							}
						}
					},
					{
						"label": "Delimiter",
						"type": {
							"fix": 	{
								"value": 0x007E
							}
						}
					},
					{
						"label": "Digest",
						"type": {
							"fix": 	{
								"value": 0x007F
							}
						}
					},
					{
						"label": "Digital",
						"type": {
							"fix": 	{
								"value": 0x0080
							}
						}
					},
					{
						"label": "Dim",
						"type": {
							"fix": 	{
								"value": 0x0081
							}
						}
					},
					{
						"label": "Direct",
						"type": {
							"fix": 	{
								"value": 0x0082
							}
						}
					},
					{
						"label": "Disarm",
						"type": {
							"fix": 	{
								"value": 0x0083
							}
						}
					},
					{
						"label": "Disc",
						"type": {
							"fix": 	{
								"value": 0x0084
							}
						}
					},
					{
						"label": "Disc 1",
						"type": {
							"fix": 	{
								"value": 0x0085
							}
						}
					},
					{
						"label": "Disc 2",
						"type": {
							"fix": 	{
								"value": 0x0086
							}
						}
					},
					{
						"label": "Disc 3",
						"type": {
							"fix": 	{
								"value": 0x0087
							}
						}
					},
					{
						"label": "Disc 4",
						"type": {
							"fix": 	{
								"value": 0x0088
							}
						}
					},
					{
						"label": "Disc 5",
						"type": {
							"fix": 	{
								"value": 0x0089
							}
						}
					},
					{
						"label": "Disc 6",
						"type": {
							"fix": 	{
								"value": 0x008A
							}
						}
					},
					{
						"label": "Disc down",
						"type": {
							"fix": 	{
								"value": 0x008B
							}
						}
					},
					{
						"label": "Disc up",
						"type": {
							"fix": 	{
								"value": 0x008C
							}
						}
					},
					{
						"label": "Disco",
						"type": {
							"fix": 	{
								"value": 0x008D
							}
						}
					},
					{
						"label": "Edit",
						"type": {
							"fix": 	{
								"value": 0x008E
							}
						}
					},
					{
						"label": "Effect down",
						"type": {
							"fix": 	{
								"value": 0x008F
							}
						}
					},
					{
						"label": "Effect up",
						"type": {
							"fix": 	{
								"value": 0x0090
							}
						}
					},
					{
						"label": "Eject",
						"type": {
							"fix": 	{
								"value": 0x0091
							}
						}
					},
					{
						"label": "End",
						"type": {
							"fix": 	{
								"value": 0x0092
							}
						}
					},
					{
						"label": "EQ",
						"type": {
							"fix": 	{
								"value": 0x0093
							}
						}
					},
					{
						"label": "Fader",
						"type": {
							"fix": 	{
								"value": 0x0094
							}
						}
					},
					{
						"label": "Fan",
						"type": {
							"fix": 	{
								"value": 0x0095
							}
						}
					},
					{
						"label": "Fan high",
						"type": {
							"fix": 	{
								"value": 0x0096
							}
						}
					},
					{
						"label": "Fan low",
						"type": {
							"fix": 	{
								"value": 0x0097
							}
						}
					},
					{
						"label": "Fan medium",
						"type": {
							"fix": 	{
								"value": 0x0098
							}
						}
					},
					{
						"label": "Fan speed",
						"type": {
							"fix": 	{
								"value": 0x0099
							}
						}
					},
					{
						"label": "Fastext blue",
						"type": {
							"fix": 	{
								"value": 0x009A
							}
						}
					},
					{
						"label": "Fastext green",
						"type": {
							"fix": 	{
								"value": 0x009B
							}
						}
					},
					{
						"label": "Fastext purple",
						"type": {
							"fix": 	{
								"value": 0x009C
							}
						}
					},
					{
						"label": "Fastext red",
						"type": {
							"fix": 	{
								"value": 0x009D
							}
						}
					},
					{
						"label": "Fastext white",
						"type": {
							"fix": 	{
								"value": 0x009E
							}
						}
					},
					{
						"label": "Fastext yellow",
						"type": {
							"fix": 	{
								"value": 0x009F
							}
						}
					},
					{
						"label": "Favorite channel down",
						"type": {
							"fix": 	{
								"value": 0x00A0
							}
						}
					},
					{
						"label": "Favorite channel up",
						"type": {
							"fix": 	{
								"value": 0x00A1
							}
						}
					},
					{
						"label": "Finalize",
						"type": {
							"fix": 	{
								"value": 0x00A2
							}
						}
					},
					{
						"label": "Fine tune",
						"type": {
							"fix": 	{
								"value": 0x00A3
							}
						}
					},
					{
						"label": "Flat",
						"type": {
							"fix": 	{
								"value": 0x00A4
							}
						}
					},
					{
						"label": "FM",
						"type": {
							"fix": 	{
								"value": 0x00A5
							}
						}
					},
					{
						"label": "Focus down",
						"type": {
							"fix": 	{
								"value": 0x00A6
							}
						}
					},
					{
						"label": "Focus up",
						"type": {
							"fix": 	{
								"value": 0x00A7
							}
						}
					},
					{
						"label": "Freeze",
						"type": {
							"fix": 	{
								"value": 0x00A8
							}
						}
					},
					{
						"label": "Front",
						"type": {
							"fix": 	{
								"value": 0x00A9
							}
						}
					},
					{
						"label": "Game",
						"type": {
							"fix": 	{
								"value": 0x00AA
							}
						}
					},
					{
						"label": "GoTo",
						"type": {
							"fix": 	{
								"value": 0x00AB
							}
						}
					},
					{
						"label": "Hall",
						"type": {
							"fix": 	{
								"value": 0x00AC
							}
						}
					},
					{
						"label": "Heat",
						"type": {
							"fix": 	{
								"value": 0x00AD
							}
						}
					},
					{
						"label": "Help",
						"type": {
							"fix": 	{
								"value": 0x00AE
							}
						}
					},
					{
						"label": "Home",
						"type": {
							"fix": 	{
								"value": 0x00AF
							}
						}
					},
					{
						"label": "Index",
						"type": {
							"fix": 	{
								"value": 0x00B0
							}
						}
					},
					{
						"label": "Index forward",
						"type": {
							"fix": 	{
								"value": 0x00B1
							}
						}
					},
					{
						"label": "Index reverse",
						"type": {
							"fix": 	{
								"value": 0x00B2
							}
						}
					},
					{
						"label": "Interactive",
						"type": {
							"fix": 	{
								"value": 0x00B3
							}
						}
					},
					{
						"label": "Intro scan",
						"type": {
							"fix": 	{
								"value": 0x00B4
							}
						}
					},
					{
						"label": "Jazz",
						"type": {
							"fix": 	{
								"value": 0x00B5
							}
						}
					},
					{
						"label": "Karaoke",
						"type": {
							"fix": 	{
								"value": 0x00B6
							}
						}
					},
					{
						"label": "Keystone",
						"type": {
							"fix": 	{
								"value": 0x00B7
							}
						}
					},
					{
						"label": "Keystone down",
						"type": {
							"fix": 	{
								"value": 0x00B8
							}
						}
					},
					{
						"label": "Keystone up",
						"type": {
							"fix": 	{
								"value": 0x00B9
							}
						}
					},
					{
						"label": "Language",
						"type": {
							"fix": 	{
								"value": 0x00BA
							}
						}
					},
					{
						"label": "Left click",
						"type": {
							"fix": 	{
								"value": 0x00BB
							}
						}
					},
					{
						"label": "Level",
						"type": {
							"fix": 	{
								"value": 0x00BC
							}
						}
					},
					{
						"label": "Light",
						"type": {
							"fix": 	{
								"value": 0x00BD
							}
						}
					},
					{
						"label": "List",
						"type": {
							"fix": 	{
								"value": 0x00BE
							}
						}
					},
					{
						"label": "Live TV",
						"type": {
							"fix": 	{
								"value": 0x00BF
							}
						}
					},
					{
						"label": "Local/Dx",
						"type": {
							"fix": 	{
								"value": 0x00C0
							}
						}
					},
					{
						"label": "Loudness",
						"type": {
							"fix": 	{
								"value": 0x00C1
							}
						}
					},
					{
						"label": "Mail",
						"type": {
							"fix": 	{
								"value": 0x00C2
							}
						}
					},
					{
						"label": "Mark",
						"type": {
							"fix": 	{
								"value": 0x00C3
							}
						}
					},
					{
						"label": "Memory recall",
						"type": {
							"fix": 	{
								"value": 0x00C4
							}
						}
					},
					{
						"label": "Monitor",
						"type": {
							"fix": 	{
								"value": 0x00C5
							}
						}
					},
					{
						"label": "Movie",
						"type": {
							"fix": 	{
								"value": 0x00C6
							}
						}
					},
					{
						"label": "Multi room",
						"type": {
							"fix": 	{
								"value": 0x00C7
							}
						}
					},
					{
						"label": "Music",
						"type": {
							"fix": 	{
								"value": 0x00C8
							}
						}
					},
					{
						"label": "Music scan",
						"type": {
							"fix": 	{
								"value": 0x00C9
							}
						}
					},
					{
						"label": "Natural",
						"type": {
							"fix": 	{
								"value": 0x00CA
							}
						}
					},
					{
						"label": "Night",
						"type": {
							"fix": 	{
								"value": 0x00CB
							}
						}
					},
					{
						"label": "Noise reduction",
						"type": {
							"fix": 	{
								"value": 0x00CC
							}
						}
					},
					{
						"label": "Normalize",
						"type": {
							"fix": 	{
								"value": 0x00CD
							}
						}
					},
					{
						"label": "Discrete input CableTV",
						"type": {
							"fix": 	{
								"value": 0x00CE
							}
						}
					},
					{
						"label": "Discrete input CD 1",
						"type": {
							"fix": 	{
								"value": 0x00CF
							}
						}
					},
					{
						"label": "Discrete input CD 2",
						"type": {
							"fix": 	{
								"value": 0x00D0
							}
						}
					},
					{
						"label": "Discrete input CD Recorder",
						"type": {
							"fix": 	{
								"value": 0x00D1
							}
						}
					},
					{
						"label": "Discrete input DAT (Digital Audio Tape)",
						"type": {
							"fix": 	{
								"value": 0x00D2
							}
						}
					},
					{
						"label": "Discrete input DVD",
						"type": {
							"fix": 	{
								"value": 0x00D3
							}
						}
					},
					{
						"label": "Discrete input DVI",
						"type": {
							"fix": 	{
								"value": 0x00D4
							}
						}
					},
					{
						"label": "Discrete input HDTV",
						"type": {
							"fix": 	{
								"value": 0x00D5
							}
						}
					},
					{
						"label": "Discrete input LaserDisc",
						"type": {
							"fix": 	{
								"value": 0x00D6
							}
						}
					},
					{
						"label": "Discrete input MiniDisc",
						"type": {
							"fix": 	{
								"value": 0x00D7
							}
						}
					},
					{
						"label": "Discrete input PC",
						"type": {
							"fix": 	{
								"value": 0x00D8
							}
						}
					},
					{
						"label": "Discrete input Personal Video Recorder",
						"type": {
							"fix": 	{
								"value": 0x00D9
							}
						}
					},
					{
						"label": "Discrete input TV",
						"type": {
							"fix": 	{
								"value": 0x00DA
							}
						}
					},
					{
						"label": "Discrete input TV/VCR or TV/DVD",
						"type": {
							"fix": 	{
								"value": 0x00DB
							}
						}
					},
					{
						"label": "Discrete input VCR",
						"type": {
							"fix": 	{
								"value": 0x00DC
							}
						}
					},
					{
						"label": "One touch playback",
						"type": {
							"fix": 	{
								"value": 0x00DD
							}
						}
					},
					{
						"label": "One touch record",
						"type": {
							"fix": 	{
								"value": 0x00DE
							}
						}
					},
					{
						"label": "Open",
						"type": {
							"fix": 	{
								"value": 0x00DF
							}
						}
					},
					{
						"label": "Optical",
						"type": {
							"fix": 	{
								"value": 0x00E0
							}
						}
					},
					{
						"label": "Options",
						"type": {
							"fix": 	{
								"value": 0x00E1
							}
						}
					},
					{
						"label": "Orchestra",
						"type": {
							"fix": 	{
								"value": 0x00E2
							}
						}
					},
					{
						"label": "PAL/NTSC",
						"type": {
							"fix": 	{
								"value": 0x00E3
							}
						}
					},
					{
						"label": "Parental lock",
						"type": {
							"fix": 	{
								"value": 0x00E4
							}
						}
					},
					{
						"label": "PBC",
						"type": {
							"fix": 	{
								"value": 0x00E5
							}
						}
					},
					{
						"label": "Phono",
						"type": {
							"fix": 	{
								"value": 0x00E6
							}
						}
					},
					{
						"label": "Photos",
						"type": {
							"fix": 	{
								"value": 0x00E7
							}
						}
					},
					{
						"label": "Picture menu",
						"type": {
							"fix": 	{
								"value": 0x00E8
							}
						}
					},
					{
						"label": "Picture mode",
						"type": {
							"fix": 	{
								"value": 0x00E9
							}
						}
					},
					{
						"label": "Picture mute",
						"type": {
							"fix": 	{
								"value": 0x00EA
							}
						}
					},
					{
						"label": "PIP channel down",
						"type": {
							"fix": 	{
								"value": 0x00EB
							}
						}
					},
					{
						"label": "PIP channel up",
						"type": {
							"fix": 	{
								"value": 0x00EC
							}
						}
					},
					{
						"label": "PIP freeze",
						"type": {
							"fix": 	{
								"value": 0x00ED
							}
						}
					},
					{
						"label": "PIP input",
						"type": {
							"fix": 	{
								"value": 0x00EE
							}
						}
					},
					{
						"label": "PIP move",
						"type": {
							"fix": 	{
								"value": 0x00EF
							}
						}
					},
					{
						"label": "PIP Off",
						"type": {
							"fix": 	{
								"value": 0x00F0
							}
						}
					},
					{
						"label": "PIP On",
						"type": {
							"fix": 	{
								"value": 0x00F1
							}
						}
					},
					{
						"label": "PIP size",
						"type": {
							"fix": 	{
								"value": 0x00F2
							}
						}
					},
					{
						"label": "PIP split",
						"type": {
							"fix": 	{
								"value": 0x00F3
							}
						}
					},
					{
						"label": "PIP swap",
						"type": {
							"fix": 	{
								"value": 0x00F4
							}
						}
					},
					{
						"label": "Play mode",
						"type": {
							"fix": 	{
								"value": 0x00F5
							}
						}
					},
					{
						"label": "Play reverse",
						"type": {
							"fix": 	{
								"value": 0x00F6
							}
						}
					},
					{
						"label": "Power Off",
						"type": {
							"fix": 	{
								"value": 0x00F7
							}
						}
					},
					{
						"label": "Power On",
						"type": {
							"fix": 	{
								"value": 0x00F8
							}
						}
					},
					{
						"label": "PPV (Pay per view)",
						"type": {
							"fix": 	{
								"value": 0x00F9
							}
						}
					},
					{
						"label": "Preset",
						"type": {
							"fix": 	{
								"value": 0x00FA
							}
						}
					},
					{
						"label": "Program",
						"type": {
							"fix": 	{
								"value": 0x00FB
							}
						}
					},
					{
						"label": "Progressive scan",
						"type": {
							"fix": 	{
								"value": 0x00FC
							}
						}
					},
					{
						"label": "ProLogic",
						"type": {
							"fix": 	{
								"value": 0x00FD
							}
						}
					},
					{
						"label": "PTY",
						"type": {
							"fix": 	{
								"value": 0x00FE
							}
						}
					},
					{
						"label": "Quick skip",
						"type": {
							"fix": 	{
								"value": 0x00FF
							}
						}
					},
					{
						"label": "Random",
						"type": {
							"fix": 	{
								"value": 0x0100
							}
						}
					},
					{
						"label": "RDS",
						"type": {
							"fix": 	{
								"value": 0x0101
							}
						}
					},
					{
						"label": "Rear",
						"type": {
							"fix": 	{
								"value": 0x0102
							}
						}
					},
					{
						"label": "Rear volume down",
						"type": {
							"fix": 	{
								"value": 0x0103
							}
						}
					},
					{
						"label": "Rear volume up",
						"type": {
							"fix": 	{
								"value": 0x0104
							}
						}
					},
					{
						"label": "Record mute",
						"type": {
							"fix": 	{
								"value": 0x0105
							}
						}
					},
					{
						"label": "Record pause",
						"type": {
							"fix": 	{
								"value": 0x0106
							}
						}
					},
					{
						"label": "Repeat",
						"type": {
							"fix": 	{
								"value": 0x0107
							}
						}
					},
					{
						"label": "Repeat A-B",
						"type": {
							"fix": 	{
								"value": 0x0108
							}
						}
					},
					{
						"label": "Resume",
						"type": {
							"fix": 	{
								"value": 0x0109
							}
						}
					},
					{
						"label": "RGB",
						"type": {
							"fix": 	{
								"value": 0x010A
							}
						}
					},
					{
						"label": "Right click",
						"type": {
							"fix": 	{
								"value": 0x010B
							}
						}
					},
					{
						"label": "Rock",
						"type": {
							"fix": 	{
								"value": 0x010C
							}
						}
					},
					{
						"label": "Rotate left",
						"type": {
							"fix": 	{
								"value": 0x010D
							}
						}
					},
					{
						"label": "Rotate right",
						"type": {
							"fix": 	{
								"value": 0x010E
							}
						}
					},
					{
						"label": "SAT",
						"type": {
							"fix": 	{
								"value": 0x010F
							}
						}
					},
					{
						"label": "Scan",
						"type": {
							"fix": 	{
								"value": 0x0110
							}
						}
					},
					{
						"label": "Scart",
						"type": {
							"fix": 	{
								"value": 0x0111
							}
						}
					},
					{
						"label": "Scene",
						"type": {
							"fix": 	{
								"value": 0x0112
							}
						}
					},
					{
						"label": "Scroll",
						"type": {
							"fix": 	{
								"value": 0x0113
							}
						}
					},
					{
						"label": "Services",
						"type": {
							"fix": 	{
								"value": 0x0114
							}
						}
					},
					{
						"label": "Setup menu",
						"type": {
							"fix": 	{
								"value": 0x0115
							}
						}
					},
					{
						"label": "Sharp",
						"type": {
							"fix": 	{
								"value": 0x0116
							}
						}
					},
					{
						"label": "Sharpness",
						"type": {
							"fix": 	{
								"value": 0x0117
							}
						}
					},
					{
						"label": "Sharpness down",
						"type": {
							"fix": 	{
								"value": 0x0118
							}
						}
					},
					{
						"label": "Sharpness up",
						"type": {
							"fix": 	{
								"value": 0x0119
							}
						}
					},
					{
						"label": "Side A/B",
						"type": {
							"fix": 	{
								"value": 0x011A
							}
						}
					},
					{
						"label": "Skip forward",
						"type": {
							"fix": 	{
								"value": 0x011B
							}
						}
					},
					{
						"label": "Skip reverse",
						"type": {
							"fix": 	{
								"value": 0x011C
							}
						}
					},
					{
						"label": "Sleep",
						"type": {
							"fix": 	{
								"value": 0x011D
							}
						}
					},
					{
						"label": "Slow",
						"type": {
							"fix": 	{
								"value": 0x011E
							}
						}
					},
					{
						"label": "Slow forward",
						"type": {
							"fix": 	{
								"value": 0x011F
							}
						}
					},
					{
						"label": "Slow reverse",
						"type": {
							"fix": 	{
								"value": 0x0120
							}
						}
					},
					{
						"label": "Sound menu",
						"type": {
							"fix": 	{
								"value": 0x0121
							}
						}
					},
					{
						"label": "Sound mode",
						"type": {
							"fix": 	{
								"value": 0x0122
							}
						}
					},
					{
						"label": "Speed",
						"type": {
							"fix": 	{
								"value": 0x0123
							}
						}
					},
					{
						"label": "Speed down",
						"type": {
							"fix": 	{
								"value": 0x0124
							}
						}
					},
					{
						"label": "Speed up",
						"type": {
							"fix": 	{
								"value": 0x0125
							}
						}
					},
					{
						"label": "Sports",
						"type": {
							"fix": 	{
								"value": 0x0126
							}
						}
					},
					{
						"label": "Stadium",
						"type": {
							"fix": 	{
								"value": 0x0127
							}
						}
					},
					{
						"label": "Start",
						"type": {
							"fix": 	{
								"value": 0x0128
							}
						}
					},
					{
						"label": "Start ID erase",
						"type": {
							"fix": 	{
								"value": 0x0129
							}
						}
					},
					{
						"label": "Start ID renumber",
						"type": {
							"fix": 	{
								"value": 0x012A
							}
						}
					},
					{
						"label": "Start ID write",
						"type": {
							"fix": 	{
								"value": 0x012B
							}
						}
					},
					{
						"label": "Step",
						"type": {
							"fix": 	{
								"value": 0x012C
							}
						}
					},
					{
						"label": "Stereo/Mono",
						"type": {
							"fix": 	{
								"value": 0x012D
							}
						}
					},
					{
						"label": "Still forward",
						"type": {
							"fix": 	{
								"value": 0x012E
							}
						}
					},
					{
						"label": "Still reverse",
						"type": {
							"fix": 	{
								"value": 0x012F
							}
						}
					},
					{
						"label": "Subtitle",
						"type": {
							"fix": 	{
								"value": 0x0130
							}
						}
					},
					{
						"label": "Subwoofer down",
						"type": {
							"fix": 	{
								"value": 0x0131
							}
						}
					},
					{
						"label": "Subwoofer up",
						"type": {
							"fix": 	{
								"value": 0x0132
							}
						}
					},
					{
						"label": "Super bass",
						"type": {
							"fix": 	{
								"value": 0x0133
							}
						}
					},
					{
						"label": "Surround",
						"type": {
							"fix": 	{
								"value": 0x0134
							}
						}
					},
					{
						"label": "Surround mode",
						"type": {
							"fix": 	{
								"value": 0x0135
							}
						}
					},
					{
						"label": "S-Video",
						"type": {
							"fix": 	{
								"value": 0x0136
							}
						}
					},
					{
						"label": "Sweep",
						"type": {
							"fix": 	{
								"value": 0x0137
							}
						}
					},
					{
						"label": "Synchro record",
						"type": {
							"fix": 	{
								"value": 0x0138
							}
						}
					},
					{
						"label": "Tape 1",
						"type": {
							"fix": 	{
								"value": 0x0139
							}
						}
					},
					{
						"label": "Tape 1-2",
						"type": {
							"fix": 	{
								"value": 0x013A
							}
						}
					},
					{
						"label": "Tape 2",
						"type": {
							"fix": 	{
								"value": 0x013B
							}
						}
					},
					{
						"label": "Temperature down",
						"type": {
							"fix": 	{
								"value": 0x013C
							}
						}
					},
					{
						"label": "Temperature up",
						"type": {
							"fix": 	{
								"value": 0x013D
							}
						}
					},
					{
						"label": "Test tone",
						"type": {
							"fix": 	{
								"value": 0x013E
							}
						}
					},
					{
						"label": "Text (Teletext)",
						"type": {
							"fix": 	{
								"value": 0x013F
							}
						}
					},
					{
						"label": "Text expand",
						"type": {
							"fix": 	{
								"value": 0x0140
							}
						}
					},
					{
						"label": "Text hold",
						"type": {
							"fix": 	{
								"value": 0x0141
							}
						}
					},
					{
						"label": "Text index",
						"type": {
							"fix": 	{
								"value": 0x0142
							}
						}
					},
					{
						"label": "Text mix",
						"type": {
							"fix": 	{
								"value": 0x0143
							}
						}
					},
					{
						"label": "Text off",
						"type": {
							"fix": 	{
								"value": 0x0144
							}
						}
					},
					{
						"label": "Text reveal",
						"type": {
							"fix": 	{
								"value": 0x0145
							}
						}
					},
					{
						"label": "Text subpage",
						"type": {
							"fix": 	{
								"value": 0x0146
							}
						}
					},
					{
						"label": "Text timer page",
						"type": {
							"fix": 	{
								"value": 0x0147
							}
						}
					},
					{
						"label": "Text update",
						"type": {
							"fix": 	{
								"value": 0x0148
							}
						}
					},
					{
						"label": "Theater",
						"type": {
							"fix": 	{
								"value": 0x0149
							}
						}
					},
					{
						"label": "Theme",
						"type": {
							"fix": 	{
								"value": 0x014A
							}
						}
					},
					{
						"label": "Thumbs down",
						"type": {
							"fix": 	{
								"value": 0x014B
							}
						}
					},
					{
						"label": "Thumbs up",
						"type": {
							"fix": 	{
								"value": 0x014C
							}
						}
					},
					{
						"label": "Tilt down",
						"type": {
							"fix": 	{
								"value": 0x014D
							}
						}
					},
					{
						"label": "Tilt up",
						"type": {
							"fix": 	{
								"value": 0x014E
							}
						}
					},
					{
						"label": "Time",
						"type": {
							"fix": 	{
								"value": 0x014F
							}
						}
					},
					{
						"label": "Timer",
						"type": {
							"fix": 	{
								"value": 0x0150
							}
						}
					},
					{
						"label": "Timer down",
						"type": {
							"fix": 	{
								"value": 0x0151
							}
						}
					},
					{
						"label": "Timer up",
						"type": {
							"fix": 	{
								"value": 0x0152
							}
						}
					},
					{
						"label": "Tint",
						"type": {
							"fix": 	{
								"value": 0x0153
							}
						}
					},
					{
						"label": "Tint down",
						"type": {
							"fix": 	{
								"value": 0x0154
							}
						}
					},
					{
						"label": "Tint up",
						"type": {
							"fix": 	{
								"value": 0x0155
							}
						}
					},
					{
						"label": "Title",
						"type": {
							"fix": 	{
								"value": 0x0156
							}
						}
					},
					{
						"label": "Track",
						"type": {
							"fix": 	{
								"value": 0x0157
							}
						}
					},
					{
						"label": "Tracking",
						"type": {
							"fix": 	{
								"value": 0x0158
							}
						}
					},
					{
						"label": "Tracking down",
						"type": {
							"fix": 	{
								"value": 0x0159
							}
						}
					},
					{
						"label": "Tracking up",
						"type": {
							"fix": 	{
								"value": 0x015A
							}
						}
					},
					{
						"label": "Treble",
						"type": {
							"fix": 	{
								"value": 0x015B
							}
						}
					},
					{
						"label": "Treble down",
						"type": {
							"fix": 	{
								"value": 0x015C
							}
						}
					},
					{
						"label": "Treble up",
						"type": {
							"fix": 	{
								"value": 0x015D
							}
						}
					},
					{
						"label": "Tune down",
						"type": {
							"fix": 	{
								"value": 0x015E
							}
						}
					},
					{
						"label": "Tune up",
						"type": {
							"fix": 	{
								"value": 0x015F
							}
						}
					},
					{
						"label": "Tuner",
						"type": {
							"fix": 	{
								"value": 0x0160
							}
						}
					},
					{
						"label": "VCR Plus+",
						"type": {
							"fix": 	{
								"value": 0x0161
							}
						}
					},
					{
						"label": "Video 1",
						"type": {
							"fix": 	{
								"value": 0x0162
							}
						}
					},
					{
						"label": "Video 2",
						"type": {
							"fix": 	{
								"value": 0x0163
							}
						}
					},
					{
						"label": "Video 3",
						"type": {
							"fix": 	{
								"value": 0x0164
							}
						}
					},
					{
						"label": "Video 4",
						"type": {
							"fix": 	{
								"value": 0x0165
							}
						}
					},
					{
						"label": "Video 5",
						"type": {
							"fix": 	{
								"value": 0x0166
							}
						}
					},
					{
						"label": "View",
						"type": {
							"fix": 	{
								"value": 0x0167
							}
						}
					},
					{
						"label": "Voice",
						"type": {
							"fix": 	{
								"value": 0x0168
							}
						}
					},
					{
						"label": "Zoom",
						"type": {
							"fix": 	{
								"value": 0x0169
							}
						}
					},
					{
						"label": "Zoom in",
						"type": {
							"fix": 	{
								"value": 0x016A
							}
						}
					},
					{
						"label": "Zoom out",
						"type": {
							"fix": 	{
								"value": 0x016B
							}
						}
					},
					{
						"label": "eHome",
						"type": {
							"fix": 	{
								"value": 0x016C
							}
						}
					},
					{
						"label": "Details",
						"type": {
							"fix": 	{
								"value": 0x016D
							}
						}
					},
					{
						"label": "DVD menu",
						"type": {
							"fix": 	{
								"value": 0x016E
							}
						}
					},
					{
						"label": "My TV",
						"type": {
							"fix": 	{
								"value": 0x016F
							}
						}
					},
					{
						"label": "Recorded TV",
						"type": {
							"fix": 	{
								"value": 0x0170
							}
						}
					},
					{
						"label": "My videos",
						"type": {
							"fix": 	{
								"value": 0x0171
							}
						}
					},
					{
						"label": "DVD angle",
						"type": {
							"fix": 	{
								"value": 0x0172
							}
						}
					},
					{
						"label": "DVD audio",
						"type": {
							"fix": 	{
								"value": 0x0173
							}
						}
					},
					{
						"label": "DVD subtitle",
						"type": {
							"fix": 	{
								"value": 0x0174
							}
						}
					},
					{
						"label": "Radio",
						"type": {
							"fix": 	{
								"value": 0x0175
							}
						}
					},
					{
						"label": "#",
						"type": {
							"fix": 	{
								"value": 0x0176
							}
						}
					},
					{
						"label": "*",
						"type": {
							"fix": 	{
								"value": 0x0177
							}
						}
					},
					{
						"label": "OEM 1",
						"type": {
							"fix": 	{
								"value": 0x0178
							}
						}
					},
					{
						"label": "OEM 2",
						"type": {
							"fix": 	{
								"value": 0x0179
							}
						}
					},
					{
						"label": "Info",
						"type": {
							"fix": 	{
								"value": 0x017A
							}
						}
					},
					{
						"label": "CAPS NUM",
						"type": {
							"fix": 	{
								"value": 0x017B
							}
						}
					},
					{
						"label": "TV MODE",
						"type": {
							"fix": 	{
								"value": 0x017C
							}
						}
					},
					{
						"label": "SOURCE",
						"type": {
							"fix": 	{
								"value": 0x017D
							}
						}
					},
					{
						"label": "FILEMODE",
						"type": {
							"fix": 	{
								"value": 0x017E
							}
						}
					},
					{
						"label": "Time seek",
						"type": {
							"fix": 	{
								"value": 0x017F
							}
						}
					},
					{
						"label": "Mouse enable",
						"type": {
							"fix": 	{
								"value": 0x0180
							}
						}
					},
					{
						"label": "Mouse disable",
						"type": {
							"fix": 	{
								"value": 0x0181
							}
						}
					},
					{
						"label": "VOD",
						"type": {
							"fix": 	{
								"value": 0x0182
							}
						}
					},
					{
						"label": "Thumbs Up",
						"type": {
							"fix": 	{
								"value": 0x0183
							}
						}
					},
					{
						"label": "Thumbs Down",
						"type": {
							"fix": 	{
								"value": 0x0184
							}
						}
					},
					{
						"label": "Apps",
						"type": {
							"fix": 	{
								"value": 0x0185
							}
						}
					},
					{
						"label": "Mouse toggle",
						"type": {
							"fix": 	{
								"value": 0x0186
							}
						}
					},
					{
						"label": "TV Mode",
						"type": {
							"fix": 	{
								"value": 0x0187
							}
						}
					},
					{
						"label": "DVD Mode",
						"type": {
							"fix": 	{
								"value": 0x0188
							}
						}
					},
					{
						"label": "STB Mode",
						"type": {
							"fix": 	{
								"value": 0x0189
							}
						}
					},
					{
						"label": "AUX Mode",
						"type": {
							"fix": 	{
								"value": 0x018A
							}
						}
					},
					{
						"label": "BluRay Mode",
						"type": {
							"fix": 	{
								"value": 0x018B
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018C
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018D
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018E
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x018F
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0190
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0191
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0192
							}
						}
					},
					{
						"label": "Reserved (Mode)",
						"type": {
							"fix": 	{
								"value": 0x0193
							}
						}
					},
					{
						"label": "Standby 1",
						"type": {
							"fix": 	{
								"value": 0x0194
							}
						}
					},
					{
						"label": "Standby 2",
						"type": {
							"fix": 	{
								"value": 0x0195
							}
						}
					},
					{
						"label": "Standby 3",
						"type": {
							"fix": 	{
								"value": 0x0196
							}
						}
					},
					{
						"label": "HDMI 1",
						"type": {
							"fix": 	{
								"value": 0x0197
							}
						}
					},
					{
						"label": "HDMI 2",
						"type": {
							"fix": 	{
								"value": 0x0198
							}
						}
					},
					{
						"label": "HDMI 3",
						"type": {
							"fix": 	{
								"value": 0x0199
							}
						}
					},
					{
						"label": "HDMI 4",
						"type": {
							"fix": 	{
								"value": 0x019A
							}
						}
					},
					{
						"label": "HDMI 5",
						"type": {
							"fix": 	{
								"value": 0x019B
							}
						}
					},
					{
						"label": "HDMI 6",
						"type": {
							"fix": 	{
								"value": 0x019C
							}
						}
					},
					{
						"label": "HDMI 7",
						"type": {
							"fix": 	{
								"value": 0x019D
							}
						}
					},
					{
						"label": "HDMI 8",
						"type": {
							"fix": 	{
								"value": 0x019E
							}
						}
					},
					{
						"label": "HDMI 9",
						"type": {
							"fix": 	{
								"value": 0x019F
							}
						}
					},
					{
						"label": "USB 1",
						"type": {
							"fix": 	{
								"value": 0x01A0
							}
						}
					},
					{
						"label": "USB 2",
						"type": {
							"fix": 	{
								"value": 0x01A1
							}
						}
					},
					{
						"label": "USB 3",
						"type": {
							"fix": 	{
								"value": 0x01A2
							}
						}
					},
					{
						"label": "USB 4",
						"type": {
							"fix": 	{
								"value": 0x01A3
							}
						}
					},
					{
						"label": "USB 5",
						"type": {
							"fix": 	{
								"value": 0x01A4
							}
						}
					},
					{
						"label": "ZOOM 4:3 Normal",
						"type": {
							"fix": 	{
								"value": 0x01A5
							}
						}
					},
					{
						"label": "ZOOM 4:3 Zoom",
						"type": {
							"fix": 	{
								"value": 0x01A6
							}
						}
					},
					{
						"label": "ZOOM 16:9 Normal",
						"type": {
							"fix": 	{
								"value": 0x01A7
							}
						}
					},
					{
						"label": "ZOOM 16:9 Zoom",
						"type": {
							"fix": 	{
								"value": 0x01A8
							}
						}
					},
					{
						"label": "ZOOM 16:9 Wide 1",
						"type": {
							"fix": 	{
								"value": 0x01A9
							}
						}
					},
					{
						"label": "ZOOM 16:9 Wide 2",
						"type": {
							"fix": 	{
								"value": 0x01AA
							}
						}
					},
					{
						"label": "ZOOM 16:9 Wide 3",
						"type": {
							"fix": 	{
								"value": 0x01AB
							}
						}
					},
					{
						"label": "ZOOM Cinema",
						"type": {
							"fix": 	{
								"value": 0x01AC
							}
						}
					},
					{
						"label": "ZOOM 16:9 Default",
						"type": {
							"fix": 	{
								"value": 0x01AD
							}
						}
					},
					{
						"label": "Reserved (ZOOM mode)",
						"type": {
							"fix": 	{
								"value": 0x01AE
							}
						}
					},
					{
						"label": "Reserved (ZOOM mode)",
						"type": {
							"fix": 	{
								"value": 0x01BF
							}
						}
					},
					{
						"label": "Auto Zoom",
						"type": {
							"fix": 	{
								"value": 0x01B0
							}
						}
					},
					{
						"label": "ZOOM Set as Default Zoom",
						"type": {
							"fix": 	{
								"value": 0x01B1
							}
						}
					},
					{
						"label": "Mute On",
						"type": {
							"fix": 	{
								"value": 0x01B2
							}
						}
					},
					{
						"label": "Mute Off",
						"type": {
							"fix": 	{
								"value": 0x01B3
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO OFF",
						"type": {
							"fix": 	{
								"value": 0x01B4
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO LO",
						"type": {
							"fix": 	{
								"value": 0x01B5
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO MED",
						"type": {
							"fix": 	{
								"value": 0x01B6
							}
						}
					},
					{
						"label": "AUDIO Mode AUDYSSEY AUDIO HI",
						"type": {
							"fix": 	{
								"value": 0x01B7
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01B8
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01B9
							}
						}
					},
					{
						"label": "AUDIO Mode SRS SURROUND ON",
						"type": {
							"fix": 	{
								"value": 0x01BA
							}
						}
					},
					{
						"label": "AUDIO Mode SRS SURROUND OFF",
						"type": {
							"fix": 	{
								"value": 0x01BB
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01BC
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01BD
							}
						}
					},
					{
						"label": "Reserved",
						"type": {
							"fix": 	{
								"value": 0x01BE
							}
						}
					},
					{
						"label": "Picture Mode Home",
						"type": {
							"fix": 	{
								"value": 0x01BF
							}
						}
					},
					{
						"label": "Picture Mode Retail",
						"type": {
							"fix": 	{
								"value": 0x01C0
							}
						}
					},
					{
						"label": "Picture Mode Vivid",
						"type": {
							"fix": 	{
								"value": 0x01C1
							}
						}
					},
					{
						"label": "Picture Mode Standard",
						"type": {
							"fix": 	{
								"value": 0x01C2
							}
						}
					},
					{
						"label": "Picture Mode Theater",
						"type": {
							"fix": 	{
								"value": 0x01C3
							}
						}
					},
					{
						"label": "Picture Mode Sports",
						"type": {
							"fix": 	{
								"value": 0x01C4
							}
						}
					},
					{
						"label": "Picture Mode Energy savings",
						"type": {
							"fix": 	{
								"value": 0x01C5
							}
						}
					},
					{
						"label": "Picture Mode Custom",
						"type": {
							"fix": 	{
								"value": 0x01C6
							}
						}
					},
					{
						"label": "Cool",
						"type": {
							"fix": 	{
								"value": 0x01C7
							}
						}
					},
					{
						"label": "Medium",
						"type": {
							"fix": 	{
								"value": 0x01C8
							}
						}
					},
					{
						"label": "Warm_D65",
						"type": {
							"fix": 	{
								"value": 0x01C9
							}
						}
					},
					{
						"label": "CC ON",
						"type": {
							"fix": 	{
								"value": 0x01CA
							}
						}
					},
					{
						"label": "CC OFF",
						"type": {
							"fix": 	{
								"value": 0x01CB
							}
						}
					},
					{
						"label": "Video Mute ON",
						"type": {
							"fix": 	{
								"value": 0x01CC
							}
						}
					},
					{
						"label": "Video Mute OFF",
						"type": {
							"fix": 	{
								"value": 0x01CD
							}
						}
					},
					{
						"label": "Next Event",
						"type": {
							"fix": 	{
								"value": 0x01CE
							}
						}
					},
					{
						"label": "Previous Event",
						"type": {
							"fix": 	{
								"value": 0x01CF
							}
						}
					},
					{
						"label": "CEC device list",
						"type": {
							"fix": 	{
								"value": 0x01D0
							}
						}
					},
					{
						"label": "MTS SAP",
						"type": {
							"fix": 	{
								"value": 0x01D1
							}
						}
					},
				]
			};

		// SensorMultilevel
		case 0x31:
			return {
				"Get": [],
			};

		// SensroBinary
		case 0x30:
			return {
				"Get": [],
			};

		// PowerLevel
		case 0x73:
			return {
				"Get": [],
				"TestAllNeighbours": [],
				"TestToNode": [
					{
						"label": "Node ID",
						"type": {
							"range": {
								"min": 0,
								"max": 232
							}
						}
					}
				],
				"Set":[
					{
						"label": "PowerLevel",
						"type": {
							"enumof": [
								{
									"label": "-9dbm ", "type":{
										"fix": 	{
											"value": 9
										}
									}
								},
								{
									"label": "-8dbm ", "type":{
										"fix": 	{
											"value": 8
										}
									}
								},
								{
									"label": "-7dbm ", "type":{
										"fix": 	{
											"value": 7
										}
									}
								},
								{
									"label": "-6dbm ", "type":{
										"fix": 	{
											"value": 6
										}
									}
								},
								{
									"label": "-5dbm ", "type":{
										"fix": 	{
											"value": 5
										}
									}
								},
								{
									"label": "-4dbm ", "type":{
										"fix": 	{
											"value": 4
										}
									}
								},
								{
									"label": "-3dbm ", "type":{
										"fix": 	{
											"value": 3
										}
									}
								},
								{
									"label": "-2dbm ", "type":{
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "-1dbm ", "type":{
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Normal ", "type":{
										"fix": 	{
											"value": 0
										}
									}
								}
							]
						}
					},
					{
						"label": "Timeout (s)",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				]
			};
			
		// Proprietary
		case 0x88:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Data in format [1,2,3,..,0xa,..]",
						"type": {
							"string": {
							}
						}
					}
				]
			};
		
		// MeterPulse
		case 0x35:
			return {
				"Get": []
			};
		
		// ManufacturerSpecific
		case 0x72:
			return {
				"Get": []
			};
		
		// Manufacturer Proprietary
		case 0x91:
			return {
				"Send": [
					{
						"label": "Data in format [1,2,3,..,0xa,..]",
						"type": {
							"string": {
							}
						}
					}
				]
			};

		// SwitchAll
		case 0x27:
			return {
				"SetOn": [],
				"SetOff": [],
				"Get": [],
				"Set": [
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Not in switch all group",
									"type": {
										"fix": 	{
											"value": 0x00
										}
									}
								},
								{
									"label": "In switch all off group only",
									"type": {
										"fix": 	{
											"value": 0x01
										}
									}
								},
								{
									"label": "In switch all on group only",
									"type": {
										"fix": 	{
											"value": 0x02
										}
									}
								},
								{
									"label": "In switch all on and off groups",
									"type": {
										"fix": 	{
											"value": 0xff
										}
									}
								}
							]
						}
					}
				]
			};

		// SensorConfiguration
		case 0x9e:
			return	{
				"Get": [],
				"Set": [
					{
						"label": "Trigger",
							"type": {
							"enumof": [
								{
									"label": "Current",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Default",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "Value",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								]
						}
					},
					{
						"label": "Value of Sensor",
						"type": {
							"range": {
								"min": 0,
								"max": 0xffff
							}
						}
					}
				]
			};

		// ScheduleEntryLock
		case 0x4e:
			return {
				"WeekDayScheduleGet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"YearScheduleGet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"WeekDayScheduleSet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"YearScheduleSet": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				],
				"Set": [
					{
						"label": "User",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					},
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Disable",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Enable",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				],

				"AllSet": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Disable",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Enable",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								}
							]
						}
					}
				]
			};

		// SceneActivation
		case 0x2B:
			return {
				"Set": [
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};
			
		// SceneActuatorConf
		case 0x2C:
			return {
				"Get": [
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "%",
									"type": {
										"range": {
											"min": 0,
											"max": 99
										}
									}
								},
								{
									"label": "Full",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Level used",
						"type": {
							"enumof": [
								{
									"label": "Current in device",
									"type": {
										"fix": 	{
											"value": 0,
											},
										}
									},
								{
									"label": "Defined",
									"type": {
										"fix": 	{
											"value": 1 << 7,
										}
									}
								}
							]
						}
					},
				]
			};

		// Protection
		case 0x75:
			return {
				"Get": [],
				"ExclusiveGet": [],
				"TimeoutGet": [],
				"Set": (function () {
					var ret = [
						{
							"label": "Local operations",
								"type": {
									"enumof": [
										{
											"label": "Unprotected",
											"type": {
												"fix": 	{
													"value": 0
												}
											}
										},
										{
											"label": "Protection by sequence",
											"type": {
												"fix": 	{
													"value": 1
												}
											}
										},
										{
											"label": "No operation possible",
											"type": {
												"fix": 	{
													"value": 2
												}
											}
										}
									]
								}
							},
						];

					if (data.version.value >= 2)
						ret.push({
								"label": "RF operations",
								"type": {
									"enumof": [
										{
											"label": "Unprotected",
											"type": {
												"fix": 	{
													"value": 0
												}
											}
										},
										{
											"label": "No RF Control",
											"type": {
												"fix": 	{
													"value": 1
												}
											}
										},
										{
											"label": "No RF Communication",
											"type": {
												"fix": 	{
													"value": 2
												}
											}
										}
									]
								}
							}
						);
						return ret;
				})(),
				
				"TimeoutSet": [
					 {
						"label": "Time",
						"type": {
							"enumof": [
								{
									"label": "No",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Sec",
									"type": {
										"range": {
											"min": 0,
											"max": 60
										}
									}
								},
								{
									"label": "Min",
									"type": {
										"range": {
											"min": 	2,
											"max": 191,
										"shift": 	63
										}
									}
								},
								{
									"label": "Infinite",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								},
								]
						}
					}
				],
				"ExclusivitySet": [
					{
						"label": "to node",
						"type": {
							"node": {}
						}
					}
				]
			};
			
		// SceneControllerConf
		case 0x2d:
			return {
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Scene",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "DimmingDuration",
						"type": {
							"enumof": [
								{
									"label": "immediately",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "in seconds",
									"type": {
										"range": {
											"min": 	1,
											"max": 127
										}
									}
								},
								{
									"label": "in minutes",
									"type": {
										"range": {
											"min": 	1,
											"max": 127,
										"shift": 	127
										}
									}
								},
								{
									"label": "use device default",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};
			
		// Alarm
		case 0x71:
			var ret = {
				"Get": [
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].typeString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					}
				]
			};
			
			if (data.version.value > 1) {
				ret["Set"] = [
					{
						"label": "Type",
						"type": {
							"enumof": (
									function() {
										try {
											var arr = [];
											var key;
											for (key in data) {
												var ikey = parseInt(key);
												if (!isNaN(ikey))
													arr.push({
														"label": data[ikey].typeString.value,
														"type": {
															"fix": 	{
																"value": ikey
															}
														}
													});
											};
											return arr;
										} catch(err) {}
										return [];
									}
								)()
						}
					},
					{
						"label": "Status",
						"type": {
							"enumof": [
								{
									"label": "Disable",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Enable",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				];
			}
			
			return ret;
		
		// AlarmSensor
		case 0x9c:
			return {
				"Get": []
			};
		
		// Battery
		case 0x80:
			return {
				"Get": []
			};

		// MutiChannelAssociation
		case 0x8e:
			return {
				"GroupingsGet": [],
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					},
					{
						"label": "instance",
						"type": {
							"range": {
								"min": 	1,
								"max": 127
							}
						}
					}
				],
				"Remove": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					},
					{
						"label": "instance",
						"type": {
							"range": {
								"min": 	1,
								"max": 127
							}
						}
					}
				]
			};
		
		// Meter	
		case 0x32:
			return {
				"Get": [],
				"Reset": []
			};

		// AlarmSilence
		case 0x9d:
			return {
				"Set": [
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Disable all",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Disable all Sensor Alarms",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Enable all",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "Enable all Sensor Alarms",
									"type": {
										"fix": 	{
											"value": 3
										}
									}
								}
							]
						}
					},
					{
						"label": "Duration in sec",
						"type": {
							"range": {
								"min": 0,
								"max": 256
							}
						}
					},
					{
						"label": "Alarm",
						"type": {
							"range": {
								"min": 0,
								"max": 0xffff
							}
						}
					}
				]
			};

		// BasicWindowCovering
		case 0x50:
			return {
				"Stop": [],
				"Start": [
					{
						"label": "Direction",
						"type": {
							"enumof": [
								{
									"label": "Up",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Down",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};

		// Configuration			
		case 0x70:
			return {
				"Get": [
					{
						"label": "Parameter",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Parameter",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					},
					{
						"label": "Value",
						"type": {
							"range": {
								"min": 0,
								"max": 4294967295
							}
						}
					},
					{
						"label": "Size",
						"type": {
							"enumof": [
								{
									"label": "auto detect",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "1 byte",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "2 byte",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								},
								{
									"label": "4 byte",
									"type": {
										"fix": 	{
											"value": 4
										}
									}
								}
							]
						}
					}
				],
				"SetDefault": [
					{
						"label": "Parameter",
						"type": {
							"range": {
								"min": 0,
								"max": 255
							}
						}
					}
				]
			};

		// Association
		case 0x85:
			return {
				"GroupingsGet": [],
				"Get": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				],
				"Set": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"node": {
							}
						}
					}
				],
				"Remove": [
					{
						"label": "Group",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					},
					{
						"label": "Node",
						"type": {
							"range": {
								"min": 	1,
								"max": 255
							}
						}
					}
				]
			};

		// AssociationCommandConfiguration
		case 0x9b:
			return {
				"Get": []
			};
		
		// NodeNaming
		case 0x77:
			return {
				"Get": [],
				"GetName": [],
				"GetLocation": [],
				"SetName": [
					{
						"label": "Name",
						"type": {
							"string": {
							}
						}
					}
				],
				"SetLocation": [
					{
						"label": "Location",
						"type": {
							"string": {
							}
						}
					}
				]
			};
			
		// MeterTableMonitor
		case 0x3d:
			return {
				"StatusDateGet": [
					{
						"label": "Index",
						"type": {
							"enumof": [
								{
									"label": "For all entries",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "",
									"type": {
										"range": 	{
											"min": 1,
											"max": 255
										}
									}
								}
							]
						}
					},
					{
						"label": "Start (UNIX stamp)",
						"type": {
							"range": {
								"min": 0,
								"max": 100000000
							}
						}
					},
					{
						"label": "Stop (UNIX stamp)",
						"type": {
							"range": {
								"min": 0,
								"max": 100000000
							}
						}
					}
				],
				"StatusDepthGet": [
					{
						"label": "Index",
						"type": {
							"enumof": [
								{
									"label": "Current only",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "For all entries",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								},
								{
									"label": "",
									"type": {
										"range": 	{
											"min": 1,
											"max": 255
										}
									}
								}
							]
						}
					}
				],
				"CurrentDataGet": [
					{
						"label": "Index",
						"type": {
							"enumof": [
								{
									"label": "For all supported",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "",
									"type": {
										"range": 	{
											"min": 1,
											"max": 255
										}
									}
								}
							]
						}
					}
				]
			};

		// Indicator			
		case 0x87:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Active",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};

		/*
		This UI requires special handling of form, so it is handled in a special tab in the UI
		// FirmwareUpdateMD
		case 0x7A:
			return {
				"Get": [],
				"RequestUpdate": [
					{
						"label": "Path to File",
						"type": {
							"string": {
							}
						}
					},
					{
						"label": "FirmwareId",
						"type": {
							"range": {
								"min": 0,
								"max": 65535
							}
						}
					}
				]
			};
		*/
		
		// DoorLockLogging
		case 0x4c:
			return {
				"Get": [
					{
						"label": "Record",
						"type": {
							"range": {
								"min": 0,
								"max": 99
							}
						}
					}
				]
			};

		// DoorLock
		case 0x62:
			return {
			 	"Get": [],
				"Set": [
					{
						"label": "Mode",
						"type": {
							"enumof": [
								{
									"label": "Door Unsecured",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Door Unsecured with timeout",
									"type": {
										"fix": 	{
											"value": 0x1
										}
									}
								},
								{
									"label": "Door Unsecured for inside Door Handles",
									"type": {
										"fix": 	{
											"value": 0x10
										}
									}
								},
								{
									"label": "Door Unsecured for inside Door Handles with timeout",
									"type": {
										"fix": 	{
											"value": 0x11
										}
									}
								},
								{
									"label": "Door Unsecured for outside Door Handles",
									"type": {
										"fix": 	{
											"value": 0x20
										}
									}
								},
								{
									"label": "Door Unsecured for outside Door Handles with timeout",
									"type": {
										"fix": 	{
											"value": 0x21
										}
									}
								},
								{
									"label": "Door Secured",
									"type": {
										"fix": 	{
											"value": 0xff
										}
									}
								}
							]
						}
					}
				],
				"ConfigurationGet": [],
				"ConfigurationSet": [
					{
						"label": "Timeout, minutes",
						"type": {
							"range": {
								"min": 	1,
								"max": 254
							}
						}
					},
					{
						"label": "Timeout, seconds",
						"type": {
							"range": {
								"min": 	1,
								"max": 59
							}
						}
					}
				]
			};

		// Basic
		case 0x20:
			return {
				"Get": [],
				"Set": [
					{
						"label": "Level",
						"type": {
							"enumof": [
								{
									"label": "Off",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},
								{
									"label": "Dimmer level",
									"type": {
										"range": {
											"min": 0,
											"max": 255
										}
									}
								},
								{
									"label": "Max",
									"type": {
										"fix": 	{
											"value": 99
										}
									}
								},
								{
									"label": "On",
									"type": {
										"fix": 	{
											"value": 255
										}
									}
								}
							]
						}
					}
				]
			};
			
		// ClimateControlSchedule	(incomplete Implementation, only overwrite but no schedule handling)
		case 0x46:
			return {
				"OverrideGet": [],
				"OverrideSet": [
					{
						"label": "Type",
						"type": {
							"enumof": [
								{
									"label": "No override",
									"type": {
										"fix": 	{
											"value": 0
										}
									}
								},							
								{
									"label": "Permanently",
									"type": {
										"fix": 	{
											"value": 1
										}
									}
								},
								{
									"label": "Temporary",
									"type": {
										"fix": 	{
											"value": 2
										}
									}
								}
							]
						}
					},
					
					{
						"label": "State",
						"type": {
							"enumof": [
								{
									"label": "Unused",
									"type": {
										"fix": 	{
											"value": 127
										}
									}
								},
								{
									"label": "Energy Saving",
									"type": {
										"fix": 	{
											"value": 122
										}
									}
								},							
								{
									"label": "Frost Protection",
									"type": {
										"fix": 	{
											"value": 121
										}
									}
								},
								{
									"label": "Temperature Offset in 1/10K",
									"type": {
										"range": {
											"min": -128,
											"max": 120
										}
									}
								},
							]
						}
					},
					
					
					
					
										
				]								
			};   

		default: return {};
	}
}

/*
 Copyright 2011-2013 Abdulla Abdurakhmanov
 Original sources are available at https://code.google.com/p/x2js/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

function X2JS(config) {
	'use strict';
		
	var VERSION = "1.1.5";
	
	config = config || {};
	initConfigDefaults();
	initRequiredPolyfills();
	
	function initConfigDefaults() {
		if(config.escapeMode === undefined) {
			config.escapeMode = true;
		}
		config.attributePrefix = config.attributePrefix || "_";
		config.arrayAccessForm = config.arrayAccessForm || "none";
		config.emptyNodeForm = config.emptyNodeForm || "text";
		if(config.enableToStringFunc === undefined) {
			config.enableToStringFunc = true; 
		}
		config.arrayAccessFormPaths = config.arrayAccessFormPaths || []; 
		if(config.skipEmptyTextNodesForObj === undefined) {
			config.skipEmptyTextNodesForObj = true;
		}
		if(config.stripWhitespaces === undefined) {
			config.stripWhitespaces = true;
		}
		config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];
	}

	var DOMNodeTypes = {
		ELEMENT_NODE 	   : 1,
		TEXT_NODE    	   : 3,
		CDATA_SECTION_NODE : 4,
		COMMENT_NODE	   : 8,
		DOCUMENT_NODE 	   : 9
	};
	
	function initRequiredPolyfills() {
		function pad(number) {
	      var r = String(number);
	      if ( r.length === 1 ) {
	        r = '0' + r;
	      }
	      return r;
	    }
		// Hello IE8-
		if(typeof String.prototype.trim !== 'function') {			
			String.prototype.trim = function() {
				return this.replace(/^\s+|^\n+|(\s|\n)+$/g, '');
			}
		}
		if(typeof Date.prototype.toISOString !== 'function') {
			// Implementation from http://stackoverflow.com/questions/2573521/how-do-i-output-an-iso-8601-formatted-string-in-javascript
			Date.prototype.toISOString = function() {
		      return this.getUTCFullYear()
		        + '-' + pad( this.getUTCMonth() + 1 )
		        + '-' + pad( this.getUTCDate() )
		        + 'T' + pad( this.getUTCHours() )
		        + ':' + pad( this.getUTCMinutes() )
		        + ':' + pad( this.getUTCSeconds() )
		        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
		        + 'Z';
		    };
		}
	}
	
	function getNodeLocalName( node ) {
		var nodeLocalName = node.localName;			
		if(nodeLocalName == null) // Yeah, this is IE!! 
			nodeLocalName = node.baseName;
		if(nodeLocalName == null || nodeLocalName=="") // =="" is IE too
			nodeLocalName = node.nodeName;
		return nodeLocalName;
	}
	
	function getNodePrefix(node) {
		return node.prefix;
	}
		
	function escapeXmlChars(str) {
		if(typeof(str) == "string")
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
		else
			return str;
	}

	function unescapeXmlChars(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, '\/');
	}
	
	function toArrayAccessForm(obj, childName, path) {
		switch(config.arrayAccessForm) {
		case "property":
			if(!(obj[childName] instanceof Array))
				obj[childName+"_asArray"] = [obj[childName]];
			else
				obj[childName+"_asArray"] = obj[childName];
			break;		
		/*case "none":
			break;*/
		}
		
		if(!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
			var idx = 0;
			for(; idx < config.arrayAccessFormPaths.length; idx++) {
				var arrayPath = config.arrayAccessFormPaths[idx];
				if( typeof arrayPath === "string" ) {
					if(arrayPath == path)
						break;
				}
				else
				if( arrayPath instanceof RegExp) {
					if(arrayPath.test(path))
						break;
				}				
				else
				if( typeof arrayPath === "function") {
					if(arrayPath(obj, childName, path))
						break;
				}
			}
			if(idx!=config.arrayAccessFormPaths.length) {
				obj[childName] = [obj[childName]];
			}
		}
	}
	
	function fromXmlDateTime(prop) {
		// Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
		// Improved to support full spec and optional parts
		var bits = prop.split(/[-T:+Z]/g);
		
		var d = new Date(bits[0], bits[1]-1, bits[2]);			
		var secondBits = bits[5].split("\.");
		d.setHours(bits[3], bits[4], secondBits[0]);
		if(secondBits.length>1)
			d.setMilliseconds(secondBits[1]);

		// Get supplied time zone offset in minutes
		if(bits[6] && bits[7]) {
			var offsetMinutes = bits[6] * 60 + Number(bits[7]);
			var sign = /\d\d-\d\d:\d\d$/.test(prop)? '-' : '+';

			// Apply the sign
			offsetMinutes = 0 + (sign == '-'? -1 * offsetMinutes : offsetMinutes);

			// Apply offset and local timezone
			d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset())
		}
		else
			if(prop.indexOf("Z", prop.length - 1) !== -1) {
				d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));					
			}

		// d is now a local time equivalent to the supplied time
		return d;
	}
	
	function checkFromXmlDateTimePaths(value, childName, fullPath) {
		if(config.datetimeAccessFormPaths.length > 0) {
			var path = fullPath.split("\.#")[0];
			var idx = 0;
			for(; idx < config.datetimeAccessFormPaths.length; idx++) {
				var dtPath = config.datetimeAccessFormPaths[idx];
				if( typeof dtPath === "string" ) {
					if(dtPath == path)
						break;
				}
				else
				if( dtPath instanceof RegExp) {
					if(dtPath.test(path))
						break;
				}				
				else
				if( typeof dtPath === "function") {
					if(dtPath(obj, childName, path))
						break;
				}
			}
			if(idx!=config.datetimeAccessFormPaths.length) {
				return fromXmlDateTime(value);
			}
			else
				return value;
		}
		else
			return value;
	}

	function parseDOMChildren( node, path ) {
		if(node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
			var result = new Object;
			var nodeChildren = node.childNodes;
			// Alternative for firstElementChild which is not supported in some environments
			for(var cidx=0; cidx <nodeChildren.length; cidx++) {
				var child = nodeChildren.item(cidx);
				if(child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
					var childName = getNodeLocalName(child);
					result[childName] = parseDOMChildren(child, childName);
				}
			}
			return result;
		}
		else
		if(node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
			var result = new Object;
			result.__cnt=0;
			
			var nodeChildren = node.childNodes;
			
			// Children nodes
			for(var cidx=0; cidx <nodeChildren.length; cidx++) {
				var child = nodeChildren.item(cidx); // nodeChildren[cidx];
				var childName = getNodeLocalName(child);
				
				if(child.nodeType!= DOMNodeTypes.COMMENT_NODE) {
					result.__cnt++;
					if(result[childName] == null) {
						result[childName] = parseDOMChildren(child, path+"."+childName);
						toArrayAccessForm(result, childName, path+"."+childName);					
					}
					else {
						if(result[childName] != null) {
							if( !(result[childName] instanceof Array)) {
								result[childName] = [result[childName]];
								toArrayAccessForm(result, childName, path+"."+childName);
							}
						}
						(result[childName])[result[childName].length] = parseDOMChildren(child, path+"."+childName);
					}
				}								
			}
			
			// Attributes
			for(var aidx=0; aidx <node.attributes.length; aidx++) {
				var attr = node.attributes.item(aidx); // [aidx];
				result.__cnt++;
				result[config.attributePrefix+attr.name]=attr.value;
			}
			
			// Node namespace prefix
			var nodePrefix = getNodePrefix(node);
			if(nodePrefix!=null && nodePrefix!="") {
				result.__cnt++;
				result.__prefix=nodePrefix;
			}
			
			if(result["#text"]!=null) {				
				result.__text = result["#text"];
				if(result.__text instanceof Array) {
					result.__text = result.__text.join("\n");
				}
				if(config.escapeMode)
					result.__text = unescapeXmlChars(result.__text);
				if(config.stripWhitespaces)
					result.__text = result.__text.trim();
				delete result["#text"];
				if(config.arrayAccessForm=="property")
					delete result["#text_asArray"];
				result.__text = checkFromXmlDateTimePaths(result.__text, childName, path+"."+childName);
			}
			if(result["#cdata-section"]!=null) {
				result.__cdata = result["#cdata-section"];
				delete result["#cdata-section"];
				if(config.arrayAccessForm=="property")
					delete result["#cdata-section_asArray"];
			}
			
			if( result.__cnt == 1 && result.__text!=null  ) {
				result = result.__text;
			}
			else
			if( result.__cnt == 0 && config.emptyNodeForm=="text" ) {
				result = '';
			}
			else
			if ( result.__cnt > 1 && result.__text!=null && config.skipEmptyTextNodesForObj) {
				if( (config.stripWhitespaces && result.__text=="") || (result.__text.trim()=="")) {
					delete result.__text;
				}
			}
			delete result.__cnt;			
			
			if( config.enableToStringFunc && (result.__text!=null || result.__cdata!=null )) {
				result.toString = function() {
					return (this.__text!=null? this.__text:'')+( this.__cdata!=null ? this.__cdata:'');
				};
			}
			
			return result;
		}
		else
		if(node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
			return node.nodeValue;
		}	
	}
	
	function startTag(jsonObj, element, attrList, closed) {
		var resultStr = "<"+ ( (jsonObj!=null && jsonObj.__prefix!=null)? (jsonObj.__prefix+":"):"") + element;
		if(attrList!=null) {
			for(var aidx = 0; aidx < attrList.length; aidx++) {
				var attrName = attrList[aidx];
				var attrVal = jsonObj[attrName];
				if(config.escapeMode)
					attrVal=escapeXmlChars(attrVal);
				resultStr+=" "+attrName.substr(config.attributePrefix.length)+"='"+attrVal+"'";
			}
		}
		if(!closed)
			resultStr+=">";
		else
			resultStr+="/>";
		return resultStr;
	}
	
	function endTag(jsonObj,elementName) {
		return "</"+ (jsonObj.__prefix!=null? (jsonObj.__prefix+":"):"")+elementName+">";
	}
	
	function endsWith(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	
	function jsonXmlSpecialElem ( jsonObj, jsonObjField ) {
		if((config.arrayAccessForm=="property" && endsWith(jsonObjField.toString(),("_asArray"))) 
				|| jsonObjField.toString().indexOf(config.attributePrefix)==0 
				|| jsonObjField.toString().indexOf("__")==0
				|| (jsonObj[jsonObjField] instanceof Function) )
			return true;
		else
			return false;
	}
	
	function jsonXmlElemCount ( jsonObj ) {
		var elementsCnt = 0;
		if(jsonObj instanceof Object ) {
			for( var it in jsonObj  ) {
				if(jsonXmlSpecialElem ( jsonObj, it) )
					continue;			
				elementsCnt++;
			}
		}
		return elementsCnt;
	}
	
	function parseJSONAttributes ( jsonObj ) {
		var attrList = [];
		if(jsonObj instanceof Object ) {
			for( var ait in jsonObj  ) {
				if(ait.toString().indexOf("__")== -1 && ait.toString().indexOf(config.attributePrefix)==0) {
					attrList.push(ait);
				}
			}
		}
		return attrList;
	}
	
	function parseJSONTextAttrs ( jsonTxtObj ) {
		var result ="";
		
		if(jsonTxtObj.__cdata!=null) {										
			result+="<![CDATA["+jsonTxtObj.__cdata+"]]>";					
		}
		
		if(jsonTxtObj.__text!=null) {			
			if(config.escapeMode)
				result+=escapeXmlChars(jsonTxtObj.__text);
			else
				result+=jsonTxtObj.__text;
		}
		return result;
	}
	
	function parseJSONTextObject ( jsonTxtObj ) {
		var result ="";

		if( jsonTxtObj instanceof Object ) {
			result+=parseJSONTextAttrs ( jsonTxtObj );
		}
		else
			if(jsonTxtObj!=null) {
				if(config.escapeMode)
					result+=escapeXmlChars(jsonTxtObj);
				else
					result+=jsonTxtObj;
			}
		
		return result;
	}
	
	function parseJSONArray ( jsonArrRoot, jsonArrObj, attrList ) {
		var result = ""; 
		if(jsonArrRoot.length == 0) {
			result+=startTag(jsonArrRoot, jsonArrObj, attrList, true);
		}
		else {
			for(var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
				result+=startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
				result+=parseJSONObject(jsonArrRoot[arIdx]);
				result+=endTag(jsonArrRoot[arIdx],jsonArrObj);						
			}
		}
		return result;
	}
	
	function parseJSONObject ( jsonObj ) {
		var result = "";	

		var elementsCnt = jsonXmlElemCount ( jsonObj );
		
		if(elementsCnt > 0) {
			for( var it in jsonObj ) {
				
				if(jsonXmlSpecialElem ( jsonObj, it) )
					continue;			
				
				var subObj = jsonObj[it];						
				
				var attrList = parseJSONAttributes( subObj )
				
				if(subObj == null || subObj == undefined) {
					result+=startTag(subObj, it, attrList, true);
				}
				else
				if(subObj instanceof Object) {
					
					if(subObj instanceof Array) {					
						result+=parseJSONArray( subObj, it, attrList );					
					}
					else if(subObj instanceof Date) {
						result+=startTag(subObj, it, attrList, false);
						result+=subObj.toISOString();
						result+=endTag(subObj,it);
					}
					else {
						var subObjElementsCnt = jsonXmlElemCount ( subObj );
						if(subObjElementsCnt > 0 || subObj.__text!=null || subObj.__cdata!=null) {
							result+=startTag(subObj, it, attrList, false);
							result+=parseJSONObject(subObj);
							result+=endTag(subObj,it);
						}
						else {
							result+=startTag(subObj, it, attrList, true);
						}
					}
				}
				else {
					result+=startTag(subObj, it, attrList, false);
					result+=parseJSONTextObject(subObj);
					result+=endTag(subObj,it);
				}
			}
		}
		result+=parseJSONTextObject(jsonObj);
		
		return result;
	}
	
	this.parseXmlString = function(xmlDocStr) {
		var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
		if (xmlDocStr === undefined) {
			return null;
		}
		var xmlDoc;
		if (window.DOMParser) {
			var parser=new window.DOMParser();			
			var parsererrorNS = null;
			// IE9+ now is here
			if(!isIEParser) {
				try {
					parsererrorNS = parser.parseFromString("INVALID", "text/xml").childNodes[0].namespaceURI;
				}
				catch(err) {					
					parsererrorNS = null;
				}
			}
			try {
				xmlDoc = parser.parseFromString( xmlDocStr, "text/xml" );
				if( parsererrorNS!= null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
					//throw new Error('Error parsing XML: '+xmlDocStr);
					xmlDoc = null;
				}
			}
			catch(err) {
				xmlDoc = null;
			}
		}
		else {
			// IE :(
			if(xmlDocStr.indexOf("<?")==0) {
				xmlDocStr = xmlDocStr.substr( xmlDocStr.indexOf("?>") + 2 );
			}
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async="false";
			xmlDoc.loadXML(xmlDocStr);
		}
		return xmlDoc;
	};
	
	this.asArray = function(prop) {
		if(prop instanceof Array)
			return prop;
		else
			return [prop];
	};
	
	this.toXmlDateTime = function(dt) {
		if(dt instanceof Date)
			return dt.toISOString();
		else
		if(typeof(dt) === 'number' )
			return new Date(dt).toISOString();
		else	
			return null;
	};
	
	this.asDateTime = function(prop) {
		if(typeof(prop) == "string") {
			return fromXmlDateTime(prop);
		}
		else
			return prop;
	};

	this.xml2json = function (xmlDoc) {
		return parseDOMChildren ( xmlDoc );
	};
	
	this.xml_str2json = function (xmlDocStr) {
		var xmlDoc = this.parseXmlString(xmlDocStr);
		if(xmlDoc!=null)
			return this.xml2json(xmlDoc);
		else
			return null;
	};

	this.json2xml_str = function (jsonObj) {
		return parseJSONObject ( jsonObj );
	};

	this.json2xml = function (jsonObj) {
		var xmlDocStr = this.json2xml_str (jsonObj);
		return this.parseXmlString(xmlDocStr);
	};
	
	this.getVersion = function () {
		return VERSION;
	};
	
}

/**
 * @overview Angular directives that are used in device hardware configuration view.
 * @author Martin Vach
 */

/**
 * Renders configuration form inputs
 * @class expertCommandInput
 */
myApp.directive('expertCommandInput', function($filter) {
    /**
     * Renders text input
     * @param {text} label
     * @param {mixed} value
     * @param {int} min
     * @param {int} max
     * @param {string} name
     * @returns {String}
     */
    function getText(label, value, min, max, name) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label> ';
        input += '<input class="form-control" name="' + inName + '" type="text" class="form-control" value="' + value + '" title=" min: ' + min + ', max: ' + max + '" />';
        return input;
    }
    /**
     * Renders node select input 
     * @param {string} label
     * @param {object} devices
     * @param {string} currValue
     * @param {string} name
     * @returns {String}
     */
    function getNode(label, devices, currValue, name) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        
        input += '<label class="label-node">' + label + '</label> ';
        input += '<select name="select_' + inName + '" class="form-control">';
        input += '<option value="1">Z-Way</option>';
        angular.forEach(devices, function(v, k) {
            var selected = (v.id == currValue ? ' selected' : '');
            input += '<option value="' + v.id + '"' + selected + '>' + v.name + '</option>';
        });

        input += '</select>';

        return input;
    }

    /**
     * Renders enumerators
     * @param {string} label
     * @param {object} enums
     * @param {int} defaultValue
     * @param {string} name
     * @param {boolean} hideRadio
     * @param {int} currValue
     * @returns {undefined|String}
     */
    function getEnum(label, enums, defaultValue, name, hideRadio,currValue) {
        
        var input = '';
        if (!enums) {
            return;
        }
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label><br />';
        var cnt = 1;
        var value = (currValue !== undefined ? currValue : defaultValue);
        angular.forEach(enums.enumof, function(v, k) {
            var title = v.label;
            var type = v.type;
            var enumVal =  $filter('hasNode')(v, 'type.fix.value');
            var checked = (cnt == 1 ? ' checked="checked"' : '');
            var isCurrent = (cnt == 1 ? ' commads-is-current' : '');

            if ('fix' in type) {
                if (defaultValue) {
                    if (isNaN(parseInt(defaultValue, 10))) {
                        isCurrent = (v.label == defaultValue ? ' commads-is-current' : '');
                    } else {
                         isCurrent = '';
                    }
                }
                
                if (!isNaN(parseInt(value, 10))) {
                    checked = (enumVal == value ? ' checked="checked"' : '');
                }
                input += '<input name="radio_' + inName + '" class="commands-data-chbx" type="radio" value="' + type.fix.value + '"' + checked + ' /> <span class="commands-label' + isCurrent + '">' + title + '</span><br />';
            } else if ('range' in type) {
                var min = type.range.min;
                var max = type.range.max;
                var disabled = ' disabled="true"';
                var setVal = (value ? value : min);
                if (defaultValue) {
                    if (defaultValue >= min && defaultValue <= max) {
                        disabled = '';
                        isCurrent = ' commads-is-current';
                    }

                } else {
                    isCurrent = '';
                }
                if (value) {
                    if (value >= min && value <= max) {
                        checked = ' checked="checked"';
                        disabled = '';
                    }

                } else {
                    checked = '';
                }
                
                if (hideRadio) {
                    disabled = '';
                }

//                input += '<input name="radio_' + inName + '" class="commands-data-chbx" type="radio" value=""' + checked + ' /> ' + title + ' <input type="text" name="radio_' + inName + '_txt" class="form-control commands-data-txt-chbx" value="' + min + '" title=" min: ' + min + ', max: ' + max + '"'+ disabled + ' /><br />'; 
                if (!hideRadio) {
                    input += '<div><input name="radio_' + inName + '" class="commands-data-chbx" type="radio" value=""' + checked + ' /> <span class="commands-label' + isCurrent + '">' + title + '</span> <input type="text" name="radio_txt_' + inName + '" class="form-control commands-data-txt-chbx" value="' + setVal + '" title=" min: ' + min + ', max: ' + max + '"' + disabled + ' /></div>';
                } else {
                    input += '<input type="text" name="radio_txt_' + inName + '" class="form-control" value="' + setVal + '" title=" min: ' + min + ', max: ' + max + '" /><br />';
                }


            } else {
                input = '';
            }
            cnt++;

        });
        return input;
    }

    /**
     * Renders dropdown list
     * @param {string} label
     * @param {object} enums
     * @param {string} defaultValue
     * @param {string} name
     * @param {string} currValue
     * @returns {String}
     */
    function getDropdown(label, enums, defaultValue, name,currValue) {
        var input = '';
        var cValue = (currValue !== undefined ? currValue : defaultValue);
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label><br />';
        input += '<select name="select_' + inName + '" class="form-control">';
        var cnt = 1;
        angular.forEach(enums.enumof, function(v, k) {
            var title = v.label;
            var type = v.type;
            var value;
            if ('fix' in type) {
                value = type.fix.value;
            } else if ('range' in type) {
                value = type.range.min;
            }

            if (value) {
                var selected = (type.fix.value == cValue ? ' selected' : '');
            }
            input += '<option value="' + value + '"' + selected + '> ' + title + '</option>';
            cnt++;

        });
        input += '</select">';
        return input;
    }

    /**
     * Renders constant select
     * @param {string} label
     * @param {string} type
     * @param {string} defaultValue
     * @param {string} name
     * @param {string} currValue
     * @returns {String}
     */
    function getConstant(label, type, defaultValue, name,currValue) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label><br />';
        if (type.constant.length > 0) {
            input += '<select name="select_' + inName + '" class="form-control">';
            angular.forEach(type.constant, function(v, k) {

                input += '<option value="' + v.type.constant.value + '"> ' + v.label + '</option>';
            });


            input += '</select">';
        }
        //console.log(type,defaultValue);
        input += '<em>Constant type</em>';
        return input;
    }
    /**
     * Renders string input
     * @param {string} label
     * @param {string} value
     * @param {string} name
     * @returns {String}
     */
    function getString(label, value, name) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label> ';
        input += '<input class="form-control" name="' + inName + '" type="text" class="form-control" value="' + value + '" />';
        return input;
    }
    
    /**
     * Renders bitset input
     * @returns {String}
     */
    function getBitset() {
        
        var input = '';
        
        return input;
    }

    /**
     * Renders default label
     * @param {string} label
     * @returns {String}
     */
    function getDefault(label) {

        var input = '';
        input += '<label>' + label + '</label><br />';
        return input;
    }

    return {
        restrict: "E",
        replace: true,
        template: '<div class="form-group" ng-bind-html="input | toTrusted"></div>',
        scope: {
            collection: '=',
            devices: '=',
            getNodeDevices: '=',
            values: '=',
            isDropdown: '=',
            defaultValue: '=',
            showDefaultValue: '=',
            currValue: '=',
            currNodeValue: '=',
            name: '=',
            divId: '='
        },
        link: function(scope, element, attrs) {

            var input = '';
            if (!scope.collection) {
                return;
            }
            var label = scope.collection.label;
            var type = scope.collection.type;
            var name = (scope.collection.name || scope.name);
            var hideRadio = scope.collection.hideRadio;
            if (scope.isDropdown) {
                input = getDropdown(label, type, scope.defaultValue, name,scope.currValue);
                scope.input = input;
                return;
            }
            //if (label && type) {
            if (type) {
                if ('range' in type) {
                    input = getText(label, scope.values, type.range.min, type.range.max, name);
                } else if ('node' in type) {
                    input = getNode(label, scope.getNodeDevices(), scope.currNodeValue, name);
                } else if ('enumof' in type) {
                    input = getEnum(label, type, scope.defaultValue, name, hideRadio,scope.currValue);
                } else if ('bitset' in type) {
                    input = getBitset(label, type, scope.defaultValue, name, hideRadio,scope.currValue);
                } else if ('constant' in type) {
                    input = getConstant(label, type, scope.defaultValue, name,scope.currValue);
                } else if ('string' in type) {
                    input = getString(label, scope.values, name,scope.currValue);
                } else {
                    input = getDefault(label);
                }
                scope.input = input;
                return;
            }

        }

    };
});
/**
 * Renders configuration default value
 * @class configDefaultValue
 */
myApp.directive('configDefaultValue', function() {
    return {
        restrict: "E",
        replace: true,
        template: '<span class="default-value-format"> {{input}}</span>',
        scope: {
            collection: '=',
            defaultValue: '=',
            showDefaultValue: '='
        },
        link: function(scope, element, attrs) {
            scope.input = scope.showDefaultValue;
            var input = '';
            if (!scope.collection) {
                return;
            }
            var label = scope.collection.label;
            var type = scope.collection.type;
            var name = scope.collection.name;
            var hideRadio = scope.collection.hideRadio;
            
            if (type) {
                if ('range' in type) {
                    //input = getText(label, scope.values, type.range.min, type.range.max, name);
                } else if ('node' in type) {
                    //input = getNode(label, scope.getNodeDevices(), 'null', name);
                } else if ('enumof' in type) {
                    input = getEnum(type, scope.defaultValue,scope.showDefaultValue);
                   
                } else if ('constant' in type) {
                    //input = getConstant(label, type, scope.defaultValue, name);
                } else if ('string' in type) {
                    //input = getString(label, scope.values, name);
                } else {
                    input = scope.showDefaultValue;
                }
                scope.input = input;
                
                return;
            }


        }

    };

    /**
     * Renders enumerators
     * @param {object} enums
     * @param {string} defaultValue
     * @param {string} showDefaultValue
     * @returns {string}
     */
    function getEnum(enums, defaultValue,showDefaultValue) {
        //console.log(enums)
        var input = showDefaultValue;
        if (!enums) {
            return;
        }
        angular.forEach(enums.enumof, function(v, k) {
          
            var title = v.label ? v.label : showDefaultValue;
            var type = v.type;
             // debugger; 
            if ('fix' in type) {
                if (type.fix.value == showDefaultValue) {
                    input = title;
                    return;
                }
 
            } else if ('range' in type) {
                var min = type.range.min;
                var max = type.range.max;
                var setVal = (defaultValue ? defaultValue : min);
                if (setVal == showDefaultValue) {
                    input = showDefaultValue;
                    return;
                }
            }

        });
        
        return input;
    }
});
/**
 * Renders configuration title input
 * @class configValueTitle
 */
myApp.directive('configValueTitle', function() {
    return {
        restrict: "A",
        //replace: true,
        template: '<span title="{{showValue}}">{{input}}</span>',
        scope: {
            collection: '=',
            showValue: '='
        },
        link: function(scope, element, attrs) {
            scope.input = scope.showValue;
            var input = '';
            if (!scope.collection) {
                return;
            }
            var type = scope.collection.type;
            
            if (type) {
                if ('range' in type) {
                    //input = getText(label, scope.values, type.range.min, type.range.max, name);
                } else if ('node' in type) {
                    //input = getNode(label, scope.getNodeDevices(), 'null', name);
                } else if ('enumof' in type) {
                    input = getEnum(type, scope.showValue);
                   
                } else if ('constant' in type) {
                    //input = getConstant(label, type, scope.defaultValue, name);
                } else if ('string' in type) {
                    //input = getString(label, scope.values, name);
                } else {
                    input = scope.showValue;
                }
                scope.input = input;
                
                return;
            }


        }

    };

    /**
     * Renders enumerators
     * @param {object} enums
     * @param {string} showValue
     * @returns {string}
     */
    function getEnum(enums, showValue) {
        //console.log(enums)
        var input = showValue;
        if (!enums) {
            return;
        }
        angular.forEach(enums.enumof, function(v, k) {
          
            var title = v.label ? v.label : showValue;
            var type = v.type;
             // debugger; 
            if ('fix' in type) {
                if (type.fix.value == showValue) {
                    input = title;
                    return;
                }
 
            } else if ('range' in type) {
                var min = type.range.min;
                var max = type.range.max;
                var setVal = (showValue ? showValue : min);
                if (setVal == showValue) {
                    input = showValue;
                    return;
                }
            }

        });
        
        return input;
    }
});


/**
 * @overview Common functions that are used within device hardware configuration
 * @author Martin Vach
 */

/**
 * Angular module initialization
 * @class expertService
 */
myAppService.service('expertService', function($filter) {
    /// --- Public functions --- ///
    
    /**
     * Get language line by key
     * @param {string} key
     * @param {object} languages
     * @returns {unresolved}
     */
    this.getLangLine = function(key, languages) {
        return getLangLine(key, languages);
    };
    /**
     * Get config navigation devices
     * @param {object} ZWaveAPIData
     * @returns {unresolved}
     */
    this.configGetNav = function(ZWaveAPIData) {
        return configGetNav(ZWaveAPIData);
    };

    /**
     * Get language from zddx
     * @param {object} node
     * @param {string} lang
     * @returns {unresolved}
     */
    this.configGetZddxLang = function(node, lang) {
        return configGetZddxLang(node, lang);
    };
    /**
     * Get xml config param
     * @param {object} cfgXml
     * @param {int} nodeId
     * @param {string} instance
     * @param {string} commandClass
     * @param {string} command
     * @returns {unresolved}
     */
    this.getCfgXmlParam = function(cfgXml, nodeId, instance, commandClass, command) {
        return getCfgXmlParam(cfgXml, nodeId, instance, commandClass, command);
    };
    /**
     * Get expert commands
     * @param methods
     * @param ZWaveAPIData
     * @returns {*}
     */
    this.configGetCommands = function(methods, ZWaveAPIData) {
        return configGetCommands(methods, ZWaveAPIData);
    };
    /**
     *  Get interview ommands
     * @param node
     * @param updateTime
     * @returns {*}
     */
    this.configGetInterviewCommands = function(node, updateTime) {
        return configGetInterviewCommands(node, updateTime);
    };
    /**
     * Config cont
     * @param {object} node
     * @param {int} nodeId
     * @param {object} zddXml
     * @param {object} cfgXml
     * @param {string} lang
     * @param {object} languages
     * @returns {unresolved}
     */
    this.configConfigCont = function(node, nodeId, zddXml, cfgXml, lang, languages) {
        return configConfigCont(node, nodeId, zddXml, cfgXml, lang, languages);
    };
    /**
     * Switch all cont
     * @param {object} node
     * @param {int} nodeId
     * @param {object} ZWaveAPIData
     * @param {object} cfgXml
     * @returns {unresolved}
     */
    this.configSwitchAllCont = function(node, nodeId, ZWaveAPIData, cfgXml) {
        return configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml);
    };
    /**
     * Protection cont
     * @param {object} node
     * @param {int} nodeId
     * @param {object} ZWaveAPIData
     * @param {object} cfgXml
     * @returns {unresolved}
     */
    this.configProtectionCont = function(node, nodeId, ZWaveAPIData, cfgXml) {
        return configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml);
    };
   /**
    * Wakeup cont
    * @param {object} node
    * @param {int} nodeId
    * @param {object} ZWaveAPIData
    * @param {object} cfgXml
    * @returns {unresolved}
    */
    this.configWakeupCont = function(node, nodeId, ZWaveAPIData, cfgXml) {
        return configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml);
    };

    /**
     * Build config XML file
     * @param {object} data
     * @param {object} cfgXml
     * @param {int} id
     * @param {string} commandclass
     * @returns {unresolved}
     */
    this.buildCfgXml = function(data, cfgXml, id, commandclass) {
        return buildCfgXml(data, cfgXml, id, commandclass);
    };

    /// --- Private functions --- ///
    /**
     * Get language line by key
     */
    function getLangLine(key, languages) {
        if (angular.isObject(languages)) {
            if (angular.isDefined(languages[key])) {
                return languages[key] !== '' ? languages[key] : key;
            }
        }
        return key;
    }
    ;

    /**
     *  Get expert commands
     */
    function configGetCommands(methods, ZWaveAPIData) {
        var methodsArr = [];
        angular.forEach(methods, function(params, method) {
            //str.split(',');
            var cmd = {};
            var values = repr_array(method_defaultValues(ZWaveAPIData, methods[method]));
            cmd['data'] = {
                'method': method,
                'params': methods[method],
                'values': method_defaultValues(ZWaveAPIData, methods[method])
            };
            cmd['method'] = method;
            cmd['params'] = methods[method];
            cmd['values'] = repr_array(method_defaultValues(ZWaveAPIData, methods[method]));
            methodsArr.push(cmd);
        });
        return methodsArr;
    }

    /**
     *  Get interview Commands
     */
    function configGetInterviewCommands(node, updateTime) {
        var interviews = [];
        for (var iId in node.instances) {
            var cnt = 0;
            for (var ccId in node.instances[iId].commandClasses) {
                var obj = {};
                obj['iId'] = iId;
                obj['ccId'] = ccId;
                obj['ccName'] = node.instances[iId].commandClasses[ccId].name;
                obj['interviewDone'] = node.instances[iId].commandClasses[ccId].data.interviewDone.value;
                obj['cmdData'] = node.instances[iId].commandClasses[ccId].data;
                obj['cmdDataIn'] = node.instances[iId].data;
                obj['updateTime'] = updateTime;
                interviews.push(obj);
                cnt++;
            }
            ;
        }
        ;
        return interviews;
    }


    /**
     *  Get config navigation devices
     */
    function configGetNav(ZWaveAPIData) {
        var devices = [];
        var controllerNodeId = ZWaveAPIData.controller.data.nodeId.value;
        // Loop throught devices
        angular.forEach(ZWaveAPIData.devices, function(node, nodeId) {
            if (nodeId == 255 || nodeId == controllerNodeId || node.data.isVirtual.value) {
                return;
            }
            var node = ZWaveAPIData.devices[nodeId];
            // Set object
            var obj = {};
            obj['id'] = nodeId;
            obj['name'] = $filter('deviceName')(nodeId, node);
            devices.push(obj);
        });
        return devices;
    }

    /**
     *  Get language from zddx
     */
    function configGetZddxLang(langs, currLang) {
        var label = null;
        if (!langs) {
            return label;
        }
        if (angular.isArray(langs)) {
            for (var i = 0, len = langs.length; i < len; i++) {
                if (("__text" in langs[i]) && (langs[i]["_xml:lang"] == currLang)) {
                   label = langs[i].__text;
                    return label;
                     
                    //continue;
                }else{
                     if (("__text" in langs[i]) && (langs[i]["_xml:lang"] == 'en')) {
                    label = langs[i].__text;
                    return label;
                     }
                }
            }
            // DEPRECATED
//            angular.forEach(langs, function(lang, index) {
//                if (("__text" in lang) && (lang["_xml:lang"] == currLang)) {
//                    label = lang.__text;
//                    return false;
//                }
//                if (("__text" in lang) && (lang["_xml:lang"] == "en")) {
//                    label = lang.__text;
//                }
//            });
        } else {
            if (("__text" in langs)) {
                label = langs.__text;
            }
        }
         //console.log(label)
        return label;
    }

    /**
     * Get xml config param
     */
    function getCfgXmlParam(cfgXml, nodeId, instance, commandClass, command) {
        var cfg = $filter('hasNode')(cfgXml, 'config.devices.deviceconfiguration');
        if (!cfg) {
            return [];
        }
        // Get data for given device by id
        var collection = [];
        angular.forEach(cfg, function(v, k) {
            //if (v['_id'] == nodeId && v['_instance'] == instance && v['_commandClass'] == commandClass && v['_command'] == command) {
            if (v['_id'] == nodeId && v['_instance'] == instance && v['_commandclass'] == commandClass && v['_command'] == command) {
//                if(!angular.isArray(v['_parameter'])){
//                    return;
//                }
                var array = JSON.parse(v['_parameter']);
                if (array.length > 2) {
                    collection[array[0]] = array[1];
                }
                else if (array.length == 2) {
                    collection = array;

                }
                else {
                    collection[0] = array[0];
                    return;
                }
            }

        });
        //console.log(collection)
        return collection;

    }

    /**
     * Config cont
     */
    function configConfigCont(node, nodeId, zddXml, cfgXml, lang, languages) {
        if (!0x70 in node.instances[0].commandClasses) {
            return null;
        }
        if (!zddXml) {
            return null;
        }

        if (!zddXml.ZWaveDevice.hasOwnProperty("configParams")) {
            return null;
        }
        var config_cont = [];
        var params = zddXml.ZWaveDevice.configParams['configParam'];
//        var lang = 'en';
//        var langs = {
//            "en": "1",
//            "de": "0"
//        };
//        if (angular.isDefined(langs[lang])) {
//            lang = lang;
//        }
//        var langId = langs[lang];
        // Loop throught params
        var parCnt = 0;
        var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '70', 'Set');
        angular.forEach(params, function(conf_html, i) {
            //console.log(zddXml);
            if (!angular.isObject(conf_html)) {
                return;
            }

            have_conf_params = true;
            var conf = conf_html;
            var conf_num = conf['_number'];
            //console.log(cfgFile[conf_num])
            var conf_size = conf['_size'];
            var conf_name = configGetZddxLang($filter('hasNode')(conf, 'name.lang'), lang) || getLangLine('configuration_parameter', languages) + ' ' + conf_num;
            var conf_description = configGetZddxLang($filter('hasNode')(conf, 'description.lang'), lang);
            var conf_size = conf['_size'];
            var conf_default_value = null;
            var conf_type = conf['_type'];
            var showDefaultValue = null;
            var config_config_value;

            // get value from the Z-Wave data
            var config_zwave_value = null;

            if (angular.isDefined(node.instances[0].commandClasses[0x70])) {
                if (node.instances[0].commandClasses[0x70].data[conf_num] != null && node.instances[0].commandClasses[0x70].data[conf_num].val.value !== "") {
                    config_zwave_value = node.instances[0].commandClasses[0x70].data[conf_num].val.value;
                    conf_default = config_zwave_value;

                }

            }

            // get default value
            var conf_default = null;
            if (conf['_default'] !== undefined) {
                conf_default = parseInt(conf['_default'], 16);
                showDefaultValue = conf_default;
            }

            // get default value from the config XML
            if (cfgFile[conf_num] !== undefined) {
                config_config_value = cfgFile[conf_num];
            } else {
                if (config_zwave_value !== null) {
                    config_config_value = config_zwave_value;
                } else {
                    config_config_value = conf_default;
                }
            }

            var isUpdated = true;
            var updateTime = '';
            if (angular.isDefined(node.instances[0].commandClasses[0x70])
                    && angular.isDefined(node.instances[0].commandClasses[0x70].data[conf_num])) {
                var uTime = node.instances[0].commandClasses[0x70].data[conf_num].updateTime;
                var iTime = node.instances[0].commandClasses[0x70].data[conf_num].invalidateTime;
                var updateTime = $filter('isTodayFromUnix')(uTime);
                var isUpdated = (uTime > iTime ? true : false);
            }

            // Switch
            var conf_method_descr;
            //console.log(conf_name + ' --- ' + conf_type)
            switch (conf_type) {
                case 'constant':
                case 'rangemapped':
                    var param_struct_arr = [];
                    var conf_param_options = '';

                    angular.forEach(conf['value'], function(value_html, i) {
                        var value = value_html;
                        var value_from = parseInt(value['_from'], 16);
                        var value_to = parseInt(value['_to'], 16);
                        var value_description = null;
                        if (angular.isDefined(value.description)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'description.lang'), lang);
                        }
                        if (angular.isDefined(value.lang)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'lang'), lang);

                        }
                        var value_repr = value_from; // representative value for the range
                        if (conf_default !== null)
                            if (value_from <= conf_default && conf_default <= value_to) {
                                conf_default_value = value_description;
                                value_repr = conf_default;
                            }
                        param_struct_arr.push({
                            label: value_description,
                            type: {
                                fix: {
                                    value: value_repr
                                }
                            }
                        });
                    });
                    conf_method_descr = {
                        nodeId: nodeId,
                        label: 'Nº ' + conf_num + ' - ' + conf_name,
                        type: {
                            enumof: param_struct_arr
                        },
                        name: 'input_' + nodeId + '_' + conf_num,
                        description: conf_description,
                        updateTime: updateTime,
                        isUpdated: isUpdated,
                        defaultValue: conf_default_value,
                        showDefaultValue: showDefaultValue,
                        configCconfigValue: config_config_value,
                        configZwaveValue: config_zwave_value,
                        confNum: conf_num,
                        confSize: conf_size
                    };

                    break;
                case 'range':

                    var param_struct_arr = [];
                    var rangeParam = conf['value'];
                    //console.log(rangeParam, conf_num);

                    if (!rangeParam) {
                        conf_method_descr = {
                            nodeId: nodeId,
                            label: 'Nº ' + conf_num + ' - ' + conf_name,
                            type: {
                                noval: null
                            },
                            name: 'input_' + nodeId + '_' + conf_num,
                            description: conf_description,
                            updateTime: updateTime,
                            isUpdated: isUpdated,
                            defaultValue: null,
                            showDefaultValue: showDefaultValue,
                            configCconfigValue: config_config_value,
                            configZwaveValue: config_zwave_value,
                            confNum: conf_num,
                            confSize: conf_size
                        };
                        break;
                    }
                    angular.forEach(rangeParam, function(value_html, ri) {
                        //console.log(ri);
                        var value = value_html;

                        if (ri == 'description') {
                            //console.log(ri);
                            var value_from = parseInt(rangeParam['_from'], 16);
                            var value_to = parseInt(rangeParam['_to'], 16);

                        } else {
                            var value_from = parseInt(value['_from'], 16);
                            var value_to = parseInt(value['_to'], 16);
                        }
                        var value_description = '';
                        if (angular.isDefined(value.description)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'description.lang'), lang);
                        }
                        if (angular.isDefined(value.lang)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'lang'), lang);
                        }
                        //var value_description = deviceService.configGetZddxLang($filter('hasNode')(value, 'lang'), $scope.lang);

                        if (conf_default !== null)
                            conf_default_value = conf_default;


                        if (value_from != value_to) {
                            if (value_description != '') {
                                var rangeVal = {
                                    label: value_description,
                                    type: {
                                        range: {
                                            min: value_from,
                                            max: value_to
                                        }
                                    }
                                };
                                param_struct_arr.push(rangeVal);
                            }
                        }
                        else // this is a fix value
                        if (value_description != '') {
                            param_struct_arr.push({
                                label: value_description,
                                type: {
                                    fix: {
                                        value: value_from
                                    }
                                }
                            });
                        }
                    });

                    if (param_struct_arr.length > 1)
                        conf_method_descr = {
                            nodeId: nodeId,
                            label: 'Nº ' + conf_num + ' - ' + conf_name,
                            type: {
                                enumof: param_struct_arr
                            },
                            hideRadio: false,
                            name: 'input_' + nodeId + '_' + conf_num,
                            description: conf_description,
                            updateTime: updateTime,
                            isUpdated: isUpdated,
                            defaultValue: conf_default_value,
                            showDefaultValue: showDefaultValue,
                            configCconfigValue: config_config_value,
                            configZwaveValue: config_zwave_value,
                            confNum: conf_num,
                            confSize: conf_size
                        };
                    else if (param_struct_arr.length == 1) {

                        conf_method_descr = {
                            nodeId: nodeId,
                            label: 'Nº ' + conf_num + ' - ' + conf_name,
                            type: {
                                enumof: param_struct_arr
                            },
                            name: 'input_' + nodeId + '_' + conf_num,
                            hideRadio: true,
                            description: conf_description,
                            updateTime: updateTime,
                            isUpdated: isUpdated,
                            defaultValue: conf_default_value,
                            showDefaultValue: showDefaultValue,
                            configCconfigValue: config_config_value,
                            configZwaveValue: config_zwave_value,
                            confNum: conf_num,
                            confSize: conf_size
                        };
                    }

                    break;
                case 'bitset':
                    var param_struct_arr = [];
                    var conf_param_options = '';
                    var conf_default_value_arr = new Object;
                    if (conf_default !== null) {
                        var bit = 0;
                        do {
                            if ((1 << bit) & conf_default)
                                conf_default_value_arr[bit] = 'Bit ' + bit + ' set';
                        } while ((1 << (bit++)) < conf_default);
                    }
                    ;
                    angular.forEach(conf['value'], function(value_html, i) {
                        var value = value_html;
                        var value_from = parseInt(value['_from'], 16);
                        var value_to = parseInt(value['_to'], 16);
                        var value_description = 'fdf';
                        var value_description = '';
                        if (conf_default !== null) {
                            if (value_from == value_to) {
                                if ((1 << value_from) & conf_default)
                                    conf_default_value_arr[value_from] = value_description;
                            } else {
                                conf_default_value_arr[value_from] = (conf_default >> value_from) & ((1 << (value_to - value_from + 1)) - 1)
                                for (var bit = value_from + 1; bit <= value_to; bit++)
                                    delete conf_default_value_arr[bit];
                            }
                        }
                        ;
                        if (value_from == value_to)
                            param_struct_arr.push({
                                label: value_description,
                                name: 'input_' + nodeId + '_' + conf_num,
                                type: {
                                    bitcheck: {
                                        bit: value_from
                                    }
                                }
                            });
                        else
                            param_struct_arr.push({
                                label: value_description,
                                name: 'input_' + nodeId + '_' + conf_num,
                                type: {
                                    bitrange: {
                                        bit_from: value_from,
                                        bit_to: value_to
                                    }
                                }
                            });
                    });
                    if (conf_default !== null) {
                        conf_default_value = '';
                        for (var ii in conf_default_value_arr)
                            conf_default_value += conf_default_value_arr[ii] + ', ';
                        if (conf_default_value.length)
                            conf_default_value = conf_default_value.substr(0, conf_default_value.length - 2);
                    }
                    conf_method_descr = {
                        nodeId: nodeId,
                        label: 'Nº ' + conf_num + ' - ' + conf_name,
                        type: {
                            bitset: param_struct_arr
                        },
                        name: 'input_' + nodeId + '_' + conf_num,
                        description: conf_description,
                        updateTime: updateTime,
                        isUpdated: isUpdated,
                        defaultValue: conf_default_value,
                        showDefaultValue: showDefaultValue,
                        configCconfigValue: config_config_value,
                        configZwaveValue: config_zwave_value,
                        confNum: conf_num,
                        confSize: conf_size
                    };
                    break;
                default:
                    return;
                    //conf_cont.append('<span>' + $.translate('unhandled_type_parameter') + ': ' + conf_type + '</span>');
            }
            ;

            config_cont.push(conf_method_descr);
            parCnt++;
        });
        //console.log(config_cont);
        return config_cont;
    }

    /**
     * Switch all cont
     */
    function configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml) {
        var switchall_cont = false;
        if (0x27 in node.instances[0].commandClasses) {
            var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '27', 'Set');
            var uTime = node.instances[0].commandClasses[0x27].data.mode.updateTime;
            var iTime = node.instances[0].commandClasses[0x27].data.mode.invalidateTime;
            var updateTime = $filter('isTodayFromUnix')(uTime);
            var isUpdated = (uTime > iTime ? true : false);
            var gui_descr = getMethodSpec(ZWaveAPIData, nodeId, 0, 0x27, 'Set');
            var conf_default_value = 0;
            var switchall_conf_value;
            if (cfgFile !== undefined) {
                switchall_conf_value = cfgFile[0];
            } else {
                switchall_conf_value = 1;// by default switch all off group only
            }
            switchall_cont = {
                'params': gui_descr,
                'values': {0: switchall_conf_value},
                name: 'switchall_' + nodeId + '_' + 0,
                updateTime: updateTime,
                isUpdated: isUpdated,
                defaultValue: conf_default_value,
                showDefaultValue: conf_default_value,
                configCconfigValue: switchall_conf_value,
                confNum: 0,
                confSize: 0,
                cmd: 'devices[' + nodeId + '].instances[0].commandClasses[0x27]'
            };

        }
        ;
        return switchall_cont;
    }

    /**
     * Protection cont
     */
    function configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml) {
        var protection_cont = false;
        if (0x75 in node.instances[0].commandClasses) {
            var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '75', 'Set');
            var uTime = node.instances[0].commandClasses[0x75].data.state.updateTime;
            var iTime = node.instances[0].commandClasses[0x75].data.state.invalidateTime;
            var updateTime = $filter('isTodayFromUnix')(uTime);
            var isUpdated = (uTime > iTime ? true : false);
            var gui_descr = getMethodSpec(ZWaveAPIData, nodeId, 0, 0x75, 'Set');
            var conf_default_value = 0;
            var protection_conf_value;
            //var protection_conf_rf_value;
            // get default value from the config XML
            if (cfgFile !== undefined) {
                protection_conf_value = cfgFile[0];
            } else {
                protection_conf_value = 0;// by default switch all off group only
            }

            protection_cont = {
                'params': gui_descr,
                'values': {0: protection_conf_value},
                name: 'protection_' + nodeId + '_' + 0,
                updateTime: updateTime,
                isUpdated: isUpdated,
                defaultValue: conf_default_value,
                showDefaultValue: conf_default_value,
                configCconfigValue: protection_conf_value,
                confNum: 0,
                confSize: 0,
                cmd: 'devices[' + nodeId + '].instances[0].commandClasses[0x75]'
            };
        }
        ;
        return protection_cont;
    }

    /**
     * Wakeup cont
     */
    function configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml) {
        var wakeup_cont = false;
        if (0x84 in node.instances[0].commandClasses) {
            var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '84', 'Set');
            var wakeup_zwave_min = (node.instances[0].commandClasses[0x84].data.version.value == 1) ? 0 : node.instances[0].commandClasses[0x84].data.min.value;
            var wakeup_zwave_max = (node.instances[0].commandClasses[0x84].data.version.value == 1) ? 0xFFFFFF : node.instances[0].commandClasses[0x84].data.max.value;
            var wakeup_zwave_value = node.instances[0].commandClasses[0x84].data.interval.value;
            var wakeup_zwave_default_value = (node.instances[0].commandClasses[0x84].data.version.value == 1) ? 86400 : node.instances[0].commandClasses[0x84].data['default'].value; // default is a special keyword in JavaScript
            var wakeup_zwave_nodeId = node.instances[0].commandClasses[0x84].data.nodeId.value;
            var uTime = node.instances[0].commandClasses[0x84].data.updateTime;
            var iTime = node.instances[0].commandClasses[0x84].data.invalidateTime;
            var updateTime = $filter('isTodayFromUnix')(uTime);
            var isUpdated = (uTime > iTime ? true : false);
            if (wakeup_zwave_min !== '' && wakeup_zwave_max !== '') {
                var gui_descr = getMethodSpec(ZWaveAPIData, nodeId, 0, 0x84, 'Set');
                gui_descr[0].type.range.min = parseInt(wakeup_zwave_min, 10);
                gui_descr[0].type.range.max = parseInt(wakeup_zwave_max, 10);
                var wakeup_conf_value;
                var wakeup_conf_node_value = 0;
                if (angular.isArray(cfgFile) && cfgFile.length > 0) {
                    wakeup_conf_value = cfgFile[0] || 0;
                    wakeup_conf_node_value = cfgFile[1] || 0;
                } else {
                    if (wakeup_zwave_value != "" && wakeup_zwave_value != 0 && wakeup_zwave_nodeId != "") {
                        // not defined in config: adopt devices values
                        wakeup_conf_value = parseInt(wakeup_zwave_value, 10);
                    } else {
                        // values in device are missing. Use defaults
                        wakeup_conf_value = parseInt(wakeup_zwave_default_value, 10);
                    }
                    ;
                }
                ;
                wakeup_cont = {
                    'params': gui_descr,
                    'values': {"0": wakeup_conf_value},
                    name: 'wakeup_' + nodeId + '_' + 0,
                    updateTime: updateTime,
                    isUpdated: isUpdated,
                    defaultValue: wakeup_zwave_default_value,
                    showDefaultValue: wakeup_zwave_default_value,
                    configCconfigValue: wakeup_conf_value,
                    configCconfigNodeValue: wakeup_conf_node_value,
                    confNum: 0,
                    confSize: 0,
                    cmd: 'devices[' + nodeId + '].instances[0].commandClasses[0x84]'
                };
            } else {
                //$('#wakeup_cont .cfg-block-content').append('<span>' + $scope._t('config_ui_wakeup_no_min_max') + '</span>');
            }
        }
        ;
        return wakeup_cont;
    }

    /**
     *Build config XML file
     */
    function buildCfgXml(data, cfgXml, id, commandclass) {
        var hasCfgXml = false;
        var assocCc = [133, 142];
        var formData = [];
        if (commandclass == '84') {
            var par1 = JSON.parse(data[0]['parameter']);
            var par2 = JSON.parse(data[1]['parameter']);
            var wakeData = {
                'id': id,
                'instance': data[0]['instance'],
                'commandclass': commandclass,
                'command': data[0]['command'],
                'parameter': '[' + par1 + ',' + par2 + ']'
            };
            formData.push(wakeData);
        } else {
            formData = data;
        }
        var xmlData = formData;
        if (angular.isObject(cfgXml) && $filter('hasNode')(cfgXml, 'config.devices.deviceconfiguration')) {
            hasCfgXml = cfgXml.config.devices.deviceconfiguration;
            angular.forEach(hasCfgXml, function(v, k) {
                var obj = {};
                if (v['_id'] == id && v['_commandclass'] == commandclass) {
                    return;
                }
                obj['id'] = v['_id'];
                obj['instance'] = v['_instance'];
                obj['commandclass'] = v['_commandclass'];
                obj['command'] = v['_command'];
                obj['parameter'] = v['_parameter'];
                obj['group'] = v['_group'];
                xmlData.push(obj);

            });
        }
        var ret = buildCfgXmlFile(xmlData);
        return ret;

    }

    /**
     * Build cfg XML file
     */
    function buildCfgXmlFile(xmlData) {
        var assocCc = [133, 142];
        var xml = '<config><devices>' + "\n";

        angular.forEach(xmlData, function(v, k) {
            if (assocCc.indexOf(parseInt(v.commandclass, 10)) > -1) {
                xml += '<deviceconfiguration id="' + v.id + '" instance="' + v.instance + '" commandclass="' + v.commandclass + '" command="' + v.command + '" group="' + v.group + '" parameter="' + v.parameter + '"/>' + "\n";

            } else {
                xml += '<deviceconfiguration id="' + v.id + '" instance="' + v.instance + '" commandclass="' + v.commandclass + '" command="' + v.command + '" parameter="' + v.parameter + '"/>' + "\n";
            }

        });
        xml += '</devices></config>' + "\n";
        return xml;

    }
});

/**
 * @overview Handles actions in the device hardware configuration.
 * @author Martin Vach
 */

/**
 * The controller that handles outputs and inputs.
 * @class ConfigConfigurationController
 */
myAppController.controller('ConfigConfigurationController', function($scope, $routeParams, $location, $interval, $filter, $timeout, dataFactory, dataService, expertService) {
    
    $scope.devices = [];
    $scope.deviceId = 0;
    $scope.reset = function() {
        $scope.devices = angular.copy([]);
    };
    $scope.apiDataInterval = null;
    // Config vars
    $scope.hasConfigurationCc = false;
    $scope.deviceZddx = [];
    $scope.configCont;
    $scope.switchAllCont;
    $scope.protectionCont;
    $scope.wakeupCont;
    
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load data
     */
    $scope.load = function(nodeId) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            $scope.ZWaveAPIData = ZWaveAPIData;
            $scope.deviceId = nodeId;
            $scope.deviceName = $filter('deviceName')(nodeId, node);
            $scope.devices = expertService.configGetNav(ZWaveAPIData);
            $scope.getNodeDevices = function() {
                var devices = [];
                angular.forEach($scope.devices, function(v, k) {
                    if (devices_htmlSelect_filter($scope.ZWaveAPIData, 'span', v.id, 'node')) {
                        return;
                    }
                    ;
                    var obj = {};
                    obj['id'] = v.id;
                    obj['name'] = v.name;
                    devices.push(obj);
                });

                return devices;
            };
            //$scope.getNodeDevices();
            setData(ZWaveAPIData, nodeId);
        }, function(error) {});
    };
    $scope.load($routeParams.nodeId);
    
    /**
     * Refresh data
     */
    $scope.refresh = function(nodeId) {
        var refresh = function() {
            dataFactory.joinedZwaveData().then(function(response) {
                setData(response.data.joined, nodeId,true);
            }, function(error) {});
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    //$scope.refresh($routeParams.nodeId);

    /**
     * Update from device action
     */
    $scope.updateFromDevice = function(cmd,hasBattery) {
         $scope.loading = {status:'loading-spin',icon:'fa-spinner fa-spin', message:$scope._t('updating')};
         if (hasBattery) {
            alertify.alert($scope._t('conf_apply_battery'));
        }
        dataFactory.runExpertCmd(cmd, true).then(function(response) {
        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
        });
        $scope.refresh($routeParams.nodeId);
        $timeout(function() {
             $scope.loading = {status:'loading-fade',icon:'fa-check text-success', message:$scope._t('success_updated')};
            $interval.cancel($scope.apiDataInterval);
        }, 7000);
        return;
    };

    /**
     * Update from device - configuration section
     */
    $scope.updateFromDeviceCfg = function(cmd, cfg, deviceId) {
         $scope.loading = {status:'loading-spin',icon:'fa-spinner fa-spin', message:$scope._t('updating')};
        angular.forEach(cfg, function(v, k) {
            if (v.confNum) {
                var request = cmd + '(' + v.confNum + ')';
                dataFactory.runExpertCmd(request, true).then(function(response) {
                }, function(error) {});
            }

        });
        $scope.refresh(deviceId);
        $timeout(function() {
            $scope.loading = {status:'loading-fade',icon:'fa-check text-success', message:$scope._t('success_updated')};
            $interval.cancel($scope.apiDataInterval);
        }, 7000);
        return;
    };

    /**
     * Apply Config action
     */
    $scope.submitApplyConfigCfg = function(form, cmd, cfgValues, hasBattery, confNum) {
         $scope.loading = {status:'loading-spin',icon:'fa-spinner fa-spin', message:$scope._t('updating')};
        var xmlData = [];
        var configValues = [];
        if (hasBattery) {
            alertify.alert($scope._t('conf_apply_battery'));
        }
        var data = $('#' + form).serializeArray();
        var dataValues = [];
        angular.forEach(data, function(v, k) {
            if (v.value !== '') {
                dataValues.push({"value": v.value, "name": v.name});
            }

        });

        angular.forEach(dataValues, function(n, nk) {
            var obj = {};
            var parameter;
            var lastNum = n.name.match(/\d+$/);
            if (!lastNum) {
                return;
            }
            var num = lastNum[0];
            var confSize = 0;
            //var lastNum = n.name.match(/\d+$/);
            var value = n.value;
            configValues.push(value)
            angular.forEach(cfgValues, function(cv, ck) {
                if (!cv) {
                    return;
                }
                if (cv.confNum == num) {
                    confSize = cv.confSize;
                }


            });
            if (num > 0) {
                parameter = num + ',' + value + ',' + confSize;
            } else {
                parameter = value;
            }

            obj['id'] = cmd['id'];
            obj['instance'] = cmd['instance'];
            obj['commandclass'] = cmd['commandclass'];
            obj['command'] = cmd['command'];
            obj['parameter'] = '[' + parameter + ']';
            obj['parameterValues'] = parameter;
            obj['confNum'] = num;

            xmlData.push(obj);


        });
        
        // Send command
        var request = 'devices[' + cmd.id + '].instances[' + cmd.instance + '].commandClasses[0x' + cmd.commandclass + '].';
        switch (cmd['commandclass']) {
            case '70':// Config
                angular.forEach(xmlData, function(v, k) {

                    var configRequest = request;
                    configRequest += cmd.command + '(' + v.parameterValues + ')';
                    if (confNum) {
                        if (confNum == v.confNum) {
                            dataFactory.runExpertCmd(configRequest, true).then(function(response){}, function(error) {});
                        }
                    } else {
                        dataFactory.runExpertCmd(configRequest, true).then(function(response){},function(error) {});
                    }

                });
                break;
            case '75':// Protection
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {});
                break;
            case '84':// Wakeup
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {});
                break;
            case '27':// Switch all
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {});
                break;
            default:
                break;
        }
        dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.cfg_xml_url, true).then(function(cfgXml) {
           var xmlFile = expertService.buildCfgXml(xmlData, cfgXml, cmd['id'], cmd['commandclass']);
           dataFactory.putCfgXml(xmlFile).then(function(response){},function(error) {
                    alertify.alert($scope._t('error_update_data'));
                });
        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
        });

        $scope.refresh(cmd['id']);
        $timeout(function() {
            $scope.loading = {status:'loading-fade',icon:'fa-check text-success', message:$scope._t('success_updated')};
            $interval.cancel($scope.apiDataInterval);
        }, 7000);
        return;
    };


    /// --- Private functions --- ///
    /**
     * Set zwave data
     */
    function setData(ZWaveAPIData, nodeId, refresh) {
        var node = ZWaveAPIData.devices[nodeId];
        $scope.showDevices = true;
        //$scope.deviceNameId = $filter('deviceName')(nodeId, node) + ' (#' + nodeId + ')';
        $scope.hasBattery = 0x80 in node.instances[0].commandClasses;
        var zddXmlFile = null;
        if (angular.isDefined(node.data.ZDDXMLFile)) {
            zddXmlFile = node.data.ZDDXMLFile.value;
            $scope.deviceZddxFile = node.data.ZDDXMLFile.value;
        }

        //$scope.interviewCommands = deviceService.configGetInterviewCommands(node, ZWaveAPIData.updateTime);
        //$scope.interviewCommandsDevice = node.data;
        if (zddXmlFile && zddXmlFile !== 'undefined') {
            dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.zddx_url + zddXmlFile).then(function(zddXml) {
                setCont(node, nodeId, zddXml, ZWaveAPIData, refresh);
            }, function(error) {
                 setCont(node, nodeId, null, ZWaveAPIData, refresh);
            });

        } else {
            setCont(node, nodeId, null, ZWaveAPIData, refresh);
        }
    }

    /**
     * Set all conts
     */
    function setCont(node, nodeId, zddXml, ZWaveAPIData, refresh) {
        if (!zddXml) {
            $scope.noZddx = true;
            // Loop throught instances
            angular.forEach(node.instances, function (instance, instanceId) {
                if (instance.commandClasses[112]) {

                    $scope.hasConfigurationCc =  configurationCc(instance.commandClasses[112], instanceId,nodeId, ZWaveAPIData);
                    return;
                }
            });
        }
        dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.cfg_xml_url, true).then(function(cfgXml) {
            $scope.configCont = expertService.configConfigCont(node, nodeId, zddXml, cfgXml, $scope.lang, $scope.languages);
            $scope.wakeupCont = expertService.configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml);
            $scope.protectionCont = expertService.configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml);
            $scope.switchAllCont = expertService.configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml);
            if(!$scope.configCont && !$scope.wakeupCont && !$scope.protectionCont && !$scope.switchAllCont){
               alertify.alertError($scope._t('error_load_data'));
            }
        }, function(error) {
            $scope.configCont = expertService.configConfigCont(node, nodeId, zddXml, null, $scope.lang, $scope.languages);
            $scope.wakeupCont = expertService.configWakeupCont(node, nodeId, ZWaveAPIData, null);
            $scope.protectionCont = expertService.configProtectionCont(node, nodeId, ZWaveAPIData, null);
            $scope.switchAllCont = expertService.configSwitchAllCont(node, nodeId, ZWaveAPIData, null);
        });
    }

    /**
     * Set configuration command class
     * @param commandClass
     * @param instanceId
     * @param nodeId
     * @param ZWaveAPIData
     * @returns {{}}
     */
    function configurationCc(commandClass, instanceId,nodeId, ZWaveAPIData) {
        //console.log(node);

        var ccId = 112;
        var methods = getMethodSpec(ZWaveAPIData, nodeId, instanceId, ccId, null);
        var command = expertService.configGetCommands(methods, ZWaveAPIData);
        var obj = {};
        obj['nodeId'] = nodeId;
        obj['rowId'] = 'row_' + nodeId + '_' + instanceId + '_' + ccId;
        obj['instanceId'] = instanceId;
        obj['ccId'] = ccId;
        obj['cmd'] = 'devices[' + nodeId + '].instances[' + instanceId + '].commandClasses[' + ccId + ']';
        obj['cmdData'] = ZWaveAPIData.devices[nodeId].instances[instanceId].commandClasses[ccId].data;
        obj['cmdDataIn'] = ZWaveAPIData.devices[nodeId].instances[instanceId].data;
        obj['commandClass'] = commandClass.name;
        obj['command'] = command;
        obj['updateTime'] = ZWaveAPIData.updateTime;
        return obj;
    }
});




/**
 * @overview Handles expert commands  in the device hardware configuration.
 * @author Martin Vach
 */
/**
 * The controller that handles outputs and inputs.
 * @class ConfigCommandsController
 */
myAppController.controller('ConfigCommandsController', function ($scope, $routeParams, $location, $cookies, $timeout, $filter,$interval,  dataFactory,dataService, expertService, _) {
    $scope.commands = [];
    $scope.interviewCommands;
    $scope.ccConfiguration = {
        all: [],
        interval: null
    };

    // Load data
    $scope.load = function (nodeId) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            var interviewCommands = expertService.configGetInterviewCommands(node, ZWaveAPIData.updateTime);
            var ccConfiguration = _.findWhere(interviewCommands,{ccName: "Configuration"});
            $scope.getNodeDevices = function () {
                var devices = [];
                angular.forEach($scope.devices, function (v, k) {
                    if (devices_htmlSelect_filter($scope.ZWaveAPIData, 'span', v.id, 'node')) {
                        return;
                    }
                    ;
                    var obj = {};
                    obj['id'] = v.id;
                    obj['name'] = v.name;
                    devices.push(obj);
                });
                return devices;
            };
            $scope.interviewCommands = interviewCommands;
            //$scope.ccConfiguration.all = _.findWhere(interviewCommands,{ccName: "Configuration"});
            //console.log($scope.interviewCommands)
            //console.log($scope.ccConfiguration.all)
            $scope.deviceId = nodeId;
            setCcConfig(ccConfiguration);
            $scope.refreshZwaveData(nodeId,ZWaveAPIData);
            /**
             * Expert commands
             */
            angular.forEach(node.instances, function (instance, instanceId) {
                angular.forEach(instance.commandClasses, function (commandClass, ccId) {
                    var methods = getMethodSpec(ZWaveAPIData, nodeId, instanceId, ccId, null);
                    var command = expertService.configGetCommands(methods, ZWaveAPIData);
                    var obj = {};
                    obj['nodeId'] = nodeId;
                    obj['rowId'] = 'row_' + nodeId + '_' + instanceId + '_' + ccId;
                    obj['instanceId'] = instanceId;
                    obj['ccId'] = ccId;
                    obj['cmd'] = 'devices[' + nodeId + '].instances[' + instanceId + '].commandClasses[' + ccId + ']';
                    obj['cmdData'] = ZWaveAPIData.devices[nodeId].instances[instanceId].commandClasses[ccId].data;
                    obj['cmdDataIn'] = ZWaveAPIData.devices[nodeId].instances[instanceId].data;
                    obj['commandClass'] = commandClass.name;
                    obj['command'] = command;
                    obj['updateTime'] = ZWaveAPIData.updateTime;
                    $scope.commands.push(obj);
                });
            });
        }, function(error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.load($routeParams.nodeId);

    /**
     * Refresh zwave data
     * @param {object} ZWaveAPIData
     */
    $scope.refreshZwaveData = function(nodeId,ZWaveAPIData) {
        var refresh = function() {
            dataFactory.joinedZwaveData(ZWaveAPIData).then(function(response) {
                var node = ZWaveAPIData.devices[nodeId];
                if (!node) {
                    return;
                }
                var interviewCommands = expertService.configGetInterviewCommands(node, response.updateTime);
                var ccConfiguration = _.findWhere(interviewCommands,{ccName: "Configuration"});
                setCcConfig(ccConfiguration);
            }, function(error) {});
        };
        $scope.ccConfiguration.interval = $interval(refresh, $scope.cfg.interval);
    };

    /**
     * Submit expert commands form
     * @param {string} form
     * @param {string} cmd
     */
    $scope.submitExpertCommndsForm = function (form, cmd,v) {
        var data = $('#' + form).serializeArray();
        var dataJoined = [];

        angular.forEach(data, function (v, k) {
            if (v.value === 'N/A') {
                return;
            }
            dataJoined.push($filter('setConfigValue')(v.value));

        });
        var paramInput  = dataJoined[0];
        //console.log(paramInput)
        $scope.toggleRowSpinner('row_' + paramInput);
        //console.log($scope.rowSpinner)
        //var obj = $scope.ccConfiguration.all[paramInput];
        //console.log(obj)
        var request = cmd + '(' + dataJoined.join() + ')';
        //dataService.runCmd(request, false, $scope._t('error_handling_data'));
        dataFactory.runExpertCmd(request, true).then(function(response){
            dataService.showNotifier({message: $scope._t('success_updated')});
            $timeout($scope.toggleRowSpinner, $scope.cfg.interval);
        },function(error) {
            $scope.toggleRowSpinner();
            alertify.alertError($scope._t('error_update_data'));
        });

    };

    /// --- Private functions --- ///
    function setCcConfig(data){
        //console.log(data.cmdData)
        angular.forEach(data.cmdData, function (v, k) {
            if(_.isNaN(parseInt(k))){
                return;
            }
            var rowId = 'row_' + k;
            //console.log(k)
            var obj = {};
            obj['rowId'] = rowId;
            obj['param'] = k;
            obj['size'] = v.size.value;
            obj['val'] = v.val.value;
            obj['updateTime'] = v.updateTime;
            obj['isUpdated'] = (v.updateTime > v.invalidateTime ? true : false);
            obj['isEqual'] = true;
            var findIndex = _.findIndex($scope.ccConfiguration.all, {rowId: obj.rowId});
            if(findIndex > -1){
                obj['isEqual'] = _.isEqual(obj, $scope.ccConfiguration.all[findIndex]);
                angular.extend(obj,{isEqual: _.isEqual(obj, $scope.ccConfiguration.all[findIndex])});
               angular.extend($scope.ccConfiguration.all[findIndex],obj);
            }else{
                $scope.ccConfiguration.all.push(obj);
            }
        });

    }


});