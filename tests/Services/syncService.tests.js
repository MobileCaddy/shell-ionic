
// S Y N C     S E R V I C E

describe('SyncService Unit Tests', function(){
  beforeEach(module('starter.services'));

  var utilsMock,
      lnMock,
      syncLockName1 = "sl1",
      HEARTBEAT_NO_CONNECTION = 100103;

  beforeEach(function() {
    // MobileCaddy utils mock
    utilsMock = jasmine.createSpyObj('devUtils', ['initialSync', 'syncMobileTable']);
    utilsMock.SYNC_NOK                 = 100402;
    utilsMock.SYNC_ALREADY_IN_PROGRESS = 100498;
    utilsMock.SYNC_UNKONWN_TABLE       = 100101;

    // localNotification mock - we want to use these in out 'expects'
    lnMock = jasmine.createSpyObj('LocalNotificationService', ['cancelNotification', 'setLocalNotification']);

    module(function($provide) {
        $provide.value('devUtils', utilsMock);
        $provide.value('LocalNotificationService', lnMock);
    });
  });

  beforeEach(inject(function (_$rootScope_, _SyncService_) {
    SyncService = _SyncService_;
    $rootScope = _$rootScope_;
  }));


  /*****************************************************************************
   * getSyncState
   ****************************************************************************/
  describe('getSyncState', function(){

    beforeEach(inject(function () {
      localStorage.removeItem('syncState');
    }));

    it('should getSyncState = "Complete" when not set', function(){
      expect(SyncService.getSyncState()).toBe("Complete");
    });

    it('should getSyncState = "MySetting" when not set', function(){
      localStorage.setItem('syncState', "MySetting");
      expect(SyncService.getSyncState()).toBe("MySetting");
    });

  });


  /*****************************************************************************
   * setSyncState
   ****************************************************************************/
  describe('setSyncState', function(){

    beforeEach(inject(function () {
      localStorage.removeItem('syncState');
    }));

    it('should setSyncState = "MySetting" when not set', function(){
      SyncService.setSyncState("MySetting");
      expect(localStorage.getItem('syncState')).toBe("MySetting");
    });

    it('should setSyncState = "MySetting" when already set', function(){
      localStorage.setItem('syncState', "DUFF");
      SyncService.setSyncState("MySetting");
      expect(localStorage.getItem('syncState')).toBe("MySetting");
    });

  });

  /*****************************************************************************
   * SyncLock
   ****************************************************************************/
  describe('SyncService SyncLock Unit Tests', function(){

    var syncLockName1 = "sl1";

    beforeEach(inject(function () {
      localStorage.removeItem(syncLockName1);
    }));

    it('should set syncLockName1 to "abc"', function(){
      SyncService.setSyncLock(syncLockName1, 'abc');
      expect(localStorage.getItem(syncLockName1)).toBe("abc");
    });


    it('should set "syncLock" to "abc"', function(){
      SyncService.setSyncLock('abc');
      expect(localStorage.getItem("syncLock")).toBe("abc");
    });

    it('should set syncLockName1 to "abc" (already set)', function(){
      localStorage.setItem(syncLockName1, '123');
      SyncService.setSyncLock(syncLockName1, 'abc');
      expect(localStorage.getItem(syncLockName1)).toBe("abc");
    });

    it('should getSyncLock, when set', function(){
      localStorage.setItem(syncLockName1, '123');
      expect(SyncService.getSyncLock(syncLockName1)).toBe("123");
    });

    it('should getSyncLock = false, when not set', function(){
      expect(SyncService.getSyncLock(syncLockName1)).toBe("false");
      expect(localStorage.getItem(syncLockName1)).toBe("false");
    });

  });



  /*****************************************************************************
   * initialSync Success
   ****************************************************************************/
  describe('initialSync Success', function(){

    var startSyncBroadcastFlag,
        callNum;

    beforeEach(function() {
      startSyncBroadcastFlag = false;
      callNum = 0;
      localStorage.removeItem('syncState');
      localStorage.removeItem('syncLock');
    });


    it('should call devUtils with all tables (exc Mobile_Log__mc)', function(done){

      var tablesPassed = '';

      utilsMock.initialSync.and.callFake(function(tables){
        return new Promise(function(resolve, reject) {
          tablesPassed = tables;
          resolve();
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "InitialLoadComplete") {
          expect(tablesPassed.length).toBe(SyncService.appTables.length); // not Mobile_Log__mc or any with syncWithoutLocalUpdates == false
          expect(tablesPassed.indexOf('Mobile_Log__mc')).toBe(-1);
          expect(utilsMock.initialSync.calls.count()).toBe(1);
          done();
        }
      });

      var testDone = function(res) {
        };

      SyncService.initialSync()
        .then(testDone);

    });

  });

  /*****************************************************************************
   * initialSync ERROR
   ****************************************************************************/
  describe('initialSync Error', function(){

    var startSyncBroadcastFlag,
        callNum;

    beforeEach(function() {
      startSyncBroadcastFlag = false;
      callNum = 0;
      localStorage.removeItem('syncState');
      localStorage.removeItem('syncLock');
    });


    it('should call devUtils and pass back reject', function(done){

      utilsMock.initialSync.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          reject();
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "InitialLoadComplete") {
          expect(utilsMock.initialSync.calls.count()).toBe(0);
        }
      });

      var testDone = function(res) {
          done();
        };

      SyncService.initialSync()
        .catch(testDone);

    });

  });



  /*****************************************************************************
   * coldStartSync
   ****************************************************************************/
  describe('coldStartSync', function(){

    var startSyncBroadcastFlag,
        callNum;

    beforeEach(function() {
      startSyncBroadcastFlag = false;
      callNum = 0;
      localStorage.removeItem('syncState');
      localStorage.removeItem('syncLock');
    });


    it('should resolve without doing anything if already synching', function(done){


      localStorage.setItem('syncState', 'syncing');
      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
      });

      var testDone = function(res) {
        expect(startSyncBroadcastFlag).toBe(false);
        expect(utilsMock.syncMobileTable.calls.count()).toBe(0);
        expect(lnMock.setLocalNotification.calls.count()).toBe(1);
        expect(lnMock.cancelNotification.calls.count()).toBe(0);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);

    });


    it('should resolve without doing anything if syncLock == true', function(done){


      localStorage.setItem('syncLock', 'true');
      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
      });

      var testDone = function(res) {
        expect(startSyncBroadcastFlag).toBe(false);
        expect(utilsMock.syncMobileTable.calls.count()).toBe(0);
        expect(lnMock.setLocalNotification.calls.count()).toBe(1);
        expect(lnMock.cancelNotification.calls.count()).toBe(0);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);

    });


    it('should attempt all tables in sequence', function(done){

      var lastTable;

      utilsMock.syncMobileTable.and.callFake(function(table, obj){
        return new Promise(function(resolve, reject) {
          lastTable = table;
          resolve({'status': 100100});
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
        if (args.result == "Complete") {
          expect(startSyncBroadcastFlag).toBe(true);
          expect(lastTable).toBe('myDummyTable2__ap');
          expect(utilsMock.syncMobileTable.calls.count()).toBe(SyncService.appTables.length + 1);
        }
      });

      var testDone = function(res) {
        expect(lnMock.setLocalNotification.calls.count()).toBe(0);
        expect(lnMock.cancelNotification.calls.count()).toBe(1);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);

    });


    it('should attempt all tables in sequence even if 1st is unknown', function(done){

      utilsMock.syncMobileTable.and.callFake(function(table, obj){
        return new Promise(function(resolve, reject) {
          callNum++;
          if (callNum == 1) {
            reject({'status': utilsMock.SYNC_UNKONWN_TABLE});
            //done();
          } else {
            resolve({'status': 100100});
          }
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
        if (args.result == "Complete") {
          expect(startSyncBroadcastFlag).toBe(true);
          expect(utilsMock.syncMobileTable.calls.count()).toBe(SyncService.appTables.length + 1);
        }
      });

      var testDone = function(res) {
        expect(lnMock.setLocalNotification.calls.count()).toBe(0);
        expect(lnMock.cancelNotification.calls.count()).toBe(1);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);

    });


    it('should attempt all tables in sequence even if 1st has no updates', function(done){

      utilsMock.syncMobileTable.and.callFake(function(table, obj){
        return new Promise(function(resolve, reject) {
          callNum++;
          if (callNum == 1) {
            resolve({'status': 100402, mc_add_status :'no-sync-no-updates'});
            //done();
          } else {
            resolve({'status': 100100});
          }
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
        if (args.result == "Complete") {
          expect(startSyncBroadcastFlag).toBe(true);
          expect(utilsMock.syncMobileTable.calls.count()).toBe(SyncService.appTables.length + 1);
        }
      });

      var testDone = function(res) {
        expect(lnMock.setLocalNotification.calls.count()).toBe(0);
        expect(lnMock.cancelNotification.calls.count()).toBe(1);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);
    });


    it('should not attempt to sync 2nd table if 1st was offline', function(done){

      utilsMock.syncMobileTable.and.callFake(function(table, obj){
        return new Promise(function(resolve, reject) {
          callNum++;
          if (callNum == 1) {
            resolve({'status': 100402, mc_add_status :HEARTBEAT_NO_CONNECTION});
          } else {
            resolve({'status': 100100});
          }
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
        if (args.result == "Complete") {
          expect(startSyncBroadcastFlag).toBe(true);
          expect(utilsMock.syncMobileTable.calls.count()).toBe(1);
        }
      });

      var testDone = function(res) {
        expect(lnMock.setLocalNotification.calls.count()).toBe(1);
        expect(lnMock.cancelNotification.calls.count()).toBe(0);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);
    });


    it('should not attempt to sync 2nd table if 1st was SYNC_ALREADY_IN_PROGRESS', function(done){

      utilsMock.syncMobileTable.and.callFake(function(table, obj){
        return new Promise(function(resolve, reject) {
          callNum++;
          if (callNum == 1) {
            resolve({'status': utilsMock.SYNC_ALREADY_IN_PROGRESS});
            //done();
          } else {
            resolve({'status': 100100});
          }
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
        if (args.result == "Complete") {
          expect(startSyncBroadcastFlag).toBe(true);
          expect(utilsMock.syncMobileTable.calls.count()).toBe(1);
        }
      });

      var testDone = function(res) {
        expect(lnMock.setLocalNotification.calls.count()).toBe(1);
        expect(lnMock.cancelNotification.calls.count()).toBe(0);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);
    });

    it('should not attempt to sync 2nd table if 1st rejected for unknown reason', function(done){

      utilsMock.syncMobileTable.and.callFake(function(table, obj){
        return new Promise(function(resolve, reject) {
          callNum++;
          if (callNum == 1) {
            reject({'status': 999});
            //done();
          } else {
            resolve({'status': 100100});
          }
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
        if (args.result == "Complete") {
          expect(startSyncBroadcastFlag).toBe(true);
          expect(utilsMock.syncMobileTable.calls.count()).toBe(1);
        }
      });

      var testDone = function(res) {
        expect(lnMock.setLocalNotification.calls.count()).toBe(1);
        expect(lnMock.cancelNotification.calls.count()).toBe(0);
        done();
      };
      SyncService.coldStartSync()
        .then(testDone);
    });

  });

  /*****************************************************************************
   * syncAllTables
   ****************************************************************************/
  describe('syncAllTables', function(){

    var startSyncBroadcastFlag,
        callNum;

    beforeEach(function() {
      startSyncBroadcastFlag = false;
      callNum = 0;
      localStorage.removeItem('syncState');
      localStorage.removeItem('syncLock');
    });


    it('should attempt all tables in sequence', function(done){

      var lastTable;

      utilsMock.syncMobileTable.and.callFake(function(table, obj){
        return new Promise(function(resolve, reject) {
          lastTable = table;
          resolve({'status': 100100});
        });
      });

      $rootScope.$on('syncTables', function(event, args) {
        if (args.result == "StartSync") startSyncBroadcastFlag = true;
        if (args.result == "Complete") {
          expect(startSyncBroadcastFlag).toBe(true);
          expect(lastTable).toBe('Mobile_Log__mc');
          expect(utilsMock.syncMobileTable.calls.count()).toBe(SyncService.appTables.length);
        }
      });

      var testDone = function(res) {
        expect(lnMock.setLocalNotification.calls.count()).toBe(0);
        expect(lnMock.cancelNotification.calls.count()).toBe(1);
        done();
        };
      SyncService.syncAllTables()
        .then(testDone);

    });

  });

});