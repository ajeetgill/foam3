/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Single source of truth for date-grouping expressions.
 *
 * Each entry ties one expr class to:
 *   calculate(periodCount) -> { minDate, maxDate }   (for the DAO filter)
 *   parse(key)             -> Date | null           (group key -> axis position)
 *
 * An expr NOT listed here carries no recoverable date — DateToHHExpr,
 * DateToHHMMExpr and DateToHHMMSSExpr emit a time of day with no date,
 * so they must stay on the category axis.
 */

(function() {

// Shared by the two day-granularity entries below.
var reflowDailyCalculate_ = function(periodCount) {
  var minDate = new Date();
  var maxDate = new Date();
  minDate.setDate(minDate.getDate() - (periodCount - 1));
  minDate.setHours(0, 0, 0, 0);
  maxDate.setHours(23, 59, 59, 999);
  return { minDate: minDate, maxDate: maxDate };
};

var reflowDayStart_ = function(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

var reflowNextDay_ = function(d) {
  var u = new Date(d);
  u.setUTCDate(u.getUTCDate() + 1);
  return u;
};

foam.LIB({
  name: 'foam.core.reflow.dashboard.DateKeys',

  constants: {
        ENTRIES: [
      {
        exprClassNames: ['foam.mlang.expr.DateToWeekExpr'],
        calculate: function(periodCount) { /* yours, unchanged */ },
        parse: function(key) { /* yours, unchanged */ },
        periodStart: function(d) {
          var u = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
          var dow = u.getUTCDay() || 7;            // Mon=1 ... Sun=7
          u.setUTCDate(u.getUTCDate() - (dow - 1));
          return u;
        },
        next: function(d) {
          var u = new Date(d);
          u.setUTCDate(u.getUTCDate() + 7);
          return u;
        }
      },
      {
        exprClassNames: ['foam.mlang.expr.DateToQuarterExpr'],
        calculate: function(periodCount) { /* yours */ },
        parse: function(key) { /* yours */ },
        periodStart: function(d) {
          return new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3, 1));
        },
        next: function(d) {
          var u = new Date(d);
          u.setUTCMonth(u.getUTCMonth() + 3);
          return u;
        }
      },
      {
        exprClassNames: ['foam.mlang.expr.DateToYYYYMMExpr'],
        calculate: function(periodCount) { /* yours */ },
        parse: function(key) { /* yours */ },
        periodStart: function(d) {
          return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
        },
        next: function(d) {
          var u = new Date(d);
          u.setUTCMonth(u.getUTCMonth() + 1);
          return u;
        }
      },
      {
        exprClassNames: ['foam.mlang.expr.DateToYYYYExpr'],
        calculate: function(periodCount) { /* yours */ },
        parse: function(key) { /* yours */ },
        periodStart: function(d) {
          return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        },
        next: function(d) {
          var u = new Date(d);
          u.setUTCFullYear(u.getUTCFullYear() + 1);
          return u;
        }
      },
      {
        exprClassNames: ['foam.mlang.expr.DateToYYYYMMDDExpr'],
        calculate: reflowDailyCalculate_,
        parse: function(key) { /* yours */ },
        periodStart: reflowDayStart_,
        next: reflowNextDay_
      },
      {
        exprClassNames: ['foam.mlang.expr.DateToDayOfYearExpr'],
        calculate: reflowDailyCalculate_,
        parse: function(key) { /* yours */ },
        periodStart: reflowDayStart_,
        next: reflowNextDay_
      }
    ]
  },

  methods: [
    function entryFor(expr) {
      if ( ! expr ) return null;
      var es = this.ENTRIES;
      for ( var i = 0; i < es.length; i++ ) {
        for ( var j = 0; j < es[i].exprClassNames.length; j++ ) {
          var cls = foam.lookup(es[i].exprClassNames[j], true);
          if ( cls && cls.isInstance(expr) ) return es[i];
        }
      }
      return null;
    },

    function isTemporal(expr) {
      return !! this.entryFor(expr);
    },

    function parse(expr, key) {
      var e = this.entryFor(expr);
      return e ? e.parse(key) : null;
    },

    function calculatorFor(expr) {
      var e = this.entryFor(expr);
      return e ? e.calculate : null;
    }
  ]
});

})();