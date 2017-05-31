(function() {
  'use strict';

  angular.module('app.log.logDetails')
  /**
   * @namespace logDetailsController
   * @memberof app.log.logDetails
   *
   * @requires $api
   * @requires $stateParams
   * @requires $views
   * @requires detailsFactory
   * @requires selectedListFactory
   * @requires $rootScope
   *
   * @description
   * Controller to handle the details view of a log.
   */
  .controller('logDetailsController', [
    '$api',
    '$stateParams',
    '$views',
    'detailsFactory',
    'selectedListFactory',
    '$rootScope',
    function(
      $api,
      $stateParams,
      $views,
      detailsFactory,
      selectedListFactory,
      $rootScope
    ) {
      var vm = this;
      vm.configName = 'configurations/importLogDetailsView';
      var detailsService = detailsFactory.service(vm.configName);
      var selectMode = $stateParams.index !== undefined;
      var selectedList = selectedListFactory.getList();
      var selectedListIndex = $stateParams.index;
      var entityObject = {
        entityName: 'import/logs',
        entityId: $stateParams.importLogId
      };

      if ($rootScope.packageDetailsData) {
        delete $rootScope.packageDetailsData;
      }

      // Reset the Non-Edit mode
      $views.setViewDefinition({
        editModeDisabled: false,
        editModeExceptions: []
      });

      /**
       * @name app.log.logDetails.logDetailsController#_initConfiguration
       * @memberof app.log.logDetails.logDetailsController
       *
       * @description
       * This method initializes the controller.
       *
       * @private
       */
      function _initConfiguration() {
        if (!detailsService.get()) {
          var entity = $api.createEntityObject({
            entityName: vm.configName
          });
          $api.getEntity(entity, function(success) {
            detailsService.set(success.data);
            detailsService.get().entityObject = entityObject;
            vm.config = detailsService.get();
          });
        } else {
          vm.config = detailsService.get();
        }

        if (selectMode) {
          vm.vehicle = selectedList[selectedListIndex];
        } else {
          // If the entity comes from a workList, a different call shall be made
          var entityFromList = $views.getDetailsCallParameters($views.getAction());
          // Restore action
          $views.setAction(null);
          var entityObj = entityFromList.length ? entityFromList : $api.createEntityObject(entityObject);
          $api.getEntity(entityObj, function(sourceData) {
            vm.vehicle = angular.isArray(sourceData.data) ? sourceData.data[0] : sourceData.data;
            if (sourceData._cursor) {
              var previous = sourceData._cursor.previous ? sourceData._cursor.previous.replace('/api/', '') : null;
              var next = sourceData._cursor.next ? sourceData._cursor.next.replace('/api/', '') : null;
              $views.setDetailsCallParameters(previous, next);
            }
          });
        }
        var contractEntity = $api.createEntityObject({
          entityName: 'import/logs/contract'
        });
        $api.getEntity(contractEntity, function(success) {
          vm.entityContract = success.data.models.ImportLog.properties;
        });
      }

      _initConfiguration();
    }]);
})();
