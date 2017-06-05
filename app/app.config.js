(function() {
  'use strict';

  angular
    .module('app')
    .config(appConfig);

  appConfig.$inject = [
    '$apiProvider',
    '$alertProvider',
    '$locationProvider',
    '$urlRouterProvider',
    '$translateProvider'
  ];

  function appConfig($apiProvider, $alertProvider, $locationProvider, $urlRouterProvider, $translateProvider) {
    /* Api Connector Config: */
    $apiProvider.setApiConfig({
      localJson: 'json',
      apiBaseUrl: 'https://bims-dev.northeurope.cloudapp.azure.com/api'
    });

    /* Toast Alert Config: */
    $alertProvider.setDuration(5000);

    /* Router Config: */
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/dashboard');

    /* Translate Config: */
    $translateProvider.setLocalTranslationSource('translation');
    $translateProvider.setApiTranslationSource('labels');
    $translateProvider.setApiTranslationSections(['general', 'menus']);
    $translateProvider.setPreferredLanguage('en');
  }
})();
