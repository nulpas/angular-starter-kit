(function() {
  'use strict';
  var resolveViewConfig = [
    '$tools',
    '$views',
    function($tools, $views) {
      var maxScreenWidthForListType = 960;
      var $c = $tools.$;
      return $views.setViewDefinition({
        type: (screen.width >= maxScreenWidthForListType) ? $c.SIMPLE_LIST_VIEW : $c.GRID_VIEW
      });
    }
  ];
  var resolveMenu = [
    '$stateParams',
    'login',
    function($stateParams, login) {
      var menu = login.getUserInfo().profileMenus;

      var logMenuKey = 'menu.' + $stateParams.param1;
      var logImportMenuKey = logMenuKey + '.' + $stateParams.param2;
      var searchOption = menu[logMenuKey] ? menu[logMenuKey].items[logImportMenuKey] : {};

      if ($stateParams.param3 && searchOption.items) {
        searchOption = searchOption.items[logImportMenuKey + '.' + $stateParams.param3];
      }

      return searchOption;
    }
  ];
  angular.module('app.log')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider

          .state('app.log', {
            url: '/:param1',
            abstract: true
          })
          .state('app.log.import', {
            url: '/:param2/:param3',
            views: {
              'content@app': {
                templateUrl: 'bundles/log/app.log.view.tpl.html',
                controller: 'logController as logs'
              }
            },
            resolve: {
              viewConfig: resolveViewConfig,
              menuItem: resolveMenu
            }
          })

          .state('app.importLogDetails', {
            url: '/log-details/:importLogId',
            params: {
              index: undefined
            },
            views: {
              'content@app': {
                templateUrl: 'bundles/log/details/app.logDetails.view.tpl.html',
                controller: 'logDetailsController as logDetails'
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

          .state('app.log.audit', {
            url: ':entity/:entityId/audits',
            views: {
              'content@app': {
                templateUrl: 'bundles/log/app.log.view.tpl.html',
                controller: 'logController as logs'
              },
              resolve: {
                viewConfig: resolveViewConfig
              }
            }
          })

          .state('app.log.auditPrice', {
            url: '/:param2/:param3',
            views: {
              'content@app': {
                templateUrl: 'bundles/log/app.log.view.tpl.html',
                controller: 'logController as logs'
              }
            },
            resolve: {
              viewConfig: resolveViewConfig,
              menuItem: resolveMenu
            }
          });
      }
    ]);
})();
