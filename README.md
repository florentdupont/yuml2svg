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

1.  A `Readable` stream, a `Buffer` or a `string` containing the yUML diagram.
2.  An optional plain `object` containing the options for the rendering.
3.  An optional plain `object` containing the
    [options for Viz.js](https://github.com/mdaines/viz.js/wiki/2.0.0-API).
    Check it out if you are using this package in the browser.

The API returns a `Promise` which resolves in a string containing SVG document
as a `string`.

> The options for the rendering are:
>
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
 * @returns {Promise<string>} callback The SVG document that represents the yUML diagram
 */
const renderFile = filePath => fs.readFile(filePath).then(yuml2svg);

/**
 * Renders a given file into a SVG string asynchronously
 * @param {string} filePath Path to the yUML diagram
 * @param {{dir:string, type: string, isDark: boolean}} [options]
 * @param {{Module:Module, render: Function}} [vizOptions] @see https://github.com/mdaines/viz.js/wiki/2.0.0-API
 * @returns {Promise<string>} callback The SVG document that represents the yUML diagram
 */
const renderFileWithOptions = (filePath, options, vizOptions) =>
  fs.readFile(filePath).then(yuml => yuml2svg(yuml, options, vizOptions));

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
 * @param {(Error, string)=>any} callback Async callback
 */
function renderFile(filePath, callback) {
  yuml2svg(fs.createReadStream(filePath))
    .then(function(svg) {
      callback(null, svg);
    })
    .catch(callback);
}

/**
 * Renders a given file into a SVG string asynchronously
 * @param {string} filePath Path to the yUML diagram
 * @param {{dir:string, type: string, isDark: boolean}} [options]
 * @param {{Module:Module, render: Function}} [vizOptions] @see https://github.com/mdaines/viz.js/wiki/2.0.0-API
 * @param {(Error, string)=>any} callback Async callback
 */
function renderFileWithOptions(filePath, options, vizOptions) {
  fs.readFile(filePath, function(err, yuml) {
    if (err) {
      callback(err);
    } else {
      yuml2svg(yuml, options, vizOptions)
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
      yuml2svg(yuml)
        .then(function(svg) {
          fs.writeFile(outputFile, svg, callback);
        })
        .catch(callback);
    }
  });
}
```

### Run on the browser

You can find a working example of a browser implementation using webpack here:
[yuml2svg-playground](//github.com/aduh95/yuml2svg-playground).

> The Stream API in not currently supported on the browser, the API can only
> deal with strings.

## Credits

* Thanks to the [jaime-olivares](https://github.com/jaime-olivares)'s
  [VSCode extension](https://github.com/jaime-olivares/vscode-yuml)
