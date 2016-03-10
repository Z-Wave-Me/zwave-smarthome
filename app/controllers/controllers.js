/**
 * Application controllers
 * @author Martin Vach
 */

/**
 * Not found controller
 */
myAppController.controller('404Controller', function($scope, cfg) {
    angular.extend(cfg.route.fatalError, {
        message: $scope._t('error_404'),
        hide: true
    });

});

