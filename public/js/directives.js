'use strict';

/* Directives */
angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
    .directive('maketab',function() {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                scope.$watch('chats', function(newValue,oldValue) {
                    var id = newValue[0].socket;
                    $('#myPill a[href="#'+id+'"]').tab('show');
                }); // initialize the watch
            }
        }
    })
