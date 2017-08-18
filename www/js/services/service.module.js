/**
 * starter.services module
 *
 * @description defines starter.service module and also sets up some other deps
 * as Angular modules.
 */
angular.module('underscore', [])
  .factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

angular.module('devUtils', [])
  .factory('devUtils', function() {
    return mobileCaddy.require('mobileCaddy/devUtils');
});

angular.module('vsnUtils', [])
  .factory('vsnUtils', function() {
    return mobileCaddy.require('mobileCaddy/vsnUtils');
});

angular.module('smartStoreUtils', [])
  .factory('smartStoreUtils', function() {
    return mobileCaddy.require('mobileCaddy/smartStoreUtils');
});

angular.module('syncRefresh', [])
  .factory('syncRefresh', function() {
    return mobileCaddy.require('mobileCaddy/syncRefresh');
});

angular.module('logger', [])
  .factory('logger', function() {
    return mobileCaddy.require('mobileCaddy/logger');
});

angular.module('appDataUtils', [])
  .factory('appDataUtils', function() {
    return mobileCaddy.require('mobileCaddy/appDataUtils');
});

angular.module('starter.services', ['underscore', 'devUtils', 'vsnUtils', 'smartStoreUtils', 'syncRefresh', 'appDataUtils', 'logger']);