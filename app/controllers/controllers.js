/**
 * Application controllers
 * @author Martin Vach
 */

/*** Controllers ***/
var myAppController = angular.module('myAppController', []);
/**
 * Base controller
 */
myAppController.controller('BaseController', function($scope, $cookies, $filter, $location, $route, cfg, dataFactory, deviceService, langFactory, langTransFactory) {
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
        'lang': 'en'
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
        var lang_file = (cfg.lang_list.indexOf(lang) > -1 ? lang : cfg.lang);
        langFactory.get(lang_file).query(function(data) {
            $scope.languages = data;
            return;
        });
    };
    // Get language lines
    $scope._t = function(key) {
        return langTransFactory.get(key, $scope.languages);
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
        dataFactory.getProfiles(function(data) {
            $scope.navpPofiles = data.data;
        });
//        dataFactory.demoData('profiles.json', function(data) {
//            $scope.navpPofiles = data;
//        });
    };
    $scope.loadBaseData();
    /**
     * Get body ID
     */
    $scope.getBodyId = function() {
        var path = $location.path().split('/');
        if(path[1] == 'elements'){
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
            
        }else{
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
    $scope.isMobile = deviceService.isMobile(navigator.userAgent || navigator.vendor || window.opera);
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
        if (data.lanf) {
            $scope.profile.lang = data.lang;
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
myAppController.controller('TestController', function($scope, dataFactory) {
    $scope.collection = [];
    $scope.targetColor = '#ccc';
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };
    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        //dataFactory.demoData('elements.json', function(data) {
        dataFactory.getDevices(function(data) {
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
myAppController.controller('HomeController', function($scope, dataFactory, deviceService) {

});
/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, dataFactory, deviceService) {
    $scope.collection = [];
    $scope.showFooter = true;
    $scope.deviceType = [];
    $scope.levelVal = [];
    $scope.input = {
        'id': null,
        'metrics': null,
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

    /**
     * Load data into collection
     */
    dataFactory.setCache(true);
    $scope.loadData = function() {
        dataFactory.getDevices(function(data) {
            var filter = null;
            $scope.deviceType = deviceService.getDeviceType(data.data.devices);
            if (angular.isDefined($routeParams.filter) && angular.isDefined($routeParams.val)) {
                switch ($routeParams.filter) {
                    case 'dashboard':
                        $scope.showFooter = false;
                        filter = {filter: "onDashboard", val: true};
                        break;
                    case 'deviceType':
                        filter = $routeParams;
                        break;
                    case 'location':
                        $scope.showFooter = false;
                        filter = $routeParams;
                        dataFactory.getLocations(function(rooms) {
                            //getRowBy(data, key, val, cache);
                            var room = deviceService.getRowBy(rooms.data, 'id', $routeParams.val, 'room_' + $routeParams.val);
                            if (room) {
                                $scope.headline = $scope._t('lb_devices_room') + ': ' + room.title;
                            }
                        });
                        break;
                    default:
                        break;
                }
                //console.log($routeParams.filter,$routeParams.val)
            }
            $scope.collection = deviceService.getDevices(data.data.devices, filter);
        });
    };
    $scope.loadData();
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
     * Update an item
     */
    $scope.store = function(input) {
        var inputData = {
            'id': input.id,
            'tags': deviceService.setDeviceTags(input.tags,'dashboard',input.dashboard),
            'permanently_hidden': input.permanently_hidden,
            'metrics': input.metrics
        };
        inputData.metrics.title = input.title;
        if (input.id) {
            dataFactory.putDevice(function(data) {
                //$scope.collection.push = data.data;
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            }, input.id, inputData);
        }

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
});
/**
 * Event controller
 */
myAppController.controller('EventController', function($scope, $routeParams, dataFactory, deviceService) {
    $scope.collection = [];
    $scope.eventLevel = [];
    $scope.demo = [];
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };
    /**
     * Load demo data
     */
    $scope.loadDemoData = function() {
        dataFactory.demoData('events.json', function(data) {
            $scope.demo = data.data.notifications;
        });
    };
    //$scope.loadDemoData();

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getNotifications(function(data) {
            $scope.eventLevel = deviceService.getEventLevel(data.data.notifications);
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
});
/**
 * Profile controller
 */
myAppController.controller('ProfileController', function($scope, $window, $route, dataFactory) {
    $scope.demo = [];
    $scope.collection = [];
    $scope.targetColor = '#6C7A89';
    $scope.input = {
        "id": null,
        "active": "false",
        "name": null,
        "description": null,
        "lang": 'en',
        "positions": [
            "ZWayVDev_2:0:49:4",
            "ZWayVDev_2:0:50:0"
        ],
        "color": null,
        "groups": {
            "instances": []
        }

    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };
    /**
     * Load demo data
     */
    $scope.loadDemoData = function() {
        dataFactory.demoData('profiles.json', function(data) {
            $scope.demo = data;
        });
    };
    //$scope.loadDemoData();

    /**
     * Load data into collection
     */
    dataFactory.setCache(true);
    $scope.loadData = function() {
        dataFactory.getProfiles(function(data) {
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
        var inputData = {
            "id": input.id,
            "name": input.name,
            "active": input.active,
            "lang": input.lang,
            "positions": [
                "ZWayVDev_2:0:49:4",
                "ZWayVDev_2:0:50:0"
            ]

        };
        if (input.id) {
            dataFactory.putProfile(function(data) {
                $scope.collection.push = data.data;
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            }, input.id, inputData);
        } else {
            dataFactory.postProfile(function(data) {
                $scope.collection.push = data.data;
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            }, inputData);
        }

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
            dataFactory.deleteProfile(input.id, input, target);
            dataFactory.setCache(false);
            $scope.loadData();
        }
    };
});
/**
 * App controller
 */
myAppController.controller('AppController', function($scope, $window, dataFactory) {
    $scope.collection = [];
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
        dataFactory.demoData('apps.json', function(data) {
            $scope.collection = data;
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
     * Show modal window for activate
     */
    $scope.showActivateModal = function(target, input) {
        console.log('Acivate func');
        $scope.input = input;
        $(target).modal();
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
    /**
     * Delete an item
     */
    $scope.delete = function(target, input) {
        var confirm = $window.confirm('Are you absolutely sure you want to delete?');
        if (confirm) {
            console.log('Removing: ' + target);
            $(target).fadeOut();
        }
    };
});
/**
 * Device controller
 */
myAppController.controller('DeviceController', function($scope, $window, $interval, dataFactory) {
    $scope.collection = [];
    $scope.status = 1;
    $scope.status2 = 1;
    $scope.goDevice = false;
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
        dataFactory.demoData('devices.json', function(data) {
            $scope.collection = data;
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
     * Create an item
     */
    $scope.addDevice = function(input) {
        $scope.status = 2;
        var countUp = function() {
            $scope.status = 3;
        };
        var progress = $interval(countUp, 3000);
    };
    $scope.addDevice2 = function(input) {
        console.log('dfdfdfdfdf')
        var progress2;
        var countUp1 = function() {
            $scope.status2 = 2;
            progress2 = $interval(countUp2, 6000);
        };
        var progress = $interval(countUp1, 3000);
        var countUp2 = function() {
            $scope.status2 = 3;
            $interval.cancel(progress2);
            $interval.cancel(progress);
        };
    };
    /**
     * Delete an item
     */
    $scope.delete = function(target, input) {
        var confirm = $window.confirm('Are you absolutely sure you want to delete?');
        if (confirm) {
            console.log('Removing: ' + target);
            $(target).fadeOut();
        }
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
        dataFactory.getLocations(function(data) {
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
myAppController.controller('RoomConfigController', function($scope, $route, $window, $interval, $upload, dataFactory, deviceService) {
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
        dataFactory.getLocations(function(data) {
            $scope.collection = data.data;
        });
    };
    $scope.loadData();


    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.loadDevices = function() {
            dataFactory.getDevices(function(data) {
                $scope.devices = deviceService.getDevices(data.data.devices);
                $scope.devicesAssigned = deviceService.getDevices(data.data.devices,{filter: "location", val: input.id});

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
            dataFactory.putLocation(function(data) {
                $scope.collection.push = data.data;
                $scope.saveRoomIdIntoDevice(data,$scope.devicesAssigned);
                $scope.removeRoomIdFromDevice(data,$scope.devicesToRemove);
                dataFactory.setCache(false);
                $scope.loadData();
            }, input.id, inputData);
        } else {
            dataFactory.postLocation(function(data) {
                $scope.collection.push = data.data;
                $scope.saveRoomIdIntoDevice(data,$scope.devicesAssigned);
                $scope.removeRoomIdFromDevice(data,$scope.devicesToRemove);
                dataFactory.setCache(false);
                $scope.loadData();
                //$route.reload();
            }, inputData);
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
            dataFactory.deleteLocation(input.id, input, target);
            dataFactory.getDevices(function(data) {
               var devices = deviceService.getDevices(data.data.devices,{filter: "location", val: input.id});
               $scope.removeRoomIdFromDevice({'error':null},devices);

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
            }else{
                $scope.devicesToRemove.push(v);
            }
        });
        return;
    };

    /**
     * Save room id into device
     */
    $scope.saveRoomIdIntoDevice = function(data,devices) {
        if (data.error == null) {
            angular.forEach(devices, function(v, k) {
                dataFactory.putDevice(function(data) {
                    //console.log(data);
                }, v.id, {'location': data.data.id});
            });
        }
        return;

    };
    
    /**
     * Remove room id from device
     */
    $scope.removeRoomIdFromDevice = function(data,devices) {
        if (data.error == null) {
            angular.forEach(devices, function(v, k) {
                dataFactory.putDevice(function(data) {
                   // console.log(data);
                }, v.id, {'location': null});
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
myAppController.controller('NetworkController', function($scope, dataFactory) {
    $scope.collection = [];
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };
    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.demoData('network_bateries.json', function(data) {
            $scope.collection = data;
        });
    };
    $scope.loadData();
});
/**
 * About controller
 */
myAppController.controller('AboutController', function($scope, dataFactory) {
    $scope.collection = [];
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };
    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.demoData('demo.json', function(data) {
            $scope.collection = data;
        });
    };
    $scope.loadData();
});

