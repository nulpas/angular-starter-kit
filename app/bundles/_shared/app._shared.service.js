(function() {
  'use strict';

  angular.module('app._shared')
    .service('languageService', [
      function() {
        this.languages = {
          en: {
            locale: 'en',
            name: 'English',
            sourceName: 'English'
          },
          es: {
            locale: 'es',
            name: 'Spanish',
            sourceName: 'Español'
          },
          fr: {
            locale: 'fr',
            name: 'French',
            sourceName: 'Français'
          },
          de: {
            locale: 'de',
            name: 'German',
            sourceName: 'Deutsch'
          },
          pt: {
            locale: 'pt',
            name: 'Portuguese',
            sourceName: 'Português'
          }
        };

        this.default = this.languages.en;
      }
    ])

    .service('configFieldsViewService', [
      '$q',
      function($q) {
      return {
        getFieldsList: function(configObjectFN, swaggerFN) {
          var deferral = $q.defer();
          swaggerFN.then(function() {
            configObjectFN.then(function(resultConfig) {
              //# TODO: we must calculate the object Fields list result between swagger and configObject,
              //# TODO: and return this in a promise
              deferral.resolve(resultConfig);
            });
          });
          return deferral.promise;
        }
      };
    }]);
})();
