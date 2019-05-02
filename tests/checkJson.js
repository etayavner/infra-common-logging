var globAll = require('glob-all');
var path = require('path');
var fs = require('fs');

var patterns = [
    '.eslintrc',
    '*.json',
    'config/*.json',
    'lib/*.json',
    'lib/**/*.json',
    'test/config/*.json',
    'schemas/*.schema'
];

describe('checkJson', function() {
    globAll.sync(patterns).forEach(function (file) {
        it('check for valid JSON syntax in ' + file, function() {
            var jsonToCheck = fs.readFileSync(process.cwd() + path.sep + file);
            JSON.parse(jsonToCheck);
        });
    });
});
