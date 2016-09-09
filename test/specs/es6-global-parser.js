import ES6ModuleParser from '../../src/es6-global-parser.js'

describe ('Nutra ES6ModuleParser', () => {
    it ('should return only "const" declarations', () => {
        expect(ES6ModuleParser(`
            const Foo = () => {}
            var BarVar = () => {}
            let BarLet = () => {}
            function BarFunc () {}
        `)).toEqual([{ type: 'const', name: 'Foo', start: 19, end: 22 }])
    })
    it ('should return the names in the main execution context', () => {
        expect(ES6ModuleParser(`const Bar = () => {}`))
        .toEqual([{ type: 'const', name: 'Bar', start: 6, end: 9 }])
        expect(ES6ModuleParser(`
            const Bar = () => {}
            const Foo = () => {}
        `)).toEqual([
            { type: 'const', name: 'Bar', start: 19, end: 22 },
            { type: 'const', name: 'Foo', start: 52, end: 55 }
        ])
    })
    it ('should return the names in the deep execution contexts', () => {
        expect(ES6ModuleParser(`
            const Bar = () => {
                const hey = () => {
                    const hi = () => {}
                }
            }
        `)).toEqual([{ type: 'const', name: 'Bar', start: 19, end: 22 }])
    })

    it ('should return the named imports', () => {
        expect(ES6ModuleParser(`
            import Bar from 'bar'
            import Foo from 'foo'
        `)).toEqual([
            { type: 'import', name: 'Bar', start: 20, end: 23 },
            { type: 'import', name: 'Foo', start: 54, end: 57 }
        ])
        expect(ES6ModuleParser(`
            import Bar, {
                someMethod as TheMethod,
                complexMethod
            } from 'complex'
        `)).toEqual([
            { type: 'import', name: 'Bar', start: 20, end: 23 },
            { type: 'import', name: 'TheMethod', start: 57, end: 66 },
            { type: 'import', name: 'complexMethod', start: 84, end: 97 }
        ])
        expect(ES6ModuleParser(`
            import * as All from 'complex'
        `)).toEqual([ { type: 'import', name: 'All', start: 25, end: 28 } ])
    })
    it ('should exclude unnamed imports', () => {
        expect(ES6ModuleParser(`import 'bar'`)).toEqual([])
    })
    it ('should return the named exports', () => {
        expect(ES6ModuleParser(`
            export default Bar
            export { Foo, Fuzz }
        `)).toEqual([
            { type: 'export', name: 'Bar', start: 28, end: 31 },
            { type: 'export', name: 'Foo', start: 53, end: 56 },
            { type: 'export', name: 'Fuzz', start: 58, end: 62 }
        ])
    })
    it ('should parse README example', () => {
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
        expect(ES6ModuleParser(code))
        .toEqual([
            { type: 'import', name: 'Path', start: 20, end: 24 },
            { type: 'import', name: 'All', start: 61, end: 64 },
            { type: 'import', name: 'Complex', start: 102, end: 109 },
            { type: 'import', name: 'TheMethod', start: 127, end: 136 },
            { type: 'import', name: 'complexMethod', start: 138, end: 151 },
            { type: 'const', name: 'Bar', start: 188, end: 191 },
            { type: 'const', name: 'Foo', start: 422, end: 425 },
            { type: 'export', name: 'Bar', start: 644, end: 647 },
            { type: 'export', name: 'Foo', start: 669, end: 672 },
            { type: 'export', name: 'Path', start: 674, end: 678 }
        ])
    })
})
