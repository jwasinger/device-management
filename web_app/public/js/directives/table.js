angular.module("app.directives.pretty-table", [])
.directive("prettyTable", [function() {
	return {
		restrict: 'E',
		templateUrl: "/public/templates/table.html"
	}
}]);
