/**
 * Diagnostics Controller
 *
 * @description controller for diagnostics functions in the settings pages
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('DiagnosticsCtrl', DiagnosticsCtrl);

  DiagnosticsCtrl.$inject = ['$scope', 'AppRunStatusService', 'DiagnosticService', 'logger', 'NetworkService'];

  function DiagnosticsCtrl($scope, AppRunStatusService, DiagnosticService, logger, NetworkService) {
    var logTag = 'app.DiagnosticsCtrl';

    var vm = this;
    vm.testHeartbeat = testHeartbeat;

    activate();

    function activate(){
      DiagnosticService.getCachedFlag().then(function(cachedFlag){
        vm.cachedFlag = cachedFlag;
      }).catch(function(e){
        logger.error(e);
      });

      vm.networkStatus = NetworkService.getNetworkStatus();

      DiagnosticService.getRecentLogs(5).then(function(latestLogs){
        vm.latestMobileLogs = latestLogs;
      }).catch(function(e){
        logger.error(e);
      });

    }

    function testHeartbeat() {
      console.debug("testHeartbeat");
      vm.testTitle = "Heartbeat in progress...";
      DiagnosticService.testVfRemote().then(function(res){
        vm.testTitle = "Heartbeat result";
        vm.testResults = {
          result: JSON.stringify(res.result),
          event: JSON.stringify(res.event)
        };
        $scope.$apply();
      }).catch(function(e){
        var err = errToObj(e);
        vm.testTitle = "Heartbeat Errored";
        vm.testResults = {
          result: "-",
          event: "-",
          error: JSON.stringify(err)
        };
        $scope.$apply();
        logger.error("testHeartbeat", err);
      });
    }

    /**
     * Convert Error type to std object, if it is one - as it does not play nice
     * with JSON.stringify.
     * @param  {error} e A JS Error.
     * @return {object}
     */
    function errToObj(e) {
      //
      var err = {};
      if (e instanceof Error) {
        Object.getOwnPropertyNames(e).forEach(function(key) {
          err[key] = e[key];
        });
      } else {
        err = e;
      }
      return err;
    }
  }

})();