/**
 * Application factories
 * @author Martin Vach
 */
var myAppFactory = angular.module('myAppFactory', ['ngResource']);

/**
 * Main data factory
 */
myAppFactory.factory('dataFactory', function($http, $q, myCache, cfg) {
    var enableCache = true;
    return({
        getDevices: getDevices,
         putDevice: putDevice,
        getLocations: getLocations,
        postLocation: postLocation,
        putLocation: putLocation,
        deleteLocation: deleteLocation,
        getProfiles: getProfiles,
        postProfile: postProfile,
        putProfile: putProfile,
        deleteProfile: deleteProfile,
        getNotifications: getNotifications,
        demoData: demoData,
        setCache:  setCache
    });

    /**
     * Elements
     */
    function getDevices(callback, params) {
        var request = $http({
            method: "get",
            url: cfg.server_url + cfg.api_url + "devices" + (params ? params : '')
        });
        return load(callback, request,'devices');
    }
    // Put
    function putDevice(callback, id, data) {
        var request = $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api_url + "devices/" + id
        });
        return postData(callback, request);
    }

    /**
     * Locations
     */
    function getLocations(callback, id) {
        var request = $http({
            method: "get",
            url: cfg.server_url + cfg.api_url + "locations" + (id ? '/' + id : '')
        });
        return load(callback, request,'locations');
    }
    
    // Post
    function postLocation(callback, data) {
        var request = $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api_url + "locations"
        });
        return postData(callback, request);
    }
    
    // Put
    function putLocation(callback, id, data) {
        var request = $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api_url + "locations/" + id
        });
        return postData(callback, request);
    }
    
    // Delete
    function deleteLocation(id, input, target) {
        var request = $http({
            method: "delete",
            data: input,
            url: cfg.server_url + cfg.api_url + "locations/" + id
        });
        return deleteData(request, target);
    }

    /**
     * Profiles
     */
    function getProfiles(callback, id) {
        var request = $http({
            method: "get",
            url: cfg.server_url + cfg.api_url + "profiles" + (id ? '/' + id : '')
        });
        return load(callback, request, 'profiles');
    }
    // Post
    function postProfile(callback, data) {
        var request = $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api_url + "profiles"
        });
        return postData(callback, request);
    }
    // Put
    function putProfile(callback, id, data) {
        var request = $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api_url + "profiles/" + id
        });
        return postData(callback, request);
    }
    // Delete
    function deleteProfile(id, input, target) {
        var request = $http({
            method: "delete",
            data: input,
            url: cfg.server_url + cfg.api_url + "profiles/" + id
        });
        return deleteData(request, target);
    }

    /**
     * Notifications
     */
    function getNotifications(callback, params) {
        var request = $http({
            method: "get",
            url: cfg.server_url + cfg.api_url + "notifications" + (params ? params : '')
        });
        return load(callback, request,'notofications');
    }

    /**
     * Gets dummy data
     */
    function demoData(file, callback) {
        var cached = myCache.get(file);
        if (cached) {
            return callback(cached);
        } else {
            var request = $http({
                method: "get",
                url: cfg.demo_url + file
            });
            return load(callback, request, file);
        }
    }

    /**
     * Load data
     */
    function load(callback, request, cacheName) {
        var cached = null;
        if (cacheName) {
            cached = myCache.get(cacheName);
        }
        // Cached data
        if (enableCache && cached) {
             console.log('CACHED: ' + cacheName);
            return callback(cached);
        } else {
            console.log('NOOOOT CACHED: ' + cacheName);
            return request.success(function(data) {
                myCache.put(cacheName, data);
                return callback(data);
            }).error(function(error) {
                handleError(error);

            });
        }

    }


    /**
     * Handle errors
     */
    function handleError(error, message) {
        var msg = (message ? message : 'Error handling data from server');
        //$('#main_content').hide();
        $('#respone_container').show();
        $('#respone_container_inner').html('<div class="alert alert-danger alert-dismissable response-message"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <i class="icon-ban-circle"></i> ' + msg + '</div>');
        console.log('Error');
        return;


    }

    /**
     * Post data
     */
    function postData(callback, request) {
        //$('#respone_container').html('Loading').show();
        return request.success(function(data) {
            return callback(data);
        }).error(function(error) {
            handlePostError(error);

        });
    }

    function handlePostError(error, message) {
        var msg = (message ? message : 'Error saving data');
        $('#respone_container').show();
        $('#respone_container_inner').html('<div class="alert alert-danger alert-dismissable response-message"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <i class="icon-ban-circle"></i> ' + msg + '</div>');
        console.log(msg);
        return;


    }

    /**
     * Delete data
     */
    function deleteData(request, target) {
        return request.success(function(data) {
            if (target) {
                console.log(target);
                $(target).fadeOut();
            }
        }).error(function(data, error) {
            handleDeleteError(data, error);
        });
    }

    function handleDeleteError(data, error, message) {
        var msg = (message ? message : 'Error deleting data from server');
        $('#respone_container').show();
        $('#respone_container_inner').html('<div class="alert alert-danger alert-dismissable response-message"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <i class="icon-ban-circle"></i> ' + msg + '</div>');
        console.log(data);
        return;


    }
    
    /**
     * Enable/Disable the cache
     */
    function setCache(enable) {
      enableCache = enable;
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
