(function() {
  'use strict';

  angular.module('app.layout.breadcrumb')
    .directive('breadcrumb', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/layout/breadcrumb/app.breadcrumb.view.tpl.html',
          controller: 'breadcrumbController as breadcrumb'
        };
      }
    ]);
})();
