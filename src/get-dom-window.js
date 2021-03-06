"use strict";

/**
 * @returns {Window} Should work on Node as on the browser
 */
if (typeof IS_BROWSER === "undefined" || !IS_BROWSER) {
  const { JSDOM } = require("jsdom");
  module.exports = () => new JSDOM().window;
} else {
  module.exports = () => window;
}
