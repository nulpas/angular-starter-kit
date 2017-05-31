(function() {
  'use strict';

  /**
   * getSelectableElements
   * Function to get the selectable elements.
   *
   * @param {Object} element
   * @returns {Array}
     */
  function getSelectableElements(element) {
    var out = [];
    var children = element.children();
    angular.forEach(children, function(anElement) {
      var child = angular.element(anElement);
      if (child[0].hasAttribute('data-multiple-selection-item')) {
        out.push(child);
      } else {
        out = out.concat(getSelectableElements(child));
      }
    });
    return out;
  }

  function offset(element) {
    var documentElem;
    var box = {
      top: 0,
      left: 0
    };
    var doc = element && element.ownerDocument;
    documentElem = doc.documentElement;
    if (typeof element.getBoundingClientRect !== 'undefined') {
      box = element.getBoundingClientRect();
    }
    return {
      top: box.top + (window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
      left: box.left + (window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0)
    };
  }

  angular.module('app._shared.selection')
    .directive('multipleSelectionZone', [
      'selectedListFactory',
      function(selectedListFactory) {
        return {
          restrict: 'A',
          scope: {
            control: '='
          },
          link: function(scope, element) {
            scope.internalControl = scope.control || {};

            scope.internalControl.switchSelectMode = function(selectMode) {
              var children = getSelectableElements(element);
              scope.internalControl.clear(children);
              for (var i = 0; i < children.length; i++) {
                children[i].scope().switchSelectMode(selectMode);
              }
            };

            scope.internalControl.switchSelectAll = function(selectAll) {
              var children = getSelectableElements(element);
              if (!selectAll) {
                scope.internalControl.clear(children);
              } else {
                selectedListFactory.clearList();
                for (var j = 0; j < children.length; j++) {
                  children[j].scope().isSelecting = false;
                  children[j].scope().isSelected = true;
                  selectedListFactory.addItemToList(children[j].scope().row);
                }
              }
            };

            scope.internalControl.clear = function(elems) {
              var children = (!elems) ? getSelectableElements(element.children()) : elems;
              for (var i = 0; i < children.length; i++) {
                children[i].scope().isSelecting = false;
                children[i].scope().isSelected = false;
                if (!elems) {
                  children[i].scope().switchSelectMode(false);
                }
              }
              selectedListFactory.clearList();
            };
          }
        };
      }
    ])

    .directive('multipleSelectionItem', [
      '$document',
      'selectedListFactory',
      function($document, selectedListFactory) {
        return {
          restrict: 'A',
          link: function(scope, element) {
            scope.isSelectableZone = true;
            scope.isSelectable = true;
            scope.isSelecting = false;
            scope.isSelected = false;
            scope.selectMode = false;
            var startX = 0;
            var startY = 0;
            var helper;
            var firstDragElement = null;

            /**
             * checkElementHitting
             * Check these two boxes hitting.
             *
             * @param {Object} box1
             * @param {Object} box2
             * @returns {Boolean}
             */
            function checkElementHitting(box1, box2) {
              return (box2.beginX <= box1.beginX && box1.beginX <= box2.endX || box1.beginX <= box2.beginX &&
                box2.beginX <= box1.endX) && (box2.beginY <= box1.beginY && box1.beginY <= box2.endY ||
                box1.beginY <= box2.beginY && box2.beginY <= box1.endY);
            }

            /**
             * transformBox
             * Transform box to object. "beginX" is always be less then "endX". "beginY" is always be less then endY.
             *
             * @param {Number} startX
             * @param {Number} startY
             * @param {Number} endX
             * @param {Number} endY
             * @returns {Object}
             */
            function transformBox(startX, startY, endX, endY) {
              var result = {};
              if (startX > endX) {
                result.beginX = endX;
                result.endX = startX;
              } else {
                result.beginX = startX;
                result.endX = endX;
              }
              if (startY > endY) {
                result.beginY = endY;
                result.endY = startY;
              } else {
                result.beginY = startY;
                result.endY = endY;
              }
              return result;
            }

            /**
             * moveSelectionHelper
             * Method move selection helper.
             *
             * @param {Object} helper
             * @param {Number} startX
             * @param {Number} startY
             * @param {Number} endX
             * @param {Number} endY
             */
            function moveSelectionHelper(helper, startX, startY, endX, endY) {
              var box = transformBox(startX, startY, endX, endY);
              helper.css({
                'top': box.beginY + 'px',
                'left': box.beginX + 'px',
                'width': (box.endX - box.beginX) + 'px',
                'height': (box.endY - box.beginY) + 'px'
              });
            }

            function mouseMove(event) {
              // Prevent default dragging of selected content
              event.preventDefault();
              // Move helper
              moveSelectionHelper(helper, startX, startY, event.pageX, event.pageY);
              // Check items is selecting
              var children = getSelectableElements(element.parent());
              for (var i = 0; i < children.length; i++) {
                if (checkElementHitting(transformBox(offset(children[i][0]).left, offset(children[i][0]).top,
                  offset(children[i][0]).left + children[i].prop('offsetWidth'), offset(children[i][0]).top +
                    children[i].prop('offsetHeight')), transformBox(startX, startY, event.pageX, event.pageY))) {
                  if (!children[i].scope().isSelecting) {
                    children[i].scope().isSelecting = true;
                    children[i].scope().$apply();
                  }
                } else if (children[i].scope().isSelecting) {
                  children[i].scope().isSelecting = false;
                  children[i].scope().$apply();
                }
              }
            }

            function mouseUp(event) {
              // Prevent default dragging of selected content
              event.preventDefault();
              // Remove helper
              helper.remove();

              // Change all selecting items to selected
              var children = getSelectableElements(element.parent());

              for (var i = 0; i < children.length; i++) {
                if (children[i].scope().row.id !== element.scope().row.id) {
                  if (children[i].scope().isSelecting) {
                    children[i].scope().isSelecting = false;
                    children[i].scope().isSelected = event.ctrlKey ? !children[i].scope().isSelected : true;
                    if (children[i].scope().isSelected) {
                      selectedListFactory.addItemToList(children[i].scope().row);
                    } else {
                      selectedListFactory.deleteItemFromList(children[i].scope().row);
                    }
                    children[i].scope().$apply();
                  } else {
                    if (checkElementHitting(transformBox(children[i]
                      .prop('offsetLeft'), children[i].prop('offsetTop'), children[i].prop('offsetLeft') +
                        children[i].prop('offsetWidth'), children[i].prop('offsetTop') +
                        children[i].prop('offsetHeight')),
                        transformBox(event.pageX, event.pageY, event.pageX, event.pageY))) {
                      if ((!event.ctrlKey) && (children[i].scope().row.id === element.scope().row.id)) {
                        if (!children[i].scope().isSelected) {
                          children[i].scope().isSelected = true;
                          selectedListFactory.addItemToList(children[i].scope().row);
                          children[i].scope().$apply();
                        }
                      }
                    }
                  }
                } else {
                  if (event.ctrlKey) {
                    if (element.scope().isSelected) {
                      element.scope().isSelected = false;
                      element.scope().isSelecting = false;
                      selectedListFactory.deleteItemFromList(children[i].scope().row);
                      element.scope().$apply();
                    } else {
                      element.scope().isSelected = true;
                      element.scope().isSelecting = false;
                      selectedListFactory.addItemToList(children[i].scope().row);
                      element.scope().$apply();
                    }
                  } else if (!element.scope().isSelected) {
                    element.scope().isSelected = true;
                    element.scope().isSelecting = false;
                    selectedListFactory.addItemToList(children[i].scope().row);
                    element.scope().$apply();
                  }
                }
              }
              // Remove listeners
              $document.off('mousemove', mouseMove);
              $document.off('mouseup', mouseUp);
            }

            function mouseDown(event) {
              // Prevent default dragging of selected content
              event.preventDefault();
              firstDragElement = element;
              if (!event.ctrlKey) {
                // Skip all selected or selecting items
                var children = getSelectableElements(element.parent());
                for (var i = 0; i < children.length; i++) {
                  if (children[i].scope().isSelecting || children[i].scope().isSelected) {
                    children[i].scope().isSelecting = false;
                    children[i].scope().isSelected = false;
                    selectedListFactory.deleteItemFromList(children[i].scope().row);
                    children[i].scope().$apply();
                  }
                }
              }
              // Update start coordinates
              startX = event.pageX;
              startY = event.pageY;
              // Create helper
              helper = angular
                .element('<div></div>')
                .addClass('select-helper');

              $document.find('body').eq(0).append(helper);
              // Attach events
              $document.on('mousemove', mouseMove);
              $document.on('mouseup', mouseUp);
            }

            element.on('mouseenter', function() {
              element.scope().isSelecting = true;
              element.scope().$apply();
            });

            element.on('mouseleave', function() {
              element.scope().isSelecting = false;
              element.scope().$apply();
            });

            scope.switchSelectMode = function(selectMode) {
              scope.selectMode = selectMode;
              if (selectMode) {
                element.on('mousedown', mouseDown);
              } else {
                element.off('mousedown', mouseDown);
              }
            };

            scope.$on('$destroy', function() {
              element.off('mousedown', mouseDown);
            });
          }
        };
      }
    ]);
})();
