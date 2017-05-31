(function() {
  'use strict';

  angular.module('app._shared.views.simpleList')
    .controller('simpleListController', [
      'utilsFactory',
      '$api',
      '$views',
      'queryParamsFactory',
      'login',
      '$timeout',
      '$alert',
      'saleEventDetails',
      'packageDetails',
      '$tools',
      'simpleList',
      'swagger',
      '$filter',
      '$bpm',
      '$rootScope',
      'filterFilter',
      'userDetails',
      function(
        utilsFactory,
        $api,
        $views,
        queryParamsFactory,
        login,
        $timeout,
        $alert,
        saleEventDetails,
        packageDetails,
        $tools,
        simpleList,
        swagger,
        $filter,
        $bpm,
        $rootScope,
        filterFilter,
        userDetails) {
        var vm = this;
        vm.internalControlSimpleList = vm.controlSimpleList || {};
        vm.viewDefinition = $views.getViewDefinition();
        var sourcePartnerAvailableFields = {};
        vm.viewConfig = null;
        vm.viewTempConfig = null;
        vm.translations = login.getUserInfo().translation;
        vm.persistConfig = false;
        vm.customSortableOptions = {};
        vm.currentUlSortableOption = {};
        vm.allItemsLoaded = false;
        vm.saleEventFactory = saleEventDetails;
        //TODO: Change this when a proper routing is implemented
        //TODO: change when proper routes are set

        //This var holds the input value, required since Advanced Search
        //does not synchronize with its factory.
        var _bqlInputValue = null;

        //uniqueId is used to handle multiple instances of dialogs inside the same view.
        //For some reason it requires a starting char.
        vm.dialogId = 'id' + utilsFactory.uniqueId();
        var dialogSelector = '#' + vm.dialogId;

        var _localParams = {
          filter: [],
          order: [],
          top: 30,
          skip: 30,
          lastPage: 0
        };

        var _localQueryParams = {
          get: function() {
            return _localParams;
          },
          addFilter: function(item) {
            _localParams.filter.push(item);
            return _localParams;
          },
          removeFilter: function(item) {
            var index =  _localParams.filter.indexOf(item);
            if (index >= 0) {
              _localParams.filter.splice(index, 1);
            }
            return _localParams;
          },
          getFilters: function() {
            return _localParams.filter;
          },
          clearFilters: function() {
            _localParams.filter.splice(0);
          },
          addOrder: function(item) {
            _localParams.order.push(item);
            return _localParams;
          },
          removeOrder: function(item, index) {
            if (index) {
              _localParams.order.splice(index, 1);
            } else {
              index = _localParams.order.indexOf(item);
              if (index >= 0) {
                _localParams.order.splice(index, 1);
              }
            }
            return _localParams;
          },
          clearOrders: function() {
            _localParams.order.splice(0);
          },
          getOrder: function(index) {
            return _localParams.order[index];
          },
          getOrders: function() {
            return _localParams.order;
          },
          setNextLastPage: function() {
            _localParams.lastPage++;
          },
          clearNextLastPage: function() {
            _localParams.lastPage = 0;
          },
          setParams: function() {
            if (_localParams.lastPage > 0) {

            }
            var parameters = {
              '$orderby': '',
              '$top': _localParams.top,
              '$skip': _localParams.skip * _localParams.lastPage
            };
            if (_localParams.filter.length > 0) {
              parameters.$filter = '';
              for (var j = 0; j < _localParams.filter.length; j++) {
                var enumLabel = (_localParams.filter[j].field.type === 'string' &&
                _localParams.filter[j].field.enum) ? '/importValue' : '';

                if (j !== 0) {
                  parameters.$filter += ' AND ';
                }
                var name = _localParams.filter[j].field.name.split('.').join('/');
                parameters.$filter += name + enumLabel + ' ' + _localParams.filter[j].condition;
              }
            }

            for (var i = 0; i < _localParams.order.length; i++) {
              parameters.$orderby +=
                _localParams.order[i].name + ' ' + (_localParams.order[i].orderDescending ? 'desc' : 'asc') + ',';
            }
            parameters.$orderby = parameters.$orderby.split('.').join('/');
            return parameters;
          },
          clear: function() {
            for (var i = 0; i < _localParams.filter.length; i++) {
              _localParams.filter[i].field.control.removeFromView(_localParams.filter[i]);
            }
            _localParams.filter.splice(0);
            _localParams.order.splice(0);
            _localParams.top = 30;
            _localParams.skip = 30;
            _localParams.lastPage = 0;
            return _localParams;
          }
        };

        var loadList = function() {
          var params = _localQueryParams.setParams();
          vm.exportData.params = params;
          var entityObject = $api.createEntityObject({
            entityName: vm.entity,
            params: params
          });

          if (!vm.entity) {
            return;
          }

          $api.getEntity(entityObject, function(success) {
            var loaded =  success._cursor.skip + success._cursor.top;
            var total = success._cursor.totalFiltered;
            vm.allItemsLoaded = loaded >= total;
            vm.counter = total;

            if (_localParams.lastPage > 0) {
              angular.forEach(success.data, function(element) {
                vm.simpleListView.push(element);
              });
            } else {
              vm.simpleListView.splice(0);
              angular.forEach(success.data, function(element) {
                vm.simpleListView.splice(0, 0, element);
              });
            }
          });
        };

        /**
         * removeItemFromList
         * Function to remove an item from the specified list
         *
         * @param {Object} list
         * @param {number} index
         */
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
        vm.getField = utilsFactory.getValueFromDotedKey;

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

        vm.getLabel = function(fieldName) {
          return vm.translations[fieldName] ? vm.translations[fieldName] : fieldName;
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

        vm.sortableActiveColumnsOptions = {
          revert: true,
          tolerance: 'pointer',
          forceHelperSize: false,
          placeholder: 'placeholder',
          axis: 'x'
        };
        vm.sortableDisabledColumnsOptions = {
          revert: true,
          tolerance: 'pointer',
          forceHelperSize: false,
          placeholder: 'placeholder',
          connectWith: '.active-fields-container > div, .sort-bar-fields',
          stop: function(e, ui) {
            // if the element is removed from the first container
            if ($(e.target).attr('id') === 'inactiveFields' &&
              ui.item.sortable.droptarget &&
              e.target !== ui.item.sortable.droptarget[0]) {
              // clone the original model to restore the removed item
              vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
            }
          },
          update: function(event, ui) {
            // on cross list sortings recieved is not true
            // during the first update
            // which is fired on the source sortable
            if (!ui.item.sortable.received) {
              var originNgModel = ui.item.sortable.sourceModel;
              var itemModel = originNgModel[ui.item.sortable.index];

              var exists = !!ui.item.sortable.droptargetModel.filter(function(x) {
                  return x.name === itemModel.name;
                }).length;

              if (exists && ui.item.sortable.source[0] !== ui.item.sortable.droptarget[0]) {
                ui.item.sortable.cancel();
                var errorMessage = 'The item is repeated';
                if (ui.item.sortable.source.context) {
                  errorMessage = 'The item <strong>' +
                    vm.getLabel(ui.item.sortable.source.context.childNodes[1].innerText) +
                    '</strong> is repeated.';
                }
                $alert.error(errorMessage);
              }
            }
          }
        };
        vm.sortableColumnHeaders = {
          forcePlaceholderSize: true,
          placeholder: 'property-dropzone',
          axis: 'x',
          containment: 'window',
          start: function(e, ui) {
            //Getting the column being dragged
            var columnId = $(ui.item).attr('data-column-id');
            var columns = angular.element(
              document.querySelectorAll('[data-column-id="' + columnId + '"]:not(.ui-sortable-handle)')
            );
            //Applying classes
            columns.addClass('sortableMoving');

            //Floating clones
            angular.forEach(columns, function(v) {
              var clone = angular.copy(v);
              var columnWidth = $(ui.item).width();
              $(clone).addClass('sortableFloat');
              $(clone).removeClass('sortableMoving');
              $(clone).find('.mdl-js-button, .mdl-button').remove();
              $(clone).css('width', columnWidth);
              $(clone).appendTo($(v).parent());
            });
          },
          change: function() {
            //vm.changeSortColumns(e, ui);//To be added when fixed, unstable for now
          },
          sort: function(e, ui) {
            //Get offset
            var offset = ui.offset;
            //Apply to Floating Clones
            $('.sortableFloat').css('left', (offset.left - 10));
          },
          stop: function() {
            //Destroying helpers, resetting columns
            angular.element(
              document.querySelectorAll('.sortableMoving')
            ).removeClass('sortableMoving');
            angular.element(
              document.querySelectorAll('.sortableFloat')
            ).remove();
          }
        };

        vm.removeFromFilters = function(filter) {
          filter.field.control.removeFromView(filter);
          queryParamsFactory.removeFilter(filter);
          vm.stopWatchingLoadOnScroll();
          if (vm.load()) {
            vm.load()(false);
          }
        };

        vm.changeSortColumns = function(e, ui) {
          //Gather Ids
          var placeholderId ;
          if ($(ui.placeholder).next().length) {
            placeholderId = $(ui.placeholder).next().attr('data-column-id');
          } else {
            placeholderId = $(ui.placeholder).prev().attr('data-column-id');
          }
          var columnId = $(ui.item).attr('data-column-id');
          //Iterate the column
          var columnElements = angular.element(document.querySelectorAll('[data-column-id="' + columnId + '"]'));
          angular.forEach(columnElements, function(v) {
            var parentElement = $(v).parent();
            //Get Target Element
            var swapElement = parentElement.find('[data-column-id=' + placeholderId + ']');
            //Swap places
            if ($(ui.placeholder).next().length) {
              $(v).insertBefore(swapElement);
            } else {
              // $(v).insertAfter(swapElement);
              //$(swapElement).insertAfter(v);
            }
          });
        };

        /**
         * isASortCriteria
         * Functions that returns a boolean depending on if the column that call the function
         * is a sort criteria.
         * Used to know if it has to display the order button
         *
         * @param {object} item
         * @returns {boolean}
         */
        vm.isASortCriteria = function(item) {
          if (!vm.viewConfig.orderFields) {
            return false;
          }

          var criteria = vm.viewConfig.orderFields.filter(function(e) {
            return e.name === item.name;
          });
          return criteria.length;
        };

        /**
         * getSortOrder
         * Function that returns the sort order (true if it is descending) of a column
         *
         * @param {object} item
         * @returns {boolean} orderDescending
         */
        vm.getSortOrder = function(item) {
          var order =  vm.viewConfig.orderFields.filter(function(i) {
            return i.name === item.name;
          });
          return order[0].orderDescending;
        };

        /**
         * sortList
         * Function used to sort the list
         */
        vm.sortList = function() {
          vm.viewConfig = angular.copy(vm.viewTempConfig);
          if (!vm.isPartialView) {
            queryParamsFactory.clearNextLastPage();
            queryParamsFactory.clearOrders();
            angular.forEach(vm.viewConfig.orderFields, function(item) {
              queryParamsFactory.addOrder(item);
            });
            vm.orders = queryParamsFactory.getOrders();
            vm.internalControlSimpleList.load();
          } else {
            _localQueryParams.clearNextLastPage();
            _localQueryParams.clearOrders();
            angular.forEach(vm.viewConfig.orderFields, function(item) {
              _localQueryParams.addOrder(item);
            });
            vm.orders = _localQueryParams.getOrders();
            vm.viewDefinition.loadingData = true;
            vm.stopWatchingLoadOnScroll();
            loadList();
          }
        };

        vm.showDetails = function(log) {
          vm.selectedLog = log;
          var dialog = document.querySelector(dialogSelector);
          if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
          }
          dialog.showModal();
        };

        vm.closeModal = function() {
          var dialog = document.querySelector(dialogSelector);
          dialog.close();

          // Workaround to fix the problem with the scroll-bar when you close a dialog.
          document.querySelector('.mdl-layout__content').style.overflowX = 'auto';
          document.querySelector('.mdl-layout__content').style.overflowX = '';
        };

        /**
         * @name setFocus
         *
         * @memberof app._shared.views.simpleList.simpleListController
         *
         * @description
         * Focuses the element with the specified id
         *
         * @param {string} elementSelector
         */
        vm.setFocus = function(elementSelector) {
          $timeout(function() {
            angular.element(elementSelector).focus();
          }, 500);
        };

        //Formats a Json string to be used inside <pre> tag.
        vm.prettyJson = function(jsonString) {
          if (!jsonString) {
            return '';
          }
          return JSON.stringify(JSON.parse(jsonString), undefined, 4);
        };

        var loadOnEndOfScroll = function() {
          var limit = $('#last-element-simple-list');
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
            if (vm.load()) {
              vm.load()(true);
            }
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
         * Get the sortable options for UL element. This options was created previously by
         * 'createCustomSortableConfiguration' function.
         *
         * @returns {Object} If exists, the custom options. Base options in other case.
         */
        var getSortableOptions = function() {
          var uiSortableVariableName = vm.viewConfig.uiSortableVariableName;
          return uiSortableVariableName ? vm.customSortableOptions[uiSortableVariableName] : vm.baseSortableOptions;
        };

        /**
         * Create the custom Sortable configuration based on view configuration attribute called 'activateUiSortable'.
         */
        var createCustomSortableConfiguration = function() {
          var activateUiSortable = vm.viewConfig.activateUiSortable;
          var uiSortableVariableName = vm.viewConfig.uiSortableVariableName;
          if (activateUiSortable && !uiSortableVariableName.includes('PackageSortable')) {
            vm.customSortableOptions[uiSortableVariableName] = angular.extend(
              {},
              vm.baseSortableOptions,
              saleEventDetails.getSortableConfiguration(uiSortableVariableName)
            );
          } else if (uiSortableVariableName && uiSortableVariableName.includes('PackageSortable')) {
            getPackageSortableConfiguration(uiSortableVariableName);
          }
        };

        function getPackageSortableConfiguration(sortableVariableName) {

          if (sortableVariableName === 'packageVehiclesPackageSortable') {
            vm.customSortableOptions[sortableVariableName] = angular.extend(
              {},
              vm.baseSortableOptions,
              packageVehiclesSortable
            );
          } else {
            vm.customSortableOptions[sortableVariableName] = angular.extend(
              {},
              vm.baseSortableOptions,
              telesalesAndAvailableVehiclesSortable
            );
          }
        }

        var packageVehiclesSortable = {
          connectWith: '.telesalesvehiclespackagesortable, .availablevehiclespackagesortable',
          update: function(e, ui) {
            var originModel = ui.item.sortable.sourceModel;
            var targetModel = ui.item.sortable.droptargetModel;
            var item = ui.item.sortable.model;

            ui.item.sortable.cancel();
            if (originModel !== targetModel && !ui.item.sortable.received) {
              vm.removeToPackage(item);
            }
          }
        };

        var telesalesAndAvailableVehiclesSortable = {
          connectWith: '.packagevehiclespackagesortable',
          update: function(e, ui) {
            var originModel = ui.item.sortable.sourceModel;
            var targetModel = ui.item.sortable.droptargetModel;
            var item = ui.item.sortable.model;
            var targetIndex = ui.item.sortable.dropindex;

            ui.item.sortable.cancel();
            if (originModel !== targetModel && !ui.item.sortable.received) {
              vm.assignToPackage(item, targetIndex);
            }
          }
        };

        /**
         * @name saveLotPrice
         *
         * @memberof app._shared.views.simpleList.simpleListController
         *
         * @description
         * Saves the lot starting price that has just been modified
         *
         *
         * @param {Object} row
         * @param {String} fieldName
         * @param {String|Number|Null} value
         */
        vm.saveLotPrice = function(row, fieldName, value) {
          if (row[fieldName] !== value) {
            var isDeleted = row[fieldName] && !value;
            if (!value) {
              value = null;
            }
            row[fieldName] = value;
            var entity = $api.createEntityObject({
              entityName: 'lots/' + row.id,
              objectSent: {
                'startingPrice': value
              }
            });
            $api.update(entity, function() {
              var alertText = !isDeleted ? 'The price has been set.' : 'The price has been deleted.';
              $alert.success(alertText);
            });
          }
        };

        /**
         * This function avoids resetting the input value by just losing focus
         *
         * @param  {Object} event key event
         * @param  {String} query to be executed
         */
        vm.blurOnEnter = function(event, query) {
          if (event.which === 13) {
            vm.queryBql(query);
            event.preventDefault();
            event.target.blur();
            if (vm.entity !== 'lots') {
              vm.sortList();
            }
          }
        };

        /**
         * getterSetter function used in breadcrumb viewConfig
         *
         * @param  {string} newQuery user input with the queryBql
         * @return {string}          processed query from queryParamsFactory
         */
        vm.queryBql = function(newQuery) {
          //the setter, breadcrumb.queryBql(newValue);
          var filterlist = [];
          if (angular.isDefined(newQuery)) {

            /**
             * Auxiliary function, parses strings and stores filters in queryParamsFactory
             *
             * @param {string} rawFilter
             */
            var _addNewFilter = function(rawFilter) {
              //Pieces of the string, we only keep the non-empty pieces
              var _filterChunks = rawFilter.split(' ').filter(String);
              if (_filterChunks.length < 3) { return; }
              var fieldName = _filterChunks[0];
              _filterChunks = _filterChunks.slice(1);
              var operator = _filterChunks[0];
              _filterChunks = _filterChunks.slice(1);

              //After slicing the first two elements the rest is a query data
              var userInput = _filterChunks.join(' ');

              /**
               * filterFilter is an Angular Service,
               * it filters Objects with a attribute: value from an Array
               * it's not related at all with our filters
               */
              var field = filterFilter(
                vm.viewConfig.fields, {
                  'name': fieldName
                })[0];

              //if there isn't a field with that name we are done
              if (!field) {
                console.error('Invalid Query: %s', newQuery);
                return;
              }

              var newFilter = {
                condition: [operator, userInput].join(' '),
                field: field,
                toString: [fieldName, operator, userInput].join(' ')
              };
              _localQueryParams.addFilter(newFilter);
            };
            _localQueryParams.clearFilters();
            angular.forEach(newQuery.split(' and ').filter(String), _addNewFilter);
            $views.setViewDefinition({
              showAdvancedSearch: false
            });
          } else {
            //the getter, value = breadcrumb.queryBql()
            var _filterToString = function(filter) {
              filterlist.push([filter.field.name, filter.condition].join(' '));
            };
            angular.forEach(_localQueryParams.getFilters(), _filterToString);
          }
          _bqlInputValue = filterlist.join(' and ');
          return _bqlInputValue;
        };

        /**
         * @name _initConfiguration
         *
         * @description
         * When the view is loaded, it initiates different configurations. It gets the filtered Object from combining
         * contract entity with availableFields general object.
         */
        var initConfiguration = function() {
          if (!vm.isPartialView) {
            vm.viewDefinition = $views.setViewDefinition({
              loadingData: true
            });
            swagger.composeFields(vm.entity).then(function(availableFields) {
              sourcePartnerAvailableFields = availableFields;
              vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
              vm.viewDefinition.searchableFields = availableFields;
              if (vm.fieldsToRemove) {
                angular.forEach(vm.fieldsToRemove, function(element) {
                  var _elem = $filter('filter')(vm.partnerAvailableFields, { name: element.name });
                  if (_elem.length > -1) {
                    var _index =  vm.partnerAvailableFields.indexOf(_elem[0]);
                    vm.partnerAvailableFields.splice(_index, 1);
                  }
                });
              }
              var configurationsEntity = $api.createEntityObject({ entityName: 'configurations/' + vm.configName });
              $api.getEntity(configurationsEntity, function(success) {
                if (success.data) {
                  vm.viewConfig = success.data;
                  vm.viewDefinition.filterFields = swagger.composeFilterFields(
                    vm.partnerAvailableFields, vm.viewConfig);
                  vm.viewConfig.fields = angular.copy(vm.viewDefinition.filterFields);
                  vm.viewTempConfig = angular.copy(vm.viewConfig);
                  if (vm.viewConfig.storageKey) {
                    var storageService = simpleList.service(vm.viewConfig.storageKey);
                    storageService.set(vm.simpleListView, loadList);
                    vm.simpleListView = storageService.get();
                  }

                  createCustomSortableConfiguration();
                  vm.currentUlSortableOption = getSortableOptions();
                  queryParamsFactory.clear();

                  vm.sortList();

                  if (vm.viewConfig.custom) {
                    var conditionalFieldsStorageService = simpleList.service(vm.viewConfig.storageKey + 'Config');
                    conditionalFieldsStorageService.set(vm.viewConfig);
                  }
                }
              });
            });
          } else {
            var entity = vm.entity === 'saleevents/vehicles' ? 'vehicles' : vm.internalListReference;
            var promise = swagger.composeFields(entity);
            vm.exportData = {
              filterFields: [],
              params: {}
            };

            if (promise) {
              promise.then(function(availableFields) {
                sourcePartnerAvailableFields = availableFields;
                vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
                vm.viewDefinition.searchableFields = availableFields;
                if (vm.fieldsToRemove) {
                  angular.forEach(vm.fieldsToRemove, function(element) {
                    var _elem = $filter('filter')(vm.partnerAvailableFields, { name: element.name });
                    if (_elem.length > -1) {
                      var _index =  vm.partnerAvailableFields.indexOf(_elem[0]);
                      vm.partnerAvailableFields.splice(_index, 1);
                    }
                  });
                }
              });
            }

            var configurationsEntity = $api.createEntityObject({ entityName: 'configurations/' + vm.configName });
            $api.getEntity(configurationsEntity, function(success) {
              if (success.data) {
                vm.viewConfig = success.data;
                vm.exportData.filterFields = angular.copy(vm.viewConfig.fields);
                vm.viewTempConfig = angular.copy(vm.viewConfig);
                if (vm.viewConfig.storageKey) {
                  var storageService = simpleList.service(vm.viewConfig.storageKey);
                  storageService.set(vm.simpleListView, loadList);
                  vm.simpleListView = storageService.get();
                }

                createCustomSortableConfiguration();
                vm.currentUlSortableOption = getSortableOptions();
                _localQueryParams.clear();
                vm.sortList();

                if (vm.viewConfig.custom) {
                  var conditionalFieldsStorageService = simpleList.service(vm.viewConfig.storageKey + 'Config');
                  conditionalFieldsStorageService.set(vm.viewConfig);
                }
              }
            });
          }
        };

        vm.internalControlSimpleList.load = function() {
          if (!vm.isPartialView) {
            vm.resetScrollConfiguration();
            if (vm.load()) {
              vm.load()(false);
            }
          }
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

        initConfiguration();

        /**
         * changeOrder
         * It is a function that is called when you click on the table column titles
         * It adds a sort parameter (the column clicked) and calls a function to sort the list
         *
         * @param {object} field
         */
        vm.changeOrder = function(field) {
          var orderExists = vm.viewTempConfig.orderFields.filter(function(i) {
            return i.name === field.name;
          });
          if (orderExists.length) {
            orderExists[0].orderDescending = !orderExists[0].orderDescending;
          } else {
            vm.viewTempConfig.orderFields.push({
              'name': field.name,
              'orderDescending': true
            });
          }

          vm.sortList();
        };

        vm.editMode  = false;
        vm.changeEditMode = function() {
          vm.backupFields = angular.copy(vm.viewConfig.fields);
          vm.editMode  = !vm.editMode;
        };

        vm.disableColumn = function(field) {
          var fieldIndex =  vm.viewTempConfig.fields.indexOf(field);
          vm.viewTempConfig.fields.splice(fieldIndex, 1);
        };

        vm.setDisplayAs = function(field, displayAs) {
          field.displayAs = displayAs;
        };

        /**
         * @name saveEditChanges
         *
         * @description
         * This function save new configuration user in current session, and if it's persistent
         * is stored in db.
         */
        vm.saveEditChanges = function() {
          vm.editMode = false;
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

          vm.persistConfig = false;
          vm.sortList();
        };
        vm.cancelEditChanges = function() {
          vm.editMode = false;
          vm.viewConfig.fields = angular.copy(vm.backupFields);
        };

        vm.allocateToLot = saleEventDetails.assignToSaleEvent;

        vm.removeFromLot = saleEventDetails.removeFromSaleEvent;

        vm.addToUserRoles = userDetails.addToUserRoles;

        vm.removeFromUserRoles = userDetails.removeFromUserRoles;

        /**
         * baseSortableOptions
         * This object is used for set the base options of ui-sortable.
         *
         * Ui-sortable can be activated or deactivated setting in configuration the variable
         * "activateUiSortable" to true or false.
         *
         * @type {Object}
         */
        vm.baseSortableOptions = {
          revert: true,
          handle: '.ui-sortable-rows-handle',
          placeholder: 'ui-sortable-rows-placeholder',
          tolerance: 'pointer',
          cursor: 'pointer',
          forcePlaceholderSize: true,
          classes: {
            'ui-sortable-helper': 'ui-sortable-rows-helper'
          },
          start: function() {
            vm.viewDefinition.currentlyUsingSortable = true;
          },
          beforeStop: function() {
            vm.viewDefinition.currentlyUsingSortable = false;
          }
        };

        vm.assignToPackage = function(vehicle, index) {
          var bpm = $bpm.getData('salesChannelsModule', 'states');
          var assignToPackageMethod = bpm.unallocated.methods.assignToPackage.post;
          var packageVehicles = simpleList.service('packageVehiclesPackageDetailsView').get();
          var entity = $api.createEntityObject({
            entityName: assignToPackageMethod,
            objectSent: {
              parameters: {
                id: vehicle.id,
                packageId: $rootScope.packageDetailsData.id
              }
            }
          });

          $api.postEntity(entity, function() {
            vm.simpleListView.splice(vm.simpleListView.indexOf(vehicle), 1);
            packageVehicles.splice(index || 0, 0, vehicle);
            $alert.success('Method AddToPackage executed correctly.');
            packageDetails.packageData.vehicles = packageVehicles;
            packageDetails.calculateVehiclePrices(false);
            vm.counter -= 1;
          });
        };

        vm.removeToPackage = function(vehicle) {
          var bpm = $bpm.getData('salesChannelsModule', 'states');
          var removeFromPackageMethod = bpm.inPackage.methods.removeFromPackage.post;
          var telesalesVehicles = simpleList.service('telesalesVehiclesPackageStorage').get();
          var availableVehicles = simpleList.service('availableVehiclesPackageStorage').get();
          var entity = $api.createEntityObject({
            entityName: removeFromPackageMethod,
            objectSent: {
              parameters: {
                id: vehicle.id,
                packageId: $rootScope.packageDetailsData.id
              }
            }
          });

          $api.postEntity(entity, function() {
            var placeToPutMyVehicle = vehicle.lotPreviousId ? telesalesVehicles : availableVehicles;
            placeToPutMyVehicle.splice(0, 0, vehicle);
            vm.simpleListView.splice(vm.simpleListView.indexOf(vehicle), 1);
            $alert.success('Method RemoveFromPackage executed correctly.');
            packageDetails.calculateVehiclePrices(false);
          });
        };

        vm.loadMore = function() {
          _localQueryParams.setNextLastPage();
          loadList();
        };

        /**
         * @name isEditModeException
         * @memberof app._shared.views.simpleList.simpleListController
         *
         * @description
         * Check if any action of this list is an exception for the Non-Edit mode to disable the drag&drop
         *
         * @returns {Boolean}
         */
        vm.isEditModeException = function() {
          var _res = false;
          angular.forEach(vm.viewConfig.fields, function(field) {
            if (field.action && vm.viewDefinition.editModeExceptions.indexOf(field.name) !== -1) {
              _res = true;
            }
          });
          return _res;
        };
      }
  ]);
})();
