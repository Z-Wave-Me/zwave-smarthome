/**
 * Application Auth controller
 * @author Martin Vach
 */

/**
 * Logout controller
 */
myAppController.controller('AuthController', function ($scope, $routeParams, $cookies, $window, dataFactory, dataService) {
    $scope.auth = {
        remoteId: null,
        firstaccess: false,
        defaultProfile: false,
        fromexpert: $routeParams.fromexpert
    };

    if (dataService.getUser()) {
        $scope.auth.form = false;
        window.location = '#/dashboard';
        return;
    }

    $scope.loginLang = (angular.isDefined($cookies.lang)) ? $cookies.lang : false;
    $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};

    /**
     * Get remote id
     */
    $scope.getRemoteId = function () {
        dataFactory.getApi('remote_id').then(function (response) {
            if (response.data.data.remote_id && response.data.data.remote_id !== '') {
                $scope.auth.remoteId = response.data.data.remote_id;
            }
        });
    };
    $scope.getRemoteId();

    /**
     * Get first access
     */
    $scope.getFirstAccess = function () {

        dataFactory.getApi('firstaccess').then(function (response) {
            $scope.auth.firstaccess = response.data.data.firstaccess;
            $scope.auth.defaultProfile = response.data.data.defaultProfile;
            $scope.loading = false;
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_load_data'));

        });

    };
    $scope.getFirstAccess();

    /**
     * Login language
     */
    $scope.setLoginLang = function (lang) {
        $scope.loginLang = lang;
        $cookies.lang = lang;
        $scope.loadLang(lang);
    };

    /**
     * Login with selected data from server response
     */
    $scope.processUser = function (user, rememberme) {
        if ($scope.loginLang) {
            user.lang = $scope.loginLang;
        }
        dataService.setZWAYSession(user.sid);
        dataService.setUser(user);
        if (rememberme) {
            dataService.setRememberMe(rememberme);
        }

        $scope.auth.form = false;
    };
    /**
     * Redirect
     */
    $scope.redirectAfterLogin = function (trust, user, password, rememberme, url) {
        var location = url || '#/dashboard';
        $scope.processUser(user, rememberme);
        if ($scope.auth.fromexpert) {
            window.location.href = $scope.cfg.expert_url;
            return;
        }
        window.location = location;
        $window.location.reload();
    };


    /**
     * Redirect - with trust my network
     */
//    $scope.redirectAfterLogin = function (trust, user, password, rememberme) {
//        // Trusted
//        if (trust) {
//            $scope.processUser(user, rememberme);
//            if ($scope.auth.fromexpert) {
//                window.location.href = $scope.cfg.expert_url;
//                return;
//            }
//            window.location = '#/dashboard';
//            $window.location.reload();
//        } else {
//            dataService.unsetUser(user);
//            // find.popp.eu
//            if ($scope.cfg.app_type === 'popp') {
//               window.location = 'https://find.popp.eu/?login=' + user.login + '&password=' + password;
//            }
//            //find.z-wave.me
//            else {
//                var findInput = {
//                    act: 'login',
//                    login: $scope.auth.remoteId + '/' + user.login,
//                    pass: password
//                };
//                dataFactory.postToRemote($scope.cfg.find_zwaveme_zbox, findInput).then(function (response) {
//                    window.location = $scope.cfg.find_zwaveme_zbox + '?login=' + user.login + '&password=' + password;
//                }, function (error) {
//                    alertify.alertError($scope._t('error_load_data'));
//
//                });
//
//            }
//        }
//    };
});

/**
 * Login controller
 */
myAppController.controller('AuthLoginController', function ($scope, $location, $window, $routeParams, $cookies, dataFactory, dataService) {
    $scope.input = {
        password: '',
        login: '',
        rememberme: false
    };
    /**
     * Get session (ie for users holding only a session id, or users that require no login)
     */
    $scope.getSession = function () {
        var hasCookie = ($cookies.user) ? true : false;
        dataFactory.sessionApi().then(function (response) {
            $scope.processUser(response.data.data);
            if (!hasCookie) {
                window.location = '#/dashboard';
                $window.location.reload();
            }
        });
    };

    /**
     * Login proccess
     */
    $scope.login = function (input) {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        $scope.alert = {message: false};
        dataFactory.logInApi(input).then(function (response) {
            var rememberme = (input.rememberme ? input : null);
            $scope.redirectAfterLogin(true, response.data.data, input.password, rememberme);

        }, function (error) {
            $scope.loading = false;
            var message = $scope._t('error_load_data');
            if (error.status == 401) {
                message = $scope._t('error_load_user');
            }
            alertify.alertError(message);
        });
    };

    /**
     * Login proccess
     */
//    $scope.login = function (input) {
//        input.password = input.password;
//        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
//        $scope.alert = {message: false};
//        dataFactory.logInApi(input).then(function (response) {
//            dataFactory.getApi('trust_my_network').then(function (responseTrust) {
//                var rememberme = (input.rememberme ? input : null);
//                $scope.redirectAfterLogin(responseTrust.data.data.trustMyNetwork, response.data.data, input.password, rememberme);
//            }, function (error) {
//                $scope.loading = false;
//                alertify.alertError($scope._t('error_load_data'));
//
//            });
//
//        }, function (error) {
//            $scope.loading = false;
//            var message = $scope._t('error_load_data');
//            if (error.status == 401) {
//                message = $scope._t('error_load_user');
//            }
//             alertify.alertError(message);
//        });
//    };
    /**
     * Login from url, remember me or session
     */

    var path = $location.path().split('/');

    if ($routeParams.login && $routeParams.password) {
        $scope.login($routeParams);
    } else if (dataService.getRememberMe() && !$scope.auth.firstaccess) {
        $scope.login(dataService.getRememberMe());
        // only ask for session forwarding if user is not logged out before or the request comes from trusted hosts
    } else if (typeof $routeParams.logout === 'undefined' ||
            !$routeParams.logout ||
            (path[1] === '' && $scope.cfg.find_hosts.indexOf($location.host()) !== -1)) {
        $scope.getSession();
    }
});

