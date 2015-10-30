/**
 * Application Element controller
 * @author Martin Vach
 */

/**
 * DragDrop controller
 */
myAppController.controller('DragDropController', function($scope, dataFactory) {
    $scope.models = {
        selected: null,
        list: []
    };

    // Generate initial model
    for (var i = 1; i <= 5; ++i) {
        $scope.models.list.push({label: "Item A" + i});
    }

    $scope.itemMoved = function(index) {
        $scope.models.list.splice(index, 1);
        angular.forEach($scope.models.list, function(v, k) {
            console.log((k + 1) + ': ', v.label)

        });
        console.log(index)
    };

    // Model to JSON for demo purpose
    $scope.$watch('models', function(model) {
        //console.log(model)
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);

    $scope.elements = {
        selected: null,
        list: []
    };
    ;
    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataFactory.getApi('devices').then(function(response) {
            $scope.elements.list = response.data.data.devices;
        }, function(error) {
        });
    };
    $scope.loadData();

    $scope.elementMoved = function(index) {
        $scope.elements.list.splice(index, 1);
        var sorting = [];
        angular.forEach($scope.elements.list, function(v, k) {
           sorting[v.id] = (k+1);
            dataFactory.putApi('devices', v.id, {position: index}).then(function(response) {
                //console.log((k + 1) + ': ', v.metrics.title);
            }, function(error) {
            });
         });
          console.log(sorting)
        //console.log(index)
    };

});

