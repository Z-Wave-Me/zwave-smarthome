/**
 * Application controllers
 * @author Martin Vach
 */

/*** Controllers ***/
var myAppController = angular.module('myAppController', []);
/**
 * Base controller
 */
myAppController.controller('BaseController', function($scope, $cookies, $filter, $location, $route, cfg, dataFactory, dataService) {
    /**
     * Global scopes
     */
    $scope.cfg = cfg;
    // Current profile
    $scope.demoColor = ['#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e', '#6494bc', '#80ad80', '#dd976e'];
    $scope.profile = {
        'id': 1,
        'name': 'Default',
        'cssClass': 'profile-default',
        'active': true,
        'lang': 'en',
        'positions': []
    };
    /**
     * Language settings
     */
    $scope.lang_list = cfg.lang_list;
    // Set language
    //$scope.lang = (angular.isDefined($cookies.lang) ? $cookies.lang : cfg.lang);
    $scope.lang = (angular.isDefined($scope.profile.lang) ? $scope.profile.lang : cfg.lang);
    // TODO: remove?
    $scope.changeLang = function(lang) {
        $cookies.lang = lang;
        $scope.lang = lang;
    };
    // Load language files
    $scope.loadLang = function(lang) {
        // Is lang in language list?
        var lang = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        dataFactory.getLanguageFile(function(data) {
            $scope.languages = data;
        }, lang);
    };
    // Get language lines
    $scope._t = function(key) {
        return dataService.getLangLine(key, $scope.languages);
    };
    // Watch for lang change
    $scope.$watch('lang', function() {
        $scope.loadLang($scope.lang);
    });
    /**
     * Set time
     */
    $scope.setTime = function() {
        var time = Math.round(+new Date() / 1000);
        $('#update_time_tick').html($filter('getCurrentTime')(time));
    };
    $scope.setTime();
    // Order by
    $scope.orderBy = function(field) {
        $scope.predicate = field;
        $scope.reverse = !$scope.reverse;
    };
    /**
     * Load base data (profiles, languages)
     */
    $scope.navpPofiles = [];
    $scope.loadBaseData = function() {
        dataFactory.getApiData('profiles', function(data) {
            $scope.navpPofiles = data.data;
        });
    };
    $scope.loadBaseData();
    /**
     * Get body ID
     */
    $scope.getBodyId = function() {
        var path = $location.path().split('/');
        if (path[1] == 'elements') {
            switch (path[2]) {
                case 'location':
                    return 'location';
                    break;
                case 'dashboard':
                    return 'dashboard';
                    break;
                default:
                    return 'elements';
                    break;
            }

        } else {
            return path[1];
        }

    };
    /**
     * Get body ID
     */
    $scope.footer = 'Home footer';
    /**
     * 
     * Mobile detect
     */
    $scope.isMobile = dataService.isMobile(navigator.userAgent || navigator.vendor || window.opera);
    /*
     * Menu active class
     */
    $scope.isActive = function(route) {
        return (route === $scope.getBodyId() ? 'active' : '');
    };
    /**
     * Set profile
     */
    $scope.setProfile = function(data) {
        if (data.color) {
            $scope.profile.cssClass = 'profile-' + data.color.substring(1);
            data.cssClass = 'profile-' + data.color.substring(1);
        }
        if (data.name) {
            $scope.profile.name = data.name;
        }
        if (data.id) {
            $scope.profile.id = data.id;
        }
        if (data.lang) {
            $scope.profile.lang = data.lang;
        }
        if (data.positions) {
            $scope.profile.positions = data.positions;
        }

        $cookies.profile = angular.toJson(data);
        $route.reload();
    };
    /**
     * Get profile
     */
    $scope.getProfile = function() {
        var cookie = angular.fromJson($cookies.profile);
        if (cookie) {
            $scope.profile = cookie;
        }
    };
    $scope.getProfile();
});
/**
 * Test controller
 */
