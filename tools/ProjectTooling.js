/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
   Support for creating new FOAM based projects.
   usage: node foam3/tools/build.js -TProject --createProject:net.foo
 */
foam.POM({
  name: 'project',
  description: 'Options and Tasks to create a new project using FOAM',

  tasks: {
    createProject: ['create-project', 'Create directories and creates root and src/ POMs for a new FOAM based project', [], function createProject(arg) {
      var dir = process.cwd();
      // if called from foam3/ directory, move up one level.
      if ( dir.substring(dir.lastIndexOf('/')+1) === 'foam3' ) {
        dir = dir.substring(0, dir.lastIndexOf('/'));
      }

      var name = arg;
      if ( ! name ) {
        name = dir.substring(dir.lastIndexOf('/')+1);
      }

      var tld, domain, packagePath;
      if ( name.indexOf('.') > 1 ) {
        [tld, domain] = name.split('.');
        if ( domain ) {
          packagePath = this.join(tld, domain);
        }
      }

      console.log(`[Project] creating project ${domain} at ${dir}`);

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
      output.push(`  name: '${domain}',`);
      output.push(`  excludes: [ 'build', 'foam3', 'deployment', 'node_modules'],`);
      output.push('  projects: [');
      output.push(`    { name: 'foam3/pom'},`);
      output.push(`    { name: 'src/${packagePath}/pom'}`);
      output.push('  ],');
      output.push(`  licenses: \``);
      output.push('    // Add your license header here');
      output.push(`  \`,`);
      output.push('  envs: {');
      output.push(`    // javaMainArgs: 'spid:${domain}'`);
      output.push('  },');
      if ( tld && domain ) {
        output.push(`  tasks: [`);
        output.push('    function javaManifest() {');
        output.push(`      JAVA_MANIFEST_VENDOR_ID = '${name}';`);
        output.push('    }');
        output.push('  ]');
      }
      output.push('});');
      writeOutput.bind(this, `${dir}/pom.js`, output)();

      // create src pom
      this.ensureDir(`${dir}/src/${packagePath}`);
      output = [];
      output.push('foam.POM({');
      output.push(`  name: 'src/${packagePath}',`);
      output.push('  files: [');
      output.push('  ]');
      output.push('});');
      writeOutput.bind(this, `${dir}/src/${packagePath}/pom.js`, output)();

      // default deployment pom
      this.ensureDir(`${dir}/deployment/${domain}`, { recursive: true });
      output = [];
      output.push('foam.POM({');
      output.push(`  name: '${domain}'`);
      output.push('});');
      writeOutput.bind(this, `${dir}/deployment/${domain}/pom.js`, output)();

      // test deployment pom
      this.ensureDir(`${dir}/deployment/test`, { recursive: true });
      output = [];
      output.push('foam.POM({');
      output.push(`  name: 'test'`);
      output.push('});');
      writeOutput.bind(this, `${dir}/deployment/test/pom.js`, output)();

      // Additional directories and poms
      this.ensureDir(`${dir}/journals`);
      output = [];
      output.push('foam.POM({');
      output.push(`  name: 'journals'`);
      output.push('});');
      writeOutput.bind(this, `${dir}/journals/pom.js`, output)();
    }],

    usage: ['usage', 'Example usage', [], function usage() {
      console.log('./build.sh -TProject --createProject:net.foo');
    }]
  }
});
