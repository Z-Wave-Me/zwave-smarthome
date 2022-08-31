/**
 * @overview Common Angular directives that are used within the views.
 * @author Martin Vach
 */

/**
 * Test directive
 * @class bbGoBack
 */
myApp.directive('bbTest', function(_) {
	return {
		restrict: 'E',
		scope: {
			val: '='
		},
		template: '<pre ng-if="show">{{show|json}}</pre>',
		link: function(scope, element, attrs) {
			scope.show = false;
			scope.$watchCollection('val', function(newValue, oldValue) {
				if (!_.isEqual(newValue, oldValue)) {
					scope.show = newValue;
					console.log('OLD', oldValue);
					console.log('NEW', newValue);
					console.log('I see a data change!', scope.val);
				}


			});
		}
	};
});

/**
 * Window history back
 * @class bbGoBack
 */
myApp.directive('bbGoBack', ['$window', function($window) {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			elem.bind('click', function() {
				$window.history.back();
			});
		}
	};
}]);

/**
 * Displays a page loader
 * @class bbLoader
 */
myApp.directive('bbLoader', function() {
	return {
		restrict: "E",
		replace: true,
		template: '<div id="loading" ng-show="loading" ng-class="loading.status"><div class="loading-in">' +
			'<i class="fas fa-lg" ng-class="loading.icon"></i> <span ng-bind-html="loading.message|toTrusted"></span>' +
			'</div></div>'
	};
});

/**
 *
 * Displays a spinner
 * @class bbRowSpinner
 */
myApp.directive('bbRowSpinner', function() {
	return {
		restrict: "E",
		replace: true,
		scope: {
			label: '=',
			spinner: '=',
			icon: '=',
			core: '=',
			labelClass: '@'
		},
		template: '<span title="{{label}}"><span class="btn-spin">' +
			'<i ng-class="spinner ? \'fa fa-spinner fa-spin\' : (icon ? ((core ? core : \'fa\') + \' \' + icon) : \'\')"></i>' +
			'</span> ' +
			'<span class="btn-label" ng-class="labelClass" ng-if="label">' +
			'{{label}}' +
			'</span></span>',
	};
});

/**
 * Displays an alert message within the div
 * @class bbAlert
 */
myApp.directive('bbAlert', function() {
	return {
		restrict: "E",
		replace: true,
		scope: {
			alert: '='
		},
		template: '<div class="alert" ng-if="alert.message" ng-class="alert.status">' +
			'<i class="fas fa-lg" ng-class="alert.icon"></i> <span ng-bind-html="alert.message|toTrusted"></span>' +
			'</div>'
	};
});

/**
 * Displays an alert message within the span
 * @class bbAlertText
 */
myApp.directive('bbAlertText', function() {
	return {
		restrict: "E",
		replace: true,
		scope: {
			alert: '='
		},
		template: '<span class="alert" ng-if="alert.message" ng-class="alert.status">' +
			'<i class="fas fa-lg" ng-class="alert.icon"></i> <span ng-bind-html="alert.message|toTrusted"></span>' +
			'</span>'
	};
});

/**
 * Displays a HTML help page
 * @class bbHelp
 */
myApp.directive('bbHelp', function($sce, dataFactory, cfg) {
	var trusted = {};
	return {
		restrict: "E",
		replace: true,
		template: '<span class="clickable" ng-click="showHelp();handleModal(\'helpModal\', $event)"><i class="fas fa-question-circle fa-lg text-info"></i>' +
			'<div id="helpModal" class="appmodal" ng-if="modalArr.helpModal"><div class="appmodal-in">' +
			'<div class="appmodal-header">' +
			'<h3>{{cfg.app_name}}</h3>' +
			'<span class="appmodal-close" ng-click="handleModal(\'helpModal\', $event)"><i class="fas fa-times"></i></span>' +
			'</div>' +
			'<div class="appmodal-body" ng-bind-html="getSafeHtml(helpData)"></div>' +
			'</div></div>' +
			'</span>',
		link: function(scope, elem, attrs) {
			scope.file = attrs.file;
			scope.helpData = null;
			scope.show = false;
			scope.showHelp = function() {
				var defaultLang = 'en';
				var lang = attrs.lang;
				var helpFile = scope.file + '.' + lang + '.html';
				// Load help file for given language
				dataFactory.getHelp(helpFile).then(function(response) {
					scope.helpData = response.data;
					scope.show = true;

				}, function(error) {
					// Load help file for default language
					helpFile = scope.file + '.' + defaultLang + '.html';
					dataFactory.getHelp(helpFile).then(function(response) {
						scope.helpData = response.data;
					}, function(error) {
						alertify.alertError(scope._t('error_load_data'));
					});
				});
			};
			scope.getSafeHtml = function(html) {
				return trusted[html] || (trusted[html] = $sce.trustAsHtml(html));
			};
		}
	};
});

