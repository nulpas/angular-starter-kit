(function() {
  'use strict';

  angular.module('app._shared.partner-selector')
    .controller('partnerSelectorController', [
      '$api',
      function($api) {
        var vm = this;
        vm.partner = { 'name': 'Select a partner' };

        var selectorPartnerEntity = $api.createEntityObject({ entityName: 'partners' });
        $api.getEntity(selectorPartnerEntity, function(success) {
          vm.partners = success.data;
        });
      }
    ]);
})();
