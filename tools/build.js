#!/usr/bin/env node
/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
// Build and Deploy a FOAM Application
//
// Tools
//   tools/JSMaker.js
//     - collects and minifies .js files into a single foam-bin.js file
//     - uses the UglifyJS library to minimize the size of the packaged .js files
//   tools/JavaMaker.js
//     - generates .java files from .js models
//     - create /build/javacfiles file containing list of modified or static .java files
//     - build pom.xml from accumulated javaDependencies
//     - call maven to update dependencies if pom.xml updated
//     - call javac to compile files in javacfiles
//     - create a Maven pom.xml file with accumulated POM javaDependencies information
//   tools/JournalMaker.js
//     - copies .jrl files into /build/journals
//   tools/DocMaker.js
//     - copies .flow files into /build/documents
//
// Directory Structure:
//   /deployment    - deployment specific journals
//   /build
//     /src         - java source files created by genJava
//     /classes     - compiled java class files created with javac (called by genJava)
//     /classes
//       /documents
//       /images
//       /journals
//     /documents    - All .flow documents are copied here by genJava
//     /journals     - All journal.0 files created by genJava
//     /package      - Designation for .tar.gz files
//     /javacfiles   - A list of all java files to be compiled by javac, created by genJava
//     /lib          - 3rd party java .jar library files created by gradle (or maven)
//     /webroot      - jetty resource base directory for jar build
//   /opt/<pom.name>
//     /bin
//     /etc
//     /logs
//     /documents
//     /journals
//     /lib
//     /saf
//     /var
//
// TODO:
//   - should Makers be responsible for building target directories?

/*
diskutil erasevolume HFS+ RAM_Disk $(hdiutil attach -nomount ram://1000000)
ln -s /Volumes/RAM_DISK /path/to/project/build2

diskutil erasevolume HFS+ 'RAMDisk' `hdiutil attach -nomount ram://848000`
mkdir /Volumes/RamDisk/build
rm -rf ~/foam3/build
ln -s /Volumes/RamDisk/build ~/foam3/build
*/

const { existsSync,  readdirSync, writeFileSync } = require('fs');
const { hostname }                                = require('os');
const { join }                                    = require('path');
const { buildEnv, addOptions, comma, copyDir, copyFile, emptyDir, ensureDir, exec, execSync, exportEnvs, findOption, findSimilarOptions, findTask, findSimilarTasks, flag, hyphenate, info, isExcluded, Option, processBuildArgs, processToolingArgs, rmdir, rmfile, spawn, Task, warning} = require('./buildlib');
const pmake                                       = require('./pmake');

process.on('unhandledRejection', e => {
  error("ERROR: Unhandled promise rejection ", e);
});

var depth   = 1;
var running = {};
var summary = [];
var tasks   = [];

function task() {
  var name, gnuopt, desc, dep, f;
  var task;
  if ( arguments.length == 1 ) {
    task = Object.create(Task, {
      f: arguments[0],
      name: f.name,
      gnuopt: hyphenate(f.name)
    });
    // function
    f = arguments[0];
    name = f.name;
    gnuopt = hyphenate(f.name);
    desc = '';
    dep = [];
  } else if ( arguments.length == 3 ) {
    // desc, dep, function
    f = arguments[2];
    name = f.name;
    gnuopt = hyphenate(f.name);
    desc = arguments[0];
    dep = arguments[1];
  } else if ( arguments.length == 4 ) {
    // genopt, desc, dep, function
    f = arguments[3];
    name = f.name;
    gnuopt = arguments[0];
    desc = arguments[1];
    dep = arguments[2];
  } else if ( arguments.length == 5 ) {
    // name, genopt, desc, dep, function
    name = arguments[0];
    gnuopt = arguments[1];
    desc = arguments[2];
    dep = arguments[3];
    f = arguments[4];
  } else {
    var msg = 'task(): expecting 1, 3, 4, or 5 arguments\n';
    Object.keys(arguments).forEach(key => {
      msg += key +': ' + arguments[key] + '\n';
    });
    error(msg);
  }

  if ( ! tasks[name] ) {
    tasks[name] = [gnuopt, desc, dep, f];
    tasks[name].name = name;
  } else {
    warning(`[build] ignoring duplicate task -  name: ${name}, gnuopt: ${gnuopt}, desc: ${desc}, dep: ${dep}`);
  }

  var fired = false;
  var rec   = [ ];
  var SUPER = globalThis[name] || function() { };
  globalThis[name] = function(...args) {
    if ( fired ) return;
    fired = true;

    running[name] = (running[name] || 0) + 1;
    if ( running[name] === 1 ) {
      summary.push(rec);
      info(`Starting Task :: ${name}`);
      var start = Date.now();
      rec[0] = ''.padEnd(2*depth) + name;
      rec[2] = start;
      depth++;
    }

    // execute task dependencies
    let task = tasks[name];
    let dep = task[2];
    dep.forEach(d => {
      if ( d instanceof Function ) {
        d(...args);
      } else {
        var f = globalThis[d];
        if ( f )
          f(...args);
        else
          error('Task', name, 'dependency not found', d);
      }
    });

    // execute same named pom tasks
    let pomTasks = POM_TASKS && POM_TASKS[name];
    if ( pomTasks ) {
      info(`POM Tasks :: ${name}`);
      if ( ! DRY_RUN ) {
        pomTasks.forEach(k => {
          // FIXME: POM_TASKS has both POM tasks, and extra same named build tasks
          var f = k[3] || k;
          try {
            f.bind(Object.assign({}, EXPORTS))(...args);
          } catch (e) {
            error(`POM Tasks :: ${k}`, '\n', e);
          }
        });
      }
    }

    // execute tasks
    if ( ! DRY_RUN || name == 'pomEvns' || name == 'all' ) {
      f.bind(Object.assign({ SUPER }, EXPORTS))(...args);
    }

    running[name] -= 1;
    if ( running[name] === 0 ) {
      depth--;
      var end = Date.now();
      var dur = ((end-start)/1000).toFixed(1);
      info(`Finished Task :: ${name} in ${dur} seconds`);
      rec[1] = dur;
    }
  };
}

