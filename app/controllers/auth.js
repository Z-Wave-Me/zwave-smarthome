/**
 * Application Auth controller
 * @author Martin Vach
 */



/**
 * Login controller
 */
myAppController.controller('LoginController', function($scope, $location, $window, $routeParams, $cookies, dataFactory, dataService) {
    $scope.input = {
        form: true,
        login: '',
        password: '',
        keepme: false,
        default_ui: 1,
        fromexpert: $routeParams.fromexpert
    };
    $scope.loginLang = ($scope.lastLogin != undefined && angular.isDefined($cookies.lang)) ? $cookies.lang : false;
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
            var redirectTo = '#/elements/dashboard/1?login';
            var user = response.data.data;
            if ($scope.loginLang) {
                user.lang = $scope.loginLang;
            }
            dataService.setZWAYSession(user.sid);
            dataService.setUser(user);
            dataService.setLastLogin(Math.round(+new Date() / 1000));
            //$scope.loading = false;
            $scope.input.form = false;
            //$window.location.href = '#/elements/dashboard/1?login';
            //console.log(user);
            //$location.path('/elements/dashboard/1?login');
            if(input.fromexpert){
                window.location.href = $scope.cfg.expert_url;
                return;
            }
            if (input.password === $scope.cfg.default_credentials.password) {
                redirectTo = '#/password';
            }
            
            window.location = redirectTo;

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
 * Password controller
 */
myAppController.controller('PasswordController', function($scope, dataFactory) {
    //$scope.newPassword = null;
    $scope.input = {
        password: '',
        passwordConfirm: '',
        email: ''
    };
    /**
     * Change password
     */
    $scope.changePassword = function(form, input) {
        if (form.$invalid) {
            return;
        }
        if (input.password === $scope.cfg.default_credentials.password) {
            alertify.alert($scope._t('enter_valid_password'));
            $scope.loading = false;
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.user.id,
            password: input.password,
            email: input.email

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            data['email'] = input.email;
            if (!data) {
                alertify.alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            dataFactory.putApi('profiles', input.id, data).then(function(response) {}, function(error) {});
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/elements/dashboard/1';

        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });
        
        
        

    };

});
/**
 * Password forgot controller
 */
myAppController.controller('PasswordForgotController', function($scope, $location,dataFactory) {
    $scope.passwordForgot = {
        input: { email: '',location: $location,resetUrl: $location.$$absUrl + '/reset/'},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Send an email
     */
    $scope.sendEmail = function(form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        alertify.alert($scope._t('email_notfound'));
         $scope.passwordForgot.alert = {message: $scope._t('password_forgot_success'), status: 'alert-success', icon: 'fa-check'};
        $scope.loading = false;

        return;

        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/elements/dashboard/1';

        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

});

/**
 * Password reset controller
 */
myAppController.controller('PasswordResetController', function($scope, $routeParams,dataFactory) {
   $scope.passwordReset = {
        input: { id: null, password: '',passwordConfirm: '',token: $routeParams.token},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    /**
     * Check a valid token
     */
    $scope.checkToken = function(token) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
         $scope.passwordReset.input.id = 1;
         $scope.loading = false;
         return;

        dataFactory.getApi('myappi', null, true).then(function(response) {
            $scope.passwordReset.input.id = response.data.data.user.id;
            $scope.passwordReset.input.id = 1;
            $scope.loading = false;
        }, function(error) {
            var message = $scope._t('error_500');
            if (error.status == 404) {
                message = $scope._t('token_notfound');
            }
            $scope.loading = false;
            $scope.passwordReset.alert = {message: message, status: 'alert-danger', icon: 'fa-warning'};
        });

    };
    $scope.checkToken($routeParams.token);
    
    /**
     * Change password
     */
    $scope.changePassword = function(form, input) {
        if (form.$invalid) {
            return;
        }
        if (input.password === '' || input.password === $scope.cfg.default_credentials.password) {
            alertify.alert($scope._t('enter_valid_password'));
            $scope.loading = false;
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: input.id,
            password: input.password

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
            var data = response.data.data;
            if (!data) {
                alertify.alert($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/';

        }, function(error) {
            alertify.alert($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };

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