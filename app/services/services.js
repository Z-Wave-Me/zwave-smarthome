/**
 * Application services
 * @author Martin Vach
 */
var myAppService = angular.module('myAppService', []);

/**
 * Device service
 */
myAppService.service('deviceService', function() {
    /// --- Public functions --- ///
    
    /**
     * Get device data
     */
    this.getDevices = function(data) {
        return setDevices(data);
    };

    /// --- Private functions --- ///
    
    /**
     * Set device data
     */
    function setDevices(data) {
        var collection = [];
        angular.forEach(data, function(v, k) {
            collection.push({
                'id': v.id,
                'title': v.metrics.title,
                'level': v.metrics.level,
                'icon': v.metrics.icon,
                'probeTitle': v.metrics.probeTitle,
                'scaleTitle': v.metrics.scaleTitle,
                'deviceType': v.deviceType,
                'location': v.location,
                'updateTime': v.updateTime
            });
        });
        return collection;
    }
});
