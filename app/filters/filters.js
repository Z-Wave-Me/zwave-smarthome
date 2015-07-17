/**
 * App filters
 * @author Martin Vach
 */
/**
 * Display HTML tags in scope
 */
myApp.filter('toTrusted', ['$sce', function($sce) {
        return function(text) {
            if (text == null) {
                return '';
            }
            return $sce.trustAsHtml(text);
        };
    }]);
/**
 * Strip HTML tags from input
 */
myApp.filter('stripTags', function() {
    return function(text) {
      return String(text).replace(/<[^>]+>/gm, '');
    };
});
/**
 * Cut text into x chars
 */
myApp.filter('cutText', function() {
    return function(value, wordwise, max, tail) {
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

        return value + (tail || ' …');
    };
});
/**
 * Convert val to int
 */
myApp.filter('toInt', function() {
    return function(val, a) {
        a = typeof a !== 'undefined' ? a : 10;
        if (isNaN(val)) {
            return 0;
        }
        return parseInt(val, a);
    };
});

/**
 * Get type of a Javascript variable
 */
myApp.filter('typeOf', function() {
    return function(obj) {
         return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
    };
});

/**
 * Set the max dec. lenghth
 */
myApp.filter('numberFixedLen', function() {
    return function(val) {
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
 * Check if JSON keys/nodes exist
 */
myApp.filter('hasNode', function() {
    return function(obj, path) {
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
 * Get segment from url
 */
myApp.filter('getUrlSegment', function($location) {
    return function(segment) {
        var ret = false;
        var data = $location.path().split('/');
        if (data[segment]) {
            ret = data[segment];
        }
        return ret;
    };
});
/**
 * Get current time
 */
myApp.filter('getElementIcon', function(cfg) {
    return function(input, device,level) {
        var icon = cfg.img.icons + 'placeholder.png';
        if (input) {
            if ((/^https?:\/\//.test(input))) {
                return input;
            } else if ((/\.(png|gif|jpe?g)$/).test(input)) {
                if (input.indexOf('/') > -1) {
                    return input;
                } else {
                    return cfg.img.icons + input;
                }
            }
            switch (input) {
                case 'door':
                    icon = cfg.img.icons + (level == 'on' ? 'door-open.png' : 'door-closed.png');
                    break;

                case 'switch':
                    icon = cfg.img.icons + (level == 'on' ? 'switch-on.png' : 'switch-off.png');
                    break;

                case 'motion':
                    icon = cfg.img.icons + (level == 'on' ? 'motion-on.png' : 'motion-off.png');
                    break;

                case 'blinds':
                    if (level == 0) {
                        icon = cfg.img.icons + 'blind-down.png';
                    } else if (level >= 99) {
                        icon = cfg.img.icons + 'blind-up.png';
                    } else {
                        icon = cfg.img.icons + 'blind-half.png';
                    }
                    break;

                case 'multilevel':
                    if (level == 0) {
                        icon = cfg.img.icons + 'dimmer-off.png';
                    } else if (level >= 99) {
                        icon = cfg.img.icons + 'dimmer-on.png';
                    } else {
                        icon = cfg.img.icons + 'dimmer-half.png';
                    }
                    break;
                case 'thermostat':
                     icon = cfg.img.icons + (level == 'on' ? 'switch-on.png' : 'switch-off.png');
                    //icon = cfg.img.icons + 'thermostat.png';
                    break;

                case 'energy':
                    icon = cfg.img.icons + 'energy.png';
                    break;

                case 'meter':
                    icon = cfg.img.icons + 'meter.png';
                    break;

                case 'temperature':
                    icon = cfg.img.icons + 'temperature.png';
                    break;

                case 'camera':
                    icon = cfg.img.icons + 'camera.png';
                    break;
                case 'smoke':
                    icon = cfg.img.icons + 'smoke.png';
                    break;
                case 'alarm':
                    icon = cfg.img.icons + 'alarm.png';
                    break;
                case 'battery':
                    icon = cfg.img.icons + 'battery.png';
                    break;
                case 'luminosity':
                    icon = cfg.img.icons + 'luminosity.png';
                    break;
                case 'new':
                    icon = cfg.img.icons + 'new.png';
                    break;
                default:
                    break;
            }

        }
        return icon;
    };
});

/**
 * Get event icon
 */
myApp.filter('getEventIcon', function() {
    return function(input,message) {
        var icon = 'placeholder.png';
        switch (input) {
            case 'device-temperature':
                icon = 'device-temperature.png';
                break;
             case 'device-electric':
                icon = 'device-electric.png';
                break;
             case 'device-power':
                icon = 'device-power.png';
                break;
            case 'device-status':
                icon = 'device-status.png';
                break
            case 'device-OnOff':
                if(angular.isObject(message)){
                    icon = (message.l == 'on'? 'device-on.png': 'device-off.png'); 
                }else{
                    icon = 'device-on.png';
                }
                break
             case 'device-luminiscence':
                icon = 'device-luminiscence.png';
                break
            case 'device':
                icon = 'device.png';
                break
            case 'module':
                icon = 'module.png';
                break
            default:
                break;
        }
        return icon;
    };
});

/**
 * Get battery icon
 */
myApp.filter('getBatteryIcon', function() {
    return function(input) {
        var icon = 'battery.png';
        if (isNaN(input)) {
            return icon;
        }
        var level = parseInt(input);
        if(level > 95){
            icon = 'battery-100.png';
        }else if(level >= 70 && level <= 95){
            icon = 'battery-80.png';
        }else if(level >= 50 && level < 70){
            icon = 'battery-50.png';
        }else if(level > 20 && level < 50){
            icon = 'battery-30.png';
        }else if(level >= 5 && level <= 20){
            icon = 'battery-20.png';
        }else{
            icon = 'battery-0.png';
        }
        return icon;
    };
});

/**
 * Get max level
 */
myApp.filter('getMaxLevel', function() {
    return function(input) {
        var maxLevel = 100;
        var levelVal = (input < 100 ? input : 99);
        return levelVal;
    };
});

/**
 * Today from unix - ExpertUI filter
 */
myApp.filter('isTodayFromUnix', function() {
    return function(input) {
        if(isNaN(input)){
            return '?';
        }
        var d = new Date(input * 1000);
        var day = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
        var mon = d.getMonth() + 1; //Months are zero based
        mon = ( mon < 10 ? '0' +  mon :  mon);
        var year = d.getFullYear();
        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
        var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());

        if (d.toDateString() == (new Date()).toDateString()) {
            //return hrs + ':' + min + ':' + sec;
            return hrs + ':' + min;

        } else {
            //return day + '.' + mon + '.' + year + ' ' + hrs + ':' + min + ':' + sec;
            return day + '.' + mon + '.' + year;
        }
    };
});
/**
 * Get current time
 */
myApp.filter('getCurrentTime', function() {
    return function() {
        var d = new Date();
        var hrs = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
        var min = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
        var sec = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds());
        var time = hrs + ':' + min + ':' + sec;
        return time;
    };
});
/**
 * Get current time
 */
myApp.filter('unixStartOfDay', function() {
    return function(input, value) {
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
 */
myApp.filter('isToday', function() {
    return function(input, fromunix,days,yesterday) {
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
 * If is today display h:m otherwise d:m:y
 */
myApp.filter('eventDate', function() {
    return function(input) {
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
 * Get only unique values
 */
myApp.filter('unique', function() {
    return function(items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function(item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function(item) {
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
 */
myApp.filter('uri', function($location) {
    return {
        segment: function(segment) {
            var data = $location.path().split("/");
            if (data[segment]) {
                return data[segment];
            }
            return false;
        },
        total_segments: function() {
            var data = $location.path().split("/");
            var i = 0;
            angular.forEach(data, function(value) {
                if (value.length) {
                    i++;
                }
            });
            return i;
        }
    };
});

/**
 * Display device name
 */
myApp.filter('deviceName', function() {
    return function(deviceId, device) {
        var name = (deviceId == 1 ? 'RaZberry' : 'Device ' + '_' + deviceId);
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
 */
myApp.filter('stringToSlug', function() {
    return function(str) {
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
