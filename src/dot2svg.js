const Viz = require("viz.js");
const { Module, render } = require("viz.js/full.js.opaque");

module.exports = (dot, vizOptions) => {
  if (!vizOptions) {
    vizOptions = { Module, render };
  }
  return new Viz(vizOptions).renderString(dot);
};
