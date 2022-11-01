myApp.directive('zWaveShortcut', function(dataService) {
  return {
    restrict: 'E',
    template: `<div class="form-group" ng-if="visible">
          <label>{{_t('lb_add_widget')}}:</label>
          <div class="btn-block">
            <button type="button" style="margin-right: 1em" ng-repeat="action in actions" class="btn btn-primary" title="{{_t(action.translateKey)}}" 
            ng-click="handleModal('shortcutModal', $event) || startCreate(action)"
            >{{_t(action.translateKey)}}</button>
          </div>
          <div id="shortcutModal" class="appmodal" ng-if="modalArr.shortcutModal">
            <div class="appmodal-in">
              <div class="appmodal-header">
                <span class="appmodal-close" ng-click="handleModal('shortcutModal', $event)"><i class="fas fa-times"></i></span>
                  <h3>{{_t('info_add_widget')}}</h3>
                  </div>
                  <div class="appmodal-body">
                  <div class="form-group">
                  <label>
                  {{_t('shortcutName')}}
                  <input class="form-control" type="text" ng-model="shortcut.name">
                    </label>
                    </div>
                  <div class="form-group">
                  <label>
                  <input type="checkbox" ng-model="shortcut.authorisation">
                    {{_t('authorisationNeeded')}}
                  </label>
                    </div>
                    
                  <div class="btn-block text-right">
                  <button class="btn btn-default" type="button" ng-click="handleModal('shortcutModal', $event)">
                  {{_t('lb_cancel')}}
                  </button>
                  <button class="btn btn-primary" type="button" ng-click="handleModal('shortcutModal', $event) || createShortcut()"> {{_t('lb_create')}}</button>
                </div>
              </div>
            </div>
           </div>
          <bb-help-text trans="_t('info_add_widget')"></bb-help-text>
        </div>`,
    link: function ($scope) {
      $scope.visible = ['toggleButton', 'switchBinary', 'switchMultilevel' ,'doorlock'].includes($scope.elementId.input.deviceType);
      var router = {
        'toggleButton': [{command: 'on', translateKey: 'lb_on'}],
        'switchBinary': [{command: 'on', translateKey: 'lb_on'},
          {command: 'off', translateKey: 'lb_off'}],
        'switchMultilevel': [{command: 'on', translateKey: 'lb_on'},
          {command: 'off', translateKey: 'lb_off'}],
        'doorlock': [{command: 'open', translateKey: 'lb_open'},{command: 'close', translateKey: 'lb_close'}]
      }
      $scope.startCreate = function (action) {
        var dev = angular.copy($scope.elementId.input);
        dev.metrics.level = action.command;
        $scope.shortcut.id = dev.id;
        $scope.shortcut.command = action.command;
        $scope.shortcut.name = encodeURIComponent($scope._t(action.translateKey) + ' ' + dev.metrics.title);
        $scope.shortcut.authorisation = false;
        $scope.shortcut.iconPath = dataService.assignElementIcon(dev);
        $scope.shortcut.name = $scope._t(action.translateKey) + dev.metrics.title;
      }
      $scope.shortcut = {};
      $scope.actions = router[$scope.elementId.input.deviceType];
      $scope.createShortcut = function () {
        var a = document.createElement('a');
        a.href = "/create-shortcut?name=" + $scope.shortcut.name +
          "&url=/ZAutomation/api/v1/devices/" + $scope.shortcut.id + "/command/" + $scope.shortcut.command +
          "&icon=" + window.location.pathname + $scope.shortcut.iconPath +
          "&authenticate=" + $scope.shortcut.authorisation
        a.click();
      }
    }
  }

})
