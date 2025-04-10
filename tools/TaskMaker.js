/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

exports.description = 'Register POM tasks for later execution.';

exports.visitPOM = function(pom) {
  if ( ! pom.tasks ) return;
  console.log('pom.task', pom.tasks);
  pom.tasks.forEach(t => {
    console.log(`[Task Maker] registering ${t.name} from ${pom.name}`, t.toString());
    console.log('[Task Maker] invoke function t', t);
    try {
      console.log(t('joel'));
    } catch (e) {
      console.error(e);
    }
    var tasks = process.env.POM_TASKS; // || {};
    console.log('typeof POM_TASKS', typeof tasks);
    tasks = process.env.PM; // || {};
    console.log('typeof PM', typeof tasks);
    var list = tasks.get(t.name) || [];
    console.log('typeof list', typeof list);
    list.push(t);
    console.log('length', list.length);
    tasks.set(t.name, list);

    list = tasks.get(t.name);
    let f = list[0];
    console.log('[Task Maker] invoke function f', f);
    try {
      console.log(f('joel'));
    } catch (e) {
      console.error(e);
    }
    // process.env.POM_TASKS = tasks;
  });
};
