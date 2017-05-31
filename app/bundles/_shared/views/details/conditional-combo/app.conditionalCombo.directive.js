(function() {
  'use strict';

  angular.module('app._shared.views.details.conditional-combo')
    .directive('conditionalCombo', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/details/conditional-combo/app.conditional-combo.view.tpl.html',
          scope: {
            'conditionalField': '=',
            'containerId': '=',
            'conditionalFieldId': '=',
            'conditionalFieldLabel': '=',
            'language': '=',
            'detailData': '=',
            'editDetails': '='
          }
        };
      }
    ]);
})();
