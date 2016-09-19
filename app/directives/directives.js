/**
 * @overview Common Angular directives that are used within the views.
 * @author Martin Vach
 */

/**
 * Window history back
 * @class bbGoBack
 */
myApp.directive('bbGoBack', ['$window', function ($window) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    $window.history.back();
                });
            }
        };
    }]);

/**
 * Displays a page loader
 * @class bbLoader
 */
myApp.directive('bbLoader', function () {
    return {
        restrict: "E",
        replace: true,
        template: '<div id="loading" ng-show="loading" ng-class="loading.status"><div class="loading-in">'
                + '<i class="fa fa-lg" ng-class="loading.icon"></i> <span ng-bind-html="loading.message|toTrusted"></span>'
                + '</div></div>'
    };
});

/**
 * Displays an alert message within the div
 * @class bbAlert
 */
myApp.directive('bbAlert', function () {
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
 * Displays an alert message within the span
 * @class bbAlertText
 */
myApp.directive('bbAlertText', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {alert: '='},
        template: '<span class="alert" ng-if="alert.message" ng-class="alert.status">'
                + '<i class="fa fa-lg" ng-class="alert.icon"></i> <span ng-bind-html="alert.message|toTrusted"></span>'
                + '</span>'
    };
});

/**
 * Displays a HTML help page
 * @class bbHelp
 */
myApp.directive('bbHelp', function ($sce, dataFactory, cfg) {
    var trusted = {};
    return {
        restrict: "E",
        replace: true, template: '<span class="clickable" ng-click="showHelp();handleModal(\'helpModal\', $event)"><i class="fa fa-question-circle fa-lg text-info"></i>'
                + '<div id="helpModal" class="appmodal" ng-if="modalArr.helpModal"><div class="appmodal-in">'
                + '<div class="appmodal-header">'
                + '<h3>{{cfg.app_name}}</h3>'
                + '<span class="appmodal-close" ng-click="handleModal(\'helpModal\', $event)"><i class="fa fa-times"></i></span>'
                + '</div>'
                + '<div class="appmodal-body" ng-bind-html="getSafeHtml(helpData)"></div>'
                + '</div></div>'
                + '</span>',
        link: function (scope, elem, attrs) {
            scope.file = attrs.file;
            scope.helpData = null;
            scope.show = false;
            scope.showHelp = function () {
                var defaultLang = 'en';
                var lang = attrs.lang;
                var helpFile = scope.file + '.' + lang + '.html';
                // Load help file for given language
                dataFactory.getHelp(helpFile).then(function (response) {
                    scope.helpData = response.data;
                    scope.show = true;

                }, function (error) {
                    // Load help file for default language
                    helpFile = scope.file + '.' + defaultLang + '.html';
                    dataFactory.getHelp(helpFile).then(function (response) {
                        scope.helpData = response.data;
                    }, function (error) {
                        alertify.alertError(scope._t('error_load_data'));
                    });
                });
            };
            scope.getSafeHtml = function (html) {
                return trusted[html] || (trusted[html] = $sce.trustAsHtml(html));
            };
        }
    };
});

/**
 * Displays a help text
 * @class bbHelpText
 */
myApp.directive('bbHelpText', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            trans: '=',
            display: '=',
            icon: '='
        },
        template: '<span class="help-text" ng-class="display"><i class="fa text-info" ng-class="icon ? icon : \' fa-info-circle\'"></i> {{trans}}</span>'
    };
});

/**
 * Displays a validation error
 * @class bbValidator
 */
myApp.directive('bbValidator', function ($window) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            inputName: '=',
            trans: '=',
            hasBlur: '='
        },
        template: '<div class="valid-error text-danger" ng-if="inputName && !inputName.$pristine && hasBlur">*{{trans}}</div>'
    };
});

/**
 * Compare two values
 * @class bbCompareTo
 */
myApp.directive("bbCompareTo", function () {
    return {
        require: "ngModel",
        link: function (scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.bbCompareTo];

            ctrl.$parsers.push(function (value) {
                if (value === otherInput.$viewValue) {
                    ctrl.$setValidity("compareto", true);
                    return value;
                }
                ctrl.$setValidity("compareto", false);
            });

            otherInput.$parsers.push(function (value) {
                ctrl.$setValidity("compareto", value === ctrl.$viewValue);
                return value;
            });
        }
    };
});

// Knob directive
myApp.directive('knob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).val(25).knob();
        }
    };
});

/**
 * Displays a knob 
 * @class myknob
 */
myApp.directive('myknob', ['$timeout', 'dataFactory', function ($timeout, dataFactory, dataService) {
        'use strict';

        return {
            restrict: 'A',
            replace: true,
            //template: '<input class="dial" data-width="100" data-height="100" value="{{ knobData }}"/>',
            scope: {
                knobId: '=',
                knobData: '=',
                knobStep: '=',
                knobMin: '=',
                knobMax: '=',
                knobOptions: '&'
            },
            link: function ($scope, $element) {
                var knobInit = $scope.knobOptions() || {};
                knobInit.step = $scope.knobStep || 1;
                if (typeof ($scope.knobMin) !== 'undefined'){
                    knobInit.min = $scope.knobMin;
                }
                if (typeof ($scope.knobMax) !== 'undefined'){
                     knobInit.max = $scope.knobMax;
                }
               
                knobInit.release = function (newValue) {
                    //console.log(knobInit)
                    $timeout(function () {
                        var old = $scope.knobData;
                        //console.log('myKnob directive - Bafore request new/old: ',newValue, old)
                        if (old != newValue) {
                             //console.log('myKnob directive - Sending request new/old: ',newValue, old)
                            $scope.knobData = newValue;
                            runCmdExact($scope.knobId, newValue);
                            $scope.$apply();
                        }
                    });
                };

                $scope.$watch('knobData', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                         $($element).val(newValue).change();
                    }
                });

                $($element).val($scope.knobData).knob(knobInit);
            }
        };

        /**
         * Run command exact value
         * @param {int} id
         * @param {int} val
         * @returns {undefined}
         */
        function runCmdExact(id, val) {
            //console.log('Knob from directive:',val)
            var cmd = id + '/command/exact?level=' + val;
            dataFactory.runApiCmd(cmd).then(function (response) {
                //console.log('myKnob directive - request success: ',cmd)
            }, function (error) {});
            return;
        }
        ;
    }]);

/**
 * Displays a confirm dialog after click
 * @class ngConfirmClick
 */
myApp.directive('ngConfirmClick', [
    function () {
        return {
            priority: -1,
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
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
 * Upload a file
 * @class fileModel
 */
myApp.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

/**
 * Catch a key event
 * @class bbKeyEvent
 */
myApp.directive('bbKeyEvent', function () {
    return function (scope, element, attrs) {
        element.bind("keyup", function (event) {
            if (event.which !== 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.bbKeyEvent);
                });

                event.preventDefault();
            }
        });
    };
});

