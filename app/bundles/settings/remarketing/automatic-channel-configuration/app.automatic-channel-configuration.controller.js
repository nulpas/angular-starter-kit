(function() {
  'use strict';

  angular.module('app.settings.remarketing.automatic-channel-configuration')
    .controller('automaticChannelConfigurationController', [
      'login',
      function(login) {
        var vm = this;
        vm.dataOriginEntity = login
          .getUserInfo()
          .mainMenus['menu.remarketing']
          .items['menu.remarketingAutomaticChannelAllocation']
          .entity;
        vm.dataStructureName = 'automaticChannelAllocationConfigurationView';
      }
    ]);
})();