/**
 * Displays a help text
 * @class bbHelpText
 */
myApp.directive('bbHelpText', function() {
	return {
		restrict: "E",
		replace: true,
		scope: {
			trans: '=',
			icon: '='
		},
		template: '<span class="help-text"><i class="fas text-info" ng-class="icon ? icon : \' fa-info-circle\'"></i> {{trans}}</span>'
	};
});

/**
 * Displays a validation error
 * @class bbValidator
 */
myApp.directive('bbValidator', function($window) {
	return {
		restrict: "E",
		replace: true,
		scope: {
			inputName: '=',
			trans: '=',
			hasBlur: '='
		},
		template: '<div class="valid-error text-danger" ng-if="inputName && !inputName.$pristine && hasBlur">*{{trans}}</div>'
	};
});
/**
 * Auto focus for input box
 * @class focus
 */
myApp.directive('focus', function($timeout) {
	return {
		scope: {
			trigger: '@focus'
		},
		link: function(scope, element) {
			scope.$watch('trigger', function(value) {
				if (value) {
					$timeout(function() {
						element[0].focus();
					});
				}
			});
		}
	};
});
/**
 * Watch for an error loading an image and to replace the src
 * @class errSrc
 */
myApp.directive('errSrc', function() {
	return {
		link: function(scope, element, attrs) {
			element.bind('error', function() {
				if (attrs.src != attrs.errSrc) {
					attrs.$set('src', attrs.errSrc);
				} else if (attrs.errSrc2 && attrs.src != attrs.errSrc2) {
					attrs.$set('src', attrs.errSrc2);
				} else if (attrs.errSrc3 && attrs.src != attrs.errSrc2 && attrs.src != attrs.errSrc3 && attrs.errSrc2 != attrs.errSrc3) {
					attrs.$set('src', attrs.errSrc3);
				}
			});
			// Displays the error image when ngSrc is blank
			attrs.$observe('ngSrc', function(value) {
				if (!value && attrs.errSrc) {
					attrs.$set('src', attrs.errSrc);
				} else if (!value && attrs.errSrc2) {
					attrs.$set('src', attrs.errSrc2);
				} else if (!value && attrs.errSrc3) {
					attrs.$set('src', attrs.errSrc3);
				}
			});
		}
	}
});
/**
 * Bind class toggle to window scroll event
 * @class bindClassOnScroll
 */
myApp.directive('bindClassOnScroll', function($window) {
	return {
		restrict: 'A',
		scope: {
			offset: "@",
			scrollClass: "@"
		},
		link: function(scope, element) {
			angular.element($window).bind("scroll", function() {
				if (this.pageYOffset >= parseInt(scope.offset)) {
					element.addClass(scope.scrollClass);
				} else {
					element.removeClass(scope.scrollClass);
				}
			});
		}
	};
})

/**
 * Compare two values
 * @class bbCompareTo
 */
myApp.directive("bbCompareTo", function() {
	return {
		require: "ngModel",
		link: function(scope, elem, attrs, ctrl) {
			var otherInput = elem.inheritedData("$formController")[attrs.bbCompareTo];

			ctrl.$parsers.push(function(value) {
				if (value === otherInput.$viewValue) {
					ctrl.$setValidity("compareto", true);
					return value;
				}
				ctrl.$setValidity("compareto", false);
			});

			otherInput.$parsers.push(function(value) {
				ctrl.$setValidity("compareto", value === ctrl.$viewValue);
				return value;
			});
		}
	};
});
/**
 * Parse value as int
 * @class bbCompareTo
 */
