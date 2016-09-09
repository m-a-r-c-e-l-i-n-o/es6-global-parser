# ES6 Global Parser
Extracts all named imports, exports, and constants in the main execution context from a valid ES6 module file. It uses [Espree 3+](https://github.com/eslint/espree) to reliably parse the file.

## Installation
```bash
npm install --save es6-global-parser
```

## Usage
```js
import ES6GlobalParser from 'es6-global-parser'

const code = `
import Path from 'path'
import * as All from 'everything'
import Complex, { someMethod as TheMethod, complexMethod } from 'complex'

const Bar = () => {
    // The "closure" constant will not be included since it's not part of
    // the main execution context of this file.
    const closure = () => {}
}

const Foo = () => {}

// The "FooLet" and "FooVar" variables will not be included since it's not a "const" declaration.
let FooLet = () => {}
var FooVar = () => {}

export default Bar
export { Foo, Path }
`

ES6GlobalParser(code)
// output: [
// { type: 'import', name: 'Path', start: 20, end: 24 },
// { type: 'import', name: 'All', start: 61, end: 64 },
// { type: 'import', name: 'Complex', start: 102, end: 109 },
// { type: 'import', name: 'TheMethod', start: 127, end: 136 },
// { type: 'import', name: 'complexMethod', start: 138, end: 151 },
// { type: 'const', name: 'Bar', start: 188, end: 191 },
// { type: 'const', name: 'Foo', start: 422, end: 425 },
// { type: 'export', name: 'Bar', start: 644, end: 647 },
// { type: 'export', name: 'Foo', start: 669, end: 672 },
// { type: 'export', name: 'Path', start: 674, end: 678 }
// ]
```
