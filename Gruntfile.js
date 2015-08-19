module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Clean dir
        clean: {
            options: { force: true },
            build: ["dist/"]
        },
        
        // Concat
        concat: {
            indexhtml: {
                src: ['index.tpl.html'],
                dest: 'dist/index.html'
            },
             css: {
                src: [
                    'app/css/bootstrap.css',
                    'app/css/main.css',
                    'app/css/font-awesome-4.2.0/css/font-awesome.min.css'
                ],
                dest: 'dist/app/css/build.css'
            },
            js: {
                src: [
                    // Vendors
                    'vendor/jquery/jquery-1.11.1.min.js',
                    'vendor/underscore/underscore-1.8.3/underscore-min.js',
                    'vendor/chartjs/Chart.js',
                    //'vendor/upload/angular-file-upload-shim.js',
                    //'vendor/gridster/jquery.gridster.js',
                    'vendor/knob/jquery.knob.js',
                    //'vendor/bootstrap-switch/bootstrap-switch.js',
                    'vendor/handlebars/handlebars-v3.0.3.min.js',
                    'vendor/alpaca/1.5.13/alpaca.min.js',
                    //'vendor/md5/md5.js',
                    // Angular
                    'vendor/angular/angular-1.2.28/angular.min.js',
                    'vendor/upload/angular-file-upload.min.js',
                    'vendor/angular/angular-1.2.28/angular-route.min.js',
                    //'vendor/angular/angular-1.2.16/angular-resource.js',
                    'vendor/angular/angular-1.2.28/angular-cookies.min.js',
                     // Bootstrap
                    'vendor/bootstrap/bootstrap.min.js',
                    // APP
                    'app/app.js',
                    //'app/config/config.js',
                    'app/config/settings.js',
                    'app/services/factories.js',
                    'app/services/services.js',
                    'app/directives/directives.js',
                     'app/directives/dir-pagination.js',
                     'app/directives/tc-angular-chartjs.js',
                    //'app/directives/bsSwitch.js',
                    //'app/directives/angular-slider.j',
                    'app/filters/filters.js',
                    'app/jquery/postrender.js',
                    'app/controllers/base.js',
                    'app/controllers/controllers.js',
                    'app/controllers/element.js',
                    'app/controllers/event.js',
                    'app/controllers/app.js',
                    'app/controllers/device.js',
                    'app/controllers/enocean.js',
                    'app/controllers/room.js',
                    'app/controllers/network.js',
                    'app/controllers/admin.js',
                    'app/controllers/myaccess.js',
                    'app/controllers/report.js',
                    'app/controllers/auth.js',
                    //'app/modules/bootstrap-colorpicker-module.min.js',
                    'app/modules/bootstrap-colorpicker-module.js',
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
                     {expand:true,src: ['app/config.js'], dest: 'dist/app/js/',flatten: true},
                    {src: ['storage/img/**'], dest: 'dist/'},
                    {src: ['storage/demo/**'], dest: 'dist/'},
                    {src: ['storage/data/**'], dest: 'dist/'}
                ]
            },
            fonts: {
                files: [
                    {src: ['app/fonts/**'], dest: 'dist/'},
                    {expand:true,src: ['app/css/font-awesome-4.2.0/fonts/*'], dest: 'dist/app/fonts/',flatten: true}
                ]
            },
            angmap: {
                files: [
                    {expand:true,src: ['vendor/angular/angular-1.2.16/angular-cookies.min.js.map'], dest: 'dist/app/js/',flatten: true},
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

    // Default task(s).
    grunt.registerTask('default', ['clean','concat','copy','cssmin']);

};