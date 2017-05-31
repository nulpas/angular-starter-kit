(function() {
  'use strict';

  var resolveMenu = [
    '$stateParams',
    'login',
    function($stateParams, login) {
      var menu = login.getUserInfo().mainMenus;
      var searchOption = {};
      if ($stateParams.param1) {
        var usersMenuKey = 'menu.' + $stateParams.param1;
        searchOption = menu[usersMenuKey];
      } else {
        searchOption = {
          entity: 'users',
          filter: '',
          items: {},
          label: 'users',
          param: {},
          state: 'users'
        };
      }
      return searchOption;
    }
  ];

  angular.module('app.users')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.users', {
            url: '/users',
            views: {
              'content@app': {
                templateUrl: 'bundles/users/app.users.view.tpl.html',
                controller: 'usersController as users'
              }
            },
            resolve: {
              menuItem: resolveMenu
            }
          })
          .state('app.userDetails', {
            url: '/user-details/:userId',
            params: {
              index: undefined
            },
            views: {
              'content@app': {
                templateUrl: 'bundles/users/details/app.user-details.view.tpl.html',
                controller: 'userDetailsController as userDetails'
              }
            },
            resolve: {
              viewConfig: [
                '$tools',
                '$views',
                function($tools, $views) {
                  return $views.setBoundProperty('type', $tools.$.DETAILS_VIEW);
                }
              ]
            }
          });
      }
    ]);
})();
