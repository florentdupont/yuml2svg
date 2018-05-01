if (typeof IS_BROWSER === "undefined") IS_BROWSER = false;

if (IS_BROWSER) {
  module.exports = (input, processLine) =>
    Promise.reject(new Error("Not implemented yet"));
} else {
  const readline = require("readline");
  const { Readable } = require("stream");

  module.exports = (input, processLine) =>
    new Promise((resolve, reject) => {
      const crlfDelay = Infinity; // \r\n are handled as a single newline
      const lineReader = readline.createInterface({ input, crlfDelay });

      lineReader.on("line", processLine);
      lineReader.on("close", resolve);

      // If the input stream is erroneous or already consumed
      input.on("error", reject);
      input.on("close", reject);
    });
}
