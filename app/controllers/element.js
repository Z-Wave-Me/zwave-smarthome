/**
 * @overview Controllers that handle the list of elements, dashboar and elements in the room.
 * @author Martin Vach
 */

/**
 * The element root controller
 * @class ElementBaseController
 */
myAppController.controller('ElementBaseController', function($scope, $q, $interval, $cookies, $filter, $routeParams, $timeout, $location, $rootElement, cfg, dataFactory, dataService, myCache) {
    /**
     * Get device by ID
     */
    $scope.getDeviceById = function(id) {
        var device = _.where($scope.dataHolder.devices.collection, {
            id: id
        });
        if (device[0]) {
            angular.extend($scope.dataHolder.devices.byId, device[0]);
        }
    };

    $scope.initialLoadInterval = $interval(function() {
            if($scope.initialLoadFinish) {
                $scope.refreshDevices();
                $interval.cancel($scope.initialLoadInterval)
            }
    }, 1000);

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function() {
        $scope.autocomplete.results = dataService.autocomplete($scope.dataHolder.devices.all, $scope.autocomplete);
        // Expand/Collapse the list
        if (!_.isEmpty($scope.autocomplete.results)) {
            $scope.expandAutocomplete('searchElements');
        } else {
            $scope.expandAutocomplete();
        }
        // Reset filter q if is input empty
        if ($scope.dataHolder.devices.filter.q && $scope.autocomplete.term.length < 1) {
            $scope.setFilter();
        }
    }

    /**
     * Change view mode - default/edit
     * @param {string} mode
     */
    $scope.changeMode = function(mode) {
        if (mode === 'default') {
            $scope.dataHolder.dragdrop.data = [];
        }
        if ($scope.dataHolder.dragdrop.action === 'elements') {
            $scope.setFilter(false);
        }
        if (mode === 'edit') {
            $scope.dataHolder.devices.collection = $filter('orderBy')( $scope.dataHolder.devices.collection, cfg.orderby.elements[$scope.dataHolder.devices.orderBy])
        }
        $scope.dataHolder.mode = mode;
    }

    /**
     * Set filter
     */
    $scope.setFilter = function(filter) {
        // Reset data
        $scope.autocomplete.results = [];
        $scope.dataHolder.devices.noSearch = false;
        $scope.expandAutocomplete();
        // Is fiter value empty?
        var empty = (_.values(filter) == '');

        if (!filter || empty) { // Remove filter
            $scope.dataHolder.devices.filter = {}
        } else { // Set filter
            $scope.dataHolder.devices.filter = filter
        }
        $scope.allSettled();
    };

    /**
     * Set filter
     */
    $scope.setListFilter = function(item) {
        var list = [];
        // Reset data
        $scope.autocomplete.results = [];
        $scope.dataHolder.devices.noSearch = false;
        $scope.expandAutocomplete();

        if ($scope.dataHolder.devices.filter.list) {
            var index = _.findIndex($scope.dataHolder.devices.filter.list, item);
            list = $scope.dataHolder.devices.filter.list;
            if (index > -1) {
                list.splice(index, 1);
            } else {
                list.push(item);
            }
        } else {
            list.push(item);
        }
        if (list.length > 0) {
            $scope.dataHolder.devices.filter = {list}
        } else {
            $scope.dataHolder.devices.filter = {}
        }
        $scope.allSettled();
    };


    /**
     * Show hidden elements
     */
    $scope.showHiddenEl = function(status) {
        angular.extend($scope.dataHolder.devices, {
            filter: {}
        });
        $cookies.filterElements = angular.toJson({});
        status = $filter('toBool')(status);
        angular.extend($scope.dataHolder.devices, {
            showHidden: status
        });
        $cookies.showHiddenEl = status;
        $scope.reloadData();
    };

    /**
     * Set order by
     */
    $scope.setOrderBy = function(key) {
        $scope.dataHolder.devices.orderBy = key;
    };

    $scope.elementOnLongPress = function() {};
    $scope.elementOnTouchEnd = function() {};


    /**
     * Element highlighting toggle
     */
    $scope.highlightElementToogle = function(id) {
        var ele = angular.element(id);
        ele.hasClass('dd-on-start') ? ele.removeClass('dd-on-start') : ele.addClass('dd-on-start');
    }

    /**
     * Function to run when when a user starts moving an element
     * @param item -  is the item in model which started being moved
     * @param part - is the part from which the $item originates
     * @param index -  is the index of the $item in $part
     * @param helper - is an object which contains the jqLite/jQuery object (as property element) of what is being dragged around
     */
    $scope.dragDropStart = function(item, part, index, helper) {
        helper.element.addClass('dd-on-start');
    }

    /**
     * Function to run when elements order has changed after sorting
     * @param item - is the item in model which has been moved
     * @param partFrom - is the part from which the $item originated
     * @param partTo - is the part to which the $item has been moved
     * @param indexFrom -  is the previous index of the $item in $partFrom
     * @param indexTo -  is the index of the $item in $partTo
     */
    $scope.dragDropSort = function(item, partFrom, partTo, indexFrom, indexTo) {
        angular.element('.card-element-dragdrop').removeClass('dd-on-start');
        $scope.dataHolder.dragdrop.data = [];
        angular.forEach(partFrom, function(v, k) {
            $scope.dataHolder.dragdrop.data.push(v.id);
        });
    }

    /**
     * Function to run when when a user stops moving an element
     * @param item - is the item in model which started being moved
     * @param part - is the part from which the $item originates
     * @param index - is the index of the $item in $part
     */
    $scope.dragDropStop = function(item, part, part) {
        angular.element('.card-element-dragdrop').removeClass('dd-on-start');
    }

    /**
     * Save drag and drop object
     */
    $scope.dragDropSave = function() {
        dataFactory.putApi('reorder', false, $scope.dataHolder.dragdrop).then(function(response) {
            $scope.dataHolder.dragdrop.data = [];
            $scope.dataHolder.mode = 'default';
            $scope.setOrderBy('order_' + $scope.getBodyId());
            $scope.allSettled(true);
        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.dataHolder.dragdrop.data = [];
        });
    }

    /**
     * Run command
     */
    $scope.runCmd = function(cmd, id) {
        if(id) {
            var index = _.findIndex($scope.dataHolder.devices.all, {
                id: id
            });
            angular.extend($scope.dataHolder.devices.all[index], {
                progress: true
            });
        }

        dataFactory.runApiCmd(cmd).then(function(response) {
            if(id) {
                var index = _.findIndex($scope.dataHolder.devices.all, {
                    id: id
                });

                if ($scope.dataHolder.devices.all[index]) {

                    var cmdTimeout = $timeout(function() {
                        angular.extend($scope.dataHolder.devices.all[index], {
                            progress: false
                        });
                        if ($scope.cmdTimeouts[id]) {
                            delete $scope.cmdTimeouts[id]
                            $scope.cmdTimeouts.splice($scope.cmdTimeouts.indexOf(id), 1);
                        }
                    }, cfg.pending_cmd_limit);

                    $scope.cmdTimeouts[id] = cmdTimeout;
                }
            }
        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
            if(id) {
                angular.extend($scope.dataHolder.devices.all[index], {
                    progress: false
                });
            }
        });
        return;
    };

    /**
     * get RGB state
     */
    $scope.getRgbState = function(rgbId) {
        var baseId = rgbId.substr(0, rgbId.indexOf('-')),
            rgbIndex = _.findIndex($scope.dataHolder.devices.all, {
                id: rgbId
            }),
            dimmerIndex = _.findIndex($scope.dataHolder.devices.all, {
                id: baseId + '-0-38'
            }),
            softIndex = _.findIndex($scope.dataHolder.devices.all, {
                id: baseId + '-0-51-0'
            }),
            coldIndex = _.findIndex($scope.dataHolder.devices.all, {
                id: baseId + '-0-51-1'
            });

        if (softIndex < 0 || coldIndex < 0)
            return false;

        if ($scope.dataHolder.devices.all[dimmerIndex] && $scope.dataHolder.devices.all[dimmerIndex].metrics && $scope.dataHolder.devices.all[dimmerIndex].metrics.level && $scope.dataHolder.devices.all[dimmerIndex].metrics.level != 'off') {
            if (($scope.dataHolder.devices.all[softIndex] && $scope.dataHolder.devices.all[softIndex].metrics && $scope.dataHolder.devices.all[softIndex].metrics.level && $scope.dataHolder.devices.all[softIndex].metrics.level != 'off') ||
                ($scope.dataHolder.devices.all[coldIndex] && $scope.dataHolder.devices.all[coldIndex].metrics && $scope.dataHolder.devices.all[coldIndex].metrics.level && $scope.dataHolder.devices.all[coldIndex].metrics.level != 'off')) {
                return 'w';
            } else {
                return 'rgb';
            }
        } else {
            return 'off';
        }
    };


    /**
     * set RGB state
     */
    $scope.runRgbCmd = function(cmd, rgbId) {
        var baseId = rgbId.substr(0, rgbId.indexOf('-'))
        dimmerId = baseId + '-0-38',
            softId = baseId + '-0-51-0',
            coldId = baseId + '-0-51-1',
            softIndex = _.findIndex($scope.dataHolder.devices.all, {
                id: softId
            }),
            coldIndex = _.findIndex($scope.dataHolder.devices.all, {
                id: coldId
            });

        switch (cmd) {
            case 'off':
                //perform off for dimmer
                $scope.runCmd(dimmerId + '/command/off', dimmerId);
                break;
            case 'rgb':
                // perform off for soft&cold if
                $scope.runCmd(softId + '/command/off', softId);
                $scope.runCmd(coldId + '/command/off', coldId);

                // run on cmd for dimmer & rgb
                $scope.runCmd(rgbId + '/command/on', rgbId);
                $scope.runCmd(dimmerId + '/command/on', dimmerId);
                break;
            case 'w':
                // perform off for rgb and on for soft&warm and dimmer
                $scope.runCmd(rgbId + '/command/off', rgbId);

                oldSoft = typeof $scope.dataHolder.devices.all[softIndex].metrics.oldLevel !== 'undefined' ? $scope.dataHolder.devices.all[softIndex].metrics.oldLevel : 99;
                oldCold = typeof $scope.dataHolder.devices.all[coldIndex].metrics.oldLevel !== 'undefined' ? $scope.dataHolder.devices.all[coldIndex].metrics.oldLevel : 99;

                if (!oldSoft && !oldCold) {
                    oldSoft = 99;
                    oldCold = 99;
                }
                // perform on
                $scope.runCmd(softId + '/command/exact?level=' + oldSoft, softId);
                $scope.runCmd(coldId + '/command/exact?level=' + oldCold, coldId);
                $scope.runCmd(dimmerId + '/command/on', dimmerId);
                break;
        }
        return;
    };

    /**
     * Reset devicse data holder
     */
    $scope.resetDevices = function(devices) {
        angular.extend($scope.dataHolder.devices, devices);
    };

    /**
     * Delete device history
     */
    $scope.deleteHistory = function(input, message, event) {
        alertify.confirm(message, function() {
            dataFactory.deleteApi('history_delete', '?id='+input.id).then(function(response) {
                dataService.showNotifier({
                    message: $scope._t('delete_successful')
                });
                $scope.handleModal('modalHistory', event);
                $scope.reloadData();

            }, function(error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
    };

    /**
     * Set visibility
     */
    $scope.setVisibility = function(v, visibility) {
        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('updating')
        };
        dataFactory.putApi('devices', v.id, {
            visibility: visibility
        }).then(function(response) {
            $scope.loading = false;
            $scope.reloadData();
        }, function(error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
    };

    /**
     * Set exact value for the command
     */
    $scope.setExactCmd = function(v, type, run) {
        var count;
        var val = parseFloat(v.metrics.level);
        var min = parseInt(v.minMax.min, 10);
        var max = parseInt(v.minMax.max, 10);
        var step = parseFloat(v.minMax.step);
        switch (type) {
            case '-':
                count = val - step;
                break;
            case '+':
                count = val + step;
                break;
            default:
                count = parseInt(type, 10);
                break;
        }

        if (count < min) {
            count = min;
        }
        if (count > max) {
            count = max;
        }

        var cmd = v.id + '/command/exact?level=' + count;
        v.metrics.level = count;
        $scope.runCmd(cmd);
    };

    /**
     * device on long press action
     */
    $scope.itemOnLongPress = function(id) {
        $scope.longPressTimeout = $timeout(function() {
            $location.path("element/" + id);
        }, 1000);
    }

    /**
     * device on end long press action
     */
    $scope.itemOnTouchEnd = function() {
        $timeout.cancel($scope.longPressTimeout);
    }

    /// --- Private functions --- ///
    /**
     * Set device
     */
    $scope.handlePower = function (device) {
        if(device.metrics.level === 0) {
            dataFactory.runCmdExact(device.id, device.minMax.max);
        } else {
            dataFactory.runCmdExact(device.id, device.minMax.min);
        }
    }
    $scope.adaptiveFontSize = function (text) {
        if (typeof text === 'string' && text.length > 0) {
            var width = document.querySelector('.widget-entry-in').offsetWidth;
            if (width > 300) {
                var scaleSize = Math.min(30, Math.round((width - 134) / text.length / .7));
                return {'font-size': (scaleSize > 30 ? 30 : scaleSize) + 'px'};
            }
            return {};
        }
    }
});


/**
 * The controller that handles elements on the dashboard.
 * @class ElementDashboardController
 */
myAppController.controller('ElementDashboardController', function($scope, $routeParams) {
    $scope.dataHolder.devices.filter = {
        onDashboard: true
    };
    $scope.elementDashboard = {
        firstLogin: ($routeParams.firstlogin || false),
        firstFile: 'app/views/welcome/first_login.html'
    };
});

/**
 * The controller that handles elements in the room.
 * @class ElementRoomController
 */
myAppController.controller('ElementRoomController', function($scope, $q, $routeParams, $timeout, $location, cfg) {
    var id  = parseInt($routeParams.id);
    $scope.dataHolder.devices.filter = {
        location: id
    };
    $scope.room = $scope.dataHolder.devices.rooms[id] || {};
    cfg.route.pageClass = "page-room";
    $scope.swipeTimer = null;


    $scope.$on('$destroy', function() {
        cfg.route.pageClass = false;
    });

    /**
     * room bar on long press action
     */
    $scope.roomBarOnLongPress = function(id) {
        $scope.longPressTimeout = $timeout(function() {
            $location.path("config-rooms/" + id);
        }, 1000);
    }

    /**
     * room bar on end long press action
     */
    $scope.roomBarOnTouchEnd = function() {
        $timeout.cancel($scope.longPressTimeout);
    }


    /**
     * Handle swipe event
     */
    $scope.$on('swipe', function(event, args) {
        $scope.swipeMe(args);
    });

    /**
     * Room navigation
     */
    $scope.swipeMe = function(dir) {
        if ($scope.dataHolder.mode === 'default' && $scope.deviceDetector.isMobile()) {
            if ($scope.swipeTimer) {
                $timeout.cancel($scope.swipeTimer);
            }

            $timeout(function() {
                cfg.route.swipeDir = false;
            }, 1000);

            cfg.route.swipeDir = dir;
            if (dir == "left") {
                if ($(".appmodal").length == 0) {
                    var currentRoom = $scope.dataHolder.devices.filter.location,
                        keys = Object.keys($scope.dataHolder.devices.rooms),
                        loc = keys.indexOf(currentRoom.toString());

                    if (loc > -1) {
                        var i = 0;
                        if (loc < keys.length - 1) {
                            i = keys[loc + 1];
                        }
                        $location.path("rooms/" + i);
                    }
                }
            }

            if (dir == "right") {
                if ($(".appmodal").length == 0) {
                    var currentRoom = $scope.dataHolder.devices.filter.location,
                        keys = Object.keys($scope.dataHolder.devices.rooms),
                        loc = keys.indexOf(currentRoom.toString());

                    if (loc > -1) {
                        var i = 0;
                        if (loc > 0) {
                            i = keys[loc - 1];
                        } else {
                            i = keys[keys.length - 1];
                        }
                        $location.path("rooms/" + i);
                    }
                }
            }
        }
    }
});
