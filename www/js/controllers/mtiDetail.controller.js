/**
 * MTIDetail Controller
 *
 * @description controller for the MTI details (per table)
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('MTIDetailCtrl', MTIDetailCtrl);

  MTIDetailCtrl.$inject = ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'DevService'];

  function MTIDetailCtrl($scope, $stateParams, $ionicLoading, $ionicModal, DevService) {

	  $ionicLoading.show({
	      duration: 30000,
	      noBackdrop: true,
	      template: '<p id="app-progress-msg" class="item-icon-left"><i class="icon ion-loading-c"></i>Fetching records...</p>'
	    });
	  $scope.table = {'Name': $stateParams.tableName};
	  DevService.allRecords($stateParams.tableName, false)
	    .then(function(tableRecs) {
	    $scope.tableRecs = tableRecs;
	    $ionicLoading.hide();
	  }, function(reason) {
	    console.error('Angular: promise returned error -> ' + reason);
	  });

	  $scope.getItemHeight = function(item, index) {
	    return (typeof(item) != "undefined")  ? 100 + item.length*55 : 0;
	  };

	  $scope.search = {};

	  $scope.clearSearch = function() {
	    $scope.search.query = "";
	  };

	  $scope.showRecord = function(tableRec, soupRecordId) {
	    $ionicLoading.show({
	      duration: 10000,
	      template: 'Loading...'
	    });
	    var tableName;
	    for (i = 0, len = tableRec.length; i < len; i++) {
	      if (tableRec[i].Name == "Mobile_Table_Name") {
	        tableName = tableRec[i].Value;
	      }
	    }
	    console.log("tableName",tableName, soupRecordId);
	    DevService.getRecordForSoupEntryId(tableName, soupRecordId).then(function(record) {
	      console.log("record",record);
	      $scope.showTableRecord(tableName, record, soupRecordId);
	      $ionicLoading.hide();
	    }, function(reason) {
	      $ionicLoading.hide();
	      console.error('getRecordForSoupEntryId ' + reason);
	    });
	  };

	  $scope.showTableRecord = function(tableName, record, soupRecordId) {
	    $ionicModal.fromTemplateUrl('settingDevMTITableRecord.html', function(modal) {
	      $scope.tableRecordModal = modal;
	      $scope.tableRecordModal.tableName = tableName;
	      $scope.tableRecordModal.record = record;
	      $scope.tableRecordModal.soupRecordId = soupRecordId;
	      $scope.tableRecordModal.show();
	    }, {
	      scope: $scope,
	      animation: 'slide-in-up',
	      backdropClickToClose : false
	    });
	  };

	  $scope.closeShowTableRecord = function() {
	    $scope.tableRecordModal.hide();
	    $scope.tableRecordModal.remove();
	    delete $scope.tableRecordModal;
	  };

  }

})();