myApp.directive('bbInteger', function() {
	return {
		require: 'ngModel',
		link: function(scope, ele, attr, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				return parseInt(viewValue, 10);
			});
		}
	};
});

// Knob directive
myApp.directive('knob', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$(element).val(25).knob();
		}
	};
});

/**
 * Displays a knob
 * @class myknob
 */
myApp.directive('myknob', ['$timeout', 'dataFactory', function($timeout, dataFactory, dataService) {
	'use strict';

	return {
		restrict: 'A',
		replace: true,
		//template: '<input class="dial" data-width="100" data-height="100" value="{{ knobData }}"/>',
		scope: {
			knobId: '=',
			knobData: '=',
			knobStep: '=',
			knobMin: '=',
			knobMax: '=',
			knobOptions: '&'
		},
		link: function($scope, $element) {
			var knobInit = $scope.knobOptions() || {};
			knobInit.step = $scope.knobStep || 1;
			if (typeof($scope.knobMin) !== 'undefined') {
				knobInit.min = $scope.knobMin;
			}
			if (typeof($scope.knobMax) !== 'undefined') {
				knobInit.max = $scope.knobMax;
			}

			knobInit.release = function(newValue) {
				//console.log(knobInit)
				$timeout(function() {
					var old = parseFloat($scope.knobData);

					//console.log('myKnob directive - Bafore request new/old: ', typeof newValue, typeof old);
					if (old != newValue) {
						//console.log('myKnob directive - Sending request new/old: ',newValue, old)
						$scope.knobData = newValue;
						if($scope.knobId.indexOf("#") == -1) {
							runCmdExact($scope.knobId, newValue);
						}
						$scope.$apply();
					}
				});
			};

			$scope.$watch('knobData', function(newValue, oldValue) {
				newValue = parseFloat(newValue);
				oldValue = parseFloat(oldValue);
				//console.log("newvalue",typeof newValue);
				//console.log("oldValue",typeof oldValue);
				if (newValue != oldValue) {
					$($element).val(newValue).change();
				}
			});

			$($element).val($scope.knobData).knob(knobInit);
		}
	};

	/**
	 * Run command exact value
	 * @param {int} id
	 * @param {int} val
	 * @returns {undefined}
	 */
	function runCmdExact(id, val) {
		//console.log('Knob from directive:',val)
		var cmd = id + '/command/exact?level=' + val;
		dataFactory.runApiCmd(cmd).then(function(response) {
			//console.log('myKnob directive - request success: ',cmd)
		}, function(error) {});
		return;
	};
}]);

/**
 * Displays a confirm dialog after click
 * @class ngConfirmClick
 */
myApp.directive('ngConfirmClick', [
	function() {
		return {
			priority: -1,
			restrict: 'A',
			link: function(scope, element, attrs) {
				element.bind('click', function(e) {
					var message = attrs.ngConfirmClick;
					if (message && !confirm(message)) {
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				});
			}
		};
	}
]);

/**
 * Upload a file
 * @class fileModel
 */
myApp.directive('fileModel', ['$parse', function($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;

			element.bind('change', function() {
				scope.$apply(function() {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}]);

/**
 * Catch a key event
 * @class bbKeyEvent
 */
myApp.directive('bbKeyEvent', function() {
	return function(scope, element, attrs) {
		element.bind("keyup", function(event) {
			if (event.which !== 13) {
				scope.$apply(function() {
					scope.$eval(attrs.bbKeyEvent);
				});

				event.preventDefault();
			}
		});
	};
});
/**
 * Submit form on pressing Enter (without <form> tag)
 * @class enterSubmit
 */
myApp.directive('enterSubmit', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('keydown', function(event) {
				var code = event.keyCode || event.which;
				if (code === 13) {
					if (!event.shiftKey) {
						scope.$apply(function() {
							scope.$eval(attrs.enterSubmit);
						});

						event.preventDefault();
					}
				}
			});
		}
	}

});

/**
 * Navigate DSK form fields with value === 5 or arrow keys
 */
myApp.directive('bbDskNavigate', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			setTimeout(function () {
				elem.find('input').on('keyup', function(e) {
					switch (e.key) {
						case 'ArrowRight': // Focus next input with right arrow key
							$(this).closest('span').next().find('input').focus();
							break;
						case 'ArrowLeft': // Focus previous input with left arrow key
							$(this).closest('span').prev().find('input').focus();
							break;
						default: // Focus next input if input value length = 5
							if ($(this).val().length === 5) {
								$(this).closest('span').next().find('input').focus();
							}
							break;
					}
				});
			}, 0);

		}
	};
});

