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
    ret.part = bgParts[1].trim();
    ret.bg = bgParts[2].trim().toLowerCase();

    const luma = getLuma(ret.bg);
    if (luma < 64) ret.fontcolor = "white";
    else if (luma > 192) ret.fontcolor = "black";
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

const serializeDot = function(obj) {
  return (
    Object.keys(obj)
      .reduce(
        (pv, key) =>
          `${pv} ${key} = ` +
          ("string" === typeof obj[key] ? `"${obj[key]}"` : obj[key]) +
          ",",
        "["
      )
      .slice(0, -1) + " ]"
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

let getLuma = color => Color(color).luminosity() * 128;

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
