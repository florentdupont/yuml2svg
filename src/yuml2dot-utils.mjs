import Color from "color";

export const escape_label = function(label) {
  const ESCAPED_CHARS = {
    "{": "\\{",
    "}": "\\}",
    ";": "\n",
    "<": "\\<",
    ">": "\\>",
  };

  let newLabel = "";
  for (const char of label) {
    newLabel += ESCAPED_CHARS[char] || char;
  }

  return newLabel;
};

export const splitYumlExpr = function*(line, separators, escape = "\\") {
  const SEPARATOR_END = {
    "[": "]",
    "<": ">",
    "(": ")",
    "|": "|",
  };

  let word = "";
  let lastChar;

  const lineLength = line.length;

  for (let i = 0; i < lineLength; i++) {
    const currentChar = line.charAt(i);

    if (currentChar === escape && i + 1 < lineLength) {
      word += currentChar + line.charAt(++i);
    } else if (separators.includes(currentChar) && lastChar === undefined) {
      if (word.length > 0) {
        yield word.trim();
      }

      lastChar = SEPARATOR_END[currentChar];
      word = currentChar;
    } else if (currentChar === lastChar) {
      lastChar = undefined;
      yield word.trim() + currentChar;
      word = "";
    } else {
      word += currentChar;
    }
  }

  if (word.length > 0) {
    yield word.trim();
  }
};

export const extractBgAndNote = function(part, allowNote) {
  const ret = { bg: "", isNote: false, luma: 128 };

  const bgParts = /^(.*)\{ *bg *: *([a-zA-Z]+\d*|#[0-9a-fA-F]{6}) *\}$/.exec(
    part
  );
  if (bgParts !== null && bgParts.length === 3) {
    const bgColor = Color(bgParts[2].trim());
    ret.part = bgParts[1].trim();
    ret.bg = bgColor.hex();
    ret.fontcolor = bgColor.isDark() ? "white" : "black";
  } else {
    ret.part = part.trim();
  }

  if (allowNote && part.startsWith("note:")) {
    ret.part = ret.part.substring(5).trim();
    ret.isNote = true;
  }
  return ret;
};

export const escape_token_escapes = function(spec) {
  return spec.replace("\\[", "\\u005b").replace("\\]", "\\u005d");
};

export const unescape_token_escapes = function(spec) {
  return spec.replace("\\u005b", "[").replace("\\u005d", "]");
};

export const recordName = label =>
  (label.includes("|") ? label.substr(0, label.indexOf("|")) : label).trim();

export const formatLabel = function(label, wrap, allowDivisors) {
  const DIVISOR = "|";
  const lines =
    allowDivisors && label.includes(DIVISOR) ? label.split(DIVISOR) : [label];

  return escape_label(
    lines.map(line => wordwrap(line, wrap, "\n")).join(DIVISOR)
  );
};

export const wordwrap = function(str, width, newline) {
  if (str && str.length >= width) {
    let p = str.lastIndexOf(" ");
    if (p > 0) {
      const left = str.substring(0, p);
      const right = str.substring(p + 1);
      return left + newline + wordwrap(right, width, newline);
    }
  }
  return str;
};

export const serializeDot = function(node) {
  if (
    node.shape &&
    node.shape === "record" &&
    !/^<.+>(|<.+>)*$/.test(node.label)
  ) {
    // Graphviz documentation says (https://www.graphviz.org/doc/info/shapes.html):
    // The record-based shape has largely been superseded and greatly generalized by HTML-like labels.
    // That is, instead of using shape=record, one might consider using shape=none, margin=0 and an HTML-like label. [...]
    // Also note that there are problems using non-trivial edges (edges with ports or labels) between adjacent nodes
    // on the same rank if one or both nodes has a record shape.

    if (node.label.includes("|")) {
      const ESCAPED_CHARS = {
        "\n": "<BR/>",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
      };
      // If label contains a pipe, we need to use an HTML-like label
      return (
        '[fontsize=10,label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="9">' +
        node.label
          .split("|")
          .map(text => {
            let htmlTDNode = "<TD";
            if (text.startsWith("<")) {
              const closingTagPosition = text.indexOf(">");
              htmlTDNode += ` PORT="${text.substr(1, closingTagPosition - 1)}"`;
              text = text.substr(closingTagPosition + 1);
            }
            htmlTDNode += ">";
            for (const char of text) {
              htmlTDNode += ESCAPED_CHARS[char] || char;
            }
            htmlTDNode += "</TD>";
            return `<TR>${htmlTDNode}</TR>`;
          })
          .join("") +
        "</TABLE>>]"
      );
    }

    // To avoid this issue, we can use a "rectangle" shape
    node.shape = "rectangle";
  }
  return (
    "[" +
    Object.keys(node)
      .map(
        key =>
          `${key}=` +
          ("string" === typeof node[key] ? `"${node[key]}"` : node[key])
      )
      .join(" , ") +
    " ]"
  );
};

export const serializeDotElements = function(iterator) {
  let dot = "";

  for (const record of iterator) {
    if (record.length === 2)
      dot += `\t${record[0]} ${serializeDot(record[1])}\n`;
    else if (record.length === 3)
      dot += `\t${record[0]} -> ${record[1]} ${serializeDot(record[2])}\n`;
  }

  return dot;
};
