//TODO: Vader says: "Remove this asap."

(function() {
  'use strict';

  angular.module('app._shared.views.details')
    .factory('detailsFactory', [
      function() {
        var singleton = {};
        return {
          service: function(id) {
            return {
              set: function(value) {
                singleton[id] = value;
                return singleton;
              },
              get: function() {
                return singleton[id];
              }
            };
          }
        };
      }]);
}());
