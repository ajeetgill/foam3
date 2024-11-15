foam.POM({
  name: "pii",
  projects: [
    { name: "test/pom"},
  ],
  files: [
    { name: "ApprovedPIIRequestDAO",
      flags: "js|java" },
    { name: "AuthenticatedPIIRequestDAO",
      flags: "js|java" },
    { name: "FreezeApprovedPIIRequestsDAO",
      flags: "js|java" },
    { name: "PII",
      flags: "js|java" },
    { name: "PIIDisplayStatus",
      flags: "js|java" },
    { name: "PIIReportGenerator",
      flags: "js|java" },
    { name: "PIIReportDownload",
      flags: "js" },
    { name: "PIIRequestStatus",
      flags: "js|java" },
    { name: "PreventDuplicatePIIRequestsDAO",
      flags: "js|java" },
    { name: "UserCapabilityJunctionRefines",
      flags: "js|java" },
    { name: "ViewPIIRequest",
      flags: "js|java" }
  ]
});
