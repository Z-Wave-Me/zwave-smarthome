/**
 * Application factories
 * @author Martin Vach
 */
var myAppFactory = angular.module('myAppFactory', []);

/**
 * Caching the river...
 */
myAppFactory.factory('myCache', function($cacheFactory) {
    return $cacheFactory('myData');
});

/**
 * Main data factory
 */
myAppFactory.factory('dataFactory', function($http, $interval, $window, $filter, $timeout, $q, myCache, cfg) {
    var apiDataInterval;
    var enableCache = true;
    var updatedTime = Math.round(+new Date() / 1000);
    return({
        getApi: getApi,
        deleteApi:deleteApi,
        getRemoteData: getRemoteData,
        getApiData: getApiData, // Deprecated: Remove after getApi implementation
        postApiData: postApiData,
        putApiData: putApiData,
        deleteApiData: deleteApiData,
        localData: localData,
        setCache: setCache,
        runCmd: runCmd,
        getSystemCmd: getSystemCmd,
        updateApiData: updateApiData,
        cancelApiDataInterval: cancelApiDataInterval,
        getLanguageFile: getLanguageFile,
        getZwaveApiData: getZwaveApiData,
        loadZwaveApiData: loadZwaveApiData,
        updateZwaveApiData: updateZwaveApiData,
        runZwaveCmd: runZwaveCmd
    });

    /// --- Public functions --- ///

    /**
     * Gets app local data
     */
    function localData(file, callback) {
        var request = {
            method: "get",
            url: cfg.local_data_url + file
        };
        return getApiHandle(callback, request, file);

    }

    /**
     * API data
     */
    // Get api data
    function getApi(api, params, noCache) {
        // Cached data
         var cacheName = 'cache_' + api + (params || '');
        var cached = myCache.get(cacheName);
       
        if (!noCache && cached) {
            console.log('CACHED: ' + cacheName);
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }
        // NOT Cached data
        console.log('NOT CACHED: ' + cacheName);

        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + (params ? params : '')
                    //cache: noCache || true
        }).then(function(response) {
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response.data);
                return response.data;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }
    
    // Delete api data
    function deleteApi(api, id) {
        return $http({
            method: 'delete',
            url: cfg.server_url + cfg.api[api] + "/" + id
                    //cache: noCache || true
        }).then(function(response) {
            return response.data;
//            if (typeof response.data === 'object') {
//                return response.data;
//            } else {// invalid response
//                return $q.reject(response);
//            }
        }, function(response) {// something went wrong
          return $q.reject(response);
        });
        
    }
    
     /**
     * Get remote data
     */
    // Get
    function getRemoteData(url, noCache) {
        // Cached data
         var cacheName = 'cache_' + url;
        var cached = myCache.get(cacheName);
       
        if (!noCache && cached) {
            console.log('CACHED: ' + cacheName);
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }
        // NOT Cached data
        console.log('NOT CACHED: ' + cacheName);

        return $http({
            method: 'get',
            url: url
                    //cache: noCache || true
        }).then(function(response) {
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response);
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }
    // Get
    function getApiData(api, callback, params, noCache) {
        var cacheName = api + (params || '');
        var request = {
            method: "get",
//            headers: {
//                'Accept-Encoding': 'gzip, deflate',
//                'Allow-compression': 'gz' 
//            },
            url: cfg.server_url + cfg.api[api] + (params ? params : '')
        };
        return getApiHandle(callback, request, cacheName, noCache);
    }

    // Post
    function postApiData(api, data, callback) {
        var request = {
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api[api]
        };
        return storeApiHandle(callback, request);
    }

    // Put
    function putApiData(api, id, data, callback) {
        var request = {
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api[api] + "/" + id
        };
        return storeApiHandle(callback, request);
    }

    // Delete
    function deleteApiData(api, id, target) {
        var request = {
            method: "delete",
            //data: data,
            url: cfg.server_url + cfg.api[api] + "/" + id
        };
        return deleteApiHandle(request, target);
    }

    /**
     * Run api command
     */
    function runCmd(cmd) {
        var request = {
            method: "get",
            url: cfg.server_url + cfg.api_url + "devices/" + cmd
        };
        return $http(request).success(function(data) {
            console.log('SUCCESS:' + cfg.server_url + cfg.api_url + "devices/" + cmd);
        }).error(function(data, status, headers, config, statusText) {
            handleError(data, status, headers, config, statusText);

        });
    }
    
    /**
     * Get system cmd
     */
    function getSystemCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url +  cmd
                    //cache: noCache || true
        }).then(function(response) {
             //return response;
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get updated data from the api collection.
     */
    function  updateApiData(api, callback) {
        var refresh = function() {
            var request = {
                method: "get",
                //url:  cfg.demo_url + api + '.json',
                url: cfg.server_url + cfg.api[api] + '?since=' + updatedTime
            };
            if ($http.pendingRequests.length > 0) {
                addErrorElement();
            }
            $http(request).success(function(data) {
                addTimeTickElement();
                updateTimeTick($filter('hasNode')(data, 'data.updateTime'));
                return callback(data);
            }).error(function(data, status, headers, config, statusText) {
                handleError(data, status, headers, config, statusText);

            });
        };
        apiDataInterval = $interval(refresh, cfg.interval);
    }

    /**
     * Cancel data interval
     */
    function cancelApiDataInterval() {
        if (apiDataInterval) {
            $interval.cancel(apiDataInterval);
            apiDataInterval = undefined;
        }
        return;
    }

    /**
     * Load language file
     */
    function getLanguageFile(callback, lang) {
        var langFile = lang + '.json';
        var request = {
            method: "get",
            url: cfg.lang_dir + langFile
        };
        return getApiHandle(callback, request, langFile);
    }

    /**
     * Load ZwaveApiData 
     */
    function loadZwaveApiData(noCache) {
        // Cached data
         var cacheName = 'cache_zwaveapidata';
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            console.log('CACHED: ' + cacheName);
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }
        // NOT Cached data
        console.log('NOT CACHED: ' + cacheName);
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/0'
        }).then(function(response) {
            if (typeof response.data === 'object') {
                 myCache.put(cacheName, response.data);
                return response.data;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function(response) {
            // something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get ExpertUI data
     */
    function getZwaveApiData(callback) {
        var request = {
            method: "post",
            url: cfg.server_url + cfg.zwave_api_url + 'Data/0'
        };
        return getApiHandle(callback, request);
    }

    /**
     * Get updated data from ExpertUI
     */
    function  updateZwaveApiData(callback) {
        var zTime = Math.round(+new Date() / 1000);
        var refresh = function() {
            var request = {
                method: "post",
                url: cfg.server_url + cfg.zwave_api_url + 'Data/' + zTime
            };

            if ($http.pendingRequests.length > 0) {
                addErrorElement();
            }
            $http(request).success(function(data) {
                zTime = data.updateTime;
                addTimeTickElement();
                updateTimeTick($filter('hasNode')(data, 'data.updateTime'));
                return callback(data);
            }).error(function(data, status, headers, config, statusText) {
                handleError(data, status, headers, config, statusText);

            });
        };
        apiDataInterval = $interval(refresh, cfg.interval);
    }

    /**
     * Run ExpertUI command
     */
    function runZwaveCmd(cmd) {
        var request = {
            method: "get",
            url: cfg.server_url + cfg.zwave_api_url + "Run/" + cmd
        };
        return $http(request).success(function(data) {
            console.log('SUCCESS:' + request.url);
        }).error(function(data, status, headers, config, statusText) {
            handleError(data, status, headers, config, statusText);

        });
    }

    /// --- Private functions --- ///

    /**
     * Api handle
     */
    // GET
    function getApiHandle(callback, request, cacheName, noCache) {
        var cached = null;
        if (!noCache) {
            cached = myCache.get(cacheName);
        }
        // Cached data
        if (enableCache && cached) {
            console.log('CACHED: ' + cacheName);
            return callback(cached);
        } else {
            console.log('NOT CACHED: ' + cacheName);
            if ($http.pendingRequests.length > 0) {
                addErrorElement();
            }
            return $http(request).success(function(data) {
                addTimeTickElement();
                updateTimeTick($filter('hasNode')(data, 'data.updateTime'));
                myCache.put(cacheName, data);
                return callback(data);
            }).error(function(data, status, headers, config, statusText) {
                handleError(data, status, headers, config, statusText);

            });
        }

    }
    // POST/PUT
    function storeApiHandle(callback, request) {
        //$('#respone_container').html('Loading').show();
        return $http(request).success(function(data) {
            return callback(data);
        }).error(function(data, status, headers, config, statusText) {
            handlePostError(data, status, headers, config, statusText);

        });
    }

    // Delete
    function deleteApiHandle(request, target) {
        return $http(request).success(function(data) {
            if (target) {
                $(target).fadeOut();
            }
        }).error(function(data, status, headers, config, statusText) {
            handleDeleteError(data, status, headers, config, statusText);
        });
    }


    /**
     * Handle errors
     */
    function handleError(data, status, headers, config, statusText) {
        var msg = 'Can`t receive data from the remote server';
        addErrorElement();
        return;


    }

    function handlePostError(data, status, headers, config, statusText) {
        var msg = 'Can`t store data in the remote server';
        $window.alert(msg);
        console.log(config);
        return;


    }

    function handleDeleteError(data, status, headers, config, statusText) {
        var msg = 'Can`t delete data from the remote server';
        $window.alert(msg);
        console.log(config);
        return;


    }

    /**
     * Enable/Disable the cache
     */
    function setCache(enable) {
        enableCache = enable;
        return;
    }
    /**
     * Add add error element
     */
    function addErrorElement() {
        $('.navi-time').html('<i class="fa fa-minus-circle fa-lg text-danger"></i>');
    }
    /**
     * Add spinner
     */
    function addSpinnerElement() {
        $('.navi-time').html('<i class="fa fa-spinner fa-spin"></i>');
    }

    /**
     * Add time tick
     */
    function addTimeTickElement() {
        $('.navi-time').html('<i class="fa fa-clock-o"></i> <span id="update_time_tick"></span>');
    }

    /**
     * Update time tick
     */
    function updateTimeTick(time) {
        time = (time || Math.round(+new Date() / 1000));
        updatedTime = time;
        $('#update_time_tick').html($filter('getCurrentTime')(time));
    }

});

