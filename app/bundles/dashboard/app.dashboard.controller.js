(function() {
  'use strict';

  angular.module('app.dashboard')
    .controller('dashboardController', [
      '$api',
      '$q',
      '$state',
      'login',
      'pieChartConf',
      'pieChartConfigData',
      '$views',
      function($api, $q, $state, login, pieChartConf, pieChartConfigData, $views) {
        var vm = this;
        var _baseEntityObject = angular.copy(pieChartConfigData.BASE_ENTITY_OBJECT);
        vm.salesChannelVehiclesChart = {};
        vm.salesChannelVehiclesChart = {};
        vm.allSla = {};
        vm.isBcaAdmin = login.getUserInfo().partner.name  === 'BCA Admin';

        if (!vm.isBcaAdmin) {
          _slaVehiclesConfig();
          vm.salesChannelVehiclesChart =
            pieChartConf.getGeneralPieConfiguration('remarketingProcess', 'salesChannelsModule');
        }

        /**
         * @name app.dashboard#_slaVehiclesConfig
         *
         * @description
         * Set the necessary config for all SLAs in "vm.allSla" variable.
         *
         * @private
         */
        function _slaVehiclesConfig() {
          var promises = {};

          var slaInformation = login.getUserInfo().partner.configuration.slas;

          angular.forEach(slaInformation, function(element, index) {
            var baseEntityObject = angular.copy(_baseEntityObject);
            // If the query includes any 'X days ago' then it will be parsed.
            if (element.days) {
              element.days = moment().subtract(element.days, 'days').format('YYYY-MM-DD');
              element.filter = replaceStringWithLocalData(element.filter, element.days);
            }
            // Creates the entity object the custom sla filters
            var filter = element.filter;
            baseEntityObject.params.$filter = filter;
            var entityObject = $api.createEntityObject(baseEntityObject);

            // Add the SLA to the 'allSla' list
            vm.allSla[index] = {};
            vm.allSla[index].label = element.title;
            vm.allSla[index].routeState = element.state;
            vm.allSla[index].routeStateParams = element.param;
            angular.extend(vm.allSla[index].routeStateParams, { 'customFilter': filter });

            promises[index] = $api.getEntity(entityObject);
          });

          _processSlaPromises(promises);
        }

        /**
         * @name app.dashboard#_processSlaPromises
         *
         * @description
         * Process SLAs promises.
         *
         * @param {Object} promises -> An object with the promises to be processed.
         *
         * @private
         */
        function _processSlaPromises(promises) {
          $q.all(promises).then(function(success) {
            angular.forEach(success, function(element, index) {
              vm.allSla[index].value = element._cursor.totalFiltered;
            });
          });
        }

        /**
         * @name app.dashboard#salesChannelVehiclesChartClickHandler
         *
         * @description
         * Click handler for the pie chart of sales channel vehicles.
         *
         * @param {Object} chartElements -> An object with information of involved charts elements.
         */
        vm.salesChannelVehiclesChartClickHandler = function(chartElements) {
          pieChartConf.clickHandler(chartElements, vm.salesChannelVehiclesChart.routes);
        };

        /**
         * @name app.dashboard#slaClickHandler
         *
         * @description
         * Click handler for the sla widget.
         *
         * @param {Object} sla -> An object with information of clicked sla.
         */
        vm.slaClickHandler = function(sla) {
          $views.setBoundProperty('customFilter', sla.routeStateParams.customFilter);
          $state.go(sla.routeState, sla.routeStateParams);
        };

        /**
         * replace all "${attribute}" ocurrences in a string
         * with local data stored in vm.data.attribute
         *
         * @param  {string} elem input string form configuration
         * @param  {string} source input string form configuration
         * @return {string}      parsed string without any ${attribute}
         */
        function replaceStringWithLocalData(elem, source) {
          var replacer = function(match, p1, p2, p3) {
            return [p1,  source, p3].join('');
          };
          return elem.replace(/(.*)\$\{(\w+)\}(.*)/gi, replacer);
        }
      }
    ]);
})();
