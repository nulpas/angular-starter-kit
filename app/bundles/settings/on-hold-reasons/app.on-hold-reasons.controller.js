(function() {
  'use strict';

  angular.module('app.settings.onHoldReasons')
  .controller('onHoldReasonsController', [
    '$api',
    '$views',
    '$alert',
    '$stateParams',
    'login',
    'detailsFactory',
    'selectedListFactory',
    function(
      $api,
      $views,
      $alert,
      $stateParams,
      login,
      detailsFactory,
      selectedListFactory
    ) {
      var vm = this;
      var entityName = 'configurations/onHoldReasons';
      var configurationPath = entityName + 'View';
      var detailsService = detailsFactory.service(entityName);
      var selectMode = $stateParams.index !== undefined;
      var selectedList = selectedListFactory.getList();
      var selectedListIndex = $stateParams.index;
      var entityObject = {
        entityName: entityName
      };
      var dataOriginEntity = login.getUserInfo()
        .profileMenus['menu.settings']
        .items['menu.onHoldReasons']
        .entity;

      /**
       * _initConfiguration
       *
       * @description
       * This method initializes the controller.
       *
       * @private
       */
      function _initConfiguration() {
        if (selectMode) {
          vm.reasons = selectedList[selectedListIndex];
        } else {
          $api.getEntity(entityObject)
            .then(function(sourceData) {
              vm.reasons = sourceData.data;
            });
        }

        //Set up details configuration
        if (!detailsService.get()) {
          var entity = $api.createEntityObject({
            entityName: configurationPath
          });
          $api.getEntity(entity, function(response) {
            detailsService.set(response.data);
            detailsService.get().entityObject = entityObject;
            vm.config = detailsService.get();
          });
        } else {
          vm.config = detailsService.get();
        }
      }

      /**
       * @name settings
       *
       * @description
       * Main object intended to be used outside of this controller (in the breadcrumb).
       */
      vm.settings = {
        /**
         * @name saveDataChanges
         *
         * @description
         * Save chosen options for this checkbox list and this partner
         */
        'saveDataChanges': function() {
          var _entityObj = $api.createEntityObject({
            entityName: dataOriginEntity,
            objectSent: vm.reasons
          });
          $api.postEntity(_entityObj, function() {
            $alert.success('Changes saved', 'success');
          });
        },

        /**
         * @name cancelDataChanges
         *
         * @description
         * Cancel made modifications for this checkbox list and this partner, reloading old list
         */
        'cancelDataChanges': function() {
          _initConfiguration();
          $alert.info('Changes reverted', 'info');
        }
      };

      vm.viewDefinitionObject = $views.getViewDefinition();
      vm.viewDefinitionObject.settings = vm.settings;
      $views.setViewDefinition(vm.viewDefinitionObject);

      _initConfiguration();

    }]);
})();
