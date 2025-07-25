foam.CLASS({
  package: 'foam.lib.csv',
  name: 'PropertyFromCSV',
  refines: 'foam.lang.Property',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str);
      }
    }
  ]
});
foam.CLASS({
  name: 'IntFromCSVRefines',
  refines: 'foam.lang.Int',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str?.replace(/,/g, ''));
      }
    }
  ]
});

foam.CLASS({
  name: 'FloatFromCSVRefines',
  refines: 'foam.lang.Float',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str?.replace(/,/g, ''));
      }
    }
  ]
});

foam.CLASS({
  name: 'LongFromCSVRefines',
  refines: 'foam.lang.Long',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str?.replace(/,/g, ''));
      }
    }
  ]
});

foam.CLASS({
  name: 'DoubleFromCSVRefines',
  refines: 'foam.lang.Double',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str?.replace(/,/g, ''));
      }
    }
  ]
});