(function() {
  'use strict';

  angular.module('app.settings.pricing.provider-price-set-up')
    .controller('providerPriceSetUpController', [
      'login',
      function(login) {
        var vm = this;
        vm.dataOriginEntity = login
          .getUserInfo()
          .mainMenus['menu.pricing']
          .items['menu.providerPriceSetUp']
          .entity;
        vm.dataStructureName = 'valuationProviderConfigurationView';
      }
    ]);
})();
