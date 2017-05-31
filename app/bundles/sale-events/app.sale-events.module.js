(function() {
  'use strict';

  angular
    /**
     * @namespace sale-events
     * @memberof app.layout
     *
     * @description
     * Definition of module "sale events".
     */
    .module('app.layout.sale-events', [
      'app.sale-events.sale-event-details',
      'app.layout.sale-events.sale-event-file',
      'app.layout.sale-events.sale-event-table'
    ]);
})();
