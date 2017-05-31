(function() {
  'use strict';

  angular.module('app._shared.advanced-search.num-filter')
    .controller('numFilterController', [
      function() {
        var vm = this;
        vm.internalControl = vm.control || {};
        vm.listElements = [];
        var newFilterFrom = null;
        var newFilterTo = null;
        vm.finalSelectedValueFrom = null;
        vm.finalSelectedValueTo = null;
        vm.collapsed = true;

        /**
         * handleFilter
         * When blur event occurs on input text option, it handles this. If it was different to old value,
         * it removes the ancien filter and adds new.
         *
         * @param {Object} data -> The field used to filter the list.
         * @param {Object} isFrom -> If the text box option is 'From' or 'To'.
         */
        vm.handleFilter = function(data, isFrom) {
          if (isFrom && vm.finalSelectedValueFrom !== vm.selectedValueFrom) {
            vm.finalSelectedValueFrom = angular.copy(vm.selectedValueFrom);
            if (vm.selectedValueFrom) {
              vm.remove()(newFilterFrom, false);
              newFilterFrom = {
                field: data,
                condition: 'ge ' + vm.selectedValueFrom,
                toString: data.title + ' greather or equal than ' + vm.selectedValueFrom
              };
              vm.add()(newFilterFrom, true);
            } else {
              vm.remove()(newFilterFrom, true);
            }
          } else if (vm.finalSelectedValueTo !== vm.selectedValueTo) {
            vm.finalSelectedValueTo = angular.copy(vm.selectedValueTo);
            if (vm.selectedValueTo) {
              vm.remove()(newFilterTo, false);
              newFilterTo = {
                field: data,
                condition: 'le ' + vm.selectedValueTo,
                toString: data.title + ' less or equal than ' + vm.selectedValueTo
              };
              vm.add()(newFilterTo, true);
            } else {
              vm.remove()(newFilterTo, true);
            }
          }
        };

        /**
         * fastRemoveFilter
         * It does fast removal of entire current filter of this field, otherwise of uncheck list
         *
         */
        vm.fastRemoveFilter = function(isFrom) {
          if (isFrom) {
            vm.selectedValueFrom = null;
            vm.finalSelectedValueFrom = null;
            vm.remove()(newFilterFrom, true);
          } else {
            vm.selectedValueTo = null;
            vm.finalSelectedValueTo = null;
            vm.remove()(newFilterTo, true);
          }
        };

        /**
         * removeFromView
         * Outside of directive, fast removal of current filter on view
         *
         * @param {Object} filter -> The filter field used in this instance.
         */
        vm.internalControl.removeFromView = function(filter) {
          if (filter === newFilterFrom) {
            newFilterFrom = null;
            vm.selectedValueFrom = null;
            vm.finalSelectedValueFrom = null;
          } else {
            newFilterTo = null;
            vm.selectedValueTo = null;
            vm.finalSelectedValueTo = null;
          }
        };

        /**
         * removeNonStandardField
         * Remove the filter and save the config
         *
         * @param {Object} data -> The filter field used in this instance.
         */
        vm.removeNonStandardField = function(data) {
          data.searchable.selected = false;
          vm.fastRemoveFilter(true);
          vm.fastRemoveFilter(false);
          vm.save(data);
        };
      }
    ]);
})();
