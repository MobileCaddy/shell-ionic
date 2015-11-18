describe("settings:", function() {

  var tabs = require('./tabs.page.js');

  it("should have a settings page", function() {
    //browser.executeScript('localStorage.setItem("forceOAuth", "123")');
    browser.get('http://localhost:3030').then(function() {
      // set oauth info if needed
      if ( typeof(forceOAuth) != "undefined" ) {
        browser.executeScript('localStorage.setItem("forceOAuth", \'' + forceOAuth + '\')');
      }
      var localStr = (typeof(runLocal) == "undefined") ? '' : '?local=true';
      return browser.get('http://localhost:3030/www/#/tab/settings' + localStr);
    }).then(function() {
      return browser.sleep(2.5 * sleepMultiplyer);
    }).then(function(){
      return browser.getTitle();
    }).then(function(title){
      expect(title).toEqual("Settings");
    });
  });

  it("should have no upgrade available (as no upgrade available)", function() {
    browser.get('http://localhost:3030/www/#/tab/home').then(function() {
      return browser.sleep(1 * sleepMultiplyer);
    }).then(function(){
      var appSoupStr = JSON.stringify([{"Name":"applicationName","CurrentValue":"MAP-0012001","_soupEntryId":1},{"Name":"userId","CurrentValue":"00000000dUmMyID000","_soupEntryId":2},{"Name":"buildStatus","CurrentValue":"Complete","_soupEntryId":3,"NewValue":"Complete"},{"Name":"buildVersion","CurrentValue":"001","_soupEntryId":4},{"Name":"buildName","CurrentValue":"BIZ001","_soupEntryId":5},{"Name":"buildOS","CurrentValue":"Android","_soupEntryId":6},{"Name":"deviceUuid","CurrentValue":"c86d3e94574debug","_soupEntryId":7},{"Name":"audId","CurrentValue":"a2eR0000000Jv8FIAS","_soupEntryId":8},{"Name":"startPageURL","CurrentValue":"https://cs2.salesforce.com/apex/MobileCaddyDemo_Todd","_soupEntryId":9},{"Name":"sysDataVersion","CurrentValue":"Paul","_soupEntryId":10},{"Name":"sysDataPlatSupVersion","CurrentValue":"Paul","_soupEntryId":11},{"Name":"versionUtilsVersion","CurrentValue":"001","_soupEntryId":12},{"Name":"dynVersionNumber","CurrentValue":"Paul", "_soupEntryId":13},{"Name":"syncRefreshVersion","CurrentValue":"Paul","_soupEntryId":14}]);
      return browser.executeScript("return window.localStorage.setItem('appSoup', '" + appSoupStr + "');");
    }).then(function(){
      tabs.settingsTabItem.click();
      return browser.sleep(0.2 * sleepMultiplyer);
    }).then(function(){
      var myElement = element(by.css('.ion-android-download'));
      expect(myElement.isPresent()).toBeFalsy();
    });
  });

  it("should have an upgrade available", function() {
    browser.get('http://localhost:3030/www/#/tab/home').then(function() {
      return browser.sleep(1 * sleepMultiplyer);
    }).then(function(){
      var appSoupStr = JSON.stringify([{"Name":"applicationName","CurrentValue":"MAP-0012001","_soupEntryId":1},{"Name":"userId","CurrentValue":"00000000dUmMyID000","_soupEntryId":2},{"Name":"buildStatus","CurrentValue":"Complete","_soupEntryId":3,"NewValue":"Complete"},{"Name":"buildVersion","CurrentValue":"001","_soupEntryId":4},{"Name":"buildName","CurrentValue":"BIZ001","_soupEntryId":5},{"Name":"buildOS","CurrentValue":"Android","_soupEntryId":6},{"Name":"deviceUuid","CurrentValue":"c86d3e94574debug","_soupEntryId":7},{"Name":"audId","CurrentValue":"a2eR0000000Jv8FIAS","_soupEntryId":8},{"Name":"startPageURL","CurrentValue":"https://cs2.salesforce.com/apex/MobileCaddyDemo_Todd","_soupEntryId":9},{"Name":"sysDataVersion","CurrentValue":"Paul","_soupEntryId":10},{"Name":"sysDataPlatSupVersion","CurrentValue":"Paul","_soupEntryId":11},{"Name":"versionUtilsVersion","CurrentValue":"001","_soupEntryId":12},{"Name":"dynVersionNumber","CurrentValue":"Paul", "NewValue": "001", "_soupEntryId":13},{"Name":"syncRefreshVersion","CurrentValue":"Paul","_soupEntryId":14}]);
      return browser.executeScript("return window.localStorage.setItem('appSoup', '" + appSoupStr + "');");
    }).then(function(){
      tabs.settingsTabItem.click();
      return browser.sleep(0.2 * sleepMultiplyer);
    }).then(function(){
      var myElement = element(by.css('.ion-android-download'));
      expect(myElement.isPresent()).toBeTruthy();
    });
  });


  it("should have no upgrade available (as upgrade available but dirtyTables)", function() {
    browser.get('http://localhost:3030/www/#/tab/home').then(function() {
      return browser.sleep(1 * sleepMultiplyer);
    }).then(function(){
      var appSoupStr = JSON.stringify([{"Name":"applicationName","CurrentValue":"MAP-0012001","_soupEntryId":1},{"Name":"userId","CurrentValue":"00000000dUmMyID000","_soupEntryId":2},{"Name":"buildStatus","CurrentValue":"Complete","_soupEntryId":3,"NewValue":"Complete"},{"Name":"buildVersion","CurrentValue":"001","_soupEntryId":4},{"Name":"buildName","CurrentValue":"BIZ001","_soupEntryId":5},{"Name":"buildOS","CurrentValue":"Android","_soupEntryId":6},{"Name":"deviceUuid","CurrentValue":"c86d3e94574debug","_soupEntryId":7},{"Name":"audId","CurrentValue":"a2eR0000000Jv8FIAS","_soupEntryId":8},{"Name":"startPageURL","CurrentValue":"https://cs2.salesforce.com/apex/MobileCaddyDemo_Todd","_soupEntryId":9},{"Name":"sysDataVersion","CurrentValue":"Paul","_soupEntryId":10},{"Name":"sysDataPlatSupVersion","CurrentValue":"Paul","_soupEntryId":11},{"Name":"versionUtilsVersion","CurrentValue":"001","_soupEntryId":12},{"Name":"dynVersionNumber","CurrentValue":"Paul", "NewValue": "001", "_soupEntryId":13},{"Name":"syncRefreshVersion","CurrentValue":"Paul","_soupEntryId":14}]);
      return browser.executeScript("return window.localStorage.setItem('appSoup', '" + appSoupStr + "');");
    }).then(function(){
      var rtsStr = JSON.stringify([{"Mobile_Table_Name":"Connection_Session__mc","CRUD_Operation":"Update","SOUP_Record_Id":31,"Id":"GDh9e2G4GyUsmXBdcT","LastModifiedDateTime":1433409282629,"_soupEntryId":1,"Current_Connection_Session":"PROXY%Connection_Session__mc%1433409284575%18%a2eR0000000Jv8FIAS"},{"Mobile_Table_Name":"Connection_Session__mc","CRUD_Operation":"Update","SOUP_Record_Id":32,"Id":"a0T110000028zcTEAQ","LastModifiedDateTime":1433409283916,"_soupEntryId":2,"Current_Connection_Session":"PROXY%Connection_Session__mc%1433409284575%18%a2eR0000000Jv8FIAS"},{"Mobile_Table_Name":"Store_Visit__ap","SOUP_Record_Id":31,"Id":"PROXY%Store_Visit__ap%1433410323633%31%a2eR0000000Jv8FIAS","CRUD_Operation":"Insert","LastModifiedDateTime":1433410326371}]);
      return browser.executeScript("return window.localStorage.setItem('recsToSync', '" + rtsStr + "');");
    }).then(function(){
      tabs.settingsTabItem.click();
      return browser.sleep(0.2 * sleepMultiplyer);
    }).then(function(){
      var myElement = element(by.css('.ion-android-download'));
      expect(myElement.isPresent()).toBeFalsy();
    });
  });

});