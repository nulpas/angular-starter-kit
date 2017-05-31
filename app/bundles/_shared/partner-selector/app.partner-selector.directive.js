(function() {
  'use strict';

  angular.module('app._shared.partner-selector')
    .directive('partnerSelector', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/partner-selector/app.partner-selector.view.tpl.html',
          controller: 'partnerSelectorController as partnerSelector',
          bindToController: {
            selectedPartner: '=',
            dataLoad: '='
          }
        };
      }
    ]);
})();

