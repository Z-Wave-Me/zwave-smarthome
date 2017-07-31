/**
 * @overview Angular directives that are used in device hardware configuration view.
 * @author Martin Vach
 */

/**
 * Renders configuration form inputs
 * @class expertCommandInput
 */
myApp.directive('expertCommandInput', function($filter) {
    /**
     * Renders text input
     * @param {text} label
     * @param {mixed} value
     * @param {int} min
     * @param {int} max
     * @param {string} name
     * @returns {String}
     */
    function getText(label, value, min, max, name) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label> ';
        input += '<input class="form-control" name="' + inName + '" type="text" class="form-control" value="' + value + '" title=" min: ' + min + ', max: ' + max + '" />';
        return input;
    }
    /**
     * Renders node select input 
     * @param {string} label
     * @param {object} devices
     * @param {string} currValue
     * @param {string} name
     * @returns {String}
     */
    function getNode(label, devices, currValue, name) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        
        input += '<label class="label-node">' + label + '</label> ';
        input += '<select name="select_' + inName + '" class="form-control">';
        input += '<option value="1">Z-Way</option>';
        angular.forEach(devices, function(v, k) {
            var selected = (v.id == currValue ? ' selected' : '');
            input += '<option value="' + v.id + '"' + selected + '>' + v.name + '</option>';
        });

        input += '</select>';

        return input;
    }

    /**
     * Renders enumerators
     * @param {string} label
     * @param {object} enums
     * @param {int} defaultValue
     * @param {string} name
     * @param {boolean} hideRadio
     * @param {int} currValue
     * @returns {undefined|String}
     */
    function getEnum(label, enums, defaultValue, name, hideRadio,currValue) {
        
        var input = '';
        if (!enums) {
            return;
        }
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label><br />';
        var cnt = 1;
        var value = (currValue !== undefined ? currValue : defaultValue);
        angular.forEach(enums.enumof, function(v, k) {
            var title = v.label;
            var type = v.type;
            var enumVal =  $filter('hasNode')(v, 'type.fix.value');
            var checked = (cnt == 1 ? ' checked="checked"' : '');
            var isCurrent = (cnt == 1 ? ' commads-is-current' : '');

            if ('fix' in type) {
                if (defaultValue) {
                    if (isNaN(parseInt(defaultValue, 10))) {
                        isCurrent = (v.label == defaultValue ? ' commads-is-current' : '');
                    } else {
                         isCurrent = '';
                    }
                }
                
                if (!isNaN(parseInt(value, 10))) {
                    checked = (enumVal == value ? ' checked="checked"' : '');
                }
                input += '<input name="radio_' + inName + '" class="commands-data-chbx" type="radio" value="' + type.fix.value + '"' + checked + ' /> <span class="commands-label' + isCurrent + '">' + title + '</span><br />';
            } else if ('range' in type) {
                var min = type.range.min;
                var max = type.range.max;
                var disabled = ' disabled="true"';
                var setVal = (value ? value : min);
                if (defaultValue) {
                    if (defaultValue >= min && defaultValue <= max) {
                        disabled = '';
                        isCurrent = ' commads-is-current';
                    }

                } else {
                    isCurrent = '';
                }
                if (value) {
                    if (value >= min && value <= max) {
                        checked = ' checked="checked"';
                        disabled = '';
                    }

                } else {
                    checked = '';
                }
                
                if (hideRadio) {
                    disabled = '';
                }

//                input += '<input name="radio_' + inName + '" class="commands-data-chbx" type="radio" value=""' + checked + ' /> ' + title + ' <input type="text" name="radio_' + inName + '_txt" class="form-control commands-data-txt-chbx" value="' + min + '" title=" min: ' + min + ', max: ' + max + '"'+ disabled + ' /><br />'; 
                if (!hideRadio) {
                    input += '<div><input name="radio_' + inName + '" class="commands-data-chbx" type="radio" value=""' + checked + ' /> <span class="commands-label' + isCurrent + '">' + title + '</span> <input type="text" name="radio_txt_' + inName + '" class="form-control commands-data-txt-chbx" value="' + setVal + '" title=" min: ' + min + ', max: ' + max + '"' + disabled + ' /></div>';
                } else {
                    input += '<input type="text" name="radio_txt_' + inName + '" class="form-control" value="' + setVal + '" title=" min: ' + min + ', max: ' + max + '" /><br />';
                }


            } else {
                input = '';
            }
            cnt++;

        });
        return input;
    }

    /**
     * Renders dropdown list
     * @param {string} label
     * @param {object} enums
     * @param {string} defaultValue
     * @param {string} name
     * @param {string} currValue
     * @returns {String}
     */
    function getDropdown(label, enums, defaultValue, name,currValue) {
        var input = '';
        var cValue = (currValue !== undefined ? currValue : defaultValue);
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label><br />';
        input += '<select name="select_' + inName + '" class="form-control">';
        var cnt = 1;
        angular.forEach(enums.enumof, function(v, k) {
            var title = v.label;
            var type = v.type;
            var value;
            if ('fix' in type) {
                value = type.fix.value;
            } else if ('range' in type) {
                value = type.range.min;
            }

            if (value) {
                var selected = (type.fix.value == cValue ? ' selected' : '');
            }
            input += '<option value="' + value + '"' + selected + '> ' + title + '</option>';
            cnt++;

        });
        input += '</select">';
        return input;
    }

    /**
     * Renders constant select
     * @param {string} label
     * @param {string} type
     * @param {string} defaultValue
     * @param {string} name
     * @param {string} currValue
     * @returns {String}
     */
    function getConstant(label, type, defaultValue, name,currValue) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label><br />';
        if (type.constant.length > 0) {
            input += '<select name="select_' + inName + '" class="form-control">';
            angular.forEach(type.constant, function(v, k) {

                input += '<option value="' + v.type.constant.value + '"> ' + v.label + '</option>';
            });


            input += '</select">';
        }
        //console.log(type,defaultValue);
        input += '<em>Constant type</em>';
        return input;
    }
    /**
     * Renders string input
     * @param {string} label
     * @param {string} value
     * @param {string} name
     * @returns {String}
     */
    function getString(label, value, name) {
        var input = '';
        var inName = $filter('stringToSlug')(name ? name : label);
        input += '<label>' + label + '</label> ';
        input += '<input class="form-control" name="' + inName + '" type="text" class="form-control" value="' + value + '" />';
        return input;
    }
    
    /**
     * Renders bitset input
     * @returns {String}
     */
    function getBitset() {
        
        var input = '';
        
        return input;
    }

    /**
     * Renders default label
     * @param {string} label
     * @returns {String}
     */
    function getDefault(label) {

        var input = '';
        input += '<label>' + label + '</label><br />';
        return input;
    }

    return {
        restrict: "E",
        replace: true,
        template: '<div class="form-group" ng-bind-html="input | toTrusted"></div>',
        scope: {
            collection: '=',
            devices: '=',
            getNodeDevices: '=',
            values: '=',
            isDropdown: '=',
            defaultValue: '=',
            showDefaultValue: '=',
            currValue: '=',
            currNodeValue: '=',
            name: '=',
            divId: '='
        },
        link: function(scope, element, attrs) {

            var input = '';
            if (!scope.collection) {
                return;
            }
            var label = scope.collection.label;
            var type = scope.collection.type;
            var name = (scope.collection.name || scope.name);
            var hideRadio = scope.collection.hideRadio;
            if (scope.isDropdown) {
                input = getDropdown(label, type, scope.defaultValue, name,scope.currValue);
                scope.input = input;
                return;
            }
            //if (label && type) {
            if (type) {
                if ('range' in type) {
                    input = getText(label, scope.values, type.range.min, type.range.max, name);
                } else if ('node' in type) {
                    input = getNode(label, scope.getNodeDevices(), scope.currNodeValue, name);
                } else if ('enumof' in type) {
                    input = getEnum(label, type, scope.defaultValue, name, hideRadio,scope.currValue);
                } else if ('bitset' in type) {
                    input = getBitset(label, type, scope.defaultValue, name, hideRadio,scope.currValue);
                } else if ('constant' in type) {
                    input = getConstant(label, type, scope.defaultValue, name,scope.currValue);
                } else if ('string' in type) {
                    input = getString(label, scope.values, name,scope.currValue);
                } else {
                    input = getDefault(label);
                }
                scope.input = input;
                return;
            }

        }

    };
});
/**
 * Renders configuration default value
 * @class configDefaultValue
 */
