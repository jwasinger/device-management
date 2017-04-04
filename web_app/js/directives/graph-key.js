angular.module('app.directives.piechart', ['d3'])
.directive('piechart', ['$q', '$window', 'd3Service', function($q, $window, d3Service) {
	return {
		restrict: 'E',
    template: "<svg class='graph-key'></svg>",
		scope: true,
		link: function(scope, element, attrs) {
			scope.$watch('data', function(oldVal, newVal) {
				alert(newVal)
			});
		}}
}])
