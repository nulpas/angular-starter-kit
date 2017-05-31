(function() {
  'use strict';

  angular
    .module('app._core.forms')
    /**
     * @namespace formModel
     * @memberof app._core.forms
     *
     * @description
     * Service that gets constants for FORM services.
     */
    .service('formModel', formModel);

  function formModel() {
    /* jshint validthis: true */

    /**
     * @name constants
     * @memberof app._core.forms.formModel
     * @type {Object}
     *
     * @description
     * Constants definition for formModel service.
     */
    this.constants = {
      /* Type forms */
      INPUT: 'input',
      ENUM: 'enum',
      DATE: 'date',
      TEXT_AREA: 'text-area',
      CHECK: 'check',
      FILE: 'file',

      /* Format forms */
      FORMAT_STRING: 'string',
      FORMAT_INTEGER: 'integer',
      FORMAT_FLOAT: 'float',
      FORMAT_DATE: 'date',
      FORMAT_DATETIME: 'date-time',
      FORMAT_LIST: 'list',
      FORMAT_API_CALL: 'apiCall',

      /* Input form types */
      FORM_TEXT: 'text',
      FORM_NUMBER: 'number'
    };

    /**
     * @name contractRules
     * @memberof app._core.forms.formModel
     * @type {Object}
     *
     * @description
     * Service model definition for formModel service.
     */
    this.contractRules = {
      enum: {
        object: {
          description: {
            string: {
              $: {
                TYPE: this.constants.ENUM,
                FORMAT: this.constants.FORMAT_LIST
              }
            },
            apiCall: {
              $: {
                TYPE: this.constants.ENUM,
                FORMAT: this.constants.FORMAT_API_CALL
              }
            }
          }
        },
        undefined: {
          longText: {
            true: {
              $: {
                TYPE: this.constants.TEXT_AREA,
                FORMAT: this.constants.FORMAT_STRING
              }
            },
            undefined: {
              type: {
                string: {
                  format: {
                    'date-time': {
                      $: {
                        TYPE: this.constants.DATE,
                        FORMAT: this.constants.FORMAT_DATETIME
                      }
                    },
                    date: {
                      $: {
                        TYPE: this.constants.DATE,
                        FORMAT: this.constants.FORMAT_DATE
                      }
                    },
                    undefined: {
                      description: {
                        string: {
                          $: {
                            TYPE: this.constants.INPUT,
                            FORMAT: this.constants.FORMAT_STRING,
                            FORM_TYPE: this.constants.FORM_TEXT
                          }
                        }
                      }
                    }
                  }
                },
                integer: {
                  $: {
                    TYPE: this.constants.INPUT,
                    FORMAT: this.constants.FORMAT_INTEGER,
                    FORM_TYPE: this.constants.FORM_NUMBER
                  }
                },
                number: {
                  format: {
                    float: {
                      $: {
                        TYPE: this.constants.INPUT,
                        FORMAT: this.constants.FORMAT_FLOAT,
                        FORM_TYPE: this.constants.FORM_NUMBER
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }
})();
