# MobileCaddy Shell App - Angular/Ionic

## Overview

This is the basic shell application built with [Angular JS](https://angularjs.org/) and the [Ionic Framework](http://ionicframework.com). The idea of the MobileCaddy shell applications are to give developers a barebones starting block in getting building hybrid mobile applications with MobileCaddy.

## Getting Started

* Get the code and the supporting node and packages. The following depencies are needed (For detailed instructions see the [Getting Started Guide](http://developer.mobilecaddy.net/docs));
 * npm
 * grunt-cli
 * ruby
 * sass


* Download the [zip](https://github.com/MobileCaddy/shell-ionic/archive/master.zip) and unzip

```
mv shell-ionic-master shell-ionic
cd shell-ionic
```

## What you get (prior to running any installs/grunt tasks)

```
├── apex-templates		## Templates for the platform's startpage and cache manifest
├── Gruntfile.js      ## Defines our task automation
├── mock              ## Platform mock responses can go in here
├── package.json      ## The node package file and core app configuration
├── README.md         ## This file
├── scss              ## Where you do your SCSS
├── tests             ## unit tests etc
└── www               ## Where you do your coding
    ├── css
    ├── img
    ├── index.html    ## This is used locally only
    ├── js
    ├── lib
    └── templates
```

* Install the required packages and dependencies (note: you might need `sudo npm install` below)

```
npm install
grunt devsetup
```

The app can be started using this command (that uses the Mobilecaddy CLI) and should be accessible on [http://localhost:3030/www/](http://localhost:3030/www/), though a browser tab should be opened automagically for you.

```
mobilecaddy serve
```

The Codeflow control panel for your application should be availble on [http://localhost:3030/codeflow/](http://localhost:3030/codeflow/).



The Codeflow Control Panel

## Task automation

The Grunt config (out of the box) offers the following commands

* **grunt devsetup** : This should be run once following _npm install_ command. It will copy dependency files over into the correct place in your app
* **grunt serve** : This runs the **connect** and **watch** tasks below.
* **grunt connect** : This will start a server up so you can run your app in the browser
* **grunt watch** : This will watch your template files, JS and SCSS files for changes. And will run will depending on the type of file that changed, run JSHint, SASS compilation and will create a .zip file containing your app. You JS will be unminified in this archive to aid debugging. Any SCSS changes will prompt new CSS and cause live reload of these into your browser.
* **grunt unit-test** : run the karma unit tests
* **grunt dev** : This runs JSHint, SASS compilation and will create a .zip file containing your app. You JS will be unminified in this archive to aid debugging.
* **grunt prod** : This will do the same as **grunt dev** but your JS will be minified in the output archive.

## end2end Testing

e2e tests can be run with protractor. This may need to be installed if you haven't got it already;

```
npm install -g protractor
```

You may also need to install/update the webdriver

```
webdriver-manager update --standaloneUpdating selenium standalone
```

To run the tests;

```
webdriver-manager start
```
... and in another prompt
```
protractor tests/protractor.config.js
```