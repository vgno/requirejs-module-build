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

exports.build = function(configFile, binary, verbose) {
    var process = spawn('node', [binary, '-o', configFile]),
        output = [];

    process.stderr.on('data', function(data) {
        util.print(data.toString());
    });

    process.stdout.on('data', function(data) {
        data = data.toString();

        output.push(data);

        if (verbose === true) {
            util.print(data);
        }
    });

    if (verbose === false) {
        process.on('close', function(code) {
            if (code !== 0) {
                util.print(output.join());
            }
        });
    }
};
