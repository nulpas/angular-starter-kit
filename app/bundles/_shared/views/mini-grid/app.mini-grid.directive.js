(function() {
  'use strict';

  angular.module('app._shared.views.mini-grid')
    .directive('miniGridView', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/mini-grid/app.mini-grid.view.tpl.html',
          controller: 'miniGridController',
          controllerAs: 'small',
          bindToController: {
            load: '&',
            scrollContainer: '=',
            controlMiniGrid: '=',
            entity: '=',
            configName: '='
          },
          scope: {
            miniGridView: '=',
            cols: '=',
            control: '=',
            totalResults: '='
          },
          link: function(scope, element) {
            scope.$on('$destroy', function() {
              return scope.small.stopWatchingLoadOnScroll();
            });

            element.on('$destroy', function() {
              scope.$destroy();
            });
          }
        };
      }
    ]);
})();
