const Viz = require("viz.js");
const { Module, render } = require("viz.js/full.js.opaque");

module.exports = dot => new Viz({ Module, render }).renderString(dot);
