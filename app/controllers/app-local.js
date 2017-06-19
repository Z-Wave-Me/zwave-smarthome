/**
 * @overview Controllers that handle the Local apps.
 * @author Martin Vach
 */


/**
 * The controller that handles all local APPs actions.
 * @class AppLocalController
 */
myAppController.controller('AppLocalController', function ($scope, $filter, $cookies, $timeout, $route, $routeParams, $location, dataFactory, dataService, myCache, _) {
    $scope.dataHolder.modules.filter = ($cookies.filterAppsLocal ? angular.fromJson($cookies.filterAppsLocal) : {});

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.dataHolder.modules.autocomplete.results = dataService.autocomplete($scope.dataHolder.modules.all, $scope.dataHolder.modules.autocomplete);
        // Expand/Collapse the list
        if(!_.isEmpty($scope.dataHolder.modules.autocomplete.results)){
            $scope.expandAutocomplete('searchLocalApps',event);
        }else{
            $scope.expandAutocomplete('searchLocalApps',event,false);
        }

        // Reset filter q if is input empty
        if ($scope.dataHolder.modules.filter.q && $scope.dataHolder.modules.autocomplete.term.length < 1) {
            $scope.setFilter();
        }
    }
    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.modules, {orderBy: key});
        $cookies.orderByAppsLocal = key;
        $scope.reloadData();
    };
    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        // Reset data
        $scope.dataHolder.modules.autocomplete.results = [];
        $scope.dataHolder.modules.noSearch = false;
        $scope.expandAutocomplete('searchLocalApps',event,false);
        // Is fiter value empty?
        var empty = (_.values(filter) == '');
        if (!filter || empty) {// Remove filter
            angular.extend($scope.dataHolder.modules, {filter: {}});
            $cookies.filterAppsLocal = angular.toJson({});
        } else {// Set filter
            angular.extend($scope.dataHolder.modules, {filter: filter});
            $cookies.filterAppsLocal = angular.toJson(filter);
        }

        $scope.loadTokens();
        //$scope.reloadData();

    };

    /**
     * Delete module
     */
    $scope.deleteModule = function (input, message) {

        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('online_delete', input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });
        });
    };

    /**
     * Reset module
     */
    $scope.resetModule = function (input, message) {

        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.postApi('online_reset', input, '/' + input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                myCache.removeAll();
                $route.reload();

            }, function (error) {
                var message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error.key) : $scope._t('error_delete_data'));
                $scope.loading = false;
                alertify.alertError(message);
            });
        });
    };

});
/**
 * The controller that handles local app detail actions.
 * @class AppLocalDetailController
 */
myAppController.controller('AppLocalDetailController', function ($scope, $routeParams, $location, dataFactory, dataService, _) {
    $scope.module = [];
    $scope.categoryName = '';
    $scope.isOnline = null;
    $scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';
    /**
     * Load categories
     */
    $scope.loadCategories = function (id) {
        dataFactory.getApi('modules_categories').then(function (response) {
            var cat = response.data.data;
            if (!cat) {
                return;
            }
            var category = _.findWhere(cat[$scope.lang] || cat[$scope.cfg.lang], {id: id});
            if (category) {
                $scope.categoryName = category.name;
            }
        }, function (error) {
        });
    };

    /**
     * Load module detail
     */
    $scope.loadModule = function (id) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.getApi('modules', '/' + id).then(function (response) {
            loadOnlineModules(id);
            $scope.module = response.data.data;
            $scope.loadCategories(response.data.data.category);
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));
        });
    };
    $scope.loadModule($routeParams.id);

    /// --- Private functions --- ///
    function loadOnlineModules(moduleName) {
        dataFactory.getRemoteData($scope.cfg.online_module_url).then(function (response) {
            $scope.isOnline = _.findWhere(response.data, {modulename: moduleName});
        }, function (error) {
        });
    }

});

