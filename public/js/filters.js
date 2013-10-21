'use strict';

/* Filters */
angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
    filter('status2icon',function(){
        var st = {"online":"label-success","away":"label-warning","busy":"label-danger"};
        return function(input) {
            return st[input];
        };
    }).
    filter('filterUsers',function(){

        return function(items,username) {
            return items.filter(function(elem){
                return elem.username!=username;
            });
        };
    });

