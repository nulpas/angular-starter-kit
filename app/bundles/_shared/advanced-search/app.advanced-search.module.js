(function() {
  'use strict';

  angular.module('app._shared.advanced-search', [
    'app._shared.advanced-search.num-filter',
    'app._shared.advanced-search.text-filter',
    'app._shared.advanced-search.date-filter',
    'app._shared.advanced-search.enum-filter',
    'app._shared.advanced-search.boolean-filter'
  ]);
})();
