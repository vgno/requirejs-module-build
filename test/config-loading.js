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
    }, error, 'make sure config is object');

    t.throws(function() {
        Config.loadObject({});
    }, /Invalid baseUrl/, 'make sure baseUrl is valid');

    var config = Config.loadObject(scaffold, __dirname);

    t.looseEqual(config.config, scaffold, 'make sure config is stored in object');
    t.equals(config.baseUrl, __dirname, 'make sure baseUrl is stored in object');
});

test('load config from file', function(t) {
    t.plan(5);

    t.throws(function() {
        Config.loadFile('/test/foobar.json');
    }, /No such file \/test\/foobar.json/, 'loading missing file should throw');

    t.throws(function() {
        Config.loadFile('/tmp');
    }, /\/tmp is not a file/, 'loading directory should throw');

    t.throws(function() {
        Config.loadFile('/dev/tty');
    }, /\/dev\/tty is not a file/, 'loading non-file should throw');

    var config = Config.loadFile(__dirname + '/fixtures/requirejs-build.json');

    t.looseEqual(config.config, fixture, 'make sure config is stored in object');
    t.equals(config.baseUrl, __dirname + '/fixtures', 'make sure baseUrl is stored in object');
});

test('load config from directory', function(t) {
    t.plan(5);

    t.throws(function() {
        Config.loadFromDirectory(__dirname + '/fixtures/requirejs-build.json');
    }, /is not a directory/, 'supplying file should throw');

    t.throws(function() {
        Config.loadFromDirectory('/non/existing/directory');
    }, /No such directory/, 'non-existing directory should throw');

    t.throws(function() {
        Config.loadFromDirectory('/');
    }, /Could not locate requirejs-build.json/, 'missing file should throw');

    t.looseEqual(Config.loadFromDirectory(__dirname + '/fixtures').config,
                 fixture, 'make sure config is stored in object');

    t.looseEqual(Config.loadFromDirectory(__dirname + '/fixtures/subdir').config,
                 fixture, 'make sure baseUrl is stored in object');
});
