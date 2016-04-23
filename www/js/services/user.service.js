/**
 * User Factory
 *
 * @description User services: sets/gets current user id; sets/gets 'processes' local storage
 * sync status.
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('UserService', UserService);

  UserService.$inject = ['devUtils', 'logger'];

  function UserService(devUtils, logger) {

    return {
      getCurrentUserId: getCurrentUserId,
      setCurrentUserId: setCurrentUserId,
      hasDoneProcess: hasDoneProcess,
      setProcessDone: setProcessDone,
      getMyBrandColor: getMyBrandColor,
      setMyBrandColor: setMyBrandColor
    };

    function getCurrentUserId() {
      return new Promise(function(resolve, reject) {
        var currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId !== null) {
          resolve(currentUserId);
        } else {
          devUtils.getCurrentUserId().then(function(userId){
            localStorage.setItem('currentUserId', userId);
            resolve(userId);
          }).catch(function(resObject){
            logger.log('getCurrentUserId',resObject);
            reject(resObject);
          });
        }
      });
    }

    function setCurrentUserId(userId) {
      return new Promise(function(resolve, reject) {
        localStorage.setItem('currentUserId', userId);
        resolve(true);
      });
    }

    function hasDoneProcess(processName) {
      return new Promise(function(resolve, reject) {
        var processes = JSON.parse(localStorage.getItem('processes'));
        if (processes === null) {
          resolve(false);
        } else {
          if (processes[processName] == "true") {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    }

    function setProcessDone(processName) {
      return new Promise(function(resolve, reject) {
        logger.log('setProcessDone',processName);
        var processes = JSON.parse(localStorage.getItem('processes'));
        if (processes === null) {
          processes = {};
        }
        processes[processName] = "true";
        localStorage.setItem('processes', JSON.stringify(processes));
        resolve(true);
      });
    }

    function getMyBrandColor() {
      return new Promise(function(resolve, reject) {
        var myBrandColor = localStorage.getItem('myBrandColor');
        if (myBrandColor !== null) {
          resolve(myBrandColor);
        } else {
          devUtils.readRecords('TourDirector__ap', []).then(function (resObject) {
            if (resObject.records.length > 0) {
              var myBrandColor = resObject.records[0].Primary_Brand_Colour_1__c;
              localStorage.setItem('myBrandColor', myBrandColor);
              resolve(myBrandColor);
            } else {
              // Don't put anything in localstorage until we do have a TD record.
              // Default color until TD record is loaded
              resolve("#BD363B");
            }
          }).catch(function(resObject){
            logger.log('getMyBrandColor',resObject);
            reject(resObject);
          });
        }
      });
    }

    function setMyBrandColor(myBrandColor) {
      localStorage.setItem('myBrandColor', myBrandColor);
    }
    
  }

})();
