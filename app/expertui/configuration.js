/**
 * Device configuration controller from ExpertUI
 * @author Martin Vach
 */
myAppController.controller('ConfigConfigurationController', function($scope, $routeParams, $location, $interval, $filter, $timeout, dataFactory, dataService, expertService) {
    
    $scope.devices = [];
    $scope.deviceId = 0;
    $scope.reset = function() {
        $scope.devices = angular.copy([]);
    };
    $scope.apiDataInterval = null;
    // Config vars
    $scope.deviceZddx = [];
    $scope.configCont;
    $scope.switchAllCont;
    $scope.protectionCont;
    $scope.wakeupCont;
    
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    // Load data
    $scope.load = function(nodeId) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            $scope.ZWaveAPIData = ZWaveAPIData;
            $scope.deviceId = nodeId;
            $scope.deviceName = $filter('deviceName')(nodeId, node);
            $scope.devices = expertService.configGetNav(ZWaveAPIData);
            $scope.getNodeDevices = function() {
                var devices = [];
                angular.forEach($scope.devices, function(v, k) {
                    if (devices_htmlSelect_filter($scope.ZWaveAPIData, 'span', v.id, 'node')) {
                        return;
                    }
                    ;
                    var obj = {};
                    obj['id'] = v.id;
                    obj['name'] = v.name;
                    devices.push(obj);
                });

                return devices;
            };
            //$scope.getNodeDevices();
            setData(ZWaveAPIData, nodeId);
        }, function(error) {
            dataService.showConnectionError(error);
        });
    };
    $scope.load($routeParams.nodeId);
    
    /**
     * Refresh data
     */
    $scope.refresh = function(nodeId) {
        var refresh = function() {
            dataFactory.joinedZwaveData().then(function(response) {
                dataService.updateTimeTick(response.data.update.updateTime);
                 setData(response.data.joined, nodeId,true);
            }, function(error) {
                dataService.showConnectionError(error);
            });
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    //$scope.refresh($routeParams.nodeId);

    /**
     * Update from device action
     *
     * @param {string} cmd
     * @returns {undefined}
     */
    $scope.updateFromDevice = function(cmd,hasBattery) {
         $scope.loading = {status:'loading-spin',icon:'fa-spinner fa-spin', message:$scope._t('updating')};
         if (hasBattery) {
            alert($scope._t('conf_apply_battery'));
        }
        dataFactory.runExpertCmd(cmd, true).then(function(response) {
            
            //dataService.logInfo(response, 'Update from device');
        }, function(error) {
            dataService.logError(error, 'Update from device');
            alert($scope._t('error_update_data'));
        });
        $scope.refresh($routeParams.nodeId);
        $timeout(function() {
             $scope.loading = {status:'loading-fade',icon:'fa-check text-success', message:$scope._t('success_updated')};
            $interval.cancel($scope.apiDataInterval);
        }, 7000);
        return;
    };

    /**
     * Update from device - configuration section
     */
    $scope.updateFromDeviceCfg = function(cmd, cfg, deviceId) {
         $scope.loading = {status:'loading-spin',icon:'fa-spinner fa-spin', message:$scope._t('updating')};
        angular.forEach(cfg, function(v, k) {
            if (v.confNum) {
                var request = cmd + '(' + v.confNum + ')';
                dataFactory.runExpertCmd(request, true).then(function(response) {
                }, function(error) {
                    dataService.logError(error);
                    return;
                });
            }

        });
        $scope.refresh(deviceId);
        $timeout(function() {
            $scope.loading = {status:'loading-fade',icon:'fa-check text-success', message:$scope._t('success_updated')};
            $interval.cancel($scope.apiDataInterval);
        }, 7000);
        return;
    };

    /**
     * Apply Config action
     */
    $scope.submitApplyConfigCfg = function(form, cmd, cfgValues, hasBattery, confNum) {
         $scope.loading = {status:'loading-spin',icon:'fa-spinner fa-spin', message:$scope._t('updating')};
        var xmlData = [];
        var configValues = [];
        if (hasBattery) {
            alert($scope._t('conf_apply_battery'));
        }
        var data = $('#' + form).serializeArray();
        var dataValues = [];
        angular.forEach(data, function(v, k) {
            if (v.value !== '') {
                dataValues.push({"value": v.value, "name": v.name});
            }

        });

        angular.forEach(dataValues, function(n, nk) {
            var obj = {};
            var parameter;
            var lastNum = n.name.match(/\d+$/);
            if (!lastNum) {
                return;
            }
            var num = lastNum[0];
            var confSize = 0;
            //var lastNum = n.name.match(/\d+$/);
            var value = n.value;
            configValues.push(value)
            angular.forEach(cfgValues, function(cv, ck) {
                if (!cv) {
                    return;
                }
                if (cv.confNum == num) {
                    confSize = cv.confSize;
                }


            });
            if (num > 0) {
                parameter = num + ',' + value + ',' + confSize;
            } else {
                parameter = value;
            }

            obj['id'] = cmd['id'];
            obj['instance'] = cmd['instance'];
            obj['commandclass'] = cmd['commandclass'];
            obj['command'] = cmd['command'];
            obj['parameter'] = '[' + parameter + ']';
            obj['parameterValues'] = parameter;
            obj['confNum'] = num;

            xmlData.push(obj);


        });
        
        // Send command
        var request = 'devices[' + cmd.id + '].instances[' + cmd.instance + '].commandClasses[0x' + cmd.commandclass + '].';
        switch (cmd['commandclass']) {
            case '70':// Config
                angular.forEach(xmlData, function(v, k) {

                    var configRequest = request;
                    configRequest += cmd.command + '(' + v.parameterValues + ')';
                    if (confNum) {
                        if (confNum == v.confNum) {
                            dataFactory.runExpertCmd(configRequest, true).then(function(response){}, function(error) {
                                dataService.logError(error);
                            });
                        }
                    } else {
                        dataFactory.runExpertCmd(configRequest, true).then(function(response){},function(error) {
                            dataService.logError(error);
                        });
                    }

                });
                break;
            case '75':// Protection
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {
                    dataService.logError(error);
                });
                break;
            case '84':// Wakeup
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {
                    dataService.logError(error);
                });
                break;
            case '27':// Switch all
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {
                    dataService.logError(error);
                });
                break;
            default:
                break;
        }
        dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.cfg_xml_url, true).then(function(cfgXml) {
           var xmlFile = expertService.buildCfgXml(xmlData, cfgXml, cmd['id'], cmd['commandclass']);
           dataFactory. putCfgXml(xmlFile).then(function(response){},function(error) {
                    dataService.logError(error);
                    alert($scope._t('error_update_data'));
                });
        }, function(error) {
            dataService.logError(error);
            alert($scope._t('error_update_data'));
        });

        $scope.refresh(cmd['id']);
        $timeout(function() {
            $scope.loading = {status:'loading-fade',icon:'fa-check text-success', message:$scope._t('success_updated')};
            $interval.cancel($scope.apiDataInterval);
        }, 7000);
        return;
    };


    /// --- Private functions --- ///
    /**
     * Set zwave data
     */
    function setData(ZWaveAPIData, nodeId, refresh) {
        var node = ZWaveAPIData.devices[nodeId];
        $scope.showDevices = true;
        //$scope.deviceNameId = $filter('deviceName')(nodeId, node) + ' (#' + nodeId + ')';
        $scope.hasBattery = 0x80 in node.instances[0].commandClasses;
        var zddXmlFile = null;
        if (angular.isDefined(node.data.ZDDXMLFile)) {
            zddXmlFile = node.data.ZDDXMLFile.value;
            $scope.deviceZddxFile = node.data.ZDDXMLFile.value;
        }

        //$scope.interviewCommands = deviceService.configGetInterviewCommands(node, ZWaveAPIData.updateTime);
        //$scope.interviewCommandsDevice = node.data;
        if (zddXmlFile && zddXmlFile !== 'undefined') {
            dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.zddx_url + zddXmlFile).then(function(zddXml) {
                setCont(node, nodeId, zddXml, ZWaveAPIData, refresh);
            }, function(error) {
                 setCont(node, nodeId, null, ZWaveAPIData, refresh);
            });

        } else {
            setCont(node, nodeId, null, ZWaveAPIData, refresh);
        }
    }

    /**
     * Set all conts
     */
    function setCont(node, nodeId, zddXml, ZWaveAPIData, refresh) {
        if (!zddXml) {
            $scope.noZddx = true;
        }
        dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.cfg_xml_url, true).then(function(cfgXml) {
            $scope.configCont = expertService.configConfigCont(node, nodeId, zddXml, cfgXml, $scope.lang, $scope.languages);
            $scope.wakeupCont = expertService.configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml);
            $scope.protectionCont = expertService.configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml);
            $scope.switchAllCont = expertService.configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml);
            if(!$scope.configCont && !$scope.wakeupCont && !$scope.protectionCont && !$scope.switchAllCont){
                $location.path('/error/404');
            }
        }, function(error) {
            //$location.path('/error/'+ error.status);
            $scope.configCont = expertService.configConfigCont(node, nodeId, zddXml, null, $scope.lang, $scope.languages);
            $scope.wakeupCont = expertService.configWakeupCont(node, nodeId, ZWaveAPIData, null);
            $scope.protectionCont = expertService.configProtectionCont(node, nodeId, ZWaveAPIData, null);
            $scope.switchAllCont = expertService.configSwitchAllCont(node, nodeId, ZWaveAPIData, null);
        });
    }
});

