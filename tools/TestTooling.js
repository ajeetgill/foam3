/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: 'test',
  envs: {
    BENCHMARK:         ['Run benchmarks when true',false],
    BENCHMARKS:        ['Set of benchmarks to run, run all when empty'],
    DELETE_RUNTIME_JOURNALS: ['Delete application journals',false],
    TEST:              ['Run test cases',false],
    TESTS:             ['Set of test cases to run. Run all when empty']
  },

  args: {
    b: [ 'run all benchmarks.',
         () => {
           BENCHMARK = true;
           DELETE_RUNTIME_JOURNALS = true;
           APP_ROOT = '/tmp';
         } ],
    B: [ 'benchmarkId1,benchmarkId2,... : Run listed benchmarks.',
         args => { ARGS.b[1](); BENCHMARKS = args; } ],
    t: [ 'Run All tests.',
         args => {
           TEST = true;
           DELETE_RUNTIME_JOURNALS = true;
           // FIXME: this.comma undefined, see buildlib.js:281
           // JOURNALS = this.comma(JOURNALS, 'test');
           JOURNALS = EXPORTS.comma(JOURNALS, 'test');
           APP_ROOT='/tmp';
         } ],
    T: [ 'testId1,testId2,... : Run listed tests.',
         args => {
           ARGS.t[1]();
           TESTS = args;
         } ]
  },

  tasks: {
    clean: ['Set Java environmental variables specific to running test cases.', [], function clean() {
      if ( TEST || BENCHMARK ) {
        this.rmdir(APP_HOME);
      }
    }]
  }
});
