/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.core.reflow.dashboard.CanvasTextUtil',

  documentation: `Canvas text layout helpers for chart/legend rendering.
    Chart.js does not wrap legend labels on its own, but its renderer
    accepts an array of strings as an item's text (one entry per line).
    wrap() turns a long string into that array.`,

  methods: [
    {
      name: 'wrap',
      documentation: `Greedy word-boundary wrap that falls back to a
        mid-word break when a single word is wider than maxPx. Uses the
        supplied canvas context for accurate measurement against the
        caller's font. Returns the original string when it already fits
        or when maxPx is non-positive; returns an array of lines when
        a split happened.`,
      code: function(ctx, text, fontStr, maxPx) {
        if ( ! text || maxPx <= 0 ) return text;
        var s = String(text);
        ctx.save();
        if ( fontStr ) ctx.font = fontStr;
        if ( ctx.measureText(s).width <= maxPx ) {
          ctx.restore();
          return s;
        }
        var lines = [];
        var remaining = s;
        while ( remaining.length > 0 ) {
          // Find the longest prefix that fits within maxPx.
          var fitLen = remaining.length;
          while ( fitLen > 0 && ctx.measureText(remaining.slice(0, fitLen)).width > maxPx ) {
            fitLen--;
          }
          if ( fitLen === 0 ) fitLen = 1; // guarantee progress on a single char
          // Prefer a word-boundary split inside the fitting prefix.
          var breakAt = fitLen;
          if ( fitLen < remaining.length ) {
            var spaceIdx = remaining.lastIndexOf(' ', fitLen);
            if ( spaceIdx > 0 ) breakAt = spaceIdx;
          }
          lines.push(remaining.slice(0, breakAt));
          remaining = remaining.slice(breakAt).replace(/^\s+/, '');
        }
        ctx.restore();
        return lines.length > 1 ? lines : s;
      }
    },

    {
      name: 'legendLabelFont',
      documentation: `Builds the CSS font string Chart.js would use for a
        legend item, falling back to chart.options.font then Chart.js
        defaults. Pass the chart instance; returns a string suitable for
        ctx.font.`,
      code: function(chart) {
        var labelOpts = chart.options.plugins.legend.labels || {};
        var f = labelOpts.font || chart.options.font || {};
        return (f.weight || 'normal') + ' ' +
               (f.size   || 12) + 'px ' +
               (f.family || 'sans-serif');
      }
    },

    {
      name: 'legendLabelChromePx',
      documentation: `Horizontal overhead Chart.js reserves per legend
        item for the swatch + inner/outer padding, before any text is
        drawn. Used to derive the per-line text area from the overall
        legend.maxWidth.`,
      code: function(chart) {
        var labelOpts = chart.options.plugins.legend.labels || {};
        var boxWidth  = labelOpts.boxWidth !== undefined ? labelOpts.boxWidth : 40;
        var padding   = labelOpts.padding  !== undefined ? labelOpts.padding  : 10;
        // Chart.js v4 item layout (right/left position):
        //   boxWidth + (boxWidth / 2) + textWidth + outer padding × 2.
        return boxWidth + (boxWidth / 2) + (padding * 2);
      }
    },

    {
      name: 'padWidestToMin',
      documentation: `Chart.js v4 has no legend.minWidth — a legend
        naturally shrinks to its widest label. This pads the widest
        label's widest line with trailing non-breaking spaces until its
        measured width is at least minPx. Other items stay natural;
        Chart.js's legend column width tracks the widest item, so
        padding one item is enough to force the whole legend to minPx.
        Mutates the items' text in place and returns the items.`,
      code: function(ctx, items, fontStr, minPx) {
        if ( minPx <= 0 || ! items || items.length === 0 ) return items;
        ctx.save();
        if ( fontStr ) ctx.font = fontStr;

        // Find the widest line across all items (accounting for array-text
        // multi-line labels) and remember where it lives.
        var bestWidth = 0, bestItemIdx = -1, bestLineIdx = -1;
        for ( var i = 0 ; i < items.length ; i++ ) {
          var t = items[i].text;
          var lines = Array.isArray(t) ? t : [t];
          for ( var k = 0 ; k < lines.length ; k++ ) {
            var w = ctx.measureText(lines[k]).width;
            if ( w > bestWidth ) {
              bestWidth = w;
              bestItemIdx = i;
              bestLineIdx = k;
            }
          }
        }
        if ( bestItemIdx < 0 || bestWidth >= minPx ) { ctx.restore(); return items; }

        // Non-breaking space so Chart.js (and whatever layout rtrims plain
        // spaces) keeps the pad intact at draw time.
        var NBSP = ' ';
        var target = items[bestItemIdx];
        var line = Array.isArray(target.text) ? target.text[bestLineIdx] : target.text;
        var padded = line;
        // Binary-growth then fine tune: start with a single NBSP run,
        // double until it overshoots, then trim back one at a time.
        var run = NBSP;
        while ( ctx.measureText(padded + run).width < minPx ) {
          padded += run;
          if ( run.length < 64 ) run += run; // geometric growth caps overshoot
        }
        while ( padded.length > line.length && ctx.measureText(padded).width > minPx ) {
          padded = padded.slice(0, -1);
        }
        if ( Array.isArray(target.text) ) {
          target.text[bestLineIdx] = padded;
        } else {
          target.text = padded;
        }
        ctx.restore();
        return items;
      }
    }
  ]
});
