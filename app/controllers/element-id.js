/**
 * @overview Controllers that handle element detail actions, as well as custom icon actions.
 * @author Martin Vach
 */


/**
 * The controller that handles element detail actions.
 * @class ElementIdController
 */
myAppController.controller('ElementIdController', function ($scope, $q, $routeParams, $filter, $location, $timeout, cfg, dataFactory, dataService, myCache) {
    $scope.elementId = {
        show: false,
        appType: {},
        input: {},
        locations: {},
        instances: {},
        modules: {}
    };
    $scope.tagList = [];
    $scope.search = {
        text: ''
    };
    $scope.suggestions = [];

    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.getApi('devices', '/' + $routeParams.id, true),
            dataFactory.getApi('locations'),
            dataFactory.getApi('devices'),
            dataFactory.getApi('modules')
        ];

        if ($scope.user.role === 1) {
            promises.push(dataFactory.getApi('instances'));
        }

        $q.allSettled(promises).then(function (response) {
            var device = response[0];
            var locations = response[1];
            var devices = response[2];
            var modules = response[3];
            var instances = response[4];
            

            $scope.loading = false;
            // Error message
            if (device.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - locations
            if (locations.state === 'fulfilled') {
                $scope.elementId.locations = dataService.getRooms(locations.value.data.data).indexBy('id').value();
            }
            // Success - devices
            if (devices.state === 'fulfilled') {
                setTagList(devices.value.data.data.devices);
            }
            // Success - instances
            if (instances && instances.state === 'fulfilled') {
                $scope.elementId.instances = instances.value.data.data;
            }

            // Success - modules
            if (modules && modules.state === 'fulfilled') {
                $scope.elementId.modules = modules.value.data.data;
            }
            // Success - device
            if (device.state === 'fulfilled') {
                var arr = [];
                arr[0] = device.value.data.data;
                if (!dataService.getDevicesData(arr, true).value()[0]) {
                    alertify.alertError($scope._t('error_load_data'));
                    return;
                }
                setDevice(dataService.getDevicesData(arr, true).value()[0]);
                $scope.elementId.show = true;
            }


        });
    };
    $scope.allSettled();

    /**
     * Search me
     */
    $scope.searchMe = function () {
        $scope.suggestions = [];
        if ($scope.search.text.length >= 2) {
            findText($scope.tagList, $scope.search.text, $scope.elementId.input.tags);
        }
    };

    /**
     * Add tag to list
     */
    $scope.addTag = function (tag) {
        tag = tag || $scope.search.text;
        $scope.suggestions = [];
        if (!tag || $scope.elementId.input.tags.indexOf(tag) > -1) {
            return;
        }
        $scope.elementId.input.tags.push(tag);
        $scope.search.text = '';
        return;
    };
    /**
     * Remove tag from list
     */
    $scope.removeTag = function (index) {
        $scope.elementId.input.tags.splice(index, 1);
        $scope.suggestions = [];
    };
    /**
     * Update an item
     */
    $scope.store = function (input) {
        if (input.id) {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            var data = {
                id: input.id,
                location: parseInt(input.location, 10),
                tags: input.tags,
                metrics: input.metrics,
                visibility: input.visibility,
                permanently_hidden: input.permanently_hidden
            };
            dataFactory.putApi('devices', input.id, data).then(function (response) {
                $scope.user.dashboard = dataService.setArrayValue($scope.user.dashboard, input.id, input.onDashboard);
                $scope.user.hide_single_device_events = dataService.setArrayValue($scope.user.hide_single_device_events, input.id, input.hide_events);
                $scope.updateProfile($scope.user, input.id);

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };
    /**
     * Update profile
     */
    $scope.updateProfile = function (profileData, deviceId) {
        dataFactory.putApi('profiles', profileData.id, profileData).then(function (response) {
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
            angular.extend($scope.user, response.data.data);
            angular.extend(cfg.user, response.data.data);
            //dataService.setUser(response.data.data);
            myCache.remove('devices');
            myCache.remove('devices/' + deviceId);
            myCache.remove('locations');
            dataService.goBack();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
        return;
    };

    /**
     * Delete an element from the view
     */
    $scope.deleteElement = function (input,message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            var data = {
                id: input.id,
                permanently_hidden: true
            };
            dataFactory.putApi('devices', input.id, data).then(function (response) {
                $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('reloading_page')};
                $timeout(function () {
                    $scope.loading = false;
                    myCache.removeAll();
                    $location.path('/elements');
                }, 2000);
            }, function (error) {
                alertify.alertError($scope._t('error_delete_data'));
                $scope.loading = false;
            });
        });

    };

    /// --- Private functions --- ///
    /**
     * Set device
     */
    function setDevice(device) {
        var findZwaveStr = "ZWayVDev_zway_";
        var findZenoStr = "ZEnoVDev_zeno_x";
        var zwaveId = false;
        $scope.elementId.input = device;
        //$scope.elementId.input.custom_icons = { on: 'Modem-icon.png',off: 'Stop-icon.png'};
        
        var instance = _.findWhere($scope.elementId.instances, {id: $filter('toInt')(device.creatorId)});         
        var modul = _.findWhere($scope.elementId.modules, {moduleName: instance.moduleId});

        $scope.elementId.appType['instance'] = instance;
        $scope.elementId.appType['modul'] = modul;

        if (device.id.indexOf(findZwaveStr) > -1) {
            zwaveId = device.id.split(findZwaveStr)[1].split('-')[0];
            $scope.elementId.appType['zwave'] = zwaveId.replace(/[^0-9]/g, '');
        } else if (device.id.indexOf(findZenoStr) > -1) {
            $scope.elementId.appType['enocean'] = device.id.split(findZenoStr)[1].split('_')[0];
        } 
        
        angular.extend($scope.elementId.input,
            {iconPath: dataService.assignElementIcon($scope.elementId.input)},
        );
    };

    /**
     * todo: deprecated
     * Set output
     */
    /*function setOutput(input) {
        return {
            'id': input.id,
            'location': parseInt(input.location, 10),
            'tags': input.tags,
            'metrics': input.metrics,
            'visibility': input.visibility,
            'permanently_hidden': input.permanently_hidden
        };
    }
    ;*/

    /**
     * Set tag list
     */
    function setTagList(devices) {
        angular.forEach(devices, function (v, k) {
            if (v.tags) {
                angular.forEach(v.tags, function (t, kt) {
                    if ($scope.tagList.indexOf(t) === -1) {
                        $scope.tagList.push(t);
                    }

                });
            }
        });
    }
    ;

    /**
     * Find text
     */
    function findText(n, search, exclude) {
        var gotText = false;
        for (var i in n) {
            var re = new RegExp(search, "ig");
            var s = re.test(n[i]);
            if (s
                && (!_.isArray(exclude) || exclude.indexOf(n[i]) === -1)) {
                $scope.suggestions.push(n[i]);
                gotText = true;
            }
        }
        return gotText;
    }
    ;

});

/**
 * The controller that handles custom icon actions in the elemt detail view.
 * @class ElementIconController
 */
myAppController.controller('ElementIconController', function ($scope, $timeout, $filter, cfg, dataFactory, dataService) {
    $scope.icons = {
        selected: false,
        uploadedFileName: false,
        all: {},
        uploaded: {},
        info: {
            maxSize: $filter('fileSizeString')(cfg.upload.icon.size),
            extensions: cfg.upload.icon.extension.toString()
        }
    };
    /**
     * Load icons from config
     * @returns {undefined}
     */
    $scope.loadCfgIcons = function () {
        $scope.icons.all = dataService.getSingleElementIcons($scope.elementId.input);

    };
    $scope.loadCfgIcons();

    /**
     * Load already uploaded icons
     * @returns {undefined}
     */
    $scope.loadUploadedIcons = function () {
        // Atempt to load data
        dataFactory.getApi('icons', null, true).then(function (response) {
            $scope.icons.uploaded = response.data.data;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            $scope.loading = false;
        });

    };
    $scope.loadUploadedIcons();
    /**
     * Set selected icon
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.setSelectedIcon = function (icon) {
        if (!icon) {
            return;
        }
        $scope.icons.selected = icon;
    };
    /**
     * Set a custom icon with an icon from the list
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.setCustomIcon = function (icon) {
        if (!icon) {
            return;
        }
        $scope.icons.all.custom[$scope.icons.selected] = icon;

    };
    /**
     * Remove a custom icon
     * @param {string} icon
     * @returns {undefined}
     */
    $scope.removeCustomIcon = function (icon) {
        if (!icon) {
            return;
        }
        delete $scope.icons.all.custom[icon];

    };

    /**
     * Update custom icons with selected icons from the list
     * @returns {undefined}
     */
    $scope.updateWithCustomIcon = function () {
        var customicons = function (icons, custom) {
            var obj = {};
            if (_.isEmpty(custom)) {
                return obj;
            } else if (icons['default']) {
                return custom;
            } else {
                obj['level'] = custom;
                return obj;
            }
        }
        var input = {
            customicons: customicons($scope.icons.all.default, $scope.icons.all.custom)
        };
        var id = $scope.elementId.input.id;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('customicon', id, input, '?icon').then(function (response) {
            $scope.icons.selected = false;
            $scope.loading = false;
            dataService.showNotifier({message: $scope._t('success_updated')});
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_update_data'));
        });
    };
    /**
     * Cancel all updates and hide a list with uploaded icons
     * @returns {undefined}
     */
    $scope.cancelUpdate = function () {
        // Reset icons
        $scope.loadCfgIcons();
        // Set selected icon to false
        $scope.icons.selected = false;
    };

});