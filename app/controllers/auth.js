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
    if(dataService.getUser()){
        $scope.input.form = false;
        window.location = '#/elements/dashboard/1?login';
    }
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
     * Get session (ie for users holding only a session id, or users that require no login)
     */
    $scope.getSession = function() {
        var hasCookie = ($cookies.user) ? true:false;
        dataFactory.sessionApi().then(function(response) {
            $scope.processUser(response.data.data);
            if (!hasCookie) {
                $location.path('/elements/dashboard/1');
                $window.location.reload();
            }
        });
    };
    /**
     * Login with selected data from server response
     */
    $scope.processUser = function(user) { 
        if($scope.loginLang){
            user.lang = $scope.loginLang;
        }
        dataService.setZWAYSession(user.sid);
        dataService.setUser(user);
        dataService.setLastLogin(Math.round(+new Date() / 1000));
        //$scope.loading = false;
        $scope.input.form = false;
        //$window.location.href = '#/elements/dashboard/1?login';
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
            $scope.processUser(response.data.data);
            if (input.fromexpert) {
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
     * Login from url or session
     */
    if ($routeParams.login && $routeParams.password) {
        $scope.login($routeParams);
    } else if (!$routeParams.logout) {
        $scope.getSession();
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
            dataFactory.putApi('profiles', input.id, data).then(function(response) {
            }, function(error) {
            });
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/elements/dashboard/1';

        }, function(error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = $scope._t('nonunique_email');
            }
            alertify.alert(message);
            $scope.loading = false;
        });




    };

});
/**
 * Password forgot controller
 */
myAppController.controller('PasswordForgotController', function($scope, $location, dataFactory) {
    $scope.passwordForgot = {
        input: {email: '', token: null, resetUrl: null},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Send an email
     */
    $scope.sendEmail = function(form) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postApi('password_reset', $scope.passwordForgot.input).then(function(response) {
            $scope.passwordForgot.input.token = response.data.data.token;
            $scope.passwordForgot.input.resetUrl = $location.$$absUrl + '/reset/' + response.data.data.token;
            dataFactory.postToRemote($scope.cfg.post_password_request_url, $scope.passwordForgot.input).then(function(rdata) {
                $scope.passwordForgot.alert = {message: $scope._t('password_forgot_success'), status: 'alert-success', icon: 'fa-check'};
                $scope.loading = false;
            }, function(error) {
                alertify.alert($scope._t('error_500'));
                $scope.loading = false;
            });
        }, function(error) {
            alertify.alert($scope._t('error_500'));
            $scope.loading = false;
        });

    };

});

/**
 * Password reset controller
 */
myAppController.controller('PasswordResetController', function($scope, $routeParams, dataFactory) {
    $scope.passwordReset = {
        input: {userId: null, password: '', passwordConfirm: '', token: $routeParams.token},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    /**
     * Check a valid token
     */
    $scope.checkToken = function() {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postApi('password_reset', $scope.passwordReset.input, '?token=' + $scope.passwordReset.input.token).then(function(response) {
            $scope.passwordReset.input.userId = response.data.data.userId;
            $scope.loading = false;
        }, function(error) {
            var message = $scope._t('error_500');
            if (error.status == 404) {
                message = $scope._t('token_notfound');
            }
            $scope.loading = false;
            $scope.passwordReset.alert = {message: message, status: 'alert-danger', icon: 'fa-warning'};
        });
        return;

    };
    $scope.checkToken();



    /**
     * Change password
     */
    $scope.changePassword = function(form) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.passwordReset.input.userId,
            password: $scope.passwordReset.input.password,
            token: $routeParams.token


        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
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
myAppController.controller('LogoutController', function($scope, dataService, dataFactory) {
    $scope.logout = function() {
        dataFactory.getApi('logout').then(function(response) {
            dataService.logOut();
        });
    };
    $scope.logout();

});