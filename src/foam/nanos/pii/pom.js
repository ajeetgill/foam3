foam.POM({
  name: "pii",
  projects: [
    { name: "test/pom"},
  ],
  files: [
    { name: "KeyValue",
      flags: "js|java" },
    { name: "PIIReportRequestView",
      flags: "web" },
    { name: "PIIReportTicket",
      flags: "js|java" },
    { name: "PIIReportTicketRuleAction",
      flags: "js|java" },
    { name: "PIIReportTicketSendRuleAction",
      flags: "js|java" },
    { name: "UserCapabilityJunctionRefines",
      flags: "js|java" },
    { name: "UserRefines",
      flags: "js|java" }
  ]
});
