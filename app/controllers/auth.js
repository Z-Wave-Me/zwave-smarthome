/**
 * @overview Controllers that handle the authentication of existing users, as well as forgot password.
 * @author Martin Vach
 */

/**
 * This is the Auth root controller
 * @class AuthController
 */
myAppController.controller('AuthController', function($scope, $routeParams, $location, $cookies, $window, $q, $timeout, cfg, dataFactory, dataService, _) {
	$scope.authCtrl.remoteId = null;
	$scope.authCtrl.firstaccess = false;
	$scope.authCtrl.defaultProfile = false;
	$scope.authCtrl.fromexpert = $routeParams.fromexpert;
	$scope.authCtrl.fromzigxpert = $routeParams.fromzigxpert;
	$scope.authCtrl.frommatterxpert = $routeParams.frommatterxpert;
	$scope.jamesbox = {
		first_start_up: '',
		count_of_reconnects: 0
	};

	/**
	 * Login with selected data from server response
	 */
	$scope.processUser = function(user) {

		if (user.lang) { // If user language exits use from profile
			$cookies.lang = user.lang;
		} else { // Uses from selected login language
			user.lang = $scope.loginLang;
		}
		dataService.setZWAYSession(user.sid);
		dataService.setUser(user);
	};

	/**
	 * Redirect
	 */
	$scope.redirectAfterLogin = function(trust, user, password, url) {
		var location = url || '#/dashboard';
		$scope.processUser(user);
		if ($scope.authCtrl.fromexpert) {
			window.location.href = $scope.cfg.expert_url;
			return;
		}
		if ($scope.authCtrl.fromzigxpert) {
			window.location.href = $scope.cfg.zigxpert_url;
			return;
		}
		if ($scope.authCtrl.frommatterxpert) {
			window.location.href = $scope.cfg.matterxpert_url;
			return;
		}
		if ((cfg.app_type === 'zme_hub') && user.role === 1) {
			getZwaveApiData(location)
		} else {
			$timeout(function() {
				$scope.authCtrl.processed = true;
				window.location = location;
				$window.location.reload()
			}, 0);
		}

	};

	/**
	 * Logout from expert
	 */
	$scope.logoutFromExpert = function() {
		dataService.setUser(null);
		dataService.setZWAYSession(null);
	};
	if ($scope.authCtrl.fromexpert || $scope.authCtrl.fromzigxpert || $scope.authCtrl.frommatterxpert) {
		$scope.logoutFromExpert();
		return;
	}

	if (dataService.getUser()) {
		if (cfg.route.os != 'ZWayMobileAppAndroid' && cfg.route.os != 'ZWayMobileAppiOS') {
			$timeout(function() {
				window.location = '#/dashboard';
			}, 0);
		}
		return;
	}
	// IF IE or Edge displays an message
	if (dataService.isIeEdge()) {
		angular.extend(cfg.route.alert, {
			message: $scope._t('ie_edge_not_supported'),
			info: $scope._t('ie_edge_not_supported_info')
		});
	}


	$scope.loginLang = (angular.isDefined($cookies.lang)) ? $cookies.lang : cfg.lang;
	
	$scope.loading = {
		status: 'loading-spin',
		icon: 'fa-spinner fa-spin',
		message: $scope._t('loading')
	};
	
	$scope.getFirstAccess = function() {
		dataFactory.getApiNoToken('firstaccess').then(function(response) {
			$scope.loading = false;
			
			$scope.authCtrl.remoteId = response.data.data.remote_id;
			$scope.authCtrl.firstaccess = response.data.data.firstaccess;
			$scope.authCtrl.defaultProfile = response.data.data.defaultProfile;
			$scope.authCtrl.ipAddress = response.data.data.ip_address;
		}, function(error) {
			$scope.loading = false;
			angular.extend(cfg.route.alert, {
				message: $scope._t('error_load_data')
			});
		});
	}
	$scope.getFirstAccess();

	/**
	 * Login language
	 */
	$scope.setLoginLang = function(lang) {
		$scope.loginLang = lang;
		$cookies.lang = lang;
		$scope.loadLang(lang);
	};



	/// --- Private functions --- ///
	/**
	 * Get zwave api data
	 */
	function getZwaveApiData(location) {
		//var location = '#/dashboard';
		return dataFactory.loadZwaveApiData().then(function(response) {
			if (!response) {
				return;
			}
			var input = {
				uuid: response.controller.data.uuid.value
			};
			jamesBoxRequest(input, location);
		}, function(error) {
			$timeout(function() {
				$scope.authCtrl.processed = true;
				window.location = location;
				$window.location.reload();
			}, 0);
		});
	};

	/**
	 * Get and update system info
	 */
	function jamesBoxSystemInfo(uuid) {
		dataFactory.getApi('system_info', null, true).then(function(response) {
			var input = {
				uuid: uuid,
				first_start_up: response.data.data.first_start_up,
				count_of_reconnects: response.data.data.count_of_reconnects
			};
			dataFactory.postToRemote(cfg.api_remote['jamesbox_updateinfo'], input).then(function(response) {}, function(error) {});
		}, function(error) {});
	};

	/**
	 * JamesBox request
	 */
	function jamesBoxRequest(input, location) {
		//var location = '#/dashboard';
		jamesBoxSystemInfo(input.uuid);
		dataFactory.postToRemote(cfg.api_remote['jamesbox_request'], input).then(function(response) {
			if (!_.isEmpty(response.data)) {
				location = '#/boxupdate';
			}
			$timeout(function() {
				$scope.authCtrl.processed = true;
				window.location = location;
				$window.location.reload();
			}, 0);
		}, function(error) {
			$timeout(function() {
				$scope.authCtrl.processed = true;
				window.location = location;
				$window.location.reload();
			}, 0);
		});
	};
});

