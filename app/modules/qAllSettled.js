/**
 * Angular $q allSettled() implementation
 */
'use strict';

angular.module('qAllSettled', []).config(function($provide) {
  $provide.decorator('$q', function($delegate) {
    var $q = $delegate;
     $q.allSettled = function(promises) {
        var wrappedPromises = angular.isArray(promises) ? promises.slice(0) : {};
        angular.forEach(promises, function(promise, index){
          wrappedPromises[index] = promise.then(function(value){
            return { state: 'fulfilled', value: value };
          }, function(reason){
            return { state: 'rejected', reason: reason };
          });
        });
        return $q.all(wrappedPromises);
      };
    return $q;
  });
});