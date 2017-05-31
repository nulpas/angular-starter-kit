(function() {
  'use strict';

  //This Module automaticly handles the mdl js dependant upgrades
  var upgradeMdl = ['upgradeMdlService', function(upgradeMdlService) {
    return {
      restrict: 'C',
      link:  function() {
        upgradeMdlService.upgradeAll();
      }
    };
  }];
  angular.module('app._shared.upgrade-mdl')
    .directive('mdlJsLayout', upgradeMdl)
    .directive('mdlJsMenu', upgradeMdl)
    .directive('mdlJsCheckbox', upgradeMdl)
    .directive('mdlJsButton', upgradeMdl)
    .directive('mdlJsTextfield', upgradeMdl)
    .directive('mdlNavigation', upgradeMdl)
    .directive('mdlTooltip',  upgradeMdl)
    .directive('mdlJsSpinner',  upgradeMdl);
}());
