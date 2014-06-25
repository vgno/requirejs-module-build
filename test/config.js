var test = require('tape'),
    Config = require('../lib/config');

test('load config from object', function(t) {
    var error = /Please supply valid config, path to config or directory to start searching up from/,
        scaffold = {
            optimize: 'uglify2'
        };

    t.plan(3);

    t.throws(function() {
        Config.loadObject();
    }, error);

    t.throws(function() {
        Config.loadObject([]);
    }, error);

    t.equals(Config.loadObject(scaffold).config, scaffold);
});

test('load config from file', function(t) {
    t.plan(4);

    t.throws(function() {
        Config.loadFile('/test/foobar.json');
    }, /No such file \/test\/foobar.json/);

    t.throws(function() {
        Config.loadFile('/tmp');
    }, /\/tmp is not a file/);

    t.throws(function() {
        Config.loadFile('/dev/tty');
    }, /\/dev\/tty is not a file/);

    t.looseEqual(Config.loadFile(__dirname + '/fixtures/requirejs-build.json').config, {
        optimize: 'uglify2',
        modules: {}
    });
});

test('load config from directory', function(t) {
    var fixture = {
        optimize: 'uglify2',
        modules: {}
    };

    t.plan(3);

    t.throws(function() {
        Config.loadFromDirectory(__dirname + '/fixtures/requirejs-build.json');
    }, /is not a directory/);

    t.looseEqual(Config.loadFromDirectory(__dirname + '/fixtures').config, fixture);

    t.looseEqual(Config.loadFromDirectory(__dirname + '/fixtures/subdir').config, fixture);
});