/**
 * The controller that handles login process.
 * @class AuthLoginController
 */
myAppController.controller('AuthLoginController', function($scope, $location, $window, $routeParams, $cookies, $timeout, cfg, dataFactory, dataService, _) {
	$scope.input = {
		password: '',
		login: ''
	};

	/**
	 * Get session (ie for users holding only a session id, or users that require no login)
	 */
	$scope.getSession = function() {
		var hasCookie = ($cookies.user) ? true : false;
		var authBearer = typeof $routeParams.authBearer !== 'undefined' && $routeParams.authBearer;
		if(hasCookie || isRemote($location.host()) || authBearer) {
			dataFactory.sessionApi().then(function(response) {
				if ($scope.authCtrl.firstaccess) return; // if we need to show First Access form, stop processing session response (AuthLoginController loads right after AuthController and will be destroyed if firstaccess is true)
				$scope.processUser(response.data.data);
				var location = '#/dashboard';
				if(cfg.route.previous.length > 1) {
					if ($scope._routeParams) {
						// load parameters to redirect correctly on the first page load
						cfg.route.previous += "?" + Object.keys($scope._routeParams).map(function(k) { return k + "=" + $scope._routeParams[k]; }).join("&");
						delete $scope._routeParams;
					}
					location = '#' + cfg.route.previous;
				}
				$timeout(function() {
					$scope.authCtrl.processed = true;
					window.location = location;
					$window.location.reload();
				}, 0);
			});
		}
	};

	/**
	 * Login proccess
	 */
	$scope.login = function(input) {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		$scope.alert = {
			message: false
		};
		dataFactory.logInApi(input).then(function(response) {
			//angular.extend(cfg, {user: response.data.data});
			var location = '#/dashboard';
			var profile = _.omit(response.data.data, 'dashboard', 'hide_single_device_events', 'rooms', 'salt');
			if (response.data.data.showWelcome) {
				location = '#/dashboard/firstlogin';
				profile = _.omit(profile, 'showWelcome');
			}
			$scope.redirectAfterLogin(true, profile, input.password, location);
		}, function(error) {
			$scope.loading = false;
			var message = $scope._t('error_load_data');
			if (error.status == 401) {
				message = $scope._t('error_load_user');
			}
			alertify.alertError(message);
		});
	};

	// Login from url or session

	var path = $location.path().split('/');

	if ($routeParams.login && $routeParams.password) {
		$scope.login($routeParams);
	} else if (typeof $routeParams.logout === 'undefined' || !$routeParams.logout ||
		// only ask for session forwarding if user is not logged out before or the request comes from trusted hosts
		typeof $routeParams.authBearer === 'undefined' || !$routeParams.authBearer ||
		(path[1] === '' && $scope.cfg.find_hosts.indexOf($location.host()) !== -1)) {
		$scope._routeParams = $routeParams; // save parameters to pass them to redirect (in getSession) correctly on the first page load
		$scope.getSession();
	}

	/**
	 * check is location is remote
	 * @param  {string}  location host
	 * @return {Boolean}
	 */
	function isRemote(location) {
		var hosts = $scope.cfg.find_hosts,
			r = false;
		for(var i = 0; i < hosts.length; i++) {
			if(location.indexOf(hosts[i]) > -1) {
				r = true;
				break;
			}
		};
		return r;
	}
});

