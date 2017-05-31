(function() {
  'use strict';

  angular
    .module('app._core.screens.file')
    /**
     * @name FileController
     * @memberof app._shared.views.file
     *
     * @description
     * Controller for handle file view screens.
     */
    .controller('FileController', FileController);

  FileController.$inject = [];

  function FileController() {
    var vm = this;
    vm.bcaFileView.then(function(success) {
      vm.screen = success;
      console.log(success);
    });
  }
})();
