/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Dashboard Sink Classes for FLOW Integration
 * 
 * These sinks follow the same pattern as foam.u2.mlang.Pie - they extend
 * GroupBy/GridBy and render charts using expression properties and toE/addToE methods.
 */

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardBarSink',
  extends: 'foam.mlang.sink.GroupBy',
  
  requires: [
    'org.chartjs.Bar2'
  ],
  
  properties: [
    // GroupBy properties (inherited but exposed here for clarity)
    { name: 'groupLimit', value: 0, help: 'Limit number of groups (0 = no limit)' },
    { name: 'sortOrder', value: 'DESC', help: 'Sort order for groups' },
    { name: 'includeOthers', value: false, help: 'Include "Others" category for remaining groups' },
    { name: 'othersLabel', value: 'Others', help: 'Label for the "Others" category' },
    // Chart-specific properties
    { name: 'colors' },
    { name: 'timeUnit' },
    { name: 'horizontal', value: false },
    { name: 'barThickness' },
    { name: 'xAxisLabel' },
    { name: 'yAxisLabel' },
    { name: 'showGridLines', value: true },
    // Display properties
    { name: 'responsive', value: true },
    { name: 'maintainAspectRatio', value: false },
    { name: 'height', value: 300 },
    { 
      name: 'width', 
      value: 400
    },
    { name: 'showLegend', value: true },
    { name: 'legendPosition', value: 'TOP' },
    { name: 'showTooltips', value: true },
    { name: 'animate', value: true },
    { name: 'animationDuration', value: 1000 },
    {
      name: 'chart_',
      expression: function(groups, colors, timeUnit, horizontal, barThickness, xAxisLabel, yAxisLabel, 
                          showGridLines, responsive, maintainAspectRatio, showLegend, 
                          legendPosition, showTooltips, animate, animationDuration) {
        var labels = [];
        var data = [];
        var backgroundColors = [];
        var borderColors = [];
        
        var index = 0;
        for ( var key in groups ) {
          if ( groups.hasOwnProperty(key) ) {
            labels.push(key.toString());
            data.push(groups[key].value);
            
            // Color handling
            var color;
            if ( colors && colors.length > 0 ) {
              color = colors[index % colors.length];
            } else {
              color = foam.CSS.returnTokenValue('$primary200', this.cls_, this.__context__);
            }
            backgroundColors.push(color);
            borderColors.push(color.replace('200', '400'));
            index++;
          }
        }
        
        var chartData = {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            barThickness: barThickness
          }]
        };
        
        var chartJSOptions = {
          responsive: responsive,
          maintainAspectRatio: maintainAspectRatio,
          indexAxis: horizontal ? 'y' : 'x',
          plugins: {
            legend: {
              display: showLegend,
              position: (legendPosition || 'TOP').toString().toLowerCase()            },
            tooltip: {
              enabled: showTooltips
            }
          },
          animation: animate ? {
            duration: animationDuration
          } : false,
          scales: {
            x: {
              title: {
                display: !!xAxisLabel,
                text: xAxisLabel
              },
              grid: {
                display: showGridLines
              }
            },
            y: {
              title: {
                display: !!yAxisLabel,
                text: yAxisLabel
              },
              grid: {
                display: showGridLines
              }
            }
          }
        };
        
        // Configure time scale if dealing with date/time properties
        // Check if arg1 (groupBy property) is a date/time property
        var isTimeScale = this.arg1 && (foam.lang.Date.isInstance(this.arg1) || foam.lang.DateTime.isInstance(this.arg1));
        
        if ( isTimeScale && timeUnit ) {
          chartJSOptions.scales.x.type = 'time';
          chartJSOptions.scales.x.time = {
            unit: timeUnit.chartJsUnit || 'day',
            displayFormats: {}
          };
          
          // Set display format for the selected time unit
          if ( timeUnit.displayFormat ) {
            chartJSOptions.scales.x.time.displayFormats[timeUnit.chartJsUnit || 'day'] = timeUnit.displayFormat;
          }
          
          // Configure tooltip format
          if ( timeUnit.tooltipFormat ) {
            chartJSOptions.scales.x.time.tooltipFormat = timeUnit.tooltipFormat;
          }
        }
        
        return this.Bar2.create({
          data: chartData,
          chartJSOptions: chartJSOptions,
          width: this.width,
          height: this.height
        });
      }
    }
  ],
  
  methods: [
    function toE(_, x) { 
      return x.E().add(this.chart_$);
    },
    function addToE(e) { 
      e.add(this.chart_$);
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardPieSink',
  extends: 'foam.mlang.sink.GroupBy',
  
  requires: [
    'org.chartjs.Pie2'
  ],
  
  properties: [
    // GroupBy properties (inherited but exposed here for clarity)
    { name: 'groupLimit', value: 10, help: 'Limit number of slices (0 = no limit)' },
    { name: 'sortOrder', value: 'DESC', help: 'Sort order for slices' },
    { name: 'includeOthers', value: true, help: 'Include "Others" slice for remaining groups' },
    { name: 'othersLabel', value: 'Others', help: 'Label for the "Others" slice' },
    // Pie-specific properties
    { name: 'colors' },
    { name: 'showPercentages', value: false },
    { name: 'cutoutPercentage', value: 0 },
    { name: 'clockwise', value: true },
    { name: 'rotation', value: -90 },
    // Display properties
    { name: 'responsive', value: true },
    { name: 'maintainAspectRatio', value: false },
    { name: 'height', value: 300 },
    { 
      name: 'width', 
      factory: function() { 
        // Default to 0 which means auto-width (100% of container)
        // But when rendered in a canvas, we need a real width
        return 400; 
      }
    },    { name: 'showLegend', value: true },
    { name: 'legendPosition', value: 'TOP' },
    { name: 'showTooltips', value: true },
    { name: 'animate', value: true },
    { name: 'animationDuration', value: 1000 },
    {
      name: 'chart_',
      expression: function(groups, colors, showPercentages, cutoutPercentage, clockwise, rotation,
                          responsive, maintainAspectRatio, showLegend, 
                          legendPosition, showTooltips, animate, animationDuration) {
        var labels = [];
        var data = [];
        var backgroundColors = [];
        
        var index = 0;
        for ( var key in groups ) {
          if ( groups.hasOwnProperty(key) ) {
            labels.push(key.toString());
            data.push(groups[key].value);
            
            // Generate colors
            if ( colors && colors.length > 0 ) {
              backgroundColors.push(colors[index % colors.length]);
            } else {
              // Default color generation
              var hue = (index / Math.max(1, Object.keys(groups).length - 1)) * 360;
              backgroundColors.push('hsl(' + hue + ', 70%, 50%)');
            }
            index++;
          }
        }
        
        var chartData = {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors
          }]
        };
        
        var options = {
          responsive: responsive,
          maintainAspectRatio: maintainAspectRatio,
          cutout: cutoutPercentage + '%',
          rotation: rotation,
          circumference: clockwise ? 360 : -360,
          plugins: {
            legend: {
              display: showLegend,
              position:(legendPosition || 'TOP').toString().toLowerCase()            },
            tooltip: {
              enabled: showTooltips
            },
            datalabels: {
              display: true,
              color: 'white',
              font: {
                weight: 'bold'
              }
            }
          },
          animation: animate ? {
            duration: animationDuration,
            animateRotate: true,
            animateScale: true
          } : false
        };
        
        if ( showPercentages ) {
          options.plugins.legend.labels = {
            generateLabels: function(chart) {
              var dataset = chart.data.datasets[0];
              var total = dataset.data.reduce(function(sum, val) { return sum + val; }, 0);
              
              return chart.data.labels.map(function(label, i) {
                var percentage = total > 0 ? ((dataset.data[i] / total) * 100).toFixed(1) : '0.0';
                var style = chart.getDatasetMeta(0).controller ? 
                           chart.getDatasetMeta(0).controller.getStyle(i) : 
                           { backgroundColor: dataset.backgroundColor[i] };
                
                return {
                  text: percentage + '% ' + label,
                  fillStyle: style.backgroundColor,
                  fontColor: undefined,
                  index: i
                };
              });
            }
          };
        }
        
        return this.Pie2.create({
          data: chartData,
          chartJSOptions: options,
          width: this.width,
          height: this.height
        });
      }
    }
  ],
  
  methods: [
    function toE(_, x) { 
      return x.E().add(this.chart_$);
    },
    function addToE(e) { 
      e.add(this.chart_$);
    }
  ]
});


foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardStackedBarSink',
  extends: 'foam.core.reflow.GridBy',
  
  requires: [
    'org.chartjs.StackedBar2'
  ],
  
  properties: [
    // Stacked bar-specific properties
    { name: 'colors' },
    { name: 'timeUnit' },
    { name: 'horizontal', value: false },
    { name: 'xAxisLabel' },
    { name: 'yAxisLabel' },
    { name: 'showGridLines', value: true },
    // Display properties
    { name: 'responsive', value: true },
    { name: 'maintainAspectRatio', value: false },
    { name: 'height', value: 300 },
    { name: 'width', value: 400 },
    { name: 'showLegend', value: true },
    { name: 'legendPosition', value: 'TOP' },
    { name: 'showTooltips', value: true },
    { name: 'animate', value: true },
    { name: 'animationDuration', value: 1000 },
    {
      name: 'chart_',
      expression: function(cols, rows, colors, timeUnit, horizontal, xAxisLabel, yAxisLabel,
                          showGridLines, responsive, maintainAspectRatio,
                          showLegend, legendPosition, showTooltips, animate, animationDuration) {
        console.log('=== DashboardStackedBarSink Structure Debug ===');
        console.log('cols type:', typeof cols, 'has groups:', !!cols.groups);
        console.log('rows type:', typeof rows, 'has groups:', !!rows.groups);
        
        // Check structure of cols.groups
        var colKeys = Object.keys(cols.groups || {});
        console.log('Column keys (first 3):', colKeys.slice(0, 3));
        
        // Check structure of rows.groups  
        var rowKeys = Object.keys(rows.groups || {});
        console.log('Row keys (first 3):', rowKeys.slice(0, 3));
        
        // Deep dive into first row structure
        if ( rowKeys.length > 0 ) {
          var firstRowKey = rowKeys[0];
          var firstRow = rows.groups[firstRowKey];
          console.log('First row structure:');
          console.log('  - key:', firstRowKey);
          console.log('  - type:', typeof firstRow);
          console.log('  - has groups:', !!firstRow.groups);
          if ( firstRow.groups ) {
            var firstRowColKeys = Object.keys(firstRow.groups);
            console.log('  - nested column keys (first 3):', firstRowColKeys.slice(0, 3));
            if ( firstRowColKeys.length > 0 ) {
              var firstCell = firstRow.groups[firstRowColKeys[0]];
              console.log('  - first cell type:', typeof firstCell);
              console.log('  - first cell has value:', 'value' in firstCell);
              console.log('  - first cell value:', firstCell.value);
            }
          }
        }
        
        var labels = [];
        var stackGroups = {};
        
        // Extract labels from columns
        for ( var col in cols.groups ) {
          if ( cols.groups.hasOwnProperty(col) ) {
            labels.push(col.toString());
          }
        }
        console.log('Extracted', labels.length, 'labels');
        
        // Group data by stack (rows)
        // The rows structure is: rows.groups[rowKey] = GroupBy object with its own groups property
        // Each row group contains: groups[colKey] = accumulator with value property
        for ( var row in rows.groups ) {
          if ( rows.groups.hasOwnProperty(row) ) {
            stackGroups[row] = {};
            var rowGroup = rows.groups[row];
            
            // For each column, get the value from this row's nested groups
            for ( var col in cols.groups ) {
              if ( cols.groups.hasOwnProperty(col) ) {
                if ( rowGroup && rowGroup.groups && rowGroup.groups[col] ) {
                  var value = rowGroup.groups[col].value || 0;
                  stackGroups[row][col] = value;
                } else {
                  stackGroups[row][col] = 0;
                }
              }
            }
          }
        }
        
        console.log('Created', Object.keys(stackGroups).length, 'stack groups');
        
        var datasets = [];
        var colorIndex = 0;
        
        for ( var stackValue in stackGroups ) {
          if ( stackGroups.hasOwnProperty(stackValue) ) {
            var data = [];
            
            labels.forEach(function(col) {
              var value = stackGroups[stackValue][col] || 0;
              data.push(value);
            });
            
            var color;
            if ( colors && colors.length > 0 ) {
              color = colors[colorIndex % colors.length];
            } else {
              var hue = (colorIndex / Math.max(1, Object.keys(stackGroups).length - 1)) * 360;
              color = 'hsl(' + hue + ', 70%, 50%)';
            }
            
            datasets.push({
              label: stackValue.toString(),
              data: data,
              backgroundColor: color,
              borderColor: typeof color === 'string' && color.includes('hsl') ? 
                          color.replace('50%', '40%') : color,
              borderWidth: 1
            });
            
            colorIndex++;
          }
        }
        
        console.log('Chart.js data structure:');
        console.log('  - labels count:', labels.length);
        console.log('  - datasets count:', datasets.length);
        if ( datasets.length > 0 ) {
          console.log('  - first dataset label:', datasets[0].label);
          console.log('  - first dataset data length:', datasets[0].data.length);
          console.log('  - first dataset data sample:', datasets[0].data.slice(0, 3));
        }
        
        var chartJSOptions = {
          responsive: responsive,
          maintainAspectRatio: maintainAspectRatio,
          indexAxis: horizontal ? 'y' : 'x',
          plugins: {
            legend: {
              display: showLegend,
              position: (legendPosition || 'TOP').toString().toLowerCase()
            },
            tooltip: {
              enabled: showTooltips,
              mode: 'index',
              intersect: false
            },
            datalabels: {
              display: true,
              color: 'white',
              font: {
                weight: 'bold'
              }
            }
          },
          animation: animate ? {
            duration: animationDuration
          } : false,
          scales: {
            x: {
              stacked: true,
              title: {
                display: !!xAxisLabel,
                text: xAxisLabel
              },
              grid: {
                display: showGridLines
              }
            },
            y: {
              stacked: true,
              title: {
                display: !!yAxisLabel,
                text: yAxisLabel
              },
              grid: {
                display: showGridLines
              }
            }
          }
        };
        
        // Configure time scale if dealing with date/time properties
        // Check if xFunc is a date/time property
        var isTimeScale = this.xFunc && (foam.lang.Date.isInstance(this.xFunc) || foam.lang.DateTime.isInstance(this.xFunc));
        
        if ( isTimeScale && timeUnit ) {
          chartJSOptions.scales.x.type = 'time';
          chartJSOptions.scales.x.time = {
            unit: timeUnit.chartJsUnit || 'day',
            displayFormats: {}
          };
          
          // Set display format for the selected time unit
          if ( timeUnit.displayFormat ) {
            chartJSOptions.scales.x.time.displayFormats[timeUnit.chartJsUnit || 'day'] = timeUnit.displayFormat;
          }
          
          // Configure tooltip format
          if ( timeUnit.tooltipFormat ) {
            chartJSOptions.scales.x.time.tooltipFormat = timeUnit.tooltipFormat;
          }
        }
        
        return this.StackedBar2.create({
          data: {
            labels: labels,
            datasets: datasets
          },
          chartJSOptions: chartJSOptions,
          width: this.width,
          height: this.height
        });
      }
    }
  ],
  
  methods: [
    function toE(_, x) { 
      return x.E().add(this.chart_$);
    },
    function addToE(e) { 
      e.add(this.chart_$);
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardLineSink',
  extends: 'foam.dao.ArraySink',
  
  requires: [
    'org.chartjs.Line2',
    'foam.mlang.sink.GroupBy'
  ],
  
  properties: [
    // Line-specific properties
    { name: 'xProp' },
    { name: 'yProp' },
    { name: 'groupBy' },
    { name: 'aggregationSink' },
    { name: 'timeUnit' },
    { name: 'colors' },
    { name: 'xAxisLabel' },
    { name: 'yAxisLabel' },
    { name: 'fill', value: false },
    { name: 'tension', value: 0.1 },
    { name: 'stepped', value: false },
    { name: 'showPoints', value: true },
    { name: 'pointRadius', value: 3 },
    { name: 'showGridLines', value: true },
    // Display properties
    { name: 'responsive', value: true },
    { name: 'maintainAspectRatio', value: false },
    { name: 'height', value: 300 },
    { 
      name: 'width', 
      factory: function() { 
        // Default to 0 which means auto-width (100% of container)
        // But when rendered in a canvas, we need a real width
        return 400; 
      }
    },    
    { name: 'showLegend', value: true },
    { name: 'legendPosition', value: 'TOP' },
    { name: 'showTooltips', value: true },
    { name: 'animate', value: true },
    { name: 'animationDuration', value: 1000 },
    {
      name: 'chart_',
      expression: function(array, xProp, yProp, groupBy, aggregationSink, timeUnit, colors, xAxisLabel, yAxisLabel,
                          fill, tension, stepped, showPoints, pointRadius, showGridLines,
                          responsive, maintainAspectRatio, showLegend, legendPosition,
                          showTooltips, animate, animationDuration) {
        var self = this;
        var datasets = [];
        
        if ( !xProp || !yProp ) {
          return null;
        }
        
        if ( groupBy ) {
          // Group data for multiple lines
          var groups = {};
          array.forEach(function(obj) {
            var groupKey = obj[groupBy.name] || 'Default';
            if ( !groups[groupKey] ) {
              groups[groupKey] = [];
            }
            groups[groupKey].push(obj);
          });
          
          var colorIndex = 0;
          for ( var key in groups ) {
            if ( groups.hasOwnProperty(key) ) {
              var data = [];
              groups[key].forEach(function(obj) {
                var xVal = obj[xProp.name];
                var yVal = obj[yProp.name];
                
                if ( xVal != null && yVal != null ) {
                  // For date/time properties, ensure we have a proper Date object or timestamp
                  var processedXVal = xVal;
                  if ( foam.lang.Date.isInstance(xProp) || foam.lang.DateTime.isInstance(xProp) ) {
                    // Convert to Date object if it's a timestamp or string
                    if ( typeof xVal === 'number' || typeof xVal === 'string' ) {
                      processedXVal = new Date(xVal);
                    }
                  } else if ( xProp.chartJsFormatter ) {
                    processedXVal = xProp.chartJsFormatter(xVal);
                  }
                  data.push({x: processedXVal, y: yVal});
                }
              });
              
              // Sort by X value
              data.sort(function(a, b) {
                // Handle Date objects
                if ( a.x instanceof Date && b.x instanceof Date ) {
                  return a.x.getTime() - b.x.getTime();
                }
                return parseFloat(a.x) - parseFloat(b.x);
              });
              
              var color;
              if ( colors && colors.length > 0 ) {
                color = colors[colorIndex % colors.length];
              } else {
                var hue = (colorIndex / Math.max(1, Object.keys(groups).length - 1)) * 360;
                color = 'hsl(' + hue + ', 70%, 50%)';
              }
              
              datasets.push({
                label: key,
                data: data,
                backgroundColor: fill ? color : 'transparent',
                borderColor: color,
                borderWidth: 2,
                fill: fill,
                tension: tension,
                stepped: stepped,
                pointRadius: showPoints ? pointRadius : 0,
                pointHoverRadius: showPoints ? pointRadius + 2 : 0
              });
              
              colorIndex++;
            }
          }
        } else {
          // Single line
          var data = [];
          array.forEach(function(obj) {
            var xVal = obj[xProp.name];
            var yVal = obj[yProp.name];
            
            if ( xVal != null && yVal != null ) {
              // For date/time properties, ensure we have a proper Date object or timestamp
              var processedXVal = xVal;
              if ( foam.core.Date.isInstance(xProp) || foam.core.DateTime.isInstance(xProp) ) {
                // Convert to Date object if it's a timestamp or string
                if ( typeof xVal === 'number' || typeof xVal === 'string' ) {
                  processedXVal = new Date(xVal);
                }
              } else if ( xProp.chartJsFormatter ) {
                processedXVal = xProp.chartJsFormatter(xVal);
              }
              data.push({x: processedXVal, y: yVal});
            }
          });
          
          // Sort by X value
          data.sort(function(a, b) {
            return parseFloat(a.x) - parseFloat(b.x);
          });
          
          var lineColor = colors && colors[0] ? colors[0] : 
                         foam.CSS.returnTokenValue('$green500', this.cls_, this.__context__);
          
          datasets.push({
            label: (yProp.label || yProp.name) + ' vs ' + (xProp.label || xProp.name),
            data: data,
            backgroundColor: fill ? lineColor : 'transparent',
            borderColor: lineColor,
            borderWidth: 2,
            fill: fill,
            tension: tension,
            stepped: stepped,
            pointRadius: showPoints ? pointRadius : 0,
            pointHoverRadius: showPoints ? pointRadius + 2 : 0
          });
        }
        
        // Check if xProp is a date/time type
        var isTimeScale = xProp && (foam.lang.Date.isInstance(xProp) || foam.lang.DateTime.isInstance(xProp));
        
        var chartJSOptions = {
          responsive: responsive,
          maintainAspectRatio: maintainAspectRatio,
          plugins: {
            legend: {
              display: showLegend && (datasets.length > 1 || showLegend),
              position: (legendPosition || 'TOP').toString().toLowerCase()            },
            tooltip: {
              enabled: showTooltips,
              mode: datasets.length > 1 ? 'index' : 'nearest',
              intersect: false
            }
          },
          animation: animate ? {
            duration: animationDuration
          } : false,
          scales: {
            x: {
              title: { 
                display: true, 
                text: xAxisLabel || (xProp ? xProp.label : '')
              },
              grid: {
                display: showGridLines
              }
            },
            y: {
              title: { 
                display: true, 
                text: yAxisLabel || (yProp ? yProp.label : '')
              },
              grid: {
                display: showGridLines
              }
            }
          }
        };
        
        // Configure time scale if dealing with date/time properties
        if ( isTimeScale && timeUnit ) {
          chartJSOptions.scales.x.type = 'time';
          chartJSOptions.scales.x.time = {
            unit: timeUnit.chartJsUnit || 'day',
            displayFormats: {}
          };
          
          // Set display format for the selected time unit
          if ( timeUnit.displayFormat ) {
            chartJSOptions.scales.x.time.displayFormats[timeUnit.chartJsUnit || 'day'] = timeUnit.displayFormat;
          }
          
          // Configure tooltip format
          if ( timeUnit.tooltipFormat ) {
            chartJSOptions.scales.x.time.tooltipFormat = timeUnit.tooltipFormat;
          }
        }
        
        return this.Line2.create({
          data: { datasets: datasets },
          chartJSOptions: chartJSOptions,
          width: this.width,
          height: this.height
        });
      }
    }
  ],
  
  methods: [
    function toE(_, x) { 
      if ( !this.chart_ ) return x.E().add('Please select X and Y properties');
      return x.E().add(this.chart_$);
    },
    function addToE(e) { 
      if ( !this.chart_ ) {
        e.add('Please select X and Y properties');
        return;
      }
      e.add(this.chart_$);
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardMetricSink',
  extends: 'foam.dao.AbstractSink',
  
  requires: [
    'foam.mlang.sink.Count'
  ],
  
  properties: [
    { name: 'operation' },
    { name: 'prop' },
    { name: 'label', value: 'Metric' },
    { name: 'showCount', value: true },
    { name: 'valueColor' },
    { name: 'unit' },
    { name: 'decimalPlaces', value: 0 },
    { name: 'metricSink_', hidden: true },
    { name: 'countSink_', hidden: true },
    {
      name: 'metric_',
      expression: function(metricSink_, countSink_, label, showCount, valueColor, unit, decimalPlaces) {
        var value = metricSink_ ? metricSink_.value : 0;
        var count = countSink_ ? countSink_.value : null;
        
        // Format value with decimal places
        if ( typeof value === 'number' ) {
          value = value.toFixed(decimalPlaces);
          if ( decimalPlaces === 0 ) {
            value = parseInt(value).toLocaleString();
          } else {
            value = parseFloat(value).toLocaleString(undefined, {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces
            });
          }
        }
        
        // Add unit if specified
        if ( unit ) {
          value = unit.startsWith(' ') || unit.endsWith(' ') ? 
                  value + unit : value + ' ' + unit;
        }
        
        var displayLabel = label || 
                          (this.prop ? this.operation.label + ' of ' + this.prop.label : this.operation.label);
        
        return {
          label: displayLabel,
          value: value,
          count: count,
          showCount: showCount,
          valueColor: valueColor || foam.CSS.returnTokenValue('$primary500', this.cls_, this.__context__)
        };
      }
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      
      if ( this.operation ) {
        this.metricSink_ = this.operation.createSink(this.prop);
      }
      
      // Always create count sink to track number of records
      this.countSink_ = this.Count.create();
    },
    
    function put(obj, sub) {
      if ( this.metricSink_ ) {
        this.metricSink_.put(obj, sub);
      }
      if ( this.countSink_ ) {
        this.countSink_.put(obj, sub);
      }
    },
    
    function toE(_, x) {
      var self = this;
      return x.E().add(this.metric_$.map(function(metric) {
        var e = foam.u2.Element.create();
        
        
        // Label
        e.start('div')
          .style({
            fontSize: '0.875rem',
            color: foam.CSS.returnTokenValue('$textSecondary', self.cls_, self.__context__),
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 'medium',
            marginBottom: '8px'
          })
          .add(metric.label)
        .end();
        
        // Value
        e.start('div')
          .style({
            fontSize: '3rem',
            fontWeight: 'bold',
            color: metric.valueColor,
            lineHeight: '1'
          })
          .add(metric.value)
        .end();
        
        // Count - show how many records were processed
        if ( metric.showCount && metric.count !== null ) {
          e.start('div')
            .style({
              fontSize: '0.75rem',
              marginTop: '8px',
              color: foam.CSS.returnTokenValue('$textSecondary', self.cls_, self.__context__),
              fontWeight: 'normal'
            })
            .add('from ' + metric.count.toLocaleString() + ' records')
          .end();
        }
        
        e.end();
        return e;
      }));
    },
    
    function addToE(e) {
      var self = this;
      e.add(this.metric_$.map(function(metric) {
        var container = foam.u2.Element.create();
        
    
        
        // Label
        container.start('div')
          .style({
            fontSize: '0.875rem',
            color: foam.CSS.returnTokenValue('$textSecondary', self.cls_, self.__context__),
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 'medium',
            marginBottom: '8px'
          })
          .add(metric.label)
        .end();
        
        // Value
        container.start('div')
          .style({
            fontSize: '3rem',
            fontWeight: 'bold',
            color: metric.valueColor,
            lineHeight: '1'
          })
          .add(metric.value)
        .end();
        
        // Count - show how many records were processed
        if ( metric.showCount && metric.count !== null ) {
          container.start('div')
            .style({
              fontSize: '0.75rem',
              marginTop: '8px',
              color: foam.CSS.returnTokenValue('$textSecondary', self.cls_, self.__context__),
              fontWeight: 'normal'
            })
            .add('from ' + metric.count.toLocaleString() + ' records')
          .end();
        }
        
        container.end();
        return container;
      }));
    },
    
    function eof() {
      if ( this.metricSink_ && this.metricSink_.eof ) {
        this.metricSink_.eof();
      }
      if ( this.countSink_ && this.countSink_.eof ) {
        this.countSink_.eof();
      }
    },
    
    function reset(sub) {
      if ( this.metricSink_ ) {
        this.metricSink_.reset(sub);
      }
      if ( this.countSink_ ) {
        this.countSink_.reset(sub);
      }
    }
  ]
});