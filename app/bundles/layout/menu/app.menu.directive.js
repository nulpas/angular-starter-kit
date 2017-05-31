(function() {
  'use strict';

  angular
    .module('app.layout.menu')
    /**
     * @namespace navigationMenu
     * @memberof app.layout
     *
     * @description
     * Directive definition main navigation menu.
     */
    .directive('navigationMenu', navigationMenu);

  function navigationMenu() {
    return {
      restrict: 'A',
      scope: {
        options: '=',
        resetMenu: '&',
        userData: '='
      },
      bindToController: {
        navigationMenu: '=',
        translations: '=',
        initData: '='
      },
      controller: 'MenuController',
      controllerAs: 'menu',
      templateUrl: 'bundles/layout/menu/app.menu.view.tpl.html'
    };
  }
}());
