/**
 * @overview Controllers that handls climate
 * @author Michael Hensche
 */




/**
 * Controller that handles list of climate
 * @class ClimateController
 */
myAppController.controller('ClimateController', function ($scope, $routeParams, $location, $timeout, $interval, cfg, dataFactory, dataService, _, myCache) {
  $scope.climates = {
    moduleId: 'Climate',
    state: '',
    enableTest: [],
  }

  $scope.scheduleOptions = {
        startTime: "00:00", // schedule start time(HH:ii)
        endTime: "24:00",   // schedule end time(HH:ii)
        widthTime:60 * 5,  // cell timestamp  5 minutes
        timeLineY:30,       // height(px)
        verticalScrollbar:20,   // scrollbar (px)
        timeLineBorder:2,   // border(top and bottom)
        debug:"#debug",     // debug string output elements
        rows : {
          '0': {
                title : $scope._t('lb_mo'),
                schedule:[{
                  start:'09:00',
                  end:'12:00',
                  text:'Text Area',
                  data:{}
                }]
              },
          '1': {
                title : $scope._t('lb_tu'),
                schedule:[]
          },
          '2': {
                title : $scope._t('lb_we'),
                schedule:[]
          },
          '3': {
                title : $scope._t('lb_th'),
                schedule:[]
          },
          '4': {
                title : $scope._t('lb_fr'),
                schedule:[{
                  start:'10:00',
                  end:'12:00',
                  text:'Text 2',
                  data:{}
                },
                {
                  start:'07:00',
                  end:'08:00',
                  text:'Text 3',
                  data:{}
                }]
          },
          '5': {
                title : $scope._t('lb_sa'),
                schedule:[]
          },
          '6': {
                title : $scope._t('lb_su'),
                schedule:[]
          }   
        },
        change: function(node,data){
            alert("change event");
        },
        init_data: function(node,data){
        },
        click: function(node,data){
          console.log("data", data);
          console.log("node", node);
        },
        append: function(node,data){
            //alert("append");
        },
        time_click: function(time,data, timeline, timelineData){
          console.log("this", this);
          console.log("time", time);
          console.log("data", data);
          console.log("timeline", timeline);
          console.log("timelineData", timelineData);
          var start = this.calcStringTime(data),
              end = start + 3600;
          var newEntry = {
            data: {},
            start: start,
            end: end,
            text: "new Entry",
            timeline: parseInt(timeline)
          };
          console.log(newEntry);
          this.addScheduleData(newEntry);
        },
        append_on_click: function(timeline, startTime, endTime) {
          console.log("timeline", timeline);
          console.log(startTime + " - " + endTime);
          var start = this.calcStringTime(startTime),
              end = this.calcStringTime(endTime);

          end = end == start ? end + 3600 : end;

          var newEntry = {
            timeline: parseInt(timeline),
            start: start,
            end: end,
            text: "new Entry",
            data: {}
          };
          console.log(newEntry);
          this.addScheduleData(newEntry);
        },
        bar_Click: function(node, timelineData) {
          console.log("timelineData", timelineData);
          console.log("node", node);
          $scope.handleModal('temperatureModal');
        }
    };

  var schedule = jQuery("#schedule").timeSchedule($scope.scheduleOptions);

  $interval(function() {
    $scope.data = schedule.getScheduleData();
  }, 1000);


  // TODO: Get route segment
  console.log($location.path());

  /**
   * Load instances
   * @returns {undefined}
   */
  $scope.loadInstances = function () {
    $scope.hours = _.range($scope.time);
    $scope.timeGrid = _.range(($scope.time * $scope.gridWidth));
    dataFactory.getApi('instances', null, true).then(function (response) {
      console.log(response.data.data)
      $scope.climates.all = _.chain(response.data.data).flatten().where({
        moduleId: $scope.climates.moduleId
      }).filter(function (v) {
        var size = 0;
        for (k in v.params.devices) {
          if (v.params.devices[k].length) {
            size++;
          }
        }
        if (size) {
          $scope.climates.enableTest.push(v.id)
        }
        return v;
      }).value();
      if (!_.size($scope.climates.all)) {
        $scope.climates.state = 'blank';
        return;
      }
      $scope.climates.state = 'success';
    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });
  };

  $scope.loadInstances();

  /**
   * Activate/Deactivate instance
   * @param {object} input 
   * @param {boolean} activeStatus 
   */
  $scope.activateInstance = function (input, state) {
    input.active = state;
    if (!input.id) {
      return;
    }
    dataFactory.putApi('instances', input.id, input).then(function (response) {

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  };

  
  /**
   * Clone 
   * @param {object} input
   * @param {string} redirect
   * @returns {undefined}
   */
  $scope.cloneInstance = function (input, redirect) {
    input.id = 0;
    input.title = input.title + ' - copy';
    dataFactory.postApi('instances', input).then(function (response) {
      $location.path('/climate/' + response.data.data.id);
    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });
  };

  /**
   * Delete
   */
  $scope.deleteInstance = function (input, message) {
    alertify.confirm(message, function () {
      dataFactory.deleteApi('instances', input.id).then(function (response) {
        $scope.reloadData();
      }, function (error) {
        alertify.alertError($scope._t('error_delete_data'));
      });

    });
  };

});

/**
 * Controller that handles a climate detail
 * @class ClimateIdController
 */
myAppController.controller('ClimateIdController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.climate = {
    input: {
      instanceId: $routeParams.id,
      moduleId: "Climate",
      active: true,
      title: "",
      params: {
        sensors: [],
        action: [],
        notification: {
          notifiers: []
        }
      },
    }
  };

   /**
   * Load instance
   */
  $scope.loadInstance = function (id) {
    dataFactory.getApi('instances', '/' + id, true).then(function (instances) {
      var instance = instances.data.data;
      angular.extend($scope.climate.input, {
        title: instance.title,
        active: instance.active,
        params: instance.params
      });

    }, function (error) {
      alertify.alertError($scope._t('error_load_data'));
    });

  };

  if ($routeParams.id > 0) {
    $scope.loadInstance($routeParams.id);
  }

  /**
   * Store schedule
   */
  $scope.storeInstance = function (input, redirect) {
    dataFactory.storeApi('instances', parseInt(input.instanceId, 10), input).then(function (response) {
      if (redirect) {
        $location.path(redirect);
      }

    }, function (error) {
      alertify.alertError($scope._t('error_update_data'));
    });

  };

});

/**
 * Controller that handles a cliamte schedule temperature
 * @class ClimateTemperatureController
 */
myAppController.controller('ClimateTemperatureController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {


});
