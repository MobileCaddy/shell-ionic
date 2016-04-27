
// L O C A L    N O T I F I C A T I O N    S E R V I C E

// define cordova and plugin
var cordova,
    device = {platform : "Android"};

describe('LocalNotificationService Unit Tests', function(){
  beforeEach(module('starter.services'));

  var utilsMock,
      syncMock,
      loggerMock,
      cordovaMock,
      nwMock,
      lnLocalStorageKey = 'localNotificationState';

  beforeEach(function() {


    // utils mock
    utilsMock = jasmine.createSpyObj('devUtils', ['dirtyTables']);
    utilsMock.dirtyTables.and.callFake(function(){
      return new Promise(function(resolve, reject) {
        resolve([]);
      });
    });


    // sync mock
    syncMock = jasmine.createSpyObj('SyncService', ['syncAllTables']);
    syncMock.syncAllTables.and.callFake(function(){
      return new Promise(function(resolve, reject) {
        resolve();
      });
    });


    // loggerMock mock - we want to use these in out 'expects'
    loggerMock = jasmine.createSpyObj('logger', ['log', 'error']);

    // cordova Network Mock
    nwMock = jasmine.createSpyObj('$cordovaNetwork', ['isOnline']);
    nwMock.isOnline.and.callFake(function(){
      return true;
    });

    // cordova localNotifcation Mock
    cordovaMock = jasmine.createSpyObj('$cordovaLocalNotification', ['cancel', 'isScheduled', 'schedule', 'update']);
    cordovaMock.cancel.and.callFake(function(){
      return new Promise(function(resolve, reject) {
        resolve('ok');
      });
    });
    cordovaMock.isScheduled.and.callFake(function(id){
      return new Promise(function(resolve, reject) {
        resolve(false);
      });
    });
    cordovaMock.schedule.and.callFake(function(obj){
      return new Promise(function(resolve, reject) {
        resolve('ok');
      });
    });
    cordovaMock.update.and.callFake(function(obj){
      return new Promise(function(resolve, reject) {
        resolve('ok');
      });
    });
    module(function($provide) {
      $provide.value('devUtils', utilsMock);
      $provide.value('logger', loggerMock);
      $provide.value('$cordovaNetwork', utilsMock);
      $provide.value('$cordovaLocalNotification', cordovaMock);
      $provide.value('$cordovaNetwork', nwMock);
      $provide.value('SyncService', syncMock);
    });
  });

  beforeEach(inject(function (_$rootScope_, _LocalNotificationService_) {
    LocalNotificationService = _LocalNotificationService_;
    $rootScope = _$rootScope_;
  }));


  /*****************************************************************************
   * getLocalNotificationState
   ****************************************************************************/
  describe('getLocalNotificationState', function(){

    beforeEach(inject(function () {
      localStorage.removeItem(lnLocalStorageKey);
    }));

    it('should getLocalNotificationState = "Complete" when not set', function(){
      expect(LocalNotificationService.getLocalNotificationState()).toBe("enabled");
    });

    it('should getLocalNotificationState = "MySetting" when set', function(){
      localStorage.setItem(lnLocalStorageKey, "disabled");
      expect(LocalNotificationService.getLocalNotificationState()).toBe("disabled");
    });

  });


  /*****************************************************************************
   * setLocalNotification
   ****************************************************************************/
  describe('setLocalNotification', function(){

    beforeEach(inject(function () {
      localStorage.removeItem(lnLocalStorageKey);
    }));

    it('should setLocalNotification = "MySetting" when not set', function(){
      LocalNotificationService.setLocalNotificationState("MySetting");
      expect(localStorage.getItem(lnLocalStorageKey)).toBe("MySetting");
    });

    it('should setLocalNotification = "MySetting" when already set', function(){
      localStorage.setItem(lnLocalStorageKey, "DUFF");
      LocalNotificationService.setLocalNotificationState("MySetting");
      expect(localStorage.getItem(lnLocalStorageKey)).toBe("MySetting");
    });

  });

  /*****************************************************************************
   * cancelNotification
   ****************************************************************************/
  describe('LocalNotificationService cancelNotification Unit Tests', function(){

    beforeEach(inject(function () {
      localStorage.removeItem(lnLocalStorageKey);
      cordova = {plugins : {notification : true}};
    }));

    it('should return without doing anything if disabled', function(){
      localStorage.setItem(lnLocalStorageKey, "disabled");
      LocalNotificationService.cancelNotification();
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should return without doing anything if no notification plugin', function(){
      delete cordova.plugins.notification;
      LocalNotificationService.cancelNotification();
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should call plugin cancel', function(){
      LocalNotificationService.cancelNotification();
      expect(cordovaMock.cancel.calls.count()).toBe(1);
    });


    it('should call plugin cancel with non-default id', function(done){
      var testDone = function(res) {
        expect(cordovaMock.cancel.calls.count()).toBe(1);
        expect(cordovaMock.cancel.calls.argsFor(0)[0]).toBe(2);
        done();
      };
      LocalNotificationService.cancelNotification(2)
        .then(testDone);
    });

  });


  /*****************************************************************************
   * handleLocalNotification
   ****************************************************************************/
  describe('LocalNotificationService handleLocalNotification Unit Tests', function(){

    beforeEach(inject(function () {
      localStorage.removeItem(lnLocalStorageKey);
      cordova = {plugins : {notification : true}};
    }));

    it('should return without doing anything if disabled', function(){
      localStorage.setItem(lnLocalStorageKey, "disabled");
      LocalNotificationService.handleLocalNotification();
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should return without doing anything if no notification plugin', function(){
      delete cordova.plugins.notification;
      LocalNotificationService.handleLocalNotification();
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should return without doing anything if non-default id', function(){
      LocalNotificationService.handleLocalNotification(1);
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should return without doing anything if no dirty tables', function(){
      LocalNotificationService.handleLocalNotification(100100);
      expect(cordovaMock.cancel.calls.count()).toBe(1);
      expect(utilsMock.dirtyTables.calls.count()).toBe(1);
    });

    it('should call sync if online, default ID and dirtyTables', function(done){
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve(['A']);
        });
      });

      var testDone = function(res) {
        expect(cordovaMock.cancel.calls.count()).toBe(1);
        expect(utilsMock.dirtyTables.calls.count()).toBe(1);
        done();
      };

      LocalNotificationService.handleLocalNotification(100100)
        .then(testDone);
    });

    it('should call setLocalNotification if offline, default ID and dirtyTables', function(done){
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve(['A']);
        });
      });

      nwMock.isOnline.and.callFake(function(){
        return false;
      });

      var testDone = function(res) {
        expect(cordovaMock.cancel.calls.count()).toBe(1);
        expect(utilsMock.dirtyTables.calls.count()).toBe(2);
        done();
      };

      LocalNotificationService.handleLocalNotification(100100)
        .then(testDone);
    });

  });


  /*****************************************************************************
   * handleLocalNotificationClick
   ****************************************************************************/
  describe('LocalNotificationService handleLocalNotificationClick Unit Tests', function(){

    beforeEach(inject(function () {
      localStorage.removeItem(lnLocalStorageKey);
      cordova = {plugins : {notification : true}};
    }));

    it('should return without doing anything if disabled', function(){
      localStorage.setItem(lnLocalStorageKey, "disabled");
      LocalNotificationService.handleLocalNotificationClick();
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should return without doing anything if no notification plugin', function(){
      delete cordova.plugins.notification;
      LocalNotificationService.handleLocalNotificationClick();
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should return without doing anything if non-default id', function(){
      LocalNotificationService.handleLocalNotificationClick(1);
      expect(cordovaMock.cancel.calls.count()).toBe(0);
    });

    it('should return without doing anything if no dirty tables', function(){
      LocalNotificationService.handleLocalNotificationClick(100100);
      expect(cordovaMock.cancel.calls.count()).toBe(1);
      expect(utilsMock.dirtyTables.calls.count()).toBe(1);
    });

    it('should call sync if online, default ID and dirtyTables', function(done){
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve(['A']);
        });
      });

      var testDone = function(res) {
        expect(cordovaMock.cancel.calls.count()).toBe(1);
        expect(utilsMock.dirtyTables.calls.count()).toBe(1);
        done();
      };

      LocalNotificationService.handleLocalNotificationClick(100100)
        .then(testDone);
    });

    it('should call setLocalNotification if offline, default ID and dirtyTables', function(done){
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve(['A']);
        });
      });

      nwMock.isOnline.and.callFake(function(){
        return false;
      });

      var testDone = function(res) {
        expect(cordovaMock.cancel.calls.count()).toBe(1);
        expect(utilsMock.dirtyTables.calls.count()).toBe(2);
        done();
      };

      LocalNotificationService.handleLocalNotificationClick(100100)
        .then(testDone);
    });

  });

  /*****************************************************************************
   * setLocalNotification
   ****************************************************************************/
  describe('LocalNotificationService setLocalNotification Unit Tests', function(){

    beforeEach(inject(function () {
      localStorage.removeItem(lnLocalStorageKey);
      cordova.plugins.notification = true;
    }));

    it('should return without doing anything if disabled', function(done){
      localStorage.setItem(lnLocalStorageKey, "disabled");
      var testDone = function() {
        expect(cordovaMock.isScheduled.calls.count()).toBe(0);
        done();
      };
      LocalNotificationService.setLocalNotification()
        .then(testDone);
    });


    it('should return without doing anything if there are no dirty tables and default ID', function(done){

      var testDone = function() {
        expect(cordovaMock.isScheduled.calls.count()).toBe(0);
        done();
      };
      LocalNotificationService.setLocalNotification()
        .then(testDone);
    });


    it('should return without doing anything if no notification plugin', function(done){
      delete cordova.plugins.notification;
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve(['A']);
        });
      });

      var testDone = function() {
        expect(cordovaMock.isScheduled.calls.count()).toBe(0);
        done();
      };
      LocalNotificationService.setLocalNotification()
        .then(testDone);

    });


    it('should set a new localNotifcation where dirty tables and default ID', function(done){
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve(['A']);
        });
      });

      var testDone = function() {
        expect(cordovaMock.isScheduled.calls.count()).toBe(1);
        expect(cordovaMock.schedule.calls.count()).toBe(1);
        done();
      };
      LocalNotificationService.setLocalNotification()
        .then(testDone);
    });


    it('should set a new localNotifcation where no dirty tables and NOT default ID', function(done){
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve([]);
        });
      });

      var testDone = function() {
        expect(cordovaMock.isScheduled.calls.count()).toBe(1);
        expect(cordovaMock.schedule.calls.count()).toBe(1);
        done();
      };
      LocalNotificationService.setLocalNotification(2)
        .then(testDone);
    });


    it('should update a localNotifcation where dirty tables and default ID', function(done){
      utilsMock.dirtyTables.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve(['A']);
        });
      });

      cordovaMock.isScheduled.and.callFake(function(id){
        return new Promise(function(resolve, reject) {
          resolve(true);
        });
      });

      var testDone = function() {
        expect(cordovaMock.isScheduled.calls.count()).toBe(1);
        expect(cordovaMock.update.calls.count()).toBe(1);
        expect(cordovaMock.schedule.calls.count()).toBe(0);
        done();
      };
      LocalNotificationService.setLocalNotification()
        .then(testDone);
    });


  });


});