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

angular.module('starter.services', ['underscore', 'devUtils', 'vsnUtils', 'smartStoreUtils'])


/*
 * handles network events (online/offline) and kicks off tasks if needed
 */
.factory('NetworkService', ['SyncService', function(SyncService){
  return {
    networkEvent: function(status){
      var pastStatus = localStorage.getItem('networkStatus');
      if (status == "online" && pastStatus != status) {
        // You could put some actions in here that you want to take place when
        // your app regains connectivity. For example see the Mobile Seed Apps
        // If you don't need this then you can ignore this. e.g.
        // SyncService.syncTables(['Table_x__ap', 'Table_y__ap'], true);
      }
      localStorage.setItem('networkStatus', status);
      return true;
    }
  };
}])

  /*
  ===========================================================================
    S Y N C    S E R V I C E
  ===========================================================================
  */

.factory('SyncService', ['$rootScope', 'devUtils', function($rootScope, devUtils){

  function  syncTables(tablesToSync, syncWithoutLocalUpdates, maxTableAge) {
    if (typeof(maxTableAge) == "undefined") {
      maxTableAge = (1000 * 60 * 3); // 3 minutes
    }
    //console.log('syncTables syncWithoutLocalUpdates, maxTableAge',syncWithoutLocalUpdates,maxTableAge);
    $rootScope.$broadcast('syncTables', {result : "Sync"});

    var stopSyncing = false;
    var firstSync = true;
    var syncCount = 0;
    var sequence = Promise.resolve();
    var maxRecsPerCall = 50;

    tablesToSync.forEach(function(table){
      sequence = sequence.then(function() {
        syncCount ++;
        //console.log("syncTables",table,syncCount,maxRecsPerCall);
        if (stopSyncing) {
          return {status: "100999"};  // "100999" is not an official code (used to indicate stopping of sync)
        } else {
          //console.log("syncTables call syncMobileTable",table,syncWithoutLocalUpdates,maxTableAge,maxRecsPerCall);
          return devUtils.syncMobileTable(table, syncWithoutLocalUpdates, maxTableAge, maxRecsPerCall);
        }
      }).then(function(resObject) {
        //console.log('syncTables syncMobileTable result',angular.toJson(resObject),firstSync,syncCount);
        if (typeof(resObject.status) != "undefined" && resObject.status != "100400") {
          if (resObject.status != "100999") {
            // We haven't stopped the sync
            if (resObject.status == "100497" ||
                resObject.status == "100498" ||
                resObject.status == "100402" ||
                (typeof(resObject.mc_add_status) != "undefined" && resObject.mc_add_status == "sync-too-soon")) {
              // "100497" => table is too young (synced recently) -> break out of any further syncing attempts
              // "100498" => sync already in progress
              // "100402" => error (e.g. offline, timeout)
              // We stop syncing if the first sync has a problem
              if (firstSync) {
                stopSyncing = true;
                $rootScope.$broadcast('syncTables', {result : resObject.status});
              }
            }
            // Unable to sync -> set a local notification?
          }
        } else {
          // Successful sync -> cancel any local notifications?
        }
        if (syncCount == tablesToSync.length && !stopSyncing) {
          // All syncs complete
          $rootScope.$broadcast('syncTables', {result : "Complete"});
        }
        firstSync = false;
      }).catch(function(res){
        if (typeof(res.status) != "undefined" &&
             (res.status == "100497" ||
              res.status == "100498" ||
              res.status == "100402")) {
          //console.log(res);
          $rootScope.$broadcast('syncTables', {result : "Complete"});
        } else {
          console.error(res);
          $rootScope.$broadcast('syncTables', {result : "Error"});
        }
        // Unable to sync -> set a local notification?
      });
    });
  }

  return {
    getSyncLock: function(syncLockName){
      var syncLock = localStorage.getItem(syncLockName);
      if (syncLock === null) {
        syncLock = "false";
        localStorage.setItem(syncLockName, syncLock);
      }
      //console.log("mc getSyncLock syncLock", syncLock);
      return syncLock;
    },
    setSyncLock: function(syncLockName, status){
      localStorage.setItem(syncLockName, status);
      //console.log("mc setSyncLock", syncLockName, status);
    },
    getSyncState: function(){
      var syncState = localStorage.getItem("syncState");
      if (syncState === null) {
        syncState = "Complete";
        localStorage.setItem("syncState", syncState);
      }
      //console.log("mc getSyncState syncState", syncState);
      return syncState;
    },
    setSyncState: function(status){
      localStorage.setItem("syncState", status);
      //console.log("mc setSyncState", "syncState", status);
    },
    syncTables: function(tabs2Sync, syncWithoutLocalUpdates, maxTableAge) {
      syncTables(tabs2Sync, syncWithoutLocalUpdates, maxTableAge);
    }
  };
}])


