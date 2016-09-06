### 1.3.0 (2016-09-06)


#### Bug Fixes

* Sync Now button in Outbox was not working

#### Features

* NONE

#### Breaking Changes

* NONE


### 1.2.1 (2016-08-17)


#### Bug Fixes

* NONE

#### Features

* Dep bounce of most packages - needed to support conflict with NPM 6.3.1 and phantomjs.

#### Breaking Changes

* NONE


### 1.2.0 (2016-04-27)


#### Bug Fixes

* NONE

#### Features

* Min npm of v3.
* Updated sync service including icon in nav bar.
* Inclusion of localNotifications out of the box.
* Inclusion of Sync Now to Settings page.
* Added Outbox to Settings page.
* Use of $broadcast, not $emit for syncState - reduces use if $rootScope in controllers
* Ionic vsn bump.
* Added unit tests.
* Improved Deploy process - removed the need for manual Visualforce page modification.
* Added check for "minimum supported version" of MobileCaddy package on the platform.
* Unit test code coverage

#### Breaking Changes

* NONE

### 1.1.2 (2016-06-15)


#### Bug Fixes

* Fixed broken Deploy controller

#### Features

* NONE

#### Breaking Changes

* NONE

### 1.1.1 (2016-06-06)


#### Bug Fixes

* Fixed broken Deploy controller
* Corrected local resource ref for cordova lib used when deployed to the platform

#### Features

* Added commented line for `$compileProvider.debugInfoEnabled(false);` for production release
* Updated `grunt prod` to meet current project setup and add comment banner to uglified output
* Updated `grunt devsetup` command to include font/image name tweaking to get over Summer 16 issue where it appends a query string to filename in Visualforce pages - this broke iOS icons.

#### Breaking Changes

* NONE

### 1.1.0 (2015-11-20)


#### Bug Fixes

* none

#### Features

* Further work on Angular Style Guide implementation

#### Breaking Changes

* none


### 1.0.2 (2015-11-17)


#### Bug Fixes

* Fixed broken karma test setup

#### Features

* Using Angular Style Guide for code structure etc.
* Added e2e tests as an example
* Added a home page - so the tabs are navigatable.

#### Breaking Changes

* none

### 1.0.1 (2015-10-30)


#### Bug Fixes

* NONE

#### Features

* node v5.0.0 support (flat node_modules structure)

#### Breaking Changes

* none


### 1.0.0  (2015-10-16)


#### Bug Fixes

* NONE

#### Features

* New **Codeflow Control Panel**

#### Breaking Changes

* Use on packages only containing 'mobilecaddy1' namespace


### 0.0.3 (2015-10-04)


#### Bug Fixes

*

#### Features

* Replace bower deps with matching NPM ones.

#### Breaking Changes

* none


### 0.0.2 (2015-09-16)


#### Bug Fixes

*

#### Features

* Dep bounce
* ios9 Patch
* logger calls added
* Settings updates
** sync tables option
** MTI linking
** Table content insert into log option

#### Breaking Changes

* none

### 0.0.1-alpha.7 (2015-07-15)


#### Bug Fixes

* Added missing 'logout' call.

#### Features

* CORS server removed (now in mobilecaddy-codeflow dep)
* MobileCaddy libs now injected in controllers and service
* Dep bump

#### Breaking Changes

* none


### 0.0.1-alpha.6 (2015-05-07)


#### Bug Fixes

* none

#### Features

* Testing Resources View added to settings area.
* Support for upgrade information on startup and example code for "resume" cordova event
* Placeholder code for cordova "online", "offline" and "resume" events
* Move mock data to _mock_ dir from _test_ dir
* Added karma/jasmine to give example of how to unit test
* Dep bump

#### Breaking Changes

* none

