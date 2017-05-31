(function() {
  'use strict';

  angular
    .module('app.layout.menu')
    /**
     * @name MenuController
     * @memberof app.layout
     *
     * @description
     * Controller for handle menu components.
     */
    .controller('MenuController', ['login', '$alert', MenuController]);

  function MenuController(login, $alert) {
    var vm = this;

    /**
     * @name toogleSelect
     * @memberof app.layout.MenuController
     *
     * @description
     * Function that switch on/off a flag that hides/shows the submenu.
     */
    vm.toggleSelect = function(item, event) {
      item.showSubItem = !item.showSubItem;
      event.stopPropagation();

      angular.forEach(vm.navigationMenu, function(element) {
        if (element !== item) {
          element.showSubItem = false;
        }
      });
    };

    /**
     * @name changeBrand
     * @memberof app.layout.menu.MenuController
     *
     * @description
     * Try to log in as a new brand without logout
     *
     * @param {String} newBrand
     */
    vm.changeBrand = function(newBrand) {
      login.changeBrand(newBrand, function() {
        vm.initData();
        var successMessage = 'SUCCESS_MESSAGE_BRAND_SWITCHED';
        $alert.info(vm.translations[successMessage] ? vm.translations[successMessage] : successMessage);
      });
    };
  }
})();
