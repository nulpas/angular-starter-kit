(function() {
  'use strict';

  angular
    .module('app._core.screens.table')
    /**
     * @namespace selectedEntities
     * @memberof app._core.screens.table
     *
     * @requires $tools
     * @requires $api
     *
     * @description
     * Factory to handle selected entities of selectable element.
     */
    .factory('selectedEntities', selectedEntities);

  selectedEntities.$inject = ['$tools', '$api'];

  function selectedEntities($tools, $api) {
    var allSelectedObject = {};
    var selectAllModelsObject = {};

    return {
      exists: exists,
      itemExists: itemExists,
      createList: createList,
      getList: getList,
      getSelectAllList: getSelectAllList,
      addEntityToList: addEntityToList,
      removeEntityFromList: removeEntityFromList,
      removeAll: removeAll,
      selectOrDeselectAll: selectOrDeselectAll,
      setValueForSelectAll: setValueForSelectAll,
      toggleSelectable: toggleSelectable,
      selectAllActivated: selectAllActivated,
      invertSelection: invertSelection
    };

    /**
     * @name exists
     * @memberof app._core.screens.table.selectedEntities
     *
     * @description
     * Check if a list of selected entities actually exists.
     *
     * @param {String} listName
     * @returns {Boolean}
     */
    function exists(listName) {
      return $tools.checkContent(allSelectedObject, listName);
    }

    /**
     * @name itemExists
     * @memberof app._core.screens.table.selectedEntities
     *
     * @description
     * Checks if a given item exists in a given list.
     *
     * @param {String} listName
     * @param {String} entity
     * @returns {Boolean}
     */
    function itemExists(listName, entity) {
      return exists(listName) ? allSelectedObject[listName].indexOf(entity) > -1 : false;
    }

    /**
     * @name createList
     * @memberof app._core.screens.table.selectedEntities
     *
     * @description
     * Creates a list for a given name.
     *
     * @param {String} listName
     */
    function createList(listName) {
      _checkArguments([listName], 'createList');
      allSelectedObject[listName] = [];
    }

    /**
     * @name getList
     * @memberof app._core.screens.table.selectedEntities
     *
     * @description
     * Gets the list of selected items by a given name.
     *
     * @param {String} listName
     */
    function getList(listName) {
      return allSelectedObject[listName] ? allSelectedObject[listName] : {};
    }

    /**
     * @name getList
     * @memberof app._core.screens.table.selectedEntities
     *
     * @description
     * Gets selectAll value's list.
     *
     * @returns {Object}
     */
    function getSelectAllList() {
      return selectAllModelsObject;
    }

    /**
     * @name addEntityToList
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {String} listName
     * @param {String} entity
     *
     * @description
     * Adds an entity to a certain list.
     */
    function addEntityToList(listName, entity) {
      _checkArguments([listName, entity], 'addEntityToList');
      if (!exists(listName)) {
        throw 'Method "addEntitiesToList": The ' + listName + ' list doesn\'t exists.';
      }
      if (angular.isArray(entity)) {
        $tools.arrayMerge(allSelectedObject[listName], entity);
      } else {
        allSelectedObject[listName].push(entity);
      }
    }

    /**
     * @name removeEntityFromList
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {String} listName
     * @param {String} entity
     *
     * @description
     * Removes an entity from a certain list.
     */
    function removeEntityFromList(listName, entity) {
      _checkArguments([listName, entity], 'removeEntityFromList');
      $tools.removeArrayItem(allSelectedObject[listName], entity);
      selectAllModelsObject[listName] = false;
    }

    /**
     * @name removeAll
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {String} listName
     *
     * @description
     * Removes all entities from a certain list.
     */
    function removeAll(listName) {
      _checkArguments([listName], 'removeAll');
      if (exists(listName)) {
        allSelectedObject[listName].splice(0, allSelectedObject[listName].length);
        selectAllModelsObject[listName] = false;
      }
    }

    /**
     * @name selectOrDeselectAll
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {String} selectAll
     * @param {Object} context
     *
     * @description
     * Actives or deactivates select all functionality from a certain list.
     */
    function selectOrDeselectAll(selectAll, context) {
      var prototypeObject = {
        true: _selectAllEntities,
        false: removeAll
      };
      _checkArguments([selectAll, context], 'selectOrDeselectAll');
      if (!exists(context.uniqueName)) {
        createList(context.uniqueName);
      }
      prototypeObject[selectAll](selectAll ? context : context.uniqueName);
    }

    /**
     * @name setValueForSelectAll
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {String} listName
     * @param {Boolean} value
     *
     * @description
     * Changes the value of selectAll model.
     */
    function setValueForSelectAll(listName, value) {
      _checkArguments([listName, value], 'setValueForSelectAll');
      selectAllModelsObject[listName] = value;
    }

    /**
     * @name toggleSelectable
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {Object} context
     * @param {Boolean} enableSelectable
     *
     * @description
     * Toggles off the selectable functionality.
     */
    function toggleSelectable(context, enableSelectable) {
      _checkArguments([context, enableSelectable], 'toggleSelectable');
      if (!enableSelectable) {
        removeAll(context.uniqueName);
        selectAllModelsObject[context.uniqueName] = false;
      }
    }

    /**
     * @name selectAllActivated
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {String} listName
     *
     * @description
     * Check for a certain list if select all functionality is actived.
     */
    function selectAllActivated(listName) {
      _checkArguments([listName], 'selectAllActivated');
      return selectAllModelsObject.hasOwnProperty(listName);
    }

    /**
     * @name invertSelection
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {String} listName
     * @param {Array} entities
     *
     * @description
     * For each entities on the entities array. if entity exists it is removed,
     * if not exists, the element is added.
     */
    function invertSelection(listName, entities) {
      _checkArguments([listName, entities], 'invertSelection');
      var prototypeObject = {
        true: removeEntityFromList,
        false: addEntityToList
      };
      angular.forEach(entities, function(element) {
        prototypeObject[itemExists(listName, element)](listName, element);
      });
    }

    /**
     * @name _selectAllEntities
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {Object} context
     *
     * @description
     * Makes an api call to get all the id's of actual entity (For example: saleevents).
     * @private
     */
    function _selectAllEntities(context) {
      var entityName = context.entityName;
      var callObject = $api.createEntityObject({
        entityName: entityName,
        params: {
          $top: 0,
          $select: 'id'
        }
      });
      var promiseObject = $api.getEntity(callObject);
      promiseObject.then(function(success) {
        removeAll(context.uniqueName);
        selectAllModelsObject[context.uniqueName] = true;
        angular.forEach(success.data, function(entity) {
          addEntityToList(context.uniqueName, entity.id);
        });
      });
    }

    /**
     * @name _checkArguments
     * @memberof app._core.screens.table.selectedEntities
     *
     * @param {Array} args
     * @param {String} functionName
     *
     * @description
     * Checks that the given array doesn't contains any undefined or null value.
     * @private
     */
    function _checkArguments(args, functionName) {
      if (args.indexOf(null) > -1 || args.indexOf(undefined) > -1) {
        throw new Error('Method "' + functionName + '": Parameters cannot be empty.');
      }
    }
  }
})();
