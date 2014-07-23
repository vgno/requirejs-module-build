var fs = require('fs'),
    path = require('path'),
    extend = require('extend'),
    glob = require('glob'),
    validateDirectory = require('./validate').directory;

function Config(config, baseUrl) {
    try {
        validateDirectory(baseUrl);
    } catch (e) {
        throw new Error('Invalid baseUrl');
    }

    this.config = extend(true, {}, config);
    this.baseUrl = baseUrl;
}

Config.prototype.hasModule = function(module) {
    return this.getModules().indexOf(module) !== -1;
};

Config.prototype.getModules = function() {
    return Object.keys(this.config.modules);
};

Config.prototype.getModuleFilters = function(module) {
    if (!this.hasModule(module)) {
        throw new Error('Unknown module ' + module);
    }

    module = this.config.modules[module];

    if (typeof module.filters !== 'object' ||
        Object.keys(module.filters).length === 0) {
        return null;
    }

    return Object.keys(module.filters);
};

Config.prototype.generate = function(module, filter, callback) {
    if (!this.hasModule(module)) {
        return callback('No config for module ' + module);
    }

    var config = extend({}, this.config.default, this.config.modules[module]);

    try {
        this.normalizePaths(config);
        this.excludeModules(config);
    } catch (e) {
        return callback(e.message);
    }

    return this.parseDirectory(config, filter, callback);
};

Config.prototype.generatePlaceholder = function(module, filter, callback) {
    this.generate(module, filter, function(err, config) {
        if (err) {
            return callback(err);
        }

        if (typeof config.rawText === 'undefined') {
            config.rawText = {};
        } else if (typeof config.rawText !== 'object' || Array.isArray(config.rawText)) {
            return callback('rawText must be an object');
        }

        config.include.forEach(function(include) {
            config.rawText[include] = 'define([], function() { return function() { ' +
                'throw "This placeholder method should never be called"; } });';
        });

        return callback(null, config);
    });
};

Config.prototype.normalizePaths = function(config) {
    ['mainConfigFile', 'baseUrl', 'output', 'binary'].forEach(function(configPath) {
        if (config.hasOwnProperty(configPath) &&
            config[configPath].substr(0, 1) !== '/') {
            config[configPath] = path.join(this.baseUrl, config[configPath]);
        }
    }.bind(this));

    return config;
};

Config.prototype.excludeModules = function(config) {
    if (!config.hasOwnProperty('excludeModules') || config.excludeModules === null) {
        return config;
    }

    if (!Array.isArray(config.excludeModules)) {
        throw new Error('excludeModules must be an array');
    }

    if (!config.hasOwnProperty('exclude')) {
        config.exclude = [];
    } else if (!Array.isArray(config.exclude)) {
        throw new Error('exclude must be an array');
    }

    config.excludeModules.forEach(function(module) {
        if (!this.hasModule(module)) {
            throw new Error('Can not exclude unconfigured module ' + module);
        }

        var moduleConfig = this.config.modules[module];

        if (moduleConfig.hasOwnProperty('include') && Array.isArray(moduleConfig.include)) {
            config.exclude = config.exclude.concat(moduleConfig.include);
        }
    }.bind(this));

    config.excludeModules = undefined;

    return config;
};

Config.prototype.parseDirectory = function(config, filter, callback) {
    if (!config.hasOwnProperty('directory') || config.directory === null) {
        return callback(null, config);
    }

    if (typeof config.directory !== 'string') {
        return callback('Invalid directory ' + config.directory);
    }

    var directory = path.join(config.baseUrl, config.directory);

    fs.stat(directory, function(err, stats) {
        // Make sure that the directory option in the config is valid
        if (err) {
            if (err.code === 'ENOENT') {
                return callback('No such directory ' + directory);
            } else {
                return callback(err.message);
            }
        }

        if (!stats.isDirectory()) {
            return callback(directory + ' is not a directory');
        }

        // Make sure that the include option in the config is valid
        if (!config.hasOwnProperty('include')) {
            config.include = [];
        } else if (!Array.isArray(config.include)) {
            return callback('include must be an array');
        }

        // Setup the filter
        if (filter) {
            if (!config.filters || !config.filters.hasOwnProperty(filter)) {
                return callback('Unknown filter ' + filter);
            }

            filter = config.filters[filter];

            config.filters = undefined;
        } else {
            filter = '*';
        }

        glob(directory + '/**/' + filter + 'js', function(err, files) {
            files = files.map(function(file) {
                return file.substr(config.baseUrl.length + 1);
            });

            config.include = config.include.concat(files);

            config.directory = undefined;

            return callback(null, config);
        });
    });
};

module.exports = Config;
