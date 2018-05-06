"use strict";

const Viz = require("viz.js");

if (typeof IS_BROWSER === "undefined" || !IS_BROWSER) {
  var { Module, render } = require("viz.js/full.js.opaque");
  var viz = new Viz({ Module, render });
}

module.exports = (dot, vizOptions) => {
  const rendered = vizOptions ? new Viz(vizOptions) : viz;
  return viz.renderString(dot);
};
