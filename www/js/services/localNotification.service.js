/**
 * LocalNotificationService
 *
 * @description Enables device local notifications using Cordova Local-Notification Plugin
 *              (https://github.com/katzer/cordova-plugin-local-notifications)
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('LocalNotificationService', LocalNotificationService);

  LocalNotificationService.$inject = ['$cordovaLocalNotification', '$cordovaNetwork', 'devUtils', 'logger'];

  function LocalNotificationService($cordovaLocalNotification, $cordovaNetwork, devUtils, logger) {

    var lnDefaultTimeout = 600,  // 5 minutes
        lnDefaultId      = 100100,
        lnDefaultMsg     = 'Unsynced records';

    return {
      cancelNotification: cancelNotification,

      setLocalNotification: setLocalNotification,

      handleLocalNotification: handleLocalNotification,

      handleLocalNotificationClick: handleLocalNotificationClick,

      getLocalNotificationState: getLocalNotificationState,

      setLocalNotificationState: setLocalNotificationState
    };


    /**
     * @function cancelNotification
     * @description Attempts to cancel the localNotifcation with a certain id
     * @param  {string | number | undefined} id
     */
    function cancelNotification(id) {
      return new Promise(function(resolve, reject) {
        id =  (id) ? id : lnDefaultId;
        if (getLocalNotificationState() == "disabled") {
          logger.log('cancelNotification NotificationState disabled');
          resolve();
        } else {
          logger.log('cancelNotification', id);
          if (cordova && cordova.plugins && cordova.plugins.notification) {
            $cordovaLocalNotification.cancel(id).then(function (result) {
              logger.log('localNotification cancelled if it existed', id, result);
              resolve(result);
            });
          }
        }
    });
    }

    /**
     * @function setLocalNotification
     * @description Sets a localNotification for id
     * @param {string | number | undefined} id
     * @param {integer | undefined} secsTillNotify - number of seconds till notification
     * @param {string | undefined} msg
     */
    function setLocalNotification(id, secsTillNotify, msg) {
      return new Promise(function(resolve, reject) {
        if (getLocalNotificationState() == "disabled") {
          logger.log('setLocalNotification NotificationState disabled');
          resolve('ok');
        } else {
          // Set to defaults if needed
          id =  (id) ? id : lnDefaultId;
          secsTillNotify =  (secsTillNotify) ? secsTillNotify : lnDefaultTimeout;
          msg =  (msg) ? msg : lnDefaultMsg;

          logger.log('setLocalNotification id', id, secsTillNotify, msg );
          devUtils.dirtyTables().then(function(tables){
            if (tables && tables.length === 0 && id == lnDefaultId) {
              // do nothing if no dirtyTables and using defeault ID (the used by SyncService)
              logger.log('setLocalNotification no dirty tables', id);
              resolve();
            } else {
              if (cordova && cordova.plugins && cordova.plugins.notification) {
                var alarmTime = new Date();
                alarmTime.setSeconds(alarmTime.getSeconds() + secsTillNotify);
                logger.log('setLocalNotification alarmTime', alarmTime);
                $cordovaLocalNotification.isScheduled(id).then(function(isScheduled) {
                  logger.log('setLocalNotification isScheduled', isScheduled);
                  if (isScheduled) {
                    // update existing notification
                    $cordovaLocalNotification.update({
                      id: id,
                      at: alarmTime,
                    }).then(function (result) {
                      logger.log("localNotification updated", id, result);
                      resolve(result);
                    });
                  } else {
                    // set a new notification
                    var args = {
                      id: id,
                      at: alarmTime,
                      text: msg,
                      sound: null};
                    if (device.platform == "Android") {
                       args.ongoing = true;
                       args.smallIcon = "res://icon";
                    }
                    $cordovaLocalNotification.schedule(args).then(function (result) {
                      logger.log("localNotification has been set", id, result);
                      resolve(result);
                    });
                  }
                }).catch(function(err){
                  logger.error("setLocalNotification", JSON.stringify(err));
                  reject(err);
                });
              } else {
                logger.log('setLocalNotification no cordova plugin');
                resolve();
              }
            }
          });
        }
      });
    }

    function handleLocalNotification(id, state) {
      return new Promise(function(resolve, reject) {
        if (getLocalNotificationState() == "disabled") {
          logger.log('handleLocalNotification NotificationState disabled');
          resolve();
        } else {
          logger.log('handleLocalNotification', id, state);
          if (cordova && cordova.plugins && cordova.plugins.notification) {
            if (id == lnDefaultId) { // lnDefaultId is used for our syncProcess
              $cordovaLocalNotification.cancel(id, function(){});
              devUtils.dirtyTables().then(function(tables){
                //console.log('mc tables', tables);
                if (tables && tables.length !== 0) {
                  var isOnline = $cordovaNetwork.isOnline();
                  logger.log('handleLocalNotification isOnline', isOnline);
                  if (isOnline) {
                    // take this opportunity to set our network status in case it's wrong
                    localStorage.setItem('networkStatus', 'online');
                    resolve();
                    SyncService.syncAllTables();
                  } else {
                    // take this opportunity to set our network status in case it's wrong
                    localStorage.setItem('networkStatus', 'offline');
                    setLocalNotification(id).then(function(result){
                      resolve(result);
                    }).catch(function(e){
                      reject(e);
                    });
                  }
                } else {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        }
      });
    }


    function handleLocalNotificationClick(id, state) {
      return new Promise(function(resolve, reject) {
        if (getLocalNotificationState() == "disabled") {
          logger.log('handleLocalNotification NotificationState disabled');
          resolve();
        } else {
          logger.log('handleLocalNotification', id, state);
          if (cordova && cordova.plugins && cordova.plugins.notification) {
            if (id == lnDefaultId) { // lnDefaultId is used for our syncProcess
              $cordovaLocalNotification.cancel(id, function(){});
              devUtils.dirtyTables().then(function(tables){
                //console.log('mc tables', tables);
                if (tables && tables.length !== 0) {
                  var isOnline = $cordovaNetwork.isOnline();
                  logger.log('handleLocalNotification isOnline', isOnline);
                  if (isOnline) {
                    // take this opportunity to set our network status in case it's wrong
                    localStorage.setItem('networkStatus', 'online');
                    resolve();
                  } else {
                    // take this opportunity to set our network status in case it's wrong
                    localStorage.setItem('networkStatus', 'offline');
                    setLocalNotification(id).then(function(result){
                      resolve(result);
                    }).catch(function(e){
                      reject(e);
                    });
                  }
                } else {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        }
      });
    }

    function getLocalNotificationState() {
      var localNotificationState = localStorage.getItem("localNotificationState");
      if (localNotificationState === null) {
        localNotificationState = "enabled";
        localStorage.setItem("localNotificationState", localNotificationState);
      }
      return localNotificationState;
    }

    function setLocalNotificationState(status) {
      localStorage.setItem("localNotificationState", status);
    }

  }

})();