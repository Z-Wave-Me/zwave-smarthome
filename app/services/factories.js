/**
 * Application factories
 * @author Martin Vach
 */
var myAppFactory = angular.module('myAppFactory', ['ngResource']);

/**
 * Main data factory
 */
myAppFactory.factory('dataFactory', function($http, $q, myCache, cfg) {
    return({
        demoData: demoData,
        getData: getData
    });
    
    /**
     * Gets dummy data
     */
    function demoData(file,callback) {
        var cached = myCache.get(file);
        if (cached) {
            console.log('CACHED');
            return callback(cached);
        } else {
            console.log('NOOOOT CACHED');
            var request = $http({
                method: "get",
                url: cfg.server_url + cfg.demo_url + file
            });
            return load(callback, request, file);
        }
    }
    /**
     * Get data
     */
    function getData(callback) {
        var request = $http({
            method: "get",
            url: cfg.server_url + "storage/data/demo.json_"
        });
        return load(callback,request);
    }
    
    /**
     * Load data
     */
    function load(callback,request,cacheName) {
        //$('#respone_container').html('Loading').show();
        return request.success(function(data) {
             //$('#respone_container').html('Success').show();
             myCache.put(cacheName,data);
            return callback(data);
        }).error(function(error) {
            handleError(error);

        });
    }
    /**
     * Handle errors
     */
    function handleError(error, message) {
        var msg = (message ? message : 'Error handling data from server');
        $('#main_content').hide();
        $('#respone_container').show();
        $('#respone_container_inner').html('<div class="alert alert-danger alert-dismissable response-message"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <i class="icon-ban-circle"></i> ' + msg + '</div>');
        console.log('Error');
        return;
        

    }
});

/**
 * Caching the river...
 */
myAppFactory.factory('myCache', function($cacheFactory) {
    return $cacheFactory('myData');
});

// Get language file
myAppFactory.factory('langFactory', function($resource, cfg) {
    return {
        get: function(lang) {
            return $resource(cfg.lang_dir + lang + '.json', {}, {query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }});
        }
    };
});
// Translation factory - get language line by key
myAppFactory.factory('langTransFactory', function() {
    return {
        get: function(key, languages) {
            if (angular.isObject(languages)) {
                if (angular.isDefined(languages[key])) {
                    return languages[key] !== '' ? languages[key] : key;
                }
            }
            return key;
        }
    };
});
