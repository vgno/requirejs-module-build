var test = require('tape'),
    sinon = require('sinon'),
    fs = require('fs'),
    cli = require('../lib/cli'),
    loader = require('../lib/loader'),
    builder = require('../lib/builder'),
    Config = require('../lib/config');

var configFile = __dirname + '/fixtures/requirejs-build.json';

test('config option', function(t) {
    t.plan(1);

    var mock = sinon.mock(loader);

    mock.expects('file')
        .withArgs(configFile)
        .returns(sinon.createStubInstance(Config));

    cli({ _: ['test'], config: configFile});

    mock.restore();

    t.ok(mock.verify());
});

test('missing config option', function(t) {
    t.plan(1);

    var mock = sinon.mock(loader);

    mock.expects('directory')
        .withArgs(process.cwd())
        .returns(sinon.createStubInstance(Config));

    cli({ _: ['test']});

    mock.restore();

    t.ok(mock.verify());
});

test('module', function(t) {
    t.plan(1);

    var stub = sinon.stub(Config.prototype, 'generate');

    cli({ _: ['directory'], config: configFile });

    stub.restore();

    t.ok(stub.calledWith('directory', undefined));
});

test('module with filter option', function(t) {
    t.plan(3);

    sinon.stub(fs, 'writeFile', function(file, content, callback) {
        callback(null, file);
    });

    sinon.spy(Config.prototype, 'generate');
    sinon.spy(builder, 'writeConfig');
    sinon.stub(builder, 'build');

    cli({ _: ['libs'], config: configFile, filter: 'foo' });

    fs.writeFile.restore();

    t.ok(Config.prototype.generate.calledWith('libs', 'foo'));
    t.ok(builder.writeConfig.called);
    t.ok(builder.build.called);

    Config.prototype.generate.restore();
    builder.writeConfig.restore();
    builder.build.restore();
});

test('module with filters and no filter option', function(t) {
    t.plan(2);

    var stub = sinon.stub(Config.prototype, 'generate');

    cli({ _: ['instagram'], config: configFile });

    stub.restore();

    t.equals(stub.callCount, 3);
    t.ok(stub.firstCall.calledWith('instagram', 'desktop'));
});

test('all modules', function(t) {
    t.plan(4);

    var stub = sinon.stub(Config.prototype, 'generate');

    cli({ _: ['all'], config: configFile });

    stub.restore();

    t.equals(stub.callCount, 14);

    t.ok(stub.firstCall.calledWith('libs'));
    t.ok(stub.lastCall.calledWith('rawTextFaulty'));

    t.ok(stub.calledWith('instagram', 'desktop'));
});

test('all modules with filter', function(t) {
    t.plan(1);

    var exitMock = sinon.mock(process);

    exitMock.expects('exit')
        .withArgs(1);

    sinon.stub(console, 'log');

    cli({ _: ['all'], filter: 'foo', config: configFile });

    console.log.restore();
    exitMock.restore();

    t.ok(exitMock.verify());
});
