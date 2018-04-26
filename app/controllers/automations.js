/**
 * @ 
 * @author Michael Hensche
 */

/**
 * 
 * @class DummyController
 */
myAppController.controller('AutomationsController', function($scope, $q, $timeout, $location, $filter, dataFactory, cfg) {
    $scope.automations = {
        modules: {},
        instances: {}
    };
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';

    /**
     * Load all promises
     */
    $scope.allSettled = function() {
        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('loading')
        };
        var promises = [
            dataFactory.getApi('modules'),
            dataFactory.getApi('instances')
        ];

        $q.allSettled(promises).then(function(response) {
            $scope.loading = false;
            var modules = response[0];
            var instances = response[1];
            // Error message
            if (modules.state === 'rejected') {
                angular.extend(cfg.route.alert, {
                    message: $scope._t('error_load_data')
                });
                return;
            }

            if (instances.state === 'rejected') {
                angular.extend(cfg.route.alert, {
                    message: $scope._t('error_load_data')
                });
                return;
            }

            // Success - instances
            if (instances.state === 'fulfilled') {
                setInstances(instances.value.data.data);

            }

            // Success - modules
            if (modules.state === 'fulfilled') {
                setModules(modules.value.data.data, $scope.automations.instances);
            }
        });
    };
    $scope.allSettled();


    function setModules(data, instances) {

        $scope.automations.modules = _.chain(data)
            .flatten()
            .filter(function(item) {
                if (cfg.automations.indexOf(item.moduleName) != -1) {
                    switch (item.moduleName) {
                        case "HazardNotification":
                            item.title = $scope._t('hazard_notification');
                            item.image = "app/img/automation/heating.png";
                            item.href = "#hazard";
                            //item.description = item.defaults.description;
                            break;
                        case "Heating":
                            item.title = $scope._t('heating');
                            item.image = "app/img/automation/heating.png";
                            item.href = "#heating";
                            //item.description = item.defaults.description;
                            break;
                        case "Rules":
                            item.title = $scope._t('title_rules');
                            item.image = "app/img/automation/rules.png";
                            item.href = "#rules";
                            //item.description = item.defaults.description;
                            break;
                        case "Scenes":
                            item.title = $scope._t('title_scenes');
                            item.image = "app/img/automation/scenes.png";
                            item.href = "#scenes";
                            //item.description = item.defaults.description;
                            break;
                        case "Schedules":
                            item.title = $scope._t('title_schedules');
                            item.image = "app/img/automation/schedules.png";
                            item.href = "#schedules";
                            //item.description = item.defaults.description; 
                            break;
                            // case "SecurityModule":
                        case "Security":
                            item.title = $scope._t('title_security');
                            item.image = "app/img/automation/security.png";
                            item.href = "#security";
                            //item.description = item.defaults.description;
                            break;
                    }

                    // Has already instance ?
                    var hasInstance = _.find(instances, function(inst) {
                        return inst.moduleId == item.moduleName;
                    });
                    item.hasInstance = hasInstance ? true : false;
                    // Prevent instalation for singelton item with instance
                    item.preventInstall = (item.singleton && item.hasInstance ? true : false);

                    item.iconPath = $scope.moduleMediaUrl + item.id + '/' + item.icon;

                    return item;
                }
            }).value().slice().sort(function(a, b) {
                return cfg.automations.indexOf(a.moduleName) - cfg.automations.indexOf(b.moduleName);
            });
        console.log("$scope.automations.modules", $scope.automations.modules);
    }

    function setInstances(data) {
        $scope.automations.instances = _.chain(data)
            .flatten()
            .filter(function(v) {
                return cfg.automations.indexOf(v.moduleId) != -1;
            }).value();
    }
});