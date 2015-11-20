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

  TestingCtrl.$inject = ['$scope', 'AppRunStatusService'];

  function TestingCtrl($scope, AppRunStatusService) {

	  $scope.resumeEvent = function() {
	    console.debug("resumeEvent");
	    AppRunStatusService.statusEvent('resume');
	  };

  }

})();