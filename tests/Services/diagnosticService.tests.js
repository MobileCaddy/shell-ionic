
// D I A G N O S T I C     S E R V I C E

describe('DiagnosticService Unit Tests', function(){
  beforeEach(module('starter.services'));

  var utilsMock;

  beforeEach(function() {

    module(function($provide) {
      $provide.value('devUtils', utilsMock);
    });
  });

  // utils mock
  utilsMock = jasmine.createSpyObj('devUtils', ['readRecords']);


  // vfRemote mock
  // var vfMock = jasmine.createSpyObj('Visualforce', ['remoting.Manager.invokeAction']);

  beforeEach(inject(function (_$rootScope_, _DiagnosticService_) {
    DiagnosticService = _DiagnosticService_;
    $rootScope = _$rootScope_;
  }));


  /*
    getCachedFlag
   */
  describe('getCachedFlag', function(){

    it('should get False, empty table', function(done){
      utilsMock.readRecords.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve([]);
        });
      });

      DiagnosticService.getCachedFlag().then(function(result){
        expect(result).toBe("False");
        done();
      }).catch(function(e){
        logger.error(e);
      });

    });

    it('should get False, ', function(done){
      utilsMock.readRecords.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve({records: [{"Description": "Started"}]});
        });
      });

      DiagnosticService.getCachedFlag().then(function(result){
        expect(result).toBe("False");
        done();
      }).catch(function(e){
        logger.error(e);
      });

    });

    it('should get True', function(done){
      utilsMock.readRecords.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve({records: [{"Description": "cached"}]});
        });
      });

      DiagnosticService.getCachedFlag().then(function(result){
        expect(result).toBe("True");
        done();
      }).catch(function(e){
        logger.error(e);
      });

    });

    it('should get a promise rejection passed back', function(done) {
      utilsMock.readRecords.and.callFake(function () {
        return new Promise(function (resolve, reject) {
           reject("MY-ERROR");
        });
      });

      DiagnosticService.getCachedFlag().catch(function(res) {
        expect(res).toBe("MY-ERROR");
        done();
      });
    });

  }); // getCachedFlag


  /*
    getRecentLogs
   */
  describe('getRecentLogs', function(){

    it('should get []], empty table', function(done){
      utilsMock.readRecords.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve({records: []});
        });
      });

      DiagnosticService.getRecentLogs(5).then(function(result){
        expect(result.length).toBe(0);
        done();
      }).catch(function(e){
        logger.error(e);
      });

    });

    it('should get 3 out of 5, ordered, ', function(done){
      utilsMock.readRecords.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve({records: [
            {Id: 5, "_soupLastModifiedDate": 1, 'mobilecaddy1__Error_Text__c' : '{"0":"5"}'},
            {Id: 3, "_soupLastModifiedDate": 3, 'mobilecaddy1__Error_Text__c' : '{"0":"3"}'},
            {Id: 4, "_soupLastModifiedDate": 2, 'mobilecaddy1__Error_Text__c' : '{"0":"4"}'},
            {Id: 1, "_soupLastModifiedDate": 5, 'mobilecaddy1__Error_Text__c' : 'abc'},
            {Id: 2, "_soupLastModifiedDate": 4, 'mobilecaddy1__Error_Text__c' : '{"0":2, "1":"def"}'}
          ]});
        });
      });

      DiagnosticService.getRecentLogs(3).then(function(result){
        // Check limit
        expect(result.length).toBe(3);
        // Check order
        expect(result[0].Id).toBe(1);
        expect(result[1].Id).toBe(2);
        expect(result[2].Id).toBe(3);
        // Check JSON formatting
        expect(result[0].mobilecaddy1__Error_Text__c).toBe("abc");
        expect(result[1].mobilecaddy1__Error_Text__c).toBe("");
        expect(result[1].errorObj[0]).toBe('2');
        expect(result[1].errorObj[1]).toBe('"def"');
        done();
      }).catch(function(e){
        logger.error(e);
      });

    });


    it('should get a promise rejection passed back', function(done) {
      utilsMock.readRecords.and.callFake(function () {
        return new Promise(function (resolve, reject) {
           reject("MY-ERROR");
        });
      });

      DiagnosticService.getRecentLogs().catch(function(res) {
        expect(res).toBe("MY-ERROR");
        done();
      });
    });

  }); // getRecentLogs


});
