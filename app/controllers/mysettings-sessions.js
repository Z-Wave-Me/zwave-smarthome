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
    var mediaQueryList = $window.matchMedia("only screen and (max-width: 767px)");
    var handleOrientationChange = function(mql) { $scope.isMobile = mql.matches };
    handleOrientationChange(mediaQueryList);
    mediaQueryList.addEventListener('change', handleOrientationChange);
    /**
     * Remove auth token
     */
    $scope.removeToken = function(token, profileId) {
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
            var curToken = $cookies.ZWAYSession;
            tokens.forEach(function(d) {
                var token = d.sid;
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
