/**
 * @overview Controllers that handle all Camera actions – manage and add camera.
 * @author Martin Vach
 */

/**
 * The controller that handles RSS feeds.
 * @class CameraAddController
 */
myAppController.controller('RssController', function ($scope, cfg, dataFactory, dataService, _,myCache) {

    /**
     * Tracking
     */
    $scope.trackingRSS = function () {

        // UUID + FW
        dataFactory.loadZwaveApiData().then(function (ZWaveAPIData) {

            var input = {
            firmware : ZWaveAPIData.controller.data.softwareRevisionVersion.value,
            uuid : ZWaveAPIData.controller.data.uuid.value,
            boxtype : $scope.getCustomCfgArr('boxtype')
            };


            //dataFactory.postToRemote(cfg.api_remote.rss_feed + "/?firmware="+fw+"&uuid="+uuid+"&boxtype="+$scope.getCustomCfgArr('boxtype'), null).then(function () {});
            dataFactory.postToRemote(cfg.api_remote.rss_feed, input).then(function () {});
        });

        
    };

    /**
     * Load rss feeds
     */
    $scope.loadRss = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.xmlToJson(cfg.api_remote.rss_feed + '?boxtype=' + $scope.getCustomCfgArr('boxtype')).then(function (response) {
            var rss = [];
            _.filter(response.rss.channel,function (v,k) {
                    if(k === 'item'){
                        if( _.isArray(v)){
                            rss.push(v);
                        }else{// One item only
                            rss.push([v]);
                        }
                    }
                });
            // Empty rss feed
            if(_.size(rss[0]) < 1){
               angular.extend(cfg.route.alert, {message: $scope._t('no_news'),icon:'fa-exclamation-circle text-primary'});
                return;
            }
            $scope.rss.all = rss[0];

        }, function (error) {
            if(error.status === 0){
              angular.extend(cfg.route.alert, {message: $scope._t('no_internet_connection',{__sec__: (cfg.pending_remote_limit/1000)}),icon: 'fa-wifi'});

            }else{
              angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                
            }
        }).finally(function() {// Always execute this on both error and success
            $scope.loading = false;
        });

        $scope.trackingRSS();

    };
    $scope.loadRss();

    /**
     * Read a rss feed
     */
    $scope.readRss = function (v,modal,$event) {
        $scope.rss.find = v;
        $scope.handleModal(modal, $event);
       if($scope.rss.read.indexOf(v.id) > -1){
           return;
       }
        $scope.rss.read.push(v.id);
        if($scope.rss.unread > 0){
            $scope.rss.unread--;
        }
        var input = {
            rss: {
                unread:  $scope.rss.unread,
                read: $scope.rss.read
            }

        };
        dataFactory.postApi('configupdate_url', input).then(function () {
            myCache.remove('rssinfo');
        });
    };

    

});

