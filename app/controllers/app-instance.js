/**
 * @overview Controllers that handle the Instances.
 * @author Martin Vach
 */

/**
 * The controller that handles all instances actions.
 * @class AppInstanceController
 */
myAppController.controller('AppInstanceController', function ($scope, $cookies, dataFactory, dataService, myCache, _) {
    //$scope.dataHolder.instances.filter = ($cookies.filterAppsInstances ? angular.fromJson($cookies.filterAppsInstances) : {});
    /**
     * Expand instances
     */
    $scope.expandInstances = function (state) {
        angular.forEach($scope.expand, function (v, k) {
            $scope.expand[k] = state;
        });
        $cookies.instancesExpanded = state;
    };

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.dataHolder.instances.autocomplete.results = dataService.autocomplete($scope.dataHolder.instances.all, $scope.dataHolder.instances.autocomplete);
        // Expand/Collapse the list
        if(!_.isEmpty($scope.dataHolder.instances.autocomplete.results)){
            $scope.expandAutocomplete('searchInstances');
        }else{
            $scope.expandAutocomplete();
        }
        // Reset filter q if is input empty
        if ($scope.dataHolder.instances.filter.q && $scope.dataHolder.instances.autocomplete.term.length < 1) {
            $scope.setFilter();
        }
    }

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        $scope.dataHolder.instances.autocomplete.results = [];
        $scope.dataHolder.instances.noSearch = false;
        $scope.expandAutocomplete();
        // Is fiter value empty?
        var empty = (_.values(filter) == '');

        if (!filter || empty) {// Remove filter
            angular.extend($scope.dataHolder.instances, {filter: {}});
            $cookies.filterAppsInstances = angular.toJson({});
        } else {// Set filter
            angular.extend($scope.dataHolder.instances, {filter: filter});
            $cookies.filterAppsInstances = angular.toJson(filter);
        }
        $scope.loadTokens();
        //$scope.reloadData();
    };

    /**
     * Set order by
     */
    $scope.setOrderBy = function (key) {
        angular.extend($scope.dataHolder.instances, {orderBy: key});
        $cookies.orderByAppsInstances = key;
        $scope.reloadData();
    };
    /**
     * Activate instance
     */
    $scope.activateInstance = function (input, activeStatus) {
        input.active = activeStatus;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        if (input.id) {
            dataFactory.putApi('instances', input.id, input).then(function (response) {
                $scope.loading = false;
                //$scope.reloadData();
                //$route.reload();

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
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            dataFactory.deleteApi('instances', input.id).then(function (response) {
                $scope.loading = false;
                dataService.showNotifier({message: $scope._t('delete_successful')});
                $scope.reloadData();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_delete_data'));
            });
        });
    };

});


