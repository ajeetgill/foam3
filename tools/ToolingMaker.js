/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const { info, warning, error } = require('./buildlib');
const envs   = {};
const args   = {};
const tasks  = {};

exports.description = 'Assemble build environment.';

exports.visitPOM = function(pom) {
  pom.envs &&
    Object.keys(pom.envs).forEach(k => {
      if ( ! envs[k] ) {
        envs[k] = pom.envs[k];
      } else {
        warning(`[Tooling] duplicate env '${k}\' ignored from pom '${pom.name}'`);
      }
    });

  pom.args &&
    Object.keys(pom.args).forEach(k => {
      if ( ! args[k] ) {
        args[k] = pom.args[k];
      } else {
        warning(`[Tooling] duplicate arg '${k}' ignored from pom '${pom.name}'`);
      }
    });

  // NOTE: build.js managing tasks and POM_TASKS duplications
  pom.tasks &&
    Object.keys(pom.tasks).forEach(k => {
      let list = tasks[k] || [];
      list.push(pom.tasks[k]);
      tasks[k] = list;
      // console.log('[Tooling]', k, tasks[k]);
    });
};

exports.envs  = envs;
exports.args  = args;
exports.tasks = tasks;
