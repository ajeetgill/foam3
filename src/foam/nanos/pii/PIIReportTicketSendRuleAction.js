/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pii',
  name: 'PIIReportTicketSendRuleAction',

  documentation: 'Generate email from report and send.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailPropertyService',
    'foam.nanos.session.Session',
    'foam.nanos.ticket.Ticket',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'String',
      name: 'emailTemplate',
      value: 'foam-nanos-pii-report-EmailTemplate',
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        final PIIReportTicket ticket = (PIIReportTicket) obj;
        if ( ticket.getDocuments() == null ||
             ticket.getDocuments().size() == 0 ) {
          // TODO: how to report to user.
          Loggers.logger(x, this).warning("Documents not found", ticket.getId());
          return;
        }
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            try {
              Map<String, Object> args = new HashMap();
              User user = (User) ticket.findCreatedFor(x);
              EmailMessage msg = new EmailMessage();
              msg.setUser(user.getId());
              msg.setTo(new String[] { user.getEmail() });
              args.put("template", getEmailTemplate());
              args.put("user", user);
              args.put("ticket", ticket);
              msg.setTemplateArguments(args);
              msg = (EmailMessage) ((EmailPropertyService) ruler.getX().get("emailPropertyService")).apply(x, user.getGroup(), msg, args);
              EmailMessage.TEMPLATE_ARGUMENTS.clear(msg);
              // String[] attachments = ((List<File>)ticket.getDocuments()).stream().map(File::getId).toArray(String[]::new);
              String[] attachments = (String[]) ticket.getDocuments().stream().map(obj -> obj instanceof File ? ((File)obj).getId() : (String)((Map)obj).get("id")).toArray(String[]::new);
              msg.setAttachments(attachments);
              ((DAO) ruler.getX().get("emailMessageDAO")).put(msg);
            } catch (Throwable t) {
              // TODO: how to report to user.
              Loggers.logger(x, this).error(ticket.getId(), t.getMessage(), t);
            }
          }
        }, "PIIReportTicketRuleAction");
      `
    }
  ]
})
