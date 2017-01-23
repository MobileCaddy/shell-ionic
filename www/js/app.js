
angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'starter.services', 'starter.controllers', 'ngCordova'])

.run(['$ionicPlatform', 'NetworkService', 'AppRunStatusService', 'UserService', 'SyncService' , function($ionicPlatform, NetworkService, AppRunStatusService, UserService, SyncService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    document.addEventListener("resume", function() {
      AppRunStatusService.statusEvent('resume');
    }, false);
    // document.addEventListener("pause", function() {
    //   AppRunStatusService.statusEvent('pause');
    // }, false);
    document.addEventListener("online", function() {
      NetworkService.networkEvent('online');
    }, false);
    document.addEventListener("offline", function() {
      NetworkService.networkEvent('offline');
    }, false);


    // Local notifications plugin event handlers -  uncomment if you want them
    // and make sure you inject the service
    //
    // if (cordova && cordova.plugins && cordova.plugins.notification) {
    //   // Notification has reached its trigger time
    //   cordova.plugins.notification.local.on("trigger", function (notification, state) {
    //     LocalNotificationService.handleLocalNotification(notification.id, state);
    //   });
    //   // Event fired when user taps on notification
    //   cordova.plugins.notification.local.on("click", function (notification, state) {
    //     LocalNotificationService.handleLocalNotificationClick(notification.id, state);
    //   });
    // }


    // Example of locking the screen orientation to landscape
    // if (screen && screen.lockOrientation) {
    //   screen.lockOrientation('landscape');
    // }

  });

  // If running in Electron then add window.onX event listeners
  if (navigator.appVersion.includes("mobilecaddy-desktop")) {
    window.addEventListener("online", function() {
      NetworkService.networkEvent('online');
    }, false);
    window.addEventListener("offline", function() {
      NetworkService.networkEvent('offline');
    }, false);
  }

  // Check if the intialSync process has been run. This is the process that pulls
  // down the data on the first run up to ensure offline first capability
  //
  // In the below case we also do a coldStartSync if we are starting but not for
  // the first time
  UserService.hasDoneProcess("initialDataLoaded").then(function (result) {
    if (result) {
      // Ensure that the syncTables will run
      SyncService.setSyncLock("false");
      SyncService.setSyncState("Complete");
      SyncService.coldStartSync();
    } else {
      NetworkService.setNetworkStatus("online");
      // Initial install and load of data => initialSync lighter-weight sync call.
      SyncService.initialSync();
    }
  });

}])

.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', function($stateProvider, $urlRouterProvider, $compileProvider) {

  // Un comment this line when pushing for prod.
  // $compileProvider.debugInfoEnabled(false);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: RESOURCE_ROOT +  'templates/tabsMain.html'
    })


  .state('tab.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: RESOURCE_ROOT +  'templates/home.html',
        }
      }
    })


      .state('tab.outbox', {
        url: '/outbox',
        views: {
          'settings-tab': {
            templateUrl: RESOURCE_ROOT + 'templates/outbox.html',
            controller: 'OutboxCtrl',
            controllerAs: 'outboxControllerViewModel'
          }
        }
      })

    /*****************************************************
     * S E T T I N G S    &    D E V    T O O L S
     ****************************************************/

    .state('tab.settings', {
      url: '/settings',
      views: {
        'settings-tab': {
          templateUrl: RESOURCE_ROOT +  'templates/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })

    .state('tab.settings-devtools', {
      url: '/settings/devtools',
      views: {
        'settings-tab': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDevTools.html',
          controller: 'SettingsCtrl'
        }
      }
    })

    .state('tab.settings-mti', {
      url: '/settings/mti',
      views: {
        'settings-tab': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDevMTI.html',
          controller: 'MTICtrl'
        }
      }
    })

    .state('tab.mti-detail', {
      url: '/settings/mti/:tableName',
      views: {
        'settings-tab': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDevMTIDetail.html',
          controller: 'MTIDetailCtrl'
        }
      }
    })

    .state('tab.data-view', {
      url: '/settings/data/:type',
      views: {
        'settings-tab': {
          templateUrl: RESOURCE_ROOT + 'templates/settingsDevRawView.html',
          controller: 'RawViewCtrl'
        }
      }
    })

    .state('tab.settings-testing', {
      url: '/settings/testing',
      views: {
        'settings-tab': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsTesting.html',
          controller: 'TestingCtrl'
        }
      }
    })

    .state('tab.settings-deploy', {
      url: '/settings/deploy',
      views: {
        'settings-tab': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDeploy.html',
          controller: 'DeployCtrl'
        }
      }
    });

  // ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !
  //
  //    A H O Y     H O Y     ! ! !
  //
  //    Change this to call you home page/tab/etc
  //    At the moment it points to the MobileCaddy Settings tab
  //
  // ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/settings');

}]);

// This is the function that get's called once the MobileCaddy libs are done
// checking the app install/health. Basically the point at which our client
// app can kick off. It's here we boot angular into action.
// runUpInfo : see http://developer.mobilecaddy.net/docs/api for details on
// object and codes.
function myapp_callback(runUpInfo) {
  if (typeof(runUpInfo) != "undefined" &&
     (typeof(runUpInfo.newVsn) != "undefined" && runUpInfo.newVsn != runUpInfo.curVsn)) {
    // Going to call a hardReset as an upgrade is available.
    console.debug('runUpInfo', runUpInfo);
    var vsnUtils= mobileCaddy.require('mobileCaddy/vsnUtils');
    vsnUtils.hardReset();
  } else {
    // carry on, nothing to see here
    angular.bootstrap(document, ['starter']);
  }
}
