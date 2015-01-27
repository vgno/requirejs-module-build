var builder = require('../builder'),
    async = require('async');

function runBuild(filename, config, options, callback) {
    config.out = filename + '.js';

    if (options.optimize) {
        config.optimize = options.optimize;
    }

    builder.writeConfig(config.output + '/' + filename + '.json', config, function(err, file) {
        builder.build(file, config, options.verbose, callback);
    });
}

function build(config, module, filter, options, callback) {
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

        runBuild(filename, config, options, callback);
    });
}

function buildPlaceholder(config, module, filter, options, callback) {
    var output = 'Building ' + module + ' placeholder';

    if (filter) {
        output += ' with filter ' + filter;
    }

    console.log(output);

    config.generatePlaceholder(module, filter, function(err, config) {
        if (err) {
            throw err;
        }

        // The filename should be module[.filter].placeholder
        var filename = module.replace('/', '_');

        if (filter) {
            filename = filename + '.' + filter;
        }

        filename = filename + '.placeholder';

        runBuild(filename, config, options, callback);
    });
}

exports.all = function(config, options, callback) {
    if (typeof options.parallelBuilds === 'undefined') {
        options.parallelBuilds = 5;
    }

    async.eachLimit(config.getModules(), options.parallelBuilds, function(module, callback) {
        exports.module(config, module, null, options, callback);
    }, callback);
};

exports.module = function(config, module, filter, options, callback) {
    // If a module config has filters and the filter option is not set
    // we should build all filters
    if (!filter && config.getModuleFilters(module)) {
        async.each(config.getModuleFilters(module), function(filter, callback) {
            build(config, module, filter, options, callback);
        }, callback);
    } else {
        build(config, module, filter, options, callback);
    }

    // Build placeholders if enabled
    if (config.shouldBuildPlaceholder(module) === true) {
        exports.placeholder(config, module, filter, options, callback);
    }
};

exports.placeholder = function(config, module, filter, options, callback) {
    // If a module config has filters and the filter option is not set
    // we should build all
    if (!filter && config.getModuleFilters(module)) {
        async.each(config.getModuleFilters(module), function(filter, callback) {
            buildPlaceholder(config, module, filter, options, callback);
        }, callback);
    } else {
        buildPlaceholder(config, module, filter, options, callback);
    }
};
