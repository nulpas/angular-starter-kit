(function() {
  'use strict';

  angular
    .module('app.settings')
    /**
     * @namespace settingsRouter
     * @memberof app.settings
     *
     * @requires $stateProvider
     *
     * @description
     * Router configuration for 'app.settings' module.
     */
    .config(settingsRouter);

  settingsRouter.$inject = ['$stateProvider'];

  function settingsRouter($stateProvider) {
    var settingsState = {
      url: '/:param1-module',
      abstract: true,
      resolve: {
        viewConfig: _viewConfigOptionsResolve
      }
    };

    var optionsState = {
      url: '/:param2',
      params: {
        index: undefined
      },
      views: {
        'content@app': {
          templateProvider: _templateProviderOptionResolve,
          controllerProvider: _controllerProviderOptionResolve
        }
      },
      resolve: {
        viewConfig: _viewConfigOptionsResolve
      }
    };

    var subOptionsState = {
      url: '/:param3',
      views: {
        'content@app': {
          templateProvider: _templateProviderSubOptionResolve,
          controllerProvider: _controllerProviderSubOptionResolve
        }
      }
    };

    var detailsState = {
      url: '/:id',
      views: {
        'content@app': {
          templateUrl: _templateUrlDetailsResolve,
          controllerProvider: _controllerProviderDetailsResolve
        }
      }
    };

    $stateProvider
      .state('app.settings', settingsState)
      .state('app.settings.options', optionsState)
      .state('app.settings.options.subOptions', subOptionsState)
      .state('app.settings.options.subOptions.details', detailsState);

    _templateProviderOptionResolve.$inject = ['$stateParams', '$tools', '$templateFactory'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $stateParams
     * @requires $tools
     * @requires $templateFactory
     *
     * @description
     * Template provider for 'app.settings.options' state.
     */
    function _templateProviderOptionResolve($stateParams, $tools, $templateFactory) {
      return $templateFactory.fromUrl('bundles/' +
        $tools.camelCaseTo($stateParams.param1, '-') + '/' +
        $tools.camelCaseTo($stateParams.param2, '-') + '/app.' +
        $tools.camelCaseTo($stateParams.param2, '-') + '.view.tpl.html');
    }

    _controllerProviderOptionResolve.$inject = ['$stateParams'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $stateParams
     *
     * @description
     * Controller provider for 'app.settings.options' state.
     */
    function _controllerProviderOptionResolve($stateParams) {
      return $stateParams.param2 + 'Controller as ' + $stateParams.param2;
    }

    _templateProviderSubOptionResolve.$inject = ['$stateParams', '$tools', '$templateFactory'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $stateParams
     * @requires $tools
     * @requires $templateFactory
     *
     * @description
     * Template provider for 'app.settings.options.subOptions' state.
     */
    function _templateProviderSubOptionResolve($stateParams, $tools, $templateFactory) {
      return $templateFactory.fromUrl('bundles/' +
        $tools.camelCaseTo($stateParams.param1, '-') + '/' +
        $tools.camelCaseTo($stateParams.param2, '-') + '/' +
        $tools.camelCaseTo($stateParams.param3, '-') + '/app.' +
        $tools.camelCaseTo($stateParams.param3, '-') + '.view.tpl.html');
    }

    _controllerProviderSubOptionResolve.$inject = ['$stateParams'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $stateParams
     *
     * @description
     * Controller provider for 'app.settings.options.subOptions' state.
     */
    function _controllerProviderSubOptionResolve($stateParams) {
      return $stateParams.param3 + 'Controller as ' + $stateParams.param3;
    }

    _templateUrlDetailsResolve.$inject = ['$stateParams'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $stateParams
     *
     * @description
     * Template URL provider for 'app.settings.options.subOptions.details' state.
     */
    function _templateUrlDetailsResolve($stateParams) {
      return 'bundles/' +
        $stateParams.param1 + '/' +
        $stateParams.param2 + '/' +
        $stateParams.param3 + '/app.' +
        $stateParams.param3 + '.view.tpl.html';
    }

    _controllerProviderDetailsResolve.$inject = ['$stateParams'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $stateParams
     *
     * @description
     * Controller provider for 'app.settings.options.subOptions.details' state.
     */
    function _controllerProviderDetailsResolve($stateParams) {
      return $stateParams.param3 + 'Controller as ' + $stateParams.param3;
    }

    _viewConfigSettingsResolve.$inject = ['$tools', '$views'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $tools
     * @requires $views
     *
     * @description
     * ViewConfig resolve for 'app.settings' state.
     */
    function _viewConfigSettingsResolve($tools, $views) {
      var maxScreenWidthForListType = 960;
      var viewValue = (screen.width >= maxScreenWidthForListType) ? $tools.$.LIST_VIEW : $tools.$.GRID_VIEW ;
      return $views.setBoundProperty('type', viewValue);
    }

    _viewConfigOptionsResolve.$inject = ['$tools', '$views'];

    /**
     * @namespace settingsRouter
     * @memberof app.settings.settingsRouter
     *
     * @requires $tools
     * @requires $views
     *
     * @description
     * ViewConfig resolve for 'app.settings.options' state.
     */
    function _viewConfigOptionsResolve($tools, $views) {
      return $views.setBoundProperty('type', $tools.$.DETAILS_VIEW);
    }
  }
})();
