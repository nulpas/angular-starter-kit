(function() {
  'use strict';

  angular.module('app._shared.advanced-search.text-filter')
    .directive('textFilter', [
      function() {
        return {
          restrict: 'E',
          scope: {
            data: '='
          },
          templateUrl: 'bundles/_shared/advanced-search/text-filter/app.text-filter.view.tpl.html',
          controller: 'textFilterController',
          controllerAs: 'textFilter',
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
