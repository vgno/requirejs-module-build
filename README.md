requirejs-module-build
===

A system to make it easier to configure and build a lot of non-CommonJS RequireJS modules.

[![build-status](https://travis-ci.org/vgno/requirejs-module-build.svg?branch=master)](http://travis-ci.org/vgno/requirejs-module-build)
[![Dependency Status](https://david-dm.org/vgno/requirejs-module-build.svg)](https://david-dm.org/vgno/requirejs-module-build)
[![devDependency Status](https://david-dm.org/vgno/requirejs-module-build/dev-status.svg)](https://david-dm.org/vgno/requirejs-module-build#info=devDependencies)

installation
====

via [npm (node package manager)](http://github.com/isaacs/npm)

    $ npm install requirejs-module-build

running
====

The binary is named `requirejs-build`.

```
Usage: requirejs-build module [options]

Arguments:
  module        Name of the module to build or "all" for all modules including
                all filters

Options:
  -f, --filter <name>           Filter/submodule name
  -c, --config <path>           Path to config file
  -o, --optimizer <name>        Override RequireJS optimizer
  -p, --parallel <number>	    Number of parallel builds to run. Defaults is 5
  --placeholder                 Build placeholder
  -v, --verbose                 Be verbose
  -h, --help                    Print this

```

configuration
====

The binary will by default look for a file named requirejs-build.json in the directory you are standing in and up the directory tree. You can specify the path to the configuration file using the `--config` option.

All paths in the config will be relative from the configuration file's directory.

example
=====

Lets imagine that you have a web page with an Instagram and Twitter module. The Instagram module
has some files that are only needed for mobiles.
All the modules use a set of shared libraries and a set of shared templates and javascript files.
An example of a configuration for this could look something like this:

``` json
{
  "default": {
    "mainConfigFile": "public/js/setup.js",
    "baseUrl": "public/js/",
    "output": "public/js/compiled/",
    "optimize": "uglify2",
    "binary": "/usr/local/bin/r.js",
    "exclude": ["text"]
  },
  "modules": {
    "libs": {
      "include": [
        "jquery",
        "lodash",
        "backbone"
      ]
    },
    "shared": {
      "include": [
        "utils",
        "utils/auth",
        "text!shared/list.html"
      ],
      "excludeModules": ["libs"]
    },
    "instagram": {
      "directory": "modules/instagram",
      "filters": {
        "desktop": "!(*.mobile.*)",
        "mobile": "*.mobile.*"
      },
      "excludeModules": ["libs", "shared"]
    },
    "twitter": {
      "directory": "modules/twitter",
      "excludeModules": ["libs", "shared"]
    }
  }
}
```

inheritance
=====

All the modules will inherit the options under the `default` key in the root of the configuration. The modules can also inherit from from other root nodes using the `inherit` option.

``` json
{
  "default": {
    "mainConfigFile": "public/js/setup.js",
    "baseUrl": "public/js/",
    "output": "public/js/compiled/",
    "binary": "/usr/local/bin/r.js",
  },
  "food": {
    "output": "public/js/compiled/food",
    "exclude": ["celery"]
  },
  "modules": {
    "taco": {
      "inherit": "food",
      "include": ["tortilla"]
    }
  }
}
```

filters
=====

If the filters option is set on a module the module will generate n "submodules" with the given [glob](https://github.com/isaacs/node-glob) filter. Only the "submodules" will be generated, so if you want to have a version with all the files you have to create a filter for that. See [example](#example).

excludeModules
=====

A module configuration can add all the generated `include` files for other modules to the `exclude` array by using the `excludeModules` option. See [example](#example).

license
====

MIT
