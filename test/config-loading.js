var test = require('tape'),
    fs = require('fs'),
    loader = require('../lib/loader');

var fixture = JSON.parse(fs.readFileSync(__dirname + '/fixtures/requirejs-build.json'));

test('load config from object', function(t) {
    var error = /Please supply valid config, path to config or directory to start searching up from/,
        scaffold = {
            optimize: 'uglify2'
        };

    t.plan(4);

    t.throws(function() {
        loader.object([]);
    }, error, 'make sure config is object');

    t.throws(function() {
        loader.object({});
    }, /Invalid baseUrl/, 'make sure baseUrl is valid');

    var config = loader.object(scaffold, __dirname);

    t.looseEquals(config.config, scaffold, 'make sure config is stored in object');
    t.equals(config.baseUrl, __dirname, 'make sure baseUrl is stored in object');
});

test('load config from file', function(t) {
    t.plan(5);

    t.throws(function() {
        loader.file('/test/foobar.json');
    }, /No such file \/test\/foobar.json/, 'loading missing file should throw');

    t.throws(function() {
        loader.file('/tmp');
    }, /\/tmp is not a file/, 'loading directory should throw');

    t.throws(function() {
        loader.file('/dev/tty');
    }, /\/dev\/tty is not a file/, 'loading non-file should throw');

    var config = loader.file(__dirname + '/fixtures/requirejs-build.json');

    t.looseEquals(config.config, fixture, 'make sure config is stored in object');
    t.equals(config.baseUrl, __dirname + '/fixtures', 'make sure baseUrl is stored in object');
});

test('load config from directory', function(t) {
    t.plan(5);

    t.throws(function() {
        loader.directory(__dirname + '/fixtures/requirejs-build.json');
    }, /is not a directory/, 'supplying file should throw');

    t.throws(function() {
        loader.directory('/non/existing/directory');
    }, /No such directory/, 'non-existing directory should throw');

    t.throws(function() {
        loader.directory('/');
    }, /Could not locate requirejs-build.json/, 'missing file should throw');

    t.looseEquals(loader.directory(__dirname + '/fixtures').config,
                 fixture, 'make sure config is stored in object');

    t.looseEquals(loader.directory(__dirname + '/fixtures/subdir').config,
                 fixture, 'make sure baseUrl is stored in object');
});
