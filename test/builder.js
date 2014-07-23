var test = require('tape'),
    fs = require('fs'),
    sinon = require('sinon'),
    childProcess = require('child_process'),
    builder = require('../lib/builder'),
    loader = require('../lib/loader');

test('writeConfig', function(t) {
    t.plan(2);

    var config = loader.directory(__dirname + '/fixtures');

    config.generate('instagram', 'desktop', function(err, config) {
        var output = __dirname + '/work/test.json';

        builder.writeConfig(output, config, function(err, file) {
            t.equals(output, file);

            fs.readFile(file, 'UTF-8', function(err, data) {
                data = JSON.parse(data.substring(1, data.length - 1));

                t.looseEquals(data.include, ['instagram/file1.js', 'instagram/file2.js']);
            });
        });
    });
});
