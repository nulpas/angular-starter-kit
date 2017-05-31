(function() {
  'use strict';

  angular
    .module('app._core.screens.table')
    /**
     * @name TableController
     * @memberof app._shared.views.table
     *
     * @requires tables
     *
     * @description
     * Controller for handle table view screens.
     */
    .controller('TableController', TableController);

  TableController.$inject = ['tables', 'selectedEntities', '$q'];

  function TableController(tables, selectedEntities, $q) {
    var vm = this;
    var deferral = $q.defer();
    vm.screenPromise = deferral.promise;

    vm.activeSelectableModelObject = {
      text: 'Activate Selection.',
      checked: false
    };
    vm.selectedEntities = selectedEntities;
    vm.bcaTableView.then(function(success) {
      vm.screen = tables.assembleScreenObject(success);
      vm.screen._cursor.totalResult = vm.screen.data.length;
      deferral.resolve(vm.screen);
    });

    vm.activeSelectable = function(checked) {
      var newValue = !checked;
      vm.activeSelectableModelObject.checked = newValue;
      selectedEntities.toggleSelectable(vm.screen, newValue);
    };
  }
})();
