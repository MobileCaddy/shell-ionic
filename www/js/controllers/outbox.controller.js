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
    // console.log("tops in OutboxCtrl");

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
        // console.log("tops OutboxCtrl dirty records: ",records);
        if (records.length === 0) {
          // If no dirty records then show the 'No records...' message
          outboxControllerViewModel.dirtyRecordExist = false;
          outboxControllerViewModel.outboxCount = "";
        } else {
          // Update count in this view's title (the count next to the Outbox menu item is updated by raising event 'MenuCtrl:updateOutboxCount')
          outboxControllerViewModel.outboxCount = records.length > 0 ? " (" + records.length + ")" : "";
          outboxControllerViewModel.dirtyRecords = buildDisplayRecords(records);
          // console.log("tops OutboxCtrl dirty records vm.dirtyRecords: ",vm.dirtyRecords);
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
      // console.log("tops OutboxCtrl dirty records counts: ",counts);
      // Build data to display in view
      var dirtyRecords = _.map(counts, function(value, key){
        // Map a more user fiendly name to the mobile table name
        var displayTableName;
        switch (key) {
          case "Passenger__ap" :
            displayTableName = "Passenger";
            break;
          case "Tour_Instance__ap" :
            displayTableName = "Tour/Trip";
            break;
          case "Passenger_Optional__ap" :
            displayTableName = "Passenger Optional";
            break;
          case "Email_Print_Request__ap" :
            displayTableName = "Print/Email";
            break;
          case "Tour_Instance_Itinerary__ap" :
            displayTableName = "Itinerary";
            break;
          case "Supplier__ap" :
            displayTableName = "Supplier";
            break;
          case "Tour_Optional__ap" :
            displayTableName = "Tour Optional";
            break;
          case "SupplierMenu__ap" :
            displayTableName = "Supplier Menu";
            break;
          case "Mobile_Feedback__ap" :
            displayTableName = "Feedback";
            break;
          case "TourDirector__ap" :
            displayTableName = "My Profile";
            break;
          case "Unavailable_Period__ap" :
            displayTableName = "My Unavailability";
            break;
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
    var deregisterHandleSyncTables = $rootScope.$on('syncTables', function(event, args) {
      logger.log("OutboxCtrl syncTables: " + JSON.stringify(args));
      // console.log("tops OutboxCtrl syncTables: " + JSON.stringify(args));
      if (args.result.toString() == "Complete") {
        // Refresh this view after sync is complete
        activate();
        outboxControllerViewModel.syncing = false;
      }
    });

    function changeHeaderBarColor(color) {
      var element = angular.element(document.querySelectorAll('ion-header-bar'));
      var wrappedElement;
      for (var i = element.length - 1; i >= 0; --i) {
        wrappedElement = angular.element(element[i]);
        wrappedElement.css('background-color', color);
        wrappedElement.css('border-color', color);
        wrappedElement.css('background-image', 'linear-gradient(0deg, ' + color + ', ' + color + '50%, transparent 50%)');
      }
      element = wrappedElement = null;
    }

    function updateHeaderbarColor() {
      UserService.getMyBrandColor().then(function(res) {
        changeHeaderBarColor(res);
      }).catch(function(resObject){
        logger.error('updateHeaderbarColor ' + JSON.stringify(resObject));
      });
    }

    var deregisterIonicViewBeforeEnter = $scope.$on('$ionicView.beforeEnter', function(scopes, states) {
      updateHeaderbarColor();
    });

    $scope.$on('$destroy', function() {
      logger.log("OutboxCtrl destroy");
      // console.log("tops OutboxCtrl destroy");
      deregisterHandleSyncTables();
      deregisterIonicViewBeforeEnter();
      $timeout.cancel(updateOutboxCountTimeout);
    });

  }

})();
