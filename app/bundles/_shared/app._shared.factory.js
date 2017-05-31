/*** TEMPORAL FACTORY. THIS MUST BE DELETED IN THE FUTURE ***/
(function() {
  'use strict';

  angular.module('app._shared')
    .factory('languageFactory', [
      'languageService',
      function(languageService) {
        var appLocale = languageService.default;

        return {
          getActualLocale: function() {
            return appLocale;
          },
          setActualLocale: function(locale) {
            appLocale = languageService.languages[locale];
            return appLocale;
          },
          getAvailableLanguages: function() {
            return languageService.languages;
          }
        };
      }
    ]).factory('utilsFactory',
      function() {
        // Auxiliary function used for reduction in getDotedKey
        function index(obj, i) {
          return obj[i];
        }
        return {
          /**
          * Non recursive function, allows dot notation traversing
          * ej: obj["a.b.c"] in obj["a"]["b"]["c"];
          * returns undefined instead of exception if no key in obj
          */
          getValueFromDotedKey: function(obj, dotedKey) {
            try {
              return dotedKey.split('.').reduce(index, obj);
            } catch (e) {
              if (e instanceof TypeError) {
                return undefined;
              } else {
                throw e;
              }
            }
          },
          /**
          * Non recursive function, set value with dot notation traversing
          * ej: object["a.b.c"] in object["a"]["b"]["c"];
          * returns the nested object storing the value
          */
          setValueFromDotedKey: function(object, dotedKey, value) {
            var dottedPath = dotedKey.split('.');
            var lastKey = dottedPath.pop();
            function _createIfUndefined(object, i) {
              if (!angular.isObject(object[i])) {
                object[i] = {};
              }
              return object[i];
            }

            var lastPath = dottedPath.reduce(_createIfUndefined, object);
            lastPath[lastKey] = value;
            return lastPath[lastKey];
          },
          getScrollerWidth: function() {
            var scr = document.createElement('div');
            var inn = document.createElement('div');
            var wNoScroll = 0;
            var wScroll = 0;

            // Outer scrolling div
            scr.style.position = 'absolute';
            scr.style.top = '-1000px';
            scr.style.left = '-1000px';
            scr.style.width = '100px';
            scr.style.height = '50px';
            // Start with no scrollbar
            scr.style.overflow = 'hidden';

            // Inner content div
            inn.style.width = '100%';
            inn.style.height = '200px';

            // Put the inner div in the scrolling div
            scr.appendChild(inn);
            // Append the scrolling div to the doc
            document.body.appendChild(scr);

            // Width of the inner div sans scrollbar
            wNoScroll = inn.offsetWidth;
            // Add the scrollbar
            scr.style.overflow = 'auto';
            // Width of the inner div width scrollbar
            wScroll = inn.offsetWidth;

            // Remove the scrolling div from the doc
            document.body.removeChild(document.body.lastChild);

            // Pixel width of the scroller
            return wNoScroll - wScroll;
          },
          //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
          uniqueId: function() {
            function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
              s4() + '-' + s4() + s4() + s4();
          },
          exportJsonFile: function(data, filename) {

            if (!data) {
              console.error('No data');
              return;
            }

            if (!filename) {
              filename = 'download.json';
            }

            if (typeof data === 'object') {
              data = JSON.stringify(data, undefined, 2);
            }

            var blob = new Blob([data], {
              type: 'text/json'
            });

            // FOR IE:
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
              var e = document.createEvent('MouseEvents');
              var a = document.createElement('a');

              a.download = filename;
              a.href = window.URL.createObjectURL(blob);
              a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
              e.initEvent('click', true, false, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
              a.dispatchEvent(e);
            }
          }
        };
      }
    );
})();
