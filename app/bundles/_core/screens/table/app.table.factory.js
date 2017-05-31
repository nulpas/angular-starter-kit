(function() {
  'use strict';

  angular
    .module('app._core.screens.table')
    .factory('tables', tables);

  tables.$inject = ['shape'];

  function tables(shape) {
    return {
      assembleScreenObject: assembleScreenObject
    };

    function assembleScreenObject(screenSettings) {
      return {
        data: screenSettings.data.data,
        _cursor: screenSettings.data._cursor.plain(),
        fields: screenSettings.fields,
        actions: screenSettings.view.data.actions,
        image: screenSettings.view.data.image,
        orderFields: screenSettings.view.data.orderFields,
        uniqueName: _assembleUniqueName(screenSettings.source),
        entityName: screenSettings.source.entity
      };
    }

    function _assembleUniqueName(source) {
      return shape.tag(source);
    }
  }
})();
