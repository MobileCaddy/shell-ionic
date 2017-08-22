/**
 * MTI Controller
 *
 * @description controller for the MTI listing
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('MTICtrl', MTICtrl);

  MTICtrl.$inject = ['$stateParams', '$scope', '$rootScope', '$location', '$ionicPopup', '$ionicLoading', 'DevService', 'devUtils', 'logger', 'syncRefresh'];

  function MTICtrl($stateParams, $scope, $rootScope, $location, $ionicPopup, $ionicLoading, DevService, devUtils, logger, syncRefresh) {

  	if ($stateParams.recovery) {
  		$scope.recovery = true;
  	}

	  var adminTimeout = (1000 * 60 *5 ); // 5 minutes
	  if ( $rootScope.adminLoggedIn > Date.now() - adminTimeout) {
	  } else {
	    $location.url('tab/settings');
	    var alertPopup = $ionicPopup.alert({
	      title: 'Access Denied'
	    });
	    alertPopup.then(function(res) {
	      //$location.url('tab/settings');
	      $scope.$apply();
	    });
	  }

	  DevService.allTables().then(function(tables) {
	    $scope.tables = tables;
	  }, function(reason) {
	    console.error('Angular: promise returned reason -> ' + reason);
	  });

	  $scope.showTable = function(tableName) {
	    $location.path(decodeURIComponent("/tab/settings/mti/" + tableName));
	  };

	  $scope.syncTable = function(tableName) {
	    var confirmPopup = $ionicPopup.confirm({
	      title: 'Sync Table',
	      template: "<div style='text-align:center;'>Are you sure you want to sync " + tableName + "?</div>",
	      cancelText: 'No',
	      okText: 'Yes',
	    });
	    confirmPopup.then(function(res) {
	      if (res) {
	        $ionicLoading.show({
	          duration: 10000,
	          template: 'Syncing ' + tableName + " ..."
	        });
	        if ($scope.recovery) {
						syncRefresh.m2pRecoveryUpdateMobileTable(tableName).then(function(resObject){
							var resJson = JSON.parse(resObject.result);
							var resMsg = '';
							console.log("resJson.is", resJson.is);
							if (resJson.is) {
								resMsg += '<p>Insert Success: ' + resJson.is.length + '</p>';
							}
							if (resObject.us) {
								resMsg += '<p>Update Success: ' + resJson.us.length + '</p>';
							}
							var alertPopup = $ionicPopup.alert({
		            title: 'ForceSync Success!',
		            template: resMsg,
		            buttons: [
			            { text: 'Done' }, {
			               text: '<b>Show Full Resp</b>',
			               type: 'button-positive',
			               onTap: function(e) {
			                  var alertPopup2 = $ionicPopup.alert({
			                  	title: "Full Response",
			                  	template: '<p>Returned with:</p><p><pre>' + JSON.stringify(resObject) + '</pre></p>'
			                  });
			               }
			            }
			         ]
		          });
		          $ionicLoading.hide();
		        }).catch(function(e){
		          logger.error('syncRefresh.m2pRecoveryUpdateMobileTable from settings ' + tableName + " " + JSON.stringify(e));
		          $ionicLoading.hide();
		          var alertPopup = $ionicPopup.alert({
		            title: 'Operation failed!',
		            template: '<p>Sorry, something went wrong.</p><p class="error_details">Error: ' + e.status + ' - ' + e.mc_add_status + '</p>'
		          });
		        });
	        } else {
		        devUtils.syncMobileTable(tableName).then(function(resObject){
		          $ionicLoading.hide();
		        }).catch(function(e){
		          logger.error('syncTable from settings ' + tableName + " " + JSON.stringify(e));
		          $ionicLoading.hide();
		          var alertPopup = $ionicPopup.alert({
		            title: 'Operation failed!',
		            template: '<p>Sorry, something went wrong.</p><p class="error_details">Error: ' + e.status + ' - ' + e.mc_add_status + '</p>'
		          });
		        });
		      }
	      }
	    });
	  };

	  $scope.saveTableToML = function(tableName) {
	    var confirmPopup = $ionicPopup.confirm({
	      title: 'Save Table To Mobile Log',
	      template: "<div style='text-align:center;'>Are you sure you want to save " + tableName + "?</div>",
	      cancelText: 'No',
	      okText: 'Yes',
	    });
	    confirmPopup.then(function(res) {
	      if (res) {
	        $ionicLoading.show({
	          duration: 10000,
	          template: 'Saving ' + tableName + " ..."
	        });
	        // Read the table records
	        DevService.allRecords(tableName, false).then(function(tableRecs) {
	          // console.log("tableRecs",angular.toJson(tableRecs));
	          return DevService.insertMobileLog(tableRecs);
	        }).then(function(resObject) {
	          // console.log("mc resObject",resObject);
	          $ionicLoading.hide();
	        }).catch(function(e){
	          logger.error('saveTableToML ' + tableName + " " + JSON.stringify(e));
	          $ionicLoading.hide();
	          var alertPopup = $ionicPopup.alert({
	            title: 'Operation failed!',
	            template: '<p>Sorry, something went wrong.</p><p class="error_details">Error: ' + e.status + ' - ' + e.mc_add_status + '</p>'
	          });
	        });
	      }
	    });
	  };

  }

})();