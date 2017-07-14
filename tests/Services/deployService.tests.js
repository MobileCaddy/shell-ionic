
// D E P L O Y    S E R V I C E

describe('NetworkService Unit Tests', function(){
  beforeEach(module('starter.services'));

 beforeEach(inject(function (_$rootScope_, _DeployService_) {
    DeployService = _DeployService_;
    $rootScope = _$rootScope_;

    localStorage.removeItem('networkStatus');
  }));

  describe('compareVersions', function(){

  	it('should be -1', function(){
  		expect(DeployService._compareVersions("0.0.1", "0.1.0")).toBe(-1);
  		expect(DeployService._compareVersions("0.0.1", "0.1.1")).toBe(-1);
  		expect(DeployService._compareVersions("0.0.1", "0.2.0")).toBe(-1);
  		expect(DeployService._compareVersions("0.0.1", "0.2.1")).toBe(-1);
  		expect(DeployService._compareVersions("0.0.1", "0.0.11")).toBe(-1);
  		expect(DeployService._compareVersions("0.0.1", "0.0.100")).toBe(-1);
  		expect(DeployService._compareVersions("0.0.1", "1.2.0")).toBe(-1);


  		expect(DeployService._compareVersions("0.1.1", "0.2.0")).toBe(-1);
  		expect(DeployService._compareVersions("0.1.0", "0.2.0")).toBe(-1);


  		expect(DeployService._compareVersions("1.0.0", "1.0.1")).toBe(-1);
  		expect(DeployService._compareVersions("1.0.0", "1.1.0")).toBe(-1);
  		expect(DeployService._compareVersions("1.0.0", "1.1.1")).toBe(-1);
  		expect(DeployService._compareVersions("1.0.0", "1.1.101")).toBe(-1);


  		expect(DeployService._compareVersions("1.3.100", "1.4.0")).toBe(-1);
  	});

  	it('should be 1', function(){
  		expect(DeployService._compareVersions("1.0.1", "0.1.0")).toBe(1);
  		expect(DeployService._compareVersions("1.0.1", "0.1.1")).toBe(1);
  		expect(DeployService._compareVersions("1.0.1", "0.2.0")).toBe(1);
  		expect(DeployService._compareVersions("1.0.1", "0.2.1")).toBe(1);
  		expect(DeployService._compareVersions("1.0.1", "0.0.11")).toBe(1);
  		expect(DeployService._compareVersions("1.0.1", "0.0.100")).toBe(1);
  		expect(DeployService._compareVersions("1.3.1", "1.2.0")).toBe(1);


  		expect(DeployService._compareVersions("1.1.1", "0.2.0")).toBe(1);
  		expect(DeployService._compareVersions("1.1.0", "0.2.0")).toBe(1);


  		expect(DeployService._compareVersions("1.1.0", "1.0.1")).toBe(1);
  		expect(DeployService._compareVersions("1.2.0", "1.1.0")).toBe(1);
  		expect(DeployService._compareVersions("1.2.0", "1.1.1")).toBe(1);
  		expect(DeployService._compareVersions("2.1.0", "1.1.101")).toBe(1);


  		expect(DeployService._compareVersions("2.0.0", "1.4.100")).toBe(1);
  	});

  	it('should be 0', function(){
  		expect(DeployService._compareVersions("0.0.1", "0.0.1")).toBe(0);
  		expect(DeployService._compareVersions("0.1.0", "0.1.0")).toBe(0);
  		expect(DeployService._compareVersions("1.0.0", "1.0.0")).toBe(0);
  		expect(DeployService._compareVersions("1.0.1", "1.0.1")).toBe(0);
  		expect(DeployService._compareVersions("1.1.1", "1.1.1")).toBe(0);
  	});
  });
 });