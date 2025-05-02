/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: 'profiler',

  envs: {
    PROFILER:          ['Enable JVM profiling',false],
    PROFILER_PORT:     ['Port JVM will listen on for profiler to connect',8849]
  },
  tasks: {
    setRunArgs: ['Set profiler port',[], function setRunArgs() {
      if ( PROFILER ) RUN_ARGS += ` -P${PROFILER_PORT}`;
    }]
  }
});
