const zlib = require("zlib");
const  projectFiles = [
	//Vendors
	'vendor/jquery/plugins/jquery.ui.widget.js',
	'vendor/jquery/plugins/jquery.iframe-transport.js',
	'vendor/jquery/plugins/jquery.fileupload.js',
	'vendor/jquery/plugins/jquery.fileupload-process.js',
	'vendor/jquery/plugins/jquery.fileupload-ui.js',
	'vendor/bootstrap/plugins/bootstrap-datetimepicker.js',
	'vendor/chartjs/Chart.js',
	'vendor/knob/jquery.knob.js',
	'vendor/qrcode_reader/qr_packed.js',
	'vendor/scheduler/jq.schedule.js',
	'vendor/highlight/highlight-textarea.js',
	'vendor/highlight/highlight.pack.js',
	// ExpertUI configuration js
	'vendor/zwave/pyzw.js',
	'vendor/zwave/pyzw_zwave_ui.js',
	// APP
	'app/app.js',
	'app/routes.js',
	'dist/app/js/templates.js',
	'app/modules/qAllSettled.js',
	'app/modules/httpLatency.js',
	'app/modules/ngDeviceDetector.min.js',
	'app/config/settings.js',
	// Services
	'app/factories/factories.js',
	'app/services/services.js',
	'app/services/services-expert.js',
	'app/services/mobile-detector.service.js',
	// Directives
	'app/directives/directives.js',
	'app/directives/directives-expert.js',
	'app/directives/dir-pagination.js',
	'app/directives/tc-angular-chartjs.js',
	'app/directives/angular-slider.js',
	'app/directives/angular-long-press.min.js',
	'app/directives/contextMenu.js',
	'app/directives/elements/shortcut.directive.js',
	'app/directives/smartstart/controller-mode-switcher.directive.js',

	'app/filters/filters.js',
	'app/jquery/postrender.js',
	'app/controllers/base.js',
	'app/controllers/jamesbox.js',
	'app/controllers/element.js',
	'app/controllers/element-widget.js',
	'app/controllers/element-id.js',
	'app/controllers/event.js',
	'app/controllers/automations.js',
	'app/controllers/automation-scene.js',
	'app/controllers/automation-rule.js',
	'app/controllers/automation-schedule.js',
	'app/controllers/automation-security.js',
	'app/controllers/automation-hazard.js',
	'app/controllers/automation-heating.js',
	'app/controllers/app.js',
	'app/controllers/app-local.js',
	'app/controllers/app-online.js',
	'app/controllers/app-instance.js',
	'app/controllers/app-alpaca.js',
	'app/controllers/skin.js',
	'app/controllers/icon.js',
	'app/controllers/device.js',
	'app/controllers/smartstart.js',
	'app/controllers/zwave-inclusion.js',
	'app/controllers/zwave-manage.js',
	'app/controllers/zwave-exclude.js',
	'app/controllers/zwave-vendor.js',
	'app/controllers/camera.js',
	'app/controllers/speech_assistant.js',
	'app/controllers/mobile.js',
	'app/controllers/enocean.js',
	'app/controllers/wifiplug.js',
	'app/controllers/rf433.js',
	'app/controllers/room.js',
	'app/controllers/management.js',
	'app/controllers/management-appstore.js',
	'app/controllers/management-factory.js',
	'app/controllers/management-firmware.js',
	'app/controllers/management-licence.js',
	'app/controllers/management-local.js',
	'app/controllers/management-remote.js',
	'app/controllers/management-report.js',
	'app/controllers/management-restore.js',
	'app/controllers/management-cloud-backup.js',
	'app/controllers/management-timezone.js',
	'app/controllers/management-timezone-jb.js',
	'app/controllers/management-user.js',
	'app/controllers/management-oauth.js',
	'app/controllers/mysettings.js',
	'app/controllers/mysettings-sessions.js',
	'app/controllers/rss.js',
	'app/controllers/auth.js',
	'app/controllers/zwave-configuration.js',
	'app/controllers/zwave-commands.js',
	'app/controllers/welcome.js',
	'app/controllers/management-wifi.js'
]

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');
	var app_cfg = pkg.type_cfg[pkg.app_type];
	var app_version = pkg.version;
	var git_message = pkg.version;
	var app_rc = (pkg.rc ? pkg.rc + 1 : 0);
	if (app_rc) {
		app_version += '-RC-' + app_rc;
		git_message += '-RC-' + pkg.rc;
	}

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// Banner
		banner: 'Copyright:  Z-Wave.Me, Created: <%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %>',
		// Clean dir
		clean: {
			options: {
				force: true
			},
			build: ["dist/", "docs/"],
			tmp: ['./tmp']
		},
		ngtemplates: {
			app: {
				options: {
					standalone: true,
					module: 'myAppTemplates',
					htmlmin: {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						removeAttributeQuotes: true,
						removeComments: true, // Only if you don't use comment directives!
						removeEmptyAttributes: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true
					}
				},
				src: 'app/views/**/*.html',
				dest: 'dist/app/js/templates.js'
			}
		},
		// SCSS
		sass: {
			dist: {
				files: {
					'app/css/main.css': 'app/sass/main.scss'
				}
			}
		},
		// Concat
		concat: {
			/*indexhtml: {
			    src: ['index.tpl.html'],
			    dest: 'dist/index.html'
			},*/
			css: {
				src: [
					//'app/css/bootstrap.css',
					//'app/css/font-awesome-4.4.0/css/font-awesome.min.css',
					'app/css/main.css'
				],
				dest: 'dist/app/css/main.css'
			},
			custom: {
				src: projectFiles,
				dest: './tmp/bundle.js'
			},
			js: {
				src: [
					// Vendors
					'vendor/jquery/jquery-1.11.3.min.js',
					'vendor/jquery/jquery-ui.min.js',
					'vendor/moment/moment-with-locales.min.js',
					'vendor/underscore/underscore-1.8.3/underscore-min.js',
					'vendor/handlebars/handlebars-v3.0.3.min.js',
					'vendor/alpaca/1.5.14/bootstrap/alpaca.min.js',
					'vendor/alertify/alertify.min.js',
					'vendor/qrcode/qrcode.min.js',
					// Angular
					'vendor/angular/angular-1.2.28/angular.min.js',
					'vendor/upload/angular-file-upload.min.js',
					'vendor/angular/angular-1.2.28/angular-route.min.js',
					'vendor/angular/angular-1.2.28/angular-cookies.min.js',
					'vendor/angular/angular-1.2.28/angular-touch.js',
					'vendor/angular/angular-1.2.28/angular-animate.js',
					'vendor/dragdrop/angular-sortable-view.min.js',
					// Bootstrap
					'vendor/bootstrap/bootstrap.min.js',
					// ExpertUI configuration js
					'vendor/xml/xml2json.min.js',
					//App
					'./tmp/bundle.babel.min.js'

				],
				dest: 'dist/app/js/build.js'
			}
		},
		json_generator: {
			target: {
				dest: "app/info.json",
				options: {
					name: app_cfg.name,
					version: app_version,
					built: '<%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %>',
					timestamp: '<%= Math.floor(Date.now() / 1000) %>'
				}
			},
			skin: {
				dest: pkg.skin_path + pkg.skin + '/info.json',
				options: {
					name: app_cfg.name,
					version: app_version,
					skin: pkg.skin,
					built: '<%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %>',

				}
			}
		},
		// Copy
		copy: {
			main: {
				files: [{
						src: [
							'!app/views/_test/**',
							'app/img/**',
							'app/img/**',
							//'app/views/**',
							'app/lang/**',
							'favicon.ico'
						],
						dest: 'dist/'
					},
					//{expand:true,src: ['../zwave-api/storage/data/z_en.json'], dest: 'storage/data/',flatten: true},
					{
						expand: true,
						src: ['app/config.js'],
						dest: 'dist/app/js/',
						flatten: true
					}, {
						expand: true,
						src: ['app/icons.js'],
						dest: 'dist/app/js/',
						flatten: true
					}, {
						expand: true,
						src: ['app/configs/notifications.js'],
						dest: 'dist/app/js/',
						flatten: true
					}, {
						expand: true,
						src: ['app/css/screenshot.png'],
						dest: 'dist/app/css/',
						flatten: true
					}, {
						src: ['storage/img/**'],
						dest: 'dist/'
					}, {
						src: ['storage/demo/**'],
						dest: 'dist/'
					}, {
						src: ['storage/data/**'],
						dest: 'dist/'
					}
				]
			},
			cssorig: {
				files: [{
					src: ['app/css/main.css'],
					dest: 'app/css/main.css.orig'
				}]
			},
			info: {
				files: [{
					src: ['app/info.json'],
					dest: 'dist/app/info.json'
				}]
			},
			images: {
				files: [{
					src: ['app/css/wallpaper.png'],
					dest: 'dist/app/css/wallpaper.png'
				}]
			},
			fonts: {
				files: [{
						src: ['app/fonts/**'],
						dest: 'dist/'
					}
					//{expand: true, src: ['app/css/font-awesome-4.4.0/fonts/*'], dest: 'dist/app/fonts/', flatten: true}
				]
			},
			angmap: {
				files: [{
						expand: true,
						src: ['vendor/angular/angular-1.2.16/angular-cookies.min.js.map'],
						dest: 'dist/app/js/',
						flatten: true
					},
					//{expand:true,src: ['vendor/angular/angular-1.2.16/angular.min.js.map'], dest: 'dist/app/js/',flatten: true},
					//{expand:true,src: ['vendor/angular/angular-1.2.16/angular-route.min.js.map'], dest: 'dist/app/js/',flatten: true}
				]
			},
			skin: {
				files: [{
					src: ['app/css/main.css'],
					dest: pkg.skin_path + pkg.skin + '/main.css'
				}, {
					src: ['app/css/main.css'],
					dest: pkg.skin_path + pkg.skin + '/main.css.orig'
				}, {
					expand: true,
					src: ['storage/img/icons/*'],
					dest: pkg.skin_path + pkg.skin + '/img/icons/',
					flatten: true
				}]
			},
		},
		//CSSS min
		cssmin: {
			my_target: {
				options: {
					banner: '/* <%= banner %> */',
					keepSpecialComments: 0
				},
				files: [{
					expand: true,
					cwd: 'dist/app/css/',
					src: ['*.css', '!*.min.css'],
					dest: 'dist/app/css/',
					ext: '.css'
				}]
			}
		},
		usebanner: {
			jscss: {
				options: {
					position: 'top',
					banner: '/* <%= banner %> */'
				},
				files: {
					src: ['dist/app/js/templates.js', 'dist/app/js/config.js', 'dist/app/js/build.js', 'dist/app/js/icons.js', 'dist/app/js/notifications.js']
				}
			},
			html: {
				options: {
					position: 'top',
					banner: '<!-- <%= banner %> -->'
				},
				files: {
					src: ['dist/index.html']
				}
			}
		},
		htmlbuild: {
			dist: {
				src: 'index.html',
				dest: 'dist/',
				options: {
					sections: {
						dist_head: 'app/views/dist_head.txt'
					}
				}

			}
		},
		cachebreaker: {
			dist: {
				options: {
					match: ['config.js', 'build.js', 'icons.js', 'main.css'],
					replacement: function() {
						return app_version;
					}
				},
				files: {
					src: ['dist/index.html']
				}
			}
		},
		replace: {
			dist: {
				options: {
					patterns: [{
						match: 'app_name',
						replacement: app_cfg.name
					}, {
						match: 'app_version',
						replacement: app_version
					}, {
						match: 'app_built',
						replacement: '<%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %>'
					}]
				},
				files: [{
					expand: true,
					flatten: true,
					src: ['app/config.js'],
					dest: app_cfg.dir + '/app/js/'
				}]
			},
			skin: {
				options: {
					patterns: [{
						match: /..\/fonts\//g,
						replacement: function() {
							return '..\/..\/..\/app\/fonts\/';
						}
					}]
				},
				files: [{
					expand: true,
					flatten: true,
					src: [pkg.skin_path + pkg.skin + '/main.css'],
					dest: pkg.skin_path + pkg.skin + '/'
				}, {
					expand: true,
					flatten: true,
					src: [pkg.skin_path + pkg.skin + '/main.css.orig'],
					dest: pkg.skin_path + pkg.skin + '/'
				}]
			}
		},
		modify_json: {
			file: {
				expand: true,
				src: ['package.json'],
				options: {
					add: true,
					fields: {
						"rc": app_rc,
						"built": '<%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %>'
					},
					indent: 2
				}
			}
		},
		jsdox: {
			generate: {
				options: {
					contentsEnabled: true,
					contentsTitle: 'SmartHome UI Documentation',
					contentsFile: 'readme.md',
					//pathFilter: /^example/,
					templateDir: 'docstemplates'
				},
				src: ['app/**/*.js'],
				dest: 'docs'
			}
		},
		'release-it': {
			options: {
				pkgFiles: ['package.json'],
				commitMessage: 'Release ' + app_cfg.name + ' ' + git_message,
				tagName: '%s',
				tagAnnotation: 'Release ' + app_cfg.name + ' ' + git_message,
				buildCommand: false
			}
		},
		compress: {
			build: {
				options: {
					mode: 'gzip',
					level: zlib.constants.Z_BEST_COMPRESSION,
				},
				expand: true,
				cwd: 'dist/',
				src: ['**/*.{js,css,html,json,ico}'],
				dest: 'dist/',
				ext: (ext) =>  ext + '.gz'
			},
		},
		uglify : {
			build: {
				files: {
					'./tmp/bundle.babel.min.js': './tmp/bundle.babel.js'
				}
			}
		},
		babel: {
			options: {
				presets: [ '@babel/preset-env'],
				plugins: ['angularjs-annotate'],
				compact : true
			},
			dist: {
				files: {
					'./tmp/bundle.babel.js':'./tmp/bundle.js',
				},
			},
		},
	});
	grunt.registerTask('skinFolder', 'Creates an empty .keep file in skins dir', function() {
		grunt.file.write('dist/user/skins/.keep', '');
	});
	grunt.registerTask('iconFolder', 'Creates an empty .keep file in icons dir', function() {
		grunt.file.write('dist/user/icons/.keep', '');
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-remove');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-json-generator');
	grunt.loadNpmTasks('grunt-html-build');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-jsdox');
	grunt.loadNpmTasks('grunt-release-it');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-cache-breaker');
	grunt.loadNpmTasks('grunt-babel');

	// Default task(s).
	grunt.registerTask('default',
		['clean:build',
			'ngtemplates',
			'sass',
			'concat:custom',
			'babel',
			'uglify:build',
			'concat:css',
			'concat:js',
			'json_generator',
			'copy',
			'cssmin',
			'skinFolder',
			'iconFolder',
			'usebanner',
			'htmlbuild',
			'cachebreaker',
			'replace',
			'clean:tmp',
			'compress']);
};
