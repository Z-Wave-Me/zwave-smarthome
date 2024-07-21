/**
 * @overview  The controller that renders Matter vendors and products.
 * @author Martin Vach
 */

/**
 * The controller that renders Matter vendors and products.
 * @class MatterVendorController
 */
myAppController.controller('MatterVendorController', function ($scope, $q, cfg, $cookies, $location, $window, $timeout, dataFactory, dataService, _) {
    $scope.matterVendors = {
        view: false, // default||update
        alert: false,
        frequency: false,
        frequencyName: false,
        all: {},
        cnt:{},
        products: {
            pageTitle: '',
            cnt: 0,
            all: {},
            collection: {},
            noSearch: false
        },
        filter: ($cookies.filterProducts ? angular.fromJson($cookies.filterProducts) : {})
    };

    $scope.autocomplete = {
        source: [],
        term: '',
        searchInKeys: 'id,name,brandname,ertification_id',
        returnKeys: 'id,name,brandname,product_image,frequency',
        strLength: 2,
        resultLength: 10
    };



    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZMatterApiData(),
            dataFactory.getApi('matter_vendors'),
            dataFactory.getApi('matter_devices', '?lang=' + $scope.lang)


        ];

        $q.allSettled(promises).then(function (response) {
            var zbdata = response[0];
            var vendors = response[1];
            var products = response[2];

            var productsWhere = {};

            $scope.loading = false;
            // Error message
            if (zbdata.state === 'rejected') {
              angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                return;
            }
            // Error message
            if (vendors.state === 'rejected' || products.state === 'rejected') {
                var reason = vendors.reason || products.reason;
                if (reason.status === 404) {
                    $scope.matterVendors.view = 'update';
                } else {
                  angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                }
                return;
            }
            // Success - zbdata
            if (zbdata.state === 'fulfilled') {
                if (zbdata.value && zbdata.value.controller.data.frequency.value) {
                    $scope.matterVendors.frequency = zbdata.value.controller.data.frequency.value;
                    $scope.matterVendors.frequencyName = cfg.frequency[zbdata.value.controller.data.frequency.value];
                    productsWhere.frequency = $scope.matterVendors.frequencyName;
                }

                /*$scope.matterVendors.frequency = zbdata.value.controller.data.frequency.value;
                 $scope.matterVendors.frequencyName = cfg.frequency[zbdata.value.controller.data.frequency.value];*/
            }
            // Success - vendors
            if (vendors.state === 'fulfilled') {
                $scope.matterVendors.view = 'default';
                $scope.matterVendors.all = vendors.value.data.data.matter_vendors;
            }
            // Success - products
            if (products.state === 'fulfilled') {
               
                $scope.matterVendors.products.all = dataService.getMatterDevices(products.value.data.data.matter_devices)
                        .where(productsWhere)
                        .value();
                
                 // Vendors products
                $scope.matterVendors.cnt = _.countBy($scope.matterVendors.products.all,function (v) {
                    return v.brandname;
                });

                if ('brandid' in  $scope.matterVendors.filter) {// Filter by brand id
                    $scope.matterVendors.products.pageTitle = $scope.matterVendors.filter.brandid;
                    $scope.matterVendors.products.collection = _.where($scope.matterVendors.products.all, $scope.matterVendors.filter);
                } else if ('q' in  $scope.matterVendors.filter) {// Filter by query
                    $scope.matterVendors.products.pageTitle = $scope.matterVendors.filter.q;
                    // Set autcomplete term
                    $scope.autocomplete.term = $scope.matterVendors.filter.q;
                    // Set IDS
                    var searchResult = _.indexBy(dataService.autocomplete($scope.matterVendors.products.all, $scope.autocomplete), 'id');
                    $scope.matterVendors.products.collection = _.filter($scope.matterVendors.products.all, function (v) {
                        if (searchResult[v.id]) {
                            return v;
                        }
                    });
                } else {
                    $scope.matterVendors.products.collection = $scope.matterVendors.products.all;
                }
                $scope.matterVendors.products.cnt = _.size($scope.matterVendors.products.collection);
                if ($scope.matterVendors.products.cnt < 1) {
                    $scope.matterVendors.products.noSearch = $scope.matterVendors.products.pageTitle;
                }
                //console.log($scope.matterVendors.products.collection)
            }


        });
    };
    $scope.allSettled();

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.autocomplete.results = dataService.autocomplete($scope.matterVendors.products.all, $scope.autocomplete);
        // Expand/Collapse the list
        if (!_.isEmpty($scope.autocomplete.results)) {
            $scope.expandAutocomplete('searchProducts');
        } else {
            $scope.expandAutocomplete();
        }
        // Reset filter q if is input empty
        if ($scope.matterVendors.filter.q && $scope.autocomplete.term.length < 1) {
            $scope.setFilter();
        }
    };

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        // Reset
        $scope.autocomplete.results = [];
        $scope.matterVendors.products.noSearch = false;
        $scope.expandAutocomplete();

        // Is fiter value empty?
        var empty = (_.values(filter) == '');

        if (!filter || empty) {// Remove filter
            angular.extend($scope.matterVendors, {filter: {}});
            $cookies.filterProducts = angular.toJson({});
            $scope.allSettled();
            //$scope.reloadData();
        } else {// Set filter
            angular.extend($scope.matterVendors, {filter: filter});
            $scope.allSettled();
            //$scope.reloadData();
            $cookies.filterProducts = angular.toJson(filter);
            if ($scope.routeMatch('/matter/vendors')) {
                $location.path('/matter/products');
            }
        }


    };

    /**
     * update device database
     */
    $scope.updateVendorDatabase = function () {
        $scope.matterVendors.view = false;
        $scope.matterVendors.alert = {message: $scope._t('updating_device_db'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        dataFactory.getApi('update_matter_vendors').then(function (response) {
            $scope.updateDeviceDatabase();
        }, function (error) {
            $scope.matterVendors.alert = {message: $scope._t('vendors_error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };

    /**
     * update device database
     */
    $scope.updateDeviceDatabase = function () {
        dataFactory.getApi('update_device_database').then(function (response) {
            $scope.matterVendors.alert = {message: $scope._t('reloading_page'), status: 'alert-success', icon: 'fa-spinner fa-spin'};
            $timeout(function () {
                $window.location.reload();

            }, 2000);
        }, function (response) {
            $scope.matterVendors.alert = {message: $scope._t('update_device_database_failed'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };

    /**
     * disable database update
     */
    $scope.disableDatabaseUpdate = function () {
        $scope.matterVendors.view = false;
    };
});
