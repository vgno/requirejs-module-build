var fs = require('fs');

exports.directory = function(path) {
    var stats;

    try {
        stats = fs.statSync(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('No such directory ' + path);
        } else {
            throw new Error(err.message);
        }
    }

    if (!stats.isDirectory()) {
        throw new Error(path + ' is not a directory');
    }
};

exports.file = function(path) {
    var stats;

    try {
         stats = fs.statSync(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('No such file ' + path);
        } else {
            throw err;
        }
    }

    if (!stats.isFile()) {
        throw new Error(path + ' is not a file');
    }
};
