(function() {
  'use strict';

  angular.module('app._shared.language.fab')
    .directive('appLanguageFab', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/language/fab/app.fab.view.tpl.html',
          scope: {
            login: '='
          }
        };
      }
    ]);
})();
