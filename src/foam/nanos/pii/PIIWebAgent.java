/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pii;

import foam.core.X;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.ServletOutputStream;


public class PIIWebAgent
    implements WebAgent
{
  public PIIWebAgent() {}

  public synchronized void execute(X x) {
    try {
      HttpServletResponse response = x.get(HttpServletResponse.class);

      User user = ((Subject) x.get("subject")).getUser();
      Long userId = user.getId();

      // Generate PII report
      PIIReportGenerator reportGenerator = new PIIReportGenerator();
      String json = reportGenerator.getPIIData(x, userId);

      // Trigger download of generated PII report
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setHeader("Content-disposition", "attachment; filename=\"PIIData\"");
      ServletOutputStream out = response.getOutputStream();
      out.write(json.getBytes());
      out.flush();

      // Add download time to request
      reportGenerator.addTimeToPIIRequest(x);

    } catch (Throwable t) {
      throw new RuntimeException(t);
    }

  }
}
