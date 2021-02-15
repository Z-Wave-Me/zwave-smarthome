/**
 * @overview Filters that are used to format data within views and controllers.
 * @author Martin Vach
 */


myApp.filter('appSliderSlice', function() {
    return function(arr, cfg) {
        var start = cfg.start;
        var end = cfg.start + cfg.show;
        if(start < 0 ||  start > cfg.max){
            start = 0;
            end = cfg.show;
        }
        return arr.slice(start, end);
    };
});

/**
 * Allow to display html tags in the scope
 * @function toTrusted
 */
myApp.filter('toTrusted', ['$sce', function ($sce) {
        return function (text) {
            if (text == null) {
                return '';
            }
            return $sce.trustAsHtml(text);
        };
    }]);
/**
 * Strip HTML tags from input
 * @function stripTags
 */
myApp.filter('stripTags', function () {
    return function (text) {
        return String(text).replace(/<[^>]+>/gm, '');
    };
});
/**
 * Shorten the text to the specified number of characters
 * @function cutText
 */
myApp.filter('cutText', function () {
    return function (value, wordwise, max, tail) {
        if (!value)
            return '';

        max = parseInt(max, 10);
        if (!max)
            return value;
        if (value.length <= max)
            return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }
        return value + (tail  || ' …');
    };
});
/**
 * Convert val to int
 * @function toInt
 */
myApp.filter('toInt', function () {
    return function (val, a) {
        a = typeof a !== 'undefined' ? a : 10;
        if (val === null || val === '' || isNaN(val)) {
            return 0;
        }
        return parseInt(val, a);
    };
});

/**
 * Convert val to string
 * @function toString
 */
myApp.filter('toString', function () {
    return function (val) {
        return val.toString();
    };
});

/**
 * Convert val to bool
 * @function toBool
 */
myApp.filter('toBool', function () {
    return function (val) {
        return (String(val).toLowerCase() === 'true');
    };
});

/**
 * Get type of a Javascript variable
 * @function typeOf
 */
myApp.filter('typeOf', function () {
    return function (obj) {
        return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
    };
});

//This converts a number to a string hex AND pads leading zeros
myApp.filter('decToHexString', function () {
  return function (decimal, chars, x) {
      var hex = (decimal + Math.pow(16, chars)).toString(16).slice(-chars).toUpperCase();
      return (x || '') + hex;
  };
});


/**
 * Convert a dec value to hex
 * @function dec2hex
 */
myApp.filter('dec2hex', function () {
    return function (i) {
        var result = "0000";
        if (i >= 0 && i <= 15) {
            result = "000" + i.toString(16);
        } else if (i >= 16 && i <= 255) {
            result = "00" + i.toString(16);
        } else if (i >= 256 && i <= 4095) {
            result = "0" + i.toString(16);
        } else if (i >= 4096 && i <= 65535) {
            result = i.toString(16);
        }
        return result;
    };
});

/**
 * Get a file extension from the path
 * @function fileExtension
 */
myApp.filter('fileExtension', function () {
    return function (path) {
        // extract file name from full path ...
        // (supports `\\` and `/` separators)
        var basename = path.split(/[\\/]/).pop(),
                // get last position of `.`                                      
                pos = basename.lastIndexOf(".");
        // if file name is empty or ...
        //  `.` not found (-1) or comes first (0)
        if (basename === '' || pos < 1) {
            return '';
        }

        // extract extension ignoring `.`
        return basename.slice(pos + 1).toLowerCase();
    };
});

/**
 * Convert file size in bytes to human readable with a scale type
 * @function fileSizeString
 */
myApp.filter('fileSizeString', function () {
    return function (bytes) {
        var i = -1;
        var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
        do {
            bytes = bytes / 1024;
            i++;
        } while (bytes > 1024);

        return Math.max(bytes, 0.1).toFixed(1) + byteUnits[i];
    };
});

/**
 * Set max length of the number entered
 * @function numberFixedLen
 */
