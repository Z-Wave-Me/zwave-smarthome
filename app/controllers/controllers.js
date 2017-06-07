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
    /**
     * Function to run when when a user starts moving an element
     * @param item -  is the item in model which started being moved
     * @param part - is the part from which the $item originates
     * @param index -  is the index of the $item in $part
     * @param helper - is an object which contains the jqLite/jQuery object (as property element) of what is being dragged around
     */
    $scope.dragDropStart = function(item, part, index, helper){
        console.log(helper.element.context.id)
        angular.element('#' +  helper.element.context.id).addClass('dd-on-start');
        //jQuery('#' +  helper.element.context.id).addClass('dd-on-start');


    }

    $scope.dragDropSort = function(item, partFrom, partTo, indexFrom, indexTo){
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
 * For testing purpose.
 * @class TestController
 */
myAppController.controller('TestController', function($scope, $window) {
$scope.referrer = $window.document.referrer;
    console.log('$referrer',$scope.referrer);

});

