"use strict";

if (!Object.entries)
  Object.entries = function(obj) {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    const resArray = new Array(i);

    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  };

const DEFAULT_FONT = "Helvetica";

const DEFAULT_HEADER = {
  graph: {},
  node: { shape: "none", margin: 0 },
  edge: {},
};

const DARK_HEADER = {
  graph: { bgcolor: "transparent" },
  node: { color: "white", fontcolor: "white" },
  edge: { color: "white", fontcolor: "white" },
};

module.exports = (document, isDark, overrides = {}) =>
  Object.entries(DEFAULT_HEADER).reduce(
    (pv, [type, defaultSettings]) =>
      `${pv}\n\t${type}[${Object.entries(
        Object.assign(
          {
            fontname: DEFAULT_FONT,
          },
          defaultSettings,
          DARK_HEADER[isDark && type],
          overrides[type]
        )
      )
        .map(entry => entry.join("="))
        .join(",")}]`,
    "digraph G{"
  ) +
  document +
  "\n}\n";
