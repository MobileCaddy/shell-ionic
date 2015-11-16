<apex:page showHeader="false" standardStylesheets="false" contentType="text/cache-manifest" controller="mobilecaddy1.StartPageCacheCtrl001_mc">CACHE MANIFEST

NETWORK:
*

CACHE:

#SECTION 1A MOBILECADDY CACHED PAGES

#The page below is a dummy page to cause the cache to fail and check the behaviour and logging uncomment to test
#/pagetofailcache


#SECTION 1B MOBILECADDY CACHED JS

{!vfremotepath}
/static/111213/js/perf/stub.js
{!URLFOR($Resource.MC_UTILS_RESOURCE, 'jquery.min.js')}
{!URLFOR($Resource.mobilecaddy1__cordovaSF3v1)}
{!URLFOR($Resource.MC_UTILS_RESOURCE, 'mobilecaddy-utils.min.js')}
{!URLFOR($Resource.MC_UTILS_RESOURCE, 'promise-1.0.0.min.js')}
{!URLFOR($Resource.MC_UTILS_RESOURCE, 'underscore-min.js')}


#SECTION 1C MOBILECADDY CACHED CSS


#SECTION 1D MOBILECADDY CACHED IMAGES


#SECTION 2A MOBILE APPLICATION CACHED PAGES / JS / ASSETS

MY_APP_FILE_LIST


#sessionid to force reload cache everytime the app is online:{!GETSESSIONID()}

#This is done as a work around to a limitation of JS Remoting that causes remoting actions to fail on subsequent app login.

</apex:page>
