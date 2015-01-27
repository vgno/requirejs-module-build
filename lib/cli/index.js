var loader = require('../loader'),
    build = require('./build');

var help = [
    'Usage: requirejs-build module [options]',
    '',
    'Arguments:',
    '  module	Name of the module to build or "all" for all modules including',
    '		all filters and placeholders',
    '',
    'Options:',
    '  -f, --filter <name>		Filter/submodule name',
    '  -c, --config <path>		Path to config file',
    '  -o, --optimizer <name>	Override RequireJS optimizer',
    '  -p, --parallel <number>	Number of parallel builds to run. Default is 5',
    '  --placeholder			Build placeholder',
    '  -v, --verbose			Be verbose',
    '  -h, --help			Print this'
].join('\n');

module.exports = function(argv, workingDir, callback) {
    var config;

    if (argv._.length !== 1 || argv.help === true) {
        console.log(help);
        return process.exit(1);
    }

    if (!workingDir) {
        workingDir = process.cwd();
    }

    if (argv.config) {
        config = loader.file(argv.config);
    } else {
        config = loader.directory(workingDir);
    }

    var module = argv._[0];
    var filter = argv.filter;
    var options = {
        verbose: argv.verbose,
        optimize: argv.optimize,
        placeholder: argv.placeholder,
        parallelBuilds: argv.parallel
    };

    if (module === 'all') {
        if (filter) {
            console.log('Can not use filter together with all modules\n' +
                        'Run with -h to see help');
            return process.exit(1);
        }

        build.all(config, options, callback);
    } else if (options.placeholder === true) {
        build.placeholder(config, module, filter, options, callback);
    } else {
        build.module(config, module, filter, options, callback);
    }
};
