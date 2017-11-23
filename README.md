# yUML to SVG

## Features

* Embedded rendering engine: **No need to call an external web service**

## yUML syntax

Please refer to the
[wiki page](https://github.com/jaime-olivares/vscode-yuml/wiki).

## API

```js
import fs from "fs";
import yuml2svg from "yuml2svg";

fs.readFile("./path/to/diagram.yuml", function(err, yuml) {
  if (err) {
    console.error(err);
  } else {
    const svg = yuml2svg(yuml);
  }
});
```

## Credits

* Thanks to the [jaime-olivares](https://github.com/jaime-olivares)'s
  [VSCode extension](https://github.com/jaime-olivares/vscode-yuml)
