module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Clean dir
        clean: {
            options: {force: true},
            build: ["dist/","docs/"]
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
                    'app/icons.js',
                    'app/app.js',
                    'dist/app/js/templates.js',
                    'app/modules/qAllSettled.js',
                    'app/config/settings.js',
                    'app/services/factories.js',
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
                    'vendor/xml/xml2json.js',
                    'app/expertui/directives.js',
                    'app/expertui/services.js',
                    'app/expertui/configuration.js',
                ],
                dest: 'dist/app/js/build.js'
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
                            'app/views/**',
                            'app/lang/**'
                        ], dest: 'dist/'
                    },
                    //{expand:true,src: ['../zwave-api/storage/data/z_en.json'], dest: 'storage/data/',flatten: true},
                    {expand: true, src: ['app/config.js'], dest: 'dist/app/js/', flatten: true},
                    {src: ['storage/img/**'], dest: 'dist/'},
                    {src: ['storage/demo/**'], dest: 'dist/'},
                    {src: ['storage/data/**'], dest: 'dist/'}
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
                    banner: '/* Minified css file */',
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
                //src: ['app/controllers/*.js','app/services/*.js','app/directives/*.js','app/modules/*.js','app/jquery/*.js','app/filters/*.js'],
                dest: 'docs'
            }
        },
        remove: {
            options: {
                trace: true
            },
            //fileList: ['path_to_file_1.extension', 'path_to_file_2.extension'],
            dirList: [
                'dist/app/views/_test/',
                'dist/storage/data/_test/'
            ]
        },
        // HTML min
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/abc.html': 'index.html'
                }
            },
            multiple: {
                files: [{
                        expand: true,
                        cwd: 'app/views',
                        src: '**/*.html',
                        dest: 'dist/views'
                    }]
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'app/css/bootstrap.css': 'app/css/sass/bootstrap.scss',
                    'app/css/main.css': 'app/css/sass/main.scss'
                }
            }
        },
        watch: {
            files: "app/css/sass/**",
            tasks: ["sass"]
        },
        // Uglify
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                compress: true
            },
            build: {
                src: ['app/js/*'],
                dest: 'dist/app/js/build.min.js'
            }
        },
        'string-replace': {
            dist: {
                files: {
                    'dist/app/js/config.js': 'app/config.js',
                },
                options: {
                    replacements: [{
                            pattern: /'server_url': (.*?) /ig,
                            replacement: '\'server_url\': \'/\''
                        }]
                }
            }
        }
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
    grunt.loadNpmTasks('grunt-jsdox');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'ngtemplates', 'concat', 'copy', 'cssmin','jsdox']);

};
