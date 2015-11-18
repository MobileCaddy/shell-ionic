exports.config = {
  capabilities: {
    // You can use other browsers
    // like firefox, phantoms, safari, IE (-_-)
    'browserName': 'chrome'
  },
  suites: {
    // stories - add e2e stories etc like this
    // story1:  'e2e/story1.test.spec.js',

    // pages - Can also test just specific pages
    settings: 'e2e/settings.test.spec.js'
  },
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000,
    isVerbose: true,
  },
  allScriptsTimeout: 120000,
  onPrepare: function(){
    // implicit and page load timeouts
    browser.manage().timeouts().pageLoadTimeout(40000);
    //browser.manage().timeouts().implicitlyWait(25000);

    // for non-angular page
    browser.ignoreSynchronization = true;

    // add protractor-ionic-locator
    require('protractor-ionic-locator')(protractor);

    // (un)comment the line below if you want to run against mock data
    global.runLocal = true;

    if (runLocal) {

      // set this value to the codeflow 'forceOAuth' localStorage value
      // See our Time and Expenses Seed App for examples on how to run e2e
      // tests against the platform
      global.forceOAuth = '{"access_token":"00D24000000j6TL!ARwAQDBQgaWKDR4P146IymD3hJLrrnHRDR_t0AnHEPwFxB1MzwmC3NXdemboCl4VSnR5uQvxFQn9x5074cGiOOTAIh81GjzP","refresh_token":"5Aep861rz1k6fS7Sfd_8t4srdoD0rCC7EtnGkwqZTLdLG8jgXpVTCY2.q5fdC_joo9qUwbhGRKR6HTPFwNQjAgH","instance_url":"https://eu5.salesforce.com","id":"https://login.salesforce.com/id/00D24000000j6TLEAY/00524000001ISo1AAG","issued_at":"1447766508975","signature":"cyQ9mB24mURMwwQhsyXuZteDpZROSrN++yzSSQBKdH4","scope":"api+web+full+refresh_token","token_type":"Bearer"}';

      global.proxyURL = 'http://localhost:3000';
      global.initialWait = 8000;
      global.sleepMultiplyer = 1000;

    } else {
      global.initialWait = 0;
      global.sleepMultiplyer = 1000;
    }

  }
};