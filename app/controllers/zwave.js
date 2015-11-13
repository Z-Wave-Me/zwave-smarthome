/**
 * Application Zwave controller
 * @author Martin Vach
 */

/**
 * Zwave add controller
 */
myAppController.controller('ZwaveAddController', function($scope, $routeParams, dataFactory, dataService, _) {
    $scope.zwaveDevices = [];
    $scope.deviceVendor = false;
    $scope.manufacturers = [];
    $scope.manufacturer = false;
    /**
     * Load z-wave devices
     */
    $scope.loadData = function(brandname, lang) {
        dataService.showConnectionSpinner();
        dataFactory.getApiLocal('device.' + lang + '.json').then(function(response) {
            $scope.manufacturers = _.uniq(response.data, 'brandname');
            if (brandname) {
                $scope.zwaveDevices = _.where(response.data, {brandname: brandname});
                $scope.manufacturer = brandname;
            }
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData($routeParams.brandname, $scope.lang);
});
/**
 * Zwave include controller
 */
myAppController.controller('ZwaveIncludeController', function($scope, $routeParams, $interval, $timeout, $route, $location, dataFactory, dataService, myCache) {
    $scope.apiDataInterval = null;
    $scope.includeDataInterval = null;
    $scope.excludeDataInterval = null;
    $scope.device = {
        secureInclusion: true,
        blacklist: null,
        id: null,
        data: null
    };
    $scope.secureInclusion = true;
    $scope.controllerState = 0;
    $scope.zwaveApiData = [];
    $scope.includedDeviceId = null;
    $scope.lastIncludedDevice = null;
    $scope.lastExcludedDevice = null;
    $scope.deviceFound = false;
    $scope.checkInterview = false;
    $scope.hasBattery = false;
    $scope.inclusionError = false;
    $scope.clearStepStatus = false;
    $scope.interviewCfg = {
        commandClassesCnt: 0,
        time: 0,
        stop: 0,
        isDone: []
    };

    $scope.nodeId = null;
    $scope.updateDevices = false;
    $scope.zWaveDevice = [];
    $scope.devices = [];
    $scope.dev = [];

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
        $interval.cancel($scope.includeDataInterval);
        $interval.cancel($scope.excludeDataInterval);
    });

    if (angular.isDefined($routeParams.device)) {
        $scope.device.id = $routeParams.device;
    }

    /**
     * Set secure inclusion
     */
    $scope.setSecureInclusion = function(status) {
        var cmd = 'controller.data.secureInclusion=' + status;
        dataFactory.runZwaveCmd(cmd).then(function() {
        }, function() {
        });
    };

    /**
     * Set black list
     */
    $scope.setBlacklist = function() {
        dataFactory.getRemoteData($scope.cfg.blacklist_url).then(function(response) {
            $scope.device.blacklist = response.data.data;
            console.log($scope.device.blacklist)
            //console.log('$scope.device.blacklist[entryOnBlacklist]', $scope.device.blacklist['entryOnBlacklist']);
            if (!$scope.device.blacklist['entryOnBlacklist']) {
                // do nothing
                return;
            } else {
                if ($scope.controllerState === 1) {
                    console.log('setBlacklist: $scope.controllerState', $scope.controllerState);
                    console.log('Abort in clusion process ...');
                    //$scope.stopInclusion('controller.AddNodeToNetwork(0)');
                }
                $scope.device.secureInclusion = false;
                console.log('setBlacklist: $scope.device.secureInclusion', $scope.device.secureInclusion);
                $scope.retryInclusion('controller.RemoveNodeFromNetwork(1)', $scope.device.secureInclusion);
            }
        }, function(error) {
        });
    };

    //$scope.setBlacklist();
    /**
     * Load data into collection
     */
    $scope.loadData = function(lang) {
        if (!$scope.device.id) {
            return;
        }
        dataService.showConnectionSpinner();
        dataFactory.getApiLocal('device.' + lang + '.json').then(function(response) {
            angular.forEach(response.data, function(v, k) {
                if (v.id == $scope.device.id) {
                    $scope.device.data = v;
                    if (v.inclusion_type === 'unsecure') {
                        $scope.secureInclusion = false;
                    }
                    return;
                }
            });

        }, function(error) {
            dataService.showConnectionError(error);
            return;
        });

    };
    $scope.loadData($scope.lang);

    /**
     * Load data into collection
     */
    $scope.loadZwaveApiData = function() {

        dataFactory.loadZwaveApiData(true).then(function(ZWaveAPIData) {
            $scope.controllerState = ZWaveAPIData.controller.data.controllerState.value;
            var refresh = function() {
                dataFactory.refreshZwaveApiData().then(function(response) {
                    checkController(response.data, response.data);
                    dataService.updateTimeTick(response.data.updateTime);
                }, function(error) {
                    dataService.showConnectionError(error);
                    return;
                });
            };
            $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
        }, function(error) {
            dataService.showConnectionError(error);
            return;
        });
    };
    $scope.loadZwaveApiData();

    /**
     * Watch for last excluded device
     */
    $scope.$watch('lastExcludedDevice', function() {
        console.log('watch: $scope.device.blacklist', $scope.device.blacklist);
        console.log('watch: $scope.lastExcludedDevice:', $scope.lastExcludedDevice);
        console.log('watch: $scope.device.secureInclusion', $scope.device.secureInclusion);
        if (!!$scope.lastExcludedDevice) {
            var refresh = function() {
                console.log('refresh: $scope.device.secureInclusion', $scope.device.secureInclusion);
                var includeSecure = $scope.device.secureInclusion;
                console.log('includeSecure', includeSecure);
                console.log('set unsecure condition:', $scope.lastExcludedDevice && !includeSecure);
                if ($scope.lastExcludedDevice && !includeSecure) {
                    console.log('set unsecure ...');
                    $scope.setSecureInclusion(includeSecure);
                    $interval.cancel($scope.excludeDataInterval);
                }

                console.log('refresh: $scope.controllerState', $scope.controllerState);
                if ($scope.controllerState === 0) {
                    console.log('remove interval ...');
                    $interval.cancel($scope.excludeDataInterval);
                }
            };
            $scope.excludeDataInterval = $interval(refresh, $scope.cfg.interval);
        }
    });

    /**
     * Watch for last included device
     */
    $scope.$watch('includedDeviceId', function() {
        if ($scope.includedDeviceId) {
            var refresh = function() {
                $scope.deviceFound = false;
                $scope.checkInterview = true;
                dataFactory.loadZwaveApiData(true).then(function(ZWaveAPIData) {
                    //dataFactory.joinedZwaveData($scope.zwaveApiData).then(function(response) {
                    //var ZWaveAPIData = response.data.joined;
                    //var ZWaveAPIData = response;
                    var nodeId = $scope.includedDeviceId;
                    var node = ZWaveAPIData.devices[nodeId];
                    if (!node) {
                        return;
                    }
                    var interviewDone = true;
                    //var instanceId = 0;
                    var hasBattery = false;
                    if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
                        hasBattery = 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses;
                    }
                    //var vendor = ZWaveAPIData.devices[nodeId].data.vendorString.value;
                    //var deviceType = ZWaveAPIData.devices[nodeId].data.deviceTypeString.value;
                    $scope.hasBattery = hasBattery;

                    //console.log('CHECK interview -----------------------------------------------------')
                    // Check interview
                    if (ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value && ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length) {
                        for (var iId in ZWaveAPIData.devices[nodeId].instances) {
                            if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0) {
                                $scope.interviewCfg.commandClassesCnt = Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length;
                                if ($scope.interviewCfg.stop === 0) {
                                    // Wait 20 seconds after interview start check
                                    $scope.interviewCfg.time = (Math.round(+new Date() / 1000)) + 20;
                                }
                                $scope.interviewCfg.stop = (Math.round(+new Date() / 1000));
                                for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
                                    var notInterviewClass = 'devices.' + nodeId + '.instances.' + iId + '.commandClasses.' + ccId + '.data.interviewDone.value';
                                    // Interview is not done
                                    if (!ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId].data.interviewDone.value) {
                                        interviewDone = false;
                                    } else {  // Interview is done
                                        if ($scope.interviewCfg.isDone.indexOf(notInterviewClass) === -1) {
                                            $scope.interviewCfg.isDone.push(notInterviewClass);
                                        }
                                    }
                                }
                            } else {
                                interviewDone = false;
                            }
                        }

                    } else {
                        interviewDone = false;
                    }
                    if (interviewDone) {
                        $scope.lastIncludedDevice = node.data.givenName.value || 'Device ' + '_' + nodeId;
                        $scope.setSecureInclusion(true);
                        $scope.secureInclusion = true;
                        console.log('interview: $scope.secureInclusion', $scope.secureInclusion);
                        myCache.remove('devices');
                        $scope.includedDeviceId = null;
                        $scope.checkInterview = false;
                        $interval.cancel($scope.includeDataInterval);
                        $scope.nodeId = nodeId;
                        $timeout(function() {
                            $location.path('/zwave/devices/' + nodeId + '/nohistory');

                        }, 3000);

                    } else {
                        $scope.checkInterview = true;
                    }

                }, function(error) {
                    $scope.inclusionError = true;
                    dataService.showConnectionError(error);
                });
            };
            $scope.includeDataInterval = $interval(refresh, $scope.cfg.interval);

        }
    });

    /**
     * Start inclusion proccess
     */
    $scope.startInclusion = function(cmd) {
        console.log('$scope.device.secureInclusion', $scope.device.secureInclusion);
        //$scope.setSecureInclusion($scope.secureInclusion);
        dataFactory.runZwaveCmd(cmd).then(function() {
        }, function(error) {
        });

//        if ($scope.device.blacklist === null) {
//            $timeout(function(){
//                //$scope.setBlacklist();
//            }, 1500);
//        }
    };

    /**
     * Stopinclusion proccess
     */
    $scope.stopInclusion = function(cmd) {
        dataFactory.runZwaveCmd(cmd).then(function() {
        }, function(error) {
        });

    };

    /**
     * Retry inclusion
     */
    $scope.retryInclusion = function(cmd, type) {
        console.log('retry: secure?', type);
        myCache.removeAll();
        console.log('retry after remove: secure?', type);
        $route.reload();
        $scope.runZwaveCmd(cmd);
    };


    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function(cmd) {
        $scope.lastIncludedDevice = null;
        $scope.lastExcludedDevice = null;
        dataFactory.runZwaveCmd(cmd).then(function() {
            //myCache.remove('devices');
            myCache.removeAll();
            //console.log('Reload...')
            $route.reload();
        }, function(error) {
        });

    };


    /**
     * Load data
     */
    $scope.loadElements = function(nodeId) {
        //console.log('Loading nodeId',nodeId)
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            zwaveApiData(nodeId, response.data.data.devices);

        }, function(error) {
            dataService.showConnectionError(error);
        });
    };


    /// --- Private functions --- ///
    /**
     * Check controller data data
     */
    function checkController(data, ZWaveAPIData) {
        //var data = response.data;
        if ('controller.data.controllerState' in data) {
            $scope.controllerState = data['controller.data.controllerState'].value;
            console.log('controllerState: ', $scope.controllerState);
        }

        if ('controller.data.lastExcludedDevice' in data) {
            $scope.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            console.log('lastExcludedDevice: ', $scope.lastExcludedDevice);
        }
        if ('controller.data.lastIncludedDevice' in data) {
            var deviceIncId = data['controller.data.lastIncludedDevice'].value;
            if (deviceIncId != null) {
                var givenName = 'Device_' + deviceIncId;
                var cmd = 'devices[' + deviceIncId + '].data.givenName.value=\'' + givenName + '\'';
                dataFactory.runZwaveCmd(cmd).then(function() {
                    $scope.includedDeviceId = deviceIncId;
                    $scope.deviceFound = true;
                    //getLastIncluded(deviceIncId,ZWaveAPIData);
                }, function(error) {
                    dataService.showConnectionError(error);
                });

            }
        }
        if ('controller.data.secureInclusion' in data) {
            $scope.secureInclusion = data['controller.data.secureInclusion'].value;
            console.log('secureInclusion: ', $scope.secureInclusion);
        }
    }
    ;



});
/**
 * Zwave manage controller
 */
