/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Dashboard DAOAgents for FLOW Integration
 * 
 * These agents adapt FOAM dashboard components to work with FLOW and DAOPrompt2.
 * They bridge the gap between FOAM's widget-based dashboard system and FLOW's 
 * command-based interactive document system.
 */

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'ColorMappingMixin',
  
  documentation: 'Mixin providing centralized color management for charts with user control over color mappings',
  
  properties: [
    {
      class: 'StringArray',
      of: 'Color',
      name: 'colors',
      label: 'Chart Colors',
      view: {
        class: 'foam.u2.view.ArrayView',
        valueView: 'foam.u2.view.ColorEditView'
      }
    }
  ],
  
  methods: [
    function getColorForCategory(categoryKey, colorIndex) {
      // Use the color from the array based on index
      if ( this.colors && this.colors.length > 0 ) {
        var colorObj = this.colors[colorIndex % this.colors.length];
        // foam.lang.Color automatically handles token resolution
        return colorObj;
      }
      
      // Fallback if no colors defined
      var defaultTokens = ['$green500', '$blue500', '$red500', '$yellow500'];
      return foam.CSS.returnTokenValue(defaultTokens[colorIndex % defaultTokens.length], this.cls_, this.__context__);
    },
    
    function addColorMappingToE(e) {
      // Helper method to add color controls to UI
      e.start('div').style({marginBottom: '10px'})
        .add('Colors: ', this.COLORS)
      .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'ChartDisplayMixin',
  
  documentation: 'Mixin for common chart display options',
  
  requires: [
    'foam.core.reflow.dashboard.LegendPosition'
  ],
  
  properties: [
    {
      class: 'Boolean',
      name: 'responsive',
      label: 'Responsive',
      value: true
    },
    {
      class: 'Boolean',
      name: 'maintainAspectRatio',
      label: 'Maintain Aspect Ratio',
      value: false
    },
    {
      class: 'Int',
      name: 'height',
      label: 'Chart Height (px)',
      value: 300
    },
    {
      class: 'Boolean',
      name: 'showLegend',
      label: 'Show Legend',
      value: true
    },
    {
      class: 'Enum',
      of: 'foam.core.reflow.dashboard.LegendPosition',
      name: 'legendPosition',
      label: 'Legend Position',
      value: 'TOP',
      visibility: function(showLegend) {
        return showLegend ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'showTooltips',
      label: 'Show Tooltips',
      value: true
    },
    {
      class: 'Boolean',
      name: 'animate',
      label: 'Enable Animation',
      value: true
    },
    {
      class: 'Int',
      name: 'animationDuration',
      label: 'Animation Duration (ms)',
      value: 1000,
      visibility: function(animate) {
        return animate ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    }
  ],
  
  methods: [
    function addChartDisplayToE(e) {
      var self = this;
      // Add chart display configuration fields to the UI
      e.start('div').style({marginBottom: '10px'})
        .add('Height: ', this.HEIGHT, 'px')
      .end()
      .start('div').style({marginBottom: '10px'})
        .add('Legend: ', this.SHOW_LEGEND)
        .add(self.dynamic(function(showLegend) {
          if (showLegend) {
            return this.add(' Position: ', self.LEGEND_POSITION);
          }
        }))
      .end()
      .start('div').style({marginBottom: '10px'})
        .add('Tooltips: ', this.SHOW_TOOLTIPS, ' Animation: ', this.ANIMATE)
        .add(self.dynamic(function(animate) {
          if (animate) {
            return this.add(' Duration: ', self.ANIMATION_DURATION, 'ms');
          }
        }))
      .end()
      .start('div').style({marginBottom: '10px'})
        .add('Responsive: ', this.RESPONSIVE, ' Maintain Ratio: ', this.MAINTAIN_ASPECT_RATIO)
      .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DirectChartMixin',
  
  documentation: 'Mixin providing direct Chart.js integration for DAO agents',
  
  requires: [
    'org.chartjs.Bar2',
    'org.chartjs.Pie2', 
    'org.chartjs.Line2',
    'org.chartjs.Donut2',
    'org.chartjs.StackedBar2',
    'foam.mlang.sink.GroupBy',
    'foam.mlang.sink.GroupBySortOrder'
  ],
  
  methods: [
    function renderDirectChart(e, chartType, chartData, config, block) {
      var ChartClass;
      switch(chartType) {
        case 'bar': ChartClass = this.Bar2; break;
        case 'stackedbar': ChartClass = this.StackedBar2; break;
        case 'pie': ChartClass = this.Pie2; break;
        case 'donut': ChartClass = this.Donut2; break;
        case 'line': ChartClass = this.Line2; break;
        default: throw new Error('Unknown chart type: ' + chartType);
      }
      
      // Create the chart first to get its default options
      var chart = ChartClass.create({
        data: chartData
      }, e.__subContext__);
      
      // Get the chart's existing options (preserves stacking config for StackedBar2)
      var existingOptions = chart.chartJSOptions || {};
      
      // Merge with default responsive settings and any additional config
      var chartJSOptions = {
        responsive: true,
        maintainAspectRatio: false,
        ...existingOptions  // Preserve chart's built-in options (like stacking)
      };
      
      if (config && config.options) {
        chartJSOptions = {...chartJSOptions, ...config.options};
      }
      
      // Apply the merged options back to the chart
      chart.chartJSOptions = chartJSOptions;
      // Debug logging (remove in production)
      // console.log('Chart.js config:', { type: chartType, data: chartData, options: chart.chartJSOptions });
      // Wrap chart in responsive container
      e.start('div').
        style({
          position: 'relative',
          height: '300px',  // Fixed height for consistent layout
          width: '100%',
          overflow: 'hidden'
        }).
        add(chart).
      end();
      
      // Set block value
      if (block) {
        if (block.value) {
          block.value.value = chart;
        } else {
          block.value = chart;
        }
      }
      
      return chart;
    },
    
    function showPropertyRequiredMessage(e) {
      e.start('div').
        style({padding: '20px', textAlign: 'center', color: foam.CSS.returnTokenValue('$textTertiary', this.cls_, this.__context__)}).
        add('Please select a property to group by').
      end();
    },
    
    function convertGroupByToChartData(groupBy, propLabel, chartType) {
      var data = [];
      var labels = [];
      
      // Extract data from GroupBy sink
      for ( var key in groupBy.groups ) {
        if ( groupBy.groups.hasOwnProperty(key) ) {
          labels.push(key.toString());
          data.push(groupBy.groups[key].value);
        }
      }
      
      // Create Chart.js dataset with basic structure
      var dataset = {
        label: propLabel || 'Count',
        data: data
      };
      
      // Let the agent configure its own styling
      if ( this.configureDatasetStyling ) {
        this.configureDatasetStyling(dataset, labels, chartType);
      }
      
      return {
        labels: labels,
        datasets: [dataset]
      };
    },
    
    function createLimitedGroupBy(groupBy, sink, topN, sortDescending, includeOthers) {
      // Create GroupBy with unified groupLimit functionality
      var sortOrder = this.GroupBySortOrder.NONE;
      if ( topN > 0 ) {
        sortOrder = sortDescending ? this.GroupBySortOrder.DESC : this.GroupBySortOrder.ASC;
      }
      
      return this.GroupBy.create({
        arg1: groupBy,
        arg2: sink,
        groupLimit: topN > 0 ? topN : -1,
        sortOrder: sortOrder,
        includeOthers: includeOthers
      });
    },
    
    function convertLimitedGroupsToChartData(groups, propLabel, chartType) {
      var data = [];
      var labels = [];
      
      // Extract data from groups object (with built-in groupLimit functionality)
      for ( var key in groups ) {
        if ( groups.hasOwnProperty(key) ) {
          labels.push(key.toString());
          data.push(groups[key].value);
        }
      }
      
      // Create Chart.js dataset with basic structure
      var dataset = {
        label: propLabel || 'Count',
        data: data
      };
      
      // Let the agent configure its own styling
      if ( this.configureDatasetStyling ) {
        this.configureDatasetStyling(dataset, labels, chartType);
      }
      
      return {
        labels: labels,
        datasets: [dataset]
      };
    }
  ]
});

// CardRenderMixin removed - metrics always render as cards


foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardBarChartDAOAgent',
  extends: 'foam.core.reflow.GroupByDAOAgent',
  mixins: [
    'foam.core.reflow.dashboard.ColorMappingMixin',
    'foam.core.reflow.dashboard.ChartDisplayMixin'
  ],

  requires: [
    'foam.core.reflow.dashboard.DashboardBarSink'
  ],

  properties: [
    // Inherited from GroupByDAOAgent: prop, sink
    // From mixins: colors, groupLimit, sortOrder, includeOthers, etc.
    {
      class: 'Boolean',
      name: 'horizontal',
      label: 'Horizontal Bars',
      value: false
    },
    {
      class: 'Float',
      name: 'barThickness',
      label: 'Bar Thickness',
      help: 'Thickness of bars (0 = auto)'
    },
    {
      class: 'String',
      name: 'xAxisLabel',
      label: 'X-Axis Label'
    },
    {
      class: 'String',
      name: 'yAxisLabel',
      label: 'Y-Axis Label'
    },
    {
      class: 'Boolean',
      name: 'showGridLines',
      label: 'Show Grid Lines',
      value: true
    }
  ],

  methods: [
    function createSink() {
      // Create sink with GroupBy configuration inherited from parent
      // Use the sink from parent GroupByDAOAgent if provided, otherwise COUNT
      var valueSink = this.sink ? this.sink.createSink() : this.COUNT();
      
      var sink = this.DashboardBarSink.create({
        arg1: this.prop,
        arg2: valueSink,
        groupLimit: this.groupLimit,
        sortOrder: this.sortOrder,
        includeOthers: this.includeOthers,
        othersLabel: this.othersLabel,
        colors: this.colors,
        horizontal: this.horizontal,
        barThickness: this.barThickness,
        xAxisLabel: this.xAxisLabel,
        yAxisLabel: this.yAxisLabel,
        showGridLines: this.showGridLines,
        responsive: this.responsive,
        maintainAspectRatio: this.maintainAspectRatio,
        height: this.height,
        showLegend: this.showLegend,
        legendPosition: this.legendPosition,
        showTooltips: this.showTooltips,
        animate: this.animate,
        animationDuration: this.animationDuration
      });
      
      return sink;
    },
    
    function addToE(e) {
      var self = this;
      e.startContext({data: this})
        .start('div').style({padding: '10px'})
          .start('div').style({marginBottom: '10px'})
            .add('Grouping: ', this.PROP, ' by ', this.SINK)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Include Others: ', this.INCLUDE_OTHERS)
            .add(self.dynamic(function(includeOthers) {
              if (includeOthers) {
                return this.add(' Label: ', self.OTHERS_LABEL);
              }
            }))
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Display: Horizontal: ', this.HORIZONTAL, ' Grid: ', this.SHOW_GRID_LINES)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('X: ', this.X_AXIS_LABEL, ' Y: ', this.Y_AXIS_LABEL)
          .end();
          
      // Use mixin methods for consistent display
      this.addChartDisplayToE(e);
      this.addColorMappingToE(e);
      
      e.end().endContext();
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardStackedBarChartDAOAgent',
  extends: 'foam.core.reflow.GridByDAOAgent',
  mixins: [
    'foam.core.reflow.dashboard.ColorMappingMixin',
    'foam.core.reflow.dashboard.ChartDisplayMixin'
  ],

  requires: [
    'foam.core.reflow.dashboard.DashboardStackedBarSink'
  ],

  properties: [
    // Inherited from GridByDAOAgent: prop1 (yFunc), prop2 (xFunc), sink
    // From mixins: colors, chart display options
    {
      class: 'Boolean',
      name: 'horizontal',
      label: 'Horizontal Stacks',
      value: false
    },
    {
      class: 'String',
      name: 'xAxisLabel',
      label: 'X-Axis Label'
    },
    {
      class: 'String',
      name: 'yAxisLabel',
      label: 'Y-Axis Label'
    },
    {
      class: 'Boolean',
      name: 'showGridLines',
      label: 'Show Grid Lines',
      value: true
    },
    {
      class: 'Boolean',
      name: 'showDataLabels',
      label: 'Show Data Labels',
      value: false
    }
  ],

  methods: [
    function createSink() {
      // Use the sink from parent GridByDAOAgent if provided, otherwise COUNT
      var valueSink = this.sink ? this.sink.createSink() : this.COUNT();
      
      return this.DashboardStackedBarSink.create({
        yFunc: this.prop1,
        xFunc: this.prop2,
        acc: valueSink,
        colors: this.colors,
        horizontal: this.horizontal,
        xAxisLabel: this.xAxisLabel,
        yAxisLabel: this.yAxisLabel,
        showGridLines: this.showGridLines,
        showDataLabels: this.showDataLabels,
        responsive: this.responsive,
        maintainAspectRatio: this.maintainAspectRatio,
        height: this.height,
        showLegend: this.showLegend,
        legendPosition: this.legendPosition,
        showTooltips: this.showTooltips,
        animate: this.animate,
        animationDuration: this.animationDuration
      });
    },
    
    function addToE(e) {
      e.startContext({data: this})
        .start('div').style({padding: '10px'})
          .start('div').style({marginBottom: '10px'})
            .add('Y-Axis: ', this.PROP1, ' X-Axis: ', this.PROP2)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Accumulator: ', this.SINK)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Display: Horizontal: ', this.HORIZONTAL, ' Grid: ', this.SHOW_GRID_LINES)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Data Labels: ', this.SHOW_DATA_LABELS)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('X Label: ', this.X_AXIS_LABEL, ' Y Label: ', this.Y_AXIS_LABEL)
          .end();
          
      // Use mixin methods for consistent display
      this.addChartDisplayToE(e);
      this.addColorMappingToE(e);
      
      e.end().endContext();
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardPieChartDAOAgent',
  extends: 'foam.core.reflow.GroupByDAOAgent',
  mixins: [
    'foam.core.reflow.dashboard.ColorMappingMixin',
    'foam.core.reflow.dashboard.ChartDisplayMixin'
  ],

  requires: [
    'foam.core.reflow.dashboard.DashboardPieSink'
  ],

  properties: [
    // Inherited from GroupByDAOAgent: prop, sink
    // From mixins: colors, groupLimit, sortOrder, includeOthers, chart display
    {
      class: 'Boolean',
      name: 'showPercentages',
      label: 'Show Percentages',
      value: false
    },
    {
      class: 'Float',
      name: 'cutoutPercentage',
      label: 'Cutout %',
      value: 0,
      help: 'For donut effect (0-100)'
    },
    {
      class: 'Boolean',
      name: 'clockwise',
      label: 'Clockwise',
      value: true
    },
    {
      class: 'Float',
      name: 'rotation',
      label: 'Rotation Angle',
      value: -90,
      help: 'Starting angle in degrees'
    },
    {
      class: 'Boolean',
      name: 'showDataLabels',
      label: 'Show Data Labels',
      value: false
    }
  ],

  methods: [
    function createSink() {
      // Create sink with GroupBy configuration inherited from parent
      // Use the sink from parent GroupByDAOAgent if provided, otherwise COUNT
      var valueSink = this.sink ? this.sink.createSink() : this.COUNT();
      
      // Default to DESC sort order for pie charts to show highest values first
      var sink = this.DashboardPieSink.create({
        arg1: this.prop,
        arg2: valueSink,
        groupLimit: this.groupLimit || 10,
        sortOrder: this.sortOrder || this.GroupBySortOrder.DESC,
        includeOthers: this.includeOthers,
        othersLabel: this.othersLabel,
        colors: this.colors,
        showPercentages: this.showPercentages,
        cutoutPercentage: this.cutoutPercentage,
        clockwise: this.clockwise,
        rotation: this.rotation,
        showDataLabels: this.showDataLabels,
        responsive: this.responsive,
        maintainAspectRatio: this.maintainAspectRatio,
        height: this.height,
        showLegend: this.showLegend,
        legendPosition: this.legendPosition,
        showTooltips: this.showTooltips,
        animate: this.animate,
        animationDuration: this.animationDuration
      });

      return sink;
    },
    
    function addToE(e) {
      var self = this;
      e.startContext({data: this})
        .start('div').style({padding: '10px'})
          .start('div').style({marginBottom: '10px'})
            .add('Group By: ', this.PROP, ' Aggregate: ', this.SINK)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Limit: ', this.GROUP_LIMIT, ' Sort: ', this.SORT_ORDER)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Include Others: ', this.INCLUDE_OTHERS)
            .add(self.dynamic(function(includeOthers) {
              if (includeOthers) {
                return this.add(' Label: ', self.OTHERS_LABEL);
              }
            }))
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Show %: ', this.SHOW_PERCENTAGES, ' Data Labels: ', this.SHOW_DATA_LABELS)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Cutout: ', this.CUTOUT_PERCENTAGE, '% Rotation: ', this.ROTATION, '°')
          .end();
          
      // Use mixin methods for consistent display
      this.addChartDisplayToE(e);
      this.addColorMappingToE(e);
      
      e.end().endContext();
    }
  ]
});


// DashboardDonutChartDAOAgent removed - use DashboardPieChartDAOAgent with cutoutPercentage instead

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardLineChartDAOAgent',
  extends: 'foam.core.reflow.AbstractSinkDAOAgent',
  mixins: [
    'foam.core.reflow.dashboard.ColorMappingMixin',
    'foam.core.reflow.dashboard.ChartDisplayMixin'
  ],

  requires: [
    'foam.core.reflow.dashboard.DashboardLineSink',
    'foam.core.reflow.dashboard.TimeUnit',
    'foam.mlang.sink.GroupBy'
  ],

  properties: [
    {
      name: 'xProp',
      label: 'X Property',
      view: function(_, X) {
        return { 
          class: 'foam.core.reflow.PropertyChoiceView', 
          forCls: X.data.dao.of
        };
      }
    },
    {
      name: 'yProp', 
      label: 'Y Property',
      view: function(_, X) {
        return { 
          class: 'foam.core.reflow.PropertyChoiceView', 
          forCls: X.data.dao.of
        };
      }
    },
    {
      name: 'groupBy',
      label: 'Group By (Multiple Lines)',
      help: 'Optional: Group data by this property to create multiple lines',
      view: function(_, X) {
        return { 
          class: 'foam.core.reflow.PropertyChoiceView', 
          forCls: X.data.dao.of
        };
      }
    },
    {
      name: 'aggregationSink',
      label: 'Aggregation',
      view: { class: 'foam.core.reflow.SinkView', choice: 'Average' },
      help: 'How to aggregate Y values when grouping'
    },
    {
      class: 'Enum',
      of: 'foam.core.reflow.dashboard.TimeUnit',
      name: 'timeUnit',
      label: 'Time Unit',
      value: 'DAY',
      help: 'Time unit for X-axis when using date/time properties',
      visibility: function(xProp) {
        return xProp && (foam.lang.Date.isInstance(xProp) || foam.lang.DateTime.isInstance(xProp)) ? 
          foam.u2.DisplayMode.RW : 
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'xAxisLabel',
      label: 'X-Axis Label'
    },
    {
      class: 'String',
      name: 'yAxisLabel',
      label: 'Y-Axis Label'
    },
    {
      class: 'Boolean',
      name: 'fill',
      label: 'Fill Area',
      value: false
    },
    {
      class: 'Float',
      name: 'tension',
      label: 'Line Tension',
      value: 0.1,
      help: 'Bezier curve tension (0 = straight lines)'
    },
    {
      class: 'Boolean',
      name: 'stepped',
      label: 'Stepped Line',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showPoints',
      label: 'Show Points',
      value: true
    },
    {
      class: 'Float',
      name: 'pointRadius',
      label: 'Point Radius',
      value: 3,
      visibility: function(showPoints) {
        return showPoints ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'showGridLines',
      label: 'Show Grid Lines',
      value: true
    }
  ],

  methods: [
    function createSink() {
      if ( ! this.xProp || ! this.yProp ) {
        return this.ArraySink.create();
      }
      
      return this.DashboardLineSink.create({
        xProp: this.xProp,
        yProp: this.yProp,
        groupBy: this.groupBy,
        aggregationSink: this.aggregationSink,
        timeUnit: this.timeUnit,
        colors: this.colors,
        xAxisLabel: this.xAxisLabel,
        yAxisLabel: this.yAxisLabel,
        fill: this.fill,
        tension: this.tension,
        stepped: this.stepped,
        showPoints: this.showPoints,
        pointRadius: this.pointRadius,
        showGridLines: this.showGridLines,
        responsive: this.responsive,
        maintainAspectRatio: this.maintainAspectRatio,
        height: this.height,
        showLegend: this.showLegend,
        legendPosition: this.legendPosition,
        showTooltips: this.showTooltips,
        animate: this.animate,
        animationDuration: this.animationDuration
      });
    },
    
    function value(s) {
      return s;
    },
    
    function addToE(e) {
      var self = this;
      e.startContext({data: this})
        .start('div').style({padding: '10px'})
          .start('div').style({marginBottom: '10px'})
            .add('X: ', this.X_PROP, ' Y: ', this.Y_PROP)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Group By: ', this.GROUP_BY || 'None')
            .add(self.dynamic(function(groupBy) {
              if (groupBy) {
                return this.add(' Aggregate: ', self.AGGREGATION_SINK);
              }
            }))
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Time Unit: ', this.TIME_UNIT)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Fill: ', this.FILL, ' Tension: ', this.TENSION, ' Stepped: ', this.STEPPED)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Points: ', this.SHOW_POINTS)
            .add(self.dynamic(function(showPoints) {
              if (showPoints) {
                return this.add(' Radius: ', self.POINT_RADIUS);
              }
            }))
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('X Label: ', this.X_AXIS_LABEL, ' Y Label: ', this.Y_AXIS_LABEL)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Grid: ', this.SHOW_GRID_LINES)
          .end();
          
      // Use mixin methods for consistent display
      this.addChartDisplayToE(e);
      this.addColorMappingToE(e);
      
      e.end().endContext();
    }
  ]
});

foam.CLASS({
  package: 'foam.core.reflow.dashboard',
  name: 'DashboardMetricDAOAgent',
  extends: 'foam.core.reflow.AbstractSinkDAOAgent',

  requires: [
    'foam.core.reflow.dashboard.DashboardMetricSink',
    'foam.core.reflow.dashboard.MetricOperation'
  ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.core.reflow.dashboard.MetricOperation',
      name: 'operation',
      label: 'Operation',
      value: 'COUNT'
    },
    {
      name: 'prop',
      label: 'Property',
      view: function(_, X) {
        return { 
          class: 'foam.core.reflow.PropertyChoiceView', 
          forCls: X.data.dao ? X.data.dao.of : X.data.of
        };
      },
      visibility: function(operation) {
        // FOAM makes this reactive automatically when operation changes
        return operation && operation.name !== 'COUNT' ? 
          foam.u2.DisplayMode.RW : 
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'label',
      label: 'Display Label',
      value: 'Metric'
    },
    {
      class: 'Boolean',
      name: 'showCount',
      label: 'Show Record Count',
      value: true,
      help: 'Display how many records were used in the calculation'
    },
    {
      class: 'String',
      name: 'valueColor',
      label: 'Value Color',
      help: 'Color for the metric value (CSS color or token)',
      view: 'foam.u2.view.ColorEditView'
    },
    {
      class: 'String',
      name: 'unit',
      label: 'Unit',
      help: 'Unit to display after value (e.g., $, %, ms)'
    },
    {
      class: 'Int',
      name: 'decimalPlaces',
      label: 'Decimal Places',
      value: 0,
      help: 'Number of decimal places to show'
    }
  ],

  methods: [
    function createSink() {
      return this.DashboardMetricSink.create({
        operation: this.operation,
        prop: this.prop,
        label: this.label,
        showCount: this.showCount,
        valueColor: this.valueColor,
        unit: this.unit,
        decimalPlaces: this.decimalPlaces
      });
    },
    
    function addToE(e) {
      var self = this;
      e.startContext({data: this})
        .start('div').style({padding: '10px'})
          .start('div').style({marginBottom: '10px'})
            .add('Operation: ', this.OPERATION)
            .add(self.dynamic(function(operation) {
              // Only show Property field when operation is not COUNT
              if (operation && operation.name !== 'COUNT') {
                return this.add(' Property: ', self.PROP);
              }
            }))
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Label: ', this.LABEL, ' Unit: ', this.UNIT)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Show Count: ', this.SHOW_COUNT)
          .end()
          .start('div').style({marginBottom: '10px'})
            .add('Decimals: ', this.DECIMAL_PLACES, ' Color: ', this.VALUE_COLOR)
          .end()
        .end()
      .endContext();
    }
  ]
});
