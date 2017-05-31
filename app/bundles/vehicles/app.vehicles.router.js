(function() {
  'use strict';

  var resolveMenu = [
    '$stateParams',
    'login',
    function($stateParams, login) {
      var menu = angular.copy(login.getUserInfo().mainMenus);
      var searchOption = {};
      if ($stateParams.param1) {
        var logMenuKey = 'menu.' + $stateParams.param1;
        searchOption = menu[logMenuKey];
        if ($stateParams.param2) {
          var logImportMenuKey = logMenuKey + '.' + $stateParams.param2;
          searchOption = menu[logMenuKey].items[logImportMenuKey];
          if ($stateParams.param3 && searchOption.items) {
            searchOption = searchOption.items[logImportMenuKey + '.' + $stateParams.param3];
          }
        }
      } else {
        searchOption = {
          entity: 'vehicles',
          filter: '',
          items: {},
          label: 'vehicles',
          param: {},
          state: 'vehicles'
        };
      }
      return searchOption;
    }
  ];

  angular.module('app.vehicles')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.vehicles', {
            url: '/vehicles',
            views: {
              'content@app': {
                templateUrl: 'bundles/vehicles/app.vehicles.view.tpl.html',
                controller: 'vehiclesController as vehicles'
              }
            },
            resolve: {
              viewConfig: [
                '$tools',
                '$views',
                function($tools, $views) {
                  var maxScreenWidthForListType = 960;
                  return $views.setViewDefinition({
                    type: (screen.width >= maxScreenWidthForListType) ? $tools.$.LIST_VIEW : $tools.$.GRID_VIEW
                  });
                }
              ],
              menuItem: resolveMenu
            }
          })
          .state('app.vehicles.process', {
            url: '/workflow/:param1',
            params: {
              noActions: undefined
            },
            views: {
              'content@app': {
                templateUrl: 'bundles/vehicles/app.vehicles.view.tpl.html',
                controller: 'vehiclesController as vehicles'
              }
            },
            resolve: {
              menuItem: resolveMenu
            }
          })
          .state('app.vehicles.process.module', {
            url: '/:param2',
            views: {
              'content@app': {
                templateUrl: 'bundles/vehicles/app.vehicles.view.tpl.html',
                controller: 'vehiclesController as vehicles'
              }
            },
            resolve: {
              menuItem: resolveMenu
            }
          })
          .state('app.vehicles.process.module.state', {
            url: '/:param3',
            views: {
              'content@app': {
                templateUrl: 'bundles/vehicles/app.vehicles.view.tpl.html',
                controller: 'vehiclesController as vehicles'
              }
            },
            resolve: {
              menuItem: resolveMenu
            }
          })

          .state('app.vehicleDetails', {
            url: '/vehicle-details/:vehicleId',
            params: {
              index: undefined
            },
            views: {
              'content@app': {
                templateUrl: 'bundles/vehicles/details/app.vehicleDetails.view.tpl.html',
                controller: 'vehicleDetailsController as vehicleDetails'
              }
            },
            resolve: {
              menuItem: resolveMenu,
              viewConfig: [
                '$tools',
                '$views',
                function($tools, $views) {
                  return $views.setBoundProperty('type', $tools.$.DETAILS_VIEW);
                }
              ]
            }
          })

          .state('app.vehicleTable', {
            url: '/vehicles-table',
            views: {
              'content@app': {
                templateUrl: 'bundles/vehicles/table/app.vehicles.table.view.tpl.html',
                controller: 'VehiclesTableController',
                controllerAs: 'vehiclesTable'
              }
            },
            resolve: {
              view: [
                'globalConstants',
                function(globalConstants) {
                  return {
                    entity: 'vehicles',
                    type: globalConstants.get().VIEW_TABLE,
                    configAdd: null
                  };
                }
              ]
            }
          });
      }
    ]);
})();
