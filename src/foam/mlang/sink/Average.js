/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Average',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which averages put() values.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'Double',
      name: 'value',
      value: 0
    },
    {
      class: 'Long',
      name: 'count',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) {
        this.count++;
        this.value = ( this.value * (this.count-1) + this.arg1.f(obj) ) / this.count;
      },
      javaCode: `
setCount(getCount() + 1);
setValue((getValue() * ( getCount()-1) + ((Number)this.getArg1().f(obj)).doubleValue()) / getCount());
      `,
    },
    {
      name: 'reduce',
      args: 'foam.mlang.sink.Average sink',
      type: 'foam.mlang.sink.Average',
      code: function reduce(sink) {
        if ( ! sink || sink.count === 0 ) return this;
        if ( this.count === 0 ) {
          this.value = sink.value;
          this.count = sink.count;
          return this;
        }
        
        var totalCount = this.count + sink.count;
        this.value = (this.value * this.count + sink.value * sink.count) / totalCount;
        this.count = totalCount;
        return this;
      },
      javaCode: `
if (sink == null || ((Average) sink).getCount() == 0) return this;
if (getCount() == 0) {
  setValue(((Average) sink).getValue());
  setCount(((Average) sink).getCount());
  return this;
}

long totalCount = getCount() + ((Average) sink).getCount();
double combinedValue = (getValue() * getCount() + ((Average) sink).getValue() * ((Average) sink).getCount()) / totalCount;
setValue(combinedValue);
setCount(totalCount);
return this;
      `
    },
    function toSummary() { return this.value; },
    function addToE(e) { e.add(this.value); }
  ]
});
