/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const fs       = require('fs');
const { comma, copyDir, copyFile, emptyDir, ensureDir, exec, execSync, exportEnvs, info, rmdir, rmfile, warning } = require('./buildlib');

foam.POM({
  name: 'standard',
  envs: {
    APP_HOME:          ['Application root directory. To symultaniously deploy multiple applications, give each a unique APP_NAME and WEB_PORT',() => APP_ROOT + '/' + APP_NAME],
    APP_NAME:          ['Application name. Defaults to \'name\' in root pom.'],
    APP_ROOT:          ['Application root directory','/opt'],
    CLEAN:             ['Clean generated code before building.  Required if generated classes have been removed. Use -XcleanAll to remove build/ directory. NOTE: if compilation fails after option c is issued, clean is again required until a succesful build.',false],
    CLEAN_ALL:         ['Clean application lib/, and remove build/ directory',false],
    PROJECT:           ['Top-Level Loaded POM Object, not be be confused with POMS, which is the name of POM(s) to be loaded']
  },

  args: {
    c: [ 'Clean generated code before building.  Required if generated classes have been removed. Use -XcleanAll to remove build/ directory. NOTE: if compilation fails after option c is issued, clean is again required until a succesful build.',
         () => CLEAN = true ]
  },

  tasks: {
    appName: ['Show application information.', ['pomEnvs'], function appName() {
      console.log(`Application Name: ${APP_NAME}`);
    }],

    clean: ['Remove generated files', ['pomEnvs'], function clean() {
      console.log('[StandardTooling] clean');
      if ( fs.existsSync(BUILD_DIR) ) {
        var files = fs.readdirSync(BUILD_DIR, {withFileTypes: true});
        files.forEach(f => {
          if ( f.name === 'lib' ) return; // handled via cleanLib

          var fn = BUILD_DIR + '/' + f.name;
          if ( f.isDirectory() ) rmdir(fn);
          if ( f.isFile()      ) rmfile(fn);
        });
      }
    }],

    cleanAll: ['Clean build files, include pom.xml and java libraries. Cleaner than clean.', [ 'clean' ], function cleanAll() {
      console.log('[StandardTooling] cleanAll');
    }],

    usage: ['Build usage examples', [], function usage() {
      console.log('./build.sh -c');
      console.log('    Remove previously generated code, before rebuilding.');
      console.log('./build.sh -cj');
      console.log('    Remove previously generated code and runtime journals, before rebuilding.');
      console.log('./build.sh -XcleanAll,all');
      console.log('    Perform an extra deep clean before building normally.');
      console.log('./build.sh -Htopic');
      console.log('    Print usage for \'topic\'. Ex: ./build.sh -HcleanAll  or  ./xobuild.sh -Ha');
    }],

    // ############################
    // # Build steps
    // ############################
    all: ['Build everything specified by flags.', ['pomEnvs'], function all() {
      if ( ! ( TAR || BUILD_ONLY ) ) {
        this.execute('stopCORE');
      }

      if ( ! RESTART ) {
        if ( CLEAN_ALL ) {
          this.execute('cleanAll');
        } else if ( CLEAN ) {
          this.execute('clean');
        }
        if ( TEST || BENCHMARK ) {
          this.execute('clean');
        } else if ( DELETE_RUNTIME_JOURNALS ) {
          this.execute('deleteRuntimeJournals');
        }

        if ( TAR ) {
          this.execute('buildTar');
        } else if ( JAR || TEST || BENCHMARK ) {
          // Tests and benchmarks run from an application jar
          this.execute('buildJar');
        } else {
          this.execute('genJava');
        }
      }

      if ( ! ( TAR || BUILD_ONLY ) ) {
        if ( ! JAR || TEST || BENCHMARK ) {
          this.execute('startCORE');
        } else {
          this.execute('startCOREJar');
        }
      }
    }]
  }
});
