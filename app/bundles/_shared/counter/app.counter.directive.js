(function() {
  'use strict';

  angular.module('app._shared.counter')
    .directive('counter', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/counter/app.count.view.tpl.html',
          controller: 'counterController as counter'
        };
      }
    ]);
})();
