(function() {
  'use strict';

  angular.module('app._shared.views.list')
    .directive('listView', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/list/app.list.view.tpl.html',
          controller: 'listController',
          controllerAs: 'list',
          bindToController: {
            load: '&',
            scrollContainer: '=',
            controlList: '=',
            configName: '=',
            entity: '='
          },
          scope: {
            listView: '=',
            draggable: '=',
            control: '=',
            bpmn: '=',
            totalResults: '='
          },
          link: function(scope, element) {
            scope.$on('$destroy', function() {
              return scope.list.stopWatchingLoadOnScroll();
            });

            element.on('$destroy', function() {
              scope.$destroy();
            });
          }
        };
      }
    ]);
})();