/**
 * Password controller
 */
myAppController.controller('AuthPasswordController', function ($scope, dataFactory, dataService) {
    $scope.input = {
        id: $scope.auth.defaultProfile.id,
        password: '',
        passwordConfirm: '',
        email: '',
        trust_my_network: false
    };
    /**
     * Change password
     */
    $scope.changePassword = function (form, input) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var inputAuth = {
            id: input.id,
            password: input.password

        };
        var headers = {
            'Accept-Language': $scope.auth.defaultProfile.lang,
            'ZWAYSession': $scope.auth.defaultProfile.sid
        };
        // Update auth
        dataFactory.putApiWithHeaders('profiles_auth_update', inputAuth.id, input, headers).then(function (response) {
            $scope.loading = false;
            var profile = response.data.data;
            if (!profile) {
                alertify.alertError($scope._t('error_update_data'));
                return;
            }
            profile['email'] = input.email;
            profile['lang'] = $scope.loginLang;
            // Update profile
            dataFactory.putApiWithHeaders('profiles', input.id, profile, headers).then(function (response) {
                $scope.redirectAfterLogin(true, $scope.auth.defaultProfile, input.password, false, '#/dashboard/firstlogin');
                // Update trust my network
                /*dataFactory.putApiWithHeaders('trust_my_network', null, {trustMyNetwork: input.trust_my_network}, headers).then(function (response) {
                 $scope.redirectAfterLogin(input.trust_my_network, $scope.auth.defaultProfile, input.password);
                 }, function (error) {
                 alertify.alertError($scope._t('error_update_data'));
                 return;
                 });*/
            }, function (error) {
                alertify.alertError($scope._t('error_update_data'));
                return;
            });


        }, function (error) {
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
myAppController.controller('PasswordForgotController', function ($scope, $location, dataFactory) {
    $scope.passwordForgot = {
        input: {email: '', token: null, resetUrl: null},
        alert: {message: false, status: 'is-hidden', icon: false}
    };

    /**
     * Send an email
     */
    $scope.sendEmail = function (form) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postApi('password_reset', $scope.passwordForgot.input).then(function (response) {
            $scope.passwordForgot.input.token = response.data.data.token;
            $scope.passwordForgot.input.resetUrl = $location.$$absUrl + '/reset/' + response.data.data.token;
            dataFactory.postToRemote($scope.cfg.post_password_request_url, $scope.passwordForgot.input).then(function (rdata) {
                $scope.passwordForgot.alert = {message: $scope._t('password_forgot_success'), status: 'alert-success', icon: 'fa-check'};
                $scope.loading = false;
            }, function (error) {
                alertify.alertError($scope._t('error_500'));
                $scope.loading = false;
            });
        }, function (error) {
            alertify.alertError($scope._t('error_500'));
            $scope.loading = false;
        });

    };

});

/**
 * Password reset controller
 */
myAppController.controller('PasswordResetController', function ($scope, $routeParams, dataFactory) {
    $scope.passwordReset = {
        input: {userId: null, password: '', passwordConfirm: '', token: $routeParams.token},
        alert: {message: false, status: 'is-hidden', icon: false}
    };
    /**
     * Check a valid token
     */
    $scope.checkToken = function () {
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('loading')};
        dataFactory.postApi('password_reset', $scope.passwordReset.input, '?token=' + $scope.passwordReset.input.token).then(function (response) {
            $scope.passwordReset.input.userId = response.data.data.userId;
            $scope.loading = false;
        }, function (error) {
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
    $scope.changePassword = function (form) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.passwordReset.input.userId,
            password: $scope.passwordReset.input.password,
            token: $routeParams.token


        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function (response) {
            $scope.loading = {status: 'loading-fade', icon: 'fa-check text-success', message: $scope._t('success_updated')};
            window.location = '#/';
        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });
    };
});
/**
 * Logout controller
 */
myAppController.controller('LogoutController', function ($scope, dataService, dataFactory) {
    $scope.logout = function () {
        dataService.setRememberMe(null);
        dataFactory.getApi('logout').then(function (response) {
            dataService.logOut();
        });
    };
    $scope.logout();
});