myAppController.controller('ZwaveManageController', function($scope, $cookies, $filter, $window, $location, dataFactory, dataService, myCache) {
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
    $scope.setTab = function() {
        var path = $location.path().split('/').pop();
        var tabId = (path === 'manage' ? 'devices' : path);
        $scope.activeTab = tabId;
        $cookies.tab_network = tabId;
    };
    $scope.setTab()

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

            angular.forEach(devices, function(v, k) {
                var cmd;
                var nodeId;
                var iId;
                var ccId;
                var findZwaveStr = v.id.split('_');
                if (findZwaveStr[0] === 'ZWayVDev' && findZwaveStr[1] === 'zway') {
                    cmd = findZwaveStr[findZwaveStr.length - 1].split('-');
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
 * Zwave exclude controller
 */
myAppController.controller('ZwaveExcludeController', function($scope, $location, $routeParams, $interval, dataFactory, dataService, _) {
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
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.zWaveDevice.apiDataInterval);
       $scope.zWaveDevice.removeNode = false;
        $scope.runZwaveCmd('controller.RemoveNodeFromNetwork(0)');
    });
    /**
     * Load z-wave devices
     */
    $scope.loadZwaveApiData = function() {
        dataFactory.loadZwaveApiData(true).then(function(ZWaveAPIData) {
            var node = ZWaveAPIData.devices[$routeParams.id];
            if (!node) {
                $location.path('/error/404');
            }
            $scope.zWaveDevice.controllerState = ZWaveAPIData.controller.data.controllerState.value;
            $scope.zWaveDevice.id = $routeParams.id;
            $scope.zWaveDevice.name = node.data.givenName.value || 'Device ' + '_' + $routeParams.id;
            return;

        }, function(error) {
            $location.path('/error/404');
        });
    };
    $scope.loadZwaveApiData();

    /**
     *  Refresh z-wave devices
     */
    $scope.refreshZwaveApiData = function() {

        dataFactory.loadZwaveApiData(true).then(function(ZWaveAPIData) {
            var refresh = function() {
                dataFactory.refreshZwaveApiData().then(function(response) {
                    //var data = response.data;
                    if ('controller.data.controllerState' in response.data) {
                        $scope.zWaveDevice.controllerState =response.data['controller.data.controllerState'].value;
                        console.log('controllerState: ', $scope.zWaveDevice.controllerState);
                    }

                    if ('controller.data.lastExcludedDevice' in response.data) {
                       $scope.zWaveDevice.lastExcludedDevice = response.data['controller.data.lastExcludedDevice'].value;
                        console.log('lastExcludedDevice: ', $scope.zWaveDevice.lastExcludedDevice);
                    }
                }, function(error) {
                    dataService.showConnectionError(error);
                    return;
                });
            };
            $scope.zWaveDevice.apiDataInterval = $interval(refresh, $scope.cfg.interval);
        }, function(error) {
            dataService.showConnectionError(error);
            return;
        });
    };
    $scope.refreshZwaveApiData();

    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function(cmd) {
        dataFactory.runZwaveCmd(cmd).then(function() {
            //myCache.remove('devices');
            //myCache.removeAll();
            //console.log('Reload...')
            //$route.reload();
        }, function(error) {
        });

    };
    /**
     * Run ExpertUI command - remove failed node
     */
    $scope.removeFailedNode = function(cmd) {
         dataFactory.runZwaveCmd(cmd).then(function() {
            $scope.zWaveDevice.removeNodeProcess = true;
        }, function(error) {
        });

    };
});
/**
 * Zwave manage detail controller
 */
myAppController.controller('ZwaveManageIdController', function($scope, $window, $routeParams, $timeout, $filter, $location, dataFactory, dataService, myCache) {
    $scope.zwaveConfig = {
        nodeId: $routeParams.nodeId,
        nohistory: $routeParams.nohistory
    };

    $scope.zWaveDevice = [];
    $scope.devices = [];
    $scope.formInput = {
        elements: {},
        room: 0,
        deviceName: ''
    };
    $scope.rooms = [];

    /**
     * Load data
     */
    $scope.loadConfigData = function(nodeId) {
        dataService.showConnectionSpinner();
        dataFactory.getApi('devices').then(function(response) {
            zwaveConfigApiData(nodeId, response.data.data.devices);
            loadConfigLocations();

        }, function(error) {
            $location.path('/error/' + error.status);
        });
    };
    $scope.loadConfigData($scope.zwaveConfig.nodeId);

    /**
     * Update all devices
     */
    $scope.updateAllDevices = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};

        // Update element
        angular.forEach(input.elements, function(v, k) {
            if (input.room) {
                angular.extend(v, {location: parseInt(input.room)})
            }
            dataFactory.putApi('devices', v.id, v).then(function(response) {
            }, function(error) {
            });
        });
        //Update device name
        var cmd = 'devices[' + $scope.zWaveDevice.id + '].data.givenName.value=\'' + input.deviceName + '\'';
        dataFactory.runZwaveCmd(cmd).then(function() {
        }, function(error) {
        });
        myCache.removeAll();
        $timeout(function() {
            $scope.loading = false;

            if (angular.isDefined($routeParams.nohistory)) {
                $location.path('/zwave/devices');
            } else {
                $window.history.back();
            }

        }, 3000);
    };

    /// --- Private functions --- ///


    function loadConfigLocations() {
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
    function zwaveConfigApiData(nodeId, devices) {
        dataFactory.loadZwaveApiData(true).then(function(ZWaveAPIData) {
            dataService.updateTimeTick();
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                // $location.path('/error/404');
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

            angular.forEach(devices, function(v, k) {
                var findZwaveStr = v.id.split('_');
                if ((findZwaveStr[0] !== 'ZWayVDev' && findZwaveStr[1] !== 'zway') || v.deviceType === 'battery') {
                    return;
                }
                var cmd = findZwaveStr[findZwaveStr.length - 1].split('-');
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
                    obj['location'] = v.location;
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
