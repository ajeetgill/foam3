foam.CLASS({
  package: 'foam.lib.csv',
  name: 'PropertyFromCSV',
  refines: 'foam.lang.Property',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return prop.fromString(str);
      }
    }
  ]
});
foam.POM({
  name: 'IntFromCSVRefines',
  refines: 'foam.lang.Int',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str ? str.replace(/,/g, '') : str);
      }
    }
  ]
});

foam.POM({
  name: 'FloatFromCSVRefines',
  refines: 'foam.lang.Float',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str ? str.replace(/,/g, '') : str);
      }
    }
  ]
});

foam.POM({
  name: 'LongFromCSVRefines',
  refines: 'foam.lang.Long',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str ? str.replace(/,/g, '') : str);
      }
    }
  ]
});

foam.POM({
  name: 'DoubleFromCSVRefines',
  refines: 'foam.lang.Double',
  properties: [
    {
      class: 'Function',
      name: 'fromCSV',
      value: function(str) {
        return this.fromString(str ? str.replace(/,/g, '') : str);
      }
    }
  ]
});