/*
 * Collects 'resume' event and checks if there's an upgrade available. If so
 *  then ask the user if they want to upgrade. If not then refrain from
 *  asking again for a period if time.
 */
.factory('AppRunStatusService', ['$ionicPopup', '$ionicLoading', 'devUtils', 'vsnUtils', 'SyncService', function($ionicPopup, $ionicLoading, devUtils, vsnUtils, SyncService) {
  // The commented out code can be used as a guide on how to handle
  // prompting users to upgrade. The below checks if an upgrade is available
  // and if so prompts the user.
  // This function is called from with app.js where the "resume" event is
  // caught.

  // function resume() {
  //   devUtils.dirtyTables().then(function(tables){
  //     //console.log('AppRunStatusService resume tables',tables);
  //     if (tables && tables.length === 0) {
  //       vsnUtils.upgradeAvailable().then(function(res){
  //         //console.log('AppRunStatusService upgradeAvailable?',res);
  //         if (res) {
  //           var notificationTimeout = (1000 * 60 * 5); // 5 minutes
  //           var prevUpNotification = localStorage.getItem('prevUpNotification');
  //           var timeNow = Date.now();
  //           if (prevUpNotification === null) {
  //             prevUpNotification = 0;
  //           }
  //           if (parseInt(prevUpNotification) < (timeNow - notificationTimeout)){
  //             var confirmPopup = $ionicPopup.confirm({
  //               title: 'Upgrade available',
  //               template: 'Would you like to upgrade now?',
  //               cancelText: 'Not just now',
  //               okText: 'Yes'
  //             });
  //             confirmPopup.then(function(res) {
  //               if(res) {
  //                 $ionicLoading.show({
  //                   duration: 30000,
  //                   delay : 400,
  //                   maxWidth: 600,
  //                   noBackdrop: true,
  //                   template: '<h1>Upgrade app...</h1><p id="app-upgrade-msg" class="item-icon-left">Upgrading...<ion-spinner/></p>'
  //                 });
  //                 localStorage.removeItem('prevUpNotification');
  //                 vsnUtils.upgradeIfAvailable().then(function(res){
  //                   //console.log('upgradeIfAvailable', res);
  //                 }).catch(function(e){
  //                   console.error(e);
  //                   $ionicLoading.hide();
  //                 });
  //               } else {
  //                 localStorage.setItem('prevUpNotification', timeNow);
  //               }
  //             });
  //           }
  //         }
  //       });
  //     } else {
  //       SyncService.syncTables(['Table_x__ap'], true);
  //     }
  //   });
  //   return true;
  // }

  return {
    statusEvent: function(status){
      //console.log('AppRunStatusService statusEvent', status);
      if (status == "resume") {
        // resume();
      }
    }
  };
}])

  /*
  ===========================================================================
    M O B I L C A D D Y     S E T T I N G S
  ===========================================================================
  */

.factory('DevService', ['$rootScope', '$q', '_', 'devUtils', 'smartStoreUtils', function($rootScope, $q, _, devUtils, smartStoreUtils) {

  function getTables() {
    var deferred = $q.defer();
    var tables = [];

    // Add other system tables
    tables.push({'Name' : 'syncLib_system_data'});
    tables.push({'Name' : 'appSoup'});
    tables.push({'Name' : 'cacheSoup'});
    tables.push({'Name' : 'recsToSync'});
    smartStoreUtils.listMobileTables(
      smartStoreUtils.ALPHA,
      // Success callback
      function(tableNames) {
          $j.each(tableNames, function(i,tableName) {
            tables.push({'Name' : tableName});
            // TODO :: make this a promise ?
            // TODO :: Improve this, add a meta table?
            smartStoreUtils.getTableDefnColumnValue(
              tableName,
              'Snapshot Data Required',
              function(snapshotValue) {
                // Create the snapshot table too, if required
                if (snapshotValue == 'Yes') {
                  tables.push({'Name' : 'SnapShot_' + tableName});
                } else {
                }
                $rootScope.$apply(function(){
                  this.tables = tables;
                });
                return tables;
              }, // end success callback
              function(resObject){
                console.error('MC : Error from listMobileTables -> ' + angular.toJson(resObject));
                deferred.reject('error');
              });
          });

          $rootScope.$apply(function(){
            deferred.resolve(tables);
            });
          return deferred.promise;
        },
      function(e) {
        console.log('MC: error from listMobileTables -> ' + angular.toJson(e));
        deferred.reject(e);
      });
    return deferred.promise;
  }


 /**
  * Works out if Val is likely an ID based on it's format
  * @param {string} Val
  * @return {boolean}
  */
  function isId(Val) {
    var patt = /^[a-zA-Z0-9]{18}$/;
    return patt.test(Val);
  }


  function getRecords(tableName, refreshFlag) {
    var deferred = $q.defer();
    var myTableRecs = [];
    devUtils.readRecords(tableName, []).then(function(resObject) {
      records = resObject.records;
      $j.each(records, function(i,record) {
        var tableRec = [];
        for (var fieldDef in record) {
          var field = {
            'Name' : fieldDef,
            'Value' : record[fieldDef],
            'ID_flag' : isId(record[fieldDef])};
          tableRec.push(field);
        } // end loop through the object fields
        myTableRecs.push(tableRec);
      });
      deferred.resolve(myTableRecs);
    }).catch(function(resObject){
      console.error('MC : Error from devUtils.readRecords -> ' + angular.toJson(resObject));
      deferred.reject('error');
    });
    return deferred.promise;
  }


  return {
    allTables: function() {
      return getTables();
    },
    allRecords: function(tableName,refreshFlag) {
      switch (refreshFlag) {
        case true :
          tableRecs = [];
          tableRecs = getRecords(tableName, true);
          break;
        default :
          if ((typeof tableRecs == 'undefined') || (tableRecs.length < 1)) {
            tableRecs = [];
            tableRecs = getRecords(tableName, true);
          } else {
            tableRecs = [];
            tableRecs = getRecords(tableName, false);
          }
      }
      return tableRecs;
    }
  };

}])

