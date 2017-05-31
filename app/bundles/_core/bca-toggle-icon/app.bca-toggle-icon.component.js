(function() {
  'use strict';

  angular
    .module('app._core.bca-toggle-icon')
    /**
     * @namespace bcaIconButton
     * @memberof app._core.bca-toggle-icon
     *
     * @description
     * Directive definition for BCA Toggle Icon component.
     */
    .component('bcaToggleIcon', {
      bindings: {
        buttonIcon: '@',
        uniqueName: '<',
        text: '<',
        checked: '<',
        disabled: '<',
        onClick: '&'
      },
      controller: function() {},
      controllerAs: 'ctrl',
      templateUrl: 'bundles/_core/bca-toggle-icon/app.bca-toggle-icon.view.tpl.html'
    });
})();
