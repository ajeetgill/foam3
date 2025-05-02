/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const tasks = {};

exports.description = 'Register POM tasks for later execution.';

exports.visitPOM = function(pom) {
  if ( ! pom.tasks ) return;

  pom.tasks.forEach(t => {
    verbose(`[Task] registering task ${t.name} from ${pom.name}`);
    var task = tasks[t.name] || [];
    task.push(t);
    tasks[t.name] = task;
  });
};

exports.end = function() {
  let count = Object.keys(tasks).length;
  console.log(`[Task] Registered ${count} tasks`);
};

exports.tasks = tasks;
