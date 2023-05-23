/**
 * @overview Handles actions in the device hardware configuration.
 * @author Martin Vach
 */

/**
 * The controller that handles outputs and inputs.
 * @class ZBConfigConfigurationController
 */
myAppController.controller('ZBConfigConfigurationController', function($scope, $routeParams, $location, $interval, $filter, $timeout, dataFactory, dataService, expertService) {
    
    $scope.devices = [];
    $scope.deviceId = 0;
    $scope.reset = function() {
        $scope.devices = angular.copy([]);
    };
    $scope.apiDataInterval = null;
    // Config vars
    $scope.hasConfigurationCc = false;
    $scope.deviceZddx = [];
    $scope.configCont;
    $scope.switchAllCont;
    $scope.protectionCont;
    $scope.wakeupCont;
    
    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        $interval.cancel($scope.apiDataInterval);
    });

    /**
     * Load data
     */
    $scope.load = function(nodeId) {
        dataFactory.loadZigbeeApiData().then(function(ZigbeeAPIData) {
            if(!ZigbeeAPIData){
                return;
            }
            var node = ZigbeeAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            $scope.ZigbeeAPIData = ZigbeeAPIData;
            $scope.deviceId = nodeId;
            $scope.deviceName = $filter('deviceName')(nodeId, node);
            $scope.devices = expertService.configGetNav(ZigbeeAPIData);
            $scope.getNodeDevices = function() {
                var devices = [];
                angular.forEach($scope.devices, function(v, k) {
                    if (devices_htmlSelect_filter($scope.ZigbeeAPIData, 'span', v.id, 'node')) {
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
            setData(ZigbeeAPIData, nodeId);
        }, function(error) {});
    };
    $scope.load($routeParams.nodeId);
    
    /**
     * Refresh data
     */
    $scope.refresh = function(nodeId) {
        var refresh = function() {
            dataFactory.joinedZigbeeData().then(function(response) {
                setData(response.data.joined, nodeId,true);
            }, function(error) {});
        };
        $scope.apiDataInterval = $interval(refresh, $scope.cfg.interval);
    };

    //$scope.refresh($routeParams.nodeId);

    /**
     * Update from device action
     */
    $scope.updateFromDevice = function(cmd,hasBattery) {
         $scope.loading = {status:'loading-spin',icon:'fa-spinner fa-spin', message:$scope._t('updating')};
         if (hasBattery) {
            alertify.alert($scope._t('conf_apply_battery'));
        }
        dataFactory.runExpertCmd(cmd, true).then(function(response) {
        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
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
                }, function(error) {});
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
            alertify.alert($scope._t('conf_apply_battery'));
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
            obj['endpoint'] = cmd['endpoint'];
            obj['commandclass'] = cmd['commandclass'];
            obj['command'] = cmd['command'];
            obj['parameter'] = '[' + parameter + ']';
            obj['parameterValues'] = parameter;
            obj['confNum'] = num;

            xmlData.push(obj);


        });
        
        // Send command
        var request = 'devices[' + cmd.id + '].endpoints[' + cmd.endpoint + '].clusters[0x' + cmd.commandclass + '].';
        switch (cmd['commandclass']) {
            case '70':// Config
                angular.forEach(xmlData, function(v, k) {

                    var configRequest = request;
                    configRequest += cmd.command + '(' + v.parameterValues + ')';
                    if (confNum) {
                        if (confNum == v.confNum) {
                            dataFactory.runExpertCmd(configRequest, true).then(function(response){}, function(error) {});
                        }
                    } else {
                        dataFactory.runExpertCmd(configRequest, true).then(function(response){},function(error) {});
                    }

                });
                break;
            case '75':// Protection
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {});
                break;
            case '84':// Wakeup
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {});
                break;
            case '27':// Switch all
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataFactory.runExpertCmd(request, true).then(function(response){},function(error) {});
                break;
            default:
                break;
        }
        dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.cfg_xml_url, true).then(function(cfgXml) {
           var xmlFile = expertService.buildCfgXml(xmlData, cfgXml, cmd['id'], cmd['commandclass']);
           dataFactory.putCfgXml(xmlFile).then(function(response){},function(error) {
                    alertify.alert($scope._t('error_update_data'));
                });
        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
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
     * Set zigbee data
     */
    function setData(ZigbeeAPIData, nodeId, refresh) {
        var node = ZigbeeAPIData.devices[nodeId];
        $scope.showDevices = true;
        //$scope.deviceNameId = $filter('deviceName')(nodeId, node) + ' (#' + nodeId + ')';
        $scope.hasBattery = 0x80 in node.endpoints[0].clusters;
        var zddXmlFile = null;
        if (angular.isDefined(node.data.ZDDXMLFile)) {
            zddXmlFile = node.data.ZDDXMLFile.value;
            $scope.deviceZddxFile = node.data.ZDDXMLFile.value;
        }

        //$scope.interviewCommands = deviceService.configGetInterviewCommands(node, ZigbeeAPIData.updateTime);
        //$scope.interviewCommandsDevice = node.data;
        if (zddXmlFile && zddXmlFile !== 'undefined') {
            dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.zddx_url + zddXmlFile).then(function(zddXml) {
                setCont(node, nodeId, zddXml, ZigbeeAPIData, refresh);
            }, function(error) {
                 setCont(node, nodeId, null, ZigbeeAPIData, refresh);
            });

        } else {
            setCont(node, nodeId, null, ZigbeeAPIData, refresh);
        }
    }

    /**
     * Set all conts
     */
    function setCont(node, nodeId, zddXml, ZigbeeAPIData, refresh) {
        if (!zddXml) {
            $scope.noZddx = true;
            // Loop throught endpoints
            angular.forEach(node.endpoints, function (endpoint, endpointId) {
                if (endpoint.clusters[112]) {

                    $scope.hasConfigurationCc =  configurationCc(endpoint.clusters[112], endpointId,nodeId, ZigbeeAPIData);
                    return;
                }
            });
        }
        dataFactory.xmlToJson($scope.cfg.server_url + $scope.cfg.cfg_xml_url, true).then(function(cfgXml) {
            $scope.configCont = expertService.configConfigCont(node, nodeId, zddXml, cfgXml, $scope.lang, $scope.languages);
            $scope.wakeupCont = expertService.configWakeupCont(node, nodeId, ZigbeeAPIData, cfgXml);
            $scope.protectionCont = expertService.configProtectionCont(node, nodeId, ZigbeeAPIData, cfgXml);
            $scope.switchAllCont = expertService.configSwitchAllCont(node, nodeId, ZigbeeAPIData, cfgXml);
            if(!$scope.configCont && !$scope.wakeupCont && !$scope.protectionCont && !$scope.switchAllCont){
              angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
            }
        }, function(error) {
            $scope.configCont = expertService.configConfigCont(node, nodeId, zddXml, null, $scope.lang, $scope.languages);
            $scope.wakeupCont = expertService.configWakeupCont(node, nodeId, ZigbeeAPIData, null);
            $scope.protectionCont = expertService.configProtectionCont(node, nodeId, ZigbeeAPIData, null);
            $scope.switchAllCont = expertService.configSwitchAllCont(node, nodeId, ZigbeeAPIData, null);
        });
    }

    /**
     * Set configuration command class
     * @param cluster
     * @param endpointId
     * @param nodeId
     * @param ZigbeeAPIData
     * @returns {{}}
     */
    function configurationCc(cluster, endpointId,nodeId, ZigbeeAPIData) {
        //console.log(node);

        var ccId = 112;
        var methods = getMethodSpec(ZigbeeAPIData, nodeId, endpointId, ccId, null);
        var command = expertService.configGetCommands(methods, ZigbeeAPIData);
        var obj = {};
        obj['nodeId'] = nodeId;
        obj['rowId'] = 'row_' + nodeId + '_' + endpointId + '_' + ccId;
        obj['endpointId'] = endpointId;
        obj['ccId'] = ccId;
        obj['cmd'] = 'devices[' + nodeId + '].endpoints[' + endpointId + '].clusters[' + ccId + ']';
        obj['cmdData'] = ZigbeeAPIData.devices[nodeId].endpoints[endpointId].clusters[ccId].data;
        obj['cmdDataIn'] = ZigbeeAPIData.devices[nodeId].endpoints[endpointId].data;
        obj['cluster'] = cluster.name;
        obj['command'] = command;
        obj['updateTime'] = ZigbeeAPIData.updateTime;
        return obj;
    }
});



