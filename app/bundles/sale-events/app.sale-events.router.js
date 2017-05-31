(function() {
  'use strict';

  angular.module('app.layout.sale-events')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.saleEvents', {
            url: '/sale-events',
            views: {
              'content@app': {
                templateUrl: 'bundles/sale-events/app.sale-events.view.tpl.html',
                controller: 'saleEventsController as saleEvents'
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

          .state('app.createSaleEvent', {
            url: '/create-sale-event',
            views: {
              'content@app': {
                templateUrl: 'bundles/sale-events/details/app.sale-event-details.view.tpl.html',
                controller: 'saleEventDetailsController as saleEventDetails'
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

          .state('app.saleEventDetails', {
            url: '/sale-event-details/:saleEventId',
            params: {
              index: undefined
            },
            views: {
              'content@app': {
                templateUrl: 'bundles/sale-events/details/app.sale-event-details.view.tpl.html',
                controller: 'saleEventDetailsController as saleEventDetails'
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

          .state('app.saleEventFile', {
            url: '/sale-event-file/:saleEventId',
            views: {
              'content@app': {
                templateUrl: 'bundles/sale-events/file/app.sale-events.file.view.tpl.html',
                controller: 'SaleEventFileController',
                controllerAs: 'saleEventFile'
              }
            },
            resolve: {
              view: [
                '$stateParams',
                'globalConstants',
                function($stateParams, globalConstants) {
                  return {
                    entity: 'saleevents',
                    entityId: $stateParams.saleEventId,
                    type: globalConstants.get().VIEW_FILE,
                    configAdd: null
                  };
                }
              ]
            }
          })

          .state('app.saleEventTable', {
            url: '/sale-events-table',
            views: {
              'content@app': {
                templateUrl: 'bundles/sale-events/table/app.sale-events.table.view.tpl.html',
                controller: 'SaleEventTableController',
                controllerAs: 'saleEventTable'
              }
            },
            resolve: {
              view: [
                'globalConstants',
                function(globalConstants) {
                  return {
                    entity: 'saleevents',
                    type: globalConstants.get().VIEW_TABLE,
                    configAdd: null
                  };
                }
              ]
            }
          })

          .state('app.saleEvents.state', {
            url: '/:param1',
            views: {
              'content@app': {
                templateUrl: 'bundles/sale-events/app.sale-events.view.tpl.html',
                controller: 'saleEventsController as saleEvents'
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
          });
      }
    ]);
})();
