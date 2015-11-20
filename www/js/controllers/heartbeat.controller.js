/**
 * SettingsHB Controller
 *
 * @description Controller for settings heartbeat dev tool
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('SettingsHBCtrl', SettingsHBCtrl);

  SettingsHBCtrl.$inject = ['$scope', 'NetworkService'];

  function SettingsHBCtrl($scope, NetworkService) {

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

  }

})();