(function() {
  'use strict';

  angular
    .module('app.layout')
    /**
     * @namespace layoutController
     * @memberof app.layout
     *
     * @requires $api
     * @requires $views
     * @requires login
     * @requires auth
     * @requires $state
     * @requires utilsFactory
     *
     * @description
     * Controller statement for Layout.
     */
    .controller('layoutController', [
      '$api',
      '$views',
      'login',
      'auth',
      '$state',
      'utilsFactory',
      function($api, $views, login, auth, $state, utilsFactory) {
        if (!auth) {
          return $state.go('login');
        }
        var vm = this;

        vm.initUserData = function() {
          vm.userData = login.getUserInfo();
          vm.profileMenu = vm.userData.profileMenus || {};

          //# Shared configuration block
          vm.viewConfig = $views.getViewDefinition();

          //# Version Info block
          $api.getBimsVersion(function(success) { vm.versionInfo = success.data; });
          vm.displayVersionInfo = false;
          vm.switchVersionInfo = function(newValue) {
            vm.displayVersionInfo = newValue;
          };

          //# Translations block
          vm.translations = vm.userData.translation;
          vm.menu = angular.copy(vm.userData.mainMenus);
          vm.sideMenu = angular.copy(vm.userData.mainMenus);
          vm.resetMenu = function() {
            vm.menu = angular.copy(vm.userData.mainMenus);
          };
        };

        /**
         * @name exportDBConfigs
         * @memberof app.layout.layoutController
         *
         * @description
         * Function that downloads all the configuration files for the actual partner
         */
        vm.exportDBConfigs = function() {
          var configurationsEntity = $api.createEntityObject({ entityName: 'configurations' });
          $api.getEntity(configurationsEntity, function(success) {
            var configs = success.data;
            angular.forEach(configs, function(value, key) {
              utilsFactory.exportJsonFile(value, key + '.json');
            });
          });
        };

        vm.initUserData();
      }
    ]);
})();
