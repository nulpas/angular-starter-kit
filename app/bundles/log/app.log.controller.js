(function() {
  'use strict';

  angular.module('app.log')
    .controller('logController', [
      '$api',
      '$stateParams',
      '$views',
      'queryParamsFactory',
      'menuItem',
      '$tools',
      'count',
      '$state',
      function($api, $stateParams, $views, queryParamsFactory, menuItem, $tools, count, $state) {
        var vm = this;
        vm.importData = null;
        // This is ugly but needed for retrocompatibility
        vm.entity = menuItem.entity ? menuItem.entity :
          ($stateParams.param3 === 'audits' ? $stateParams.param3 : $stateParams.param1);
        var $c = $tools.$;
        vm._shared = $c;
        vm.configFiles = configFiles;
        vm.viewConfig = $views.setViewDefinition({
          focusInGrid: {},
          focusInMiniGrid: {},
          focusInList: {},
          focusInSimpleList: {}
        });

        var _initConfiguration = function() {
          //If we are viewing success imports logs, the 'errors' filter must be deleted.
          if ($state.params.param3 === 'success') {
            vm.filterFieldsToRemove = [{ name: 'errors' }];
          }
        };

        vm.loadList = function(loadMoreData) {
          if (typeof vm.viewConfig.stopScrollEvent === 'function') {
            vm.viewConfig.stopScrollEvent();
          }
          vm.viewConfig = $views.setViewDefinition({
            loadingData: true
          });
          if (!loadMoreData) {
            vm.viewConfig = $views.setViewDefinition({
              selectAll: false,
              selectMode: false
            });
            if (vm.importData && Object.keys(vm.viewConfig.data).length) {
              vm.importData.splice(0);
            }
          } else {
            queryParamsFactory.setNextLastPage();
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

          var apiUrlParams = [];
          angular.forEach($stateParams, function(_stateparam) {
            apiUrlParams.push(_stateparam);
          });
          var entity = $api.createEntityObject({
            entityName: menuItem.entity || apiUrlParams.join('/'),
            params: params
          });
          $api.getEntity(entity, function(success) {
            if (loadMoreData) {
              vm.importData = vm.importData.concat(success.data);
            } else if (success.data) {
              var importData = success.data;
              var filterImportStatus =  function(log) {
                return $stateParams.filter ? log.importStatus.toLowerCase() === $stateParams.filter : true;
              };
              vm.importData = importData.length ? importData.filter(filterImportStatus) : importData;
            }
            count.setCounter(success._cursor);

            vm.viewConfig = $views.setViewDefinition({
              loadingData: false
            });
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
        /**
         * Returns a certain configuration depending on the type of view, importLogs or an audit.
         * @param viewType
         * @returns {string}
         */
        function configFiles(viewType) {
          var configName = $stateParams.param3 === 'audits' ?
          $state.params.param1 + '-' + $state.params.param3
            : $state.params.param1 + '-' + $state.params.param2 + '-' + $state.params.param3;
          var entityCC = $tools.toCamelCase(configName.replace(/-undefined/g, ''), '-');
          return $tools.toCamelCase(entityCC + '-' + viewType, '-') + 'View';
        }

        _initConfiguration();
      }
    ]);
})();
