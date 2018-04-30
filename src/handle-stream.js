if (typeof IS_BROWSER === "undefined") IS_BROWSER = false;

if (IS_BROWSER) {
  module.exports = (input, processLine) =>
    Promise.reject(new Error("Not implemented yet"));
} else {
  const readline = require("readline");
  const { Readable } = require("stream");

  module.exports = (input, processLine) =>
    new Promise((resolve, reject) => {
      const lineReader = readline.createInterface({ input });

      lineReader.on("line", processLine);
      lineReader.on("close", resolve);
    });
}
