(function() {
  'use strict';

  angular.module('app.settings.remarketing.channels')
    .controller('channelsController', [
      'login',
      function(login) {
        var vm = this;
        vm.dataOriginEntity = login.getUserInfo().mainMenus['menu.remarketing']
          .items['menu.remarketingSalesChannelConfiguration'].entity;
        vm.dataStructureName = 'salesChannelsConfigurationView';
      }
    ]);
})();
