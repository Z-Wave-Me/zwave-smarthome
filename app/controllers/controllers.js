/**
 * @overview The uncategorized controllers.
 * @author Martin Vach
 */


/**
 * For testing purpose.
 * @class TestController
 */
myAppController.controller('TestController', function($scope, $window) {
$scope.referrer = $window.document.referrer;
    console.log('$referrer',$scope.referrer);

});

