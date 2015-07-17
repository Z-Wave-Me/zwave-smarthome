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
myAppFactory.factory('dataFactory', function($http, $filter, $q, myCache, dataService, cfg) {
    var updatedTime = Math.round(+new Date() / 1000);
    var lang = cfg.lang;
    var ZWAYSession = dataService.getZWAYSession();
    var user = dataService.getUser();
    if (user) {
        lang = user.lang;

    }
    return({
        logInApi: logInApi,
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
        //getJSCmd: getJSCmd,
        refreshZwaveApiData: refreshZwaveApiData,
        getSystemCmd: getSystemCmd,
        getLanguageFile: getLanguageFile,
        loadZwaveApiData: loadZwaveApiData,
        joinedZwaveData: joinedZwaveData,
        runZwaveCmd: runZwaveCmd,
        loadEnoceanDevices: loadEnoceanDevices,
        runEnoceanCmd: runEnoceanCmd,
        dataEnoceanCmd: dataEnoceanCmd,
        refreshEnoceanDevices: refreshEnoceanDevices,
        getLicense: getLicense,
        zmeCapabilities: zmeCapabilities,
        postReport: postReport,
        installOnlineModule: installOnlineModule,
        restoreFromBck: restoreFromBck
    });

    /// --- Public functions --- ///

    // Post api data
    function logInApi(data) {
        return $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api['login']
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
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
        }).then(function(response) {
            if (!angular.isDefined(response.data)) {
                return $q.reject(response);
            }
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
    function postApi(api, data, params) {
        return $http({
            method: "post",
            data: data,
            url: cfg.server_url + cfg.api[api] + (params ? params : ''),
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
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
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong

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
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong

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
            url: cfg.server_url + cfg.api_url + "devices/" + cmd,
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
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
            deferred.resolve(cached);
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
    // Get
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
            url: url,
            headers: {
                'Accept-Language': lang
            }
        }).then(function(response) {
            return response;
        }, function(error) {// something went wrong

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
            headers: {
                'Content-Type': undefined,
                'ZWAYSession': ZWAYSession
            }
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
            url: cfg.server_url + cfg.zwave_api_url + cmd,
            headers: {
                'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
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
        }).then(function(response) {
            if (typeof response.data === 'object') {
                myCache.put(langFile, response);
                return response;
            } else {
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
            deferred.resolve(cached);
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
    function  joinedZwaveData(ZWaveAPIData) {
        var time = Math.round(+new Date() / 1000);
        var cacheName = 'cache_zwaveapidata';
        var apiData = myCache.get(cacheName) || ZWaveAPIData;
        //console.log(apiData)
        var result = {};
        return $http({
            method: 'post',
            url: cfg.server_url + cfg.zwave_api_url + 'Data/' + updatedTime
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
                updatedTime = ($filter('hasNode')(response, 'data.updateTime') || Math.round(+new Date() / 1000));
                myCache.put(cacheName, apiData);
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

    //getEnoceanData: getEnoceanData,
    //runEnoceanCmd: runEnoceanCmd,

    /**
     * Load Enocean devices 
     */
    function loadEnoceanDevices(noCache) {
        // Cached data
        var cacheName = 'cache_enocean';
        var cached = myCache.get(cacheName);
        if (!noCache && cached) {
            var deferred = $q.defer();
            deferred.resolve(cached);
            return deferred.promise;
        }
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_run_url + 'devices'
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
     * Run Enocean command
     */
    function runEnoceanCmd(cmd) {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_run_url + cmd
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    /**
     * Data Enocean command
     */
    function dataEnoceanCmd() {
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_data_url
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
    }

    // Refresh Enocean devices 
    function refreshEnoceanDevices() {
        //console.log('?since=' + updatedTime)
        return $http({
            method: 'get',
            url: cfg.server_url + cfg.enocean_run_url + 'data(' + updatedTime + ')',
            /*headers: {
             'Accept-Language': lang,
             'ZWAYSession': ZWAYSession
             }*/
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
        }).then(function(response) {
            if (response.data.license.length > 1) {
                return response.data.license;
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
        }).then(function(response) {
            return response;
        }, function(response) {
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
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
        return;
    }
    
    /**
     * Install online module
     */
    function installOnlineModule(data) {
        return $http({
            method: "POST",
             url: cfg.server_url + cfg.api['online_install'],
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                 'Accept-Language': lang,
                'ZWAYSession': ZWAYSession
            }
        }).then(function(response) {
            return response;
        }, function(response) {// something went wrong
            return $q.reject(response);
        });
        return;
    }

    /**
     * Restore from backup
     */
    function restoreFromBck(data,chip) {
        var uploadUrl = cfg.server_url + cfg.zwave_api_url + 'Restore?restore_chip_info=' + chip;
        return  $http.post(uploadUrl, data, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function(response) {
            if (response.data && response.data.replace(/(<([^>]+)>)/ig, "") === "null") {
                return response;
            }else {//Error
                 return $q.reject(response);
            }
        }, function(response) {// something went wrong
            return $q.reject(response);
        });

    }
});

