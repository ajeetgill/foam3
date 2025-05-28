/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.box',
  name: 'RetryBox',
  extends: 'foam.box.ProxyBox',

  requires: [
    'foam.box.BackoffBox',
    'foam.box.RetryReplyBox'
  ],

  properties: [
    'attempts',
    {
      name: 'maxAttempts',
      documentation: 'Set to -1 to infinitely retry.',
      value: 3
    },
    {
      name: 'maxDelay',
      value: 20000
    }
  ],

  methods: [
    function send(originalEnvelope) {
      var delay = 100;
      var maxDelay = this.maxDelay;
      var maxAttempts = this.maxAttempts;
      var attempt = 0;
      var replyBox = originalEnvelope.replyBox;

      if ( ! replyBox ) {
        this.delegate.send(originalEnvelope);
        return;
      }
      
      var delegate = this.delegate;
      var envelope = originalEnvelope.shallowClone();
      envelope.replyBox = {
        send: function(replyEnvelope) {
          if ( foam.lang.Exception.isInstance(replyEnvelope.contents) &&
               ( maxAttempts == -1 || ++attempt < maxAttempts ) ) {

            // retry original message after exponential backoff delay
            setTimeout(function() {
              delegate.send(envelope);
            }, delay);
            delay = Math.min(delay * 2, maxDelay);
            return;
          }
          // not an error or we are out of retry attempts
          replyBox.send(replyEnvelope);
        }
      };

      this.delegate.send(envelope);
    }
  ]
});
