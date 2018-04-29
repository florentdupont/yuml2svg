const Viz = require("viz.js");
const { Module, render } = require("viz.js/full.js.opaque");

    
module.exports = dot => require("fs/promises").writeFile("./output.dot", dot).then(()=>new Viz({ Module, render }).renderString(dot));
