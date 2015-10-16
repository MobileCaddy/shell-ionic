<apex:page applyHtmlTag="true" applyBodyTag="false" showHeader="false" docType="html-5.0" standardStylesheets="false"  manifest="/apex/MY_APP_CACHE_RESOURCE">
    <!--
    Need to add this controller to the apex tag
    controller="mobilecaddy1.MobileCaddyStartPageController001_mc"
    -->

    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width"/>
        <title>My Shell App</title>

        <!-- ===================== -->
        <!-- Your App's Resources  -->
        <!-- ===================== -->
        <script src="{!URLFOR($Resource.MY_APP_RESOURCE, 'www/lib/js/ionic.bundle.min.js')}" type="text/javascript"></script>
        <script src="{!URLFOR($Resource.MY_APP_RESOURCE, 'www/lib/js/angular-ios9-uiwebview.patch.js')}" type="text/javascript"></script>


        <script src="{!URLFOR($Resource.MY_APP_RESOURCE, 'www/js/app.js')}" type="text/javascript"></script>
        <script src="{!URLFOR($Resource.MY_APP_RESOURCE, 'www/js/services.js')}" type="text/javascript"></script>
        <script src="{!URLFOR($Resource.MY_APP_RESOURCE, 'www/js/controllers.js')}" type="text/javascript"></script>

        <!-- ============== -->
        <!-- Your App's CSS -->
        <!-- ============== -->
        <link rel="stylesheet" href="{!URLFOR($Resource.MY_APP_RESOURCE, 'www/css/app.css')}"/>

        <!-- ===================================== -->
        <!-- MobileCaddy Required Vendor Libraries -->
        <!-- ============================ -->
        <script src="{!URLFOR($Resource.MC_UTILS_RESOURCE, 'jquery.min.js')}" type="text/javascript"></script>
        <script src="{!URLFOR($Resource.MC_UTILS_RESOURCE, 'promise-1.0.0.min.js')}" type="text/javascript"></script>
        <script src="{!URLFOR($Resource.MC_UTILS_RESOURCE, 'underscore-min.js')}" type="text/javascript"></script>

        <!-- ============================== -->
        <!-- MobileCaddy Core App Resources -->
        <!-- ============================== -->
        <script src="https://localhost/cordova.js"></script>
        <!--<script src="{!URLFOR($Resource[cordovaResource])}" type="text/javascript"></script>-->

        <!-- ===================== -->
        <!-- MobileCaddy Libraries -->
        <!-- ===================== -->
        <script src="{!URLFOR($Resource.MC_UTILS_RESOURCE, 'mobilecaddy-utils.min.js')}" type="text/javascript"></script>

        <!-- ================== -->
        <!-- Routing and Config -->
        <!-- ================== -->
        <!-- root of your app's content -->
        <script>window.RESOURCE_ROOT = "{!URLFOR($Resource.MY_APP_RESOURCE, 'www/')}";</script>
        <script>window.LOCAL_DEV = false;</script>
        <script>window.USE_FORCETK = false;</script>

    </head>
    <body animation="slide-left-right-ios7">

    <!-- ============================ -->
    <!-- App start page and structure -->
    <!-- ============================ -->
    <ion-nav-bar class="bar-positive mc-hide" id="my-nav-bar">
      <ion-nav-back-button>
      </ion-nav-back-button>
    </ion-nav-bar>

     <ion-nav-view></ion-nav-view>
     <ion-view>
      <div id='start-page'>
        <div id='startlogo'>
        </div>
        <div class="card">
          <div class="item item-text-wrap">
            <p id='app-progress-msg' class="item-icon-left"><i class="icon spin ion-load-c"></i>The application is just being built... this may take a few moments.</p>
          </div>
        </div>
      </div>
    </ion-view>
    <script type="text/javascript">
        function thirdPartyProgressCallbackB(val, tabCnt, tabNum){
            var infoStr = '';
            if ( tabCnt !== 0 ) {
                infoStr = '<i class="icon spin ion-load-c"></i>' + 'Building data table ' + val + '. ' + tabNum + ' of ' + tabCnt + '</p>';
            } else {
                infoStr = '<i class="icon spin ion-load-c"></i>' + 'Building app table ' + val + '.</p>';
            }
            document.getElementById("app-progress-msg").innerHTML = '<i class="icon spin ion-load-c"></i>' + 'Building table ' + val + '.</p>';
        };
    </script>

    <!-- ========================== -->
    <!-- MobileCaddy Startup Script -->
    <!-- ========================== -->
    <script type="text/javascript">

        // Pass controller name into mobile caddy
        mobileCaddy.START_PAGE_CONTROLLER = 'MobileCaddyStartPageController001_mc';

        // Get the mobileCaddy startup module
        var mobileCaddyStartup = mobileCaddy.require('mobileCaddy/startup');
        // Startup the app.  Parameter is custom callback function
        // or null if there is nothing custom to call on startup
        mobileCaddyStartup.startup(function(runUpInfo) {
          myapp_callback(runUpInfo);
        });
    </script>
    <!-- End MobileCaddy Startup Script -->
  </body>
</apex:page>
