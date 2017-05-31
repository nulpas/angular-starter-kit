(function() {
  'use strict';

  angular
    .module('app._core.forms.auto-complete')
    /**
     * @namespace AutoCompleteFieldController
     * @memberof app._core.forms.auto-complete
     * @name AutoCompleteFieldController
     * @alias ac
     *
     * @requires $tools
     * @requires forms
     *
     * @description
     * Controller for handle auto-complete input form elements.
     */
    .controller('AutoCompleteFieldController', AutoCompleteFieldController);

  AutoCompleteFieldController.$inject = ['$tools', 'forms'];

  function AutoCompleteFieldController($tools, forms) {
    var $ = forms.$;
    var bcaId = (this.bcaId) ? this.bcaId + '_' : '' ;
    var vm = this;
    vm.element = this.bcaAutoComplete;
    vm.enum = null;
    vm.id = bcaId + this.bcaAutoComplete.label.split('/').join('_');
    vm.inputModel = '';

    getEnum();

    function getEnum() {
      if (vm.element.format === $.FORMAT_API_CALL) {
        vm.element.enum.then(function(success) {
          if (angular.isArray(success.data) && angular.isObject(success.data[0])) {
            var elementLabelDoted = vm.element.label.split('/').slice(1).join('.');
            vm.enum = angular.copy(success.data).map(function(value) {
              return $tools.getValueFromDotedKey(value, elementLabelDoted);
            });
          } else {
            vm.enum = success.data;
          }
        });
      } else {
        vm.enum = Object.keys(vm.element.enum).map(function(value) {
          return vm.element.enum[value];
        });
      }
    }
  }
})();