myAppController.controller('TestController', function($scope, cfg, dataFactory) {
    $scope.collection = [];
    $scope.targetColor = '#ccc';
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };
    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        //dataFactory.localData('elements.json', function(data) {
        dataFactory.getApiData('devices', function(data) {
            $scope.collection = data.data.devices;
            console.log($scope.collection);
        });
    };
    $scope.loadData();
    $(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [300, 70]
    });
    /**
     * Slider values
     */
    $scope.slider = {
        modelMax: 38
    };
});
/**
 * Home controller
 */
myAppController.controller('HomeController', function($scope, dataFactory, dataService) {

});
/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, $location, dataFactory, dataService, myCache) {
    $scope.collection = [];
    $scope.showFooter = true;
    $scope.deviceType = [];
    $scope.tags = [];
    $scope.rooms = [];
    $scope.levelVal = [];
    $scope.profileData = [];
    $scope.input = {
        'id': null,
        'metrics': null,
        'location': null,
        'tags': null,
        'permanently_hidden': false,
        'title': '',
        'dashboard': false,
        'deviceType': null,
        'level': null
    };
    $scope.isSelected = true;
    $scope.onText = 'ON';
    $scope.offText = 'OFF';
    $scope.isActive = true;
    $scope.size = 'small';
    $scope.animate = false;

    $scope.knobopt = {
        width: 100
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        dataFactory.cancelApiDataInterval();
    });

    /**
     * Load data into collection
     */
    dataFactory.setCache(true);
    $scope.loadData = function() {
        //getData(callback,api,cache,params)
        dataFactory.getApiData('devices', function(data) {
            var filter = null;
            $scope.deviceType = dataService.getDeviceType(data.data.devices);
            $scope.tags = dataService.getTags(data.data.devices);
            dataFactory.getApiData('profiles', function(data) {
                var profile = dataService.getRowBy(data.data, 'id', $scope.profile.id);
                $scope.profileData = {
                    'id': profile ? profile.id : 1,
                    'name': profile ? profile.name : 'Default',
                    'positions': profile ? profile.positions : []
                };
            });
            dataFactory.getApiData('locations', function(data) {
                $scope.rooms = data.data;
            });
            if (angular.isDefined($routeParams.filter) && angular.isDefined($routeParams.val)) {
                switch ($routeParams.filter) {
                    case 'dashboard':
                        $scope.showFooter = false;
                        filter = {filter: "onDashboard", val: true};
                        break;
                    case 'deviceType':
                        filter = $routeParams;
                        break;
                    case 'tags':
                        filter = $routeParams;
                        break;
                    case 'location':
                        $scope.showFooter = false;
                        filter = $routeParams;
                        dataFactory.getApiData('locations', function(rooms) {
                            //getRowBy(data, key, val, cache);
                            var room = dataService.getRowBy(rooms.data, 'id', $routeParams.val, 'room_' + $routeParams.val);
                            if (room) {
                                $scope.headline = $scope._t('lb_devices_room') + ' ' + room.title;
                            }
                        });
                        break;
                    default:
                        break;
                }
            }
            dataFactory.getApiData('instances', function(instances) {
                $scope.collection = dataService.getDevices(data.data.devices, filter, $scope.profileData.positions, instances.data);
            });

        });
    };
    $scope.loadData();

    $scope.updateData = function() {
        dataFactory.updateApiData('devices', function(data) {
            dataService.updateDevices(data);
        });
    };
    $scope.updateData();
    //$(".dial").knob();

    /**
     * Chart data
     */
    $scope.chartData = {
        labels: ['01:00', '06:00', '10:00', '12:00', '14:00', '18:00', '20:00'],
        datasets: [
            /*{
             fillColor: 'rgba(220,220,220,0.5)',
             strokeColor: 'rgba(220,220,220,1)',
             pointColor: 'rgba(220,220,220,1)',
             pointStrokeColor: '#fff',
             data: [65, 59, 90, 81, 56, 55, 40]
             },*/
            {
                fillColor: 'rgba(151,187,205,0.5)',
                strokeColor: 'rgba(151,187,205,1)',
                pointColor: 'rgba(151,187,205,1)',
                pointStrokeColor: '#fff',
                data: [8, 10, 15, 20, 22, 18, 16]
            }
        ]
    };
    /**
     * Chart settings
     */
    $scope.chartOptions = {
        // Chart.js options can go here.
    };
    /**
     * Slider options
     */
    $scope.slider = {
        modelMax: 38
    };
    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
    /**
     * Add tag to list
     */
    $scope.addTag = function(tag) {
        if (!tag || $scope.input.tags.indexOf(tag) > -1) {
            return;
        }
        $scope.input.tags.push(tag);
        $scope.addNewTag = null;
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function(index) {
        $scope.input.tags.splice(index, 1);
    };
    /**
     * Update an item
     */
    $scope.store = function(input) {
        var inputData = {
            'id': input.id,
            'location': input.location,
            'tags': dataService.setArrayValue(input.tags, 'dashboard', input.dashboard),
            'permanently_hidden': input.permanently_hidden,
            'metrics': input.metrics
        };
        inputData.metrics.title = input.title;
        if (input.id) {
            //Load devices
            dataFactory.putApiData('devices', input.id, inputData, function(data) {
                //Load profiles
                dataFactory.getApiData('profiles', function(data) {
                    var profile = dataService.getRowBy(data.data, 'id', $scope.profile.id);
                    $scope.profileData = {
                        'id': profile.id,
                        'name': profile.name,
                        'positions': dataService.setArrayValue(profile.positions, input.id, input.dashboard)
                    };
                    saveDeviceIdIntoProfile(data, $scope.profileData);
                });
                myCache.remove('devices');
                myCache.remove('profiles');
                //dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            });
        }

    };
    /**
     * Redirect to module config
     */
    $scope.toModule = function(id, target) {
        $('.modal').remove();
        $('.modal-backdrop').remove();
        $('body').removeClass("modal-open");
        $location.path('module/put/' + id);
    };
    /**
     * Run command
     */
    $scope.runCmd = function(cmd) {
        dataFactory.runCmd(cmd);
        return;
    };
    /**
     * Run command exact value
     */
    $scope.runCmdExact = function(id, type, min, max) {
        var count;
        var val = parseInt($scope.levelVal[id]);
        var min = parseInt(min, 10);
        var max = parseInt(max, 10);
        switch (type) {
            case '-':
                count = val - 1;
                break;
            case '+':
                count = val + 1;
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
        $scope.levelVal[id] = count;
        var cmd = id + '/command/exact?level=' + $scope.levelVal[id];
        console.log(cmd);
        dataFactory.runCmd(cmd);
        return;
    };

    /// --- Private functions --- ///
    /**
     * Save device id into profile
     */
    function saveDeviceIdIntoProfile(data, profileData) {
        if (data.error == null) {
            dataFactory.putApiData('profiles', profileData.id, profileData, function(data) {
            });
        }
        return;
    }
});
/**
 * Event controller
 */
myAppController.controller('EventController', function($scope, $routeParams, dataFactory, dataService) {
    $scope.collection = [];
    $scope.eventLevel = [];
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        dataFactory.cancelApiDataInterval();
    });

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getApiData('notifications', function(data) {
            $scope.eventLevel = dataService.getEventLevel(data.data.notifications);
            var filter = null;
            if (angular.isDefined($routeParams.param) && angular.isDefined($routeParams.val)) {
                filter = $routeParams;
                angular.forEach(data.data.notifications, function(v, k) {
                    if (filter && angular.isDefined(v[filter.param])) {
                        if (v[filter.param] == filter.val) {
                            $scope.collection.push(v);
                        }
                    }
                });
            } else {
                $scope.collection = data.data.notifications;
            }

            //console.log($scope.eventLevel);
        });
    };
    $scope.loadData();
    /**
     * Update data into collection
     */
    $scope.updateData = function() {
        dataFactory.updateApiData('notifications', function(data) {
            angular.forEach(data.data.notifications, function(v, k) {
                $scope.collection.push(v);
            });
            //console.log(data.data.notifications);
        });
    };
    $scope.updateData();
});
/**
 * Profile controller
 */
