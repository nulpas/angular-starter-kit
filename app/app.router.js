(function() {
  'use strict';

  angular.module('app')
    .config([
      '$stateProvider',
      '$urlMatcherFactoryProvider',
      function($stateProvider, $urlMatcherFactoryProvider) {
        $urlMatcherFactoryProvider.strictMode(false);
        $stateProvider
          .state('login', {
            url: '/login',
            views: {
              root: {
                templateUrl: 'bundles/login/app.login.view.tpl.html',
                controller: 'loginController as login'
              }
            }
          })

          .state('app', {
            abstract: true,
            views: {
              root: {
                templateUrl: 'bundles/layout/app.layout.view.tpl.html',
                controller: 'layoutController as layout'
              }
            }
          })

          .state('app.home', {
            url: '',
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
