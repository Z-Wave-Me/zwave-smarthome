/**
 * @overview Controllers that handle all Camera actions – manage and add camera.
 * @author Martin Vach
 */

/**
 * The controller that handles RSS feeds.
 * @class CameraAddController
 */
myAppController.controller('RssController', function ($scope, dataFactory, dataService, _) {
    $scope.rss = {
        all: {},
        find: {},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load rss feeds
     */
    $scope.loadRss = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApiLocal('rss.json').then(function (response) {
            if(_.size(response.data) < 1){
                $scope.rss.alert = {message: $scope._t('no_news'), status: 'alert-warning', icon: 'fa-exclamation-circle'};
                return;
            }

            $scope.rss.all = response.data;
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
            //$scope.rss.alert = {message: $scope._t('no_internet_connection'), status: 'alert-warning', icon: 'fa-wifi'};
        }).finally(function() {// Always execute this on both error and success
            $scope.loading = false;
        });
    };
    $scope.loadRss();

    /**
     * Read a rss feed
     */
    $scope.readRss = function (v,modal,$event) {
        var findIndex = _.findIndex($scope.rss.all, {id: v.id});
        if(findIndex === -1){
           return;

        }
        angular.extend($scope.rss.all[findIndex],{read: true});
        $scope.rss.find = v;
        $scope.handleModal(modal, $event);
       console.log($scope.rss.find)
    };
});

