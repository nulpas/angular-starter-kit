(function() {
  'use strict';

  angular.module('app.login')
    .controller('loginController', [
      'languageFactory',
      '$api',
      'login',
      '$set',
      function(languageFactory, $api, login, $set) {
        login.logout();

        var vm = this;
        vm.user = null;
        vm.pass = null;
        vm.storeFlag = null;
        vm.set = $set.getSetting('login');
        vm.availableLanguages = languageFactory.getAvailableLanguages();
        vm.language = languageFactory.getActualLocale();

        vm.changeLanguage = function(locale) {
          vm.language = languageFactory.setActualLocale(locale);
        };

        vm.doLogin = function() {
          login.login({
            username: vm.user,
            password: vm.pass,
            expiration: vm.storeFlag
          });
        };
      }
    ]);
})();