/**
 * The controller that handles first access and password update.
 * @class AuthFirstAccessController
 */
myAppController.controller('AuthFirstAccessController', function($scope, $q, $window, $interval, cfg, dataFactory, dataService) {
	$scope.input = {
		id: $scope.authCtrl.defaultProfile.id,
		password: '',
		passwordConfirm: '',
		email: ''
	};
	$scope.handleTimezone = {
		instance: {},
		show: false,
		changed: false
	};
	$scope.managementTimezone = {
		labels: {},
		enums: {}
	};
	$scope.reboot = false;

	$scope.checkBoxHolder = [];

	(function preSettingsUpdate() {
		dataFactory.getApi('instances').then(function (response) {
			return response.data.data;
		}).then(function (data) {

				const remoteAccess = data.find(function (el) {
					return el.moduleId === 'RemoteAccess';
				})
				if (remoteAccess) {
					$scope.checkBoxHolder.push(remoteAccess);
				}
				const cloudBackup = data.find(function (el) {
					return el.moduleId === 'CloudBackup';
				})
				if (cloudBackup) {
					cloudBackup.active = false;
					$scope.checkBoxHolder.push(cloudBackup);
				}
			}
		).catch(function (_) {})
	})()

	/**
	 * Load all promises
	 */
	$scope.allSettled = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		var promises = [
			dataFactory.getApi('instances', '/ZMEOpenWRT'),
			dataFactory.getApi('modules', '/ZMEOpenWRT')
		];

		$q.allSettled(promises).then(function(response) {
			var instance = response[0];
			var timezone = response[1];
			$scope.loading = false;
			// Success - instance
			if (instance.state === 'fulfilled' && instance.value.data.data[0].active === true) {
				$scope.handleTimezone.show = true;
				$scope.handleTimezone.instance = instance.value.data.data[0];
			}
			// Success - timezone
			if (timezone.state === 'fulfilled') {
				$scope.managementTimezone.enums = timezone.value.data.data.schema.properties.timezone.enum;
				$scope.managementTimezone.labels = timezone.value.data.data.options.fields.timezone.optionLabels;
			}
		});
	};
	if ($scope.isInArray(['zme_hub'], cfg.app_type)) {
		$scope.allSettled();
	}

	/**
	 * Update profile with data from the first access form
	 */
	$scope.updateFirstAccess = function(instance) {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('updating')
		};
		var inputAuth = {
			id: $scope.input.id,
			password: $scope.input.password,
			lang: $scope.loginLang
		};
		var headers = {
			'Accept-Language': $scope.authCtrl.defaultProfile.lang,
			'ZWAYSession': $scope.authCtrl.defaultProfile.sid
		};

		// Pre Settings
		function preSettings() {
			$scope.checkBoxHolder.map(function (instance) {
				return dataFactory.putApi('instances', instance.id, instance)
			})
		}
		//Update auth
		dataFactory.putApiWithHeaders('profiles_auth_update', inputAuth.id, $scope.input, headers).then(function(response) {
			$scope.loading = false;
			var profile = response.data.data;
			if (!profile) {
				alertify.alertError($scope._t('error_update_data'));
				return;
			}
			profile['email'] = $scope.input.email;
			profile['lang'] = $scope.loginLang;
			preSettings();
			// Update profile
			dataFactory.putApiWithHeaders('profiles', inputAuth.id, profile, headers).then(function(response) {
				var _profile = _.omit(response.data.data, 'dashboard', 'hide_single_device_events', 'rooms', 'salt');
				if ((cfg.app_type === 'zme_hub') && $scope.handleTimezone.show && $scope.handleTimezone.changed) {
					$scope.updateInstance(instance);
				} else if (cfg.route.os != 'ZWayMobileAppAndroid' && cfg.route.os != 'ZWayMobileAppiOS') {
					return $scope.redirectAfterLogin(true, _profile, inputAuth.password, '#/dashboard/firstlogin');
				} else {
					return $scope.redirectAfterLogin(true, _profile, inputAuth.password, '#/dashboard/firstlogin?authBearer');
				}
			}, function(error) {
				alertify.alertError($scope._t('error_update_data'));
			})
		}, function(error) {
			var message = $scope._t('error_update_data');
			if (error.status == 409) {
				message = $scope._t('nonunique_email');
			}
			alertify.alertError(message);
			$scope.loading = false;
		});
	};

	/**
	 * Update instance
	 */
	$scope.updateInstance = function(input) {
		//var input = $scope.handleTimezone.instance;
		if (input.id) {
			dataFactory.putApi('instances', input.id, input).then(function(response) {
				$scope.systemReboot();
			}, function(error) {
				alertify.alertError($scope._t('error_update_data'));
			});
		}
	};

	/**
	 * System reboot
	 */
	$scope.systemReboot = function() {
		//$scope.loading = {status: 'loading-spin', icon: 'fa-spinner fa-spin', message: $scope._t('system_rebooting')};
		var fatalArray = {
			message: $scope._t('system_rebooting'),
			info: $scope._t('connection_refused_reboot'),
			permanent: true,
			hide: true
		};
		angular.extend(cfg.route.alert, fatalArray);
		dataFactory.getApi('system_reboot', '?firstaccess=true').then(function(response) {}, function(error) {
			alertify.alertError($scope._t('error_system_reboot'));
		});

	};

});

