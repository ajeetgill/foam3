/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "fbe",
  projects: [
    { name: '../../../pom' },
    { name: '../../../io/c9/ace/pom' },
    { name: '../../../foam/core/pom' }
  ],
  files: [
    { name: 'FBE' },
    { name: "../../core/pm/TemperatureCView" },
  ]
});
