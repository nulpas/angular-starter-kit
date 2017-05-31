(function() {
  'use strict';

  angular
    .module('app._core.forms.auto-complete')
    /**
     * @namespace bcaAutoComplete
     * @memberof app._core.forms.auto-complete
     *
     * @requires forms
     *
     * @description
     * Directive definition for auto-complete input form elements.
     */
    .directive('bcaAutoComplete', bcaAutoComplete);

  bcaAutoComplete.$inject = ['forms'];

  function bcaAutoComplete(forms) {
    return {
      restrict: 'A',
      templateUrl: 'bundles/_core/forms/auto-complete/app.auto-complete.view.tpl.html',
      controller: 'AutoCompleteFieldController',
      controllerAs: 'ac',
      bindToController: {
        bcaAutoComplete: '=',
        bcaId: '='
      },
      scope: true,
      link: link
    };

    function link(scope, element) {
      element.on('mouseover', function(e) {
        scope.$evalAsync(function() {
          if (e.target.classList.contains('bca-autocomplete__item')) {
            forms.autoCompleteListOnMouseOver(angular.element(e.target));
          }
        });
      });

      element.on('click', function(e) {
        scope.$evalAsync(function() {
          if (e.target.classList.contains('bca-autocomplete__button--icon')) {
            scope.ac.inputModel = '';
            forms.autoCompleteOn(e.target.id);
          }
        });
      });

      element.on('keydown', function(e) {
        scope.$evalAsync(function() {
          var keyIsArrowDown = (e.keyCode === forms.$.KEY.ARROW_DOWN.CODE && e.key === forms.$.KEY.ARROW_DOWN.NAME);
          var keyIsArrowUp = (e.keyCode === forms.$.KEY.ARROW_UP.CODE && e.key === forms.$.KEY.ARROW_UP.NAME);
          var keyIsEscape = (e.keyCode === forms.$.KEY.ESCAPE.CODE && e.key === forms.$.KEY.ESCAPE.NAME);
          var keyIsEnter = (e.keyCode === forms.$.KEY.ENTER.CODE && e.key === forms.$.KEY.ENTER.NAME);
          var id = e.target.id.split('_search').join('');
          var listSelector = '#' + id + '_list LI.bca-autocomplete__item';
          var list = angular.element(listSelector);
          var itemHovered = angular.element('#' + id + '_list LI.bca-autocomplete__item--hover');
          if (keyIsArrowDown || keyIsArrowUp) {
            var item = (keyIsArrowDown) ? itemHovered.next(listSelector) : itemHovered.prev(listSelector) ;
            if (!itemHovered.length || !item.length) {
              item = (keyIsArrowDown) ? list.first(listSelector) : list.last(listSelector) ;
            }
            forms.autoCompleteListOnMouseOver(item);
          }
          if (keyIsEscape) {
            forms.autoCompleteOff();
            angular.element(e.target).blur();
          }
          if (keyIsEnter && itemHovered.length) {
            console.log(itemHovered);
            console.log(scope);
          }
        });
      });

      element.on('$destroy', function() {
        scope.$destroy();
      });
    }
  }
})();
