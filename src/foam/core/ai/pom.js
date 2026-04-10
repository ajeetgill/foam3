foam.POM({
  name: 'ai',

  files: [
    // Interface (generates Skeleton, Client, Proxy)
    { name: 'LLMService',           flags: 'js|java' },

    // Implementations
    { name: 'ClaudeLLMService',     flags: 'js|java' },
    { name: 'DeepSeekLLMService',   flags: 'js|java' },
    { name: 'OpenAILLMService',     flags: 'js|java' },

    // Decorators
    { name: 'LoggingLLMService',    flags: 'js|java' },
    { name: 'PMLLMService',         flags: 'js|java' }
    ]
});
