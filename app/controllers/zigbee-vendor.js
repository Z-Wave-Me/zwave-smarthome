/**
 * @overview  The controller that renders Zigbee vendors and products.
 * @author Martin Vach
 */

/**
 * The controller that renders Zigbee vendors and products.
 * @class ZigbeeVendorController
 */
myAppController.controller('ZigbeeVendorController', function ($scope, $q, cfg, $cookies, $location, $window, $timeout, dataFactory, dataService, _) {
    $scope.zigbeeVendors = {
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
            dataFactory.loadZigbeeApiData(),
            dataFactory.getApi('zigbee_vendors'),
            dataFactory.getApi('zigbee_devices', '?lang=' + $scope.lang)


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
                    $scope.zigbeeVendors.view = 'update';
                } else {
                  angular.extend(cfg.route.alert, {message: $scope._t('error_load_data')});
                }
                return;
            }
            // Success - zbdata
            if (zbdata.state === 'fulfilled') {
                if (zbdata.value && zbdata.value.controller.data.frequency.value) {
                    $scope.zigbeeVendors.frequency = zbdata.value.controller.data.frequency.value;
                    $scope.zigbeeVendors.frequencyName = cfg.frequency[zbdata.value.controller.data.frequency.value];
                    productsWhere.frequency = $scope.zigbeeVendors.frequencyName;
                }

                /*$scope.zigbeeVendors.frequency = zbdata.value.controller.data.frequency.value;
                 $scope.zigbeeVendors.frequencyName = cfg.frequency[zbdata.value.controller.data.frequency.value];*/
            }
            // Success - vendors
            if (vendors.state === 'fulfilled') {
                $scope.zigbeeVendors.view = 'default';
                $scope.zigbeeVendors.all = vendors.value.data.data.zigbee_vendors;
            }
            // Success - products
            if (products.state === 'fulfilled') {
               
                $scope.zigbeeVendors.products.all = dataService.getZigbeeDevices(products.value.data.data.zigbee_devices)
                        .where(productsWhere)
                        .value();
                
                 // Vendors products
                $scope.zigbeeVendors.cnt = _.countBy($scope.zigbeeVendors.products.all,function (v) {
                    return v.brandname;
                });

                if ('brandid' in  $scope.zigbeeVendors.filter) {// Filter by brand id
                    $scope.zigbeeVendors.products.pageTitle = $scope.zigbeeVendors.filter.brandid;
                    $scope.zigbeeVendors.products.collection = _.where($scope.zigbeeVendors.products.all, $scope.zigbeeVendors.filter);
                } else if ('q' in  $scope.zigbeeVendors.filter) {// Filter by query
                    $scope.zigbeeVendors.products.pageTitle = $scope.zigbeeVendors.filter.q;
                    // Set autcomplete term
                    $scope.autocomplete.term = $scope.zigbeeVendors.filter.q;
                    // Set IDS
                    var searchResult = _.indexBy(dataService.autocomplete($scope.zigbeeVendors.products.all, $scope.autocomplete), 'id');
                    $scope.zigbeeVendors.products.collection = _.filter($scope.zigbeeVendors.products.all, function (v) {
                        if (searchResult[v.id]) {
                            return v;
                        }
                    });
                } else {
                    $scope.zigbeeVendors.products.collection = $scope.zigbeeVendors.products.all;
                }
                $scope.zigbeeVendors.products.cnt = _.size($scope.zigbeeVendors.products.collection);
                if ($scope.zigbeeVendors.products.cnt < 1) {
                    $scope.zigbeeVendors.products.noSearch = $scope.zigbeeVendors.products.pageTitle;
                }
                //console.log($scope.zigbeeVendors.products.collection)
            }


        });
    };
    $scope.allSettled();

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.autocomplete.results = dataService.autocomplete($scope.zigbeeVendors.products.all, $scope.autocomplete);
        // Expand/Collapse the list
        if (!_.isEmpty($scope.autocomplete.results)) {
            $scope.expandAutocomplete('searchProducts');
        } else {
            $scope.expandAutocomplete();
        }
        // Reset filter q if is input empty
        if ($scope.zigbeeVendors.filter.q && $scope.autocomplete.term.length < 1) {
            $scope.setFilter();
        }
    };

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        // Reset
        $scope.autocomplete.results = [];
        $scope.zigbeeVendors.products.noSearch = false;
        $scope.expandAutocomplete();

        // Is fiter value empty?
        var empty = (_.values(filter) == '');

        if (!filter || empty) {// Remove filter
            angular.extend($scope.zigbeeVendors, {filter: {}});
            $cookies.filterProducts = angular.toJson({});
            $scope.allSettled();
            //$scope.reloadData();
        } else {// Set filter
            angular.extend($scope.zigbeeVendors, {filter: filter});
            $scope.allSettled();
            //$scope.reloadData();
            $cookies.filterProducts = angular.toJson(filter);
            if ($scope.routeMatch('/zigbee/vendors')) {
                $location.path('/zigbee/products');
            }
        }


    };

    /**
     * update device database
     */
    $scope.updateVendorDatabase = function () {
        $scope.zigbeeVendors.view = false;
        $scope.zigbeeVendors.alert = {message: $scope._t('updating_device_db'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
        dataFactory.getApi('update_zigbee_vendors').then(function (response) {
            $scope.updateDeviceDatabase();
        }, function (error) {
            $scope.zigbeeVendors.alert = {message: $scope._t('vendors_error_load_data'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };

    /**
     * update device database
     */
    $scope.updateDeviceDatabase = function () {
        dataFactory.getApi('update_device_database').then(function (response) {
            $scope.zigbeeVendors.alert = {message: $scope._t('reloading_page'), status: 'alert-success', icon: 'fa-spinner fa-spin'};
            $timeout(function () {
                $window.location.reload();

            }, 2000);
        }, function (response) {
            $scope.zigbeeVendors.alert = {message: $scope._t('update_device_database_failed'), status: 'alert-danger', icon: 'fa-exclamation-triangle'};
        });
    };

    /**
     * disable database update
     */
    $scope.disableDatabaseUpdate = function () {
        $scope.zigbeeVendors.view = false;
    };
});