// Execute task by name
function execute(t, args) {
  var f = globalThis[t];
  if ( ! f ) {
    let task = findTask(tasks, t);
    if ( task ) {
      f = globalThis[task.name];
      if ( ! f && task[4] ) {
        f = task[4];
      }
    }
  }
  if ( ! f ) {
    let option = findOption(OPTIONS, t);
    if ( option ) {
      f = globalThis[option.key];
      if ( ! f && option[5] ) {
        f = option[5];
      }
    }
  }
  if ( f ) {
    f(args);
  } else {
    var extra = '';
    if ( t.length > 1 ) {
      let similar = findSimilarTasks(tasks, t);
      if ( similar.length > 0 ) {
        extra += '\n  Possible Task matches: \n';
      }
      similar.forEach(task => {
        extra += '    ' + task.name + ' ' + task[0] + ' - ' + task[1] + '\n';
      });
      similar = findSimilarOptions(OPTIONS, t);
      if ( similar.length > 0 ) {
        extra += '\n  Possible Option matches: \n';
      }
      similar.forEach(option => {
        extra += '    ' + option.key + ' ' + option[0] + ' ' + option[1] + ' - ' + option[3] + '\n';
      });
    }
    error('Task not found - ', t, extra);
  }
}

function showSummary() {
  if ( HELP ) return;

  if ( SHOW_REPORT ) {
    moreUsage();
  }

  var s = '';
  summary.forEach(e => {
    if ( e[1] === undefined ) {
      var end = Date.now();
      var dur = ((end-e[2])/1000).toFixed(1);
      e[1] = dur;
    }
    s += e[0].padEnd(25) + ' ' + e[1].padStart(15) + 's\n';
  });
  if ( s ) {
    info('Execution Summary:\n', s);
  }
}

function quit(code) {
  showSummary();
  if ( code ) {
    console.trace();
  }
  process.exit(code);
}

function error(...args) {
  showSummary();
  let msg = args.join(' ');
  console.log('\x1b[0;31mERROR ::', msg, '\x1b[0;0m');
  process.exit(1);
}

// build pom map and ensure the POMS list is viable
function pom() {
  var poms   = [];
  function addPom(fn) {
    if ( ! existsSync(fn + '.js') )
      error('File not found ' + fn + '.js');
    else
      poms.push(fn);
  };

  if ( ! POMS ) {
    POMS = 'pom';
  }

  var root = false;
  POMS.split(',').forEach(c => {
    addPom(c && `${PROJECT_HOME}/${c}`);
    root = root || c == 'pom';
  });
  // backward compatibility - hithertoo, only the root directory pom
  // was 'require(pom)' to start the build process.  Now, the initial
  // pom can be specified. When not explicitly specified, the first
  // pom will most likely be set to a deployment pom via -J. The build
  // will fail if the foam pom is not specified.
  if ( ! root ) {
    poms.unshift('pom');
    POMS = comma('pom', POMS);
    warning('Added /pom');
  }

  if ( globalThis['JOURNALS'] )
    JOURNALS.split(',').forEach(c => addPom(c && `${PROJECT_HOME}/deployment/${c}/pom`));

  POMS = poms.join(',');
  info('poms', POMS);
  return POMS;
}

