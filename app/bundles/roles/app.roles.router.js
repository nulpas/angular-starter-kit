(function() {
  'use strict';

  var resolveMenu = [
    '$stateParams',
    'login',
    function($stateParams, login) {
      var menu = login.getUserInfo().mainMenus;
      var searchOption = {};
      if ($stateParams.param1) {
        var logMenuKey = 'menu.' + $stateParams.param1;
        searchOption = menu[logMenuKey];
      } else {
        searchOption = {
          entity: 'roles',
          filter: '',
          items: {},
          label: 'roles',
          param: {},
          state: 'roles'
        };
      }
      return searchOption;
    }
  ];

  angular.module('app.roles')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('app.roles', {
            url: '/roles',
            views: {
              'content@app': {
                templateUrl: 'bundles/roles/app.roles.view.tpl.html',
                controller: 'rolesController as roles'
              }
            },
            resolve: {
              menuItem: resolveMenu,
              viewConfig: [
                '$tools',
                '$views',
                function($tools, $views) {
                  return $views.setBoundProperty('type', $tools.$.SIMPLE_LIST_VIEW);
                }
              ]
            }
          });
      }
    ]);
})();
