
// N E T W O R K    S E R V I C E

describe('NetworkService Unit Tests', function(){
  beforeEach(module('starter.services'));

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

});