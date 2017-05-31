(function() {
  'use strict';

  angular
    /**
     * @namespace layout
     * @memberof app
     *
     * @description
     * Definition of module "layout".
     */
    .module('app.layout', [
      //# App Modules
      'app.layout.breadcrumb',
      'app.layout.menu',
      'app.layout.profilemenu',
      //# App Modules for Content
      'app.dashboard',
      'app.vehicles',
      'app.settings',
      'app.log',
      'app.layout.sale-events',
      'app.packages',
      'app.users',
      'app.roles'
    ]);
})();
