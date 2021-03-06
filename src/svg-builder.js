"use strict";

const getDOMWindow = require("./get-dom-window");

const NS = "http://www.w3.org/2000/svg";
const FONT_SIZE = 18;
const CHAR_WIDTH = 8.5;

const WHITE = "#fff";
const BLACK = "#000";

module.exports = function(isDark) {
  const { document } = getDOMWindow();
  const svgElement = document.createElement("svg");
  svgElement.setAttribute("xmlns", NS);

  this.getDocument = function() {
    return svgElement;
  };

  this.setDocumentSize = function(width, height) {
    const svg = this.getDocument();
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
  };

  this.createRect = function(width, height) {
    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute(
      "style",
      `stroke-width:1;fill:none;stroke:${isDark ? WHITE : BLACK};`
    );

    return rect;
  };

  this.createText = function(message, x, y, color) {
    const g = document.createElementNS(NS, "g");
    const lines = message.split("\n");

    y -= ((lines.length - 1) / 2) * FONT_SIZE;

    for (const lineText of lines) {
      const text = document.createElementNS(NS, "text");
      text.textContent = lineText;
      text.setAttribute("fill", color || isDark ? WHITE : BLACK);

      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.style.textAnchor = "middle";
      text.style.alignmentBaseline = "central";

      y += FONT_SIZE;

      g.appendChild(text);
    }

    return g;
  };

  this.getTextSize = function(text) {
    const lines = text.split("\n");
    const width = CHAR_WIDTH * Math.max(...lines.map(line => line.length));

    return { x: 0, y: 0, width, height: FONT_SIZE * lines.length };
  };

  this.createPath = function(format, lineType) {
    const args = arguments;
    const pathSpec = format.replace(/\{(\d+)\}/g, function(string, index) {
      return args[parseInt(index) + 2];
    });

    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", pathSpec);
    path.setAttribute(
      "style",
      `stroke-width:1;fill:none;stroke:${isDark ? WHITE : BLACK};`
    );

    if (lineType === "dashed") {
      path.setAttribute("stroke-dasharray", "7,4");
    }

    return path;
  };

  this.serialize = function() {
    return this.getDocument().outerHTML;
  };
};
