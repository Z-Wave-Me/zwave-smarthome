/**
 * @overview Angular factories that handle cache, Underscore and HTTP requests.
 * @author Martin Vach
 */

// Angular module
var myAppFactory = angular.module('myAppFactory', []);

/**
 * The factory that handles angular $cacheFactory
 * @class myCache
 */
myAppFactory.factory('myCache', function ($cacheFactory) {
    return $cacheFactory('myData');
});

/**
 * The factory that handles the Underscore library
 * @class Underscore
 */
myAppFactory.factory('_', function () {
    return window._; // assumes underscore has already been loaded on the page
});

/**
 * The factory that handles all local and remote HTTP requests
 * @class dataFactory
 */
myAppFactory.factory('dataFactory', function ($http, $filter, $q, myCache, $interval,dataService, cfg, _) {
    var updatedTime = 0;
    var lang = cfg.lang;
    var ZWAYSession = dataService.getZWAYSession();
    var user = dataService.getUser();
    if (user) {
        lang = user.lang;
    }
    var pingInterval = null;
    return({
         pingServer: pingServer,
        logInApi: logInApi,
        sessionApi: sessionApi,
        getApiLocal: getApiLocal,
        runJs: runJs,
        getApi: getApi,
        deleteApi: deleteApi,
        deleteApiFormdata: deleteApiFormdata,
        deleteApiJSON: deleteApiJSON,
        postApi: postApi,
        putApi: putApi,
        putApiWithHeaders: putApiWithHeaders,
        putApiFormdata: putApiFormdata,
        storeApi: storeApi,
        runApiCmd: runApiCmd,
        getRemoteData: getRemoteData,
        refreshApi: refreshApi,
        runExpertCmd: runExpertCmd,
        xmlToJson: xmlToJson,
        uploadApiFile: uploadApiFile,
        putCfgXml: putCfgXml,
        refreshZwaveApiData: refreshZwaveApiData,
        getSystemCmd: getSystemCmd,
        getLanguageFile: getLanguageFile,
        loadZwaveApiData: loadZwaveApiData,
        joinedZwaveData: joinedZwaveData,
        runZwaveCmd: runZwaveCmd,
        loadEnoceanApiData: loadEnoceanApiData,
        refreshEnoceanApiData: refreshEnoceanApiData,
        runEnoceanCmd: runEnoceanCmd,
        getLicense: getLicense,
        zmeCapabilities: zmeCapabilities,
        postReport: postReport,
        postToRemote: postToRemote,
        getOnlineModules: getOnlineModules,
        installOnlineModule: installOnlineModule,
        restoreFromBck: restoreFromBck,
        getHelp: getHelp,
        getAppBuiltInfo: getAppBuiltInfo
    });

    /// --- Public functions --- ///

    /**
     * Connect to the specified url
     * @param {string} url
     * @returns {unresolved}
     */
    function pingServer(url) {
         return $http({
            method: "get",
            timeout: cfg.pending_timeout_limit,
            cancel:  $q.defer(),
            url: url,
            headers: {
                'isZWAY': true
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            //return response;
            return $q.reject(response);
        });
    }

    /**
     * Remove cookies from several paths
     * @param {string} name
     * @param {array} paths
     */
    function expireAllCookies(name, paths) {
        var expires = new Date(0).toUTCString();

        // expire null-path cookies as well
        document.cookie = name + '=; expires=' + expires;

        for (var i = 0, l = paths.length; i < l; i++) {
            document.cookie = name + '=; path=' + paths[i] + '; expires=' + expires;
        }
    }

    /**
     * Remove all cookies from this path and upper
     * @param {string} name
     */
    function expireActiveCookies(name) {
        var pathname = location.pathname.replace(/\/$/, ''),
            segments = pathname.split('/'),
            paths = [];

        for (var i = 0, l = segments.length, path; i < l; i++) {
            path = segments.slice(0, i + 1).join('/');

            paths.push(path);       // as file
            paths.push(path + '/'); // as directory
        }

        expireAllCookies(name, paths);
    }

    /**
     * Handles login process
     * @param {object} data
     * @returns {unresolved}
     */
    function logInApi(data) {
        // remove ZWAYSession just before login not to confuse the server
        expireActiveCookies("ZWAYSession");
        
        return $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api['login']
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            //return response;
            return $q.reject(response);
        });
    }

    /**
     * Get Z-Wave session
     * @returns {unresolved}
     */
    function sessionApi() {
        return $http({
            method: "get",
            url: cfg.server_url + cfg.api['session']
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            //return response;
            return $q.reject(response);
        });
    }

    /**
     * Get local data from the storage directory
     * @param {string} file
     * @returns {unresolved}
     */
    function getApiLocal(file) {
        // Cached data
        var cached = myCache.get(file);
        if (cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.local_data_url + file
        }).then(function (response) {
            if (typeof response.data === 'object') {
                myCache.put(file, response);
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }

    /**
     * Run zway JS
     * @param {string} param
     * @returns {unresolved}
     */
    function runJs(params) {
      return $http({
         method: "get",
         url: cfg.server_url + cfg.zwave_jsrun_url + params,
         headers: {
          'Accept-Language': lang,
          'ZWAYSession': ZWAYSession
         }
     }).then(function (response) {
         return response;
     }, function (response) {// something went wrong
         //return response;
         return $q.reject(response);
     });
 }

    /**
     * Get ZAutomation api data
     * @param {string} api
     * @param {string} params
     * @param {boolean} noCache
     * @param {boolean} fatalError
     * @returns {unresolved}
     */
    function getApi(api, params, noCache, fatalError) {
        // Cached data
        var cacheName = api + (params || '');
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession,
                'isZWAY': true
                        //'Accept-Encoding': 'gzip, deflate',
                        //'Allow-compression': 'gz' 
            }
        }).then(function (response) {
            if (!angular.isDefined(response.data)) {
                return $q.reject(response);
            }
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response);
                return response;
            } else {// invalid response
                return $q.reject(response);
            }

        }, function (response) {// something went wrong
            if (_.isObject(fatalError)) {
                angular.extend(cfg.route.alert, fatalError);
                //response.fatalError = fatalError;
            }
            return $q.reject(response);
        });
    }
   /**
    * Post ZAutomation api data
    * @param {string} api
    * @param {object} data
    * @param {string} params
    * @returns {unresolved}
    */
    function postApi(api, data, params) {
        return $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Put ZAutomation api data
     * @param {string} api
     * @param {int} id
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function putApi(api, id, data, params) {
        return $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api[api] + (id ? '/' + id : '') + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }
    /**
     * Put ZAutomation api data with predefined HTTP headers
     * @param {string} api
     * @param {int} id
     * @param {object} data
     * @param {object} headers
     * @param {string} params
     * @returns {unresolved}
     */
    function putApiWithHeaders(api, id, data, headers, params) {
        return $http({
            method: "put",
            data: data,
            url: cfg.server_url + cfg.api[api] + (id ? '/' + id : '') + (params ? params : ''),
            headers: headers
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }
    /**
     * Put ZAutomation api data with x-www-form-urlencoded header
     * @param {string} api
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function putApiFormdata(api, data, params) {
        return $http({
            method: "put",
            data: $.param(data),
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }

    /**
     * Put or Post ZAutomation api data - depends on id
     * @param {string} api
     * @param {int} id
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function storeApi(api, id, data, params) {
        return $http({
            method: id ? 'put' : 'post',
            data: data,
            url: cfg.server_url + cfg.api[api] + (id ? '/' + id : '') + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }

    /**
     * Delete ZAutomation api data
     * @param {string} api
     * @param {int} id
     * @param {string} params
     * @returns {unresolved}
     */
    function deleteApi(api, id, params) {
        return $http({
            method: 'delete',
            url: cfg.server_url + cfg.api[api] + "/" + id + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Delete ZAutomation api data with x-www-form-urlencoded header
     * @param {string} api
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function deleteApiFormdata(api, data, params) {
        return $http({
            method: 'delete',
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });

    }
    
    /**
     * Delete ZAutomation api data with JSON
     * @param {string} api
     * @param {object} data
     * @param {string} params
     * @returns {unresolved}
     */
    function deleteApiJSON(api, data, params) {
        return $http({
            method: 'delete',
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Get ZAutomation api command
     * @param {string} cmd
     * @returns {unresolved}
     */
    function runApiCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api_url + "devices/" + cmd,
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (response.data.code == 200) {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post ZWaveAPI run command
     * @param {type} param
     * @returns {unresolved}
     */
    function runExpertCmd(param) {
        return $http({
            method: 'post',
            url: cfg.server_url + cfg.zwaveapi_run_url + param
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });

    }

    /**
     * Get XML from url and convert it to JSON
     * @param {string} url
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function xmlToJson(url, noCache) {
        // Cached data
        var cacheName = 'cache_' + url;
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        // NOT Cached data
        return $http({
            timeout: cfg.pending_remote_limit,
            suppressFtalError:true,
            method: 'get',
            url: url
        }).then(function (response) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(response.data);
            if (json) {
                myCache.put(cacheName, json);
                return json;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Put XML configuration file into Configuration.xml
     * @param {xml} data
     * @returns {unresolved}
     */
    function putCfgXml(data) {
        return $http({
            method: "POST",
            url: cfg.server_url + cfg.cfg_xml_url,
            data: data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong

            return $q.reject(response);
        });
    }


    /**
     * Get data from the remote resource
     * @param {string} url
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function getRemoteData(url, noCache) {
        // Cached data
        var cacheName = 'cache_' + url;
        var cached = myCache.get(cacheName);

        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        // NOT Cached data
        return $http({
            method: 'get',
            timeout: cfg.pending_remote_limit,
            isRemote:true,
            url: url
                    /*headers: {
                     'Accept-Language': lang
                     }*/
        }).then(function (response) {
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response);
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (error) {// something went wrong

            return $q.reject(error);
        });
    }

    /**
     * Get data from the ZAutomation api and update it
     * @param {string} api
     * @param {string} params
     * @returns {unresolved}
     */
    function refreshApi(api, params, updateTime) {
        if(updateTime || typeof updateTime !== 'undefined') {
            updatedTime = updateTime;
        }
        if(_.findWhere($http.pendingRequests,{failWait: api})){
            return $q.reject('Pending');
        }
        // Time in notifications is in miliseconds
         if (api === 'notifications' && updatedTime.toString().length === 10) {
            updatedTime = updatedTime * 1000;
        }

        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + '?since=' + updatedTime + (params ? params : ''),
            failWait:api,
            timeout: cfg.pending_timeout_limit,
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession,
                'isZWAY': true
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response.data, 'data.updateTime') || $filter('hasNode')(response.data, 'updateTime') || Math.round(+new Date() / 1000));
                
                var timestamp = (response.data.data.updateTime || response.data.updateTime || 0) + ((cfg.route.time.timeZoneOffset * -1) * 3600);
                cfg.route.time.timestamp = (timestamp);
                cfg.route.time.string = $filter('setTimeFromBox')(timestamp);
                cfg.route.time.timeUpdating = true;
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Upload a file to ZAutomation
     * @param {type} cmd
     * @param {type} data
     * @returns {unresolved}
     */
    function uploadApiFile(cmd, data) {
        var uploadUrl = cfg.server_url + cmd;
        return  $http.post(uploadUrl, data, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }

    /**
     * Get ZAutomation api system command
     * @param {string} cmd
     * @returns {unresolved}
     */
    function getSystemCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + cmd,
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get a file with language keys values from the app/lang directory
     * @param {string} lang
     * @returns {unresolved}
     */
    function getLanguageFile(lang) {
        var langFile = lang + '.json';
        var cached = myCache.get(langFile);

        if (cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.lang_dir + langFile
        }).then(function (response) {
            if (typeof response.data === 'object') {
                myCache.put(langFile, response);
                return response;
            } else {
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

     


    /**
     * Get data holder from ZWaveAPI api
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function loadZwaveApiData(noCache) {
        var deferred = $q.defer();
        var cacheName = 'cache_zwaveapidata';
        var cached = myCache.get(cacheName);

        // Cached data
        if (!noCache && cached) {
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/0',
            headers: {'ZWAYSession': ZWAYSession}
        }).then(function (response) {
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response.data);
                return response.data;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            if(response.status !== 403){
                angular.extend(cfg.route.alert, {
                    message: cfg.route.t['error_zwave_network'],
                    info: cfg.route.t['how_to_resolve_zwave_errors'],
                    hide: false,
                    permanent: true
                });
            }

            return $q.reject(response);
        });
    }

    /**
     * Get updated data holder from the ZAutomation
     * @returns {unresolved}
     */
    function refreshZwaveApiData() {
        var cacheName = 'refresh_zwaveapidata';
        if(_.findWhere($http.pendingRequests,{failWait: cacheName})){
            return $q.reject('Pending');
        }
        return $http({
            method: 'get',
            failWait: cacheName,
            url: cfg.server_url + cfg.zwave_api_url + 'Data/' + updatedTime
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || $filter('hasNode')(response, 'updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Get updated ZAutomation data and join it to ZAutomation data holder
     * @param {object} ZWaveAPIData
     * @returns {unresolved}
     */
    function  joinedZwaveData(ZWaveAPIData) {
        var time = Math.round(+new Date() / 1000);
        var cacheName = 'cache_zwaveapidata';
        var apiData = myCache.get(cacheName) || ZWaveAPIData;
        //console.log(apiData)
        var result = {};
        return $http({
            method: 'post',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/' + updatedTime
        }).then(function (response) {
            if (typeof response.data === 'object' && apiData) {
                time = response.data.updateTime;
                angular.forEach(response.data, function (obj, path) {
                    if (!angular.isString(path)) {
                        return;
                    }
                    var pobj = apiData;
//                    if(pobj){
//                        return;
//                    }
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
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || $filter('hasNode')(response, 'updateTime') || Math.round(+new Date() / 1000));
                myCache.put(cacheName, apiData);
                return response;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get Zwave api command
     * @param {string} cmd
     * @returns {unresolved}
     */
    function runZwaveCmd(cmd) {
        if(_.findWhere($http.pendingRequests,{failWait: cmd})){
            return $q.reject('Pending');
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + "Run/" + cmd,
            failWait: cmd
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Get EnOcean data holder from the EnOceanAPI
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function loadEnoceanApiData(noCache) {
        // Cached data
        var cacheName = 'cache_enocean_data';
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_data_url + 0
        }).then(function (response) {
            //return response;
            if (typeof response === 'object') {
                myCache.put(cacheName, response);
                return response;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }
    /**
     * Get EnOcean command from the EnOceanAPI Run
     * @param {string} cmd
     * @returns {unresolved}
     */
    function runEnoceanCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_run_url + cmd
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Get updated Enocean data from the EnOceanAPI
     * @returns {unresolved}
     */
    function refreshEnoceanApiData() {
        //console.log('?since=' + updatedTime)
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_data_url + updatedTime
                    /*headers: {
                     'Accept-Language': lang,
                     'ZWAYSession': ZWAYSession
                     }*/
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response.data, 'data.updateTime') || $filter('hasNode')(response.data, 'updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post licence data from the remote server
     * @param {object} data
     * @returns {unresolved}
     */
    function getLicense(data) {
        return $http({
            method: 'post',
            url: cfg.license_url,
            data: $.param(data),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            if (response.data.license.length > 1) {
                return response.data.license;
            } else {
                // invalid response
                return $q.reject(response);
            }
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post ZME Capabilities
     * @param {object} data
     * @returns {unresolved}
     */
    function zmeCapabilities(data) {
//        return $q.reject(data); // Test error response
//        var deferred = $q.defer();
//        deferred.resolve(data);
//        return deferred.promise;// Test success response

        return $http({
            method: 'POST',
            url: cfg.server_url + cfg.license_load_url,
            data: $.param({license: data.toString()}),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function (response) {
            return response;
        }, function (response) {
            // something went wrong
            return $q.reject(response);
        });

    }
    /**
     * Post a bug report on the remote server
     * @param {object} data
     * @returns {unresolved}
     */
    function postReport(data) {
        return $http({
            method: "POST",
            url: cfg.post_report_url,
            data: $.param(data),
            timeout: cfg.pending_remote_limit,
            isRemote:true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
                        //'ZWAYSession': ZWAYSession 
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Post on the remote server
     * @param {string} url
     * @param {object} data
     * @returns {unresolved}
     */
    function postToRemote(url, data) {
        return $http({
            method: "POST",
            url: url,
            data: $.param(data),
            timeout: cfg.pending_remote_limit,
            isRemote:true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
                        //'ZWAYSession': ZWAYSession 
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Load On-line modules from the remote server
     * @param {object} data
     * @param {boolean} noCache
     * @returns {unresolved}
     */
    function getOnlineModules(data, noCache) {
        // Cached data
        var cacheName = 'cache_' + cfg.online_module_url;
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        var canceller = $q.defer();
        // NOT Cached data
        return $http({
            method: 'post',
            url: cfg.online_module_url,
            data: $.param(data),
            isRemote:true,
            timeout:cfg.pending_remote_limit,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                myCache.put(cacheName, response);
                return response;
            } else {// invalid response
                return $q.reject(response);
            }

            //return response;
        }, function (error) {// something went wrong

            return $q.reject(error);
        });
    }

    /**
     * Install a module from the remote server
     * @param {object} data
     * @param {string} api
     * @returns {unresolved}
     */
    function installOnlineModule(data, api) {
        return $http({
            method: "POST",
            url: cfg.server_url + cfg.api[api],
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Resore the system from the backup file
     * @param {object} data
     * @returns {unresolved}
     */
    function restoreFromBck(data) {
        var uploadUrl = cfg.server_url + cfg.api['restore'];
        return  $http.post(uploadUrl, data, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }


    /**
     * Load a help page from the storage directory
     * @param {string} file
     * @returns {unresolved}
     */
    function getHelp(file) {
        return $http({
            method: 'get',
            url: cfg.help_data_url + file
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }

    /**
     * Get app built info
     * @returns {unresolved}
     */
    function getAppBuiltInfo() {
        return $http({
            method: 'get',
            url: cfg.api['app_built_info']
        }).then(function (response) {
            if (typeof response.data === 'object') {
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });

    }
});

