/**
 * Feedback Controller
 *
 * @description List of pending/current/historic trips
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('FeedbackCtrl', FeedbackCtrl);

  FeedbackCtrl.$inject = ['$rootScope', '$scope', '$ionicLoading', '$location', '$ionicPopup', 'logger', 'SyncService', 'FeedbackService', 'UserService'];

  function FeedbackCtrl($rootScope, $scope, $ionicLoading, $location, $ionicPopup, logger, SyncService, FeedbackService, UserService) {
    logger.log("in FeedbackController");

    var feedbackControllerViewModel = this;

    feedbackControllerViewModel.feedback = {};

    feedbackControllerViewModel.submitFeedback = submitFeedback;
    feedbackControllerViewModel.clearFeedback = clearFeedback;

    function submitFeedback() {
      $ionicLoading.show({
        duration: 5000,
        template: 'Saving...'
      });
      logger.log("submitFeedback");
      var feedbackObj = {};
      feedbackObj.Name = "TMP-" + new Date().valueOf();
      feedbackObj.mobilecaddy1__Type__c = feedbackControllerViewModel.feedback.mobilecaddy1__Type__c;
      feedbackObj.mobilecaddy1__Comment__c = feedbackControllerViewModel.feedback.mobilecaddy1__Comment__c;
      FeedbackService.insert(feedbackObj).then(function(resObject){
        clearFeedback();
        $ionicLoading.hide();
        SyncService.syncAllTables();
      }).catch(function(e){
        logger.error('submitFeedback ' + JSON.stringify(e));
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
          title: 'Operation failed!',
          template: '<p>Sorry, something went wrong.</p><p class="error_details">Error: ' + e.status + ' - ' + e.mc_add_status + '</p>'
        });
      });
    }

    function clearFeedback() {
      console.log("tops clearFeedback");
      feedbackControllerViewModel.feedback.mobilecaddy1__Type__c = null;
      feedbackControllerViewModel.feedback.mobilecaddy1__Comment__c = null;
    }

    function changeHeaderBarColor(color) {
      var element = angular.element(document.querySelectorAll('ion-header-bar'));
      var wrappedElement;
      for (var i = element.length - 1; i >= 0; --i) {
        wrappedElement = angular.element(element[i]);
        wrappedElement.css('background-color', color);
        wrappedElement.css('border-color', color);
        wrappedElement.css('background-image', 'linear-gradient(0deg, ' + color + ', ' + color + '50%, transparent 50%)');
      }
      element = wrappedElement = null;
    }

    function updateHeaderbarColor() {
      UserService.getMyBrandColor().then(function(res) {
        changeHeaderBarColor(res);
      }).catch(function(resObject){
        logger.error('updateHeaderbarColor ' + JSON.stringify(resObject));
      });
    }

    var deregisterIonicViewBeforeEnter = $scope.$on('$ionicView.beforeEnter', function(scopes, states) {
      updateHeaderbarColor();
    });

    $scope.$on('$destroy', function() {
      deregisterIonicViewBeforeEnter();
    });


  }

})();
