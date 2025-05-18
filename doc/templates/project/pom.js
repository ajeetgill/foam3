foam.POM({
  name: 'yourprojectname',

  version: '1',

  excludes: [ 'build', 'deployment', 'node_modules' ],

  licenses: [
    `
    Copyright 2025 XXX Inc. All Rights Reserved.
    `
  ],

  setFlags: {
    u3: true
  },

  copy: [
    // { source: 'favicon',     targetDir: 'webroot/favicon' }
  ],

  projects: [
    // { name: 'src/com/yourdomain/youproject/yoursubproject/pom' },
  ],

  files: [
    // { name: 'src/com/yourdomain/yourproject/YourModel', flags: 'js|java' }
  ],

  javaFiles: [
    // { name: 'src/com/yourdomain/yourprojet/YourFile.java' }
  ],

  javaDependencies: [
  ]
});
