(function() {
  'use strict';

  angular.module('app._shared.views.simpleList')
    .directive('simpleListView', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/simple-list/app.simple-list.view.tpl.html',
          controller: 'simpleListController',
          controllerAs: 'table',
          bindToController: {
            load: '&',
            scrollContainer: '=',
            controlSimpleList: '=',
            configName: '=',
            entity: '=',
            simpleListView: '=',
            isPartialView: '=',
            customFields: '=',
            fieldsToRemove: '=',
            internalListReference: '=',
            exportData: '='
          },
          scope: {
            control: '=',
            totalResults: '='
          },
          link: function(scope, element) {
            scope.$on('$destroy', function() {
              return scope.table.stopWatchingLoadOnScroll();
            });

            element.on('$destroy', function() {
              scope.$destroy();
            });
          }
        };
      }
    ]);
})();
