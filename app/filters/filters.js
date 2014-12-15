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
    return String(input).replace(/<[^>]+>/gm, '');
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
 * Get current time
 */
myApp.filter('getElementIcon', function(cfg) {
    return function(input, device) {
        var icon = cfg.img.icons + 'placeholder.png';
        if (input) {
            if ((/^http:\/\//.test(input))) {
                return input;
            }
            switch (input) {
                 case 'door':
                    icon = cfg.img.icons + (device.metrics.level == 'open' ? 'door-open.png' : 'door-closed.png');
                    break;
                    
                     case 'switch':
                     icon = cfg.img.icons + (device.metrics.level == 'on' ? 'switch-on.png' : 'switch-off.png');
                    break;
                    
                case 'motion':
                    icon = cfg.img.icons + (device.metrics.level == 'on' ? 'motion-on.png' : 'motion-off.png');
                    break;
                
                case 'blinds':
                    if(device.metrics.level == 0){
                        icon = cfg.img.icons + 'blind-down.png';
                    }else if(device.metrics.level >= 99){
                        icon = cfg.img.icons + 'blind-up.png';
                    }else{
                        icon = cfg.img.icons + 'blind-half.png';
                    }
                    break;
                    
               case 'multilevel':
                    if(device.metrics.level == 0){
                        icon = cfg.img.icons + 'dimmer-off.png';
                    }else if(device.metrics.level >= 99){
                        icon = cfg.img.icons + 'dimmer-on.png';
                    }else{
                        icon = cfg.img.icons + 'dimmer-half.png';
                    }
                     break;
                case 'thermostat':
                    icon = cfg.img.icons + 'thermostat.png';
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
                
                default:
                    break;
            }

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
        var levelVal = (input < 101 ? input : 100);
        return levelVal;
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
 * If is today display h:m otherwise d:m:y
 */
myApp.filter('isToday', function() {
    return function(input, fromunix) {
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
            var str = '' + nDays + ' days';
            if (nDays < 2) {
                str = 'yesterday';
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
 * If is today from unix stamp display h:m otherwise d:m:y
 */
myApp.filter('isTodayFromUnix', function() {
    return function(input) {
        if (isNaN(input)) {
            return '';
        }
        var d = new Date(input * 1000);
        var day = d.getDate();
        var mon = d.getMonth() + 1; //Months are zero based
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
