(function() {
  'use strict';

  angular
    .module('app')
    /**
     * @namespace appConfig
     * @memberof app
     *
     * @requires $apiProvider
     * @requires $alertProvider
     * @requires $locationProvider
     * @requires $urlRouterProvider
     * @requires $translateProvider
     *
     * @description
     * General config statement.
     */
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
      apiBaseUrl: 'This should be an API URL. Needs to be defined.'
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
