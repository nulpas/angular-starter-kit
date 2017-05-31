(function() {
  'use strict';

  angular.module('app._shared.advanced-search.date-filter')
    .controller('dateFilterController', [
      '$views',
      function($views) {
        var vm = this;
        vm.viewConfig = $views.getViewDefinition();
        vm.internalControl = vm.control || {};
        vm.listElements = [];
        var newFilterFrom = null;
        var newFilterTo = null;
        vm.finalSelectedValueFrom = null;
        vm.finalSelectedValueTo = null;
        vm.collapsed = true;
        vm.dateTimePickerOptions = {};

        /**
         * handleFilter
         * When blur event occurs on input text option, it handles this. If it was different to old value,
         * it removes the ancien filter and adds new.
         *
         * @param {Object} data -> The field used to filter the list.
         */
        vm.handleFilter = function(data) {
          var _odataDate;
          var _fromReady = false;
          var _toReady = false;
          if (vm.finalSelectedValueFrom !== vm.selectedValueFrom) {
            vm.finalSelectedValueFrom = angular.copy(vm.selectedValueFrom);
            if (vm.selectedValueFrom) {
              vm.remove()(newFilterFrom, false);
              _odataDate = (data.format === 'date-time') ?
                moment.utc(vm.selectedValueFrom).format('YYYY-MM-DDTHH:mm:00') : vm.selectedValueFrom;
              newFilterFrom = {
                field: data,
                condition: 'ge ' + '\'' + _odataDate + '\'',
                toString: data.title + ' from ' + '\'' + vm.selectedValueFrom + '\''
              };
              _fromReady = true;
            } else {
              vm.remove()(newFilterFrom, true);
            }
          }
          if (vm.finalSelectedValueTo !== vm.selectedValueTo) {
            vm.finalSelectedValueTo = angular.copy(vm.selectedValueTo);
            if (vm.selectedValueTo) {
              vm.remove()(newFilterTo, false);
              _odataDate = (data.format === 'date-time') ?
                moment.utc(vm.selectedValueTo).format('YYYY-MM-DDTHH:mm:00') : vm.selectedValueTo;
              newFilterTo = {
                field: data,
                condition: 'le ' + '\'' + _odataDate + '\'',
                toString: data.title + ' to ' + '\'' + vm.selectedValueTo + '\''
              };
              _toReady = true;
            } else {
              vm.remove()(newFilterTo, true);
            }
          }
          if (_fromReady && _toReady) {
            vm.add()(newFilterFrom, false);
            vm.add()(newFilterTo, true);
          } else if (_fromReady) {
            vm.add()(newFilterFrom, true);
          } else if (_toReady) {
            vm.add()(newFilterTo, true);
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
         * createDateTimePickerOptions
         * It initializes opcions for new instance of control dateTimePickerOptions
         *
         * @param {String} name -> The name of control.
         * @param {Bool} isDateTime -> It determines if format of data is date ot date-time.
         */
        vm.createDateTimePickerOptions = function(name, isDateTime) {
          vm.dateTimePickerOptions[name] = {
            autoClose: true,
            dtpType: isDateTime ? 'date&time' : 'date',
            multiple: false,
            format: isDateTime ? 'YYYY-MM-DD, hh:mm:00' : 'YYYY-MM-DD'
          };
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
