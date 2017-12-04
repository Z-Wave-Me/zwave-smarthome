/**
 * @overview Controllers that handls schedules
 * @author Martin Vach
 */
/**
 * Controller that handles list of schedules
 * @class AutomationScheduleController
 */
myAppController.controller('AutomationScheduleController', function ($scope, $routeParams, $location, cfg, dataFactory, dataService, _, myCache) {
  $scope.schedules = {
    state: '',
    all: []
  };

  
  /**
   * Load schedules
   * @returns {undefined}
   */
  $scope.loadSchedules = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      $scope.schedules.all = _.where(response.data.data, {
        moduleId: 'Schedules'
      });
      if (!_.size($scope.schedules.all)) {
        $scope.schedules.state = 'blank';
        return;
      }
      $scope.schedules.state = 'success';
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };
  $scope.loadSchedules();

  
    /**
     * Clone schedule
     * @param {object} input
     * @returns {undefined}
     */
    $scope.cloneSchedule = function (input) {
      input.id = 0;
      dataFactory.postApi('instances', input).then(function (response) {
          $location.path('/schedules/' + response.data.data.id);
      }, function (error) {
        alertify.alertError($scope._t('error_update_data'));
      });
  };

  /**
   * Delete schedule
   */
  $scope.deleteSchedule = function (input, message) {
    alertify.confirm(message, function () {
      dataFactory.deleteApi('instances', input.id).then(function (response) {
        /*dataService.showNotifier({
          message: $scope._t('delete_successful')
        });*/
        $scope.reloadData();
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });

    });
  };

});


/**
 * Controller that handles schedules
 * @class AutomationScheduleController
 */
myAppController.controller('AutomationScheduleIdController', function ($scope, $routeParams, $location, cfg, dataFactory, dataService, _, myCache) {
  $scope.schedule = {
    model: {
      weekday:{},
      time:'',
      switchBinary:{
        device: '',
        status:'off',
        sendAction: false
      }
    },
    devices:[],
    cfg:{
      switchBinary:{
        valName: 'status',
        enum: ['off', 'on']
      },
      switchMultilevel:{},
      thermostat:{},
      doorlock:{},
      toggleButton:{}

    },
    input: {
      instanceId: $routeParams.id,
      moduleId: "Schedules",
      active: true,
      title: "",
      params: {
        weekdays: [],
        times: ['00:00'],
        devices: {
          switches: [],
          dimmers: [],
          thermostats: [],
          locks: [],
          scenes: []
        }
      }
    }
  };

  /**
   * Load instances
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      angular.extend($scope.schedule.input,{
        title: instance.title,
        active: instance.active,
        params: instance.params
      });
  }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
      $scope.loading = false;
  });

  };
  if($routeParams.id > 0){
    $scope.loadInstance($routeParams.id);
  }

  /**
   * Load devices
   */
  $scope.loadDevices = function () {
    dataFactory.getApi('devices').then(function (response) {
      $scope.schedule.devices = dataService.getDevicesData(response.data.data.devices).value();
    }, function (error) {});
  };
  $scope.loadDevices();
  
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
   * Get device object by ID
   */
  $scope.deviceById = function (id) {
    var device =  _.findWhere($scope.schedule.devices,{id: id});
    if(!device){
      return {};
    }
    return device;
    
    
  };

  /**
   * Add switch
   */
  $scope.addSwitch = function (v) {
    console.log($scope.schedule.input.params.devices.switches)
    var index = _.findIndex($scope.schedule.input.params.devices.switches,{device: v.device});
    if(index > -1){
     angular.extend($scope.schedule.input.params.devices.switches[index],v);
    }else{
      $scope.schedule.input.params.devices.switches.push(v)
    }
    console.log($scope.schedule.input.params.devices.switches)
    
    
  };

  /**
   * Remove switch
   */
  $scope.removeSwitch = function (index) {
    $scope.schedule.input.params.devices.switches.splice(index, 1);
    
    
  };

  /**
   * Store schedule
   */
  $scope.storeSchedule = function (input) {
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10),input).then(function (response) {
      $location.path('/schedules');
  }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
  });

  };

});

