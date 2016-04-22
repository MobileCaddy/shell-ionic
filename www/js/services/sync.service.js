/**
 * Sync Factory
 *
 * @description Handles Sync calls to the MobileCaddy API amd gets/sets sync state
 *
 */
(function() {
	'use strict';

	angular
		.module('starter.services')
		.factory('SyncService', SyncService);

	SyncService.$inject = ['$rootScope', 'devUtils', 'LocalNotificationService','UserService'];

	function SyncService($rootScope, devUtils, LocalNotificationService, UserService) {

		// Just a guess at the record age that is acceptable to be on the device
		// Set as needed for your use case
		var fourHours = 1000 * 60 * 60 * 4; // 4 hours in milliseconds

		// This is where you put your list of tables that you want from the platform
		var appTables = [
			{'Name': 'myDummyTable1__ap', 'syncWithoutLocalUpdates': true, 'maxTableAge' : fourHours},
			{'Name': 'myDummyTable2__ap', 'syncWithoutLocalUpdates': true, 'maxTableAge' : fourHours}
		];

		var appTablesSyncNow = [
			{'Name': 'myDummyTable1__ap', 'syncWithoutLocalUpdates': true, 'maxTableAge' : 0}
		];


		return {
			appTables: appTables,

			getSyncLock: getSyncLock,

			setSyncLock: setSyncLock,

			getSyncState: getSyncState,

			setSyncState: setSyncState,

			syncAllTables: syncAllTables,

			syncAllTablesNow: syncAllTablesNow,

			syncTables: syncTables,

			initialSync: initialSync,

			coldStartSync: coldStartSync,

			pushTables: pushTables

		};


		/**
		 * @function getSyncLock
		 * @description gets syncLockName value from localStorage, or "false" if not set
		 * @param {string | undefined} syncLockName
		 * @return {string}
		 */
		function getSyncLock(syncLockName) {
			if (!syncLockName) syncLockName = 'syncLock';
			var syncLock = localStorage.getItem(syncLockName);
			if (syncLock === null) {
				syncLock = "false";
				localStorage.setItem(syncLockName, syncLock);
			}
			return syncLock;
		}


		/**
		 * @function setSyncLock
		 * @description Sets syncLockName value in localStorage item
		 * @param {string} syncLockName
		 * @param {string} status
		 */
		function setSyncLock(syncLockName, status) {
			if (!status) {
				status = syncLockName;
				syncLockName = 'syncLock';
			}
			localStorage.setItem(syncLockName, status);
		}


		/**
		 * @function getSyncState
		 * @description gets syncState from localStorage, or "complete" if not set
		 * @return {string}
		 */
		function getSyncState() {
			var syncState = localStorage.getItem("syncState");
			if (syncState === null) {
				syncState = "Complete";
				localStorage.setItem("syncState", syncState);
			}
			return syncState;
		}


		/**
		 * @function setSyncState
		 * @description Sets syncState localStorage item
		 * @param {string} status
		 */
		function setSyncState(status) {
			localStorage.setItem("syncState", status);
		}


		/**
		 * @function initialSync
		 * @description Makes initialSync call for all (biz logic) tables
		 * @return {promise}
		 */
		function initialSync() {
			// return syn/cAllTables();
			return new Promise(function(resolve, reject) {
				setSyncState("syncing");
				var initialTabArr = [];
				appTables.forEach(function(el){
					if (el.syncWithoutLocalUpdates) initialTabArr.push(el.Name);
				});
				//console.log('initialSync', initialTabArr);
				devUtils.initialSync(initialTabArr).then(function(res){
					UserService.setProcessDone("initialDataLoaded");
					$rootScope.$emit('syncTables', {result : "InitialLoadComplete"});
					setSyncState("Complete");
					resolve();
				}).catch(function(resObject){
					// TODO LOGGER in MOCK FOR UNIT TEST
					console.error('initialSync ',resObject);
					reject(resObject);
				});
			});
		}


		/**
		 * @function coldStartSync description
		 * @description Calls iterative sync on all tables (Mobile_Log__mc first)
		 * @return {promise}
		 */
		function coldStartSync() {
			return new Promise(function(resolve, reject) {
				//console.log("coldStartSync");
				var myAppTables = [{'Name': 'Mobile_Log__mc', 'syncWithoutLocalUpdates': false, 'maxTableAge' : fourHours}].concat(appTables);
				syncTables(myAppTables).then(function(resObject){
					//console.log('coldStartSync', resObject);
					resolve(resObject);
				});
				// IT ALWAYS RESOLVES
				// }) .catch(function(resObject){
				//     logger.warn('syncAllTables ',resObject);
				//     reject(resObject);
				// });
			});
		}


		/**
		 * @function syncAllTables description
		 * @description Calls iterative sync on all tables (Mobile_Log__mc first)
		 * @return {promise}
		 */
		function syncAllTables() {
			return new Promise(function(resolve, reject) {
				var myAppTables = appTables;
				myAppTables.push({'Name': 'Mobile_Log__mc', 'syncWithoutLocalUpdates': false, 'maxTableAge' : fourHours});
				syncTables(myAppTables).then(function(resObject){
					//console.log('syncAllTables', resObject);
					resolve(resObject);
				});
				// IT ALWAYS RESOLVES
				// }) .catch(function(resObject){
				//     logger.warn('syncAllTables ',resObject);
				//     reject(resObject);
				// });
			});
		}


		/**
		 * @function syncAllTablesNow
		 * @description Calls iterative sync on all tables now
		 * @return {promise}
		 */
		function syncAllTablesNow() {
			return new Promise(function(resolve, reject) {
				syncTables(appTablesSyncNow).then(function(resObject){
					//console.log('syncAllTablesNow', resObject);
					resolve(resObject);
				});
				// IT ALWAYS RESOLVES
				// }) .catch(function(resObject){
				//     logger.warn('syncAllTablesNow ',resObject);
				//     reject(resObject);
				// });
			});
		}


		/**
		 * @function syncTables
		 * @description syncs tables to/from SFDC
		 * @param  {object[]} - array of {Name, syncWithoutLocalUpdates, maxTableAge}
		 */
		function syncTables(tablesToSync){
			return new Promise(function(resolve, reject) {
				// TODO - put some local notification stuff in here.
				doSyncTables(tablesToSync).then(function(res){
					// console.log("syncTables", res);
					$rootScope.$emit('syncTables', {result : "Complete"});
					setSyncState("Complete");
					// NOTE - Commented out for the time being - see TOPS-96
					if (!res || res.status == 100999) {
						LocalNotificationService.setLocalNotification();
					} else {
						LocalNotificationService.cancelNotification();
					}
					resolve(res);
				});
				// IT ALWAYS RESOLVES
				// }).catch(function(e){
				// 	logger.warn('syncTables', e);
				// 	$rootScope.$emit('syncTables', {result : "Complete"});
				//    setSyncState("Complete");
				//    reject(e);
				// });
			});
		}

		/**
		 * @description This is used to push a list of tables only if there are records waiting to be pushed
		 * @param string[] Array of table names to be synced in order
		 **/
		function pushTables(tablesToPush) {
			// Loop through the tables and build up an array of {Name, syncWithoutLocalUpdates, maxTableAge}
			var tablesToSync = [];
			tablesToPush.forEach(function(el){
				tablesToSync.push({'Name':el, 'syncWithoutLocalUpdates':false, 'maxTableAge':0});
			});
			// console.log('tops tablesToSync ',tablesToSync);
			return new Promise(function(resolve, reject) {
				// TODO - put some local notification stuff in here.
				doSyncTables(tablesToSync).then(function(res){
					// console.log("syncTables", res);
					$rootScope.$emit('syncTables', {result : "Complete"});
					setSyncState("Complete");
					// NOTE - Commented out for the time being - see TOPS-96
					if (!res || res.status == 100999) {
					 LocalNotificationService.setLocalNotification();
					} else {
					 LocalNotificationService.cancelNotification();
					}
					resolve(res);
				});
				// IT ALWAYS RESOLVES
				// }).catch(function(e){
				//  logger.warn('syncTables', e);
				//  $rootScope.$emit('syncTables', {result : "Complete"});
				//    setSyncState("Complete");
				//    reject(e);
				// });
			});
		}

		function doSyncTables(tablesToSync){
			// Check that we not syncLocked or have a sync in progress
			var syncLock = getSyncLock();
			var syncState = getSyncState();
			if (syncLock == "true" || syncState == "syncing") {
				return Promise.resolve({status:100999});
			} else {
				setSyncState("syncing");
				$rootScope.$emit('syncTables', {result : "StartSync"});

				var stopSyncing = false;
				var sequence = Promise.resolve();

				return tablesToSync.reduce(function(sequence, table){
					if (typeof(table.maxTableAge) == "undefined") {
						table.maxTableAge = (1000 * 60 * 1); // 3 minutes
					}
					return sequence.then(function(res) {
						//console.log("doSyncTables inSequence", table, res, stopSyncing);
						//$rootScope.$emit('syncTables', {result : "TableComplete " + table.Name});
						if (!stopSyncing) {
							return devUtils.syncMobileTable(table.Name, table.syncWithoutLocalUpdates, table.maxTableAge);
						} else {
							//console.log("skipping sync");
							return {status:100999};
						}
					}).then(function(resObject){
						switch (resObject.status) {
							case devUtils.SYNC_NOK :
							case devUtils.SYNC_ALREADY_IN_PROGRESS :
								if (typeof(resObject.mc_add_status) == "undefined" || resObject.mc_add_status != "no-sync-no-updates") {
									stopSyncing = true;
									setSyncState("Complete");
								}
						}
						$rootScope.$emit('syncTables', {table: table.Name, result : resObject.status});
						return resObject;
					}).catch(function(e){
						//console.error('doSyncTables', e);
						if (e.status != devUtils.SYNC_UNKONWN_TABLE) {
							stopSyncing = true;
							$rootScope.$emit('syncTables', {table: table.Name, result : e.status});
							setSyncState("Complete");
						}
						return e;
					});
				}, Promise.resolve());

			}
		}


	}

})();
