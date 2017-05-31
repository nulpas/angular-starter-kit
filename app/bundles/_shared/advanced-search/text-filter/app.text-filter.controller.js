(function() {
  'use strict';

  angular.module('app._shared.advanced-search.text-filter')
    .controller('textFilterController', [
      function() {
        var vm = this;
        vm.internalControl = vm.control || {};
        var newFilter = null;
        vm.selectedValue = null;
        vm.finalSelectedValue = null;
        vm.collapsed = true;

        /**
         * handleFilter
         * When blur event occurs on input text option, it handles this. If it was different to old value,
         * it removes the ancien filter and adds new.
         *
         * @param {Object} data -> The field used to filter the list.
         */
        vm.handleFilter = function(data) {
          if (vm.finalSelectedValue !== vm.selectedValue) {
            vm.finalSelectedValue = angular.copy(vm.selectedValue);
            if (vm.selectedValue) {
              vm.remove()(newFilter, false);
              newFilter = {
                field: data,
                condition: 'ct ' + '\'' + vm.selectedValue + '\'',
                toString: data.title + ' contains ' + '\'' + vm.selectedValue + '\''
              };
              vm.add()(newFilter, true);
            } else {
              vm.remove()(newFilter, true);
            }
          }
          vm.collapsed = true;
        };

        /**
         * fastRemoveFilter
         * It does fast removal of entire current filter of this field, otherwise of uncheck list
         *
         */
        vm.fastRemoveFilter = function() {
          vm.selectedValue = null;
          vm.finalSelectedValue = angular.copy(vm.selectedValue);
          vm.remove()(newFilter, true);
        };

        /**
         * removeFromView
         * Outside of directive, fast removal of current filter on view
         *
         * @param {Object} filter -> The filter field used in this instance.
         */
        vm.internalControl.removeFromView = function(filter) {
          if (filter === newFilter) {
            newFilter = null;
            vm.selectedValue = null;
            vm.finalSelectedValue = null;
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
          vm.fastRemoveFilter();
          vm.save(data);
        };
      }
    ]);
})();
