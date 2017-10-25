/**
 * Diagnostic Factory
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('DiagnosticService', DiagnosticService);

  DiagnosticService.$inject = ['devUtils', 'logger'];

  function DiagnosticService(devUtils, logger) {
  	return {
  		getCachedFlag : getCachedFlag,

  		getRecentLogs: getRecentLogs,

  		testVfRemote: testVfRemote
	  };


	  /**
	   * Returns whether or not we have a "cached" event in the cacheSoup
	   * @return {boolean}
	   */
	  function getCachedFlag() {
	    return new Promise(function(resolve, reject) {
	    	devUtils.readRecords("cacheSoup").then(function(result){
	    		if ( _.findWhere(result.records, {"Description": "cached"})) {
		    		resolve("True");
		    	} else {
		    		resolve("False");
		    	}
	    	}).catch(function(e){
	    		logger.error(e);
	    		reject(e);
	    	});
	    });
	  }


	  /**
	   * Returns latest entries in Mobile_Log__mc table. If entry is a JSON string
	   * 	then we format it too.
	   * @param  {integer} count Number of entries to return
	   * @return {array}       Array of Mobile Log entries
	   */
	  function getRecentLogs(count) {
	    return new Promise(function(resolve, reject) {
	    	devUtils.readRecords("Mobile_Log__mc").then(function(result){
	    		var latestLogs = _.chain(result.records)
  					.sortBy("_soupLastModifiedDate")
  					.reverse()
  					.first(count)
  					.value();
  				var ll2 = latestLogs.filter(function(logObj){
						return ( logObj.mobilecaddy1__Log_Type__c != "analytic" );
  				});
  				ll2.map(function(logObj){
  					logObj.errorObj = [];
  					// Check if we have a JSON string
  					try {
  						var textJson = JSON.parse(logObj.mobilecaddy1__Error_Text__c);
  						for (var prop in textJson) {
							 logObj.errorObj.push(JSON.stringify(textJson[prop]));
							}
							logObj.mobilecaddy1__Error_Text__c = '';
  					} catch  (e) {
  						// OK, carry on
  					}
  					return logObj;
  				});
	    		resolve(ll2);
		    }).catch(function(e){
	    		logger.error(e);
	    		reject(e);
	    	});
		  });
	  }

	  /**
	   * @function testVfRemote
	   * @description Does a low-level call to the MobileCaddy heartbeat
	   * @return {object}
	   */
	  function testVfRemote() {
	    return new Promise(function(resolve, reject) {
	    	try {
	    	Visualforce.remoting.Manager.invokeAction('mobilecaddy1.MobileCaddyStartPageController001_mc.heartBeat',
					function(result, event) {
						resolve({result: result, event: event});
					},
					{escape:false,timeout:30000});
		    } catch (e) {
		    	reject(e);
		    }
	    });
	  }

  }

})();