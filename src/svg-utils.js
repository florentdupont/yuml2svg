const shapes = {
  actor: [
    `<circle cx="0" cy="-20" r="7.5" />
                <line x1="0" y1="-12.5" x2="0" y2="5" />
                <line x1="-15" y1="-5" x2="15" y2="-5" />
                <line x1="0" y1="5" x2="-15" y2="17" />
                <line x1="0" y1="5" x2="15" y2="17" />`,
    0,
    25,
  ],
};

module.exports = function(svg, isDark) {
  const expr = /<text\s.*>{img:.*}.*<\/text>/g;

  svg = svg.replace(expr, function(match) {
    try {
      const parts = /<text\s(.*)>{img:(.*)}(.*)<\/text>/.exec(match);
      let text = "<text " + parts[1] + ">" + parts[3].trim() + "</text>";

      if (!shapes.hasOwnProperty(parts[2])) return text;

      const translate = /<text\s.*x=\"(-?[0-9\.]+)\" y=\"(-?[0-9\.]+)\"/.exec(
        text
      );
      const x = translate[1];
      const y = translate[2];

      const img = shapes[parts[2]];
      text = text.replace(
        ' x="' + x + '"',
        ' x="' + (parseFloat(x) + img[1]) + '"'
      );
      text = text.replace(
        ' y="' + y + '"',
        ' y="' + (parseFloat(y) + img[2]) + '"'
      );

      return (
        '<g transform="translate(' +
        x +
        "," +
        y +
        ')" style="fill:none;stroke:' +
        (isDark ? "white" : "black") +
        ';stroke-width:1px">' +
        img[0] +
        "</g>\n" +
        text
      );
    } catch (e) {
      return match;
    }
  });

  return svg;
};
