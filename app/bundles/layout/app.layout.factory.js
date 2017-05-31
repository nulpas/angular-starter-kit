(function() {
  'use strict';

  angular.module('app.layout')
    .factory('$views', [
      function() {
        var viewDefinition = {
          type: null,
          data: [],
          //# Advanced Search
          showAdvancedSearch: false,
          //# Grid Configuration
          gridCols: [],
          //# Items Selection
          selectedItems: [],
          selectAll: false,
          selectMode: false,
          //# Drag
          draggable: null,
          //# Objects to use in each instance of multipleSelectionZone directive
          focusInList: null,
          focusInGrid: null,
          focusInMiniGrid: null,
          focusInSimpleList: null,
          //#current function LoadData
          loadData: null,
          //#current start scroll event of view
          startScrollEvent: null,
          stopScrollEvent: null,
          //#variable used to indicate if i's loading data
          loadingData: false,
          //#object used to store allowed filter fields of one entity
          filterFields: [],
          //#object used to store searchable fields of one entity
          searchableFields: [],
          //Details
          moveFields: false,
          editDetails: false,
          detailsSaveConfig: null,
          detailsExportJson: null,
          selectedListIndex: null,
          transitionEffectTo: '',
          updateEntity: null,
          resetEntity: null,
          //Settings view
          settings: null,
          editForm: null,
          action: null,
          //Parameters used to navigate through details one item at a time
          detailsCallParameters: {},
          detailsCallMenu: null,
          totalElements: null,
          currentElement: null,
          currentlyUsingSortable: false,
          // Parameters used to block the edition in the sale events
          editModeDisabled: null,
          editModeExceptions: []
        };

        return {
          getViewDefinition: function() {
            return viewDefinition;
          },
          setBoundProperty: function(property, value) {
            viewDefinition[property] = value;
            return viewDefinition;
          },
          setNewViewDefinition: function(vDO) {
            viewDefinition = angular.extend({}, viewDefinition, vDO);
            return viewDefinition;
          },
          setViewDefinition: function(viewDefinitionObject) {
            //Only updates the attributes defined inside viewDefinition, new attributes will throw an error!
            for (var attribute in viewDefinitionObject) {
              if (viewDefinitionObject.hasOwnProperty(attribute) && viewDefinition.hasOwnProperty(attribute)) {
                viewDefinition[attribute] = viewDefinitionObject[attribute];
              } else {
                throw new ReferenceError('Attribute: ' + attribute + ' not defined in $view.viewDefinition ');
              }
            }
            return viewDefinition;
          },
          getDetailsCallParameters: function(action) {

            if (action) {
              viewDefinition.detailsCallParameters.entityName = viewDefinition.detailsCallParameters[action];
              viewDefinition.detailsCallParameters.nextElement = null;
              viewDefinition.detailsCallParameters.previousElement = null;
              viewDefinition.detailsCallParameters.params = {};
            }
            if (viewDefinition.detailsCallParameters.params) {
              viewDefinition.detailsCallParameters.params.$top = 1;
            }
            return viewDefinition.detailsCallParameters;
          },
          setDetailsCallParameters: function(previousElement, nextElement) {
            viewDefinition.detailsCallParameters.previousElement = previousElement;
            viewDefinition.detailsCallParameters.nextElement = nextElement;
          },
          setAction: function(action) {
            viewDefinition.action = action;
          },
          getAction: function() {
            return viewDefinition.action;
          }
        };
      }
    ]);
})();
