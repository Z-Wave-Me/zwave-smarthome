/**
 * Application services
 * @author Martin Vach
 */
var myAppService = angular.module('myAppService', []);

/**
 * Device service
 */
myAppService.service('dataService', function($filter, $log, $cookies, $location, $window, myCache, cfg, _) {
    /// --- Public functions --- ///
    /**
     * Get language line by key
     */
    this.getLangLine = function(key, languages) {
        if (angular.isObject(languages)) {
            if (angular.isDefined(languages[key])) {
                return languages[key] !== '' ? languages[key] : key;
            }
        }
        return key;
    };
    /**
     * Show connection error
     */
    this.showConnectionError = function(error) {
        $('#update_time_tick').html('<i class="fa fa-minus-circle fa-lg text-danger"></i>');
        return this.logError(error, 'Unable to recieve HTTP data');
    };

    /**
     * Show connection spinner
     */
    this.showConnectionSpinner = function() {
        $('#update_time_tick').html('<i class="fa fa-spinner fa-spin fa-lg text-success"></i>');
        //return this.logError(error,'Unable to recieve HTTP data');
    };

    /**
     * Update time tick
     */
    this.updateTimeTick = function(time) {

        time = (time || Math.round(+new Date() / 1000));
        $('#update_time_tick').html('<span class="navi-time-link"><i class="fa fa-clock-o text-success"></i> <span class="text-success">' + $filter('getCurrentTime')(time)) + '</span></span>';
    };


    /**
     * Log error
     */
    this.logError = function(error, message) {
        message = message || 'ERROR:';
        $log.error('---------- ' + message + ' ----------', error);
    };
    /**
     * Log info
     */
    this.logInfo = function(info, message) {
        message = message || 'INFO:';
        $log.info('---------- ' + message + ' ----------', info);
    };


    /**
     * Mobile device detect
     */
    this.isMobile = function(a) {
        return isMobile(a);
    };


    /**
     * Get user data
     */
    this.getUser = function(data) {
        return getUser(data);
    };

    /**
     * Set user data
     */
    this.setUser = function(data) {
        return setUser(data);
    };

    /**
     * Get user SID (token)
     */
    this.getZWAYSession = function() {
        return getZWAYSession();
    };
    /**
     * Set user SID (token)
     */
    this.setZWAYSession = function(sid) {
        return setZWAYSession(sid);
    };
    /**
     * Get last login
     */
    this.getLastLogin = function() {
        return getLastLogin();
    };

    /*
     * Set last login
     */
    this.setLastLogin = function(val) {
        return setLastLogin(val);
    };

    /**
     * Logout
     */
    this.logOut = function() {
        return logOut();

    };

    /**
     * Get device data
     */
    this.getDevices = function(data, filter, positions, instances, location) {
        return getDevices(data, filter, positions, instances, location);
    };

    /**
     * Get device types
     */
    this.getDeviceType = function(data) {
        return getDeviceType(data);
    };

    /**
     * Update devices
     */
    this.updateDevices = function(data) {
        return updateDevices(data);
    };

    /**
     * Get chart data
     */
    this.getChartData = function(data, colors) {
        return getChartData(data, colors);
    };

    /**
     * Get tags
     */
    this.getTags = function(data) {
        return getTags(data);
    };

    /**
     * Get module form data
     */
    this.getModuleFormData = function(module, data) {
        return getModuleFormData(module, data);
    };

    /**
     * Get module config input
     */
    this.getModuleConfigInputs = function(module, params, namespaces) {
        return getModuleConfigInputs(module, params, namespaces);
    };

    /**
     * Set array value
     */
    this.setArrayValue = function(data, key, add) {
        return setArrayValue(data, key, add);
    };

    /**
     * Get event level
     */
    this.getEventLevel = function(data, set) {
        return getEventLevel(data, set);
    };

    /**
     * Get config navigation devices
     */
    this.configGetNav = function(ZWaveAPIData) {
        return configGetNav(ZWaveAPIData);
    };

    /**
     * Set EnOcean profile
     */
    this.setEnoProfile = function(data) {
        return setEnoProfile(data);
    };

    /// --- Private functions --- ///

    /**
     * Mobile device detect
     */
    function isMobile(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Get user data
     */
    function getUser() {
        var user = ($cookies.user !== 'undefined' ? angular.fromJson($cookies.user) : false);
        return user;
    }

    /**
     * Set user data
     */
    function setUser(data) {
        if (!data) {
            delete $cookies['user'];
            return;
        }
        $cookies.user = angular.toJson(data);
        return data;

    }
    /**
     * Get user SID (token)
     */
    function getZWAYSession() {
        return $cookies.ZWAYSession;

    }
    /**
     * Set user SID (token)
     */
    function setZWAYSession(sid) {
        if (!sid) {
            delete $cookies['ZWAYSession'];
            return;
        }
        $cookies.ZWAYSession = sid;

    }

    /**
     * Get last login
     */
    function getLastLogin() {
        return $cookies.lastLogin !== 'undefined' ? $cookies.lastLogin : false;

    }

    /**
     * Set last login
     */
    function setLastLogin(val) {
        $cookies.lastLogin = val;

    }

    /**
     * Logout
     */
    function logOut() {
        setUser(null);
        setZWAYSession(null);
        $window.location.href = '#/';
        $window.location.reload();

    }

    /**
     * Get device data
     */
    function getDevices(data, filter, dashboard, instances, location) {
        var obj;
        var collection = [];
        var onDashboard = false;
        var findZwaveStr = "ZWayVDev_zway_";
        var findZenoStr = "ZEnoVDev_zeno_x";

        angular.forEach(data, function(v, k) {
            var instance;
            var minMax = {min: 0, max: 99};
            var hasInstance = false;
            var zwaveId = false;
            var level = $filter('numberFixedLen')(v.metrics.level);
            var rgbColors = false;
            var yesterday = (Math.round(new Date().getTime() / 1000)) - (24 * 3600);
            var isNew = v.creationTime > yesterday ? true : false;
            var appType = {};
            if (v.permanently_hidden || v.deviceType == 'battery') {
                return;
            }
            if (location === 'post' && v.location) {
                return;
            }
            if (location > 0) {
                if (v.location != location && v.location) {
                    return;
                }
            }
            if (instances) {
                if (v.id.indexOf(findZwaveStr) > -1) {
                    zwaveId = v.id.split(findZwaveStr)[1].split('-')[0];
                    appType['zwave'] = zwaveId.replace(/[^0-9]/g, '');
                } else if (v.id.indexOf(findZenoStr) > -1) {
                    appType['enocean'] = v.id.split(findZenoStr)[1].split('_')[0];
                } else {
                    //instance = getRowBy(instances, 'id', v.creatorId);
                    instance = _.findWhere(instances, {id: v.creatorId});
                    if (instance && instance['moduleId'] != 'ZWave') {
                        hasInstance = instance;
                        appType['instance'] = instance;

                    }
                }
            }

            if (dashboard && dashboard.indexOf(v.id) !== -1) {
                var onDashboard = true;
            }

            if (v.metrics.color) {
                rgbColors = 'rgb(' + v.metrics.color.r + ',' + v.metrics.color.g + ',' + v.metrics.color.b + ')';
            }
            // Create min/max value
            switch (v.probeType) {
                case 'test':
                    minMax = {min: 0, max: 255};
                    break;
                default:
                    break;
            }
            obj = {
                'id': v.id,
                'zwaveId': zwaveId,
                'title': v.metrics.title,
                'metrics': v.metrics,
                'rgbColors': rgbColors,
                'rgbColorsSDefault': rgbColors,
                'tags': v.tags,
                'permanently_hidden': v.permanently_hidden,
                'level': level,
                'icon': v.metrics.icon,
                'probeTitle': v.metrics.probeTitle,
                'scaleTitle': v.metrics.scaleTitle,
                'deviceType': v.deviceType,
                'probeType': v.probeType,
                'location': v.location,
                'creatorID': v.creatorId,
                'creationTime': v.creationTime,
                'updateTime': v.updateTime,
                'onDashboard': onDashboard,
                'imgTrans': false,
                'visibility': v.visibility,
                'hasHistory': (v.hasHistory === true ? true : false),
                'minMax': minMax,
                'cfg': {
                    'zwaveId': zwaveId,
                    'hasInstance': hasInstance,
                    'isNew': isNew
                },
                'appType': appType
            };
            if (filter) {
                if (angular.isArray(obj[filter.filter])) {
                    if (obj[filter.filter].indexOf(filter.val) > -1) {
                        collection.push(obj);
                    }
                } else {
                    if (obj[filter.filter] == filter.val) {
                        collection.push(obj);
                    }
                }

            } else {
                collection.push(obj);
            }

        });
        return collection;
    }

    /**
     * Update devices
     */
    function updateDevices(data) {
        var devices = data.data.devices;
        var widgetId;
        if (devices.length > 0) {
            angular.forEach(devices, function(v, k) {
                widgetId = '#Widget_' + v.id;
                updateDeviceLevel(widgetId, v);
                updateDeviceScale(widgetId, v);
                updateDeviceTime(widgetId, v);
                updateDeviceIcon(widgetId, v);
                updateDeviceBtn(widgetId, v);
                //console.log('Update device ID: ' + v.id + ' - level: ' + v.metrics.level)

            });
        }

    }
    /**
     * Update device level
     */
    function updateDeviceLevel(widgetId, v) {
        var level = $filter('numberFixedLen')(v.metrics.level);
        var val;
        if (level !== undefined) {
            switch (v.deviceType) {
                case 'switchMultilevel':
                    val = $filter('getMaxLevel')(level);
                    break;
                default:
                    val = level;
                    break;
            }
            $(widgetId + ' .widget-level').html(val);
            $(widgetId + ' .widget-level-knob').val(val).trigger('change', false);
        }
        console.log(Math.round(+new Date() / 1000) + ' Update device: ID: ' + v.id + ' - level: ' + val)

    }

    /**
     * Update device scale
     */
    function updateDeviceScale(widgetId, v) {
        if (angular.isDefined(v.metrics.scaleTitle) && v.metrics.scaleTitle !== '') {
            $(widgetId + ' .widget-scale').html(v.metrics.scaleTitle);
        }

        //console.log('Update device: ID: ' + v.id + ' - scale: ' + v.metrics.scaleTitle)
    }

    /**
     * Update device time
     */
    function updateDeviceTime(widgetId, v) {
        var time = $filter('isToday')(v.updateTime, true);
        if (time) {
            $(widgetId + ' .widget-update-time').html(time);
        }
        //console.log('Update device: ID: ' + v.id + ' - time: ' + time)
    }

    /**
     * Update device icon
     */
    function updateDeviceIcon(widgetId, v) {

        var icon = $filter('getElementIcon')(v.metrics.icon, v, v.metrics.level);
        if (icon) {
            $(widgetId + ' .widget-image').attr('src', icon);
            $(widgetId + ' .widget-image').removeClass('trans-true');
        }
        //if (v.id == 'ZWayVDev_zway_14-0-37') {
        //console.log('Level: ' + v.metrics.level)
        //console.log('Update device: ' + v.id + ' - icon: ' + icon)
        //}

    }

    /**
     * Update device button
     */
    function updateDeviceBtn(widgetId, v) {
        var status = false;
        var minMax = {min: 0, max: 99};
        // Create min/max value
        switch (v.probeType) {
            case 'test':
                minMax = {min: 0, max: 255};
                break;
            default:
                break;
        }
        switch (v.deviceType) {
            case 'sensorMultiline':
                if (v.metrics.multilineType == 'protection') {
                    if (v.metrics.state == 'armed') {
                        status = 'on';
                    } else {
                        status = 'off';
                    }
                }
                if (v.metrics.multilineType == 'climateControl') {
                     status = 'climate';
                }
                break;
            case 'doorlock':
                if (v.metrics.level == 'open') {
                    status = 'on';
                } else {
                    status = 'off';
                }
                break;
            case 'switchMultilevel':
                if (v.metrics.level === minMax.max) {
                    status = 'full';
                } else if (v.metrics.level > minMax.min && v.metrics.level < minMax.max) {
                    status = 'on';
                } else {
                    status = 'off';
                }
                break;
            default:
                if (v.metrics.level == 'on') {
                    status = 'on';
                } else {
                    status = 'off';
                }
                break;
        }
        if (status == false) {
            return;
        }
        // if (v.deviceType == 'switchBinary' || v.deviceType == 'switchRGBW') {
        if (status == 'on') {
            $(widgetId + ' .widget-btn-on').removeClass('btn-default').addClass('btn-primary');
            $(widgetId + ' .widget-btn-off').removeClass('btn-primary').addClass('btn-default');
        } else if (status == 'full') {
             $(widgetId + ' .widget-btn-full').removeClass('btn-default').addClass('btn-primary');
            $(widgetId + ' .widget-btn-on').removeClass('btn-default').addClass('btn-primary');
            $(widgetId + ' .widget-btn-off').removeClass('btn-primary').addClass('btn-default');
        }else if (status == 'climate') {
             $(widgetId + ' .widget-btn-frostProtection,' + widgetId + ' .widget-btn-energySave,' + widgetId + ' .widget-btn-comfort').removeClass('btn-primary').addClass('btn-default');
             $(widgetId + ' .widget-btn-' + v.metrics.state).removeClass('btn-default').addClass('btn-primary');
        }
        else {
            $(widgetId + ' .widget-btn-on').removeClass('btn-primary').addClass('btn-default');
            $(widgetId + ' .widget-btn-off').removeClass('btn-default').addClass('btn-primary');
        }
        //console.log('Update device: ID: ' + v.id + ' - button ' + v.metrics.level)
        //}

    }

    /**
     * Get chart data
     */
    function getChartData(data, colors) {

        if (!angular.isObject(data, colors)) {
            return null;
        }
        var currTime = (Math.round(+new Date() / 1000) - 86400);
        var out = {
            labels: [],
            datasets: [{
                    fillColor: colors.fillColor,
                    strokeColor: colors.strokeColor,
                    pointColor: colors.pointColor,
                    pointStrokeColor: colors.pointStrokeColor,
                    data: []
                }]
        };
        var cnt = 0;
        angular.forEach(data, function(v, k) {
            cnt++;
            var time = $filter('date')(((v.id) * 1000), 'H:mm');
            //if (v.id > currTime && out.labels.indexOf(time) === -1) {
            //if (v.id > currTime && (cnt % 2)) {
            if (v.id > currTime && (cnt % 2) === 0) {
                out.labels.push(time);
                //out.labels.push($filter('date')(v.timestamp,'dd.MM.yyyy H:mm'));
                out.datasets[0].data.push(v.l);
            }

        });
        if (out.datasets[0].data.length > 0) {
            return out;
        }
        return null;

    }
    ;
    /**
     * Get module form data
     */
    function getModuleFormData(module, data) {
        var collection = {
            'options': replaceModuleFormData(module.options, ['click','onFieldChange']),
            'schema': module.schema,
            'data': data,
            'postRender': postRenderAlpaca
        };
        return collection;
    }

    /**
     * Replace module object
     */
    function replaceModuleFormData(obj, keys) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i))
                continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(replaceModuleFormData(obj[i], keys));
            } else if (~keys.indexOf(i) &&
                    !angular.isArray(obj[i]) &&
                    typeof obj[i] === 'string' &&
                    obj[i].indexOf("function") === 0) {
                // overwrite old string with function                
                // we can only pass a function as string in JSON ==> doing a real function
                obj[i] = new Function('return ' + obj[i])();
            }
        }
        return obj;
    }

    /**
     * Get device type
     */
    function getDeviceType(data) {
        var collection = [];
        angular.forEach(data, function(v, k) {
            if (v.deviceType == 'battery') {
                return;
            }
            collection.push({
                'key': v.deviceType,
                'val': v.deviceType
            });
        });
        return $filter('unique')(collection, 'key');
    }

    /**
     * Get tags
     */
    function getTags(data) {
        var collection = [];
        angular.forEach(data, function(v, k) {
            if (v.deviceType == 'battery' || v.tags.length < 1) {
                return;
            }
            angular.forEach(v.tags, function(t, k) {
                collection.push({
                    'key': t,
                    'val': t
                });
            });
        });
        return $filter('unique')(collection, 'key');
    }

    /**
     * Set array value
     */
    function setArrayValue(data, key, add) {
        if (add) {
            return addArrayValue(data, key);
        } else {
            return removeArrayValue(data, key);
        }
    }

    /**
     * Add array value
     */
    function addArrayValue(data, key) {
        var collection = data;
        if (collection.indexOf(key) === -1) {
            collection.push(key);
        }
        return collection;
    }

    /**
     * Remove array value
     */
    function removeArrayValue(data, key) {
        var collection = [];
        angular.forEach(data, function(v, k) {
            if (v != key) {
                collection.push(v);
            }
        });
        return collection;
    }

    /**
     * Get event level
     */
    function getEventLevel(data, set) {
        var collection = (set ? set : []);
        angular.forEach(data, function(v, k) {
            collection.push({
                'key': v.level,
                'val': v.level
            });
        });

        return $filter('unique')(collection, 'key');
    }

    /**
     * Set EnOcean profile
     */
    function setEnoProfile(data) {
        var profile = {};
        angular.forEach(data, function(v, k) {
            var profileId = parseInt(v._rorg, 16) + '_' + parseInt(v._func, 16) + '_' + parseInt(v._type, 16);
            profile[profileId] = v;
            profile[profileId]['id'] = profileId;
            profile[profileId]['rorgInt'] = parseInt(v._rorg, 16);
            profile[profileId]['funcInt'] = parseInt(v._func, 16);
            profile[profileId]['typeInt'] = parseInt(v._type, 16);
        });
        return profile;
    }
    ;
});
