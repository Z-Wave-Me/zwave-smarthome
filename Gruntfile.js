module.exports = function (grunt) {
    var pkg = grunt.file.readJSON('package.json');
    var app_type = pkg.app_type;
    var app_cfg = pkg.type_cfg[pkg.app_type];
    var app_version = pkg.v;
    var git_message = pkg.v;
    var app_rc = (pkg.rc ? pkg.rc + 1 : 0);

    if(app_rc){
        app_version += '-RC-'+app_rc;
        git_message += '-RC-'+pkg.rc;
    }

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Banner
        banner: 'Copyright:  Z-Wave Europe GmbH, Created: <%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %>',
        // Clean dir
        clean: {
            options: {force: true},
            build: ["dist/", "docs/"]
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
        // Concat
        concat: {
            indexhtml: {
                src: ['index.tpl.html'],
                dest: 'dist/index.html'
            },
            css: {
                src: [
                    //'app/css/bootstrap.css',
                    //'app/css/font-awesome-4.4.0/css/font-awesome.min.css',
                    'app/css/main.css'
                ],
                dest: 'dist/app/css/main.css'
            },
            js: {
                src: [
                    // Vendors
                    'vendor/jquery/jquery-1.11.3.min.js',
                    'vendor/jquery/jquery-ui.min.js',
                    'vendor/jquery/plugins/jquery.ui.widget.js',
                    'vendor/jquery/plugins/jquery.iframe-transport.js',
                    'vendor/jquery/plugins/jquery.fileupload.js',
                    'vendor/jquery/plugins/jquery.fileupload-process.js',
                    'vendor/jquery/plugins/jquery.fileupload-ui.js',
                    'vendor/moment/moment-with-locales.min.js',
                    'vendor/underscore/underscore-1.8.3/underscore-min.js',
                    'vendor/chartjs/Chart.js',
                    'vendor/knob/jquery.knob.js',
                    'vendor/handlebars/handlebars-v3.0.3.min.js',
                    'vendor/alpaca/1.5.14/bootstrap/alpaca.min.js',
                    'vendor/alertify/alertify.min.js',
                    // Angular
                    'vendor/angular/angular-1.2.28/angular.min.js',
                    'vendor/upload/angular-file-upload.min.js',
                    'vendor/angular/angular-1.2.28/angular-route.min.js',
                    'vendor/angular/angular-1.2.28/angular-cookies.min.js',
                    'vendor/dragdrop/angular-drag-and-drop-lists.js',
                    // Bootstrap
                    'vendor/bootstrap/bootstrap.min.js',
                    'vendor/bootstrap/plugins/bootstrap-datetimepicker.js',
                    // APP
                    'app/app.js',
                    'app/routes.js',
                    'dist/app/js/templates.js',
                    'app/modules/qAllSettled.js',
                    'app/modules/httpLatency.js',
                    'app/config/settings.js',
                    'app/factories/factories.js',
                    'app/services/services.js',
                    'app/directives/directives.js',
                    'app/directives/dir-pagination.js',
                    'app/directives/tc-angular-chartjs.js',
                    'app/filters/filters.js',
                    'app/jquery/postrender.js',
                    'app/controllers/base.js',
                    'app/controllers/controllers.js',
                    'app/controllers/jamesbox.js',
                    'app/controllers/element.js',
                    'app/controllers/event.js',
                    'app/controllers/app.js',
                    'app/controllers/skin.js',
                    'app/controllers/icon.js',
                    'app/controllers/device.js',
                    'app/controllers/zwave-inclusion.js',
                    'app/controllers/zwave.js',
                    'app/controllers/camera.js',
                    'app/controllers/enocean.js',
                    'app/controllers/room.js',
                    'app/controllers/management.js',
                    'app/controllers/mysettings.js',
                    'app/controllers/auth.js',
                    // ExpertUI configuration js
                    'app/expertui/pyzw.js',
                    'app/expertui/pyzw_zwave_ui.js',
                    'vendor/xml/xml2json.min.js',
                    'app/expertui/directives.js',
                    'app/expertui/services.js',
                    'app/expertui/configuration.js',
                    'app/expertui/commands.js'
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
            }
        },
        // Copy
        copy: {
            main: {
                files: [
                    {
                        src: [
                            '!app/views/_test/**',
                            'app/img/**',
                            'app/img/**',
                            //'app/views/**',
                            'app/lang/**'
                        ], dest: 'dist/'
                    },
                    //{expand:true,src: ['../zwave-api/storage/data/z_en.json'], dest: 'storage/data/',flatten: true},
                    {expand: true, src: ['app/config.js'], dest: 'dist/app/js/', flatten: true},
                    {expand: true, src: ['app/icons.js'], dest: 'dist/app/js/', flatten: true},
                    {expand: true, src: ['app/css/screenshot.png'], dest: 'dist/app/css/', flatten: true},
                    {src: ['storage/img/**'], dest: 'dist/'},
                    {src: ['storage/demo/**'], dest: 'dist/'},
                    {src: ['storage/data/**'], dest: 'dist/'}
                ]
            },
            cssorig: {
                files: [
                    {src: ['app/css/main.css'], dest: 'app/css/main.css.orig'}
                ]
            },
            info: {
                files: [
                    {src: ['app/info.json'], dest: 'dist/app/info.json'}
                ]
            },
            images: {
                files: [
                    {src: ['app/css/wallpaper.png'], dest: 'dist/app/css/wallpaper.png'}
                ]
            },
            fonts: {
                files: [
                    {src: ['app/fonts/**'], dest: 'dist/'}
                    //{expand: true, src: ['app/css/font-awesome-4.4.0/fonts/*'], dest: 'dist/app/fonts/', flatten: true}
                ]
            },
            angmap: {
                files: [
                    {expand: true, src: ['vendor/angular/angular-1.2.16/angular-cookies.min.js.map'], dest: 'dist/app/js/', flatten: true},
                    //{expand:true,src: ['vendor/angular/angular-1.2.16/angular.min.js.map'], dest: 'dist/app/js/',flatten: true},
                    //{expand:true,src: ['vendor/angular/angular-1.2.16/angular-route.min.js.map'], dest: 'dist/app/js/',flatten: true}
                ]
            }
        },
        //CSSS min
        cssmin: {
            my_target: {
                options: {
                    banner: '/* <%= banner %> */',
                    keepSpecialComments: 0
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/app/css/',
                        src: ['*.css', '!*.min.css'],
                        dest: 'dist/app/css/',
                        ext: '.css'
                    }
                ]
            }
        },
        usebanner: {
            jscss: {
                options: {
                    position: 'top',
                    banner: '/* <%= banner %> */'
                },
                files: {
                    src: [ 'dist/app/js/templates.js','dist/app/js/config.js','dist/app/js/build.js','dist/app/js/icons.js']
                }
            },
            html: {
                options: {
                    position: 'top',
                    banner: '<!-- <%= banner %> -->'
                },
                files: {
                    src: [ 'dist/index.html']
                }
            }
        },
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'app_name',
                            replacement: app_cfg.name
                        },
                        {
                            match: 'app_version',
                            replacement: app_version
                        },
                        {
                            match: 'app_built',
                            replacement: '<%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %>'
                        }
                    ]
                },
                files: [
                    {expand: true, flatten: true, src: ['app/config.js'], dest: app_cfg.dir + '/app/js/'}
                ]
            }
        },
        modify_json: {
            file: {
                expand: true,
                //cwd: 'test/',
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
        'release-it': {
            options: {
                pkgFiles: ['package.json'],
                commitMessage: 'Release ' + app_cfg.name + ' ' + git_message,
                tagName: '%s',
                tagAnnotation: 'Release ' + app_cfg.name + ' ' + git_message,
                buildCommand: false
            }
        }

    });
    grunt.registerTask('skinFolder', 'Creates an empty .keep file in skins dir', function () {
        grunt.file.write('dist/user/skins/.keep', '');
    });
     grunt.registerTask('iconFolder', 'Creates an empty .keep file in icons dir', function () {
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
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-modify-json');
    grunt.loadNpmTasks('grunt-release-it');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'ngtemplates', 'concat','json_generator', 'copy', 'cssmin', 'skinFolder','iconFolder','usebanner','replace','modify_json']);

};
