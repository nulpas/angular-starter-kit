(function() {
  'use strict';

  angular.module('app._shared.tools')
    .factory('selectedListFactory', [
      function() {
        var list = [];

        return {
          getList: function() {
            return list;
          },
          clearList: function() {
            list.splice(0);
            return list;
          },
          addItemToList: function(item) {
            list.push(item);
            return list;
          },
          deleteItemFromList: function(item) {
            var index =  list.indexOf(item);
            list.splice(index, 1);
            return list;
          }
        };
      }
    ])

    .factory('queryParamsFactory', [
      function() {
        //#factory used to store and handle all params of a query
        var queryParams = {
          filter: [ ],
          order: [ ],
          top: 30,
          skip: 30,
          lastPage: 0
        };

        return {
          get: function() {
            return queryParams;
          },
          addFilter: function(item) {
            queryParams.filter.push(item);
            return queryParams;
          },
          removeFilter: function(item) {
            var index =  queryParams.filter.indexOf(item);
            if (index >= 0) {
              queryParams.filter.splice(index, 1);
            }
            return queryParams;
          },
          getFilters: function() {
            return queryParams.filter;
          },
          clearFilters: function() {
            for (var i = 0; i < queryParams.filter.length; i++) {
              queryParams.filter[i].field.control.removeFromView(queryParams.filter[i]);
            }
            queryParams.filter.splice(0);
          },
          addOrder: function(item) {
            queryParams.order.push(item);
            return queryParams;
          },
          removeOrder: function(item, index) {
            if (index) {
              queryParams.order.splice(index, 1);
            } else {
              index =  queryParams.order.indexOf(item);
              if (index >= 0) {
                queryParams.order.splice(index, 1);
              }
            }
            return queryParams;
          },
          clearOrders: function() {
            queryParams.order.splice(0);
          },
          getOrder: function(index) {
            return queryParams.order[index];
          },
          getOrders: function() {
            return queryParams.order;
          },
          setNextLastPage: function() {
            queryParams.lastPage++;
          },
          clearNextLastPage: function() {
            queryParams.lastPage = 0;
          },
          setParams: function() {
            var parameters = {
              '$orderby': '',
              '$top': queryParams.top,
              '$skip': queryParams.skip * queryParams.lastPage
            };
            if (queryParams.filter.length > 0) {
              parameters.$filter = '';
              for (var j = 0; j < queryParams.filter.length; j++) {
                var enumLabel = (queryParams.filter[j].field.type === 'string' &&
                  queryParams.filter[j].field.enum) ? '/importValue' : '';

                if (j !== 0) {
                  parameters.$filter += ' AND ';
                }
                var name = queryParams.filter[j].field.name.split('.').join('/').replace(/0./gi, '');
                parameters.$filter += name + enumLabel + ' ' + queryParams.filter[j].condition;
              }
            }

            for (var i = 0; i < queryParams.order.length; i++) {
              parameters.$orderby +=
                queryParams.order[i].name + ' ' + (queryParams.order[i].orderDescending ? 'desc' : 'asc') + ',';
            }
            parameters.$orderby = parameters.$orderby.split('.').join('/');
            return parameters;
          },
          clear: function() {
            for (var i = 0; i < queryParams.filter.length; i++) {
              queryParams.filter[i].field.control.removeFromView(queryParams.filter[i]);
            }
            queryParams.filter.splice(0);
            queryParams.order.splice(0);
            queryParams.top = 30;
            queryParams.skip = 30;
            queryParams.lastPage = 0;
            return queryParams;
          }
        };
      }
    ])

    /**
     * @name app._shared.tools.swagger
     *
     * @requires $api
     * @requires $q
     * @requires $filter
     *
     * @description
     * Factory used to combine available Fields of entity with those of his contract.
     */
    .factory('swagger', [
      '$api',
      '$q',
      '$filter',
      'utilsFactory',
      '$alert',
      function($api, $q, $filter, utilsFactory, $alert) {
        var _objectsList = {};
        var _config = 'availableFields';
        var _currentEntity = null;

        return {

          /**
           * @name composeFields
           *
           * @description
           * Function that compose list of available fields as result from crossing the configuration
           * available fields list with his entity swagger. If this object is present in service object,
           * it will return this directly.
           *
           * @param {String} entity -> name of the entity.
           *
           * @returns {Promise} A promise of result list
           */
          composeFields: function(entity) {
            if (!entity) {
              return false;
            }

            _currentEntity = entity;
            var _configEntity = entity + _config.charAt(0).toUpperCase() + _config.slice(1);
            var deferral = $q.defer();
            var listFields = [];
            if (!_objectsList[_configEntity]) {
              //If contract or configuration objects are not loaded, we do api call with promises
              if (!_objectsList[entity] || !_objectsList[_config]) {
                //We create two parallel promises, and when response of configuration and contract
                //api calls arrives, we calculate the fields list
                var configEntity = $api.createEntityObject({ entityName: 'configurations/' + _config });
                var contractEntity = $api.createEntityObject({ entityName: entity + '/contract' });

                var _promises = {
                  config: $api.getEntity(configEntity),
                  contract: $api.getEntity(contractEntity)
                };
                $q.all(_promises).then(function(success) {
                  _objectsList[_config] = success.config.data;
                  _objectsList[entity] = success.contract.data;
                  angular.forEach(_objectsList[_config][entity].fields, function(property) {
                    var _model = (property.model) ? property.model : _objectsList[_config][entity].mainModel;
                    var _prefix = '';
                    var _suffix = '';
                    var _newField = {};
                    if (_model) {
                      if (_objectsList[entity].models[_model].properties.hasOwnProperty(property.name)) {
                        //We create new field with mix of infos of contract and configuration
                        _newField = angular.merge({},
                          property, _objectsList[entity].models[_model].properties[property.name]);
                        if (angular.isDefined(_newField.$ref)) {
                          angular.forEach(_objectsList[entity].models[_newField.$ref], function(refProperty) {
                            _newField.id = _objectsList[entity].models[refProperty].id;
                            _newField.properties = _objectsList[entity].models[refProperty].properties;
                          });
                        }
                        //We modify name attribute because this impact in query params for a GET api call
                        _prefix = (_newField.model) ? _newField.model.charAt(0).toLowerCase() +
                        _newField.model.slice(1) + '.' : '';
                        var _item = (_newField.item !== undefined) ? _newField.item + '.' : '';
                        _suffix = (_newField.suffix) ? '.' + _newField.suffix : '';
                        _newField.name = _prefix + _item + property.name + _suffix;
                        _newField.originalName = property.name;
                        _newField.control = {};
                        listFields.push(_newField);
                      }
                    } else {
                      if (angular.isDefined(utilsFactory.getValueFromDotedKey(
                          _objectsList[entity].models, property.name))) {
                        //We create new field with mix of infos of contract and configuration
                        _newField = angular.merge({},
                          property, utilsFactory.getValueFromDotedKey(_objectsList[entity].models, property.name));
                        if (angular.isDefined(_newField.$ref)) {
                          angular.forEach(utilsFactory.getValueFromDotedKey(
                            _objectsList[entity].models, _newField.$ref), function(refProperty) {
                            _newField.id = utilsFactory.getValueFromDotedKey(
                              _objectsList[entity].models, refProperty).id;
                            _newField.properties = utilsFactory.getValueFromDotedKey(
                              _objectsList[entity].models, refProperty).properties;
                          });
                        }
                        //We modify name attribute because this impact in query params for a GET api call
                        _prefix = (_newField.model) ? _newField.model.charAt(0).toLowerCase() +
                        _newField.model.slice(1) + '.' : '';
                        _suffix = (_newField.suffix) ? '.' + _newField.suffix : '';
                        _newField.name = _prefix + property.name + _suffix;
                        _newField.control = {};
                        listFields.push(_newField);
                      }
                    }

                  });
                  _objectsList[_configEntity] = listFields;
                  deferral.resolve(listFields);
                });
              }
            } else {
              deferral.resolve(_objectsList[_configEntity]);
            }
            return deferral.promise;
          },

          /**
           * @name composeFilterFields
           *
           * @description
           * Function that compose list of filter fields as result from crossing the available fields list with
           * fields list of view.
           *
           * @param {Array} availableFields -> list of available Fields.
           * @param {Array} filterFields -> list of View fields.
           *
           * @returns {Array} -> the result list
           */
          composeFilterFields: function(availableFields, filterFields) {
            var _list = [];
            //Grid, minigrid cases
            if (filterFields.custom && filterFields.custom.layers) {
              angular.forEach(filterFields.custom.layers, function(layer) {
                // #TODO: We must refactor this code with something like this
                //_list = angular.extend({}, _list, layer.fields);
                angular.forEach(layer.fields, function(field) {
                  var _element = $filter('filter')(availableFields, { name: field.name }, true);
                  var _jetFilter = $filter('filter')(_list, { name: field.name }, true);
                  if (_element.length > 0 && _jetFilter.length === 0) {
                    var _newField = angular.merge({}, field, _element[0]);
                    _list.push(_newField);
                  }
                });
              });
            } else {
              //List, SimpleList cases
              angular.forEach(filterFields.fields, function(field) {
                var _element = $filter('filter')(availableFields, { name: field.name }, true);
                if (_element.length) {
                  var _newField = angular.merge({}, field, _element[0]);
                  _list.push(_newField);
                }
              });
            }
            return _list;
          },

          /**
           * @name removeProperties
           *
           * @description
           * Function that removes not allowed and unnecessary swagger properties in db mongo for each field
           *  in a list that going to be saved in the db. If not, it will cause error in db.
           *
           * @param {Array} viewFields -> list of View fields.
           *
           */
          removeProperties: function(viewFields) {
            angular.forEach(viewFields, function(field) {
              delete field.$ref;
              delete field.control;
              delete field.description;
              delete field.enum;
              delete field.$$hashkey;
            });
          },

          /**
           * @name getEnumAvailableField
           *
           * @description
           * Function that gets, if exists, enum property of availableFields field object. If not, it returns null
           *
           * @param {String} entity -> main Entity name to wich desired field belongs
           * @param {Object} field -> desired field
           *
           * @returns {Object} -> the result field
           */
          getEnumAvailableField: function(entity, field) {
            var _configEntity = entity + _config.charAt(0).toUpperCase() + _config.slice(1);
            var _element = $filter('filter')(_objectsList[_configEntity], { originalName: field.name }, true);
            return (_element.length && _element[0].enum) ? _element[0].enum : null;
          },

          /**
           * @name saveFiltersConfiguration
           *
           * @description
           * Function that saves the filters added by the user to the availableFields configuration.
           *
           * @param {Object} filterField -> filter field added
           *
           */
          saveFiltersConfiguration: function(filterField) {
            var _replaced = false;
            // Iterate over the current entity's field list
            _objectsList[_config][_currentEntity].fields.some(function(field) {
              if (field.name === filterField.originalName) {
                field.searchable = filterField.searchable;

                var _objectSent = {};
                _objectSent[_config] = _objectsList[_config];
                var configurationEntity = $api.createEntityObject({
                  entityName: 'configurations',
                  objectSent: _objectSent
                });
                $api.postEntity(configurationEntity, function() {
                  $alert.success('The filter configuration has been saved.');
                });

                _replaced = true;
              }
              return _replaced;
            });
          }
        };
      }
    ])

    /**
     * @name app._shared.tools.formValidator
     *
     * @description
     * Factory used to endorse inputs in forms.
     */
    .factory('formValidator', [
      function() {
        var patternParams = {
          'float': '^[0-9]+(\\.[0-9]{0,2})?$',
          'long': '^\\d*$',
          'string': '.+',
          'number': '^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$',
          'int32': '^\\d*$'
        };

        return {
          /**
           * @name app._shared.tools.formValidator#getPattern
           *
           * @description
           * Returns a pattern for forms depending on the type of the param to be input.
           *
           * @param {String} type
           * @returns {String}
           */
          getPattern: function(type) {
            return patternParams[type];
          }
        };
      }
      ])

    /**
     * @namespace utilsFactory
     * @memberof app._shared.tools
     *
     * @description
     * Factory with useful methods that probably later will be added to the core.
     */
    .factory('tools', [
      'utilsFactory',
      function() {
        return {
          /**
           * @name app._shared.tools.utilsFactory#filterArray
           * @description
           * This function returns an array of filtered objects inside the original object array (objectsArray)
           * which contains an object property that marches the indicated property value
           *
           * @param {Object} objectsArray -> The array containing objects that is filtered
           * @param {String} objectProperty -> The key to find the needed value.
           * @param {Object} propertyValue -> The value to find.
           * @returns {Object | Null} An array if there is any result or null
           */
          filterArray: _filterArray,
          /**
           * @name app._shared.tools.utilsFactory#recurseFilterArray
           * @description
           * This function is the recursive, multi-depth version of FilterArray: returns an array of filtered objects
           * inside the original object array (objectsArray) which contains an object property that marches the
           * indicated property value.
           *
           * @param {Object} objectsArray -> The array containing objects that is filtered
           * @param {String} objectProperty -> The key to find the needed value.
           * @param {Object} propertyValue -> The value to find.
           * @returns {Object | Null} An array if there is any result or null
           */
          recurseFilterArray: _recurseFilterArray
        };
        function _filterArray(objectsArray, objectProperty, propertyValue) {
          var filtered = [];
          objectsArray.filter(function(element) {
            if (element[objectProperty] === propertyValue) {
              filtered.push(element);
            }
          });
          return filtered.length ? filtered : null;
        }
        function _recurseFilterArray(objectsArray, objectProperty, propertyValue) {
          var filtered = [];
          if (objectsArray[objectProperty] === propertyValue) {
            filtered.push(objectsArray);
          } else {
            if (angular.isObject(objectsArray)) {
              angular.forEach(objectsArray, function(objectItem) {
                var _responseDeeper = _recurseFilterArray(objectItem, objectProperty, propertyValue);
                if (_responseDeeper && angular.isObject(_responseDeeper)) {
                  angular.extend(filtered, _responseDeeper);
                }
              });
            }
          }
          return filtered.length ? filtered : null;
        }
      }
    ]);
})();
