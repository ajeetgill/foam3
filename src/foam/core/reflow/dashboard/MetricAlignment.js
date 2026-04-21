/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.core.reflow.dashboard',
  name: 'MetricAlignment',
  
  documentation: 'Alignment options for metric display',

  properties: [
    {
      class: 'String',
      name: 'alignmentStyle'
    },
    {
      class: 'String',
      name: 'textAlign'
    },
    {
      class: 'String',
      name: 'paddingSide',
      documentation: 'Chart.js layout.padding key that shifts an element AWAY from this alignment (LEFT → pad right, RIGHT → pad left, CENTER → none).'
    }
  ],

  values: [
    {
      name: 'LEFT',
      label: 'Left',
      alignmentStyle: 'flex-start',
      textAlign: 'left',
      paddingSide: 'right'
    },
    {
      name: 'CENTER',
      label: 'Center',
      alignmentStyle: 'center',
      textAlign: 'center',
      paddingSide: ''
    },
    {
      name: 'RIGHT',
      label: 'Right',
      alignmentStyle: 'flex-end',
      textAlign: 'right',
      paddingSide: 'left'
    }
  ]
});