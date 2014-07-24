var builder = require('../builder');

exports.all = function(config, options) {
    config.getModules().forEach(function(module) {
        var filters = config.getModuleFilters(module);

        if (filters) {
            filters.forEach(function(filter) {
                exports.module(config, module, filter, options);
            });
        } else {
            exports.module(config, module, null, options);
        }
    });
};

exports.module = function(config, module, filter, options) {
    var output = 'Building ' + module;

    if (filter) {
        console.log(' with filter ' + filter);
    }

    console.log(output);

    config.generate(module, filter, function(err, config) {
        // The filename should be module[.filter]
        var filename = module;

        if (filter) {
            filename = filename + '.' + filter;
        }

        config.out = config.output + '/' + filename + '.js';

        if (options.optimize) {
            config.optimize = options.optimize;
        }

        builder.writeConfig(config.output + '/' + filename + '.json', config, function(err, file) {
            builder.build(file, config.binary, options.verbose);
        });
    });
};
