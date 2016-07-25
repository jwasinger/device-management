angular.module('app.directives.piechart', ['d3'])
.directive('piechart', ['$q', '$window', 'd3Service', function($q, $window, d3Service) {
	return {
		restrict: 'E',
    template: "<svg style='width: 100%;' class='pie'></svg>",
    link: function(scope, element, attrs) {
			scope.element = angular.element(element).find("svg") 

      d3Service.d3().then(function(d3) {
        // Browser onresize event
        window.onresize = function() {
          scope.$apply();
        };

				var clientRect = scope.element[0].getBoundingClientRect();
				scope.ViewportDimensions = {
					Width: clientRect.right - clientRect.left,
					Height: clientRect.bottom - clientRect.top 
				}

				scope.Radius = Math.min(scope.ViewportDimensions.Width, scope.ViewportDimensions.Height) / 2;

				scope.color = d3.scale.ordinal()
						.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

				scope.arc = d3.svg.arc()
						.outerRadius(scope.Radius - 10)
						.innerRadius(0);

				scope.labelArc = d3.svg.arc()
						.outerRadius(scope.Radius - 40)
						.innerRadius(scope.Radius - 40);

				scope.pie = d3.layout.pie()
						.sort(null)
						.value(function(d) { return d.value; });

				var svg = d3.selectAll(scope.element).selectAll("svg")
					.append("g")
					.attr("transform", "translate(" + scope.ViewportDimensions.Width / 4 + "," + scope.ViewportDimensions.Height / 2 + ")");


				var data = genGarbageData();

				var g = svg.selectAll(".arc")
					.data(scope.pie(scope.data))
					.enter().append("g")
						.attr("class", "arc");

				g.append("path")
						.attr("d", scope.arc)
						.style("fill", function(d) { 
							return color(d.data.age); });

				g.append("text")
						.attr("transform", function(d) { return "translate(" + scope.labelArc.centroid(d) + ")"; })
						.attr("dy", ".35em")
						.text(function(d) { return d.data.age; });
			});
		}});
		}
	}
});
