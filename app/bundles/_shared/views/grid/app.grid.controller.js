(function() {
  'use strict';

  angular.module('app._shared.views.grid')
    .controller('gridController', [
      '$api',
      '$tools',
      '$views',
      'queryParamsFactory',
      'login',
      '$alert',
      'saleEventDetails',
      '$timeout',
      'swagger',
      function($api, $tools, $views, queryParamsFactory, login, $alert, saleEventDetails, $timeout, swagger) {
        var vm = this;
        var $c = $tools.$;
        //# Add core constants to view model.
        vm.shared = $c;
        //# Original and to be used partner available fields
        var sourcePartnerAvailableFields = {};
        vm.partnerAvailableFields = {};
        //# Original and to be modified configurations
        vm.viewConfig = {};
        vm.viewTempConfig = {};
        //# Is edition mode active
        vm.editMode = false;
        //# Persist config when you exit edit mode
        vm.persistConfig = false;
        //# List of selected items
        vm.internalControlGrid = vm.controlGrid || {};
        //# View definition
        vm.viewDefinition = $views.getViewDefinition();
        //# Translations
        vm.translations = login.getUserInfo().translation;
        vm.saleEventFactory = saleEventDetails;
        //# UI sortable options
        vm.sortBarSortableOptions = {
          axis: 'x',
          tolerance: 'pointer',
          containment: '.grid-sorting-bar',
          revert: true,
          receive: function(event, ui) {
            if (vm.viewTempConfig.orderFields.length >= 6) {
              $alert.error('Sorting can only contain 6 fields.');
              ui.item.sortable.cancel();
            }
          }
        };
        vm.sortableOptions = {
          placeholder: 'placeholder',
          connectWith: '.layer-fields-container',
          tolerance: 'pointer',
          revert: true
        };
        vm.sortableAllFieldsOptions = {
          placeholder: 'placeholder',
          connectWith: '.layer-fields-container, #sorting-fields-edit-mode',
          tolerance: 'pointer',
          revert: true,
          update: function(e, ui) {
            var itemNotReceived = !ui.item.sortable.received;
            var checkIfSamePlace = ui.item.sortable.source[0] !== ui.item.sortable.droptarget[0];
            var cardFieldsMaxLengthExceeded = ui.item.sortable.droptarget[0].id !== 'sorting-fields-edit-mode' &&
              ui.item.sortable.droptargetModel.length >= 4;

            if (itemNotReceived && checkIfSamePlace && cardFieldsMaxLengthExceeded) {
              $alert.error('Each layer can only contain 4 fields.');
              ui.item.sortable.cancel();
            }
            if (!ui.item.sortable.received) {
              var originNgModel = ui.item.sortable.sourceModel;
              var itemModel = originNgModel[ui.item.sortable.index];

              var exists = !!ui.item.sortable.droptargetModel.filter(
                function(x) {
                  return x.name === itemModel.name;
                }).length;
              if (exists && ui.item.sortable.source[0] !== ui.item.sortable.droptarget[0]) {
                ui.item.sortable.cancel();
                var erroMessage = 'The item <strong>' +
                  vm.getLabel(ui.item.sortable.source.context.childNodes[1].innerText) +
                  '</strong> is repeated.';
                $alert.error(erroMessage);
              }
            }
          },
          stop: function(e, ui) {
            if ($(e.target).hasClass('fields-container') &&
              ui.item.sortable.droptarget &&
              e.target !== ui.item.sortable.droptarget[0]) {
              vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
            }
          }
        };

        /**
         * @name saveEditChanges
         *
         * @description
         * This function save new configuration user in current session, and if it's persistent
         * is stored in db.
         */
        vm.saveEditChanges = function() {
          vm.viewConfig = angular.copy(vm.viewTempConfig);
          vm.viewDefinition.filterFields = swagger.composeFilterFields(
            sourcePartnerAvailableFields, vm.viewConfig);
          if (vm.persistConfig) {
            var editChangesObject = {};
            editChangesObject[vm.configName] = vm.viewConfig;
            swagger.removeProperties(editChangesObject[vm.configName].fields);
            swagger.removeProperties(editChangesObject[vm.configName].orderFields);
            var entity = $api.createEntityObject({
              entityName: 'configurations',
              objectSent: editChangesObject
            });
            $api.postEntity(entity, function() {
              $alert.success('The configuration has been saved.');
            });
          }
          vm.sortGrid();
          vm.persistConfig = false;
        };
        vm.cancelEditChanges = function() {
          vm.viewTempConfig = angular.copy(vm.viewConfig);
        };

        //# Edition mode CUSTOM actions
        vm.addLayer = function() {
          vm.viewTempConfig.custom.layers.push({ 'fields': [] });
        };

        //# Get the previous side of the card
        vm.getPreviousSide = function(totalSides, actualSide) {
          if (actualSide === 0) {
            return totalSides - 1;
          }
          return actualSide - 1;
        };

        //# Function to remove an item from the specified list
        vm.removeItemFromList = function(list, index) {
          list.splice(index, 1);
          if (list === vm.viewConfig.orderFields) {
            vm.viewTempConfig.orderFields.splice(index, 1);
          }
        };

        /**
         * getField
         * Function to get the field from an object using a string with dot notation.
         *
         * @param {Object} row
         * @param {String} dotedKey
         * @returns {*}
         */
        vm.getField = function(row, dotedKey) {
          return $tools.getValueFromDotedKey(row, dotedKey);
        };

        /**
         * transformActionParams
         * Parses action params to assign correct values from collection row.
         *
         * @param {Object} params
         * @param {Object} row
         * @returns {Object}
         */
        vm.transformActionParams = function(params, row) {
          return $tools.parseObjectValues(params, row);
        };

        /**
         * getItemTitle
         * Generates a title string from sort fields names.
         *
         * @param {Object} row
         * @param {Integer} type
         * @returns {string}
         */
        vm.getItemTitle = function(row, type) {
          var output = [];
          var iterationObject = (type === $c.TITLE) ? vm.viewConfig.orderFields : vm.viewConfig.custom.subtitle ;
          iterationObject.forEach(function(item, index) {
            var field = vm.getField(row, item.name);
            if (field !== undefined) {
              output[index] = field;
            }
          });
          return output.join(' ');
        };

        //# Function to get a temporal label for a field
        //# (for temporary use, it will be deprecated when translations are ready)
        vm.getLabel = function(fieldName) {
          return vm.translations[fieldName] ? vm.translations[fieldName] : fieldName;
        };

        //# Function used to sort the grid list
        vm.sortGrid = function() {
          vm.viewTempConfig = angular.copy(vm.viewConfig);
          queryParamsFactory.clearNextLastPage();
          queryParamsFactory.clearOrders();
          angular.forEach(vm.viewConfig.orderFields, function(item) {
            queryParamsFactory.addOrder(item);
          });
          vm.stopWatchingLoadOnScroll();
          vm.load()(false);
        };

        //# Function used to remove a filter
        vm.removeFromFilters = function(filter) {
          filter.field.control.removeFromView(filter);
          queryParamsFactory.removeFilter(filter);
          vm.stopWatchingLoadOnScroll();
          vm.load()(false);
        };

        var loadOnEndOfScroll = function() {
          var limit = $('#last-element-grid');
          var win = $(window);
          var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
          };
          viewport.right = viewport.left + win.width();
          viewport.bottom = viewport.top + win.height();

          var bounds = limit.offset();
          bounds.right = bounds.left + limit.outerWidth();
          bounds.bottom = bounds.top + limit.outerHeight();

          var result = (!(viewport.right < bounds.left ||
            viewport.left > bounds.right ||
            viewport.bottom < bounds.top ||
            viewport.top > bounds.bottom));
          if (result) {
            vm.viewDefinition.loadingData = true;
            vm.stopWatchingLoadOnScroll();
            vm.load()(true);
          }
        };

        vm.stopWatchingLoadOnScroll = function() {
          $('#' + vm.scrollContainer).off('scroll', loadOnEndOfScroll);
        };

        vm.startWatchingLoadOnScroll = function() {
          $timeout(loadOnEndOfScroll, 0);
          $('#' + vm.scrollContainer).on('scroll', loadOnEndOfScroll);
        };

        /**
         * @name _initConfiguration
         *
         * @description
         * When view is loaded, it inits different configuracions. It gets filter Object from combining
         * contract entity with availableFields general object.
         */
        var _initConfiguration = function() {
          vm.firstTimeLoading = false;
          vm.viewDefinition = $views.setViewDefinition({
            loadingData: true,
            data: null
          });
          queryParamsFactory.clear();
          swagger.composeFields(vm.entity).then(function(availableFields) {
            sourcePartnerAvailableFields = availableFields;
            vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
            vm.viewDefinition.searchableFields = availableFields;
            var configurationsEntity = $api.createEntityObject({ entityName: 'configurations/' + vm.configName });
            $api.getEntity(configurationsEntity, function(success) {
              vm.filters = queryParamsFactory.getFilters();
              vm.viewConfig = success.data;
              vm.viewDefinition.filterFields = swagger.composeFilterFields(
                sourcePartnerAvailableFields, vm.viewConfig);
              vm.viewTempConfig = angular.copy(vm.viewConfig);

              for (var i = 0; i < vm.viewTempConfig.orderFields.length; i++) {
                queryParamsFactory.addOrder(vm.viewTempConfig.orderFields[i]);
              }
              vm.internalControlGrid.load();
            });
          });
        };
        vm.internalControlGrid.load = function() {
          vm.resetScrollConfiguration();
          vm.load()(false);
        };

        vm.resetScrollConfiguration = function() {
          //We call first stopScrollEvent method from old view, to cancel his scroll
          if (vm.viewDefinition.stopScrollEvent) {
            vm.viewDefinition.stopScrollEvent();
          }
          vm.viewDefinition = $views.setViewDefinition({
            startScrollEvent: vm.startWatchingLoadOnScroll,
            stopScrollEvent: vm.stopWatchingLoadOnScroll
          });
        };

        _initConfiguration();
      }
    ]);
})();
