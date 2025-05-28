/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'SessionClientBox',
  extends: 'foam.box.ProxyBox',

  requires: [ 'foam.box.SessionReplyBox' ],

  imports: [
    'sessionID as jsSessionID'
  ],

  constants: [
    {
      name: 'SESSION_KEY',
      value: 'sessionId',
      type: 'String'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'sessionID',
      factory: function() { return this.jsSessionID; }
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(originalEnvelope) {
        var envelope = originalEnvelope.shallowClone();
        
        envelope.headers[this.SESSION_KEY] = this.sessionID;
        envelope.replyBox = this.SessionReplyBox.create({
          delegate: envelope.replyBox,
          originalEnvelope,
        });

        this.delegate.send(envelope);
      },
      swiftCode: `
let msg = msg!
msg.attributes[foam_box_SessionClientBox.SESSION_KEY] = sessionID
msg.attributes["replyBox"] = SessionReplyBox_create([
  "msg": msg,
  "clientBox": self,
  "delegate": msg.attributes["replyBox"] as? foam_box_Box,
])
try delegate.send(msg)
      `,
      javaCode: `
msg.getAttributes().put(SESSION_KEY, getSessionID());
getDelegate().send(msg);`
    }
  ]
});
