/**
 * @overview  The controller that renders Z-Wave vendors and products.
 * @author Martin Vach
 */

/**
 * The controller that renders Z-Wave vendors and products.
 * @class ZwaveVendorController
 */
myAppController.controller('ZwaveVendorController', function ($scope, $routeParams,$q, cfg, $cookies,$location,dataFactory, dataService, _) {
    $scope.zwaveVendors = {
        frequency: false,
        frequencyName: false,

        all: {},
        products: {
            pageTitle: '',
            cnt: 0,
            all:{},
            collection: {},
            noSearch: false
        },
        filter: ($cookies.filterProducts ? angular.fromJson($cookies.filterProducts) : {}),
    };

    $scope.autocomplete = {
        source: [],
        term: '',
        searchInKeys: 'id,name,brandname,ertification_id',
        returnKeys: 'id,name,brandname,product_image_base64,frequency',
        strLength: 2,
        resultLength: 10
    };



    /**
     * Load all promises
     */
    $scope.allSettled = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        var promises = [
            dataFactory.loadZwaveApiData(),
            dataFactory.getApiLocal('ui_vendors.json'),
            dataFactory.getApi('zwave_devices','?lang=' + $scope.lang)


        ];

        $q.allSettled(promises).then(function (response) {
            var zwdata = response[0];
            var vendors = response[1];
            var products = response[2];

            var productsWhere = {};

            $scope.loading = false;
            // Error message
            if (zwdata.state === 'rejected' || vendors.state === 'rejected') {
                alertify.alertError($scope._t('error_load_data'));
                return;
            }
            // Success - zwdata
            if (zwdata.state === 'fulfilled') {
                if(zwdata.value.controller.data.frequency.value){
                    $scope.zwaveVendors.frequency = zwdata.value.controller.data.frequency.value;
                    $scope.zwaveVendors.frequencyName = cfg.frequency[zwdata.value.controller.data.frequency.value];
                    productsWhere.frequency = $scope.zwaveVendors.frequencyName;
                }

                /*$scope.zwaveVendors.frequency = zwdata.value.controller.data.frequency.value;
                 $scope.zwaveVendors.frequencyName = cfg.frequency[zwdata.value.controller.data.frequency.value];*/
            }
            // Success - vendors
            if (vendors.state === 'fulfilled') {
                $scope.zwaveVendors.all = vendors.value.data;
            }
            // Success - products
            if (products.state === 'fulfilled') {
                $scope.zwaveVendors.products.all = dataService.getZwaveDevices(products.value.data.data.zwave_devices)
                    .where(productsWhere)
                    .value();

                if ('brandid' in  $scope.zwaveVendors.filter) {// Filter by brand id
                    $scope.zwaveVendors.products.pageTitle = $scope.zwaveVendors.filter.brandid;
                    $scope.zwaveVendors.products.collection = _.where($scope.zwaveVendors.products.all, $scope.zwaveVendors.filter);
                }else  if ('q' in  $scope.zwaveVendors.filter) {// Filter by query
                    $scope.zwaveVendors.products.pageTitle = $scope.zwaveVendors.filter.q;
                    // Set autcomplete term
                    $scope.autocomplete.term = $scope.zwaveVendors.filter.q;
                    // Set IDS
                    var searchResult = _.indexBy(dataService.autocomplete($scope.zwaveVendors.products.all, $scope.autocomplete), 'id');
                    $scope.zwaveVendors.products.collection = _.filter($scope.zwaveVendors.products.all, function (v) {
                        if (searchResult[v.id]) {
                            return v;
                        }
                    });
                }else{
                    $scope.zwaveVendors.products.collection = $scope.zwaveVendors.products.all;
                }
                $scope.zwaveVendors.products.cnt = _.size($scope.zwaveVendors.products.collection);
                if ($scope.zwaveVendors.products.cnt < 1) {
                    $scope.zwaveVendors.products.noSearch =  $scope.zwaveVendors.products.pageTitle;
                }
                //console.log($scope.zwaveVendors.products.collection)
            }


        });
    };
    $scope.allSettled();

    /**
     * Renders search result in the list
     */
    $scope.searchMe = function () {
        $scope.autocomplete.results = dataService.autocomplete($scope.zwaveVendors.products.all,$scope.autocomplete);
        // Expand/Collapse the list
        if(!_.isEmpty($scope.autocomplete.results)){
            $scope.expandAutocomplete('searchProducts',event);
        }else{
            $scope.expandAutocomplete('searchProducts',event,false);
        }
        // Reset filter q if is input empty
        if ($scope.zwaveVendors.filter.q && $scope.autocomplete.term.length < 1) {
            $scope.setFilter();
        }
    };

    /**
     * Set filter
     */
    $scope.setFilter = function (filter) {
        // Reset
        $scope.autocomplete.results = [];
        $scope.zwaveVendors.products.noSearch = false;
        $scope.expandAutocomplete('searchProducts',event,false);

        // Is fiter value empty?
        var empty = (_.values(filter) == '');

        if (!filter || empty) {// Remove filter
            angular.extend($scope.zwaveVendors, {filter: {}});
            $cookies.filterProducts= angular.toJson({});
            $scope.allSettled();
            //$scope.reloadData();
        } else {// Set filter
            angular.extend($scope.zwaveVendors, {filter: filter});
            $scope.allSettled();
            //$scope.reloadData();
            $cookies.filterProducts = angular.toJson(filter);
            if ($scope.routeMatch('/zwave/vendors')) {
                $location.path('/zwave/products');
            }
        }


    };
});