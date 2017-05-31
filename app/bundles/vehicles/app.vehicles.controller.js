(function() {
  'use strict';

  angular.module('app.vehicles')
    .controller('vehiclesController', [
      '$api',
      '$views',
      'queryParamsFactory',
      'login',
      '$state',
      'menuItem',
      'count',
      '$tools',
      '$translate',
      function($api, $views, queryParamsFactory, login, $state, menuItem, count, $tools, $translate) {
        var vm = this;
        var $c = $tools.$;
        vm.entity = menuItem.entity;
        vm.listData = null;
        vm._shared = $c;
        vm.viewConfig = $views.setViewDefinition({
          focusInGrid: {},
          focusInMiniGrid: {},
          focusInList: {},
          focusInSimpleList: {},
          loadingData: true
        });

        vm.bpmn = {
          schema: login.getUserInfo().partner.processes,
          isProcess: ($state.current.name === 'app.vehicles.process'),
          isModule: ($state.current.name === 'app.vehicles.process.module'),
          isState: ($state.current.name === 'app.vehicles.process.module.state'),
          params: $state.params
        };

        vm.configName = $state.params.param1 ?
          $tools.toCamelCase(
            ($state.params.param1 + '-' + $state.params.param2 + '-' + $state.params.param3)
              .replace(/-undefined/g, ''),
            '-') :
          'vehicles';

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
          } else {
            queryParamsFactory.setNextLastPage();
          }

          if (vm.viewConfig.customFilter) {
            menuItem.filter = vm.viewConfig.customFilter;
            vm.viewConfig.customFilter = '';
          }

          var params = queryParamsFactory.setParams();
          var additionalParams = (menuItem.filter) ? { $filter: menuItem.filter } : {} ;
          if (typeof params.$filter !== 'undefined') {
            var txtMenuItemFilter = '';
            if (menuItem.filter && menuItem.filter !== '') {
              txtMenuItemFilter = menuItem.filter + ' and ';
            }
            params.$filter = txtMenuItemFilter + params.$filter;
          } else {
            params = angular.extend({}, params, additionalParams);
          }

          console.log('############################################');
          console.log($translate.getTranslations());
          console.log('############################################');

          var menuItemEntity = $api.createEntityObject({
            entityName: menuItem.entity,
            params: params
          });
          $views.setBoundProperty('detailsCallParameters', menuItemEntity);
          $views.setBoundProperty('detailsCallMenu', menuItem);
          $api.getEntity(menuItemEntity, function(success) {
            vm.viewConfig.data = (loadMoreData) ? vm.viewConfig.data.concat(success.data) : success.data ;
            count.setCounter(success._cursor);
            $views.setViewDefinition({ totalElements: count.getTotal() });

            vm.viewConfig = $views.setViewDefinition({
              loadingData: false
            });
            /**
             * @type {Object}
             * @property {Number} totalFiltered
             */
            var cursor = success._cursor;
            if (cursor.totalFiltered > cursor.skip + cursor.top) {
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
      }
    ]);
})();
