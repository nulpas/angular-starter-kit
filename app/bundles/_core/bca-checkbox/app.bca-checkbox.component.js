(function() {
  'use strict';

  angular
    .module('app._core.bca-checkbox')
    /**
     * @namespace bcaCheckbox
     * @memberof app._core.bca-checkbox
     *
     * @description
     * Directive definition for BCA Checkbox functionality.
     */
    .component('bcaCheckbox', {
      bindings: {
        text: '<',
        checked: '<',
        disabled: '<',
        onClick: '&'
      },
      controller: function() {},
      controllerAs: 'ctrl',
      templateUrl: 'bundles/_core/bca-checkbox/app.bca-checkbox.view.tpl.html'
    });
})();
