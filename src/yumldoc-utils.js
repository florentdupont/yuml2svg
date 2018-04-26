const fs = require("fs");
const Viz = require("viz.js");

const processEmbeddedImages = require("./svg-utils.js");
const { buildDotHeader } = require("./yuml2dot-utils");

const diagramTypes = {
  class: require("./class-diagram.js"),
  usecase: require("./usecase-diagram.js"),
  activity: require("./activity-diagram.js"),
  state: require("./state-diagram.js"),
  deployment: require("./deployment-diagram.js"),
  package: require("./package-diagram.js"),
};

const directions = {
  topDown: "TB",
  leftToRight: "LR",
  rightToLeft: "RL",
};

/**
 * Generates SVG diagram.
 * @param {string} text The yUML document to parse
 * @param {boolean} isDark
 * @param {object} [options] - The options to be set for generating the SVG
 * @param {string} [options.dir] - The direction of the diagram "TB" (default) - topDown, "LR" - leftToRight, "RL" - rightToLeft
 * @param {string} [options.type] - The type of SVG - "class" (default), "usecase", "activity", "state", "deployment", "package".
 */
const processYumlDocument = function(text, isDark, options) {
  if (!options) options = {};
  if (!options.dir) options.dir = "TB";
  if (!options.type) options.type = "class";

  isDark = !!isDark;

  const lines = text.split(/\r|\n/).map(line => line.trim());
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
    const renderingFunction = diagramTypes[options.type];
    const dot = buildDotHeader(isDark) + renderingFunction(newlines, options);

    return processEmbeddedImages(Viz(dot), isDark);
  } else {
    throw new Error("Invalid diagram type");
  }
};

let processDirectives = function(line, options) {
  const keyvalue = /^\/\/\s+\{\s*([\w]+)\s*:\s*([\w]+)\s*\}$/.exec(line); // extracts directives as:  // {key:value}
  if (keyvalue !== null && keyvalue.length === 3) {
    const [_, key, value] = keyvalue;

    switch (key) {
      case "type":
        const diagramTypeNames = Object.keys(diagramTypes);
        if (diagramTypeNames.find(value)) {
          options.type = value;
        } else {
          console.warn(
            new Error(
              "Invalid value for 'type'. Allowed values are: " +
                diagramTypeNames.join(", ")
            )
          );
        }
        break;

      case "direction":
        const directionNames = Object.keys(directions);
        if (directionNames.find(value)) {
          options.dir = directions[value];
        } else {
          console.warn(
            new Error(
              "Invalid value for 'direction'. Allowed values are: " +
                directionNames.join(", ")
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
