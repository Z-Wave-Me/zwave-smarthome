/**
 * Application Device controller
 * @author Martin Vach
 */

/**
 * Device controller
 */
myAppController.controller('DeviceController', function($scope, $routeParams, dataFactory, dataService) {
});
/**
 * Device Zwave  controller
 */
myAppController.controller('DeviceZwaveController', function($scope, $routeParams, dataFactory, dataService, _) {
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
 * Device IP camerae  controller
 */
myAppController.controller('DeviceIpCameraController', function($scope, dataFactory, dataService, _) {
    $scope.ipcameraDevices = [];
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load ip cameras
     */
    $scope.loadData = function() {
        dataService.showConnectionSpinner();
        dataFactory.getApi('modules').then(function(response) {
            $scope.ipcameraDevices = _.filter(response.data.data, function(item) {
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
            //$scope.ipcameraDevices = _.where(modulesFiltered, query);
            //$scope.ipcameraDevices = _.where(response.data.data, {category: 'surveillance'});
            dataService.updateTimeTick();
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.loadData();
});
/**
 * Device Include controller
 */
myAppController.controller('IncludeController', function($scope, $routeParams, $interval, $filter,$route, dataFactory, dataService, myCache) {
    $scope.apiDataInterval = null;
    $scope.includeDataInterval = null;
    $scope.device = {
        'data': null
    };
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
    $scope.rooms = [];
    $scope.modelRoom;
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
        $interval.cancel($scope.includeDataInterval);
    });

    /**
     * Load data into collection
     */
    $scope.loadData = function(lang) {
        dataService.showConnectionSpinner();
        if (angular.isDefined($routeParams.device)) {
            dataFactory.getApiLocal('device.' + lang + '.json').then(function(response) {
                angular.forEach(response.data, function(v, k) {
                    if (v.id == $routeParams.device) {
                        $scope.device.data = v;
                        return;
                    }
                });

            }, function(error) {
                dataService.showConnectionError(error);
                return;
            });
        }
        return;
    };
    $scope.loadData($scope.lang);

    /**
     * Load data into collection
     */
    $scope.loadZwaveApiData = function() {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            var refresh = function() {
                dataFactory.joinedZwaveData(ZWaveAPIData).then(function(response) {
                    checkController(response.data.update, response.data.joined);
                    dataService.updateTimeTick(response.data.update.updateTime);
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
        return;
    };
    $scope.loadZwaveApiData();
    /**
     * Watch for last excluded device
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
                        myCache.remove('devices');
                        $scope.includedDeviceId = null;
                        $scope.checkInterview = false;
                        $interval.cancel($scope.includeDataInterval);
                        $scope.nodeId = nodeId;
                        $scope.loadLocations();
                        $scope.loadElements(nodeId);


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
     * Watch for last excluded device
     */
    $scope.$watch('updateDevices', function() {
        if ($scope.nodeId) {
            $scope.updateDevices = false;
            $scope.loadElements($scope.nodeId);
        }
    });

    /**
     * Watch for last excluded device
     */
    //$scope.$watch('interviewCfg', function() {});
    
    /**
     * Retry inclusion
     */
    $scope.retryInclusion = function() {
         myCache.removeAll();
        $route.reload();
        $scope.runZwaveCmd('controller.RemoveNodeFromNetwork(1)');
    };


    /**
     * Run ExpertUI command
     */
    $scope.runZwaveCmd = function(cmd) {
        $scope.lastIncludedDevice = null;
        $scope.lastExcludedDevice = null;
        dataFactory.runZwaveCmd(cmd).then(function() {
            myCache.remove('devices');
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

    /**
     * Load locations
     */
    $scope.loadLocations = function() {
        dataFactory.getApi('locations').then(function(response) {
            $scope.rooms = response.data.data;
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;


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
        $scope.loadData();
        $scope.loading = false;
        return;

    };
    /**
     * Update device
     */
    $scope.updateDevice = function(input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('devices', input.id, input).then(function(response) {
            myCache.remove('devices');
            //$scope.loadData($scope.nodeId);
            $scope.updateDevices = true;
            $scope.loading = false;
        }, function(error) {
            alert($scope._t('error_update_data'));
            $scope.loading = false;
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
            //console.log('controllerState: ', $scope.controllerState)
        }

        if ('controller.data.lastExcludedDevice' in data) {
            $scope.lastExcludedDevice = data['controller.data.lastExcludedDevice'].value;
            //console.log('lastExcludedDevice: ', $scope.lastExcludedDevice)
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
    }
    ;

    /**
     * Get last included device
     */
//    function getLastIncluded(nodeId, ZWaveAPIData) {
//        if (!$scope.includedDeviceId) {
//            return;
//        }
//        $scope.deviceFound = false;
//        $scope.checkInterview = true;
//        var node = ZWaveAPIData.devices[nodeId];
//        if (!node) {
//            return;
//        }
//        var interviewDone = true;
//        //var instanceId = 0;
//        var hasBattery = false;
//        if (angular.isDefined(ZWaveAPIData.devices[nodeId].instances)) {
//            hasBattery = 0x80 in ZWaveAPIData.devices[nodeId].instances[0].commandClasses;
//        }
//        $scope.hasBattery = hasBattery;
//
//        console.log('CHECK interview NEW -----------------------------------------------------')
//        // Check interview
//        if (ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value && ZWaveAPIData.devices[nodeId].data.nodeInfoFrame.value.length) {
//             console.log('ZWaveAPIData.devices[nodeId].instances',ZWaveAPIData.devices[nodeId].instances)
//            for (var iId in ZWaveAPIData.devices[nodeId].instances) {
//                if (Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0) {
//                     console.log('ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length > 0 -----------------------------------------------------')
//                    $scope.interviewCfg.commandClassesCnt = Object.keys(ZWaveAPIData.devices[nodeId].instances[iId].commandClasses).length;
//                    if ($scope.interviewCfg.stop === 0) {
//                        // Wait 20 seconds after interview start check
//                        $scope.interviewCfg.time = (Math.round(+new Date() / 1000)) + 20;
//                    }
//                    $scope.interviewCfg.stop = (Math.round(+new Date() / 1000));
//                    for (var ccId in ZWaveAPIData.devices[nodeId].instances[iId].commandClasses) {
//                        var notInterviewClass = 'devices.' + nodeId + '.instances.' + iId + '.commandClasses.' + ccId + '.data.interviewDone.value';
//                        // Interview is not done
//                        if (!ZWaveAPIData.devices[nodeId].instances[iId].commandClasses[ccId].data.interviewDone.value) {
//                            interviewDone = false;
//                        } else {  // Interview is done
//                            if ($scope.interviewCfg.isDone.indexOf(notInterviewClass) === -1) {
//                                $scope.interviewCfg.isDone.push(notInterviewClass);
//                            }
//                        }
//                    }
//                } else {
//                    interviewDone = false;
//                }
//            }
//
//        } else {
//            interviewDone = false;
//        }
//        if (interviewDone) {
//            $scope.lastIncludedDevice = node.data.givenName.value || 'Device ' + '_' + nodeId;
//            myCache.remove('devices');
//            $scope.includedDeviceId = null;
//            $scope.checkInterview = false;
//            //$interval.cancel($scope.includeDataInterval);
//            $scope.nodeId = nodeId;
//            $scope.loadLocations();
//            $scope.loadElements(nodeId);
//
//
//        } else {
//            $scope.checkInterview = true;
//        }
//    }
//    ;

    /**
     * Get zwaveApiData
     */
    function zwaveApiData(nodeId, devices) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            dataService.updateTimeTick();
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
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
                    $scope.devices.push(obj);
                }

            });
        }, function(error) {
            dataService.showConnectionError(error);
        });
    }
    ;


});