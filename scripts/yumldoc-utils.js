const fs = require("fs");
const Viz = require("viz.js");

const classDiagram = require("./class-diagram.js");
const usecaseDiagram = require("./usecase-diagram.js");
const activityDiagram = require("./activity-diagram.js");
const stateDiagram = require("./state-diagram.js");
const deploymentDiagram = require("./deployment-diagram.js");
const packageDiagram = require("./package-diagram.js");
const processEmbeddedImages = require("./svg-utils.js");
const { buildDotHeader } = require("./yuml2dot-utils");

const SVGError = errorMessage =>
  "<svg xmlns='http://www.w3.org/2000/svg' width='350' height='30'>" +
  "<text fill='red' x='10' y='20'>" +
  errorMessage +
  "</text>" +
  "</svg>";

/**
 * Generates SVG diagram.
 * @param {string} text The yUML document to parse
 * @param {boolean} isDark
 * @param {object} [options] - The options to be set for generating the SVG
 * @param {string} [options.dir] - The direction of the diagram "TB" (default) - topDown, "LR" - leftToRight, "RL" - rightToLeft
 * @param {string} [options.type] - The type of SVG - "class" (default), "usecase", "activity", "state", "deployment", "package".
 * @param {boolean} [options.generate] - Indicates if a .svg file shall be generated on each save.
 */
const processYumlDocument = function(text, isDark, options) {
  const newlines = [];
  if (!options) options = {};
  if (!options.dir) options.dir = "TB";
  if (!options.type) options.type = "class";
  if (options.generate === null || options.generate === undefined) options.generate = false;

  const lines = text.split(/\r|\n/).map(line => line.trim());

  for (let line of lines) {
    if (line.startsWith("//")) {
      processDirectives(line, options);
    } else if (line.length > 0) {
      newlines.push(line);
    }
  }

  if (newlines.length === 0) return "";

  if (!options.hasOwnProperty("type")) {
    options.error = "Error: Missing mandatory 'type' directive";
  }

  if (options.hasOwnProperty("error")) {
    return SVGError(options.error);
  }

  let dot = null;

  try {
    switch (options.type) {
      case "class":
        dot = classDiagram(newlines, options);
        break;
      case "usecase":
        dot = usecaseDiagram(newlines, options);
        break;
      case "activity":
        dot = activityDiagram(newlines, options);
        break;
      case "state":
        dot = stateDiagram(newlines, options);
        break;
      case "deployment":
        dot = deploymentDiagram(newlines, options);
        break;
      case "package":
        dot = packageDiagram(newlines, options);
        break;
    }
  } catch (e) {
    console.error(e);
    return SVGError("Rendering failed, see console for more info!");
  }

  if (dot === null) return SVGError("Error: unable to parse the yUML file");

  let svgLight, svgDark;
  try {
    svgLight = Viz(buildDotHeader(!!isDark) + dot);
    svgLight = processEmbeddedImages(svgLight, false);

    // svgDark = Viz(buildDotHeader(true) + dot);
    // svgDark = processEmbeddedImages(svgDark, true);
  } catch (e) {
    console.error(e);
    return SVGError("Error composing the diagram");
  }

  return svgLight;
};

let processDirectives = function(line, options) {
  const directions = {
    leftToRight: "LR",
    rightToLeft: "RL",
    topDown: "TB",
  };

  const keyvalue = /^\/\/\s+\{\s*([\w]+)\s*:\s*([\w]+)\s*\}$/.exec(line); // extracts directives as:  // {key:value}
  if (keyvalue !== null && keyvalue.length === 3) {
    const key = keyvalue[1];
    const value = keyvalue[2];

    switch (key) {
      case "type":
        if (/^(class|usecase|activity|state|deployment|package)$/.test(value))
          options.type = value;
        else {
          options.error =
            "Error: invalid value for 'type'. Allowed values are: class, usecase, activity, state, deployment, package.";
          return;
        }
        break;
      case "direction":
        if (/^(leftToRight|rightToLeft|topDown)$/.test(value))
          options.dir = directions[value];
        else {
          options.error =
            "Error: invalid value for 'direction'. Allowed values are: leftToRight, rightToLeft, topDown <i>(default)</i>.";
          return;
        }
        break;
      case "generate":
        if (/^(true|false)$/.test(value)) options.generate = value === "true";
        else {
          options.error =
            "Error: invalid value for 'generate'. Allowed values are: true, false <i>(default)</i>.";
          return;
        }
    }
  }
};

module.exports = processYumlDocument;