// Environment Variables which are exported when updated
var ENVS = {
  BUILD_DIR:         ['Build directory, relative to project root','build'],
  EXPORTS:           ['Build environment variables which will be exported to pom tasks.', {}],
  FLAGS:             ['Flags passed to pmake. ex. verbose, test, ... '],
  HOST_NAME:         ['Hostname set in JVM', () => hostname()],
  OPTIONS:           ['Build options determined during tooling which can be configured to by CLI and POM arguments to control the build', {}],
  POM_ENVS:          ['Supports translating top level POM parameters to build parameters, such as pom.name -> APP_NAME, pom.version -> VERSION.  Also provides legacy support to POMs still using top level POM parametes for Java Manifest and Javac Parameters. Java Manifest property \'vendor\' should be set in POM task \'javaManifest\' and \'java\' should be set in POM task \'javacParameters\'.', 'APP_NAME=name,VERSION=version,JAVA_RELEASE=java,JAVA_MANIFEST_VENDOR=vendor'],
  POM_TASKS:         ['Map of named tasks captured from build POMs. Will be executed when same named build task is executed.', []],
  PROJECT:           ['Top-Level Loaded POM Object, not be be confused with variable \'POMS\', which is the name of the POM(s) to be processed by the build'],
  PROJECT_HOME:      ['Project directory',process.cwd()],
  TIMESTAMP:         ['Build date, used to timestamp generated files',Date.now()],
  TOOLING_OPTIONS:   ['Options which control the tooling phase of the build', {}],
  VERBOSE:           ['Enable VerboseMaker to log additional info during build',false],
};

// Configure build variables
buildEnv(ENVS);

// Export functions for Tooling and Build POM tasks
EXPORTS = Object.assign(EXPORTS, {
  comma,
  copyDir,
  copyFile,
  emptyDir,
  ensureDir,
  error,
  exec,
  execute,
  execSync,
  existsSync,
  flag,
  info,
  isExcluded,
  join,
  pmake,
  readdirSync,
  rmdir,
  rmfile,
  showSummary,
  warning,
  writeFileSync
});

TOOLING_OPTIONS = addOptions({
  toolingPoms: [ 'O', 'tooling-poms', 'TOOLING_POMS', 'CSV list of tooling poms', 'Standard,Example,Java,JS,Maven,Npm,Test', '', args => TOOLING_POMS = args ]
}, TOOLING_OPTIONS);

