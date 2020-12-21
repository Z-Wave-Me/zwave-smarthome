/**
 * Session controller
 * @author Itckovich Aleksei
 */

/**
 * The controller that renders and handles user data.
 * @class MySettingsSessionController
 */

myAppController.controller('MySettingsSessionController', function ($scope, $window, $cookies, $timeout, $filter, $q, cfg, dataFactory, dataService, myCache) {
    /**
     * Check mobile
     */
    $scope.isMobile = false;
    const mediaQueryList = $window.matchMedia("only screen and (max-width: 767px)");
    const handleOrientationChange = mql => $scope.isMobile = mql.matches;
    handleOrientationChange(mediaQueryList);
    mediaQueryList.addEventListener('change', handleOrientationChange);
    /**
     * Remove auth token
     */
    $scope.removeToken = (token, profileId) => {
        dataFactory.deleteApi('profiles', profileId, '/token/' + token).then(function (response) {
            myCache.remove('profiles');
            dataService.showNotifier({message: $scope._t('delete_successful')});
            $scope.loading = false;
            $scope.allSettled();
        }, function (error) {
            $scope.loading = false;
            alertify.alertError($scope._t('error_delete_data'));
        });
    }
    $scope.removeAuthToken = function (profileId, token, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            $scope.removeToken(token, profileId);
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
    };

    /**
     * Remove all auth tokens
     */
    $scope.removeAllAuthTokens = function (profileId, tokens, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('deleting')};
            const curToken = $cookies.ZWAYSession;
            tokens.forEach(d => {
                const token = d.sid;
                if (curToken.substring(0, 6) !== token.substring(0, 6)) {
                    $scope.removeToken(token, profileId);
                }
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
    };

    /**
     * Make auth token permanent
     */
    $scope.permanentAuthToken = function (profileId, token, message) {
        alertify.confirm(message, function () {
            $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
            dataFactory.putApi('profiles', profileId, {}, '/token/' + token).then(function (response) {
                myCache.remove('profiles');
                dataService.showNotifier({message: $scope._t('success_updated')});
                $scope.loading = false;
                $scope.allSettled();
            }, function (error) {
                $scope.loading = false;
                alertify.alertError($scope._t('error_update_data'));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
    };

    /**
     * Create/Update a profile
     */
    $scope.store = function (form, input) {
        if (form.$invalid) {
            return;
        }

        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        dataFactory.putApi('profiles', input.id, input).then(function (response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }

            // Email change --> update e-mail cloudbackup if instance exist
            if ($scope.user.role == 1) {
                if ($scope.lastEmail != input.email) {
                    var promises = [
                        dataFactory.getApi('instances', '/CloudBackup')
                    ];

                    $q.allSettled(promises).then(function (response) {
                        var instance = response[0];

                        if (instance.state === 'rejected') {
                            return;
                        }

                        if (instance.state === 'fulfilled') {
                            var instanceData = instance.value.data.data[0];
                            instanceData.params.email = input.email;
                            dataFactory.putApi('instances', instanceData.id, instanceData).then(function (response) {
                                $scope.lastEmail = input.email
                            }, function (error) {
                                alertify.alertError($scope._t('error_update_data'));
                            });
                        }
                    });
                }
            }

            $scope.loading = false;
            $cookies.lang = input.lang;
            myCache.remove('profiles');
            dataService.setUser(data);
            dataService.showNotifier({message: $scope._t('success_updated')});
            $timeout(function () {
                $scope.loading = {status: 'loading-spin', icon: '--', message: $scope._t('reloading_page')};
                alertify.dismissAll();
                $window.location.reload();
            }, 2000);

        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status == 409) {
                message = ($filter('hasNode')(error, 'data.error') ? $scope._t(error.data.error) : message);
            }
            alertify.alertError(message);
            $scope.loading = false;
        });
    };


    /**
     * Change password
     */
    $scope.changePassword = function (form, newPassword) {
        if (form.$invalid) {
            return;
        }
        $scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('updating')};
        var input = {
            id: $scope.id,
            password: newPassword

        };
        dataFactory.putApi('profiles_auth_update', input.id, input).then(function (response) {
            var data = response.data.data;
            if (!data) {
                alertify.alertError($scope._t('error_update_data'));
                $scope.loading = false;
                return;
            }
            dataService.showNotifier({message: $scope._t('success_updated')});
            dataService.goBack();

        }, function (error) {
            alertify.alertError($scope._t('error_update_data'));
            $scope.loading = false;
        });

    };
});
