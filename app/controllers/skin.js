/**
 * Application skins controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('SkinBaseController', function ($scope, dataFactory, dataService) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            ids: {}
        },
        online: {
            all: {},
            find: {},
            ids: {}
        },
        installed: {
            all: {}
        }
    };

});

/**
 * Skin local controller
 */
myAppController.controller('SkinLocalController', function ($scope, dataFactory, dataService) {
    $scope.activeTab = 'local';


});
/**
 * Skin online controller
 */
myAppController.controller('SkinOnlineController', function ($scope, dataFactory, dataService) {
    $scope.activeTab = 'online';
});