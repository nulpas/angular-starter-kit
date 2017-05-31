(function() {
  'use strict';

  angular.module('app.packages').controller('packagesController', [
    '$api',
    '$views',
    'queryParamsFactory',
    'login',
    'count',
    function($api, $views, queryParamsFactory, login, count) {
      var vm = this;
      var $c = $api.$;
      vm.dataOriginEntity = login.getUserInfo().mainMenus['menu.packages'].entity;
      vm.loadList = {};
      vm.listData = null;
      vm._shared = $c;
      vm.viewConfig = $views.setViewDefinition({
        focusInGrid: {},
        focusInMiniGrid: {},
        focusInList: {},
        focusInSimpleList: {},
        loadingData: true
      });

      /**
       * @name loadList
       * @memberof app.packages.controller
       *
       * @description
       * Loads the list view with packages according to the user configuration
       *
       * @param {boolean} loadMoreData
         */
      vm.loadList = function(loadMoreData) {
        var viewFocusFunctions = {};
        viewFocusFunctions[$c.LIST_VIEW] = vm.viewConfig.focusInList.switchSelectMode;
        viewFocusFunctions[$c.GRID_VIEW] = vm.viewConfig.focusInGrid.switchSelectMode;
        viewFocusFunctions[$c.GRID_MINI_VIEW] = vm.viewConfig.focusInMiniGrid.switchSelectMode;
        viewFocusFunctions[$c.SIMPLE_LIST_VIEW] = vm.viewConfig.focusInSimpleList.switchSelectMode;

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

        var packagesEntity = $api.createEntityObject({
          entityName: vm.dataOriginEntity,
          params: queryParamsFactory.setParams()
        });
        $api.getEntity(packagesEntity, function(success) {
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
          viewFocusFunctions[vm.viewConfig.type](false);
        });
      };

      vm.viewConfig = $views.setViewDefinition({
        loadData: vm.loadList
      });
    }
  ]);
})();
