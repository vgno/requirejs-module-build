#!/usr/bin/env node

var parseArgs = require('minimist'),
    cli = require('../lib/cli');

var argv = parseArgs(process.argv.slice(2), {
    string: ['filter', 'config', 'optimizer'],
    boolean: ['verbose', 'placeholder', 'help'],
    alias: {
        filter: 'f',
        config: 'c',
        verbose: 'v',
        help: 'h',
        optimizer: 'o'
    }
});

cli(argv);
