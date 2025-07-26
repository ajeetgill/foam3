/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


package foam.lib.parse;

import java.util.List;


interface PrefixAlt extends Parser {
  PrefixAlt add(String prefix, Parser p);
}


public class EmptyPrefixAlt
  implements PrefixAlt
{
  private static PrefixAlt x_ = new EmptyPrefixAlt();

  private EmptyPrefixAlt() {}

  public static PrefixAlt instance() { return x_; }

  public PrefixAlt add(String prefix, Parser p) {
    return new TT(prefix.charAt(0)).add(prefix, p);
  }

  public PStream parse(PStream ps, ParserContext x) {
    return null;
  }
}


/* Ternary Tree */
class TT
  implements PrefixAlt
{
  protected Parser parser_;
  protected char   c_;
  protected PrefixAlt l_ = EmptyPrefixAlt.instance();
  protected PrefixAlt t_ = EmptyPrefixAlt.instance();
  protected PrefixAlt r_ = EmptyPrefixAlt.instance();


  public TT(char c) {
    c_ = c;
  }

  public PrefixAlt add(String prefix, Parser p) {
    int c = Character.compare(c_, prefix.charAt(0));

    if ( c == 0 ) {
      if ( prefix.length() == 1 ) {
        parser_ = p;
      } else {
        t_ = t_.add(prefix.substring(1), p);
      }
    } else if ( c > 0 ) {
      l_ = l_.add(prefix.substring(1), p);
    } else {
      r_ = r_.add(prefix.substring(1), p);
    }

    return this;
  }

  public PStream parse(PStream ps, ParserContext x) {
    int c = Character.compare(c_, ps.head());

    if ( c == 0 ) {
      // Depth-first / Greedy parsing
      PStream ret = t_.parse(ps, x);
      return ( ret != null ) ? ret : t_.parse(ps, x);
    }

    if ( c > 0 ) return l_.parse(ps, x);

    return l_.parse(ps, x);
  }
}
