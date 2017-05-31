(function() {
  'use strict';

  angular.module('app._shared.pie-chart-configuration')
    .factory('pieChartConf', [
      '$bpm',
      '$api',
      '$q',
      '$state',
      '$tools',
      'login',
      'pieChartConfigData',
      function($bpm, $api, $q, $state, $tools, login, pieChartConfigData) {
        var _mainMenus = login.getUserInfo().mainMenus;

        return {
          getGeneralPieConfiguration: _generalPieConfiguration,
          getCustomPieConfiguration: _getCustomPieConfiguration,
          clickHandler: _clickHandler
        };

        /**
         * @name app._shared.pie-chart-configuration#_generalPieConfiguration
         *
         * @description
         * Creates a configuration for a pie chart using data of the BPM.
         *
         * @param {String} processName -> The BPM process name.
         * @param {String} moduleName -> The BPM module name.
         *
         * @private
         */
        function _generalPieConfiguration(processName, moduleName) {
          var moduleStatesPromises = _createPromises(moduleName);
          var configurationObjects = {
            chartConfiguration: angular.copy(pieChartConfigData.BASE_PIE_CHART_CONFIGURATION),
            stateConfiguration: {}
          };

          _processMainMenus(moduleName, processName, configurationObjects);
          _processPromises(moduleStatesPromises, configurationObjects);

          return configurationObjects.chartConfiguration;
        }

        /**
         * @name app._shared.pie-chart-configuration#_getCustomPieConfiguration
         *
         * @description
         * Creates a configuration for a pie chart using promises and stateConfiguration.
         *
         * @param {Object} promises -> An object containing the promises with needed data.
         * @param {Object} stateConfiguration -> See pieChartConfigData -> BASE_STATE_CONFIGURATION_OBJECT.
         *
         * @private
         */
        function _getCustomPieConfiguration(promises, stateConfiguration) {
          var configurationObjects = {
            chartConfiguration: angular.copy(pieChartConfigData.BASE_PIE_CHART_CONFIGURATION),
            stateConfiguration: stateConfiguration
          };

          _processPromises(promises, configurationObjects);
          return configurationObjects.chartConfiguration;
        }

        /**
         * @name app._shared.pie-chart-configuration#_clickHandler
         *
         * @description
         * General click handler for the pie chart component. The behaviour of this handler is to navigate to a
         * concrete work list.
         *
         * @param {Array} chartElements -> An object containing the clicked chartElement.
         * @param {Object} chartRouteData -> An object containing the necessary information to navigate to the required
         * work list.
         *
         * @private
         */
        function _clickHandler(chartElements, chartRouteData) {
          if (!chartElements.length) {
            return;
          }

          var chartElementClicked = chartElements[0]._model.label;
          var route = chartRouteData[chartElementClicked].stateRoute;
          var routeParams = chartRouteData[chartElementClicked].stateRouteParams;

          $state.go(route, routeParams);
        }

        /**
         * @name app._shared.pie-chart-configuration#_createPromises
         *
         * @description
         * Create promises. A promises for state in a module.
         *
         * @param {String} moduleName -> The BPM module name.
         *
         * @private
         */
        function _createPromises(moduleName) {
          var promises = {};
          var moduleStates = $bpm.getData(moduleName, 'states');

          angular.forEach(moduleStates, function(state, stateName) {
            var baseEntityObject = angular.copy(pieChartConfigData.BASE_ENTITY_OBJECT);
            baseEntityObject.params.$filter = state.filter;
            var entityObject = $api.createEntityObject(baseEntityObject);
            promises[stateName] = $api.getEntity(entityObject);
          });

          return promises;
        }

        /**
         * @name app._shared.pie-chart-configuration#_createPieChartData
         *
         * @description
         * Set specific chart configuration.
         *
         * @param {Object} chartConfiguration
         * @param {Object} stateConfiguration
         *
         * @private
         */
        function _createPieChartData(chartConfiguration, stateConfiguration) {
          var _labels = [];
          var _data = [];
          var _routes = {};

          angular.forEach(stateConfiguration, function(element, index) {
            _labels.push(element.stateName);
            _data.push(element.value);
            _routes[index] = {};
            _routes[index].stateRoute = element.stateRoute;
            _routes[index].stateRouteParams = element.stateRouteParams;
          });

          chartConfiguration.labels = _labels;
          chartConfiguration.data = _data;
          chartConfiguration.routes = _routes;
        }

        /**
         * @name app._shared.pie-chart-configuration#_processPromises
         *
         * @description
         * Process the promises to obtain needed information.
         *
         * @param {Object} promises
         * @param {Object} configurationObjects
         *
         * @private
         */
        function _processPromises(promises, configurationObjects) {
          $q.all(promises).then(function(sucess) {
            angular.forEach(sucess, function(stateData, stateName) {
              var stateDataObject = {};
              stateDataObject[stateName] = {};
              stateDataObject[stateName].value = stateData._cursor.totalFiltered;
              angular.merge(configurationObjects.stateConfiguration, stateDataObject);
            });
            _createPieChartData(configurationObjects.chartConfiguration, configurationObjects.stateConfiguration);
          });
        }

        /**
         * @name app._shared.pie-chart-configuration#_createPieChartData
         *
         * @description
         * Process the main menus of BPM to obtain needed information.
         *
         * @param {String} mdlName => The module name.
         * @param {String} processName
         * @param {Object} configurationObjects
         *
         * @private
         */
        function _processMainMenus(mdlName, processName, configurationObjects) {
          var mainMenusProcess = _mainMenus['menu.' + processName].items;
          var mainMenusModules = mainMenusProcess['menu.' + processName + '.' + mdlName].items;

          angular.forEach(mainMenusModules, function(module, name) {
            var stateName = name.split('.').pop();
            configurationObjects.stateConfiguration[stateName] = {};
            configurationObjects.stateConfiguration[stateName].stateRoute = module.state;
            configurationObjects.stateConfiguration[stateName].stateRouteParams = module.param;
            configurationObjects.stateConfiguration[stateName].stateName = stateName;
          });
        }
      }
    ]);
})();
