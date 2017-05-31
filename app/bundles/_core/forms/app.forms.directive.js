(function() {
  'use strict';

  angular
    .module('app._core.forms')
    /**
     * @namespace bcaAutoForm
     * @memberof app._core.forms
     *
     * @description
     * Directive definition for forms elements auto-generation.
     */
    .directive('bcaAutoForm', bcaAutoForm);

  function bcaAutoForm() {
    return {
      restrict: 'A',
      templateUrl: 'bundles/_core/forms/app.forms.view.tpl.html',
      controller: 'AutoFormsController',
      controllerAs: 'f',
      bindToController: {
        bcaAutoForm: '=',
        bcaFormGroup: '=',
        bcaFormElement: '=',
        bcaLogicMandatory: '=',
        bcaId: '='
      },
      scope: true,
      link: link
    };

    function link(scope, element) {
      element.on('$destroy', function() {
        scope.$destroy();
      });
    }
  }
})();
