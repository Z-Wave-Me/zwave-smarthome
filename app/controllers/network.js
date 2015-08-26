/**
 * Application Network controller
 * @author Martin Vach
 */

/**
 * Network controller
 */
myAppController.controller('NetworkController', function($scope, $cookies, $filter, $window, $location, dataFactory, dataService, myCache) {
    $scope.activeTab = (angular.isDefined($cookies.tab_network) ? $cookies.tab_network : 'battery');
    $scope.batteries = {
        'list': [],
        'cntLess20': [],
        'cnt0': []
    };
    $scope.devices = {
        'failed': [],
        'batteries': [],
        'zwave': []
    };
    $scope.goEdit = [];
    $scope.zWaveDevices = {};

//    $scope.modelName = [];
//    $scope.modelRoom = {};
//
//    $scope.rooms = [];
    /**
     * Set tab
     */
    $scope.setTab = function(tabId) {
        $scope.activeTab = tabId;
        $cookies.tab_network = tabId;
    };


    /**
     * Load data
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            zwaveApiData(response.data.data.devices);
            loadLocations();

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData();

    /// --- Private functions --- ///
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
     * Get zwaveApiData
     */
    function zwaveApiData(devices) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            dataService.updateTimeTick();
            if (!ZWaveAPIData.devices) {
                return;
            }

            angular.forEach(ZWaveAPIData.devices, function(v, k) {
                if (k == 1) {
                    return;
                }

                $scope.zWaveDevices[k] = {
                    id: k,
                    title: v.data.givenName.value || 'Device ' + '_' + k,
                    icon: null,
                    cfg: [],
                    elements: [],
                    messages: []
                };

            });
            var findZwaveStr = "ZWayVDev_zway_";
            angular.forEach(devices, function(v, k) {
                var cmd;
                var nodeId;
                var iId;
                var ccId;
                if (v.id.indexOf(findZwaveStr) > -1) {
                    cmd = v.id.split(findZwaveStr)[1].split('-');
                    nodeId = cmd[0];
                    iId = cmd[1];
                    ccId = cmd[2];
                    var node = ZWaveAPIData.devices[nodeId];
                    if (node) {
                        var interviewDone = isInterviewDone(node, nodeId);
                        var isFailed = node.data.isFailed.value;
                        var hasBattery = 0x80 in node.instances[0].commandClasses;
                        var obj = {};
                        obj['id'] = v.id;
                        obj['visibility'] = v.visibility;
                        obj['permanently_hidden'] = v.permanently_hidden;
                        obj['nodeId'] = nodeId;
                        obj['nodeName'] = node.data.givenName.value || 'Device ' + '_' + k,
                                obj['title'] = v.metrics.title;
                        obj['deviceType'] = v.deviceType;
                        obj['level'] = $filter('toInt')(v.metrics.level);
                        obj['metrics'] = v.metrics;
                        obj['messages'] = [];
                        if (v.deviceType !== 'battery') {
                            $scope.devices.zwave.push(obj);
                            $scope.zWaveDevices[nodeId]['elements'].push(obj);
                            $scope.zWaveDevices[nodeId]['icon'] = obj.metrics.icon;
                        }

                        // Batteries
                        if (v.deviceType === 'battery') {
                            $scope.devices.batteries.push(obj);
                        }
                        if (hasBattery && interviewDone) {
                            var batteryCharge = parseInt(node.instances[0].commandClasses[0x80].data.last.value);
                            if (batteryCharge <= 20) {
                                $scope.zWaveDevices[nodeId]['messages'].push({
                                    type: 'battery',
                                    error: $scope._t('lb_low_battery') + ' (' + batteryCharge + '%)'
                                });
                                obj['messages'].push({
                                    type: 'battery',
                                    error: $scope._t('lb_low_battery') + ' (' + batteryCharge + '%)'
                                });
                            }
                        }
                        // Not interview
                        if (!interviewDone) {
                            $scope.zWaveDevices[nodeId]['messages'].push({
                                type: 'config',
                                error: $scope._t('lb_not_configured')

                            });

                            obj['messages'].push({
                                type: 'config',
                                error: $scope._t('lb_not_configured')

                            });
                        }
                        // Is failed
                        if (isFailed) {
                            $scope.zWaveDevices[nodeId]['messages'].push({
                                type: 'failed',
                                error: $scope._t('lb_is_failed')

                            });
                            obj['messages'].push({
                                type: 'failed',
                                error: $scope._t('lb_is_failed')

                            });
                        }
                        $scope.devices.failed.push(obj);
                    }

                }
            });
            // Count device batteries
            for (i = 0; i < $scope.devices.batteries.length; ++i) {
                var battery = $scope.devices.batteries[i];
                if (battery.level < 1) {
                    $scope.batteries.cnt0.push(battery.id);
                }
                if (battery.level > 0 && battery.level < 20) {
                    $scope.batteries.cntLess20.push(battery.id);
                }

            }
        }, function(error) {
            $location.path('/error/' + error.status);
        });
    }
    ;

    /**
     * Redirect to Expert
     */
    $scope.toExpert = function(url, dialog) {
        if ($window.confirm(dialog)) {
            $window.location.href = url;
        }
    };
    /**
     * notInterviewDevices
     */
    function isInterviewDone(node, nodeId) {
        for (var iId in node.instances) {
            for (var ccId in node.instances[iId].commandClasses) {
                var isDone = node.instances[iId].commandClasses[ccId].data.interviewDone.value;
                if (isDone == false) {
                    return false;
                }
            }
        }
        return true;

    }
    ;
});
/**
 * Profile controller
 */
