"use strict";

const Viz = require("viz.js");

if (typeof IS_BROWSER === "undefined" || !IS_BROWSER) {
  var { Module, render } = require("viz.js/full.js.opaque");
  var viz = new Viz({ Module, render });
}

module.exports = (dot, vizOptions) => {
  const renderer = vizOptions ? new Viz(vizOptions) : viz;
  return renderer.renderString(dot).catch(err => {
    /** @see https://github.com/mdaines/viz.js/wiki/2.0.0-Caveats */
    if (!vizOptions) {
      viz = new Viz({ Module, render });
    }
    throw err;
  });
};
