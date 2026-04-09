/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.ai',
  name: 'LoggingLLMService',
  extends: 'foam.core.ai.ProxyLLMService',

  documentation: `
    Decorator that logs requests, token usage, and latency.
    Stack via CSpec decorators just like DAO decorators.
  `,

  methods: [
    async function complete(x, request) {
      var start = Date.now();
      try {
        var response = await this.delegate.complete(x, request);
        this.logCompletion_(x, 'complete', request.options, response, Date.now() - start);
        return response;
      } catch (e) {
        this.logError_(x, 'complete', e, Date.now() - start);
        throw e;
      }
    },

    async function chat(x, messages, options) {
      var start = Date.now();
      try {
        var response = await this.delegate.chat(x, messages, options);
        this.logCompletion_(x, 'chat', options, response, Date.now() - start);
        return response;
      } catch (e) {
        this.logError_(x, 'chat', e, Date.now() - start);
        throw e;
      }
    },

    function logCompletion_(x, method, options, response, ms) {
      console.log(
        '[LLM]', method,
        'model=' + response.model,
        'in=' + response.inputTokens,
        'out=' + response.outputTokens,
        ms + 'ms'
      );
    },

    function logError_(x, method, error, ms) {
      console.error('[LLM]', method, 'FAILED', error.message, ms + 'ms');
    }
  ]
});
