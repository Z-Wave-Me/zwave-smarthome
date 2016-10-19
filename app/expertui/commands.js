/**
 * @overview Handles expert commands  in the device hardware configuration.
 * @author Martin Vach
 */
/**
 * The controller that handles outputs and inputs.
 * @class ConfigCommandsController
 */
myAppController.controller('ConfigCommandsController', function ($scope, $routeParams, $location, $cookies, $timeout, $filter,  dataFactory,dataService, expertService, _) {
    //$scope.devices = [];
    $scope.commands = [];
    $scope.interviewCommands;

    //$scope.deviceId = 0;
    //$scope.activeTab = 'commands';
    //$scope.activeUrl = 'configuration/commands/';

    //$cookies.tab_config = $scope.activeTab;

    // Load data
    $scope.load = function (nodeId) {
        dataFactory.loadZwaveApiData().then(function(ZWaveAPIData) {
            //$scope.ZWaveAPIData = ZWaveAPIData;
            //$scope.devices = deviceService.configGetNav(ZWaveAPIData);
            var node = ZWaveAPIData.devices[nodeId];
            if (!node) {
                return;
            }
            $scope.getNodeDevices = function () {
                var devices = [];
                angular.forEach($scope.devices, function (v, k) {
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
            $scope.interviewCommands = expertService.configGetInterviewCommands(node, ZWaveAPIData.updateTime);
            $scope.deviceId = nodeId;

            /**
             * Expert commands
             */
            angular.forEach(node.instances, function (instance, instanceId) {
                angular.forEach(instance.commandClasses, function (commandClass, ccId) {
                    var methods = getMethodSpec(ZWaveAPIData, nodeId, instanceId, ccId, null);
                    var command = expertService.configGetCommands(methods, ZWaveAPIData);
                    var obj = {};
                    obj['nodeId'] = nodeId;
                    obj['rowId'] = 'row_' + nodeId + '_' + instanceId + '_' + ccId;
                    obj['instanceId'] = instanceId;
                    obj['ccId'] = ccId;
                    obj['cmd'] = 'devices[' + nodeId + '].instances[' + instanceId + '].commandClasses[' + ccId + ']';
                    obj['cmdData'] = ZWaveAPIData.devices[nodeId].instances[instanceId].commandClasses[ccId].data;
                    obj['cmdDataIn'] = ZWaveAPIData.devices[nodeId].instances[instanceId].data;
                    obj['commandClass'] = commandClass.name;
                    obj['command'] = command;
                    obj['updateTime'] = ZWaveAPIData.updateTime;
                    $scope.commands.push(obj);
                });
            });
        }, function(error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.load($routeParams.nodeId);

    /**
     * Submit expert commands form
     * @param {string} form
     * @param {string} cmd
     */
    $scope.submitExpertCommndsForm = function (form, cmd) {
        var data = $('#' + form).serializeArray();
        var dataJoined = [];
        angular.forEach(data, function (v, k) {
            if (v.value === 'N/A') {
                return;
            }
            dataJoined.push($filter('setConfigValue')(v.value));

        });
        var request = cmd + '(' + dataJoined.join() + ')';
        //dataService.runCmd(request, false, $scope._t('error_handling_data'));
        dataFactory.runExpertCmd(request, true).then(function(response){

        },function(error) {
            alertify.alertError($scope._t('error_update_data'));
        });

    };

    /// --- Private functions --- ///


});