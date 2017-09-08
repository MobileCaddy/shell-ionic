/**
 * Deploy Factory
 *
 * = = = = = = = = = = = = = = = = = = = = =
 * DO NOT CHANGE THE FOLLOWING VERSION LINE
 * deploy_service_vsn:1.0.0
 * = = = = = = = = = = = = = = = = = = = = =
 *
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('DeployService', DeployService);

  DeployService.$inject = ['$rootScope', '$q', '$timeout', '$http'];

  function DeployService($rootScope, $q, $timeout, $http) {
		var apiVersionInt = 32;
		var apiVersion = "v" + 32 + ".0";

	  return {
	  	checkVsn : checkVsn,

	    getDetails : getDetails,

	    // For test only
	    _compareVersions: compareVersions,

	    deployBunlde : function(appConfig){
	      return encodeAppBundle(appConfig).then(function(myBody, bundleFiles){
	        return uploadAppBundle(appConfig, myBody);
	      });
	    },
	    uploadCachePage : uploadCachePage,

	    uploadStartPage : uploadStartPage,

	    srDetails: function() {
	      return encodeAppBundle().then(function(myBody){
	        return uploadAppBundle(myBody);
	      }).then(function(res){
	        return uploadStartPage();
	      });
	    }
	  };


	  /**
	   * checkVsn
	   * @description Checks to see if the destination org has at least the min
	   *              version on MobileCaddy installed
	   * @param  {string} minMCPackVsn
	   * @return {promise} Resolves if OK, rejects with object if fails
	   */
	  function checkVsn(minMCPackVsn) {
	    return new Promise(function(resolve, reject) {
	    	var appConfig,
	    			deviceAppName,
	    			deployServiceVsn,
	    			codeFlowVersion,
	    			codeFlowUtilsVersion;

	    	getDetails().then(function(res){
	    		appConfig = res;
	    		if (! appConfig.sf_mobile_application || appConfig.sf_mobile_application === '') {
	    			return Promise.reject("No sf_mobile_application specified in package.json. This needs to match the value as specified on SFDC");
	    		} else {
	    			return getDeviceAppName();
	    		}
	    	}).then(function(res) {
		    	deviceAppName = res;
		    	return getDeployServiceVersion();
	    	}).then(function(res) {
		    	deployServiceVsn = res;
	    		return getCodeFlowVersion();
	    	}).then(function(res) {
		    	codeFlowVersion = res;
		    	return getCodeFlowUtilsVersion();
	    	}).then(function(res) {
		    	codeFlowUtilsVersion = res;
		    	var options = JSON.stringify({
	    			function:"versionInfo",
  			    mc_utils_resource: appConfig.mc_utils_resource,
				    sf_mobile_application: appConfig.sf_mobile_application,
				    targeted_dv: appConfig.sf_app_vsn,
				    mobilecaddy_codeflow_vsn: codeFlowVersion,
				    mobilecaddy_codeflow_utils_vsn: codeFlowUtilsVersion,
				    // mobilecaddy_cli_vsn: '1.2',
				    deploy_service_vsn: deployServiceVsn,
				    device_app_name: deviceAppName
	    		});
			  	force.request(
		        {
		          method: 'POST',
							path:"/services/apexrest/mobilecaddy1/PlatformDevUtilsR001",
							contentType:"application/json",
							data:{startPageControllerVersion:'001', jsonParams:options}
		        },
		        function(response) {
		        	var respJson = JSON.parse(response);
		        	if (respJson.errorMessage == "success") {
		          	if ( compareVersions(respJson.packageVersion, minMCPackVsn) >= 0) {
		          		resolve();
		          	} else {
		          		reject({message : "Version of MobileCaddy on SFDC needs to be min version " + minMCPackVsn + ".\nCurrently running " + respJson.packageVersion + ".\nPlease upgrade.", type : "error"});
		          	}
		          } else {
								if (respJson.errorNo == 48)
								{
			          	respJson.message = "Sorry, looks like you have not enabled a Remote Site on your destination org. Please see http://developer.mobilecaddy.net/docs/adding-remote-site/ for details";
			          	respJson.type = "error";
		          	} else {
			          	respJson.message = respJson.errorMessage;
			          	respJson.type = "error";
		          	}
		          	console.error(respJson);
		          	reject(respJson);
		          }
		        },
		        function(error) {
		          console.error(error);
		          if (error[0].errorCode == "NOT_FOUND") {
		          	// we're likely running against an old package
	          		reject({message : "Version of MobileCaddy on SFDC needs to be min version " + minMCPackVsn + ".\nPlease upgrade.", type : "error"});
		          } else {
		          	reject({message :'Deploy failed. See console for details.', type: 'error'});
		        	}
		        }
		      );

	    	}).catch(function(e){
	    		console.error(e);
	    		reject({message: JSON.stringify(e), type: 'error'});
	    	});
	  	});
	  }


	  function compareVersions(v1, v2, options) {
	    var lexicographical = options && options.lexicographical,
	        zeroExtend = options && options.zeroExtend,
	        v1parts = v1.split('.'),
	        v2parts = v2.split('.');

	    function isValidPart(x) {
	        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
	    }

	    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
	        return NaN;
	    }

	    if (zeroExtend) {
	        while (v1parts.length < v2parts.length) v1parts.push("0");
	        while (v2parts.length < v1parts.length) v2parts.push("0");
	    }

	    if (!lexicographical) {
	        v1parts = v1parts.map(Number);
	        v2parts = v2parts.map(Number);
	    }

	    for (var i = 0; i < v1parts.length; ++i) {
	        if (v2parts.length == i) {
	            return 1;
	        }

	        if (v1parts[i] == v2parts[i]) {
	            continue;
	        }
	        else if (v1parts[i] > v2parts[i]) {
	            return 1;
	        }
	        else {
	            return -1;
	        }
	    }

	    if (v1parts.length != v2parts.length) {
	        return -1;
	    }

	    return 0;
	}

	  function _arrayBufferToBase64( buffer ) {
	    var binary = '';
	    var bytes = new Uint8Array( buffer );
	    var len = bytes.byteLength;
	    for (var i = 0; i < len; i++) {
	        binary += String.fromCharCode( bytes[ i ] );
	    }
	    return window.btoa( binary );
	  }

	  /**
	   * Does the static resource already exist on the platform for this app/vsn
	   */
	  function doesBundleExist(appConfig){
	    return new Promise(function(resolve, reject) {
	    var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
	    // check if statid resource already exists
	    force.request(
	      {
	        path: '/services/data/' + apiVersion + '/tooling/query/?q=select Id, Name, Description, LastModifiedDate from StaticResource WHERE Name=\'' + dataName + '\' LIMIT 1'
	      },
	      function(response) {
	          console.debug('response' , response);
	          resolve(response);
	      },
	      function(error) {
	        console.error('Failed to check if app bundle already existed on platform');
	        reject({message :"App bundle upload failed. See console for details.", type: 'error'});
	      });
	    });
	  }

	  /**
	   * Does the static resource already exist on the platform for this app/vsn
	   */
	  function doesPageExist(pageName){
	    return new Promise(function(resolve, reject) {
	    // check if statid resource already exists
	    force.request(
	      {
	        path: '/services/data/' + apiVersion + '/tooling/query/?q=select Id, Name, Description, LastModifiedDate from ApexPage WHERE Name=\'' + pageName + '\' LIMIT 1'
	      },
	      function(response) {
	          console.debug('response' , response);
	          resolve(response);
	      },
	      function(error) {
	        console.error('Failed to check if page already existed on platform');
	        reject({message :"Page upload failed. See console for details.", type: 'error'});
	      });
	    });
	  }

	  function getDetails () {
	    return new Promise(function(resolve, reject) {
	    var details = {};
	    $timeout(function() {
	        $http.get('../package.json').success(function(appConfig) {
	          appConfig.sf_app_vsn = appConfig.version.replace(/\./g, '');
	          resolve(appConfig);
	        }).catch(function(err){
	          console.error(err);
	        });
	    }, 30);
	    });
	  }

	  function getDeviceAppName () {
	    return new Promise(function(resolve, reject) {
	    var details = {};
	    $timeout(function() {
	        $http.get('index.tpl.html').success(function(indexBody) {
	        	var lines = indexBody.split('\n');
	        	var buildName = "";
						lines.forEach(function (line, i) {
					    if (line.includes("mobileCaddy.buildName")) {
					    	buildName = line.split("=")[1].replace(/\W/g, '');
					    }
						});
	          resolve(buildName);
	        }).catch(function(err){
	          console.error(err);
	        });
	    }, 30);
	    });
	  }

	  function getDeployServiceVersion () {
	    return new Promise(function(resolve, reject) {
	    var details = {};
	    $timeout(function() {
	        $http.get('js/services/deploy.service.js').success(function(indexBody) {
	        	var lines = indexBody.split('\n');
	        	var deployServiceVersion = "";
						lines.forEach(function (line, i) {
					    if (line.includes("* " + "deploy_service_vsn" + ":")) {
					    	var deployServiceVersion = line.split(":")[1];
	          		resolve(deployServiceVersion);
					    }
						});
	        }).catch(function(err){
	          console.error(err);
	        });
	    }, 30);
	    });
	  }


	  function getCodeFlowVersion() {
	    return getVersionFromPackageJson('../node_modules/mobilecaddy-codeflow/package.json');
	  }

	  function getCodeFlowUtilsVersion() {
	    return getVersionFromPackageJson('../node_modules/mobilecaddy-utils/package.json');
	  }

	  function getVersionFromPackageJson (path) {
	    return new Promise(function(resolve, reject) {
	    var details = {};
	    $timeout(function() {
	        $http.get(path).success(function(packageJson) {
	          resolve(packageJson.version);
	        }).catch(function(err){
	          console.error(err);
	        });
	    }, 30);
	    });
	  }


	  function encodeAppBundle(appConfig){
	    return new Promise(function(resolve, reject) {

	      JSZipUtils.getBinaryContent('../' + appConfig.name + '-' + appConfig.version +'.zip', function(err, data) {
	        if(err) {
	          console.error(err);
	          reject(err); // or handle err
	        }
	        var zipFileLoaded = new JSZip(data);
	        $rootScope.deployFiles = zipFileLoaded.files;
	        resolve(_arrayBufferToBase64(data));
	      });
	    });
	  }

	  function uploadAppBundle (appConfig, myBody) {
	    return new Promise(function(resolve, reject) {
	    var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
	    doesBundleExist(appConfig).then(function(response){
	      if (response.records.length > 0) {
	        // Update existing resource
	        console.debug('resource exists... patching existing');
	        var existingSR = response.records[0];
	        force.request(
	          {
	            method: 'PATCH',
	            contentType: 'application/json',
	            path: '/services/data/' + apiVersion + '/tooling/sobjects/StaticResource/' + existingSR.Id + '/',
	            data: {
	              'Body':myBody
	            }
	          },
	          function(response) {
	              console.debug('response' , response);
	              resolve('Existing app bundle updated');
	          },
	          function(error) {
	            console.error('Failed to check if app bundle already existed on platform');
	            reject({message :"App bundle upload failed. See console for details.", type: 'error'});
	          }
	        );
	      } else {
	        // Updload new resource
	        force.request(
	          {
	            method: 'POST',
	            contentType: 'application/json',
	            path: '/services/data/' + apiVersion + '/tooling/sobjects/StaticResource/',
	            data: {
	              'Name': dataName,
	              'Description' : 'App Bundle - auto-uploaded by MobileCaddy delopyment tooling',
	              'ContentType':'application/zip',
	              'Body':myBody,
	              'CacheControl': 'Public'
	            }
	          },
	          function(response) {
	            console.debug('response' , response);
	            resolve('App bundle uploaded');
	          },
	          function(error) {
	            console.error(error);
	            reject({message :"App bundle upload failed. See console for details.", type: 'error'});
	          });
	      }
	    });
	    });
	  }

	  function uploadCachePage(appConfig) {
	    return new Promise(function(resolve, reject) {
	      $timeout(function() {
	        $http.get('../apex-templates/cachepage-template.apex').success(function(data) {
	          var dataName = appConfig.sf_app_name + 'Cache_' + appConfig.sf_app_vsn;
	          var cacheEntriesStr = '';
	          _.each($rootScope.deployFiles, function(el){
	            if (!el.dir) cacheEntriesStr += '{!URLFOR($Resource.' + appConfig.sf_app_name + '_' + appConfig.sf_app_vsn + ', \'' + el.name + '\')}\n';
	          });
	          var dataParsed = data.replace(/MC_UTILS_RESOURCE/g, appConfig.mc_utils_resource);
	          dataParsed = dataParsed.replace(/MY_APP_FILE_LIST/g, cacheEntriesStr);
	          delete $rootScope.deployFiles;

						var pageOptions = JSON.stringify({
							"function":"createApexPage",
							"pageApiName":dataName,
							"pageLabel":dataName,
							"pageContents":dataParsed,
							"apiVersion":apiVersionInt,
							"pageDescription":"MobileCaddy CachePage" });
	          force.request(
	            {
	              method: 'POST',
								path:"/services/apexrest/mobilecaddy1/PlatformDevUtilsR001",
								contentType:"application/json",
								data:{startPageControllerVersion:'001', jsonParams:pageOptions}
	            },
	            function(response) {
	            	// we will get a response like this, is it fails
	            	// "{\"errorMessage\":\"Create Apex Page exception: Error occured processing component ShellAppCache_001. That page name is already in use, please choose a different one. (DUPLICATE_DEVELOPER_NAME). Fields Name.\",\"errorNo\":49}"
	            	var respJson = JSON.parse(response);
	            	if (respJson.errorMessage == "success") {
	              	resolve('Cache manifest uploaded');
	              } else {
		            	respJson.message = respJson.errorMessage;
		            	respJson.type = "error";
	              	console.error(respJson);
	              	reject(respJson);
	              }
	            },
	            function(error) {
	              console.error(error);
	              reject({message :'Start page upload failed. See console for details.', type: 'error'});
	            }
	          );
    			});
	      }, 30);
	    });
	  }


	  function uploadStartPage(appConfig) {
	    return new Promise(function(resolve, reject) {
	      $timeout(function() {
	        $http.get('../apex-templates/startpage-template.apex').success(function(data) {
	          var dataName = appConfig.sf_app_name + '_' + appConfig.sf_app_vsn;
	          var dataParsed = data.replace(/MC_UTILS_RESOURCE/g, appConfig.mc_utils_resource);
	          dataParsed = dataParsed.replace(/MY_APP_RESOURCE/g, appConfig.sf_app_name + '_' + appConfig.sf_app_vsn);
	          dataParsed = dataParsed.replace(/MY_APP_CACHE_RESOURCE/g, appConfig.sf_app_name + 'Cache_' + appConfig.sf_app_vsn);


						var pageOptions = JSON.stringify({
							"function":"createApexPage",
							"pageApiName":dataName,
							"pageLabel":dataName,
							"pageContents":dataParsed,
							"apiVersion":apiVersionInt,
							"pageDescription":"MobileCaddy StartPage" });
	          force.request(
	            {
	              method: 'POST',
								path:"/services/apexrest/mobilecaddy1/PlatformDevUtilsR001",
								contentType:"application/json",
								data:{startPageControllerVersion:'001', jsonParams:pageOptions}
	            },
	            function(response) {
	            	var respJson = JSON.parse(response);
	            	if (respJson.errorMessage == "success") {
	              	resolve('Start page uploaded');
	              } else {
		            	respJson.message = respJson.errorMessage;
		            	respJson.type = "error";
	              	console.error(respJson);
	              	reject(respJson);
	              }
	            },
	            function(error) {
	              console.error(error);
	              reject({message :'Start page upload failed. See console for details.', type: 'error'});
	            }
	          );
	        });
	      }, 30);
	    });
	  }

  }

})();