/**
 * Angular $q allSettled() implementation
 * 
 * This method is often used in its static form on arrays of promises, in order to execute a number of operations concurrently 
 * and be notified when they all finish, regardless of success or failure.
 * Returns a promise that is fulfilled with an array of promise state snapshots,
 * but only after all the original promises have settled, i.e. become either fulfilled or rejected. 
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