myAppController.controller('ProfileController', function($scope, $window, $cookies, dataFactory) {
    $scope.collection = [];
    $scope.targetColor = '#6C7A89';
    $scope.input = {
        "id": null,
        "active": "false",
        "name": null,
        "description": null,
        "lang": 'en',
        "positions": [],
        "color": null,
        "groups": {
            "instances": []
        }

    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    dataFactory.setCache(true);
    $scope.loadData = function() {
        dataFactory.getApiData('profiles', function(data) {
            $scope.collection = data.data;
        });
    };
    $scope.loadData();
    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        //var profileLang = (angular.fromJson($cookies.profileLang) ? angular.fromJson($cookies.profileLang) : []);
        var inputData = {
            "id": input.id,
            "name": input.name,
            "active": input.active,
            "lang": input.lang

        };
        if (input.id) {
            dataFactory.putApiData('profiles', input.id, inputData, function(data) {
                $scope.collection.push = data.data;
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            });
        } else {
            dataFactory.postApiData('profiles', inputData, function(data) {
                $scope.collection.push = data.data;
                dataFactory.setCache(false);
                $scope.loadData();
                input.id = data.data.id

            });
        }
//        if (profileLang.length > 0) {
//            angular.forEach(profileLang, function(v, k) {
//                if (v['id'] != input.id) {
//                    profileLang.push({'id': input.id, 'lang': input.lang});
//                }
//            });
//        } else {
//            profileLang.push({'id': input.id, 'lang': input.lang});
//        }
//         $cookies.profileLang = angular.toJson(profileLang);

    };
    /**
     * Delete an item
     */
    $scope.delete = function(target, input, dialog, except) {
        if (input.id == except) {
            return;
        }
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApiData('profiles', input.id, target);
            dataFactory.setCache(false);
            $scope.loadData();
        }
    };
});
/**
 * App controller
 */
