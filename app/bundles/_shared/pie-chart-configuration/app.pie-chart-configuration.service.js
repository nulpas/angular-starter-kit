(function() {
  'use strict';

  angular.module('app._shared.pie-chart-configuration')
    .service('pieChartConfigData', [
      function() {
        this.DEFAULT_COLORS = ['#ff5252', '#5e90ce', '#85ea88', '#e9ea9a', '#daa32e', '#6e76dc', '#d271d8'];
        this.BASE_PIE_CHART_CONFIGURATION = {
          labels: [],
          data: [],
          type: 'pie',
          colors: this.DEFAULT_COLORS,
          options: {}
        };

        this.BASE_STATE_CONFIGURATION_OBJECT = {
          stateName: '',
          stateRoute: '',
          stateRouteParams: {}
        };

        this.BASE_ENTITY_OBJECT =  {
          entityName: 'vehicles',
          params: {
            $filter: '',
            $select: '_id'
          }
        };
      }
    ]);
})();
