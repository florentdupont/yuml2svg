const fs = require("fs");

const dot2svg = require("./dot2svg");
const processEmbeddedImages = require("./svg-utils");
const { buildDotHeader } = require("./yuml2dot-utils");

const diagramTypes = {
  class: require("./class-diagram"),
  usecase: require("./usecase-diagram"),
  activity: require("./activity-diagram"),
  state: require("./state-diagram"),
  deployment: require("./deployment-diagram"),
  package: require("./package-diagram"),
  sequence: require("./sequence-diagram"),
};

const directions = {
  topDown: "TB",
  leftToRight: "LR",
  rightToLeft: "RL",
};

/**
 * Generates SVG diagram.
 * @param {string | Buffer} text The yUML document to parse
 * @param {object} [options] - The options to be set for generating the SVG
 * @param {string} [options.dir] - The direction of the diagram "TB" (default) - topDown, "LR" - leftToRight, "RL" - rightToLeft
 * @param {string} [options.type] - The type of SVG - "class" (default), "usecase", "activity", "state", "deployment", "package".
 * @param {string} [options.isDark] - Option to get dark or light diagram
 * @returns {Promise<string>} The rendered diagram as a SVG document
 */
const processYumlDocument = function(text, options) {
  if (!options) options = {};
  if (!options.dir) options.dir = "TB";
  if (!options.type) options.type = "class";
  if (!options.isDark) options.isDark = false;

  const lines = text
    .toString()
    .split(/\r|\n/)
    .map(line => line.trim());
  const newlines = [];

  for (const line of lines) {
    if (line.startsWith("//")) {
      processDirectives(line, options);
    } else if (line.length > 0) {
      newlines.push(line);
    }
  }

  if (newlines.length === 0) {
    return "";
  }

  if (!options.hasOwnProperty("type")) {
    throw new Error("Error: Missing mandatory 'type' directive");
  }

  if (options.type in diagramTypes) {
    const { isDark } = options;

    const renderingFunction = diagramTypes[options.type];
    const rendered = renderingFunction(newlines, options);

    // Sequence diagrams are rendered as SVG, not dot file -- and have no embedded images (I guess)
    return options.type === "sequence"
      ? Promise.resolve(rendered)
      : dot2svg(buildDotHeader(isDark) + rendered).then(svg =>
          processEmbeddedImages(svg, isDark)
        );
  } else {
    throw new Error("Invalid diagram type");
  }
};

const processDirectives = function(line, options) {
  const keyValue = /^\/\/\s+\{\s*([\w]+)\s*:\s*([\w]+)\s*\}$/.exec(line); // extracts directives as:  // {key:value}
  if (keyValue !== null && keyValue.length === 3) {
    const [_, key, value] = keyValue;

    switch (key) {
      case "type":
        if (value in diagramTypes) {
          options.type = value;
        } else {
          console.warn(
            new Error(
              "Invalid value for 'type'. Allowed values are: " +
                Object.keys(diagramTypes).join(", ")
            )
          );
        }
        break;

      case "direction":
        if (value in directions) {
          options.dir = directions[value];
        } else {
          console.warn(
            new Error(
              "Invalid value for 'direction'. Allowed values are: " +
                Object.keys(directions).join(", ")
            )
          );
        }
        break;

      case "generate":
        if (/^(true|false)$/.test(value)) {
          options.generate = value === "true";
          console.warn("Generate option is not supported");
        } else {
          console.warn(
            new Error(
              "Error: invalid value for 'generate'. Allowed values are: true, false <i>(default)</i>."
            )
          );
        }
    }
  }
};

module.exports = processYumlDocument;
