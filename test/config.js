var test = require('tape'),
    fs = require('fs'),
    Config = require('../lib/config');

var fixture = JSON.parse(fs.readFileSync(__dirname + '/fixtures/requirejs-build.json'));

test('load config from object', function(t) {
    var error = /Please supply valid config, path to config or directory to start searching up from/,
        scaffold = {
            optimize: 'uglify2'
        };

    t.plan(4);

    t.throws(function() {
        Config.loadObject([]);
    }, error, 'Make sure config is object');

    t.throws(function() {
        Config.loadObject({});
    }, /Invalid baseUrl/, 'Make sure baseUrl is valid');

    var config = Config.loadObject(scaffold, __dirname);

    t.looseEqual(config.config, scaffold);
    t.equals(config.baseUrl, __dirname);
});

test('load config from file', function(t) {
    t.plan(5);

    t.throws(function() {
        Config.loadFile('/test/foobar.json');
    }, /No such file \/test\/foobar.json/);

    t.throws(function() {
        Config.loadFile('/tmp');
    }, /\/tmp is not a file/);

    t.throws(function() {
        Config.loadFile('/dev/tty');
    }, /\/dev\/tty is not a file/);

    var config = Config.loadFile(__dirname + '/fixtures/requirejs-build.json');

    t.looseEqual(config.config, fixture);
    t.equals(config.baseUrl, __dirname + '/fixtures');
});

test('load config from directory', function(t) {
    t.plan(3);

    t.throws(function() {
        Config.loadFromDirectory(__dirname + '/fixtures/requirejs-build.json');
    }, /is not a directory/);

    t.looseEqual(Config.loadFromDirectory(__dirname + '/fixtures').config, fixture);

    t.looseEqual(Config.loadFromDirectory(__dirname + '/fixtures/subdir').config, fixture);
});

test('options should be passed with urls resolved', function(t) {
    // Config in the options object should be outputed in the generated requirejs config
    t.plan(3);

    var config = Config.loadObject(fixture, __dirname).generate();

    t.equal(config.optimize, fixture.options.optimize);
    t.equal(config.mainConfigFile, __dirname + '/' + fixture.options.mainConfigFile);
    t.equal(config.baseUrl, __dirname + '/' + fixture.options.baseUrl);
});
