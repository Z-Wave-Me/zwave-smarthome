myApp.directive('context', [
  function() {
    return {
      restrict: 'A',
      scope: '@&',
      compile: function compile(tElement, tAttrs, transclude) {
        var last = 0;
        return {
          post: function postLink(scope, iElement, iAttrs, controller) {
            var ul = $('#' + iAttrs.context);
            ul.css({
              'display': 'none'
            });
            
            var openEvent = iAttrs.openon || 'contextmenu'; // can be click, contextmenu or mouseover
            
            $(iElement).bind(openEvent, function(event) {
              var pos = this.getBoundingClientRect();
              event.preventDefault();
              ul.css({
                position: "fixed",
                display: "block",
                left: (openEvent === 'mouseover' ? pos.right : event.clientX) + 'px',
                top: (openEvent === 'mouseover' ? pos.top : event.clientY) + 'px'
              });
              last = event.timeStamp;
              $('#' + iAttrs.context + 'Modal').css({
                'display': 'block'
              });
            });
            
            $('#' + iAttrs.context + 'Modal').bind('click', function(event) {
              $(this).css({
                'display': 'none'
              });
              ul.css({
                'display': 'none'
              });
            });
          }
        };
      }
    };
  }
]);

/*
Usage:

myApp.controller('MyCtrl', function($scope) {
  $scope.showContextMenu = function(){
    console.log(arguments);
  };
  $scope.devices = [
    {id: 1, name: "one"},
    {id: 2, name: "two"},
    {id: 3, name: "three"},
    {id: 4, name: "four"}
  ];
  $scope.devs = [
    {id: 1, name: "Xone"},
    {id: 2, name: "Xtwo"},
    {id: 3, name: "Xthree"},
    {id: 4, name: "Xfour"}
  ];
});

  <div ng-controller="MyCtrl">
    <ul class="list-group" >
      <li class="list-group-item" context="contextDevices" openon="click">{{_t("syntax")}}</li>
      <li class="list-group-item" context="contextDevices">{{_t("devices")}}</li>
    </ul>
    <div id="contextDevicesModal" class="dropdown-menu-modal"></div>
    <ul id="contextDevices" class="dropdown-menu" role="menu"> 
      <li ng-repeat="dev in devices"><a ng-click="alert(dev.id)" openon="mouseover" context="contextDevicesProperites">{{dev.name}}</a></li>
    </ul>
    <div id="contextDevicesProperitesModal" class="dropdown-menu-modal"></div>
    <ul id="contextDevicesProperites" class="dropdown-menu" role="menu"> 
      <li class="divider"></li>
      <li ng-repeat="dev in devs"><a ng-click="alert(dev.name)">{{dev.name}}</a></li>
    </ul>
  </div>

*/