/**
 * Toggle accordion
 */
myApp.directive('bbAccordion', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			elem.on('click', function(e) {
				var isCollapsed = (elem.attr('aria-expanded') === 'false');
				var wrap = elem.closest('.accordion-wrap');
				// Collapse and reset all children accordions
				wrap.closest("[data-collapse-all]").children().each(function() {
					$(this).removeClass('active');
					$(this).find('.accordion-toggle:first').find('button:first').attr('aria-expanded', false);
					$(this).find('.accordion:first').attr('hidden', true);
				});
				// Expand current ellement when collapsed
				if (isCollapsed || !wrap.closest("[data-collapse-all]").length) {
					elem.attr('aria-expanded', function(_, attr) {
						return attr == 'true' ? false : true;
					});
					wrap.toggleClass('active');
					elem.parent().next().attr('hidden', function(_, attr) {
						return !attr
					});
				}
				return false;
			});
		}
	};
});

/**
 * Toggle table accordion
 */
myApp.directive('bbTableAccordion', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			elem.on('click', function(e) {
				elem.attr('aria-expanded', function(_, attr) {
					return attr == 'true' ? false : true;
				});

				elem.closest('tr').attr('data-expanded', function(_, attr) {
					return attr == 'true' ? false : true;
				});
				elem.closest('tbody').find('tr').not(elem.closest('tr')).attr('data-expanded', false);
				elem.closest('tbody').find('.td-accordion-toggle button').not(elem).attr('aria-expanded', false);
				return false;
			});
		}
	};
});

/**
 * Toggle tab
 */
myApp.directive('bbTab', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      elem.on('click', function (e) {
        var tabId = elem.attr('data-href');
        var wrap = elem.closest('.tab-wrap');
        // Set all tabs to aria-selected="false"
        wrap.find('[role="tab"]').removeAttr('aria-selected');
        // Adding  hidden attr to all tab panels
        wrap.find('[role="tabpanel"]').attr('hidden', true);
        // Set current tab to aria-selected="true"
        elem.attr('aria-selected', true);
        // Removing hidden attr from current tab panel
        $(tabId).removeAttr('hidden').focus();
        e.preventDefault();
      });
    }
  };
});

/**
 * Remove attributte
 */
myApp.directive('bbRemoveAttr', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			if (attrs.bbRemoveAttr) {
				elem.removeAttr(attrs.bbRemoveAttr);
			}
		}
	};
});
/**
 * Count child elements and ad class to the parrent
 */
myApp.directive('bbChildElem', function($timeout) {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			/* scope.$watch(attrs.bbChildElem, function (newValue, oldValue) {
			  if (newValue) {
			    $timeout(function () {
			      $('.available-devices').each(function (k, v) {
			        cnt = $(this).find('.accordion a').size();
			        if (cnt < 1) {
			          $(this).addClass('no-items');
			        }else{
			          $(this).removeClass('no-items');
			        }
			      });
			    });
			  }
			}, true); */

		}
	};
});

/**
 * Convert option value to float (for ng-modal in select)
 */
myApp.directive('convertToFloat', function() {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, ngModel) {
			ngModel.$parsers.push(function(val) {
				//saves float to model null as null
				return parseFloat(val);
			});
			// ngModel.$formatters.push(function(val) {
			//   //return string for formatter and null as null
			//   return val == null ? null : '' + val ;
			// });
		}
	};
});

/**
 * Handle touchstart event
 */
myApp.directive('touchstart', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            var touchstartFn = $parse(attrs.touchstart);
            elm.bind('touchstart', function(evt) {
                scope.$apply(function() {
                    touchstartFn(scope, {$event: evt});
                });
            });
            elm.bind('mousedown', function(evt){
                scope.$apply(function() {
                    touchstartFn(scope, {$event: evt});
                });
            });
        }
    };
});

/**
 * Handle touchend event
 */
