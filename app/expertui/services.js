/**
 * ExpertUI services
 * @author Martin Vach
 */
myAppService.service('expertService', function($filter) {
    /// --- Public functions --- ///
    /**
     * Get language line by key
     */
    this.getLangLine = function(key, languages) {
        return getLangLine(key, languages);
    };
    /**
     * Get config navigation devices
     */
    this.configGetNav = function(ZWaveAPIData) {
        return configGetNav(ZWaveAPIData);
    };

    /**
     * Get language from zddx
     */
    this.configGetZddxLang = function(node, lang) {
        return configGetZddxLang(node, lang);
    };
    /**
     * Get xml config param
     */
    this.getCfgXmlParam = function(cfgXml, nodeId, instance, commandClass, command) {
        return getCfgXmlParam(cfgXml, nodeId, instance, commandClass, command);
    };
    /**
     * Config cont
     */
    this.configConfigCont = function(node, nodeId, zddXml, cfgXml, lang, languages) {
        return configConfigCont(node, nodeId, zddXml, cfgXml, lang, languages);
    };
    /**
     *  Switch all cont
     */
    this.configSwitchAllCont = function(node, nodeId, ZWaveAPIData, cfgXml) {
        return configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml);
    };
    /**
     * Protection cont
     */
    this.configProtectionCont = function(node, nodeId, ZWaveAPIData, cfgXml) {
        return configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml);
    };
    /**
     * Wakeup cont
     */
    this.configWakeupCont = function(node, nodeId, ZWaveAPIData, cfgXml) {
        return configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml);
    };

    /**
     *Build config XML file
     */
    this.buildCfgXml = function(data, cfgXml, id, commandclass) {
        return buildCfgXml(data, cfgXml, id, commandclass);
    };

    /// --- Private functions --- ///
    /**
     * Get language line by key
     */
    function getLangLine(key, languages) {
        if (angular.isObject(languages)) {
            if (angular.isDefined(languages[key])) {
                return languages[key] !== '' ? languages[key] : key;
            }
        }
        return key;
    }
    ;

    /**
     *  Get config navigation devices
     */
    function configGetNav(ZWaveAPIData) {
        var devices = [];
        var controllerNodeId = ZWaveAPIData.controller.data.nodeId.value;
        // Loop throught devices
        angular.forEach(ZWaveAPIData.devices, function(node, nodeId) {
            if (nodeId == 255 || nodeId == controllerNodeId || node.data.isVirtual.value) {
                return;
            }
            var node = ZWaveAPIData.devices[nodeId];
            // Set object
            var obj = {};
            obj['id'] = nodeId;
            obj['name'] = $filter('deviceName')(nodeId, node);
            devices.push(obj);
        });
        return devices;
    }

    /**
     *  Get language from zddx
     */
    function configGetZddxLang(langs, currLang) {
        var label = null;
        if (!langs) {
            return label;
        }
        if (angular.isArray(langs)) {
            for (var i = 0, len = langs.length; i < len; i++) {
                if (("__text" in langs[i]) && (langs[i]["_xml:lang"] == currLang)) {
                   label = langs[i].__text;
                    return label;
                     
                    //continue;
                }else{
                     if (("__text" in langs[i]) && (langs[i]["_xml:lang"] == 'en')) {
                    label = langs[i].__text;
                    return label;
                     }
                }
            }
            // DEPRECATED
//            angular.forEach(langs, function(lang, index) {
//                if (("__text" in lang) && (lang["_xml:lang"] == currLang)) {
//                    label = lang.__text;
//                    return false;
//                }
//                if (("__text" in lang) && (lang["_xml:lang"] == "en")) {
//                    label = lang.__text;
//                }
//            });
        } else {
            if (("__text" in langs)) {
                label = langs.__text;
            }
        }
         //console.log(label)
        return label;
    }

    /**
     * Get xml config param
     */
    function getCfgXmlParam(cfgXml, nodeId, instance, commandClass, command) {
        var cfg = $filter('hasNode')(cfgXml, 'config.devices.deviceconfiguration');
        if (!cfg) {
            return [];
        }
        // Get data for given device by id
        var collection = [];
        angular.forEach(cfg, function(v, k) {
            //if (v['_id'] == nodeId && v['_instance'] == instance && v['_commandClass'] == commandClass && v['_command'] == command) {
            if (v['_id'] == nodeId && v['_instance'] == instance && v['_commandclass'] == commandClass && v['_command'] == command) {
//                if(!angular.isArray(v['_parameter'])){
//                    return;
//                }
                var array = JSON.parse(v['_parameter']);
                if (array.length > 2) {
                    collection[array[0]] = array[1];
                }
                else if (array.length == 2) {
                    collection = array;

                }
                else {
                    collection[0] = array[0];
                    return;
                }
            }

        });
        //console.log(collection)
        return collection;

    }

    /**
     * Config cont
     */
    function configConfigCont(node, nodeId, zddXml, cfgXml, lang, languages) {
        if (!0x70 in node.instances[0].commandClasses) {
            return null;
        }
        if (!zddXml) {
            return null;
        }

        if (!zddXml.ZWaveDevice.hasOwnProperty("configParams")) {
            return null;
        }
        var config_cont = [];
        var params = zddXml.ZWaveDevice.configParams['configParam'];
//        var lang = 'en';
//        var langs = {
//            "en": "1",
//            "de": "0"
//        };
//        if (angular.isDefined(langs[lang])) {
//            lang = lang;
//        }
//        var langId = langs[lang];
        // Loop throught params
        var parCnt = 0;
        var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '70', 'Set');
        angular.forEach(params, function(conf_html, i) {
            //console.log(zddXml);
            if (!angular.isObject(conf_html)) {
                return;
            }

            have_conf_params = true;
            var conf = conf_html;
            var conf_num = conf['_number'];
            //console.log(cfgFile[conf_num])
            var conf_size = conf['_size'];
            var conf_name = configGetZddxLang($filter('hasNode')(conf, 'name.lang'), lang) || getLangLine('configuration_parameter', languages) + ' ' + conf_num;
            var conf_description = configGetZddxLang($filter('hasNode')(conf, 'description.lang'), lang);
            var conf_size = conf['_size'];
            var conf_default_value = null;
            var conf_type = conf['_type'];
            var showDefaultValue = null;
            var config_config_value;

            // get value from the Z-Wave data
            var config_zwave_value = null;

            if (angular.isDefined(node.instances[0].commandClasses[0x70])) {
                if (node.instances[0].commandClasses[0x70].data[conf_num] != null && node.instances[0].commandClasses[0x70].data[conf_num].val.value !== "") {
                    config_zwave_value = node.instances[0].commandClasses[0x70].data[conf_num].val.value;
                    conf_default = config_zwave_value;

                }

            }

            // get default value
            var conf_default = null;
            if (conf['_default'] !== undefined) {
                conf_default = parseInt(conf['_default'], 16);
                showDefaultValue = conf_default;
            }

            // get default value from the config XML
            if (cfgFile[conf_num] !== undefined) {
                config_config_value = cfgFile[conf_num];
            } else {
                if (config_zwave_value !== null) {
                    config_config_value = config_zwave_value;
                } else {
                    config_config_value = conf_default;
                }
            }

            var isUpdated = true;
            var updateTime = '';
            if (angular.isDefined(node.instances[0].commandClasses[0x70])
                    && angular.isDefined(node.instances[0].commandClasses[0x70].data[conf_num])) {
                var uTime = node.instances[0].commandClasses[0x70].data[conf_num].updateTime;
                var iTime = node.instances[0].commandClasses[0x70].data[conf_num].invalidateTime;
                var updateTime = $filter('isTodayFromUnix')(uTime);
                var isUpdated = (uTime > iTime ? true : false);
            }

            // Switch
            var conf_method_descr;
            //console.log(conf_name + ' --- ' + conf_type)
            switch (conf_type) {
                case 'constant':
                case 'rangemapped':
                    var param_struct_arr = [];
                    var conf_param_options = '';

                    angular.forEach(conf['value'], function(value_html, i) {
                        var value = value_html;
                        var value_from = parseInt(value['_from'], 16);
                        var value_to = parseInt(value['_to'], 16);
                        var value_description = null;
                        if (angular.isDefined(value.description)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'description.lang'), lang);
                        }
                        if (angular.isDefined(value.lang)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'lang'), lang);

                        }
                        var value_repr = value_from; // representative value for the range
                        if (conf_default !== null)
                            if (value_from <= conf_default && conf_default <= value_to) {
                                conf_default_value = value_description;
                                value_repr = conf_default;
                            }
                        param_struct_arr.push({
                            label: value_description,
                            type: {
                                fix: {
                                    value: value_repr
                                }
                            }
                        });
                    });
                    conf_method_descr = {
                        nodeId: nodeId,
                        label: 'Nº ' + conf_num + ' - ' + conf_name,
                        type: {
                            enumof: param_struct_arr
                        },
                        name: 'input_' + nodeId + '_' + conf_num,
                        description: conf_description,
                        updateTime: updateTime,
                        isUpdated: isUpdated,
                        defaultValue: conf_default_value,
                        showDefaultValue: showDefaultValue,
                        configCconfigValue: config_config_value,
                        configZwaveValue: config_zwave_value,
                        confNum: conf_num,
                        confSize: conf_size
                    };

                    break;
                case 'range':

                    var param_struct_arr = [];
                    var rangeParam = conf['value'];
                    //console.log(rangeParam, conf_num);

                    if (!rangeParam) {
                        conf_method_descr = {
                            nodeId: nodeId,
                            label: 'Nº ' + conf_num + ' - ' + conf_name,
                            type: {
                                noval: null
                            },
                            name: 'input_' + nodeId + '_' + conf_num,
                            description: conf_description,
                            updateTime: updateTime,
                            isUpdated: isUpdated,
                            defaultValue: null,
                            showDefaultValue: showDefaultValue,
                            configCconfigValue: config_config_value,
                            configZwaveValue: config_zwave_value,
                            confNum: conf_num,
                            confSize: conf_size
                        };
                        break;
                    }
                    angular.forEach(rangeParam, function(value_html, ri) {
                        //console.log(ri);
                        var value = value_html;

                        if (ri == 'description') {
                            //console.log(ri);
                            var value_from = parseInt(rangeParam['_from'], 16);
                            var value_to = parseInt(rangeParam['_to'], 16);

                        } else {
                            var value_from = parseInt(value['_from'], 16);
                            var value_to = parseInt(value['_to'], 16);
                        }
                        var value_description = '';
                        if (angular.isDefined(value.description)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'description.lang'), lang);
                        }
                        if (angular.isDefined(value.lang)) {
                            value_description = configGetZddxLang($filter('hasNode')(value, 'lang'), lang);
                        }
                        //var value_description = deviceService.configGetZddxLang($filter('hasNode')(value, 'lang'), $scope.lang);

                        if (conf_default !== null)
                            conf_default_value = conf_default;


                        if (value_from != value_to) {
                            if (value_description != '') {
                                var rangeVal = {
                                    label: value_description,
                                    type: {
                                        range: {
                                            min: value_from,
                                            max: value_to
                                        }
                                    }
                                };
                                param_struct_arr.push(rangeVal);
                            }
                        }
                        else // this is a fix value
                        if (value_description != '') {
                            param_struct_arr.push({
                                label: value_description,
                                type: {
                                    fix: {
                                        value: value_from
                                    }
                                }
                            });
                        }
                    });

                    if (param_struct_arr.length > 1)
                        conf_method_descr = {
                            nodeId: nodeId,
                            label: 'Nº ' + conf_num + ' - ' + conf_name,
                            type: {
                                enumof: param_struct_arr
                            },
                            hideRadio: false,
                            name: 'input_' + nodeId + '_' + conf_num,
                            description: conf_description,
                            updateTime: updateTime,
                            isUpdated: isUpdated,
                            defaultValue: conf_default_value,
                            showDefaultValue: showDefaultValue,
                            configCconfigValue: config_config_value,
                            configZwaveValue: config_zwave_value,
                            confNum: conf_num,
                            confSize: conf_size
                        };
                    else if (param_struct_arr.length == 1) {

                        conf_method_descr = {
                            nodeId: nodeId,
                            label: 'Nº ' + conf_num + ' - ' + conf_name,
                            type: {
                                enumof: param_struct_arr
                            },
                            name: 'input_' + nodeId + '_' + conf_num,
                            hideRadio: true,
                            description: conf_description,
                            updateTime: updateTime,
                            isUpdated: isUpdated,
                            defaultValue: conf_default_value,
                            showDefaultValue: showDefaultValue,
                            configCconfigValue: config_config_value,
                            configZwaveValue: config_zwave_value,
                            confNum: conf_num,
                            confSize: conf_size
                        };
                    }

                    break;
                case 'bitset':
                    var param_struct_arr = [];
                    var conf_param_options = '';
                    var conf_default_value_arr = new Object;
                    if (conf_default !== null) {
                        var bit = 0;
                        do {
                            if ((1 << bit) & conf_default)
                                conf_default_value_arr[bit] = 'Bit ' + bit + ' set';
                        } while ((1 << (bit++)) < conf_default);
                    }
                    ;
                    angular.forEach(conf['value'], function(value_html, i) {
                        var value = value_html;
                        var value_from = parseInt(value['_from'], 16);
                        var value_to = parseInt(value['_to'], 16);
                        var value_description = 'fdf';
                        var value_description = '';
                        if (conf_default !== null) {
                            if (value_from == value_to) {
                                if ((1 << value_from) & conf_default)
                                    conf_default_value_arr[value_from] = value_description;
                            } else {
                                conf_default_value_arr[value_from] = (conf_default >> value_from) & ((1 << (value_to - value_from + 1)) - 1)
                                for (var bit = value_from + 1; bit <= value_to; bit++)
                                    delete conf_default_value_arr[bit];
                            }
                        }
                        ;
                        if (value_from == value_to)
                            param_struct_arr.push({
                                label: value_description,
                                name: 'input_' + nodeId + '_' + conf_num,
                                type: {
                                    bitcheck: {
                                        bit: value_from
                                    }
                                }
                            });
                        else
                            param_struct_arr.push({
                                label: value_description,
                                name: 'input_' + nodeId + '_' + conf_num,
                                type: {
                                    bitrange: {
                                        bit_from: value_from,
                                        bit_to: value_to
                                    }
                                }
                            });
                    });
                    if (conf_default !== null) {
                        conf_default_value = '';
                        for (var ii in conf_default_value_arr)
                            conf_default_value += conf_default_value_arr[ii] + ', ';
                        if (conf_default_value.length)
                            conf_default_value = conf_default_value.substr(0, conf_default_value.length - 2);
                    }
                    conf_method_descr = {
                        nodeId: nodeId,
                        label: 'Nº ' + conf_num + ' - ' + conf_name,
                        type: {
                            bitset: param_struct_arr
                        },
                        name: 'input_' + nodeId + '_' + conf_num,
                        description: conf_description,
                        updateTime: updateTime,
                        isUpdated: isUpdated,
                        defaultValue: conf_default_value,
                        showDefaultValue: showDefaultValue,
                        configCconfigValue: config_config_value,
                        configZwaveValue: config_zwave_value,
                        confNum: conf_num,
                        confSize: conf_size
                    };
                    break;
                default:
                    return;
                    //conf_cont.append('<span>' + $.translate('unhandled_type_parameter') + ': ' + conf_type + '</span>');
            }
            ;

            config_cont.push(conf_method_descr);
            parCnt++;
        });
        //console.log(config_cont);
        return config_cont;
    }

    /**
     * Switch all cont
     */
    function configSwitchAllCont(node, nodeId, ZWaveAPIData, cfgXml) {
        var switchall_cont = false;
        if (0x27 in node.instances[0].commandClasses) {
            var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '27', 'Set');
            var uTime = node.instances[0].commandClasses[0x27].data.mode.updateTime;
            var iTime = node.instances[0].commandClasses[0x27].data.mode.invalidateTime;
            var updateTime = $filter('isTodayFromUnix')(uTime);
            var isUpdated = (uTime > iTime ? true : false);
            var gui_descr = getMethodSpec(ZWaveAPIData, nodeId, 0, 0x27, 'Set');
            var conf_default_value = 0;
            var switchall_conf_value;
            if (cfgFile !== undefined) {
                switchall_conf_value = cfgFile[0];
            } else {
                switchall_conf_value = 1;// by default switch all off group only
            }
            switchall_cont = {
                'params': gui_descr,
                'values': {0: switchall_conf_value},
                name: 'switchall_' + nodeId + '_' + 0,
                updateTime: updateTime,
                isUpdated: isUpdated,
                defaultValue: conf_default_value,
                showDefaultValue: conf_default_value,
                configCconfigValue: switchall_conf_value,
                confNum: 0,
                confSize: 0,
                cmd: 'devices[' + nodeId + '].instances[0].commandClasses[0x27]'
            };

        }
        ;
        return switchall_cont;
    }

    /**
     * Protection cont
     */
    function configProtectionCont(node, nodeId, ZWaveAPIData, cfgXml) {
        var protection_cont = false;
        if (0x75 in node.instances[0].commandClasses) {
            var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '75', 'Set');
            var uTime = node.instances[0].commandClasses[0x75].data.state.updateTime;
            var iTime = node.instances[0].commandClasses[0x75].data.state.invalidateTime;
            var updateTime = $filter('isTodayFromUnix')(uTime);
            var isUpdated = (uTime > iTime ? true : false);
            var gui_descr = getMethodSpec(ZWaveAPIData, nodeId, 0, 0x75, 'Set');
            var conf_default_value = 0;
            var protection_conf_value;
            //var protection_conf_rf_value;
            // get default value from the config XML
            if (cfgFile !== undefined) {
                protection_conf_value = cfgFile[0];
            } else {
                protection_conf_value = 0;// by default switch all off group only
            }

            protection_cont = {
                'params': gui_descr,
                'values': {0: protection_conf_value},
                name: 'protection_' + nodeId + '_' + 0,
                updateTime: updateTime,
                isUpdated: isUpdated,
                defaultValue: conf_default_value,
                showDefaultValue: conf_default_value,
                configCconfigValue: protection_conf_value,
                confNum: 0,
                confSize: 0,
                cmd: 'devices[' + nodeId + '].instances[0].commandClasses[0x75]'
            };
        }
        ;
        return protection_cont;
    }

    /**
     * Wakeup cont
     */
    function configWakeupCont(node, nodeId, ZWaveAPIData, cfgXml) {
        var wakeup_cont = false;
        if (0x84 in node.instances[0].commandClasses) {
            var cfgFile = getCfgXmlParam(cfgXml, nodeId, '0', '84', 'Set');
            var wakeup_zwave_min = (node.instances[0].commandClasses[0x84].data.version.value == 1) ? 0 : node.instances[0].commandClasses[0x84].data.min.value;
            var wakeup_zwave_max = (node.instances[0].commandClasses[0x84].data.version.value == 1) ? 0xFFFFFF : node.instances[0].commandClasses[0x84].data.max.value;
            var wakeup_zwave_value = node.instances[0].commandClasses[0x84].data.interval.value;
            var wakeup_zwave_default_value = (node.instances[0].commandClasses[0x84].data.version.value == 1) ? 86400 : node.instances[0].commandClasses[0x84].data['default'].value; // default is a special keyword in JavaScript
            var wakeup_zwave_nodeId = node.instances[0].commandClasses[0x84].data.nodeId.value;
            var uTime = node.instances[0].commandClasses[0x84].data.updateTime;
            var iTime = node.instances[0].commandClasses[0x84].data.invalidateTime;
            var updateTime = $filter('isTodayFromUnix')(uTime);
            var isUpdated = (uTime > iTime ? true : false);
            if (wakeup_zwave_min !== '' && wakeup_zwave_max !== '') {
                var gui_descr = getMethodSpec(ZWaveAPIData, nodeId, 0, 0x84, 'Set');
                gui_descr[0].type.range.min = parseInt(wakeup_zwave_min, 10);
                gui_descr[0].type.range.max = parseInt(wakeup_zwave_max, 10);
                var wakeup_conf_value;
                var wakeup_conf_node_value = 0;
                if (angular.isArray(cfgFile) && cfgFile.length > 0) {
                    wakeup_conf_value = cfgFile[0] || 0;
                    wakeup_conf_node_value = cfgFile[1] || 0;
                } else {
                    if (wakeup_zwave_value != "" && wakeup_zwave_value != 0 && wakeup_zwave_nodeId != "") {
                        // not defined in config: adopt devices values
                        wakeup_conf_value = parseInt(wakeup_zwave_value, 10);
                    } else {
                        // values in device are missing. Use defaults
                        wakeup_conf_value = parseInt(wakeup_zwave_default_value, 10);
                    }
                    ;
                }
                ;
                wakeup_cont = {
                    'params': gui_descr,
                    'values': {"0": wakeup_conf_value},
                    name: 'wakeup_' + nodeId + '_' + 0,
                    updateTime: updateTime,
                    isUpdated: isUpdated,
                    defaultValue: wakeup_zwave_default_value,
                    showDefaultValue: wakeup_zwave_default_value,
                    configCconfigValue: wakeup_conf_value,
                    configCconfigNodeValue: wakeup_conf_node_value,
                    confNum: 0,
                    confSize: 0,
                    cmd: 'devices[' + nodeId + '].instances[0].commandClasses[0x84]'
                };
            } else {
                //$('#wakeup_cont .cfg-block-content').append('<span>' + $scope._t('config_ui_wakeup_no_min_max') + '</span>');
            }
        }
        ;
        return wakeup_cont;
    }

    /**
     *Build config XML file
     */
    function buildCfgXml(data, cfgXml, id, commandclass) {
        var hasCfgXml = false;
        var assocCc = [133, 142];
        var formData = [];
        if (commandclass == '84') {
            var par1 = JSON.parse(data[0]['parameter']);
            var par2 = JSON.parse(data[1]['parameter']);
            var wakeData = {
                'id': id,
                'instance': data[0]['instance'],
                'commandclass': commandclass,
                'command': data[0]['command'],
                'parameter': '[' + par1 + ',' + par2 + ']'
            };
            formData.push(wakeData);
        } else {
            formData = data;
        }
        var xmlData = formData;
        if (angular.isObject(cfgXml) && $filter('hasNode')(cfgXml, 'config.devices.deviceconfiguration')) {
            hasCfgXml = cfgXml.config.devices.deviceconfiguration;
            angular.forEach(hasCfgXml, function(v, k) {
                var obj = {};
                if (v['_id'] == id && v['_commandclass'] == commandclass) {
                    return;
                }
                obj['id'] = v['_id'];
                obj['instance'] = v['_instance'];
                obj['commandclass'] = v['_commandclass'];
                obj['command'] = v['_command'];
                obj['parameter'] = v['_parameter'];
                obj['group'] = v['_group'];
                xmlData.push(obj);

            });
        }
        var ret = buildCfgXmlFile(xmlData);
        return ret;

    }

    /**
     * Build cfg XML file
     */
    function buildCfgXmlFile(xmlData) {
        var assocCc = [133, 142];
        var xml = '<config><devices>' + "\n";

        angular.forEach(xmlData, function(v, k) {
            if (assocCc.indexOf(parseInt(v.commandclass, 10)) > -1) {
                xml += '<deviceconfiguration id="' + v.id + '" instance="' + v.instance + '" commandclass="' + v.commandclass + '" command="' + v.command + '" group="' + v.group + '" parameter="' + v.parameter + '"/>' + "\n";

            } else {
                xml += '<deviceconfiguration id="' + v.id + '" instance="' + v.instance + '" commandclass="' + v.commandclass + '" command="' + v.command + '" parameter="' + v.parameter + '"/>' + "\n";
            }

        });
        xml += '</devices></config>' + "\n";
        return xml;

    }
});
