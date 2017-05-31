(function() {
  'use strict';

  angular.module('app._shared.counter')
    .controller('counterController', [
      'count',
      function(count) {
        var vm = this;

        vm.count = count.getCounter;
      }
    ]);
})();
