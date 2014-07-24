var test = require('tape'),
    fs = require('fs'),
    sinon = require('sinon'),
    childProcess = require('child_process'),
    builder = require('../lib/builder'),
    loader = require('../lib/loader');

test('writeConfig', function(t) {
    t.plan(2);

    var mock = sinon.mock(fs);

    var config = loader.directory(__dirname + '/fixtures');

    config.generate('instagram', 'desktop', function(err, config) {
        var output = __dirname + '/work/test.json';

        mock.expects('writeFile')
            .withArgs(output, '(' + JSON.stringify(config, null, 4) + ')')
            .callsArg(2);

        builder.writeConfig(output, config, function(err, file) {
            t.equals(output, file);

            t.ok(mock.verify());

            mock.restore();
        });
    });
});
