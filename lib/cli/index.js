var loader = require('../loader'),
    build = require('./build');

var help = [
    'Usage: requirejs-build module [options]',
    '',
    'Arguments:',
    '  module	Name of the module to build or "all" for all modules including',
    '		all filters',
    '',
    'Options:',
    '  -f, --filter <name>		Filter/submodule name',
    '  -c, --config <path>		Path to config file',
    '  -o, --optimizer <name>	Override RequireJS optimizer',
    '  --placeholder			Build placeholder',
    '  -v, --verbose			Be verbose',
    '  -h, --help			Print this'
].join('\n');

module.exports = function(argv, workingDir) {
    var config;

    if (argv._.length !== 1 || argv.help === true) {
        console.log(help);
        return process.exit(1);
    }

    if (typeof workingDir === 'undefined') {
        workingDir = process.cwd();
    }

    if (argv.config) {
        config = loader.file(argv.config);
    } else {
        config = loader.directory(workingDir);
    }

    if (argv._[0] === 'all') {
        if (argv.filter) {
            console.log('Can not use filter together with all modules\n' +
                        'Run with -h to see help');
            return process.exit(1);
        }

        build.all(config);
    } else {
        build.module(config, argv._[0], argv.filter);
    }
};
