(function() {
  'use strict';

  /**
   * @namespace editableFieldController
   * @memberof app._shared.editable-field
   *
   * @requires $api
   * @requires $alert
   * @requires $timeout
   * @requires formValidator
   * @requires $tools
   *
   * @description
   * Controller for editable-field directive.
   */
  angular.module('app._shared.editable-field')
    .controller('editableFieldController', [
      '$api',
      '$alert',
      '$timeout',
      'formValidator',
      '$tools',
      function($api, $alert, $timeout, formValidator, $tools) {
        var vm = this;
        var API_CALL_MESSAGE = 'apiCall';
        var MODIFY_MESSAGE = 'modify';
        vm.isEditing = false;
        vm.getPattern = formValidator.getPattern;

        /**
         * _setValueFromDotedKey
         * Allows dot notation traversing (Example: object["a.b.c"] in object["a"]["b"]["c"]).
         * Set's the provided value.
         *
         * @param {Object} baseObject
         * @param {String} dottedPath
         * @param {*} value
         * @returns {*|Undefined}
         * @private
         */
        function _setValueFromDotedKey(baseObject, dottedPath, value) {

          /**
           * _set
           * Auxiliary function used for reduction in _setValueFromDotedKey. Must be inside that function, because
           * shares "value" variable
           *
           * @param {*} object
           * @param {*} actualSection
           * @param {Integer} actualIndex
           * @param {Object} rootArray
           * @returns {*}
           * @private
           */
          function _set(object, actualSection, actualIndex, rootArray) {
            var condition = (actualIndex === rootArray.length - 1);
            if (condition) {
              object[actualSection] = value;
            }
            return object[actualSection];
          }

          try {
            return dottedPath.split('.').reduce(_set, baseObject);
          } catch (e) {
            if (e instanceof TypeError) {
              return undefined;
            } else {
              throw e;
            }
          }
        }

        /**
         * _createObjectReduceFunction
         * Auxiliary function used for reduction in _createObjectFromDottedKey.
         *
         * @param {*} object -> The initial value if provided or previous value (an object in this case).
         * @param {*} actualSection -> The actual value (a string in this case).
         * @returns {*}
         * @private
         */
        function _createObjectReduceFunction(object, actualSection) {
          object[actualSection] = {};
          return object[actualSection];
        }

        /**
         * _createObjectFromDottedKey
         * Allows dot notation traversing (Example: object["a.b.c"] in object["a"]["b"]["c"]).
         * Creates an object based on provided path.
         *
         * @param {Object} baseObject
         * @param {String} dottedPath
         * @returns {*|Undefined}
         * @private
         */
        function _createObjectFromDottedKey(baseObject, dottedPath) {
          try {
            return dottedPath.split('.').reduce(_createObjectReduceFunction, baseObject);
          } catch (e) {
            if (e instanceof TypeError) {
              return undefined;
            } else {
              throw e;
            }
          }
        }

        /**
         * @name app._shared.views.editable-field.editableFieldController#saveData
         *
         * @description
         * Saves the data that has just been modified. This save can be done by an api call or modifying the entity
         * where this fields comes.
         *
         * @param {Object} row
         * @param {Object} field
         * @param {String | Number} value
         */
        vm.saveData = function(row, field, value) {
          var actualValue = $tools.getValueFromDotedKey(row, field.name);
          var functionToExecute = field.method ? _doMethodCall : _updateEntity;
          vm.isEditing = false;

          if (actualValue !== value) {
            var isDeleted = actualValue && !value;
            var alertText = {
              modify: !isDeleted ? 'The new field value has been set.' : 'The field value has been deleted.',
              apiCall: 'Action executed correctly'
            };

            value = value || null;

            functionToExecute(row, field, value, alertText);
          }
        };

        /**
         * @name app._shared.views.editable-field.editableFieldController#_updateEntity
         *
         * @description
         * Update the entity where the modified field comes from.
         *
         * @param {Object} row
         * @param {Object} field
         * @param {String | number} value
         * @param {String} alertText
         * @private
         */
        function _updateEntity(row, field, value, alertText) {
          var entityObject = {
            entityName: vm.entity,
            objectSent: {}
          };
          var entity = $api.createEntityObject(entityObject);

          _createObjectFromDottedKey(entityObject.objectSent, field.name);
          _setValueFromDotedKey(entityObject.objectSent, field.name, value);
          _setValueFromDotedKey(row, field.name, value);

          $api.update(entity, function() {
            $alert.success(alertText[MODIFY_MESSAGE]);
          });
        }

        /**
         * @name app._shared.views.editable-field.editableFieldController#_updateEntity
         *
         * @description
         * Do a post call to the API with the action defined in the field. This method should be previously injected
         * in any of the views controller.
         *
         * @param {Object} row
         * @param {Object} field
         * @param {String | Number} value
         * @param {String} alertText
         * @private
         */
        function _doMethodCall(row, field, value, alertText) {
          var entityObject = {
            objectSent: { parameters: {} },
            entityName: field.method.post
          };
          var entity = $api.createEntityObject(entityObject);

          _setValueFromDotedKey(entityObject.objectSent.parameters, field.method.params[0].name, value);
          _setValueFromDotedKey(entityObject.objectSent.parameters, 'id', row.id);

          $api.postEntity(entity, function() {
            $alert.success(alertText[API_CALL_MESSAGE]);
            vm.viewModel.splice(vm.viewModel.indexOf(vm.rowField), 1);
          });
        }

        /**
         * @name app._shared.views.editable-field.editableFieldController#setEvents
         *
         * @description
         * Sets some events to the event. (Blur and Focus events in this case).
         *
         * @param {String} elementSelector
         */
        vm.setEvents = function(elementSelector) {
          $timeout(function() {
            var element = angular.element(elementSelector)[0];

            element.focus();
          }, 500);
        };
      }
    ]);
})();
