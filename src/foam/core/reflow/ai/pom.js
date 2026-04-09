foam.POM({
  name: 'reflowai',

  files: [
    // FLOW/Agent command — registered as both 'agent' and '?'
    { name: 'AgentCommand',  flags: 'js|java' },

    // UI controller for interactive LLM prompting
    { name: 'LLMCommand',    flags: 'js|java' }
  ]
});
