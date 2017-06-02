(function() {
  'use strict';

  angular.module('app.login')
    .controller('loginController', [
      function() {
        var vm = this;
        vm.user = null;
        vm.pass = null;
        vm.storeFlag = null;

        vm.doLogin = function() {
          console.log({
            username: vm.user,
            password: vm.pass,
            expiration: vm.storeFlag
          });
        };
      }
    ]);
})();
