/**
 * Network Factory
 *
 * @description Handles network events (online/offline) and kicks off tasks if needed
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('NetworkService', NetworkService);

  NetworkService.$inject = ['SyncService', 'logger'];

  function NetworkService(SyncService, logger) {
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
	      logger.log("NetworkService " + status);
	      return true;
	    }
	  };
  }

})();