myApp.filter('numberFixedLen', function () {
    return function (val) {
        if (val == 0) {
            return 0;
        }
        if (!val) {
            return;
        }
        var len = 1;
        var isDec = val.toString().split(".");
        if (isDec.length > 1 && isDec[1].length > len) {
            var num = parseFloat(val);
            if (isNaN(num)) {
                return val;
            } else {
                return num.toFixed(len);
            }

        }
        return val;
    };
});

/**
 * Check if an object exists and has a node.
 * @function hasNode
 */
myApp.filter('hasNode', function () {
    return function (obj, path) {
        if (!obj || !path) {
            return null;
        }
        //console.log(path);
        path = path.split('.');
        var p = obj || {};
        for (var i in path) {
            if (p === null || typeof p[path[i]] === 'undefined') {
                return null;
            }
            p = p[path[i]];
        }
        return p;
    };
});
/**
 * Output integer with leading zeros
 * @function zeroFill
 */
myApp.filter('zeroFill', function () {
    return function (num, len) {
        len = len || 10;
        return (Array(len).join("0") + num).slice(-len);
    };
});

/**
 * Builds an event icon path
 * @function getEventIcon
 */
myApp.filter('getEventIcon', function (cfg) {
    return function (input, message) {
        var icon = cfg.img.icons + 'placeholder.png';
        switch (input) {
            case 'device-temperature':
                icon = cfg.img.icons + 'event-device-temperature.png';
                break;
            case 'device-electric':
                icon = cfg.img.icons + 'event-device-electric.png';
                break;
            case 'device-power':
                icon = cfg.img.icons + 'event-device-power.png';
                break;
            case 'device-status':
                icon = cfg.img.icons + 'event-device-status.png';
                break
            case 'device-OnOff':
                if (angular.isObject(message)) {
                    icon = (message.l == 'on' ? cfg.img.icons + 'event-device-on.png' : cfg.img.icons + 'event-device-off.png');
                } else {
                    icon = cfg.img.icons + 'event-device-on.png';
                }
                break
            case 'device-luminiscence':
                icon = cfg.img.icons + 'event-device-luminiscence.png';
                break
            case 'device':
                icon = cfg.img.icons + 'event-device.png';
                break
            case 'module':
                icon = cfg.img.icons + 'event-module.png';
                break
            default:
                break;
        }
        return icon;
    };
});

/**
 * Builds a battery icon path
 * @function getBatteryIcon
 */
myApp.filter('getBatteryIcon', function (cfg) {
    return function (input) {
        var icon = cfg.img.icons + 'battery.png';
        if (isNaN(input)) {
            return icon;
        }
        var level = parseInt(input);
        if (level > 95) {
            icon = cfg.img.icons + 'battery-100.png';
        } else if (level >= 70 && level <= 95) {
            icon = cfg.img.icons + 'battery-80.png';
        } else if (level >= 50 && level < 70) {
            icon = cfg.img.icons + 'battery-50.png';
        } else if (level > 20 && level < 50) {
            icon = cfg.img.icons + 'battery-30.png';
        } else if (level >= 5 && level <= 20) {
            icon = cfg.img.icons + 'battery-20.png';
        } else {
            icon = cfg.img.icons + 'battery-0.png';
        }
        return icon;
    };
});

/**
 * Get a category icon in the Elements sections
 * @function getElCategoryIcon
 */
myApp.filter('getElCategoryIcon', function () {
    return function (input) {
        var array = {
            text: 'fa-file-alt',
            camera: 'fa-video',
            switchRGBW: 'fa-star-half',
            switchControl: 'fa-toggle-off',
            switchBinary: 'fa-toggle-on',
            sensorMultiline: 'fa-list-ul',
            switchMultilevel: 'fa-lightbulb',
            thermostat: 'fa-thermometer-half',
            thermostatMode: 'fa-thermometer-half',
            toggleButton: 'fa-dot-circle',
            sensorDiscrete: 'fa-dot-circle',
            doorlock: 'fa-lock',
            sensorMultilevel: 'fa-sun',
            sensorBinary: 'fa-fire'
        };
        // Default icon
        if (!array[input]) {
            return 'fa-caret-right';
        }

        return array[input];
    };
});