/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, $interval, $location, dataFactory, dataService, myCache,_) {
    $scope.welcome = false;
    $scope.goHidden = [];
    $scope.goHistory = [];
    $scope.apiDataInterval = null;
    $scope.multilineSensorsInterval = null;
    $scope.collection = [];
    $scope.showFooter = true;
    $scope.deviceType = [];
    $scope.tags = [];
    $scope.rooms = {};
    $scope.history = [];
    $scope.historyStatus = [];
    $scope.multilineDev = false;
    $scope.multilineSensors = false;
    $scope.doorLock = false;
    $scope.levelVal = [];
    $scope.rgbVal = [];
    $scope.goMutiLineHistory = [];
    $scope.multiLineHistory = [];
    $scope.chartOptions = {
        // Chart.js options can go here.
        //responsive: true
    };
    $scope.knobopt = {
        width: 100
    };
    $scope.alertabc = false;

    $scope.slider = {
        modelMax: 38
    };
    $scope.input = {
        'id': null,
        'metrics': null,
        'location': null,
        'tags': null,
        'permanently_hidden': false,
        'title': '',
        'dashboard': false,
        'deviceType': null,
        'level': null,
        'hide_events': false
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
        $interval.cancel($scope.multilineSensorsInterval);

        $('.modal').remove();
        $('.modal-backdrop').remove();
        $('body').removeClass("modal-open");
    });
    
     /**
     * Load locations
     */
    $scope.loadLocations = function() {
        dataFactory.getApi('locations').then(function(response) {
            angular.extend($scope.rooms,_.indexBy(response.data.data, 'id'));
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
     $scope.loadLocations();

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices',null,true).then(function(response) {
            
            var filter = null;
            var notFound = $scope._t('error_404');
            $scope.loading = false;
            if (response.data.data.devices.length < 1) {
                notFound = $scope._t('no_devices') + ' <a href="#devices"><strong>' + $scope._t('lb_include_device') + '</strong></a>';
                $scope.alert = {message: notFound, status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }
            $scope.deviceType = dataService.getDeviceType(response.data.data.devices);
            $scope.tags = dataService.getTags(response.data.data.devices);
            // Filter
            if (angular.isDefined($routeParams.filter) && angular.isDefined($routeParams.val)) {
                switch ($routeParams.filter) {
                    case 'dashboard':
                        $scope.showFooter = false;
                        filter = {filter: "onDashboard", val: true};
                        //notFound = $scope._t('no_devices_dashboard');
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
                        if (angular.isDefined($routeParams.val)&& !_.isEmpty($scope.rooms)) {
                            $scope.headline = $scope._t('lb_devices_room') + ' ' + ($routeParams.val == 0 ? $scope._t($scope.rooms[$routeParams.val].title) : $scope.rooms[$routeParams.val].title) ;
                        }
                        break; 
                    default:
                        break;
                }
            }
            var collection = dataService.getDevices(response.data.data.devices, filter, $scope.user.dashboard, null);
            if (collection.length < 1) {
                switch($routeParams.filter){
                   case 'dashboard':
                         $scope.welcome = true;
                        break;
                     case 'location':
                         if($scope.user.role === 1){
                             $location.path('/config-rooms/' + filter.val);
                         }else{
                            $scope.alert = {message: notFound, status: 'alert-warning', icon: 'fa-exclamation-circle'}; 
                         }
                        break;
                    default:
                        $scope.alert = {message: notFound, status: 'alert-warning', icon: 'fa-exclamation-circle'};
                        break;
                }
                
                //$scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-warning', message: notFound};
                
                return;
            }
            $scope.collection = collection;
            dataService.updateTimeTick(response.data.data.updateTime);
        }, function(error) {
            //console.log('After login: ',$routeParams.login)
            if (!angular.isDefined($routeParams.login)) {
                $location.path('/error/' + error.status);
            }
        });
    };
    $scope.loadData();

    /**
     * Refresh data
     */
    $scope.refreshData = function() {
        var refresh = function() {
            dataFactory.refreshApi('devices').then(function(response) {
                dataService.updateDevices(response.data);
                dataService.updateTimeTick(response.data.data.updateTime);
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    $scope.refreshData();
    
    /**
     * Load device history
     */
    $scope.loadDeviceHistory = function(deviceId) {
        $scope.goHistory[deviceId] = !$scope.goHistory[deviceId];
        $scope.history[deviceId] = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('history', '/' + deviceId + '?show=24', true).then(function(response) {
            if (!response.data.data.deviceHistory) {
                $scope.history[deviceId] = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
                return;
            }
            var data = dataService.getChartData(response.data.data.deviceHistory, $scope.cfg.chart_colors);
            $scope.history[deviceId] = {data: data};
        }, function(error) {
            $scope.history[deviceId] = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

    };
    /**
     * Load multiline device history
     */
    $scope.loadMultiLineDeviceHistory = function(deviceId) {
        $scope.goMutiLineHistory[deviceId] = !$scope.goHistory[deviceId];
        $scope.multiLineHistory[deviceId] = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('history', '/' + deviceId + '?show=24', true).then(function(response) {
            if (!response.data.data.deviceHistory) {
                $scope.multiLineHistory[deviceId] = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
                return;
            }
            var data = dataService.getChartData(response.data.data.deviceHistory, $scope.cfg.chart_colors);
            $scope.multiLineHistory[deviceId] = {data: data};
        }, function(error) {
            $scope.multiLineHistory[deviceId] = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

    };

    /**
     * Show camera modal window
     */
    $scope.showModal = function(target, input) {
        $scope.input = input;
        $(target).modal();
    };

    /**
     * Show Multiline Sensor modal window
     */
    $scope.loadMultilineSensor = function(target, id, input, sensors) {
        $(target).modal();
        $scope.input = input;
        $scope.multilineSensors = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices', '/' + id, true).then(function(response) {
            if (response.data.data.metrics[sensors]) {
                $scope.multiLineDev = {data: response.data.data};
                $scope.multilineSensors = {data: response.data.data.metrics[sensors]};
                $scope.refreshMultilineSensors(id, sensors);
            } else {
                $scope.multilineSensors = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
            }
        }, function(error) {
            $scope.multilineSensors = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

    };

    /**
     * Refresh multiline sensor data
     */
    $scope.refreshMultilineSensors = function(id, sensors) {
        var refresh = function() {
            dataFactory.getApi('devices', '/' + id, true).then(function(response) {
                if (response.data.data.metrics[sensors]) {
                    angular.extend($scope.multilineSensors.data, response.data.data.metrics[sensors]);
                    //$scope.multilineSensor.data = {data: response.data.data.metrics.sensors};
                }
            }, function(error) {
            });
        };
        $scope.multilineSensorsInterval = $interval(refresh, $scope.cfg.interval);
    };

    /**
     * Close multiline sensor window
     */
    $scope.closeMultilineSensor = function() {
        $interval.cancel($scope.multilineSensorsInterval);
    };

    /**
     * Show door lock modal window
     */
    $scope.loadDoorLock = function(target, id, input) {
        $(target).modal();
        $scope.input = input;
        $scope.doorLock = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        //dataFactory.getApi('devices', '/' + id, true).then(function(response) {
        dataFactory.getApi('devices', '/' + id, true).then(function(response) {
            if (response.data.data.metrics.events) {
                $scope.doorLock = {data: response.data.data};
            } else {
                $scope.doorLock = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
            }
        }, function(error) {
            $scope.doorLock = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

    };
    
    /**
     * Multiline climateControl
     */
    $scope.climateElementModes = ['off', 'esave', 'per_room'];
    /**
     * Show climate modal window
     */
    $scope.loadClimateControl = function(target, id, input) {
        $(target).modal();
        $scope.input = input;
        $scope.climateControl = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.climateControlModes = ['off', 'esave', 'comfort', 'time_driven'];
        $scope.climateControlMode = {};
        $scope.changeClimateControlProcess = {};
        //dataFactory.getApiLocal('_test/climate_control.json').then(function(response) {
         dataFactory.getApi('devices', '/' + id, true).then(function(response) {
            if (response.data.data.metrics.rooms) {
                $scope.climateControl = {data: response.data.data};
            } else {
                $scope.climateControl = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
            }
        }, function(error) {
            $scope.climateControl = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

    };

    /**
     * Change climate control mode
     */
    $scope.changeClimateControlMode = function(id) {
        //console.log($scope.climateControl.data.metrics.rooms);
        $scope.changeClimateControlProcess[id] = true;
        var room = _.findWhere($scope.climateControl.data.metrics.rooms, {id: id})
        console.log(room.title + ' changing mode to: ', $scope.climateControlMode[id])
        $timeout(function() {
            $scope.changeClimateControlProcess[id] = false;
        }, 3000);

    };
    /**
     * Run command
     */
    $scope.runCmd = function(cmd, id) {
        runCmd(cmd, id);
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

        var cmd = id + '/command/exact?level=' + count;
        //if (count < 100 && count > 0) {
        $scope.levelVal[id] = count;
        //}

        runCmd(cmd);
        return;
    };

    /**
     * Save color
     */
    $scope.setRBGColor = function(id, color) {
        var array = color.match(/\((.*)\)/)[1].split(',');
        var cmd = id + '/command/exact?red=' + array[0] + '&green=' + array[1] + '&blue=' + array[2];
        runCmd(cmd);
        myCache.remove('devices');
    };
    /**
     * Reset color
     */
    $scope.resetRBGColor = function(id, color) {
        $scope.rgbVal[id] = color;
    };

    /**
     * Process CMD
     */
    function runCmd(cmd, id) {
        var widgetId = '#Widget_' + id;
        dataFactory.runApiCmd(cmd).then(function(response) {
            $(widgetId + ' .widget-image').addClass('trans-true');
        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    }
});
/**
 * Element detail controller controller
 */
myAppController.controller('ElementDetailController', function($scope, $routeParams, $window, $location, dataFactory, dataService, myCache) {
    $scope.input = [];
    $scope.rooms = [];
    $scope.tagList = [];
    $scope.searchText = '';
    $scope.suggestions = [];
    $scope.autoCompletePanel = false;


    /**
     * Load data into collection
     */
    $scope.loadData = function(id) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices', '/' + id).then(function(response) {
            var devices = [];
            devices[0] = response.data.data;
            $scope.deviceType = dataService.getDeviceType(devices);
            $scope.tags = dataService.getTags(devices);
            // Loacations
            loadLocations();
            // Instances
            loadInstances(devices);

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData($routeParams.id);

    /**
     * Load tag list
     */
    $scope.loadTagList = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            angular.forEach(response.data.data.devices, function(v, k) {
                if (v.tags) {
                    angular.forEach(v.tags, function(t, kt) {
                        if ($scope.tagList.indexOf(t) === -1) {
                            $scope.tagList.push(t);
                        }

                    });
                }
            });

        }, function(error) {
            dataService.showConnectionError(error); 
        });
    };
    $scope.loadTagList();



    $scope.itemsSelectedArr = [];
    //$scope.itemsArr = [];

    $scope.searchMe = function(search) {
        $scope.suggestions = [];
        $scope.autoCompletePanel = false;
        if (search.length > 2) {
            var foundText = containsText($scope.tagList, search);
            $scope.autoCompletePanel = (foundText) ? true : false;
        }
    };


    /**
     * Add tag to list
     */
    $scope.addTag = function(searchText) {
        $scope.searchText = '';
        $scope.autoCompletePanel = false;
        if (!searchText || $scope.input.tags.indexOf(searchText) > -1) {
            return;
        }
        $scope.input.tags.push(searchText);
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function(index) {
        $scope.input.tags.splice(index, 1);
        $scope.autoCompletePanel = false;
    };

    /**
     * Update an item
     */
    $scope.store = function(input) {
        if (input.id) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            input.location = parseInt(input.location, 10);
            input.metrics.title = input.title;
            dataFactory.putApi('devices', input.id, input).then(function(response) {
                $scope.user.dashboard = dataService.setArrayValue($scope.user.dashboard, input.id, input.dashboard);
                $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, input.id, input.hide_events);
                updateProfile($scope.user, input.id);

            }, function(error) {
                alertify.alert($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };
    /**
     * Load locations
     */
    function loadLocations() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;
    /**
     * Load instances
     */
    function loadInstances(devices) {
        if (!$scope.elementAccess($scope.cfg.role_access.apps)) {
            var v = dataService.getDevices(devices, null, $scope.user.dashboard, false)[0];
            setInput(v, devices.updateTime);
            return;
        }
        dataFactory.getApi('instances').then(function(response) {
            var v = dataService.getDevices(devices, null, $scope.user.dashboard, response.data.data)[0];
            setInput(v, response.data.data.updateTime);

        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;

    /**
     * Update profile
     */
    function updateProfile(profileData, deviceId) {
        dataFactory.putApi('profiles', profileData.id, profileData).then(function(response) {
            dataService.setUser(response.data.data);
            $scope.loading = false;
            myCache.remove('devices');
            myCache.remove('devices/' + deviceId);
            myCache.remove('locations');
            $window.history.back();

        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    }

    /// --- Private functions --- ///
    /**
     * Set input
     */
    function setInput(v, updateTime) {
        if (v) {
            $scope.input = {
                'id': v.id,
                'title': v.title,
                'dashboard': v.onDashboard == true ? true : false,
                'location': v.location,
                'tags': v.tags,
                'deviceType': v.deviceType,
                'level': v.level,
                'metrics': v.metrics,
                'updateTime': v.updateTime,
                'cfg': v.cfg,
                'appType': v.appType,
                'permanently_hidden': v.permanently_hidden,
                //'rooms': $scope.rooms,
                'hide_events': false
            };
            dataService.updateTimeTick(updateTime);
        } else {
            alertify.alert($scope._t('no_data'));
            dataService.showConnectionError($scope._t('no_data'));
        }
    }
    ;
    /**
     * Load locations
     */
    function containsText(n, search) {
        var gotText = false;
        for (var i in n) {
            var re = new RegExp(search, "ig");
            var s = re.test(n[i]);
            if (s) {
                $scope.suggestions.push(n[i]);
                gotText = true;
            }
        }
        return gotText;
    }
    ;
});