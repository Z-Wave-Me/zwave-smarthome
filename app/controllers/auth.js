/**
 * Application Auth controller
 * @author Martin Vach
 */

/**
 * Logout controller
 */
myAppController.controller('AuthController', function($scope, $routeParams,$cookies,dataFactory,dataService) {
    $scope.input = {
        remoteId: null,
        firstAccess: false,
        form: true,
        login: '',
        password: '',
        rememberme: false,
        secure: false,
        fromexpert: $routeParams.fromexpert
    };
    
    if(dataService.getUser()){
        $scope.input.form = false;
        window.location = '#/dashboard';
    }
    
    $scope.loginLang = (angular.isDefined($cookies.lang)) ? $cookies.lang : false;
    
     /**
     * Get remote id
     */
    $scope.getRemoteId = function() {
       dataFactory.getApi('remote_id').then(function(response) {
           if(response.data.data.remote_id && response.data.data.remote_id !== ''){
               $scope.input.remoteId = response.data.data.remote_id;
           }
        });
    };
    $scope.getRemoteId();
    
    /**
     * Get first access
     */
    $scope.getFirstAccess = function() {
        var response = {
            data: {
                data: {
                    id: 1,
                    firstAccess: true
                }
            }
        };
        $scope.input.firstAccess = response.data.data.firstAccess;
        /*dataFactory.getApi('firstlogin').then(function(response) {
           if(response.data.data.firstLogin === true){
                window.location = '#/passwordchange';
           }
        });*/
    };
    $scope.getFirstAccess();
    
    /**
     * Login language
     */
    $scope.setLoginLang = function(lang) {
        $scope.loginLang = lang;
        $cookies.lang = lang;
        $scope.loadLang(lang);
    };
});

/**
 * Login controller
 */
