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
myAppFactory.factory('dataFactory', function($http, $interval, $cookies, $window, $filter, $timeout, $q, myCache, cfg) {
    var updatedTime = Math.round(+new Date() / 1000);
    var lang = (angular.isDefined($cookies.lang) ? $cookies.lang : cfg.lang);
    return({
        getApiLocal: getApiLocal,
        getApi: getApi,
        deleteApi: deleteApi,
        postApi: postApi,
        putApi: putApi,
        storeApi: storeApi,
        runApiCmd: runApiCmd,
        getRemoteData: getRemoteData,
        refreshApi: refreshApi,
        runExpertCmd: runExpertCmd,
        xmlToJson: xmlToJson,
        uploadApiFile: uploadApiFile,
        putCfgXml: putCfgXml,
        getJSCmd: getJSCmd,
        refreshZwaveApiData: refreshZwaveApiData,
        getSystemCmd: getSystemCmd,
        getLanguageFile: getLanguageFile,
        loadZwaveApiData: loadZwaveApiData,
        joinedZwaveData: joinedZwaveData,
        runZwaveCmd: runZwaveCmd
                // Deprecated: Remove after getApi implementation
                //updateZwaveApiData: updateZwaveApiData,
                // getZwaveApiData: getZwaveApiData,
                //cancelApiDataInterval: cancelApiDataInterval,
                // updateApiData: updateApiData,
                //runCmd: runCmd,
                // deleteApiData: deleteApiData,
                // putApiData: putApiData,
                //postApiData: postApiData,
                // getApiData: getApiData,
                //setCache: setCache,
    });

    /// --- Public functions --- ///

    /**
     * Gets api local data
     */
    function getApiLocal(file) {
        return $http({
            method: 'get',
            url: cfg.local_data_url + file
        }).then(function(response) {
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
     * API data
     */
    // Get api data
    function getApi(api, params, noCache) {
        // Cached data
        var cacheName = api + (params || '');
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }

        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Accept-Language': lang
                        //'Accept-Encoding': 'gzip, deflate',
                        //'Allow-compression': 'gz' 
            }
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
    // Post api data
    function postApi(api, data) {
        return $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api[api]
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    // Put api data
    function putApi(api, id, data) {
        return $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api[api] + "/" + id
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong

            return $q.reject(response);
        });
    }

    // POST/PUT api data
    function storeApi(api, id, data) {
        return $http({
            method: id ? 'put' : 'post',
            data: data,
            url: cfg.server_url + cfg.api[api] + (id ? '/' + id : '')
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong

            return $q.reject(response);
        });
    }

    // Delete api data
    function deleteApi(api, id) {
        return $http({
            method: 'delete',
            url: cfg.server_url + cfg.api[api] + "/" + id
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Run api command
     */
    function runApiCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api_url + "devices/" + cmd
                    //cache: noCache || true
        }).then(function(response) {
            if (response.data.code == 200) {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    // Run expert cmd
    function runExpertCmd(param) {
        return $http({
            method: 'post',
            url: cfg.server_url + cfg.zwaveapi_run_url + param
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Get config XML file
     */
    function xmlToJson(url, noCache) {
        // Cached data
        var cacheName = 'cache_' + url;
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }
        // NOT Cached data
        return $http({
            method: 'get',
            url: url
        }).then(function(response) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(response.data);
            if (json) {
                myCache.put(cacheName, json);
                return json;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Put config XML file
     */
    function putCfgXml(data) {
        return $http({
            method: "PUT",
            //dataType: "text", 
            url: cfg.server_url + cfg.cfg_xml_url,
            data: data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong

            return $q.reject(response);
        });
        return;
    }
    /**
     * Get api js command
     */
    function getJSCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_jsrun_url + cmd
                    //cache: noCache || true
        }).then(function(response) {
            //return response;
            if (typeof response.data === 'string') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
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
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }
        // NOT Cached data
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

    // Refresh api data
    function refreshApi(api, params) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + '?since=' + updatedTime + (params ? params : '')
                    //cache: noCache || true
        }).then(function(response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response.data, 'data.updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Upload file
     */
    function uploadApiFile(cmd, data) {
        var uploadUrl = cfg.server_url + cmd;
        return  $http.post(uploadUrl, data, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function(response) {
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
     * Get system cmd
     */
    function getSystemCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + cmd
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
     * Load language file
     */
    function getLanguageFile(lang) {
        var langFile = lang + '.json';
        var cached = myCache.get(langFile);

        if (cached) {
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.lang_dir + langFile
        }).then(function(response) {
            if (typeof response.data === 'object') {
                myCache.put(langFile, response);
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Load ZwaveApiData 
     */
    function loadZwaveApiData(noCache) {
        // Cached data
        var cacheName = 'cache_zwaveapidata';
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached); // <-- Can I do this?
            return deferred.promise;
        }
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
     * Refresh ZwaveApiData 
     */
    function refreshZwaveApiData() {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/' + updatedTime
        }).then(function(response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || Math.round(+new Date() / 1000));
                return response;
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
     * Get updated data and join with ZwaveData
     */
    function  joinedZwaveData() {
        var time = Math.round(+new Date() / 1000);
        var apiData = myCache.get('cache_zwaveapidata');
        var result = {};
        return $http({
            method: 'post',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/' + time
        }).then(function(response) {
            if (typeof response.data === 'object' && apiData) {
                time = response.data.updateTime;
                angular.forEach(response.data, function(obj, path) {
                    if (!angular.isString(path)) {
                        return;
                    }
                    var pobj = apiData;
                    var pe_arr = path.split('.');
                    for (var pe in pe_arr.slice(0, -1)) {
                        pobj = pobj[pe_arr[pe]];
                    }
                    pobj[pe_arr.slice(-1)] = obj;
                });
                result = {
                    "joined": apiData,
                    "update": response.data
                };
                response.data = result;
                return response;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function(response) {
            // something went wrong
            return $q.reject(response);
        });
        return;
    }


    /**
     * Run ExpertUI command
     */
    function runZwaveCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + "Run/" + cmd
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    /// --- DEPRECATED - REMOVE --- ///



    // DEPRECATED
    // Get
//    function getApiData(api, callback, params, noCache) {
//        var cacheName = api + (params || '');
//        var request = {
//            method: "get",
////            headers: {
////                'Accept-Encoding': 'gzip, deflate',
////                'Allow-compression': 'gz' 
////            },
//            url: cfg.server_url + cfg.api[api] + (params ? params : '')
//        };
//        return getApiHandle(callback, request, cacheName, noCache);
//    }

    // DEPRECATED
    // Post
//    function postApiData(api, data, callback) {
//        var request = {
//            method: "post",
//            data: data,
//            url: cfg.server_url + cfg.api[api]
//        };
//        return storeApiHandle(callback, request);
//    }

    // DEPRECATED
    // Put
//    function putApiData(api, id, data, callback) {
//        var request = {
//            method: "put",
//            data: data,
//            url: cfg.server_url + cfg.api[api] + "/" + id
//        };
//        return storeApiHandle(callback, request);
//    }

    //  DEPRECATED
    // Delete
//    function deleteApiData(api, id, target) {
//        var request = {
//            method: "delete",
//            //data: data,
//            url: cfg.server_url + cfg.api[api] + "/" + id
//        };
//        return deleteApiHandle(request, target);
//    }

    /**
     * DEPRECATED
     * Run api command
     */
//    function runCmd(cmd) {
//        var request = {
//            method: "get",
//            url: cfg.server_url + cfg.api_url + "devices/" + cmd
//        };
//        return $http(request).success(function(data) {
//            console.log('SUCCESS:' + cfg.server_url + cfg.api_url + "devices/" + cmd);
//        }).error(function(data, status, headers, config, statusText) {
//            handleError(data, status, headers, config, statusText);
//
//        });
//    }

    /**
     * DEPRECATED
     * Get updated data from the api collection.
     */
//    function  updateApiData(api, callback) {
//        var refresh = function() {
//            var request = {
//                method: "get",
//                //url:  cfg.demo_url + api + '.json',
//                url: cfg.server_url + cfg.api[api] + '?since=' + updatedTime
//            };
//            if ($http.pendingRequests.length > 0) {
//                addErrorElement();
//            }
//            $http(request).success(function(data) {
//                addTimeTickElement();
//                updateTimeTick($filter('hasNode')(data, 'data.updateTime'));
//                return callback(data);
//            }).error(function(data, status, headers, config, statusText) {
//                handleError(data, status, headers, config, statusText);
//
//            });
//        };
//        apiDataInterval = $interval(refresh, cfg.interval);
//    }

    /**
     * DEPRECATED
     * Cancel data interval
     */
//    function cancelApiDataInterval() {
//        if (apiDataInterval) {
//            $interval.cancel(apiDataInterval);
//            apiDataInterval = undefined;
//        }
//        return;
//    }

    /**
     *  DEPRECATED
     * Get ExpertUI data
     */
//    function getZwaveApiData(callback) {
//        var request = {
//            method: "post",
//            url: cfg.server_url + cfg.zwave_api_url + 'Data/0'
//        };
//        return getApiHandle(callback, request);
//    }

    /**
     * DEPRECATED
     * Get updated data from ExpertUI
     */
//    function  updateZwaveApiData(callback) {
//        var zTime = Math.round(+new Date() / 1000);
//        var refresh = function() {
//            var request = {
//                method: "post",
//                url: cfg.server_url + cfg.zwave_api_url + 'Data/' + zTime
//            };
//
//            if ($http.pendingRequests.length > 0) {
//                addErrorElement();
//            }
//            $http(request).success(function(data) {
//                zTime = data.updateTime;
//                addTimeTickElement();
//                updateTimeTick($filter('hasNode')(data, 'data.updateTime'));
//                return callback(data);
//            }).error(function(data, status, headers, config, statusText) {
//                handleError(data, status, headers, config, statusText);
//
//            });
//        };
//        apiDataInterval = $interval(refresh, cfg.interval);
//    }

    /**
     * DEPRECATED
     * Api handle
     */
    // GET
//    function getApiHandle(callback, request, cacheName, noCache) {
//        var cached = null;
//        if (!noCache) {
//            cached = myCache.get(cacheName);
//        }
//        // Cached data
//        if (enableCache && cached) {
//            console.log('CACHED: ' + cacheName);
//            return callback(cached);
//        } else {
//            console.log('NOT CACHED: ' + cacheName);
//            if ($http.pendingRequests.length > 0) {
//                addErrorElement();
//            }
//            return $http(request).success(function(data) {
////                addTimeTickElement();
////                updateTimeTick($filter('hasNode')(data, 'data.updateTime'));
////                myCache.put(cacheName, data);
//                return callback(data);
//            }).error(function(data, status, headers, config, statusText) {
//                handleError(data, status, headers, config, statusText);
//
//            });
//        }
//
//    }
    // DEPRECATED
    // POST/PUT
    // 
//    function storeApiHandle(callback, request) {
//        //$('#respone_container').html('Loading').show();
//        return $http(request).success(function(data) {
//            return callback(data);
//        }).error(function(data, status, headers, config, statusText) {
//            handlePostError(data, status, headers, config, statusText);
//
//        });
//    }

    // DEPRECATED
    // Delete
//    function deleteApiHandle(request, target) {
//        return $http(request).success(function(data) {
//            if (target) {
//                $(target).fadeOut();
//            }
//        }).error(function(data, status, headers, config, statusText) {
//            handleDeleteError(data, status, headers, config, statusText);
//        });
//    }


    /**
     * DEPRECATED
     * Handle errors
     */
//    function handleError(data, status, headers, config, statusText) {
//        var msg = 'Can`t receive data from the remote server';
//        addErrorElement();
//        return;
//
//
//    }

//    function handlePostError(data, status, headers, config, statusText) {
//        var msg = 'Can`t store data in the remote server';
//        $window.alert(msg);
//        console.log(config);
//        return;
//
//
//    }
    //

//    function handleDeleteError(data, status, headers, config, statusText) {
//        var msg = 'Can`t delete data from the remote server';
//        $window.alert(msg);
//        console.log(config);
//        return;
//
//
//    }

    /**
     * DEPRECATED
     * Enable/Disable the cache
     */
//    function setCache(enable) {
//        enableCache = enable;
//        return;
//    }
    /**
     * DEPRECATED
     * Add add error element
     */
//    function addErrorElement() {
//        $('.navi-time').html('<i class="fa fa-minus-circle fa-lg text-danger"></i>');
//    }
    /**
     *  DEPRECATED
     * Add spinner
     */
//    function addSpinnerElement() {
//        $('.navi-time').html('<i class="fa fa-spinner fa-spin"></i>');
//    }

    /**
     * DEPRECATED
     * Add time tick
     */
//    function addTimeTickElement() {
//        $('.navi-time').html('<i class="fa fa-clock-o"></i> <span id="update_time_tick"></span>');
//    }

    /**
     * DEPRECATED
     * Update time tick
     */
//    function updateTimeTick(time) {
//        time = (time || Math.round(+new Date() / 1000));
//        updatedTime = time;
//        $('#update_time_tick').html($filter('getCurrentTime')(time));
//    }
});

