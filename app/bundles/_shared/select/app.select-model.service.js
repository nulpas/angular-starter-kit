(function() {
  'use strict';

  angular
    .module('app._shared.select')
    /**
     * @namespace selectModel
     * @memberof app._shared.select
     *
     * @description
     * Service that gets constants for SELECT services.
     */
    .service('selectModel', selectModel);

  function selectModel() {
    /* jshint validthis: true */

    /**
     * @name Constant_
     * @memberof app._shared.select.selectModel
     * @type {Object}
     *
     * @description
     * Constants definition for selectModel service.
     */
    this.constants = {
      NO_MAX_ROWS: -1,
      MAX_ROWS_ATTRIBUTE: 'maxrows'
    };

    /**
     * @name CssClasses_
     * @memberof app._shared.select.selectModel
     * @type {Object}
     *
     * @description
     * CssClasses definition for selectModel service.
     */
    this.cssClasses = {
      LABEL: 'mdl-textfield__label',
      INPUT: 'mdl-select__input',
      IS_DIRTY: 'is-dirty',
      IS_FOCUSED: 'is-focused',
      IS_DISABLED: 'is-disabled',
      IS_INVALID: 'is-invalid',
      IS_UPGRADED: 'is-upgraded'
    };
  }
})();
