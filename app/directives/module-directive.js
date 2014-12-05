/**
 * Module directive
 * @author Martin Vach
 */
myApp.directive('moduleInput', function($filter) {
    return {
        restrict: "E",
        replace: true,
        template: '<div class="form-group" ng-bind-html="input | toTrusted"></div>',
        scope: {
            inputData: '=',
            params: '='
        },
        link: function(scope, element, attrs) {
            if (!scope.inputData) {
                return;
            }
            var input = null;
            switch (scope.inputData.type) {
                case 'string':
                    input = moduleInputString(scope.inputData);
                    break;
                case 'select':
                     input = moduleInputSelect(scope.inputData);
                    break;
                default:
                    break;
            }
            scope.input = input;

            return;


        }

    };
    /**
     * Build string input
     */
    function moduleInputString(data){
        var input = '<label>' + data.label + '</label> ';
        input += '<input class="form-control" name="' + data.inputName + '" type="text" value="' + data.value + '" ng-model="input.' + data.inputName + '" />';
        return input;
    }
    /**
     * Build Select input
     */
    function moduleInputSelect(data){
         var input = '<label>' + data.label + '</label> ';
         var selected = '';
         input += '<select name="' + data.inputName + '" class="form-control">';
         angular.forEach(data.pairs, function(v, k) {
             if (k == data.value) {
                selected = ' selected';
            }
            input += '<option value="' + k + '"' + selected + '> ' + v + '</option>';

        });
         input += '</select">';
         return input;
    }
});
