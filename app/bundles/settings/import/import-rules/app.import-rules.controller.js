(function() {
  'use strict';

  angular.module('app.settings.import.import-rules')
    .controller('importRulesController', [
      'login',
      function(login) {
        var vm = this;
        vm.dataOriginEntity = login.getUserInfo().mainMenus['menu.import'].items['menu.importRules'].entity;
        vm.dataStructureName = 'importRulesConfigurationView';
      }
    ]);
})();
