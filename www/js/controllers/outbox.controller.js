/**
 * Outbox Controller
 *
 * @description controller for outbox page.
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('OutboxCtrl', OutboxCtrl);

  OutboxCtrl.$inject = ['$rootScope', '$scope', '$ionicLoading', '$timeout', 'logger', 'OutboxService', 'SyncService', 'NetworkService', 'UserService'];

  function OutboxCtrl($rootScope, $scope, $ionicLoading, $timeout, logger, OutboxService, SyncService, NetworkService, UserService)  {
    logger.log("in OutboxCtrl");

    var outboxControllerViewModel = this;
    var updateOutboxCountTimeout;

    outboxControllerViewModel.dirtyRecordExist = false;
    outboxControllerViewModel.syncing = false;

    // Methods used in view
    outboxControllerViewModel.syncNow = syncNow;

    activate();

    function activate() {
      $ionicLoading.show({
        duration: 5000,
        template: 'Loading...',
        animation: 'fade-in',
        showBackdrop: true
      });
      // get the dirty records
      OutboxService.getDirtyRecords().then(function(records) {
        if (records.length === 0) {
          // If no dirty records then show the 'No records...' message
          outboxControllerViewModel.dirtyRecordExist = false;
          outboxControllerViewModel.outboxCount = "";
        } else {
          // Update count in this view's title (the count next to the Outbox menu item is updated by raising event 'MenuCtrl:updateOutboxCount')
          outboxControllerViewModel.outboxCount = records.length > 0 ? " (" + records.length + ")" : "";
          outboxControllerViewModel.dirtyRecords = buildDisplayRecords(records);
          // Show the Sync Now button
          outboxControllerViewModel.dirtyRecordExist = true;
        }
        $ionicLoading.hide();
        updateOutboxCountTimeout = $timeout(function() {
          // Update the outbox count displayed in the side menu (updated in MenuCtrl)
          $rootScope.$emit('MenuCtrl:updateOutboxCount');
        },0);
      });
    }

    // Build the records to display in view
    function buildDisplayRecords(records) {
      // Count number of dirty records for each mobile table name
      var counts = _.countBy(records, 'Mobile_Table_Name');
      // Build data to display in view
      var dirtyRecords = _.map(counts, function(value, key){
        // Map a more user fiendly name to the mobile table name
        var displayTableName;
        switch (key) {
          // Add lines below like this for each table you're interested in
          // case "myDummyTable1__ap" :
          //   displayTableName = "Table 1";
          //   break;
          // case "myDummyTable1__ap" :
          //   displayTableName = "Table 2";
            // break;
          default :
            // Won't come in here unless a new mobile table has been mobilised for the app, and not catered for in switch
            displayTableName = key;
        }
        return {
            "displayTableName": displayTableName,
            "mobileTableName": key,
            "count": value
        };
      });
      return dirtyRecords;
    }

    // Run the sync method in the MenuCtrl
    function syncNow() {
      if (NetworkService.getNetworkStatus() === "online") {
        $rootScope.$emit('MenuCtrl:syncNow');
        outboxControllerViewModel.syncing = true;
      } else {
        outboxControllerViewModel.syncing = false;
        $ionicLoading.show({
          template: 'Please go on-line before attempting to sync',
          animation: 'fade-in',
          showBackdrop: true,
          duration: 2000
        });
      }
    }

    // Process events fired from the SyncService
    var deregisterHandleSyncTables = $scope.$on('syncTables', function(event, args) {
      logger.log("OutboxCtrl syncTables: " + JSON.stringify(args));
      if (args.result.toString() == "Complete") {
        // Refresh this view after sync is complete
        activate();
        outboxControllerViewModel.syncing = false;
      }
    });


    $scope.$on('$destroy', function() {
      logger.log("OutboxCtrl destroy");
      deregisterHandleSyncTables();
      $timeout.cancel(updateOutboxCountTimeout);
    });

  }

})();