OPTIONS = addOptions({
  dryRun: [ '', 'dry-run', 'DRY_RUN', 'Run build in dry-run mode which just lists tasks that would have run.', false, () => DRY_RUN = true ],
  envs: [ 'E', 'envs', '', 'Set environment variables. Example: -EJAVA_OPTS:-Xmx8g,APP_NAME:demo or -EJAVA_OPTS:"-Xms12g -Xmx12g"', '',
          args => {
            args.split(',').forEach(b => {
              var c = b.split(':');
              if ( ! ( c[0] in globalThis ) ) {
                error('Unknown environment variable:', c[0]);
              } else if ( c.length > 1 ) {
                globalThis[c[0]] = c.slice(1).join(':');
              }
            });
          }
        ],
  topic: [ 'H', 'topic-help', '', 'Help on a particular environment variable, option, or task', '',
           args => {
             HELP = true;
             var arg = args;
             if ( arg.startsWith(':') ||
                  arg.startsWith('=') ) {
               arg = arg.substring(1);
             }
             info(`Help for \'${arg}\'`);
             var option = findOption(OPTIONS, arg);
             if ( option ) {
               let opts = option[0] ? '-'+option[0]+', ' : '';
               opts += '--'+option.key;
               if ( option.key !== option[1] ) {
                 opts += ', --'+option[1];
               }
               var def = option[2] && globalThis[option[2]];
               if ( ! def ) {
                 def = option[4] ? option[4] : '';
                 if ( def instanceof Function ) {
                   def = def();
                 }
               }
               let desc = option[3];
               console.log(''.padStart(0), opts+':', '\x1b[0;35m', def,'\x1b[0;0m', desc);
            } else {
               let t = findTask(tasks, arg);
               if ( t ) {
                 console.log(arg, t.name, t[0],': ',t[1]);
               } else {
                 let e = ENVS[arg];
                 if ( e ) {
                   console.log(arg,': ',e[0]);
                 } else {
                   var extra = '';
                   let similar = findSimilarTasks(tasks, arg);
                   if ( similar.length > 0 ) {
                     extra += '\n  Possible Task matches: \n';
                   }
                   similar.forEach(task => {
                     extra += '    ' + task.name + ' ' + task[0] + ' - ' + task[1] + '\n';
                   });
                   similar = findSimilarOptions(OPTIONS, arg);
                   if ( similar.length > 0 ) {
                     extra += '\n  Possible Option matches: \n';
                   }
                   similar.forEach(option => {
                     extra += '    ' + option.key + ' ' + option[0] + ' ' + option[1] + ' - ' + option[3] + '\n';
                   });
                   error('Topic not found - ', arg, extra);
                 }
               }
             }
             process.exit(0);
           }
         ],
  poms: [ 'P', 'poms', 'POMS', "comma seperated list of pom files. Defaults to 'pom' at the root of the project.", '',
          args => { POMS = args; } ],
  tasks: [ 'X', 'tasks', 'TASKS', 'Explicitly execute tasks. Comma seperated list of task names. Parameters to each demarcated with : symbol. Ex: -XcheckDeps:9', 'all',
           args => {
             if ( TASKS === 'all' )
               TASKS = '';
             TASKS = comma(TASKS, args);
           } ],
  help: [ 'h', 'help', 'HELP', 'Print usage information for environment variables (envs), options, and tasks.  Narrow output with --help:tasks, for example. Or show help for a particular topic with --help:foo where foo is the name of an option or task.', '', function help(arg) {
    HELP = true;
    if ( ! arg ) {
      moreUsage(arg);
    } else if ( typeof arg === "string" ) {
      if ( arg === 'envs' ||
           arg === 'options' ||
           arg === 'tasks' ) {
        moreUsage(arg);
      } else {
        execute('topic', arg);
      }
    } else if ( arg instanceof Function ) {
      moreUsage();
      arg();
    }
    process.exit(0);
  }],
  showReport: [ '', 'show-report', 'SHOW_REPORT', 'Report final build information for environment variables (envs), options, and tasks.  Narrow output with --dump:tasks, for example.', '', args => SHOW_REPORT = true]

}, OPTIONS);

function moreUsage(arg) {
  if ( SHOW_REPORT ) {
    info('Build report');
  } else {
    info('Usage: build.js [OPTIONS] (see --usage for examples)');
  }
  if( ! arg || arg === 'options' ) {
    console.log();
    if ( SHOW_REPORT )
      info('Option report:');
    else
      info('Options are:');
    Object.keys(OPTIONS).forEach(key => {
      let option = OPTIONS[key];
      var opts = '';
      if ( option[0] ) {
        opts = '-'+option[0];
      }
      opts += (opts ? ', ' : '');
      opts += '--'+key;
      if( option[1] !== key ) {
        opts += ', --'+option[1];
      }
      if ( option[2] ) {
        opts += ', '+option[2];
      }
      var def = option[2] && globalThis[option[2]].toString();
      if ( ! def ) {
        def = option[4] ? option[4] : '';
        if ( def instanceof Function ) {
          def = def();
        }
      }
      console.log(''.padStart(0), opts+':', ''.padStart(41-opts.length), '\x1b[0;35m', def,'\x1b[0;0m');
      if ( ! SHOW_REPORT ) {
        console.log(''.padStart(3), option[3]);
      }
    });
  }

  if( ! arg || arg === 'tasks' ) {
    console.log();
    if ( SHOW_REPORT )
      info('Task report:');
    else
      info('Tasks: (invoke with -XtaskName or --task-name)');
    var ts = { ...tasks };
    var depth = 1;
    function printTask(t) {
      if ( ! ts[t] ) return;
      delete ts[t];
      var [ gnu, desc, dep ] = findTask(tasks, t);
      var dep2 = dep.filter(d => ! ts[d]); // list of dependencies which appear elsewhere in tree
      var dstr = dep2.length ? ' [ ' + dep2.join(', ') + ' ]': '';
      desc = SHOW_REPORT ? '' : desc;
      console.log(''.padEnd(depth*2) + t.padEnd(27-depth*2) + desc + dstr);
      depth++;
      dep.forEach(printTask);
      depth--;
    }
    Object.keys(ts).sort().forEach(t => {
      printTask(t);
    });
  }

  if( ! arg || arg === 'envs' ) {
    console.log();
    if ( SHOW_REPORT )
      info('Environment variable report:');
    else
      info('Environment variables: (set with -E)');
    depth = 1;
    Object.keys(ENVS).sort().forEach(k => {
      var [ desc, val ] = ENVS[k];
      var v = val;
      if ( val instanceof Function)
        v = val();
      else
        v = globalThis[k];
      // TODO: better object support, don't want to display all
      // of EXPORTS or OPTIONS, for example
      v = v ? v.toString() : '';
      console.log(''.padStart(0), k+':', ''.padStart(16-k.length), '\x1b[0;35m', v, '\x1b[0;0m',);
      if ( ! SHOW_REPORT ) {
        console.log(''.padStart(3), desc);
      }
    });
  }
  console.log('');
  if ( ! SHOW_REPORT ) {
    info('See --usage for examples, and #flowdoc/Build documentation.)');
  }
}