.factory('DeployService', ['$rootScope', '$q', '$timeout', '$http', function($rootScope, $q, $timeout, $http) {

  var apiVersion = "v32.0";

  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }

  /**
   * Does the static resource already exist on the platform for this app/vsn
   */
  function doesBundleExist(appConfig){
    return new Promise(function(resolve, reject) {
    var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
    // check if statid resource already exists
    force.request(
      {
        path: '/services/data/' + apiVersion + '/tooling/query/?q=select Id, Name, Description, LastModifiedDate from StaticResource WHERE Name=\'' + dataName + '\' LIMIT 1'
      },
      function(response) {
          console.debug('response' , response);
          resolve(response);
      },
      function(error) {
        console.error('Failed to check if app bundle already existed on platform');
        reject({message :"App bundle upload failed. See console for details.", type: 'error'});
      });
    });
  }

  /**
   * Does the static resource already exist on the platform for this app/vsn
   */
  function doesPageExist(pageName){
    return new Promise(function(resolve, reject) {
    // check if statid resource already exists
    force.request(
      {
        path: '/services/data/' + apiVersion + '/tooling/query/?q=select Id, Name, Description, LastModifiedDate from ApexPage WHERE Name=\'' + pageName + '\' LIMIT 1'
      },
      function(response) {
          console.debug('response' , response);
          resolve(response);
      },
      function(error) {
        console.error('Failed to check if page already existed on platform');
        reject({message :"Page upload failed. See console for details.", type: 'error'});
      });
    });
  }

  function getDetails () {
    return new Promise(function(resolve, reject) {
    var details = {};
    $timeout(function() {
        $http.get('../package.json').success(function(appConfig) {
          appConfig.sf_app_vsn = appConfig.version.replace(/\./g, '');
          resolve(appConfig);
        }).catch(function(err){
          console.error(err);
        });
    }, 30);
    });
  }

  function encodeAppBundle(appConfig){
    return new Promise(function(resolve, reject) {

      JSZipUtils.getBinaryContent('../' + appConfig.name + '-' + appConfig.version +'.zip', function(err, data) {
        if(err) {
          console.error(err);
          reject(err); // or handle err
        }
        var zipFileLoaded = new JSZip(data);
        $rootScope.deployFiles = zipFileLoaded.files;
        resolve(_arrayBufferToBase64(data));
      });
    });
  }

  function uploadAppBundle (appConfig, myBody) {
    return new Promise(function(resolve, reject) {
    var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
    doesBundleExist(appConfig).then(function(response){
      if (response.records.length > 0) {
        // Update existing resource
        console.debug('resource exists... patching existing');
        var existingSR = response.records[0];
        force.request(
          {
            method: 'PATCH',
            contentType: 'application/json',
            path: '/services/data/' + apiVersion + '/tooling/sobjects/StaticResource/' + existingSR.Id + '/',
            data: {
              'Body':myBody
            }
          },
          function(response) {
              console.debug('response' , response);
              resolve('Existing app bundle updated');
          },
          function(error) {
            console.error('Failed to check if app bundle already existed on platform');
            reject({message :"App bundle upload failed. See console for details.", type: 'error'});
          }
        );
      } else {
        // Updload new resource
        force.request(
          {
            method: 'POST',
            contentType: 'application/json',
            path: '/services/data/' + apiVersion + '/tooling/sobjects/StaticResource/',
            data: {
              'Name': dataName,
              'Description' : 'App Bundle - auto-uploaded by MobileCaddy delopyment tooling',
              'ContentType':'application/zip',
              'Body':myBody,
              'CacheControl': 'Public'
            }
          },
          function(response) {
            console.debug('response' , response);
            resolve('App bundle uploaded');
          },
          function(error) {
            console.error(error);
            reject({message :"App bundle upload failed. See console for details.", type: 'error'});
          });
      }
    });
    });
  }

  function uploadCachePage(appConfig) {
    return new Promise(function(resolve, reject) {
      $timeout(function() {
        $http.get('../apex-templates/cachepage-template.apex').success(function(data) {
          var dataName = appConfig.sf_app_name + 'Cache_' + appConfig.sf_app_vsn;
          var cacheEntriesStr = '';
          _.each($rootScope.deployFiles, function(el){
            if (!el.dir) cacheEntriesStr += '{!URLFOR($Resource.' + appConfig.sf_app_name + '_' + appConfig.sf_app_vsn + ', \'' + el.name + '\')}\n';
          });
          var dataParsed = data.replace(/MC_UTILS_RESOURCE/g, appConfig.mc_utils_resource);
          dataParsed = dataParsed.replace(/MY_APP_FILE_LIST/g, cacheEntriesStr);
          delete $rootScope.deployFiles;

          doesPageExist(dataName).then(function(response){
            if (response.records.length > 0) {
               // Update existing resource
              console.debug('page exists... patching existing');
              var existingPage = response.records[0];
              force.request(
                {
                  method: 'PATCH',
                  contentType: 'application/json',
                  path: '/services/data/' + apiVersion + '/tooling/sobjects/ApexPage/' + existingPage.Id + '/',
                  data: {
                    'Markup' : dataParsed
                  },
                },
                function(response) {
                  resolve('Existing Cache manifest updated');
                },
                function(error) {
                  console.error(error);
                  reject({message :'Cache manifest upload failed. See console for details.', type: 'error'});
                }
              );
            } else {
              force.request(
                {
                  method: 'POST',
                  contentType: 'application/json',
                  path: '/services/data/' + apiVersion + '/tooling/sobjects/ApexPage/',
                  data: {
                    'Name': dataName,
                    'MasterLabel': dataName,
                    'Markup' : dataParsed
                  }
                },
                function(response) {
                  resolve('Cache manifest uploaded');
                },
                function(error) {
                  console.error(error);
                  reject({message :'Cache manifest upload failed. See console for details.', type: 'error'});
                }
              );
            }
        });
      }, 30);
    });
    });
  }


  function uploadStartPage(appConfig) {
    return new Promise(function(resolve, reject) {
      $timeout(function() {
        $http.get('../apex-templates/startpage-template.apex').success(function(data) {
          var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
          var dataParsed = data.replace(/MC_UTILS_RESOURCE/g, appConfig.mc_utils_resource);
          dataParsed = dataParsed.replace(/MY_APP_RESOURCE/g, appConfig.sf_app_name + '_' + appConfig.sf_app_vsn);
          dataParsed = dataParsed.replace(/MY_APP_CACHE_RESOURCE/g, appConfig.sf_app_name + 'Cache_' + appConfig.sf_app_vsn);
          force.request(
            {
              method: 'POST',
              contentType: 'application/json',
              path: '/services/data/' + apiVersion + '/tooling/sobjects/ApexPage/',
              data: {
                'Name': dataName,
                'ControllerType' : '3',
                'MasterLabel': dataName,
                'Markup' : dataParsed
              }
            },
            function(response) {
              resolve('Start page uploaded');
            },
            function(error) {
              console.error(error);
              doesPageExist(dataName).then(function(response){
                if (response.records.length > 0) {
                  reject({message :'Start page already exists. Not updated.', type : 'info'});
                } else {
                  reject({message :'Start page upload failed. See console for details.', type: 'error'});
                }
              });
            }
          );
        });
      }, 30);
    });
  }

  return {
    getDetails : function() {
      return getDetails();
    },
    deployBunlde : function(appConfig){
      return encodeAppBundle(appConfig).then(function(myBody, bundleFiles){
        return uploadAppBundle(appConfig, myBody);
      });
    },
    uploadCachePage : function(appConfig){
      return uploadCachePage(appConfig);
    },
    uploadStartPage : function(appConfig){
      return uploadStartPage(appConfig);
    },
    srDetails: function() {
      return encodeAppBundle().then(function(myBody){
        return uploadAppBundle(myBody);
      }).then(function(res){
        return uploadStartPage();
      });
    }
  };
}]);