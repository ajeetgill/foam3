/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// const pmake    = require('./pmake.js');
// const { comma, copyDir, copyFile, emptyDir, ensureDir, exec, execSync, exportEnvs, flag, info, rmdir, rmfile, warning } = require('./buildlib');

foam.POM({
  name: 'maven',

  tasks: {
    cleanLib: ['Remove pom.xml and java lib directory.', [], function cleanLib() {
      this.rmfile('pom.xml');
      this.emptyDir(BUILD_DIR + '/lib');
    }],
    maven: ['Run Maven', [], function maven() {
      this.pmake.bind(this, `-makers=Maven -flags=${flag()} -pom=${POMS} -libdir=${BUILD_DIR}/lib`)();
    }],

    checkDeps: ['Check Java dependencies for known vulnerabilities (via Maven). -XcheckDeps:score where score in range [0..11].  CVSS score (LOW:0..5 ,MEDIUM:5..7 ,HIGH:7..9 ,CRITICAL:9..10,IGNORE:11)', ['maven'], function checkDeps(score) {
  score = score || 9;
  try {
    this.execSync(`mvn dependency-check:check -DfailBuildOnCVSS=${score}`, { stdio: 'inherit' });
  } catch (_) {
    // maven build error will be output to the console, no need to throw
  }
    }],

    showJARs: ['Show JAR structure.', ['maven'], function showJARs(value) {
      try {
        this.execSync(`mvn dependency:tree `, { stdio: 'inherit' });
      } catch (_) {
        // maven build error will be output to the console, no need to throw
      }
    }],

    mavenGetSources: ['Get Maven java sources.', ['maven'], function mavenGetSources(value) {
      try {
        this.execSync(`mvn dependency:resolve-sources -DincludeArtifactIds=${value} `, { stdio: 'inherit' });
      } catch (_) {
        // maven build error will be output to the console, no need to throw
      }
    }]
  }
});
