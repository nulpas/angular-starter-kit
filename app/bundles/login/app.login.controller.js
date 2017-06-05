(function() {
  'use strict';

  angular
    .module('app.login')
    /**
     * @namespace loginController
     * @memberof app.login
     *
     * @requires $state
     *
     * @description
     * Main controller for Login Module.
     */
    .controller('loginController', loginController);

  loginController.$inject = ['$state'];

  function loginController($state) {
    /* jshint validthis: true */
    var vm = this;
    vm.user = null;
    vm.pass = null;
    vm.storeFlag = null;
    vm.doLogin = doLogin;

    /**
     * @name doLogin
     * @memberof app.login.loginController
     *
     * @description
     * Mock for activation login functionality. This function must be defined into a service.
     */
    function doLogin() {
      $state.go('app.home');
      console.log(vm.user);
    }
  }
})();
