(function() {
  'use strict';

  angular.module('app._shared.views.simpleList')
    .factory('simpleList', [
      function() {
        var singleton = {};
        return {
          service: function(id) {
            return {
              set: function(value, load) {
                singleton[id] = value;
                singleton[id].load = load;
                return singleton;
              },
              get: function() {
                return singleton[id];
              },
              load: function() {
                return singleton[id].load;
              }
            };
          }
        };
      }
    ]);
})();
