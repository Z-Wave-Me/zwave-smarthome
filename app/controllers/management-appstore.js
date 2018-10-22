/**
 * @overview The controller that renders and handles app store data.
 * @author Martin Vach
 */

/**
 * The controller that renders and handles app store data.
 * @class ManagementAppStoreController
 */
myAppController.controller('ManagementAppStoreController', function ($scope, dataFactory, dataService) {
    $scope.appStore = {
        input: {
            token: ''
        },
        tokens: {}

    };

    /**
     * Load tokens
     */
    $scope.appStoreLoadTokens = function () {
        dataFactory.getApi('tokens', null, true).then(function (response) {
            angular.extend($scope.appStore.tokens, response.data.data.tokens);
        }, function (error) {
        });
    };
    $scope.appStoreLoadTokens();

    /**
     * Create/Update a token
     */
    $scope.appStoreAddToken = function () {
        if ($scope.appStore.input.token === '') {
            return;
        }
        dataFactory.putApiFormdata('tokens', $scope.appStore.input).then(function (response) {
            $scope.appStore.input.token = '';
            $scope.appStoreLoadTokens();
        }, function (error) {
            var message = $scope._t('error_update_data');
            if (error.status === 409) {
                message = $scope._t('notunique_token') + ' - ' + $scope.appStore.input.token;
            }
            alertify.alertError(message);
        });

    };

    /**
     * Remove token from the list
     */
    $scope.appStoreRemoveToken = function (token, message) {
        alertify.confirm(message, function () {
            dataFactory.deleteApiFormdata('tokens', {token: token}).then(function (response) {
                angular.extend($scope.appStore, response.data.data);
                ;
            }, function (error) {
                alertify.alertError($scope._t('error_delete_data'));
            });
        }).setting('labels', {
            'ok': $scope._t('ok')
        });
        return;
    };

    /// --- Private functions --- ///


});
