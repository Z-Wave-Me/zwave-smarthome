/**
 * Application Zwave controller
 * @author Martin Vach
 */

/**
 * Zwave select controller
 */
myAppController.controller('ZwaveSelectController', function ($scope, $routeParams, dataFactory, dataService, _) {
     $scope.zwaveSelect = {
          logos: {},
         brand: {},
          brandName: '',
         list: {}
     };
     
     /**
     * Load products - vendor logos
     */
    $scope.loadProducts = function () {
        dataFactory.getApiLocal('test/products.json').then(function (response) {
             angular.forEach(response.data, function (v, k) {
                 $scope.zwaveSelect.logos[v.manufacturer] = v.manufacturer_image;
                 //angular.extend($scope.zwaveSelect.logos[v.manufacturer_id],v.manufacturer_image);
            });
            console.log($scope.zwaveSelect.logos)
        }, function (error) {
        });
    };
    $scope.loadProducts($routeParams.brandname);
    /**
     * Load z-wave devices
     */
    $scope.loadData = function (brandname, lang) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        //dataFactory.getApiLocal('device.' + lang + '.json').then(function (response) {
        dataFactory.getApiLocal('test/devicedatabase.json').then(function (response) {
            $scope.zwaveSelect.brand = _.uniq(response.data, 'brandname');
            if (brandname) {
                $scope.zwaveSelect.list = _.where(response.data, {brandname: brandname});
                if(_.isEmpty($scope.zwaveSelect.list)){
                     $scope.loading = false;
                     alertify.alertWarning($scope._t('no_data'));
                }
                
                $scope.zwaveSelect.brandName = brandname;
            }
            $scope.loading = false;
        }, function (error) {
          alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadData($routeParams.brandname, $scope.lang);
});

/**
 * Zwave add controller
 */
myAppController.controller('ZwaveAddController', function ($scope, $routeParams, dataFactory, dataService, _) {
    $scope.zwaveDevices = [];
    $scope.deviceVendor = false;
    $scope.manufacturers = [];
    $scope.manufacturer = false;
    /**
     * Load z-wave devices
     */
    $scope.loadData = function (brandname, lang) {
         $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApiLocal('device.' + lang + '.json').then(function (response) {
            $scope.loading = false;
            $scope.manufacturers = _.uniq(response.data, 'brandname');
            if (brandname) {
                $scope.zwaveDevices = _.where(response.data, {brandname: brandname});
                $scope.manufacturer = brandname;
            }
        }, function (error) {
            alertify.alertError($scope._t('error_load_data')).set('onok', function(closeEvent){dataService.goBack();} ); 
        });
    };
    $scope.loadData($routeParams.brandname, $scope.lang);
});
/**
 * Zwave manage controller
 */
myAppController.controller('ZwaveManageController', function ($scope, $cookies, $filter, $window, $location, dataFactory, dataService, myCache) {
    $scope.activeTab = (angular.isDefined($cookies.tab_network) ? $cookies.tab_network : 'battery');
    $scope.batteries = {
        'list': [],
        'cntLess20': [],
        'cnt0': []
    };
    $scope.devices = {
        'failed': [],
        'batteries': [],
        'zwave': [],
        'show': true
    };
    $scope.goEdit = [];
    $scope.zWaveDevices = {};
    
    /**
     * Set tab
     */
    $scope.setTab = function () {
        var path = $location.path().split('/').pop();
        var tabId = (path === 'manage' ? 'devices' : path);
        $scope.activeTab = tabId;
        $cookies.tab_network = tabId;
    };
    $scope.setTab();

    /**
     * Load data
     */
    $scope.loadData = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('devices').then(function (response) {
            $scope.loading = false;
            zwaveApiData(response.data.data.devices); 
        }, function (error) {
            $scope.loading = false;
              $scope.devices.show = false;
               alertify.alertError($scope._t('error_load_data')).set('onok', function(closeEvent){dataService.goBack();} );
        });
    };
    $scope.loadData();


    /// --- Private functions --- ///
    /**
     * Get zwaveApiData
     */
    function zwaveApiData(devices) {
        dataFactory.loadZwaveApiData(false).then(function (ZWaveAPIData) {
            if (!ZWaveAPIData.devices) {
                return;
            }

            angular.forEach(ZWaveAPIData.devices, function (v, k) {
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

            angular.forEach(devices, function (v, k) {
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
            if( _.size($scope.zWaveDevices) < 1){
                $scope.devices.show = false;
                    alertify.alertWarning($scope._t('no_device_installed')).set('onok', function(closeEvent){dataService.goBack();} ); 
                }
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
        }, function (error) {
             alertify.alertError($scope._t('error_load_data')).set('onok', function(closeEvent){dataService.goBack();} );
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
 * Zwave manage detail controller
 */
myAppController.controller('ZwaveManageIdController', function ($scope, $window, $routeParams,$q, $filter, $location, dataFactory, dataService, myCache) {
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
            dataFactory.getApi('locations',null,true)
        ];

        $q.allSettled(promises).then(function (response) {
            var devices = response[0];
            var locations = response[1];
           
            $scope.loading = false;
            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                $scope.formInput.show = false;
                alertify.alertError($scope._t('error_load_data')).set('onok', function(closeEvent){dataService.goBack();} ); 
                return;
            }
             // Success - devices
            if (devices.state === 'fulfilled') {
                zwaveConfigApiData($scope.zwaveConfig.nodeId, devices.value.data.data.devices);
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
        }, function (error) {
           alertify.alertError($scope._t('error_load_data'));
        });
    }
    ;

});

