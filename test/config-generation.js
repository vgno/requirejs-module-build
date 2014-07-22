var test = require('tape'),
    fs = require('fs'),
    path = require('path'),
    loader = require('../lib/loader');

var fixture = JSON.parse(fs.readFileSync(__dirname + '/fixtures/requirejs-build.json'));

test('generating invalid module', function(t) {
    t.plan(1);

    var config = loader.object(fixture, __dirname);

    t.throws(function() {
        config.generate('non-existing');
    }, /No config for module non-existing/, 'non-existing module should throw');
});

test('generate requirejs module config', function(t) {
    t.plan(2);

    var config = loader.object(fixture, __dirname).generate('libs');

    t.equals(config.optimize, fixture.default.optimize);
    t.looseEquals(config.include, fixture.modules.libs.include);
});

test('module config should override default config', function(t) {
    t.plan(1);

    var config = loader.object(fixture, __dirname).generate('shared');

    t.equals(config.optimize, fixture.modules.shared.optimize);
});

test('path options should have its urls resolved', function(t) {
    // Config in the default object should be outputed in the generated requirejs config
    var config = loader.object(fixture, __dirname).generate('libs');

    t.plan(3);

    t.equals(config.optimize, fixture.default.optimize);
    t.equals(config.mainConfigFile, path.join(__dirname, fixture.default.mainConfigFile));
    t.equals(config.baseUrl, path.join(__dirname, fixture.default.baseUrl));
});

test('excludeModules', function(t) {
    t.plan(5);

    // excludeModules config should not be part of RequireJS config
    var config = loader.object(fixture, __dirname),
        libsConfig = config.generate('shared');

    t.equals(libsConfig.excludeModules, undefined);

    // excludeModules config should exclude other modules
    t.looseEquals(libsConfig.exclude, ['jquery', 'lodash']);

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

    var config = loader.object(fixture, __dirname + '/fixtures'),
        dirConfig = config.generate('directory');

    t.equals(dirConfig.directory, undefined);

    t.looseEquals(dirConfig.include,
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

test('invalid filters', function(t) {
    // Throw error when trying to use unknown filter
    t.plan(1);

    var config = loader.object(fixture, __dirname + '/fixtures');

    t.throws(function() {
        config.generate('instagram', 'foobar');
    }, /Unknown filter/);
});

test('inclusive filter', function(t) {
    // Create a filtered "submodule" that only includes files with a pattern
    t.plan(2);

    var config = loader.object(fixture, __dirname + '/fixtures'),
        mobileConfig = config.generate('instagram', 'mobile'),
        allConfig = config.generate('instagram', 'all');

    t.looseEquals(mobileConfig.include, ['instagram/file1.mobile.js']);

    t.looseEquals(allConfig.include, ['instagram/file1.js',
                                      'instagram/file1.mobile.js',
                                      'instagram/file2.js']);
});

test('exclusive filter', function(t) {
    // Create a filtered "submodule" that only includes files without a pattern
    t.plan(1);

    var config = loader.object(fixture, __dirname + '/fixtures'),
        mobileConfig = config.generate('instagram', 'desktop');

    t.looseEquals(mobileConfig.include, ['instagram/file1.js',
                                         'instagram/file2.js']);
});

test('placeholder', function(t) {
    // It should be possible to generate placeholder for modules with all the
    // files stubbed out with empty functions
    t.plan(4);

    var config = loader.object(fixture, __dirname + '/fixtures'),
        placeholderConfig = config.generatePlaceholder('instagram', 'desktop');

    t.ok(placeholderConfig.rawText.hasOwnProperty('instagram/file1.js'));
    t.ok(placeholderConfig.rawText.hasOwnProperty('instagram/file2.js'));
    t.notOk(placeholderConfig.rawText.hasOwnProperty('instagram/file1.mobile.js'));

    t.throws(function() {
        config.generatePlaceholder('rawTextFaulty');
    }, /rawText must be an object/);
});
