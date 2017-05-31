(function() {
  'use strict';

  angular
    .module('app._core.forms')
    .factory('forms', forms);

  forms.$inject = ['$tools', 'shape', 'formModel'];

  function forms($tools, shape, formModel) {
    var _formSettings = {};
    var $ = angular.extend({}, formModel.constants, $tools.$);

    return {
      $: $,
      assembleFormRequest: assembleFormRequest,
      getElementSettings: getElementSettings,
      getLogicMandatory: getLogicMandatory,
      autoCompleteOn: autoCompleteOn,
      autoCompleteOff: autoCompleteOff,
      autoCompleteListOnMouseOut: autoCompleteListOnMouseOut,
      autoCompleteListOnMouseOver: autoCompleteListOnMouseOver
    };

    function _contractRules(elementContract, contractRule) {
      var output = null;
      angular.forEach(contractRule, function(value, key) {
        output = (key === '$') ? value : _contractRules(elementContract, contractRule[key][elementContract[key]]) ;
      });
      return output;
    }

    function _element($f) {
      var $e = $f.fieldSetting[$f.element];
      var _elementValue = null;
      var _mandatory = false;
      var _logic = null;
      var _multiple = $e.multiple || false;
      if ($f.data) {
        var arrayElement = angular.copy($f.element.split('/'));
        var firstElement = arrayElement.shift();
        if (_multiple) {
          if ($f.data[firstElement]) {
            if (angular.isArray($f.data[firstElement])) {
              var dotedSubElement = arrayElement.join('.');
              _elementValue = {};
              angular.forEach($f.data[firstElement], function(value) {
                var val = $tools.getValueFromDotedKey(value, dotedSubElement);
                var key = $tools.toCamelCase(val, ' ');
                _elementValue[key] = { id: value.id };
                _elementValue[key][dotedSubElement.split('.').join('/')] = val;
              });
            } else {
              throw new TypeError('An array is expected. Wrong type for: ' + $f.element);
            }
          }
        } else {
          _elementValue = $tools.getValueFromDotedKey($f.data, $f.element.split('/').join('.'));
        }
      }

      /* Fields logic block */
      var _hasLogic = ($f.viewConfig.hasOwnProperty('fieldsLogic'));
      var _hasStandardLogic = (_hasLogic && $f.viewConfig.fieldsLogic.hasOwnProperty('standard'));
      var _hasValuesLogic = (_hasLogic && $f.viewConfig.fieldsLogic.hasOwnProperty('values'));
      if (_hasStandardLogic && $f.viewConfig.fieldsLogic.standard.hasOwnProperty('mandatory')) {
        if ($f.viewConfig.fieldsLogic.standard.mandatory.indexOf($f.element) > -1) {
          _mandatory = true;
        }
      }
      if (_hasValuesLogic && $f.viewConfig.fieldsLogic.values.hasOwnProperty($f.element)) {
        _logic = $f.viewConfig.fieldsLogic.values[$f.element];
      }

      var elementForm = _contractRules($e, formModel.contractRules.enum[typeof $e.enum]);

      return {
        label: $f.element,
        type: elementForm.TYPE,
        format: elementForm.FORMAT,
        formType: (elementForm.FORM_TYPE) ? elementForm.FORM_TYPE : null,
        enum: ($e.hasOwnProperty('enum')) ? $e.enum : null,
        value: _elementValue,
        isMandatory: _mandatory,
        isMultiple: _multiple,
        logic: _logic
      };
    }

    function assembleFormRequest(screenSettings, formGroup, formElement) {
      return {
        fieldSetting: screenSettings.fields,
        source: screenSettings.source,
        data: (screenSettings.hasOwnProperty('data')) ? screenSettings.data.data : null,
        viewConfig: formGroup,
        element: formElement
      };
    }

    function getElementSettings(formRequest) {
      var tag = shape.tag(formRequest.source);
      var element = formRequest.element;
      var _isSettings = (_formSettings.hasOwnProperty(tag));
      var _isFieldConf = (_isSettings && _formSettings[tag].hasOwnProperty(element));
      _formSettings[tag] = _formSettings[tag] || {};
      _formSettings[tag][element] = (_isFieldConf) ? _formSettings[tag][element] : _element(formRequest) ;
      return _formSettings[tag][element];
    }

    function getLogicMandatory(element, logicMandatoryRules) {
      return !!(logicMandatoryRules && logicMandatoryRules.indexOf(element) > -1);
    }

    function autoCompleteOn(tagId) {
      angular.element('DIV.bca-autocomplete__list:not(#' + tagId + '_list)').hide();
      var drop = angular.element('#' + tagId + '_list');
      if (drop.is(':visible')) {
        drop.hide();
      } else {
        drop.show();
      }
      angular.element('#' + tagId + '_search').focus();
    }

    function autoCompleteOff() {
      autoCompleteListOnMouseOut();
      angular.element('DIV.bca-autocomplete__list').hide();
    }

    function autoCompleteListOnMouseOver(element) {
      autoCompleteListOnMouseOut();
      element.addClass('bca-autocomplete__item--hover');
    }

    function autoCompleteListOnMouseOut() {
      angular.element('LI.bca-autocomplete__item').removeClass('bca-autocomplete__item--hover');
    }
  }
})();
