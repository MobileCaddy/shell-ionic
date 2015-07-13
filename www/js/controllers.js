angular.module('starter.controllers', ['ionic'])

  /*
  ===========================================================================
    M O B I L C A D D Y     S E T T I N G S
  ===========================================================================
  */

.controller('SettingsHBCtrl', ['$scope', '$rootScope', 'DevService', 'NetworkService', function($scope, $rootScope, DevService, NetworkService) {

    if (localStorage.connection) {
      $scope.heartbeatStatus = localStorage.connection;
    } else {
      $scope.heartbeatStatus = 100100;
    }

    $scope.hbUpdate = function() {
      localStorage.connection = $scope.heartbeatStatus;
      if ($scope.heartbeatStatus == 100100) NetworkService.networkEvent('online');
      if ($scope.heartbeatStatus == 100103) NetworkService.networkEvent('offline');
    };

}])

.controller('SettingsCtrl', ['$scope', '$rootScope', '$ionicPopup', '$ionicLoading', '$location', 'devUtils', 'vsnUtils', 'DevService', function($scope, $rootScope, $ionicPopup, $ionicLoading, $location, devUtils, vsnUtils, DevService) {

  /*
  ---------------------------------------------------------------------------
    Main settings page
  ---------------------------------------------------------------------------
  */

  // This unhides the nav-bar. The navbar is hidden in the cases where we want a
  // splash screen, such as in this app
  // NOTE - you will want to add the following two lines to the controller that
  // is first called by your app.
  e = document.getElementById('my-nav-bar');
  angular.element(e).removeClass( "mc-hide" );

  $scope.logoutAllowedClass = 'disabled';
  $scope.recsToSyncCount = 0;

  $scope.codeflow = LOCAL_DEV;

  $scope.upgradeAvailable = false;
  vsnUtils.upgradeAvailable().then(function(res){
    if (res) $scope.upgradeAvailable = true;
  });

  DevService.allRecords('recsToSync', false)
    .then(function(recsToSyncRecs) {
    $scope.recsToSyncCount = tableRecs.length;
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

}])


.controller('TestingCtrl', ['$scope', 'AppRunStatusService', function($scope, AppRunStatusService) {

  $scope.resumeEvent = function() {
    console.debug("resumeEvent");
    AppRunStatusService.statusEvent('resume');
  };

}])

/*
---------------------------------------------------------------------------
  MTI (Mobile Table Inspector)
---------------------------------------------------------------------------
*/
.controller('MTICtrl', ['$scope', '$rootScope', '$location', '$ionicPopup', 'DevService', function($scope, $rootScope, $location, $ionicPopup, DevService) {

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

}])

.controller('MTIDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$ionicLoading', 'DevService', function($scope, $rootScope,$stateParams, $ionicLoading, DevService) {
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
}])

/*
---------------------------------------------------------------------------
  Deploy Control
---------------------------------------------------------------------------
*/
.controller('DeployCtrl', ['$scope', '$rootScope', 'DeployService', function($scope, $rootScope, DeployService) {

  function iconForErr(errType) {
    switch(errType) {
        case 'info':
            return 'ion-information-circled';
        default:
            return 'ion-close-round';
    }
  }

  var messages = [{message : 'Uploading bundle...', type : ''}];
  var appConfig = {};

  $scope.messages = messages;

  DeployService.getDetails().then(function(data){
    console.log('data', data);
    appConfig = data;
    return DeployService.deployBunlde(appConfig);
  }).then(function(res){
    console.dir(res);
    var msg = {message : res, type : 'ok', icon : "ion-checkmark-round"};
    $scope.$apply(function() {
      $scope.messages.push(msg);
      msg = {message : 'Uploading cache manifest...', type : ''};
      $scope.messages.push(msg);
    });
    return DeployService.uploadCachePage(appConfig);
  }).then(function(res){
    console.dir(res);
    var msg = {message : res, type : 'ok', icon : "ion-checkmark-round"};
    $scope.$apply(function() {
      $scope.messages.push(msg);
      msg = {message : 'Uploading start page...', type : ''};
      $scope.messages.push(msg);
    });
    return DeployService.uploadStartPage(appConfig);
  }).then(function(res){
    console.dir(res);
    var msg = {message : res, type : 'ok', icon : "ion-checkmark-round"};
    $scope.$apply(function() {
      $scope.messages.push(msg);
      msg = {message : 'Deploy Completed successfully.', type : 'final'};
      $scope.messages.push(msg);
    });
  }).catch(function(err){
    var msg = {message : err.message, type : err.type,  icon : iconForErr(err.type)};
    $scope.$apply(function() {
      $scope.messages.push(msg);
      if (err.type != 'error') {
         msg = {message : 'Deploy Completed successfully.', type : 'final'};
        $scope.messages.push(msg);
      }
    });
    console.debug(err);
  });
}]);
