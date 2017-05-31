(function() {
  'use strict';

  angular.module('app._shared.advanced-search.num-filter')
    .directive('numFilter', [
      function() {
        return {
          restrict: 'E',
          scope: {
            data: '='
          },
          templateUrl: 'bundles/_shared/advanced-search/num-filter/app.num-filter.view.tpl.html',
          controller: 'numFilterController',
          controllerAs: 'numFilter',
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
