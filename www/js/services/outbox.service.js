/**
 * Outbox Factory
 *
 * @description Gets data for the Outbox menu option.
 *
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('OutboxService', OutboxService);

  OutboxService.$inject = ['devUtils', 'logger'];

  function OutboxService(devUtils, logger) {

    return {
      getDirtyRecordsCount: getDirtyRecordsCount,
      getDirtyRecords: getDirtyRecords
    };

    function getDirtyRecordsCount() {
      return new Promise(function(resolve, reject) {
        devUtils.readRecords('recsToSync', []).then(function(resObject) {
          var records = _.chain(resObject.records)
            .filter(function(el){
                return (el.Mobile_Table_Name != "Connection_Session__mc" && el.Mobile_Table_Name != "Mobile_Log__mc") ? true : false;
              })
            .value();
          resolve(records.length);
        }).catch(function(resObject){
          // console.error('getDirtyRecordsCount ', angular.toJson(resObject));
          logger.error('getDirtyRecordsCount ' + angular.toJson(resObject));
          reject(resObject);
        });
      });
    }

    function getDirtyRecords() {
      return new Promise(function(resolve, reject) {
        devUtils.readRecords('recsToSync', []).then(function(resObject) {
          var records = _.chain(resObject.records)
            .filter(function(el){
                return (el.Mobile_Table_Name != "Connection_Session__mc" && el.Mobile_Table_Name != "Mobile_Log__mc") ? true : false;
              })
            .value();
          resolve(records);
        }).catch(function(resObject){
          // console.error('getDirtyRecords ', angular.toJson(resObject));
          logger.error('getDirtyRecords ' + angular.toJson(resObject));
          reject(resObject);
        });
      });
    }

  }

})();