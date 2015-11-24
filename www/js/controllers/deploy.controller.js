/**
 * Deploy Controller
 *
 * @description controller for the Deploy to Salesforce
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('DeployCtrl', DeployCtrl);

  DeployCtrl.$inject = ['$scope', 'DeployService'];

  function DeployCtrl($scope, DeployService) {


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

  }

})();