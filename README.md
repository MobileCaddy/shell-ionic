# MobileCaddy Shell App - Angular/Ionic

## Overview

This is the basic seed application built with [Angular JS](https://angularjs.org/) and the [Ionic Framework](http://ionicframework.com). . The idea of the MobileCaddy shell applications are to give developers a barebones starting block in getting building hybrid mobile applications with MobileCaddy.

## Getting Started

* Get the code and the supporting node and packages. The following depencies are needed (For detailed instructions see the [Getting Started Guide](http://developer.mobilecaddy.net/docs));
 * npm
 * grunt-cli
 * bower
 * ruby
 * sass


* Download the [zip](https://github.com/MobileCaddy/shell-ionic/archive/master.zip) and unzip

```
cd shell-ionic
```

## What you get (prior to running any installs/grunt tasks)

```
├── bower.json        ## Defines dependencies (MobileCaddy, Ionic)
├── Gruntfile.js      ## Defines our task automation
├── package.json      ## The node package file
├── README.md         ## This file
├── test              ## Platform mock responses can go in here
└── www               ## Where you do your coding
    ├── css
    ├── img
    ├── index.html
    ├── js
    ├── lib
    └── templates
```

* Install the required packages and dependencies (not you might need `sudo npm install` below)

```
npm install
bower install
grunt devsetup
```


## Task automation

The Grunt config (out of the box) offers the following commands

* **grunt devsetup** : This should be run once following _bower install_ command. It will copy dependency files over into the correct place in your app
* **grunt connect** : This will start a server up so you can run your app in the browser
* **grunt watch** : This will watch your template files, JS and SCSS files for changes. And will run will depending on the type of file that changed, run JSHint, SASS compilation and will create a .zip file containing your app. You JS will be unminified in this archive to aid debugging.
* **grunt dev** : This runs JSHint, SASS compilation and will create a .zip file containing your app. You JS will be unminified in this archive to aid debugging.
* **grunt prod** : This will do the same as **grunt dev** but your JS will be minified in the output archive.