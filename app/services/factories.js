/**
 * Application factories
 * @author Martin Vach
 */
var myAppFactory = angular.module('myAppFactory', []);

/**
 * Caching the river...
 */
myAppFactory.factory('myCache', function ($cacheFactory) {
    return $cacheFactory('myData');
});
/**
 * Underscore
 */
myAppFactory.factory('_', function () {
    return window._; // assumes underscore has already been loaded on the page
});

/**
 * Main data factory
 */
myAppFactory.factory('dataFactory', function ($http, $filter, $q, myCache, dataService, cfg, _) {
    var updatedTime = Math.round(+new Date() / 1000);
    var lang = cfg.lang;
    var ZWAYSession = dataService.getZWAYSession();
    var user = dataService.getUser();
    if (user) {
        lang = user.lang;

    }
    return({
        logInApi: logInApi,
        sessionApi: sessionApi,
        getApiLocal: getApiLocal,
        getApi: getApi,
        deleteApi: deleteApi,
        deleteApiFormdata: deleteApiFormdata,
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
        //getJSCmd: getJSCmd,
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
        getHelp: getHelp
    });

    /// --- Public functions --- ///

    // Post api data
    function logInApi(data) {
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

    // Get api data
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
     * Gets api local data
     */
    function getApiLocal(file) {
        return $http({
            method: 'get',
            url: cfg.local_data_url + file
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
     * API data
     */
    // Get api data
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
                'ZWAYSession': ZWAYSession
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
                angular.extend(cfg.route.fatalError, fatalError);
                //response.fatalError = fatalError;
            }
            return $q.reject(response);
        });
    }
    // Post api data
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

    // Put api data
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
    // Put api data
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
    // Put api data as form data
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

    // POST/PUT api data
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

    // Delete api data
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

    // Delete api data as form data
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
     * Run api command
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

    // Run expert cmd
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
     * Get config XML file
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
     * Put config XML file
     */
    function putCfgXml(data) {
        return $http({
            method: "PUT",
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
     * Get api js command
     */
//    function getJSCmd(cmd) {
//        return $http({
//            method: 'get',
//            url: cfg.server_url + cfg.zwave_jsrun_url + cmd
//        }).then(function(response) {
//            //return response;
//            if (typeof response.data === 'string') {
//                return response;
//            } else {// invalid response
//                return $q.reject(response);
//            }
//        }, function(response) {// something went wrong
//            return $q.reject(response);
//        });
//    }


    /**
     * Get remote data
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
            url: url
                    /*headers: {
                     'Accept-Language': lang
                     }*/
        }).then(function (response) {
            return response;
        }, function (error) {// something went wrong

            return $q.reject(error);
        });
    }

    // Refresh api data
    function refreshApi(api, params) {
        //console.log('?since=' + updatedTime)
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.api[api] + '?since=' + updatedTime + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response.data, 'data.updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
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
     * Get system cmd
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
     * Load language file
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
     * Load ZwaveApiData 
     */
    function loadZwaveApiData(noCache, fatalError) {
        // Cached data
        var cacheName = 'cache_zwaveapidata';
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
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
            angular.extend(cfg.route.fatalError, {
                message: cfg.route.t['error_zwave_network'],
                info: cfg.route.t['how_to_resolve_zwave_errors'],
                hide: false,
                permanent: true
            });
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
        }).then(function (response) {
            if (typeof response.data === 'object') {
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || Math.round(+new Date() / 1000));
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
     * Get updated data and join with ZwaveData
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
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || Math.round(+new Date() / 1000));
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
     * Run ExpertUI command
     */
    function runZwaveCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.zwave_api_url + "Run/" + cmd
        }).then(function (response) {
            return response;
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }


    /**
     * Load EnOcean api data (holder)
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
     * Run Enocean command
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

    // Refresh Enocean data holder
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
                updatedTime = ($filter('hasNode')(response.data, 'data.updateTime') || Math.round(+new Date() / 1000));
                return response;
            } else {// invalid response
                return $q.reject(response);
            }
        }, function (response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Get license key
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
     * Set ZME Capabilities
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
     * Post report data
     */
    function postReport(data) {
        return $http({
            method: "POST",
            url: cfg.post_report_url,
            data: $.param(data),
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
     * Post on remote server
     */
    function postToRemote(url, data) {
        return $http({
            method: "POST",
            url: url,
            data: $.param(data),
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
     * Get online modules
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
        // NOT Cached data
        return $http({
            method: 'post',
            url: cfg.online_module_url,
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Language': lang
            }
        }).then(function (response) {
            return response;
        }, function (error) {// something went wrong

            return $q.reject(error);
        });
    }

    /**
     * Install online module
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
     * Restore from backup
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
     * Get help file
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
});

