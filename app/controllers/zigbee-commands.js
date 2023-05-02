/**
 * @overview Handles expert commands  in the device hardware configuration.
 * @author Martin Vach
 */
/**
 * The controller that handles outputs and inputs.
 * @class ConfigCommandsController
 */
myAppController.controller('ConfigCommandsController', function ($scope, $routeParams, $location, $cookies, $timeout, $filter,$interval,  dataFactory,dataService, expertService,cfg, _) {
    $scope.commands = [];
    $scope.interviewCommands;
    $scope.ccConfiguration = {
        all: [],
        interval: null
    };

    // Load data
    $scope.load = function (nodeId) {
        dataFactory.loadZigbeeApiData().then(function(ZigbeeAPIData) {
            if(!ZigbeeAPIData){
                return;
            }
            var node = ZigbeeAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            var interviewCommands = expertService.configGetInterviewCommands(node, ZigbeeAPIData.updateTime);
            var ccConfiguration = _.findWhere(interviewCommands,{ccName: "Configuration"});
            $scope.getNodeDevices = function () {
                var devices = [];
                angular.forEach($scope.devices, function (v, k) {
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
            $scope.interviewCommands = interviewCommands;
            //$scope.ccConfiguration.all = _.findWhere(interviewCommands,{ccName: "Configuration"});
            //console.log($scope.interviewCommands)
            //console.log($scope.ccConfiguration.all)
            $scope.deviceId = nodeId;
            setCcConfig(ccConfiguration);
            $scope.refreshZigbeeData(nodeId,ZigbeeAPIData);
            /**
             * Expert commands
             */
            angular.forEach(node.endpoints, function (endpoint, endpointId) {
                angular.forEach(endpoint.clusters, function (commandClass, ccId) {
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
                    obj['commandClass'] = commandClass.name;
                    obj['command'] = command;
                    obj['updateTime'] = ZigbeeAPIData.updateTime;
                    $scope.commands.push(obj);
                });
            });
        }, function(error) {
          angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
        });
    };
    $scope.load($routeParams.nodeId);

    /**
     * Refresh zigbee data
     * @param {object} ZigbeeAPIData
     */
    $scope.refreshZigbeeData = function(nodeId,ZigbeeAPIData) {
        var refresh = function() {
            dataFactory.joinedZigbeeData(ZigbeeAPIData).then(function(response) {
                var node = ZigbeeAPIData.devices[nodeId];
                if (!node) {
                    return;
                }
                var interviewCommands = expertService.configGetInterviewCommands(node, response.updateTime);
                var ccConfiguration = _.findWhere(interviewCommands,{ccName: "Configuration"});
                setCcConfig(ccConfiguration);
            }, function(error) {});
        };
        $scope.ccConfiguration.interval = $interval(refresh, $scope.cfg.interval);
    };

    /**
     * Submit expert commands form
     * @param {string} form
     * @param {string} cmd
     */
    $scope.submitExpertCommndsForm = function (form, cmd,v) {
        var data = $('#' + form).serializeArray();
        var dataJoined = [];

        angular.forEach(data, function (v, k) {
            if (v.value === 'N/A') {
                return;
            }
            dataJoined.push($filter('setConfigValue')(v.value));

        });
        var paramInput  = dataJoined[0];
        //console.log(paramInput)
        $scope.toggleRowSpinner('row_' + paramInput);
        //console.log($scope.rowSpinner)
        //var obj = $scope.ccConfiguration.all[paramInput];
        //console.log(obj)
        var request = cmd + '(' + dataJoined.join() + ')';
        //dataService.runCmd(request, false, $scope._t('error_handling_data'));
        dataFactory.runExpertCmd(request, true).then(function(response){
            dataService.showNotifier({message: $scope._t('success_updated')});
            $timeout($scope.toggleRowSpinner, $scope.cfg.interval);
        },function(error) {
            $scope.toggleRowSpinner();
            alertify.alertError($scope._t('error_update_data'));
        });

    };

    /// --- Private functions --- ///
    function setCcConfig(data){
        //console.log(data.cmdData)
        angular.forEach(data.cmdData, function (v, k) {
            if(_.isNaN(parseInt(k))){
                return;
            }
            var rowId = 'row_' + k;
            //console.log(k)
            var obj = {};
            obj['rowId'] = rowId;
            obj['param'] = k;
            obj['size'] = v.size.value;
            obj['val'] = v.val.value;
            obj['updateTime'] = v.updateTime;
            obj['isUpdated'] = (v.updateTime > v.invalidateTime ? true : false);
            obj['isEqual'] = true;
            var findIndex = _.findIndex($scope.ccConfiguration.all, {rowId: obj.rowId});
            if(findIndex > -1){
                obj['isEqual'] = _.isEqual(obj, $scope.ccConfiguration.all[findIndex]);
                angular.extend(obj,{isEqual: _.isEqual(obj, $scope.ccConfiguration.all[findIndex])});
               angular.extend($scope.ccConfiguration.all[findIndex],obj);
            }else{
                $scope.ccConfiguration.all.push(obj);
            }
        });

    }


});