myAppController.controller('AppController', function($scope, $window, dataFactory, dataService) {
    $scope.instances = [];
    $scope.modules = [];
    $scope.categories = [];
    $scope.activeTab = 'local';
    $scope.category = '';
    $scope.showFooter = true;
    $scope.showInFooter = {
        'categories': true,
        'serach': true
    };
    $scope.input = {
        'id': null,
        'name': null
    };
    $scope.reset = function() {
        $scope.instances = angular.copy([]);
        $scope.modules = angular.copy([]);
    };

    /**
     * Load data into collections
     */
    dataFactory.setCache(true);
    $scope.loadCategories = function() {
        dataFactory.getApiData('modules_categories', function(data) {
            $scope.categories = data.data;
        });
    };
    $scope.loadCategories();
    $scope.loadModules = function(filter) {
        dataFactory.getApiData('modules', function(data) {
            $scope.modules = dataService.getData(data.data, filter);
            console.log(filter);


        });
//        dataFactory.localData('apps.json', function(data) {
//            //$scope.modules = data;
//        });
    };
    $scope.loadInstances = function() {
        dataFactory.getApiData('instances', function(data) {
            $scope.instances = data.data;
        });
    };

    /**
     * Set tab
     */
    $scope.setTab = function(tabId) {
        $scope.activeTab = tabId;
    };

    // Watch for tab change
    $scope.$watch('activeTab', function() {
        switch ($scope.activeTab) {
            case 'instance':
                $scope.showInFooter.categories = false;
                $scope.loadInstances();

                break;
            default:
                $scope.showInFooter.categories = true;
                $scope.$watch('category', function() {
                    $scope.modules = angular.copy([]);
                    var filter = false;
                    if ($scope.category != '') {
                        filter = {
                            'filter': 'category',
                            'val': $scope.category
                        };
                    }
                    $scope.loadModules(filter);
                });
                break;
        }
    });

    /**
     * Show modal window
     */
    $scope.showInstanceModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
    /**
     * Show modal window for activate
     */
    $scope.showActivateModal = function(target, input) {
        console.log('Acivate func');
        $scope.input = input;
        $(target).modal();
    };

    /**
     * Ictivate instance
     */
    $scope.activateInstance = function(input) {
        var inputData = {
            'id': input.id,
            'active': input.active
        };
        if (input.id) {
            dataFactory.putApiData('instances', input.id, inputData, function(data) {
                //$scope.instance.push = data.data;
                dataFactory.setCache(false);
                $scope.loadInstances();
                //$route.reload();
            });
        }

    };

    /**
     * Ictivate instance
     */
    $scope.deleteInstance = function(target, input, dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApiData('instances', input.id, target);
            dataFactory.setCache(false);
            //$scope.loadData();
        }
    };


    /**
     * Create an item
     */
    $scope.create = function(input) {
        if (input.id === null) {
            $scope.collection.push(input);
        }
        console.log(input);
    };
});
/**
 * App controller - add module
 */
