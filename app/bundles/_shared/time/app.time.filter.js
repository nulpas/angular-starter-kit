(function() {
  'use strict';

  angular.module('app.time')
    .filter('timeAgo', [
      function() {
        return function(date) {
          return moment.utc(date).fromNow();
        };
      }
    ]);
}());
