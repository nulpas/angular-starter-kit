(function() {
  'use strict';

  angular.module('app.layout.breadcrumb')
    .controller('breadcrumbController', [
      '$api',
      'localStorageService',
      'queryParamsFactory',
      'selectedListFactory',
      'filterFilter',
      '$state',
      '$stateParams',
      '$timeout',
      '$alert',
      '$sce',
      '$views',
      '$location',
      '$http',
      '$bpm',
      '$rootScope',
      'utilsFactory',
      function(
        $api,
        localStorageService,
        queryParamsFactory,
        selectedListFactory,
        filterFilter,
        $state,
        $stateParams,
        $timeout,
        $alert,
        $sce,
        $views,
        $location,
        $http,
        $bpm,
        $rootScope,
        utilsFactory) {
        var vm = this;
        var $c = $api.$;
        vm._shared = $c;
        vm.state = $state;
        vm.stateParams = $stateParams;
        vm.viewConfig = $views.getViewDefinition();
        vm.actualExportFileName = '';
        vm.editPackage = $rootScope;
        //This var holds the input value, required since Advanced Search
        //does not synchronize with its factory.
        var _bqlInputValue = null;

        /**
         * This function avoids resetting the input value by just losing focus
         *
         * @param  {Object} event key event
         */
        vm.blurOnEnter = function(event) {
          if (event.which === 13) {
            event.preventDefault();
            event.target.blur();
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
                vm.viewConfig.filterFields, {
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
              queryParamsFactory.addFilter(newFilter);
            };
            queryParamsFactory.clearFilters();
            angular.forEach(newQuery.split(' and ').filter(String), _addNewFilter);
            $views.setViewDefinition({
              showAdvancedSearch: false
            });
            vm.viewConfig.loadData(false);
          } else {
            //the getter, value = breadcrumb.queryBql()
            var _filterToString = function(filter) {
              filterlist.push([filter.field.name, filter.condition].join(' '));
            };
            angular.forEach(queryParamsFactory.getFilters(), _filterToString);
          }
          _bqlInputValue = filterlist.join(' and ');
          return _bqlInputValue;
        };

        //# Details
        vm.details = {
          set moveFields(value) {
            $views.setBoundProperty('moveFields', value);
          },
          get moveFields() {
            return $views.getViewDefinition().moveFields;
          },
          set editDetails(value) {
            $views.setBoundProperty('editDetails', value);
          },
          get editDetails() {
            return $views.getViewDefinition().editDetails;
          },
          set detailsExportJson(value) {
            $views.setBoundProperty('detailsExportJson', value);
          },
          get detailsExportJson() {
            return $views.getViewDefinition().detailsExportJson;
          },
          set detailsSaveConfig(value) {
            $views.setBoundProperty('detailsSaveConfig', value);
          },
          get detailsSaveConfig() {
            return $views.getViewDefinition().detailsSaveConfig;
          },
          get editForm() {
            return $views.getViewDefinition().editForm;
          },
          set updateEntity(value) {
            $views.setBoundProperty('updateEntity', value);
          },
          get updateEntity() {
            return $views.getViewDefinition().updateEntity;
          },
          set resetEntity(value) {
            $views.setBoundProperty('resetEntity', value);
          },
          get resetEntity() {
            return $views.getViewDefinition().resetEntity;
          }
        };

        vm.location = $location;
        vm.viewConfig = $views.setBoundProperty('selectedItems', selectedListFactory.getList());

        vm.excelData = null;

        vm.switchSelectMode = function() {
          $views.setBoundProperty('selectMode', !vm.viewConfig.selectMode);
          vm.viewConfig = $views.setBoundProperty('selectAll', false);

          if (vm.viewConfig.type === $c.LIST_VIEW) {
            vm.viewConfig.focusInList.switchSelectMode(vm.viewConfig.selectMode);
          } else if (vm.viewConfig.type === $c.GRID_VIEW) {
            vm.viewConfig.focusInGrid.switchSelectMode(vm.viewConfig.selectMode);
          } else if (vm.viewConfig.type === $c.GRID_MINI_VIEW) {
            vm.viewConfig.focusInMiniGrid.switchSelectMode(vm.viewConfig.selectMode);
          } else if (vm.viewConfig.type === $c.SIMPLE_LIST_VIEW) {
            vm.viewConfig.focusInSimpleList.switchSelectMode(vm.viewConfig.selectMode);
          }
        };

        vm.switchSelectAll = function() {
          vm.viewConfig = $views.setBoundProperty('selectAll', !vm.viewConfig.selectAll);

          if (vm.viewConfig.type === $c.LIST_VIEW) {
            vm.viewConfig.focusInList.switchSelectAll(vm.viewConfig.selectAll);
          } else if (vm.viewConfig.type === $c.GRID_VIEW) {
            vm.viewConfig.focusInGrid.switchSelectAll(vm.viewConfig.selectAll);
          } else if (vm.viewConfig.type === $c.GRID_MINI_VIEW) {
            vm.viewConfig.focusInMiniGrid.switchSelectAll(vm.viewConfig.selectAll);
          } else if (vm.viewConfig.type === $c.SIMPLE_LIST_VIEW) {
            vm.viewConfig.focusInSimpleList.switchSelectAll(vm.viewConfig.selectAll);
          }
        };

        vm.isIndeterminate = function() {
          var condition01 = (vm.viewConfig.selectedItems.length !== 0);
          var condition02 = (vm.viewConfig.selectedItems.length !== vm.viewConfig.data.length);
          return condition01 && condition02;
        };

        vm.changeListType = function(type) {
          if (vm.viewConfig.type !== type) {
            $views.setBoundProperty('type', type);
            $views.setBoundProperty('selectMode', false);
            vm.viewConfig = $views.setBoundProperty('selectAll', false);
            selectedListFactory.clearList();
          }
        };

        vm.toggleAdvancedSearch = function(showAdvancedSearch) {
          vm.viewConfig = $views.setBoundProperty('showAdvancedSearch', !showAdvancedSearch);
        };

        /**
         * @name exportToExcel
         *
         * @description
         * Export current view into a CSV file, with all possible fields, or just the current
         * @param {boolean} allFields -> whether we are exporting all fields or not
         */
        vm.exportToExcel = function(allFields) {
          var message = 'Preparing your excel file...';
          $alert.info(message);
          var excelFileEntity = _getExportEntityObject();

          var _apiURL = $api.getApiConfig().apiBaseUrl;
          var fieldList = [];
          angular.forEach(vm.viewConfig.filterFields, function(field) {
            fieldList.push(field.name);
          });
          var _requestProperties = {
            method: 'GET',
            url: _apiURL + '/' + excelFileEntity.entityName,
            headers: {
              'Authorization': localStorageService.get('apiToken'),
              'Accept': 'text/csv',
              'Accept-Language': 'en'
            },
            params: {
              '$select': !allFields ? fieldList.join(',') : '',
              '$filter': excelFileEntity.params.$filter ? excelFileEntity.params.$filter : ''
            }
          };

          $http(_requestProperties).then(_successCallback, _errorCallback);

          function _successCallback(success) {
            var anchor = angular.element('<a/>');
            var replacement = success.data.replace('ID', 'Id');

            anchor.attr({
              href: 'data:attachment/csv,' + encodeURI(replacement),
              target: '_blank',
              download: vm.actualExportFileName + '.csv'
            })[0].click();
          }

          function _errorCallback(error) {
            $alert.info(error.data);
          }
        };

        function _getExportEntityObject() {
          var entityObject = {
            entityName: '',
            params: {
              $filter: ''
            }
          };

          if (Object.keys($state.params).length > 0) {
            var keys = Object.keys($state.params);
            var lastParamKey = keys[keys.length - 1];
            var lastParam = $state.params[lastParamKey];
            var bpmProcessesPlain = $bpm.get().processesPlain[lastParam];
            var bpmProcessName = (bpmProcessesPlain.name + 'Vehicles').replace(/([A-Z]+)*([A-Z][a-z])/g, '$1 $2');
            bpmProcessName = bpmProcessName.toUpperCase();
            entityObject.entityName = 'vehicles';
            var dottedKey = 'processes.' +
              $state.params.param1 + '.modules.' +
              $state.params.param2 + '.states.' +
              $state.params.param3 + '.filter';
            entityObject.params.$filter = utilsFactory.getValueFromDotedKey($bpm.get(), dottedKey);
            vm.actualExportFileName = bpmProcessName + ' ' + moment().format('YYYY-MM-DD');
          } else {
            var entity = $state.current.name.split('.').pop();
            entityObject.entityName = entity.toLowerCase();
            vm.actualExportFileName = entity.toUpperCase() + ' ' + moment().format('YYYY-MM-DD');
          }

          return $api.createEntityObject(entityObject);
        }
      }
    ]);
})();
