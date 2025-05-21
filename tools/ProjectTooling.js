/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: 'project',
  description: 'Options and Tasks to create a new project using FOAM',

  tasks: {
    createProject: ['create-project', 'Create directories and creates root and src/ POMs for a new FOAM based project', [], function createProject(arg) {
      var dir = process.cwd();
      var name = arg;

      // if called from foam3/ directory, move up one level.
      var currentDirName = dir.substring(dir.lastIndexOf('/')+1);
      if ( currentDirName === 'foam3' ) {
        dir = dir.substring(0, dir.lastIndexOf('/'));
      }

      if ( ! name ) {
        name = dir.substring(dir.lastIndexOf('/')+1);
      }

      console.log(`[Project] creating project ${name} at ${dir}`);

      // default directories layout
      this.ensureDir(`${dir}/src`);
      this.ensureDir(`${dir}/journals`);
      this.ensureDir(`${dir}/tools`);
      this.ensureDir(`${dir}/deployment/${name}`, { recursive: true });

      function writeOutput(fn, output) {
        console.log(`[Project] creating file ${fn}`);
        if ( ! this.existsSync(fn) ) {
          this.writeFileSync(fn, output.join('\n'));
        } else {
          this.warning(`[Project] file already exists: ${fn}`);
        }
      }

      // create root pom
      var output = [];
      output.push('foam.POM({');
      output.push(`  name: '${name}'`);
      output.push(`  excludes: [ 'build', 'foam3', 'deployment', 'node_modules']`);
      output.push('  projects: [');
      output.push(`    { name: 'foam3/pom'},`);
      output.push(`  //  { name: 'src/package/pom'}`);
      output.push('  ]');
      output.push('})');
      writeOutput.bind(this, `${dir}/pom.js`, output)();

      // create src pom
      output = [];
      output.push('foam.POM({');
      output.push(`  name: 'src',`);
      output.push('  files: [');
      output.push('  ]');
      output.push('})');
      writeOutput.bind(this, `${dir}/src/pom.js`, output)();
    }],

    usage: ['usage', 'Example usage', [], function usage() {
      console.log('./build.sh -TProject --createProject:foo');
    }]
  }
});
