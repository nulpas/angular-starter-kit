(function() {
  'use strict';

  angular.module('app.users.user-details')
  /**
   * @name app.sale-events.sale-event-details.saleEventDetails
   *
   * @description
   * This factory contains the main functionality of sale events details.
   *
   * @requires userDetailsData
   * @requires simpleList
   * @requires $alert
   * @requires $api
   */
    .factory('userDetails', [
      'userDetailsData',
      'simpleList',
      '$alert',
      '$api',
      function(userDetailsData, simpleList, $alert, $api) {

        var actualUser = null;

        /**
         * _addToUserRoles
         *
         * @description
         * Add the role to the user.
         *
         * @param {Object} role -> The role to be added to the user.
         * @private
         */
        var _addToUserRoles = function(role) {
          var userRolesData = simpleList.service('userRolesStorage').get();
          var roleIds = [];
          var alreadyInUserRoles = userRolesData.some(function(e) { return e.name === role.name; });

          if (!alreadyInUserRoles) {
            angular.forEach(actualUser.roles, function(r) {
              roleIds.push({ 'name': r.name });
            });
            roleIds.push({ 'name': role.name });
            var userEntityObject = $api.createEntityObject({
              entityName: 'users',
              entityId: actualUser.id,
              objectSent: {
                roles: roleIds
              }
            });
            $api.update(userEntityObject, function() {
              userRolesData.push(role);
              $alert.success(userDetailsData.SUCCESS_MESSAGE_ADD_TO_USER);
            });
          } else {
            $alert.warning(userDetailsData.WARNING_ROLE_ALREADY_EXISTS);
          }
        };

        /**
         * _removeFromUserRoles
         *
         * @description
         * Removes the role from the user.
         *
         * @param {Object} role -> The role to be removed from the user.
         * @private
         */
        var _removeFromUserRoles = function(role) {
          var userRolesData = simpleList.service('userRolesStorage').get();
          var tempRoles = angular.copy(userRolesData);
          tempRoles.splice(userRolesData.indexOf(role), 1);
          var roleIds = [];
          angular.forEach(tempRoles, function(r) {
            roleIds.push({ 'name': r.name });
          });
          var userEntityObject = $api.createEntityObject({
            entityName: 'users',
            entityId: actualUser.id,
            objectSent: {
              roles: roleIds
            }
          });
          $api.update(userEntityObject, function() {
            userRolesData.splice(userRolesData.indexOf(role), 1);
            $alert.success(userDetailsData.SUCCESS_MESSAGE_REMOVE_FROM_USER);
          });
        };

        return {
          /**
           * @name app.users.user-details.userDetails#addToUserRoles
           *
           * @description
           * See documentation of '_addToUserRoles' function.
           */
          addToUserRoles: _addToUserRoles,

          /**
           * @name app.users.user-details.userDetails#removeFromUserRoles
           *
           * @description
           * See documentation of '_removeFromUserRoles' function.
           */
          removeFromUserRoles: _removeFromUserRoles,

          /**
           * @name app.users.user-details.userDetails#actualUser
           *
           * @description
           * Getter/Setter for actual user.
           *
           * @param {Object} user -> The actual user to store.
           * @returns {Object} User -> If no param provided in function call, returns the actual user.
           */
          actualUser: function(user) {
            var condition = angular.isDefined(user);
            return condition ? (actualUser = user) : actualUser;
          }
        };
      }
    ]);
})();
