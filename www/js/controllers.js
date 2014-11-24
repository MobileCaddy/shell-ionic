angular.module('starter.controllers', ['ionic'])

  /*
  ===========================================================================
    M O B I L C A D D Y     S E T T I N G S
  ===========================================================================
  */

  .controller('SettingsCtrl', function($scope, $rootScope, $ionicPopup, $location, DevService) {


  /*
  ---------------------------------------------------------------------------
    Main settings page
  ---------------------------------------------------------------------------
  */
  $scope.logoutAllowedClass = 'disabled';
  $scope.recsToSyncCount = 0;

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
    if (pword == "123") {
      return true;
    } else {
      return false;
    }
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
                $scope.$apply();
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
     }
   });
  };


})

/*
---------------------------------------------------------------------------
  MTI (Mobile Table Inspector)
---------------------------------------------------------------------------
*/
.controller('MTICtrl', function($scope, $rootScope, $location, $ionicPopup, DevService) {

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

  $scope.showConfirmReset = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Reset App Data',
     template: 'Are you sure you want to reset ALL application data?'
   });
   confirmPopup.then(function(res) {
     if(res) {
       // TODO : What does resetting app really do?
     }
   });
  };

})

.controller('MTIDetailCtrl', function($scope, $rootScope,$stateParams, $ionicLoading, DevService) {
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
    // seems to be a good height
    return 120 + item.length*55;
  };
});
