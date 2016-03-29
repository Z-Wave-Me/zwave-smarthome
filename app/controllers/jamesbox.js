/**
 * Application jamesBox controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('JamesBoxUpdateController', function ($scope, $q, $cookies, dataFactory, _) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            active: $scope.cfg.skin.active,
            show: false
        },
        online: {
            all: {},
            find: {},
            ids: {},
            show: false
        },
        installed: {
            all: {}
        }
    };

});