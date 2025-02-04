/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pii',
  name: 'PIIReportTicketRuleAction',

  documentation: 'Generate PII Report',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.lib.html.Outputter',
    'foam.lib.json.OutputterMode',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailPropertyService',
    'foam.nanos.notification.email.Status',
    'foam.nanos.session.Session',
    'foam.nanos.ticket.Ticket',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'foam.util.StringUtil',
    'java.io.ByteArrayOutputStream',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.Set',
    'java.util.TreeSet',
    'com.openhtmltopdf.pdfboxout.PdfRendererBuilder',
    'org.jsoup.Jsoup',
    'org.jsoup.nodes.Document',
  ],

  properties: [
    {
      class: 'String',
      name: 'emailTemplateKVData',
      value: 'foam-nanos-pii-report-kv-EmailTemplate',
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            PIIReportTicket ticket = (PIIReportTicket) obj;
            User user = (User) ticket.findCreatedFor(x);
            TreeSet<KeyValue> set = new TreeSet<KeyValue>((KeyValue kv1, KeyValue kv2) -> kv1.getKey().compareTo(kv2.getKey()));
            // collect all key/value and document data.
            addData(x, ticket, user, set);

            // build key/value PDF
            File file = buildKeyValuePDF(x, ruler.getX(), ticket, set);
            List documents = ticket.getDocuments();
            if ( documents == null ) {
              documents = new ArrayList();
            }
            documents.add(file);
            ticket.setDocuments(documents);
          }
        }, "PIIReportTicketRuleAction");
      `
    },
    {
      documentation: 'Hook for application pii',
      name: 'addData',
      args: 'X x, PIIReportTicket ticket, User user, Set data',
      javaCode: `
        addUserData(x, ticket, user, data);
        addUCJData(x, ticket, user, data);
      `
    },
    {
      name: 'addAllProperties',
      args: 'X x, String prefix, FObject fObj, Set data',
      javaCode: `
      List<PropertyInfo> props = fObj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo p : props ) {
        Object val = p.get(fObj);
        if ( val == null ) continue;
        if ( val instanceof FObject ) {
          addAllProperties(x, prefix + ' ' + StringUtil.labelize(p.getName()), (FObject) val, data);
        } else {
          var s = String.valueOf(val);
          if ( ! SafetyUtil.isEmpty(s) ) {
            data.add(new KeyValue(prefix + ' ' + StringUtil.labelize(p.getName()), s));
          }
        }
      }
      `
    },
    {
      name: 'addUserData',
      args: 'X x, PIIReportTicket ticket, User user, Set data',
      javaCode: `
      List<PropertyInfo> props = user.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo p : props ) {
        if ( p.containsPII() ) {
          Object val = p.get(user);
          if ( val == null ) continue;
          if ( val instanceof FObject ) {
            addAllProperties(x, StringUtil.labelize(p.getName()), (FObject) val, data);
          } else {
            var s = String.valueOf(val);
            if ( ! SafetyUtil.isEmpty(s) ) {
              data.add(new KeyValue(StringUtil.labelize(p.getName()), s));
            }
          }
        }
      }
      `
    },
    {
      name: 'addUCJData',
      args: 'X x, PIIReportTicket ticket, User user, Set data',
      javaCode: `
      `
    },
    {
      name: 'buildKeyValuePDF',
      args: 'X x, X rulerX, PIIReportTicket ticket, Set data',
      type: 'File',
      javaCode: `
      try {
        Outputter outputter = new Outputter(KeyValue.getOwnClassInfo(), OutputterMode.FULL);
        outputter.outputStartHtml();
        outputter.outputStartTable();
        outputter.outputHead(new KeyValue());
        for ( KeyValue kv : (Set<KeyValue>) data ) {
          outputter.put(kv, null);
        }
        outputter.outputEndTable();
        outputter.outputEndHtml();

        Map<String, Object> args = new HashMap();
        User user = (User) ticket.findCreatedFor(x);
        EmailMessage msg = new EmailMessage();
        msg.setUser(user.getId());
        msg.setTo(new String[] { user.getEmail() });
        args.put("template", getEmailTemplateKVData());
        args.put("user", user);
        args.put("ticket", ticket);
        args.put("keyValueData", outputter.toString());
        msg.setTemplateArguments(args);
        msg = (EmailMessage) ((EmailPropertyService) rulerX.get("emailPropertyService")).apply(x, user.getGroup(), msg, args);

        X userX = Auth.sudo(x, user);
        String baseUrl = ((AppConfig) userX.get("appConfig")).getUrl();
        Document doc = Jsoup.parse(msg.getBody(), "US-ASCII");
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(doc.html(), baseUrl);
        builder.toStream(baos);
        builder.useFastMode();
        builder.run();

        String encodedString = java.util.Base64.getEncoder().encodeToString(baos.toByteArray());
        File file = new File();
        file.setOwner(user.getId());
        file.setMimeType("application/pdf");
        file.setDataString("data:"+file.getMimeType()+";base64," + encodedString);
        file.setFilename(msg.getSubject().replaceAll("\\\\s+","-")+".pdf");
        file.setFilename(file.getFilename().replaceAll(",",""));
        file.setFilename(file.getFilename().replaceAll("[-]+","-"));
        DAO fileDAO = (DAO) rulerX.get("fileDAO");
        file = (File) fileDAO.put(file);
        return file;
      } catch ( Throwable t ) {
        Loggers.logger(x, this).error(t);
        return null;
      }
      `
    }
  ]
});
