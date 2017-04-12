/**
 * @overview The uncategorized controllers.
 * @author Martin Vach
 */

/**
* The controller that handles 404 Not found response.
* @class Error404Controller
*/
myAppController.controller('Error404Controller', function($scope, cfg) {
    angular.extend(cfg.route.fatalError, {
        message: cfg.route.t['error_404'],
        hide: true
    });

});

/**
 * The controller that tests drag and drop feature.
 * @class DragDropController
 */
myAppController.controller('DragDropController', function($scope, cfg,dataFactory) {
    $scope.dataHolder = {
        devices: {
            collection: []
        }
    }
    $scope.modelArray = [
        {id: 1,title: 'Title 1'},
        {id: 2,title: 'Title 2'},
        {id: 3,title: 'Title 3'},
    ];
    $scope.load = function () {

        dataFactory.getApi('devices', null, true).then(function(response) {

            $scope.dataHolder.devices.collection = response.data.data.devices;

        }, function(error) {
            alertify.alertError($scope._t('error_load_data'));
        });
    }
    $scope.load();

    $scope.dragDropMe_ = function(item, partFrom, partTo, indexFrom, indexTo){
        //console.log(partFrom)
        var result = [];
        angular.forEach(partFrom, function(v,k){
            var obj = {id: v.id,position: k};
            result.push(obj);

        });
        console.log(result)

    }

   /* $scope.models = {
        selected: null,
        lists: {"A": [], "B": []}
    };



    // Generate initial model
    for (var i = 1; i <= 3; ++i) {
        $scope.models.lists.A.push({label: "Item A" + i});
        $scope.models.lists.B.push({label: "Item B" + i});
    }

    // Model to JSON for demo purpose
    $scope.$watch('models', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);*/




});

/**
 * The controller that handles search result - for testing purpose.
 * @class AutoCompleteController
 */
myAppController.controller('AutoCompleteController', function($scope, cfg,dataFactory,dataService) {
$scope.autocomplete = {
        source: [],
        term: '',
        searchInKeys: 'id,title,description,author',
        returnKeys: 'id,title,author,installed,rating,icon',
        strLength: 2,
        resultLength: 10
    };
    $scope.onlineModules = [];

        $scope.load = function () {

            dataFactory.getOnlineModules({token: []}).then(function(response) {
                //console.log(response.data.data)
                $scope.modules = response.data.data;
                $scope.autocomplete.source = response.data.data;
                $scope.onlineModules = response.data.data;

            }, function(error) {
                alertify.alertError($scope._t('error_load_data'));
            });
        }
    $scope.load();
    // Search
    $scope.searchMe = function () {
        $scope.autocomplete.results = dataService.autocomplete($scope.onlineModules,$scope.autocomplete);
        return;
    }

});

