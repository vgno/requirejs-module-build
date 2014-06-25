var test = require('tape'),
    fs = require('fs'),
    Config = require('../lib/config');

var fixture = JSON.parse(fs.readFileSync(__dirname + '/fixtures/requirejs-build.json'));

test('generating invalid module', function(t) {
    t.plan(1);

    var config = Config.loadObject(fixture, __dirname);

    t.throws(function() {
        config.generate('non-existing');
    }, /No config for module non-existing/);
});

test('generate requirejs module config', function(t) {
    t.plan(2);

    var config = Config.loadObject(fixture, __dirname).generate('libs');

    t.equal(config.optimize, fixture.default.optimize);
    t.looseEqual(config.include, fixture.modules.libs.include);
});

test('module config should override default config', function(t) {
    t.plan(1);

    var config = Config.loadObject(fixture, __dirname).generate('shared');

    t.equal(config.optimize, fixture.modules.shared.optimize);
});

test('path options should have its urls resolved', function(t) {
    // Config in the default object should be outputed in the generated requirejs config
    var config = Config.loadObject(fixture, __dirname).generate('libs');

    t.plan(3);

    t.equal(config.optimize, fixture.default.optimize);
    t.equal(config.mainConfigFile, __dirname + '/' + fixture.default.mainConfigFile);
    t.equal(config.baseUrl, __dirname + '/' + fixture.default.baseUrl);
});
