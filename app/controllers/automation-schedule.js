/**
 * @overview Controller that handles schedules
 * @author Martin Vach
 */

/**
 * Controller that handles schedules
 * @class AutomationScheduleController
 */
myAppController.controller('AutomationScheduleController', function ($scope, $routeParams, $location, cfg, dataFactory, dataService, _, myCache) {
  $scope.schedule = {
    model: {
      weekday:{},
      time:''
    },
    weekdays: {
        1:'Monday',
        2:'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        0: 'Sunday'
    },
    input: {
      instanceId: $routeParams.id,
      moduleId: "Schedules",
      active: true,
      title: "",
      params: {
        weekdays: [],
        times: ['00:00'],
        devices: {}
      }
    }
  };

  /**
   * Toggle Weekday
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      angular.extend($scope.schedule.input,{
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
     
      console.log(instance)
  }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
      $scope.loading = false;
  });

  };
  if($routeParams.id > 0){
    $scope.loadInstance($routeParams.id);
  }
  


   /**
   * Toggle Weekday
   */
  $scope.toggleWeekday = function (day) {
    day = day.toString();
    var index = $scope.schedule.input.params.weekdays.indexOf(day);
    if(index > -1){
      $scope.schedule.input.params.weekdays.splice(index, 1);
    }else{
      $scope.schedule.input.params.weekdays.push(day);
     
    }

  };

  /**
   * Add time
   */
  $scope.addTime = function (time) {
    console.log(time)
    var index = $scope.schedule.input.params.times.indexOf(time);
    console.log(index)
    if(index === -1){
      $scope.schedule.input.params.times.push(time);
    }

  };

   /**
   * Remove time
   */
  $scope.removeTime = function (time) {
    console.log(time)
    var index = $scope.schedule.input.params.times.indexOf(time);
    console.log(index)
    if(index > -1){
      $scope.schedule.input.params.times.splice(index, 1);
    }

  };

  /**
   * Store instance
   */
  $scope.storeInstance = function (input) {

    console.log(input)
    dataFactory.storeApi('instances', input.instanceId,input).then(function (response) {
      console.log(response)
      //$location.path('/automation/Schedules');
  }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
  });

  };

});

