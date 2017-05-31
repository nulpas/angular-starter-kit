(function() {
  'use strict';

  angular
    .module('app._core.bca-table-container')
    /**
     * @namespace bcaTableContainer
     * @memberof app._core.bca-table-container
     *
     * @description
     * Component definition for bcaTableContainer component.
     */
    .component('bcaTableContainer', {
      bindings: {
        promiseData: '<',
        active: '<'
      },
      controller: 'BcaTableContainerController',
      controllerAs: 'ctrl',
      templateUrl: 'bundles/_core/bca-table-container/app.bca-table-container.view.tpl.html'
    });
})();
