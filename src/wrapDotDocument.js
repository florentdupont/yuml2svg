"use strict";

const buildDotHeader = isDark =>
  `graph[fontname=Helvetica${isDark ? ",bgcolor=transparent" : ""}]
    node[shape=none,margin=0,fontname=Helvetica${
      isDark ? ",color=white,fontcolor=white" : ""
    }]
    edge[fontname=Helvetica${isDark ? ",color=white,fontcolor=white" : ""}]`;

module.exports = (document, isDark) =>
  `digraph G{\n${buildDotHeader(isDark)}${document}\n}\n`;
