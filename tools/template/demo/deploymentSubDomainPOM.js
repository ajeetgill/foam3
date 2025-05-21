foam.POM({
  name: '{subDomain}',
  description: 'Journal configuration specific to {subDomain} deployment',
  projects: [
    { name: '../{domain}/pom' }
  ]
});
