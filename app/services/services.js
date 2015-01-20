/**
 * Application services
 * @author Martin Vach
 */
var myAppService = angular.module('myAppService', []);

/**
 * Device service
 */
myAppService.service('dataService', function($filter, myCache) {
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
     * Mobile device detect
     */
    this.isMobile = function(a) {
        return isMobile(a);
    };

    /**
     * Get data or filtered data
     */
    this.getData = function(data, filter) {
        return getData(data, filter);
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
     * Get tags
     */
    this.getTags = function(data) {
        return getTags(data);
    };

    /**
     * Get instances
     */
    this.getInstances = function(data, modules) {
        return getInstances(data, modules);
    };

    /**
     * Get module form data
     */
    this.getModuleFormData = function(module, data, namespaces) {
        return getModuleFormData(module, data, namespaces);
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
    this.getEventLevel = function(data) {
        return getEventLevel(data);
    };

    /**
     * Get pairs
     */
    this.getPairs = function(data, key, val, cache) {
        return getPairs(data, key, val, cache);
    };

    /**
     * Get row by
     */
    this.getRowBy = function(data, key, val, cache) {
        return getRowBy(data, key, val, cache);
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
     * Get data or filtered data
     */
    function getData(data, filter) {
        var collection = [];
        if (filter) {
            angular.forEach(data, function(v, k) {
                if (angular.isArray(v[filter.filter])) {
                    if (v[filter.filter].indexOf(filter.val) > -1) {
                        collection.push(v);
                    }
                } else {
                    if (v[filter.filter] == filter.val) {
                        collection.push(v);
                    }
                }
            });
            return collection;
        } else {
            return data;
        }

    }

    /**
     * Get device data
     */
    function getDevices(data, filter, positions, instances, location) {

        var obj;
        var collection = [];
        var onDashboard = false;
        var findZwaveStr = "ZWayVDev_zway_";

        angular.forEach(data, function(v, k) {
            var instance;
            var hasInstance = false;
            var zwaveId = false;
            if (v.permanently_hidden || v.deviceType == 'battery') {
                return;
            }
            if (location) {
                if (v.location != location && v.location) {
                    return;
                }
            }
            if (positions && positions.indexOf(v.id) !== -1) {
                var onDashboard = true;
            }

            if (v.id.indexOf(findZwaveStr) > -1) {
                zwaveId = v.id.split(findZwaveStr)[1].split('-')[0];
            } else {

                instance = getRowBy(instances, 'id', v.creatorId);
                if (instance && instance['moduleId'] != 'ZWave') {
                    hasInstance = instance;

                }
            }
            obj = {
                'id': v.id,
                'zwaveId': zwaveId,
                'title': v.metrics.title,
                'metrics': v.metrics,
                'tags': v.tags,
                'permanently_hidden': v.permanently_hidden,
                'level': $filter('numberFixedLen')(v.metrics.level),
                'icon': v.metrics.icon,
                'probeTitle': v.metrics.probeTitle,
                'scaleTitle': v.metrics.scaleTitle,
                'deviceType': v.deviceType,
                'location': v.location,
                'creatorID': v.creatorId,
                'updateTime': v.updateTime,
                'onDashboard': onDashboard,
                'cfg': {
                    'zwaveId': zwaveId,
                    'hasInstance': hasInstance
                }
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
                updateDeviceTime(widgetId, v);
                updateDeviceIcon(widgetId, v);
                updateDeviceBtn(widgetId, v);


            });
        }

    }
    /**
     * Update device level
     */
    function updateDeviceLevel(widgetId, v) {
        var level = $filter('numberFixedLen')(v.metrics.level);
        var val;
        if (level) {
            switch (v.deviceType) {
                case 'switchMultilevel':
                    val = $filter('getMaxLevel')(level);
                    break;
                default:
                    val = level;
                    break;
            }
            $(widgetId + ' .widget-level').html(val);
        }
        console.log('Update device: ID: ' + v.id + ' - level: ' + val)

    }

    /**
     * Update device time
     */
    function updateDeviceTime(widgetId, v) {
        var time = $filter('isToday')(v.updateTime, true);
        if (time) {
            $(widgetId + ' .widget-update-time').html(time);
        }
        console.log('Update device: ID: ' + v.id + ' - time: ' + time)
    }

    /**
     * Update device icon
     */
    function updateDeviceIcon(widgetId, v) {
        var icon = $filter('getElementIcon')(v.metrics.icon, v);
        if (icon) {
            $(widgetId + ' .widget-image').attr('src', icon);
        }
        console.log('Update device: ID: ' + v.id + ' - icon: ' + icon)
    }

    /**
     * Update device button
     */
    function updateDeviceBtn(widgetId, v) {
        var status = false;
        switch (v.deviceType) {
            case 'switchBinary':
                if (v.metrics.level == 'on') {
                    status = 'on';
                } else {
                    status = 'off';
                }
                break;

            case 'doorlock':
                if (v.metrics.level == 'open') {
                    status = 'on';
                } else {
                    status = 'off';
                }
                break;
            default:
                break;
        }
        if (status == false) {
            return;
        }
        if (v.deviceType == 'switchBinary') {
            if (status == 'on') {
                $(widgetId + ' .widget-btn-on').removeClass('btn-default').addClass('btn-primary');
                $(widgetId + ' .widget-btn-off').removeClass('btn-primary').addClass('btn-default');
            } else {
                $(widgetId + ' .widget-btn-on').removeClass('btn-primary').addClass('btn-default');
                $(widgetId + ' .widget-btn-off').removeClass('btn-default').addClass('btn-primary');
            }
            console.log('Update device: ID: ' + v.id + ' - button ' + v.metrics.level)
        }

    }

    /**
     * Get instances data
     */
    function getInstances(data, modules) {
        var collection = [];
        var moduleOptions;
        var module;
        var moduleTitle;
        var params;
        angular.forEach(data, function(v, k) {
            params = (!v.params ? [] : v.params);
            module = getRowBy(modules, 'id', v.moduleId);
            if (module) {
                moduleTitle = $filter('hasNode')(module, 'defaults.title');
                moduleOptions = getModuleConfigOptions(module, params);
            }

            collection.push({
                'id': v.id,
                'moduleId': v.moduleId,
                'title': v.title,
                'moduleTitle': moduleTitle,
                'params': params,
                'description': v.description,
                'moduleData': module,
                'moduleOptions': moduleOptions,
                'moduleInput': getModuleConfigInputs(module, params)
            });

        });
        return collection;
    }

    /**
     * Get module form data
     */
    function getModuleFormData(module, data, namespaces) {
        var collection = {
            'options': {},
            'schema': {},
            'data': {}
        };
        var bind = setModuleFormData(module.options, module.schema, namespaces);
        collection.options = bind.options;
        collection.schema = bind.schema;
        collection.data = data;
        return collection;
    }

    /**
     * Set module form data
     */
    function setModuleFormData(options, schema, namespaces) {
        var collection = {
            'options': replaceModuleFormData(options, 'optionLabels', namespaces, 'deviceName'),
            'schema': replaceModuleFormData(schema, 'enum', namespaces, 'deviceId')
        };
        return collection;
    }
    /**
     * Replace module object
     */
    function replaceModuleFormData(obj, key, namespaces, namespaceKey) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i))
                continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(replaceModuleFormData(obj[i], key, namespaces, namespaceKey));
            } else if (i == key && !angular.isArray(obj[key])) {
                obj[key] = buildArrayFromNamespaces(obj[key], namespaces, namespaceKey);
            }
        }
        return obj;
    }


    /**
     * Build an array from namespaces
     */
    function buildArrayFromNamespaces(enums, namespaces, namespaceKey) {
         
        var collection = [];
        var namesp = enums.split(',');
        if (!angular.isArray(namesp)) {
            return false;
        }
        angular.forEach(namesp, function(v, k) {
            var id = v.split(':');
            if (!angular.isArray(id)) {
                return false;
            }
            angular.forEach(namespaces, function(nm, km) {
               if (nm.id == id[1]) {
                    angular.forEach(nm.params, function(i, n) {
                        collection.push(i[namespaceKey]);
                    });
                }
            });
        });
       
        return collection;
    }

    /**
     *  Get module config options
     */
