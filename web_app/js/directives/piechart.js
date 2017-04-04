angular.module('app.directives.piechart', ['d3'])
.directive('piechart', ['$q', '$window', 'd3Service', function($q, $window, d3Service) {
	return {
		restrict: 'E',
    templateUrl: "/templates/piechart.html",
    link: function(scope, element, attrs) {
			scope.render = function() {
				scope.element = $(element).find("svg.pie") 
				d3Service.d3().then(function(d3) {
					var clientRect = scope.element[0].getBoundingClientRect();
					scope.ViewportDimensions = {
						Width: clientRect.right - clientRect.left,
						Height: clientRect.bottom - clientRect.top 
					}

					scope.Radius = Math.min(scope.ViewportDimensions.Width, scope.ViewportDimensions.Height) / 3;

					scope.color = d3.scale.ordinal()
							.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

					scope.arc = d3.svg.arc()
							.outerRadius(scope.Radius - 10)
							.innerRadius(scope.Radius - 28)
							.padAngle(0.07);

					scope.labelArc = d3.svg.arc()
							.outerRadius(scope.Radius - 40)
							.innerRadius(scope.Radius - 40);

					scope.pie = d3.layout.pie()
							.sort(null)
							.value(function(d) { return d.value; });

					var svg = d3.selectAll(scope.element)
						.append("g")
						.attr("transform", "translate(" + scope.ViewportDimensions.Width / 2 + "," + scope.ViewportDimensions.Height / 2 + ")");


					//var data = genGarbageData();

					var g = svg.selectAll(".arc")
						.data(scope.pie(scope.data))
						.enter().append("g")
							.attr("class", "arc");

					g.append("path")
						.attr("d", scope.arc)
						.style("fill", function(d) { 
							return d.data.color; 
						});


					var pie = d3.selectAll(scope.element)
					pie.selectAll('g').attr('opacity', '0');
					pie.selectAll('g').attr('fill', 'none');

					pie.selectAll('g').transition()
						.duration(300)
						.ease('quad')
							.attr('opacity', '1')
							.each('end', function() {
							});

					g.append("text")
							.attr("transform", function(d) { return "translate(" + scope.labelArc.centroid(d) + ")"; })
							.attr("dy", ".35em")
							.text(function(d) { return d.data.age; });
						});
					}

				// Browser onresize event
				window.onresize = function() {
					scope.$apply();
				};

				scope.$watch("data", function(newVal, oldVal) {
					scope.render()
				});
		},
		controller: ['$scope', function($scope) {
			$scope.$watch("data", function(newVal, oldVal) {
				var i = 0;
			});
		}]
	}
}]);
