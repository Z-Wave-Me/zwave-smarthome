/**
 * Application directives
 * @author Martin Vach
 */
myApp.directive('testDir', function() {
    return {
        restrict: "E",
        replace: true,
        template: '<p>This is a test directive</p>'
    };
});

myApp.directive('logIt', function() {
    return {
        link: function(scope, elem, attrs) {
            console.log(attrs.logIt);
        }
    };
}
);
/**
 * History go back
 */
myApp.directive('bbGoBack', ['$window', function($window) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.bind('click', function() {
                    $window.history.back();
                });
            }
        };
    }]);

/**
 * Page loader directive
 */
myApp.directive('bbLoader', function() {
    return {
        restrict: "E",
        replace: true,
        template: '<div id="loading" ng-show="loading" ng-class="loading.status"><div class="loading-in">'
                + '<i class="fa fa-lg" ng-class="loading.icon"></i> <span ng-bind-html="loading.message|toTrusted"></span>'
                + '</div></div>'
    };
});

/**
 * Alert directive
 */
myApp.directive('bbAlert', function() {
    return {
        restrict: "E",
        replace: true,
        scope: {alert: '='},
        template: '<div class="alert" ng-if="alert.message" ng-class="alert.status">'
                + '<i class="fa fa-lg" ng-class="alert.icon"></i> <span ng-bind-html="alert.message|toTrusted"></span>'
                + '</div>'
    };
});

/**
 * Show validation error
 */
myApp.directive('bbValidator', function($window) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            inputName: '=',
            trans: '=',
            hasBlur: '='
        },
        template: '<div class="valid-error text-danger" ng-if="inputName.$invalid && !inputName.$pristine && hasBlur">*{{trans}}</div>'
    };
});

/**
 * Hide collapsed navi after click on mobile devices
 */
myApp.directive('collapseNavbar', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).click(function() {
                $("#nav_collapse").removeClass("in").addClass("collapse");
            });
        }
    };
});
/**
 * Go back
 */
myApp.directive('goBack', ['$window', function($window) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                elem.bind('click', function() {
                    $window.history.back();
                });
            }
        };
    }]);

/**
 * Knob directive
 */
myApp.directive('knob', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).val(25).knob();
        }
    };
});

myApp.directive('myknob', ['$timeout', 'dataFactory', function($timeout, dataFactory, dataService) {
        'use strict';

        return {
            restrict: 'A',
            replace: true,
            //template: '<input class="dial" data-width="100" data-height="100" value="{{ knobData }}"/>',
            scope: {
                knobId: '=',
                knobData: '=',
                knobOptions: '&'
            },
            link: function($scope, $element) {
                var knobInit = $scope.knobOptions() || {};

                knobInit.release = function(newValue) {
                    $timeout(function() {
                        $scope.knobData = newValue;
                        runCmdExact($scope.knobId, newValue);
                        $scope.$apply();
                    });
                };

                $scope.$watch('knobData', function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        $($element).val(newValue).change();
                    }
                });

                $($element).val($scope.knobData).knob(knobInit);
            }
        };

        /**
         * Run command exact value
         */
        function runCmdExact(id, val) {
            var cmd = id + '/command/exact?level=' + val;
            dataFactory.runApiCmd(cmd).then(function(response) {
            }, function(error) {
                dataService.logError(error);
            });
            return;
        }
        ;
    }]);
/**
 * Bootstrap tooltip
 */
myApp.directive('tooltip', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).hover(function() {
                // on mouseenter
                $(element).tooltip('show');
            }, function() {
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});
/**
 * Bootstrap Popover window
 */
myApp.directive('customPopover', function() {
    return {
        restrict: 'A',
        template: '<span>{{label}}</span>',
        link: function(scope, el, attrs) {
            scope.label = attrs.popoverLabel;
            $(el).popover({
                trigger: 'click',
                html: true,
                content: attrs.popoverHtml,
                placement: attrs.popoverPlacement
            });
        }
    };
});
/**
 * Confirm dialog after click
 */
myApp.directive('ngConfirmClick', [
    function() {
        return {
            priority: -1,
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function(e) {
                    var message = attrs.ngConfirmClick;
                    if (message && !confirm(message)) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
            }
        };
    }
]);

/**
 * Upload file
 */
myApp.directive('fileModel', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

myApp.directive('infiniteScroll', [
    '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
        return {
            link: function(scope, elem, attrs) {
                var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
                $window = angular.element($window);
                scrollDistance = 0;
                if (attrs.infiniteScrollDistance != null) {
                    scope.$watch(attrs.infiniteScrollDistance, function(value) {
                        return scrollDistance = parseInt(value, 10);
                    });
                }
                scrollEnabled = true;
                checkWhenEnabled = false;
                if (attrs.infiniteScrollDisabled != null) {
                    scope.$watch(attrs.infiniteScrollDisabled, function(value) {
                        scrollEnabled = !value;
                        if (scrollEnabled && checkWhenEnabled) {
                            checkWhenEnabled = false;
                            return handler();
                        }
                    });
                }
                handler = function() {
                    var elementBottom, remaining, shouldScroll, windowBottom;
                    windowBottom = $window.height() + $window.scrollTop();
                    elementBottom = elem.offset().top + elem.height();
                    remaining = elementBottom - windowBottom;
                    shouldScroll = remaining <= $window.height() * scrollDistance;
                    if (shouldScroll && scrollEnabled) {
                        if ($rootScope.$$phase) {
                            return scope.$eval(attrs.infiniteScroll);
                        } else {
                            return scope.$apply(attrs.infiniteScroll);
                        }
                    } else if (shouldScroll) {
                        return checkWhenEnabled = true;
                    }
                };
                $window.on('scroll', handler);
                scope.$on('$destroy', function() {
                    return $window.off('scroll', handler);
                });
                return $timeout((function() {
                    if (attrs.infiniteScrollImmediateCheck) {
                        if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                            return handler();
                        }
                    } else {
                        return handler();
                    }
                }), 0);
            }
        };
    }
]);
/**
 * Key event directive
 */
myApp.directive('bbKeyEvent', function() {
    return function(scope, element, attrs) {
        element.bind("keyup", function(event) {
            if (event.which !== 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.bbKeyEvent);
                });

                event.preventDefault();
            }
        });
    };
});

