(function() {
  'use strict';

  angular.module('app._shared.views.configuration')
    .directive('configurationView', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/configuration/app.configuration.view.tpl.html',
          controller: 'configurationController as configuration',
          bindToController: {
            dataStructureName: '=',
            dataOriginEntity: '='
          }
        };
      }
    ]);
})();
