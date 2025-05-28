/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.crunch.box',
  name: 'CrunchClientReplyBox',
  extends: 'foam.box.ProxyBox',

  documentation: `
    This box decorates reply boxes sent to CrunchClientBox.
  `,

  requires: [
    'foam.box.RPCErrorMessage',
    'foam.box.RemoteException',
    'foam.box.RPCReturnMessage',
    'foam.core.crunch.CapabilityIntercept'
  ],

  imports: [
    'crunchController'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'originalEnvelope',
      type: 'foam.box.Message'
    },
    {
      class: 'FObjectProperty',
      name: 'clientBox',
      type: 'foam.box.Box'
    }
  ],

  methods: [
    {
      name: 'send',
      code: function send(envelope) {
        var self = this;
        if (
          this.RPCErrorMessage.isInstance(envelope.contents) &&
          this.RemoteException.isInstance(envelope.contents.data) &&
          this.CapabilityIntercept.isInstance(envelope.contents.data.exception)
        ) {
          var intercept = envelope.contents.data.exception;
          intercept.message = envelope.contents.data.message;

          // Configure events CapabilityIntercept completion
          intercept.resolve = function (value) {
            self.delegate.send(foam.box.Envelop.create({
              contents: self.RPCReturnMessage.create({ data: value })
            }));
          };
          intercept.reject = function (value) {
            self.delegate.send(foam.box.Envelope.create({ contents: new Error(value) }));
          };
          intercept.resend = function () {
            self.clientBox.send(self.originalEnvelope);
          };

          // Ask CrunchController to handle the intercept
          this.crunchController.handleIntercept(intercept);
          return;
        }

        this.delegate.send(envelope);
      }
    },
    function outputJSON(outputter) {
      // this is a client only decorator, just send the delegate when serializing
      return outputter.output(this.delegate);
    }
  ]
});
