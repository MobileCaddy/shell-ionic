
// N E T W O R K    S E R V I C E

describe('NetworkService Unit Tests', function(){
  beforeEach(module('starter.services'));

  var utilsMock,
      loggerMock,    syncMock,
      lnLocalStorageKey = 'localNotificationState';

  beforeEach(function() {
    // loggerMock mock - we want to use these in out 'expects'
    loggerMock = jasmine.createSpyObj('logger', ['log', 'error']);

    module(function($provide) {
      $provide.value('devUtils', utilsMock);
      $provide.value('logger', loggerMock);
      $provide.value('SyncService', utilsMock);
    });
  });


  beforeEach(inject(function (_$rootScope_, _NetworkService_) {
    NetworkService = _NetworkService_;
    $rootScope = _$rootScope_;

    localStorage.removeItem('networkStatus');
  }));

  it('should set localStorage["networkStatus"] to offline', function(){
    NetworkService.networkEvent('offline');
    expect(localStorage.getItem('networkStatus')).toBe("offline");
  });


  it('should set localStorage["networkStatus"] to online and not sync', function(){
    localStorage.setItem('networkStatus', 'online');
    NetworkService.networkEvent('online');
    expect(localStorage.getItem('networkStatus')).toBe("online");
  });


  it('should set localStorage["networkStatus"] to abc', function(){
    localStorage.setItem('networkStatus', 'online');
    NetworkService.setNetworkStatus('abc');
    expect(localStorage.getItem('networkStatus')).toBe("abc");
  });


  it('should get localStorage["networkStatus"] and be 123', function(){
    localStorage.setItem('networkStatus', '123');
    NetworkService.getNetworkStatus();
    expect(NetworkService.getNetworkStatus()).toBe("123");
  });

});
