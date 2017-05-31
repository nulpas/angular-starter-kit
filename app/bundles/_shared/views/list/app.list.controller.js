(function() {
  'use strict';

  angular.module('app._shared.views.list')
    .controller('listController', [
      '$api',
      '$tools',
      '$views',
      'queryParamsFactory',
      'login',
      'formValidator',
      '$alert',
      '$timeout',
      'swagger',
      '$bpm',
      'saleEventDetails',
      '$stateParams',
      function(
        $api,
        $tools,
        $views,
        queryParamsFactory,
        login,
        formValidator,
        $alert,
        $timeout,
        swagger,
        $bpm,
        saleEventDetails,
        $stateParams) {
        var vm = this;
        var $c = $tools.$;
        var _methodsObject = {};
        var _listMethodsObject = {};
        vm.saleEventFactory = saleEventDetails;
        vm.bpmStateMethods = {};
        vm.auxMethod = '';
        //# If true, actions in vehicle list won't be displayed
        vm.noActions = $stateParams.noActions;
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
        vm.internalControlList = vm.controlList || {};
        //# View definition
        vm.viewDefinition = $views.getViewDefinition();
        //# Translations
        vm.translations = login.getUserInfo().translation;
        //# Icons
        vm.icons = {};
        //#Values filled in form action
        vm.actionRequest = {};
        //# UI sortable options
        vm.fieldOptions =  {
          forcePlaceholderSize: true,
          forceHelperSize: true,
          handle: '.handle',
          placeholder: 'property-placeholder',
          revert: true,
          tolerance: 'pointer',
          zIndex: 99,
          start: function(event, ui) {
            if (vm.viewTempConfig.orderFields.length >= 3) {
              ui.helper.height(ui.helper.height() / 1.3);
            }
          },
          update: function(e, ui) {
            var itemNotReceived = !ui.item.sortable.received;
            var checkIfSamePlace = ui.item.sortable.source[0] !== ui.item.sortable.droptarget[0];
            var titleFieldsMaxLengthExceeded = ui.item.sortable.droptarget[0].id !== 'sorting-fields-edit-mode' &&
              ui.item.sortable.droptargetModel.length >= 5;

            if (itemNotReceived && checkIfSamePlace && titleFieldsMaxLengthExceeded) {
              ui.item.sortable.cancel();
              $alert.error('The title can not contain more than 5 items.');
            }
            if (!ui.item.sortable.received) {
              var originNgModel = ui.item.sortable.sourceModel;
              var itemModel = originNgModel[ui.item.sortable.index];

              var exists = !!ui.item.sortable.droptargetModel.filter(function(x) {
                return x.name === itemModel.name;
              }).length;
              if (exists && ui.item.sortable.source[0] !== ui.item.sortable.droptarget[0]) {
                ui.item.sortable.cancel();
                $alert.error('The item is repeated.');
              }
            }
          }
        };
        vm.allFieldsBoxOptions =  {
          connectWith: '.vehicle-fields-container, .sort-bar-fields',
          placeholder: 'property-placeholder',
          zIndex: 99,
          tolerance: 'pointer',
          update: function(e, ui) {
            if (!ui.item.sortable.received) {
              var originNgModel = ui.item.sortable.sourceModel;
              var itemModel = originNgModel[ui.item.sortable.index];

              var exists = !!ui.item.sortable.droptargetModel.filter(
                function(x) {
                  return x.name === itemModel.name;
                }).length;
              if (exists && ui.item.sortable.source[0] !== ui.item.sortable.droptarget[0]) {
                ui.item.sortable.cancel();
                var errorMessage = 'The item <strong>' +
                  vm.getLabel(ui.item.sortable.source.context.childNodes[1].innerText) +
                  '</strong> is repeated.';
                $alert.error(errorMessage);
              }
            }
          },
          stop: function(e, ui) {
            if (ui.item.sortable.droptarget &&
              e.target !== ui.item.sortable.droptarget[0]) {
              vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
            }
          }
        };
        vm.sortBarSortableOptions = {
          axis: 'x',
          tolerance: 'pointer',
          containment: '.list-sorting-bar',
          revert: true,
          receive: function(event, ui) {
            if (vm.viewTempConfig.orderFields.length >= 6) {
              ui.item.sortable.cancel();
              $alert.error('Title can only contain 6 options.');
            }
          }
        };

        vm.dateTimePickerOptions = {};

        /**
         * @name createDateTimePickerOptions
         *
         * @description
         * This function creates default options for dateTimePicker component.
         *
         * @param {Object} param -> The field with format datetime
         */
        vm.createDateTimePickerOptions = function(param) {
          vm.dateTimePickerOptions[param.name] = {
            autoClose: true,
            dtpType: (param.format === 'date-time') ? 'date&time' : 'date',
            multiple: false,
            format: (param.format === 'date-time') ? 'YYYY-MM-DD, hh:mm:00' : 'YYYY-MM-DD'
          };

          vm.actionRequest[param.name] = '';
        };

        /**
         * @name onChangeDateTimeHandler
         *
         * @description
         * This function converts datetime value with correct format.
         *
         * @param {String} fieldName -> The name of field with format datetime
         * @param {String} actualValue
         */
        vm.onChangeDateTimeHandler = function(fieldName, actualValue) {
          vm.actionRequest[fieldName] = moment.utc(actualValue).format('YYYY-MM-DDTHH:mm:00');

          if (!moment(vm.actionRequest[fieldName]).isValid()) {
            vm.actionRequest[fieldName] = '';
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

          vm.viewDefinition.filterFields = swagger.composeFilterFields(
            sourcePartnerAvailableFields, vm.viewConfig);
          vm.sortList();
          vm.persistConfig = false;
        };

        vm.cancelEditChanges = function() {
          vm.viewTempConfig = angular.copy(vm.viewConfig);
        };

        //# Function to remove an item from the specified list
        vm.removeItemFromList = function(list, index) {
          list.splice(index, 1);
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

          /**
           * @name vm.viewConfig.custom
           * @type {Object}
           * @property {String} subtitle
           * @property {Object} layers
           */
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

        //# Function to get an icon for a string
        vm.getIcon = function(string) {
          return vm.icons[string] ? vm.icons[string] : string;
        };

        //# Function used to sort the list
        vm.sortList = function() {
          vm.viewConfig = angular.copy(vm.viewTempConfig);
          queryParamsFactory.clearNextLastPage();
          queryParamsFactory.clearOrders();
          angular.forEach(vm.viewConfig.orderFields, function(item) {
            queryParamsFactory.addOrder(item);
          });
          vm.internalControlList.load();
        };

        //# Function used to remove a filter
        vm.removeFromFilters = function(filter) {
          filter.field.control.removeFromView(filter);
          queryParamsFactory.removeFilter(filter);
          vm.stopWatchingLoadOnScroll();
          vm.load()(false);
        };

        var loadOnEndOfScroll = function() {
          var limit = $('#last-element-list');
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

        vm.getPattern = formValidator.getPattern;

        /**
         * @name actionParams
         * @type Object
         * @property {String} apiCall
         */

        /**
         * @name app._shared.views.list#getEnumFields
         *
         * @description
         * Loads into an array the possible enum values for an action.
         *
         * @param {Object} actionParams
         */
        vm.getEnumFields = function(actionParams) {
          if (actionParams) {
            angular.forEach(actionParams, function(element) {
              if (element.apiCall) {
                var apiCallEntity = $api.createEntityObject({ entityName: element.apiCall });
                $api.getEntity(apiCallEntity, function(success) {
                  var fields = [];
                  var ownFields = [];

                  if (success.data) {
                    fields = success.data.fields || [];
                    ownFields = success.data.ownFields || [];
                  }

                  element.enum = fields.concat(ownFields);
                });
              }
            });
          }
        };

        vm.updateCheckBox = function(optionValue, fieldName) {
          vm.actionRequest[fieldName] = (optionValue === vm.actionRequest[fieldName]) ? null : optionValue ;
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
         * When view is loaded, it inits different configuracions. It retrieves filter Object from combining
         * contract entity with availableFields general object.
         */
        var _initConfiguration = function() {
          vm.viewDefinition = $views.setViewDefinition({
            loadingData: true,
            data: null
          });

          swagger.composeFields(vm.entity).then(function(availableFields) {
            sourcePartnerAvailableFields = availableFields;
            vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
            vm.viewDefinition.searchableFields = availableFields;
            var configurationEntity = $api.createEntityObject({ entityName: 'configurations/' + vm.configName });
            $api.getEntity(configurationEntity, function(success) {
              if (success.data) {
                /**
                 * @type Object
                 * @property {Object} orderFields
                 * @property {*} storageKey
                 */
                vm.viewConfig = success.data;
                vm.viewDefinition.filterFields = swagger.composeFilterFields(
                  sourcePartnerAvailableFields, vm.viewConfig);
                vm.viewConfig.fields = angular.copy(vm.viewDefinition.filterFields);
                vm.viewTempConfig = angular.copy(vm.viewConfig);
                queryParamsFactory.clear();
                angular.forEach(vm.viewTempConfig.orderFields, function(field) {
                  queryParamsFactory.addOrder(field);
                });
                vm.filters = queryParamsFactory.getFilters();
                vm.internalControlList.load();

                _getBpmStateMethods();
                _processListMethods();
              }
            });
          });

          var iconsEntity = $api.createEntityObject({ entityName: 'icons' });
          $api.getLocalEntity(iconsEntity, function(success) {
            vm.icons = success.data;
          });
        };

        vm.internalControlList.load = function() {
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

        //# BPMN
        vm.doBpmnAction = function(vehicleObject, actionObject) {
          var bpmEntity = $api.createEntityObject({
            entityName: actionObject.post,
            objectSent: {
              parameters: { id: vehicleObject.id }
            }
          });
          $api.postEntity(bpmEntity, function() {
            vm.load()(false);
            $alert.success('Action executed correctly.');
          });
        };
        vm.getBpmnParamsAction = function(dialogSelector) {
          var dialog = document.querySelector(dialogSelector);
          if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
          }
          dialog.showModal();
        };
        vm.doBpmnParamsAction = function(id, actionObject) {
          var bpmEntity = $api.createEntityObject({
            entityName: actionObject.post,
            objectSent: {
              parameters: angular.extend({}, vm.actionRequest, { id: id })
            }
          });
          $api.postEntity(bpmEntity, function() {
            vm.load()(false);
            vm.selectedEnum = null;
            $alert.success('Action executed correctly.');
          });
        };
        vm.closeParamsAction = function(dialogSelector) {
          var dialog = document.querySelector(dialogSelector);
          document.querySelector('main.mdl-layout__content').style.overflowY = '';
          dialog.close();
          document.querySelector('main.mdl-layout__content').style.overflowY = 'auto';
        };

        /**
         * @name app._shared.views.list#getBpmStateMethods
         *
         * @description
         * Get bpm state methods based on current state ($stateParams.param3).
         */
        function _getBpmStateMethods() {
          var state = $stateParams.param3;
          var stateObject = {};

          if (state) {
            stateObject =  $bpm.getData(state);
            _methodsObject = stateObject.methods || {};
            _listMethodsObject = stateObject.inListMethods || {};

            vm.bpmStateMethods = angular.extend({}, _methodsObject, _listMethodsObject);
          }
        }

        /**
         * @name app._shared.views.list#_processListMethods
         *
         * @description
         * Process each listMethod in _listMethodsObject.
         * @private
         */
        function _processListMethods() {
          angular.forEach(_listMethodsObject, _processParams);
        }

        /**
         * @name app._shared.views.list#_processListMethods
         *
         * @description
         * Process each param of each method in _listMethodsObject.
         * @private
         */
        function _processParams(method) {
          vm.auxMethod = method;
          angular.forEach(method.params, _fillFieldWithParamData, method);
        }

        /**
         * @name app._shared.views.list#_processListMethods
         *
         * @description
         * Fills a field of 'viewConfig' object with the method associated. This occurs when a field is related
         * to any params of any method of '_listMethodsObject'
         * @private
         */
        function _fillFieldWithParamData(param) {
          angular.forEach(vm.viewConfig.fields, function(field) {
            if (param.name === field.name.split('.').pop()) {
              field.method = vm.auxMethod;
            }
          });
        }
      }
    ]);
})();
