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
myAppController.controller('DragDropController', function($scope, cfg) {
    $scope.models = {
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
    }, true);


});

