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
                    'vendor/chartjs/Chart.js',
                    //'vendor/upload/angular-file-upload-shim.js',
                    //'vendor/gridster/jquery.gridster.js',
                    'vendor/knob/jquery.knob.js',
                    //'vendor/bootstrap-switch/bootstrap-switch.js',
                    'vendor/handlebars/handlebars.min.js',
                    'vendor/alpaca/alpaca.min.js',
                    // Angular
                    'vendor/angular/angular-1.2.16/angular.min.js',
                    'vendor/upload/angular-file-upload.js',
                    'vendor/angular/angular-1.2.16/angular-route.min.js',
                    //'vendor/angular/angular-1.2.16/angular-resource.js',
                    'vendor/angular/angular-1.2.16/angular-cookies.min.js',
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
                    //'app/directives/bsSwitch.js',
                    //'app/directives/tc-angular-chartjs.js',
                    //'app/directives/angular-slider.j',
                    'app/filters/filters.js',
                    'app/jquery/postrender.js',
                    'app/controllers/controllers.js'
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
                     {expand:true,src: ['vendor/angular/angular-1.2.16/angular.min.js.map'], dest: 'dist/app/js/',flatten: true},
                      {expand:true,src: ['vendor/angular/angular-1.2.16/angular-route.min.js.map'], dest: 'dist/app/js/',flatten: true}
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
                replacement: 'abc'
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

    // Default task(s).
    grunt.registerTask('default', ['clean','concat','copy','cssmin','string-replace']);

};