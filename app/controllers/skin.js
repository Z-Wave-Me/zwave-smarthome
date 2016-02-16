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
            ids: {},
            show: false
        },
        installed: {
            all: {}
        }
    };

    /**
     * Load local skins
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
                    .indexBy('name')
                    .value();
            ;
            $scope.skins.local.show = true;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadLocalSkins();
    
    /**
     * Load online skins
     */
    $scope.loadOnlineSkins = function () {
        dataFactory.getApiLocal('skins-online.json').then(function (response) {
            $scope.skins.online.all = _.chain(response.data.data)
                    .flatten()
                    .filter(function (v) {
                        v.icon = (v.icon == '' ? 'storage/img/placeholder-img.png' :'storage/skins/' + v.icon );
                        return v;
                    })
                    .indexBy('name')
                    .value();
            ;
            $scope.skins.online.show = true;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadOnlineSkins();

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