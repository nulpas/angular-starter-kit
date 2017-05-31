(function() {
  'use strict';
  angular.module('app.sale-events.sale-event-details')
  /**
   * @namespace saleEventDetailsController
   * @memberof app.layout.sale-events.sale-event-details
   *
   * @requires $api
   * @requires $views
   * @requires $stateParams
   * @requires detailsFactory
   * @requires selectedListFactory
   * @requires $filter
   * @requires saleEventDetails
   * @requires $rootScope
   * @requires $alert
   * @requires login
   *
   * @description
   * Controller for handle the details view of a sale event.
   */
    .controller('saleEventDetailsController', [
      '$api',
      '$views',
      '$stateParams',
      'detailsFactory',
      'selectedListFactory',
      '$filter',
      'saleEventDetails',
      '$rootScope',
      '$alert',
      'login',
      '$q',
      function(
        $api,
        $views,
        $stateParams,
        detailsFactory,
        selectedListFactory,
        $filter,
        saleEventDetails,
        $rootScope,
        $alert,
        login,
        $q) {
        var vm = this;
        var entityObject = $api.createEntityObject({ entityName: 'saleevents' });
        var selectMode = $stateParams.index !== undefined;
        var selectedList = selectedListFactory.getList();
        var selectedListIndex = $stateParams.index;
        var detailsService = detailsFactory.service('saleEventsDetailsView');
        var contractService = detailsFactory.service('entityContract');
        vm.translations = login.getUserInfo().translation;
        if ($rootScope.packageDetailsData) {
          delete $rootScope.packageDetailsData;
        }
        if (angular.isDefined($stateParams.saleEventId)) {
          entityObject.entityId = $stateParams.saleEventId;
          $views.getViewDefinition().editDetails = false;
          $views.getViewDefinition().moveFields = false;
        } else {
          $views.getViewDefinition().editDetails = true;
          $views.getViewDefinition().moveFields = false;
        }

        // Reset the Non-Edit mode
        $views.setViewDefinition({
          editModeDisabled: false,
          editModeExceptions: []
        });

        /**
         * @name app.sale-events.sale-event-details.saleEventDetailsController#getLabel
         *
         * @description
         * Return translation of a given label
         * @param {string} fieldName
         * @returns {string}
         */
        vm.getLabel = function(fieldName) {
          return vm.translations[fieldName] ? vm.translations[fieldName] : fieldName;
        };

        /**
         * @name app.sale-events.sale-event-details.saleEventDetailsController#executePublication
         *
         * @description
         * This function calls 'executePublication' function in sale event details factory.
         */
        vm.executePublication = function(dialogSelector) {
          saleEventDetails.executePublication(vm.dataOriginEntity);
          vm.closeDialog(dialogSelector);
        };

        /**
         * @name app.sale-events.sale-event-details.saleEventDetailsController#closeDialog
         *
         * @description
         * This function closes the confirmation dialog at publishing a sale event.
         *
         * @param {String} dialogSelector
         */
        vm.closeDialog = function(dialogSelector) {
          var dialog = document.querySelector(dialogSelector);

          document.querySelector('main.mdl-layout__content').style.overflowY = '';
          dialog.close();
          document.querySelector('main.mdl-layout__content').style.overflowY = 'auto';
        };

        /**
         * @name app.sale-events.sale-event-details.saleEventDetailsController#locateCard
         *
         * @description
         * Locate an specific card within an array of sections
         *
         * @param {Object} sections -> The sections to look into
         * @param {String} searchAttribute -> The attribute that will be check.
         * @param {String} searchValue -> The value the attribute has to have.
         * @returns {Object}
         */
        vm.locateCard = function(sections, searchAttribute, searchValue) {
          // Locating the card
          var card = {};
          angular.forEach(sections, function(section) {
            if (section.cards[0][searchAttribute] === searchValue) {
              card = section.cards[0];
            }
          });
          return card;
        };

        // TODO - Integrate the three sources of data prior to load the VM
        /**
         * @name app.sale-events.sale-event-details.saleEventDetailsController#refillFieldSections
         *
         * @description
         * This function refills specified card with all the fields in the contract.
         *
         * @param {Object} fieldCard -> The view configuration card.
         */
        vm.refillFieldSections = function(fieldCard) {
          var newElements = [];
          var rowCount = 0;
          var newElementRow = [];
          var newElement = [];
          var properties = {};
          var container = {};
          // We iterate over all properties available, trying to determine in which section they are,
          // binding the properties of the field to modify them
          angular.forEach(contractService.get(), function(property, propertyKey) {
            if (propertyKey && property.type !== 'array' && propertyKey !== 'id') {
              container = $filter('filter')(fieldCard.fieldsSections, {
                name: propertyKey
              })[0];
              if (angular.isDefined(container)) {
                properties = $filter('filter')(container, {
                  name: propertyKey
                })[0];
              } else {
                properties = null;
              }
              if (properties) {
                newElement = {
                  name: properties.name,
                  title: properties.title,
                  size: properties.size,
                  type: properties.type
                };
                if (properties.action) {
                  newElement.action = properties.action;
                }
                if (properties.disabled) {
                  newElement.disabled = properties.disabled;
                }
              } else {
                newElement = {
                  name: propertyKey,
                  title: propertyKey,
                  size: '33',
                  type: 'string'
                };
              }
              newElementRow.push(newElement);
              rowCount ++;
            }
          });
          if (newElementRow.length > 0) {
            newElements.push(newElementRow);
            newElementRow = [];
          }
          fieldCard.fieldsSections = newElements;
        };

        /**
         * @name app.sale-events.sale-event-details.saleEventDetailsController#_configurationProcessing
         *
         * @description
         * Make the necessary changes to the configuration.
         *
         * @param {Object} response -> Response of the configuration promise.
         */
        function _configurationProcessing(response) {
          /**
           * @description
           * If we are creating a sale event, we must delete all sections of the configuration
           * except the first one, needed to create the sale event.
           */
          if (!angular.isDefined($stateParams.saleEventId)) {
            response.data.sections.splice(1);
          }

          detailsService.set(response.data);
          detailsService.get().entityObject = entityObject;
          vm.dataStructureName = detailsService.get();
          contractPromise.then(function(response) {
            var _entityContract = response.data.models.Saleevent.properties;
            angular.forEach(_entityContract, function(property, propertyName) {
              //Change when better way to identify api call is implemented
              if (angular.isDefined(property.$ref) && property.description === 'apiCall') {
                //Api Calls
                var propertyEntity = $api.createEntityObject({ entityName: property.$ref });
                $api.getEntity(propertyEntity, function(responseContract) {
                  property.enum = responseContract.data;
                  if (propertyName === 'salesChannel' && !property.enum.length) {
                    property.enum = [];
                    $alert.error(
                      vm.getLabel('noActiveSalesChannel'),
                      vm.getLabel('salesChannelRequired'),
                      60000
                    );
                  }
                });
              } else if (angular.isDefined(property.$ref)) {
                //Referenced properties
                angular.forEach(response.data.models[property.$ref], function(refProperty, refKey) {
                  property[refKey] = refProperty;
                });
              }
            });
            contractService.set(_entityContract);
            vm.entityContract = contractService.get();
            vm.refillFieldSections(vm.locateCard(vm.dataStructureName.sections, 'title', 'Sale Event Details'));
          });

          /**
           * @description
           * We must check the validation from back-end to see if the sale event is in non-edit mode
           * and the exceptions it has.
           */
          if (vm.dataOriginEntity.configuration) {
            if (vm.dataOriginEntity.configuration.validation) {
              // Check if non-edit mode is active
              if (!vm.dataOriginEntity.configuration.validation.editable) {
                // Disable Edit Mode button from Breadcrumb and disable edit
                $views.setViewDefinition({
                  editDetails: false,
                  editModeDisabled: true,
                  editModeExceptions: vm.dataOriginEntity.configuration.validation.exceptions
                });
                // Show the message with the reason why is disabled
                if (vm.dataOriginEntity.configuration.validation.message) {
                  $alert.info(vm.dataOriginEntity.configuration.validation.message);
                }
                //
              }
            }
          }

        }

        var configurationEntity = $api.createEntityObject({ entityName: 'configurations/saleEventsDetailsView' });
        var contractEntity = $api.createEntityObject({ entityName: 'saleevents/contract' });
        var configurationPromise = $api.getEntity(configurationEntity);
        var contractPromise = $api.getEntity(contractEntity);

        if (selectMode) {
          vm.dataOriginEntity = selectedList[selectedListIndex];
          configurationPromise.then(function(response) {
            _configurationProcessing(response);
          });
        } else if (angular.isDefined($stateParams.saleEventId)) {
          // Validation of the Sale Event Details View
          var neededForValidation = {
            config: configurationPromise,
            data: $api.getEntity(entityObject)
          };
          $q.all(neededForValidation).then(function(success) {
            vm.dataOriginEntity = success.data.data;
            _configurationProcessing(success.config);
          });

        } else {
          vm.dataOriginEntity = {};
          configurationPromise.then(function(response) {
            _configurationProcessing(response);
          });
        }

      }
    ]);
})();
