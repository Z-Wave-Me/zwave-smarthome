/**
 * @overview Angular module httpLatency simulates Latency for AngularJS $http Calls with Response Interceptorsy.
 */

'use strict';
/**
 * Simulates Latency for AngularJS $http Calls with Response Interceptorsy.
 * Source: http://blog.brillskills.com/2013/05/simulating-latency-for-angularjs-http-calls-with-response-interceptors/
 * @method httpLatency
 */

angular.module('httpLatency', [], function($httpProvider,cfg) {

    var handlerFactory = function($q, $timeout) {
        console.log(cfg)
        return function(promise) {
            return promise.then(function(response) {
                return $timeout(function() {
                    return response;
                }, cfg.latency_timeout);
            }, function(response) {
                return $q.reject(response);
            });
        };
    }
    if(cfg.latency_timeout > 0){
        $httpProvider.responseInterceptors.push(handlerFactory);
    }

});