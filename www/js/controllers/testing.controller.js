/**
 * Testing Controller
 *
 * @description controller for testing functions in the settings pages
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('TestingCtrl', TestingCtrl);

  TestingCtrl.$inject = ['$scope', 'AppRunStatusService', 'DiagnosticService', 'logger'];

  function TestingCtrl($scope, AppRunStatusService, DiagnosticService, logger) {

	  $scope.resumeEvent = function() {
	    console.debug("resumeEvent");
	    AppRunStatusService.statusEvent('resume');
	  };

    $scope.testHeartbeat = function() {
      console.debug("testHeartbeat");
      $scope.testTitle = "Heartbeat in progress...";
      DiagnosticService.testVfRemote().then(function(res){
        $scope.testTitle = "Heartbeat result";
        $scope.testResults = {
          result: JSON.stringify(res.result),
          event: JSON.stringify(res.event)
        };
        $scope.$apply();
      }).catch(function(e){
        // Convert Error type to std object, if it is one - as it does not play nice with JSON.stringify
        var err = {};
        if (e instanceof Error) {
          Object.getOwnPropertyNames(e).forEach(function(key) {
            err[key] = e[key];
          });
        } else {
          err = e;
        }
        $scope.testTitle = "Heartbeat Errored";
        $scope.testResults = {
          result: "-",
          event: "-",
          error: JSON.stringify(err)
        };
        $scope.$apply();
        logger.error("testHeartbeat", err);
      });
    };
  }

})();