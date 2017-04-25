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
        find: {}
    };
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load rss feeds
     */
    $scope.loadRss = function () {
        dataFactory.getApi('modules').then(function (response) {

        }, function (error) {});
    };
    $scope.loadRss();
});

