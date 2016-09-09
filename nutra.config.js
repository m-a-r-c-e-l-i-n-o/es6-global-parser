module.exports = function(config) {
    config.set({
        frameworks: ['nutra-jasmine'],
        files: ['./test/specs/**/*.js', './src/**/*.js'],
        preprocessors: {
            './test/specs/**/*.js': ['nutra-babel'],
            './src/**/*.js': ['nutra-babel', 'nutra-coverage']
        },
        reporters: ['nutra-minimal-reporter', 'nutra-coverage'],
        babelOptions: {
            configFile: './.babelrc'
        },
        coverageOptions: {
            dir : './test',
            reporters: [
                { type: 'html', subdir: 'coverage' }
            ]
        }
    })
}
