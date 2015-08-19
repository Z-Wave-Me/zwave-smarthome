/**
 * Application Auth controller
 * @author Martin Vach
 */



/**
 * Login controller
 */
myAppController.controller('LoginController', function($scope, $location, $window, $routeParams, $cookies,dataFactory, dataService) {
    $scope.input = {
        form: true,
        login: '',
        password: '',
        keepme: false,
        default_ui: 1
    };
    $scope.loginLang = ($scope.lastLogin != undefined && angular.isDefined($cookies.lang)) ? $cookies.lang : false;
    //if(!$scope.lastLogin )
//    if (dataService.getUser()) {
//        $location.path('/elements');
//        return;
//    }
    /**
     * Login language
     */
    $scope.setLoginLang = function(lang) {
        $scope.loginLang = lang;
        $cookies.lang = lang;
        $scope.loadLang(lang);
    };
    /**
     * Login proccess
     */
    $scope.login = function(input) {
        input.password = input.password;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.alert = {message: false};
        dataFactory.logInApi(input).then(function(response) {
            var user = response.data.data;
             if($scope.loginLang){
                 user.lang = $scope.loginLang;
             }
            dataService.setZWAYSession(user.sid);
            dataService.setUser(user);
            dataService.setLastLogin(Math.round(+new Date() / 1000));
            //$scope.loading = false;
            $scope.input.form = false;
            $window.location.href = '#/elements?login';
            $window.location.reload();
        }, function(error) {
            var message = $scope._t('error_load_data');
            if (error.status == 401) {
                message = $scope._t('error_load_user');
            }
            $scope.loading = false;
            $scope.alert = {message: message, status: 'alert-danger', icon: 'fa-warning'};
        });
    };
    /**
     * Login from url
     */
    if ($routeParams.login && $routeParams.password) {
        $scope.login($routeParams);
    }

});
/**
 * Logout controller
 */
myAppController.controller('LogoutController', function($scope, dataService) {
    $scope.logout = function() {
        dataService.logOut();
    };
    $scope.logout();

});