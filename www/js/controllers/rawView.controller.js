/**
 * RawView Controller
 *
 * @description controller for the Raw Data Viewer
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('RawViewCtrl', RawViewCtrl);

  RawViewCtrl.$inject = ['$scope', '$stateParams', '$ionicLoading', '$ionicModal', 'RecoveryService'];

  function RawViewCtrl($scope, $stateParams, $ionicLoading, $ionicModal, RecoveryService) {

    $ionicLoading.show({
	      duration: 30000,
	      noBackdrop: true,
	      template: '<p id="app-progress-msg" class="item-icon-left"><h3>Loading Data</h3><p>Please wait...</p><ion-spinner></ion-spinner></p>'
	    });

    $scope.type = $stateParams.type;
	  $scope.viewContent = "";

    function activate() {

      console.log(">>> Raw Data View activated. Loading: " + $scope.type);

      switch ($stateParams.type) {
        case 'tables':
          loadTableData();
          break;
        case 'localStorage':
          loadLocalStorageData();
          break;
        case 'soups':
          loadSoupsData();
          break;
        default:
          break;
      }
    }

    function loadTableData() {
      RecoveryService.returnAllTableData().then(function (data) {
        console.log(data);
        $scope.viewContent = data;
        $ionicLoading.hide();
        $scope.$apply();
      });
    }

    function loadSoupsData() {
      RecoveryService.returnAllSoupsData().then(function (data) {
        $scope.viewContent = JSON.stringify(data);
        $ionicLoading.hide();
      });
    }

    function loadLocalStorageData() {
      console.log(">>> loading local storage");
      RecoveryService.returnAllLocalStorageData().then(function (data) {
        console.log(">>> done");
        $scope.viewContent = data;
        $ionicLoading.hide();
      });
    }

    setTimeout(function() {
      activate();
    }, 1000);
    // activate();

  }

})();
