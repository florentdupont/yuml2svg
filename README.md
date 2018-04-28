# yUML to SVG

## Installation

You can install it with npm:

```bash
npm install yuml2svg
```

Or with yarn:

```bash
yarn add yuml2svg
```

## Features

* Embedded rendering engine: **No need to call an external web service**

## yUML syntax

Please refer to the
[wiki page](https://github.com/jaime-olivares/vscode-yuml/wiki).

## API

The API exports a function that accepts as arguments:

1.  A `Buffer` or a `string` containing the yUML diagram
2.  A plain `object` containing the options:

> * `dir`: The direction of the diagram "TB" (default) - topDown, "LR" -
>   leftToRight, "RL" - rightToLeft
> * `type`: The type of SVG - "class" (default), "usecase", "activity", "state",
>   "deployment", "package".
> * `isDark`: Option to get dark or light diagram

Here are some examples of a simple usage you can make of the API:

```js
import fs from "fs/promises"; // N.B.: fs/promises is not available before Node 10.0.0
import yuml2svg from "yuml2svg";

/**
 * Renders a given file into a SVG string asynchronously
 * @param {string} filePath Path to the yUML diagram
 * @param {Promise<string>} callback The SVG document that represents the yUML diagram
 */
const renderFile = filePath => fs.readFile(filePath).then(yuml2svg);

/**
 * Generates a SVG file from a yUML file
 * @param {string} inputFile Path to the .yuml document to read
 * @param {string} outputFile Path to the .svg file to write
 * @returns {Promise<>} Promise that resolves once the SVG file is written
 */
const generateSVG = async (inputFile, outputFile) => {
  const yuml = await fs.readFile(inputFile);
  const svg = await yuml2svg(yuml);

  return await fs.writeFile(outputFile, svg);
};
```

Or, if you don't like `Promise` nor `async`/`await` syntax, you can use it with
good old callbacks:

```js
const fs = require("fs");
const yuml2svg = require("yuml2svg");

/**
 * Renders a given file into a SVG string asynchronously
 * @param {string} filePath Path to the yUML diagram
 * @param {(Error, string)=>any} callback The SVG document that represents the yUML diagram
 */
function renderFile(filePath, callback) {
  fs.readFile(filePath, function(err, yuml) {
    if (err) {
      callback(err);
    } else {
      yuml2svg(yuml)
        .then(function(svg) {
          callback(null, svg);
        })
        .catch(callback);
    }
  });
}

/**
 * Generates a SVG file from a yUML file
 * @param {string} inputFile Path to the .yuml document to read
 * @param {string} outputFile Path to the .svg file to write
 * @param {(Error)=>any} callback Async callback
 */
function generateSVG(inputFile, outputFile, callback) {
  fs.readFile(filePath, function(err, yuml) {
    if (err) {
      callback(err);
    } else {
      yuml2svg(yuml).then(function(svg) {
        fs.writeFile(outputFile, svg, callback);
      });
    }
  });
}
```

## Credits

* Thanks to the [jaime-olivares](https://github.com/jaime-olivares)'s
  [VSCode extension](https://github.com/jaime-olivares/vscode-yuml)
