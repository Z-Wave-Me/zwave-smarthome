/**
 * @overview The uncategorized controllers.
 * @author Martin Vach
 */

/**
 * The controller that handles 404 Not found response.
 * @class 404Controller
 */
myAppController.controller('404Controller', function($scope, cfg) {
    angular.extend(cfg.route.fatalError, {
        message: $scope._t('error_404'),
        hide: true
    });

});

