/**
 * @overview The uncategorized controllers.
 * @author Martin Vach
 */

/**
* The controller that handles 404 Not found response.
* @class Error404Controller
*/
myAppController.controller('Error404Controller', function($scope, cfg) {
    angular.extend(cfg.route.fatalError, {
        message: cfg.route.t['error_404'],
        hide: true
    });

});


/**
 * For testing purpose.
 * @class TestController
 */
myAppController.controller('TestController', function($scope, $window) {
$scope.referrer = $window.document.referrer;
    console.log('$referrer',$scope.referrer);

});

