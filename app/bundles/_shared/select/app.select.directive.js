(function() {
  'use strict';

  angular
    .module('app._shared.select')
    /**
     * @namespace bcaSelect
     * @memberof app._shared.select
     *
     * @description
     * Directive definition for select input form elements.
     */
    .directive('bcaSelect', bcaSelect);

  function bcaSelect() {
    return {
      restrict: 'A',
      templateUrl: 'bundles/_shared/select/app.select.view.tpl.html',
      controller: 'SelectFieldController',
      controllerAs: 's',
      bindToController: {
        bcaSelect: '=',
        model: '='
      },
      scope: true,
      link: link
    };

    function link(scope, element) {
      element.on('$destroy', function() {
        scope.$destroy();
      });
    }
  }
})();
