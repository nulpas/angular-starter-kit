(function() {
  'use strict';

  angular.module('app._shared.advanced-search.boolean-filter')
    .directive('booleanFilter', [
      function() {
        return {
          restrict: 'E',
          scope: {
            data: '='
          },
          templateUrl: 'bundles/_shared/advanced-search/boolean-filter/app.boolean-filter.view.tpl.html',
          controller: 'booleanFilterController',
          controllerAs: 'booleanFilter',
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
