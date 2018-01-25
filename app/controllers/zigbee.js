/**
 * @overview Controllers that handle Zigbee Services.
 * @author Michael Hensche
 */


/**
 * The controller that pairing a device.
 * @class ZigbeeAddDeviceController
 */
myAppController.controller('ZigbeeAddDeviceController', function($scope, $q, $routeParams, $interval, $timeout, $location, dataFactory, dataService, myCache) {
    $scope.zigbeeInclusion = {
        inclusionProcess: {
            networkOpen: false,
            done: false,
            timer: null,
            countdown: 0,
            interval: null,
            joinInterval: null
        }
    }

    // Cancel interval on page destroy
    $scope.$on('$destroy', function () {
        $scope.restOpenCloseNetwork(false);
    });


    $scope.openCloseNetwork = function(open) {
        $scope.restOpenCloseNetwork(open, false);
    };

    $scope.restOpenCloseNetwork = function(open, done) {
        var data = {
            open: open
        };

        dataFactory.postApi('open_network', data).then(function(response) {
            console.log("response", response);
            if(response.data.open) {
                console.log("openNetwork");
                $scope.zigbeeInclusion.inclusionProcess.timer = $timeout(function() {
                        $scope.restOpenCloseNetwork(false, false);   
                }, response.data.time);
                $scope.countdown(response.data.time);
                $scope.deviceJoined();
            } else {
                if($scope.zigbeeInclusion.inclusionProcess.timer) {
                    $timeout.cancel($scope.zigbeeInclusion.inclusionProcess.timer);
                }
                if($scope.zigbeeInclusion.inclusionProcess.interval) {
                    $interval.cancel($scope.zigbeeInclusion.inclusionProcess.interval);
                }
                if($scope.zigbeeInclusion.inclusionProcess.joinInterval) {
                    $interval.cancel($scope.zigbeeInclusion.inclusionProcess.joinInterval);
                }
            }
        
            // Set scope
            angular.extend($scope.zigbeeInclusion.inclusionProcess, {
                    networkOpen: open,
                    done: done
                }
            );

        }, function(error) {

        });                  
    }


    $scope.deviceJoined = function () {
        console.log("loop");
        var refresh = function() {
            console.log("DATA incomming");
            dataFactory.getApi('joined_device', null, true).then(function(response) {
                console.log("response", response.data.joinedDevices);
                if(response.data.joinedDevices.length > 0) {
                    $scope.restOpenCloseNetwork(false, true);
                    $timeout(function() {
                        $location.path('/zigbee/manage/' + response.data.joinedDevices[0]);
                    }, 1000)
                }
            }, function(error) {

            });
        } 


        $scope.zigbeeInclusion.inclusionProcess.joinInterval = $interval(refresh, 2000);
    };


    $scope.countdown = function(time) {
        $scope.zigbeeInclusion.inclusionProcess.countdown = time/1000;
        $scope.zigbeeInclusion.inclusionProcess.interval = $interval(function () {
            $scope.zigbeeInclusion.inclusionProcess.countdown--;
            if ($scope.zigbeeInclusion.inclusionProcess.countdown === 0) {
                $interval.cancel($scope.zigbeeInclusion.inclusionProcess.interval);
            }
        }, 1000);
    }

});
/**
 * The controller that manage Zigbee devices.
 * @class ZigbeeManageController
 */
