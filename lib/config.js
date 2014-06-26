var fs = require('fs'),
    path = require('path'),
    findup = require('findup-sync'),
    extend = require('extend'),
    glob = require('glob');

function Config(config, baseUrl) {
    this.config = extend(true, {}, config);
    this.baseUrl = baseUrl;
}

Config.prototype.hasModule = function(module) {
    return Object.keys(this.config.modules).indexOf(module) !== -1;
};

Config.prototype.generate = function(module) {
    if (!this.hasModule(module)) {
        throw new Error('No config for module ' + module);
    }

    var config = extend({}, this.config.default, this.config.modules[module]);

    this.normalizePaths(config);
    this.excludeModules(config);
    this.parseDirectory(config);

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

Config.prototype.parseDirectory = function(config) {
    if (!config.hasOwnProperty('directory') || config.directory === null) {
        return config;
    }

    if (typeof config.directory !== 'string') {
        throw new Error('Invalid directory ' + config.directory);
    }

    var directory = path.join(config.baseUrl, config.directory);

    validateDirectory(directory);

    var files = glob.sync(directory + '/**/*.js').map(function(file) {
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

function validateDirectory(path) {
    var stats;

    try {
        stats = fs.statSync(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('No such directory ' + path);
        }
    }

    if (!stats.isDirectory()) {
        throw new Error(path + ' is not a directory');
    }
}

function loadObject(object, baseUrl) {
    if (typeof object !== 'object' || Array.isArray(object)) {
        throw new Error('Please supply valid config, path to config or directory to start searching up from');
    }

    // fs.statSync might throw an exception as well
    try {
        if (typeof baseUrl !== 'string' || !fs.statSync(baseUrl).isDirectory()) {
            throw new Error('Invalid baseUrl');
        }
    } catch (err) {
        throw new Error('Invalid baseUrl');
    }

    return new Config(object, baseUrl);
}

function loadFile(filepath) {
    var stats;

    try {
         stats = fs.statSync(filepath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('No such file ' + filepath);
        } else {
            throw err;
        }
    }

    if (!stats.isFile()) {
        throw new Error(filepath + ' is not a file');
    }

    return loadObject(JSON.parse(fs.readFileSync(filepath)), path.dirname(filepath));
}

function loadFromDirectory(dirpath) {
    var stats;

    validateDirectory(dirpath);

    if (fs.existsSync(dirpath + '/requirejs-build.json')) {
        return loadFile(dirpath + '/requirejs-build.json');
    } else {
        var file = findup('requirejs-build.json', { cwd: dirpath });

        if (file === null) {
            throw new Error('Could not locate requirejs-build.json in ' + dirpath +
                            ' or any of its parent directories');
        }

        return loadFile(file);
    }
}

module.exports = {
    loadObject: loadObject,
    loadFile: loadFile,
    loadFromDirectory: loadFromDirectory
};
