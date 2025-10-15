/**
PAYTIC CONFIDENTIAL
*
[2025] Paytic Inc.
All Rights Reserved.
*
NOTICE:  All information contained herein is, and remains
the property of Paytic Inc.
The intellectual and technical concepts contained
herein are proprietary to Paytic Inc
and may be covered by Canadian and Foreign Patents, patents
in process, and are protected by trade secret or copyright law.
Dissemination of this information or reproduction of this material
is strictly forbidden unless prior written permission is obtained
f
rom Paytic Inc.
*/

package com.paytic.flow.schedule;

import foam.lang.ContextAgent;
import foam.lang.X;
import foam.dao.DAO;
import foam.core.app.AppConfig;
import foam.core.logger.Loggers;
import foam.core.reflow.Flow;
import foam.dao.ArraySink;
import foam.core.auth.User;
import foam.core.session.Session;
import foam.util.Auth;
import java.util.Date;
import java.util.List;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.CompletableFuture;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.File;
import java.util.UUID;
import java.net.URI;
import java.nio.charset.StandardCharsets;

import foam.mlang.MLang;
import com.paytic.flow.headless.HeadlessRunnerService;

public class FlowSchedulerCron implements ContextAgent {

  private StringBuilder logOutput = new StringBuilder();

  private void logInfo(X x, Object... args) {
    Loggers.logger(x, this).info(args);
    logOutput.append("INFO: ");
    for (Object arg : args) {
      logOutput.append(arg);
    }
    logOutput.append("\n");
  }

  private void logError(X x, Object... args) {
    Loggers.logger(x, this).error(args);
    logOutput.append("ERROR: ");
    for (Object arg : args) {
      logOutput.append(arg);
    }
    logOutput.append("\n");
  }

  private void logWarning(X x, Object... args) {
    Loggers.logger(x, this).warning(args);
    logOutput.append("WARNING: ");
    for (Object arg : args) {
      logOutput.append(arg);
    }
    logOutput.append("\n");
  }

  private void logDebug(X x, Object... args) {
    Loggers.logger(x, this).debug(args);
    logOutput.append("DEBUG: ");
    for (Object arg : args) {
      logOutput.append(arg);
    }
    logOutput.append("\n");
  }

  @Override
  public void execute(X x) {
    boolean headless = true;
    int timeoutSeconds = 30;

    DAO flowDAO = (DAO) x.get("flowDAO");
    if ( flowDAO == null ) {
      logError(x, "flowDAO not found - skipping flow background runner");
      return;
    }

    HeadlessRunnerService headlessRunnerService = (HeadlessRunnerService) x.get("headlessRunnerService");
    if ( headlessRunnerService == null ) {
      logError(x, "headlessRunnerService not found - skipping flow background runner");
      return;
    }

    List<Flow> flows = getScheduledFlows(x, flowDAO);
    Date now = new Date();
    int executedCount = 0;

    logInfo(x, "Found ", flows.size(), " flows ready to execute at ", now);

    for ( Flow flow : flows ) {
      logInfo(x, "Executing scheduled flow: ", flow.getName());

      try {
        executedCount++;
        Flow clonedFlow = (Flow) flow.fclone();
        clonedFlow.setLastRun(now);
        // Rule will automatically calculate and set nextRun when put() is called
        flowDAO.put(clonedFlow);

        String sessionID = createSessionForFlow(x, flow);
        if ( sessionID == null ) continue;

        // Create headless runner entry
        String runnerId = headlessRunnerService.addRunner(flow.getName(), sessionID);

        String flowURL = buildFlowUrl(x, flow, sessionID, runnerId);
        logInfo(x, "Chrome will launch flow URL: ", flowURL);
        String chromeExe = findChromeExecutable();
        String[] chromeCmd = buildChromeCommand(flowURL, chromeExe, headless, timeoutSeconds);

        Process process = runChromeCommand(x, chromeCmd, timeoutSeconds, flow.getName(), runnerId, headlessRunnerService);
        headlessRunnerService.setProcess(runnerId, process);

        // Wait for runner removal or timeout
        boolean runnerRemoved = headlessRunnerService.waitForRunnerRemoval(runnerId, timeoutSeconds, TimeUnit.SECONDS);

        if (runnerRemoved && process.isAlive()) {
          logInfo(x, "Flow completed - terminating process for: " + flow.getName());
          process.destroyForcibly();
        } else if (process.isAlive()) {
          logWarning(x, "Flow execution timed out: " + flow.getName());
          process.destroyForcibly();
        }

        // Clean up if not already removed
        if (!runnerRemoved) {
          headlessRunnerService.removeRunner(runnerId);
        }
      } catch (Exception e) {
        logError(x, "Failed to execute scheduled flow: ", flow.getName(), ", error: ", e);
      }
    }

    logInfo(x, "FlowSchedulerCron completed: executed ", executedCount, " of ", flows.size(), " flows");
  }

