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

  NetworkService.$inject = ['$rootScope', 'SyncService', 'logger'];

  function NetworkService($rootScope, SyncService, logger) {
  	return {
	    networkEvent: networkEvent,

      getNetworkStatus: getNetworkStatus,

      setNetworkStatus: setNetworkStatus
	  };

	  function networkEvent(status){
      var pastStatus = localStorage.getItem('networkStatus');
      if (status == "online" && pastStatus != status) {
        // You could put some actions in here that you want to take place when
        // your app regains connectivity. For example see the Mobile Seed Apps
        // If you don't need this then you can ignore this. e.g.
        // SyncService.syncTables(['Table_x__ap', 'Table_y__ap'], true);
        //
        // TODO (TH) Are we doing this, I've not looked at the flows at the time of writing?
      }
      if (pastStatus != status) {
        $rootScope.$broadcast('networkState', {state : status});
      }
      localStorage.setItem('networkStatus', status);
      logger.log("NetworkService " + status);
      return true;
    }

   	function getNetworkStatus() {
      return localStorage.getItem('networkStatus');
    }

    function setNetworkStatus(status) {
	      localStorage.setItem('networkStatus', status);
     }

  }

})();