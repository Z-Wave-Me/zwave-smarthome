/**
 * Application directives
 * @author Martin Vach
 */
/*
 * Default element
 */
myApp.directive('elDefault', function() {
    return {
        restrict: 'E',
         replace: true,
        templateUrl: "app/views/elements/directives/default.html",
        scope: {
            v: '=',
            levelVal: '=',
            'runCmd': '='
        },
        link: function (scope, elem, attr) {}
    };
});

/*
 * switchBinary element
 */
myApp.directive('elSwitchBinary', function() {
    return {
        restrict: 'E',
         replace: true,
        templateUrl: "app/views/elements/directives/switchBinary.html",
        scope: {
            v: '=',
            levelVal: '='
        },
        link: function (scope, elem, attr) {}
    };
});
