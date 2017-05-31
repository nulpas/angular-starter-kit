(function() {
  'use strict';

  angular
    .module('app._core.bca-counter')
    /**
     * @namespace bcaCounter
     * @memberof app._core.bca-counter
     *
     * @description
     * Directive definition for counter element.
     */
    .component('bcaCounter', {
      bindings: {
        type: '@',
        visible: '<',
        actualCount: '<',
        maxCount: '<',
        text: '<'
      },
      controller: function() {},
      controllerAs: 'ctrl',
      templateUrl: 'bundles/_core/bca-counter/app.bca-counter.view.tpl.html'
    });
})();
