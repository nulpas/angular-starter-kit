(function() {
  'use strict';

  angular.module('app._shared.editable-field')
    .directive('editableField', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/editable-field/app.editable-field.view.tpl.html',
          controller: 'editableFieldController as editableField',
          bindToController: {
            entity: '<entity',
            field: '=',
            fieldId: '<fieldId',
            fieldModel: '=',
            rowField: '=',
            viewModel: '='
          }
        };
      }
    ]);
})();
