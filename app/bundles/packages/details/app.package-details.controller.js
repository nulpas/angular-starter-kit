(function() {
  'use strict';

  angular.module('app.packages.package-details')
    .controller('packageDetailsController', [
      '$api',
      '$views',
      '$stateParams',
      '$filter',
      'selectedListFactory',
      'swagger',
      '$rootScope',
      'packageDetails',
      function($api, $views, $stateParams, $filter, selectedListFactory, swagger, $rootScope, packageDetails) {
        var vm = this;
        var entityObject = $api.createEntityObject({ entityName: 'packages' });
        var selectMode = $stateParams.index !== undefined;
        var selectedList = selectedListFactory.getList();
        var selectedListIndex = $stateParams.index;
        vm.configName = 'packageDetailsView';
        vm.entity = 'packages';
        if (angular.isDefined($stateParams.packageId)) {
          entityObject.entityId = $stateParams.packageId;
          $views.getViewDefinition().editDetails = false;
          $views.getViewDefinition().moveFields = false;
        } else {
          $views.getViewDefinition().editDetails = true;
          $views.getViewDefinition().moveFields = false;
          if ($rootScope.packageDetailsData) {
            delete $rootScope.packageDetailsData;
          }
        }

        // Reset the Non-Edit mode
        $views.setViewDefinition({
          editModeDisabled: false,
          editModeExceptions: []
        });

        if (selectMode) {
          vm.dataOriginEntity = selectedList[selectedListIndex];
          // Disable all actions for cancelled/sold packages
          if (vm.dataOriginEntity.packageStatus === 'Sold' || vm.dataOriginEntity.packageStatus === 'Cancelled') {
            $views.setViewDefinition({
              editModeDisabled: true,
              editModeExceptions: []
            });
          }
        } else if (angular.isDefined($stateParams.packageId)) {
          $api.getEntity(entityObject, function(success) {
            vm.dataOriginEntity = success.data;
            $rootScope.packageDetailsData = success.data;
            if (vm.dataOriginEntity.packageStatus === 'Sold' || vm.dataOriginEntity.packageStatus === 'Cancelled') {
              // Disable all actions for cancelled/sold packages
              $views.setViewDefinition({
                editModeDisabled: true,
                editModeExceptions: []
              });
            }
          });
        } else {
          vm.dataOriginEntity = {};
        }

        var _initConfiguration = function() {

          swagger.composeFields(vm.entity).then(function(availableFields) {
            var sourcePartnerAvailableFields = availableFields; //This shoud be the contract + availablefields
            vm.getApiList(sourcePartnerAvailableFields);
            // vm.entityContract = sourcePartnerAvailableFields;
            $views.getViewDefinition().searchableFields = availableFields;
            vm.entityContract = [];
            angular.forEach(sourcePartnerAvailableFields, function(contractField) {
              vm.entityContract[contractField.name]  = contractField;
            });

            vm.partnerAvailableFields = angular.copy(sourcePartnerAvailableFields);
            var configurationEntity = $api.createEntityObject({ entityName: 'configurations/' + vm.configName });
            $api.getEntity(configurationEntity, function(success) {
              if (success.data) {
                /**
                 * @type Object
                 * @property {Object} orderFields
                 * @property {*} storageKey
                 */
                vm.dataStructureName = success.data;
                /**
                 * @description
                 * If we are creating a sale event, we must delete all sections of the configuration
                 * except the first one, needed to create the sale event.
                 */
                if (!angular.isDefined($stateParams.packageId)) {
                  vm.dataStructureName.sections.splice(1);
                }
                vm.dataStructureName.entityObject = entityObject;
                vm.viewTempConfig = angular.copy(vm.dataStructureName);
              }
            });
          });
        };

        /**
         * @name app._shared.views.list#getApiList
         *
         * @description
         * Loads into an array the possible enum values for an action.
         *
         * @param {Object} actionParams
         */
        vm.getApiList = function(actionParams) {
          if (actionParams) {
            angular.forEach(actionParams, function(element) {
              if (element.description === 'apiCall') {
                element.enum = [];
                var apiCallEntity = $api.createEntityObject({ entityName: '/' + element.$ref });
                $api.getEntity(apiCallEntity, function(success) {
                  angular.merge(element.enum, success.data);
                });
              }
            });
          }
        };

        vm.closeDialog = function(dialogSelector) {
          var dialog = document.querySelector(dialogSelector);

          document.querySelector('main.mdl-layout__content').style.overflowY = '';
          dialog.close();
          document.querySelector('main.mdl-layout__content').style.overflowY = 'auto';
        };

        vm.cancelPackage = function(selector) {
          packageDetails.executeCancelPackageAction();
          vm.closeDialog(selector);
        };

        vm.sellPackage = function(selector) {
          packageDetails.executeSellPackageAction();
          vm.closeDialog(selector);
        };

        _initConfiguration();
      }
    ]);
})();
