import ES6ModuleParser from '../../src/es6-global-parser.js'

describe ('Nutra ES6ModuleParser', () => {
    it ('should throw error is argument is not a string', () => {
        expect(() => ES6ModuleParser()).toThrowError()
        expect(() => ES6ModuleParser([])).toThrowError()
        expect(() => ES6ModuleParser({})).toThrowError()
        expect(() => ES6ModuleParser(null)).toThrowError()
        expect(() => ES6ModuleParser(false)).toThrowError()
    })
    it ('should return an section skeleton', () => {
        expect(ES6ModuleParser('')).toEqual({
            imports: {
                start: null,
                end: null,
                nodes: []
            },
            constants: {
                start: null,
                end: null,
                nodes: []
            },
            exports: {
                start: null,
                end: null,
                nodes: []
            }
        })
    })
    it ('should include the start and end positions of the import\'s section', () => {
        expect(ES6ModuleParser(`
            import 'fs'
            import 'path'
            import 'other'
        `)).toEqual(jasmine.objectContaining(
            { imports: { start: 13, end: 77, nodes: [] } }
        ))
    })
    it ('should parse a imported default binding', () => {
        const result = ES6ModuleParser(`
            import bar from 'bar'
        `)
        expect(result.imports.nodes).toEqual([ { name: 'bar', start: 20, end: 23 } ])
    })
    it ('should parse a named import', () => {
        const result = ES6ModuleParser(`
            import { bar } from 'bar'
        `)
        expect(result.imports.nodes).toEqual([ { name: 'bar', start: 22, end: 25 } ])
    })
    it ('should parse a name spaced named import', () => {
        const result = ES6ModuleParser(`
            import { bar as foo } from 'bar'
        `)
        expect(result.imports.nodes).toEqual([ { name: 'foo', start: 29, end: 32 } ])
    })
    it ('should parse an import list', () => {
        const result = ES6ModuleParser(`
            import Foo, { bar, foo } from 'foo'
        `)
        expect(result.imports.nodes).toEqual([
            { name: 'Foo', start: 20, end: 23 },
            { name: 'bar', start: 27, end: 30 },
            { name: 'foo', start: 32, end: 35 }
        ])
    })
    it ('should include the start and end positions of the export\'s section', () => {
        expect(ES6ModuleParser(`
            export * from 'fs'
            export * from 'path'
            export * from 'other'
        `)).toEqual(jasmine.objectContaining(
            { exports: { start: 13, end: 98, nodes: [] } }
        ))
    })
    it ('should parse the default exports', () => {
        const result = ES6ModuleParser(`
            export default bar
        `)
        expect(result.exports.nodes).toEqual(
            [{ name: 'bar', start: 28, end: 31 }]
        )
    })
    it ('should parse the exports with variable statements', () => {
        const result = ES6ModuleParser(`
            export const bar = () => {}
        `)
        expect(result.exports.nodes).toEqual(
            [{ name: 'bar', start: 26, end: 29 }]
        )
    })
    it ('should parse the exports with multi variable statements', () => {
        const result = ES6ModuleParser(`
            export const bar = Hello = World = () => {}
        `)
        expect(result.exports.nodes).toEqual([
            { name: 'bar', start: 26, end: 29 },
            { name: 'Hello', start: 32, end: 37 },
            { name: 'World', start: 40, end: 45 }
        ])
    })
    it ('should parse the exports with clauses', () => {
        const result = ES6ModuleParser(`
            export { bar }
        `)
        expect(result.exports.nodes).toEqual([
            { name: 'bar', start: 22, end: 25 }
        ])
    })
    it ('should parse the exports with clause lists', () => {
        const result = ES6ModuleParser(`
            export { bar, foo }
        `)
        expect(result.exports.nodes).toEqual([
            { name: 'bar', start: 22, end: 25 },
            { name: 'foo', start: 27, end: 30 }
        ])
    })
    it ('should include the start and end positions of the constant\'s section', () => {
        const result = ES6ModuleParser(`
            const _ = ''
            const __ = ''
            const ___ = ''
        `)
        expect(result.constants.start).toBe(13)
        expect(result.constants.end).toBe(78)
    })
    it ('should parse "const" declarations', () => {
        const result = ES6ModuleParser(`
            const bar = () => {}
        `)
        expect(result.constants.nodes).toEqual([
            { name: 'bar', start: 19, end: 22 }
        ])
    })
    it ('should ignore "var" and "let" declarations', () => {
        const result = ES6ModuleParser(`
            let bar = () => {}
            var foo = () => {}
        `)
        expect(result.constants.nodes).toEqual([])
    })
    it ('should parse README example', () => {
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
        expect(ES6ModuleParser(code)).toEqual({
            imports: {
                start: 13,
                end: 168,
                nodes: [
                    { name: 'path', start: 20, end: 24 },
                    { name: 'all', start: 61, end: 64 },
                    { name: 'complex', start: 102, end: 109 },
                    { name: 'theMethod', start: 127, end: 136 },
                    { name: 'complexMethod', start: 138, end: 151 }
                ]
            },
            constants: {
                start: 182,
                end: 436,
                nodes: [
                    { name: 'bar', start: 188, end: 191 },
                    { name: 'foo', start: 422, end: 425 }
                ]
            },
            exports: {
                start: 629,
                end: 680,
                nodes: [
                    { name: 'bar', start: 644, end: 647 },
                    { name: 'foo', start: 669, end: 672 },
                    { name: 'path', start: 674, end: 678 }
                ]
            }
        })
    })
})
