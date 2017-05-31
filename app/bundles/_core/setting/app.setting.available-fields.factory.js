(function() {
  'use strict';

  angular
    .module('app._core.setting')
    /**
     * @namespace availableFields
     * @memberof app._core.setting
     *
     * @requires $api
     * @requires $q
     *
     * @description
     * Factory that calls API for get available fields (fieldsOnCall) and store it.
     */
    .factory('availableFields', availableFields);

  availableFields.$inject = ['$api', '$q'];

  function availableFields($api, $q) {
    var _availableFields = $q.defer();

    _loadAvailableFields();

    return {
      get: get
    };

    /**
     * @name _loadAvailableFields
     * @memberof app._core.setting.availableFields
     *
     * @description
     * Calls API for available fields (fieldsOnCall) and resolve it into a defer variable.
     *
     * @private
     */
    function _loadAvailableFields() {
      var entityAvailableFields = $api.createEntityObject({ entityName: 'configurations/fieldsOnCall' });
      $api.getEntity(entityAvailableFields, function(success) {
        _availableFields.resolve(success.data);
      });
    }

    /**
     * @name get
     * @memberof app._core.setting.availableFields
     *
     * @description
     * Function to return available fields promise.
     *
     * @returns {Promise}
     */
    function get() {
      return _availableFields.promise;
    }
  }
})();
