var test = require('tape'),
    fs = require('fs'),
    path = require('path'),
    Config = require('../lib/config');

var fixture = JSON.parse(fs.readFileSync(__dirname + '/fixtures/requirejs-build.json'));

test('generating invalid module', function(t) {
    t.plan(1);

    var config = Config.loadObject(fixture, __dirname);

    t.throws(function() {
        config.generate('non-existing');
    }, /No config for module non-existing/, 'non-existing module should throw');
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
    t.equal(config.mainConfigFile, path.join(__dirname, fixture.default.mainConfigFile));
    t.equal(config.baseUrl, path.join(__dirname, fixture.default.baseUrl));
});

test('excludeModules', function(t) {
    t.plan(5);

    // excludeModules config should not be part of RequireJS config
    var config = Config.loadObject(fixture, __dirname),
        libsConfig = config.generate('shared');

    t.equal(libsConfig.excludeModules, undefined);

    // excludeModules config should exclude other modules
    t.looseEqual(libsConfig.exclude, ['jquery', 'lodash']);

    t.throws(function() {
        config.generate('excludeModulesFaulty');
    }, /excludeModules must be an array/);

    t.throws(function() {
        config.generate('excludeNotArray');
    }, /exclude must be an array/);

    t.throws(function() {
        config.generate('excludeMissingModule');
    }, /Can not exclude unconfigured module/);
});

test('directory option', function(t) {
    // Should include all files in a given directory
    t.plan(5);

    var config = Config.loadObject(fixture, __dirname + '/fixtures'),
        dirConfig = config.generate('directory');

    t.equal(dirConfig.directory, undefined);

    t.looseEqual(dirConfig.include,
                 ['directory/file1.js', 'directory/file2.js', 'directory/subdir/file3.js']);

    t.throws(function() {
        config.generate('invalidDirectory');
    }, /Invalid directory/);

    t.throws(function() {
        config.generate('missingDirectory');
    }, /No such directory/);

    t.throws(function() {
        config.generate('includeNotArray');
    }, /include must be an array/);
});
