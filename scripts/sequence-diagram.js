const {
  extractBgAndNote,
  formatLabel,
  recordName,
  splitYumlExpr,
} = require("./yuml2dot-utils.js");
const Renderer = require("./sequence-renderer.js");

/*
Unofficial syntax, based on a proposal specified in the Scruffy project, plus local additions

Object     [Patron]
Message    [Patron]order food>[Waiter]
Response   [Waiter]serve wine.>[Patron]
Note       [Actor]-[note: a note message]
Comment    // Comments

Asynchronous message            [Patron]order food>>[Waiter]
Open activation box at source   [Source](message>[Dest]
Open activation box at dest     [Source]message>([Dest]
Close activation at dest        [Source]message>)[Dest]
Close activation at source      [Source])message>[Dest]
Cancel activation box           [Source])X
*/

const actors = [];
const signals = [];

function parseYumlExpr(specLine) {
  const exprs = [];
  const parts = this.splitYumlExpr(specLine, "[");

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i].trim();
    if (part.length === 0) continue;

    if (part.match(/^\[.*\]$/)) {
      // object
      part = part.substr(1, part.length - 2);
      const ret = extractBgAndNote(part, true);
      exprs.push([
        ret.isNote ? "note" : "object",
        ret.part,
        ret.bg,
        ret.fontcolor,
      ]);
    } else if (part.indexOf(">") >= 0) {
      // message
      let style = part.indexOf(".>") >= 0 ? "dashed" : "solid";
      style = part.indexOf(">>") >= 0 ? "async" : style;

      let prefix = "";
      if (part.startsWith("(") || part.startsWith(")")) {
        prefix = part.substr(0, 1);
        part = part.substr(1);
      }

      let message = "";
      const pos = part.match(/[\.|>]{0,1}>[\(|\)]{0,1}$/);
      if (pos == null) {
        throw "Invalid expression";
      } else if (pos.index > 0) {
        message = part.substr(0, pos.index);
        part = part.substr(pos.index);
      }

      let suffix = "";
      if (part.endsWith("(") || part.endsWith(")")) {
        suffix = part.charAt(part.length - 1);
        part = part.substr(0, part.length - 1);
      }

      exprs.push(["signal", prefix, message, style, suffix]);
    } else throw "Invalid expression";
  }

  return exprs;
}

function composeSVG(specLines) {
  let actorA;
  let label;
  const uids = {};
  for (let i = 0; i < specLines.length; i++) {
    const elem = parseYumlExpr(specLines[i]);

    for (let k = 0; k < elem.length; k++) {
      const type = elem[k][0];

      if (type === "object") {
        label = elem[k][1];
        const rn = recordName(label);
        if (uids.hasOwnProperty(rn)) continue;

        label = formatLabel(label, 20, true);
        const actor = {
          type: elem[k][0],
          name: rn,
          label: label,
          index: actors.length,
        };
        uids[rn] = actor;

        actors.push(actor);
      }
    }

    if (
      elem.length === 3 &&
      elem[0][0] === "object" &&
      elem[1][0] === "signal" &&
      elem[2][0] === "object"
    ) {
      const message = elem[1][2];
      const style = elem[1][3];
      actorA = uids[recordName(elem[0][1])];
      const actorB = uids[recordName(elem[2][1])];
      let signal = null;

      switch (style) {
        case "dashed":
          signal = {
            type: "signal",
            actorA: actorA,
            actorB: actorB,
            linetype: "dashed",
            arrowtype: "arrow-filled",
            message: message,
          };
          break;
        case "solid":
          signal = {
            type: "signal",
            actorA: actorA,
            actorB: actorB,
            linetype: "solid",
            arrowtype: "arrow-filled",
            message: message,
          };
          break;
        case "async":
          signal = {
            type: "signal",
            actorA: actorA,
            actorB: actorB,
            linetype: "solid",
            arrowtype: "arrow-open",
            message: message,
          };
          break;
      }

      if (signal != null) signals.push(signal);
    } else if (
      elem.length === 3 &&
      elem[0][0] === "object" &&
      elem[1][0] === "signal" &&
      elem[2][0] === "note"
    ) {
      actorA = uids[recordName(elem[0][1])];
      label = elem[2][1];
      label = formatLabel(label, 20, true);
      const note = { type: "note", message: label, actor: actorA };

      if (elem[2][2])
        // background color
        note.bgcolor = elem[2][2];
      if (elem[2][3])
        // font color
        note.fontcolor = elem[2][3];

      signals.push(note);
    }
  }

  let r = new Renderer(actors, signals, uids, true);
  const svgDark = r.svg_.serialize();

  r = new Renderer(actors, signals, uids, false);
  const svgLight = r.svg_.serialize();

  return [svgLight, svgDark];
}

module.exports = composeSVG;
