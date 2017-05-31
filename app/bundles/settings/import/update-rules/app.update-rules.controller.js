(function() {
  'use strict';

  angular.module('app.settings.import.update-rules')
    .controller('updateRulesController', [
      'login',
      function(login) {
        var vm = this;
        vm.dataOriginEntity = login.getUserInfo().mainMenus['menu.import'].items['menu.updateRules'].entity;
        vm.dataStructureName = 'updateRulesConfigurationView';
      }
    ]);
})();
