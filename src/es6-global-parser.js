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
// const ExtractGlobalAssignmentVariables = (node, variables) => {
//     if (!node || node.type !== 'AssignmentExpression') {
//         return
//     }
//     variables.push(node.left.name)
//     ExtractGlobalAssignmentVariables(node.right, variables)
// }

const ExtractGlobalNames = (astBody) => {
    const variables = []
    astBody.forEach(node => {
        if (node.type === 'ImportDeclaration' ||
            node.type === 'ExportNamedDeclaration') {
            const type = (node.type === 'ImportDeclaration' ?
                'import' :
                'export'
            )
            node.specifiers.forEach(node => {
                const { name, start, end } = node.local
                variables.push({ type, name, start, end })
            })
        }
        if (node.type === 'ExportDefaultDeclaration') {
            const { name, start, end } = node.declaration
            variables.push({ type: 'export', name, start, end })
        }
        if (node.type === 'VariableDeclaration' && node.kind === 'const') {
            node.declarations.forEach(node => {
                const { name, start, end } = node.id
                variables.push({ type: 'const', name, start, end })
                // Uncomment for support of assignment variables
                // if (node.init.type === 'AssignmentExpression') {
                //     ExtractGlobalAssignmentVariables(node.init, variables)
                // }
            })
        }
    })
    return variables
}

const Parse = (code) => {
    const ast = Espree.parse(code, EspreeConfig)
    return ExtractGlobalNames(ast.body)
}

export default Parse
export { ExtractGlobalNames }
