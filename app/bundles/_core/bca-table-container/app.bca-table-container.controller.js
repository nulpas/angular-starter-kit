(function() {
  'use strict';

  angular
    .module('app._core.bca-table-container')
    /**
     * @name BcaTableContainerController
     * @memberof app._core.bca-table-container
     *
     * @description
     * Controller for handle table container component.
     */
    .controller('BcaTableContainerController', BcaTableContainerController);

  BcaTableContainerController.$inject = ['$timeout', '$scope', '$api', '$tools', 'selectedEntities'];

  function BcaTableContainerController($timeout, $scope, $api, $tools, selectedEntities) {
    var vm = this;
    var _controllerHtmlElement = {};
    var _controllerData = {};
    var entityName = '';

    // LOAD ON SCROLL VARIABLES //
    var actualLength = 0;
    var rowHeight = 50;
    var cellsPerPage = 0;
    var numberOfCells = 0;
    var elementHeight = 0;
    var scrollTop = 0;
    var timer = null;
    //////////////////////////////

    vm.visibleElements = [];
    vm.canvasHeight = 0;
    vm.uniqueName = '';
    vm.selectedEntities = selectedEntities;
    vm.fields = [];
    vm.selectAllModelObject = {
      text: 'Select/Deselect all.',
      checked: false
    };
    vm.$postLink = _postLinkHandler;

    vm.selectDeselectAll = function(checked) {
      var newValue = !checked;
      vm.selectAllModelObject.checked = newValue;
      selectedEntities.selectOrDeselectAll(newValue, { entityName: entityName, uniqueName: vm.uniqueName });
    };

    function _postLinkHandler() {
      vm.promiseData.then(function(success) {
        $timeout(function() {
          _controllerData = success;
          vm.fields = _controllerData.fields;
          vm.uniqueName = _controllerData.uniqueName;
          entityName = _controllerData.entityName;
          _controllerHtmlElement = angular.element('#' + success.uniqueName + ' .bca-table__scroll-container');
          actualLength = _controllerData._cursor.totalResult;
          elementHeight = _controllerHtmlElement[0].clientHeight;

          _controllerHtmlElement[0].addEventListener('scroll', _onScrollHandler);
          _controllerHtmlElement[0].addEventListener('DOMNodeRemoved', function(e) {
            e.target.parentNode.focus();
          });

          _init();
        });
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
      var auxCanvasHeight = actualLength * rowHeight;
      cellsPerPage = Math.round(elementHeight / rowHeight);
      numberOfCells = 3 * cellsPerPage;
      vm.canvasHeight = {
        height: (_controllerData.data.length * rowHeight + 30) + 'px'
      };

      if (auxCanvasHeight < elementHeight) {
        _loadEntitiesAtTheBottom();
      } else {
        vm.canvasHeight = {
          height: auxCanvasHeight < elementHeight ? elementHeight : auxCanvasHeight + 'px'
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
      var firstCell = Math.max(Math.floor(scrollTop / rowHeight) - cellsPerPage, 0);
      var cellsToCreate = Math.min(firstCell + numberOfCells, numberOfCells);
      vm.visibleElements = _controllerData.data.slice(firstCell, firstCell + cellsToCreate);

      angular.forEach(vm.visibleElements, function(visibleElement, key) {
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
      $scope.$evalAsync(function() {
        scrollTop = _controllerHtmlElement.prop('scrollTop');
        _updateDisplayList();

        if (timer) {
          $timeout.cancel(timer);
        }

        timer = $timeout(function() {
          var hiddenContentHeight = _controllerHtmlElement.prop('scrollHeight') - _controllerHtmlElement.height();

          if (hiddenContentHeight - scrollTop <= 100) {
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
      if (_controllerData._cursor.next) {
        var _entityQueryObject = $api.createEntityObject({
          entityName: _controllerData._cursor.next.split('/api/').join('')
        });
        var promiseObject = $api.getEntity(_entityQueryObject);

        promiseObject.then(function(success) {
          _controllerData._cursor = success._cursor.plain();
          _controllerData.data = $tools.arrayMerge(_controllerData.data, success.data);
          actualLength = _controllerData.data.length;
          _controllerData._cursor.totalResult = actualLength;

          _init();
        });
      }
    }
  }
})();
