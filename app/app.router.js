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
            },
            resolve: {
              auth: [
                '$stateParams',
                'login',
                '$router',
                '$rootScope',
                function($stateParams, login, $router, $rootScope) {
                  //TODO: Delete this
                  if ($rootScope.packageDetailsData) {
                    delete $rootScope.packageDetailsData;
                  }
                  if (login.isAuthorized()) {
                    login.loadSession();
                    return login.getUserInfo().translationModules;
                  } else {
                    $router.resolveStateGo('login');
                  }
                  return false;
                }
              ]
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
