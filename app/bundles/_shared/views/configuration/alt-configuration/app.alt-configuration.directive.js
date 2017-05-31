(function() {
  'use strict';

  angular.module('app._shared.views.configuration')
    .directive('altConfigurationView', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/configuration/alt-configuration/app.alt-configuration.view.tpl.html',
          controller: 'altConfigurationController as configuration',
          bindToController: {
            dataStructureName: '=',
            dataOriginEntity: '='
          }
        };
      }
    ]);
})();
