foam.POM({
  name: 'example',
  envs: {
    EXAMPLE:                 ['Execute example',false],
    EXAMPLE_RELEASE:         ['Example version.'],
    EXAMPLE_RELEASE_DEFAULT: ['Example version default','3']
  },

  args: {
    e: [ 'Enable example.',
    () => { EXAMPLE = true; } ]
  },

  tasks: [
    {
      name: 'example',
      desc: 'Run example',
      dep: [],
      code: function () {
        consol.log(`[Example] release ${EXAMPLE_RELEASE || EXAMPLE_RELASE_DEFAULT}`);
      }
    }
  ]
});
