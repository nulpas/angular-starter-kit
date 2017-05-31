(function() {
  'use strict';

  angular.module('app._shared.advanced-search')
    .directive('advancedSearch', [
      function() {
        return {
          restrict: 'A',
          scope: {
            //fields: '='
          },
          templateUrl: 'bundles/_shared/advanced-search/app.advanced-search.view.tpl.html',
          controller: 'advancedSearchController',
          controllerAs: 'advancedSearch',
          bindToController: {
            //action: '&'
          }
        };
      }
    ]);
})();
