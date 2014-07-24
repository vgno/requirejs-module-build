var builder = require('../builder');

exports.all = function(config) {
    config.getModules().forEach(function(module) {
        var filters = config.getModuleFilters(module);

        if (filters) {
            filters.forEach(function(filter) {
                exports.module(config, module, filter);
            });
        } else {
            exports.module(config, module);
        }
    });
};

exports.module = function(config, module, filter, verbose) {
    config.generate(module, filter, function(err, config) {
        // The filename should be module[.filter]
        var filename = module;

        if (filter) {
            filename = filename + '.' + filter;
        }

        config.out = config.output + '/' + filename + '.js';

        builder.writeConfig(config.output + '/' + filename + '.json', config, function(err, file) {
            builder.build(file, config.binary, verbose);
        });
    });
};
