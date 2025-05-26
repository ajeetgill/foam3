foam.CLASS({
  package: '{package}.test',
  name: '{Model}Test',
  extends: 'foam.core.test.Test',

  javaImports: [
    '{package}.*',
    'foam.dao.DAO',
    'foam.lang.X'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        var {model} = new {Model}();
        test ( {model}.getId() == 0, "ID empty before create");
        {model} = ({Model}) ((DAO) x.get("{model}DAO")).put({model});
        test ( {model}.getId() > 0, "ID set after create");
      `
    }
  ]
});
