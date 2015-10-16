module.exports = function(grunt) {
  "use strict";

  var qStr = "";
  var scrub = "";
  if (grunt.option('scrub')){
    scrub = 'scrub=' + grunt.option('scrub');
  }
  var local = "";
  if (grunt.option('local')){
    local= 'local=true';
  }

  if (scrub !== "" || local !== ""){
    qStr += "?" + scrub + "&" + local;
  }

  var expressArgs = [];
  if (grunt.option('rec')){
    expressArgs.push('rec');
  }

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
              // don't include  files that are needed only for local dev/test
              '!www/index.html',
              '!www/**/*.log'],
        expand: true
      },
      prod: {
        files :[
          {
            src: [
              'www/**',
              'www/lib/js/ng-cordova.min.js',
              // don't include js that we have minified
              '!www/js/*',
              // add any libs that you do want included here.
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
          open: "http://localhost:3030/www" + qStr
        }
      }
    },

    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'node_modules/mobilecaddy-codeflow/js/cors-server.js'
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
            src: ['node_modules/ionic-sdk/release/js/ionic.bundle.min.js',
                  'node_modules/ng-cordova/dist/ng-cordova.min.js'],
            dest: 'www/lib/js',
            filter: 'isFile'
          },
          // Ionic scss
          {
            expand: true,
            cwd: 'node_modules/ionic-sdk/scss/',
            src: ['**'],
            dest: 'scss/ionic'
          },
          // Ionic fonts
          {
            expand: true,
            cwd: 'node_modules/ionic-sdk/release/fonts/',
            src: ['**'],
            dest: 'www/fonts'
          },
          {
            src: ['node_modules/mobilecaddy-codeflow/node_modules/forcejs/oauthcallback.html'],
            dest: 'oauthcallback.html'
          },
          {
            expand: true,
            cwd: 'node_modules/mobilecaddy-codeflow/codeflow-app/',
            src: ['**'],
            dest: 'codeflow'
          },
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
      },
      ngCordovaMocks: {
        src: ['node_modules/ng-cordova/dist/ng-cordova-mocks.js'],
        dest: 'tmp/ng-cordova-mocks.js',
        replacements: [{
          from: 'ngCordovaMocks',
          to: 'ngCordova'
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
