(function() {
  'use strict';

  angular.module('app._shared.views.details')
    .directive('detailsView', [
      function() {
        return {
          restrict: 'A',
          templateUrl: 'bundles/_shared/views/details/app.details.view.tpl.html',
          controller: 'detailsController',
          controllerAs: 'details',
          bindToController: {

            //We are using services in details, two-way binding '=' is never needed
            data: '<detailsView',
            previous: '<previous',
            next: '<next',
            detailsStructure: '<config',
            configName: '<configName',
            isEditable: '<',
            entity: '<',

            //Optional Crud methods
            //This should be the standard way of accessing entities
            // you can then use angular.isFunction(read) to know if a reading
            // function is provided
            create: '&?',
            read: '&?',
            update: '&?',
            delete: '&?',

            //Optional orderby function for local data
            localOrderBy: '&?'
          },
          scope: {
            contract: '<'
          }
        };
      }
    ]);
})();
