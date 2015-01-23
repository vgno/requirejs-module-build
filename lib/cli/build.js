var builder = require('../builder');

function runBuild(config, module, filter, options) {
    var output = 'Building ' + module;

    if (filter) {
        output += ' with filter ' + filter;
    }

    console.log(output);

    config.generate(module, filter, function(err, config) {
        if (err) {
            throw err;
        }

        // The filename should be module[.filter]
        var filename = module.replace('/', '_');

        if (filter) {
            filename = filename + '.' + filter;
        }

        config.out = filename + '.js';

        if (options.optimize) {
            config.optimize = options.optimize;
        }

        builder.writeConfig(config.output + '/' + filename + '.json', config, function(err, file) {
            builder.build(file, config.binary, options.verbose);
        });
    });
}

exports.all = function(config, options) {
    config.getModules().forEach(function(module) {
        exports.module(config, module, null, options);
    });
};

exports.module = function(config, module, filter, options) {
    // If a module config has filters and the filter option is not set
    // we should build all
    if (!filter && config.getModuleFilters(module)) {
        config.getModuleFilters(module).forEach(function(filter) {
            runBuild(config, module, filter, options);
        });
    } else {
        runBuild(config, module, filter, options);
    }
};
