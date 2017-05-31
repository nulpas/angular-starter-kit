(function() {
  'use strict';

  /**
   * @name app.sale-events.sale-event-details.saleEventDetailsData
   *
   * @description
   * A service containing messages related to sale events details.
   */
  angular.module('app.sale-events.sale-event-details')
    .service('saleEventDetailsData', [
      function() {
        this.SUCCESS_MESSAGE_ASSIGN_TO_SALE_EVENT = 'Action "Assign to sale event" executed correctly.';
        this.SUCCESS_MESSAGE_REMOVE_FROM_SALE_EVENT = 'Action "Remove from sale event" executed correctly.';
        this.SUCCESS_MESSAGE_CHANGE_LOT_INDEX = 'List reordered. New lot index: ';
        this.SUCCESS_MESSAGE_CHANGE_SAVED = 'Changes saved.';
        this.PUBLICATION_STATUS_TRIGGERED = 'triggered';
      }
    ]);
})();
