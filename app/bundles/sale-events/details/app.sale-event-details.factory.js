(function() {
  'use strict';

  /**
   * @name app.sale-events.sale-event-details.saleEventDetails
   *
   * @description
   * This factory contains the main functionality of sale events details.
   *
   * @requires $alert
   * @requires $api
   * @requires $state
   * @requires $tools
   * @requires simpleList
   * @requires saleEventDetailsData
   * @requires $bpm
   */
  angular.module('app.sale-events.sale-event-details')
    .factory('saleEventDetails', [
      '$alert',
      '$api',
      '$state',
      '$tools',
      'simpleList',
      'saleEventDetailsData',
      '$bpm',
      function($alert, $api, $state, $tools, simpleList, saleEventDetailsData, $bpm) {
        var actualSaleEvent = null;

        /**
         * _getModuleFromVehicle
         *
         * @description
         * This function checks if 'item' object exists in passed array, based in the id of the objects.
         *
         * @param {Object} vehicle
         * @param {String} statusName
         * @returns {Object} _vehicleStatus
         * @private
         */
        function _getModuleFromVehicle(vehicle, statusName) {
          var _vehicleStatus = {};

          angular.forEach(vehicle.status, function(element) {
            if (element.moduleName === statusName) {
              _vehicleStatus = element;
            }
          });

          return _vehicleStatus;
        }

        /**
         * _moveVehicleToLot
         *
         * @description
         * Move the vehicle to the sale event, converting the vehicle to a lot during the process.
         *
         * @param {Object} vehicle -> The vehicle to move from sales channel vehicles model to the sale event.
         * @param {Object} saleEvent -> The sale event where the vehicle will be allocated.
         * @private
         */
        var _moveVehicleToLot = function(vehicle, saleEvent) {
          var saleEventEntity = $api.createEntityObject({
            entityName: 'saleevents',
            entityId: saleEvent.id
          });
          $api.getEntity(saleEventEntity, function() {
            var detailsLotsService = simpleList.service('lotsStorage');
            var detailsSalesChannelService = simpleList.service('salesChannelStorage');
            var lotsData = detailsLotsService.get();
            var salesChannelData = detailsSalesChannelService.get();

            salesChannelData.splice(salesChannelData.indexOf(vehicle), 1);
            lotsData.load();

            if (saleEvent.publication.state !== saleEventDetailsData.PUBLICATION_STATUS_TRIGGERED) {
              actualSaleEvent.configuration.showPublishButton = true;
            }
            $alert.success(saleEventDetailsData.SUCCESS_MESSAGE_ASSIGN_TO_SALE_EVENT);
          });
        };

        /**
         * _assignToSaleEvent
         *
         * @description
         * Assign one vehicle into a sale event.
         *
         * @param {Object} vehicle -> The vehicle to assign in a sale event.
         * @param {Integer} targetIndex -> The position where the vehicle will be dropped.
         * @private
         */
        var _assignToSaleEvent = function(vehicle, targetIndex) {
          var vehicleSalesChannelModule = _getModuleFromVehicle(vehicle, 'salesChannelsModule');
          var saleChannel = vehicleSalesChannelModule.stateName;
          var saleEventId = actualSaleEvent.id;
          var saleChannelStates = $bpm.getData('salesChannelsModule', 'states');
          var actualSaleChannelState = {};
          var indexParameter = angular.isNumber(targetIndex) ? targetIndex : null;

          angular.forEach(saleChannelStates, function(element, index) {
            if (index === saleChannel) {
              actualSaleChannelState = element;
            }
          });

          var entity = $api.createEntityObject({
            entityName: actualSaleChannelState.methods.assignToSaleEvent.post,
            objectSent: {
              parameters: {
                id: vehicle.id,
                saleEventId: saleEventId,
                index: indexParameter
              }
            }
          });

          $api.postEntity(entity, function(success) {
            _moveVehicleToLot(vehicle, success.data);
          });
        };

        /**
         * _moveLotToSalesChannelVehicles
         *
         * @description
         * Move the lot to the sales channel vehicles model, converting the lot to a vehicle during the process.
         *
         * @param {Object} vehicle -> The lot to move from a sale event to sales channel vehicles model.
         * @param {Integer} targetIndex -> The position where the vehicle will be dropped.
         * @private
         */
        var _moveLotToSalesChannelVehicles = function(vehicle, targetIndex) {
          var detailsLotsService = simpleList.service('lotsStorage');
          var detailsSalesChannelService = simpleList.service('salesChannelStorage');
          var lotsData = detailsLotsService.get();
          var salesChannelData = detailsSalesChannelService.get();

          var vehiclesEntity = $api.createEntityObject({
            entityName: 'vehicles',
            entityId: vehicle.id
          });
          $api.getEntity(vehiclesEntity, function(success) {
            var message = saleEventDetailsData.SUCCESS_MESSAGE_REMOVE_FROM_SALE_EVENT;
            lotsData.splice(lotsData.indexOf(vehicle), 1);
            salesChannelData.splice(targetIndex, 0, success.data);
            if (lotsData.length === 0) {
              actualSaleEvent.configuration.showPublishButton = false;
            }
            $alert.success(message);
          });
        };

        /**
         * _removeFromSaleEvent
         *
         * @description
         * Remove a lot from a sale event.
         *
         * @param {Object} vehicle -> The vehicle to remove from a sale event.
         * @param {Integer} targetIndex -> The position where the vehicle will be dropped.
         * @private
         */
        var _removeFromSaleEvent = function(vehicle, targetIndex) {
          var lotId = vehicle.lot.id;
          var vehicleId = vehicle.id;
          var salesChannelsStates = $bpm.getData('salesChannelsModule', 'states');

          if (lotId && vehicleId) {
            var entity = $api.createEntityObject({
              entityName: salesChannelsStates.inSaleEvent.methods.removeFromSaleEvent.post,
              objectSent: {
                parameters: {
                  id: vehicleId
                }
              }
            });
            $api.postEntity(entity, function() {
              _moveLotToSalesChannelVehicles(vehicle, targetIndex);
            });
          }
        };

        /**
         * _changeLotIndex
         *
         * @description
         * This function changes the index of a sale event.
         *
         * @param {Integer} newIndex
         * @private
         */
        var _changeLotIndex = function(newIndex) {
          var lotsId = [];
          angular.forEach(simpleList.service('lotsStorage').get(), function(vehicle) {
            lotsId.push({ 'id': vehicle.lot.id });
          });
          var updateEntityObject = $api.createEntityObject({
            entityName: 'saleevents/',
            entityId: actualSaleEvent.id,
            objectSent: {
              lots: lotsId
            }
          });

          $api.update(updateEntityObject, function() {
            $alert.success(saleEventDetailsData.SUCCESS_MESSAGE_CHANGE_LOT_INDEX + (newIndex + 1));
          });
        };

        var uiSortableObject = {
          vehiclesInSalesChannelSortable: {
            connectWith: '.log-wrapper',
            update: function(e, ui) {
              var originModel = ui.item.sortable.sourceModel;
              var targetModel = ui.item.sortable.droptargetModel;
              var item = ui.item.sortable.model;
              var targetIndex = ui.item.sortable.dropindex;

              ui.item.sortable.cancel();
              if (originModel !== targetModel && !ui.item.sortable.received) {
                _assignToSaleEvent(item, targetIndex);
              }
            }
          },
          lotsOfSaleEventSortable: {
            connectWith: '.log-wrapper',
            update: function(e, ui) {
              var originModel = ui.item.sortable.sourceModel;
              var targetModel = ui.item.sortable.droptargetModel;
              var item = ui.item.sortable.model;
              var targetIndex = ui.item.sortable.dropindex;

              // If sorting is being done between lists.
              if (originModel !== targetModel) {
                ui.item.sortable.cancel();
                if (!ui.item.sortable.received) {
                  _removeFromSaleEvent(item, targetIndex);
                }
              }
            },
            stop: function(e, ui) {
              var originModel = ui.item.sortable.sourceModel;
              var targetModel = ui.item.sortable.droptargetModel;
              var targetIndex = ui.item.sortable.dropindex;

              // If sorting is being done between lists.
              if (originModel === targetModel) {
                _changeLotIndex(targetIndex);
              }
            }
          }
        };

        return {
          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#assignToSaleEvent
           *
           * @description
           * See documentation of '_assignToSaleEvent' function.
           */
          assignToSaleEvent: _assignToSaleEvent,

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#removeFromSaleEvent
           *
           * @description
           * See documentation of '_removeFromSaleEvent' function.
           */
          removeFromSaleEvent: _removeFromSaleEvent,

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#getSortableConfiguration
           *
           * @description
           * Getter for ui-sortable configurations of a sale event details.
           *
           * @param {String} configurationName
           * @returns {Object} The ui-sortable configuration requested.
           */
          getSortableConfiguration: function(configurationName) {
            return uiSortableObject[configurationName];
          },

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#actualSaleEvent
           *
           * @description
           * Getter/Setter for actual sale event.
           *
           * @param {Object} saleEvent -> The actual sale event to store.
           * @returns {Object} Sale Event -> If no param provided in function call, returns the actual sale event.
           */
          actualSaleEvent: function(saleEvent) {
            var condition = angular.isDefined(saleEvent);
            return condition ? (actualSaleEvent = saleEvent) : actualSaleEvent;
          },

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#showPublishButton
           *
           * @description
           * Establishes visibility of publication object in another view, from publication object.
           *
           * @returns {Boolean}
           */
          showPublishButton: function() {
            if (!actualSaleEvent) {
              return false;
            }
            return (actualSaleEvent.configuration && actualSaleEvent.configuration.showPublishButton);
          },

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#publishSaleEvent
           *
           * @description
           * Throws the dialog to confirm if the user really want to publish the sale event.
           *
           */
          publishSaleEvent: function() {
            var dialog = document.querySelector('#publish-confirmation-dialog');
            if (!dialog.showModal) {
              dialogPolyfill.registerDialog(dialog);
            }
            dialog.showModal();
          },

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#changeFieldsBySaleChannel
           *
           * @description
           * Add an attribute to fields of Sale Event Form in order to hide or show them
           *
           * @param {String} saleChannel -> The name of the channel we just selected
           * @param {Object} sections -> The sections of the main details card
           */
          changeFieldsBySaleChannel: function(saleChannel, sections) {
            // If no SaleChannel is selected, the only field we get to see is that one
            if (!angular.isDefined(saleChannel)) {
              angular.forEach(sections, function(section) {
                angular.forEach(section, function(field) {
                  field.hide = (field.name !== 'salesChannel');
                });
              });
              return;
            }
            var configurationsEntity = $api.createEntityObject({ entityName: 'configurations/' + saleChannel });
            $api.getEntity(configurationsEntity, function(success) {
              var _fields = (success.data.fields ? success.data.fields : []);
              var _optionalFields = (success.data.optionalFields ? success.data.optionalFields : []);
              _fields.push('salesChannel');
              angular.forEach(sections, function(section) {
                angular.forEach(section, function(field) {
                  field.hide = (_fields.indexOf(field.name) < 0 && _optionalFields.indexOf(field.name) < 0);
                });
              });
            });
          },

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#changeFieldsBySaleType
           *
           * @description
           * Add an attribute to fields of Sale Event Form in order to hide or show them
           *
           * @param {String} saleType -> The name of the sale type we just selected
           * @param {Object} sections -> The sections of the main details card
           * @param {Object} lotsSection -> Section with a deferred object that needs to be resolved.
           */
          changeFieldsBySaleType: function(saleType, sections, lotsSection) {
            if (!actualSaleEvent) {
              return;
            }
            var eAuctionChannel = actualSaleEvent.salesChannel === 'eAuction';
            var eSalesAndTenderSales = actualSaleEvent.salesChannel === 'eSales' && saleType === 'Tender sale';
            var lotsViewConfigService = simpleList.service('lotsStorageConfig');
            var lotsViewConfig = lotsViewConfigService.get();
            if (!lotsViewConfig) {
              return;
            }
            var conditionalField = lotsViewConfig.custom.conditionalFields[0];

            if ((eAuctionChannel || eSalesAndTenderSales) && lotsSection) {
              lotsViewConfig.fields.splice(-1, 0, conditionalField);
            } else {
              var fieldToHideIndex = lotsViewConfig.fields.indexOf(conditionalField);
              if (fieldToHideIndex !== -1) {
                lotsViewConfig.fields.splice(fieldToHideIndex, 1);
              }
            }

            // TODO: Commented section of code so we can continue this in the U.S. BIMS-1731
            // angular.forEach(sections, function(section) {
            //   angular.forEach(section, function(field) {
            //     console.log(field.subItems);
            //     field.hide = (field.name !== saleType);
            //   });
            // });
          },

          /**
           * @name app.sale-events.sale-event-details.saleEventDetails#executePublication
           *
           * @description
           * Executes the post call of one sale event publication to BizTalk
           *
           * @param {Object} saleEvent
           */
          executePublication: function(saleEvent) {
            /**
             * _onSuccess
             *
             * @description
             * Success response of publication
             *
             * @param {Object} response -> response callback object.
             * @private
             */
            var _onSuccess = function(response) {
              if (actualSaleEvent) {
                actualSaleEvent.configuration.showPublishButton = false;
                actualSaleEvent['publication.state'] = saleEventDetailsData.PUBLICATION_STATUS_TRIGGERED;
              }
              saleEvent = response.data;
              $alert.success(saleEventDetailsData.SUCCESS_MESSAGE_CHANGE_SAVED);
              $state.reload();
            };

            var publicationObject = $api.createEntityObject({
              entityName: 'saleevents/' + saleEvent.id + '/publications',
              entityId: saleEvent.id,
              objectSent: saleEvent
            });

            $api.postEntity(publicationObject, _onSuccess);
          }
        };
      }
    ]);
})();
