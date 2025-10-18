/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.http.csp',
  name: 'CSPFilter',

  documentation: `Content-Security-Policy servlet filter.
Attempts to find a 'domain' specific policy via ThemeDomain.
NOTE: A http CSpec CONTENT_SECURITY_POLICY supersedes all for backward compatibility.
By default the system will use the 'default' CSP. To override,
either override the 'default' CSP in an application level csps.jrl,
or add a new CSP and set it's 'id' in ThemeDomain.contentSecurityPolicy.
To completely disable CSP:
- globally: Create an application level CSP (csps.jrl) for id 'default' with an empty policy.
- per domain: Create an application level ThemeDomain (themeDomains.jrl) with 'none' as the contentSecurityPolicy value.
`,

  javaImplements: [ 'jakarta.servlet.Filter' ],

  javaImports: [
    'foam.core.theme.ThemeDomain',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.lang.Detachable',
    'foam.lang.X',
    'foam.lang.XLocator',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.mlang.predicate.Predicate',
    'foam.util.SafetyUtil',
    'jakarta.servlet.*',
    'jakarta.servlet.http.HttpServletResponse',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.Map'
  ],

  constants: [
    {
      documenatation: 'Deprecated HttpServer CSPFilter initParameters key.',
      name: 'CONTENT_SECURITY_POLICY',
      type: 'String',
      value: 'CONTENT_SECURITY_POLICY'
    },
    {
      documentation: 'Sytem provided CSP when none explicitly configured by the application',
      name: 'DEFAULT',
      type: 'String',
      value: 'defualt'
    },
    {
      documentation: 'Cache key when no policy found.',
      name: 'NONE',
      type: 'String',
      value: 'none'
    }
  ],

  properties: [
    {
      documentation: `Provides backward compatibility for http CSpecs
which provide CONTENT_SECURITY_POLICY as init parameters of CSPFilter.`,
      name: 'initParameterCSP',
      class: 'String',
      visibility: 'HIDDEN'
    },
    {
      name: 'cache',
      class: 'Map',
      javaFactory: 'return new ConcurrentHashMap();',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'init',
      args: 'FilterConfig config',
      javaThrows: [ 'ServletException' ],
      javaCode: `
        setInitParameterCSP(config.getInitParameter(CONTENT_SECURITY_POLICY));

        X x = (X) config.getServletContext().getAttribute("X");
        DAO themeDomainDAO = (DAO) x.get("themeDomainDAO");
        themeDomainDAO.listen(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            getCache().clear();
          }
        }, null);

        DAO cspDAO = (DAO) x.get("cspDAO");
        cspDAO.listen(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            getCache().clear();
          }
        }, null);
      `
    },
    {
      name: 'doFilter',
      args: 'ServletRequest request, ServletResponse response, FilterChain chain',
      javaThrows: [ 'java.io.IOException', 'ServletException' ],
      javaCode: `
        String policy = getPolicy((X) request.getServletContext().getAttribute("X"), request.getServerName());
        if ( ! SafetyUtil.isEmpty(policy) &&
             ! policy.equals(NONE) ) {
          ((HttpServletResponse) response).setHeader("Content-Security-Policy", policy);
        }

        chain.doFilter(request, response);
      `
    },
    {
      name: 'destroy',
      javaCode: '// noop'
    },
    {
      name: 'getPolicy',
      args: 'X x, String domain',
      type: 'String',
      javaCode: `
        String policy = (String) getCache().get(domain);
        if ( SafetyUtil.isEmpty(policy) ) {
          policy = getInitParameterCSP();
        }
        if ( SafetyUtil.isEmpty(policy) ) {
          // Default to the 'default' policy so no additional configuration
          // is required to get a secure system.

          String name = DEFAULT;
          DAO themeDomainDAO = (DAO) x.get("themeDomainDAO");
          if ( themeDomainDAO != null ) {
            ThemeDomain themeDomain = (ThemeDomain) themeDomainDAO.find(domain);
            if ( themeDomain != null ) {
              name = themeDomain.getContentSecurityPolicy();
            }
          }
          DAO cspDAO = (DAO) x.get("cspDAO");
          CSP csp = (CSP) cspDAO.find(name);
          if ( csp != null &&
               ! SafetyUtil.isEmpty(csp.getPolicy()) ) {
            foam.core.logger.StdoutLogger.instance().info("CSPFilter,doFilter,found domain policy for", domain);
            policy = csp.getPolicy();
            policy = policy.replaceAll("\\n", "");
          } else {
            policy = NONE;
          }

          getCache().put(domain, policy);
        }
        return policy;
      `
    }
  ]
});
