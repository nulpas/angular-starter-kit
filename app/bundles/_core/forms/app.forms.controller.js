(function() {
  'use strict';

  angular
    .module('app._core.forms')
    /**
     * @namespace AutoFormsController
     * @memberof app._core.forms
     * @name AutoFormsController
     * @alias f
     *
     * @requires forms
     *
     * @description
     * Controller for handle forms auto-generation.
     */
    .controller('AutoFormsController', AutoFormsController);

  AutoFormsController.$inject = ['forms'];

  function AutoFormsController(forms) {
    var vm = this;
    var _formRequest = forms.assembleFormRequest(vm.bcaAutoForm, vm.bcaFormGroup, vm.bcaFormElement);
    vm.$ = forms.$;
    vm.element = forms.getElementSettings(_formRequest);
    vm.logicMandatory = forms.getLogicMandatory(vm.bcaFormElement, vm.bcaLogicMandatory);
    console.log(vm.element);
  }
})();