  protected List<Flow> getScheduledFlows(X x, DAO flowDAO) {
    Date now = new Date();
    return (List<Flow>) ((ArraySink) flowDAO
      .where(MLang.AND(
        MLang.NEQ(Flow.SCHEDULE, null),
        MLang.EQ(Flow.SCHEDULING_ENABLED, true),
        MLang.LTE(Flow.NEXT_RUN, now)
      ))
      .orderBy(Flow.NEXT_RUN)
      .select(new ArraySink())).getArray();
  }


  protected String createSessionForFlow(X x, Flow flow) {
    DAO sessionDAO = (DAO) x.get("sessionDAO");
    DAO userDAO = (DAO) x.get("userDAO");

    if ( sessionDAO == null || userDAO == null ) {
      logError(x, "Required DAOs not available - skipping flow: " + flow.getName());
      return null;
    }

    User flowCreator = flow.findCreatedBy(x);
    if ( flowCreator == null ) {
      logError(x, "Flow creator not found for flow: ", flow.getName(), " - skipping scheduled run");
      return null;
    }

    X userX = Auth.sudo(x, flowCreator);
    Session session = userX.get(Session.class);
    sessionDAO.put(session);
    return session.getId();
  }

  protected String buildFlowUrl(X x, Flow flow, String sessionID, String runnerId) {
    AppConfig appConfig = (AppConfig) x.get("appConfig");
    try {
      URI uri = new URI(null, null, flow.getName(), null);
      String encodedFlowName = uri.getRawPath();
      return appConfig.getUrl() + "/?sessionId=" + sessionID + "&headless=true&runnerId=" + runnerId + "#flow/" + encodedFlowName;
    } catch (Exception e) {
      throw new RuntimeException("Failed to encode flow name: " + flow.getName(), e);
    }
  }

  protected String findChromeExecutable() {
    String[] paths = {
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/google-chrome"
      // "google-chrome"
    };
    for ( String path : paths ) {
      File file = new File(path);
      if ( file.exists() || "google-chrome".equals(path) ) return path;
    }
    throw new RuntimeException("Google Chrome executable not found.");
  }

  protected String[] buildChromeCommand(String flowURL, String chromeExe, boolean headless, int timeoutSeconds) {
    if ( headless ) {
      return new String[] {
        chromeExe, "--headless", "--disable-gpu", "--no-sandbox",
        "--disable-dev-shm-usage", "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--run-all-compositor-stages-before-draw",
        "--enable-automation",
        "--remote-debugging-port=9222",
        flowURL
      };
    } else {
      return new String[] {
        chromeExe, "--incognito", "--new-window",
        "--disable-gpu", "--no-sandbox",
        flowURL
      };
    }
  }

  protected Process runChromeCommand(X x, String[] chromeCmd, int timeoutSeconds, String flowName, String runnerId, HeadlessRunnerService headlessRunnerService) throws IOException {
    // Log the full Chrome command being executed
    logInfo(x, "Executing Chrome command: ", String.join(" ", chromeCmd));

    ProcessBuilder pb = new ProcessBuilder(chromeCmd);
    pb.redirectErrorStream(true);
    Process process = pb.start();

    // Start async log reader
    CompletableFuture.runAsync(() -> {
      try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
        String line;
        while ((line = reader.readLine()) != null) {
          logInfo(x, "[CHROME] ", line);
        }
      } catch (IOException e) {
        logDebug(x, "Log reading interrupted: ", e.getMessage());
      }
    });

    return process;
  }

  public String getLogOutput() {
    return logOutput.toString();
  }

}
