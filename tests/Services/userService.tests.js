describe('UserService Unit Tests', function(){

  var utilsMock;

  beforeEach(module('starter.services'));

  beforeEach(function() {
      utilsMock = jasmine.createSpyObj('devUtils', ['getCurrentUserId']);

      module(function($provide) {
          $provide.value('devUtils', utilsMock);
      });
  });


  /* S U C C E S S
   * @describe Checks when we have some Visits defined
   */
  describe('UserService success', function(){
    beforeEach(inject(function (_$rootScope_, _UserService_) {
      UserService = _UserService_;
      $rootScope = _$rootScope_;

      // mock of devUtils.insertRecord
      utilsMock.getCurrentUserId.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          resolve("123");
        });
      });

    })); // before each success

    /*
      getCurrentUserId
     */

    it('should getCurrentUserId "1" from localStorage', function(done) {
      localStorage.setItem('currentUserId', '1');

      var testUser = function(res) {
        expect(res).toEqual("1");
        done();
      };

      UserService.getCurrentUserId()
        .then(testUser);
    });

    it('should getCurrentUserId "123" from devUtils', function(done) {
      localStorage.removeItem('currentUserId');

      var testUser = function(res) {
        expect(res).toEqual("123");
        done();
      };

      UserService.getCurrentUserId()
        .then(testUser);
    });

    it('should getCurrentUserId "123" from localStorage (as now set by prev test', function(done) {


      var testUser = function(res) {
        expect(utilsMock.getCurrentUserId.calls.count()).toBe(0);
        expect(res).toEqual("123");
        done();
      };

      UserService.getCurrentUserId()
        .then(testUser);
    });

    it('should get a reject from promise', function(done) {
      localStorage.removeItem('currentUserId');

      var testCatch = function(res) {
        expect(res.err).toEqual("boo");
        done();
      };

      utilsMock.getCurrentUserId.and.callFake(function(){
        return new Promise(function(resolve, reject) {
          reject({err:"boo"});
        });
      });

      UserService.getCurrentUserId()
        .catch(testCatch);
    });


    /*
      setCurrentUserId
     */
    it('should getCurrentUserId "1" from localStorage', function(done) {
      localStorage.setItem('currentUserId', '1');

      var testUser = function(res) {
        expect(res).toEqual(true);
        done();
      };

      UserService.setCurrentUserId()
        .then(testUser);
    });


    /*
      hasDoneProcess
     */
    it('should return false if "processes" not set', function(done) {
      localStorage.removeItem('processes');

      var testHasDone = function(res) {
        expect(res).toBe(false);
        done();
      };

      UserService.hasDoneProcess("a")
        .then(testHasDone);
    });

    it('should return false if hasDoneProcess is processName not set', function(done) {
      localStorage.setItem('processes', JSON.stringify({"a" : "true", "c": "false"}));

      var testHasDone = function(res) {
        expect(res).toBe(true);
        done();
      };

      UserService.hasDoneProcess("a")
        .then(testHasDone);
    });

    it('should return false if hasDoneProcess is processName not set', function(done) {
      localStorage.setItem('processes', JSON.stringify({"a" : "true", "c": "false"}));

      var testHasDone = function(res) {
        expect(res).toBe(false);
        done();
      };

      UserService.hasDoneProcess("b")
        .then(testHasDone);
    });

    it('should return false if hasDoneProcess has processName set to false', function(done) {
      localStorage.setItem('processes', JSON.stringify({"a" : "true", "c": "false"}));

      var testHasDone = function(res) {
        expect(res).toBe(false);
        done();
      };

      UserService.hasDoneProcess("c")
        .then(testHasDone);
    });


    /*
      setProcessDone
     */
    it('should set "processes" if not set', function(done) {
      localStorage.removeItem('processes');

      var testSetDone = function(res) {
        expect(res).toBe(true);
        var processes = JSON.parse(localStorage.getItem('processes'));
        expect(processes.a).toBe("true");
        done();
      };

      UserService.setProcessDone("a")
        .then(testSetDone);
    });

    // TODO - Failing
    it('should update "processes" if already set (no key)', function(done) {
      localStorage.setItem('processes', JSON.stringify({"b" : "false"}));

      var testSetDone = function(res) {
        expect(res).toBe(true);
        var processes = JSON.parse(localStorage.getItem('processes'));
        expect(processes.a).toBe("true");
        expect(processes.b).toBe("false");
        done();
      };

      UserService.setProcessDone("a")
        .then(testSetDone);
    });

    // TODO - Failing
    it('should update "processes" if already set (existing key)', function(done) {
      localStorage.setItem('processes', JSON.stringify({"a" : "false", "b" : "false"}));

      var testSetDone = function(res) {
        expect(res).toBe(true);
        var processes = JSON.parse(localStorage.getItem('processes'));
        expect(processes.a).toBe("true");
        expect(processes.b).toBe("false");
        done();
      };

      UserService.setProcessDone("a")
        .then(testSetDone);
    });

  });

});