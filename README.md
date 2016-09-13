# ES6 Global Parser
Extracts all global imports, exports, and constants in the main execution context from a valid ES6 module file. It uses [Espree 3+](https://github.com/eslint/espree) to reliably parse the file.

## Installation
```bash
npm install --save es6-global-parser
```

## Usage
```js
import ES6GlobalParser from 'es6-global-parser'

const code = `
import path from 'path'
import * as all from 'everything'
import complex, { someMethod as theMethod, complexMethod } from 'complex'

const bar = () => {
    // The "closure" constant will not be included since it's not part of
    // the main execution context of this file.
    const closure = () => {}
}

const foo = () => {}

// The "barLet" and "barVar" variables will not be included since it's not a "const" declaration.
let barLet = () => {}
var barVar = () => {}

export default bar
export { foo, path }
`

ES6GlobalParser(code)
// output -> {
//    imports: {
//        start: 13,
//        end: 168,
//        nodes: [
//            { name: 'path', start: 20, end: 24 },
//            { name: 'all', start: 61, end: 64 },
//            { name: 'complex', start: 102, end: 109 },
//            { name: 'theMethod', start: 127, end: 136 },
//            { name: 'complexMethod', start: 138, end: 151 }
//        ]
//    },
//    constants: {
//        start: 182,
//        end: 436,
//        nodes: [
//            { name: 'bar', start: 188, end: 191 },
//            { name: 'foo', start: 422, end: 425 }
//        ]
//    },
//    exports: {
//        start: 629,
//        end: 680,
//        nodes: [
//            { name: 'bar', start: 644, end: 647 },
//            { name: 'foo', start: 669, end: 672 },
//            { name: 'path', start: 674, end: 678 }
//        ]
//    }
// }
```
