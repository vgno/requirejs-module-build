var fs = require('fs'),
    findup = require('findup-sync');

function Config() {
    this.config = null;
}

function loadObject(object) {
    if (typeof object !== 'object' || Array.isArray(object)) {
        throw new Error('Please supply valid config, path to config or directory to start searching up from');
    }

    var config = new Config();

    config.config = object;

    return config;
}

function loadFile(path) {
    var stats;

    try {
         stats = fs.statSync(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('No such file ' + path);
        }
    }

    if (!stats.isFile()) {
        throw new Error(path + ' is not a file');
    }

    var config = new Config();

    try {
        config.config = JSON.parse(fs.readFileSync(path));
    } catch (err) {
        throw new Error('Could not load ' + path);
    }

    return config;
}

function loadFromDirectory(path) {
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

    if (fs.existsSync(path + '/requirejs-build.json')) {
        return loadFile(path + '/requirejs-build.json');
    } else {
        var file = findup('requirejs-build.json', { cwd: path });

        if (file === null) {
            throw new Error('Could not locate requirejs-build.json in ' + path +
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
