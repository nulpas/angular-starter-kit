(function() {
  'use strict';

  angular.module('app.packages')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.packages', {
            url: '/packages',
            views: {
              'content@app': {
                templateUrl: 'bundles/packages/app.packages.view.tpl.html',
                controller: 'packagesController as packages'
              }
            },
            resolve: {
              viewConfig: [
                '$tools',
                '$views',
                function($tools, $views) {
                  var maxScreenWidthForListType = 960;
                  var viewMode = (screen.width >= maxScreenWidthForListType) ? $tools.$.LIST_VIEW : $tools.$.GRID_VIEW;
                  return $views.setBoundProperty('type', viewMode);
                }
              ]
            }
          })
          .state('app.packageDetails', {
            url: '/package-details/:packageId',
            params: {
              index: undefined
            },
            views: {
              'content@app': {
                templateUrl: 'bundles/packages/details/app.package-details.view.tpl.html',
                controller: 'packageDetailsController as packageDetails'
              }
            },
            resolve: {
              viewConfig: [
                '$tools',
                '$views',
                function($tools, $views) {
                  return $views.setBoundProperty('type', $tools.$.DETAILS_VIEW);
                }
              ]
            }
          })
        .state('app.createPackage', {
            url: '/create-package',
            views: {
              'content@app': {
                templateUrl: 'bundles/packages/details/app.package-details.view.tpl.html',
                controller: 'packageDetailsController as packageDetails'
              }
            },
            resolve: {
              viewConfig: [
                '$tools',
                '$views',
                function($tools, $views) {
                  return $views.setBoundProperty('type', $tools.$.DETAILS_VIEW);
                }
              ]
            }
          });
      }
    ]);
})();