/**
 * Get a category icon in the APPs sections
 * @function getAppCategoryIcon
 */
myApp.filter('getAppCategoryIcon', function () {
    return function (input) {
        var array = {
            basic_gateway_modules: 'fa-cube',
            legacy_products_workaround: 'fa-wrench',
            support_external_ui: 'fa-object-group',
            support_external_dev: 'fa-cubes',
            automation_basic: 'fa-sync',
            device_enhancements: 'fa-plus-square',
            developers_stuff: 'fa-file-code',
            complex_applications: 'fa-link',
            surveillance: 'fa-video',
            //automation: '',
            security: 'fa-shield-alt',
            peripherals: 'fa-bolt',
            logging: 'fa-list-ul',
            //scripting: '',
            devices: 'fa-lightbulb',
            scheduling: 'fa-calendar-plus',
            //climate: '',
            environment: 'fa-puzzle-piece',
            //scenes: '',
            notifications: 'fa-calendar',
            tagging: 'fa-tags'
        };
        // Default icon
        if (!array[input]) {
            return 'fa-caret-right';
        }

        return array[input];
    };
});

/**
 * Get an icon for awake/sleep status
 * @function getMaxLevel
 */
myApp.filter('getAwakeIcon', function () {
    return function (input) {
        switch (input) {
            case 'awake':
                return 'fa-certificate color-orange';
            case 'sleep':
                return 'fa-moon text-primary';
            default:
                return '';
        }

    };
});

/**
 * Get max level by probeType from the devices data holder
 * @function getMaxLevel
 */
myApp.filter('getMaxLevel', function () {
    return function (input, maxLevel) {
        maxLevel = maxLevel || 100;
        return Math.min(input, maxLevel);
    };
});

/**
 * Today from unix - ExpertUI filter used in the device hardware configuration
 * @function isTodayFromUnix
 */
myApp.filter('isTodayFromUnix', function () {
    return function (input) {
        if (isNaN(input)) {
            return '?';
        }

        var d = new Date(input * 1000);
        var day = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
        var mon = d.getMonth() + 1; //Months are zero based
        mon = (mon < 10 ? '0' + mon : mon);
        var year = d.getFullYear();
        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
        var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());

        if (d.toDateString() == (new Date()).toDateString()) {
            return hrs + ':' + min;

        } else {
            return day + '.' + mon + '.' + year;
        }
    };
});
/**
 * Get time from the box and displays it in the hrs:min:sec format
 * @function setTimeFromBox
 */
myApp.filter('setTimeFromBox', function () {
    return function (input) {
        if (input) {
            var d = new Date(input * 1000);
        } else {
            var d = new Date();
        }
        // Convert to ISO
        // 2016-06-07T11:49:51.000Z
        return d.toISOString().substring(11, d.toISOString().indexOf('.'));
    };
});

/**
 * Get a day from the unix timstamp for filtering events
 * @function unixStartOfDay
 */
myApp.filter('unixStartOfDay', function () {
    return function (input, value) {
        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var timestamp = (startOfDay / 1000) + (3600 * 2);
        if (input && value) {
            switch (input) {
                case '+':
                    timestamp += value;
                    break;
                case '-':
                    timestamp -= value;
                    break;
                default:
                    break;
            }
        }
        return timestamp;
    };
});
/**
 * If is today display h:m otherwise d:m:y
 * @function isToday
 */
