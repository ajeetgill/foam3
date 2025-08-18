foam.POM({
  name: 'dashboard',
  files: [
    { name: 'MetricOperation',         flags: 'js' },
    { name: 'MetricAlignment',         flags: 'js|java' },

    { name: 'LegendPosition',          flags: 'js|java' },
    { name: 'DashboardSinks',          flags: 'js' },
    { name: 'DashboardDAOAgents',      flags: 'js' },

    { name: 'TimeUnit',                flags: 'js|java' },
  ]
});