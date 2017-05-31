(function() {
  'use strict';

  angular.module('app._shared.views.grid')
    .directive('gridView', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/grid/app.grid.view.tpl.html',
          controller: 'gridController',
          controllerAs: 'grid',
          bindToController: {
            load: '&',
            scrollContainer: '=',
            controlGrid: '=',
            configName: '=',
            entity: '='
          },
          scope: {
            gridView: '=',
            cols: '=',
            control: '=',
            totalResults: '='
          },
          link: function(scope, element) {
            scope.$on('$destroy', function() {
              return scope.grid.stopWatchingLoadOnScroll();
            });

            element.on('$destroy', function() {
              scope.$destroy();
            });
          }
        };
      }
    ]);
})();
