"use strict";

const {
  extractBgAndNote,
  formatLabel,
  recordName,
  serializeDot,
  splitYumlExpr,
} = require("./yuml2dot-utils.js");
const Color = require("color");

const RANKSEP = 0.7;

/*
Syntax as specified in yuml.me

Class           [Customer]
Directional     [Customer]->[Order]
Bidirectional   [Customer]<->[Order]
Aggregation     [Customer]+-[Order] or [Customer]<>-[Order]
Composition     [Customer]++-[Order]
Inheritance     [Customer]^[Cool Customer], [Customer]^[Uncool Customer]
Dependencies    [Customer]uses-.->[PaymentStrategy]
Cardinality     [Customer]<1-1..2>[Address]
Labels          [Person]customer-billingAddress[Address]
Notes           [Person]-[Address],[Address]-[note: Value Object]
Full Class      [Customer|Forename;Surname;Email|Save()]
Color splash    [Customer{bg:orange}]<>1->*[Order{bg:green}]
Comment         // Comments
*/

function parseYumlExpr(specLine) {
  const exprs = [];
  const parts = splitYumlExpr(specLine, "[");

  for (const part of parts) {
    if (/^[.*]$/.test(part)) {
      // class box
      const ret = extractBgAndNote(part.substr(1, part.length - 2), true);
      exprs.push([
        ret.isNote ? "note" : "record",
        ret.part,
        ret.bg,
        ret.fontcolor,
      ]);
    } else if (part === "^") {
      // inheritance
      exprs.push(["edge", "empty", "", "none", "", "solid"]);
    } else if (part.indexOf("-") >= 0) {
      // association
      let style;
      let tokens;

      if (part.indexOf("-.-") >= 0) {
        style = "dashed";
        tokens = part.split("-.-");
      } else {
        style = "solid";
        tokens = part.split("-");
      }

      if (tokens.length !== 2)
        throw new Error(`Invalid expression - ${JSON.stringify(tokens)}.`);

      const [left, right] = tokens;

      const processLeft = function(left) {
        if (left.startsWith("<>")) return ["odiamond", left.substring(2)];
        else if (left.startsWith("++")) return ["diamond", left.substring(2)];
        else if (left.startsWith("+")) return ["odiamond", left.substring(1)];
        else if (left.startsWith("<") || left.endsWith(">"))
          return ["vee", left.substring(1)];
        else if (left.startsWith("^")) return ["empty", left.substring(1)];
        else return ["none", left];
      };

      const [leftStyle, leftText] = processLeft(left);

      const processRight = function(right) {
        const len = right.length;

        if (right.endsWith("<>"))
          return ["odiamond", right.substring(0, len - 2)];
        else if (right.endsWith("++"))
          return ["diamond", right.substring(0, len - 2)];
        else if (right.endsWith("+"))
          return ["odiamond", right.substring(0, len - 1)];
        else if (right.endsWith(">"))
          return ["vee", right.substring(0, len - 1)];
        else if (right.endsWith("^"))
          return ["empty", right.substring(0, len - 1)];
        else return processLeft(right);
      };

      const [rightStyle, rightText] = processRight(right);

      exprs.push(["edge", leftStyle, leftText, rightStyle, rightText, style]);
    } else throw new Error(`Invalid expression - ${part}.`);
  }

  return exprs;
}

function composeDotExpr(specLines, options) {
  let style;
  let uid;
  const uids = {};
  let len = 0;
  let dot = `    ranksep = ${RANKSEP}\n`;
  dot += "    rankdir = " + options.dir + "\n";

  for (let i = 0; i < specLines.length; i++) {
    const elem = parseYumlExpr(specLines[i]);

    for (let k = 0; k < elem.length; k++) {
      if (elem[k][0] === "note" || elem[k][0] === "record") {
        const label = elem[k][1];
        if (uids.hasOwnProperty(recordName(label))) continue;

        uid = "A" + (len++).toString();
        uids[recordName(label)] = uid;

        const node = {
          shape: elem[k][0],
          height: 0.5,
          fontsize: 10,
          margin: "0.20,0.05",
          label: formatLabel(label, 20, true),
        };

        if (elem[k][2]) {
          const color = Color(elem[k][2]);

          node.style = "filled";
          node.fillcolor = color.hex();
          node.fontcolor = color.isDark() ? "white" : "black";
        }

        if (elem[k][3]) node.fontcolor = elem[k][3];

        dot += "    " + uid + " " + serializeDot(node) + "\n";
      }
    }

    if (elem.length === 3 && elem[1][0] === "edge") {
      const hasNote = elem[0][0] === "note" || elem[2][0] === "note";
      style = hasNote ? "dashed" : elem[1][5];

      const edge = {
        shape: "edge",
        dir: "both",
        style,
        arrowtail: elem[1][1],
        taillabel: elem[1][2],
        arrowhead: elem[1][3],
        headlabel: elem[1][4],
        labeldistance: 2,
        fontsize: 10,
      };

      if (hasNote)
        dot +=
          "    { rank=same; " +
          uids[recordName(elem[0][1])] +
          " -> " +
          uids[recordName(elem[2][1])] +
          " " +
          serializeDot(edge) +
          ";}\n";
      else
        dot +=
          "    " +
          uids[recordName(elem[0][1])] +
          " -> " +
          uids[recordName(elem[2][1])] +
          " " +
          serializeDot(edge) +
          "\n";
    } else if (
      elem.length === 4 &&
      elem[0][0] === "record" &&
      elem[1][0] === "edge" &&
      elem[2][0] === "record" &&
      elem[3][0] === "record"
    ) {
      // intermediate association class
      style = elem[1][5];

      const junction = {
        shape: "point",
        style: "invis",
        label: "",
        height: 0.01,
        width: 0.01,
      };
      uid = uids[recordName(elem[0][1])] + "J" + uids[recordName(elem[2][1])];
      dot += "    " + uid + " " + serializeDot(junction) + "\n";

      const edge1 = {
        shape: "edge",
        dir: "both",
        style: style,
        arrowtail: elem[1][1],
        taillabel: elem[1][2],
        arrowhead: "none",
        labeldistance: 2,
        fontsize: 10,
      };
      const edge2 = {
        shape: "edge",
        dir: "both",
        style: style,
        arrowtail: "none",
        arrowhead: elem[1][3],
        headlabel: elem[1][4],
        labeldistance: 2,
        fontsize: 10,
      };
      const edge3 = {
        shape: "edge",
        dir: "both",
        style: "dashed",
        arrowtail: "none",
        arrowhead: "vee",
        labeldistance: 2,
      };
      dot +=
        "    " +
        uids[recordName(elem[0][1])] +
        " -> " +
        uid +
        " " +
        serializeDot(edge1) +
        "\n";
      dot +=
        "    " +
        uid +
        " -> " +
        uids[recordName(elem[2][1])] +
        " " +
        serializeDot(edge2) +
        "\n";
      dot +=
        "    { rank=same; " +
        uids[recordName(elem[3][1])] +
        " -> " +
        uid +
        " " +
        serializeDot(edge3) +
        ";}\n";
    }
  }

  dot += "}\n";
  return dot;
}

module.exports = composeDotExpr;
