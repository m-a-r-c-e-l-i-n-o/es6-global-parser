import Fs from 'fs'
import Espree from 'espree'

const EspreeConfig = {
    // attach range information to each node
    range: true,
    // attach line/column location information to each node
    loc: true,
    // create a top-level comments array containing all comments
    comment: true,
    // attach comments to the closest relevant node as leadingComments and
    // trailingComments
    attachComment: true,
    // create a top-level tokens array containing all tokens
    tokens: true,
    // specify the language version (3, 5, 6, or 7, default is 5)
    ecmaVersion: 5,
    // specify which type of script you're parsing (script or module, default is script)
    sourceType: 'module',
    // specify additional language features
    ecmaFeatures: {
        // enable JSX parsing
        jsx: true,
        // enable return in global scope
        globalReturn: true,
        // enable implied strict mode (if ecmaVersion >= 5)
        impliedStrict: true,
        // allow experimental object rest/spread
        experimentalObjectRestSpread: true,
        // allow let and const declarations
        blockBindings: true
    }
}

// Leaving this code here in case support for assignment variables are needed.
// Since we are only supporting "const" for now, this isn't needed.
const ExtractGlobalAssignmentVariables = (node, store) => {
    if (!node || node.type !== 'AssignmentExpression') {
        return
    }
    const { name, start, end } = node.left
    store.push({ name, start, end })
    ExtractGlobalAssignmentVariables(node.right, store)
}

const ExtractGlobals = (astBody) => {
    const globals = {
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
    }

    astBody.forEach(node => {
        if (node.type === 'ImportDeclaration') { // handle imports
            const { start, end, specifiers } = node
            if (globals.imports.start === null) {
                globals.imports.start = start
            }
            globals.imports.end = end
            specifiers.forEach(node => {
                const { name, start, end } = node.local
                globals.imports.nodes.push({ name, start, end })
            })
        } else if (node.type === 'ExportAllDeclaration' || // handle exports
            node.type === 'ExportDefaultDeclaration' ||
            node.type === 'ExportNamedDeclaration') {
            if (globals.exports.start === null) {
                globals.exports.start = node.start
            }
            if (node.type === 'ExportDefaultDeclaration') {
                const { name, start, end } = node.declaration
                globals.exports.nodes.push({ name, start, end })
            } else if (node.type === 'ExportNamedDeclaration') {
                if (node.declaration && node.declaration.declarations[0]) {
                    const { id, init } = node.declaration.declarations[0]
                    const { name, start, end } = id
                    globals.exports.nodes.push({ name, start, end })
                    ExtractGlobalAssignmentVariables(init, globals.exports.nodes)
                } else {
                    node.specifiers.forEach(node => {
                        const { name, start, end } = node.local
                        globals.exports.nodes.push({ name, start, end })
                    })
                }
            }
            globals.exports.end = node.end
        } else if (node.type === 'VariableDeclaration' && // handle constants
                   node.kind === 'const') {
            if (globals.constants.start === null) {
                globals.constants.start = node.start
            }
            node.declarations.forEach(node => {
                const { name, start, end } = node.id
                globals.constants.nodes.push({ name, start, end })
            })
            globals.constants.end = node.end
        }
    })
    return globals
}

const Parse = (code) => {
    if (typeof code !== 'string') {
        throw new Error('Please pass in a valid code string!')
    }
    const ast = Espree.parse(code, EspreeConfig)
    return ExtractGlobals(ast.body)
}

export default Parse
