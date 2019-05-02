var lint = require('mocha-eslint');

var paths = [
    '*.js',
    'lib/*.js',
    '!test',
    '!config'
]

var options = {
    formatter: 'compact'
}

lint(paths, options);
