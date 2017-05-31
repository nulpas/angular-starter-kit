(function() {
  'use strict';

  /**
   * @name app.packages.package-details.saleEventDetails
   *
   * @description
   * This factory contains the main functionality of sale events details.
   *
   * @requires $alert
   * @requires $api
   * @requires $state
   * @requires $tools
   * @requires simpleList
   * @requires saleEventDetailsData
   * @requires $bpm
   */
  angular.module('app.packages.package-details')
    .factory('packageDetails', [
      '$alert',
      '$filter',
      '$api',
      '$http',
      '$state',
      '$tools',
      'simpleList',
      'localStorageService',
      function($alert, $filter, $api, $http, $state, $tools, simpleList, localStorageService) {
        var actualPackageData = {};

        function _showSellPackageDialog(packageData) {
          actualPackageData = packageData;
          var dialog = document.querySelector('#sell-package-confirmation-dialog');
          if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
          }
          dialog.showModal();
        }

        function _showCancelPackageDialog(packageData) {
          actualPackageData = packageData;
          var dialog = document.querySelector('#cancel-package-confirmation-dialog');
          if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
          }
          dialog.showModal();
        }

        function _sellPackage() {
          // This is because of non standard api call
          var packageData = actualPackageData;
          var _apiURL = $api.getApiConfig().apiBaseUrl;
          var _apiPackageURL = _apiURL + '/packages/' + packageData.id + '/sales/sell';
          var req = {
            method: 'POST',
            url: _apiPackageURL,
            headers: {
              'Authorization': localStorageService.get('apiToken')
            },
            data: {}
          };
          // TODO: Make it fail, set error callback
          $http(req).then(function() {
            $alert.success('Package Sold');
            $state.reload();
          }, function() {
            $alert.error('An error occured, buyer is required for selling the package');
          });
        }

        function _cancelPackage() {
          // This is because of non standard api call
          var packageData = actualPackageData;
          var _apiURL = $api.getApiConfig().apiBaseUrl;
          var _apiPackageURL = _apiURL + '/packages/' + packageData.id + '/sales/cancel';
          var packageVehicles = simpleList.service('packageVehiclesPackageDetailsView').get();
          var req = {
            method: 'POST',
            url: _apiPackageURL,
            headers: {
              'Authorization': localStorageService.get('apiToken')
            },
            data: {}
          };

          // TODO: Make it fail, set error callback
          $http(req).then(function() {
            $alert.success('Package Cancelled');
            $state.reload();
            packageVehicles.splice(0);
          }, function() {
            $alert.error('An error occurred');
          });
        }
        var _cf = {};
        var _pd = {};
        return {
          calculatedFields: _cf,
          packageData: _pd,
          calculateVehiclePrices: function() {
            if (_cf) {
              // TODO : GETTER/SETTER FOR THESE PRIVATES
              _pd = this.packageData;
              var _sumVehicle = 0;
              var percentage = (_pd.discountPct ? _pd.discountPct : 0);
              angular.forEach(_pd.vehicles, function(vehicle) {
                _sumVehicle += vehicle.pricing.price;
                vehicle.pricing.diffPrice = vehicle.pricing.price * (percentage) / 100;
                vehicle.pricing.packagePrice = vehicle.pricing.price - vehicle.pricing.diffPrice;
              });
              _cf.totalPrice = _sumVehicle;
              _cf.totalDiffPrice = (_sumVehicle * (percentage) / 100).toFixed(2);
              _cf.packagePrice = (_sumVehicle - _cf.totalDiffPrice).toFixed(2);
            }
          },
          sellPackage: _showSellPackageDialog,
          cancelPackage: _showCancelPackageDialog,
          executeSellPackageAction: _sellPackage,
          executeCancelPackageAction: _cancelPackage,
          showSellButton: function(packageData) {
            return (packageData.packageStatus === 'Open');
          },
          showCancelButton: function(packageData) {
            return (packageData.packageStatus === 'Open');
          },
          fieldDisplayCreation: function(packageData) {
            return angular.isDefined(packageData.id);
          }
        };
      }
    ]);
})();
