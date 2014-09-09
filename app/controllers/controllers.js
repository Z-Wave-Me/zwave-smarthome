/**
 * Application controllers
 * @author Martin Vach
 */

/*** Controllers ***/
var myAppController = angular.module('myAppController', []);

/**
 * Base controller
 */
myAppController.controller('BaseController', function($scope, $cookies, $filter, $location, cfg, dataFactory, langFactory, langTransFactory) {
    /**
     * Global scopes
     */
    $scope.cfg = cfg;
    /**
     * Language settings
     */
    $scope.lang_list = cfg.lang_list;
    // Set language
    $scope.lang = (angular.isDefined($cookies.lang) ? $cookies.lang : cfg.lang);
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
     * Set data (menu etc)
     */
    $scope.events = [];
    $scope.profiles = [];
    $scope.loadData = function() {
        dataFactory.demoData('events.json', function(data) {
            $scope.events = data.data.notifications;
        });
        dataFactory.demoData('profiles.json', function(data) {
            $scope.profiles = data;
        });
    };
    $scope.loadData();

    /**
     * Get body ID
     */
    $scope.getBodyId = function() {
        var path = $location.path().split('/');
        return path[1];
    };

    /**
     * Get body ID
     */
    $scope.footer = 'Home footer';
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
        dataFactory.demoData('elements.json', function(data) {
            $scope.collection = data;

        });
    };
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
myAppController.controller('HomeController', function($scope, $location, dataFactory, deviceService) {
    $scope.collection = [];
    $scope.hideFooter = true;
    $scope.widget = {
        'title': '',
        'dasboard': 0,
        'deviceType': null,
        'level': null
    };
    $scope.isSelected = true;
    $scope.onText = 'ON';
    $scope.offText = 'OFF';
    $scope.isActive = true;
    $scope.size = 'small';
    $scope.animate = false;
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.demoData('elements.json', function(data) {
            $scope.collection = deviceService.getDevices(data.data.devices);
        });
    };
    $scope.loadData();

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
     * Show modal window
     */
    $scope.showModal = function(target, widget) {
        $scope.widget = widget;
        $(target).modal();
    };
});

/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, dataFactory, deviceService) {
    $scope.collection = [];
    $scope.input = {
        'id': null,
        'title': '',
        'dasboard': 0,
        'deviceType': null,
        'level': null
    };

    $scope.isSelected = true;
    $scope.onText = 'ON';
    $scope.offText = 'OFF';
    $scope.isActive = true;
    $scope.size = 'small';
    $scope.animate = false;

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.demoData('elements.json', function(data) {
            $scope.collection = deviceService.getDevices(data.data.devices);
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
});

/**
 * Event controller
 */
myAppController.controller('EventController', function($scope, dataFactory) {
    $scope.collection = [];
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.demoData('events.json', function(data) {
            $scope.collection = data.data.notifications;
        });
    };
    $scope.loadData();
});

/**
 * Profile controller
 */
myAppController.controller('ProfileController', function($scope, $window, dataFactory) {
    $scope.collection = [];
    $scope.targetColor = '#cccccc';
    $scope.input = {
        'id': null,
        'name': null,
        'description': null,
        'color': null
    };
    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };



    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.demoData('profiles.json', function(data) {
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
myAppController.controller('RoomController', function($scope, $window, $interval, $upload, dataFactory, deviceService) {
    $scope.collection = [];
    $scope.devices = [];
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
        dataFactory.demoData('rooms.json', function(data) {
            $scope.collection = data;
        });
    };
    $scope.loadData();



    /**
     * Load data into collection
     */
    $scope.loadDevices = function() {
        dataFactory.demoData('elements.json', function(data) {
            $scope.devices = deviceService.getDevices(data.data.devices);
        });
    };
    $scope.loadDevices();

    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };
});

/**
 * Room device controller
 */
myAppController.controller('RoomDeviceController', function($scope, $routeParams, dataFactory, deviceService) {
    $scope.collection = [];
    $scope.rooms = [];
    $scope.roomName = '';

    $scope.isSelected = true;
    $scope.onText = 'ON';
    $scope.offText = 'OFF';
    $scope.isActive = true;
    $scope.size = 'small';
    $scope.animate = false;

    $scope.reset = function() {
        $scope.collection = angular.copy([]);
    };

    /**
     * Load data into collection
     */
    $scope.load = function() {
        dataFactory.demoData('elements.json', function(data) {
            $scope.collection = deviceService.getDevices(data.data.devices);
        });
        dataFactory.demoData('rooms.json', function(data) {
            $scope.rooms = data;
            angular.forEach(data, function(v, k) {

                if (v.id == $routeParams.id) {
                    $scope.roomName = v.name;
                    return;
                }
            });

        });
    };
    $scope.load();

    /**
     * Show modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };

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
});

/**
 * Room config controller
 */
myAppController.controller('RoomConfigController', function($scope, $window, $interval, $upload, dataFactory, deviceService) {
    $scope.collection = [];
    $scope.devices = [];
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
        dataFactory.demoData('rooms.json', function(data) {
            $scope.collection = data;
        });
    };
    $scope.loadData();

    /**
     * Load data into collection
     */
    $scope.loadDevices = function() {
        dataFactory.demoData('elements.json', function(data) {
            $scope.devices = deviceService.getDevices(data.data.devices);
        });
    };
    $scope.loadDevices();

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

    $scope.assignDevice = function(id, selector, assign) {

        $(selector).toggleClass('hidden-device');
        if (assign) {
            $('#device_assigned_' + id).toggleClass('hidden-device');
        } else {
            $('#device_unassigned_' + id).toggleClass('hidden-device');
        }
    };
    ;

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