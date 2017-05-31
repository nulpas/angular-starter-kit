(function() {
  'use strict';

  angular.module('app._shared.counter')
    /**
     * @name app._shared.counter.count
     *
     * @description
     * Factory used to count and retrieve the total elements filtered in a workList and the index of the current entity
     */

    .factory('count', [
      function() {
        var count = '0';
        var loaded = '0';
        var total = '0';
        return {
          /**
           * @name setCounter
           *
           * @description
           * Generates and saves a string that shows the count of the elements on the lists
           * using the properties of the received cursor
           *
           * @param {Object} cursor
           */
          setCounter: function(cursor) {
            loaded =  cursor.skip + cursor.top;
            total = cursor.totalFiltered;
            if (loaded > total) {
              loaded = total;
            }
            count = loaded + '/' + total;
          },

          /**
           * getCounter
           * Returns the count string
           *
           * @returns {string} cursor
           */
          getCounter: function() {
            return count;
          },
          /**
           * getTotal
           * Returns the number of the total elements filtered
           *
           * @returns {string} total
           */
          getTotal: function() {
            return total;
          }
        };
      }
    ]);
})();