myAppController.controller('ZigbeeManageController', function($scope, $location, $q, $window, $timeout, dataFactory, dataService) {
    $scope.ZigbeeDevices = {};
    $scope.instance = {};


    $scope.allSettled = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            dataFactory.getApi('instances', '/ZigbeeGateway', true),
            dataFactory.getApi('devices')
        ];

        $q.allSettled(promises).then(function (response) {
            $scope.loading = false;
            var instance = response[0];
            var devices = response[1];

            if (instance.state === 'fulfilled') {
                $scope.instance = instance.value.data.data[0];
            }

            if (devices.state === 'fulfilled') {
                setDevices(dataService.getDevicesData(devices.value.data.data.devices, false,true), $scope.instance);
            }
        });
    };
    $scope.allSettled();

    /**
     * Delete device
     */
    $scope.removeDevice = function(nodeId, target) {
        alertify.confirm("Remove Device?", function() {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
            dataFactory.deleteApi('remove_device', nodeId).then(function(response) {
                console.log("response", response);
                $scope.loading = false;    
                $(target).fadeOut(500); 
            }, function(error) {
                console.log("error", error);
                $scope.loading = false;
                alertify.alertError($scope._t('error_load_data'));
            });
        });
    };

    /// --- Private functions --- ///
    /**
     * Set devices
     */
    function setDevices(devices, instance) { 
        angular.forEach(devices.value(), function(v, k) {
            if(v.creatorId !== instance.id) {
                return;
            }
            var nodeId = v.metrics.nodeId,
                findZigbeeStr = v.id.split('_'),
                eui64 = findZigbeeStr[2];

            if($scope.ZigbeeDevices[nodeId]) {
                $scope.ZigbeeDevices[nodeId]['elements'][v.id] = v;    
            } else {
                $scope.ZigbeeDevices[nodeId] = {};
                angular.extend($scope.ZigbeeDevices[nodeId], {
                    id: nodeId,
                    eui64: eui64,  
                    title: "ZigbeeDevice_"+nodeId,
                    elements: {}
                });
                $scope.ZigbeeDevices[nodeId]['elements'][v.id] = v;
            }
        });
    };
});
/**
 * The controller that handles actions on the Zigbee device.
 * @class ZigbeeManageDetailController
 */
myAppController.controller('ZigbeeManageDetailController', function($scope, $routeParams, $filter, $q, $window, $timeout, dataFactory, dataService, myCache) {
    $scope.eui64 = $routeParams.eui64;
    $scope.rooms = [];
    $scope.devices = [];
    $scope.ZigbeeDevice = {
        eui64: $scope.eui64,
        title: "",
        nodeId: ""
    };
    $scope.instance = {};
    $scope.formInput = {
        show: true,
        newRoom: '',
        elements: {},
        room: 0,
    };

    /**
     * Load all promises
     */
    $scope.allSettled = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

        var promises = [
            dataFactory.getApi('devices', null, true),
            dataFactory.getApi('instances', '/ZigbeeGateway', true),
            dataFactory.getApi('locations')
        ];

        $q.allSettled(promises).then(function (response) {
            $scope.loading = false;
            var devices = response[0];
            var instance = response[1];
            var locations = response[2];

            // Error message
            if (devices.state === 'rejected') {
                $scope.loading = false;
                $scope.formInput.show = false;
                alertify.alertError($scope._t('error_load_data')).set('onok', function (closeEvent) {
                    dataService.goBack();
                });
                return;
            }

            if (devices.state === 'fulfilled' && instance.state === 'fulfilled') {
                $scope.instance = instance.value.data.data[0];
                setDevices(dataService.getDevicesData(devices.value.data.data.devices, false,true), $scope.instance);
            }

            if(locations.state === 'fulfilled') {
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
        dataFactory.runZwaveCmd(cmd).then(function () {});
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
     * Set devices
     */
    function setDevices(devices, instance) { 
        angular.forEach(devices.value(), function(v, k) {
            if(v.creatorId !== instance.id) {
                return;
            }
            var findZigbeeStr = v.id.split('_'),
                 eui64 = findZigbeeStr[2];
            if(eui64 !== $scope.eui64) {
                return
            }
            $scope.devices.push(v);
            $scope.formInput.elements[v.id] = v;
        }); 
        if($scope.devices.length > 0) {
            $scope.ZigbeeDevice.title = "ZigbeeDevice_" + $scope.devices[0].metrics.nodeId;
            $scope.ZigbeeDevice.nodeId = $scope.devices[0].metrics.nodeId;
        } 
    };

});
