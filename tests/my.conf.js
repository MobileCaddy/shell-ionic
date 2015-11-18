// Karma configuration
// Generated on Fri Apr 24 2015 10:42:58 GMT+0100 (BST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      '../www/lib/js/*.js',
      '../www/js/app.js',
      '../www/js/services/*module.js',
      '../www/js/services/*.js',
      '../www/js/controllers.js',
      '../node_modules/mobilecaddy-utils/node_modules/es6-promise/dist/promise-1.0.0.js',
      '../node_modules/angular-mocks/angular-mocks.js',
      '../node_modules/mobilecaddy-utils/node_modules/underscore/underscore-min.js',
      '**/*tests.js',
      '../node_modules/mobilecaddy-codeflow/js/mcUtilsMock.js'
    ],


    // list of files to exclude
    exclude: [
      '../www/js/services.js',
      '../www/lib/js/mobilecaddy-utils.min.js',
      '../www/lib/js/angular-ios9-uiwebview.patch.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome'],
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
