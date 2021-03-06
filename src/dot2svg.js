"use strict";

const Viz = require("viz.js");

if (typeof IS_BROWSER === "undefined" || !IS_BROWSER) {
  var { Module, render } = require("viz.js/full.render");
  var viz = new Viz({ Module, render });
}

/**
 *
 * @param {string} dot The graph to render, as DOT
 * @param {object} [vizOptions] @see https://github.com/mdaines/viz.js/wiki/API#new-vizoptions
 * @param {object} [renderOptions] @see https://github.com/mdaines/viz.js/wiki/API#render-options
 */
module.exports = (dot, vizOptions, renderOptions) => {
  const renderer = vizOptions ? new Viz(vizOptions) : viz;
  return renderer.renderString(dot, renderOptions).catch(err => {
    /** @see https://github.com/mdaines/viz.js/wiki/Caveats */
    if (!vizOptions) {
      viz = new Viz({ Module, render });
    }
    throw err;
  });
};
