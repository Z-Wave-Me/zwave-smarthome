/**
 * Device configuration controller from ExpertUI
 * @author Martin Vach
 */
myAppController.controller('ConfigConfigurationController', function($scope, $routeParams, $location, $cookies, $filter, $timeout, dataFactory, dataService, expertService) {
    $scope.devices = [];
    $scope.deviceId = 0;
//    $scope.activeTab = 'configuration';
//    $scope.activeUrl = 'configuration/configuration/';
//    $cookies.tab_config = $scope.activeTab;
    $scope.reset = function() {
        $scope.devices = angular.copy([]);
    };
    // Config vars
    $scope.deviceZddx = [];
    $scope.configCont;
    $scope.switchAllCont;
    $scope.protectionCont;
    $scope.wakeupCont;

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

    // Refresh data
    $scope.refresh = function(nodeId) {
        dataService.joinedZwaveData(function(data) {
            setData(data.joined, nodeId, true);
        });
    };
    //$scope.refresh($routeParams.nodeId); 

    // Redirect to detail page
    $scope.changeDevice = function(deviceId) {
        if (deviceId > 0) {
            $location.path($scope.activeUrl + deviceId);
        }
    };

    // Cancel interval on page destroy
    $scope.$on('$destroy', function() {
        //dataService.cancelZwaveDataInterval();
    });

    /**
     * Update from device action
     *
     * @param {string} cmd
     * @returns {undefined}
     */
    $scope.updateFromDevice = function(cmd) {
        dataFactory.runExpertCmd(cmd, true).then(function(response) {
            //dataService.logInfo(response, 'Update from device');
        }, function(error) {
            dataService.logError(error, 'Update from device');
            alert($scope._t('error_update_data'));
        });
        return;
        dataService.runCmd(cmd, false, $scope._t('error_handling_data'));
        $scope.refresh = true;
        var timeOut;
        timeOut = $timeout(function() {
            $scope.refresh = false;
        }, 10000);
        return;
    };

    /**
     * Update from device - configuration section
     */
    $scope.updateFromDeviceCfg = function(cmd, cfg, deviceId) {
        var httpErrors = 0;
        angular.forEach(cfg, function(v, k) {
            if (v.confNum) {
                var request = cmd + '(' + v.confNum + ')';
                dataFactory.runExpertCmd(request + 'dfdf', true).then(function(response) {
                }, function(error) {
                    dataService.logError(httpErrors, 'Update from device');
                    return;
                });
            }

        });
//         if(httpErrors  > 0){
//             alert($scope._t('error_update_data'));
//                return;
//            }
        return;
        $scope.refresh(deviceId);
        var timeOut;
        timeOut = $timeout(function() {
            dataService.cancelZwaveDataInterval();
        }, 10000);
        return;
    };

    /**
     * Apply Config action
     */
    $scope.submitApplyConfigCfg = function(form, cmd, cfgValues, hasBattery, confNum) {
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
        //console.log(xmlData)
        //return;

        // Send command
        var request = 'devices[' + cmd.id + '].instances[' + cmd.instance + '].commandClasses[0x' + cmd.commandclass + '].';
        switch (cmd['commandclass']) {
            case '70':// Config
                angular.forEach(xmlData, function(v, k) {

                    var configRequest = request;
                    configRequest += cmd.command + '(' + v.parameterValues + ')';
                    if (confNum) {
                        if (confNum == v.confNum) {
                            dataService.runCmd(configRequest, false, $scope._t('error_handling_data'));
                        }
                    } else {
                        dataService.runCmd(configRequest, false, $scope._t('error_handling_data'));
                    }

                });
                break;
            case '75':// Protection
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataService.runCmd(request, false, $scope._t('error_handling_data'));
                break;
            case '84':// Wakeup
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataService.runCmd(request, false, $scope._t('error_handling_data'));
                break;
            case '27':// Switch all
                request += cmd.command + '(' + configValues.join(",") + ')';
                dataService.runCmd(request, false, $scope._t('error_handling_data'));
                break;
            default:
                break;
        }

        dataService.getCfgXml(function(cfgXml) {
            var xmlFile = deviceService.buildCfgXml(xmlData, cfgXml, cmd['id'], cmd['commandclass']);
            dataService.putCfgXml(xmlFile);
        });


        //debugger;
        $scope.refresh(cmd['id']);
        var timeOut;
        timeOut = $timeout(function() {
            $('button .fa-spin,a .fa-spin').fadeOut(1000);
            dataService.cancelZwaveDataInterval();
        }, 10000);
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
                dataService.logError(error);
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
        dataFactory.xmlToJson($scope.cfg.server_url + 'config/Configuration.xml', true).then(function(cfgXml) {
            dataService.logInfo(cfgXml, 'Configuration.xml');
            $scope.configCont = expertService.configConfigCont(node, nodeId, zddXml, cfgXml, $scope.lang, $scope.languages);
            $scope.wakeupCont = expertService.configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml);
            $scope.protectionCont = expertService.configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml);
            $scope.switchAllCont = expertService.configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml);
            //dataService.logInfo($scope.switchAllCont, '$scope.switchAllCont');
        }, function(error) {
            dataService.logError(error);
        });
    }
});

