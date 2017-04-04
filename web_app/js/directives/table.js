angular.module("app.directives.pretty-table", [])
.directive("prettyTable", [function() {
	return {
		restrict: 'E',
		templateUrl: "/templates/table.html"
	}
}]);
