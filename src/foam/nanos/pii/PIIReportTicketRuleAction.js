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
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.fs.File',
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
            // List documents = ticket.getDocuments();
            // if ( documents == null ) {
            //   documents = new ArrayList();
            // }
            // documents.add(file);
            // ticket.addDocument(documents);
            ticket.addDocument(file);
          }
        }, "PIIReportTicketRuleAction");
      `
    },
    {
      documentation: 'Hook for application pii',
      name: 'addData',
      args: 'X x, PIIReportTicket ticket, User user, Set kvs',
      javaCode: `
        addUserData(x, ticket, user, kvs);
        addUCJData(x, ticket, user, kvs);
      `
    },
    {
      name: 'addProperty',
      args: 'X x, String prefix, PropertyInfo pInfo, FObject fObj, Set kvs',
      javaCode: `
        if ( pInfo.getNetworkTransient() ||
             pInfo.getExternalTransient() )
          return;

        Object val = pInfo.get(fObj);
        if ( val == null ) return;
        StringBuilder key = new StringBuilder();
        if ( ! SafetyUtil.isEmpty(prefix) ) {
          key.append(prefix);
          key.append(" ");
        }
        key.append(StringUtil.labelize(pInfo.getName()));
        if ( val instanceof FObject ) {
          addAllProperties(x, key.toString(), (FObject) val, kvs);
        } else {
          var s = String.valueOf(val);
          if ( ! SafetyUtil.isEmpty(s) ) {
            kvs.add(new KeyValue(key.toString(), s));
          }
        }
      `
    },
    {
      name: 'addAllProperties',
      args: 'X x, String prefix, FObject fObj, Set kvs',
      javaCode: `
      List<PropertyInfo> props = fObj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo p : props ) {
        addProperty(x, prefix, p, fObj, kvs);
      }
      `
    },
    {
      name: 'addUserData',
      args: 'X x, PIIReportTicket ticket, User user, Set kvs',
      javaCode: `
      List<PropertyInfo> props = user.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo p : props ) {
        if ( p.containsPII() ) {
          addProperty(x, null, p, user, kvs);
        }
      }
      `
    },
    {
      name: 'addUCJData',
      args: 'X x, PIIReportTicket ticket, User user, Set kvs',
      javaCode: `
      ((DAO) x.get("bareUserCapabilityJunctionDAO"))
        .where(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()))
        .select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            Capability cap = ucj.findTargetId(x);
            if ( cap.getContainsPII() ) {
              Object data = ucj.getData();
              if ( data == null ) return;
              if ( data instanceof FObject ) {
                // addAllProperties(x, cap.getName(), (FObject) data, kvs);
                String str = ((FObject) data).toSummary();
                if ( ! SafetyUtil.isEmpty(str) ) {
                  kvs.add(new KeyValue(cap.getName(), ((FObject) data).toSummary()));
                }
              } else if ( data instanceof File ) {
                ticket.addDocument((File) data);
              } else {
                String str = String.valueOf(data);
                if ( ! SafetyUtil.isEmpty(str) ) {
                  kvs.add(new KeyValue(cap.getName(), String.valueOf(data)));
                }
              }
            }
          }
        });
      `
    },
    {
      name: 'buildKeyValuePDF',
      args: 'X x, X rulerX, PIIReportTicket ticket, Set kvs',
      type: 'File',
      javaCode: `
      try {
        Outputter outputter = new Outputter(KeyValue.getOwnClassInfo(), OutputterMode.FULL);
        // PDF generator does not support non-breaking space &nbsp;
        outputter.setNbspEnabled(false);
        outputter.outputStartHtml();
        outputter.outputStartTable();
        outputter.outputHead(new KeyValue());
        for ( KeyValue kv : (Set<KeyValue>) kvs ) {
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
