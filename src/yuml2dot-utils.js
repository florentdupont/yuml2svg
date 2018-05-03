"use strict";

const Color = require("color");

const escape_label = function(label) {
  let newlabel = "";
  for (let i = 0; i < label.length; i++)
    newlabel += replaceChar(label.charAt(i));

  function replaceChar(c) {
    c = c.replace("{", "\\{").replace("}", "\\}");
    c = c.replace(";", "\\n");
    c = c.replace(" ", "\\ ");
    c = c.replace("<", "\\<").replace(">", "\\>");
    // c = c.replace('\\n\\n', '\\n');
    return c;
  }

  return newlabel;
};

const splitYumlExpr = function(line, separators, escape = "\\") {
  let word = "";
  let lastChar = null;
  const parts = [];

  for (let i = 0; i < line.length; i++) {
    let currentWord = line[i];

    if (currentWord === escape && i + 1 < line.length) {
      word += currentWord;
      word += line[++i];
    } else if (separators.indexOf(currentWord) >= 0 && lastChar === null) {
      if (word.length > 0) {
        parts.push(word.trim());
        word = "";
      }

      switch (currentWord) {
        case "[":
          lastChar = "]";
          break;
        case "(":
          lastChar = ")";
          break;
        case "<":
          lastChar = ">";
          break;
        case "|":
          lastChar = "|";
          break;
        default:
          lastChar = null;
          break;
      }
      word = currentWord;
    } else if (currentWord === lastChar) {
      lastChar = null;
      parts.push(word.trim() + currentWord);
      word = "";
    } else {
      word += currentWord;
    }
  }

  if (word.length > 0) parts.push(word.trim());

  return parts;
};

const extractBgAndNote = function(part, allowNote) {
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

const escape_token_escapes = function(spec) {
  return spec.replace("\\[", "\\u005b").replace("\\]", "\\u005d");
};

const unescape_token_escapes = function(spec) {
  return spec.replace("\\u005b", "[").replace("\\u005d", "]");
};

const recordName = function(label) {
  return label.split("|")[0].trim();
};

const formatLabel = function(label, wrap, allowDivisors) {
  let lines = [label];

  if (allowDivisors && label.indexOf("|") >= 0) lines = label.split("|");

  for (let j = 0; j < lines.length; j++)
    lines[j] = wordwrap(lines[j], wrap, "\\n");

  label = lines.join("|");

  return escape_label(label);
};

const wordwrap = function(str, width, newline) {
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

const serializeDot = function(node) {
  if (node.shape && node.shape === "record") {
    // Graphviz documentation says (https://www.graphviz.org/doc/info/shapes.html):
    // The record-based shape has largely been superseded and greatly generalized by HTML-like labels.
    // That is, instead of using shape=record, one might consider using shape=none, margin=0 and an HTML-like label. [...]
    // Also note that there are problems using non-trivial edges (edges with ports or labels) between adjacent nodes
    // on the same rank if one or both nodes has a record shape.

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

const serializeDotElements = function(arr) {
  let dot = "";

  for (let record of arr) {
    if (record.length === 2)
      dot += `    ${record[0]} ${serializeDot(record[1])}\n`;
    else if (record.length === 3)
      dot += `    ${record[0]} -> ${record[1]} ${serializeDot(record[2])}\n`;
  }

  return dot;
};

const buildDotHeader = function(isDark) {
  let header = "digraph G {\n";

  if (isDark) {
    header += "  graph [ bgcolor=transparent, fontname=Helvetica ]\n";
    header += "  node [ color=white, fontcolor=white, fontname=Helvetica ]\n";
    header += "  edge [ color=white, fontcolor=white, fontname=Helvetica ]\n";
  } else {
    header += "  graph [ fontname=Helvetica ]\n";
    header += "  node [ fontname=Helvetica ]\n";
    header += "  edge [ fontname=Helvetica ]\n";
  }
  return header;
};

module.exports = {
  buildDotHeader,
  escape_label,
  escape_token_escapes,
  extractBgAndNote,
  formatLabel,
  unescape_token_escapes,
  recordName,
  serializeDot,
  serializeDotElements,
  splitYumlExpr,
  wordwrap,
};
