(function() {
  'use strict';

  angular.module('app.settings.ims-sales.ims-sales-eligibility')
    .controller('imsSalesEligibilityController', [
      'login',
      function(login) {
        var vm = this;
        vm.dataOriginEntity = login.getUserInfo()
          .profileMenus['menu.settings']
          .items['menu.imsSales']
          .items['menu.imsSalesEligibility']
          .entity;
        vm.dataStructureName = 'imsSalesEligibilityConfigurationView';
      }
    ]);
})();
