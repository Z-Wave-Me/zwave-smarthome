/**
 * @overview Controllers manage and add mobile devices.
 * @author Michael Hensche
 */


/**
 * The controller that manage mobile devices.
 * @class MobileManageController
 */
myAppController.controller('MobileManageController', function($scope, $q, $filter, dataFactory, dataService, _) {
    $scope.mobile = {
        input: {}
    };

    $scope.allSettled = function() {
        $scope.loading = {
            status: 'loading-spin',
            icon: 'fa-spinner fa-spin',
            message: $scope._t('loading')
        };

        var promises = [
            dataFactory.getApi('mobile_app_support', false, true)
        ];

        $q.allSettled(promises).then(function(response) {
            $scope.loading = false;

            var result = response[0];

            if (result.state == 'rejected') {
                // Error
                angular.extend(cfg.route.alert, {
                    message: $scope._t('error_load_data')
                });
                return;
            }

            if (result.state == 'fulfilled') {
                // transform app data
                var apps = result.value.data.map(function(app) {
                    angular.extend(app, {
                        last_seen_formated: $filter('dateTimeFromTimestamp')(app.last_seen),
                        created_formated: $filter('dateTimeFromTimestamp')(app.created)
                    });
                    return app;
                });

                $scope.mobile.input.apps = apps;
            }
        });
    }
    $scope.allSettled();


    /**
     * Remove app from List
     */
    $scope.removeApp = function(token, app_profile) {
        var data = {
            token: token,
            profileId: app_profile
        };
        dataFactory.deleteApiJSON('mobile_app_support', data).then(function(response) {
            var apps = $scope.mobile.input.apps;

            apps = _.without(apps, _.findWhere(apps, {token: token, app_profile: app_profile}));
            $scope.mobile.input.apps = apps;

            console.log("response", response);
        },function(error) {
            console.log("error", error);
        });
    };
});


/**
 * The controller that show that show or update the QR-Code.
 * @class MobileAddController
 */
myAppController.controller('MobileAddController', function ($scope, $timeout, $window, $location, dataFactory, dataService, _) {
    $scope.qrcode = "";

    /**
     *  Add Qrcode
     */
    $scope.addQRCode = function(id) {
        alertify.prompt($scope._t('verify_qrcode'), "", function(evt, pass) {
            var data = {
                "password": pass
            };
            $scope.toggleRowSpinner(id);
            dataFactory.postApi('profiles', data, '/qrcode/'+$scope.user.id).then(function(response) {
                dataService.showNotifier({message: $scope._t('success_updated')});

                QRCode.toDataURL(response.data.data, function(err, url) { $scope.qrcode = url; });
                $scope.toggleRowSpinner(id);
            }, function(error) {
                $scope.toggleRowSpinner(id);
                if(error.data.error == "wrong_password") {
                    alertify.alertError($scope._t('wrong_password'));
                } else {
                    alertify.alertError($scope._t('error_update_data'));
                }
            });
        }).set('type', 'password');
    }


    /**
     * extend handle Modal function
     * @param  {string} modal  modal name
     * @param  {object} $event
     */
    $scope.handleMobileModal = function(modal, $event) {
        $scope.handleModal(modal, $event);
        if($location.path() == '/mobile/manage') {
            $scope.reloadData();
        }
    }
});