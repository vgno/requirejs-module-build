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

    var config = this.getModuleConfig(module);

    if (!config.filters || typeof config.filters !== 'object' ||
        Object.keys(config.filters).length === 0) {
        return null;
    }

    return Object.keys(config.filters);
};

Config.prototype.shouldBuildPlaceholder = function(module) {
    if (!this.hasModule(module)) {
        throw new Error('Unknown module ' + module);
    }

    var config = this.getModuleConfig(module);

    if (!config.buildPlaceholder || typeof config.buildPlaceholder !== 'boolean') {
        return false;
    }

    return config.buildPlaceholder;
};

Config.prototype.generate = function(module, filter, callback) {
    var config;

    try {
        config = this.getModuleConfig(module);

        this.normalizePaths(config);
        this.excludeModules(config);
    } catch (e) {
        return callback(e.message);
    }

    if (!config.hasOwnProperty('directory') || config.directory === null) {
        return callback(null, config);
    } else {
        return this.parseDirectory(config, filter, callback);
    }
};

Config.prototype.getModuleConfig = function(module) {
    if (!this.hasModule(module)) {
        throw new Error('No config for module ' + module);
    }

    // If value is a string it should be interpreted as a directory option
    if (typeof this.config.modules[module] === 'string') {
        return extend({}, this.config.default, { directory: this.config.modules[module] });
    }

    var config = extend({}, this.config.default);

    var inherit = this.config.modules[module].inherit;

    if (inherit) {
        if (!this.config.hasOwnProperty(inherit)) {
            throw new Error('Could not inherit from missing config ' + inherit);
        }

        if (typeof this.config[inherit] !== 'object' ||
            Array.isArray(this.config[inherit])) {
            throw new Error('Could not inherit from invalid config ' + inherit);
        }

        config = extend(config, this.config[inherit]);
    }

    config = extend(config, this.config.modules[module]);

    config.inherit = undefined;

    return config;
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

    // The following two options should be relative from the path of the build config
    ['mainConfigFile', 'baseUrl'].forEach(function(configPath) {
        if (config.hasOwnProperty(configPath) &&
            config[configPath].substr(0, 1) !== '/') {
            console.log('Resolving', config[configPath], this.baseUrl);

            config[configPath] = path.relative(config.output, config[configPath]);
        }
    });

    return config;
};

Config.prototype.excludeModules = function(config) {
    var configKeyMap = {
        excludeModules: 'exclude',
        shallowExcludeModules: 'excludeShallow'
    };

    ['excludeModules', 'shallowExcludeModules'].forEach(function(configKey) {
        if (!config.hasOwnProperty(configKey) || config[configKey] === null) {
            return;
        }

        if (!Array.isArray(config[configKey])) {
            throw new Error(configKey + ' must be an array');
        }

        var target = configKeyMap[configKey];

        if (!config.hasOwnProperty(target)) {
            config[target] = [];
        } else if (!Array.isArray(config[target])) {
            throw new Error(target + ' must be an array');
        }

        config[configKey].forEach(function(module) {
            if (!this.hasModule(module)) {
                throw new Error('Can not ' + configKeyMap[configKey] + ' unconfigured module ' + module);
            }

            var moduleConfig = this.config.modules[module];

            if (moduleConfig.hasOwnProperty('include') && Array.isArray(moduleConfig.include)) {
                config[target] = config[target].concat(moduleConfig.include);
            }
        }.bind(this));

        config[configKey] = undefined;
    }.bind(this));

    return config;
};

Config.prototype.parseDirectory = function(config, filter, callback) {
    if (typeof config.directory !== 'string') {
        return callback('Invalid directory ' + config.directory);
    }

    // Add trailing slash. We need this to remove the baseUrl from the filename
    // later on
    if (config.baseUrl.substr(config.baseUrl.length - 1) !== '/') {
        config.baseUrl += '/';
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
                file = file.substr(config.baseUrl.length);

                // Remove extension if its '.js'
                if (path.extname(file) === '.js') {
                    file = file.substr(0, file.length - 3);
                }

                return file;
            });

            config.include = config.include.concat(files);

            config.directory = undefined;

            return callback(null, config);
        });
    });
};

module.exports = Config;
