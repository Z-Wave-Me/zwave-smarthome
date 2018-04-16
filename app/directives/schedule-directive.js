(function() {
    'use strict';
    angular
        .module('Schedule', [])
        .directive('bbSchedule', function() {
            return {
                restrict: 'A',
                link: function(scope, $elem, attrs) {
                    console.log("scope", scope);
                    $elem = jQuery($elem);
                    $elem.timeSchedule();
                }
            };
        });
})();