if (typeof IS_BROWSER === "undefined") IS_BROWSER = false;

/**
 * @returns {Window} Should work on Node as on the browser
 */
if (IS_BROWSER) {
  module.exports = () => this;
} else {
  const { JSDOM } = require("jsdom");
  module.exports = () => new JSDOM().window;
}
