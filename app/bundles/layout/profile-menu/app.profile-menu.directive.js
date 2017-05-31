(function() {
  'use strict';
  angular.module('app.layout.profilemenu')
  .directive('profileMenu', function() {

    return {
      restrict: 'A',
      scope: {
        profileMenu: '=',
        userData: '='
      },
      bindToController: {
        initData: '='
      },
      templateUrl: 'bundles/layout/profile-menu/app.profile-menu.view.tpl.html',
      controller: 'profileMenuController',
      controllerAs: 'profile'

    };
  });
}());