myApp.directive('configDefaultValue', function() {
    return {
        restrict: "E",
        replace: true,
        template: '<span class="default-value-format"> {{input}}</span>',
        scope: {
            collection: '=',
            defaultValue: '=',
            showDefaultValue: '='
        },
        link: function(scope, element, attrs) {
            scope.input = scope.showDefaultValue;
            var input = '';
            if (!scope.collection) {
                return;
            }
            var label = scope.collection.label;
            var type = scope.collection.type;
            var name = scope.collection.name;
            var hideRadio = scope.collection.hideRadio;
            
            if (type) {
                if ('range' in type) {
                    //input = getText(label, scope.values, type.range.min, type.range.max, name);
                } else if ('node' in type) {
                    //input = getNode(label, scope.getNodeDevices(), 'null', name);
                } else if ('enumof' in type) {
                    input = getEnum(type, scope.defaultValue,scope.showDefaultValue);
                   
                } else if ('constant' in type) {
                    //input = getConstant(label, type, scope.defaultValue, name);
                } else if ('string' in type) {
                    //input = getString(label, scope.values, name);
                } else {
                    input = scope.showDefaultValue;
                }
                scope.input = input;
                
                return;
            }


        }

    };

    /**
     * Renders enumerators
     * @param {object} enums
     * @param {string} defaultValue
     * @param {string} showDefaultValue
     * @returns {string}
     */
    function getEnum(enums, defaultValue,showDefaultValue) {
        //console.log(enums)
        var input = showDefaultValue;
        if (!enums) {
            return;
        }
        angular.forEach(enums.enumof, function(v, k) {
          
            var title = v.label ? v.label : showDefaultValue;
            var type = v.type;
             // debugger; 
            if ('fix' in type) {
                if (type.fix.value == showDefaultValue) {
                    input = title;
                    return;
                }
 
            } else if ('range' in type) {
                var min = type.range.min;
                var max = type.range.max;
                var setVal = (defaultValue ? defaultValue : min);
                if (setVal == showDefaultValue) {
                    input = showDefaultValue;
                    return;
                }
            }

        });
        
        return input;
    }
});
/**
 * Renders configuration title input
 * @class configValueTitle
 */