/**
 * The controller that sends an e-mail with the link to reset forgotten passwort.
 * @class PasswordForgotController
 */
myAppController.controller('PasswordForgotController', function($scope, $location, dataFactory) {
	$scope.passwordForgot = {
		input: {
			email: '',
			token: null,
			resetUrl: null
		},
		alert: {
			message: false,
			status: 'is-hidden',
			icon: false
		}
	};

	/**
	 * Send an email
	 */
	$scope.sendEmail = function(form) {
		if (form.$invalid) {
			return;
		}
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		dataFactory.postApi('password_reset', $scope.passwordForgot.input).then(function(response) {
			$scope.passwordForgot.input.token = response.data.data.token;
			$scope.passwordForgot.input.resetUrl = $location.$$absUrl + '/reset/' + response.data.data.token;
			dataFactory.postToRemote($scope.cfg.post_password_request_url, $scope.passwordForgot.input).then(function(rdata) {
				$scope.passwordForgot.alert = {
					message: $scope._t('password_forgot_success'),
					status: 'alert-success',
					icon: 'fa-check'
				};
				$scope.loading = false;
			}, function(error) {
				alertify.alertError($scope._t('error_500'));
				$scope.loading = false;
			});
		}, function(error) {
			var message = '';

			switch (error.status) {
				case 404:
					message = $scope._t('email_not_found');
					break;
				case 409:
					message = $scope._t('error_409') +'. '+ $scope._t('error_pwd_restore_request') + $scope.passwordForgot.input.email + ' '+ $scope._t('pwd_restore_check_mail');
					break;
				default:
					message = $scope._t('error_500') + (response.data.error? ': ' + response.data.error.toString() : '');
			}

			alertify.alertError(message);
			$scope.loading = false;
		});

	};

});

/**
 * The controller that handles reset password actions.
 * @class PasswordResetController
 */
myAppController.controller('PasswordResetController', function($scope, $routeParams, dataFactory) {
	$scope.passwordReset = {
		input: {
			userId: null,
			password: '',
			passwordConfirm: '',
			token: $routeParams.token
		},
		alert: {
			message: false,
			status: 'is-hidden',
			icon: false
		}
	};
	/**
	 * Check a valid token
	 */
	$scope.checkToken = function() {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('loading')
		};
		dataFactory.postApi('password_reset', $scope.passwordReset.input, '?token=' + $scope.passwordReset.input.token).then(function(response) {
			$scope.passwordReset.input.userId = response.data.data.userId;
			$scope.loading = false;
		}, function(error) {
			var message = $scope._t('error_500');
			if (error.status == 404) {
				message = $scope._t('token_notfound');
			}
			$scope.loading = false;
			$scope.passwordReset.alert = {
				message: message,
				status: 'alert-danger',
				icon: 'fa-warning'
			};
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
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('updating')
		};
		var input = {
			id: $scope.passwordReset.input.userId,
			password: $scope.passwordReset.input.password,
			token: $routeParams.token


		};
		dataFactory.putApi('profiles_auth_update', input.id, input).then(function(response) {
			$scope.loading = {
				status: 'loading-fade',
				icon: 'fa-check text-success',
				message: $scope._t('success_updated')
			};
			window.location = '#/';
		}, function(error) {
			alertify.alertError($scope._t('error_update_data'));
			$scope.loading = false;
		});
	};
});
/**
 * The controller that handles logout process.
 * @class LogoutController
 */
myAppController.controller('LogoutController', function($scope, dataService, dataFactory) {
	/**
	 * Logout an user
	 */
	$scope.logout = function() {
		dataFactory.getApi('logout').then(function(response) {
			dataService.logOut();
		});
	};
	$scope.logout();
});
