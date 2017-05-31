(function() {
  'use strict';

  /**
   * @name app.users.user-details.userDetailsData
   *
   * @description
   * A service containing messages related to user details.
   */
  angular.module('app.users.user-details')
    .service('userDetailsData', [
      'login',
      function(login) {
        var translations = login.getUserInfo().translation;
        this.SUCCESS_MESSAGE_ADD_TO_USER = translations.SUCCESS_MESSAGE_ADD_TO_USER;
        this.WARNING_ROLE_ALREADY_EXISTS = translations.WARNING_ROLE_ALREADY_EXISTS;
        this.SUCCESS_MESSAGE_REMOVE_FROM_USER = translations.SUCCESS_MESSAGE_REMOVE_FROM_USER;
      }
    ]);
})();
