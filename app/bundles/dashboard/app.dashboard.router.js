(function() {
  'use strict';

  angular.module('app.dashboard')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.dashboard', {
            url: '/dashboard',
            views: {
              'content@app': {
                templateUrl: 'bundles/dashboard/app.dashboard.view.tpl.html',
                controller: 'dashboardController as dashboard'
              }
            }
          });
      }
    ]);
})();
