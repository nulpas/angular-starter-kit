(function() {
  'use strict';

  angular.module('app._shared.advanced-search')
    .controller('advancedSearchController', [
      '$views',
      'queryParamsFactory',
      'swagger',
      function($views, queryParamsFactory, swagger) {
        var vm = this;
        vm.viewConfig = $views.getViewDefinition();
        vm.moreCollapsed = true;
        vm.searchMore = {
          searchable: {
            standard: false,
            selected: false
          }
        };
        vm.saveConfig = swagger.saveFiltersConfiguration;

        vm.addFilter = function(filter, reload) {
          queryParamsFactory.addFilter(filter);
          if (reload) {
            vm.viewConfig.loadData(false);
          }
        };

        vm.removeFilter = function(filter, reload) {
          queryParamsFactory.removeFilter(filter);
          if (reload) {
            vm.viewConfig.loadData(false);
          }
        };

        vm.goSearch = function() {
          vm.moreCollapsed = true;
          $views.setViewDefinition({ showAdvancedSearch: false });
        };

        vm.resetSearch = function() {
          vm.moreCollapsed = true;
          queryParamsFactory.clearFilters();
          vm.viewConfig.loadData(false);
          vm.goSearch();
        };
      }
    ]);
})();