myApp.directive('configValueTitle', function() {
    return {
        restrict: "A",
        //replace: true,
        template: '<span title="{{showValue}}">{{input}}</span>',
        scope: {
            collection: '=',
            showValue: '='
        },
        link: function(scope, element, attrs) {
            scope.input = scope.showValue;
            var input = '';
            if (!scope.collection) {
                return;
            }
            var type = scope.collection.type;
            
            if (type) {
                if ('range' in type) {
                    //input = getText(label, scope.values, type.range.min, type.range.max, name);
                } else if ('node' in type) {
                    //input = getNode(label, scope.getNodeDevices(), 'null', name);
                } else if ('enumof' in type) {
                    input = getEnum(type, scope.showValue);
                   
                } else if ('constant' in type) {
                    //input = getConstant(label, type, scope.defaultValue, name);
                } else if ('string' in type) {
                    //input = getString(label, scope.values, name);
                } else {
                    input = scope.showValue;
                }
                scope.input = input;
                
                return;
            }


        }

    };

    /**
     * Renders enumerators
     * @param {object} enums
     * @param {string} showValue
     * @returns {string}
     */
    function getEnum(enums, showValue) {
        //console.log(enums)
        var input = showValue;
        if (!enums) {
            return;
        }
        angular.forEach(enums.enumof, function(v, k) {
          
            var title = v.label ? v.label : showValue;
            var type = v.type;
             // debugger; 
            if ('fix' in type) {
                if (type.fix.value == showValue) {
                    input = title;
                    return;
                }
 
            } else if ('range' in type) {
                var min = type.range.min;
                var max = type.range.max;
                var setVal = (showValue ? showValue : min);
                if (setVal == showValue) {
                    input = showValue;
                    return;
                }
            }

        });
        
        return input;
    }
});

