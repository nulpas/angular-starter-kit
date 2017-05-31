(function() {
  'use strict';

  angular.module('app.settings.pricing.eligibility-criteria')
    .controller('eligibilityCriteriaController', [
      'login',
      function(login) {
        var vm = this;
        vm.dataOriginEntity = login.getUserInfo()
          .profileMenus['menu.settings']
          .items['menu.pricing']
          .items['menu.pricingEligibilityCriteria']
          .entity;
        vm.dataStructureName = 'eligibilityCriteriaConfigurationView';
      }
    ]);
})();