myAppController.controller('NetworkConfigController', function($scope, $routeParams, $filter, $location, dataFactory, dataService, myCache) {
    $scope.zWaveDevice = [];
    $scope.devices = [];
    //$scope.dev = [];
    $scope.formInput = {
        elements: {},
        room: undefined
    };
    $scope.rooms = [];
    //$scope.modelRoom;

    /**
     * Load data
     */
    $scope.loadData = function(nodeId) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            zwaveApiData(nodeId, response.data.data.devices);
            loadLocations();

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadData($routeParams.nodeId);

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
                alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            });
        }
        myCache.remove('devices');
        $scope.loadData($routeParams.nodeId);
        $scope.loading = false;
        return;

    };

    /**
     * Update all devices
     */
    $scope.updateAllDevices = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
       angular.forEach($scope.formInput.elements, function(v, k) {
                var errors = 0;
                dataFactory.putApi('devices', v.id, v).then(function(response) {
                }, function(error) {});
        });
        myCache.remove('devices');
       $scope.loadData($routeParams.nodeId);
       $scope.loading = false;

    };
    /**
     * Update single device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            $scope.loadData($routeParams.nodeId);
            $scope.loading = false;
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

    /// --- Private functions --- ///
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
     * Get zwaveApiData
     */
    function zwaveApiData(nodeId, devices) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            dataService.updateTimeTick();
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                $location.path('/error/404');
                return;
            }

            $scope.zWaveDevice = {
                id: nodeId,
                title: node.data.givenName.value || 'Device ' + '_' + nodeId,
                cfg: []
            };
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
            var findZwaveStr = "ZWayVDev_zway_";
            angular.forEach(devices, function(v, k) {
                if (v.id.indexOf(findZwaveStr) === -1 || v.deviceType === 'battery') {
                    return;
                }
                var cmd = v.id.split(findZwaveStr)[1].split('-');
                var zwaveId = cmd[0];
                var iId = cmd[1];
                var ccId = cmd[2];
                if (zwaveId == nodeId) {
                    var obj = {};
                    obj['id'] = v.id;
                    obj['permanently_hidden'] = v.permanently_hidden;
                    obj['visibility'] = v.visibility;
                    obj['level'] = $filter('toInt')(v.metrics.level);
                    obj['metrics'] = v.metrics;
                    $scope.formInput.elements[v.id] = obj;
                    $scope.devices.push(obj);
                }

            });
        }, function(error) {
            $location.path('/error/404');
        });
    }
    ;


});