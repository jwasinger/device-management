define(['lib/q', 'lib/d3', 'lib/jquery'], function(Q, d3, $) {

angular.module("app.directives.barchart", ["d3"])
.directive("barchart", [function() {
	return {
		restrict: 'E',
		template: 
	}
  return function() {
    var _this = this;

    _this.element = 'svg#graph';

    _this.Show = function() {
      return true;
    }
    
    //todo: calculate these based on the total amount of data
    //and the desired amount of data that should be displayed
    //on the screen at one time
    /*
    var GraphDimensions = {
      
    };
    */

    var ViewportDimensions = {
      Width: $(_this.element).innerWidth(),
      Height: $(_this.element).innerWidth()
    }
    
    var animationTimeMS = 500;

    //margins INSIDE the svg element.  These create room for the axes
    var Margins = {
      Left: 40,
      Right: 40,
      Bottom: 40,
      Top: 40
    }

    var DisplayAreaDimensions = {
      Width: ViewportDimensions.Width - (Margins.Left + Margins.Right),
      Height: ViewportDimensions.Height - (Margins.Top + Margins.Bottom)
    }

    var GraphColors = {
      Critical: 'red',
      Unknown: 'blue',
      Info: 'green'
    };


    function genRandAlerts() {
      return {
        Critical: Math.random() * DisplayAreaDimensions.Height,
        Unknown: Math.random() * DisplayAreaDimensions.Height,
        Info: Math.random() * DisplayAreaDimensions.Height
      }
    }

    //generate random data for three months (12 weeks)
    function genRandData(numMonths) {
      var result = {
        Months: new Array(numMonths)
      };

      for(var i = 0; i < numMonths; i++) {
        result.Months[i] = {
          Weeks: new Array(numMonths),
          Alerts: genRandAlerts()
        };
        
        for(var j = 0; j < 4; j++) {
          result.Months[i].Weeks[j] = {
            Days: new Array(7),
            Alerts: genRandAlerts()
          };

          for(var k = 0; k < 7; k++) {
            result.Months[i].Weeks[j].Days[k] = {
              Alerts: genRandAlerts()
            };
          }
        }
      }
      return result;
    }

    var Data = genRandData(3);

    var curView = 'month';
    _this.ViewData = []; //information processed from 'Data' to be easily parsed and graphed

    var BarSpacing = 0.5;
    var TimeSlotWidth;

    var xScale,
        xScaleAlert,
        yScale,
        xAxis,
        yAxis,
        ViewData;

    //types: 'month', 'week', 'day'

    //calculate the total width of the graph (extends off screen)
    function calcGraphWidth() {
      //TimeSlotWidth = (ViewportDimensions.Width - (10 + 1)*BarSpacing) / 10;
      TimeSlotWidth = 60;
      GraphTotalWidth = TimeSlotWidth*(ViewData.length) + BarSpacing*(ViewData.length -1);
    }

    function setViewMonths() {
      var result = new Array();
      var monthNum = 0;
      
      for(var i = 0; i < Data.Months.length; i++) {
        result.push({
          key: 'Month'+monthNum,
          value: objGenKV(Data.Months[i].Alerts)
        });
        monthNum++;
      }
      
      curView = 'month';
      ViewData = result;
      calcGraphWidth();
    }

    function setViewWeeks() {
      var result = new Array();
      var weekNum = 0;
      for(var i = 0; i < Data.Months.length; i++) {
        for(var j = 0; j < Data.Months[i].Weeks.length; j++) {
          result.push({
            key: 'Week'+weekNum,
            value: objGenKV(Data.Months[i].Weeks[j].Alerts)
          });
          weekNum++;
        }
      }

      curView = 'week';
      ViewData = result;
      calcGraphWidth();
    }

    function setViewDays() {
      var result = new Array();
      var dayNum = 0;

      for(var i = 0; i < Data.Months.length; i++) {
        for(var j = 0; j < Data.Months[i].Weeks.length; j++) {
          for(var k = 0; k < Data.Months[i].Weeks[j].Days.length; k++) {
            result.push({
              key: 'Day'+dayNum,
              value: objGenKV(Data.Months[i].Weeks[j].Days[k].Alerts)
            });
            dayNum++;
          }
        }
      }

      curView = 'day';
      ViewData = result;
      calcGraphWidth();
    }

    //turn {x: 'foo', y: 'bar', z: 'foobar'} 
    //into [{key: 'x', value: 'foo'}, {key: 'y', value: 'bar'}, {key:'z', value:'foobar'}]
    function objGenKV(obj) {
      var result = new Array();
      for(var k in obj) {
        result.push({
          key: k,
          value: obj[k]
        });
      }

      return result;
    }

    function transitionClear() {
      var deferred = Q.defer();

      var rects = d3.selectAll('svg#graph').selectAll('g.graph-area g.time-slot rect');
      var timeSlots = d3.selectAll('svg#graph').selectAll('g.graph-area g.time-slot');
      
      if(rects[0].length == 0) {
        deferred.resolve();
      }
      else {
        rects.transition()
          .duration(animationTimeMS)
          .ease('quad')
            .attr('y', DisplayAreaDimensions.Height)
            .attr('height', 0)
            .each('end', function() {
              timeSlots.remove();
              deferred.resolve();
            });
      }

      return deferred.promise;
    }

    function transitionData() {
      var deferred = Q.defer();
      
      xScale = d3.scale.ordinal()
        .domain(ViewData.map(function(val) {
          return val.key;
        }))
        .rangeRoundBands([0, GraphTotalWidth], BarSpacing);

      xScaleAlerts = d3.scale.ordinal()
        .domain(['Critical', 'Unknown', 'Info'])
        .rangeRoundBands([0, xScale.rangeBand()]);

      yScale = d3.scale.linear()
        .domain([0, DisplayAreaDimensions.Height])
        .range([DisplayAreaDimensions.Height, 0]);

      xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

      yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

      d3.selectAll('svg#graph').append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + Margins.Left + ' , ' + Margins.Top +')')
        .call(yAxis);

      d3.select('.y-axis path').attr('fill', 'none');
      d3.select('.y-axis path').attr('stroke', 'black');
      d3.select('.y-axis path').attr('stroke-width', '2px');

      d3.selectAll('svg#graph').selectAll('g.y-axis').call(yAxis);

      var times = d3.selectAll('svg#graph').selectAll('g.graph-area').selectAll('g')
        .data(ViewData)
        .enter()
        .append('g')
          .attr('class', 'time-slot')
          .attr('transform', function(d) {
            return 'translate(' + xScale(d.key) + ', 0)';
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
            return xScaleAlerts(d.key);
          })
          .attr('y', function(d) {
            return DisplayAreaDimensions.Height;
          })
          .attr('width', function(d) {
            return xScaleAlerts.rangeBand();
          })
          .attr('height', function(d) {
            return 0; //bars not visible until transition
          })
          .attr('fill', function(d) {
            return GraphColors[d.key];
          });

      //append an invisible rect to capture mouse input for this time slot
      /*
      times.append('rect')
        .attr('x', function(d) {
          return xScaleAlerts(d.key);
        })
        .attr('y', function(d) {
          return ViewportDimensions.Height -  (Margins.Bottom + Margins.Top);
        })
        .attr('width', function(d) {
          return xScaleAlerts.rangeBand();
        })
        .attr('height', function(d) {
          return 0; //bars not visible until transition
        })
        .attr('fill', function(d) {
          return GraphColors[d.key];
        });
      */

      //visual transition
      var rects = times.selectAll('rect');
      rects.transition()
        .duration(animationTimeMS)
        .ease('quad')
          .attr('y', function(d) {
            return DisplayAreaDimensions.Height - yScale(d.value);
          })
          .attr('height', function(d) {
            return yScale(d.value) + 'px';
          }).each('end', function() {
            deferred.resolve();
          });

      return deferred.promise;
    }

    function wait(amt) {
      var deferred = Q.defer();
      setTimeout(function() {
        console.log('wait ended');
        deferred.resolve();
      }, amt);
      return deferred.promise;
    }
    
    var isPanning = false;
    var lastCursorPos = null;
    var curXTranslate = 0;

    
    function horizontalPan(elem) {
      isPanning = false;

      $(elem).mousedown(function(e) {
        if(!isPanning) {
          isPanning = true;
          lastCursorPos = {
            x: e.clientX,
            y: e.clientY
          }
        }
      });
      $(elem).mouseup(function(e) {
        if(isPanning) {
          isPanning = false;
        }
      });
      $(elem).mouseenter(function(e) {

      });
      $(elem).mouseleave(function(e) {
        if(isPanning) {
          isPanning = false;
        }
      });

      $(elem).mousemove(function(e) {
        if(isPanning) {
          if(lastCursorPos) {
            var curCursorPos = {
              x: e.clientX,
              y: e.clientY
            }

            var xDelta = curCursorPos.x - lastCursorPos.x;
            curXTranslate += xDelta;

            d3.selectAll('svg#graph').selectAll('g.graph-area')
              .attr('transform', 'translate('+curXTranslate+', '+Margins.Top+')');

            d3.select('g.x-axis')
              .attr('transform', 'translate('+curXTranslate+', '+(DisplayAreaDimensions.Height + Margins.Top)+')');

            lastCursorPos = curCursorPos;
          } else {
            lastCursorPos = {
              x: e.clientX,
              y: e.clientY
            }
          }
        }
      });
    }

    function mouseoverColor(elem) {
      d3.selectAll(elem).selectAll('g.time-slot')[0].forEach(function(val) {
        val.onmousedown = function(e) {
          d3.select(this).selectAll('rect')
            .attr('fill', 'black');
        }
      });
    }

    //reformat y axis to match the new domainof values in ViewData
    function transitionXAxisClear() {
      var deferred = Q.defer();
      d3.select('g.x-axis')
        .transition()
        .duration(animationTimeMS)
          .attr('opacity', '0')
          .each('end', function() {
            d3.selectAll('g.x-axis').remove();
            deferred.resolve();
          });
      return deferred.promise;
    }

    function transitionXAxisVisible() {
      var deferred = Q.defer();
      d3.selectAll('svg#graph').append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate('+ Margins.Left +', ' + (DisplayAreaDimensions.Height + Margins.Top) + ')');

      d3.select('svg#graph .x-axis').call(xAxis);
      d3.selectAll('.x-axis').attr('opacity', '0');
      d3.selectAll('.x-axis path').attr('fill', 'none');

      d3.selectAll('.x-axis').transition()
        .duration(animationTimeMS)
        .ease('quad')
          .attr('opacity', '1')
          .each('end', function() {
            deferred.resolve();
          });
      return deferred.promise;
    }

    function calcYMax() {
      //calculate max value from ViewData
      var max = 0.0;

      for(var i = 0; i < ViewData.length; i++) {
        for(var j = 0; j < ViewData[i].value.length; j++) {
          var val = ViewData[i].value[j].value;
          if( val > max) {
            max = val;
          }
        }
      }

      return val;
    }

    //reformat y axis to match the new range of values in ViewData
    function transitionYAxisRescale() {
      var deferred = Q.defer();

      deferred.resolve();
      
      var newRangeMax = calcYMax();

      yScale = d3.scale.linear()
        .domain([0, newRangeMax])
        .range([DisplayAreaDimensions.Height, 0]);

      yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')


      d3.selectAll('g.y-axis').transition()
        .duration(animationTimeMS)
        .call(yAxis)
        .each('end', function() {
          deferred.resolve();
        });

        d3.selectAll('g.y-axis path').attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', '2px');

      return deferred.promise;
    }

    $(document).ready(function() {
      horizontalPan('svg#graph');

      $('select#LODSelect').change(function(e) {
        var selectVal = $(this).val();
        Q.all([transitionClear(), transitionXAxisClear()])
        .then(function() {
          switch(selectVal) {
            case 'days':
              setViewDays();
              break;
            case 'weeks':
              setViewWeeks();
              break;
            case 'months':
              setViewMonths();
              break;
          }
          return Q.all([ transitionData(), transitionYAxisRescale(), transitionXAxisVisible()]);
        });
      });

      $('svg#graph g.graph-area g.time-slot').on('click', function(e) {
        alert('foo!');
      });

      var svg = d3.selectAll('svg#graph')
        .attr('width', ViewportDimensions.Width)
        .attr('height', ViewportDimensions.Height)
        .attr('style', 'border: solid black;');

      svg.append('g')
        .attr('class', 'graph-area')
        .attr('transform', 'translate(' + Margins.Left + ', ' + Margins.Top + ')');

      setViewDays();
      Q.all([transitionData(), transitionXAxisVisible()]).then(function() {
        mouseoverColor('svg#graph');
      });
    });
  }
}]);
