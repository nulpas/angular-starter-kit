(function() {
  'use strict';

  angular
    .module('app._shared.select')
    /**
     * @namespace select
     * @memberof app._shared.select
     *
     * @requires selectModel
     *
     * @description
     * Factory that creates options and binds methods for select component.
     */
    .factory('select', select);

  select.$inject = ['selectModel'];

  function select(selectModel) {

    /**
     * @name MaterialSelect
     * @memberof app._shared.select
     *
     * @description
     * Constructor of MaterialSelect component.
     *
     * @param {Object} element -> The element generated
     */
    function MaterialSelect(element) {
      this.element_ = element;
      this.maxRows = selectModel.constants.NO_MAX_ROWS;
      // Initialize instance.
      this.init();
    }

    function initListeners(context) {
      if (context.input_.hasAttribute(selectModel.constants.MAX_ROWS_ATTRIBUTE)) {
        context.maxRows = parseInt(context.input_.getAttribute(
          selectModel.constants.MAX_ROWS_ATTRIBUTE), 10);
        if (isNaN(context.maxRows)) {
          context.maxRows = selectModel.constants.NO_MAX_ROWS;
        }
      }

      context.boundUpdateClassesHandler = context.updateClasses_.bind(context);
      context.boundFocusHandler = context.onFocus_.bind(context);
      context.boundBlurHandler = context.onBlur_.bind(context);
      context.input_.addEventListener('input', context.boundUpdateClassesHandler);
      context.input_.addEventListener('focus', context.boundFocusHandler);
      context.input_.addEventListener('blur', context.boundBlurHandler);

      if (context.maxRows !== selectModel.constants.NO_MAX_ROWS) {
        // TODO: this should handle pasting multi line text.
        // Currently doesn't.
        context.boundKeyDownHandler = context.onKeyDown_.bind(context);
        context.input_.addEventListener('keydown', context.boundKeyDownHandler);
      }

      context.updateClasses_();
      context.element_.classList.add(selectModel.cssClasses.IS_UPGRADED);
    }

    /**
     * @name onKeyDown_
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * onKeyDown component's method.
     *
     * @param {Object} event -> The event generated
     */
    MaterialSelect.prototype.onKeyDown_ = function(event) {
      var currentRowCount = event.target.value.split('\n').length;
      if (event.keyCode === 13 && currentRowCount >= this.maxRows) {
        event.preventDefault();
      }
    };

    /**
     * @name onFocus_
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * onFocus component's method.
     */
    MaterialSelect.prototype.onFocus_ = function() {
      this.element_.classList.add(selectModel.cssClasses.IS_FOCUSED);
    };

    /**
     * @name onBlur_
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * onBlur component's method.
     */
    MaterialSelect.prototype.onBlur_ = function() {
      this.element_.classList.remove(selectModel.cssClasses.IS_FOCUSED);
    };

    /**
     * @name updateClasses_
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Functon that updaes classes for this component.
     */
    MaterialSelect.prototype.updateClasses_ = function() {
      this.checkDisabled();
      this.checkValidity();
      this.checkDirty();
    };

    /**
     * @name checkDisabled
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Function that checks if this component is disabled, and modifies his classes
     */
    MaterialSelect.prototype.checkDisabled = function() {
      if (this.input_.disabled) {
        this.element_.classList.add(selectModel.cssClasses.IS_DISABLED);
      } else {
        this.element_.classList.remove(selectModel.cssClasses.IS_DISABLED);
      }
    };

    /**
     * @name checkValidity
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Function that checks if this component is valid, and modifies his classes
     */
    MaterialSelect.prototype.checkValidity = function() {
      if (this.input_.validity.valid) {
        this.element_.classList.remove(selectModel.cssClasses.IS_INVALID);
      } else {
        this.element_.classList.add(selectModel.cssClasses.IS_INVALID);
      }
    };

    /**
     * @name checkDirty
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Function that checks if this component is dirty, and modifies his classes
     */
    MaterialSelect.prototype.checkDirty = function() {
      if (this.input_.value && this.input_.value.length > 0) {
        this.element_.classList.add(selectModel.cssClasses.IS_DIRTY);
      } else {
        this.element_.classList.remove(selectModel.cssClasses.IS_DIRTY);
      }
    };

    /**
     * @name disable
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Function that disables the component.
     */
    MaterialSelect.prototype.disable = function() {
      this.input_.disabled = true;
      this.updateClasses_();
    };

    /**
     * @name enable
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Function that enables the component.
     */
    MaterialSelect.prototype.enable = function() {
      this.input_.disabled = false;
      this.updateClasses_();
    };

    /**
     * @name change
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Function that changes the component.
     */
    MaterialSelect.prototype.change = function(value) {
      if (value) {
        this.input_.value = value;
      }
      this.updateClasses_();
    };

    /**
     * @name init
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Function that inits the component.
     */
    MaterialSelect.prototype.init = function() {
      if (this.element_) {
        this.input_ = this.element_.querySelector('.' + selectModel.cssClasses.INPUT);

        if (this.input_) {
          initListeners(this);
        }
      }
    };

    /**
     * @name mdlDowngrade_
     * @memberof app._shared.select.MaterialSelect
     *
     * @description
     * Method that removes component's handlers.
     */
    MaterialSelect.prototype.mdlDowngrade_ = function() {
      this.input_.removeEventListener('input', this.boundUpdateClassesHandler);
      this.input_.removeEventListener('focus', this.boundFocusHandler);
      this.input_.removeEventListener('blur', this.boundBlurHandler);
      if (this.boundKeyDownHandler) {
        this.input_.removeEventListener('keydown', this.boundKeyDownHandler);
      }
    };

    // The component registers itself. It can assume componentHandler is available
    // in the global scope.
    componentHandler.register({
      constructor: MaterialSelect,
      classAsString: 'MaterialSelect',
      cssClass: 'mdl-js-select',
      widget: true
    });

    return MaterialSelect;

  }
})();
