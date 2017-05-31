(function() {
  'use strict';

  angular
    .module('app._core.setting')
    /**
     * APP OBJECTS DEFINITION
     *
     * @name success.data.sections
     * @property {Array} cards
     *
     * @name success.data.sections.cards
     * @property {String} type
     * @property {Array} fields
     * @property {Object} fieldsLogic
     *
     * @name fieldsLogic
     * @property {Object} standard
     * @property {Object} values
     *
     * @name standard
     * @property {Array} mandatory
     *
     * @name field
     * @property {String} $ref
     */

    /**
     * @namespace shape
     * @memberof app._core.setting
     *
     * @requires $api
     * @requires $tools
     * @requires $q
     * @requires availableFields
     *
     * @description
     * Factory to handle entity contracts.
     */
    .factory('shape', shape);

  shape.$inject = ['$api', '$tools', '$q', 'availableFields'];

  function shape($api, $tools, $q, availableFields) {
    var $ = $tools.$;
    var _contracts = {};
    var _viewConfigs = {};
    var _settings = {};
    var _fields = {};

    var fieldsSource = {};
    fieldsSource[$.VIEW_FILE] = _fieldsSourceFileView;
    fieldsSource[$.VIEW_TABLE] = _fieldsSourceTableView;

    return {
      init: init,
      get: get,
      getConfigView: getConfigView,
      tag: tag
    };

    /**
     * @name _assembleConfigurationTag
     * @memberof app._core.setting.shape
     *
     * @description
     * Generates the identifier string from a view configuration object.
     *
     * @param {Object} viewConfigObject
     * @returns {String}
     * @private
     */
    function _assembleConfigurationTag(viewConfigObject) {
      viewConfigObject.configAdd = viewConfigObject.configAdd || '';
      var tag = [
        viewConfigObject.entity,
        $tools.ucWords(viewConfigObject.configAdd),
        $tools.ucWords(viewConfigObject.type)
      ];
      return tag.join('');
    }

    /**
     * @name _entityToModelContractString
     * @memberof app._core.setting.shape
     *
     * @description
     * Auxiliary method to convert an entity string into a contract string.
     *
     * @param {String} entityName
     * @returns {string}
     * @private
     */
    function _entityToModelContractString(entityName) {
      return $tools.ucWords(entityName).slice(0, -1);
    }

    /**
     * @name _loadAvailableFields
     * @memberof app._core.setting.shape
     *
     * @description
     * Returns available fields from an entity using "availableFields" service.
     *
     * @param {String} entityName
     * @returns {Promise}
     * @private
     */
    function _loadAvailableFields(entityName) {
      var _availableFields = $q.defer();
      availableFields.get().then(function(success) {
        _availableFields.resolve(success[entityName]);
      });
      return _availableFields.promise;
    }

    /**
     * @name _loadContract
     * @memberof app._core.setting.shape
     *
     * @description
     * Get an entity contract from API.
     *
     * @param {String} entityName --> Entity to obtain its contract.
     * @returns {Promise}
     * @private
     */
    function _loadContract(entityName) {
      var _contract = $q.defer();
      if (_contracts.hasOwnProperty(entityName)) {
        var mainModel = _contracts[entityName].models[_entityToModelContractString(entityName)];
        _contract.resolve(mainModel.properties);
      } else {
        var entity = $api.createEntityObject({ entityName: entityName + '/contract' });
        $api.getEntity(entity, function(success) {
          _contracts[entityName] = success.data;
          var mainModel = _contracts[entityName].models[_entityToModelContractString(entityName)];
          _contract.resolve(mainModel.properties);
        });
      }
      return _contract.promise;
    }

    /**
     * @name _loadConfigViewData
     * @memberof app._core.setting.shape
     *
     * @description
     * Asks for configuration view setting from stored promise or API.
     *
     * @param {String} tag
     * @returns {Promise}
     * @private
     */
    function _loadConfigViewData(tag) {
      var entity = $api.createEntityObject({ entityName: 'configurations/' + tag });
      _viewConfigs[tag] = (_viewConfigs.hasOwnProperty(tag)) ? _viewConfigs[tag] : $api.getEntity(entity);
      return _viewConfigs[tag];
    }

    /**
     * @name _fieldsSourceFileView
     * @memberof app._core.setting.shape
     *
     * @description
     * Gather all visible fields of an entity that is displayed in FILE (details) view.
     * This method is used with fieldsSource object.
     *
     * @param {Object} configData --> View configuration from API.
     * @returns {Array}
     * @private
     */
    function _fieldsSourceFileView(configData) {
      /**
       * @name _fieldsFromValueLogic
       * @memberof app._core.setting.shape._fieldsSourceFileView
       *
       * @description
       * Auxiliary method which runs the value logic configuration of an entity shown in FILE view mode.
       *
       * @param {Object} valueLogic
       * @returns {Array}
       * @private
       */
      function _fieldsFromValueLogic(valueLogic) {
        var output = [];
        angular.forEach(valueLogic, function(fields) {
          angular.forEach(fields, function(values) {
            if (values.hasOwnProperty('visible')) {
              output = $tools.arrayMerge(output, values.visible);
            }
          });
        });
        return output;
      }

      var visibleFields = [];
      angular.forEach(configData.sections, function(section) {
        angular.forEach(section.cards, function(card) {
          var isForm = (card.type === 'form');
          var hasFields = (isForm && card.hasOwnProperty('fields'));
          var hasFieldsLogic = (hasFields && card.hasOwnProperty('fieldsLogic'));
          var hasValueLogic = (hasFieldsLogic && card.fieldsLogic.hasOwnProperty('values'));
          if (hasFields) {
            visibleFields = $tools.arrayMerge(visibleFields, card.fields);
          }
          if (hasValueLogic) {
            visibleFields = $tools.arrayMerge(visibleFields, _fieldsFromValueLogic(card.fieldsLogic.values));
          }
        });
      });
      return visibleFields;
    }

    /**
     * @name _fieldsSourceTableView
     * @memberof app._core.setting.shape
     *
     * @description
     * Gather all visible fields of an entity that is displayed in TABLE (list) view.
     * This method is used with fieldsSource object.
     *
     * @param {Object} configData --> View configuration from API.
     * @returns {Array}
     * @private
     */
    function _fieldsSourceTableView(configData) {
      return configData.fields;
    }

    /**
     * @name _loadConfigView
     * @memberof app._core.setting.shape
     *
     * @description
     * Loads data settings from view configuration API.
     *
     * @param {Object} view --> View configuration Object. Set in each resolve router state.
     * @param {String} tag
     * @returns {Promise}
     * @private
     */
    function _loadConfigView(view, tag) {
      var _configView = $q.defer();
      if (_settings.hasOwnProperty(tag)) {
        return _settings[tag].configView;
      } else {
        _loadConfigViewData(tag).then(function(success) {
          try {
            _configView.resolve(fieldsSource[view.type](success.data));
          } catch (e) {
            if (e instanceof TypeError) {
              throw new Error('Corrupt configuration data.');
            } else {
              throw e;
            }
          }
        });
      }
      return _configView.promise;
    }

    /**
     * @name _setUpConfig
     * @memberof app._core.setting.shape
     *
     * @description
     * Returns a source configuration object, obtaining the data from available fields, contract and view config.
     *
     * @param {Object} view --> View configuration Object. Set in each resolve router state.
     * @param {String} tag
     * @returns {Object}
     * @private
     */
    function _setUpConfig(view, tag) {
      return {
        availableFields: _loadAvailableFields(view.entity),
        contract: _loadContract(view.entity),
        configView: _loadConfigView(view, tag)
      };
    }

    /**
     * @name _doApiCall
     * @memberof app._core.setting.shape
     *
     * @param {Object} field
     * @returns {Object}
     * @private
     */
    function _doApiCall(field) {
      var output = {};
      if (field.hasOwnProperty('description') && field.description === 'apiCall') {
        var apiCallEntity = $api.createEntityObject({ entityName: field.$ref });
        output['enum'] = $api.getEntity(apiCallEntity);
      }
      return output;
    }

    /**
     * @name _contractFields
     * @memberof app._core.setting.shape
     *
     * @description
     * Recursive function that make match configurations from contract.
     *
     * @param {String} field
     * @param {Object} contract
     * @param {String} entityName
     * @returns {Object}
     * @private
     */
    function _contractFields(field, contract, entityName) {
      var output = {};
      if (contract.hasOwnProperty(field)) {
        output = angular.extend({}, contract[field], _doApiCall(contract[field]));
      } else {
        var fieldDetached = field.split('/');
        var newField = fieldDetached.shift();
        if (contract.hasOwnProperty(newField)) {
          var isRef = contract[newField].hasOwnProperty('$ref');
          var isDescription = contract[newField].hasOwnProperty('description');
          var isApiCall = (isDescription && contract[newField].description === 'apiCall');
          var isItems = contract[newField].hasOwnProperty('items');
          var isItemsRef = isItems && contract[newField].items.hasOwnProperty('$ref');
          if (isApiCall) {
            output = angular.extend({}, contract[newField], _doApiCall(contract[newField]));
          } else if (isRef) {
            var newContract = _contracts[entityName].models[contract[newField].$ref].properties;
            output = _contractFields(fieldDetached.join('/'), newContract, entityName);
          }
          if (isItemsRef) {
            var itemsContract = _contracts[entityName].models[contract[newField].items.$ref].properties;
            output.items = _contractFields(fieldDetached.join('/'), itemsContract, entityName);
          }
        }
      }
      return output;
    }

    /**
     * @name _processFields
     * @memberof app._core.setting.shape
     *
     * @description
     * Process entity fields by joining the three sources: available fields, contract and view config.
     *
     * @param {Object} settingObject --> Object with three sources from _setUpConfig method.
     * @param {String} entityName
     * @returns {Promise}
     * @private
     */
    function _processFields(settingObject, entityName) {
      var _fieldsDone = $q.defer();
      $q.all(settingObject).then(function(success) {
        var output = {};
        angular.forEach(success.configView, function(field) {
          if (success.availableFields.hasOwnProperty(field)) {
            output[field] = success.availableFields[field];
          } else {
            throw new Error('Corrupt configuration data. The field ' + field + ' not in available fields.');
          }
          output[field] = angular.extend({}, output[field], _contractFields(field, success.contract, entityName));
        });
        _fieldsDone.resolve(output);
      });
      return _fieldsDone.promise;
    }

    /**
     * @name init
     * @memberof app._core.setting.shape
     *
     * @description
     * Tries to return the saved configuration or start the configuration process.
     *
     * @param {Object} view --> View configuration Object. Set in each resolve router state.
     * @param {String} [tag] --> Label that will identify the required configuration.
     * @returns {Promise}
     */
    function init(view, tag) {
      tag = tag || _assembleConfigurationTag(view);
      _settings[tag] = _settings.hasOwnProperty(tag) ? _settings[tag] : _setUpConfig(view, tag) ;
      _fields[tag] = _fields.hasOwnProperty(tag) ? _fields[tag] : _processFields(_settings[tag], view.entity) ;
      return _fields[tag];
    }

    /**
     * @name get
     * @memberof app._core.setting.shape
     *
     * @description
     * Gets an entity configured fields set.
     * It will return stored settings or will initialize it.
     *
     * @param {Object} view --> View configuration Object. Set in each resolve router state.
     * @returns {Promise}
     */
    function get(view) {
      var entityTag = _assembleConfigurationTag(view);
      return _fields.hasOwnProperty(entityTag) ? _fields[entityTag] : init(view, entityTag) ;
    }

    /**
     * @name getConfigView
     * @memberof app._core.setting.shape
     *
     * @description
     * Gets entity config view object.
     *
     * @param {Object} view --> View configuration Object. Set in each resolve router state.
     * @param {String} [tag]
     */
    function getConfigView(view, tag) {
      tag = tag || _assembleConfigurationTag(view);
      return _loadConfigViewData(tag);
    }

    /**
     * @name tag
     * @memberof app._core.setting.shape
     *
     * @description
     * Generates the identifier string from a view configuration object.
     * Public method for use _assembleConfigurationTag.
     *
     * @param {Object} view --> View configuration Object. Set in each resolve router state.
     * @returns {String}
     */
    function tag(view) {
      return _assembleConfigurationTag(view);
    }
  }
})();
