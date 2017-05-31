(function() {
  'use strict';

  angular.module('app.log.logDetails')
  /**
   * @namespace .slide
   * @memberof app.log.logDetails
   *
   * @description
   * Animation for the cards on show/hide event
   */
    .animation('.slide', function() {
      return {
        /**
         * @name app.log.logDetails.slide#addClass
         * @memberof app.log.logDetails.slide
         *
         * @param {object} element currently hiding element
         * @param {string} className CSS class that is going to be checked
         * @param {object} done function to be executed to finish the animation
         *
         * @description
         * Adds a slideUp animation to the currently hiding element
         */
        addClass: function(element, className, done) {
          if (className === 'ng-hide') {
            $(element).slideUp(250, function() {
              done();
            });
          }
        },
        /**
         * @name app.log.logDetails.slide#removeClass
         * @memberof app.log.logDetails.slide
         *
         * @param {object} element currently showing element
         * @param {string} className CSS class that is going to be checked
         * @param {object} done function to be executed to finish the animation
         *
         * @description
         * Adds a slideUp animation to the currently hiding element
         */
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
