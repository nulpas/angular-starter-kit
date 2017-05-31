(function() {
  'use strict';

  angular.module('app._shared.advanced-search.enum-filter')
    .controller('enumFilterController', [
      function() {
        var vm = this;
        vm.internalControl = vm.control || {};
        var newFilter = null;
        vm.selectedOptions = [];
        vm.selectedOptionsTitle = '';
        vm.collapsed = true;
        vm.searchEnum = '';

        // If the field is an enum convert the data object into an array to make possible filtering over it
        if (vm.data && vm.data.enum) {
          vm.enumArray = Object.keys(vm.data.enum).map(function(key) {
            return vm.data.enum[key];
          });
        }

        /**
         * getTranslation
         * Temporary function tu return translation of enum values.
         *
         * @returns {string} translation value.
         */
        vm.getTranslation = function(data) {
          return data.es;
        };

        /**
         * cleanCheckboxList
         * Set checkbox list options of enum to false.
         *
         * @private
         */
        var cleanCheckboxList = function() {
          vm.selectedOptions.length = 0;
        };

        /**
         * handleOption
         * When user clicks on option, it handles this. If it was present in selectedOptions list,
         * it removes from this, and in the opposite it adds the option. After that, it rebuilds newFilter
         * and adds it.
         *
         * @param {Object} data -> The field used to filter the list.
         * @param {Object} option -> The option choosen to add or remove.
         */
        vm.handleOption = function(data, option) {
          var index = vm.selectedOptions.indexOf(option);
          if (index < 0) {
            vm.selectedOptions.push(option);
          } else {
            vm.selectedOptions.splice(index, 1);
          }

          var condition = '';
          vm.selectedOptionsTitle = '';
          if (vm.selectedOptions.length > 0) {
            for (var i = 0; i < vm.selectedOptions.length; i++) {
              var initialComma = (i === 0) ? '' : ',';
              condition += initialComma + '\'' + vm.selectedOptions[i] + '\'';
              vm.selectedOptionsTitle += initialComma + ' ' + vm.selectedOptions[i];
            }

            vm.remove()(newFilter, false);
            newFilter = {
              field: data,
              condition: 'in [' + condition + ']',
              toString: data.title + ' is ' + vm.selectedOptionsTitle
            };
            vm.add()(newFilter, true);
          }  else {
            vm.selectedOptionsTitle = '';
            vm.remove()(newFilter, true);
          }
        };

        /**
         * fastRemoveFilter
         * It does fast removal of entire current filter of this field, otherwise of uncheck list
         *
         */
        vm.fastRemoveFilter = function() {
          vm.selectedOptions = [];
          vm.selectedOptionsTitle = '';
          cleanCheckboxList();
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
            vm.selectedOptions = [];
            vm.selectedOptionsTitle = '';
            vm.collapsed = true;
            cleanCheckboxList();
          }
        };

        /**
         * removeNonStandardField
         * Remove the filter and save the config
         *
         * @param {Object} data -> The filter field used in this instance.
         */
        vm.removeNonStandardField = function() {
          vm.data.searchable.selected = false;
          vm.fastRemoveFilter();
          vm.save(vm.data);
        };
      }
    ]);
})();
