/**
 * Application Element controller
 * @author Martin Vach
 */

/**
 * Element controller
 */
myAppController.controller('ElementController', function($scope, $routeParams, $interval, $location, dataFactory, dataService, myCache) {
    $scope.goHidden = [];
    $scope.goHistory = [];
    $scope.apiDataInterval = null;
    $scope.collection = [];
    $scope.showFooter = true;
    $scope.deviceType = [];
    $scope.tags = [];
    $scope.rooms = [];
    $scope.history = [];
    $scope.historyStatus = [];
    $scope.multilineSensor = false;
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
        $('.modal').remove();
        $('.modal-backdrop').remove();
        $('body').removeClass("modal-open");
    });

    /**
     * Load data into collection
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        //$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices').then(function(response) {
            var filter = null;
            var notFound = $scope._t('no_devices') + ' <a href="#devices">' + $scope._t('lb_include_device') + '</a>'
            $scope.loading = false;
            $scope.deviceType = dataService.getDeviceType(response.data.data.devices);
            $scope.tags = dataService.getTags(response.data.data.devices);
            // Filter
            if (angular.isDefined($routeParams.filter) && angular.isDefined($routeParams.val)) {
                switch ($routeParams.filter) {
                    case 'dashboard':
                        $scope.showFooter = false;
                        filter = {filter: "onDashboard", val: true};
                        notFound = $scope._t('no_devices_dashboard');
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
                        if (angular.isDefined($routeParams.name)) {
                            $scope.headline = $scope._t('lb_devices_room') + ' ' + $routeParams.name;
                        }
                        break;
                    default:
                        break;
                }
            }
            var collection = dataService.getDevices(response.data.data.devices, filter, $scope.user.dashboard, null);
            if (collection.length < 1) {
                $scope.loading = {status: 'loading-spin', icon: 'fa-exclamation-triangle text-warning', message: notFound};
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
    $scope.loadMultilineSensor = function(target, id, input) {
        $(target).modal();
        $scope.input = input;
        $scope.multilineSensor = {data: false, icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices', '/' + id, true).then(function(response) {
            if (response.data.data.metrics.sensors) {
                $scope.multilineSensor = {data: response.data.data};
            } else {
                $scope.multilineSensor = {data: false, icon: 'fa-info-circle text-warning', message: $scope._t('no_data')};
            }
        }, function(error) {
            $scope.multilineSensor = {data: false, icon: 'fa-exclamation-triangle text-danger', message: $scope._t('error_load_data')};
        });

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
            alert($scope._t('error_update_data'));
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
            alert($scope._t('error_load_data'));
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
                alert($scope._t('error_update_data'));
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
            alert($scope._t('error_update_data'));
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
                'permanently_hidden': v.permanently_hidden,
                //'rooms': $scope.rooms,
                'hide_events': false
            };
            dataService.updateTimeTick(updateTime);
        } else {
            alert($scope._t('no_data'));
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