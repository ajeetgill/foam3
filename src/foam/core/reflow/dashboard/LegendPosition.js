/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.core.reflow.dashboard',
  name: 'LegendPosition',

  documentation: 'Legend position options for charts',

  properties: [
    {
      class: 'String',
      name: 'chartJsName',
      documentation: 'Lowercase name passed to Chart.js legend.position.'
    },
    {
      class: 'String',
      name: 'cssSide',
      documentation: 'Chart.js layout.padding key for the side the legend occupies. Used to reserve minimum legend width via padding.'
    }
  ],

  values: [
    { name: 'TOP',    label: 'Top',    chartJsName: 'top',    cssSide: 'top' },
    { name: 'RIGHT',  label: 'Right',  chartJsName: 'right',  cssSide: 'right' },
    { name: 'BOTTOM', label: 'Bottom', chartJsName: 'bottom', cssSide: 'bottom' },
    { name: 'LEFT',   label: 'Left',   chartJsName: 'left',   cssSide: 'left' },
    // { name: 'CHARTAREA', label: 'Chart Area' }
  ]
});