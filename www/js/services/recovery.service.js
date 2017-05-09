/**
 * Recovery Factory
 *
 * @description Handles tasks needed for recovery functions in the settings
 */
(function() {
    'use strict';

    angular
        .module('starter.services')
        .factory('RecoveryService', RecoveryService);

    RecoveryService.$inject = ['SyncService', 'logger', 'smartStoreUtils', 'devUtils', 'syncRefresh', '$ionicPopup'];

    function RecoveryService(SyncService, logger, smartStoreUtils, devUtils, syncRefresh, $ionicPopup) {
        return {
            forceSync: function() {
              return new Promise(function(resolve, reject) {
                var numberOfTables = 0;
                var completedTablesCount = 0;

                var sequence = Promise.resolve();
                var syncCount = 0;

                var success = function(tablesToSync) {

                    logger.log('Built tables for forceSync: ' + JSON.stringify(tablesToSync));
                    var syncCount = 0;
                    var totalTables = tablesToSync.length;
                    var sequence = Promise.resolve();

                    tablesToSync.forEach(function(table) {
                        sequence = sequence.then(function() {
                            syncCount++;

                            // This is a call to the new recovery lighter force sync.
                            return syncRefresh.m2pRecoveryUpdateMobileTable(table);
                        }).then(function(resObject) {

                            logger.log('(' + syncCount + ' of ' + totalTables + ') Sync Result for ' + table + ': ' + JSON.stringify(resObject));

                            if (syncCount == totalTables) {
                                logger.log('Force Sync completed.');
                                resolve();
                            }
                        }).catch(function(res) {
                            logger.error('Caught error in force sync: ' + res);
                            reject(error);
                        });
                    });
                };

                var error = function(error) {
                    reject(error);
                    logger.error('Error getting tables: ' + JSON.stringify(error));
                };

                smartStoreUtils.listMobileTables(smartStoreUtils.ALPHA, success, error);
              });
            },

            recoverAllData: function() {
              return new Promise(function(resolve, reject) {
                dumpLocalStorage().then(function(res) {
                    return dumpSoups();
                }).then(function(res) {
                    return dumpTables();
                }).then(function(res) {
                    resolve();
                    logger.log('Completed Recovery: ' + res);
                }).catch(function(err) {
                    reject(err);
                    logger.error('Error in recovery: ' + err);
                });
              });
            },

            returnAllTableData: function() {
                return new Promise(function(resolve, reject) {
                    var tablesData = {};
                    devUtils.readRecords('recsToSync', []).then(function(recsToSyncRecords) {
                        tablesData.recsToSync = recsToSyncRecords;
                        smartStoreUtils.listMobileTables(smartStoreUtils.NONE, function(tables) {
                                tables.forEach(function(tableName) {
                                    devUtils.readRecords(tableName, []).then(function(records) {
                                        tablesData[tableName] = records;
                                        if (tableName === tables[tables.length - 1]) {
                                            resolve(tablesData);
                                        }
                                    }).catch(function(resObject) {
                                        logger.error("Error getting table data for viewer: " + JSON.stringify(resObject));
                                    });
                                });
                            },
                            function(error) {
                                logger.error("Unable to get tables from smartstore. " + error);
                            });
                    }).catch(function(resObject) {
                        logger.error("Error getting recsToSync data for viewer: " + JSON.stringify(resObject));
                    });
                });

            },

            returnAllLocalStorageData: function() {
              return new Promise(function(resolve, reject) {
                var dumpedLocalStorageData = [];
                for (var i in localStorage) {
                    dumpedLocalStorageData.push(localStorage[i]);
                }
                resolve(dumpedLocalStorageData);
              });
            },

            returnAllSoupsData: function() {
              return new Promise(function(resolve, reject) {
                var data = {};
                devUtils.readRecords('appSoup', []).then(function(records) {
                    data.appSoupData = records;
                    devUtils.readRecords('cacheSoup', []).then(function(records) {
                        data.cacheSoupData = records;
                        resolve(data);
                    }).catch(function(resObject) {
                        logger.error("Error getting cacheSoup data for viewer: " + JSON.stringify(resObject));
                    });
                }).catch(function(resObject) {
                    logger.error("Error getting appSoup data for viewer: " + JSON.stringify(resObject));
                });
              });
            }
        };

        function dumpTables() {
            return new Promise(function(resolve, reject) {
                var sequence = Promise.resolve();
                var dumpCount = 0;
                var totalTables = 0;
                smartStoreUtils.listMobileTables(smartStoreUtils.NONE, function(tables) {
                        tables.push('recsToSync');
                        totalTables = tables.length;

                        tables.forEach(function(tableName) {
                            sequence = sequence.then(function() {
                                dumpCount++;
                                return devUtils.readRecords(tableName, []).then(function(records) {
                                    return storeDumpedDataToRecoveryFolder('MobileTable_' + tableName, records);
                                }).then(function(resObject) {
                                    logger.log('(' + dumpCount + ' of ' + totalTables + ') Dump Result for ' + tableName + ': ' + JSON.stringify(resObject));

                                    if (dumpCount == totalTables) {
                                        resolve("Dump Completed for all tables.");
                                    }
                                }).catch(function(err) {
                                    reject(err);
                                });
                            });
                        });
                    },
                    function(error) {
                        logger.error("Unable to get tables from smartstore.");
                        reject(error);
                    });
            });
        }

        function dumpLocalStorage() {
            return new Promise(function(resolve, reject) {
                var dumpedLocalStorageData = [];
                for (var i in localStorage) {
                    dumpedLocalStorageData.push(localStorage[i]);
                }

                storeDumpedDataToRecoveryFolder('LocalStorage', dumpedLocalStorageData).then(function(res) {
                    resolve(res);
                }).catch(function(err) {
                    reject(err);
                });
            });
        }

        function dumpSoups() {
            return new Promise(function(resolve, reject) {
                devUtils.readRecords('appSoup', []).then(function(appSoupRecords) {
                    return storeDumpedDataToRecoveryFolder('AppSoup', appSoupRecords);
                }).then(function(resultOfAppSoupDump) {
                    return devUtils.readRecords('cacheSoup', []);
                }).then(function(cacheSoupRecords) {
                    return storeDumpedDataToRecoveryFolder('CacheSoup', cacheSoupRecords);
                }).then(function(resultOfCacheSoupDump) {
                    resolve("Completed dump of App Soup and Cache Soup: " + resultOfCacheSoupDump);
                }).catch(function(resObject) {
                    reject('Error in dump Soups: ' + resObject);
                });
            });
        }

        function storeDumpedDataToExternalAndroidRecoveryFolder(fileName, data) {
            // Stores dumped data to recovery folder
            // Params: fileName - name of the file. data - data to dump as JSON string

            return new Promise(function(resolve, reject) {

                logger.log('Beginning Android dump for: ' + fileName);
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {

                    var date = new Date();
                    var dateString = date.toISOString();
                    dateString = dateString.replace(/:/g, '');
                    var fileNameWithDate = 'Recovered_' + fileName + '_' + dateString + '.txt';

                    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
                        logger.log('File system open: ' + fs.name);
                        dir.getDirectory('RecoveredData', {
                            create: true
                        }, function(recoveryFolder) {

                            recoveryFolder.getFile(fileNameWithDate, {
                                create: true,
                                exclusive: false
                            }, function(fileEntry) {

                                logger.log("fileEntry is file? " + fileEntry.isFile.toString());

                                fileEntry.createWriter(function(fileWriter) {

                                    fileWriter.onerror = function(e) {
                                        logger.log("Failed file read: " + e.toString());
                                        reject(e.toString());
                                    };

                                    var dataObj = new Blob([JSON.stringify(data)], {
                                        type: 'text/plain'
                                    });
                                    logger.log('Completed write for: ' + fileName);

                                    fileWriter.write(dataObj);
                                    resolve("Completed dump of " + fileName);
                                });

                            }, function(e) {
                                reject('Error for getFile: ' + JSON.stringify(e));
                            });
                        });

                    }, function(e) {
                        reject('Error for resolveLocalFileSystemURL: ' + JSON.stringify(e));
                    });
                }, function(e) {
                    reject('Error for requestFileSystem: ' + JSON.stringify(e));
                });
            });
        }

        function storeDumpedDataToRecoveryFolder(fileName, data) {
            logger.log('Attempting to dump: ' + fileName);
            if (navigator.appVersion.includes("Electron")) {
                showAlert("Feature not supported on Desktop environment");
            } else {
                if (device.platform === "Android") {
                    return storeDumpedDataToExternalAndroidRecoveryFolder(fileName, data);
                } else {

                    return new Promise(function(resolve, reject) {

                        logger.log('Beginning iOS dump for: ' + fileName);
                        // Stores dumped data to recovery folder
                        // Params: fileName - name of the file. data - data to dump as JSON string
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {

                            var date = new Date();
                            var dateString = date.toISOString();
                            dateString = dateString.replace(/:/g, '');
                            var fileNameWithDate = 'Recovered_' + fileName + '_' + dateString + '.txt';

                            logger.log('File system open: ' + fs.name);
                            fs.root.getDirectory('RecoveredData', {
                                create: true
                            }, function(recoveryFolder) {

                                recoveryFolder.getFile(fileNameWithDate, {
                                    create: true,
                                    exclusive: false
                                }, function(fileEntry) {

                                    logger.log("fileEntry is file? " + fileEntry.isFile.toString());

                                    fileEntry.createWriter(function(fileWriter) {

                                        fileWriter.onerror = function(e) {
                                            logger.error("Failed file read: " + e.toString());
                                            reject("Failed file read: " + e.toString());
                                        };

                                        var dataObj = new Blob([JSON.stringify(data)], {
                                            type: 'text/plain'
                                        });

                                        fileWriter.write(dataObj);
                                        logger.log('Write completed: ' + fileName);
                                        resolve('Recovery Completed: ' + fileName);
                                    });

                                }, function(e) {
                                    reject('Error for getFile: ' + JSON.stringify(e));
                                });
                            }, function(e) {
                                reject('Error for getDirectory: ' + JSON.stringify(e));
                            });
                        }, function(e) {
                            reject('Error for requestFileSystem: ' + JSON.stringify(e));
                        });
                    });
                }
            } // end desktop check
        }

        function showAlert(title, message) {
          var alert = $ionicPopup.alert({
            title: title,
            template: message,
            cssClass: 'bio-popup'
          });
          alert.then(function() {

          });
        }
    }

})();
