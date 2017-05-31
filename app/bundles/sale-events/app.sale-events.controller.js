(function() {
  'use strict';

  angular.module('app.layout.sale-events')
    .controller('saleEventsController', [
      '$api',
      '$views',
      '$stateParams',
      '$tools',
      'queryParamsFactory',
      'login',
      'count',
      function($api, $views, $stateParams, $tools, queryParamsFactory, login, count) {
        var vm = this;
        var saleEventsMenuConfiguration = login.getUserInfo().mainMenus['menu.saleEvents'];
        vm.dataOriginEntity = saleEventsMenuConfiguration.entity;
        var $c = $api.$;
        vm.listData = null;
        vm._shared = $c;
        vm.viewConfig = $views.setViewDefinition({
          focusInGrid: {},
          focusInMiniGrid: {},
          focusInList: {},
          focusInSimpleList: {},
          loadingData: true
        });

        var formattedConfigName = ('saleEvents-' + $stateParams.param1).replace(/-undefined/g, '');
        vm.configName = $stateParams.param1 ? $tools.toCamelCase(formattedConfigName, '-') : 'saleEvents';

        vm.loadList = function(loadMoreData) {
          vm.viewConfig.stopScrollEvent();
          vm.viewConfig = $views.setViewDefinition({
            loadingData: true
          });
          if (!loadMoreData) {
            vm.viewConfig = $views.setViewDefinition({
              selectAll: false,
              selectMode: false
            });
            if (vm.viewConfig.data && Object.keys(vm.viewConfig.data).length) {
              vm.viewConfig.data.splice(0);
            }
          }

          var params = queryParamsFactory.setParams();
          // If it is a submenu we need to get the filter and the current date
          if ($stateParams && saleEventsMenuConfiguration.items['menu.saleEvents.' + $stateParams.param1]) {
            params.$filter = saleEventsMenuConfiguration.items['menu.saleEvents.' + $stateParams.param1].filter;
          }

          var saleEventsEntity = $api.createEntityObject({
            entityName: vm.dataOriginEntity,
            params: params
          });
          $api.getEntity(saleEventsEntity, function(success) {
            if (loadMoreData) {
              queryParamsFactory.setNextLastPage();
              vm.viewConfig.data = vm.viewConfig.data.concat(success.data);
            } else {
              vm.viewConfig.data = success.data;
            }
            count.setCounter(success._cursor);

            vm.viewConfig = $views.setViewDefinition({
              loadingData: false
            });
            var cursor = success._cursor;
            if (cursor.totalFiltered > cursor.top) {
              vm.viewConfig.startScrollEvent();
            }

            if (vm.viewConfig.type === $c.LIST_VIEW) {
              vm.viewConfig.focusInList.switchSelectMode(false);
            } else if (vm.viewConfig.type === $c.GRID_VIEW) {
              vm.viewConfig.focusInGrid.switchSelectMode(false);
            } else if (vm.viewConfig.type === $c.GRID_MINI_VIEW) {
              vm.viewConfig.focusInMiniGrid.switchSelectMode(false);
            } else if (vm.viewConfig.type === $c.SIMPLE_LIST_VIEW) {
              vm.viewConfig.focusInSimpleList.switchSelectMode(false);
            }
          });
        };

        vm.viewConfig = $views.setViewDefinition({
          loadData: vm.loadList
        });

        vm.entityContract = {};
        vm.entity = 'saleevents';

      }
    ]);
})();