myApp.directive('touchend', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            var touchendFn = $parse(attrs.touchend);
            elm.bind('touchend', function(evt) {
                scope.$apply(function() {
                    touchendFn(scope, {$event: evt});
                });
            });
            elm.bind('mouseup', function(evt){
                scope.$apply(function() {
                    touchendFn(scope, {$event: evt});
                });
            });
        }
    };
});

/* The above code is creating a directive that will be used to create a button that will be used to generate a token. */
myApp.directive('tokenButton', function () {
	return {
		restrict: 'E',
		scope: {
			titleText: '=',
			type: '@',
			profile: '=',
		},
		template: `
		<div  title="{{titleText}}">
		<button ng-if='status === "boot"' class="btn full-width" ng-class="profile.role === 1 ? 'btn-danger': 'btn-default'" ng-click="getToken()">
                {{titleText}}
            </button>
    </div>
    <bb-help-text ng-if='status === "boot" && profile.role === 1' trans="help('boot')"></bb-help-text>
    <bb-help-text ng-if='status === "boot" && !remote && type === "global"'  trans="help('boot_remote')"></bb-help-text>
    <button ng-if='status === "loading"' class="btn full-width" ng-class="profile.role === 1 ? 'btn-danger': 'btn-default'" disabled>
                <i class="fas fa-spinner fa-spin"></i>
    </button> 
    <button ng-if='status === "success"' title="{{result}}" class="btn btn-success full-width" ng-click="copy($event)">
                <div style="width: calc(100% - 1.2rem);text-overflow: ellipsis;overflow: hidden;float: left;" class="select-all" > 
                {{result}} </div> <i class="fal fa-copy" style="float: right; line-height: 140%"></i>
    </button>
    <bb-help-text ng-if='status === "success"' trans="help('success')"></bb-help-text>
    <button ng-if='status === "error"' title="{{result}}" class="btn btn-danger full-width" disabled style="margin-bottom: 1rem">
                <i class="fas fa-exclamation-triangle" style="float: left; line-height: 140%"></i>
                <div style="width: calc(100% - 1.6rem);text-overflow: ellipsis;overflow: hidden;float: right">{{result}}</div>
    </button>
		`,
		controller: function ($scope, dataService, dataFactory, cfg, $location, $http) {
				$scope.status = 'boot';
				var local;

				$scope.help = function (status) {
					 return dataService.getLangLine(status + '_help_text', $scope.languages)
				}

				/* Copying the text from the text area to the clipboard. */
				$scope.copy = function (event) {
					alertify.set('notifier', 'position', 'top-right');
					var ssid = angular.element(event.currentTarget).find('div')[0];
					try {
						selectText(ssid)
						document.execCommand('copy');
						alertify.notify(dataService.getLangLine('copy_to_clipboard_success', $scope.languages), 'success', 5);
					} catch (_) {
						alertify.notify(dataService.getLangLine('copy_to_clipboard_error', $scope.languages), 'error', 5);
					}
				}

			function selectText(container) {
					var range = document.createRange();
					range.selectNodeContents(container);
					window.getSelection().removeAllRanges();
					window.getSelection().addRange(range);
			}

			/* This is a function that returns the token. */
			$scope.getToken = function () {
				$scope.status = 'loading';
				dataFactory.getApi('localToken', $scope.profile.id, true).then(function (response) {
					return response.data.data;
				}).then(function (info) {
					local = info.token;
					if ($scope.type === 'global') {
						if (info.remoteId) {
							$http.defaults.headers.common.Authorization = 'Bearer /' + info.token;
							return $http({
								method: 'HEAD',
								url: 'https://find.z-wave.me/zboxweb?act=session_login&zboxid=' + info.remoteId,
							}).then(function (response) {
								const globalToken = response.headers('X-ZBW-SESSID');
								if (!globalToken) {
									throw new Error(dataService.getLangLine('serverNotAvailable', $scope.languages))
								}
								return globalToken
							});
						} else
							throw new Error(dataService.getLangLine('remoteAccessDisabled', $scope.languages))
					}
					return '';
				}).then(function (global) {
					$scope.result = [global, local].join('/');
					$scope.status = 'success'
				}).catch(function (response) {
					$scope.result = response.message || (angular.isObject(response.data) ? response.data.error : response.data);
					$scope.status = 'error';
				})
			}
		}
	}
});
