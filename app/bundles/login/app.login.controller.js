(function() {
  'use strict';

  angular
    .module('app.login')
    /**
     * @namespace LoginController
     * @memberof app.login
     *
     * @requires $state
     *
     * @description
     * Main controller for Login Module.
     */
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$state'];

  function LoginController($state) {
    /* jshint validthis: true */
    var vm = this;
    vm.user = null;
    vm.pass = null;
    vm.storeFlag = null;
    vm.doLogin = doLogin;

    /**
     * @name doLogin
     * @memberof app.login.LoginController
     *
     * @description
     * Mock for activation login functionality.
     * This function must be defined into a service.
     */
    function doLogin() {
      $state.go('app.home');
      console.log(vm.user);
    }
  }
})();
