(function() {
  'use strict';

  angular.module('app._shared.upgrade-mdl')
    .factory('upgradeMdlService', ['$timeout',
      function($timeout) {
        var timer;
        return {
          upgradeAll: function() {
            $timeout.cancel(timer);
            timer = $timeout(
              function() {
                componentHandler.upgradeAllRegistered();
              },
            //Time to wait until upgrade.
            200
            );
          }
        };
      }
    ]);
}());
