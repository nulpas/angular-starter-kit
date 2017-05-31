(function() {
  'use strict';

  angular
    .module('app.login')
    /**
     * @namespace login
     * @memberof app.login
     *
     * @requires $q
     * @requires $state
     * @requires localStorageService
     * @requires $api
     * @requires $alert
     * @requires $tools
     * @requires $bpm
     * @requires $translate
     *
     * @description
     * Factory statement for login tasks.
     */
    .factory('login', login);

  login.$inject = ['$q', '$state', 'localStorageService', '$api', '$tools', '$bpm', '$translate'];

  function login($q, $state, localStorageService, $api, $tools, $bpm, $translate) {
    /**
     * @type {Object}
     * @property {Boolean} isSuperAdmin --> Flag to know if user is super administrator.
     * @property {Object} mainMenus --> Top menu.
     * @property {Object} partner --> Associated partner.
     * @property {Object} profileMenus
     * @property {String} userName
     */
    var _userInfo = null;
    var _isConfigured = null;

    return {
      isAuthorized: isAuthorized,
      loadSession: loadSession,
      logout: logout,
      login: login,
      changeBrand: changeBrand,
      getUserInfo: getUserInfo
    };

    /**
     * @name _authorizedLogin
     * @memberof app.login.login
     *
     * @description
     * An authorized user has login and login creates localStorage(apiToken) and localStorage(userInfo) vars.
     *
     * @returns {Boolean}
     * @private
     */
    function _authorizedLogin() {
      var apiTokenIsSet = localStorageService.get('apiToken');
      var userDataIsSet = localStorageService.get('userInfo');
      return (apiTokenIsSet && userDataIsSet);
    }

    /**
     * @name _setApiToken
     * @memberof app.login.login
     *
     * @description
     * Auxiliary function used to set up and store the API token.
     *
     * @param {String} apiToken
     * @returns {String}
     * @private
     */
    function _setApiToken(apiToken) {
      localStorageService.set('apiToken', apiToken);
      $api.setApiConfig({ apiToken: apiToken });
      console.info('API token stored');
      return apiToken;
    }

    /**
     * @name _loadSession
     * @memberof app.login.login
     *
     * @description
     * Loads all needed variables for factory functions.
     *
     * @returns {Boolean}
     * @private
     */
    function _loadSession() {
      if (!_isConfigured) {
        _setApiToken(localStorageService.get('apiToken'));
        _userInfo = localStorageService.get('userInfo');
        $api.setApiConfig({ isSuperAdmin: _userInfo.isSuperAdmin });
        _userInfo.translationModules = $q.all($translate.initTranslationModule()).finally(function() {
          _userInfo.translation = $translate.getTranslations();
        });

        if (!_userInfo.isSuperAdmin) {
          $bpm.set(_userInfo.partner.processes);
        }
        _isConfigured = true;

        /* TODO: REMOVE this asap. */
        /* Add local menu option to logout */
        var logoutApp = {
          logout: {
            isLocal: true,
            label: 'menu.logout',
            state: 'login'
          }
        };
        _userInfo.profileMenus = (_userInfo.profileMenus) ? _userInfo.profileMenus : {} ;
        _userInfo.profileMenus = angular.extend({}, _userInfo.profileMenus, logoutApp);
      }
      return _isConfigured;
    }

    /**
     * @name isAuthorized
     * @memberof app.login.login
     *
     * @description
     * Public method for "_authorizedLogin".
     *
     * @returns {Boolean}
     */
    function isAuthorized() {
      return _authorizedLogin();
    }

    /**
     * @name loadSession
     * @memberof app.login.login
     *
     * @description
     * Public method for "_loadSession".
     *
     * @returns {Boolean}
     */
    function loadSession() {
      return _loadSession();
    }

    /**
     * @name logout
     * @memberof app.login.login
     *
     * @description
     * Makes all tasks to logout the application.
     *
     * @returns {Boolean}
     */
    function logout() {
      $api.setApiConfig({
        apiToken: null,
        isSuperAdmin: null
      });
      localStorageService.clearAll();
      _isConfigured = null;
      _userInfo = null;
      return _isConfigured;
    }

    /**
     * @name login
     * @memberof app.login.login
     *
     * @description
     * Tries to login into the application.
     *
     * @param {Object} authData
     */
    function login(authData) {
      var authEntity = $api.createEntityObject({
        entityName: 'auths',
        headers: {
          'X-ClientSession': $tools.getRandomString(16),
          'X-Client': authData.username,
          'Authorization': 'Basic ' + $tools.base64Encode(authData.username + ':' + authData.password)
        }
      });
      if (authData.expiration) {
        authEntity.headers = angular.extend({}, authEntity.headers, { 'X-Expire': 0 });
      }
      var authLogin = $api.auth(authEntity, function(success) {
        /**
         * @type {Object}
         * @property {String} jti --> Jason Web Token ID.
         * @property {Object} userInfo --> User data.
         */
        var auth = success.data;
        localStorageService.set('apiToken', auth.jti);
        localStorageService.set('userInfo', auth.userInfo);
      });
      authLogin.then(function() {
        _loadSession();
        $state.go('app.home');
      });
    }

    /**
     * @name changeBrand
     * @memberof app.login.login
     *
     * @description
     * Tries to login into the application as another brand.
     *
     * @param {String} newBrand
     * @param {Object} callback
     *
     */
    function changeBrand(newBrand, callback) {
      _isConfigured = null;
      var authEntity = $api.createEntityObject({
        entityName: 'partners/auths',
        headers: {
          'X-ClientSession': $tools.getRandomString(16),
          'X-ClientPartner': newBrand,
          'Authorization': localStorageService.get('apiToken')
        }
      });
      var authLogin = $api.auth(authEntity, function(success) {
        /**
         * @type {Object}
         * @property {String} jti --> Jason Web Token ID.
         * @property {Object} userInfo --> User data.
         */
        var auth = success.data;
        localStorageService.set('apiToken', auth.jti);
        localStorageService.set('userInfo', auth.userInfo);
      });
      $q.all([authLogin]).then(function() {
        _loadSession();
        $state.go('app.home');
        if ($state.current.name === 'app.home') {
          $state.reload();
        }
        callback();
      });
    }

    /**
     * @name getUserInfo
     * @memberof app.login.login
     *
     * @description
     * Returns stored user data.
     *
     * @returns {Object}
     */
    function getUserInfo() {
      return _userInfo;
    }
  }
})();
