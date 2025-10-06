## What are FOAM Journals?

FOAM journals are append-only log files that record all data changes (creates, updates, deletes) to provide durable persistence and enable data recovery [2](#0-1) . They implement the `Journal` interface which defines three core operations: `put()` for recording object creation/updates, `remove()` for recording deletions, and `replay()` for reconstructing state from the journal [3](#0-2) .

## How Journals Work

Journals use a simple text-based format with three operation types<cite />:

- **`p({...})`** - Records a put (create/update) operation
- **`r({...})`** - Records a remove (delete) operation
- **`// comment`** - Adds audit trail metadata [4](#0-3)

The journal stores objects as JSON with delta compression - only changed properties are written rather than the entire object, significantly reducing file size [5](#0-4) .

## How They're Used

### 1. **Data Persistence**
Journals provide durable storage by writing all DAO operations to disk<cite />. When the application starts, it replays the journal to reconstruct the in-memory state [6](#0-5) .

### 2. **Build System Integration**
The build system includes a `JournalMaker` that concatenates `.jrl` journal files from various locations during builds [7](#0-6) . You can specify additional journal directories using the `-J` flag: `./build.sh -Jdemo,test` [8](#0-7) .

### 3. **Deployment Structure**
Journals are organized in a standard directory structure<cite />:
- **Source journals**: `deployment/*/` - Contains initial data and configuration
- **Build journals**: `build/journals/` - Concatenated journals from build process
- **Runtime journals**: `${APP_HOME}/journals/` - Active journals written during application runtime [7](#0-6)

### 4. **Compaction**
Over time, journals accumulate multiple entries for the same object. The `Compaction` system reduces replay time by writing out each object once in its entirety, eliminating redundant delta entries [9](#0-8) .

## Notes

Journals are typically used with `JDAO` (Journaled DAO) which wraps another DAO and automatically journals all operations [10](#0-9) . The `-j` build flag deletes runtime journals<cite />. Journal files can be manually edited to seed initial data or fix issues, as they're just text files with a simple format<cite />.


### Citations

**File:** src/foam/dao/Journal.js (L7-48)
```javascript
foam.INTERFACE({
  package: 'foam.dao',
  name: 'Journal',

  methods: [
    {
      name: 'put',
      type: 'FObject',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'prefix', type: 'String' },
        { name: 'dao',    type: 'DAO' },
        { name: 'obj',    type: 'foam.lang.FObject' }
      ]
    },
    {
      name: 'remove',
      type: 'FObject',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'prefix', type: 'String' },
        { name: 'dao',    type: 'DAO' },
        { name: 'obj',    type: 'foam.lang.FObject' }
      ]
    },
    {
      name: 'replay',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ]
    },
    {
      name: 'cmd',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'obj', type: 'Object' }
      ],
      type: 'Object'
    }
  ]
});
```

**File:** src/foam/dao/FileJournal.js (L34-39)
```javascript
      name: 'replay',
      documentation: 'Replays the journal file',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ],
```

**File:** src/foam/dao/FileJournal.js (L53-77)
```javascript
          for ( String entry ; ( entry = getEntry(reader) ) != null ; ) {
            if ( SafetyUtil.isEmpty(entry)        ) continue;
            if ( COMMENT.matcher(entry).matches() ) continue;

            try {
              char operation = entry.charAt(0);
              int length = entry.length();
              entry = entry.substring(2, length - 1);

              FObject obj = parser.parseString(entry);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(entry), "entry:", entry);
                continue;
              }

              switch ( operation ) {
                case 'p':
                  foam.lang.FObject old = dao.find(obj.getProperty("id"));
                  dao.put(old != null ? mergeFObject(old.fclone(), obj) : obj);
                  break;

                case 'r':
                  dao.remove(obj);
                  break;
              }
```

**File:** src/foam/dao/AbstractF3FileJournal.js (L1-62)
```javascript
/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractF3FileJournal',
  abstract: true,
  flags: ['java'],

  javaImports: [
    'foam.lang.ClassInfo',
    'foam.lang.FObject',
    'foam.lang.PropertyInfo',
    'foam.lang.ProxyX',
    'foam.lang.X',
    'foam.lang.AbstractFObjectPropertyInfo',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.ExprParser',
    'foam.lib.json.JSONParser',
    'foam.lib.parse.*',
    'foam.lib.StoragePropertyPredicate',
    'foam.core.auth.LastModifiedByAware',
    'foam.core.auth.Subject',
    'foam.core.auth.User',
    'foam.core.fs.FileSystemStorage',
    'foam.core.fs.Storage',
    'foam.core.logger.Logger',
    'foam.core.logger.Loggers',
    'foam.core.logger.PrefixLogger',
    'foam.core.logger.StdoutLogger',
    'foam.core.om.OMLogger',
    'foam.core.pm.PM',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.File',
    'java.io.IOException',
    'java.io.InputStream',
    'java.io.InputStreamReader',
    'java.io.FileInputStream',
    'java.io.FileOutputStream',
    'java.io.OutputStream',
    'java.io.OutputStreamWriter',
    'java.nio.file.Files',
    'java.nio.file.Path',
    'java.nio.file.StandardCopyOption',
    'java.nio.file.StandardOpenOption',
    'java.time.format.DateTimeFormatter',
    'java.time.LocalDateTime',
    'java.util.Calendar',
    'java.util.Iterator',
    'java.util.List',
    'java.util.Set',
    'java.util.regex.Pattern',
    'java.util.TimeZone',
    'java.util.stream.Collectors',
    'java.util.stream.Stream'
  ],

```

**File:** tools/JavaTooling.js (L21-22)
```javascript
    JOURNAL_HOME:      ['Application journals directory',() => `${APP_HOME}/journals`],
    JOURNAL_OUT:       ['Build journals directory',() => `${PROJECT_HOME}/${BUILD_DIR}/journals`],
```

**File:** tools/JavaTooling.js (L37-37)
```javascript
    journals: [ 'J', 'journals', 'JOURNALS', 'Comma seperated list of additional journal directories, relative to deployment/ from the root project.', '', function(args) { JOURNALS = this.comma(JOURNALS, args); } ],
```

**File:** src/foam/dao/compaction/Compaction.js (L10-12)
```javascript
  documentation: `Compaction dumps an MDAO out to a new journal file, in a effort to reduce replay time.  Each DAO operation on the same object generates an entry  containing just the change on the object.  In time there are multiple entries for the same object.  Compaction writes out each object in entirety once, thus reducing the multiple entry to just one, and reducing replay time.
Used in conjuction with a custom compaction sink, the compaction process can facilitate archiving with only recent or active objects written to the new journal.
`,
```

**File:** src/pom.js (L357-363)
```javascript
    { name: "foam/dao/Journal",                                       flags: "js|java" },
    { name: "foam/dao/NodeFileJournal",                               flags: "node" },
    { name: "foam/dao/CompositeJournal",                              flags: "js|java" },
    { name: "foam/dao/AbstractFileJournal",                           flags: "js|java" },
    { name: "foam/dao/FileJournal",                                   flags: "js|java" },
    { name: "foam/dao/JDAO",                                          flags: "web" },
    { name: "foam/dao/java/JDAO",                                     flags: "js|java" },
```
