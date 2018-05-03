"use strict";

const getDOMWindow = require("./get-dom-window");

const NS = "http://www.w3.org/2000/svg";

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
      "stroke-width: 1; fill: none; stroke: " + (isDark ? "white;" : "black;")
    );

    return rect;
  };

  this.createText = function(message, x, y, color) {
    const g = document.createElementNS(NS, "g");
    const lines = message.split("\n");

    y -= (lines.length - 1) / 2 * 18;

    for (let i = 0; i < lines.length; i++) {
      const text = document.createElementNS(NS, "text");
      text.textContent = lines[i];
      text.setAttribute("fill", color || isDark ? "white" : "black");

      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.style.textAnchor = "middle";
      text.style.alignmentBaseline = "central";

      y += 18;

      g.appendChild(text);
    }

    return g;
  };

  this.getTextSize = function(text) {
    let width = 0;
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      width = Math.max(width, 8.5 * lines[i].length);
    }

    return { x: 0, y: 0, width, height: 18 * lines.length };
  };

  this.createPath = function(format, linetype) {
    const args = arguments;
    const pathSpec = format.replace(/\{(\d+)\}/g, function(string, index) {
      return args[parseInt(index) + 2];
    });

    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", pathSpec);
    path.setAttribute(
      "style",
      "stroke-width: 1; fill: none; stroke: " + (isDark ? "white;" : "black;")
    );

    if (linetype === "dashed") path.setAttribute("stroke-dasharray", "7,4");

    return path;
  };

  this.serialize = function() {
    return this.getDocument().outerHTML;
  };
};
