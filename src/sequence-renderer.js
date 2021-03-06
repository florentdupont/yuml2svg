"use strict";

const svg_builder = require("./svg-builder");

/*
Rendering algorithms based on:
https://github.com/sharvil/node-sequence-diagram
*/

module.exports = function(actors, signals, uids, isDark) {
  const DIAGRAM_MARGIN = 10;
  const ACTOR_MARGIN = 10; // Margin around a actor
  const ACTOR_PADDING = 10; // Padding inside a actor
  const SIGNAL_MARGIN = 5; // Margin around a signal
  const SIGNAL_PADDING = 5; // Padding inside a signal
  const NOTE_MARGIN = 10; // Margin around a note
  const NOTE_PADDING = 5; // Padding inside a note
  const SELF_SIGNAL_WIDTH = 20; // How far out a self signal goes

  this.svg_ = new svg_builder(isDark);
  this._actors_height = 0;
  this._signals_height = 0;

  this.actors = actors;
  this.signals = signals;
  this.width = 0;
  this.height = 0;

  this.draw = function() {
    this.layout();
    this.svg_.setDocumentSize(this.width, this.height);

    const y = DIAGRAM_MARGIN;

    this.draw_actors(y);
    this.draw_signals(y + this._actors_height);
  };

  this.layout = function() {
    this.width = 0; // min width
    this.height = 0; // min width

    this.actors.forEach(function(a) {
      const bb = this.svg_.getTextSize(a.label);
      a.text_bb = bb;

      a.x = 0;
      a.y = 0;
      a.width = bb.width + (ACTOR_PADDING + ACTOR_MARGIN) * 2;
      a.height = bb.height + (ACTOR_PADDING + ACTOR_MARGIN) * 2;

      a.distances = [];
      a.padding_right = 0;
      this._actors_height = Math.max(a.height, this._actors_height);
    }, this);

    function actor_ensure_distance(a, b, d) {
      console.assert(a < b, "a must be less than or equal to b");

      if (a < 0) {
        // Ensure b has left margin
        b = actors[b];
        b.x = Math.max(d - b.width / 2, b.x);
      } else if (b >= actors.length) {
        // Ensure a has right margin
        a = actors[a];
        a.padding_right = Math.max(d, a.padding_right);
      } else {
        a = actors[a];
        a.distances[b] = Math.max(d, a.distances[b] ? a.distances[b] : 0);
      }
    }

    signals.forEach(function(s) {
      let a, b; // Indexes of the left and right actors involved

      const bb = this.svg_.getTextSize(s.message);

      s.text_bb = bb;
      s.width = bb.width;
      s.height = bb.height;

      let extra_width = 0;

      if (s.type === "signal") {
        s.width += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;
        s.height += (SIGNAL_MARGIN + SIGNAL_PADDING) * 2;

        if (s.actorA === s.actorB) {
          a = s.actorA.index;
          b = a + 1;
          s.width += SELF_SIGNAL_WIDTH;
        } else {
          a = Math.min(s.actorA.index, s.actorB.index);
          b = Math.max(s.actorA.index, s.actorB.index);
        }
      } else if (s.type === "note") {
        s.width += (NOTE_MARGIN + NOTE_PADDING) * 2;
        s.height += (NOTE_MARGIN + NOTE_PADDING) * 2;

        extra_width = 2 * ACTOR_MARGIN;

        a = s.actor.index;
        b = a + 1;
      }

      actor_ensure_distance(a, b, s.width + extra_width);
      this._signals_height += s.height;
    }, this);

    // Re-jig the positions
    let actors_x = 0;
    this.actors.forEach(function(a) {
      a.x = Math.max(actors_x, a.x);

      // TODO This only works if we loop in sequence, 0, 1, 2, etc
      a.distances.forEach(function(distance, b) {
        b = actors[b];
        distance = Math.max(distance, a.width / 2, b.width / 2);
        b.x = Math.max(b.x, a.x + a.width / 2 + distance - b.width / 2);
      });

      actors_x = a.x + a.width + a.padding_right;
    }, this);

    this.width = 2 * DIAGRAM_MARGIN + Math.max(actors_x, this.width);
    this.height =
      2 * DIAGRAM_MARGIN + 2 * this._actors_height + this._signals_height;

    return this;
  };

  this.draw_actors = function(offsetY) {
    const y = offsetY;
    this.actors.forEach(function(a) {
      // Top box
      this.draw_actor(a, y, this._actors_height);

      // Bottom box
      this.draw_actor(
        a,
        y + this._actors_height + this._signals_height,
        this._actors_height
      );

      // Vertical line
      const aX = getCenterX(a);
      const line = this.svg_.createPath(
        "M{0},{1} v{2}",
        "solid",
        aX,
        y + this._actors_height - ACTOR_MARGIN,
        2 * ACTOR_MARGIN + this._signals_height
      );

      this.svg_.getDocument().appendChild(line);
    }, this);
  };

  this.draw_actor = function(actor, offsetY, height) {
    actor.y = offsetY;
    actor.height = height;
    this.draw_text_box(actor, actor.label, ACTOR_MARGIN, ACTOR_PADDING);
  };

  this.draw_signals = function(offsetY) {
    let y = offsetY;
    this.signals.forEach(function(s) {
      if (s.type === "signal") {
        if (s.actorA === s.actorB) this.draw_self_signal(s, y);
        else this.draw_signal(s, y);
      } else if (s.type === "note") this.draw_note(s, y);

      y += s.height;
    }, this);
  };

  this.draw_self_signal = function(signal, offsetY) {
    const text_bb = signal.text_bb;
    const aX = getCenterX(signal.actorA);

    const x = aX + SELF_SIGNAL_WIDTH + SIGNAL_PADDING + text_bb.width / 2;
    const y = offsetY + signal.height / 2;

    this.draw_text(x, y, signal.message, true);

    const line = this.svg_.createPath(
      "M{0},{1} C{2},{1} {2},{3} {0},{3}",
      signal.linetype,
      aX,
      offsetY + SIGNAL_MARGIN,
      aX + SELF_SIGNAL_WIDTH * 2,
      offsetY + signal.height
    );
    line.setAttribute("marker-end", "url(#" + signal.arrowtype + ")");

    this.svg_.getDocument().appendChild(line);
  };

  this.draw_signal = function(signal, offsetY) {
    const aX = getCenterX(signal.actorA);
    const bX = getCenterX(signal.actorB);

    // Mid point between actors
    const x = (bX - aX) / 2 + aX;
    let y = offsetY + SIGNAL_MARGIN + 2 * SIGNAL_PADDING;

    // Draw the text in the middle of the signal
    this.draw_text(x, y, signal.message, true);

    // Draw the line along the bottom of the signal
    y = offsetY + signal.height - SIGNAL_MARGIN - SIGNAL_PADDING;
    const line = this.svg_.createPath(
      "M{0},{1} h{2}",
      signal.linetype,
      aX,
      y,
      bX - aX
    );
    line.setAttribute("marker-end", "url(#" + signal.arrowtype + ")");

    this.svg_.getDocument().appendChild(line);
  };

  this.draw_note = function(note, offsetY) {
    const aX = getCenterX(note.actor);
    const margin = NOTE_MARGIN;

    note.x = aX + ACTOR_MARGIN;
    note.y = offsetY;

    const noteShape = this.svg_.createPath(
      "M{0},{1} L{0},{2} L{3},{2} L{0},{1} L{4},{1} L{4},{5} L{3},{5} L{3},{2} Z",
      "solid",
      note.x - margin + note.width - 7,
      note.y + margin,
      note.y + margin + 7,
      note.x - margin + note.width,
      note.x + margin,
      note.y - margin + note.height
    );

    if (note.hasOwnProperty("bgcolor"))
      noteShape.setAttribute(
        "style",
        noteShape
          .getAttribute("style")
          .replace("fill: none", "fill: " + note.bgcolor)
      );

    this.svg_.getDocument().appendChild(noteShape);

    // Draw text (in the center)
    const x = getCenterX(note);
    const y = getCenterY(note);

    if (note.hasOwnProperty("fontcolor"))
      this.draw_text(x, y, note.message, true, note.fontcolor);
    else this.draw_text(x, y, note.message, true);
  };

  this.draw_text = function(x, y, text, dontDrawBox, color) {
    const t = this.svg_.createText(text, x, y, color);

    if (!dontDrawBox) {
      const size = this.svg_.getTextSize(text);
      const rect = this.svg_.createRect(size.width, size.height);
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);

      this.svg_.getDocument().appendChild(rect);
    }

    this.svg_.getDocument().appendChild(t);
  };

  this.draw_text_box = function(box, text, margin) {
    let x = box.x + margin;
    let y = box.y + margin;
    const w = box.width - 2 * margin;
    const h = box.height - 2 * margin;

    // Draw inner box
    const rect = this.svg_.createRect(w, h);
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);

    //rect.classList.add(Renderer.RECT_CLASS_);
    this.svg_.getDocument().appendChild(rect);

    // Draw text (in the center)
    x = getCenterX(box);
    y = getCenterY(box);

    this.draw_text(x, y, text, true);
  };

  function getCenterX(box) {
    return box.x + box.width / 2;
  }

  function getCenterY(box) {
    return box.y + box.height / 2;
  }

  this.draw();
};
