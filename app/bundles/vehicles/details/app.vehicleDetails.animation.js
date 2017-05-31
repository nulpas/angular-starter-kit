(function() {
  'use strict';

  angular.module('app.vehicles.vehicleDetails')
    .animation('.slide', function() {
      return {
        addClass: function(element, className, done) {
          if (className === 'ng-hide') {
            $(element).slideUp(250, function() {
              done();
            });
          }
        },
        removeClass: function(element, className, done) {
          if (className === 'ng-hide') {
            $(element).slideDown(250, function() {
              done();
            });
          }
        }
      };
    });
}());