myApp.filter('isToday', function () {
    return function (input, fromunix, days, yesterday) {
        if (new Date(input) === "Invalid Date" && isNaN(new Date(input))) {
            return '';
        };
        if (fromunix) {
            var d = new Date(input * 1000);
            var startDate = new Date(input * 1000);  // 2000-01-01
        } else {
            var d = new Date(input);
            var startDate = new Date(input);  // 2000-01-01
        }


        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());

        if (d.toDateString() == (new Date()).toDateString()) {
            return hrs + ':' + min;

        } else {

            var endDate = new Date();              // Today
            var nDays = diffDays(startDate, endDate) + 1;
            var str = '' + (nDays + 1) + ' ' + days;
            if (nDays < 2) {
                str = yesterday;
            }
            return str;
        }
    };
    // Calculate the number of days between two dates
    function diffDays(d1, d2)
    {
        var ndays;
        var tv1 = d1.valueOf();  // msec since 1970
        var tv2 = d2.valueOf();

        ndays = (tv2 - tv1) / 1000 / 86400;
        ndays = Math.round(ndays - 0.5);
        return ndays;
    }
});

/**
 * Renders an event date - If is today display h:m otherwise d:m:y
 * @function eventDate
 */
myApp.filter('eventDate', function () {
    return function (input) {
        var d = new Date(input);
        var day = d.getDate();
        var mon = d.getMonth() + 1; //Months are zero based
        var year = d.getFullYear();
        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
        var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());

        if (d.toDateString() == (new Date()).toDateString()) {
            return hrs + ':' + min;

        } else {
            return day + '.' + mon + '. -  ' + hrs + ':' + min;
        }
    };
});

/**
 * Renders andate time from unix timestamp in format d:m:y - h:m
 * @function eventDate
 */
myApp.filter('dateTimeFromTimestamp', function () {
  return function (input) {
      var d = new Date(input);
      var day = d.getDate();
      var mon = d.getMonth() + 1; //Months are zero based
      var year = d.getFullYear();
      var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
      var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
      var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());

      return day + '.' + mon + '.' + year + ' - ' + hrs + ':' + min;
  };
});

/**
 * Convert MySql DateTime stamp into JavaScript's Date format
 * @function mysqlToUnixTs
 */
myApp.filter('mysqlToUnixTs', function () {
    return function (input) {
        //function parses mysql datetime string and returns javascript Date object
        //input has to be in this format: 2007-06-05 15:26:02
        var regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
        var parts = input.replace(regex, "$1 $2 $3 $4 $5 $6").split(' ');
        return Math.floor(new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]).getTime() / 1000);
    };
});

/**
 * Set an object with unique key-values only
 * @function unique
 */
myApp.filter('unique', function () {
    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
});
/**
 * Get uri segment
 * @function uri
 */
myApp.filter('uri', function ($location) {
    return {
        segment: function (segment) {
            var data = $location.path().split("/");
            if (data[segment]) {
                return data[segment];
            }
            return false;
        },
        total_segments: function () {
            var data = $location.path().split("/");
            var i = 0;
            angular.forEach(data, function (value) {
                if (value.length) {
                    i++;
                }
            });
            return i;
        }
    };
});

/**
 * Build a device name
 * @function deviceName
 */
myApp.filter('deviceName', function () {
    return function (deviceId, device) {
        var name = (deviceId == 1 ? 'Z-Way' : 'Device ' + '_' + deviceId);
        if (device === undefined) {
            return name;
        }
        if (device.data.givenName.value != '') {
            name = device.data.givenName.value;
        }
        return name;
    };
});

/**
 * Convert text to slug
 * @function stringToSlug
 */
myApp.filter('stringToSlug', function () {
    return function (str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to = "aaaaeeeeiiiioooouuuunc------";
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/-+/g, '-'); // collapse dashes

        return str;
    };
});


/**
 * Set a hardware configuration value
 * @function setConfigValue
 */
myApp.filter('setConfigValue', function () {
    return function (value) {
        if (isNaN(parseInt(value))) {
            return '\'' + value + '\'';
        } else {
            return value;
        }

    };
});

/**
 * Set rgb colors
 * @function etRgbColors
 */
myApp.filter('setRgbColors', function () {
    return function (color) {
        if (!color) return 'rgb(0,0,0)';
        return 'rgb('+ color.r +',' + color.g  + ',' + color.b  +')';

    };
});