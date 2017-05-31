(function() {
  'use strict';

  angular
    .module('app._core.screens.file')
    .directive('bcaFileView', bcaFileView);

  bcaFileView.$inject = ['$document', 'forms'];

  function bcaFileView($document, forms) {
    return {
      restrict: 'A',
      templateUrl: 'bundles/_core/screens/file/app.file.view.tpl.html',
      controller: 'FileController',
      controllerAs: 'file',
      bindToController: {
        bcaFileView: '='
      },
      link: link
    };

    function link(scope, element) {
      $document.on('click', function(e) {
        scope.$evalAsync(function() {
          var isNotButtonIcon = (!e.target.classList.contains('bca-autocomplete__button--icon'));
          var isNotSearchInput = (!e.target.classList.contains('bca-autocomplete__input'));
          if (isNotButtonIcon && isNotSearchInput) {
            forms.autoCompleteOff();
          }
        });
      });

      element.on('$destroy', function() {
        scope.$destroy();
      });
    }
  }
})();
