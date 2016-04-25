/**
 * Feedback Factory
 *
 * @description methods to read/write to/from Feedback table
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('FeedbackService', FeedbackService);

  FeedbackService.$inject = ['devUtils', 'logger'];

  function FeedbackService(devUtils, logger) {
    return {

      insert: insert

    };

    /**
     * @function insert
     * @description Calls devUtils.insert for an mobilecaddy1__Mobile_Feedback__c rec
     * @return {promise} Resolves to a returnObject (see API docs)
     */
    function insert(record){
      return new Promise(function(resolve, reject) {
        devUtils.insertRecord('Mobile_Feedback__ap', record).then(function(resObject) {
          resolve(resObject);
        }).catch(function(resObject){
          logger.error('FeedbackService insert ', resObject);
          reject(resObject);
        });
      });
    }

  }

})();