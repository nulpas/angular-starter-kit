(function() {
  'use strict';

  angular.module('app._shared.views.configuration')
    .controller('configurationController', [
      '$api',
      '$views',
      '$alert',
      'login',
      function($api, $views, $alert, login) {
        var vm = this;
        vm.data = [];
        vm.isBcaAdmin = login.getUserInfo().partner.name  === 'BCA Admin';
        vm.selectedOptions = {};
        var entity = null;
        var configurationEntity = $api.createEntityObject({
          entityName: 'configurations/'  + vm.dataStructureName
        });
        $api.getEntity(configurationEntity, function(response) {
          vm.configStructure = response.data;
        });

        /**
         * @name dataLoad
         *
         * @description
         * Main function for load checkbox list data from entity. This loads at first chosen options list, and
         * after the available options list, in order to show all in concordance.
         *
         * @param {Object} partner -> The partner user.
         */
        vm.dataLoad = function(partner) {
          entity = angular.copy(vm.dataOriginEntity);
          if (entity.indexOf('{partnerId}') > -1) {
            vm.partner = partner;
            var _temp = entity.split('{partnerId}');
            entity = _temp[0] + partner.id + _temp[1];
          }
          var entityObj = $api.createEntityObject({
            entityName: entity
          });
          $api.getEntity(entityObj, function(responseChosenFields) {
            vm.chosenFields = responseChosenFields.data;
            var _tempEntity = vm.chosenFields.refParent;
            if (vm.chosenFields.refParent.indexOf('{partnerId}') > -1) {
              var _temp = vm.chosenFields.refParent.split('{partnerId}');
              _tempEntity = _temp[0] + partner.id + _temp[1];
            }
            var entityParent = $api.createEntityObject({
              entityName: _tempEntity
            });
            $api.getEntity(entityParent, function(responseAvailableFields) {
              vm.availableFields = responseAvailableFields.data;

              if (vm.availableFields.fields && vm.availableFields.ownFields) {
                vm.availableFields.fields = vm.availableFields.fields.concat(vm.availableFields.ownFields);
              } else if (!vm.availableFields.fields && vm.availableFields.ownFields) {
                vm.availableFields.fields = angular.copy(vm.availableFields.ownFields);
              } else if (!vm.availableFields.fields && !vm.availableFields.ownFields) {
                vm.availableFields.fields = [];
              }

              if (vm.chosenFields.fields) {
                angular.forEach(vm.availableFields.fields, function(_item) {
                  vm.selectedOptions[_item] = (vm.chosenFields.fields.indexOf(_item) > -1);
                });
              }
            });
          });
        };

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
            if (vm.chosenFields.fields) {
              vm.chosenFields.fields.length = 0;
            } else {
              vm.chosenFields.fields = [];
            }
            angular.forEach(vm.selectedOptions, function(_value, _key) {
              if (vm.selectedOptions[_key]) {
                vm.chosenFields.fields.push(_key);
              }
            });
            var _entityObj = $api.createEntityObject({
              entityName: entity,
              objectSent: vm.chosenFields
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
            if (vm.partner) {
              vm.dataLoad(vm.partner);
            }
            $alert.info('Changes reverted', 'info');
          }
        };

        /**
         * @name updateSelection
         *
         * @description
         * Updates selected option for checkbox list with unique value
         *
         * @param {Object} option -> The chosen option.
         */
        vm.updateSelection = function(option) {
          angular.forEach(vm.selectedOptions, function(_value, _key) {
            vm.selectedOptions[_key] = (_key === option);
          });
        };

        vm.viewDefinitionObject = $views.getViewDefinition();
        vm.viewDefinitionObject.settings = vm.settings;
        $views.setViewDefinition(vm.viewDefinitionObject);

        if (!vm.isBcaAdmin) {
          vm.partner = login.getUserInfo().partner;
          vm.dataLoad(vm.partner);
        }

      }
    ]);
})();
