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

  DiagnosticService.$inject = [];

  function DiagnosticService() {
  	return {
  		testVfRemote: testVfRemote
	  };

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