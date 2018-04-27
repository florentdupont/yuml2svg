const shapes = {
  actor: {
    svgNodes: [
      '<circle cx="0" cy="-20" r="7.5" />',
      '<line x1="0" y1="-12.5" x2="0" y2="5" />',
      '<line x1="-15" y1="-5" x2="15" y2="-5" />',
      '<line x1="0" y1="5" x2="-15" y2="17" />',
      '<line x1="0" y1="5" x2="15" y2="17" />',
    ],
    translateX: 0,
    translateY: 25,
  },
};

/**
 * Process embedded shapes {img:shapeName}
 * @param {string} svg
 * @param {boolean} isDark
 * @returns {string}
 */
module.exports = function(svg, isDark) {
  const expr = /<text\s(.*)>{img:(.*)}(.*)<\/text>/g;

  return svg.replace(expr, function(match, attributes, shapeName, label) {
    try {
      const textNode = `<text ${attributes}>${label.trim()}</text>`;

      if (shapeName in shapes) {
        const img = shapes[shapeName];
        const [
          _,
          translateX,
          translateY,
        ] = /<text\s.*x=\"(-?[0-9\.]+)\" y=\"(-?[0-9\.]+)\"/.exec(textNode);

        return (
          `<g transform="translate(${translateX}, ${translateY})" style="fill:none;stroke:${
            isDark ? "white" : "black"
          };stroke-width:1px">${img.svgNode.join("")}</g>\n` +
          textNode
            .replace(
              ' x="' + x + '"',
              ' x="' + (parseFloat(translateX) + img.translateX) + '"'
            )
            .replace(
              ' y="' + y + '"',
              ' y="' + (parseFloat(translateY) + img.translateY) + '"'
            )
        );
      } else {
        console.warn(new Error(`Unknown shape '${shapeName}'`));
        return textNode;
      }
    } catch (e) {
      console.warn(e);
      return match;
    }
  });
};
