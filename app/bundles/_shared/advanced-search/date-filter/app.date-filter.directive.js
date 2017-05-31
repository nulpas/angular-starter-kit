(function() {
  'use strict';

  angular.module('app._shared.advanced-search.date-filter')
    .directive('dateFilter', [
      function() {
        return {
          restrict: 'E',
          scope: {
            data: '='
          },
          templateUrl: 'bundles/_shared/advanced-search/date-filter/app.date-filter.view.tpl.html',
          controller: 'dateFilterController',
          controllerAs: 'dateFilter',
          bindToController: {
            add: '&',
            remove: '&',
            control: '=',
            save: '='
          }
        };
      }
    ]);
})();
