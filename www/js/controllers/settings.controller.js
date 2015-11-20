/**
 * Settings Controller
 *
 * @description Controller for the settings area
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('SettingsCtrl', SettingsCtrl);

  SettingsCtrl.$inject = ['$scope', '$rootScope', '$ionicPopup', '$ionicLoading', '$location', 'devUtils', 'vsnUtils', 'DevService', 'logger'];

  function SettingsCtrl($scope, $rootScope, $ionicPopup, $ionicLoading, $location, devUtils, vsnUtils, DevService, logger) {


	  /*
	  ---------------------------------------------------------------------------
	    Main settings page
	  ---------------------------------------------------------------------------
	  */

	  // This unhides the nav-bar. The navbar is hidden in the cases where we want a
	  // splash screen, such as in this app
	  // NOTE - you will want to add the following two lines to the controller that
	  // is first called by your app.
	  var e = document.getElementById('my-nav-bar');
	  angular.element(e).removeClass( "mc-hide" );

	  $scope.logoutAllowedClass = 'disabled';
	  $scope.recsToSyncCount = 0;

	  $scope.codeflow = LOCAL_DEV;

	  $scope.upgradeAvailable = false;
	  vsnUtils.upgradeAvailable().then(function(res){
	    if (res)  return devUtils.dirtyTables();
	  }).then(function(tables){
	    if (tables && tables.length === 0) {
	      $scope.upgradeAvailable = true;
	      $scope.$apply();
	    }
	  });

	  DevService.allRecords('recsToSync', false)
	    .then(function(recsToSyncRecs) {
	    $scope.recsToSyncCount = recsToSyncRecs.length;
	    if ($scope.recsToSyncCount === 0) {
	      $scope.logoutAllowedClass = '';
	    } else {
	      $scope.recsToSyncCount  = 0;
	    }
	  }, function(reason) {
	    console.error('Angular: promise returned reason -> ' + reason);
	  });


	  DevService.allRecords('appSoup', false)
	    .then(function(appSoupRecs) {
	    $scope.settingsRecs = extractSettingsValues(appSoupRecs);
	  }, function(reason) {
	    console.error('Angular: promise returned reason -> ' + reason);
	  });

	  function extractSettingsValues(appSoupRecs) {
	    var settingRecs = {};
	    $j.each(appSoupRecs, function(i,records) {
	      var tableRec = {};
	      $j.each(records, function(i,record) {
	        switch (record.Name) {
	          case "Name" :
	            tableRec.Name = record.Value;
	            break;
	          case "CurrentValue" :
	            tableRec.Value = record.Value;
	            break;
	        }
	      }); // end loop through the object fields
	      settingRecs[tableRec.Name] = tableRec.Value;
	    });
	    return settingRecs;
	  }


	  /*
	  ---------------------------------------------------------------------------
	    Utility Functions
	  ---------------------------------------------------------------------------
	  */
	  function validateAdminPassword(pword) {
	    return (pword == "123") ?  true : false;
	  }

	  $scope.upgradeIfAvailable = function() {
	    devUtils.dirtyTables().then(function(tables){
	      logger.log('upgrade: dirtyTables check');
	      if (tables && tables.length === 0) {
	        logger.log('upgrade: no dirtyTables');
	        var confirmPopup = $ionicPopup.confirm({
	          title: 'Upgrade',
	          template: 'Are you sure you want to upgrade now?'
	        });
	        confirmPopup.then(function(res) {
	          if(res) {
	            $ionicLoading.show({
	              duration: 30000,
	              delay : 400,
	              maxWidth: 600,
	              noBackdrop: true,
	              template: '<h1>Upgrade app...</h1><p id="app-upgrade-msg" class="item-icon-left">Upgrading...<ion-spinner/></p>'
	            });
	            logger.log('upgrade: calling upgradeIfAvailable');
	            vsnUtils.upgradeIfAvailable().then(function(res){
	              logger.log('upgrade: upgradeIfAvailable? ' + res);
	              if (!res) {
	                $ionicLoading.hide();
	                $scope.data = {};
	                $ionicPopup.show({
	                  title: 'Upgrade',
	                  subTitle: 'The upgrade could not take place due to sync in progress. Please try again later.',
	                  scope: $scope,
	                  buttons: [
	                    {
	                      text: 'OK',
	                      type: 'button-positive',
	                      onTap: function(e) {
	                        return true;
	                      }
	                    }
	                  ]
	                });
	              }
	            }).catch(function(e){
	              logger.error('upgrade: ' + JSON.stringify(e));
	              $ionicLoading.hide();
	            });
	          }
	        });
	      } else {
	        logger.log('upgrade: dirtyTables found');
	        $scope.data = {};
	        $ionicPopup.show({
	          title: 'Upgrade',
	          subTitle: 'Unable to upgrade. A sync is required - please try later.',
	          scope: $scope,
	          buttons: [
	            {
	              text: 'OK',
	              type: 'button-positive',
	              onTap: function(e) {
	                return true;
	              }
	            }
	          ]
	        });
	      }
	    });
	  };

	  /*
	  ---------------------------------------------------------------------------
	    Log in/out
	  ---------------------------------------------------------------------------
	  */
	  $scope.showAdminPasswordPopup = function() {
	    var adminTimeout = (1000 * 60 * 5); // 5 minutes
	    if ( $rootScope.adminLoggedIn > Date.now() - adminTimeout) {
	      $location.path('tab/settings/devtools');
	      $rootScope.adminLoggedIn = Date.now();
	      $scope.$apply();
	    } else {
	      $scope.data = {};
	      var myPopup = $ionicPopup.show({
	        template: '<input type="password" ng-model="data.admin">',
	        title: 'Enter Admin Password',
	        scope: $scope,
	        buttons: [
	          { text: 'Cancel' },
	          { text: '<b>Continue</b>',
	            type: 'button-positive',
	            onTap: function(e) {
	            if (validateAdminPassword($scope.data.admin)) {
	                $location.path('tab/settings/devtools');
	                $rootScope.adminLoggedIn = Date.now();
	              } else {
	                console.log("Password incorrect");
	              }
	            }
	          },
	        ]
	      });
	    }
	  };

	  $scope.showConfirmLogout = function() {
	   var confirmPopup = $ionicPopup.confirm({
	     title: 'Logout',
	     template: 'Are you sure you want to logout?'
	   });
	   confirmPopup.then(function(res) {
	     if(res) {
	       $rootScope.adminLoggedIn = null;
	       cordova.require("com.salesforce.plugin.sfaccountmanager").logout();
	     }
	   });
	  };

	  $scope.showConfirmReset = function() {
	    var confirmPopup = $ionicPopup.confirm({
	      title: 'Reset App Data',
	      template: 'Are you sure you want to reset ALL application data?'
	    });
	    confirmPopup.then(function(res) {
	      if(res) {
	        console.debug("Resetting app");
	        var i;
	        var name;
	        $ionicLoading.show({
	          duration: 30000,
	          delay : 400,
	          maxWidth: 600,
	          noBackdrop: true,
	          template: '<h1>Resetting app...</h1><p id="app-progress-msg" class="item-icon-left">Clearing data...<ion-spinner/></p>'
	        });
	        vsnUtils.hardReset().then(function(res){
	          //$ionicLoading.hide();
	        }).catch(function(e){
	          console.error(e);
	          $ionicLoading.hide();
	        });
	      }
	    });
	  };

	  $scope.setLogLevel = function() {
	    if ($scope.log.level == "Off") {
	      localStorage.removeItem('logLevel');
	    } else {
	      localStorage.setItem('logLevel', $scope.log.level);
	    }
	    $scope.log.levelChange = false;
	  };

	  $scope.getLogLevel = function() {
	    var logLevel = localStorage.getItem("logLevel");
	    if (logLevel === null) {
	      logLevel = "Off";
	    }
	    return logLevel;
	  };

	  $scope.log = {};
	  $scope.log.level = $scope.getLogLevel();
	  $scope.log.levelChange = false;

	  $scope.logLevelChange = function() {
	    $scope.log.levelChange = true;
	  };

  }

})();