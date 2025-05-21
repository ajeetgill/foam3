/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
   Support for creating new FOAM based projects.
   usage: node foam3/tools/build.js -Tproject/standard/Project --createProject:net.foo
 */
foam.POM({
  name: 'project',
  description: 'Options and Tasks to create a new project using FOAM',

  tasks: {
    createProject: ['create-project', 'Create directories and creates root and src/ POMs for a new FOAM based project', [], function createProject(arg) {
      var dir = process.cwd();
      let templateDir = __dirname;
      console.log(`[Project] dir: ${dir}`);
      console.log(`[Project] templateDir: ${templateDir}`);
      // process.exit(0);

      // if called from foam3/ directory, move up one level.
      if ( dir.substring(dir.lastIndexOf('/')+1) === 'foam3' ) {
        dir = dir.substring(0, dir.lastIndexOf('/'));
      }

      var name = arg;
      if ( ! name ) {
        name = dir.substring(dir.lastIndexOf('/')+1);
      }

      var tld, domain, subDomain, SubDomain, package, packagePath;
      if ( name.indexOf('.') > 1 ) {
        [tld, domain, subDomain] = name.split('.');
        if ( domain ) {
          package = tld + '.' + domain;
          packagePath = this.join(tld, domain);
        } else {
          domain = name;
          package = name;
          packagePath = name;
        }
        if ( subDomain ) {
          SubDomain = subDomain[0].toUpperCase() + subDomain.substring(1);
        }
      } else {
        domain = name;
        package = name;
        packagePath = name;
      }

      console.log(`[Project] creating project ${domain} at ${dir}`);

      function readWrite(inDir, templateFn, outDir, outFn = 'pom.js') {
        let fn = this.join(inDir, templateFn);
        if ( ! this.existsSync(fn) ) {
          this.error(`[Project] template not found ${fn}`);
        }
        var text = this.readFileSync(fn).toString();
        if ( ! text ) {
          this.error(`[Project] template file empty ${fn}`);
        }

        text = text.replaceAll("{name}", name);
        text = text.replaceAll("{tld}", tld);
        text = text.replaceAll("{domain}", domain);
        text = text.replaceAll("{subDomain}", subDomain);
        text = text.replaceAll("{SubDomain}", SubDomain);
        text = text.replaceAll("{package}", package);
        text = text.replaceAll("{packagePath}", packagePath);

        fn = this.join(outDir, outFn);
        console.log(`[Project] creating file ${fn}`);
        if ( ! this.existsSync(fn) ) {
          this.ensureDir(outDir);
          this.writeFileSync(fn, text);
        } else {
          this.warning(`[Project] file already exists: ${fn}`);
        }
      }

      // create root pom
      readWrite.bind(this, templateDir, 'rootPOM.js', `${dir}`)();

      // create src pom
      if ( ! subDomain ) {
        readWrite.bind(this, templateDir, 'srcPOM.js', `${dir}/src/${packagePath}`, 'pom.js')();
      } else {
        readWrite.bind(this, templateDir, 'srcSubDomainPOM.js', `${dir}/src/${packagePath}`, 'pom.js')();
      }
      // default deployment pom
      readWrite.bind(this, templateDir, 'deploymentDomainPOM.js', `${dir}/deployment/${domain}`, 'pom.js')();

      // test deployment pom
      readWrite.bind(this, templateDir, 'testPOM.js', `${dir}/deployment/test`, 'pom.js')();

      // Additional directories and poms
      readWrite.bind(this, templateDir, 'emptyPOM.js', `${dir}/journals`, 'pom.js')();

      // this.execSync('sudo chown -R $USER /opt')

      if ( subDomain) {
        readWrite.bind(this, templateDir, 'modelSubDomain.js', `${dir}/src/${packagePath}`, `${SubDomain}.js`)();
        readWrite.bind(this, templateDir, 'deploymentDomainGroups.jrl', `${dir}/deployment/${domain}`, `groups.jrl`)();
        readWrite.bind(this, templateDir, 'deploymentDomainGroupPermissionJunctions.jrl', `${dir}/deployment/${domain}`, `groupPermissionJunctions.jrl`)();
        readWrite.bind(this, templateDir, 'deploymentSubDomainPOM.js', `${dir}/deployment/${subDomain}`, 'pom.js')();
        readWrite.bind(this, templateDir, 'deploymentSubDomainMenus.jrl', `${dir}/deployment/${subDomain}`, `menus.jrl`)();
        readWrite.bind(this, templateDir, 'deploymentSubDomainServices.jrl', `${dir}/deployment/${subDomain}`, `services.jrl`)();
        readWrite.bind(this, templateDir, 'deploymentSubDomainGroupPermissionJunctions.jrl', `${dir}/deployment/${subDomain}`, `groupPermissionJunctions.jrl`)();
        readWrite.bind(this, templateDir, 'deploymentDomainUsers.jrl', `${dir}/deployment/${domain}`, `users.jrl`)();

        readWrite.bind(this, templateDir, 'run.sh', `${dir}/deployment/${subDomain}`, `run.sh`)();
        this.execSync(`chmod u+x ${dir}/deployment/${subDomain}/run.sh`);
      }
    }],

    usage: ['usage', 'Example usage', [], function usage() {
      console.log('./build.sh -TProject --createProject:net.foo.demo');
    }]
  }
});
