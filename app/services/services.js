/**
 * Application services
 * @author Martin Vach
 */
var myAppService = angular.module('myAppService', []);

/**
 * Device service
 */
myAppService.service('deviceService', function($filter) {
    /// --- Public functions --- ///
    
    /**
     * Get device data
     */
    this.getDevices = function(data,filter) {
        return getDevices(data,filter);
    };
    
    /**
     * Get device types
     */
    this.getDeviceType = function(data) {
        return getDeviceType(data);
    };

    /// --- Private functions --- ///
    
    /**
     * Get device data
     */
    function getDevices(data,filter) {
        var obj;
        var collection = [];
        angular.forEach(data, function(v, k) {
            if(v.permanently_hidden){
                return;
            }
            obj = {
                'id': v.id,
                'title': v.metrics.title,
                'metrics': v.metrics,
                'tags': v.tags,
                'permanently_hidden': v.permanently_hidden,
                'level': v.metrics.level,
                'icon': v.metrics.icon,
                'probeTitle': v.metrics.probeTitle,
                'scaleTitle': v.metrics.scaleTitle,
                'deviceType': v.deviceType,
                'location': v.location,
                'updateTime': v.updateTime
            };
            if(filter){
                if(v[filter.param] == filter.val){
                    collection.push(obj);    
                }
            }else{
                 collection.push(obj);    
                }
            
        });
        return collection;
    }
    
    /**
     * Get device data
     */
    function getDeviceType(data) {
        var collection = [];
        angular.forEach(data, function(v, k) {
           collection.push({
                'key': v.deviceType,
                'val': v.deviceType
            });
         });
        return $filter('unique')(collection, 'key');
    }
});
