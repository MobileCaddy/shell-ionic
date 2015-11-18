/**
 * Page Object Definition
 * Tabs
 */

var Tabs = function() {


  this.homeTabItem =  element(by.css('.ion-home'));
  this.settingsTabItem =  element(by.css('.ion-gear-a'));

};

module.exports = new Tabs();