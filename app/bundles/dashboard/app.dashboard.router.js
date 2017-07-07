(function() {
  'use strict';

  angular
    .module('app.layout.dashboard')
    /**
     * @namespace dashboardConfig
     * @memberof app.layout.dashboard
     *
     * @requires $stateProvider
     *
     * @description
     * Page Dashboard router.
     */
    .config(dashboardConfig);

  dashboardConfig.$inject = ['$stateProvider'];

  function dashboardConfig($stateProvider) {
    $stateProvider
      .state('app.dashboard', {
        url: '/dashboard',
        views: {
          'content@app': {
            templateUrl: 'bundles/dashboard/app.dashboard.view.tpl.html',
            controller: 'dashboardController',
            controllerAs: 'dashboard'
          }
        }
      });
  }
})();