myAppController.controller('AuthLoginController', function($scope, $location, $window, $routeParams, $cookies, dataFactory, dataService) {
    /**
     * Get session (ie for users holding only a session id, or users that require no login)
     */
    $scope.getSession = function() {
       var hasCookie = ($cookies.user) ? true:false;
       dataFactory.sessionApi().then(function(response) {
           $scope.processUser(response.data.data);
           if (!hasCookie) {
               window.location = '#/dashboard';
               $window.location.reload();
           }
       });
    };
    /**
     * Login with selected data from server response
     */
    $scope.processUser = function(user,rememberme,secure) { 
        if($scope.loginLang){
            user.lang = $scope.loginLang;
        }
        angular.extend(user,{secure: secure});
        dataService.setZWAYSession(user.sid);
        dataService.setUser(user);
        dataService.setLastLogin(Math.round(+new Date() / 1000));
        if(rememberme){
           dataService.setRememberMe(rememberme); 
        }
        
        $scope.input.form = false;
    };
    /**
     * Login proccess
     */
    $scope.login = function(input) {
//         dataFactory.postToRemote('http://developer.zwave.eu/ietest.php', input).then(function (response) {
//        }, function (error) {
//
//        });
//        return;
        input.password = input.password;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.alert = {message: false};
        dataFactory.logInApi(input).then(function(response) {
            var redirectTo = '#/dashboard'; 
            var rememberme = (input.rememberme ? input : null);
            $scope.processUser(response.data.data,rememberme,input.secure);
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
     * Login from url, remember me or session
     */
    if ($routeParams.login && $routeParams.password) {
        $scope.login($routeParams);
    } else if(dataService.getRememberMe()){
        $scope.login(dataService.getRememberMe());
    }else if (!$routeParams.logout) {
        $scope.getSession();
    }
});


/**
 * Login controller
 */
myAppController.controller('LoginController', function($scope, $location, $window, $routeParams, $cookies, dataFactory, dataService) {
    
    $scope.input = {
        form: true,
        login: '',
        password: '',
        rememberme: false,
        secure: false,
        remoteId: null,
        fromexpert: $routeParams.fromexpert
    };
    if(dataService.getUser()){
        $scope.input.form = false;
        window.location = '#/dashboard';
    }
    $scope.loginLang = (angular.isDefined($cookies.lang)) ? $cookies.lang : false;
    
    /**
     * Login language
     */
    $scope.setLoginLang = function(lang) {
        $scope.loginLang = lang;
        $cookies.lang = lang;
        $scope.loadLang(lang);
    };
    
     /**
     * Login language
     */
    $scope.setSecure = function(bool) {
        $scope.input.secure = bool;
    };
    /**
     * Get remote id
     */
    $scope.checkFirstLogin = function() {
        var response = {
            data: {
                data: {
                    id: 1,
                    firstLogin: true
                }
            }
        };
        if (response.data.data.firstLogin === true){
             //window.location = '#/passwordchange';
             //$window.location.reload();
        }
        /*dataFactory.getApi('firstlogin').then(function(response) {
           if(response.data.data.firstLogin === true){
                window.location = '#/passwordchange';
           }
        });*/
    };
    $scope.checkFirstLogin();
    
     /**
     * Get remote id
     */
    $scope.getRemoteId = function() {
       dataFactory.getApi('remote_id').then(function(response) {
           if(response.data.data.remote_id && response.data.data.remote_id !== ''){
               $scope.input.remoteId = response.data.data.remote_id;
           }
        });
    };
    $scope.getRemoteId();
    
    /**
     * Get session (ie for users holding only a session id, or users that require no login)
     */
    $scope.getSession = function() {
       var hasCookie = ($cookies.user) ? true:false;
       dataFactory.sessionApi().then(function(response) {
           $scope.processUser(response.data.data);
           if (!hasCookie) {
               window.location = '#/dashboard';
               $window.location.reload();
           }
       });
    };
    /**
     * Login with selected data from server response
     */
    $scope.processUser = function(user,rememberme,secure) { 
        if($scope.loginLang){
            user.lang = $scope.loginLang;
        }
        angular.extend(user,{secure: secure})
        dataService.setZWAYSession(user.sid);
        dataService.setUser(user);
        dataService.setLastLogin(Math.round(+new Date() / 1000));
        if(rememberme){
           dataService.setRememberMe(rememberme); 
        }
        
        $scope.input.form = false;
    };
    /**
     * Login proccess
     */
    $scope.login = function(input) {
//         dataFactory.postToRemote('http://developer.zwave.eu/ietest.php', input).then(function (response) {
//        }, function (error) {
//
//        });
//        return;
        input.password = input.password;
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.alert = {message: false};
        dataFactory.logInApi(input).then(function(response) {
            var redirectTo = '#/dashboard'; 
            var rememberme = (input.rememberme ? input : null);
            $scope.processUser(response.data.data,rememberme,input.secure);
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
     * Login from url, remember me or session
     */

    var path = $location.path().split('/');

    if ($routeParams.login && $routeParams.password) {
        $scope.login($routeParams);
    } else if(dataService.getRememberMe()){
        $scope.login(dataService.getRememberMe());
    // only ask for session forwarding if user is not logged out before or the request comes from trusted hosts
    } else if ((typeof $routeParams.logout !== 'undefined' && !$routeParams.logout) ||
                (path[1] === '' && $scope.cfg.find_hosts.indexOf($location.host()) !== -1)) {
        $scope.getSession();
    }
});
/**
 * Password controller
 */
myAppController.controller('AuthPasswordController', function($scope, dataFactory) {
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
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            dataFactory.putApi('profiles', input.id, data).then(function(response) {
            }, function(error) {
            });
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/dashboard';

        }, function(error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = $scope._t('nonunique_email');
            }
            alertify.alertError(message);
            $scope.loading = false;
        });




    };

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
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            dataFactory.putApi('profiles', input.id, data).then(function(response) {
            }, function(error) {
            });
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/dashboard';

        }, function(error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = $scope._t('nonunique_email');
            }
            alertify.alertError(message);
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
                alertify.alertError($scope._t('error_500'));
                $scope.loading = false;
            });
        }, function(error) {
            alertify.alertError($scope._t('error_500'));
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
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
    };
});
/**
 * Logout controller
 */
myAppController.controller('LogoutController', function($scope, dataService, dataFactory) {
    $scope.logout = function() {
        dataService.setRememberMe(null);
        dataFactory.getApi('logout').then(function(response) {
            dataService.logOut();
        });
    };
    $scope.logout();

});