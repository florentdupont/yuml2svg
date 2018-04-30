const Viz = require("viz.js");

if (typeof IS_BROWSER === "undefined") IS_BROWSER = false;

if (!IS_BROWSER) {
  const { Module, render } = require("viz.js/full.js.opaque");
}

module.exports = (dot, vizOptions) => {
  if (!vizOptions) {
    vizOptions = { Module, render };
  }
  return new Viz(vizOptions).renderString(dot);
};
