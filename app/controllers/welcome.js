/**
 * @overview Controller that handle the welcome page.
 * @author Michael Hensche
 */

/**
 * The welcome controller
 * @class ElementBaseController
 */
myAppController.controller('WelcomeController', function ($scope) {
 	$scope.currentStep = 1;
 	$scope.steps = _.range(0, 5);

 	$scope.prevNext = function(n) {
 		$scope.currentStep += n;			
 	}
 
 	$scope.setStep = function(step) {
 		$scope.currentStep = parseInt(step);
 	}
});