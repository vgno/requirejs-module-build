var fs = require('fs');

exports.directory = function(path) {
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
};
