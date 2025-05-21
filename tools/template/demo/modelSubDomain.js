foam.CLASS({
  package: '{tld}.{domain}',
  name: '{SubDomain}',

  implements: [
    'foam.core.auth.CreatedAware',
    'foam.core.auth.LastModifiedAware'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Date',
      name: 'date'
    }
  ]
});
