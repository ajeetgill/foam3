/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Min',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which remembers the minimum value put().',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, s) {
        if ( ! this.hasOwnProperty('value') || foam.util.compare(this.value, this.arg1.f(obj) ) > 0) {
          this.value = this.arg1.f(obj);
        }
      },
      javaCode: `if ( getValue() == null || ((Comparable)getArg1().f(obj)).compareTo(getValue()) < 0 ) {
  setValue(getArg1().f(obj));
}`
    },
    {
      name: 'reduce',
      args: 'foam.mlang.sink.Min sink',
      type: 'foam.mlang.sink.Min',
      code: function reduce(sink) {
        if ( ! sink || ! sink.hasOwnProperty('value') ) return this;
        if ( ! this.hasOwnProperty('value') ) {
          this.value = sink.value;
          return this;
        }
        
        if ( foam.util.compare(sink.value, this.value) < 0 ) {
          this.value = sink.value;
        }
        return this;
      },
      javaCode: `
if (sink == null || ((Min) sink).getValue() == null) return this;
if (getValue() == null) {
  setValue(((Min) sink).getValue());
  return this;
}

if (((Comparable) ((Min) sink).getValue()).compareTo(getValue()) < 0) {
  setValue(((Min) sink).getValue());
}
return this;
      `
    },
    function toSummary() { return this.value; },
    function addToE(e) { e.add(this.value); }
  ]
});
