# yUML to SVG

[![npm](https://img.shields.io/npm/v/yuml2svg.svg)](https://www.npmjs.com/package/yuml2svg)

This project is a fork of
[jaime-olivares/yuml-diagram](https://www.npmjs.com/package/yuml-diagram). You
might want to check it out if you are more interested in a synchronous version
of the API.

## Installation

You can install it with yarn:

```bash
yarn global add yuml2svg # For CLI usage
yarn add yuml2svg # As local dependency
```

Or with npm:

```bash
npm --global install yuml2svg # For CLI usage
npm install yuml2svg --save # As local dependency
```

## Features

* Embedded rendering engine: **No need to call an external web service**

## yUML syntax

Please refer to the [wiki page](//github.com/jaime-olivares/yuml-diagram/wiki).

## Usage

### CLI

You can use the package to transform yUML diagrams to SVG via the Command-Line
Interface.

```bash
# You can install the package globally (or use npx)
yarn global add yuml2svg

# Print SVG document on the standard output
cat diagram.yuml | yuml2svg

# Save SVG file to the disk
cat diagram.yuml | yuml2svg > diagram.svg

# Save SVG file to the disk using dark mode
cat diagram.yuml | yuml2svg --dark > diagram.svg
```

### Node.JS API

The API exports a function that accepts as arguments:

1.  A `Readable` stream, a `Buffer` or a `string` containing the yUML diagram.
2.  An optional plain `object` containing the options for the rendering.
3.  An optional plain `object` containing the
    [options for Viz.js](//github.com/mdaines/viz.js/wiki/2.0.0-API#new-vizoptions).
    Check it out if you are using this package in the browser.
4.  An optional plain `object` containing the
    [render options for Viz.js](//github.com/mdaines/viz.js/wiki/2.0.0-API#render-options).

The API returns a `Promise` which resolves in a string containing SVG document
as a `string`.

> The options for the rendering are:
>
> * `dir`: `string` The direction of the diagram "TB" (default) - topDown,
>   "LR" - leftToRight, "RL" - rightToLeft
> * `type`: `string` The type of SVG - "class" (default), "usecase", "activity",
>   "state", "deployment", "package", "sequence".
> * `isDark`: `boolean` Option to get dark or light diagram
> * `dotHeaderOverrides`: `object` Option to customize output (not supported for
>   sequence diagram)
>
> Please check out [Viz.js wiki](//github.com/mdaines/viz.js/wiki/2.0.0-API) to
> get more the documentation of the last two parameters.

Here are some examples of a simple usage you can make of the API:

```js
import fs from "fs";
import yuml2svg from "yuml2svg";

/**
 * Renders a string or a Buffer into SVG with dark mode
 * @param {string | Buffer | Readable} yuml The yUML diagram
 * @returns {Promise<string>} callback The SVG document that represents the yUML diagram
 */
const renderDarkSVG = yuml => yuml2svg(yuml, { isDark: true });

/**
 * Renders a given file into a SVG string asynchronously
 * @param {string} filePath Path to the yUML diagram
 * @returns {Promise<string>} callback The SVG document that represents the yUML diagram
 */
const renderFile = filePath => yuml2svg(fs.createReadStream(filePath));

/**
 * Renders a given file into a SVG string asynchronously
 * @param {string} filePath Path to the yUML diagram
 * @param {{dir:string, type: string, isDark: boolean}} [options]
 * @param {object} [vizOptions] @see https://github.com/mdaines/viz.js/wiki/2.0.0-API
 * @returns {Promise<string>} callback The SVG document that represents the yUML diagram
 */
const renderFileWithOptions = (filePath, options, vizOptions) =>
  yuml2svg(fs.createReadStream(filePath), options, vizOptions);

/**
 * Generates a SVG file from a yUML file
 * @param {string} inputFile Path to the .yuml document to read
 * @param {string} outputFile Path to the .svg file to write
 * @returns {Promise<>} Promise that resolves once the SVG file is written
 */
const generateSVG = async (inputFile, outputFile) => {
  const svg = await yuml2svg(fs.createReadStream(filePath));

  return await fs.promises.writeFile(outputFile, svg);
};
```

Or, if you don't like `Promise` nor `async`/`await` syntax, you can use it with
good old callbacks:

```js
var fs = require("fs");
var yuml2svg = require("yuml2svg");

/**
 * Renders a string or a Buffer into SVG with dark mode
 * @param {string | Buffer | Readable} yuml The yUML diagram
 * @param {(Error, string)=>any} callback Async callback
 */
function renderDarkSVG(yuml, callback) {
  yuml2svg(yuml, { isDark: true })
    .then(function(svg) {
      callback(null, svg);
    })
    .catch(callback);
}

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
 * @param {object} [vizOptions] @see https://github.com/mdaines/viz.js/wiki/2.0.0-API
 * @param {(Error, string)=>any} callback Async callback
 */
function renderFileWithOptions(filePath, options, vizOptions) {
  yuml2svg(fs.createReadStream(filePath), options, vizOptions)
    .then(function(svg) {
      callback(null, svg);
    })
    .catch(callback);
}

/**
 * Generates a SVG file from a yUML file
 * @param {string} inputFile Path to the .yuml document to read
 * @param {string} outputFile Path to the .svg file to write
 * @param {(Error)=>any} callback Async callback
 */
function generateSVG(inputFile, outputFile, callback) {
  yuml2svg(fs.createReadStream(filePath))
    .then(function(svg) {
      fs.writeFile(outputFile, svg, callback);
    })
    .catch(callback);
}
```

### Run on the browser

You can find a working example of a browser implementation using webpack here:
[yuml2svg-playground](//github.com/aduh95/yuml2svg-playground).

> The Stream API in not currently supported on the browser, the API can only
> deal with strings.

## Credits

* Thanks to the [mdaines](//github.com/mdaines)'s port of
  [Graphviz](//www.graphviz.org/) for JavaScript
  [viz.js](//github.com/mdaines/viz.js).
* Thanks to the [jaime-olivares](//github.com/jaime-olivares)'s
  [VSCode extension](//github.com/jaime-olivares/vscode-yuml).
