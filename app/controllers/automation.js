/**
 * @overview Controllers that handle automation actions – scenes, rules, schedules.
 * @author Martin Vach
 */

 /**
 * Aoutomation parent controller
 * @class AutomationController
 */
myAppController.controller('AutomationController', function ($scope, $routeParams,cfg, dataFactory, dataService, _,myCache) {
    $scope.automation = {
        cfg:{
            allowedName: ['LightScene','IfThen','ScheduledScene'],
            imgPath:  cfg.server_url + cfg.api_url + 'load/modulemedia/'
        },
        localModules: {},
        instances: {
            all:[],
            state: 'success'
        }
    };

    /**
     * Load local modules
     * @returns {undefined}
     */
    $scope.loadLocalModules = function () {
        dataFactory.getApi('modules').then(function (response) {
            // Get info from module
            _.filter(response.data.data,function(v){
                if($scope.automation.cfg.allowedName.indexOf(v.moduleName) > -1){
                  $scope.automation.localModules[v.moduleName] = {
                     version: v.version,
                     icon:$scope.automation.cfg.imgPath + v.id + '/' + v.icon,
                     singleton: v.singleton,
                     title:v.defaults.title
                 };
                     
                }
 
             });
        });
    };
    $scope.loadLocalModules();

     /**
     * Load instances
     * @returns {undefined}
     */
    $scope.loadInstances = function (moduleId) {
        dataFactory.getApi('instances',null,true).then(function (response) {
             $scope.automation.instances.all = _.where(response.data.data, {moduleId: moduleId});
        }, function (error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    };

     /**
     * Activate instance
     */
    $scope.activateInstance = function (input, activeStatus) {
        input.active = activeStatus;
         if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.loading = false;

            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
            });
        }

    };

    /**
     * Delete instance
     */
    $scope.deleteInstance = function (input, message) {
        alertify.confirm(message, function () {
            dataFactory.deleteApi('instances', input.id).then(function (response) {
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.reloadData();
            }, function (error) {
                alertify.alertError($scope._t('error_delete_data'));
            });

        });
    };

});

/**
 * The controller that handles scenes.
 * @class AutomationSceneController
 */
myAppController.controller('AutomationSceneController', function ($scope, cfg, dataFactory, dataService, _,myCache) {
    $scope.loadInstances('LightScene');

});

/**
* The controller that handles rules.
* @class AutomationRuleController
*/
myAppController.controller('AutomationRuleController', function ($scope, cfg, dataFactory, dataService, _,myCache) {
    $scope.loadInstances('IfThen');
});

/**
* The controller that handles schedules.
* @class AutomationScheduleController
*/
myAppController.controller('AutomationScheduleController', function ($scope, cfg, dataFactory, dataService, _,myCache) {
    $scope.loadInstances('ScheduledScene');
    });

