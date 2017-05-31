(function() {
  'use strict';

  angular.module('app.users')
  /**
   * @namespace usersController
   * @memberof app.users
   *
   * @requires $api
   * @requires $views
   * @requires queryParamsFactory
   * @requires login
   * @requires $state
   * @requires menuItem
   * @requires count
   * @requires $tools
   *
   * @description
   * Controller to handle the users view.
   */
    .controller('usersController', [
      '$api',
      '$views',
      'queryParamsFactory',
      'login',
      '$state',
      'menuItem',
      'count',
      '$tools',
      function($api, $views, queryParamsFactory, login, $state, menuItem, count, $tools) {
        var vm = this;
        var $c = $tools.$;
        vm.entity = menuItem.entity;
        vm.listData = null;
        vm._shared = $c;
        vm.viewConfig = $views.setViewDefinition({
          loadingData: true
        });

        vm.configName = $tools.toCamelCase(
            ($state.params.param1 + '-' + $state.params.param2 + '-' + $state.params.param3)
              .replace(/-undefined/g, ''),
            '-');

        /**
         * @name app.users.usersController#loadList
         * @memberof app.users.usersController
         *
         * @param {boolean} loadMoreData indicates if the data should be replaced or added
         *
         * @description
         * This method loads the data for the list
         */
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

          var menuItemEntity = $api.createEntityObject({
            entityName: menuItem.entity,
            params: params
          });
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
          });
        };

        vm.viewConfig = $views.setViewDefinition({
          loadData: vm.loadList
        });
      }
    ]);
})();
