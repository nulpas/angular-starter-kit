(function() {
  'use strict';

  angular.module('app._shared.views.details')
  .controller('detailsController', [
    '$api',
    'utilsFactory',
    'selectedListFactory',
    '$state',
    '$stateParams',
    '$views',
    '$alert',
    '$window',
    'saleEventDetails',
    'packageDetails',
    '$bpm',
    '$filter',
    'formValidator',
    'login',
    'userDetails',
    '$tools',
    'localStorageService',
    '$http',
    function(
      $api,
      utilsFactory,
      selectedListFactory,
      $state,
      $stateParams,
      $views,
      $alert,
      $window,
      saleEventDetails,
      packageDetails,
      $bpm,
      $filter,
      formValidator,
      login,
      userDetails,
      $tools,
      localStorageService,
      $http) {
      var vm = this;
      // Utility for placing static elements
      var selectMode = $stateParams.index !== undefined;
      vm.getScrollerWidth = utilsFactory.getScrollerWidth;
      var selectedList = selectedListFactory.getList();
      var selectedListIndex = $stateParams.index;
      var breadcrumb = $views.getViewDefinition();
      vm.translations = login.getUserInfo().translation;
      vm.floatPattern = formValidator.getPattern('float');
      vm.toCamelCase = $tools.toCamelCase;
      if (vm.entity === 'packages') {
        packageDetails.packageData = vm.data;
        packageDetails.calculatedFields.totalPrice = 0;
        packageDetails.calculatedFields.packagePrice = 0;
        packageDetails.calculatedFields.totalDiffPrice = 0;
        vm.calculatedFields = packageDetails.calculatedFields;
      }

      vm.currentElement = breadcrumb.currentElement;
      vm.totalElements = breadcrumb.totalElements;
      vm.dateTimePickerOptions = {};

      vm.createDateTimePickerOptions = function(ngModel, name, isDateTime) {
        var customFormat = isDateTime ? 'YYYY-MM-DD, HH:mm:00' : 'YYYY-MM-DD';
        var customDefault = moment.utc(ngModel).format(customFormat);

        vm.dateTimePickerOptions[name] = {
          autoClose: true,
          multiple: false,
          format: isDateTime ? 'YYYY-MM-DD, hh:mm:00' : 'YYYY-MM-DD',
          default: customDefault
        };
      };

      vm.onChangeDateTimeHandler = function(componentValue, fieldName) {
        vm.data[fieldName] = moment.utc(componentValue).format('YYYY-MM-DDTHH:mm:00');

        if (!moment.utc(vm.data[fieldName]).isValid()) {
          vm.data[fieldName] = '';
        }
      };

      vm.sortableOptions = {};
      //Stores logs views
      vm.log = {};
      vm.viewConfig = {};
      var lang = $window.navigator.language || $window.navigator.userLanguage;
      // TODO : This logic shouldn't be here
      // If the data of this instance has the attribute saleEventName, means that is a saleEvent
      // data, and we must store the saleEvent.
      if (vm.data && vm.data.saleName) {
        saleEventDetails.actualSaleEvent(vm.data);
      }

      // TODO detect properly
      vm.language = lang.substr(0, 2);
      if (selectMode) {
        $views.setViewDefinition({ 'selectedListIndex': selectedListIndex });
        var _goToRelativeDetail = function(delta) {
          $views.setViewDefinition({ 'transitionEffectTo': delta < 0 ? 'slideLeft' : 'slideRight' });
          var allParams = {};
          var customParams = {
            vehicleId: selectedList[selectedListIndex + delta].id,
            index: selectedListIndex + delta
          };
          angular.merge(allParams, $state.params, customParams);
          $state.go($state.current, allParams);
        };
        if (selectedListIndex > 0) {
          vm.previous = true;
          vm.previousEntity = function() {
            _goToRelativeDetail(-1);
          };
        }
        if (selectedListIndex + 1 < selectedList.length) {
          vm.next = true;
          vm.nextEntity = function() {
            _goToRelativeDetail(1);
          };
        }
      } else {
        vm.nextEntity = function() {
          if (vm.currentElement + 1 < vm.totalElements) {
            $views.setAction('nextElement');
            // Retrieve only the next vehicle's id
            var entityObject = $api.createEntityObject({
              entityName: $views.getDetailsCallParameters().nextElement,
              params: {
                $select: '_id',
                $top: 1
              }
            });
            $api.getEntity(entityObject, function(success) {
              breadcrumb.currentElement++;
              $views.setViewDefinition({ 'transitionEffectTo': 'slideRight' });
              $state.go($state.current, { 'vehicleId': success.data[0].id });
            });
          }
        };
        vm.previousEntity = function() {
          if (vm.currentElement > 0) {
            $views.setAction('previousElement');
            // Retrieve only the previous vehicle's id
            var entityObject = $api.createEntityObject({
              entityName: $views.getDetailsCallParameters().previousElement,
              params: {
                $select: '_id',
                $top: 1
              }
            });
            $api.getEntity(entityObject, function(success) {
              breadcrumb.currentElement--;
              $views.setViewDefinition({ 'transitionEffectTo': 'slideLeft' });
              $state.go($state.current, { 'vehicleId': success.data[0].id });
            });
          }
        };
      }

      /**
       * exportJson
       * Export the structure of the view to a json file.
       */
      var exportJson = function() {
        utilsFactory.exportJsonFile(vm.detailsStructure, 'details.json');
      };

      /**
       * resetEntity
       * Restores the data.
       */
      var resetEntity = function() {
        vm.data = angular.copy(vm.source);
        $alert.info('Data restored');
      };

      /**
       * updateEntity
       * Creates and send the diff object to backend API
       */
      var updateEntity = function() {
        /**
         * _getDiffObject
         * Check the differences between two objects.
         *
         * @returns {Object} The difference between the two objects.
         * @private
         */
        var _getDiffObject = function() {
          /**
           * _shouldBeUpdated
           * Checks if this entity should be updated or not.
           *
           * @param {String} attribute -> The attribute that will be check.
           * @returns {*|boolean|boolean}
           * @private
           */
          var _shouldBeUpdated = function(attribute) {

            /**
             * _hasOwnProperty
             * Checks if 'source' object has an own attribute.
             *
             * @returns {*|boolean}
             * @private
               */
            var _hasOwnProperty = function() {
              return true;
              // TODO we deactivate temporarily the form field variation check
              // return vm.source.hasOwnProperty(attribute);
            };
            /**
             * _notEquals
             * This function checks if two values are equals or not.
             *
             * @returns {boolean} If two values are equals or not.
             * @private
             */
            var _notEquals = function() {
              return (vm.source[attribute] ? vm.source[attribute] !== vm.data[attribute] : true);
            };
            /**
             * _isValidType
             * This function checks if data value is a valid type.
             *
             * @returns {boolean} If the data value is a valid type.
             * @private
             */
            var _isValidType = function() {
              var objectType = typeof vm.data[attribute];
              var conditions = [
                (objectType === 'boolean' && !attribute.startsWith('configuration')),
                (objectType === 'string' && !attribute.startsWith('configuration')),
                (objectType === 'number' && !attribute.startsWith('configuration')),
                (objectType === 'float' && !attribute.startsWith('configuration')),
                (objectType === 'object' && !attribute.startsWith('configuration'))
              ];
              return (conditions.indexOf(true) >= 0);
            };
            /**
             * _isAList
             * This function checks if an attribute belongs to a list searching
             * if it has any number surrounded by points in its name. e.g.:
             * comment.author <-- false
             * comments.0.author <-- true
             *
             * @returns {boolean} If the attribute is a list.
             * @private
             */
            var _isAList = function() {
              var regex =  /\.[0-9]*\./g;
              return regex.exec(attribute) !== null;
            };

            if (vm.data[attribute] === '') {
              vm.data[attribute] = null;
            }

            //If attribute in source exisit is number, string or boolean and is different
            //then it should be updated
            return (_hasOwnProperty() && _notEquals() && _isValidType()) || _isAList();
          };

          var diffObject = {};
          for (var attribute in vm.data) {
            if (_shouldBeUpdated(attribute)) {
              utilsFactory.setValueFromDotedKey(diffObject, attribute, vm.data[attribute]);
            }
          }
          //Cut off lots in saleevents
          if (vm.entity === 'saleevents' && vm.data.lots) {
            delete diffObject.lots;
          }

          //Cut off vehicles in packages
          if (vm.entity === 'packages') {
            delete diffObject.vehicles;

          //Cut off roles in users
          } else if (vm.entity === 'users') {
            delete diffObject.roles;
          }
          // Cut off the configuration attribute
          if (diffObject.configuration) {
            delete diffObject.configuration;
          }
          // Cut off all attributes of telesalesUsers except id and name
          // TODO Remove this Scissor patch when Lazy loading users is possible
          if (diffObject.telesalesUsers) {
            angular.forEach(diffObject.telesalesUsers, function(userItem) {
              vm.cropUser(userItem);
            });
          }
          if (diffObject.createdBy) {
            vm.cropUser(diffObject.createdBy);
          }

          return diffObject;
        };

        /**
         * @name app._shared.views.details.detailsController#onSucess
         *
         * @description
         * Callback function when saving the configuration was success.
         * @param {Object} response -> The response to be stored.
         */
        var onSucess = function(response) {
          if (response.data) {
            $alert.success('Changes saved');
            vm.data = angular.isArray(response.data) ? response.data[0] : response.data;
            // TODO: Change this!
            if (vm.detailsStructure.entityObject.entityName === 'vehicles') {
              _plainData(vm.data);
              vm.detailsStructure = angular.copy(vm.initialDetailsStructure);
            }
            if (vm.detailsStructure.entityObject.entityName === 'packages') {
              vm.initialDetailsStructure = angular.copy(vm.detailsStructure);
              //This copy is used to track Changes in the formula
              vm.source = angular.copy(vm.data);
            } else {
              vm.initForm();
            }
          } else {
            $alert.error(response.error.plain());
          }

        };

        /**
         * @name app._shared.views.details.detailsController#onCreateSucess
         *
         * @description
         * Callback function when creating the sale event was success.
         * @param {Object} response -> The response to be stored.
         */
        var onCreateSucess = function(response) {
          $alert.success('Entity Created.');
          vm.data = response.data;
          // TODO: CHANGE THIS HORROR!!
          switch (vm.entity){
            case 'packages':
              $state.go('app.packageDetails', { 'packageId': vm.data.id });
              break;
            case 'saleevents':
              $state.go('app.saleEventDetails', { 'saleEventId': vm.data.id });
              break;
          }
        };

        var updateEntityObject = angular.copy(vm.detailsStructure.entityObject);
        var forms = angular.element('form[name*=\'details.formDetails\']');
        var keepGoing = true;
        angular.forEach(forms, function(item) {
          if (keepGoing && angular.isString(item.name)) {
            // Name in template = "details.formDetails". We need to take just the name of the form.
            var formName = item.name.split('.')[1];
            if (!vm[formName].$valid) {
              $alert.error('You have errors in the form.');
              keepGoing = false;
            }
          }
        });

        if (!keepGoing) {
          return;
        }

        if (vm.data.id) {
          updateEntityObject.entityId = vm.data.id;
          updateEntityObject.objectSent = _getDiffObject();
          var updateEntity = $api.createEntityObject(updateEntityObject);
          $api.update(updateEntity, onSucess);
        } else {
          updateEntityObject.objectSent = _getDiffObject();
          var createEntity = $api.createEntityObject(updateEntityObject);
          $api.postEntity(createEntity, onCreateSucess);
        }
      };

      vm.conf = {
        set moveFields(value) {
          $views.setViewDefinition({ moveFields: value });
        },
        get moveFields() {
          return $views.getViewDefinition().moveFields;
        },
        set editDetails(value) {
          $views.setViewDefinition({ editDetails: value });
        },
        get editDetails() {
          return $views.getViewDefinition().editDetails;
        }
      };

      /**
       * getField
       * This functions returns a data value based on a dottedKey given.
       *
       * @param {String} dotedKey -> The key to find the needed value.
       * @returns {String} The value of the field.
         */
      var getField = function(dotedKey) {
        if (vm.data[dotedKey] !== undefined) {
          return vm.data[dotedKey];
        }
        vm.data[dotedKey] = utilsFactory.getValueFromDotedKey(vm.data, dotedKey);
      };

      /**
       * processCard
       * Process the card. Load data and specific settings into the card.
       *
       * @param {Object} card -> The card that will be processed.
       */
      var processCard =  function(card) {
        if (card.log) {
          vm.getLogData(card);
          return;
        }
        var fieldSections = [];
        var list = card.list ? vm.data[card.list] : card.fieldsSections;
        list = list || [];
        var lengthItems;
        if (card.list) {
          lengthItems = Math.min(card.maxItems || list.length, list.length);
        } else {
          lengthItems = list.length;
        }
        vm.sortableOptions[card.title] = {};
        for (var i = 0; i < lengthItems; i++) {
          vm.sortableOptions[card.title][i] = vm.createSortableOptions(card, i);
          fieldSections[i] = [];
          var templateFields = card.list ? angular.copy(card.fieldsSections[0]) : card.fieldsSections[i];
          for (var fieldIndex in templateFields) {
            var  dottedKey;
            if (card.list) {
              dottedKey = card.list + '.' + i.toString() + '.' + templateFields[fieldIndex].name;
              var field = templateFields[fieldIndex];
              field.name = dottedKey;
              fieldSections[i][fieldIndex] = field;
            } else {
              dottedKey = templateFields[fieldIndex].name;
            }
            getField(dottedKey); // TODO: See if this can be deleted
          }
        }
        if (card.list) {
          delete vm.data[card.list];
          card.fieldsSections = fieldSections;
        }
      };

      /**
       * processSection
       * Process a section of details view.
       *
       * @param {Object} section -> The section that will be processed.
       */
      var processSection = function(section) {
        angular.forEach(section.cards, processCard);
      };

      /**
       * initForm
       * Function to init the view and configurations needed.
       * Assign to View-Model isolate scope.
       */
      vm.initForm = function() {
        // Copy the initial structure to reuse it when we save an entity.
        vm.initialDetailsStructure = angular.copy(vm.detailsStructure);
        if (vm.detailsStructure.entityObject && vm.detailsStructure.entityObject.entityName === 'vehicles') {
          // Plain the data.
          _plainData(vm.data);
        }
        //This copy is used to track Changes in the formula
        vm.source = angular.copy(vm.data);

        angular.forEach(vm.detailsStructure.sections, processSection);
        if (vm.isEditable) {
          $views.getViewDefinition().editDetails = true;
        }

      };

      vm.sortableCardsOptions = {
        placeholder: 'placeholder-card',
        connectWith: '.card-container',
        handle: '> .cardDragHandler',
        revert: true,
        tolerance: 'pointer',
        forcePlaceholderSize: true,
        forceHelperSize: true
      };

      /**
       * Function to create Sortable configuration.
       *
       * @param {Object} card -> The card where the configuration will be set.
       * @param {Integer} sectionIndex -> The index of the section.
       * @returns {Object} Return the configuration of the sortable widget.
       */
      vm.createSortableOptions = function(card, sectionIndex) {
        var suffix = '';
        if (card.list) {
          suffix = '-' + card.list + '-' + sectionIndex.toString();
        }
        var cssClass = 'field-container' + suffix;
        return {
          'cssClass': cssClass,
          'ui-floating': 'auto',
          placeholder: 'placeholder-field',
          connectWith: '.' + cssClass,
          handle: '.inputDragHandler',
          items: 'div.input-wrapper:not(.not-sortable)',
          revert: true,
          tolerance: 'pointer',
          forcePlaceholderSize: true,
          forceHelperSize: true
        };
      };
      /**
       * replace all "${attribute}" ocurrences in a string
       * with local data stored in vm.data.attribute
       *
       * @param  {string} elem input string form configuration
       * @return {string}      parsed string without any ${attribute}
       */
      function replaceStringWithLocalData(elem, source) {
        var replacer = function(match, p1, p2, p3) {
          return [p1,  source[p2], p3].join('');
        };
        return elem.replace(/(.*)\$\{(\w+)\}(.*)/gi, replacer);
      }

      vm.getLogData = function(logCard) {

        if (logCard.log.entity) {
          vm.data = angular.isArray(vm.data) ? vm.data[0] : vm.data;
          logCard.log.entity = replaceStringWithLocalData(logCard.log.entity, vm.data);
        }

        if (vm.data && vm.data.username) {
          userDetails.actualUser(vm.data);
        }

        //Gets the card which is the lot simple list and sets a promise as one of its properties
        angular.forEach(vm.detailsStructure.sections, function(section) {
          var typeLog = section.name === 'saleEventLots' ? section : null;
          if (typeLog) {
            vm.customFields = typeLog.cards[0].log;
          }
        });
      };

      /**
       * editForm
       * This functions toggle up the edition mode. When the edition mode is toggle down,
       * this functions try to store the new changes.
       */
      var editForm = function() {
        breadcrumb.editDetails = !breadcrumb.editDetails;
        breadcrumb.moveFields = false;
      };

      /**
       * _saveConfig
       *
       * @description
       * Store the details view configuration to the database.
       *
       * @private
       */
      function _saveConfig() {
        var _auxConfigNameArray = vm.configName.split('/');
        var _configName = _auxConfigNameArray[_auxConfigNameArray.length - 1];
        var configurationEntityObject = {};

        configurationEntityObject[_configName] = angular.copy(vm.detailsStructure);

        var configurationEntity = $api.createEntityObject({
          entityName: 'configurations',
          objectSent: configurationEntityObject
        });
        $api.postEntity(configurationEntity, function() {
          $alert.success('The configuration has been saved.');
        });
      }

      $views.setViewDefinition({ editForm: editForm });
      $views.setViewDefinition({ detailsExportJson: exportJson });
      $views.setViewDefinition({ updateEntity: updateEntity });
      $views.setViewDefinition({ resetEntity: resetEntity });
      $views.setViewDefinition({ detailsSaveConfig: _saveConfig });

      // TODO REMOVE CONDITIONALS HERE
      var localConfigurationEntity = $api.createEntityObject({ entityName: 'configuration-conditional-fields' });
      $api.getLocalEntity(localConfigurationEntity, function(success) {
        vm.conditionalFields = success.data[vm.entity];
      });

      vm.autoCompleteChoices = {};

      /**
       * suggestItems
       * Function to suggest items in autocomplete functionality.
       *
       * @param {String} term -> The word used to filter the results.
       * @returns {Array} -> The array with the suggested items.
         */
      function suggestItems(term) {
        var choices = vm.autoCompleteChoices;
        var q = term.toLowerCase().trim();
        var results = [];

        // Find first 10 states that start with `term`.
        angular.forEach(choices, function(choice) {
          if (choice[vm.language].toLowerCase().indexOf(q) === 0) {
            results.push({ label: choice[vm.language], value: choice[vm.language] });
            return true;
          }
        });
        return results;
      }

      vm.autocompleteOptions = function(choices) {
        vm.autoCompleteChoices = choices;
        return {
          suggest: suggestItems
        };
      };

      /**
       * This function will return a string, given a translatable/string
       *
       * @param {Object|String} inputValue
       * @returns {number}
       */
      vm.translateValue = function(inputValue) {
        return inputValue;
      };
      /**
       * contractItemName
       * Returns a properly formatted name given a contract item.
       *
       * @param {Object|string} property
       * @returns {string} name
       */
      vm.contractItemName = function(property) {
        var _response = '';
        if (property.firstName) {
          _response = property.firstName + (property.lastName ? ' ' + property.lastName : '');
        } else if (property.name) {
          _response = property.name;
        } else {
          _response = (vm.translations[property] ? vm.translations[property] : property);
        }
        return _response;
      };
      /**
       * @name callFactoryFunction
       * @description
       * Makes a call to a function of external Factory.
       *
       * @param {String} name -> Name of the function to call
       * @param {Object} parameter1 -> Whatever the function called needs as first parameter
       * @param {Object} parameter2 -> Whatever the function called needs as second parameter
       * @param {Object} parameter3 -> Whatever the function called needs as third parameter
       * @returns {*}
       */
      vm.callFactoryFunction = function(name, parameter1, parameter2, parameter3) {
        // TODO Make this function compatible with any factory
        if (angular.isDefined(name) && angular.isFunction(saleEventDetails[name])) {
          return saleEventDetails[name](parameter1, parameter2, parameter3);
        }else if (angular.isDefined(name) && angular.isFunction(packageDetails[name])) {
          return packageDetails[name](parameter1, parameter2, parameter3);
        }
      };
      /**
       * @name app._shared.views.details.detailsController#cropUser
       *
       * @description
       * Crops the user object so it just contains the necessary data for API operations
       * @param {Object} userItem -> The user object to crop
       */
      vm.cropUser = function(userItem) {
        var _copy = {
          id: userItem.id,
          name: userItem.name,
          $$hashKey: userItem.$$hashKey
        };
        angular.copy(_copy, userItem);
      };
      /**
       * @name app._shared.views.details.detailsController#normalizeChoices
       *
       * @description
       * Compares chosen objects and their contract, injecting the chosen elements for precise referencing
       * @param {Array} choicesArray -> the array where all posible choices are stored
       * @param {Array} chosenItems -> the array of chosen objects to inject into choicesArray
       * @returns {Array}
       */
      vm.normalizeChoices = function(choicesArray, chosenItems) {
        if (!chosenItems) {
          return choicesArray;
        }
        var _normalized = [];
        var _containedElement = {};
        angular.forEach(choicesArray, function(choice) {
          _containedElement = $filter('filter')(chosenItems, {
            id: choice.id
          })[0];
          if (_containedElement) {
            _normalized.push(_containedElement);
          } else {
            _normalized.push(choice);
          }
        });
        return _normalized;
      };
      /**
       * @name app._shared.views.details.detailsController#normalizeObject
       *
       * @description
       * Compares chosen object and its contract, injecting the chosen element for precise referencing
       * @param {Array} choicesArray -> the array where all posible choices are stored
       * @param {Object} item -> The object to be injected into choicesArray
       * @returns {Array}
       */
      vm.normalizeObject = function(choicesArray, item) {
        if (!item || !angular.isObject(item)) {
          return choicesArray;
        }
        var _normalized = [];
        angular.forEach(choicesArray, function(choice) {
          if (choice.id === item.id) {
            _normalized.push(item);
          } else {
            _normalized.push(choice);
          }
        });

        return _normalized;
      };

      vm.newDatatableElement = {};
      /**
       * @name app._shared.views.details.detailsController#addNewDatatableElement
       *
       * @description
       * Add a new element to the datatable checking there is no duplicates
       * @param {String} name -> name of the datatable dataOrigin
       */
      vm.addNewDatatableElement = function(name) {
        vm.data[name] = vm.data[name] ? vm.data[name] : [];
        if (vm.newDatatableElement[name] &&
          vm.data[name].indexOf(vm.newDatatableElement[name]) === -1) {
          vm.data[name].push(vm.newDatatableElement[name]);
        }
        vm.newDatatableElement[name] = '';
      };

      /**
       * @name exportToExcelInContainers
       *
       * @memberof app._shared.views.details.detailsController
       *
       * @description
       * Exports the list to csv format
       *
       * @param {Object} cardLog -> object containing information about the list
       * @param {boolean} allFields -> true if you want to retrieve all the fields in the list
       */
      vm.exportToExcelInContainers = function(cardLog, allFields) {
        var message = vm.translations.INFO_MESSAGE_PREPARING_FILE;
        var actualExportFileName = cardLog.entity.toUpperCase() + ' ' + moment().format('YYYY-MM-DD');
        $alert.info(message);
        var excelFileEntity = {
          entityName: cardLog.entity,
          params: {
            $filter: ''
          }
        };
        var _apiURL = $api.getApiConfig().apiBaseUrl;
        var fieldList = [];
        angular.forEach(cardLog.exportData.filterFields, function(field) {
          fieldList.push(field.name);
        });
        var _requestProperties = {
          method: 'GET',
          url: _apiURL + '/' + excelFileEntity.entityName,
          headers: {
            'Authorization': localStorageService.get('apiToken'),
            'Accept': 'text/csv',
            'Accept-Language': 'en'
          },
          params: {
            '$select': !allFields ? fieldList.join(',') : '',
            '$filter': cardLog.exportData.params.$filter ? cardLog.exportData.params.$filter : ''
          }
        };

        $http(_requestProperties).then(_successCallback, _errorCallback);

        /**
         * @name _successCallback
         *
         * @memberof app._shared.views.details.detailsController
         *
         * @description
         * Success callback of the export request
         *
         * @param {Object} success -> object containing the csv data
         * @private
         */
        function _successCallback(success) {
          var anchor = angular.element('<a/>');
          var replacement = success.data.replace('ID', 'Id');

          anchor.attr({
            href: 'data:attachment/csv,' + encodeURI(replacement),
            target: '_blank',
            download: actualExportFileName + '.csv'
          })[0].click();
        }

        /**
         * @name _errorCallback
         *
         * @memberof app._shared.views.details.detailsController
         *
         * @description
         * Error callback of the export request
         *
         * @param {Object} error -> object containing the error information
         * @private
         */
        function _errorCallback(error) {
          $alert.info(error.data);
        }
      };
      /*
       TODO: JSDOC
       */
      function _plainData(data) {
        for (var propertyName in data) {
          if (data[propertyName] &&
            typeof data[propertyName] === 'object') {
            _plainProperty(propertyName + '.', data[propertyName]);
          }
        }
        return data;
        /*
         TODO: JSDOC
         */
        function _plainProperty(dottedName, value) {
          for (var propertyName in value) {
            if (value[propertyName] &&
              typeof value[propertyName] === 'object') {
              _plainProperty(dottedName + propertyName + '.', value[propertyName]);
            } else {
              data[dottedName + propertyName] = value[propertyName];
            }
          }
        }
      }
    }]);
})();
