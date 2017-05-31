(function() {
  'use strict';

  angular
    /**
     * @namespace screens
     * @memberof app._core
     *
     * @description
     * Definition of the "screens" module for application views.
     */
    .module('app._core.screens', [
      'app._core.screens.file',
      'app._core.screens.table'
    ]);
})();