//    function getModuleConfigInputs(module, params, namespaces) {
//        if (!module) {
//            return false;
//        }
//        var options = $filter('hasNode')(module, 'options.fields');
//        var schema = $filter('hasNode')(module, 'schema.properties');
//        var defaults = $filter('hasNode')(module, 'defaults');
//        if (!options || !schema) {
//            return false;
//        }
//        //console.log(module.id);
//
//        var collection = {};
//        var cfg = {};
////        var type;
////        var enums;
////        var items;
////        var itemsProperties;
////        var pairs;
////        var itemPairs;
////        var inputType;
//        angular.forEach(options, function(v, k) {
//            if ((v.hidden) || (v.hidden == true)) {
//                return false;
//            }
//            cfg = {
//                'pairs': [],
//                'pairsItemsProperties': {},
//                'inputType': $filter('hasNode')(options[k], 'type'),
//                'enums': $filter('hasNode')(schema[k], 'enum'),
//                'items': $filter('hasNode')(schema[k], 'items'),
//                'itemsProperties': $filter('hasNode')(schema[k], 'items.properties')
//            };
////            inputType = $filter('hasNode')(options[k], 'type');
////            type = $filter('hasNode')(schema[k], 'type');
////            enums = $filter('hasNode')(schema[k], 'enum');
////            items = $filter('hasNode')(schema[k], 'items');
////            itemsProperties = $filter('hasNode')(schema[k], 'items.properties');
//
//            if (v.datasource == 'namespaces') {
//                cfg.pairs = getModulePairsFromNamespaces(cfg.enums, namespaces);
//            } else if (cfg.items) {
//                if (cfg.itemsProperties) {
//                    angular.forEach(cfg.itemsProperties, function(item, ik) {
//                        var iPairs = getItemsPropertiesPairs(item, v.optionLabels, namespaces);
//                        if (iPairs) {
//                            cfg.pairsItemsProperties = {
//                                'name': ik,
//                                'pairs': getItemsPropertiesPairs(item, v.optionLabels, namespaces)
//                            };
//                            return;
//                        }
//
//                        // getItemsPropertiesPairs(item,v.optionLabels,namespaces);
//                        //cfg.pairs = getItemsPropertiesPairs(item,v.optionLabels,namespaces);
//                        //console.log(item);
//
//                    });
//
//                }
//                if (cfg.items.datasource == 'namespaces') {
//                    cfg.pairs = getModulePairsFromNamespaces(cfg.items.enum, namespaces);
//
//                }
//            } else {
//                cfg.pairs = getModulePairsFromArray(cfg.enums, v.optionLabels);
//            }
//
//            //console.log(cfg.pairsItemsProperties);
//            //console.log(itemPairs)
//            collection[k] = {
//                'inputName': k,
//                'label': v.label,
//                'placeholder': v.placeholder,
//                'helper': v.helper,
//                'optionLabels': v.optionLabels,
//                'default': defaults[k],
//                'inputType': getModuleInputType(cfg),
//                'enum': cfg.enums,
//                "datasource": v.datasource,
//                'pairs': cfg.pairs,
//                'pairsItemsProperties': cfg.pairsItemsProperties,
//                'pattern': $filter('hasNode')(schema[k], 'pattern'),
//                'required': $filter('hasNode')(schema[k], 'required'),
//                'value': $filter('hasNode')(params, k)
//            };
//
//        });
//        return collection;
//    }
//    /**
//     * Get module input type
//     */
//    function getModuleInputType(cfg) {
//        var inputType;
//        if (!cfg.inputType) {
//            if (cfg.enums) {
//                inputType = 'select';
//            } else if (cfg.itemsProperties) {
//                inputType = 'itemsProperties';
//            } else if (cfg.items) {
//                inputType = 'items';
//            }
//            else {
//                inputType = 'text';
//            }
//        } else {
//            inputType = cfg.inputType;
//        }
//
//        return inputType;
//    }
//
//    /**
//     * Get Items Properties Input
//     */
//    function getItemsPropertiesPairs(item, optionLabels, namespaces) {
//        var pairs;
//        if (item.field == 'enum') {
//            if (item.datasource == 'namespaces') {
//                pairs = getModulePairsFromNamespaces(item.enum, namespaces);
//            } else {
//                pairs = getModulePairsFromArray(item.enum, optionLabels);
//            }
//        }
//        return pairs;
//    }
//    /**
//     * Get module pairs from array - enums and labels
//     */
//    function getModulePairsFromArray(enums, labels) {
//        if (!angular.isArray(enums)) {
//            return false;
//        }
//        var collection = {};
//        angular.forEach(enums, function(v, k) {
//            if (labels) {
//                collection[v] = (labels[k] ? labels[k] : v);
//            } else {
//                collection[v] = v;
//            }
//        });
//
//        return collection;
//    }
//
//    /**
//     * Get module pairs from namespaces
//     */
//    function getModulePairsFromNamespaces(enums, namespaces) {
//        var collection = {};
//        var namesp = enums.split(',');
//        if (!angular.isArray(namesp)) {
//            return false;
//        }
//        angular.forEach(namesp, function(v, k) {
//            var id = v.split(':');
//            if (!angular.isArray(id)) {
//                return false;
//            }
//            angular.forEach(namespaces, function(nm, km) {
//                if (nm.id == id[1]) {
//                    angular.forEach(nm.params, function(i, n) {
//                        collection[i['deviceId']] = i['deviceName'];
//                    });
//                }
//            });
//        });
//        return collection;
//    }
//
//    /**
//     * Get module pairs from items
//     */
//    function getModulePairsFromItems(items, namespaces) {
//        console.log(items)
//        return;
//        var collection = {};
//        var arr = enums.split(':');
//        if (!$.isArray(arr)) {
//            return false;
//        }
//        var devices = arr[1];
//        angular.forEach(namespaces, function(v, k) {
//            if (v.id == devices) {
//                angular.forEach(v.params, function(i, n) {
//                    collection[i['deviceId']] = i['deviceName'];
//                });
//            }
//
//        });
//        return collection;
//    }
//    /**
//     *  Get module config options
//     */
//    function getModuleConfigOptions(module, params) {
//        var collection = [];
//        if (module) {
//            angular.forEach($filter('hasNode')(module, 'options.fields'), function(v, k) {
//                if ((!v.hidden) || (v.hidden != true)) {
//                    collection.push({
//                        'value': $filter('hasNode')(params, k),
//                        'field': k,
//                        'label': v.label,
//                        'helper': v.helper
//                    });
//                }
//            });
//        }
//        return collection;
//    }



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
    function getEventLevel(data) {
        var collection = [];
        angular.forEach(data, function(v, k) {
            collection.push({
                'key': v.level,
                'val': v.level
            });
        });
        return $filter('unique')(collection, 'key');
    }

    /**
     * Get pairs - key => value
     */
    function getPairs(data, key, val, cache) {
        var ret;
        var collection = [];
        var cached = myCache.get(cache);
        // Cached data
        if (cached) {
            return cached;
        }

        // Load data
        angular.forEach(data, function(v, k) {
            if (v[val] != '') {
                collection.push({
                    'key': v[key],
                    'val': v[val]
                });
            }

        });
        ret = $filter('unique')(collection, 'key');
        //debugger;
        myCache.put(cache, ret);
        return ret;
    }

    /**
     * Get 1 row by - key => value
     */
    function getRowBy(data, key, val, cache) {
        var collection = null;
//        var cached = myCache.get(cache);
//        // Cached data
//        if (cached) {
//            return cached;
//        }
        angular.forEach(data, function(v, k) {
            if (v[key] == val) {
                collection = v;
//                if (cache) {
//                    myCache.put(cache, collection);
//                }
                return;
            }

        });
        return collection;
    }
});
