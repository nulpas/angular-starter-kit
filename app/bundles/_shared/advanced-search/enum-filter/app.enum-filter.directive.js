(function() {
  'use strict';

  angular.module('app._shared.advanced-search.enum-filter')
    .directive('enumFilter', [
      function() {
        return {
          restrict: 'E',
          templateUrl: 'bundles/_shared/advanced-search/enum-filter/app.enum-filter.view.tpl.html',
          controller: 'enumFilterController',
          controllerAs: 'enumFilter',
          bindToController: {
            add: '&',
            remove: '&',
            control: '=',
            data: '=',
            save: '='
          }
        };
      }
    ]);
})();
