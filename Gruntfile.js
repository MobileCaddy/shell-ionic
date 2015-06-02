module.exports = function(grunt) {
  "use strict";

  require('load-grunt-tasks')(grunt);
  // Project configuration.
  grunt.initConfig({
    // This line makes your node configurations available for use
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      myFiles: ['Gruntfile.js',
                'www/js/*.js']
    },

    compress: {
      options :{
        archive: '<%= pkg.name %>-<%= pkg.version %>.zip'
      },
      dev: {
        src: ['www/**',
              // don't include lib files that are needed only for local dev/test
              '!www/lib/js/*',
              // add any libs that you do want included here.
              'www/lib/js/ionic.bundle.min.js',
              '!www/index.html',
              '!www/**/*.log'],
        expand: true
      },
      prod: {
        files :[
          {
            src: [
              'www/**',
              // don't include js that we have minified
              '!www/js/*',
              // don't include lib files that are needed only for local dev/test
              '!www/lib/js/*',
              // add any libs that you do want included here.
              'www/lib/js/ionic.bundle.min.js',
              '!www/index.html',
              '!www/**/*.log'],
            expand: true
          },
          {
            flatten:true,
            expand: true,
            src: ['dest/js/*'],
            dest : 'www/js'
          }
        ]
      }
    },

    uglify : {
      prod: {
        options: {
          mangle: false,
          drop_console: true
        },
        files: [{
          flatten: true,
          expand: true,
          src:    [
            'www/js/**/*.js',
            // don't include lib files that are needed only for local dev/test
            '!www/lib/js/**.js'
            ],
          dest:   'dest/js'
        }]
      }
    },

    connect: {
      server: {
        options: {
          port: 3030,
          livereload: true,
          open: "http://localhost:3030/www"
        }
      }
    },

    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'cors/cors-server.js'
        }
      }
    },

    sass: {
      dist: {
        options: {
          style: 'compact',
          sourcemap: 'none'
        },
        files: {
          'www/css/app.css': 'scss/app.scss'
        }
      }
    },

    watch: {
      set1: {
        files: ['*.js',
                'www/js/*.js',
                'package.json'],
        tasks: ['dev']
      },
      set2: {
        files: [ 'www/templates/*.html'],
        tasks: ['compress:dev']
      },
      set3: {
        files: [ 'scss/*.scss'],
        tasks: ['sass', 'compress:dev']
      },
      set4: {
        files: [ 'www/css/*.css'],
        tasks: [],
        options: {
          livereload: true,
        }
      },
      express: {
        files: ['cors/cors-server.js'],
        tasks:  [ 'express:dev' ]
      }
    },

    copy: {
      devsetup: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['bower_components/mobilecaddy-codeflow/js/*',
                  'bower_components/ionic/release/js/ionic.bundle.min.js',
                  'bower_components/jquery/dist/jquery.min.js',
                  'bower_components/underscore/underscore-min.js',
                  'bower_components/signature_pad/signature_pad.min.js',
                  'bower_components/mobilecaddy-utils/js/mobilecaddy-utils.min.js'],
            dest: 'www/lib/js',
            filter: 'isFile'
          },
          // Promises polyfill
          {
            src: ['bower_components/es6-promise/index.js'],
            dest: 'www/lib/js/promise-1.0.0.min.js'
          },
          // Ionic scss
          {
            expand: true,
            cwd: 'bower_components/ionic/scss/',
            src: ['**'],
            dest: 'scss/ionic'
          },
          // Ionic fonts
          {
            expand: true,
            cwd: 'bower_components/ionic/release/fonts/',
            src: ['**'],
            dest: 'www/fonts'
          },
          // forcejs
           {
            src: ['bower_components/forcejs/force.js'],
            dest: 'www/lib/js/force.js'
          },
          {
            src: ['bower_components/forcejs/oauthcallback.html'],
            dest: 'oauthcallback.html'
          }
        ]
      }
    },

    replace: {
      ioniconsVsnRm: {
        src: ['scss/ionic/ionicons/_ionicons-font.scss'],
        dest: 'scss/ionic/ionicons/_ionicons-font.scss',
        replacements: [{
          from: '?v=#{$ionicons-version}',
          to: ''
        }]
      }
    },

    karma: {
      unit: {
        configFile: 'tests/my.conf.js'
      }
    }

  });
  // Each plugin must be loaded following this pattern
  grunt.registerTask('devsetup', ['copy:devsetup', 'sass', 'replace']);
  grunt.registerTask('serve', ['connect', 'express:dev', 'watch']);
  grunt.registerTask('dev', ['jshint:myFiles', 'compress:dev']);
  grunt.registerTask('unit-test', ['karma']);
  grunt.registerTask('prod', ['jshint:myFiles', 'uglify', 'compress:prod']);
};
