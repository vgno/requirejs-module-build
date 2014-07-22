var path = require('path'),
    extend = require('extend'),
    glob = require('glob'),
    validateDirectory = require('./validate').directory;

function Config(config, baseUrl) {
    this.config = extend(true, {}, config);
    this.baseUrl = baseUrl;
}

Config.prototype.hasModule = function(module) {
    return Object.keys(this.config.modules).indexOf(module) !== -1;
};

Config.prototype.generate = function(module, filter) {
    if (!this.hasModule(module)) {
        throw new Error('No config for module ' + module);
    }

    var config = extend({}, this.config.default, this.config.modules[module]);

    this.normalizePaths(config);
    this.excludeModules(config);
    this.parseDirectory(config, filter);

    return config;
};

Config.prototype.generatePlaceholder = function(module, filter) {
    var config = this.generate(module, filter);

    if (typeof config.rawText === 'undefined') {
        config.rawText = {};
    } else if (typeof config.rawText !== 'object' || Array.isArray(config.rawText)) {
        throw new Error('rawText must be an object');
    }

    config.include.forEach(function(include) {
        config.rawText[include] = 'define([], function() { return function() { ' +
            'throw "This placeholder method should never be called"; } });';
    });

    return config;
};

Config.prototype.normalizePaths = function(config) {
    ['mainConfigFile', 'baseUrl', 'output'].forEach(function(configPath) {
        if (config.hasOwnProperty(configPath)) {
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

Config.prototype.parseDirectory = function(config, filter) {
    if (!config.hasOwnProperty('directory') || config.directory === null) {
        return config;
    }

    if (typeof config.directory !== 'string') {
        throw new Error('Invalid directory ' + config.directory);
    }

    var directory = path.join(config.baseUrl, config.directory);

    validateDirectory(directory);

    if (typeof filter !== 'undefined') {
        if (!config.filters || !config.filters.hasOwnProperty(filter)) {
            throw new Error('Unknown filter ' + filter);
        }

        filter = config.filters[filter];
    } else {
        filter = '*';
    }

    var files = glob.sync(directory + '/**/' + filter + 'js').map(function(file) {
        return file.substr(config.baseUrl.length + 1);
    });

    if (!config.hasOwnProperty('include')) {
        config.include = [];
    } else if (!Array.isArray(config.include)) {
        throw new Error('include must be an array');
    }

    config.include = config.include.concat(files);

    config.directory = undefined;

    return config;
};

module.exports = Config;
