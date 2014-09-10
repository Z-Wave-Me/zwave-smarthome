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
    /**
     * 
     * Mobile detect
     */
    $scope.isMobile = false;
     $scope.mobileCheck = function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            $scope.isMobile = true;
        }
    };
    $scope.mobileCheck(navigator.userAgent || navigator.vendor || window.opera);
    
    /**
     * Hide collapsed navi after click on mobile devices
     */
     $("#main_navbar .nav-control").click(function(event) {
        // check if window is small enough so dropdown is created
    $("#nav_collapse").removeClass("in").addClass("collapse");
    });
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
     * Slider options
     */
    $scope.slider = {
        modelMax: 38
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