(function() {
  'use strict';

  angular
    .module('app._shared.select')
    /**
     * @namespace SelectFieldController
     * @memberof app._shared.select
     * @name SelectFieldController
     * @alias s
     *
     * @description
     * Controller for handle select input form elements.
     */
    .controller('SelectFieldController', SelectFieldController);

  function SelectFieldController() {
    var vm = this;
    vm.isArray = angular.isArray;
  }
})();
