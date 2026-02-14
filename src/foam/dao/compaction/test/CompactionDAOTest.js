/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.compaction.test',
  name: 'CompactionDAOTest',
  extends: 'foam.core.test.Test',

  javaImports: [
    'foam.lang.X',
    'foam.dao.*',
    'foam.dao.compaction.*',
    'foam.dao.java.JDAO',
    'foam.dao.F3FileJournal',
    'foam.core.fs.FileSystemStorage',
    'foam.core.fs.Storage',
    'foam.core.auth.User',
    'foam.mlang.sink.Count',
    'java.io.File'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      x = x.put(Storage.class, x.get(FileSystemStorage.class));
      setX(x);
      String serviceName = "compactionTestDAO";

      // Provide a compactionDAO in context for CompactionSink
      DAO compactionDAO = new MDAO(Compaction.getOwnClassInfo());
      x = x.put("compactionDAO", compactionDAO);

      // 1. Create a JDAO with User model
      JDAO jdao = new JDAO(x, User.getOwnClassInfo(), "compactiontest");
      MDAO mdao = (MDAO) jdao.getDelegate();

      // Wrap in ProxyDAO (CompactionDAO.roll() casts to ProxyDAO)
      ProxyDAO proxyDAO = new ProxyDAO.Builder(x).setDelegate(jdao).build();

      // Register the DAO in context so CompactionDAO can find it
      x = x.put(serviceName, proxyDAO);

      // 2. Put multiple updates to the same objects (creates many journal entries)
      for ( int i = 1 ; i <= 5 ; i++ ) {
        User u = new User();
        u.setId(i);
        u.setFirstName("First" + i);
        u.setLastName("Last" + i);
        jdao.put_(x, u);
      }
      // Update the same objects 3 more times (creates delta entries in journal)
      for ( int j = 0 ; j < 3 ; j++ ) {
        for ( int i = 1 ; i <= 5 ; i++ ) {
          User u = (User) jdao.find_(x, (long) i);
          u = (User) u.fclone();
          u.setFirstName("Updated" + j + "_" + i);
          jdao.put_(x, u);
        }
      }

      // Verify MDAO has 5 objects
      Count count = (Count) mdao.select(new Count());
      test( ((Long) count.getValue()) == 5, "MDAO has 5 objects before compaction");

      // Verify original journal file exists and has content
      File originalFile = x.get(Storage.class).get("compactiontest");
      test( originalFile.exists(), "Original journal file exists");
      long originalSize = originalFile.length();
      test( originalSize > 0, "Original journal has content");

      // 3. Run CompactionDAO (which handles roll + compaction)
      try {
        CompactionDAO compactor = new CompactionDAO(x, serviceName);
        compactor.execute(x);
        test( true, "CompactionDAO.execute() completed without error");
      } catch (Throwable t) {
        test( false, "CompactionDAO.execute() failed: " + t.getMessage());
        return;
      }

      // 4. Verify: rolled backup file exists
      File rolledFile = x.get(Storage.class).get("compactiontest.1");
      test( rolledFile.exists(), "Rolled backup file (compactiontest.1) exists");
      test( rolledFile.length() > 0, "Rolled backup file has content");

      // 5. Verify: new journal has content (compacted entries written)
      File newJournal = x.get(Storage.class).get("compactiontest");
      test( newJournal.exists(), "New journal file exists after compaction");
      long newSize = newJournal.length();
      test( newSize > 0, "New journal has compacted entries");

      // 6. Verify: MDAO still has all 5 objects with correct data
      count = (Count) mdao.select(new Count());
      test( ((Long) count.getValue()) == 5, "MDAO still has 5 objects after compaction");
      User u1 = (User) mdao.find_(x, 1L);
      test( u1 != null, "Object 1 still exists in MDAO");
      test( u1.getFirstName().startsWith("Updated"), "Object 1 has latest updated value");

      // 7. Verify: new entries go to the new journal after compaction
      long sizeBeforeNewPut = newJournal.length();
      User newUser = new User();
      newUser.setId(100);
      newUser.setFirstName("PostCompaction");
      newUser.setLastName("User");
      jdao.put_(x, newUser);
      long sizeAfterNewPut = newJournal.length();
      test( sizeAfterNewPut > sizeBeforeNewPut, "New entries written to journal after compaction");
      User fetched = (User) jdao.find_(x, 100L);
      test( fetched != null, "New entry is findable after compaction");
      test( "PostCompaction".equals(fetched.getFirstName()), "New entry has correct data");

      testZeroAwareness(x);
      `
    },
    {
      name: 'testZeroAwareness',
      args: 'foam.lang.X x',
      javaCode: `
      // 1. Create a .0 file with 5 users (ids 1-5) using F3FileJournal
      F3FileJournal zeroJournal = new F3FileJournal.Builder(x)
        .setFilename("zerotest.0")
        .setCreateFile(true)
        .build();
      DAO nullDAO = new NullDAO(x, User.getOwnClassInfo());
      for ( int i = 1 ; i <= 5 ; i++ ) {
        User u = new User();
        u.setId(i);
        u.setFirstName("ZeroUser" + i);
        u.setLastName("ZeroLast" + i);
        zeroJournal.put(x, "", nullDAO, u);
      }

      // 2. Create JDAO with filename "zerotest" — it auto-replays zerotest.0 on creation
      JDAO jdao2 = new JDAO(x, User.getOwnClassInfo(), "zerotest");
      MDAO mdao2 = (MDAO) jdao2.getDelegate();

      // 3. Verify .0 was replayed
      Count count = (Count) mdao2.select(new Count());
      test( ((Long) count.getValue()) == 5, ".0 awareness: MDAO has 5 objects after .0 replay");

      // 4. Modify user 1 at runtime
      User u1 = (User) jdao2.find_(x, 1L);
      u1 = (User) u1.fclone();
      u1.setFirstName("Modified1");
      jdao2.put_(x, u1);

      // 5. Add 2 new users (ids 6, 7) at runtime
      for ( int i = 6 ; i <= 7 ; i++ ) {
        User u = new User();
        u.setId(i);
        u.setFirstName("NewUser" + i);
        u.setLastName("NewLast" + i);
        jdao2.put_(x, u);
      }

      // 6. Remove user 2 at runtime
      jdao2.remove_(x, jdao2.find_(x, 2L));

      // 7. Wrap in ProxyDAO and register in context as "zeroTestDAO"
      ProxyDAO proxy2 = new ProxyDAO.Builder(x).setDelegate(jdao2).build();
      x = x.put("zeroTestDAO", proxy2);

      // 8. Run CompactionDAO
      CompactionDAO compactor = new CompactionDAO(x, "zeroTestDAO");
      try {
        compactor.execute(x);
        test( true, ".0 awareness: CompactionDAO.execute() completed without error");
      } catch ( Throwable t ) {
        test( false, ".0 awareness: CompactionDAO.execute() failed: " + t.getMessage());
        return;
      }

      // 9. Verify results
      // MDAO still has 6 objects (5 original - 1 removed + 2 new)
      count = (Count) mdao2.select(new Count());
      test( ((Long) count.getValue()) == 6, ".0 awareness: MDAO has 6 objects after compaction");

      // Report contains "Skipped (.0)"
      String report = compactor.getReport();
      test( report.contains("Skipped (.0)"), ".0 awareness: report mentions Skipped (.0)");

      // Report contains "3" for skipped count (ids 3, 4, 5 are unchanged)
      test( report.contains("3"), ".0 awareness: report shows 3 skipped from .0");

      // Verify all 6 objects have correct data
      User check1 = (User) mdao2.find_(x, 1L);
      test( check1 != null && "Modified1".equals(check1.getFirstName()), ".0 awareness: user 1 has modified name");

      User check2 = (User) mdao2.find_(x, 2L);
      test( check2 == null, ".0 awareness: user 2 was removed");

      User check3 = (User) mdao2.find_(x, 3L);
      test( check3 != null && "ZeroUser3".equals(check3.getFirstName()), ".0 awareness: user 3 unchanged from .0");

      User check4 = (User) mdao2.find_(x, 4L);
      test( check4 != null && "ZeroUser4".equals(check4.getFirstName()), ".0 awareness: user 4 unchanged from .0");

      User check5 = (User) mdao2.find_(x, 5L);
      test( check5 != null && "ZeroUser5".equals(check5.getFirstName()), ".0 awareness: user 5 unchanged from .0");

      User check6 = (User) mdao2.find_(x, 6L);
      test( check6 != null && "NewUser6".equals(check6.getFirstName()), ".0 awareness: user 6 is new runtime user");

      User check7 = (User) mdao2.find_(x, 7L);
      test( check7 != null && "NewUser7".equals(check7.getFirstName()), ".0 awareness: user 7 is new runtime user");

      // Clean up test files
      try {
        Storage storage = (Storage) x.get(Storage.class);
        String[] filenames = { "zerotest", "zerotest.0", "zerotest.1", "zerotest.2" };
        for ( String fn : filenames ) {
          File f = storage.get(fn);
          if ( f != null && f.exists() ) f.delete();
        }
      } catch ( Exception e ) {
        // Best-effort cleanup
      }
      `
    }
  ]
});
