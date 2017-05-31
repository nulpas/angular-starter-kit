(function() {
  'use strict';
  angular.module('app.layout.profilemenu')
  .controller('profileMenuController', [
    'login',
    '$alert',
    function(login, $alert) {
      var vm = this;
      var userInfo = login.getUserInfo();
      if (!userInfo) {
        return;
      }
      vm.translations = login.getUserInfo().translation;

      vm.getLabel = function(fieldName) {
        return vm.translations[fieldName] ? vm.translations[fieldName] : fieldName;
      };

      /**
       * @name changeBrand
       * @memberof app.layout.profilemenu.profileMenuController
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
          $alert.info(vm.getLabel(successMessage));
        });
      };
    }
  ]);
})();
