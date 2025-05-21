foam.POM({
  name: '{domain}',
  // excludes: [ 'build', 'foam3', 'deployment', 'node_modules', 'tools'],
  excludes: [ '*' ],
  projects: [
    { name: 'foam3/pom'},
    { name: 'src/{packagePath}/pom'}
  ],
  licenses: `
    // Add your license header here
  `,
  envs: {
    VERSION: '1.0.0',
    // javaMainArgs: 'spid:{domain}'
  },
  tasks: [
    function javaManifest() {
      JAVA_MANIFEST_VENDOR_ID = '{package}';
    }
  ]
});
