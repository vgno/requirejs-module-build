var argparse = require('argparse'),
    package = require('../package.json');

var parser = new argparse.ArgumentParser({
    version: package.version,
    description: package.description,
    addHelp: true
});

var defaultParser = new argparse.ArgumentParser({ addHelp: false });

var targetParsers = parser.addSubparsers({
    title: 'targets',
    dest: 'targetName'
});

defaultParser.addArgument(
    ['-o', '--optimize'],
    {
        help: 'RequireJS optimizer',
        defaultValue: 'uglify2',
        metavar: 'OPTIMIZER',
        choices: ['none', 'uglify', 'uglify2']
    }
);

defaultParser.addArgument(
    ['-d', '--debug'],
    {
        help: 'Output debug information',
        action: 'storeTrue'
    }
);

defaultParser.addArgument(
    ['-c', '--config'],
    {
        help: 'Path to config file'
    }
);

targetParsers.addParser('all', {
    description: 'Build all the modules',
    parents: [ defaultParser ]
});

targetParsers.addParser('clean', {
    description: 'Clean up all the compiled and work files',
    parents: [ defaultParser ]
});

module.exports = parser.parseArgs.bind(parser);
