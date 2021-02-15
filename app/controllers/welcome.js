/**
 * @overview Controller that handle the welcome page.
 * @author Michael Hensche
 */

/**
 * The welcome controller
 * @class WelcomeController
 */
myAppController.controller('WelcomeController', function($scope) {
	$scope.currentStep = 1;
	$scope.pages = 8;
	$scope.steps = _.range(0, $scope.pages);

	$scope.prevNext = function(n) {
		$scope.currentStep += n;
	}

	$scope.setStep = function(step) {
		$scope.currentStep = parseInt(step);
	}

	$scope.skip = function() {
		$scope.currentStep = $scope.pages;
	}
	$scope.sourcePrefix = $scope.deviceDetector.isMobile() ? '_mobile' : '';
});
