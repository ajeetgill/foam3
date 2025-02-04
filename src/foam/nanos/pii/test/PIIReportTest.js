/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.pii.test',
  name: 'PIIReportTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'foam.nanos.pii.*',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.SafetyUtil',
    'java.util.List'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User user = (User) ((DAO) x.get("userDAO")).find(185426801L);
        PIIReportTicket ticket = new PIIReportTicket();
        ticket.setCreatedFor(user.getId());
        ticket = (PIIReportTicket) ((DAO) x.get("ticketDAO")).put(ticket);

        test ( ticket != null, "Ticket created");

        test ( ticket.getDocuments() != null && ticket.getDocuments().size() > 0, "Ticket has documents");

        if ( ticket.getDocuments() != null && ticket.getDocuments().size() > 0 ) {
          File file = (File) ticket.getDocuments().get(0);
          test ( file.getMimeType().equals("application/pdf"), "Document type PDF " + file.getMimeType());
          test ( file.getFilesize() > 0 || ! SafetyUtil.isEmpty(file.getDataString()), "Document size > 0 ");
        }

        // close and test for email
        ticket = (PIIReportTicket) ticket.fclone();
        ticket.setStatus("CLOSED");
        ticket = (PIIReportTicket) ((DAO) x.get("ticketDAO")).put(ticket);

        test ( ticket.getStatus().equals("CLOSED"), "Ticket closed");

        boolean found = false;
        DAO dao = (DAO) x.get("emailMessageDAO");
        dao = dao.where(EQ(EmailMessage.USER, user.getId()));
        List<EmailMessage> messages = (List) ((ArraySink) dao.select(new ArraySink())).getArray();
        for ( EmailMessage message : messages ) {
          if ( "PII Report".equals(message.getSubject()) ) {
            found = true;
            break;
          }
        }
        test ( found, "Email found");
      `
    }
  ]
});
