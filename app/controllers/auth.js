/**
 * @overview Controllers that handle the authentication of existing users, as well as forgot password.
 * @author Martin Vach
 */

/**
 * This is the Auth root controller
 * @class AuthController
 */
myAppController.controller('AuthController', function($scope, $routeParams, $location, $cookies, $window, $q, $timeout, cfg, dataFactory, dataService, _) {
	$scope.auth = {
		remoteId: null,
		firstaccess: false,
		defaultProfile: false,
		fromexpert: $routeParams.fromexpert
	};
	$scope.jamesbox = {
		first_start_up: '',
		count_of_reconnects: 0
	};


	/**
	 * Login with selected data from server response
	 */
	$scope.processUser = function(user, rememberme) {

		if (user.lang) { // If user language exits use from profile
			$cookies.lang = user.lang;
		} else { // Uses from selected login language
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
	$scope.redirectAfterLogin = function(trust, user, password, rememberme, url) {
		var location = url || '#/dashboard';
		$scope.processUser(user, rememberme);
		if ($scope.auth.fromexpert) {
			window.location.href = $scope.cfg.expert_url;
			return;
		}
		if (cfg.app_type === 'jb' && user.role === 1) {
			getZwaveApiData(location);
		} else {
			window.location = location;
			$window.location.reload();
		}
	};

	/**
	 * Logout from expert
	 */
	$scope.logoutFromExpert = function() {
		dataService.setRememberMe(null);
		dataService.setUser(null);
		dataService.setZWAYSession(null);
	};
	if ($scope.auth.fromexpert) {
		$scope.logoutFromExpert();
		return;
	}


	if (dataService.getUser()) {
		$scope.auth.form = false;
		if (cfg.route.os !== 'PoppApp_Z_Way') {
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
			dataFactory.getApi('remote_id'),
			dataFactory.getApi('firstaccess'),
			dataFactory.getApi('ip_address')
		];

		$q.allSettled(promises).then(function(response) {
			var remoteId = response[0],
				firstAccess = response[1],
				ipAddress = response[2];

			$scope.loading = false;
			// Error message
			if (firstAccess.state === 'rejected') {
				angular.extend(cfg.route.alert, {
					message: $scope._t('error_load_data')
				});
			}

			// Success - remote ID
			if (remoteId.state === 'fulfilled') {
				$scope.auth.remoteId = remoteId.value.data.data.remote_id;
			}

			// Success - first access
			if (firstAccess.state === 'fulfilled') {
				$scope.auth.firstaccess = firstAccess.value.data.data.firstaccess;
				$scope.auth.defaultProfile = firstAccess.value.data.data.defaultProfile;
			}

			// Success - IP address
			if (ipAddress.state === 'fulfilled') {
				$scope.auth.ipAddress = ipAddress.value.data.data.ip_address;
			}
		});
	};
	$scope.allSettled();

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
	 * Gez zwave api data
	 */
	function getZwaveApiData(location) {
		//var location = '#/dashboard';
		dataFactory.loadZwaveApiData().then(function(response) {
			if (!response) {
				return;
			}
			var input = {
				uuid: response.controller.data.uuid.value
			};
			jamesBoxRequest(input, location);
		}, function(error) {
			window.location = location;
			$window.location.reload();
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
			window.location = location;
			$window.location.reload();
		}, function(error) {
			window.location = location;
			$window.location.reload();
		});
	};
});

/**
 * The controller that handles login process.
 * @class AuthLoginController
 */
myAppController.controller('AuthLoginController', function($scope, $location, $window, $routeParams, $cookies, cfg, dataFactory, dataService, _) {
	$scope.input = {
		password: '',
		login: '',
		rememberme: false
	};
	/**
	 * Get session (ie for users holding only a session id, or users that require no login)
	 */
	$scope.getSession = function() {
		var hasCookie = ($cookies.user) ? true : false;
		dataFactory.sessionApi().then(function(response) {
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
			var rememberme = (input.rememberme ? input : null);
			var location = '#/dashboard';
			var profile = _.omit(response.data.data, 'color', 'dashboard', 'hide_single_device_events', 'rooms', 'salt');
			if (response.data.data.showWelcome) {
				location = '#/dashboard/firstlogin';
				profile = _.omit(profile, 'showWelcome');
			}
			$scope.redirectAfterLogin(true, profile, input.password, rememberme, location);
		}, function(error) {
			$scope.loading = false;
			var message = $scope._t('error_load_data');
			if (error.status == 401) {
				message = $scope._t('error_load_user');
			}
			alertify.alertError(message);
		});
	};

	// Login from url, remember me or session

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
 * The controller that handles first access and password update.
 * @class AuthFirstAccessController
 */
myAppController.controller('AuthFirstAccessController', function($scope, $q, $window, $interval, cfg, dataFactory, dataService) {
	$scope.input = {
		id: 1, //$scope.auth.defaultProfile.id,
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

	$scope.speechAssistans = {
		alexa: {
			iconPath: "",
			input: {
				instanceId: "0",
				id: "0",
				moduleId: "Alexa",
				active: false,
				params: {
					assign_room: false,
					devices: []
				}
			}
		},
		google_home: {
			iconPath: "",
			input: {
				instanceId: "0",
				id: "0",
				moduleId: "GoogleHome",
				active: false,
				params: {
					assign_room: false,
					devices: []
				}
			}
		}
	}

	$scope.moduleMediaUrl = $scope.cfg.server_url + $scope.cfg.api_url + 'load/modulemedia/';

	$scope.loadSpeechAssistans = function() {
		var promises = [
			dataFactory.getApi('modules', '/Alexa'),
			dataFactory.getApi('modules', '/GoogleHome')
		];

		$q.allSettled(promises).then(function(response) {
			var alexa = response[0],
				google_home = response[1];

			// Success - alexa
			if (alexa.state === 'fulfilled') {
				$scope.speechAssistans.alexa.iconPath = $scope.moduleMediaUrl + $scope.speechAssistans.alexa.input.moduleId + '/' + alexa.value.data.data.icon;

			}
			// Success - google_home
			if (google_home.state === 'fulfilled') {
				$scope.speechAssistans.google_home.iconPath = $scope.moduleMediaUrl + $scope.speechAssistans.google_home.input.moduleId + '/' + google_home.value.data.data.icon;
			}
		});
	};
	$scope.loadSpeechAssistans();

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
	if ($scope.isInArray(['jb'], cfg.app_type)) {
		$scope.allSettled();
	}

	$scope.createSpeechAssistantsInstances = function() {
		var alexa = {
				done: false,
				error: true
			},
			google_home = {
				done: false,
				error: true
			};
		// create alexa instance
		if ($scope.speechAssistans.alexa.input.active) {
			console.log("$scope.speechAssistans.alexa.input", $scope.speechAssistans.alexa.input);
			dataFactory.storeApi('instances', parseInt($scope.speechAssistans.alexa.input.instanceId, 10), $scope.speechAssistans.alexa.input).then(function(response) {
				alexa.done = true;
				alexa.error = false;
			}, function(error) {
				alexa.done = true;
			});
		} else {
			alexa.done = true;
			alexa.error = false;
		}

		// create google home instance
		if ($scope.speechAssistans.google_home.input.active) {
			console.log("$scope.speechAssistans.google_home.input", $scope.speechAssistans.google_home.input);
			dataFactory.storeApi('instances', parseInt($scope.speechAssistans.google_home.input.instanceId, 10), $scope.speechAssistans.google_home.input).then(function(response) {
				google_home.done = true;
				google_home.error = false;
			}, function(error) {
				google_home.done = true;
			});
		} else {
			google_home.done = true;
			google_home.error = false;
		}

		var timer = $interval(function() {
			if (alexa.done && google_home.done) {
				$interval.cancel(timer);
				if (alexa.error || google_home.error) {
					alertify.alertError($scope._t('error_update_data'));
				}
			}
		}, 1000);
	};

	/**
	 * Update profile with data from the first access form
	 */
	$scope.updateFirstAccess = function(form, input, instance) {
		$scope.loading = {
			status: 'loading-spin',
			icon: 'fa-spinner fa-spin',
			message: $scope._t('updating')
		};
		var inputAuth = {
			id: input.id,
			password: input.password,
			lang: $scope.loginLang

		};
		var headers = {
			'Accept-Language': $scope.auth.defaultProfile.lang,
			'ZWAYSession': $scope.auth.defaultProfile.sid
		};

		// create speech assistants  
		$scope.createSpeechAssistantsInstances();

		//Update auth
		dataFactory.putApiWithHeaders('profiles_auth_update', inputAuth.id, input, headers).then(function(response) {
			$scope.loading = false;
			var profile = response.data.data;
			if (!profile) {
				alertify.alertError($scope._t('error_update_data'));
				return;
			}
			profile['email'] = input.email;
			profile['lang'] = $scope.loginLang;
			// Update profile
			dataFactory.putApiWithHeaders('profiles', input.id, profile, headers).then(function(response) {
				//$scope.user
				if (cfg.app_type === 'jb' && $scope.handleTimezone.show && $scope.handleTimezone.changed) {
					$scope.updateInstance(instance);
				} else {
					$scope.redirectAfterLogin(true, response.data.data, input.password, false, '#/dashboard/firstlogin');
				}
			}, function(error) {
				alertify.alertError($scope._t('error_update_data'));
				return;
			});


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
		dataService.setRememberMe(null);
		dataFactory.getApi('logout').then(function(response) {
			dataService.logOut();
		});
	};
	$scope.logout();
});