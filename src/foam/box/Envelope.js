foam.CLASS({
  package: 'foam.box',
  name: 'Envelope',
  implements: [ 'foam.lang.ContextAware' ],
  properties: [
    {
      class: 'Object',
      name: 'message'
    },
    {
      class: 'FObjectProperty',
      name: 'replyBox',
      type: 'foam.box.Box',
      adapt: function(_, v) {
        // Don't auto upgrade to real fobjects, sometimes people just want to make an
        // anonymous box with a plan js object.
        return v;
      }
    }
  ],
  methods: [
    {
      name: 'replyWithException',
      type: 'Void',
      args: 'Throwable t',
      javaCode: `
        if ( getReplyBox() == null ) return;

        RemoteException wrapper = new RemoteException();
        wrapper.setId(t.getClass().getName());
        wrapper.setMessage(t.getMessage());
        // Determine retryability if the throwable exposes it
        boolean retryable = true;
        if ( t instanceof foam.util.retry.Retryable ) {
          try {
            retryable = ((foam.util.retry.Retryable) t).isRetryable();
          } catch ( Throwable ignore ) {
            // default to true on any unexpected error
            retryable = true;
          }
        }
        wrapper.setIsRetryable(retryable);
        if ( t instanceof foam.lang.FOAMException ) {
          wrapper.setException((foam.lang.Exception) t);
        }
        RPCErrorMessage reply = new RPCErrorMessage();
        reply.setData(wrapper);

        getReplyBox().send(new foam.box.Envelope(reply, null));
      `
    }
  ]
});
