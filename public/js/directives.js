'use strict';

/* Directives */
angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
    .directive('maketab',function() {
        return function(scope, elm, attrs) {
            console.log(elm)
            console.log(scope)
            console.log(attrs)

            $(elm).tab("show")
            $(elm).tab("show")
            /*elm.tab({
                show: function(event, ui) {
                    console.log(event)
                    scope.$broadcast("tabChanged",ui);
                }
            });*/
        };
    })
