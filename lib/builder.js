var fs = require('fs'),
    spawn = require('child_process').spawn,
    util = require('util');

exports.writeConfig = function(file, config, callback) {
    config = '(' + JSON.stringify(config, null, 4) + ')';

    fs.writeFile(file, config, function(error) {
        if (error) {
            callback('Could not create RequireJS config file: ' + error);
        } else {
            callback(null, file);
        }
    });
};

exports.build = function(configFile, config, verbose, callback) {
    var process = spawn('node', [config.binary, '-o', configFile]),
        output = [];

    process.stderr.on('data', function(data) {
        util.print(data.toString());
    });

    process.stdout.on('data', function(data) {
        data = data.toString();

        if (verbose === true) {
            util.print(data);
        } else {
            output.push(data);
        }
    });

    process.on('close', function(code) {
        if (!config.hasOwnProperty('cleanup') || config.cleanup === true) {
            fs.unlink(configFile, function(err) {
                if (err) {
                    callback(err);
                } else if (code !== 0) {
                    callback(output.join());
                } else {
                    callback();
                }
            });
        } else {
            if (code !== 0) {
                callback(output.join());
            } else {
                callback();
            }
        }
    });
};
