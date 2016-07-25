angular.module('app.directives.barchart', ['d3'])
.directive('barchart', ['$q', '$window', 'd3Service', function($q, $window, d3Service) {
  return {
    restrict: 'E',
    //require: ['d3Service'],
    template: "<svg style='width: 100%;' class='graph'></svg>",
    transclude: true,
    scope: {},
    link: function(scope, element, attrs) {
			scope.element = angular.element(element).find("svg") 

      d3Service.d3().then(function(d3) {
        // Browser onresize event
        window.onresize = function() {
          scope.$apply();
        };

        scope.data = [
          {name: "Greg", score: 98},
          {name: "Ari", score: 96},
          {name: 'Q', score: 75},
          {name: "Loser", score: 48}
        ];


				
				scope.ViewData = [];

				scope.Margins = {
					Left: 40,
					Right: 40,
					Bottom: 40,
					Top: 40
				}


				var clientRect = scope.element[0].getBoundingClientRect();
				scope.ViewportDimensions = {
					Width: clientRect.right - clientRect.left,
					Height: clientRect.bottom - clientRect.top 
				}

				scope.DisplayAreaDimensions = {
					Width: scope.ViewportDimensions.Width - (scope.Margins.Left + scope.Margins.Right),
					Height: scope.ViewportDimensions.Height - (scope.Margins.Top + scope.Margins.Bottom)
				}

				scope.GraphColors = {
					Critical: 'red',
					Unknown: 'blue',
					Info: 'green'
				};


				scope.animationTimeMS = 500;
				scope.BarSpacing = 0.1;

				scope.objGenKV = function(obj) {
					var result = new Array();
					for(var k in obj) {
						result.push({
							key: k,
							value: obj[k]
						});
					}

					return result;
				}

				scope.calcGraphWidth = function() {
					//TimeSlotWidth = (ViewportDimensions.Width - (10 + 1)*BarSpacing) / 10;
					scope.TimeSlotWidth = 60;
					scope.GraphTotalWidth = scope.TimeSlotWidth*(scope.ViewData.length) + scope.BarSpacing*(scope.ViewData.length -1);
				}


				scope.genRandAlerts = function() {
					return {
						Critical: Math.random() * scope.DisplayAreaDimensions.Height,
						Unknown: Math.random() * scope.DisplayAreaDimensions.Height,
						Info: Math.random() * scope.DisplayAreaDimensions.Height
					}
				}

				//generate random data for three months (12 weeks)
				scope.genRandData = function(numMonths) {
					var result = {
						Months: new Array(numMonths)
					};

					for(var i = 0; i < numMonths; i++) {
						result.Months[i] = {
							Weeks: new Array(numMonths),
							Alerts: scope.genRandAlerts()
						};
						
						for(var j = 0; j < 4; j++) {
							result.Months[i].Weeks[j] = {
								Days: new Array(7),
								Alerts: scope.genRandAlerts()
							};

							for(var k = 0; k < 7; k++) {
								result.Months[i].Weeks[j].Days[k] = {
									Alerts: scope.genRandAlerts()
								};
							}
						}
					}
					return result;
				}

				scope.setViewDays = function(data) {
					var result = new Array();
					var dayNum = 0;

					for(var i = 0; i < data.Months.length; i++) {
						for(var j = 0; j < data.Months[i].Weeks.length; j++) {
							for(var k = 0; k < data.Months[i].Weeks[j].Days.length; k++) {
								result.push({
									key: 'Day'+dayNum,
									value: scope.objGenKV(data.Months[i].Weeks[j].Days[k].Alerts)
								});
								dayNum++;
							}
						}
					}

					curView = 'day';
					scope.ViewData = result;
					scope.calcGraphWidth();
				}

				//reformat y axis to match the new domainof values in ViewData
				scope.transitionXAxisClear = function() {
					var deferred = $q.defer();
					d3.select('g.x-axis')
						.transition()
						.duration(scope.animationTimeMS)
							.attr('opacity', '0')
							.each('end', function() {
								d3.selectAll('g.x-axis').remove();
								deferred.resolve();
							});
					return deferred.promise;
				}

				scope.transitionXAxisVisible = function() {
					var deferred = $q.defer();
					d3.selectAll(scope.element).append('g')
						.attr('class', 'x-axis')
						.attr('transform', 'translate('+ scope.Margins.Left +', ' + (scope.DisplayAreaDimensions.Height + scope.Margins.Top) + ')');

					d3.selectAll(scope.element).selectAll('.x-axis').call(scope.xAxis);
					d3.selectAll('.x-axis').attr('opacity', '0');
					d3.selectAll('.x-axis path').attr('fill', 'none');

					d3.selectAll('.x-axis').transition()
						.duration(scope.animationTimeMS)
						.ease('quad')
							.attr('opacity', '1')
							.each('end', function() {
								deferred.resolve();
							});
					return deferred.promise;
				}

				scope.calcYMax = function() {
					//calculate max value from ViewData
					var max = 0.0;

					for(var i = 0; i < scope.ViewData.length; i++) {
						for(var j = 0; j < scope.ViewData[i].value.length; j++) {
							var val = scope.ViewData[i].value[j].value;
							if( val > max) {
								max = val;
							}
						}
					}

					return val;
				}

				//reformat y axis to match the new range of values in ViewData
				scope.transitionYAxisRescale = function() {
					var deferred = $q.defer();

					deferred.resolve();
					
					var newRangeMax = scope.calcYMax();

					yScale = d3.scale.linear()
						.domain([0, newRangeMax])
						.range([scope.DisplayAreaDimensions.Height, 0]);

					yAxis = d3.svg.axis()
						.scale(yScale)
						.orient('left')


					d3.selectAll('g.y-axis').transition()
						.duration(scope.animationTimeMS)
						.call(yAxis)
						.each('end', function() {
							deferred.resolve();
						});

						d3.selectAll('g.y-axis path').attr('fill', 'none')
						.attr('stroke', 'black')
						.attr('stroke-width', '2px');

					return deferred.promise;
				}


				scope.transitionData = function() {
					var deferred = $q.defer();
					
					scope.xScale = d3.scale.ordinal()
						.domain(scope.ViewData.map(function(val) {
							return val.key;
						}))
						.rangeRoundBands([0, scope.GraphTotalWidth], scope.BarSpacing);

					scope.xScaleAlerts = d3.scale.ordinal()
						.domain(['Critical', 'Unknown', 'Info'])
						.rangeRoundBands([0, scope.xScale.rangeBand()]);

					scope.yScale = d3.scale.linear()
						.domain([0, scope.DisplayAreaDimensions.Height])
						.range([scope.DisplayAreaDimensions.Height, 0]);

					scope.xAxis = d3.svg.axis()
						.scale(scope.xScale)
						.orient('bottom');

					scope.yAxis = d3.svg.axis()
						.scale(scope.yScale)
						.orient('left');

					d3.selectAll(scope.element).append('g')
						.attr('class', 'y-axis')
						.attr('transform', 'translate(' + scope.Margins.Left + ' , ' + scope.Margins.Top +')')
						.call(scope.yAxis);

					d3.select('path').attr('fill', 'none');
					d3.select('.y-axis path').attr('stroke', 'black');
					d3.select('.y-axis path').attr('stroke-width', '2px');

					//d3.selectAll(scope.element).selectAll('g.y-axis').call(scope.yAxis);

					var times = d3.selectAll(scope.element).selectAll('g.graph-area').selectAll('g')
						.data(scope.ViewData)
						.enter()
						.append('g')
							.attr('class', 'time-slot')
							.attr('transform', function(d) {
								return 'translate(' + scope.xScale(d.key) + ', 0)';
							});

					//append alert tallies to the graph
					times.selectAll('rect')
						.data(function(d) {
							return d.value; //alert tallies as data
						})
						.enter()
						.append('rect')
							.attr('class', 'alert-bar')
							.attr('x', function(d) {
								return scope.xScaleAlerts(d.key);
							})
							.attr('y', function(d) {
								return scope.DisplayAreaDimensions.Height;
							})
							.attr('width', function(d) {
								return scope.xScaleAlerts.rangeBand();
							})
							.attr('height', function(d) {
								return 0; //bars not visible until transition
							})
							.attr('fill', function(d) {
								return scope.GraphColors[d.key];
							});


					//visual transition
					var rects = times.selectAll('rect');
					rects.transition()
						.duration(scope.animationTimeMS)
						.ease('quad')
							.attr('y', function(d) {
								return scope.DisplayAreaDimensions.Height - scope.yScale(d.value);
							})
							.attr('height', function(d) {
								return scope.yScale(d.value) + 'px';
							}).each('end', function() {
								deferred.resolve();
							});

					return deferred.promise;
				}

        scope.render = function(data) {
					var svg = d3.selectAll(scope.element);
					svg.selectAll('*').remove()

					svg.attr('width', scope.ViewportDimensions.Width)
						.attr('height', scope.ViewportDimensions.Height);

					svg.append('g')
						.attr('class', 'graph-area')
						.attr('transform', 'translate(' + scope.Margins.Left + ', ' + scope.Margins.Top + ')');
					scope.setViewDays(scope.genRandData(3));
          return $q.all([ scope.transitionData(), scope.transitionYAxisRescale(), scope.transitionXAxisVisible()]);

				  /*
				  // remove all previous items before render
          svg.selectAll('*').remove();
       
          // If we don't pass any data, return out of the element
          if (!data) return;

          var margin = 5;
          var barHeight = 150;
          var barPadding = 5;
       
          // setup variables
          var width = d3.select(element[0]).node().offsetWidth - margin,
              // calculate the height
              height = scope.data.length * (barHeight + barPadding),
              // Use the category20() scale function for multicolor support
              color = d3.scale.category20(),
              // our xScale
              xScale = d3.scale.linear()
                .domain([0, d3.max(data, function(d) {
                  return d.score;
                })])
                .range([0, width]);
       
          // set the height based on the calculations above
          svg.attr('height', height);
       
          //create the rectangles for the bar chart
          svg.selectAll('rect')
            .data(data).enter()
              .append('rect')
              .attr('height', barHeight)
              .attr('width', 140)
              .attr('x', Math.round(margin/2))
              .attr('y', function(d,i) {
                return i * (barHeight + barPadding);
              })
              .attr('fill', function(d) { return color(d.score); })
              .transition()
                .duration(1000)
                .attr('height', function(d) {
                  return xScale(d.score);
                }); 
					*/
					}



        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          scope.render(scope.data);
        });
			});
    },
    controller: ["$scope", function($scope) {
      $scope.foo = {
        "foo": "bar"
      }
    }]
  };
}]);
