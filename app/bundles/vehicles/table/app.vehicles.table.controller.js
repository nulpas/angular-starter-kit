(function() {
  'use strict';

  angular
    .module('app.vehicles.vehicle-table')
    /**
     * @namespace SaleEventTableController
     * @memberof app.layout.sale-events.sale-event-table
     *
     * @requires $api
     * @requires shape
     * @requires $q
     * @requires view
     *
     * @description
     * Controller for handle the table view of a sale events.
     */
    .controller('VehiclesTableController', VehicleTable);

  VehicleTable.$inject = ['$api', 'shape', '$q', 'view'];

  function VehicleTable($api, shape, $q, view) {
    /* First of all we need to charge all data: */
    var _entityQueryObject = $api.createEntityObject({
      entityName: view.entity
    });
    var _screen = {
      fields: shape.init(view),
      view: shape.getConfigView(view),
      data: $api.getEntity(_entityQueryObject),
      source: view
    };

    var vm = this;
    vm.definition = getDataDefinition();

    /**
     * @name getDataDefinition
     * @memberof app.layout.sale-events.sale-event-table.SaleEventFileController
     *
     * @description
     * Returns object promise with all screen definitions (_screen).
     *
     * @returns {Promise}
     */
    function getDataDefinition() {
      return $q.all(_screen);
    }
  }
})();
