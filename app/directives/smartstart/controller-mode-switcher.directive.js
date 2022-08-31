myApp.directive('zWaveControllerModeSwitcher', function (dataFactory, $interval) {
  return {
    restrict: 'E', template: `<div class="btn-group">
                <button 
                ng-disabled="loading" 
                class="btn btn-lg" 
                ng-click="changeMode('classic')" 
                ng-class="mode === 'classic' ? 'active btn-success': 'btn-default'" title="{{_t('reload')}}">
                    <bb-row-spinner
                            spinner="loading"
                            label="_t('btn_lr_classic')"
                            icon="'fa-spider-web'"
                            core="'far'"
                            label-class="btn-name"/>
                </i><span class="btn-name"> {{_t('reload')}}</span>
                </button>
                <button 
                ng-disabled="loading || !enableLongMode" 
                class="btn btn-lg" 
                ng-class="mode === 'longRange' ? 'active btn-success': 'btn-default'"
                ng-click="changeMode('longRange')" 
                title="{{_t('reload')}}">
                    <bb-row-spinner
                            spinner="loading"
                            label="_t('btn_lr_long_range')"
                            icon="'fa-asterisk'"
                            label-class="btn-name"
                            core="'fas'"/>
                    <span class="btn-name"> {{_t('reload')}}</span>
                </button>
              </div>`, scope: true, link: function (scope) {
      scope._t = scope.$parent._t;
      scope.loading = false;
      scope.mode = null;
      scope.enableLongMode = true;
      scope.$on('$destroy', function () {
        console.log('destroyed');
        $interval.cancel(pooling);
      })

      function update() {
        dataFactory.runExpertCmd('controller.data.longRange').then(function (response) {
          if (response && response.data) {
            scope.enableLongMode = response.data.enabled.value;
            scope.mode = response.data.inclusion.value ? 'longRange' : 'classic';
          }
        })
      }

      update();
      const pooling = $interval(update, 2000);
      scope.changeMode = function (mode) {
        if (mode !== scope.mode) {
          scope.loading = true;
          dataFactory.runExpertCmd('controller.data.longRange.inclusion=' + (mode === 'longRange' ? 'true' : 'false')).then(function () {
            scope.mode = mode;
          }).finally(function () {
            scope.loading = false;
          })
        }
      }
    }
  }
})