myAppController.controller('AppModuleController', function($scope, $routeParams, $filter, $location, dataFactory, dataService) {
    $scope.showForm = false;
    $scope.success = false;
    $scope.input = {
        'id': 0,
        'active': true,
        'moduleId': null,
        'title': null,
        'description': null,
        'moduleTitle': null,
        'params': {},
        'moduleInput': false
    };

    // Post new module instance
    $scope.postModule = function(id) {
        var module;
        dataFactory.getApiData('modules', function(modules) {
            module = dataService.getRowBy(modules.data, 'id', id);
            if (!module) {
                return;
            }
            dataFactory.getApiData('namespaces', function(namespaces) {
                $scope.input = {
                    //'id': instance.id,
                    'active': true,
                    'title': $filter('hasNode')(module, 'defaults.title'),
                    'description': $filter('hasNode')(module, 'defaults.description'),
                    'moduleTitle': $filter('hasNode')(module, 'defaults.title'),
                    'moduleId': module.id,
                    'category': module.category,
                    //'params': instance.params,
                    'moduleInput': dataService.getModuleConfigInputs(module, null, namespaces.data)
                };
                //console.log($scope.input)

                $scope.showForm = true;
            });
        });
        console.log('Add new module: ' + id);
    };

    // Put module instance
    $scope.putModule = function(id) {
        if (id < 1) {
            return;
        }
        var instance;
        var module;
        dataFactory.getApiData('instances', function(data) {
            instance = dataService.getRowBy(data.data, 'id', id);
            if (!instance) {
                return;
            }
            dataFactory.getApiData('modules', function(modules) {
                module = dataService.getRowBy(modules.data, 'id', instance.moduleId);
                dataFactory.getApiData('namespaces', function(namespaces) {
                    $scope.input = {
                        'id': instance.id,
                        'moduleId': module.id,
                        'active': instance.active,
                        'title': instance.title,
                        'description': instance.description,
                        'moduleTitle': $filter('hasNode')(module, 'defaults.title'),
                        'params': instance.params,
                        'moduleInput': dataService.getModuleConfigInputs(module, instance.params, namespaces.data)
                    };
                    //console.log($scope.input)
                    $scope.showForm = true;
                });
            });

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
     * Store data
     */
    $scope.store = function(input) {
        var params = {};
        angular.forEach(input.moduleInput, function(v, k) {
            if (angular.isArray(v.value)) {
                params[v.inputName] = v.value.filter(function(e) {
                    return e
                });
            } else {
                params[v.inputName] = v.value;
            }

        });

        var inputData = {
            'id': input.id,
            'moduleId': input.moduleId,
            'active': input.active,
            'title': input.title,
            'description': input.description,
            'params': params
        };

        //return;
        if (input.id > 0) {
            dataFactory.putApiData('instances', input.id, inputData, function(data) {
                $scope.success = true;
            });
        } else {
            dataFactory.postApiData('instances', inputData, function(data) {
                $location.path('/apps');
            });
        }

    };

    /**
     * Update instance
     */
    $scope.putModule = function(form, input) {
        var data = $(form).serializeArray();
        var params = {};
        angular.forEach(data, function(v, k) {
            if (angular.isDefined(input.params[v.name])) {
                params[v.name] = v.value;
            }

        });

        var inputData = {
            'id': input.id,
            'title': input.title,
            //'description': input.description,
            'params': params
        };
        if (input.id) {
            dataFactory.putApiData('instances', input.id, inputData, function(data) {
                dataFactory.setCache(false);
                $scope.loadInstances();
            });
        }

    };

});
/**
 * Device controller
 */
myAppController.controller('DeviceController', function($scope, $routeParams, dataFactory, dataService) {
    $scope.zwaveDevices = [];
    $scope.zwaveDevicesFilter = false;
    $scope.deviceVendor = false;
    $scope.manufacturers = [];
    $scope.manufacturer = false;

    $scope.ipcameraDevices = [];

    if (angular.isDefined($routeParams.type)) {
        $scope.deviceVendor = $routeParams.type;
    }
    /**
     * Set filter
     */
    $scope.setFilter = function(filter) {
        $scope.zwaveDevicesFilter = filter;
    };
    /**
     * Load z-wave devices
     */
    $scope.loadZwaveDevices = function(filter) {
        dataFactory.localData('z_en.json', function(data) {
            $scope.manufacturers = dataService.getPairs(data, 'ZManufacturersName', 'ZManufacturersImage', 'manufacturers');
            if (filter) {
                $scope.zwaveDevices = dataService.getData(data, filter);
                $scope.manufacturer = filter.val;
            }
        });
    };

    /**
     * Load ip cameras
     */
    $scope.loadIpcameras = function() {
        dataFactory.getApiData('modules', function(data) {
            $scope.ipcameraDevices = dataService.getData(data.data, {filter: "category", val: "surveillance"});
        });
    };

    $scope.$watch('deviceVendor', function() {
        switch ($scope.deviceVendor) {
            case 'zwave':
                $scope.$watch('zwaveDevicesFilter', function() {
                    $scope.loadZwaveDevices($scope.zwaveDevicesFilter);
                });
                break;
            case 'ipcamera':
                $scope.loadIpcameras();
                break;
            case 'enocean':
                break;
            default:
                break;
        }
    });
});
/**
 * Device controller
 */
myAppController.controller('IncludeController', function($scope, $filter, $routeParams, $timeout, dataFactory, dataService) {
    $scope.device = {
        'data': null
    };
    $scope.controllerState = 0;
    $scope.zwaveApiData = [];
    $scope.includedDeviceId = null;
    $scope.lastIncludedDevice = null;
    $scope.lastExcludedDevice = null;
    $scope.hasBattery = false;
    $scope.inclusionError = false;
    $scope.messages = {
        "nm_controller_state_0": "Controller is in normal mode",
        "nm_controller_state_1": "Ready to include.",
        "nm_controller_state_2": "Device found, please wait...",
        "nm_controller_state_3": "Including device, please wait...",
        "nm_controller_state_4": "Device included.",
        "nm_controller_state_5": "Ready to exclude.",
        "nm_controller_state_6": "Device found, please wait...",
        "nm_controller_state_7": "Device excluded.",
        "nm_controller_state_8": "Ready to be (re-)included in the network.",
        "nm_controller_state_9": "(Re-)inclusion started.",
        "nm_controller_state_10": "Controller found, please wait...",
        "nm_controller_state_11": "(Re-)including myself in network, please wait...",
        "nm_controller_state_12": "Controller was (re-)included in network.",
        "nm_controller_state_13": "Ready to include new primary. Press a button on the device to be included.",
        "nm_controller_state_14": "Device found, please wait...",
        "nm_controller_state_15": "Including new primary, please wait...",
        "nm_controller_state_16": "Device included as primary.",
        "nm_controller_state_17": "Canceling.",
        "nm_controller_state_18": "Replace Failed Node process started.",
        "nm_controller_state_19": "Replace Failed Node ready to include replacement device."
    };
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        dataFactory.cancelApiDataInterval();
    });
    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        // Get device from JSON
        if (angular.isDefined($routeParams.device)) {
            dataFactory.localData('z_en.json', function(devices) {
                $scope.device.data = devices[$routeParams.device];

            });
        }

        // Get ZwaveApiData
        dataFactory.updateZwaveApiData(function(data) {
            if ('controller.data.controllerState' in data) {
                $scope.controllerState = data['controller.data.controllerState'].value;
                //console.log($scope.controllerState);
            }
            if ('controller.data.lastExcludedDevice' in data) {
                $scope.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            }
            if ('controller.data.lastIncludedDevice' in data) {
                var deviceIncId = data['controller.data.lastIncludedDevice'].value;
                if (deviceIncId != null) {
                    var givenName = 'Device_' + deviceIncId;
                    var cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                    dataFactory.runZwaveCmd(cmd);
                    $scope.includedDeviceId = deviceIncId;
                }
            }
        });
    };

    $scope.loadData();

    // Watch for last excluded device
    $scope.$watch('includedDeviceId', function() {
        if ($scope.includedDeviceId) {
            var timeOut;
            timeOut = $timeout(function() {
                dataFactory.getZwaveApiData(function(ZWaveAPIData) {
                    var interviewDone = true;
                    var nodeId = $scope.includedDeviceId;
                    if (ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value && ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length) {
                        for (var iId in ZWaveAPIData.devices[nodeId].instances)
                            for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses)
                                if (!ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId].data.interviewDone.value) {
                                    interviewDone = false;
                                }
                    } else {
                        interviewDone = false;
                    }
                    if (interviewDone) {
                        $scope.lastIncludedDevice = 'Device_' + nodeId;
                    } else {
                        $scope.inclusionError = false;
                    }

                    $scope.includedDeviceId = null;
                    console.log(ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value);
                    console.log(ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length);
                });

            }, 10000);
        }
    });

    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function(cmd) {
        $scope.lastIncludedDevice = null;
        $scope.lastExcludedDevice = null;
        dataFactory.runZwaveCmd(cmd);

    };


});
/**
 * Room controller
 */
