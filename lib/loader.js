var fs = require('fs'),
    path = require('path'),
    findup = require('findup-sync'),
    validate = require('./validate'),
    Config = require('./config');

function loadObject(object, baseUrl) {
    if (typeof object !== 'object' || Array.isArray(object)) {
        throw new Error('Please supply valid config, path to config or directory to start searching up from');
    }

    return new Config(object, baseUrl);
}

function loadFile(filepath) {
    validate.file(filepath);

    return loadObject(JSON.parse(fs.readFileSync(filepath)), path.dirname(filepath));
}

function loadFromDirectory(dirpath) {
    var stats;

    validate.directory(dirpath);

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
    object: loadObject,
    file: loadFile,
    directory: loadFromDirectory
};
