(function() {
  'use strict';

  angular
    /**
     * @namespace app
     *
     * @description
     * Definition of module app. General scope for application.
     */
    .module('app', [
      //# App Framework Core
      'afs.core',
      //# App Modules
      'app.templateCache',
      'app.layout',
      'app.login'
    ]);
})();
