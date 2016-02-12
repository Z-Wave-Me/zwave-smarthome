/**
 * Application skins controller
 * @author Martin Vach
 */

/**
 * Skin base controller
 */
myAppController.controller('SkinBaseController', function ($scope, dataFactory, _) {
    $scope.skins = {
        local: {
            all: {},
            find: {},
            ids: {},
            show: false
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

    /**
     * Load z-wave devices
     */
    $scope.loadLocalSkins = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApiLocal('skins.json').then(function (response) {
            $scope.loading = false;
            $scope.skins.local.all = _.chain(response.data.data)
                    .flatten()
                    .filter(function (v) {
                        v.icon = (!v.icon ? 'storage/img/placeholder-img.png' :'storage/skins/' + v.icon );
                        return v;
                    })
                    .value();
            ;
            $scope.skins.local.show = true;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadLocalSkins();

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