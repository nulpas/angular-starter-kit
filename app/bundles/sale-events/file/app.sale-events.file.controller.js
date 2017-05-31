(function() {
  'use strict';

  angular
    .module('app.layout.sale-events.sale-event-file')
    /**
     * @namespace SaleEventFileController
     * @memberof app.layout.sale-events.sale-event-file
     *
     * @requires $api
     * @requires shape
     * @requires $q
     * @requires view
     *
     * @description
     * Controller for handle the details view of a sale event.
     */
    .controller('SaleEventFileController', SaleEventFile);

  SaleEventFile.$inject = ['$api', 'shape', '$q', 'view'];

  function SaleEventFile($api, shape, $q, view) {
    /* First of all we need to charge all data: */
    var _entityQueryObject = $api.createEntityObject({
      entityName: view.entity,
      entityId: view.entityId
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
     * @memberof app.layout.sale-events.sale-event-file.SaleEventFileController
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