myAppController.controller('RoomController', function($scope, dataFactory) {
    $scope.collection = [];
    $scope.upload = {
        'showProgress': false,
        'progressVal': 0
    };
    $scope.showProgress = false;
    $scope.input = {
        'id': null,
        'name': null
    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getApiData('locations', function(data) {
            $scope.collection = data.data;
        });
    };
    $scope.loadData();
    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
});
/**
 * Room config controller
 */
myAppController.controller('RoomConfigController', function($scope, $window, $interval, $upload, cfg, dataFactory, dataService) {
    $scope.collection = [];
    $scope.devicesAssigned = [];
    //$scope.devicesAvailable = [];
    $scope.devicesToRemove = [];
    $scope.upload = {
        'showProgress': false,
        'progressVal': 0
    };
    $scope.defaultImages = [
        'kitchen.jpg',
        'bathroom.jpg',
        'sleeping_room.jpg',
        'living_room.jpg'
    ];
    $scope.showProgress = false;
    $scope.input = {
        'id': null,
        'title': null,
        'icon': null
    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    dataFactory.setCache(true);
    $scope.loadData = function() {
        dataFactory.getApiData('locations', function(data) {
            $scope.collection = data.data;
        });
    };
    $scope.loadData();


    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.loadDevices = function() {
            dataFactory.getApiData('devices', function(data) {
                $scope.devices = dataService.getDevices(data.data.devices, false, false, false, input.id);
                $scope.devicesAssigned = dataService.getDevices(data.data.devices, {filter: "location", val: input.id});

            });
        };
        $scope.loadDevices();
        $scope.input = input;
        $(target).modal();
    };
    /**
     * Create/Update an item
     */
    $scope.store = function(input) {
        var inputData = {
            "id": input.id,
            "title": input.title,
            "icon": input.icon
        };

        if (input.id) {
            dataFactory.putApiData('locations', input.id, inputData, function(data) {
                $scope.collection.push = data.data;
                $scope.saveRoomIdIntoDevice(data, $scope.devicesAssigned);
                $scope.removeRoomIdFromDevice(data, $scope.devicesToRemove);
                dataFactory.setCache(false);
                $scope.loadData();
            });
        } else {
            dataFactory.postApiData('locations', inputData, function(data) {
                $scope.collection.push = data.data;
                $scope.saveRoomIdIntoDevice(data, $scope.devicesAssigned);
                $scope.removeRoomIdFromDevice(data, $scope.devicesToRemove);
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            });
        }
        return;

    };
    /**
     * Delete an item
     */
    $scope.delete = function(target, input, dialog) {
        var confirm = true;
        if (dialog) {
            confirm = $window.confirm(dialog);
        }
        if (confirm) {
            dataFactory.deleteApiData('locations', input.id, target);
            dataFactory.getApiData('devices', function(data) {
                var devices = dataService.getDevices(data.data.devices, {filter: "location", val: input.id});
                $scope.removeRoomIdFromDevice({'error': null}, devices);

            });
            dataFactory.setCache(false);
            $scope.loadData();
        }
    };
    /**
     * Assign device to room
     */
    $scope.assignDevice = function(id, selector, assign) {
        $(selector).toggleClass('hidden-device');
        $('#device_assigned_' + id).toggleClass('hidden-device');
        $scope.devicesAssigned.push(assign);
        return;

    };
    /**
     * Remove device from the room
     */
    $scope.removeDevice = function(id, selector, deviceId) {
        $(selector).toggleClass('hidden-device');
        $('#device_unassigned_' + id).toggleClass('hidden-device');
        var oldList = $scope.devicesAssigned;
        $scope.devicesAssigned = [];
        angular.forEach(oldList, function(v, k) {
            if (v.id != deviceId) {
                $scope.devicesAssigned.push(v);
            } else {
                $scope.devicesToRemove.push(v);
            }
        });
        return;
    };

    /**
     * Save room id into device
     */
    $scope.saveRoomIdIntoDevice = function(data, devices) {
        if (data.error == null) {
            angular.forEach(devices, function(v, k) {
                dataFactory.putApiData('devices', v.id, {'location': data.data.id}, function(data) {
                    //console.log(data);
                });
            });
        }
        return;

    };

    /**
     * Remove room id from device
     */
    $scope.removeRoomIdFromDevice = function(data, devices) {
        if (data.error == null) {
            angular.forEach(devices, function(v, k) {
                dataFactory.putApiData('devices', v.id, {'location': null}, function(data) {
                    // console.log(data);
                });
            });
        }
        return;

    };

    /**
     * Upload image
     */
    $scope.uploadImage = function($files) {
        $scope.showProgress = true;
        $scope.upload.showProgress = true;
        var url = 'upload.php';
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];
            $upload.upload({
                url: url,
                fileFormDataName: 'config_backup',
                file: $file
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                console.log(data);
            });
        }
        var countUp = function() {

            $scope.upload.progressVal += 5;
            if ($scope.upload.progressVal == 100) {
                $interval.cancel(progress);
                $scope.upload.showProgress = false;
                $scope.upload.progressVal = 0;
            }
        };
        var progress = $interval(countUp, 100);
    };
});
/**
 * Network controller
 */
myAppController.controller('NetworkController', function($scope, cfg, dataFactory, dataService) {
    $scope.batteries = [];
    $scope.reset = function() {
        $scope.batteries = angular.copy([]);
    };

    $scope.loadData = function() {
        dataFactory.getApiData('devices', function(data) {
            $scope.batteries = dataService.getData(data.data.devices, {filter: "deviceType", val: 'battery'});

        });
    };
    $scope.loadData();
});
/**
 * About controller
 */
myAppController.controller('AboutController', function($scope, dataFactory) {

});