// ############################
// # Build tasks
// ############################

task('Prepare build environment', [], function tooling() {
  var tps = '';
  (TOOLING_POMS || '').split(',').forEach(name => {
    var fn = join(__dirname,`${name}Tooling`);
    if ( existsSync(fn + '.js') ) {
      tps = comma(tps, fn);
    }
    fn = join(process.cwd(),`tools/${name}Tooling`);

    if ( existsSync(fn + '.js') ) {
      tps = comma(tps, fn);
    }
  });
  let maker = pmake.bind(Object.assign({}, EXPORTS), `-makers=Tooling -pom=${tps} -envs=${ENVS} -args=${OPTIONS}`)();
  Object.assign(ENVS, maker.envs);
  buildEnv(maker.envs);

  OPTIONS = addOptions(maker.options, OPTIONS);

  Object.keys(maker.tasks || {}).forEach(name => {
    let list = maker.tasks[name];
    list.forEach(t => {
      var [gnuopt, desc, dep, f] = t;
      if ( ! f || ! f.name ) {
        error(`[build] task missing function ${name} ${t}`);
      }
      if ( f.name !== name ) {
        warning(`[build] tooling name: ${name} != f.name ${f.name}`);
      }
      // TODO: refactor to register against top level and also run dependencies
      if ( ! tasks[name] ) {
        task(name, gnuopt, desc, dep, f);
      } else {
        let pomList = POM_TASKS[name] || [];
        pomList.push(t);
        POM_TASKS[name] = pomList;
      }
    });
  });
});

task('Capture POM arguments to environment values or options, and register POM tasks for later execution when the corresponding build tasks is executed.', [], function pomEnvs() {
  let makers = pmake.bind(Object.assign({}, EXPORTS), `-makers=Env,Task -flags=${flag()} -pom=${POMS} -builddir=${BUILD_DIR}`)();

  let envMaker = makers.get('Env');
  Object.keys(envMaker.envs || {}).forEach(e => {
    if ( globalThis[e] ) {
      globalThis[e] = envMaker.envs[e];
      // info(`[build] set global ${e} = ${ENVS[e]}`);
      return;
    }
    let env = ENVS[e];
    if ( env ) {
      globalThis[e] = envMaker.envs[e];
      // info(`[build] set env ${e} = ${globalThis[e]}`);
      return;
    }
    let option = findOption(OPTIONS, e);
    if ( option ) {
      option[5](envMaker.envs[e]);
      // info(`[build] set option ${e} = ${envMaker.envs[e]}`);
      return;
    }
    warning(`[build] environment variable or option not found: ${e}`);
  });

  let taskMaker = makers.get('Task');
  Object.keys(taskMaker.tasks || {}).forEach(name => {
    let list = taskMaker.tasks[name];
    list.forEach(t => {
      let pomList = POM_TASKS[name] || [];
      pomList.push(t);
      POM_TASKS[name] = pomList;
    });
  });
});

task('Run pom copy[] tasks.', [], function copy() {
  pmake.bind(Object.assign({}, EXPORTS), `-makers=Copy -flags=${flag()} -pom=${POMS} -builddir=${BUILD_DIR}`)();
});

task('Show POM structure.', [], function showPOMs() {
  pmake.bind(Object.assign({}, EXPORTS), `-makers=Verbose -flags=${flag('web,java')} -pom=${POMS} -builddir=${BUILD_DIR}`)();
});

processToolingArgs.bind(Object.assign({}, EXPORTS), TOOLING_OPTIONS, moreUsage)();
execute('tooling');

// Process command line arguments
processBuildArgs.bind(Object.assign({}, EXPORTS), OPTIONS, moreUsage)();

// build pom map for POM_TASKS, and ensure POMS list is viable
pom();

// start the build
TASKS.split(',').forEach(t => {
  var s = t.split(':');
  execute(s[0], s[1]);
});

quit(0);
