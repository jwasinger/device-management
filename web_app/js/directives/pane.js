var module = angular.module('app.directives', []);

module.directive('pane', [function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/templates/pane.html',
    scope: {
      title: "@"
    },
    controller: ["$scope", function($scope) {
      $scope.data = {
        foo: "bar"
      }
    }]
  }
}]);
