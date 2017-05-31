(function() {
  'use strict';

  angular
    .module('app._shared.prevent-double-click')
    /**
     * @namespace bcaSelect
     * @memberof app._shared.select
     *
     * @description
     * Directive definition for select input form elements.
     */
    .directive('preventDoubleClick', ['$timeout', preventDoubleClick]);

  function preventDoubleClick($timeout) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      var htmlElement = element[0];
      element.on('click submit', function(event) {
        if (event.type === 'submit') {
          htmlElement = searchSubmitButton(htmlElement);
        }

        if (htmlElement) {
          htmlElement.disabled = true;
        }

        $timeout(function() {
          if (htmlElement) {
            htmlElement.disabled = false;
          }
        }, 6000);
      });
    }

    function searchSubmitButton(formElement) {
      var submitButton = {};
      angular.forEach(formElement, function(childElement) {
        submitButton = childElement.type === 'submit' ? childElement : submitButton;
      });
      return submitButton ? submitButton : {};
    }
  }
})();
