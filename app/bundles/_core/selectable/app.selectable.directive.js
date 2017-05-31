(function() {
  'use strict';

  angular
    .module('app._core.selectable')
    /**
     * @namespace bcaSelectable
     * @memberof app._core.selectable
     *
     * @requires selectedEntities
     *
     * @description
     * Directive definition for selectable functionality.
     */
    .directive('bcaSelectable', bcaSelectable);

  bcaSelectable.$inject = ['selectedEntities'];

  function bcaSelectable(selectedEntities) {
    var _buffer = [];
    var _invertBuffer = [];
    var _directiveScope = {};

    return {
      restrict: 'A',
      scope: {
        uniqueStoreName: '=bcaSelectableStoreName'
      },
      link: link
    };

    function link(scope, elem) {
      _directiveScope = scope;
      $(elem).selectable(_assembleSelectableOptions());
    }

    /**
     * @name _assembleSelectableOptions
     * @memberof app._core.selectable.bcaSelectable
     *
     * @description
     * Assemble the options for selectable component.
     *
     * @private
     */
    function _assembleSelectableOptions() {
      return {
        cancel: '#' + _directiveScope.uniqueStoreName + '.not-selectable',
        filter: '.is-selectable',
        selected: _selectedEventHandler,
        unselected: _unselectedEventHandler,
        stop: _stopEventHandler
      };
    }

    /**
     * @name _selectedEventHandler
     * @memberof app._core.selectable.bcaSelectable
     *
     * @param event
     * @param ui
     *
     * @description
     * Event handler for "selected" event.
     *
     * @private
     */
    function _selectedEventHandler(event, ui) {
      var elementId = _getEntityId(ui.selected);
      var buffersObject = {
        true: _invertBuffer,
        false: _buffer
      };
      buffersObject[event.ctrlKey].push(elementId);
    }

    /**
     * @name _unselectedEventHandler
     * @memberof app._core.selectable.bcaSelectable
     *
     * @param event
     * @param ui
     *
     * @description
     * Event handler for "unselected" event.
     *
     * @private
     */
    function _unselectedEventHandler(event, ui) {
      var elementId = _getEntityId(ui.unselected);
      if (selectedEntities.exists(_directiveScope.uniqueStoreName)) {
        selectedEntities.removeEntityFromList(_directiveScope.uniqueStoreName, elementId);
      }
    }

    /**
     * @name _stopEventHandler
     * @memberof app._core.selectable.bcaSelectable
     *
     * @param event
     *
     * @description
     * Event handler for "stop" event.
     *
     * @private
     */
    function _stopEventHandler(event) {
      var prototypeObject = {
        true: _invertSelection,
        false: _sendBufferToSelectedEntities
      };
      prototypeObject[event.ctrlKey](_directiveScope.uniqueStoreName);
      if (selectedEntities.selectAllActivated(_directiveScope.uniqueStoreName)) {
        selectedEntities.setValueForSelectAll(_directiveScope.uniqueStoreName, false);
      }
      _directiveScope.$apply();
    }

    /**
     * @name _invertSelection
     * @memberof app._core.selectable.bcaSelectable
     *
     * @param listName
     *
     * @description
     * Sends the "_invertBuffer" to "selectedEntitiesFactory". For each element on the buffer, if exists it is removed,
     * if not exists, the element is added.
     *
     * @private
     */
    function _invertSelection(listName) {
      if (!selectedEntities.exists(listName)) {
        selectedEntities.createList(listName);
      }
      selectedEntities.invertSelection(listName, _invertBuffer);
      _invertBuffer.splice(0, _invertBuffer.length);
    }

    /**
     * @name _sendBufferToSelectedEntities
     * @memberof app._core.selectable.bcaSelectable
     *
     * @param listName
     *
     * @description
     * First removes existing selected id's in the factory, after that sends the buffer to be added.
     *
     * @private
     */
    function _sendBufferToSelectedEntities(listName) {
      if (!selectedEntities.exists(listName)) {
        selectedEntities.createList(listName);
      } else {
        selectedEntities.removeAll(listName);
      }
      selectedEntities.addEntityToList(listName, _buffer);
      _buffer.splice(0, _buffer.length);
    }

    /**
     * @name _getEntityId
     * @memberof app._core.selectable.bcaSelectable
     *
     * @param element
     *
     * @description
     * Get's the entity id from the scope of the element.
     *
     * @private
     */
    function _getEntityId(element) {
      return angular.element(element).scope().entity.id;
    }
  }
})();
