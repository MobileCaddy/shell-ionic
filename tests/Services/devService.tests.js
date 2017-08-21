
// D E V     S E R V I C E

describe('DevService Unit Tests', function(){
  beforeEach(module('starter.services'));


  beforeEach(inject(function (_$rootScope_, _DevService_) {
    DevService = _DevService_;
    $rootScope = _$rootScope_;
  }));


  /*
    generateSupportPin
   */
  describe('generateSupportPin', function(){

    it('should be a string,4 chars long', function(){
      var pin = DevService.generateSupportPin();
      expect(pin.length).toBe(4);
      expect(typeof(pin)).toBe("string");
    });

  }); // generateSupportPin


});
