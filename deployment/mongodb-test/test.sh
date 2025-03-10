#!/bin/bash
node tools/build.js -Jmongodb,mongodb-test -TMongoDAOTest,MongoDAOTestBenchmark -LINFO -d "$@"
