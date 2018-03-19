/**
 * @overview Controllers that handls leakages
 * @author Martin Vach
 */
/**
 * Controller that handles list of leakages
 * @class LeakageController
 */
myAppController.controller('LeakageController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.leakages = {
    moduleId: 'LeakageProtection',
    state: '',
    enableTest: [],
  }
  // TODO: Get route segment
  console.log($location.path());

  /**
   * Load instances
   * @returns {undefined}
   */
  $scope.loadInstances = function () {
    dataFactory.getApi('instances', null, true).then(function (response) {
      console.log(response.data.data)
      $scope.leakages.all = _.chain(response.data.data).flatten().where({
        moduleId: $scope.leakages.moduleId
      }).filter(function (v) {
        var size = 0;
        for (k in v.params.devices) {
          if (v.params.devices[k].length) {
            size++;
          }
        }
        if (size) {
          $scope.leakages.enableTest.push(v.id)
        }
        return v;
      }).value();
      if (!_.size($scope.leakages.all)) {
        $scope.leakages.state = 'blank';
        return;
      }
      $scope.leakages.state = 'success';
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
      $location.path('/leakages/' + response.data.data.id);
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
 * Controller that handles a leakage detail
 * @class LeakageIdController
 */
myAppController.controller('LeakageIdController', function ($scope, $routeParams, $location, $timeout, cfg, dataFactory, dataService, _, myCache) {
  $scope.leakage = {
    input: {
      instanceId: $routeParams.id,
      moduleId: "LeakageProtection",
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
      angular.extend($scope.leakage.input, {
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