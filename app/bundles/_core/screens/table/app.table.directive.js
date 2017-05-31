(function() {
  'use strict';

  angular
    .module('app._core.screens.table')
    /**
     * @namespace bcaTableView
     * @memberof app._core.screens.table
     *
     * @description
     * Directive definition for TABLE VIEW.
     */
    .directive('bcaTableView', bcaTableView);

  bcaTableView.$inject = ['$api', '$tools', '$timeout'];

  function bcaTableView($api, $tools, $timeout) {
    var _directiveScope = {};
    var _directiveElement = {};
    var timer = null;
    var actualLength = 0;
    var rowHeight = 100;

    return {
      restrict: 'A',
      templateUrl: 'bundles/_core/screens/table/app.table.view.tpl.html',
      controller: 'TableController',
      controllerAs: 'table',
      bindToController: {
        bcaTableView: '='
      },
      link: link
    };

    function link(scope, element) {

      _directiveScope = scope;
      _directiveElement = element;

      scope.table.bcaTableView.then(function() {
        actualLength = scope.table.screen.data.length;
        scope.height = element[0].clientHeight;
        scope.scrollTop = 0;
        scope.visibleProvider = [];
        scope.cellsPerPage = 0;
        scope.numberOfCells = 0;
        scope.canvasHeight = {};
        scope.table.screen._cursor.totalResult = actualLength;
        element[0].addEventListener('scroll', _onScrollHandler);
        element[0].addEventListener('DOMNodeRemoved', function(e) {
          e.target.parentNode.focus();
        });

        if (true) {
          return;
        } else {
          _init();
        }
      });

      element.on('$destroy', function() {
        scope.$destroy();
      });
    }

    /**
     * @name _init
     * @memberof app._core.load-on-scroll.bcaLoadOnScroll
     *
     * @description
     * Initializes the directive.
     *
     * @private
     */
    function _init() {
      var auxCanvasHeight = actualLength * rowHeight + 30;
      _directiveScope.cellsPerPage = Math.round(_directiveScope.height / rowHeight);
      _directiveScope.numberOfCells = 3 * _directiveScope.cellsPerPage;
      _directiveScope.canvasHeight = {
        height: (_directiveScope.table.screen.data.length * rowHeight + 30) + 'px'
      };

      if (auxCanvasHeight < _directiveScope.height) {
        _loadEntitiesAtTheBottom();
      } else {
        _directiveScope.canvasHeight = {
          height: auxCanvasHeight < _directiveScope.height ? _directiveScope.height : auxCanvasHeight + 'px'
        };
      }

      _updateDisplayList();
    }

    /**
     * @name _updateDisplayList
     * @memberof app._core.load-on-scroll.bcaLoadOnScroll
     *
     * @description
     * Sets the new viewport of the list.
     *
     * @private
     */
    function _updateDisplayList() {
      var firstCell = Math.max(Math.floor(_directiveScope.scrollTop / rowHeight) - _directiveScope.cellsPerPage, 0);
      var cellsToCreate = Math.min(firstCell + _directiveScope.numberOfCells, _directiveScope.numberOfCells);
      _directiveScope.visibleProvider = _directiveScope.table.screen.data.slice(firstCell, firstCell + cellsToCreate);

      angular.forEach(_directiveScope.visibleProvider, function(visibleElement, key) {
        visibleElement.styles = {
          'top': ((firstCell + key) * rowHeight) + 'px'
        };
      });
    }

    /**
     * @name _onScrollHandler
     * @memberof app._core.load-on-scroll.bcaLoadOnScroll
     *
     * @description
     * Scroll handler. This sets a new viewport on each scroll event. This also checks if the directive should
     * load more data at the bottom of the list.
     *
     * @private
     */
    function _onScrollHandler() {
      _directiveScope.$evalAsync(function() {
        _directiveScope.scrollTop = _directiveElement.prop('scrollTop');
        _updateDisplayList();

        if (timer) {
          $timeout.cancel(timer);
        }

        timer = $timeout(function() {
          var hiddenContentHeight = _directiveElement.prop('scrollHeight') - _directiveElement.height();

          if (hiddenContentHeight - _directiveScope.scrollTop <= 100) {
            _loadEntitiesAtTheBottom();
            _updateDisplayList();
          }
        }, 250);
      });
    }

    /**
     * @name _loadEntitiesAtTheBottom
     * @memberof app._core.load-on-scroll.bcaLoadOnScroll
     *
     * @description
     * Make an API call to get the next block of data.
     *
     * @private
     */
    function _loadEntitiesAtTheBottom() {
      if (_directiveScope.table.screen._cursor.next) {
        var _entityQueryObject = $api.createEntityObject({
          entityName: _directiveScope.table.screen._cursor.next.split('/api/').join('')
        });
        var promiseObject = $api.getEntity(_entityQueryObject);

        promiseObject.then(function(success) {
          _directiveScope.table.screen._cursor = success._cursor.plain();
          _directiveScope.table.screen.data = $tools.arrayMerge(_directiveScope.table.screen.data, success.data);
          actualLength = _directiveScope.table.screen.data.length;
          _directiveScope.table.screen._cursor.totalResult = actualLength;

          _init();
        });
      }
    }
  }
})();
