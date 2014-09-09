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
myApp.directive('customPopover', function () {
    return {
        restrict: 'A',
        template: '<span>{{label}}</span>',
        link: function (scope, el, attrs) {
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
  function(){
    return {
      priority: -1,
      restrict: 'A',
      link: function(scope, element, attrs){
        element.bind('click', function(e){
          var message = attrs.ngConfirmClick;
          if(message && !confirm(message)){
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        });
      }
    };
  }
]);

