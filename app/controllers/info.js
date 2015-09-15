/**
 * Application info controller
 * @author Martin Vach
 */

myAppController.controller('InfoController', function($scope, $timeout) {
    $scope.input = {
        firmwareVersion: 'v2.0.2-rc8',
        uiVersion: $scope.cfg.app_version
    };
   //alertify.success("Welcome to ngAlertify!");
   
   alertify.alert("Message");
   
 
 
 $scope.getAlertifyMessage = function(type) {
      alertify.set('notifier','position', 'top-right');
         switch(type){
             case 'success':
               alertify.success('This is a success message. Current position : ' + alertify.get('notifier','position'));
             break;
             case 'warning':
               alertify.warning('This is a warning message. Current position : ' + alertify.get('notifier','position'));
             break;
             case 'error':
               alertify.error('This is an ERROR message. Current position : ' + alertify.get('notifier','position'));
             break;
         }

    };
    $scope.loadData = function() {
         $scope.alert = {message: $scope._t('Loading'), status: 'alert-warning', icon: 'fa-spinner fa-spin'};
         
          
        $timeout(function() {
             $scope.alert = {message: $scope._t('Success'), status: 'alert-success', icon: 'fa-check'};

        }, 3000);
         $timeout(function() {
             $scope.alert = {message: $scope._t('Error'), status: 'alert-danger', icon: 'fa-warning'};

        }, 6000);

    };

    $scope.loadData();


});