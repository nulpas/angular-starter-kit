(function() {
  'use strict';

  angular
    /**
     * @namespace _core
     * @memberof app
     *
     * @description
     * Definition of module "_core".
     */
    .module('app._core', [
      'app._core.forms',
      'app._core.screens',
      'app._core.setting',
      'app._core.selectable',
      'app._core.bca-counter',
      'app._core.bca-checkbox',
      'app._core.bca-toggle-icon',
      'app._core.bca-table-container'
    ]);
})();
