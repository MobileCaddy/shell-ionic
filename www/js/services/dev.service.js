/**
 * Dev Factory
 *
 * @description
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('DevService', DevService);

  DevService.$inject = ['$rootScope', '$q', '_', 'devUtils', 'appDataUtils', 'smartStoreUtils', 'logger'];

  function DevService($rootScope, $q, _, devUtils, appDataUtils, smartStoreUtils, logger) {

  	var logTag = "app.DevService";

  	var _0x47ed=["","\x65\x72\x72\x6F\x72","\x63\x61\x74\x63\x68","\x6C\x65\x6E\x67\x74\x68","\x73\x75\x62\x73\x74\x72\x69\x6E\x67","\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74","\x67\x65\x74\x55\x54\x43\x44\x61\x74\x65","\x67\x65\x74\x55\x54\x43\x4D\x6F\x6E\x74\x68","\x30","\x74\x68\x65\x6E","\x61\x75\x64\x49\x64","\x67\x65\x74\x43\x75\x72\x72\x65\x6E\x74\x56\x61\x6C\x75\x65\x46\x72\x6F\x6D\x41\x70\x70\x53\x6F\x75\x70"];

	  return {
	  	authenticate: authenticate,

	    allTables: getTables,

	    allRecords: function(tableName,refreshFlag) {
	    	var tableRecs = [];
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
	    },
	    getRecordForSoupEntryId: getRecordForSoupEntryId,

      generateSupportPin: generateSupportPin,

	    insertMobileLog: insertMobileLog
	  };




		function authenticate(_0x4c81x2,_0x4c81x3)
			{
				    return new Promise(function(resolve, reject) {
				var _0x4c81x4=_0x47ed[0];
				var _0x4c81x5=0;
				appDataUtils[_0x47ed[11]](_0x47ed[10])[_0x47ed[9]](function(_0x4c81x7)
				{
					if(_0x4c81x7[_0x47ed[3]]> 15)
					{
						_0x4c81x7= _0x4c81x7[_0x47ed[4]](0,15);
					}
					for(var _0x4c81x8=0;_0x4c81x8< _0x4c81x7[_0x47ed[3]];_0x4c81x8++)
					{
						_0x4c81x5+= _0x4c81x7[_0x47ed[5]](_0x4c81x8);
					}
					_0x4c81x5+= parseInt(_0x4c81x2);var _0x4c81x9= new Date();
					var _0x4c81xa=_0x47ed[0];
					_0x4c81xa+= _0x4c81x9[_0x47ed[6]]();_0x4c81xa+= _0x4c81x9[_0x47ed[7]]();_0x4c81x5+= parseInt(_0x4c81xa);_0x4c81x4= _0x47ed[0]+ _0x4c81x5;if(_0x4c81x4[_0x47ed[3]]< 4)
					{
						var _0x4c81xb=_0x4c81x4[_0x47ed[3]]- 4;
						for(var _0x4c81xc=0;_0x4c81xc< _0x4c81xb;_0x4c81xc++)
						{
							_0x4c81x4= _0x47ed[8]+ _0x4c81x4;
						}
					}
					if(_0x4c81x4[_0x47ed[3]]> 4)
					{
						_0x4c81x4= _0x4c81x4[_0x47ed[4]](0,4);
					}
					if(_0x4c81x4=== _0x4c81x3)
					{
						resolve(true);
					}
					else
					{
						resolve(false);
					}
				}
				)[_0x47ed[2]](function(_0x4c81x6)
				{
					logger[_0x47ed[1]](logTag,_0x4c81x6);reject(_0x4c81x6);
				}
				);
			});
		}

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
	                  tables = tables;
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
	    	console.log(tableName, resObject);
	      $j.each(resObject.records, function(i,record) {
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

	  function getRecordForSoupEntryId(tableName, soupRecordId) {
	    return new Promise(function(resolve, reject) {
	      devUtils.readRecords(tableName, []).then(function(resObject) {
	        var record = _.findWhere(resObject.records, {'_soupEntryId': soupRecordId});
	        resolve(record);
	      }).catch(function(resObject){
	        reject(resObject);
	      });
	    });
	  }


    function generateSupportPin() {
      var supportPin = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
      return supportPin;
    }

	  function insertRecordUsingSmartStoreUtils(tableName, rec) {
	    return new Promise(function(resolve, reject) {
	      smartStoreUtils.insertRecords(tableName, [rec],
	        function(res) {
	          resolve(res);
	        },
	        function(err) {
	          reject(err);
	        }
	      );
	    });
	  }

	  function insertMobileLog(recs) {
	    return new Promise(function(resolve, reject) {
	      var remainingData = JSON.stringify(recs);
	      var dataToInsert = [];
	      // Push 'chunks' of data to array for processing further down
	      while (remainingData.length > 0) {
	        dataToInsert.push(remainingData.substring(0,32767));
	        remainingData = remainingData.substring(32767);
	      }
	      // Iterate over the data 'chunks', inserting each 'chunk' into the Mobile_Log_mc table
	      var sequence = Promise.resolve();
	      dataToInsert.forEach(function(data){
	        sequence = sequence.then(function() {
	          var mobileLog = {};
	          mobileLog.Name = "TMP-" + new Date().valueOf();
	          mobileLog.mobilecaddy1__Error_Text__c = data;
	          mobileLog.SystemModstamp = new Date().getTime();
	          return insertRecordUsingSmartStoreUtils('Mobile_Log__mc', mobileLog);
	        }).then(function(resObject) {
	          resolve(resObject);
	        }).catch(function(res){
	          reject(res);
	        });
	      });
	    });
	  }

  }

})();